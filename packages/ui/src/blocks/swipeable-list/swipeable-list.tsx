"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "motion/react"

import { cn } from "@paneui/ui/lib/utils"

/** Which rail is revealed: "right" = actions on the right edge (row swiped left). */
type SwipeSide = "left" | "right"
type SwipeTone = "neutral" | "primary" | "success" | "warning" | "destructive"

type SwipeAction = {
  id: string
  label: string
  icon: React.ReactNode
  tone?: SwipeTone
  disabled?: boolean
  onAction?: (item: SwipeableListItem) => void
}

type SwipeableListItem = {
  id: string
  title: React.ReactNode
  description?: React.ReactNode
  meta?: React.ReactNode
  leading?: React.ReactNode
  /** Revealed by swiping right; the first one is committed by a full swipe. */
  leftActions?: SwipeAction[]
  /** Revealed by swiping left; the last one is committed by a full swipe. */
  rightActions?: SwipeAction[]
  disabled?: boolean
}

type SwipeableListOpen = { id: string; side: SwipeSide } | null

type SwipeableListProps = {
  items: SwipeableListItem[]
  /** The row that is swiped open, if any. Only one row is open at a time. */
  open?: SwipeableListOpen
  defaultOpen?: SwipeableListOpen
  onOpenChange?: (open: SwipeableListOpen) => void
  onAction?: (payload: { item: SwipeableListItem; action: SwipeAction; side: SwipeSide }) => void
  /** Width of one action button in px. Default 76. */
  actionWidth?: number
  /** Swiping past this share of the row width commits the edge action. Default 0.55; false disables. */
  fullSwipe?: number | false
  "aria-label"?: string
  className?: string
  renderItem?: (item: SwipeableListItem) => React.ReactNode
}

const toneClass: Record<SwipeTone, string> = {
  neutral: "bg-muted text-foreground",
  primary: "bg-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  destructive: "bg-destructive text-destructive-foreground",
}

/*
 * Release/settle spring: softer and slightly heavier than a snap so the row glides into place, and it
 * starts from the drag's own velocity (see snapTo) so letting go never jerks.
 */
const SNAP = { type: "spring", stiffness: 340, damping: 30, mass: 0.9, restDelta: 0.5 } as const
const ICON = { type: "spring", stiffness: 420, damping: 26, mass: 0.6 } as const
/**
 * The rails reach this far (px) under the sliding surface. Without the overlap the rail edge and the
 * surface edge are two antialiased lines at fractional x, and the page shows through between them as
 * a hairline that flickers while dragging; the overlap also fills the surface's rounded leading
 * corners with the action colour instead of a gap.
 */
const TUCK = 18

type RowProps = {
  item: SwipeableListItem
  openSide: SwipeSide | null
  onOpen: (side: SwipeSide | null) => void
  onCommit: (action: SwipeAction, side: SwipeSide) => void
  actionWidth: number
  fullSwipe: number | false
  renderItem?: (item: SwipeableListItem) => React.ReactNode
}

