"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { AnimatePresence, LayoutGroup, motion, Reorder, useReducedMotion, type Transition } from "motion/react"

import { XIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"

type MorphingTabsItem = {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

type MorphingTabsProps = {
  items: MorphingTabsItem[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (id: string | null) => void
  /** Called once after a drag or keyboard (Alt + ←/→) reorder settles. */
  onOrderChange?: (ids: string[]) => void
  /** Shows a close button on each tab and enables Delete/Backspace to close. */
  onClose?: (id: string) => void
  /** Allow dragging tabs to reorder them. Default true. */
  reorderable?: boolean
  "aria-label"?: string
  className?: string
  contentClassName?: string
}

const SURFACE: Transition = { type: "spring", duration: 0.5, bounce: 0 }

/** Keep the user's order for ids that still exist, append ids that are new. */
function reconcile(order: string[], ids: string[]) {
  const known = new Set(ids)
  const kept = order.filter((id) => known.has(id))
  const seen = new Set(kept)
  return [...kept, ...ids.filter((id) => !seen.has(id))]
}

/** Callback ref that tracks an element's height while it is mounted. */
function useMeasuredHeight<T extends HTMLElement>() {
  const [height, setHeight] = React.useState<number | null>(null)
  const observer = React.useRef<ResizeObserver | null>(null)
  const ref = React.useCallback((el: T | null) => {
    observer.current?.disconnect()
    observer.current = null
    if (!el) return
    setHeight(el.offsetHeight)
    observer.current = new ResizeObserver(() => setHeight(el.offsetHeight))
    observer.current.observe(el)
  }, [])
  return [ref, height] as const
}

const sameOrder = (a: string[], b: string[]) => a.length === b.length && a.every((id, i) => id === b[i])

/**
 * Reorderable tab rail. The selected tab is part of the content surface: its raised
 * card glides between tabs (and follows them while they are dragged) and joins the
 * panel below, which morphs its height to each tab's content.
 */
function MorphingTabs({
  items,
  value: valueProp,
  defaultValue,
  onValueChange,
  onOrderChange,
  onClose,
  reorderable = true,
  "aria-label": ariaLabel,
  className,
  contentClassName,
}: MorphingTabsProps) {
  const l10n = useLocale().labels

  if (ariaLabel === undefined) ariaLabel = l10n.tabs

  const reduceMotion = useReducedMotion()
  const uid = React.useId()
  const ids = items.map((item) => item.id)
  const byId = new Map(items.map((item) => [item.id, item]))

  const [rawOrder, setRawOrder] = React.useState(ids)
  const order = reconcile(rawOrder, ids)
  const orderRef = React.useRef(order)
  orderRef.current = order
  const [contentRef, contentHeight] = useMeasuredHeight<HTMLDivElement>()
  const [uncontrolled, setUncontrolled] = React.useState<string | null>(
    defaultValue !== undefined ? defaultValue : (items.find((item) => !item.disabled)?.id ?? null)
  )
  const value = valueProp !== undefined ? valueProp : uncontrolled
  const active = value != null ? byId.get(value) : undefined

  const setValue = (next: string | null) => {
    if (valueProp === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  // Direction for the content slide, from rail positions.
  const prevIndex = React.useRef(active ? order.indexOf(active.id) : -1)
  const activeIndex = active ? order.indexOf(active.id) : -1
  const direction = activeIndex >= prevIndex.current ? 1 : -1
  React.useEffect(() => {
    prevIndex.current = activeIndex
  }, [activeIndex])

  const tabRefs = React.useRef(new Map<string, HTMLButtonElement | null>())
  const railRef = React.useRef<HTMLDivElement>(null)
  /** Drag bounds: the panel minus its corner radius, the tab's 8px feet and 6px of straight edge, so a dragged tab never leaves the outline. */
  const boundsRef = React.useRef<HTMLSpanElement>(null)

  /**
   * Scroll the rail (only the rail, never the page) so a tab and its concave feet are fully visible.
   * The target is absolute, so a call made while a smooth scroll is still running lands on the same spot.
   */
  const reveal = React.useCallback(
    (id: string, instant = false) => {
      const rail = railRef.current
      const tab = tabRefs.current.get(id)?.parentElement
      if (!rail || !tab || rail.scrollWidth <= rail.clientWidth) return
      const r = rail.getBoundingClientRect()
      const t = tab.getBoundingClientRect()
      const inset = 16 // 8px foot + 8px breathing room
      let left: number | null = null
      if (t.left < r.left + inset) left = rail.scrollLeft + (t.left - r.left) - inset
      else if (t.right > r.right - inset) left = rail.scrollLeft + (t.right - r.right) + inset
      if (left === null) return
      rail.scrollTo({ left, behavior: instant || reduceMotion ? "auto" : "smooth" })
    },
    [reduceMotion]
  )

  const activeId = active?.id
  const revealedOnce = React.useRef(false)
  React.useEffect(() => {
    if (!activeId) return
    reveal(activeId, !revealedOnce.current)
    revealedOnce.current = true
  }, [activeId, reveal])
  const dragging = React.useRef(false)
  const orderAtDragStart = React.useRef<string[]>(order)
  const [focusId, setFocusId] = React.useState<string | null>(null)
  const pendingFocus = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!pendingFocus.current) return
    tabRefs.current.get(pendingFocus.current)?.focus()
    pendingFocus.current = null
  })

  const close = (id: string) => {
    if (!onClose) return
    if (id === value) {
      const i = order.indexOf(id)
      const rest = order.filter((o) => o !== id && !byId.get(o)?.disabled)
      const next = rest[Math.min(i, rest.length - 1)] ?? null
      setValue(next)
      if (next) pendingFocus.current = next
    }
    onClose(id)
  }

  const move = (id: string, delta: number) => {
    const i = order.indexOf(id)
    const j = i + delta
    if (j < 0 || j >= order.length) return
    const next = [...order]
    next.splice(i, 1)
    next.splice(j, 0, id)
    setRawOrder(next)
    pendingFocus.current = id
    onOrderChange?.(next)
  }

  const enabled = order.filter((id) => !byId.get(id)?.disabled)
  const onKeyDown = (event: React.KeyboardEvent, id: string) => {
    if (event.altKey && reorderable && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault()
      move(id, event.key === "ArrowLeft" ? -1 : 1)
      return
    }
    if (onClose && (event.key === "Delete" || event.key === "Backspace")) {
      event.preventDefault()
      close(id)
      return
    }
    const pos = enabled.indexOf(id)
    let to: string | undefined
    if (event.key === "ArrowRight") to = enabled[(pos + 1) % enabled.length]
    else if (event.key === "ArrowLeft") to = enabled[(pos - 1 + enabled.length) % enabled.length]
    else if (event.key === "Home") to = enabled[0]
    else if (event.key === "End") to = enabled[enabled.length - 1]
    if (!to) return
    event.preventDefault()
    setValue(to)
    tabRefs.current.get(to)?.focus()
  }

  const rovingId = active?.id ?? focusId ?? enabled[0]
  const panelId = `${uid}-panel`

  return (
    <LayoutGroup id={uid}>
      <div data-slot="morphing-tabs" className={cn("relative flex w-full flex-col", className)}>
        <span ref={boundsRef} aria-hidden className="pointer-events-none absolute inset-x-[calc(var(--radius-xl)+0.875rem)] top-0 h-9" />
        <Reorder.Group
          ref={railRef}
          as="div"
          axis="x"
          values={order}
          onReorder={(next: string[]) => setRawOrder(next)}
          role="tablist"
          aria-label={ariaLabel}
          aria-orientation="horizontal"
          data-slot="morphing-tabs-rail"
          className="relative z-10 flex items-end gap-1 overflow-x-auto overflow-y-hidden px-6 pt-1 [scrollbar-width:none]"
        >
          {order.map((id) => {
            const item = byId.get(id)
            if (!item) return null
            const selected = id === active?.id
            return (
              <Reorder.Item
                key={id}
                as="div"
                value={id}
                role="presentation"
                drag={reorderable && !item.disabled ? "x" : false}
                dragConstraints={boundsRef}
                dragElastic={0}
                dragMomentum={false}
                style={{ originY: 1 }}
                whileDrag={reduceMotion ? undefined : { scale: 1.03 }}
                onDragStart={() => {
                  // A drag starts with a focus on the tab; let the user steer instead of auto-scrolling.
                  railRef.current?.scrollTo({ left: railRef.current.scrollLeft })
                  dragging.current = true
                  orderAtDragStart.current = orderRef.current
                }}
                onDragEnd={() => {
                  // Let the click that ends a drag be ignored.
                  requestAnimationFrame(() => {
                    dragging.current = false
                  })
                  // Once the tab settles, scroll the rail so a tab dropped at an end keeps its feet in view.
                  window.setTimeout(() => reveal(id), 350)
                  if (!sameOrder(orderAtDragStart.current, orderRef.current)) onOrderChange?.(orderRef.current)
                }}
                transition={reduceMotion ? { duration: 0 } : SURFACE}
                className={cn("group/tab relative shrink-0 touch-pan-y", selected ? "z-10" : "z-0")}
              >
                {selected && (
                  <motion.span
                    aria-hidden
                    layoutId="morphing-tabs-surface"
                    transition={reduceMotion ? { duration: 0 } : SURFACE}
                    className="absolute inset-0 rounded-t-xl bg-card shadow-raised"
                  >
                    {/*
                     * Concave feet flow the tab into the panel and carry its hairline: each is an 8px
                     * corner clipped from a 14px circle whose ring is the same shadow-raised hairline (--skeuo-raised, the var behind it)
                     * (radius 7-8px, so it meets the tab's side ring and the panel's top ring exactly)
                     * and whose 12px card-coloured spread fills the corner outside the arc. The tab's
                     * own bottom ring falls outside the rail and is clipped, so the outline reads as
                     * one continuous border from tab to panel.
                     */}
                    <span className="absolute bottom-0 -left-2 size-2 overflow-hidden">
                      <span className="absolute -top-[7px] -left-[7px] size-3.5 rounded-full shadow-[var(--skeuo-raised),0_0_0_12px_var(--card)]" />
                    </span>
                    <span className="absolute -right-2 bottom-0 size-2 overflow-hidden">
                      <span className="absolute -top-[7px] -right-[7px] size-3.5 rounded-full shadow-[var(--skeuo-raised),0_0_0_12px_var(--card)]" />
                    </span>
                  </motion.span>
                )}
                <div className="relative flex items-center">
                  <button
                    ref={(el) => {
                      tabRefs.current.set(id, el)
                    }}
                    id={`${uid}-tab-${id}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={selected ? panelId : undefined}
                    aria-keyshortcuts={reorderable ? "Alt+ArrowLeft Alt+ArrowRight" : undefined}
                    disabled={item.disabled}
                    tabIndex={id === rovingId ? 0 : -1}
                    data-active={selected || undefined}
                    onFocus={() => {
                      setFocusId(id)
                      if (!dragging.current) reveal(id)
                    }}
                    onClick={() => {
                      if (dragging.current) return
                      setValue(id)
                    }}
                    onKeyDown={(event) => onKeyDown(event, id)}
                    className={cn(
                      "flex h-9 cursor-pointer items-center gap-1.5 rounded-t-xl pl-3 text-ui font-medium whitespace-nowrap text-muted-foreground outline-none select-none",
                      "transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-40",
                      "data-active:text-card-foreground [&_svg]:size-4 [&_svg]:shrink-0",
                      onClose ? "pr-1.5" : "pr-3",
                      reorderable && "active:cursor-grabbing"
                    )}
                  >
                    {item.icon && (
                      <span aria-hidden className="flex">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </button>
                  {onClose && (
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={l10n.closeNamed(item.label)}
                      onPointerDownCapture={(event) => event.stopPropagation()}
                      onClick={() => close(id)}
                      className={cn(
                        "relative mr-1.5 flex size-5 cursor-pointer after:absolute after:-inset-0.5 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-[opacity,background-color,color] duration-150 group-hover/tab:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100",
                        selected && "opacity-100"
                      )}
                    >
                      <XIcon size={12} />
                    </button>
                  )}
                </div>
              </Reorder.Item>
            )
          })}
        </Reorder.Group>

        <motion.div
          animate={{ height: contentHeight ?? "auto" }}
          transition={reduceMotion ? { duration: 0 } : SURFACE}
          data-slot="morphing-tabs-content"
          className={cn(
            "relative overflow-hidden rounded-xl bg-card text-card-foreground shadow-raised",
            contentClassName
          )}
        >
          <div ref={contentRef} className="relative">
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
              {active ? (
                <motion.div
                  key={active.id}
                  id={panelId}
                  role="tabpanel"
                  aria-labelledby={`${uid}-tab-${active.id}`}
                  tabIndex={0}
                  custom={direction}
                  variants={{
                    enter: (d: number) => (reduceMotion ? { opacity: 0 } : { opacity: 0, x: d * 24, filter: "blur(4px)" }),
                    center: { opacity: 1, x: 0, filter: "blur(0px)" },
                    exit: (d: number) => (reduceMotion ? { opacity: 0 } : { opacity: 0, x: d * -24, filter: "blur(4px)" }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={reduceMotion ? { duration: 0.12 } : { type: "spring", duration: 0.4, bounce: 0 }}
                  className="p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  {active.content}
                </motion.div>
              ) : (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-5 text-ui text-muted-foreground"
                >
                  {l10n.noTabSelected}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </LayoutGroup>
  )
}

export { MorphingTabs }
export type { MorphingTabsItem, MorphingTabsProps }
