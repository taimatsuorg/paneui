"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useReducedMotion } from "motion/react"

import { ChevronUpIcon, ChevronsUpDownIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Checkbox } from "@paneui/ui/components/checkbox"
import { Loader } from "@paneui/ui/components/loader"
import { ScrollArea } from "@paneui/ui/components/scroll-area"

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type SortDirection = "asc" | "desc"
type SortState = { key: string; direction: SortDirection } | null

interface TableColumn<T> {
  /** Stable key. Also the property read from the row when there is no `accessor`. */
  key: string
  header: React.ReactNode
  /** Width in px (default 160). */
  width?: number
  /** Floor for resizing, in px. Falls back to the table's `minColumnWidth`. */
  minWidth?: number
  /** Soak up leftover width when the table is wider than its columns (until resized). */
  grow?: boolean
  align?: "left" | "center" | "right"
  sortable?: boolean
  /** Opt this column out of resizing when the table is `resizable`. */
  resizable?: boolean
  /** Raw value for the cell, sorting and default rendering. Defaults to `row[key]`. */
  accessor?: (row: T) => unknown
  /** Value used for sorting when it differs from the accessor. */
  sortValue?: (row: T) => string | number | null | undefined
  /** Custom cell content. */
  cell?: (row: T, ctx: TableCellContext<T>) => React.ReactNode
  className?: string
  headerClassName?: string
}

interface TableRowContext<T> {
  row: T
  rowId: string
  /** Position in the rendered (sorted) order. */
  rowIndex: number
  /** Position in the `data` array. */
  dataIndex: number
  selected: boolean
}

interface TableCellContext<T> extends TableRowContext<T> {
  column: TableColumn<T>
  colIndex: number
  value: unknown
}

interface TableHeaderContext<T> {
  column: TableColumn<T>
  colIndex: number
  sort: SortDirection | null
  /** Spread onto your own label element to keep sort-on-click and drag-to-reorder. */
  labelProps: TableHeaderLabelProps
}

type TableHeaderLabelProps = Pick<
  React.HTMLAttributes<HTMLElement>,
  "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel" | "onKeyDown" | "onClick"
> & { "data-dragging"?: boolean; "data-reorderable"?: boolean }

interface TableHandle {
  scrollToIndex: (index: number, options?: { align?: "start" | "center" | "end" | "auto"; behavior?: "auto" | "smooth" }) => void
  scrollToTop: (behavior?: ScrollBehavior) => void
  /** The scroll viewport. */
  element: () => HTMLDivElement | null
}

interface TableProps<T> {
  data: readonly T[]
  columns: readonly TableColumn<T>[]
  /** Stable id per row; keeps selection and animation correct across sorts. Defaults to the index. */
  getRowId?: (row: T, index: number) => string
  "aria-label"?: string
  /** "grid" for interactive cells (spreadsheet-style), "table" otherwise. */
  role?: "table" | "grid"

  selectable?: boolean
  selectedRowIds?: readonly string[]
  defaultSelectedRowIds?: readonly string[]
  onSelectionChange?: (ids: string[]) => void

  sort?: SortState
  defaultSort?: SortState
  onSortChange?: (sort: SortState) => void

  resizable?: boolean
  minColumnWidth?: number
  onColumnResize?: (key: string, width: number) => void

  reorderable?: boolean
  columnOrder?: readonly string[]
  defaultColumnOrder?: readonly string[]
  onColumnOrderChange?: (keys: string[]) => void

  rowHeight?: number
  headerHeight?: number
  /** Viewport height in px. */
  height?: number
  overscan?: number

  /** Fetching: skeleton rows when there is no data yet, a loading footer otherwise; pauses `onEndReached`. */
  loading?: boolean
  skeletonRows?: number
  onEndReached?: () => void
  /** How many rows from the end `onEndReached` fires. */
  endReachedThreshold?: number
  /** A band under the last row (load more, add row, end of list). */
  footer?: React.ReactNode
  emptyState?: React.ReactNode

  /** Wrap or replace any cell; `content` is what the table would have rendered. */
  renderCell?: (ctx: TableCellContext<T> & { content: React.ReactNode }) => React.ReactNode
  /** Replace a header label; spread `labelProps` onto your element. */
  renderHeader?: (ctx: TableHeaderContext<T>) => React.ReactNode
  /** Extra content inside a header cell, e.g. a column menu. */
  headerAccessory?: (ctx: TableHeaderContext<T>) => React.ReactNode
  /** Leading lane before the checkbox, e.g. row handles. */
  gutter?: { width: number; header?: React.ReactNode; cell: (ctx: TableRowContext<T>) => React.ReactNode }
  onRowClick?: (ctx: TableRowContext<T>, event: React.MouseEvent<HTMLDivElement>) => void
  rowClassName?: (ctx: TableRowContext<T>) => string | undefined
  /** Slide rows and columns into new positions on insert, delete, sort and reorder. */
  animateLayout?: boolean
  /** `sheet`: a header band with the rows on a sheet laid over it, and column lines. `plain`: row lines only. */
  variant?: "sheet" | "plain"
  className?: string
  ref?: React.Ref<TableHandle>
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const EASE = "cubic-bezier(0.22,1,0.36,1)"
const MOVE = "transition-[transform,width,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
const SELECT_WIDTH = 44
const DEFAULT_COLUMN_WIDTH = 160
const DRAG_THRESHOLD = 4

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })

