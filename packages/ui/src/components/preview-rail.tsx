"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"
import { IconChip } from "@paneui/ui/components/icon-chip"

/*
 * A navigation rail of compact ticks. Pointing at the rail grows the ticks
 * into a pyramid around the one under the pointer (neighbours step down in
 * size), and a preview card glides alongside to reveal that destination's
 * label and description. Keyboard focus drives the same highlight. On touch,
 * where there is no hover, the first tap on a link reveals its preview and a
 * second tap follows it; a tap outside clears it.
 */

type PreviewRailItem = {
  id: string
  label: string
  description?: React.ReactNode
  /** Small leading content in the default preview (icon, number). */
  icon?: React.ReactNode
  href?: string
  target?: React.HTMLAttributeAnchorTarget
  rel?: string
  disabled?: boolean
}

type PreviewRailProps = Omit<React.ComponentProps<"div">, "onChange" | "children"> & {
  items: PreviewRailItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string, item: PreviewRailItem) => void
  orientation?: "vertical" | "horizontal"
  /** Which side of the rail the preview appears on. */
  side?: "start" | "end"
  /** Custom preview contents; return null to show nothing for an item. */
  renderPreview?: (item: PreviewRailItem) => React.ReactNode
  /** Show the preview card at all (ticks still form the pyramid). */
  preview?: boolean
  /** Keep the selected tick tall and tinted while nothing is pointed at. */
  showActive?: boolean
  /** Pitch between ticks, px. */
  itemSize?: number
  /** Length of a fully grown tick, px. */
  tickLength?: number
  label?: string
  railClassName?: string
  previewClassName?: string
  children?: React.ReactNode
}

const SPRING = { type: "spring", stiffness: 520, damping: 34, mass: 0.5 } as const
const GLIDE = { type: "spring", stiffness: 420, damping: 36, mass: 0.7 } as const
const EASE = [0.22, 1, 0.36, 1] as const
const PYRAMID = [1, 0.66, 0.44] // highlighted, ±1, ±2 — the rest rest at REST
const REST = 0.28

function DefaultPreview({ item }: { item: PreviewRailItem }) {
  return (
    <div className="flex items-start gap-2.5">
      {item.icon && (
        <IconChip className="-mt-0.5">{item.icon}</IconChip>
      )}
      <div className="min-w-0">
        <p className="text-ui font-medium text-popover-foreground">{item.label}</p>
        {item.description && <div className="mt-0.5 text-xs/5 text-muted-foreground">{item.description}</div>}
      </div>
    </div>
  )
}

