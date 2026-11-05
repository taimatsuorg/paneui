import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Compares features across plans with included and excluded marks.", zh: "按套餐对比功能，标出包含与不包含。" },
  usage: {
    imports: `import { ComparisonTable } from "@/components/ui/comparison-table"`,
    code: `<ComparisonTable
  plans={[
    { id: "personal", name: "Personal" },
    { id: "team", name: "Team", highlighted: true },
  ]}
  features={[
    { label: "Unlimited projects", values: { personal: true, team: true } },
    { label: "Shared workspace", values: { personal: false, team: true } },
  ]}
/>`,
  },
  examples: [
    {
      id: "highlighted",
      title: { en: "Recommended Plan", zh: "推荐套餐" },
      description: { en: "Use on a pricing page to point at the plan most people pick.", zh: "适用于定价页，突出多数人选择的套餐。" },
    },
    {
      id: "sections",
      title: { en: "Sections", zh: "分组" },
      description: { en: "Use when the list is long enough to need headings.", zh: "适用于需要小标题分隔的长列表。" },
    },
    {
      id: "sticky",
      title: { en: "Sticky Header and Column", zh: "固定表头与首列" },
      description: { en: "Use when there are more plans or features than fit on screen.", zh: "适用于套餐或功能多到一屏放不下的情况。" },
    },
  ],
  notes: [
    {
      title: "Values",
      body: { en: "`true` draws the included check, `false`, `null` or a missing value draws the excluded dash, and anything else (a string, a number, a node) is shown as is. Both marks carry a screen-reader label (`Included` / `Not included`, from the locale).", zh: "`true` 显示包含的对勾，`false`、`null` 或缺省值显示不包含的短横，其他值（字符串、数字、节点）原样显示。两种标记都带有读屏文字（来自语言设置的“包含”/“不包含”）。" },
    },
    {
      title: "Semantics",
      body: { en: "A real `table`: plan names are column headers, feature labels are row headers and section headings span the row as `colgroup` headers, so screen readers announce the feature and plan with each mark.", zh: "使用原生 `table`：套餐名是列标题，功能名是行标题，分组标题以 `colgroup` 标题跨整行，读屏会随每个标记读出功能与套餐。" },
    },
    {
      title: "Scrolling",
      body: { en: "The surface scrolls both ways. `stickyHeader` needs `maxHeight` to have something to stick to; `stickyFeatureColumn` keeps the labels in view when the plans scroll sideways. Sticky cells paint the band opaquely so rows pass under them cleanly.", zh: "外层表面可双向滚动。`stickyHeader` 需要配合 `maxHeight` 才会生效；`stickyFeatureColumn` 在套餐横向滚动时让功能名保持可见。固定单元格以不透明底色绘制，行从其下方滑过时不会透出。" },
    },
  ],
  api: [
    {
      name: "ComparisonTable",
      extends: "table",
      props: [
        { name: "plans", type: "ComparisonPlan[]", required: true, description: { en: "Columns: `{ id, name, detail?, badge?, highlighted? }`.", zh: "列：`{ id, name, detail?, badge?, highlighted? }`。" } },
        { name: "features", type: "ComparisonFeature[]", description: { en: "Rows: `{ label, hint?, values }`, with one value per plan id.", zh: "行：`{ label, hint?, values }`，每个套餐 id 对应一个值。" } },
        { name: "sections", type: "ComparisonSection[]", description: { en: "Rows grouped under heading rows, `{ label?, features }`. Used instead of `features`.", zh: "按标题行分组的行，`{ label?, features }`。代替 `features` 使用。" } },
        { name: "featureHeader", type: "ReactNode", default: `"Feature"`, description: { en: "Header of the label column.", zh: "功能列的标题。" } },
        { name: "highlight", type: "string", description: { en: "Plan id to tint. Overrides `highlighted` on the plans.", zh: "要着色的套餐 id，优先于套餐上的 `highlighted`。" } },
        { name: "stickyHeader", type: "boolean", default: "false", description: { en: "Keep the header row in view inside `maxHeight`.", zh: "在 `maxHeight` 内滚动时固定表头。" } },
        { name: "stickyFeatureColumn", type: "boolean", default: "false", description: { en: "Keep the label column in view while scrolling sideways.", zh: "横向滚动时固定功能列。" } },
        { name: "maxHeight", type: "number | string", description: { en: "Height of the scrolling surface.", zh: "滚动表面的高度。" } },
        { name: "containerClassName", type: "string", description: { en: "Class for the raised, scrolling surface.", zh: "凸起的滚动表面的 class。" } },
      ],
      dataAttributes: [{ name: "data-highlighted", description: { en: "On the header and cells of the highlighted plan.", zh: "在被突出套餐的表头和单元格上。" } }],
    },
    {
      name: "ComparisonMark",
      description: { en: "The mark for one value, for building your own layout.", zh: "单个值的标记，可用于自定义布局。" },
      props: [{ name: "value", type: "ComparisonValue", required: true, description: { en: "`true`, `false` / `null`, or content to show.", zh: "`true`、`false` / `null`，或要显示的内容。" } }],
    },
  ],
} satisfies ComponentDoc
