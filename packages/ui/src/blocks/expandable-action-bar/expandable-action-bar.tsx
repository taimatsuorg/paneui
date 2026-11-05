"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { Toolbar } from "@base-ui/react/toolbar"
import { LayoutGroup, motion, useReducedMotion, type Transition } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"

export type ExpandableActionBarItem = {
  id: string
  label: React.ReactNode
  icon: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  /** Small count or dot on the icon. */
  badge?: React.ReactNode
  /** Keyboard hint shown next to the label while expanded (display only). */
  shortcut?: React.ReactNode
}

export type ExpandableActionBarProps = {
  items: ExpandableActionBarItem[]
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  /** Item that carries the gliding active highlight. */
  activeId?: string
  onAction?: (item: ExpandableActionBarItem) => void
  size?: "sm" | "md"
  /**
   * Expand while a mouse rests on the bar (default true). Also sets the touch behaviour: with no hover,
   * the first tap expands the bar and the second one acts. Set false to make every press act at once.
   */
  expandOnHover?: boolean
  expandOnFocus?: boolean
  /** ms to wait after the pointer leaves before collapsing. */
  collapseDelay?: number
  "aria-label"?: string
  className?: string
}

const LABEL: Transition = { type: "spring", stiffness: 400, damping: 34, mass: 0.7 }
const GLIDE: Transition = { type: "spring", stiffness: 460, damping: 36, mass: 0.6 }
/** Gap between icon and label, px. */
const LABEL_GAP = 6
/**
 * The badge is pinned 8px past the icon's right edge (`-right-2`) and grows leftward, so it always
 * overhangs by exactly 8px whatever its width. A badged item pushes its label out by that much more.
 */
const BADGE_OVERHANG = 8
/*
 * The label clips its width animation (overflow-hidden). py-1/-my-1 on it and mr-px on the kbd keep the
 * kbd's hairline ring and drop inside the clip without changing the row height.
 */

const sizes = {
  // Concentric radii: bar radius = item radius + bar padding (md 14 = 10 + 4, sm 10 = 6 + 4).
  sm: { bar: "gap-0.5 frame-lg frame-p-1", item: "h-7 min-w-7 rounded-inner px-1.5 text-ui-sm", icon: "[&_svg]:size-3.5", radius: "rounded-inner" },
  md: { bar: "gap-0.5 frame-2xl frame-p-1", item: "h-9 min-w-9 rounded-inner px-2.5 text-ui", icon: "[&_svg]:size-4", radius: "rounded-inner" },
}

export function ExpandableActionBar({
  items,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  activeId,
  onAction,
  size = "md",
  expandOnHover = true,
  expandOnFocus = true,
  collapseDelay = 120,
  "aria-label": ariaLabel,
  className,
}: ExpandableActionBarProps) {
  const l10n = useLocale().labels
  if (ariaLabel === undefined) ariaLabel = l10n.actions

  const reduce = useReducedMotion()
  const groupId = React.useId()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [internal, setInternal] = React.useState(defaultExpanded)
  const expanded = expandedProp ?? internal
  const timer = React.useRef<number | null>(null)
  const pointerType = React.useRef<string | null>(null)
  const hovering = React.useRef(false)
  const focused = React.useRef(false)
  const s = sizes[size]

  const setExpanded = React.useCallback(
    (next: boolean) => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current)
        timer.current = null
      }
      if (expandedProp === undefined) setInternal(next)
      if (next !== expanded) onExpandedChange?.(next)
    },
    [expandedProp, expanded, onExpandedChange]
  )

  const scheduleCollapse = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      timer.current = null
      if (!hovering.current && !focused.current) setExpanded(false)
    }, collapseDelay)
  }

  React.useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

  // After a touch expanded the bar, a press anywhere else folds it back.
  React.useEffect(() => {
    if (!expanded || expandedProp !== undefined) return
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        focused.current = false
        setExpanded(false)
      }
    }
    window.addEventListener("pointerdown", onPointer, true)
    return () => window.removeEventListener("pointerdown", onPointer, true)
  }, [expanded, expandedProp, setExpanded])

  return (
    <Toolbar.Root
      ref={rootRef}
      aria-label={ariaLabel}
      data-slot="expandable-action-bar"
      data-expanded={expanded || undefined}
      onPointerDown={(e) => {
        pointerType.current = e.pointerType
      }}
      onKeyDown={(e) => {
        pointerType.current = null
        if (e.key === "Escape" && expanded) setExpanded(false)
      }}
      onPointerEnter={(e) => {
        if (!expandOnHover || e.pointerType !== "mouse") return
        hovering.current = true
        setExpanded(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return
        hovering.current = false
        scheduleCollapse()
      }}
      onFocus={(e) => {
        // Pointer presses focus the button too; only keyboard (focus-visible) focus expands.
        if (!expandOnFocus || !e.target.matches(":focus-visible")) return
        focused.current = true
        setExpanded(true)
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
        focused.current = false
        scheduleCollapse()
      }}
      className={cn(
        "inline-flex items-center bg-card text-card-foreground shadow-raised",
        s.bar,
        className
      )}
    >
      <LayoutGroup id={groupId}>
        {items.map((item) => {
          const active = item.id === activeId
          return (
            <Toolbar.Button
              key={item.id}
              disabled={item.disabled}
              data-active={active || undefined}
              aria-pressed={activeId !== undefined ? active : undefined}
              onClick={() => {
                if (expandOnHover && !expanded && pointerType.current === "touch") {
                  setExpanded(true)
                  return
                }
                item.onClick?.()
                onAction?.(item)
              }}
              className={cn(
                "relative inline-flex shrink-0 cursor-pointer items-center justify-center font-medium whitespace-nowrap text-muted-foreground outline-none transition-[color,scale] duration-150 ease-out select-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-active:text-foreground data-disabled:pointer-events-none data-disabled:opacity-45",
                s.item,
                s.icon
              )}
            >
              {active && (
                <motion.span
                  layoutId="active"
                  aria-hidden
                  transition={reduce ? { duration: 0 } : GLIDE}
                  className={cn("absolute inset-0 bg-accent", s.radius)}
                />
              )}
              <span className="relative inline-flex items-center justify-center">
                {item.icon}
                {item.badge != null && (
                  <span className="absolute -top-1.5 -right-2 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-ui-2xs leading-none font-semibold text-primary-foreground tabular-nums shadow-primary">
                    {item.badge}
                  </span>
                )}
              </span>
              <motion.span
                initial={false}
                animate={
                  expanded
                    ? {
                        width: "auto",
                        opacity: 1,
                        marginLeft: LABEL_GAP + (item.badge != null ? BADGE_OVERHANG : 0),
                        filter: "blur(0px)",
                      }
                    : { width: 0, opacity: 0, marginLeft: 0, filter: reduce ? "blur(0px)" : "blur(3px)" }
                }
                transition={reduce ? { duration: 0 } : LABEL}
                className="relative -my-1 inline-flex items-center gap-1.5 overflow-hidden py-1"
              >
                {item.label}
                {item.shortcut && (
                  <kbd className="mr-px inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-md bg-background px-1 font-sans text-ui-2xs text-muted-foreground shadow-chip">
                    {item.shortcut}
                  </kbd>
                )}
              </motion.span>
            </Toolbar.Button>
          )
        })}
      </LayoutGroup>
    </Toolbar.Root>
  )
}
