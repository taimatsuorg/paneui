"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react"

import { ArrowUpRightIcon, BellIcon, ChevronDownIcon, XIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { IconChip } from "@paneui/ui/components/icon-chip"

export type NotificationTone = "default" | "primary" | "success" | "warning" | "destructive"

export type NotificationStackItem = {
  id: string
  title: React.ReactNode
  description?: React.ReactNode
  /** Short trailing meta, e.g. "2m". */
  time?: React.ReactNode
  icon?: React.ReactNode
  tone?: NotificationTone
}

export type NotificationStackProps = {
  items: NotificationStackItem[]
  /** Controlled expanded state. Leave undefined to expand on hover, focus or tap. */
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  /** Max cards shown in the open list; the rest roll up into a "+N more" row. */
  maxVisible?: number
  /** Shows a dismiss button on each card while expanded. */
  onDismiss?: (id: string) => void
  /** Shows a "View all" link while expanded and on the "+N more" row. */
  onViewAll?: () => void
  label?: string
  emptyLabel?: React.ReactNode
  className?: string
}

const SPRING: Transition = { type: "spring", stiffness: 380, damping: 34, mass: 0.7 }
const PEEK = 10
const GAP = 8
const STACK_DEPTH = 3
const FALLBACK_HEIGHT = 68

const chipTone = {
  default: "neutral",
  primary: "primary",
  success: "success",
  warning: "warning",
  destructive: "destructive",
} as const satisfies Record<NotificationTone, string>

/** Measures each card's natural content height so the stack can spring between layouts. */
function useHeights(ids: string[]) {
  const [heights, setHeights] = React.useState<Record<string, number>>({})
  const nodes = React.useRef(new Map<string, HTMLElement>())
  const observer = React.useRef<ResizeObserver | null>(null)

  const read = React.useCallback(() => {
    setHeights((prev) => {
      let changed = false
      const next: Record<string, number> = {}
      nodes.current.forEach((node, id) => {
        next[id] = node.offsetHeight
        if (prev[id] !== next[id]) changed = true
      })
      if (Object.keys(prev).length !== Object.keys(next).length) changed = true
      return changed ? next : prev
    })
  }, [])

  React.useLayoutEffect(() => {
    if (typeof ResizeObserver === "undefined") return
    observer.current = new ResizeObserver(read)
    nodes.current.forEach((node) => observer.current?.observe(node))
    read()
    return () => observer.current?.disconnect()
  }, [read])

  React.useLayoutEffect(read, [ids.join("|"), read])

  const register = React.useCallback(
    (id: string) => (node: HTMLElement | null) => {
      const prev = nodes.current.get(id)
      if (prev && prev !== node) observer.current?.unobserve(prev)
      if (node) {
        nodes.current.set(id, node)
        observer.current?.observe(node)
      } else {
        nodes.current.delete(id)
      }
    },
    []
  )

  return [heights, register] as const
}

export function NotificationStack({
  items,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  maxVisible = 4,
  onDismiss,
  onViewAll,
  label,
  emptyLabel,
  className,
}: NotificationStackProps) {
  const l10n = useLocale().labels

  if (label === undefined) label = l10n.notifications
  if (emptyLabel === undefined) emptyLabel = l10n.youreAllCaughtUp

  const reduce = useReducedMotion()
  const listId = React.useId()
  const [internal, setInternal] = React.useState(defaultExpanded)
  const expanded = expandedProp ?? internal
  const hovering = React.useRef(false)
  const focused = React.useRef(false)

  const setExpanded = React.useCallback(
    (next: boolean) => {
      if (expandedProp === undefined) setInternal(next)
      if (next !== expanded) onExpandedChange?.(next)
    },
    [expandedProp, expanded, onExpandedChange]
  )

  const visible = expanded ? items.slice(0, maxVisible) : items.slice(0, STACK_DEPTH)
  const overflow = items.length - Math.min(items.length, maxVisible)
  const [heights, register] = useHeights(items.slice(0, Math.max(maxVisible, STACK_DEPTH)).map((i) => i.id))
  const h = (id: string) => heights[id] ?? FALLBACK_HEIGHT

  const front = visible[0] ? h(visible[0].id) : 0
  const layout = visible.map((item, i) => {
    if (expanded) {
      const y = visible.slice(0, i).reduce((sum, prev) => sum + h(prev.id) + GAP, 0)
      return { y, scale: 1, height: h(item.id), contentOpacity: 1 }
    }
    return { y: i * PEEK, scale: 1 - i * 0.05, height: front, contentOpacity: i === 0 ? 1 : 0 }
  })
  const listHeight = expanded
    ? layout.reduce((sum, l) => sum + l.height, 0) + GAP * Math.max(0, visible.length - 1)
    : front + PEEK * Math.max(0, visible.length - 1)

  const transition = reduce ? { duration: 0 } : SPRING

  return (
    <section
      data-slot="notification-stack"
      data-expanded={expanded || undefined}
      aria-label={label}
      className={cn("w-full max-w-sm", className)}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return
        hovering.current = true
        setExpanded(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return
        hovering.current = false
        if (!focused.current) setExpanded(false)
      }}
      onFocus={() => {
        focused.current = true
        setExpanded(true)
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
        focused.current = false
        if (!hovering.current) setExpanded(false)
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && expanded) {
          e.stopPropagation()
          setExpanded(false)
        }
      }}
    >
      <div className="mb-2.5 flex h-8 items-center justify-between gap-2 px-1">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded(!expanded)}
          className="-ml-1 inline-flex h-8 items-center gap-2 rounded-lg px-2 text-ui font-medium transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BellIcon size={16} className="text-muted-foreground" />
          {label}
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-ui-xs font-semibold text-primary-foreground tabular-nums shadow-primary">
            {items.length}
          </span>
          <ChevronDownIcon
            size={14}
            className={cn(
              "text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              expanded && "rotate-180"
            )}
          />
        </button>
        <AnimatePresence initial={false}>
          {expanded && onViewAll && (
            <motion.button
              type="button"
              onClick={onViewAll}
              initial={{ opacity: 0, x: 6, filter: "blur(3px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 6, filter: "blur(3px)" }}
              transition={{ duration: 0.18 }}
              className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-ui-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {l10n.viewAll}
              <ArrowUpRightIcon className="rtl:-scale-x-100" size={13} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {items.length === 0 ? (
        <div className="flex h-16 items-center justify-center rounded-2xl bg-background dark:bg-input/32 text-ui text-muted-foreground shadow-well">
          {emptyLabel}
        </div>
      ) : (
        <motion.ol
          id={listId}
          initial={false}
          animate={{ height: listHeight }}
          transition={transition}
          onClick={(e) => {
            // Tapping the collapsed pile opens it (touch has no hover).
            if (!expanded && !(e.target as HTMLElement).closest("button")) setExpanded(true)
          }}
          className={cn("relative", !expanded && "cursor-pointer")}
        >
          <AnimatePresence initial={false}>
            {visible.map((item, i) => {
              const l = layout[i]
              const behind = !expanded && i > 0
              return (
                <motion.li
                  key={item.id}
                  data-slot="notification-stack-card"
                  aria-hidden={behind || undefined}
                  initial={{ opacity: 0, y: l.y + 8, scale: l.scale * 0.96, height: l.height }}
                  animate={{ opacity: 1, y: l.y, scale: l.scale, height: l.height }}
                  exit={{ opacity: 0, scale: l.scale * 0.94, transition: { duration: 0.16 } }}
                  transition={transition}
                  style={{ zIndex: visible.length - i, transformOrigin: "50% 100%" }}
                  className={cn(
                    "absolute inset-x-0 top-0 overflow-hidden rounded-2xl bg-card text-card-foreground shadow-raised",
                    behind && "bg-card"
                  )}
                >
                  <motion.div
                    ref={register(item.id)}
                    initial={false}
                    animate={{ opacity: l.contentOpacity }}
                    transition={{ duration: reduce ? 0 : 0.18 }}
                    className="flex items-start gap-3 p-3.5"
                  >
                    {item.icon && (
                      <IconChip tone={chipTone[item.tone ?? "default"]}>{item.icon}</IconChip>
                    )}
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-ui leading-snug font-medium">{item.title}</span>
                        {item.time && (
                          <span className="shrink-0 text-ui-sm text-muted-foreground tabular-nums">{item.time}</span>
                        )}
                      </span>
                      {item.description && (
                        <span className="line-clamp-2 text-ui-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </span>
                    {onDismiss && expanded && (
                      <button
                        type="button"
                        aria-label={l10n.dismissNotification}
                        onClick={() => onDismiss(item.id)}
                        className="-mt-0.5 -mr-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <XIcon size={13} />
                      </button>
                    )}
                  </motion.div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </motion.ol>
      )}

      <AnimatePresence initial={false}>
        {expanded && overflow > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={transition}
            className="overflow-hidden"
          >
            <button
              type="button"
              onClick={onViewAll}
              disabled={!onViewAll}
              className="mt-2 flex h-8 w-full items-center justify-center rounded-lg text-ui-sm font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
            >
              +{overflow} more
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
