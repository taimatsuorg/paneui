"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { Reorder, useReducedMotion } from "motion/react"

import { XIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { OverflowHintText } from "@paneui/ui/components/overflow-hint"

type TabStripVariant = "default" | "pill"

type TabStripContextValue = {
  value: string | null
  select: (value: string) => void
  close?: (value: string) => void
  variant: TabStripVariant
  reorderable: boolean
}

const TabStripContext = React.createContext<TabStripContextValue | null>(null)

function useTabStrip() {
  const ctx = React.useContext(TabStripContext)
  if (!ctx) throw new Error("TabStripItem must be used inside <TabStrip>")
  return ctx
}

const COARSE_QUERY = "(pointer: coarse)"

function useCoarsePointer() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(COARSE_QUERY)
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    },
    () => window.matchMedia(COARSE_QUERY).matches,
    () => false
  )
}

type TabStripProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  /** Selected tab. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string) => void
  /**
   * Tab order, by value. Pass it with `onReorder` to let people drag tabs
   * sideways (fine pointers only: on touch screens a swipe scrolls the strip);
   * children must be rendered in this order.
   */
  order?: string[]
  onReorder?: (order: string[]) => void
  /** Called by a tab's close button, middle click, or ⌫ / Delete on a focused tab. */
  onClose?: (value: string) => void
  /** `default`: flat tabs on the window band (thread tabs). `pill`: raised pill for the selected tab (panel tabs). */
  variant?: TabStripVariant
  /** Content pinned after the scrolling tabs (a new-tab button, panel actions). */
  actions?: React.ReactNode
  "aria-label"?: string
}

/**
 * Horizontal tab bar for documents and panels: closable, drag to reorder,
 * scrolls sideways with faded edges when it overflows. Arrow keys move
 * between tabs; Home / End jump to the ends.
 */