function SwipeRow({ item, openSide, onOpen, onCommit, actionWidth, fullSwipe, renderItem }: RowProps) {
  const l10n = useLocale().labels

  const reduceMotion = useReducedMotion()
  const rowRef = React.useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const left = item.disabled ? [] : (item.leftActions ?? [])
  const right = item.disabled ? [] : (item.rightActions ?? [])
  const leftWidth = left.length * actionWidth
  const rightWidth = right.length * actionWidth
  const [armed, setArmed] = React.useState<SwipeSide | null>(null)
  const [committing, setCommitting] = React.useState(false)
  // The click that ends a drag must not toggle the row.
  const dragged = React.useRef(false)

  const leftRail = useTransform(x, (v) => (v > 0 ? v + TUCK : 0))
  const rightRail = useTransform(x, (v) => (v < 0 ? TUCK - v : 0))

  const snapTo = React.useCallback(
    (target: number) =>
      animate(x, target, reduceMotion ? { duration: 0 } : { ...SNAP, velocity: x.getVelocity() }),
    [reduceMotion, x]
  )

  // Follow the open state (also when another row opens and this one should close).
  React.useEffect(() => {
    if (committing) return
    snapTo(openSide === "left" ? leftWidth : openSide === "right" ? -rightWidth : 0)
  }, [openSide, leftWidth, rightWidth, snapTo, committing])

  const width = () => rowRef.current?.offsetWidth ?? 320
  const edgeAction = (side: SwipeSide) => (side === "left" ? left[0] : right[right.length - 1])
  const armedFor = (offset: number): SwipeSide | null => {
    if (fullSwipe === false) return null
    const side: SwipeSide = offset > 0 ? "left" : "right"
    const action = edgeAction(side)
    return action && !action.disabled && Math.abs(offset) > width() * fullSwipe ? side : null
  }

  const commit = async (action: SwipeAction, side: SwipeSide) => {
    setCommitting(true)
    await snapTo(side === "left" ? width() : -width())
    onCommit(action, side)
    setArmed(null)
    setCommitting(false)
  }

  const onDrag = () => {
    const next = armedFor(x.get())
    if (next !== armed) setArmed(next)
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    setTimeout(() => {
      dragged.current = false
    }, 0)
    const current = x.get()
    const full = armedFor(current)
    setArmed(null)
    if (full) {
      void commit(edgeAction(full)!, full)
      return
    }
    // Decide from position, nudged by a quick flick.
    const projected = current + info.velocity.x * 0.12
    const target: SwipeSide | null =
      leftWidth && projected > leftWidth / 2 ? "left" : rightWidth && projected < -rightWidth / 2 ? "right" : null
    snapTo(target === "left" ? leftWidth : target === "right" ? -rightWidth : 0)
    if (target !== openSide) onOpen(target)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.target !== event.currentTarget) return
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      onOpen(openSide === "left" ? null : rightWidth ? "right" : null)
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      onOpen(openSide === "right" ? null : leftWidth ? "left" : null)
    } else if (event.key === "Escape" && openSide) {
      event.preventDefault()
      onOpen(null)
    }
  }

  const rail = (side: SwipeSide, actions: SwipeAction[]) => {
    if (!actions.length) return null
    const isOpen = openSide === side
    const isArmed = armed === side
    const edgeId = edgeAction(side)?.id
    return (
      <motion.div
        aria-hidden={!isOpen}
        data-slot="swipeable-list-rail"
        style={{ width: side === "left" ? leftRail : rightRail }}
        className={cn("absolute inset-y-0 flex overflow-hidden", side === "left" ? "left-0" : "right-0 flex-row-reverse")}
      >
        {(side === "left" ? actions : [...actions].reverse()).map((action, i, list) => {
          const hidden = isArmed && action.id !== edgeId
          // The innermost button (last child on both sides) also fills the strip tucked under the surface.
          const tuck = i === list.length - 1 ? TUCK : 0
          return (
            <button
              key={action.id}
              type="button"
              tabIndex={isOpen ? 0 : -1}
              disabled={action.disabled}
              onClick={() => void commit(action, side)}
              className={cn(
                "relative flex shrink-0 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden text-ui-xs font-medium outline-none",
                "transition-[flex-grow,opacity,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:opacity-50",
                "[&_svg]:size-4.5",
                toneClass[action.tone ?? "neutral"],
                // The edge action soaks up any over-drag so no empty rail ever shows behind it.
                action.id === edgeId ? "grow" : "grow-0",
                hidden && "opacity-0"
              )}
              style={{
                width: hidden ? 0 : actionWidth + tuck,
                minWidth: hidden ? 0 : undefined,
                [side === "left" ? "paddingRight" : "paddingLeft"]: hidden ? 0 : tuck,
              }}
            >
              <motion.span
                className="flex"
                animate={reduceMotion ? undefined : { scale: isArmed && action.id === edgeId ? 1.15 : 1 }}
                transition={ICON}
              >
                {action.icon}
              </motion.span>
              {action.label}
            </button>
          )
        })}
      </motion.div>
    )
  }

  const hasActions = leftWidth > 0 || rightWidth > 0
  const hint = [rightWidth ? l10n.leftArrowForActions : "", leftWidth ? l10n.rightArrowForMoreActions : ""]
    .filter(Boolean)
    .join(", ")

  return (
    // The hairline lives on the row, not the sliding surface: an outer ring on the surface was clipped by
    // this overflow-hidden at rest and drawn over the rail mid-drag, so a border blinked in and out.
    <div ref={rowRef} role="listitem" data-slot="swipeable-list-item" className="relative isolate overflow-hidden rounded-2xl shadow-raised">
      {rail("left", left)}
      {rail("right", right)}
      <motion.div
        tabIndex={item.disabled ? -1 : 0}
        aria-description={hasActions ? hint : undefined}
        aria-disabled={item.disabled || undefined}
        drag={hasActions ? "x" : false}
        dragDirectionLock
        dragConstraints={{ left: -rightWidth, right: leftWidth }}
        dragElastic={{ left: right.length ? 0.5 : 0.06, right: left.length ? 0.5 : 0.06 }}
        dragMomentum={false}
        onDragStart={() => {
          dragged.current = true
        }}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        onKeyDown={onKeyDown}
        onClick={() => !dragged.current && openSide && onOpen(null)}
        style={{ x }}
        data-slot="swipeable-list-surface"
        className={cn(
          "relative z-10 flex touch-pan-y items-center gap-3 rounded-2xl bg-card px-3.5 py-3 text-card-foreground outline-none select-none will-change-transform",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          hasActions && "cursor-grab active:cursor-grabbing",
          item.disabled && "opacity-60"
        )}
      >
        {renderItem ? (
          renderItem(item)
        ) : (
          <>
            {item.leading && <div className="flex shrink-0">{item.leading}</div>}
            <div className="min-w-0 flex-1">
              <div className="truncate text-ui font-medium">{item.title}</div>
              {item.description && <div className="truncate text-ui-sm text-muted-foreground">{item.description}</div>}
            </div>
            {item.meta && <div className="shrink-0 self-start text-ui-sm text-muted-foreground tabular-nums">{item.meta}</div>}
          </>
        )}
      </motion.div>
    </div>
  )
}

