import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Browses, filters and acts on a set of rows.", zh: "浏览、筛选并处理数据行。" },
  usage: {
    imports: `import { DataTable, DataTableRowActions, type DataTableColumn } from "@/components/ui/data-table"`,
    code: `<DataTable
  aria-label="Customers"
  data={customers}
  columns={columns}
  getRowId={(c) => c.id}
  filters={[{ key: "status", label: "Status", options: [{ value: "active", label: "Active" }] }]}
  selectable
  bulkActions={(rows, clear) => <Button size="sm" onClick={clear}>Export {rows.length}</Button>}
  onRowClick={({ row }) => open(row)}
/>`,
  },
  examples: [
    { id: "pinned", title: { en: "Pinned Columns", zh: "固定列" }, description: { en: "Pass `pinStart` to keep selection checkboxes and leading data fixed during horizontal scrolling.", zh: "启用 `pinStart` 可在横向滚动时固定复选框和起始数据列。" } },
    { id: "loading", title: { en: "Loading Skeleton", zh: "加载骨架态" }, description: { en: "Pass `loading` while initial data is fetching.", zh: "首次加载数据时传入 `loading` 显示骨架行。" } },
    { id: "empty", title: { en: "Empty State", zh: "空白状态" } },
  ],
  notes: [
    { title: "What it adds to Table", body: { en: "It builds on [Table](/docs/table), adding search with quick Escape clear, faceted filters, column visibility, pinned start columns, skeleton loading states and screen-reader status announcements.", zh: "基于 [Table](/docs/table) 构建，补齐了带一键清除和 Escape 重置的搜索、分面筛选、列显隐、固定起始列、骨架加载态和读屏状态播报。" } },
    { title: "Data flow", body: { en: "Everything runs on the client from filter to search, sort and pagination. Selection survives paging. For server-side data, page and filter on the server and render Table directly.", zh: "全部流程在客户端完成：过滤、搜索、排序与分页，选择状态在翻页时保留。服务端分页场景可直接使用 Table。" } },
    { title: "Narrow containers", body: { en: "The toolbar follows the table's own width, not the window's. Below 40rem the search takes its own row, and when the filter buttons can't share a row with your `toolbar` controls they fold into one Filter menu. Below 28rem the pager switches to its compact form.", zh: "工具栏跟随表格自身宽度，而不是窗口宽度。低于 40rem 时搜索独占一行，当过滤按钮无法与你的 `toolbar` 控件共享一行时，它们折叠成一个 Filter 菜单。低于 28rem 时分页器切换到紧凑形式。" } },
    { title: "Row actions and selection", body: { en: "Put `DataTableRowActions` with `MenuItem`s in an actions column so clicks inside it stay isolated from `onRowClick`. Hold Shift and click or drag across checkboxes to select a range.", zh: "将 `DataTableRowActions` 放在操作列中以避免触发 `onRowClick`。按住 Shift 点击或拖过复选框可连续选择范围。" } },
  ],
  api: [
    {
      name: "DataTable",
      props: [
        { name: "data", type: "readonly T[]", required: true, description: { en: "All rows.", zh: "所有行。" } },
        { name: "columns", type: "readonly DataTableColumn<T>[]", required: true, description: { en: "Table columns plus `label` (menu name) and `hideable`.", zh: "Table 列加上 `label`（菜单名称）和 `hideable`。" } },
        { name: "getRowId", type: "(row: T, index: number) => string", required: true, description: { en: "Stable id per row.", zh: "每行的稳定 id。" } },
        { name: "searchText", type: "((row: T) => string) | false", description: { en: "Text the search matches. Default reads every string or number field. Pass `false` to hide search.", zh: "搜索匹配的文本，默认读取所有字符串/数字字段；传入 `false` 隐藏搜索栏。" } },
        { name: "searchPlaceholder", type: "string", default: `"Search…"`, description: { en: "Also its accessible name.", zh: "也是其无障碍名称。" } },
        { name: "filters", type: "DataTableFilter<T>[]", description: { en: "Faceted multi-select filters, each `{ key, label, options, accessor? }`.", zh: "分面多选过滤器，每个 `{ key, label, options, accessor? }`。" } },
        { name: "defaultSort", type: "SortState", description: { en: "Starting sort.", zh: "初始排序。" } },
        { name: "defaultHiddenColumns", type: "string[]", description: { en: "Columns hidden at first.", zh: "首次隐藏的列。" } },
        { name: "defaultPageSize", type: "number", default: "10", description: { en: "Rows per page.", zh: "每页行数。" } },
        { name: "pageSizeOptions", type: "number[]", default: "[10, 20, 50]", description: { en: "Rows-per-page choices.", zh: "每页行数选项。" } },
        { name: "selectable", type: "boolean", default: "false", description: { en: "Checkbox column and selection bar.", zh: "复选框列和选择栏。" } },
        { name: "swipeSelect", type: "boolean", default: "true", description: { en: "Drag across checkboxes with Shift held to select a range.", zh: "按住 Shift 拖过复选框连续选区。" } },
        { name: "selectedRowIds / onSelectionChange", type: "string[] / (ids) => void", description: { en: "Controlled selection.", zh: "受控选择。" } },
        { name: "pinStart", type: "boolean | readonly string[]", default: "false", description: { en: "Pin the first data column (with `true`) or named column keys to the start edge.", zh: "传入 `true` 固定首个数据列，或传入列名数组固定指定起始列。" } },
        { name: "loading", type: "boolean", default: "false", description: { en: "Render skeleton placeholder rows while fetching.", zh: "加载数据时显示骨架占位行。" } },
        { name: "loadingRows", type: "number", default: "5", description: { en: "Number of skeleton rows shown while `loading`.", zh: "在 `loading` 期间显示的骨架行数。" } },
        { name: "size", type: `"default" | "sm"`, default: `"default"`, description: { en: "Control density for cells and headers.", zh: "控制表头和行内边距密度。" } },
        { name: "bulkActions", type: "(rows: T[], clear: () => void) => ReactNode", description: { en: "Controls in the selection bar.", zh: "选择栏中的控件。" } },
        { name: "toolbar", type: "ReactNode", description: { en: "Extra controls at the end of the toolbar.", zh: "工具栏末尾的额外控件。" } },
        { name: "emptyState", type: "ReactNode", description: { en: "Shown when `data` is empty.", zh: "当 `data` 为空时显示。" } },
        { name: "noun", type: "string", default: `"rows"`, description: { en: "Used in the footer and empty copy.", zh: "用于页脚和空状态的文案。" } },
        { name: "rowHeight", type: "number", default: "48", description: { en: "Row height in px (defaults to 36 when `size=\"sm\"`).", zh: "行高，单位 px（`size=\"sm\"` 时默认 36）。" } },
        { name: "variant", type: `"plain" | "surface"`, default: `"plain"`, description: { en: "`plain` keeps headers on the card surface; `surface` adds a subtle muted header band.", zh: "`plain` 让表头保持卡片底色；`surface` 添加浅灰表头底带。" } },
        { name: "onRowClick", type: "(ctx, event) => void", description: { en: "Row click, e.g. to open a detail drawer.", zh: "行点击，例如打开详情抽屉。" } },
      ],
    },
    { name: "DataTableRowActions", description: { en: "⋯ menu for a row; children are MenuItems.", zh: "行的 ⋯ 菜单；子项为 MenuItems。" }, props: [{ name: "label", type: "string", default: `"Row actions"`, description: { en: "Accessible name of the trigger.", zh: "触发器的无障碍名称。" } }] },
  ],
} satisfies ComponentDoc
