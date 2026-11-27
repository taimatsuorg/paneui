import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Semantic HTML table with sticky headers, pinned columns and scroll fades.", zh: "语义化 HTML 表格，支持固定表头、固定列与滚动渐隐。" },
  usage: {
    imports: `import {
  SimpleTable,
  SimpleTableBody,
  SimpleTableCell,
  SimpleTableHead,
  SimpleTableHeader,
  SimpleTableRow,
} from "@/components/ui/simple-table"`,
    code: `<SimpleTable>
  <SimpleTableHeader>
    <SimpleTableRow>
      <SimpleTableHead>Prop</SimpleTableHead>
      <SimpleTableHead>Description</SimpleTableHead>
    </SimpleTableRow>
  </SimpleTableHeader>
  <SimpleTableBody>
    <SimpleTableRow>
      <SimpleTableCell variant="code">size</SimpleTableCell>
      <SimpleTableCell>Height and padding.</SimpleTableCell>
    </SimpleTableRow>
  </SimpleTableBody>
</SimpleTable>`,
  },
  composition: `SimpleTable
├── SimpleTableCaption
├── SimpleTableHeader
│   └── SimpleTableRow
│       └── SimpleTableHead
├── SimpleTableBody
│   └── SimpleTableRow
│       └── SimpleTableCell   variant
└── SimpleTableFooter
    └── SimpleTableRow
        └── SimpleTableCell`,
  examples: [
    { id: "compact", title: { en: "Compact with Footer", zh: "紧凑尺寸与表尾" }, description: { en: "Use `size=\"sm\"` with `SimpleTableFooter` and `SimpleTableCaption` for dense summaries.", zh: "使用 `size=\"sm\"` 搭配 `SimpleTableFooter` 和 `SimpleTableCaption` 展示紧凑汇总。" } },
    { id: "pinned", title: { en: "Sticky Header and Pinned Column", zh: "固定表头与列" }, description: { en: "Keep the header and leading column visible while scrolling wide data.", zh: "横向和纵向滚动宽表时保持表头和首列可见。" } },
    { id: "numbers", title: { en: "Numbers", zh: "数值" } },
    { id: "comparison", title: { en: "Comparisons", zh: "比较" }, description: { en: "Short values across many columns fit a reading column without scrolling.", zh: "适用于列数较多、单元格内容较短的参考表。" } },
    { id: "markdown", title: { en: "Markdown Tables", zh: "Markdown 表格" }, description: { en: "Map the table elements in your MDX components so GFM tables render as SimpleTable.", zh: "适用于 MDX 中的 Markdown 表格。" } },
    { id: "plain", title: { en: "Unframed Default", zh: "无框默认样式" }, description: { en: "Use `variant=\"default\"` for horizontal row lines without an outer card frame.", zh: "使用 `variant=\"default\"` 展示无外框的水平行线表格。" } },
    { id: "rtl", title: { en: "RTL", zh: "从右到左" } },
  ],
  notes: [
    {
      title: "When to use",
      body: { en: "For structured reference tables, invoices and compact read-only views. For large virtualized lists with sorting, selection or filtering, use [Table](/docs/table).", zh: "适用于结构化参考表格、账单和紧凑只读视图。对于需要排序、选择、过滤的大量虚拟滚动数据，请使用 [Table](/docs/table)。" },
    },
    {
      title: "Overflow and scroll hints",
      body: { en: "Inline code never breaks inside a word. When the table overflows horizontally or vertically, the scroll container becomes keyboard-focusable (`tabIndex=0`) and tracks `data-scrolled-start`, `data-scrolled-end` and `data-scrolled-top`. When no columns are pinned, `scrollFade` softly fades overflowing horizontal edges.", zh: "内联代码永远不会在单词内换行。当表格横向或纵向溢出时，滚动容器会自动支持键盘聚焦（`tabIndex=0`）并更新 `data-scrolled-start`、`data-scrolled-end` 和 `data-scrolled-top`；未固定列时，`scrollFade` 会在溢出边缘呈现柔和渐隐。" },
    },
    {
      title: "Inline code and alignment",
      body: { en: "Bare `<code>` in `default` and `numeric` cells and in headers gets the inline-code chip; code with its own `className` keeps it. `align` is logical (`start`, `end`, `left`, `center`, `right`) so Markdown alignments flip under RTL automatically.", zh: "`default` 和 `numeric` 单元格以及表头中的裸 `<code>` 会获得内联代码芯片；带有自定义 `className` 的代码保留原样式。`align` 为逻辑对齐（`start`、`end`、`left`、`center`、`right`），在 RTL 下会自动镜像翻转。" },
    },
  ],
  api: [
    {
      name: "SimpleTable",
      extends: "table",
      props: [
        { name: "variant", type: `"surface" | "default" | "grid"`, default: `"surface"`, description: { en: "`surface` frames the table with horizontal row lines and a subtle header band; `default` keeps unframed row lines; `grid` adds column dividers.", zh: "`surface` 为带水平行线和浅色表头的圆角卡片框；`default` 为无外框的水平行线；`grid` 增加列分隔线。" } },
        { name: "size", type: `"default" | "sm"`, default: `"default"`, description: { en: "Controls header height and cell padding.", zh: "控制表头高度与单元格内边距。" } },
        { name: "wrap", type: "boolean", default: "true", description: { en: "Allow cell text to wrap onto multiple lines. Pass `false` for single-line scrolling.", zh: "允许单元格文本自动换行；传入 `false` 保持单行并启用横向滚动。" } },
        { name: "stickyHeader", type: "boolean", default: "false", description: { en: "Stick the header row when the container scrolls vertically.", zh: "容器纵向滚动时将表头固定在顶部。" } },
        { name: "scrollFade", type: "boolean", default: "true", description: { en: "Fade horizontal scroll edges when no column is pinned.", zh: "在无固定列时淡出横向溢出边缘。" } },
        { name: "cellMinWidth", type: `"auto" | "always" | "none"`, default: `"auto"`, description: { en: "Floor for body-text cells on narrow screens.", zh: "窄屏下正文单元格的最小宽度。" } },
        { name: "containerClassName", type: "string", description: { en: "Class for the outer table frame (pass height caps like `max-h-64` here).", zh: "外层容器的 class（可在此传入 `max-h-64` 等高度限制）。" } },
        { name: "containerRef", type: "Ref<HTMLDivElement>", description: { en: "Ref forwarded to the internal scroll element.", zh: "转发到内部滚动容器的 ref。" } },
      ],
      dataAttributes: [
        { name: "data-variant", description: { en: "Resolved variant (`surface`, `default`, or `grid`).", zh: "当前使用的样式变体。" } },
        { name: "data-size", description: { en: "Density size (`default` or `sm`).", zh: "当前的密度尺寸。" } },
        { name: "data-nowrap", description: { en: "Present when `wrap` is `false`.", zh: "当 `wrap` 为 `false` 时存在。" } },
        { name: "data-scrolled-start", description: { en: "Present on the scroll container when scrolled away from the start edge.", zh: "滚动离开起始边缘时位于滚动容器上。" } },
        { name: "data-scrolled-end", description: { en: "Present on the scroll container while more content remains at the end edge.", zh: "末尾仍有可滚动内容时位于滚动容器上。" } },
        { name: "data-scrolled-top", description: { en: "Present on the scroll container when scrolled vertically.", zh: "纵向滚动离开顶部时位于滚动容器上。" } },
        { name: "data-overflowing", description: { en: "Present on the scroll container when scrolling is active.", zh: "表格出现溢出可滚动时位于滚动容器上。" } },
      ],
    },
    { name: "SimpleTableHeader", extends: "thead", props: [] },
    { name: "SimpleTableBody", extends: "tbody", props: [] },
    { name: "SimpleTableFooter", extends: "tfoot", props: [] },
    { name: "SimpleTableRow", extends: "tr", props: [] },
    {
      name: "SimpleTableHead",
      extends: "th",
      props: [
        { name: "align", type: `"start" | "end" | "center" | "left" | "right" | "justify" | "char"`, description: { en: "Logical alignment (`left` maps to start, `right` to end).", zh: "逻辑对齐方向（`left` 映射为起始，`right` 为结束）。" } },
        { name: "pinned", type: `"start" | "end"`, description: { en: "Stick this header cell to the start or end edge.", zh: "将该表头单元格固定在起始或末尾边缘。" } },
        { name: "pinnedEdge", type: "boolean", description: { en: "Show a soft edge shadow when content scrolls underneath.", zh: "当内容滚动到下方时显示柔和边缘阴影。" } },
      ],
    },
    {
      name: "SimpleTableCell",
      extends: "td",
      props: [
        {
          name: "variant",
          type: `"default" | "code" | "code-muted" | "type" | "numeric"`,
          default: `"default"`,
          description: { en: "Formatting preset (`code`, `code-muted`, `type`, or `numeric`).", zh: "预设格式（`code`、`code-muted`、`type` 或 `numeric`）。" },
        },
        { name: "align", type: `"start" | "end" | "center" | "left" | "right" | "justify" | "char"`, description: { en: "Logical cell alignment.", zh: "逻辑单元格对齐方式。" } },
        { name: "pinned", type: `"start" | "end"`, description: { en: "Stick this cell to the start or end edge.", zh: "将该单元格固定在起始或末尾边缘。" } },
        { name: "pinnedEdge", type: "boolean", description: { en: "Show a soft edge shadow when content scrolls underneath.", zh: "当内容滚动到下方时显示柔和边缘阴影。" } },
      ],
    },
    { name: "SimpleTableCaption", extends: "caption", props: [] },
  ],
} satisfies ComponentDoc
