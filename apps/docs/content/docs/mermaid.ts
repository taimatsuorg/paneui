import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Renders Mermaid diagrams as themed SVGs or text, with full-screen zoom.", zh: "将 Mermaid 源码渲染为跟随主题的 SVG 或文本图，支持全屏缩放。" },
  usage: {
    imports: `import { Mermaid } from "@/components/ui/mermaid"`,
    code: `<Mermaid
  chart={\`graph LR
    Plan --> Build --> Verify\`}
  caption="Release pipeline"
/>`,
  },
  composition: `Mermaid
└── Diagram (SVG frame, theme resolution, full-screen pan & zoom)`,
  examples: [
    {
      id: "types",
      title: { en: "Diagram Types", zh: "图表类型" },
      description: { en: "Renders flowcharts, state, sequence, class, ER and XY chart diagrams from text.", zh: "从文本源码渲染流程图、状态图、时序图、类图、ER 图和 XY 图表。" },
    },
    {
      id: "themes",
      title: { en: "Themes", zh: "主题预设" },
      description: { en: "Uses live theme tokens by default, or switches to any of the built-in presets.", zh: "默认跟随当前主题令牌，也可切换为内置配色预设。" },
    },
    {
      id: "ascii",
      title: { en: "ASCII and Unicode", zh: "ASCII 与 Unicode" },
      description: { en: "Renders plain Unicode or ASCII box drawings for terminal and Markdown surfaces.", zh: "面向终端或纯文本场景生成 Unicode 或 ASCII 字符框图。" },
    },
  ],
  notes: [
    {
      title: "Credits",
      body: {
        en: "Mermaid rendering is powered by [beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid) by [Craft](https://craft.do) (MIT License), with its ASCII engine derived from [mermaid-ascii](https://github.com/AlexanderGrooff/mermaid-ascii) by Alexander Grooff. The package installs from npm with no runtime network fetches; full licence notice in `THIRD_PARTY_NOTICES.md`.",
        zh: "Mermaid 图表渲染由 [Craft](https://craft.do) 开源的 [beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid)（MIT 许可证）提供支持，其 ASCII 渲染引擎基于 Alexander Grooff 的 [mermaid-ascii](https://github.com/AlexanderGrooff/mermaid-ascii)。组件从 npm 安装，运行时不发起网络请求；完整致谢与许可声明见 `THIRD_PARTY_NOTICES.md`。",
      },
    },
    {
      title: "Diagram types",
      body: {
        en: "Supports flowcharts (`graph TD`, `flowchart LR`, etc.), state diagrams (`stateDiagram-v2`), sequence diagrams (`sequenceDiagram`), class diagrams (`classDiagram`), entity-relationship diagrams (`erDiagram`) and XY charts (`xychart-beta`, including hover tooltips via `interactive`).",
        zh: "支持流程图（`graph TD`、`flowchart LR` 等）、状态图（`stateDiagram-v2`）、时序图（`sequenceDiagram`）、类图（`classDiagram`）、实体关系图（`erDiagram`）以及 XY 图表（`xychart-beta`，支持通过 `interactive` 启用悬停提示）。",
      },
    },
    {
      title: "Themes and dark mode",
      body: {
        en: "`theme=\"auto\"` reads `card`, `foreground`, `primary` and `muted-foreground` from the active `<html>` theme via `Diagram` and updates automatically on light/dark or accent switches with a transparent backdrop. Passing any named preset from `MERMAID_THEMES` applies that palette instead; override any individual role through `colors`.",
        zh: "`theme=\"auto\"` 通过 `Diagram` 读取当前 `<html>` 上的 `card`、`foreground`、`primary` 与 `muted-foreground` 令牌，并在明暗模式或强调色切换时以透明底色自动重绘。传入 `MERMAID_THEMES` 中的预设名可直接应用对应主题，也可通过 `colors` 单独覆盖配色角色。",
      },
    },
    {
      title: "Isolation and bundle size",
      body: {
        en: "The Mermaid parser and ELK layout engine load dynamically when a `Mermaid` diagram mounts. External font `@import` directives are removed, CSS rules inside the SVG are scoped to each figure, and marker ids are prefixed so multiple diagrams on the same page stay isolated. Click any SVG diagram to open full-screen pan and zoom from `Diagram`.",
        zh: "Mermaid 解析器与 ELK 布局引擎仅在挂载 `Mermaid` 时按需动态加载。渲染结果会移除外链字体 `@import`、将 SVG 内样式限定到当前实例，并为标记 ID 添加前缀以避免多图冲突。点击 SVG 即可使用 `Diagram` 的全屏缩放与平移能力。",
      },
    },
  ],
  api: [
    {
      name: "Mermaid",
      description: { en: "Renders Mermaid source as a themed SVG inside `Diagram` or as monospace ASCII/Unicode text.", zh: "在 `Diagram` 外框中将 Mermaid 源码渲染为跟随主题的 SVG，或渲染为等宽 ASCII/Unicode 文本图。" },
      extends: "Diagram",
      props: [
        { name: "chart", type: "string", required: true, description: { en: "Mermaid diagram definition text.", zh: "Mermaid 图表定义文本。" } },
        { name: "theme", type: `"auto" | ThemeName`, default: `"auto"`, description: { en: "`auto` follows the active PaneUI theme tokens; any `MERMAID_THEMES` name uses that built-in preset.", zh: "`auto` 跟随当前 PaneUI 主题令牌；传 `MERMAID_THEMES` 中的名称则使用对应预设。" } },
        { name: "colors", type: `{ bg?, fg?, line?, accent?, muted?, surface?, border?: string }`, description: { en: "Override individual theme colour roles.", zh: "单独覆盖配色角色。" } },
        { name: "format", type: `"svg" | "unicode" | "ascii"`, default: `"svg"`, description: { en: "Render SVG with pan/zoom or monospace box drawings.", zh: "选择可缩放 SVG 或等宽字符画输出。" } },
        { name: "font", type: "string", description: { en: "Font family override inside SVGs (defaults to `--font-sans`).", zh: "覆盖 SVG 内部字体族（默认使用 `--font-sans`）。" } },
        { name: "padding", type: "number", default: "40", description: { en: "SVG canvas padding in pixels.", zh: "SVG 画布内边距（像素）。" } },
        { name: "nodeSpacing", type: "number", default: "24", description: { en: "Horizontal spacing between sibling nodes.", zh: "同层节点之间的水平间距。" } },
        { name: "layerSpacing", type: "number", default: "40", description: { en: "Vertical spacing between layers.", zh: "层级之间的垂直间距。" } },
        { name: "componentSpacing", type: "number", default: "24", description: { en: "Spacing between disconnected subgraphs.", zh: "非连通子图之间的间距。" } },
        { name: "transparent", type: "boolean", description: { en: "Omit the SVG background fill. Defaults to `true` for `auto` and `false` for named presets.", zh: "省略 SVG 背景填充；`auto` 模式下默认为 `true`，命名预设下默认为 `false`。" } },
        { name: "interactive", type: "boolean", default: "false", description: { en: "Enables hover tooltips on `xychart-beta` diagrams.", zh: "在 `xychart-beta` 图表中启用悬停数值提示。" } },
        { name: "asciiOptions", type: `Omit<AsciiRenderOptions, "useAscii" | "colorMode">`, description: { en: "Spacing options passed to `unicode` and `ascii` text output.", zh: "传给 `unicode` 与 `ascii` 文本输出的间距参数。" } },
      ],
    },
    {
      name: "renderMermaidDiagram",
      description: { en: "Async framework-free helper returning a scoped SVG string (`theme?`, `scopeId?`, and `RenderOptions`).", zh: "无框架异步辅助函数，返回经过作用域隔离的 SVG 字符串。" },
      props: [
        { name: "chart", type: "string", required: true, description: { en: "Mermaid diagram definition text.", zh: "Mermaid 图表定义文本。" } },
        { name: "options", type: "RenderOptions & { theme?: ThemeName; scopeId?: string }", description: { en: "Theme preset name, custom scope prefix and SVG layout options.", zh: "主题预设名、作用域前缀与 SVG 布局选项。" } },
      ],
    },
    {
      name: "renderMermaidText",
      description: { en: "Async helper returning Unicode or plain ASCII box-drawing output.", zh: "异步辅助函数，返回 Unicode 或纯 ASCII 字符框图。" },
      props: [
        { name: "chart", type: "string", required: true, description: { en: "Mermaid diagram definition text.", zh: "Mermaid 图表定义文本。" } },
        { name: "options", type: "AsciiRenderOptions", description: { en: "Character set and spacing options.", zh: "字符集与间距配置。" } },
      ],
    },
  ],
} satisfies ComponentDoc
