"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"

type ExpandableTabsItem = {
  id: string
  /** Shown inside the active pill; also the tab's accessible name. */
  label: string
  icon: React.ReactNode
  /** Panel shown above the bar while this tab is active. */
  content: React.ReactNode
  disabled?: boolean
}

type ExpandableTabsProps = {
  items: ExpandableTabsItem[]
  /** Active tab id, or null for the closed, bar-only state. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (id: string | null) => void
  /** Pressing the active tab (or Escape) closes the panel. Default true. */
  collapsible?: boolean
  /** Where the panel opens relative to the bar. Default "top". */
  side?: "top" | "bottom"
  className?: string
  panelClassName?: string
  barClassName?: string
  "aria-label"?: string
}

const SHELL: Transition = { type: "spring", duration: 0.55, bounce: 0 }
const PILL: Transition = { type: "spring", duration: 0.45, bounce: 0 }
const SLIDE = 28

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

/**
 * Icon tab bar. The active tab expands into a labelled pill and a panel above the bar
 * morphs its height to fit, sliding content in from the side the user moved towards.
 */
function ExpandableTabs({
  items,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  collapsible = true,
  side = "top",
  className,
  panelClassName,
  barClassName,
  "aria-label": ariaLabel,
}: ExpandableTabsProps) {
  const l10n = useLocale().labels
  if (ariaLabel === undefined) ariaLabel = l10n.sections

  const reduceMotion = useReducedMotion()
  const uid = React.useId()
  const [uncontrolled, setUncontrolled] = React.useState<string | null>(defaultValue)
  const value = valueProp !== undefined ? valueProp : uncontrolled
  const activeIndex = items.findIndex((item) => item.id === value)
  const active = activeIndex >= 0 ? items[activeIndex] : null

  // Direction of the last switch: 1 = moved right, -1 = moved left.
  const [direction, setDirection] = React.useState(1)
  const previousIndex = React.useRef(activeIndex)
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const [focusIndex, setFocusIndex] = React.useState(Math.max(0, activeIndex))

  const setValue = (next: string | null) => {
    const nextIndex = items.findIndex((item) => item.id === next)
    if (nextIndex >= 0 && previousIndex.current >= 0) setDirection(nextIndex >= previousIndex.current ? 1 : -1)
    else setDirection(side === "top" ? 1 : -1)
    previousIndex.current = nextIndex
    if (valueProp === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  const press = (item: ExpandableTabsItem) => {
    if (item.disabled) return
    if (item.id === value) {
      if (collapsible) setValue(null)
    } else setValue(item.id)
  }

  const enabled = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0)
  const moveFocus = (to: number, activate: boolean) => {
    const target = items[to]
    if (!target) return
    setFocusIndex(to)
    tabRefs.current[to]?.focus()
    if (activate && value !== null) setValue(target.id)
  }

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const pos = enabled.indexOf(index)
    let to: number | undefined
    if (event.key === "ArrowRight") to = enabled[(pos + 1) % enabled.length]
    else if (event.key === "ArrowLeft") to = enabled[(pos - 1 + enabled.length) % enabled.length]
    else if (event.key === "Home") to = enabled[0]
    else if (event.key === "End") to = enabled[enabled.length - 1]
    else if (event.key === "Escape" && collapsible && value !== null) {
      event.preventDefault()
      setValue(null)
      return
    }
    if (to === undefined) return
    event.preventDefault()
    // Once a panel is open, arrows follow focus (automatic activation); closed, they only move focus.
    moveFocus(to, true)
  }

  const [innerRef, innerHeight] = useMeasuredHeight<HTMLDivElement>()
  const panelId = `${uid}-panel`

  const panel = (
    <AnimatePresence initial={false}>
      {active && (
        <motion.div
          key="panel"
          data-slot="expandable-tabs-panel"
          className={cn(
            "w-80 max-w-full overflow-hidden rounded-2xl bg-popover text-popover-foreground shadow-surface",
            panelClassName
          )}
          style={{ transformOrigin: side === "top" ? "bottom center" : "top center" }}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: side === "top" ? 12 : -12, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)", height: innerHeight ?? "auto" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: side === "top" ? 10 : -10, filter: "blur(4px)" }}
          transition={reduceMotion ? { duration: 0.12 } : SHELL}
        >
          <div ref={innerRef} className="relative">
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
              <motion.div
                key={active.id}
                id={panelId}
                role="tabpanel"
                aria-labelledby={`${uid}-tab-${active.id}`}
                tabIndex={0}
                custom={direction}
                className="p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                variants={{
                  enter: (d: number) => (reduceMotion ? { opacity: 0 } : { opacity: 0, x: d * SLIDE, filter: "blur(3px)" }),
                  center: { opacity: 1, x: 0, filter: "blur(0px)" },
                  exit: (d: number) => (reduceMotion ? { opacity: 0 } : { opacity: 0, x: d * -SLIDE, filter: "blur(3px)" }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={reduceMotion ? { duration: 0.12 } : { type: "spring", duration: 0.42, bounce: 0 }}
              >
                {active.content}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div data-slot="expandable-tabs" className={cn("flex flex-col items-center gap-2.5", className)}>
      {side === "top" && panel}
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        data-slot="expandable-tabs-bar"
        className={cn("inline-flex items-center gap-1 rounded-lg bg-muted/70 p-1 shadow-well", barClassName)}
      >
        {items.map((item, index) => {
          const selected = item.id === value
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el
              }}
              id={`${uid}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={selected ? panelId : undefined}
              aria-label={item.label}
              disabled={item.disabled}
              tabIndex={index === (activeIndex >= 0 ? activeIndex : focusIndex) ? 0 : -1}
              data-active={selected || undefined}
              onClick={() => press(item)}
              onKeyDown={(event) => onKeyDown(event, index)}
              onFocus={() => setFocusIndex(index)}
              className={cn(
                "relative inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-2.5 text-ui font-medium text-muted-foreground outline-none select-none",
                "transition-[color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
                "data-active:bg-secondary data-active:text-foreground data-active:shadow-raised",
                "[&_svg]:size-4.5 [&_svg]:shrink-0"
              )}
            >
              <motion.span
                aria-hidden
                className="flex items-center"
                animate={reduceMotion ? undefined : { scale: selected ? 1 : 0.94 }}
                transition={PILL}
              >
                {item.icon}
              </motion.span>
              <AnimatePresence initial={false}>
                {selected && (
                  <motion.span
                    key="label"
                    aria-hidden
                    className="overflow-hidden whitespace-nowrap"
                    initial={reduceMotion ? { opacity: 0, width: "auto" } : { opacity: 0, width: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, width: "auto", filter: "blur(0px)" }}
                    exit={reduceMotion ? { opacity: 0, width: 0 } : { opacity: 0, width: 0, filter: "blur(4px)" }}
                    transition={reduceMotion ? { duration: 0 } : PILL}
                  >
                    <span className="block pr-1 pl-1.5">{item.label}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </div>
      {side === "bottom" && panel}
    </div>
  )
}

export { ExpandableTabs }
export type { ExpandableTabsItem, ExpandableTabsProps }
