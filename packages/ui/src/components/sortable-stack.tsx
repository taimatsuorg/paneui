"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { Reorder, useDragControls, useReducedMotion, type DragControls } from "motion/react"

import { GripVerticalIcon, UndoIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"

type Move = -1 | 1 | "first" | "last"

type StackContextValue = {
  ids: string[]
  labelOf: (id: string) => string
  disabled: boolean
  instructionsId: string
  canUndo: boolean
  reorder: (ids: string[]) => void
  move: (id: string, by: Move) => void
  undo: () => void
  dragStart: () => void
  dragEnd: (id: string) => void
}
const StackContext = React.createContext<StackContextValue | null>(null)
const ItemContext = React.createContext<{ id: string; controls: DragControls; dragging: boolean } | null>(null)

function useStack(part: string) {
  const ctx = React.useContext(StackContext)
  if (!ctx) throw new Error(`${part} must be used inside <SortableStack>.`)
  return ctx
}

/** Order + actions, for custom controls (e.g. a "move to top" menu item). */
function useSortableStack() {
  const { ids, disabled, canUndo, move, undo } = useStack("useSortableStack")
  return { ids, disabled, canUndo, moveItem: move, undo }
}

type SortableStackProps<T extends { id: string }> = {
  items?: T[]
  defaultItems?: T[]
  onItemsChange?: (items: T[]) => void
  /** Readable name per row, used in screen-reader announcements. */
  getItemLabel: (item: T) => string
  /** Rows in their current order. Compose SortableStackItem / Handle / Content inside. */
  children: (items: T[]) => React.ReactNode
  /** Accessible name of the list. */
  label?: string
  disabled?: boolean
  /** Render the Undo pill under the list. Default true. */
  showUndo?: boolean
  /** Extra content under the list, inside the stack's context (custom Undo, counters…). */
  footer?: React.ReactNode
  className?: string
}

/**
 * Drag-to-reorder stack (motion `Reorder`). Rows move only from their handle, so
 * the content stays clickable and the page still scrolls on touch. Keyboard: focus
 * a handle, Up/Down to move, Home/End to send to an edge. The last move can be undone.
 */
function SortableStack<T extends { id: string }>({
  items: itemsProp,
  defaultItems = [],
  onItemsChange,
  getItemLabel,
  children,
  label,
  disabled = false,
  showUndo = true,
  footer,
  className,
}: SortableStackProps<T>) {
  const l10n = useLocale().labels
  if (label === undefined) label = l10n.sortableList

  const [internal, setInternal] = React.useState(defaultItems)
  const items = itemsProp ?? internal
  const live = React.useRef(items)
  live.current = items
  const ids = items.map((i) => i.id)

  const [previous, setPrevious] = React.useState<string[] | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const before = React.useRef<string[] | null>(null)
  const pendingFocus = React.useRef<string | null>(null)
  const root = React.useRef<HTMLDivElement>(null)
  const instructionsId = React.useId()

  React.useLayoutEffect(() => {
    if (!pendingFocus.current) return
    const handle = root.current?.querySelector<HTMLElement>(`[data-sortable-handle="${CSS.escape(pendingFocus.current)}"]`)
    pendingFocus.current = null
    handle?.focus({ preventScroll: true })
  })

  const publish = (next: T[]) => {
    live.current = next
    if (itemsProp === undefined) setInternal(next)
    onItemsChange?.(next)
  }
  const reorder = (nextIds: string[]) => {
    if (disabled) return
    const byId = new Map(live.current.map((i) => [i.id, i]))
    const next = nextIds.map((id) => byId.get(id)).filter((i): i is T => !!i)
    if (next.length === live.current.length) publish(next)
  }
  const announce = (id: string) => {
    const idx = live.current.findIndex((i) => i.id === id)
    const item = live.current[idx]
    if (item) setAnnouncement(l10n.itemPosition(getItemLabel(item), idx + 1, live.current.length))
  }
  const move = (id: string, by: Move) => {
    const cur = live.current
    const from = cur.findIndex((i) => i.id === id)
    const to = by === "first" ? 0 : by === "last" ? cur.length - 1 : from + by
    if (disabled || from < 0 || to < 0 || to >= cur.length || to === from) return
    const next = [...cur]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setPrevious(cur.map((i) => i.id))
    pendingFocus.current = id
    publish(next)
    announce(id)
  }

  // Undo is only valid while the same set of rows is present and the order differs.
  const canUndo =
    !!previous &&
    previous.length === ids.length &&
    previous.every((id) => ids.includes(id)) &&
    previous.some((id, i) => id !== ids[i])
  const undo = () => {
    if (!canUndo || !previous || disabled) return
    pendingFocus.current = previous.find((id, i) => id !== ids[i]) ?? null
    reorder(previous)
    setPrevious(null)
    setAnnouncement(l10n.previousOrderRestored)
  }

  const labels = new Map(items.map((i) => [i.id, getItemLabel(i)]))
  const ctx: StackContextValue = {
    ids,
    labelOf: (id) => labels.get(id) ?? id,
    disabled,
    instructionsId,
    canUndo,
    reorder,
    move,
    undo,
    dragStart: () => {
      before.current = live.current.map((i) => i.id)
    },
    dragEnd: (id) => {
      const start = before.current
      before.current = null
      if (start && start.some((sid, i) => sid !== live.current[i]?.id)) {
        setPrevious(start)
        announce(id)
      }
    },
  }

  return (
    <StackContext.Provider value={ctx}>
      <div ref={root} data-slot="sortable-stack" className={cn("flex w-full flex-col gap-2", className)}>
        <p id={instructionsId} className="sr-only">
          {l10n.sortableInstructions}
        </p>
        <Reorder.Group
          axis="y"
          values={ids}
          onReorder={reorder}
          aria-label={label}
          data-slot="sortable-stack-list"
          className="relative flex flex-col gap-2"
        >
          {children(items)}
        </Reorder.Group>
        {showUndo ? <SortableStackUndo /> : null}
        {footer}
        <p aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </p>
      </div>
    </StackContext.Provider>
  )
}

/** One row. Pass the item's id; place a SortableStackHandle inside. */
function SortableStackItem({
  id,
  className,
  children,
  style,
}: {
  id: string
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
}) {
  const { dragStart, dragEnd, disabled } = useStack("SortableStackItem")
  const controls = useDragControls()
  const reduce = useReducedMotion()
  const [dragging, setDragging] = React.useState(false)

  return (
    <ItemContext.Provider value={{ id, controls, dragging }}>
      <Reorder.Item
        value={id}
        dragListener={false}
        dragControls={controls}
        drag={disabled ? false : "y"}
        data-slot="sortable-stack-item"
        data-dragging={dragging || undefined}
        onDragStart={() => {
          setDragging(true)
          dragStart()
        }}
        onDragEnd={() => {
          setDragging(false)
          dragEnd(id)
        }}
        layout={reduce ? "position" : true}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36, mass: 0.6 }}
        whileDrag={reduce ? undefined : { scale: 1.025 }}
        style={{ position: "relative", ...style }}
        className={cn(
          "flex items-center gap-2 rounded-2xl bg-card py-2 pr-3 pl-1.5 text-ui text-card-foreground shadow-raised transition-shadow duration-200 select-none",
          "data-dragging:z-10 data-dragging:shadow-surface",
          className
        )}
      >
        {children}
      </Reorder.Item>
    </ItemContext.Provider>
  )
}