function TabStrip({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  order,
  onReorder,
  onClose,
  variant = "default",
  actions,
  className,
  children,
  ...props
}: TabStripProps) {
  const [valueState, setValueState] = React.useState<string | null>(defaultValue)
  const value = valueProp !== undefined ? valueProp : valueState
  const listRef = React.useRef<HTMLDivElement>(null)
  // On touch screens a sideways swipe scrolls the strip, so drag-to-reorder is off there.
  const coarse = useCoarsePointer()
  const reorderable = !!(order && onReorder) && !coarse

  const select = React.useCallback(
    (next: string) => {
      if (valueProp === undefined) setValueState(next)
      onValueChange?.(next)
    },
    [valueProp, onValueChange]
  )

  // Fade an edge only while there is more to scroll to on that side.
  const [edges, setEdges] = React.useState({ start: false, end: false })
  React.useEffect(() => {
    const el = listRef.current
    if (!el) return
    const measure = () => {
      const start = el.scrollLeft > 1
      const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
      setEdges((e) => (e.start === start && e.end === end ? e : { start, end }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    el.addEventListener("scroll", measure, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener("scroll", measure)
    }
  }, [])
  const mask =
    edges.start || edges.end
      ? `linear-gradient(to right, ${edges.start ? "transparent" : "black"}, black 16px, black calc(100% - 16px), ${edges.end ? "transparent" : "black"})`
      : undefined

  // Keep the selected tab in view.
  React.useEffect(() => {
    // Scroll only the strip (scrollIntoView would also move overflow-hidden ancestors).
    const list = listRef.current
    const el = list?.querySelector<HTMLElement>('[data-slot="tab-strip-item"][data-selected]')
    if (!list || !el) return
    const l = el.offsetLeft - list.offsetLeft
    if (l < list.scrollLeft) list.scrollLeft = l - 8
    else if (l + el.offsetWidth > list.scrollLeft + list.clientWidth) list.scrollLeft = l + el.offsetWidth - list.clientWidth + 8
  }, [value])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const tabs = [...(listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])]
    const i = tabs.indexOf(document.activeElement as HTMLElement)
    if (i < 0) return
    let next = -1
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = tabs.length - 1
    if (next >= 0) {
      e.preventDefault()
      tabs[next].focus()
      const v = tabs[next].dataset.value
      if (v) select(v)
    }
  }

  const ctx = React.useMemo(() => ({ value, select, close: onClose, variant, reorderable }), [value, select, onClose, variant, reorderable])
  // `w-max`: the list wraps every tab, so the scroller's 1px padding sits after the last one and
  // its ring isn't clipped at the scroll end (a list sized to the scroller lets tabs overflow it).
  const listClass = cn("flex w-max items-center", variant === "pill" ? "gap-1" : "gap-0.5")

  return (
    <TabStripContext.Provider value={ctx}>
      <div data-slot="tab-strip" data-variant={variant} className={cn("flex min-w-0 items-center gap-1", className)} {...props}>
        <div
          ref={listRef}
          style={{ maskImage: mask, WebkitMaskImage: mask }}
          className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain p-px scrollbar-none"
        >
          {reorderable ? (
            <Reorder.Group
              as="div"
              axis="x"
              values={order!}
              onReorder={onReorder!}
              role="tablist"
              aria-label={props["aria-label"]}
              onKeyDown={onKeyDown}
              className={listClass}
            >
              {children}
            </Reorder.Group>
          ) : (
            <div role="tablist" aria-label={props["aria-label"]} onKeyDown={onKeyDown} className={listClass}>
              {children}
            </div>
          )}
        </div>
        {actions && (
          <div data-slot="tab-strip-actions" className="flex shrink-0 items-center gap-0.5 [&>[data-slot=button]]:rounded-inner">
            {actions}
          </div>
        )}
      </div>
    </TabStripContext.Provider>
  )
}

type TabStripItemProps = Omit<React.ComponentProps<"div">, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> & {
  value: string
  /** Leading glyph (provider icon, terminal icon). */
  icon?: React.ReactNode
  /** Show the close button (on hover, always on the selected tab). Defaults to whether `onClose` is set on the strip. */
  closable?: boolean
  /** Dot after the label: unsaved changes or new activity. */
  indicator?: boolean
  disabled?: boolean
  /** Full text shown on hover while the label is truncated. Defaults to the label; `false` turns it off. */
  hint?: React.ReactNode
}

function TabStripItem({ value, icon, closable, indicator, disabled, hint, className, children, ...props }: TabStripItemProps) {
  const l10n = useLocale().labels

  const ctx = useTabStrip()
  const reduce = useReducedMotion()
  const selected = ctx.value === value
  const canClose = (closable ?? !!ctx.close) && !!ctx.close
  const tab = (
    <>
      <span
        role="tab"
        tabIndex={selected ? 0 : -1}
        aria-selected={selected}
        aria-disabled={disabled || undefined}
        data-value={value}
        className="flex min-w-0 flex-1 items-center gap-1.5 outline-none"
        onKeyDown={(e) => {
          if ((e.key === "Delete" || e.key === "Backspace") && canClose) {
            e.preventDefault()
            ctx.close?.(value)
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            ctx.select(value)
          }
        }}
      >
        {icon && <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-3.5">{icon}</span>}
        {hint === false ? (
          <span className="min-w-0 flex-1 truncate">{children}</span>
        ) : (
          <OverflowHintText hint={hint} side="bottom" align="start" alignOffset={-8} className="flex-1">
            {children}
          </OverflowHintText>
        )}
        {indicator && <span aria-label={l10n.hasChanges} className="size-1.5 shrink-0 rounded-full bg-primary" />}
      </span>
      {canClose && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={l10n.closeTab}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            ctx.close?.(value)
          }}
          className={cn(
            "relative -mr-1 flex size-4.5 shrink-0 cursor-pointer pointer-coarse:size-6 after:absolute after:-inset-[3px] items-center justify-center rounded-inner-or-sm text-muted-foreground opacity-0 transition-[opacity,background-color,color] duration-150 group-hover/tab:opacity-100 group-focus-within/tab:opacity-100 hover:bg-foreground/8 hover:text-foreground",
            selected && "opacity-100"
          )}
        >
          <XIcon className="size-3" />
        </button>
      )}
    </>
  )
  const shared = {
    "data-slot": "tab-strip-item",
    "data-selected": selected || undefined,
    "data-disabled": disabled || undefined,
    onClick: () => !disabled && ctx.select(value),
    onAuxClick: (e: React.MouseEvent) => {
      if (e.button === 1 && canClose) {
        e.preventDefault()
        ctx.close?.(value)
      }
    },
    className: cn(
      "group/tab relative flex h-7 max-w-44 pointer-coarse:h-8 min-w-0 shrink-0 cursor-default items-center gap-1.5 frame-inner frame-inset-1 px-2 text-ui text-muted-foreground transition-[background-color,color,box-shadow] duration-150 select-none hover:text-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-64",
      ctx.variant === "default"
        ? "hover:bg-foreground/5 data-selected:bg-card data-selected:text-foreground data-selected:shadow-raised"
        : "hover:bg-secondary data-selected:bg-foreground/6 data-selected:text-foreground",
      className
    ),
  }
  if (ctx.reorderable)
    return (
      <Reorder.Item
        as="div"
        value={value}
        layout="position"
        whileDrag={{ zIndex: 20 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 40, mass: 0.6 }}
        {...shared}
        {...(props as object)}
      >
        {tab}
      </Reorder.Item>
    )
  return (
    <div {...shared} {...props}>
      {tab}
    </div>
  )
}

export { TabStrip, TabStripItem, type TabStripProps, type TabStripItemProps, type TabStripVariant }
