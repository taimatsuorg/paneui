"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { FilterIcon, MoreHorizontalIcon, SearchIcon, SlidersIcon, XIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@paneui/ui/components/empty-state"
import { Input } from "@paneui/ui/components/input"
import { Menu, MenuCheckboxItem, MenuContent, MenuGroup, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@paneui/ui/components/menu"
import { Pagination, PaginationPageSize, PaginationSummary } from "@paneui/ui/components/pagination"
import { Table, type SortState, type TableColumn, type TableRowContext } from "@paneui/ui/components/table"

/*
 * A table with the toolbar and footer most admin pages need, on top of <Table>:
 * search, faceted filters, column visibility, sorting, row selection with bulk
 * actions, pagination and empty / no-results states.
 *
 *   <DataTable
 *     data={customers}
 *     columns={columns}
 *     getRowId={(c) => c.id}
 *     filters={[{ key: "status", label: "Status", options: [{ value: "active", label: "Active" }] }]}
 *     selectable
 *     bulkActions={(rows, clear) => <Button size="sm" onClick={clear}>Export {rows.length}</Button>}
 *     onRowClick={({ row }) => open(row)}
 *   />
 *
 * Everything runs client-side on `data` (filter → search → sort → page). For
 * server data, page and filter on the server and render <Table> directly.
 */

type DataTableColumn<T> = TableColumn<T> & {
  /** Name in the column menu when `header` is not a string. */
  label?: string
  /** Show in the column visibility menu. Default true for columns with a label or string header. */
  hideable?: boolean
}

type DataTableFilterOption = { value: string; label: string; icon?: React.ReactNode }

type DataTableFilter<T> = {
  /** Column key (or any id) — the row value is read with `accessor` or `row[key]`. */
  key: string
  label: string
  options: readonly DataTableFilterOption[]
  accessor?: (row: T) => string | readonly string[]
}

type DataTableProps<T> = {
  data: readonly T[]
  columns: readonly DataTableColumn<T>[]
  getRowId: (row: T, index: number) => string
  "aria-label"?: string
  /** Text the search box matches against. Default: every string / number field of the row. `false` hides search. */
  searchText?: ((row: T) => string) | false
  searchPlaceholder?: string
  filters?: readonly DataTableFilter<T>[]
  defaultSort?: SortState
  defaultHiddenColumns?: readonly string[]
  defaultPageSize?: number
  pageSizeOptions?: number[]
  selectable?: boolean
  selectedRowIds?: readonly string[]
  onSelectionChange?: (ids: string[]) => void
  /** Shown in a bar above the table while rows are selected. */
  bulkActions?: (rows: T[], clear: () => void) => React.ReactNode
  /** Extra controls at the end of the toolbar (export, add). */
  toolbar?: React.ReactNode
  /** Shown when `data` itself is empty. Filtered-to-nothing gets a built-in "No results". */
  emptyState?: React.ReactNode
  /** Noun for the footer ("customers"). Default "rows". */
  noun?: string
  rowHeight?: number
  onRowClick?: (ctx: TableRowContext<T>, event: React.MouseEvent<HTMLDivElement>) => void
  rowClassName?: (ctx: TableRowContext<T>) => string | undefined
  /** The table's look: `sheet` (header band, column lines) or `plain`. */
  variant?: "sheet" | "plain"
  className?: string
}

const HEADER = 40
const EMPTY_HEIGHT = 280

function defaultSearchText(row: unknown) {
  if (!row || typeof row !== "object") return String(row ?? "")
  return Object.values(row as Record<string, unknown>)
    .filter((v) => typeof v === "string" || typeof v === "number")
    .join(" ")
}

function readFilterValue<T>(row: T, filter: DataTableFilter<T>): readonly string[] {
  const v = filter.accessor ? filter.accessor(row) : (row as Record<string, unknown>)[filter.key]
  if (Array.isArray(v)) return v.map(String)
  return v == null ? [] : [String(v)]
}

function DataTable<T>({
  data,
  columns,
  getRowId,
  "aria-label": ariaLabel,
  searchText,
  searchPlaceholder,
  filters = [],
  defaultSort = null,
  defaultHiddenColumns = [],
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  selectable = false,
  selectedRowIds,
  onSelectionChange,
  bulkActions,
  toolbar,
  emptyState,
  noun,
  rowHeight = 48,
  onRowClick,
  rowClassName,
  variant,
  className,
}: DataTableProps<T>) {
  const l10n = useLocale().labels
  if (searchPlaceholder === undefined) searchPlaceholder = l10n.search

  if (noun === undefined) noun = l10n.rows
  const reduce = useReducedMotion()
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState<Record<string, string[]>>({})
  const [sort, setSort] = React.useState<SortState>(defaultSort)
  const [hidden, setHidden] = React.useState<string[]>(() => [...defaultHiddenColumns])
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(defaultPageSize)
  const [innerSelected, setInnerSelected] = React.useState<string[]>([])
  const selected = React.useMemo(() => (selectedRowIds ? [...selectedRowIds] : innerSelected), [selectedRowIds, innerSelected])
  const setSelected = (ids: string[]) => {
    if (!selectedRowIds) setInnerSelected(ids)
    onSelectionChange?.(ids)
  }

  /* pipeline: filter → search → sort → page -------------------------------- */
  const ids = React.useMemo(() => data.map((r, i) => getRowId(r, i)), [data, getRowId])
  const idOf = React.useMemo(() => {
    const m = new Map<T, string>()
    data.forEach((r, i) => m.set(r, ids[i]))
    return (r: T) => m.get(r) ?? ""
  }, [data, ids])
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const text = searchText === false ? null : (searchText ?? defaultSearchText)
    return data.filter((row) => {
      for (const f of filters) {
        const want = active[f.key]
        if (want?.length && !readFilterValue(row, f).some((v) => want.includes(v))) return false
      }
      if (q && text && !text(row).toLowerCase().includes(q)) return false
      return true
    })
  }, [data, filters, active, query, searchText])

  const sorted = React.useMemo(() => {
    if (!sort) return filtered
    const col = columns.find((c) => c.key === sort.key)
    if (!col) return filtered
    const read = col.sortValue ?? col.accessor ?? ((r: T) => (r as Record<string, unknown>)[col.key])
    const dir = sort.direction === "asc" ? 1 : -1
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })
    return [...filtered].sort((a, b) => {
      const x = read(a) as unknown
      const y = read(b) as unknown
      if (x == null || y == null) return x == null ? (y == null ? 0 : 1) : -1
      if (typeof x === "number" && typeof y === "number") return (x - y) * dir
      if (x instanceof Date && y instanceof Date) return (x.getTime() - y.getTime()) * dir
      return collator.compare(String(x), String(y)) * dir
    })
  }, [filtered, sort, columns])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const current = Math.min(page, pageCount)
  const pageRows = React.useMemo(() => sorted.slice((current - 1) * pageSize, current * pageSize), [sorted, current, pageSize])

  const visibleColumns = React.useMemo(() => columns.filter((c) => !hidden.includes(c.key)), [columns, hidden])
  const hideableColumns = columns.filter((c) => c.hideable ?? (!!c.label || typeof c.header === "string"))
  const filtering = query.trim() !== "" || Object.values(active).some((v) => v.length > 0)

  const resetFilters = () => {
    setQuery("")
    setActive({})
    setPage(1)
  }

  /* selection keeps rows on other pages ------------------------------------ */
  const pageIds = React.useMemo(() => new Set(pageRows.map(idOf)), [pageRows, idOf])
  const onTableSelection = (next: string[]) => setSelected([...selected.filter((id) => !pageIds.has(id)), ...next])
  const selectedRows = React.useMemo(() => {
    const set = new Set(selected)
    return data.filter((_, i) => set.has(ids[i]))
  }, [data, ids, selected])

  /* toolbar: facets fold into one menu when they can't share a row -------- */
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const searchRef = React.useRef<HTMLDivElement>(null)
  const facetsRef = React.useRef<HTMLDivElement>(null)
  const endRef = React.useRef<HTMLDivElement>(null)
  const facetsWidth = React.useRef(0)
  const [collapsed, setCollapsed] = React.useState(false)
  const measure = React.useCallback(() => {
    const bar = toolbarRef.current
    if (!bar) return
    if (facetsRef.current) facetsWidth.current = facetsRef.current.scrollWidth
    const gap = parseFloat(getComputedStyle(bar).columnGap) || 0
    const search = searchRef.current
    // Search shares the row from the container breakpoint on; below it, it takes a row of its own.
    const sharesRow = !!search && search.offsetWidth < bar.clientWidth - 1
    const room = bar.clientWidth - (sharesRow ? parseFloat(getComputedStyle(search).minWidth) + gap : 0)
    const end = endRef.current?.scrollWidth ?? 0
    setCollapsed(facetsWidth.current + (end ? gap + end : 0) > room + 0.5)
  }, [])
  React.useLayoutEffect(() => {
    const bar = toolbarRef.current
    if (!bar) return
    measure()
    const observer = new ResizeObserver(() => measure())
    observer.observe(bar)
    return () => observer.disconnect()
  }, [measure])
  // Facet labels change width with their counts and the Reset button.
  React.useLayoutEffect(() => {
    if (!collapsed) measure()
  }, [collapsed, measure, active, filtering, hidden])

  const isEmpty = data.length === 0
  const height = HEADER + (pageRows.length ? pageRows.length * rowHeight : EMPTY_HEIGHT)

  const empty = isEmpty
    ? (emptyState ?? (
        <EmptyState size="sm">
          <EmptyStateTitle>{l10n.noItemsYet(noun)}</EmptyStateTitle>
        </EmptyState>
      ))
    : (
        <EmptyState size="sm">
          <EmptyStateIcon>
            <SearchIcon />
          </EmptyStateIcon>
          <EmptyStateTitle>{l10n.noMatchingItems(noun)}</EmptyStateTitle>
          <EmptyStateDescription>{l10n.tryADifferentSearchOrRemoveAFilter}</EmptyStateDescription>
          <EmptyStateActions>
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              {l10n.clearFilters}
            </Button>
          </EmptyStateActions>
        </EmptyState>
      )

  const facetProps = (f: DataTableFilter<T>): FacetProps<T> => ({
    filter: f,
    data,
    value: active[f.key] ?? [],
    onValueChange: (v: string[]) => {
      setActive((a) => ({ ...a, [f.key]: v }))
      setPage(1)
    },
  })
  const activeFilterCount = Object.values(active).reduce((n, v) => n + v.length, 0)

  return (
    <div data-slot="data-table" className={cn("@container/data-table flex min-w-0 flex-col gap-3", className)}>
      {/* Toolbar ------------------------------------------------------------ */}
      <div
        ref={toolbarRef}
        data-slot="data-table-toolbar"
        data-filters={collapsed ? "menu" : "inline"}
        className="flex flex-wrap items-center gap-2"
      >
        {searchText !== false && (
          <div
            ref={searchRef}
            data-slot="data-table-search"
            className="relative basis-full @[40rem]/data-table:max-w-64 @[40rem]/data-table:min-w-40 @[40rem]/data-table:flex-1 @[40rem]/data-table:basis-0"
          >
            <SearchIcon aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder.replace(/…$/, "")}
              className="h-7 pl-7.5"
            />
          </div>
        )}
        {filters.length > 0 && collapsed && <DataTableFilterMenu filters={filters} facet={facetProps} count={activeFilterCount} onClear={resetFilters} />}
        {(filters.length > 0 || filtering) && !collapsed && (
          <div ref={facetsRef} data-slot="data-table-filters" className="flex shrink-0 items-center gap-2">
            {filters.map((f) => (
              <DataTableFacet key={f.key} {...facetProps(f)} />
            ))}
            {filtering && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                {l10n.reset}
                <XIcon data-icon="inline-end" />
              </Button>
            )}
          </div>
        )}
        <div ref={endRef} className="ml-auto flex shrink-0 items-center gap-2">
          {toolbar}
          {hideableColumns.length > 0 && (
            <Menu>
              <MenuTrigger render={<Button variant="outline" size="sm" />}>
                <SlidersIcon data-icon="inline-start" />
                {l10n.view}
              </MenuTrigger>
              <MenuContent align="end" className="w-48">
                <MenuGroup>
                  <MenuLabel>{l10n.columns}</MenuLabel>
                  {hideableColumns.map((c) => (
                    <MenuCheckboxItem
                      key={c.key}
                      checked={!hidden.includes(c.key)}
                      onCheckedChange={(on) => setHidden((h) => (on ? h.filter((k) => k !== c.key) : [...h, c.key]))}
                      // keep the menu open while toggling several columns
                      closeOnClick={false}
                    >
                      {c.label ?? (typeof c.header === "string" ? c.header : c.key)}
                    </MenuCheckboxItem>
                  ))}
                </MenuGroup>
              </MenuContent>
            </Menu>
          )}
        </div>
      </div>

      {/* Selection bar ------------------------------------------------------ */}
      <AnimatePresence initial={false}>
        {selectable && selected.length > 0 && (
          <motion.div
            key="bulk"
            data-slot="data-table-selection"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 460, damping: 40, mass: 0.6 }}
            className="overflow-hidden"
          >
            <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-xl bg-primary/8 px-3 py-1.5 text-ui">
              <span className="font-medium tabular-nums">{l10n.selectedCount(selected.length)}</span>
              <Button variant="ghost" size="xs" onClick={() => setSelected([])}>
                {l10n.clear}
              </Button>
              <div className="ml-auto flex flex-wrap items-center gap-2">{bulkActions?.(selectedRows, () => setSelected([]))}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table -------------------------------------------------------------- */}
      <Table
        aria-label={ariaLabel}
        data={pageRows}
        columns={visibleColumns}
        getRowId={idOf}
        sort={sort}
        onSortChange={(s) => {
          setSort(s)
          setPage(1)
        }}
        selectable={selectable}
        selectedRowIds={selectable ? selected.filter((id) => pageIds.has(id)) : undefined}
        onSelectionChange={selectable ? onTableSelection : undefined}
        rowHeight={rowHeight}
        headerHeight={HEADER}
        height={height}
        emptyState={empty}
        onRowClick={onRowClick}
        rowClassName={rowClassName}
        variant={variant}
      />

      {/* Footer ------------------------------------------------------------- */}
      {!isEmpty && (
        <div data-slot="data-table-footer" className="flex items-center justify-between gap-4 px-1">
          <PaginationSummary page={current} pageSize={pageSize} total={sorted.length} noun={noun} />
          <div className="flex items-center gap-4">
            <PaginationPageSize
              value={pageSize}
              options={pageSizeOptions}
              onValueChange={(s) => {
                setPageSize(s)
                setPage(1)
              }}
              className="hidden @[36rem]/data-table:flex"
            />
            <Pagination page={current} pageCount={pageCount} onPageChange={setPage} className="hidden @[28rem]/data-table:flex" />
            <Pagination page={current} pageCount={pageCount} onPageChange={setPage} compact className="@[28rem]/data-table:hidden" />
          </div>
        </div>
      )}
    </div>
  )
}

