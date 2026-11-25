import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Frames a piece of UI as a desktop app window.", zh: "把一段界面装进桌面应用窗口。" },
  usage: {
    imports: `import { WindowFrame, WindowFrameBar, WindowFrameBody, WindowFrameTitle } from "@/components/ui/window-frame"`,
    code: `<WindowFrame>
  <WindowFrameBar>
    <WindowFrameTitle>Northwind</WindowFrameTitle>
  </WindowFrameBar>
  <WindowFrameBody>…</WindowFrameBody>
</WindowFrame>`,
  },
  composition: `WindowFrame
├── WindowFrameBar
│   ├── WindowFrameControls (added for you)
│   ├── WindowFrameTitle
│   └── WindowFrameActions
└── WindowFrameBody`,
  examples: [
    { id: "glass", title: { en: "Glass", zh: "玻璃" }, description: { en: "Use over pictures and tinted sections.", zh: "用于图片或有底色的区块上。" } },
    { id: "centered-title", title: { en: "Centred title", zh: "居中标题" } },
    { id: "no-controls", title: { en: "Without controls", zh: "无窗口按钮" } },
  ],
  notes: [
    { title: "Corners", body: { en: "The body is inset 6px and its corner is the frame's minus that inset, so the two stay concentric under the theme radius.", zh: "主体内缩 6px，其圆角为外框圆角减去该内缩值，因此两者在主题圆角下保持同心。" } },
    { title: "Decoration only", body: { en: "The window dots are hidden from assistive tech and do nothing. Put real controls in `WindowFrameActions`.", zh: "窗口圆点对辅助技术隐藏且不执行任何操作。请将真实控件放在 `WindowFrameActions` 中。" } },
  ],
  api: [
    {
      name: "WindowFrame",
      extends: "div",
      props: [
        { name: "variant", type: `"solid" | "glass"`, default: `"solid"`, description: { en: "`glass` is a translucent, blurred shell for use over pictures.", zh: "`glass` 是一种半透明、模糊的外壳，用于图片上方。" } },
        { name: "size", type: `"sm" | "default"`, default: `"default"`, description: { en: "Title bar height: 32px or 36px.", zh: "标题栏高度：32px 或 36px。" } },
      ],
      dataAttributes: [
        { name: "data-variant", description: { en: "The variant.", zh: "变体。" } },
        { name: "data-size", description: { en: "The size.", zh: "尺寸。" } },
      ],
    },
    { name: "WindowFrameBar", extends: "div", props: [{ name: "controls", type: "boolean", default: "true", description: { en: "Starts the bar with the three window dots.", zh: "以三个窗口圆点开始标题栏。" } }] },
    { name: "WindowFrameTitle", extends: "span", props: [{ name: "align", type: `"start" | "center"`, default: `"start"`, description: { en: "`center` puts the title on a chip in the middle of the bar.", zh: "`center` 将标题放在栏中间的芯片上。" } }] },
    { name: "WindowFrameActions", description: { en: "Pushed to the end of the bar.", zh: "推到栏的末尾。" }, extends: "span", props: [] },
    { name: "WindowFrameControls", description: { en: "The three dots, for a custom bar.", zh: "三个圆点，用于自定义栏。" }, extends: "span", props: [] },
    { name: "WindowFrameBody", description: { en: "The content area. Give it a height or let its content size it.", zh: "内容区域。给它一个高度，或让其内容决定其尺寸。" }, extends: "div", props: [] },
  ],
} satisfies ComponentDoc
