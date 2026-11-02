"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"

const CONTINUITY: Transition = { type: "spring", stiffness: 300, damping: 24, mass: 0.8 }
const REVEAL = {
  initial: { opacity: 0, filter: "blur(4px)", scale: 0.92 },
  animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
  exit: { opacity: 0, filter: "blur(4px)", scale: 0.92 },
}

type ExpandableState = {
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

function useExpanded({ expanded, defaultExpanded = false, onExpandedChange }: ExpandableState) {
  const [inner, setInner] = React.useState(defaultExpanded)
  const value = expanded ?? inner
  const set = React.useCallback(
    (next: boolean) => {
      if (expanded === undefined) setInner(next)
      onExpandedChange?.(next)
    },
    [expanded, onExpandedChange]
  )
  return [value, set] as const
}

/** Springs a box between its content's natural widths, so the surface morphs instead of jumping. */
function MorphWidth({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLSpanElement>(null)
  const [width, setWidth] = React.useState<number>()
  React.useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const update = () => setWidth(node.offsetWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(node)
    return () => ro.disconnect()
  }, [])
  return (
    <motion.span
      initial={false}
      animate={{ width: width ?? "auto" }}
      transition={reduce ? { duration: 0 } : CONTINUITY}
      className="inline-flex h-full items-center overflow-hidden"
    >
      <span ref={ref} className={cn("inline-flex w-max items-center", className)}>
        {children}
      </span>
    </motion.span>
  )
}

const SURFACE =
  "bg-card text-secondary-foreground shadow-raised hover:bg-accent hover:shadow-raised-hover"

type ExpandableButtonProps = Omit<ButtonPrimitive.Props, "children"> &
  ExpandableState & {
    /** Always visible. */
    icon: React.ReactNode
    /** Revealed beside the icon when expanded. */
    label: React.ReactNode
  }

/**
 * An icon button that grows to reveal its label on click (aria-expanded reflects it).
 * Call event.preventDefault() in onClick to keep it from toggling.
 */
function ExpandableButton({
  icon,
  label,
  expanded,
  defaultExpanded,
  onExpandedChange,
  onClick,
  className,
  "aria-label": ariaLabel,
  ...props
}: ExpandableButtonProps) {
  const reduce = useReducedMotion()
  const [open, setOpen] = useExpanded({ expanded, defaultExpanded, onExpandedChange })
  return (
    <ButtonPrimitive
      data-slot="expandable-button"
      data-expanded={open || undefined}
      aria-expanded={open}
      aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setOpen(!open)
      }}
      className={cn(
        "inline-flex h-10 shrink-0 cursor-pointer items-center rounded-control p-0.5 text-ui font-medium whitespace-nowrap outline-none select-none",
        "transition-[box-shadow,background-color,color,scale] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring active:scale-96 disabled:pointer-events-none disabled:opacity-50",
        SURFACE,
        "data-expanded:bg-primary data-expanded:text-primary-foreground data-expanded:shadow-primary data-expanded:hover:bg-primary-hover",
        className
      )}
      {...props}
    >
      <MorphWidth>
        <span aria-hidden className="grid size-9 shrink-0 place-items-center [&_svg]:size-4.5">
          {icon}
        </span>
        <AnimatePresence mode="popLayout" initial={false}>
          {open && (
            <motion.span
              key="label"
              aria-hidden
              {...(reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : REVEAL)}
              transition={reduce ? { duration: 0.12 } : CONTINUITY}
              className="origin-left pr-3.5"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </MorphWidth>
    </ButtonPrimitive>
  )
}

type ExpandableChipProps = ExpandableState & {
  /** The chip's own text; clicking it toggles the trailing action. */
  label: React.ReactNode
  actionIcon: React.ReactNode
  /** Accessible name for the action, e.g. "Remove Design". */
  actionLabel: string
  onAction?: () => void
  /** Collapse (and return focus to the chip) after the action runs. */
  collapseOnAction?: boolean
  /** Visual tone of the revealed action. */
  actionTone?: "default" | "destructive"
  disabled?: boolean
  className?: string
}

/**
 * A chip that reveals a trailing action (remove, edit, copy…) when clicked.
 * Escape or clicking the chip again tucks the action away.
 */
function ExpandableChip({
  label,
  actionIcon,
  actionLabel,
  onAction,
  collapseOnAction = true,
  actionTone = "default",
  expanded,
  defaultExpanded,
  onExpandedChange,
  disabled,
  className,
}: ExpandableChipProps) {
  const reduce = useReducedMotion()
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const actionId = React.useId()
  const [open, setOpen] = useExpanded({ expanded, defaultExpanded, onExpandedChange })

  return (
    <span
      role="group"
      data-slot="expandable-chip"
      data-expanded={open || undefined}
      data-disabled={disabled || undefined}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation()
          setOpen(false)
          triggerRef.current?.focus()
        }
      }}
      className={cn(
        "inline-flex h-8 items-center rounded-control text-ui-sm font-medium transition-shadow duration-150 data-disabled:pointer-events-none data-disabled:opacity-50",
        SURFACE,
        className
      )}
    >
      <MorphWidth>
        <ButtonPrimitive
          ref={triggerRef}
          disabled={disabled}
          aria-expanded={open}
          aria-controls={open ? actionId : undefined}
          onClick={() => setOpen(!open)}
          className="h-8 cursor-pointer rounded-control px-3 whitespace-nowrap outline-none select-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {label}
        </ButtonPrimitive>
        <AnimatePresence mode="popLayout" initial={false}>
          {open && (
            <motion.span
              key="action"
              {...(reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : REVEAL)}
              transition={reduce ? { duration: 0.12 } : CONTINUITY}
              className="-ml-1.5 pr-1"
            >
              <ButtonPrimitive
                id={actionId}
                aria-label={actionLabel}
                disabled={disabled}
                onClick={() => {
                  onAction?.()
                  if (collapseOnAction) {
                    setOpen(false)
                    triggerRef.current?.focus()
                  }
                }}
                className={cn(
                  "grid size-6 cursor-pointer place-items-center rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5",
                  actionTone === "destructive"
                    ? "bg-destructive/12 text-destructive-text hover:bg-destructive hover:text-white"
                    : "bg-muted text-muted-foreground shadow-well hover:text-foreground"
                )}
              >
                {actionIcon}
              </ButtonPrimitive>
            </motion.span>
          )}
        </AnimatePresence>
      </MorphWidth>
    </span>
  )
}

export { ExpandableButton, ExpandableChip, type ExpandableButtonProps, type ExpandableChipProps }