/**
 * Mobile-style list: swipe a row to reveal actions on either edge, swipe all the way to
 * commit the edge action. Keyboard: focus a row, ←/→ reveal its actions, Tab into them,
 * Escape closes.
 */
function SwipeableList({
  items,
  open: openProp,
  defaultOpen = null,
  onOpenChange,
  onAction,
  actionWidth = 76,
  fullSwipe = 0.55,
  "aria-label": ariaLabel,
  className,
  renderItem,
}: SwipeableListProps) {
  const reduceMotion = useReducedMotion()
  const listRef = React.useRef<HTMLDivElement>(null)
  const [uncontrolled, setUncontrolled] = React.useState<SwipeableListOpen>(defaultOpen)
  const open = openProp !== undefined ? openProp : uncontrolled

  const setOpen = React.useCallback(
    (next: SwipeableListOpen) => {
      if (openProp === undefined) setUncontrolled(next)
      onOpenChange?.(next)
    },
    [onOpenChange, openProp]
  )

  // Tapping anywhere outside the list closes the open row.
  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!listRef.current?.contains(event.target as Node)) setOpen(null)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open, setOpen])

  return (
    <div ref={listRef} role="list" aria-label={ariaLabel} data-slot="swipeable-list" className={cn("flex flex-col gap-2", className)}>
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout={!reduceMotion}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, marginTop: -8 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            className="overflow-visible"
          >
            <SwipeRow
              item={item}
              openSide={open?.id === item.id ? open.side : null}
              onOpen={(side) => setOpen(side ? { id: item.id, side } : open?.id === item.id ? null : open)}
              onCommit={(action, side) => {
                if (open?.id === item.id) setOpen(null)
                action.onAction?.(item)
                onAction?.({ item, action, side })
              }}
              actionWidth={actionWidth}
              fullSwipe={fullSwipe}
              renderItem={renderItem}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export { SwipeableList }
export type { SwipeableListItem, SwipeableListOpen, SwipeableListProps, SwipeAction, SwipeSide, SwipeTone }
