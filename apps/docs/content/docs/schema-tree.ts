import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Lists schema properties in a table that nests objects and arrays.", zh: "以可嵌套对象和数组的表格列出 schema 属性。" },
  usage: {
    imports: `import { SchemaTree } from "@/components/ui/schema-tree"`,
    code: `<SchemaTree
  schema={{
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", description: "The pet's name." },
      tags: { type: "array", items: { type: "string" } },
    },
  }}
/>`,
  },
  examples: [
    {
      id: "options",
      title: { en: "One Of", zh: "多选一" },
      description: { en: "Use when a field takes one of several shapes.", zh: "适用于字段可取几种不同结构之一的情况。" },
    },
    {
      id: "stacked",
      title: { en: "Narrow Column", zh: "窄栏" },
    },
    {
      id: "markdown",
      title: { en: "Markdown Descriptions", zh: "Markdown 说明" },
      description: { en: "Use when schema descriptions are written in Markdown and arrive as strings.", zh: "适用于 schema 说明以 Markdown 书写、以字符串传入的情况。" },
    },
    {
      id: "render",
      title: { en: "Custom Descriptions", zh: "自定义说明" },
      description: { en: "Use when you already have a renderer, or descriptions need more than inline Markdown.", zh: "适用于已有渲染器，或说明需要超出行内 Markdown 的格式。" },
    },
  ],
  notes: [
    {
      title: "Schema",
      body: { en: "Reads `type` (a string or a list), `properties`, `required` (names on the parent, or `true` on the property), `items`, `enum`, `const`, `default`, `format`, `title`, `description`, `readOnly`, `deprecated`, `nullable`, `oneOf` and `anyOf`. Resolve `$ref` before passing the schema in; other keywords are ignored.", zh: "读取 `type`（字符串或列表）、`properties`、`required`（父级上的名称列表，或属性自身的 `true`）、`items`、`enum`、`const`、`default`、`format`、`title`、`description`、`readOnly`、`deprecated`、`nullable`、`oneOf` 和 `anyOf`。传入前先解析 `$ref`；其他关键字会被忽略。" },
    },
    {
      title: "Types",
      body: { en: "Arrays show their items' type with `[]` (`Pet[]` when the items have a `title`, `object[]` otherwise), a `format` shows as `string<date-time>`, and a list of types or `nullable` joins with `|`. An array row expands to its items' properties. `schemaTypeLabel` returns the same label for your own layout.", zh: "数组显示元素类型加 `[]`（元素有 `title` 时为 `Pet[]`，否则为 `object[]`），`format` 显示为 `string<date-time>`，类型列表或 `nullable` 以 `|` 连接。数组行展开后显示元素的属性。`schemaTypeLabel` 返回同样的标签，可用于自定义布局。" },
    },
    {
      title: "Layout",
      body: { en: "The tree is its own size container. From 32rem wide it shows property, type and description columns that line up across every level; below that each row stacks its name and type over its description, so it reads on a 390px phone without scrolling sideways. `layout=\"stacked\"` keeps the stacked rows at any width.", zh: "树本身是尺寸容器。宽度达到 32rem 时显示属性、类型、说明三列，各层级对齐；更窄时每行把名称和类型叠在说明上方，在 390px 的手机上无需横向滚动。`layout=\"stacked\"` 在任何宽度下都保持堆叠。" },
    },
    {
      title: "Accessibility",
      body: { en: "Rows use table roles with the property name as the row header; in the stacked layout the column headers stay available to screen readers. An expandable name is a button with `aria-expanded`. Options are tabs, so arrow keys move between them. Marker and column labels come from the locale.", zh: "各行使用表格角色，属性名为行标题；堆叠布局下列标题仍对读屏可用。可展开的名称是带 `aria-expanded` 的按钮。选项使用标签页，可用方向键切换。标记和列标题文字来自语言设置。" },
    },
  ],
  api: [
    {
      name: "SchemaTree",
      extends: "div",
      props: [
        { name: "schema", type: "SchemaNode", required: true, description: { en: "An object schema. An array schema shows its items.", zh: "对象 schema。数组 schema 会显示其元素。" } },
        { name: "defaultExpandDepth", type: "number", default: "1", description: { en: "Rows above this depth start open.", zh: "深度小于该值的行初始展开。" } },
        { name: "layout", type: `"auto" | "stacked"`, default: `"auto"`, description: { en: "Columns from 32rem of the tree's width, or always stacked.", zh: "树宽达到 32rem 时分列，或始终堆叠。" } },
        { name: "renderName", type: "(row: SchemaRowContext) => ReactNode", description: { en: "Replaces the property name.", zh: "替换属性名。" } },
        { name: "renderType", type: "(row: SchemaRowContext) => ReactNode", description: { en: "Replaces the type label.", zh: "替换类型标签。" } },
        { name: "renderDescription", type: "(row: SchemaRowContext) => ReactNode", description: { en: "Replaces the description, for example with your own Markdown renderer. Wins over `descriptionFormat`.", zh: "替换说明，例如使用你自己的 Markdown 渲染器。优先于 `descriptionFormat`。" } },
        { name: "descriptionFormat", type: `"text" | "markdown"`, default: `"text"`, description: { en: "`markdown` renders code, emphasis, strong and links in string descriptions. HTML stays text; links keep http(s), relative and `#` targets only.", zh: "`markdown` 在字符串说明中渲染代码、强调、加粗和链接。HTML 保持为文本；链接只保留 http(s)、相对路径和 `#` 目标。" } },
      ],
      dataAttributes: [
        { name: "data-layout", description: { en: "The layout prop.", zh: "layout 属性。" } },
        { name: "data-depth", description: { en: "On each row, its nesting level from 0.", zh: "在每行上，表示从 0 开始的嵌套层级。" } },
        { name: "data-open", description: { en: "On an expandable row while it is open.", zh: "在可展开行展开时。" } },
      ],
    },
    {
      name: "SchemaRowContext",
      description: { en: "What a render override receives.", zh: "渲染覆盖函数收到的参数。" },
      props: [
        { name: "name", type: "string", description: { en: "Property name; empty for an option without properties.", zh: "属性名；没有属性的选项为空。" } },
        { name: "path", type: "string", description: { en: "Names from the root, with `[]` for array levels.", zh: "从根开始的名称路径，数组层级记为 `[]`。" } },
        { name: "depth", type: "number", description: { en: "Nesting level from 0.", zh: "从 0 开始的嵌套层级。" } },
        { name: "required", type: "boolean", description: { en: "Whether the parent requires it.", zh: "父级是否要求必填。" } },
        { name: "schema", type: "SchemaNode", description: { en: "The property's schema.", zh: "该属性的 schema。" } },
      ],
    },
    {
      name: "schemaTypeLabel",
      description: { en: "Returns the type label a row shows.", zh: "返回行中显示的类型标签。" },
      props: [{ name: "schema", type: "SchemaNode", required: true, description: { en: "The schema to label.", zh: "要生成标签的 schema。" } }],
    },
  ],
} satisfies ComponentDoc
