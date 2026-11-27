import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Shows large data sets that people sort, select and resize.", zh: "浏览和整理大量数据。" },
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
      id: "pinned",
      title: { en: "Pinned Columns and Compact Density", zh: "固定列与紧凑密度" },
      description: { en: "Pin leading columns and toggle `size=\"sm\"` for dense operational tables.", zh: "固定起始列并可切换 `size=\"sm\"` 紧凑行高。" },
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
      title: { en: "Plain Header", zh: "简洁表头" },
      description: { en: "Match the header background to the card surface.", zh: "让表头底色与卡片背景保持一致。" },
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
      title: "Keyboard and selection",
      body: { en: "Sortable headers cycle asc, desc and unsorted while announcing changes in a live status region. Hold Shift and click or drag across checkboxes to select a continuous range. With `reorderable`, Alt + ← / → moves the focused column; with `resizable`, focus a column edge and use ← / → (Shift for bigger steps), or double-click to reset.", zh: "可排序表头支持升序、降序和取消排序循环，并通过读屏实时区域播报状态变化。按住 Shift 点击或拖过复选框可连续框选范围。启用 `reorderable` 时，Alt + ← / → 可移动列位置；启用 `resizable` 时，聚焦列边界按 ← / → 调整宽度（Shift 加大步长），双击重置。" },
    },
    {
      title: "Related",
      body: { en: "[Table Editable](/docs/table-editable) and [Table Async](/docs/table-async) build on this core.", zh: "[Table Editable](/docs/table-editable) 和 [Table Async](/docs/table-async) 基于此核心构建。" },
    },
  ],
  api: [
    {
      name: "Table",
      description: { en: "Virtualized data table rendering horizontal hairline rows with sticky header and optional pinned columns.", zh: "带粘性表头与可选固定列的虚拟滚动水平行线数据表。" },
      props: [
        { name: "data", type: "readonly T[]", required: true, description: { en: "Rows.", zh: "行。" } },
        { name: "columns", type: "readonly TableColumn<T>[]", required: true, description: { en: "Column definitions.", zh: "列定义。" } },
        { name: "getRowId", type: "(row: T, index: number) => string", description: { en: "Stable id per row; keeps selection and animation correct across sorts. Defaults to the index.", zh: "每行的稳定 id；排序后保持选择和动画正确。默认为索引。" } },
        { name: "aria-label", type: "string", description: { en: "Accessible name.", zh: "无障碍名称。" } },
        { name: "role", type: `"table" | "grid"`, default: `"table"`, description: { en: "`grid` for interactive, spreadsheet-style cells.", zh: "`grid` 用于交互式、电子表格式的单元格。" } },
        { name: "variant", type: `"surface" | "plain"`, default: `"surface"`, description: { en: "`surface` uses a subtle tinted header band over horizontal row lines; `plain` matches the card surface.", zh: "`surface` 使用浅色表头底带和水平行线；`plain` 使表头与卡片表面同色。" } },
        { name: "size", type: `"default" | "sm"`, default: `"default"`, description: { en: "Adjusts default row height, header height and cell padding.", zh: "调整默认行高、表头高度与单元格内边距。" } },
        { name: "selectable", type: "boolean", default: "false", description: { en: "Add a checkbox lane; shift-click or shift-drag selects ranges.", zh: "添加复选框列；按住 Shift 点击或拖拽可选中连续范围。" } },
        { name: "swipeSelect", type: "boolean", default: "true", description: { en: "Allow dragging across checkboxes while holding Shift to select ranges.", zh: "允许按住 Shift 拖过复选框连续框选。" } },
        { name: "selectedRowIds", type: "readonly string[]", description: { en: "Controlled selection.", zh: "受控选择。" } },
        { name: "defaultSelectedRowIds", type: "readonly string[]", description: { en: "Initial selection.", zh: "初始选择。" } },
        { name: "onSelectionChange", type: "(ids: string[]) => void", description: { en: "Called when the selection changes.", zh: "选中值变化时调用。" } },
        { name: "sort", type: `{ key: string; direction: "asc" | "desc" } | null`, description: { en: "Controlled sort.", zh: "受控排序。" } },
        { name: "defaultSort", type: `{ key: string; direction: "asc" | "desc" } | null`, default: "null", description: { en: "Initial sort.", zh: "初始排序。" } },
        { name: "onSortChange", type: "(sort: SortState) => void", description: { en: "Called when a header cycles the sort.", zh: "表头循环切换排序时调用。" } },
        { name: "resizable", type: "boolean", default: "false", description: { en: "Drag column edges to resize.", zh: "拖动列边缘调整大小。" } },
        { name: "minColumnWidth", type: "number", default: "72", description: { en: "Resize floor in px.", zh: "调整大小的下限，单位 px。" } },
        { name: "onColumnResize", type: "(key: string, width: number) => void", description: { en: "Called after a resize.", zh: "调整大小后调用。" } },
        { name: "reorderable", type: "boolean", default: "false", description: { en: "Drag non-pinned headers to reorder.", zh: "拖动非固定表头重新排序。" } },
        { name: "columnOrder", type: "readonly string[]", description: { en: "Controlled column order (keys).", zh: "受控列顺序（键）。" } },
        { name: "defaultColumnOrder", type: "readonly string[]", description: { en: "Initial column order.", zh: "初始列顺序。" } },
        { name: "onColumnOrderChange", type: "(keys: string[]) => void", description: { en: "Called after a reorder.", zh: "重新排序后调用。" } },
        { name: "rowHeight", type: "number", default: "44", description: { en: "Row height in px (defaults to 36 when `size=\"sm\"`).", zh: "行高，单位 px（`size=\"sm\"` 时默认 36）。" } },
        { name: "headerHeight", type: "number", default: "40", description: { en: "Header height in px (defaults to 34 when `size=\"sm\"`).", zh: "表头高度，单位 px（`size=\"sm\"` 时默认 34）。" } },
        { name: "height", type: "number", default: "440", description: { en: "Viewport height in px.", zh: "视口高度，单位 px。" } },
        { name: "overscan", type: "number", default: "8", description: { en: "Rows rendered beyond the viewport.", zh: "视口之外额外渲染的缓冲行数。" } },
        { name: "loading", type: "boolean", default: "false", description: { en: "Skeleton rows when empty, or loading footer otherwise.", zh: "空数据时显示骨架行，否则显示底部加载条。" } },
        { name: "skeletonRows", type: "number", description: { en: "Number of skeleton rows while loading with no data.", zh: "加载且无数据时骨架行的数量。" } },
        { name: "onEndReached", type: "() => void", description: { en: "Called when the list nears its end.", zh: "列表接近末尾时调用。" } },
        { name: "endReachedThreshold", type: "number", default: "8", description: { en: "How many rows from the end `onEndReached` fires.", zh: "距末尾多少行时触发 `onEndReached`。" } },
        { name: "footer", type: "ReactNode", description: { en: "Band rendered under the last row.", zh: "最后一行下方的底部条带。" } },
        { name: "emptyState", type: "ReactNode", default: `"No rows"`, description: { en: "Shown when there are no rows and `loading` is off.", zh: "没有行且 `loading` 关闭时显示。" } },
        { name: "renderCell", type: "(ctx: TableCellContext<T> & { content: ReactNode }) => ReactNode", description: { en: "Wrap or replace any cell.", zh: "包裹或替换任意单元格。" } },
        { name: "renderHeader", type: "(ctx: TableHeaderContext<T>) => ReactNode", description: { en: "Replace a header label; spread `labelProps` onto your element.", zh: "替换表头标签；将 `labelProps` 展开到元素上。" } },
        { name: "headerAccessory", type: "(ctx: TableHeaderContext<T>) => ReactNode", description: { en: "Extra content inside a header cell.", zh: "表头单元格内的额外控件。" } },
        { name: "gutter", type: "{ width: number; header?: ReactNode; cell: (ctx: TableRowContext<T>) => ReactNode }", description: { en: "Leading lane before the checkbox.", zh: "复选框前的引导列。" } },
        { name: "onRowClick", type: "(ctx: TableRowContext<T>, event: MouseEvent) => void", description: { en: "Called when a row is clicked.", zh: "点击行时调用。" } },
        { name: "rowClassName", type: "(ctx: TableRowContext<T>) => string | undefined", description: { en: "Extra class per row from its context.", zh: "根据行上下文附加的样式类名。" } },
        { name: "animateLayout", type: "boolean", default: "true", description: { en: "Slide rows and columns smoothly on change.", zh: "数据变化时平滑过渡行和列位置。" } },
        { name: "className", type: "string", description: { en: "Class for the outer surface.", zh: "外层表面的类名。" } },
        { name: "ref", type: "Ref<TableHandle>", description: { en: "Imperative handle (`scrollToIndex`, `scrollToTop`, `element`).", zh: "命令式滚动与节点引用句柄。" } },
      ],
      dataAttributes: [
        { name: "data-variant", description: { en: "`surface` or `plain`.", zh: "`surface` 或 `plain`。" } },
        { name: "data-size", description: { en: "`default` or `sm`.", zh: "`default` 或 `sm`。" } },
        { name: "data-selected", description: { en: "On selected rows.", zh: "在选中的行上。" } },
        { name: "data-pinned", description: { en: "Present on columns pinned to `start`.", zh: "存在于固定到起始边缘的列上。" } },
        { name: "data-pinned-edge", description: { en: "On the trailing edge of the pinned column block.", zh: "位于固定列组末尾边界。" } },
        { name: "data-row-id", description: { en: "The row id, on each row.", zh: "行 id，在每个行上。" } },
        { name: "data-col-key", description: { en: "The column key, on header and body cells.", zh: "列键，在表头和正文单元格上。" } },
        { name: "data-dragging", description: { en: "On a header while it is being dragged.", zh: "在表头被拖动时。" } },
        { name: "data-resizing", description: { en: "On a resize handle while it is being dragged.", zh: "在调整大小手柄被拖动时。" } },
        { name: "data-swipe-selecting", description: { en: "On the scroll viewport while Shift-dragging checkboxes.", zh: "按住 Shift 拖选复选框期间位于滚动容器上。" } },
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
        { name: "pinned", type: `"start"`, description: { en: "Keep this column sticky at the start edge during horizontal scroll.", zh: "横向滚动时将该列固定在起始边缘。" } },
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
        { name: "cellPaddingClass", type: "string", default: `"px-3"`, description: { en: "Horizontal cell padding class.", zh: "单元格水平内边距类名。" } },
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
      description: { en: "The header sort arrow indicator for custom `renderHeader` labels.", zh: "表头排序箭头指示器，用于自定义 `renderHeader` 标签。" },
      props: [{ name: "direction", type: `"asc" | "desc" | null`, required: true, description: { en: "Current sort of the column.", zh: "列的当前排序。" } }],
    },
    {
      name: "useControllableState",
      description: { en: "`const [value, setValue] = useControllableState(value, defaultValue, onChange)` gives the table family its controlled-or-uncontrolled state. `tableHeaderLabelClass` and `compareTableValues` are exported too.", zh: "`const [value, setValue] = useControllableState(value, defaultValue, onChange)` 为表格系列提供受控或非受控状态。`tableHeaderLabelClass` 和 `compareTableValues` 也会导出。" },
      props: [],
    },
  ],
} satisfies ComponentDoc