type FacetProps<T> = {
  filter: DataTableFilter<T>
  data: readonly T[]
  value: string[]
  onValueChange: (value: string[]) => void
}

function FacetCount({ children }: { children: React.ReactNode }) {
  return <span className="-mr-0.5 rounded-full bg-primary/14 px-1.5 text-ui-xs leading-4.5 font-medium text-primary-text tabular-nums">{children}</span>
}

/** One filter's options as checkbox rows, each with its row count. */
function FacetOptions<T>({ filter, data, value, onValueChange }: FacetProps<T>) {
  const counts = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const row of data) for (const v of readFilterValue(row, filter)) m.set(v, (m.get(v) ?? 0) + 1)
    return m
  }, [data, filter])
  return (
    <MenuGroup>
      <MenuLabel>{filter.label}</MenuLabel>
      {filter.options.map((o) => (
        <MenuCheckboxItem
          key={o.value}
          checked={value.includes(o.value)}
          closeOnClick={false}
          onCheckedChange={(on) => onValueChange(on ? [...value, o.value] : value.filter((v) => v !== o.value))}
        >
          {o.icon}
          <span className="flex-1 truncate">{o.label}</span>
          <span className="text-ui-xs text-muted-foreground tabular-nums">{counts.get(o.value) ?? 0}</span>
        </MenuCheckboxItem>
      ))}
    </MenuGroup>
  )
}

