import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Browses, filters and acts on a set of rows.", "zh": "浏览、筛选并处理数据行。"},
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
  examples: [{ id: "empty", title: { en: "Empty State", zh: "空白状态" },  }],
  notes: [
    { title: "What it adds to Table", body: { en: "It builds on [Table](/docs/table). Columns are Table columns plus `label` and `hideable`, and `toolbar` adds your own controls.", zh: "它基于 [Table](/docs/table) 构建。列是 Table 列加上 `label` 和 `hideable`，`toolbar` 添加你自己的控件。" } },
    { title: "Data flow", body: { en: "Everything runs on the client: filter → search → sort → page. Selection survives paging. For server-side data, page and filter on the server and render Table directly.", zh: "一切在客户端运行：过滤 → 搜索 → 排序 → 分页。选择在分页时保留。对于服务器端数据，在服务器上分页和过滤并直接渲染 Table。" } },
    { title: "Narrow containers", body: { en: "The toolbar follows the table's own width, not the window's. Below 40rem the search takes its own row, and when the filter buttons can't share a row with your `toolbar` controls they fold into one Filter menu. Below 28rem the pager switches to its compact form.", zh: "工具栏跟随表格自身宽度，而不是窗口宽度。低于 40rem 时搜索独占一行，当过滤按钮无法与你的 `toolbar` 控件共享一行时，它们折叠成一个 Filter 菜单。低于 28rem 时分页器切换到紧凑形式。" } },
    { title: "Row actions", body: { en: "Put `DataTableRowActions` with `MenuItem`s in an actions column; clicks inside it don't trigger `onRowClick`.", zh: "将 `DataTableRowActions` 与 `MenuItem` 放在操作列中；点击其内部不会触发 `onRowClick`。" } },
  ],
  api: [
    {
      name: "DataTable",
      props: [
        { name: "data", type: "readonly T[]", required: true, description: { en: "All rows.", zh: "所有行。" } },
        { name: "columns", type: "readonly DataTableColumn<T>[]", required: true, description: { en: "Table columns plus `label` (menu name) and `hideable`.", zh: "Table 列加上 `label`（菜单名称）和 `hideable`。" } },
        { name: "getRowId", type: "(row: T, index: number) => string", required: true, description: { en: "Stable id per row.", zh: "每行的稳定 id。" } },
        { name: "searchText", type: "((row: T) => string) | false", description: { en: "Text the search matches. Default: every string / number field. `false` hides search.", zh: "搜索匹配的文本。默认：每个字符串/数字字段。`false` 隐藏搜索。" } },
        { name: "searchPlaceholder", type: "string", default: `"Search…"`, description: { en: "Also its accessible name.", zh: "也是其无障碍名称。" } },
        { name: "filters", type: "DataTableFilter<T>[]", description: { en: "Faceted multi-select filters, each `{ key, label, options, accessor? }`.", zh: "分面多选过滤器，每个 `{ key, label, options, accessor? }`。" } },
        { name: "defaultSort", type: "SortState", description: { en: "Starting sort.", zh: "初始排序。" } },
        { name: "defaultHiddenColumns", type: "string[]", description: { en: "Columns hidden at first.", zh: "首次隐藏的列。" } },
        { name: "defaultPageSize", type: "number", default: "10", description: { en: "Rows per page.", zh: "每页行数。" } },
        { name: "pageSizeOptions", type: "number[]", default: "[10, 20, 50]", description: { en: "Rows-per-page choices.", zh: "每页行数选项。" } },
        { name: "selectable", type: "boolean", default: "false", description: { en: "Checkbox column and selection bar.", zh: "复选框列和选择栏。" } },
        { name: "selectedRowIds / onSelectionChange", type: "string[] / (ids) => void", description: { en: "Controlled selection.", zh: "受控选择。" } },
        { name: "bulkActions", type: "(rows: T[], clear: () => void) => ReactNode", description: { en: "Controls in the selection bar.", zh: "选择栏中的控件。" } },
        { name: "toolbar", type: "ReactNode", description: { en: "Extra controls at the end of the toolbar.", zh: "工具栏末尾的额外控件。" } },
        { name: "emptyState", type: "ReactNode", description: { en: "Shown when `data` is empty.", zh: "当 `data` 为空时显示。" } },
        { name: "noun", type: "string", default: `"rows"`, description: { en: "Used in the footer and empty copy.", zh: "用于页脚和空状态的文案。" } },
        { name: "rowHeight", type: "number", default: "48", description: { en: "Row height in px.", zh: "行高，单位为 px。" } },
        { name: "variant", type: `"sheet" | "plain"`, default: `"sheet"`, description: { en: "The table's look, as on [Table](/docs/table).", zh: "表格样式，同 [Table](/docs/table)。" } },
        { name: "onRowClick", type: "(ctx, event) => void", description: { en: "Row click, e.g. to open a detail drawer.", zh: "行点击，例如打开详情抽屉。" } },
      ],
    },
    { name: "DataTableRowActions", description: { en: "⋯ menu for a row; children are MenuItems.", zh: "行的 ⋯ 菜单；子项为 MenuItems。" }, props: [{ name: "label", type: "string", default: `"Row actions"`, description: { en: "Accessible name of the trigger.", zh: "触发器的无障碍名称。" } }] },
  ],
} satisfies ComponentDoc