function readValue<T>(row: T, column: TableColumn<T>): unknown {
  if (column.accessor) return column.accessor(row)
  return (row as Record<string, unknown>)[column.key]
}

function formatValue(value: unknown): React.ReactNode {
  if (value == null) return ""
  // Locale-free defaults so server and client render the same text; format in `cell` for anything nicer.
  if (typeof value === "number") return String(value)
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === "string" || React.isValidElement(value)) return value
  return String(value)
}

function compareValues(a: unknown, b: unknown) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === "number" && typeof b === "number") return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  return collator.compare(String(a), String(b))
}

function alignClass(align: TableColumn<unknown>["align"]) {
  return align === "right" ? "justify-end text-end" : align === "center" ? "justify-center text-center" : "justify-start text-start"
}

function moveItem<V>(list: readonly V[], from: number, to: number) {
  const next = list.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/** Controlled-or-uncontrolled state; `undefined` means uncontrolled. */
function useControllableState<V>(value: V | undefined, defaultValue: V, onChange?: (next: V) => void) {
  const [inner, setInner] = React.useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? (value as V) : inner
  const currentRef = React.useRef(current)
  currentRef.current = current
  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange
  const set = React.useCallback(
    (next: V | ((prev: V) => V)) => {
      const resolved = typeof next === "function" ? (next as (prev: V) => V)(currentRef.current) : next
      currentRef.current = resolved
      if (!controlled) setInner(resolved)
      onChangeRef.current?.(resolved)
    },
    [controlled]
  )
  return [current, set] as const
}

/** Keeps a user's column order while columns are added or removed: newcomers land after their predecessor. */
function reconcileOrder(order: readonly string[] | null, keys: readonly string[]) {
  if (!order) return keys.slice()
  const present = new Set(keys)
  const result = order.filter((k) => present.has(k))
  const placed = new Set(result)
  keys.forEach((key, i) => {
    if (placed.has(key)) return
    const prev = keys.slice(0, i).reverse().find((k) => placed.has(k))
    result.splice(prev ? result.indexOf(prev) + 1 : 0, 0, key)
    placed.add(key)
  })
  return result
}

/** Deterministic bar width for skeleton cells, so server and client agree. */
function skeletonWidth(row: number, col: number) {
  return 38 + ((row * 37 + col * 53) % 47)
}

/* -------------------------------------------------------------------------- */
/*                                  Pieces                                    */
/* -------------------------------------------------------------------------- */

const headerLabelBase =
  "group/label flex h-full min-w-0 flex-1 items-center gap-1.5 rounded-lg px-3 font-medium outline-none select-none focus-visible:ring-2 focus-visible:ring-ring data-[reorderable=true]:cursor-grab data-[dragging=true]:cursor-grabbing"
/** Header label for the `sheet` table: sentence case at body size. */
const headerLabelClass = cn(headerLabelBase, "text-ui text-foreground")
/** Header label for the `plain` table: small caps-style label. */
const plainHeaderLabelClass = cn(headerLabelBase, "text-ui-sm tracking-wide text-muted-foreground uppercase")

/*
 * The sheet's top edge, hung under the sticky header so rows scroll beneath it. Its middle is
 * clear (the first row shows through); only the two corner pieces outside the curve are painted,
 * in the band's colour (the page colour under a light muted fill: half in light mode, full in dark), so rows passing under them are hidden.
 */
const sheetCornerMask = {
  left: "[mask-image:radial-gradient(circle_at_100%_100%,transparent_calc(var(--radius-xl)-0.5px),#000_var(--radius-xl))]",
  right: "[mask-image:radial-gradient(circle_at_0%_100%,transparent_calc(var(--radius-xl)-0.5px),#000_var(--radius-xl))]",
} as const

function TableSheetEdge() {
  return (
    <div aria-hidden data-slot="table-sheet-edge" className="pointer-events-none absolute inset-x-0 top-full h-(--radius-xl)">
      {(["left", "right"] as const).map((side) => (
        <span
          key={side}
          className={cn("absolute top-0 size-(--radius-xl) bg-background", side === "left" ? "left-0" : "right-0", sheetCornerMask[side])}
        >
          <span className="absolute inset-0 bg-muted/50 dark:bg-muted" />
        </span>
      ))}
      <span className="absolute inset-0 rounded-t-xl border-t border-border" />
    </div>
  )
}

function SortIndicator({ direction }: { direction: SortDirection | null }) {
  if (!direction) {
    return (
      <ChevronsUpDownIcon
        aria-hidden
        className="size-3.5 shrink-0 opacity-0 transition-opacity duration-150 group-hover/label:opacity-60 group-focus-visible/label:opacity-60"
      />
    )
  }
  return (
    <ChevronUpIcon
      aria-hidden
      className={cn(
        "size-3.5 shrink-0 text-foreground transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
        direction === "desc" && "rotate-180"
      )}
    />
  )
}

/** A placeholder row of shimmering bars. */
function TableSkeletonRow({
  index,
  cells,
  height,
  className,
}: {
  index: number
  /** Cell widths in px, in display order. */
  cells: readonly number[]
  height: number
  className?: string
}) {
  return (
    <div
      aria-hidden
      data-slot="table-skeleton-row"
      className={cn("flex items-center border-b border-border/60", className)}
      style={{ height }}
    >
      {cells.map((width, c) => (
        <div key={c} className="shrink-0 px-3" style={{ width }}>
          <div
            className="h-2.5 animate-pulse rounded-full bg-muted motion-reduce:animate-none"
            style={{ width: `${skeletonWidth(index, c)}%`, animationDelay: `${(index % 6) * 90}ms` }}
          />
        </div>
      ))}
    </div>
  )
}

/** Default band shown under the rows while the next page loads. */
function TableLoadingFooter({ label }: { label?: React.ReactNode }) {
  const l10n = useLocale().labels
  if (label === undefined) label = l10n.loadingMore

  return (
    <div role="status" className="flex h-full items-center justify-center gap-2.5 text-ui text-muted-foreground">
      <Loader size="sm" label={l10n.loadingMoreRows} />
      {label}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Table                                   */
/* -------------------------------------------------------------------------- */

/**
 * Virtualized data table: 10k+ rows render only what is on screen. Headers sort
 * on click (asc → desc → off), drag to reorder (Alt+←/→ from the keyboard) and
 * resize from their right edge; an optional checkbox lane selects rows, with
 * shift-click for ranges. Rows and columns glide to new positions when the
 * data or layout changes. This is also the core that EditableTable and
 * AsyncTable build on.
 */
function Table<T>({
  data,
  columns,
  getRowId,
  "aria-label": ariaLabel,
  role = "table",
  selectable = false,
  selectedRowIds,
  defaultSelectedRowIds,
  onSelectionChange,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  resizable = false,
  minColumnWidth = 72,
  onColumnResize,
  reorderable = false,
  columnOrder,
  defaultColumnOrder,
  onColumnOrderChange,
  rowHeight = 44,
  headerHeight = 40,
  height = 440,
  overscan = 8,
  loading = false,
  skeletonRows,
  onEndReached,
  endReachedThreshold = 8,
  footer,
  emptyState,
  renderCell,
  renderHeader,
  headerAccessory,
  gutter,
  onRowClick,
  rowClassName,
  animateLayout = true,
  variant = "sheet",
  className,
  ref,
}: TableProps<T>) {
  const l10n = useLocale().labels

  if (emptyState === undefined) emptyState = l10n.noRows

  const reduce = useReducedMotion()
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const headerRef = React.useRef<HTMLDivElement>(null)
  const animate = animateLayout && !reduce

  /* rows ------------------------------------------------------------------- */
  const getRowIdRef = React.useRef(getRowId)
  getRowIdRef.current = getRowId
  const rows = React.useMemo(
    () =>
      data.map((row, dataIndex) => ({
        row,
        dataIndex,
        id: getRowIdRef.current ? getRowIdRef.current(row, dataIndex) : String(dataIndex),
      })),
    [data]
  )

  /* columns: order + widths ------------------------------------------------ */
  const columnKeys = columns.map((c) => c.key)
  const columnKeysSig = columnKeys.join("\u0000")
  const [orderState, setOrderState] = useControllableState<readonly string[] | null>(
    columnOrder,
    defaultColumnOrder ?? null,
    onColumnOrderChange ? (keys) => keys && onColumnOrderChange(keys.slice()) : undefined
  )
  const baseOrder = React.useMemo(
    () => reconcileOrder(orderState, columnKeys),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderState, columnKeysSig]
  )
  const columnByKey = React.useMemo(() => new Map(columns.map((c) => [c.key, c])), [columns])

  const [widthOverrides, setWidthOverrides] = React.useState<Record<string, number>>({})
  const [viewportWidth, setViewportWidth] = React.useState(0)
  React.useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => setViewportWidth(el.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const leadWidth = (gutter?.width ?? 0) + (selectable ? SELECT_WIDTH : 0)
  const widths = React.useMemo(() => {
    const result: Record<string, number> = {}
    let sum = 0
    const growers: string[] = []
    for (const key of baseOrder) {
      const column = columnByKey.get(key)
      if (!column) continue
      const override = widthOverrides[key]
      const width = override ?? column.width ?? DEFAULT_COLUMN_WIDTH
      result[key] = width
      sum += width
      if (column.grow && override == null) growers.push(key)
    }
    const spare = viewportWidth - leadWidth - sum
    if (spare > 0 && growers.length) {
      const share = spare / growers.length
      growers.forEach((key) => (result[key] += share))
    }
    return result
  }, [baseOrder, columnByKey, widthOverrides, viewportWidth, leadWidth])

  /* drag-to-reorder -------------------------------------------------------- */
  type Drag = { key: string; startX: number; dx: number; active: boolean; target: number; origin: number }
  const [drag, setDrag] = React.useState<Drag | null>(null)
  const dragRef = React.useRef<Drag | null>(null)
  const suppressClick = React.useRef(false)

  const layout = React.useCallback(
    (order: readonly string[]) => {
      const x: Record<string, number> = {}
      let cursor = leadWidth
      for (const key of order) {
        x[key] = cursor
        cursor += widths[key] ?? 0
      }
      return { x, end: cursor }
    },
    [widths, leadWidth]
  )
  const baseLayout = React.useMemo(() => layout(baseOrder), [layout, baseOrder])

  const displayOrder = React.useMemo(() => {
    if (!drag?.active) return baseOrder
    const others = baseOrder.filter((k) => k !== drag.key)
    others.splice(drag.target, 0, drag.key)
    return others
  }, [baseOrder, drag])
  const displayLayout = React.useMemo(() => layout(displayOrder), [layout, displayOrder])
  const contentWidth = displayLayout.end

  const columnX = (key: string) => {
    if (drag?.active && drag.key === key) {
      const w = widths[key] ?? 0
      return Math.min(Math.max(drag.origin + drag.dx, leadWidth), Math.max(leadWidth, contentWidth - w))
    }
    return displayLayout.x[key] ?? 0
  }

  const commitOrder = React.useCallback(
    (next: string[]) => {
      if (next.join("\u0000") !== baseOrder.join("\u0000")) setOrderState(next)
    },
    [baseOrder, setOrderState]
  )

  const dropTarget = (key: string, left: number) => {
    const w = widths[key] ?? 0
    const center = left + w / 2
    let cursor = leadWidth
    let target = 0
    for (const other of baseOrder) {
      if (other === key) continue
      const ow = widths[other] ?? 0
      if (cursor + ow / 2 < center) target++
      cursor += ow
    }
    return target
  }

  /* resize ----------------------------------------------------------------- */
  const [resizingKey, setResizingKey] = React.useState<string | null>(null)
  const resizeRef = React.useRef<{ key: string; startX: number; startWidth: number } | null>(null)
  const minFor = (column: TableColumn<T>) => column.minWidth ?? minColumnWidth
  const setWidth = (key: string, width: number) => setWidthOverrides((prev) => ({ ...prev, [key]: Math.round(width) }))

  /* sort ------------------------------------------------------------------- */
  const [sort, setSort] = useControllableState<SortState>(sortProp, defaultSort, onSortChange)
  const columnByKeyRef = React.useRef(columnByKey)
  columnByKeyRef.current = columnByKey
  const sortedRows = React.useMemo(() => {
    if (!sort) return rows
    const column = columnByKeyRef.current.get(sort.key)
    if (!column) return rows
    const read = column.sortValue ?? ((row: T) => readValue(row, column))
    const keyed = rows.map((entry) => ({ entry, value: read(entry.row) }))
    const dir = sort.direction === "asc" ? 1 : -1
    keyed.sort((a, b) => {
      // Empty values always sink, whichever way the column sorts.
      if (a.value == null || b.value == null) return compareValues(a.value, b.value)
      return compareValues(a.value, b.value) * dir || a.entry.dataIndex - b.entry.dataIndex
    })
    return keyed.map((k) => k.entry)
  }, [rows, sort])

  const toggleSort = (key: string) =>
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" }
      if (prev.direction === "asc") return { key, direction: "desc" }
      return null
    })

  /* selection -------------------------------------------------------------- */
  const [selectedList, setSelectedList] = useControllableState<readonly string[]>(
    selectedRowIds,
    defaultSelectedRowIds ?? [],
    onSelectionChange ? (ids) => onSelectionChange(ids.slice()) : undefined
  )
  const selected = React.useMemo(() => new Set(selectedList), [selectedList])
  const { allSelected, someSelected } = React.useMemo(() => {
    if (!selected.size || !rows.length) return { allSelected: false, someSelected: false }
    let count = 0
    for (const r of rows) if (selected.has(r.id)) count++
    return { allSelected: count === rows.length, someSelected: count > 0 }
  }, [rows, selected])
  const anchorRef = React.useRef<number | null>(null)

  const toggleRow = (index: number, checked: boolean, shift: boolean) => {
    const anchor = anchorRef.current
    const next = new Set(selected)
    if (shift && anchor != null) {
      const [from, to] = anchor < index ? [anchor, index] : [index, anchor]
      for (let i = from; i <= to; i++) {
        const id = sortedRows[i]?.id
        if (id == null) continue
        if (checked) next.add(id)
        else next.delete(id)
      }
    } else {
      const id = sortedRows[index].id
      if (checked) next.add(id)
      else next.delete(id)
    }
    anchorRef.current = index
    setSelectedList(Array.from(next))
  }
  const toggleAll = () => setSelectedList(allSelected ? [] : rows.map((r) => r.id))

  /* virtualizer ------------------------------------------------------------ */
  const getItemKey = React.useCallback((index: number) => sortedRows[index]?.id ?? index, [sortedRows])
  const virtualizer = useVirtualizer({
    count: sortedRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    getItemKey,
    overscan,
    scrollMargin: headerHeight,
    scrollPaddingStart: headerHeight,
    initialRect: { width: 0, height },
    useFlushSync: false,
  })
  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  React.useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index, options) => virtualizer.scrollToIndex(index, { align: "auto", ...options }),
      scrollToTop: (behavior = "smooth") => scrollRef.current?.scrollTo({ top: 0, behavior }),
      element: () => scrollRef.current,
    }),
    [virtualizer]
  )

  /* infinite scroll -------------------------------------------------------- */
  const lastIndex = virtualItems.length ? virtualItems[virtualItems.length - 1].index : -1
  const firedForCount = React.useRef(-1)
  const onEndReachedRef = React.useRef(onEndReached)
  onEndReachedRef.current = onEndReached
  const count = sortedRows.length
  React.useEffect(() => {
    if (!onEndReachedRef.current || loading || count === 0) return
    if (lastIndex >= count - 1 - endReachedThreshold && firedForCount.current !== count) {
      firedForCount.current = count
      onEndReachedRef.current()
    }
  }, [lastIndex, count, loading, endReachedThreshold])
  React.useEffect(() => {
    // A fresh (shorter) dataset, e.g. after a reload, re-arms the trigger.
    if (count < firedForCount.current) firedForCount.current = -1
  }, [count])

  /* enter animations for new rows / columns -------------------------------- */
  const prevRowIds = React.useRef<Set<string> | null>(null)
  React.useLayoutEffect(() => {
    const ids = new Set(rows.map((r) => r.id))
    const prev = prevRowIds.current
    prevRowIds.current = ids
    if (!prev || !animate || !bodyRef.current) return
    bodyRef.current.querySelectorAll<HTMLElement>("[data-row-id]").forEach((el) => {
      if (!prev.has(el.dataset.rowId ?? "")) {
        el.animate([{ opacity: 0, translate: "0 -6px" }, { opacity: 1, translate: "0 0" }], { duration: 360, easing: EASE })
      }
    })
  }, [rows, animate])

  const prevColumnKeys = React.useRef<Set<string> | null>(null)
  React.useLayoutEffect(() => {
    const keys = new Set(columnKeysSig.split("\u0000"))
    const prev = prevColumnKeys.current
    prevColumnKeys.current = keys
    if (!prev || !animate || !scrollRef.current) return
    scrollRef.current.querySelectorAll<HTMLElement>("[data-col-key]").forEach((el) => {
      if (!prev.has(el.dataset.colKey ?? "")) {
        el.animate([{ opacity: 0, scale: "0.96 1" }, { opacity: 1, scale: "1 1" }], { duration: 360, easing: EASE })
      }
    })
  }, [columnKeysSig, animate])

  /* render ----------------------------------------------------------------- */
  const orderedColumns = displayOrder.map((key) => columnByKey.get(key)).filter(Boolean) as TableColumn<T>[]
  const sheet = variant === "sheet"
  const labelClass = sheet ? headerLabelClass : plainHeaderLabelClass
  const lastKey = orderedColumns[orderedColumns.length - 1]?.key
  // Column lines: every column but the last, in the sheet look.
  const divided = (key: string) => sheet && key !== lastKey && "border-e border-border"
  const instant = !animate || resizingKey != null
  const cellMotion = (key: string) => (instant || (drag?.active && drag.key === key) ? "" : MOVE)
  const cellRole = role === "grid" ? "gridcell" : "cell"
  const leadCount = (gutter ? 1 : 0) + (selectable ? 1 : 0)
  const showSkeleton = loading && rows.length === 0
  const resolvedFooter = footer ?? (loading && rows.length > 0 ? <TableLoadingFooter /> : null)
  const footerHeight = resolvedFooter ? rowHeight : 0
  const bodyHeight = showSkeleton || rows.length === 0 ? Math.max(height - headerHeight, rowHeight) : totalSize + footerHeight
  const skeletonCount = skeletonRows ?? Math.max(1, Math.ceil((height - headerHeight) / rowHeight))

  const headerContext = (column: TableColumn<T>, colIndex: number): TableHeaderContext<T> => {
    const isDragging = drag?.active === true && drag.key === column.key
    const canReorder = reorderable
    const labelProps: TableHeaderLabelProps = {
      "data-dragging": isDragging,
      "data-reorderable": canReorder,
      onPointerDown: (e) => {
        if (!canReorder || e.button !== 0) return
        if ((e.target as HTMLElement).closest("input,textarea,select,[data-no-drag]")) return
        e.currentTarget.setPointerCapture(e.pointerId)
        dragRef.current = {
          key: column.key,
          startX: e.clientX,
          dx: 0,
          active: false,
          target: baseOrder.indexOf(column.key),
          origin: baseLayout.x[column.key] ?? 0,
        }
      },
      onPointerMove: (e) => {
        const d = dragRef.current
        if (!d || d.key !== column.key) return
        const dx = e.clientX - d.startX
        if (!d.active && Math.abs(dx) < DRAG_THRESHOLD) return
        const next = { ...d, dx, active: true, target: dropTarget(d.key, d.origin + dx) }
        dragRef.current = next
        setDrag(next)
      },
      onPointerUp: () => {
        const d = dragRef.current
        dragRef.current = null
        if (!d?.active) return
        suppressClick.current = true
        const next = baseOrder.filter((k) => k !== d.key)
        next.splice(d.target, 0, d.key)
        setDrag(null)
        commitOrder(next)
      },
      onPointerCancel: () => {
        dragRef.current = null
        setDrag(null)
      },
      onClick: () => {
        if (suppressClick.current) {
          suppressClick.current = false
          return
        }
        if (column.sortable) toggleSort(column.key)
      },
      onKeyDown: (e) => {
        if (!canReorder || !e.altKey || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return
        e.preventDefault()
        const from = baseOrder.indexOf(column.key)
        const to = Math.min(Math.max(from + (e.key === "ArrowLeft" ? -1 : 1), 0), baseOrder.length - 1)
        if (to !== from) commitOrder(moveItem(baseOrder, from, to))
      },
    }
    return { column, colIndex, sort: sort?.key === column.key ? sort.direction : null, labelProps }
  }

  return (
    <ScrollArea
      data-slot="table"
      orientation="both"
      viewportRef={scrollRef}
      // The vertical track runs below the sticky header.
      scrollbarMargin={{ top: headerHeight }}
      viewportProps={{
        role,
        "aria-label": ariaLabel,
        "aria-rowcount": rows.length + 1,
        "aria-colcount": columns.length + leadCount,
        "aria-multiselectable": role === "grid" && selectable ? true : undefined,
        "aria-busy": loading || undefined,
        tabIndex: role === "table" ? 0 : undefined,
      }}
      data-variant={variant}
      // The sheet's rows sit on the page colour (white in light mode in every style); the header band is that colour under a light muted fill.
      className={cn("w-full rounded-xl text-ui text-card-foreground shadow-raised", sheet ? "bg-background" : "bg-card", className)}
      style={{ height }}
    >
      <div className="relative min-w-full" style={{ width: contentWidth }}>
        {/* Header ---------------------------------------------------------- */}
        <div
          ref={headerRef}
          role="rowgroup"
          className={cn("sticky top-0 z-20", sheet ? "bg-background" : "bg-card shadow-[0_1px_0_var(--border)]")}
          style={{ height: headerHeight }}
        >
          {sheet ? (
            <>
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-muted/50 dark:bg-muted" />
              <TableSheetEdge />
            </>
          ) : null}
          <div role="row" aria-rowindex={1} className="relative h-full">
            {gutter ? (
              <div role="columnheader" className="absolute inset-y-0 left-0 flex items-center justify-center" style={{ width: gutter.width }}>
                {gutter.header}
              </div>
            ) : null}
            {selectable ? (
              <div
                role="columnheader"
                className="absolute inset-y-0 flex items-center justify-center"
                style={{ left: gutter?.width ?? 0, width: SELECT_WIDTH }}
              >
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onCheckedChange={toggleAll}
                  aria-label={allSelected ? l10n.deselectAllRows : l10n.selectAllRows}
                  disabled={rows.length === 0}
                />
              </div>
            ) : null}
            {orderedColumns.map((column, colIndex) => {
              const ctx = headerContext(column, colIndex)
              const isDragging = drag?.active === true && drag.key === column.key
              const canResize = resizable && column.resizable !== false
              const width = widths[column.key] ?? 0
              return (
                <div
                  key={column.key}
                  role="columnheader"
                  aria-colindex={leadCount + colIndex + 1}
                  aria-sort={column.sortable ? (ctx.sort === "asc" ? "ascending" : ctx.sort === "desc" ? "descending" : "none") : undefined}
                  data-col-key={column.key}
                  data-dragging={isDragging || undefined}
                  className={cn(
                    "group/header absolute inset-y-0 left-0 flex items-center hover:z-10 focus-within:z-10",
                    !canResize && divided(column.key),
                    cellMotion(column.key),
                    isDragging && cn("z-30 hover:z-30 rounded-xl shadow-raised-hover", sheet ? "bg-background" : "bg-card"),
                    column.headerClassName
                  )}
                  style={{ width, transform: `translateX(${columnX(column.key)}px)` }}
                >
                  {renderHeader ? (
                    renderHeader(ctx)
                  ) : column.sortable || reorderable ? (
                    <button
                      type="button"
                      {...ctx.labelProps}
                      aria-description={reorderable ? l10n.altPlusArrowKeysMovesTheColumn : undefined}
                      className={cn(labelClass, alignClass(column.align), ctx.sort && "text-foreground", !column.sortable && "cursor-default")}
                    >
                      <span className="truncate">{column.header}</span>
                      {column.sortable ? <SortIndicator direction={ctx.sort} /> : null}
                    </button>
                  ) : (
                    <div className={cn(labelClass, alignClass(column.align))}>
                      <span className="truncate">{column.header}</span>
                    </div>
                  )}
                  {headerAccessory?.(ctx)}
                  {canResize ? (
                    <div
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={l10n.resizeColumn(typeof column.header === "string" ? column.header : column.key)}
                      aria-valuenow={Math.round(width)}
                      aria-valuemin={minFor(column)}
                      tabIndex={0}
                      data-resizing={resizingKey === column.key || undefined}
                      className="group/resize absolute inset-y-1 -right-1.5 z-10 flex w-3 cursor-col-resize touch-none justify-center outline-none"
                      onPointerDown={(e) => {
                        if (e.button !== 0) return
                        e.preventDefault()
                        e.stopPropagation()
                        e.currentTarget.setPointerCapture(e.pointerId)
                        resizeRef.current = { key: column.key, startX: e.clientX, startWidth: width }
                        setResizingKey(column.key)
                      }}
                      onPointerMove={(e) => {
                        const r = resizeRef.current
                        if (!r) return
                        setWidth(r.key, Math.max(minFor(column), r.startWidth + e.clientX - r.startX))
                      }}
                      onPointerUp={() => {
                        const r = resizeRef.current
                        resizeRef.current = null
                        setResizingKey(null)
                        if (r) onColumnResize?.(r.key, Math.round(widths[r.key] ?? r.startWidth))
                      }}
                      onPointerCancel={() => {
                        resizeRef.current = null
                        setResizingKey(null)
                      }}
                      onDoubleClick={() => {
                        setWidthOverrides((prev) => {
                          const next = { ...prev }
                          delete next[column.key]
                          return next
                        })
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
                        e.preventDefault()
                        const step = (e.shiftKey ? 48 : 16) * (e.key === "ArrowLeft" ? -1 : 1)
                        const next = Math.max(minFor(column), width + step)
                        setWidth(column.key, next)
                        onColumnResize?.(column.key, Math.round(next))
                      }}
                    >
                      <span className="h-full w-0.5 rounded-full bg-border transition-[background-color,width] duration-150 group-hover/header:bg-muted-foreground/40 group-hover/resize:w-[3px] group-hover/resize:bg-primary group-focus-visible/resize:w-[3px] group-focus-visible/resize:bg-primary group-data-resizing/resize:w-[3px] group-data-resizing/resize:bg-primary" />
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        {/* Body ------------------------------------------------------------ */}
        <div ref={bodyRef} role="rowgroup" className="relative" style={{ height: bodyHeight }}>
          {showSkeleton ? (
            <div role="row" aria-busy className="absolute inset-x-0 top-0">
              <span className="sr-only" role="status">
                {l10n.loadingRows}
              </span>
              {Array.from({ length: skeletonCount }, (_, i) => (
                <TableSkeletonRow
                  key={i}
                  index={i}
                  height={rowHeight}
                  cells={[
                    ...(gutter ? [gutter.width] : []),
                    ...(selectable ? [SELECT_WIDTH] : []),
                    ...baseOrder.map((k) => widths[k] ?? DEFAULT_COLUMN_WIDTH),
                  ]}
                />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div role="row" className="sticky left-0 flex h-full items-center justify-center p-8 text-ui text-muted-foreground" style={{ width: viewportWidth || "100%" }}>
              <div role={cellRole}>{emptyState}</div>
            </div>
          ) : (
            virtualItems.map((item) => {
              const entry = sortedRows[item.index]
              if (!entry) return null
              const isSelected = selected.has(entry.id)
              const rowCtx: TableRowContext<T> = {
                row: entry.row,
                rowId: entry.id,
                rowIndex: item.index,
                dataIndex: entry.dataIndex,
                selected: isSelected,
              }
              return (
                <div
                  key={entry.id}
                  role="row"
                  aria-rowindex={item.index + 2}
                  aria-selected={role === "grid" && selectable ? isSelected : undefined}
                  data-row-id={entry.id}
                  data-selected={isSelected || undefined}
                  onClick={onRowClick ? (e) => onRowClick(rowCtx, e) : undefined}
                  className={cn(
                    "group/row absolute inset-x-0 top-0 border-b border-border/60 hover:z-10 hover:bg-muted/45 focus-within:z-10",
                    "data-selected:bg-primary/8 data-selected:hover:bg-primary/12",
                    animate && "transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    onRowClick && "cursor-pointer",
                    rowClassName?.(rowCtx)
                  )}
                  style={{ height: rowHeight, transform: `translateY(${item.start - headerHeight}px)` }}
                >
                  {gutter ? (
                    <div role={cellRole} className="absolute inset-y-0 left-0 flex items-center justify-center" style={{ width: gutter.width }}>
                      {gutter.cell(rowCtx)}
                    </div>
                  ) : null}
                  {selectable ? (
                    <div
                      role={cellRole}
                      className="absolute inset-y-0 flex items-center justify-center"
                      style={{ left: gutter?.width ?? 0, width: SELECT_WIDTH }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked, details) => {
                          const event = details.event as Partial<MouseEvent> | undefined
                          toggleRow(item.index, checked, !!event?.shiftKey)
                        }}
                        aria-label={l10n.selectRow(item.index + 1)}
                      />
                    </div>
                  ) : null}
                  {orderedColumns.map((column, colIndex) => {
                    const value = readValue(entry.row, column)
                    const cellCtx: TableCellContext<T> = { ...rowCtx, column, colIndex, value }
                    const content = column.cell ? column.cell(entry.row, cellCtx) : formatValue(value)
                    const isDragging = drag?.active === true && drag.key === column.key
                    return (
                      <div
                        key={column.key}
                        role={cellRole}
                        aria-colindex={leadCount + colIndex + 1}
                        data-col-key={column.key}
                        className={cn(
                          "absolute inset-y-0 left-0 flex min-w-0 items-center px-3 tabular-nums",
                          divided(column.key),
                          alignClass(column.align),
                          cellMotion(column.key),
                          isDragging && cn("z-20 shadow-raised", sheet ? "bg-background/90" : "bg-card/90"),
                          column.className
                        )}
                        style={{ width: widths[column.key] ?? 0, transform: `translateX(${columnX(column.key)}px)` }}
                      >
                        {renderCell ? renderCell({ ...cellCtx, content }) : <div className="min-w-0 truncate">{content}</div>}
                      </div>
                    )
                  })}
                </div>
              )
            })
          )}

          {resolvedFooter && !showSkeleton && rows.length > 0 ? (
            <div className="absolute inset-x-0" style={{ top: totalSize, height: footerHeight }}>
              <div data-slot="table-footer" className="sticky left-0 h-full" style={{ width: viewportWidth || "100%" }}>
                {resolvedFooter}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ScrollArea>
  )
}

export {
  Table,
  TableSkeletonRow,
  TableLoadingFooter,
  SortIndicator as TableSortIndicator,
  headerLabelClass as tableHeaderLabelClass,
  plainHeaderLabelClass as tablePlainHeaderLabelClass,
  useControllableState,
  compareValues as compareTableValues,
  type TableProps,
  type TableColumn,
  type TableHandle,
  type TableRowContext,
  type TableCellContext,
  type TableHeaderContext,
  type TableHeaderLabelProps,
  type SortState,
  type SortDirection,
}
