import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Collects a short message and mood from users without leaving the page.", zh: "在当前页面收集用户反馈。" },
  usage: {
    imports: `import { FeedbackWidget } from "@/components/feedback-widget"`,
    code: `<FeedbackWidget strategy="fixed" onSubmit={async ({ message, mood }) => send(message, mood)} />`,
  },
  examples: [
    {
      id: "inline",
      title: { en: "Inline", zh: "内嵌" },
      description: { en: "Use at the end of an article, where a corner trigger would cover the text on phones.", zh: "适合放在文章末尾；在手机上，角落按钮会遮住正文。" },
    },
  ],
  notes: [
    { title: "Placement", body: { en: "`floating` (default) opens from a corner trigger and closes itself after sending. `inline` stays in the flow: picking a mood opens the note and Send in place, a mood alone can be sent, and the thanks line stays.", zh: "`floating`（默认）从角落按钮展开，发送后自动收起。`inline` 留在正文中：选择心情后原地展开备注和发送按钮，只选心情也可发送，感谢提示会保留。" } },
    { title: "Sending", body: { en: "Return a promise from `onSubmit` to show the sending state; reject it to show the retry state and the error line.", zh: "`onSubmit` 返回 promise 时显示发送中状态；promise 被拒绝时显示重试状态和错误提示。" } },
    { title: "Keyboard", body: { en: "Arrow keys move between moods; Cmd or Ctrl + Enter sends from the note. In the floating form Escape closes it and focus returns to the trigger.", zh: "方向键在心情间移动；在备注中按 Cmd 或 Ctrl + Enter 发送。浮动表单中按 Escape 关闭，焦点回到触发按钮。" } },
    { title: "Labels", body: { en: "Default strings come from `LocaleProvider` (`feedback`, `helpUsImprove`, `wasThisPageHelpful`, `sending` and the mood names); the props below win over them.", zh: "默认文案来自 `LocaleProvider`（`feedback`、`helpUsImprove`、`wasThisPageHelpful`、`sending` 和心情名称）；下列 props 优先于它们。" } },
  ],
  api: [
    {
      name: "FeedbackWidget",
      props: [
        { name: "onSubmit", type: "(data: { message: string; mood: FeedbackMood | null }) => void | Promise<void>", description: { en: "Called on send.", zh: "发送时调用。" } },
        { name: "placement", type: `"floating" | "inline"`, default: `"floating"`, description: { en: "Corner trigger or in the page flow.", zh: "角落按钮或嵌在页面中。" } },
        { name: "position", type: `"bottom-right" | "bottom-left"`, default: `"bottom-right"`, description: { en: "Floating only. The corner.", zh: "仅浮动。所在角落。" } },
        { name: "strategy", type: `"absolute" | "fixed"`, default: `"absolute"`, description: { en: "Floating only. `fixed` pins to the viewport.", zh: "仅浮动。`fixed` 固定在视口上。" } },
        { name: "label", type: "ReactNode", description: { en: "Floating only. Trigger text.", zh: "仅浮动。触发按钮文字。" } },
        { name: "bordered", type: "boolean", default: "true", description: { en: "Inline only. The rule above the question; turn it off when the next section already draws one.", zh: "仅内嵌。问题上方的分隔线；相邻区块已有分隔线时可关闭。" } },
        { name: "title", type: "ReactNode", description: { en: "Form heading; inline, the question.", zh: "表单标题；内嵌时为问题。" } },
        { name: "placeholder", type: "string", description: { en: "Note placeholder.", zh: "备注占位文字。" } },
        { name: "successTitle", type: "ReactNode", description: { en: "Shown after sending.", zh: "发送后显示。" } },
        { name: "successDescription", type: "ReactNode", description: { en: "Second line after sending.", zh: "发送后的第二行。" } },
      ],
      dataAttributes: [
        { name: "data-placement", description: { en: "`floating` or `inline`.", zh: "`floating` 或 `inline`。" } },
        { name: "data-bordered", description: { en: "Inline, while the top rule shows.", zh: "内嵌且显示顶部分隔线时。" } },
        { name: "data-state", description: { en: "`closed`, `open`, `sending`, `sent` or `error`.", zh: "`closed`、`open`、`sending`、`sent` 或 `error`。" } },
      ],
    },
  ],
} satisfies ComponentDoc