/** Multi-select filter button with counts per option. */
function DataTableFacet<T>(props: FacetProps<T>) {
  const l10n = useLocale().labels

  const { filter, value, onValueChange } = props
  return (
    <Menu>
      <MenuTrigger
        render={<Button variant="outline" size="sm" />}
        aria-label={value.length ? l10n.filterSelection(filter.label, value.length) : l10n.filterBy(filter.label)}
      >
        <FilterIcon data-icon="inline-start" />
        {filter.label}
        {value.length > 0 && <FacetCount>{value.length}</FacetCount>}
      </MenuTrigger>
      <MenuContent className="w-52">
        <FacetOptions {...props} />
        {value.length > 0 && (
          <>
            <MenuSeparator />
            <MenuItem onClick={() => onValueChange([])}>{l10n.clearFilter}</MenuItem>
          </>
        )}
      </MenuContent>
    </Menu>
  )
}

/** Every facet in one menu, for toolbars too narrow for a button per filter. */
function DataTableFilterMenu<T>({
  filters,
  facet,
  count,
  onClear,
}: {
  filters: readonly DataTableFilter<T>[]
  facet: (f: DataTableFilter<T>) => FacetProps<T>
  count: number
  onClear: () => void
}) {
  const l10n = useLocale().labels

  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline" size="sm" />} aria-label={count ? l10n.filterSelection(l10n.filters, count) : l10n.filters}>
        <FilterIcon data-icon="inline-start" />
        {l10n.filter}
        {count > 0 && <FacetCount>{count}</FacetCount>}
      </MenuTrigger>
      <MenuContent className="max-h-(--available-height) w-56">
        {filters.map((f, i) => (
          <React.Fragment key={f.key}>
            {i > 0 && <MenuSeparator />}
            <FacetOptions {...facet(f)} />
          </React.Fragment>
        ))}
        {count > 0 && (
          <>
            <MenuSeparator />
            <MenuItem onClick={onClear}>{l10n.clearFilters}</MenuItem>
          </>
        )}
      </MenuContent>
    </Menu>
  )
}

/** "⋯" menu for a row's actions. Put `MenuItem`s inside; clicks don't reach `onRowClick`. */
function DataTableRowActions({ label, children }: { label?: string; children: React.ReactNode }) {
  const l10n = useLocale().labels
  if (label === undefined) label = l10n.rowActions

  return (
    // only stops the row's click handler; the button inside is the control
    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
      <Menu>
        <MenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label={label} />}>
          <MoreHorizontalIcon />
        </MenuTrigger>
        <MenuContent align="end" className="w-44">
          {children}
        </MenuContent>
      </Menu>
    </div>
  )
}

export { DataTable, DataTableRowActions }
export type { DataTableColumn, DataTableFilter, DataTableFilterOption, DataTableProps }
