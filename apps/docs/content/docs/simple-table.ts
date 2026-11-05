import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "A plain table for reference content like props and tokens.", "zh": "展示属性和主题变量等参考内容。"},
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
├── SimpleTableHeader
│   └── SimpleTableRow
│       └── SimpleTableHead
└── SimpleTableBody
    └── SimpleTableRow
        └── SimpleTableCell   variant`,
  examples: [
    { id: "numbers", title: { en: "Numbers", zh: "数值" },  },
    { id: "comparison", title: { en: "Comparisons", zh: "比较" }, description: { en: "Short values across many columns fit a reading column without scrolling.", zh: "适用于列数较多、单元格内容较短的参考表。" } },
    { id: "markdown", title: { en: "Markdown Tables", zh: "Markdown 表格" }, description: { en: "Map the table elements in your MDX components so GFM tables render as SimpleTable.", zh: "适用于 MDX 中的 Markdown 表格。" } },
    { id: "plain", title: { en: "Plain", zh: "简洁样式" }, description: { en: "Use for long reference lists where column lines add noise.", zh: "适用于列线会显得杂乱的长参考列表。" } },
    { id: "rtl", title: { en: "RTL", zh: "从右到左" },  },
  ],
  notes: [
    {
      title: "When to use",
      body: { en: "For reference content that is read, not worked in: prop tables, token lists, comparisons. For data people sort, select or scroll through, use [Table](/docs/table).", zh: "适用于被阅读而非操作的参考内容：prop 表格、变量列表、对比。对于人们排序、选择或滚动的数据，请使用 [Table](/docs/table)。" },
    },
    {
      title: "Overflow",
      body: { en: "Inline code never breaks inside a word. On screens narrower than 40rem, body-text cells keep an 8rem floor, so a table that doesn't fit scrolls sideways instead of squeezing its prose; wider screens drop the floor, so short tables fit a reading column. Empty cells never get one. `cellMinWidth=\"always\"` keeps the floor everywhere, `\"none\"` removes it, and a `min-w-*` class on the table sets a wider floor for the whole table.", zh: "内联代码永远不会在单词内换行。在窄于 40rem 的屏幕上，正文文本单元格保持 8rem 的下限，因此放不下的表格会横向滚动而不是挤压其文本；更宽的屏幕会取消该下限，因此短表格能适应阅读列。空单元格永远不会获得下限。`cellMinWidth=\"always\"` 在所有地方保持下限，`\"none\"` 移除它，而表格上的 `min-w-*` class 为整个表格设置更宽的下限。" },
    },
    {
      title: "Inline code and alignment",
      body: { en: "Bare `<code>` in `default` and `numeric` cells and in headers gets the inline-code chip, inside or outside prose; code with its own `className` keeps it. `align` is logical: `start` and `end` follow the writing direction. The values Markdown and HTML write work too: `left` (`:--`), `center` (`:-:`) and `right` (`--:`) map to the start edge, the center and the end edge, so they also flip under RTL. A `flex` child, such as a row of buttons, is justified to the same edge. `justify` justifies the text and `char` falls back to start.", zh: "`default` 和 `numeric` 单元格以及表头中的裸 `<code>` 会获得内联代码芯片，无论在 prose 内外；带有自己 `className` 的代码会保留它。`align` 是逻辑值：`start` 和 `end` 跟随书写方向。Markdown 和 HTML 写入的值同样可用：`left` (`:--`)、`center` (`:-:`) 和 `right` (`--:`) 分别映射到起始边缘、中心和结束边缘，在 RTL 下同样翻转。`flex` 子元素（如一排按钮）会对齐到同一边。`justify` 使文本两端对齐，`char` 回退到起始。" },
    },
  ],
  api: [
    {
      name: "SimpleTable",
      extends: "table",
      props: [
        { name: "containerClassName", type: "string", description: { en: "Class for the raised, scrolling surface around the table.", zh: "表格周围凸起、可滚动表面的 class。" } },
        { name: "variant", type: `"sheet" | "plain"`, default: `"sheet"`, description: { en: "`sheet`: the header sits on a tinted band and the body is a sheet over it, with column lines. `plain`: row lines only and a muted header.", zh: "`sheet`：表头位于浅色底带上，表体是覆盖其上的面板，带列线。`plain`：只有行线，表头为次要色。" } },
        { name: "cellMinWidth", type: `"auto" | "always" | "none"`, default: `"auto"`, description: { en: "Floor for body-text cells: 8rem below 40rem of viewport with `auto`, always with `always`, never with `none`.", zh: "正文文本单元格的下限：视口低于 40rem 时为 8rem（`auto`），`always` 时始终，`none` 时从不。" } },
      ],
      dataAttributes: [
        { name: "data-cell-min-width", description: { en: "On the container, the `cellMinWidth` in use.", zh: "在容器上，当前使用的 `cellMinWidth`。" } },
        { name: "data-variant", description: { en: "On the table, `sheet` or `plain`.", zh: "在表格上，`sheet` 或 `plain`。" } },
      ],
    },
    { name: "SimpleTableHeader", extends: "thead", props: [] },
    { name: "SimpleTableBody", extends: "tbody", props: [] },
    { name: "SimpleTableRow", extends: "tr", props: [] },
    {
      name: "SimpleTableHead",
      extends: "th",
      props: [{ name: "align", type: `"start" | "end" | "center" | "left" | "right" | "justify" | "char"`, description: { en: "Logical `start` or `end`, or the Markdown / HTML value: `left` maps to start, `right` to end. A `flex` child is justified to match. Without it, start.", zh: "逻辑值 `start` 或 `end`，或 Markdown / HTML 值：`left` 映射到起始，`right` 到结束。`flex` 子元素随之对齐。没有它时，为起始。" } }],
    },
    {
      name: "SimpleTableCell",
      extends: "td",
      props: [
        {
          name: "variant",
          type: `"default" | "code" | "code-muted" | "type" | "numeric"`,
          default: `"default"`,
          description: { en: "`code` for names, `code-muted` for defaults, `type` for long type strings, `numeric` for aligned numbers.", zh: "`code` 用于名称，`code-muted` 用于默认值，`type` 用于长类型字符串，`numeric` 用于对齐的数字。" },
        },
        { name: "align", type: `"start" | "end" | "center" | "left" | "right" | "justify" | "char"`, description: { en: "Same as `SimpleTableHead`. Without it, the cell follows the table.", zh: "与 `SimpleTableHead` 相同。没有它时，单元格跟随表格。" } },
      ],
    },
  ],
} satisfies ComponentDoc
