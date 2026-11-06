import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Styles long-form text in docs, articles and chat messages.", "zh": "为长篇正文设置排版。"},
  usage: {
    imports: `/* packages/tokens/styles/globals.css, after Tailwind */
@import "./typeset.css";`,
    code: `<article className="typeset typeset-docs">{content}</article>`,
  },
  examples: [
    {
      id: "content-slots",
      title: { en: "Prose in Tabs", zh: "标签页正文" },
    },
    {
      id: "nested",
      title: { en: "Nested Panels", zh: "嵌套面板" },
    },
  ],
  api: [],
  notes: [
    {
      title: "Presets",
      body: { en: "Use `typeset-docs` for notes and guides (14px), `typeset-reading` for articles (16px, set in the serif face) and `typeset-chat` for messages and streamed answers (14px, tighter flow). Each preset sets `--typeset-size`, `--typeset-leading` and `--typeset-flow` (reading also sets `--typeset-font-body`), so a one-off works too: `className=\"typeset [--typeset-flow:1.5em]\"`.", zh: "注释和指南使用 `typeset-docs`（14px），文章使用 `typeset-reading`（16px，衬线字体），消息和流式回答使用 `typeset-chat`（14px，更紧凑的流）。每个预设设置 `--typeset-size`、`--typeset-leading` 和 `--typeset-flow`（reading 还设置 `--typeset-font-body`），因此一次性的也可用：`className=\"typeset [--typeset-flow:1.5em]\"`。" },
    },
    {
      title: "Components inside prose",
      body: { en: "Every library component carries `data-slot` and is skipped automatically. Wrap anything else in `not-typeset`. Utilities on an element override the typeset styles without `!important`.", zh: "每个库组件都带有 `data-slot`，会被自动跳过。将其他内容包裹在 `not-typeset` 中。元素上的工具类无需 `!important` 即可覆盖 typeset 样式。" },
    },
    {
      title: "Prose inside components",
      body: { en: "A component slot with `.typeset` or `data-typeset` styles its own content as prose again, inheriting the surrounding preset; components inside it stay skipped. `TabsPanel`, `AccordionPanel`, `CollapsiblePanel` and `CardContent` take a `typeset` prop that sets the attribute (and lets the accordion content keep the prose size and colour). `data-typeset=\"docs\"`, `\"reading\"` or `\"chat\"` picks a preset where there is no container. Re-enabling works three levels deep.", zh: "带有 `.typeset` 或 `data-typeset` 的组件插槽会再次将其内容作为散文排版，并继承周围的预设；其中的组件仍被跳过。`TabsPanel`、`AccordionPanel`、`CollapsiblePanel` 和 `CardContent` 接受一个 `typeset` prop，用于设置该属性（并让手风琴内容保持散文的字号和颜色）。`data-typeset=\"docs\"`、`\"reading\"` 或 `\"chat\"` 在没有容器时选择预设。重新启用最多可深入三层。" },
    },
    {
      title: "Streaming",
      body: { en: "Spacing only flows downward (`margin-block-start`), so a new block never restyles the ones above it.", zh: "间距只向下流动（`margin-block-start`），因此新块不会重新设置上方块的样式。" },
    },
    {
      title: "Math",
      body: { en: "Block math (`math[display=\"block\"]` or `.katex-display`) gets the wider block space and scrolls sideways when a formula is too wide. Inline `.katex` is set at 1.1em and takes the text colour, in both themes. Import the math renderer's stylesheet into a lower layer, such as `@import \"…\" layer(base);`, so these rules win.", zh: "块级公式（`math[display=\"block\"]` 或 `.katex-display`）使用较宽的块间距，公式过宽时横向滚动。行内 `.katex` 字号为 1.1em，并在两种主题下继承文字颜色。请把公式渲染器的样式表导入较低的层，例如 `@import \"…\" layer(base);`，以便这些规则生效。" },
    },
    {
      title: "Width",
      body: { en: "Typeset sets no max width; add `max-w-reading` (68ch) on the container.", zh: "Typeset 不设置最大宽度；在容器上添加 `max-w-reading`（68ch）。" },
    },
  ],
} satisfies ComponentDoc
