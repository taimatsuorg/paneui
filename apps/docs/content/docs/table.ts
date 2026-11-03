import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Shows large data sets that people sort, select and resize.", "zh": "浏览和整理大量数据。"},
  usage: {
    imports: `import { Table, type TableColumn } from "@/components/ui/table"`,
    code: `<Table
  aria-label="Invoices"
  data={invoices}
  columns={[
    { key: "client", header: "Client", grow: true },
    { key: "total", header: "Total", align: "right", sortable: true },
  ]}
  getRowId={(row) => row.id}
  height={320}
/>`,
  },
  examples: [
    {
      id: "basic",
      title: { en: "Basic", zh: "基础" },
    },
    {
      id: "loading-empty",
      title: { en: "Loading and Empty", zh: "加载与空白状态" },
      description: { en: "Use while the first rows load or when a filter returns nothing.", zh: "适用于首次加载或筛选后无结果的场景。" },
    },
    {
      id: "row-click",
      title: { en: "Row Click and Density", zh: "行点击与密度" },
    },
    {
      id: "plain",
      title: { en: "Plain", zh: "简洁样式" },
      description: { en: "Use inside a surface that already frames the rows, such as a card.", zh: "适用于已有外框的容器，例如卡片内部。" },
    },
    {
      id: "scroll-to-index",
      title: { en: "Scroll to Row", zh: "滚动到指定行" },
      description: { en: "Use to jump to a search hit or a newly added row in a long list.", zh: "适用于跳转到搜索结果或新增行。" },
    },
  ],
  notes: [
    {
      title: "Scrollbars",
      body: { en: "The table scrolls in a [Scroll Area](/docs/scroll-area). The vertical track starts below the sticky header and both tracks stay inside the rounded frame.", zh: "表格在 [Scroll Area](/docs/scroll-area) 中滚动。垂直轨道从粘性表头下方开始，两条轨道都保持在圆角边框内。" },
    },
    {
      title: "Keyboard",
      body: { en: "Sortable headers are buttons (asc → desc → off). With `reorderable`, Alt + ← / → moves the focused column; with `resizable`, focus a column edge and use ← / → (Shift for bigger steps), or double-click it to reset. Shift-click a checkbox to select a range.", zh: "可排序表头是按钮（升序 → 降序 → 关闭）。使用 `reorderable` 时，Alt + ← / → 移动聚焦的列；使用 `resizable` 时，聚焦列边缘并使用 ← / →（Shift 加大步长），或双击重置。Shift 点击复选框可选择范围。" },
    },
    {
      title: "Related",
      body: { en: "[Table Editable](/docs/table-editable) and [Table Async](/docs/table-async) build on this core.", zh: "[Table Editable](/docs/table-editable) 和 [Table Async](/docs/table-async) 基于此核心构建。" },
    },
  ],
  api: [
    {
      name: "Table",
      description: { en: "Virtualized data table. Renders a `div` tree with `table` / `grid` roles; no other DOM props pass through.", zh: "虚拟化数据表格。渲染带 `table` / `grid` 角色的 `div` 树；其他 DOM 属性不会传递。" },
      props: [
        { name: "data", type: "readonly T[]", required: true, description: { en: "Rows.", zh: "行。" } },
        { name: "columns", type: "readonly TableColumn<T>[]", required: true, description: { en: "Column definitions.", zh: "列定义。" } },
        { name: "getRowId", type: "(row: T, index: number) => string", description: { en: "Stable id per row; keeps selection and animation correct across sorts. Defaults to the index.", zh: "每行的稳定 id；排序后保持选择和动画正确。默认为索引。" } },
        { name: "aria-label", type: "string", description: { en: "Accessible name.", zh: "无障碍名称。" } },
        { name: "role", type: `"table" | "grid"`, default: `"table"`, description: { en: "`grid` for interactive, spreadsheet-style cells.", zh: "`grid` 用于交互式、电子表格式的单元格。" } },
        { name: "selectable", type: "boolean", default: "false", description: { en: "Add a checkbox lane; shift-click selects ranges.", zh: "添加复选框列；Shift 点击可选择范围。" } },
        { name: "selectedRowIds", type: "readonly string[]", description: { en: "Controlled selection.", zh: "受控选择。" } },
        { name: "defaultSelectedRowIds", type: "readonly string[]", description: { en: "Initial selection.", zh: "初始选择。" } },
        { name: "onSelectionChange", type: "(ids: string[]) => void", description: { en: "Called when the selection changes.", zh: "选中值变化时调用。" } },
        { name: "sort", type: `{ key: string; direction: "asc" | "desc" } | null`, description: { en: "Controlled sort.", zh: "受控排序。" } },
        { name: "defaultSort", type: `{ key: string; direction: "asc" | "desc" } | null`, default: "null", description: { en: "Initial sort.", zh: "初始排序。" } },
        { name: "onSortChange", type: "(sort: SortState) => void", description: { en: "Called when a header cycles the sort.", zh: "表头循环切换排序时调用。" } },
        { name: "resizable", type: "boolean", default: "false", description: { en: "Drag column edges to resize.", zh: "拖动列边缘调整大小。" } },
        { name: "minColumnWidth", type: "number", default: "72", description: { en: "Resize floor in px.", zh: "调整大小的下限，单位 px。" } },
        { name: "onColumnResize", type: "(key: string, width: number) => void", description: { en: "Called after a resize.", zh: "调整大小后调用。" } },
        { name: "reorderable", type: "boolean", default: "false", description: { en: "Drag headers to reorder.", zh: "拖动表头重新排序。" } },
        { name: "columnOrder", type: "readonly string[]", description: { en: "Controlled column order (keys).", zh: "受控列顺序（键）。" } },
        { name: "defaultColumnOrder", type: "readonly string[]", description: { en: "Initial column order.", zh: "初始列顺序。" } },
        { name: "onColumnOrderChange", type: "(keys: string[]) => void", description: { en: "Called after a reorder.", zh: "重新排序后调用。" } },
        { name: "rowHeight", type: "number", default: "44", description: { en: "Row height in px.", zh: "行高，单位为 px。" } },
        { name: "headerHeight", type: "number", default: "40", description: { en: "Header height in px.", zh: "表头高度，单位 px。" } },
        { name: "height", type: "number", default: "440", description: { en: "Viewport height in px.", zh: "视口高度，单位 px。" } },
        { name: "overscan", type: "number", default: "8", description: { en: "Rows rendered beyond the viewport; rows further out are not rendered.", zh: "渲染视口之外的行数；更远的行不渲染。" } },
        { name: "loading", type: "boolean", default: "false", description: { en: "Skeleton rows when there is no data yet, a loading footer otherwise; pauses `onEndReached`.", zh: "尚无数据时显示骨架行，否则显示加载页脚；暂停 `onEndReached`。" } },
        { name: "skeletonRows", type: "number", description: { en: "Number of skeleton rows while loading with no data.", zh: "加载且无数据时骨架行的数量。" } },
        { name: "onEndReached", type: "() => void", description: { en: "Called when the list nears its end.", zh: "列表接近末尾时调用。" } },
        { name: "endReachedThreshold", type: "number", default: "8", description: { en: "How many rows from the end `onEndReached` fires.", zh: "距末尾多少行时触发 `onEndReached`。" } },
        { name: "footer", type: "ReactNode", description: { en: "A band under the last row (load more, add row, end of list).", zh: "最后一行下方的条带（加载更多、添加行、列表末尾）。" } },
        { name: "emptyState", type: "ReactNode", default: `"No rows"`, description: { en: "Shown when there are no rows and `loading` is off.", zh: "没有行且 `loading` 关闭时显示。" } },
        { name: "renderCell", type: "(ctx: TableCellContext<T> & { content: ReactNode }) => ReactNode", description: { en: "Wrap or replace any cell; `content` is what the table would have rendered.", zh: "包裹或替换任意单元格；`content` 是表格原本要渲染的内容。" } },
        { name: "renderHeader", type: "(ctx: TableHeaderContext<T>) => ReactNode", description: { en: "Replace a header label; spread `labelProps` onto your element.", zh: "替换表头标签；将 `labelProps` 展开到你的元素上。" } },
        { name: "headerAccessory", type: "(ctx: TableHeaderContext<T>) => ReactNode", description: { en: "Extra content inside a header cell, e.g. a column menu.", zh: "表头单元格内的额外内容，例如列菜单。" } },
        { name: "gutter", type: "{ width: number; header?: ReactNode; cell: (ctx: TableRowContext<T>) => ReactNode }", description: { en: "Leading lane before the checkbox, e.g. row handles.", zh: "复选框前的引导列，例如行手柄。" } },
        { name: "onRowClick", type: "(ctx: TableRowContext<T>, event: MouseEvent) => void", description: { en: "Called when a row is clicked.", zh: "点击行时调用。" } },
        { name: "rowClassName", type: "(ctx: TableRowContext<T>) => string | undefined", description: { en: "Class per row from its context, e.g. `text-muted-foreground` for archived rows. Tokens only.", zh: "根据行上下文为每行设置的类，例如归档行的 `text-muted-foreground`。仅限变量。" } },
        { name: "variant", type: `"sheet" | "plain"`, default: `"sheet"`, description: { en: "`sheet` puts the header on a tinted band, lays the rows on a sheet over it and divides the columns. `plain` keeps row lines only, with small uppercase headers.", zh: "`sheet` 将表头放在浅色底带上，行铺在其上的面板中，并以竖线分隔各列。`plain` 只保留行线，表头为小号大写。" } },
        { name: "animateLayout", type: "boolean", default: "true", description: { en: "Slide rows and columns into new positions on insert, delete, sort and reorder. Off under reduced motion.", zh: "插入、删除、排序和重新排序时，行和列滑动到新位置。减少动态效果下关闭。" } },
        { name: "className", type: "string", description: { en: "Class for the outer surface.", zh: "外层表面的类。" } },
        { name: "ref", type: "Ref<TableHandle>", description: { en: "`scrollToIndex(index, { align, behavior })`, `scrollToTop(behavior)` and `element()`.", zh: "`scrollToIndex(index, { align, behavior })`、`scrollToTop(behavior)` 和 `element()`。" } },
      ],
      dataAttributes: [
        { name: "data-selected", description: { en: "On selected rows.", zh: "在选中的行上。" } },
        { name: "data-row-id", description: { en: "The row id, on each row.", zh: "行 id，在每个行上。" } },
        { name: "data-col-key", description: { en: "The column key, on header and body cells.", zh: "列键，在表头和正文单元格上。" } },
        { name: "data-dragging", description: { en: "On a header while it is being dragged.", zh: "在表头被拖动时。" } },
        { name: "data-resizing", description: { en: "On a resize handle while it is being dragged.", zh: "在调整大小手柄被拖动时。" } },
      ],
    },
    {
      name: "TableColumn",
      description: { en: "Type of each entry in `columns`.", zh: "`columns` 中每项的类型。" },
      props: [
        { name: "key", type: "string", required: true, description: { en: "Stable key; also the property read from the row when there is no `accessor`.", zh: "稳定键；没有 `accessor` 时也是从行中读取的属性。" } },
        { name: "header", type: "ReactNode", required: true, description: { en: "Header label.", zh: "表头标签。" } },
        { name: "width", type: "number", default: "160", description: { en: "Width in px.", zh: "宽度，单位为 px。" } },
        { name: "minWidth", type: "number", description: { en: "Floor for resizing. Falls back to `minColumnWidth`.", zh: "调整大小的下限。回退到 `minColumnWidth`。" } },
        { name: "grow", type: "boolean", description: { en: "Soak up leftover width (until resized).", zh: "占满剩余宽度（直到被调整大小）。" } },
        { name: "align", type: `"left" | "center" | "right"`, default: `"left"`, description: { en: "Cell alignment.", zh: "单元格对齐方式。" } },
        { name: "sortable", type: "boolean", description: { en: "Make the header sort on click.", zh: "点击表头时排序。" } },
        { name: "resizable", type: "boolean", description: { en: "Set `false` to opt out of resizing.", zh: "设为 `false` 以退出调整大小。" } },
        { name: "accessor", type: "(row: T) => unknown", description: { en: "Raw value for the cell, sorting and default rendering.", zh: "单元格、排序和默认渲染的原始值。" } },
        { name: "sortValue", type: "(row: T) => string | number | null | undefined", description: { en: "Value used for sorting when it differs from the accessor.", zh: "当与 accessor 不同时用于排序的值。" } },
        { name: "cell", type: "(row: T, ctx: TableCellContext<T>) => ReactNode", description: { en: "Custom cell content.", zh: "自定义单元格内容。" } },
        { name: "className", type: "string", description: { en: "Class for body cells.", zh: "正文单元格的类。" } },
        { name: "headerClassName", type: "string", description: { en: "Class for the header cell.", zh: "表头单元格的类。" } },
      ],
    },
    {
      name: "TableSkeletonRow",
      description: { en: "Placeholder row for custom loading states.", zh: "用于自定义加载状态的占位行。" },
      props: [
        { name: "index", type: "number", required: true, description: { en: "Row index; varies the bar widths.", zh: "行索引；改变条形宽度。" } },
        { name: "cells", type: "readonly number[]", required: true, description: { en: "Cell widths in px, in display order.", zh: "单元格宽度，单位 px，按显示顺序。" } },
        { name: "height", type: "number", required: true, description: { en: "Row height in px.", zh: "行高，单位为 px。" } },
        { name: "className", type: "string", description: { en: "Class for the row.", zh: "行的 class。" } },
      ],
    },
    {
      name: "TableLoadingFooter",
      description: { en: "Default “Loading more…” band with a spinner, for `footer`.", zh: "默认的“加载更多…”条带，带加载指示器，用于 `footer`。" },
      props: [{ name: "label", type: "ReactNode", default: `"Loading more…"`, description: { en: "Text beside the spinner.", zh: "加载指示器旁的文本。" } }],
    },
    {
      name: "TableSortIndicator",
      description: { en: "The header sort chevron, for custom `renderHeader` labels.", zh: "表头排序箭头，用于自定义 `renderHeader` 标签。" },
      props: [{ name: "direction", type: `"asc" | "desc" | null`, required: true, description: { en: "Current sort of the column.", zh: "列的当前排序。" } }],
    },
    {
      name: "useControllableState",
      description: { en: "`const [value, setValue] = useControllableState(value, defaultValue, onChange)` gives the table family its controlled-or-uncontrolled state. `tableHeaderLabelClass` and `compareTableValues` are exported too.", zh: "`const [value, setValue] = useControllableState(value, defaultValue, onChange)` 为表格系列提供受控或非受控状态。`tableHeaderLabelClass` 和 `compareTableValues` 也会导出。" },
      props: [],
    },
  ],
} satisfies ComponentDoc
