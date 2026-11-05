"use client"

import * as React from "react"

import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  EditIcon,
  GripVerticalIcon,
  PlusIcon,
  TrashIcon,
} from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@paneui/ui/components/menu"
import {
  Table,
  tableHeaderLabelClass,
  tablePlainHeaderLabelClass,
  useControllableState,
  type TableCellContext,
  type TableColumn,
  type TableHandle,
  type TableHeaderContext,
  type TableProps,
} from "@paneui/ui/components/table"

type EditableValue = string | number | null | undefined
type EditableRow = { id: string; [key: string]: EditableValue }

interface EditableColumn {
  key: string
  header: string
  width?: number
  minWidth?: number
  grow?: boolean
  align?: "left" | "center" | "right"
  /** "number" right-aligns and stores numbers. */
  type?: "text" | "number"
  placeholder?: string
}

type PassThrough = Pick<
  TableProps<EditableRow>,
  | "aria-label"
  | "height"
  | "rowHeight"
  | "headerHeight"
  | "overscan"
  | "selectable"
  | "selectedRowIds"
  | "defaultSelectedRowIds"
  | "onSelectionChange"
  | "resizable"
  | "reorderable"
  | "minColumnWidth"
  | "onColumnResize"
  | "animateLayout"
  | "emptyState"
  | "variant"
  | "className"
>

interface EditableTableProps extends PassThrough {
  rows?: readonly EditableRow[]
  defaultRows?: readonly EditableRow[]
  onRowsChange?: (rows: EditableRow[]) => void
  columns?: readonly EditableColumn[]
  defaultColumns?: readonly EditableColumn[]
  onColumnsChange?: (columns: EditableColumn[]) => void
  onCellEdit?: (rowId: string, columnKey: string, value: EditableValue) => void
  /** Build a blank row; defaults to an id and empty cells. */
  createRow?: (columns: readonly EditableColumn[]) => EditableRow
  /** Build a new column; defaults to "Column N". */
  createColumn?: (columns: readonly EditableColumn[]) => EditableColumn
  /** Show the "New row" band under the last row (default true). */
  showAddRow?: boolean
  readOnly?: boolean
  ref?: React.Ref<TableHandle>
}

type CellPos = { row: number; key: string }

const GUTTER = 32

function toDraft(value: EditableValue) {
  return value == null ? "" : String(value)
}

function parseDraft(draft: string, column: EditableColumn | undefined): EditableValue {
  if (column?.type !== "number") return draft
  const trimmed = draft.trim()
  if (!trimmed) return null
  const n = Number(trimmed.replace(/,/g, ""))
  return Number.isFinite(n) ? n : draft
}

/**
 * Spreadsheet-style table on the virtualized Table core. Cells edit in place
 * (double-click, Enter or just type; Enter/Tab commit and move, Esc cancels),
 * arrow keys walk the grid, and border handles insert or delete rows and
 * columns: the grip on a row's left edge and the chevron on a header open
 * menus, and the + pills on each border insert right there. Everything glides
 * into its new place.
 */