function PreviewRail({
  items,
  value,
  defaultValue,
  onValueChange,
  orientation = "vertical",
  side = "end",
  renderPreview,
  preview = true,
  showActive = true,
  itemSize = 22,
  tickLength = 40,
  label,
  className,
  railClassName,
  previewClassName,
  children,
  ...props
}: PreviewRailProps) {
  const l10n = useLocale().labels
  if (label === undefined) label = l10n.sections

  const reduce = useReducedMotion() ?? false
  const uid = React.useId()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.id ?? "")
  const [hovered, setHovered] = React.useState<string | null>(null)
  const [pinned, setPinned] = React.useState<string | null>(null)
  const [focused, setFocused] = React.useState<string | null>(null)
  const lastPointer = React.useRef<string>("mouse")

  const requested = value ?? internal
  const selected = items.some((i) => i.id === requested) ? requested : (items[0]?.id ?? "")
  const shown = hovered ?? pinned ?? focused
  const lit = shown ?? (showActive ? selected : null)
  const litIndex = items.findIndex((i) => i.id === lit)
  const shownItem = items.find((i) => i.id === shown) ?? null
  const shownIndex = shownItem ? items.indexOf(shownItem) : -1
  const horizontal = orientation === "horizontal"

  // a tap outside the rail clears a touch-pinned preview
  React.useEffect(() => {
    if (pinned === null) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPinned(null)
    }
    document.addEventListener("pointerdown", onDown, true)
    return () => document.removeEventListener("pointerdown", onDown, true)
  }, [pinned])

  const select = (item: PreviewRailItem) => {
    if (value === undefined) setInternal(item.id)
    onValueChange?.(item.id, item)
  }

  const previewContent = shownItem ? (renderPreview ? renderPreview(shownItem) : <DefaultPreview item={shownItem} />) : null
  // centre of the shown tick along the rail, used to place the card
  const offset = shownIndex >= 0 ? shownIndex * itemSize + itemSize / 2 : 0

  return (
    <div
      ref={rootRef}
      data-slot="preview-rail"
      data-orientation={orientation}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocused(null)
          setPinned(null)
        }
      }}
      className={cn("relative isolate flex", horizontal ? "flex-col items-center" : "flex-row", className)}
      {...props}
    >
      <div className={cn("relative", horizontal ? "w-fit" : "h-fit self-center")}>
        <nav
          aria-label={label}
          data-slot="preview-rail-rail"
          onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(null)}
          className={cn("relative z-10 flex", horizontal ? "flex-row items-end" : "flex-col", railClassName)}
          style={horizontal ? { height: tickLength + 8 } : { width: tickLength + 8 }}
        >
          {items.map((item, index) => {
            const isLit = item.id === lit
            const isSelected = item.id === selected
            const dist = litIndex < 0 ? Infinity : Math.abs(index - litIndex)
            const scale = PYRAMID[dist] ?? REST
            const tick = (
              <motion.span
                aria-hidden
                data-slot="preview-rail-tick"
                initial={false}
                animate={horizontal ? { scaleY: scale } : { scaleX: scale }}
                transition={reduce ? { duration: 0 } : SPRING}
                style={horizontal ? { height: tickLength } : { width: tickLength }}
                className={cn(
                  "block rounded-full transition-colors duration-200",
                  horizontal ? "w-[3px] origin-bottom" : "h-[3px] origin-left",
                  isLit && isSelected
                    ? "bg-primary shadow-primary"
                    : isLit
                      ? "bg-foreground"
                      : isSelected
                        ? "bg-primary/60"
                        : "bg-muted-foreground/35 shadow-well"
                )}
              />
            )
            const shared = {
              "data-slot": "preview-rail-item",
              "data-highlighted": isLit || undefined,
              "aria-label": item.label,
              "aria-current": isSelected ? (item.href ? ("page" as const) : ("location" as const)) : undefined,
              style: horizontal ? { width: itemSize } : { height: itemSize },
              className: cn(
                "relative flex shrink-0 cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
                horizontal ? "h-full items-end justify-center pb-1" : "w-full items-center pl-1",
                item.disabled && "pointer-events-none opacity-40"
              ),
              onPointerEnter: (e: React.PointerEvent) => {
                lastPointer.current = e.pointerType
                if (e.pointerType === "mouse") setHovered(item.id)
              },
              onPointerDown: (e: React.PointerEvent) => {
                lastPointer.current = e.pointerType
                setFocused(null)
              },
              onFocus: (e: React.FocusEvent<HTMLElement>) => {
                if (e.currentTarget.matches(":focus-visible")) setFocused(item.id)
              },
              onKeyDown: () => {
                lastPointer.current = "keyboard"
              },
              onClick: (e: React.MouseEvent) => {
                const touch = lastPointer.current === "touch" || lastPointer.current === "pen"
                if (touch) {
                  // first tap on a link only reveals; the second follows it
                  if (item.href && pinned !== item.id) {
                    e.preventDefault()
                    setPinned(item.id)
                    return
                  }
                  setPinned(item.id)
                }
                select(item)
              },
            }
            return item.href ? (
              <a
                key={item.id}
                {...shared}
                href={item.href}
                target={item.target}
                rel={item.rel ?? (item.target === "_blank" ? "noreferrer noopener" : undefined)}
                aria-disabled={item.disabled || undefined}
                tabIndex={item.disabled ? -1 : undefined}
              >
                {tick}
              </a>
            ) : (
              <button key={item.id} type="button" disabled={item.disabled} {...shared}>
                {tick}
              </button>
            )
          })}
        </nav>

        {preview && (
          <div
            aria-hidden
            data-slot="preview-rail-preview"
            className={cn(
              "pointer-events-none absolute z-50",
              horizontal
                ? side === "start"
                  ? "bottom-full left-0 mb-2"
                  : "top-full left-0 mt-2"
                : side === "start"
                  ? "top-0 right-full mr-3"
                  : "top-0 left-full ml-3"
            )}
          >
            <AnimatePresence>
              {shownItem && previewContent != null && (
                <motion.div
                  key={`${uid}-card`}
                  initial={{
                    ...(reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, filter: "blur(6px)" }),
                    ...(horizontal ? { x: offset } : { y: offset }),
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    ...(horizontal ? { x: offset } : { y: offset }),
                  }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: "blur(4px)", transition: { duration: 0.14, ease: EASE } }}
                  transition={reduce ? { duration: 0 } : { ...GLIDE, opacity: { duration: 0.16, ease: EASE }, filter: { duration: 0.18, ease: EASE } }}
                  style={horizontal ? { originY: side === "start" ? 1 : 0 } : { originX: side === "start" ? 1 : 0 }}
                  className={cn(
                    // Tailwind's translate is the CSS `translate` property, so it
                    // composes with motion's transform instead of fighting it
                    horizontal ? "-translate-x-1/2" : "-translate-y-1/2",
                    "w-64 overflow-hidden rounded-2xl bg-popover p-3 text-popover-foreground shadow-surface",
                    previewClassName
                  )}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={shownItem.id}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(4px)" }}
                      transition={{ duration: reduce ? 0 : 0.18, ease: EASE }}
                    >
                      {previewContent}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      {children && <div className="min-w-0 flex-1">{children}</div>}
    </div>
  )
}

export { PreviewRail }
export type { PreviewRailItem, PreviewRailProps }
