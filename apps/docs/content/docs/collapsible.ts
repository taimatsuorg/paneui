import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Shows and hides a section of content.", "zh": "展开或收起一段内容。"},
  baseUi: {
    name: "Collapsible",
    href: "https://base-ui.com/react/components/collapsible",
  },
  usage: {
    imports: `import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/ui/collapsible"`,
    code: `<Collapsible>
  <CollapsibleTrigger>Advanced settings</CollapsibleTrigger>
  <CollapsiblePanel>Retry failed tasks automatically.</CollapsiblePanel>
</Collapsible>`,
  },
  composition: `Collapsible
├── CollapsibleTrigger
└── CollapsiblePanel`,
  examples: [
    {
      id: "default-open",
      title: { en: "Default Open", zh: "默认展开" },
    },
    {
      id: "show-more",
      title: { en: "Show More", zh: "显示更多" },
    },
    {
      id: "controlled",
      title: { en: "Controlled", zh: "受控" },
    },
    {
      id: "disabled",
      title: { en: "Disabled", zh: "禁用" },
    },
  ],
  notes: [
    {
      title: "Motion",
      body: { en: "The panel height eases open in 200ms while the content fades in and slides down 4px; the chevron turns 180°. With reduced motion the panel opens instantly.", zh: "面板高度在 200ms 内缓动展开，同时内容淡入并下滑 4px；箭头旋转 180°。在减少动态效果下面板立即打开。" },
    },
    {
      title: "Long content",
      body: { en: "Add `keepMounted` to a panel with long content, such as a whole file. It stays laid out while closed, so a click only animates its height.", zh: "内容很长的面板（例如整份文件）加上 `keepMounted`。关闭时它仍保持布局，点击只需为高度做动画。" },
    },
  ],
  api: [
    {
      name: "Collapsible",
      description: { en: "Unstyled vertical stack; bring your own surface.", zh: "无样式的垂直堆叠；自带表面样式。" },
      extends: "Collapsible.Root",
      extendsHref: "https://base-ui.com/react/components/collapsible#root",
      props: [],
    },
    {
      name: "CollapsibleTrigger",
      description: { en: "A 36px row that tints while open.", zh: "36px 高的行，打开时着色。" },
      extends: "Collapsible.Trigger",
      extendsHref: "https://base-ui.com/react/components/collapsible#trigger",
      props: [
        {
          name: "chevron",
          type: "boolean",
          default: "true",
          description: { en: "Show the trailing chevron that rotates when open.", zh: "显示尾部的箭头，打开时旋转。" },
        },
      ],
      dataAttributes: [{ name: "data-panel-open", description: { en: "Present while the panel is open.", zh: "面板打开时存在。" } }],
    },
    {
      name: "CollapsiblePanel",
      description: { en: "Animates its height; the children sit in an inner wrapper that fades and slides.", zh: "为其高度做动画；子元素位于内部包装器中，会淡入并滑动。" },
      extends: "Collapsible.Panel",
      extendsHref: "https://base-ui.com/react/components/collapsible#panel",
      props: [
        { name: "keepMounted", type: "boolean", default: "false", description: { en: "Keep the content in the page while closed, laid out at zero height and invisible.", zh: "关闭时内容仍保留在页面中，以零高度、不可见的方式布局。" } },
        { name: "typeset", type: 'boolean | "docs" | "reading" | "chat"', default: "false", description: { en: "Turn prose styles back on for the panel content inside a `typeset` container, or name a preset when it stands alone.", zh: "在 `typeset` 容器内为面板内容重新启用 prose 样式，或单独使用时指定预设名称。" } },
      ],
      dataAttributes: [
        { name: "data-starting-style / data-ending-style", description: { en: "Set during the open and close transitions.", zh: "在打开和关闭过渡期间设置。" } },
      ],
    },
  ],
} satisfies ComponentDoc