function EditableTable({
  rows: rowsProp,
  defaultRows = [],
  onRowsChange,
  columns: columnsProp,
  defaultColumns = [],
  onColumnsChange,
  onCellEdit,
  createRow,
  createColumn,
  showAddRow = true,
  readOnly = false,
  reorderable = true,
  rowHeight = 40,
  ref,
  ...tableProps
}: EditableTableProps) {
  const { labels } = useLocale()
  const [rows, setRows] = useControllableState<readonly EditableRow[]>(rowsProp, defaultRows, onRowsChange ? (r) => onRowsChange(r.slice()) : undefined)
  const [columns, setColumns] = useControllableState<readonly EditableColumn[]>(
    columnsProp,
    defaultColumns,
    onColumnsChange ? (c) => onColumnsChange(c.slice()) : undefined
  )

  const tableRef = React.useRef<TableHandle | null>(null)
  React.useImperativeHandle(ref, () => ({
    scrollToIndex: (...args) => tableRef.current?.scrollToIndex(...args),
    scrollToTop: (...args) => tableRef.current?.scrollToTop(...args),
    element: () => tableRef.current?.element() ?? null,
  }))

  const idPrefix = React.useId().replace(/:/g, "")
  const counter = React.useRef(0)
  const nextId = (kind: string) => `${idPrefix}-${kind}${++counter.current}`

  const [active, setActive] = React.useState<CellPos | null>(null)
  const [editing, setEditing] = React.useState<{ pos: CellPos; draft: string } | null>(null)
  const [renaming, setRenaming] = React.useState<{ key: string; draft: string } | null>(null)

  const columnMap = React.useMemo(() => new Map(columns.map((c) => [c.key, c])), [columns])

  /* focus management ------------------------------------------------------- */
  // Scrolling waits a frame: when a row was just inserted, the virtualizer only
  // knows the new count after React commits. Scrolling to it earlier clamps to
  // the old last row and the virtualizer's reconcile pass then snaps the
  // viewport back, so every "New row" click jolted the table.
  const focusCell = React.useCallback((pos: CellPos, reveal: "auto" | "end" = "auto") => {
    setActive(pos)
    let tries = 0
    const attempt = () => {
      const root = tableRef.current?.element()
      if (tries === 0) {
        if (reveal === "end" && root) root.scrollTo({ top: root.scrollHeight - root.clientHeight })
        else tableRef.current?.scrollToIndex(pos.row)
      }
      const el = root?.querySelector<HTMLElement>(`[data-cell="${pos.row}:${CSS.escape(pos.key)}"]`)
      if (el) el.focus({ preventScroll: true })
      else if (tries++ < 6) requestAnimationFrame(attempt)
    }
    requestAnimationFrame(attempt)
  }, [])

  const move = (pos: CellPos, dRow: number, dCol: number) => {
    const ci = columns.findIndex((c) => c.key === pos.key)
    const row = Math.min(Math.max(pos.row + dRow, 0), rows.length - 1)
    const col = Math.min(Math.max(ci + dCol, 0), columns.length - 1)
    if (row < 0 || col < 0) return
    focusCell({ row, key: columns[col].key })
  }

  /* data edits ------------------------------------------------------------- */
  const writeCell = (pos: CellPos, value: EditableValue) => {
    const target = rows[pos.row]
    if (!target || target[pos.key] === value) return
    setRows((prev) => prev.map((r, i) => (i === pos.row ? { ...r, [pos.key]: value } : r)))
    onCellEdit?.(target.id, pos.key, value)
  }

  // Enter commits and then the input's blur fires too; the ref makes the second call a no-op.
  const editingRef = React.useRef(editing)
  editingRef.current = editing
  const commit = (after?: (pos: CellPos) => void) => {
    const current = editingRef.current
    if (!current) return
    editingRef.current = null
    writeCell(current.pos, parseDraft(current.draft, columnMap.get(current.pos.key)))
    setEditing(null)
    after?.(current.pos)
  }

  const blankRow = (): EditableRow => {
    if (createRow) return createRow(columns)
    const row: EditableRow = { id: nextId("row") }
    columns.forEach((c) => (row[c.key] = c.type === "number" ? null : ""))
    return row
  }

  const insertRow = (index: number) => {
    const row = blankRow()
    setRows((prev) => {
      const next = prev.slice()
      next.splice(index, 0, row)
      return next
    })
    // Appending keeps the "New row" band pinned under the pointer: scroll to
    // the very end so the new row lands right above it.
    if (columns[0]) focusCell({ row: index, key: columns[0].key }, index >= rows.length ? "end" : "auto")
  }

  const deleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
    setEditing(null)
    const remaining = rows.length - 1
    if (remaining > 0 && active) focusCell({ row: Math.min(index, remaining - 1), key: active.key })
    else setActive(null)
  }

  const insertColumn = (index: number) => {
    const column = createColumn
      ? createColumn(columns)
      : { key: nextId("col"), header: labels.columnN(columns.length + 1), width: 140 }
    setColumns((prev) => {
      const next = prev.slice()
      next.splice(index, 0, column)
      return next
    })
    setRenaming({ key: column.key, draft: column.header })
  }

  const deleteColumn = (key: string) => {
    if (columns.length <= 1) return
    setColumns((prev) => prev.filter((c) => c.key !== key))
    setRows((prev) =>
      prev.map((r) => {
        if (!(key in r)) return r
        const next = { ...r }
        delete next[key]
        return next
      })
    )
    if (active?.key === key) setActive(null)
  }

  const commitRename = () => {
    if (!renaming) return
    const header = renaming.draft.trim()
    if (header) setColumns((prev) => prev.map((c) => (c.key === renaming.key ? { ...c, header } : c)))
    setRenaming(null)
  }

  /* table wiring ----------------------------------------------------------- */
  const tableColumns = React.useMemo<TableColumn<EditableRow>[]>(
    () =>
      columns.map((c) => ({
        key: c.key,
        header: c.header,
        width: c.width ?? 160,
        minWidth: c.minWidth,
        grow: c.grow,
        align: c.align ?? (c.type === "number" ? "right" : "left"),
        className: "frame-lg frame-inset-1 px-0",
        headerClassName: "has-[[data-insert-col]:hover]:shadow-[inset_-2px_0_0_var(--primary)] rtl:has-[[data-insert-col]:hover]:shadow-[inset_2px_0_0_var(--primary)]",
      })),
    [columns]
  )

  const firstKey = columns[0]?.key
  const isTabStop = (pos: CellPos) => (active ? active.row === pos.row && active.key === pos.key : pos.row === 0 && pos.key === firstKey)

  const renderCell = (ctx: TableCellContext<EditableRow> & { content: React.ReactNode }) => {
    const pos = { row: ctx.dataIndex, key: ctx.column.key }
    const column = columnMap.get(ctx.column.key)
    const isEditing = editing?.pos.row === pos.row && editing.pos.key === pos.key
    const alignRight = ctx.column.align === "right"

    if (isEditing) {
      return (
        <input
          autoFocus
          aria-label={labels.cellLabel(String(column?.header ?? pos.key), pos.row + 1)}
          value={editing.draft}
          inputMode={column?.type === "number" ? "decimal" : undefined}
          onChange={(e) => setEditing({ pos, draft: e.target.value })}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={() => commit()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              commit((p) => move(p, 1, 0))
            } else if (e.key === "Tab") {
              e.preventDefault()
              commit((p) => move(p, 0, e.shiftKey ? -1 : 1))
            } else if (e.key === "Escape") {
              e.preventDefault()
              setEditing(null)
              focusCell(pos)
            }
          }}
          className={cn(
            "absolute inset-1 min-w-0 rounded-inner bg-background px-2 text-ui text-foreground shadow-well ring-2 ring-primary/45 outline-none",
            alignRight && "text-end tabular-nums"
          )}
        />
      )
    }

    const empty = ctx.value == null || ctx.value === ""
    return (
      <div
        data-cell={`${pos.row}:${pos.key}`}
        tabIndex={isTabStop(pos) ? 0 : -1}
        aria-readonly={readOnly || undefined}
        onFocus={() => setActive(pos)}
        onDoubleClick={() => !readOnly && setEditing({ pos, draft: toDraft(ctx.value as EditableValue) })}
        onKeyDown={(e) => {
          const arrows: Record<string, [number, number]> = {
            ArrowUp: [-1, 0],
            ArrowDown: [1, 0],
            ArrowLeft: [0, -1],
            ArrowRight: [0, 1],
          }
          if (arrows[e.key]) {
            e.preventDefault()
            move(pos, ...arrows[e.key])
            return
          }
          if (readOnly) return
          if (e.key === "Enter" || e.key === "F2") {
            e.preventDefault()
            setEditing({ pos, draft: toDraft(ctx.value as EditableValue) })
          } else if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault()
            writeCell(pos, column?.type === "number" ? null : "")
          } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault()
            setEditing({ pos, draft: e.key })
          }
        }}
        className={cn(
          "absolute inset-1 flex min-w-0 cursor-cell items-center rounded-inner px-2 outline-none",
          "focus-visible:shadow-[inset_0_0_0_2px_var(--primary)] focus:bg-primary/6",
          alignRight ? "justify-end" : "justify-start"
        )}
      >
        <span className={cn("truncate", empty && "text-muted-foreground/60")}>
          {empty ? (column?.placeholder ?? "") : ctx.content}
        </span>
      </div>
    )
  }

  const renderHeader = (ctx: TableHeaderContext<EditableRow>) => {
    const key = ctx.column.key
    if (renaming?.key === key) {
      return (
        <input
          autoFocus
          aria-label={labels.columnName}
          value={renaming.draft}
          onChange={(e) => setRenaming({ key, draft: e.target.value })}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename()
            if (e.key === "Escape") setRenaming(null)
          }}
          className="mx-1 h-7 min-w-0 flex-1 rounded-lg bg-background px-2 text-ui-sm font-medium text-foreground shadow-well ring-2 ring-primary/45 outline-none"
        />
      )
    }
    const { onKeyDown, ...labelProps } = ctx.labelProps
    return (
      <div
        {...labelProps}
        role="button"
        tabIndex={0}
        aria-description={readOnly ? undefined : labels.columnHeaderHint}
        onDoubleClick={() => !readOnly && setRenaming({ key, draft: String(ctx.column.header) })}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (!readOnly && (e.key === "Enter" || e.key === "F2")) {
            e.preventDefault()
            setRenaming({ key, draft: String(ctx.column.header) })
          }
        }}
        className={cn(tableProps.variant === "plain" ? tablePlainHeaderLabelClass : tableHeaderLabelClass, "touch-none pe-8", ctx.column.align === "right" && "justify-end")}
      >
        <span className="truncate">{ctx.column.header}</span>
      </div>
    )
  }

  const headerAccessory = (ctx: TableHeaderContext<EditableRow>) => {
    if (readOnly) return null
    const key = ctx.column.key
    const index = columns.findIndex((c) => c.key === key)
    return (
      <>
        <Menu>
          <MenuTrigger
            data-no-drag
            aria-label={labels.columnOptions(String(ctx.column.header))}
            className={cn(
              "absolute end-2 flex size-6 cursor-pointer items-center justify-center rounded-lg text-muted-foreground outline-none",
              "opacity-0 transition-[opacity,background-color,box-shadow] duration-150 group-hover/header:opacity-100 hover:bg-secondary",
              "focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-secondary data-popup-open:opacity-100"
            )}
          >
            <ChevronDownIcon className="size-3.5" />
          </MenuTrigger>
          <MenuContent align="end">
            <MenuItem onClick={() => insertColumn(index)}>
              <ArrowLeftIcon className="rtl:-scale-x-100" />
              {labels.insertBefore}
            </MenuItem>
            <MenuItem onClick={() => insertColumn(index + 1)}>
              <ArrowRightIcon className="rtl:-scale-x-100" />
              {labels.insertAfter}
            </MenuItem>
            <MenuItem onClick={() => setRenaming({ key, draft: String(ctx.column.header) })}>
              <EditIcon />
              {labels.rename}
            </MenuItem>
            <MenuSeparator />
            <MenuItem variant="destructive" disabled={columns.length <= 1} onClick={() => deleteColumn(key)}>
              <TrashIcon />
              {labels.deleteColumn}
            </MenuItem>
          </MenuContent>
        </Menu>
        {/* On the last column the pill would hang past the table and add horizontal
            scroll; "Insert after" in the menu appends there instead. */}
        {index < columns.length - 1 ? (
          <InsertPill
            data-insert-col
            label={labels.insertColumnAfter(String(ctx.column.header))}
            onClick={() => insertColumn(index + 1)}
            className="top-1/2 -end-2 -translate-y-1/2 group-hover/header:scale-100 group-hover/header:opacity-100"
          />
        ) : null}
      </>
    )
  }

  const gutter = readOnly
    ? undefined
    : {
        width: GUTTER,
        cell: ({ dataIndex }: { dataIndex: number }) => (
          <>
            <Menu>
              <MenuTrigger
                aria-label={labels.rowOptions(dataIndex + 1)}
                className={cn(
                  "flex h-6 w-4 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none",
                  "opacity-0 transition-[opacity,background-color,box-shadow] duration-150 group-hover/row:opacity-100 hover:bg-secondary",
                  "focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-secondary data-popup-open:opacity-100"
                )}
              >
                <GripVerticalIcon className="size-3.5" />
              </MenuTrigger>
              <MenuContent side="inline-end" align="start" sideOffset={4}>
                <MenuItem onClick={() => insertRow(dataIndex)}>
                  <ArrowUpIcon />
                  {labels.insertAbove}
                </MenuItem>
                <MenuItem onClick={() => insertRow(dataIndex + 1)}>
                  <ArrowDownIcon />
                  {labels.insertBelow}
                </MenuItem>
                <MenuSeparator />
                <MenuItem variant="destructive" onClick={() => deleteRow(dataIndex)}>
                  <TrashIcon />
                  {labels.deleteRow}
                </MenuItem>
              </MenuContent>
            </Menu>
            <InsertPill
              data-insert-row
              label={labels.insertRowBelow(dataIndex + 1)}
              onClick={() => insertRow(dataIndex + 1)}
              className="-bottom-2 left-1/2 -translate-x-1/2 group-hover/row:scale-100 group-hover/row:opacity-100"
            />
          </>
        ),
      }

  return (
    <Table<EditableRow>
      {...tableProps}
      ref={tableRef}
      role="grid"
      data={rows}
      columns={tableColumns}
      getRowId={(row) => row.id}
      rowHeight={rowHeight}
      reorderable={reorderable && !readOnly}
      columnOrder={columns.map((c) => c.key)}
      onColumnOrderChange={(keys) => setColumns((prev) => keys.map((k) => prev.find((c) => c.key === k)).filter(Boolean) as EditableColumn[])}
      renderCell={renderCell}
      renderHeader={renderHeader}
      headerAccessory={headerAccessory}
      gutter={gutter}
      rowClassName={() => "has-[[data-insert-row]:hover]:shadow-[inset_0_-2px_0_var(--primary)]"}
      emptyState={
        tableProps.emptyState ??
        (readOnly ? (
          labels.noRows
        ) : (
          <button
            type="button"
            onClick={() => insertRow(0)}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-card px-2.5 text-ui-sm font-medium text-secondary-foreground shadow-raised transition-[box-shadow,background-color,scale] duration-150 ease-out outline-none hover:bg-accent hover:shadow-raised-hover focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PlusIcon className="size-3.5" />
            {labels.addFirstRow}
          </button>
        ))
      }
      footer={
        showAddRow && !readOnly ? (
          <button
            type="button"
            onClick={() => insertRow(rows.length)}
            className="flex h-full w-full cursor-pointer items-center gap-2 px-3 text-ui text-muted-foreground outline-none hover:bg-muted/45 hover:text-foreground focus-visible:bg-muted/45 focus-visible:text-foreground"
          >
            <PlusIcon className="size-4" />
            {labels.newRow}
          </button>
        ) : undefined
      }
    />
  )
}

/** Small + bubble that sits on a border and inserts there. */
function InsertPill({
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & { label: string; "data-insert-row"?: boolean; "data-insert-col"?: boolean }) {
  return (
    <button
      type="button"
      data-no-drag
      className={cn(
        "absolute z-30 flex size-4 cursor-pointer after:absolute after:-inset-1 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-primary outline-none",
        "scale-50 opacity-0 transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-125 focus-visible:scale-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className
      )}
      {...props}
      aria-label={props["aria-label"] ?? label}
    >
      <PlusIcon className="size-2.5" />
    </button>
  )
}

export { EditableTable, type EditableTableProps, type EditableColumn, type EditableRow, type EditableValue }
