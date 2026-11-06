import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Stacks bars and cards pinned to the bottom of the screen.", zh: "把固定在屏幕底部的横条和卡片依次堆叠。" },
  usage: {
    imports: `import { BottomStack, BottomStackItem } from "@/components/ui/bottom-stack"`,
    code: `<BottomStackItem>
  <SaveBar />
</BottomStackItem>`,
  },
  composition: "BottomStack (optional)\n└── BottomStackItem",
  examples: [
    {
      id: "own-item",
      title: { en: "Your Own Bar", zh: "自定义横条" },
      description: {
        en: "Wrap any bottom bar in `BottomStackItem`. Elements outside the stack lift above it with `--bottom-overlay-offset`.",
        zh: "把任意底部横条包在 `BottomStackItem` 中。堆叠之外的元素用 `--bottom-overlay-offset` 让到它上方。",
      },
    },
  ],
  notes: [
    {
      title: "Where items go",
      body: {
        en: "Items portal into one fixed column at the bottom of the viewport, above the safe-area inset, with an 8px gap. Without a `BottomStack` the first item creates the column on `<body>` and removes it when the last one leaves. Mount `BottomStack` once to place it yourself, for example above a tab bar. Items rendered inside a `BottomStack` always join that one; with `className=\"absolute\"` a stack stays inside its positioned container, as in these previews. `ConsentBanner` and `MediaBar` join the stack on their own.",
        zh: "条目通过 portal 放入视口底部的一列固定容器中，位于安全区之上，间距 8px。没有 `BottomStack` 时，第一个条目会在 `<body>` 上创建这一列，最后一个条目离开时移除。挂载一次 `BottomStack` 可自行放置它，例如放在标签栏上方。在 `BottomStack` 内渲染的条目总是加入该堆叠；加上 `className=\"absolute\"` 后堆叠留在其定位容器内，就像这些预览一样。`ConsentBanner` 和 `MediaBar` 会自动加入堆叠。",
      },
    },
    {
      title: "Offset for other overlays",
      body: {
        en: "While it holds items, the stack writes the height it covers to `--bottom-overlay-offset` on `<html>` (on the container for a stack that is not fixed). Toast and the fixed feedback widget already read it; give your own floating elements `bottom: calc(var(--bottom-overlay-offset, 0px) + 1rem)`.",
        zh: "堆叠中有条目时，它会把所占高度写入 `<html>` 上的 `--bottom-overlay-offset`（非固定定位的堆叠写在其容器上）。Toast 和固定定位的反馈组件已读取该值；自己的悬浮元素可设置 `bottom: calc(var(--bottom-overlay-offset, 0px) + 1rem)`。",
      },
    },
    {
      title: "Order",
      body: {
        en: "Items keep their mount order unless `order` is set; a higher value sits closer to the bottom edge. The consent card defaults to 10, so it stays at the edge under a media bar.",
        zh: "未设置 `order` 时条目按挂载顺序排列；数值越大越靠近底边。同意卡片默认为 10，因此总在媒体栏下方、紧贴底边。",
      },
    },
  ],
  api: [
    {
      name: "BottomStack",
      description: { en: "The column, placed by you. Optional.", zh: "由你放置的堆叠列，可选。" },
      extends: "div",
      props: [],
    },
    {
      name: "BottomStackItem",
      description: { en: "Puts its children in the stack. Renders nothing on the server.", zh: "把子元素放入堆叠。服务端不渲染。" },
      extends: "div",
      props: [
        { name: "order", type: "number", default: "0", description: { en: "Position in the stack; higher sits closer to the bottom edge.", zh: "在堆叠中的位置，数值越大越靠近底边。" } },
      ],
    },
  ],
} satisfies ComponentDoc
