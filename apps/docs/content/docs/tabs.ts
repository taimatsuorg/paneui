import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Switches between related panels of content in one place.", "zh": "在相关内容面板间切换。"},
  baseUi: {
    name: "Tabs",
    href: "https://base-ui.com/react/components/tabs",
  },
  usage: {
    imports: `import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs"`,
    code: `<Tabs defaultValue="account">
  <TabsList>
    <TabsTab value="account">Account</TabsTab>
    <TabsTab value="billing">Billing</TabsTab>
  </TabsList>
  <TabsPanel value="account">Your profile and sign-in.</TabsPanel>
  <TabsPanel value="billing">Invoices and payment.</TabsPanel>
</Tabs>`,
  },
  composition: `Tabs
├── TabsList
│   └── TabsTab
└── TabsPanel`,
  examples: [
    {
      id: "controlled",
      title: { en: "Controlled", zh: "受控" },
      description: { en: "Use when the URL or other UI decides which tab is open.", zh: "适用于标签页由网址或其他控件决定的场景。" },
    },
    {
      id: "disabled",
      title: { en: "Disabled", zh: "禁用" },
    },
    {
      id: "full-width",
      title: { en: "Full Width", zh: "全宽" },
    },
    {
      id: "vertical",
      title: { en: "Vertical", zh: "纵向" },
      description: { en: "Use for settings pages with many sections.", zh: "适用于包含多个分区的设置页。" },
    },
    {
      id: "icon-only",
      title: { en: "Icon Only", zh: "仅图标" },
    },
    { id: "sizes", title: { en: "Sizes", zh: "尺寸" }, description: { en: "Match the toolbar the tabs sit in.", zh: "与所在工具栏的样式保持一致。" } },
    { id: "underline", title: { en: "Underline", zh: "下划线" }, description: { en: "Use for page-level sections, where a filled track would compete with the content.", zh: "适用于页面级分区。" } },
    { id: "ghost", title: { en: "Ghost", zh: "无底" }, description: { en: "Use inside a card header, where the card already draws the edge.", zh: "用于卡片头部，边界由卡片提供。" } },
    {
      id: "rtl",
      title: { en: "RTL", zh: "从右到左" },
    },
  ],
  notes: [
    {
      title: "Motion",
      body: { en: "The indicator slides over 300ms ease-out. Under `prefers-reduced-motion: reduce` it jumps without sliding.", zh: "指示器以 300ms ease-out 滑动。在 `prefers-reduced-motion: reduce` 下它直接跳转，不滑动。" },
    },
    {
      title: "Keyboard",
      body: { en: "`ArrowLeft` / `ArrowRight` (or `ArrowUp` / `ArrowDown` when vertical) move focus between tabs (looping), `Home` / `End` jump to the ends, and `Enter` or `Space` activates the focused tab.", zh: "`ArrowLeft` / `ArrowRight`（垂直时 `ArrowUp` / `ArrowDown`）在标签之间移动焦点（循环），`Home` / `End` 跳到两端，`Enter` 或 `Space` 激活聚焦的标签。" },
    },
  ],
  api: [
    {
      name: "Tabs",
      description: { en: "Column wrapper with a 12px gap between list and panels; a row when vertical.", zh: "列容器，列表和面板之间间距 12px；垂直时为行。" },
      extends: "Tabs.Root",
      extendsHref: "https://base-ui.com/react/components/tabs#root",
      props: [
        { name: "defaultValue", type: "any", default: "0", description: { en: "Tab selected on first render.", zh: "首次渲染时选中的标签。" } },
        { name: "value", type: "any", description: { en: "Controlled selected tab.", zh: "受控选中的标签。" } },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: { en: "Lays the list out as a row or a column; the indicator and arrow keys follow it.", zh: "将列表布局为行或列；指示器和方向键随之变化。" },
        },
        {
          name: "onValueChange",
          type: "(value: any, eventDetails) => void",
          description: { en: "Called when the selected tab changes.", zh: "选中的标签变化时调用。" },
        },
      ],
    },
    {
      name: "TabsList",
      description: { en: "Segmented track. Renders the sliding indicator after its children; a row that overflows scrolls sideways.", zh: "分段轨道。在其子元素之后渲染滑动指示器；放不下时横向滚动。" },
      extends: "Tabs.List",
      extendsHref: "https://base-ui.com/react/components/tabs#list",
      props: [
        { name: "size", type: `"xs" | "sm" | "default" | "lg"`, default: `"default"`, description: { en: "Height 24 / 28 / 32 / 36px for the list, the Button heights. Applies to every tab.", zh: "列表高度 24 / 28 / 32 / 36px，对应 Button 高度。应用于每个标签。" } },
        { name: "variant", type: `"default" | "underline" | "ghost"`, default: `"default"`, description: { en: "`default` is a raised chip on a flat grey track; `underline` is a 2px bar on a hairline; `ghost` is a soft fill with no track.", zh: "`default` 是浅灰轨道上的凸起滑块；`underline` 是细线上的 2px 条；`ghost` 是无轨道的柔和填充。" } },
        {
          name: "activateOnFocus",
          type: "boolean",
          default: "false",
          description: { en: "Select a tab as soon as it receives keyboard focus.", zh: "标签获得键盘焦点时立即选中。" },
        },
        { name: "loopFocus", type: "boolean", default: "true", description: { en: "Wrap arrow-key focus at the ends.", zh: "在两端循环方向键焦点。" } },
      ],
      dataAttributes: [{ name: "data-size", description: { en: "The `size` value.", zh: "`size` 值。" } }, { name: "data-variant", description: { en: "The `variant` value.", zh: "`variant` 值。" } }],
    },
    {
      name: "TabsTab",
      description: { en: "Sizes its icons to 16px.", zh: "将其图标大小设为 16px。" },
      extends: "Tabs.Tab",
      extendsHref: "https://base-ui.com/react/components/tabs#tab",
      props: [
        { name: "value", type: "any", description: { en: "Matches the `TabsPanel` it shows.", zh: "匹配它显示的 `TabsPanel`。" }, required: true },
        { name: "disabled", type: "boolean", default: "false", description: { en: "Dim the tab, block selection and skip it in the keyboard order.", zh: "使标签变暗，阻止选择并在键盘顺序中跳过它。" } },
      ],
      dataAttributes: [
        { name: "data-active", description: { en: "Present on the selected tab.", zh: "在选中的标签上存在。" } },
        { name: "data-disabled", description: { en: "Present when disabled.", zh: "禁用时存在。" } },
        { name: "data-orientation", description: { en: "`horizontal` or `vertical`, from the root.", zh: "`horizontal` 或 `vertical`，来自根元素。" } },
      ],
    },
    {
      name: "TabsPanel",
      extends: "Tabs.Panel",
      extendsHref: "https://base-ui.com/react/components/tabs#panel",
      props: [
        { name: "value", type: "any", description: { en: "The `TabsTab` value that shows this panel.", zh: "显示此面板的 `TabsTab` 值。" }, required: true },
        { name: "keepMounted", type: "boolean", default: "false", description: { en: "Keep the panel in the DOM while hidden.", zh: "隐藏时让面板保留在 DOM 中。" } },
        { name: "typeset", type: 'boolean | "docs" | "reading" | "chat"', default: "false", description: { en: "Turn prose styles back on for the panel content inside a `typeset` container, or name a preset when it stands alone.", zh: "在 `typeset` 容器内为面板内容重新启用 prose 样式，或单独使用时指定预设名称。" } },
      ],
    },
  ],
} satisfies ComponentDoc