/** Grip button that starts the drag and owns keyboard reordering. */
function SortableStackHandle({ className, onPointerDown, onKeyDown, children, ...props }: React.ComponentProps<"button">) {
  const l10n = useLocale().labels
  const item = React.useContext(ItemContext)
  const { ids, labelOf, move, disabled, instructionsId } = useStack("SortableStackHandle")
  if (!item) throw new Error("SortableStackHandle must be used inside <SortableStackItem>.")
  const index = ids.indexOf(item.id)

  return (
    <button
      type="button"
      data-slot="sortable-stack-handle"
      data-sortable-handle={item.id}
      aria-describedby={instructionsId}
      disabled={disabled}
      onPointerDown={(e) => {
        onPointerDown?.(e)
        if (e.defaultPrevented || disabled) return
        e.preventDefault() // keep text from being selected mid-drag
        item.controls.start(e)
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (e.defaultPrevented) return
        const by: Record<string, Move> = { ArrowUp: -1, ArrowDown: 1, Home: "first", End: "last" }
        const m = by[e.key]
        if (m === undefined) return
        e.preventDefault()
        move(item.id, m)
      }}
      className={cn(
        "inline-flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40",
        item.dragging && "cursor-grabbing bg-muted text-foreground",
        className
      )}
      {...props}
      aria-label={props["aria-label"] ?? l10n.reorderItem(labelOf(item.id), index + 1, ids.length)}
    >
      {children ?? <GripVerticalIcon size={16} />}
    </button>
  )
}

function SortableStackContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sortable-stack-content" className={cn("flex min-w-0 flex-1 items-center gap-3", className)} {...props} />
}

/** Restores the order from before the last move. Hidden until there is something to undo. */
function SortableStackUndo({ className, children, onClick, ...props }: React.ComponentProps<"button">) {
  const l10n = useLocale().labels

  const { canUndo, undo, disabled } = useStack("SortableStackUndo")
  return (
    <button
      type="button"
      data-slot="sortable-stack-undo"
      data-visible={canUndo || undefined}
      disabled={!canUndo || disabled}
      aria-hidden={!canUndo || undefined}
      tabIndex={canUndo ? undefined : -1}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) undo()
      }}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-1.5 self-start rounded-lg bg-card px-2.5 text-ui-sm font-medium text-secondary-foreground shadow-raised transition-[box-shadow,background-color,scale] duration-150 ease-out outline-none hover:bg-accent hover:shadow-raised-hover focus-visible:ring-2 focus-visible:ring-ring",
        "pointer-events-none translate-y-1 scale-95 opacity-0 transition-[opacity,translate,scale,box-shadow] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-visible:pointer-events-auto data-visible:translate-y-0 data-visible:scale-100 data-visible:opacity-100 motion-reduce:transition-opacity",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <UndoIcon className="rtl:-scale-x-100" size={14} />
          {l10n.undo}
        </>
      )}
    </button>
  )
}

export {
  SortableStack,
  SortableStackItem,
  SortableStackHandle,
  SortableStackContent,
  SortableStackUndo,
  useSortableStack,
}
export type { SortableStackProps }
