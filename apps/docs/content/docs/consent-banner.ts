import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Asks once whether the site may use analytics.", zh: "只询问一次网站能否使用分析工具。" },
  usage: {
    imports: `import { ConsentBanner } from "@/components/ui/consent-banner"`,
    code: `<ConsentBanner
  storageKey="consent:v1"
  policyHref="/privacy"
  onAccept={loadAnalytics}
/>`,
  },
  examples: [
    {
      id: "remember",
      title: { en: "Remember the Answer", zh: "记住选择" },
      description: { en: "Use `storageKey` so the card asks once; `clearConsent` asks again.", zh: "设置 `storageKey` 后卡片只询问一次；`clearConsent` 会重新询问。" },
    },
    {
      id: "markdown",
      title: { en: "Markdown Text and Customize", zh: "Markdown 文本与自定义" },
      description: { en: "Use `onCustomize` when you offer per-purpose settings in your own dialog.", zh: "需要在自己的对话框中按用途设置时，使用 `onCustomize`。" },
    },
  ],
  notes: [
    {
      title: "Placement",
      body: {
        en: "The card joins the bottom stack: full width on phones, a card at the bottom end from the `sm` breakpoint, and below any media bar. `placement=\"inline\"` renders it in place instead.",
        zh: "卡片加入底部堆叠：手机上占满宽度，从 `sm` 断点起为底部末端的卡片，并位于媒体栏下方。`placement=\"inline\"` 则在原位置渲染。",
      },
    },
    {
      title: "Stored answer",
      body: {
        en: "With `storageKey`, Allow and Decline write `accepted` or `declined` to localStorage and the card stays hidden until the key changes or is cleared. Put a version in the key. `readConsent(key)` and `useConsent(key)` read the answer anywhere, `writeConsent` and `clearConsent` change it, and every change fires `paneui:consent` on `window`. The card renders after mount only, because the answer lives in the browser.",
        zh: "设置 `storageKey` 后，“允许”和“拒绝”会把 `accepted` 或 `declined` 写入 localStorage，之后卡片保持隐藏，直到键被更换或清除。请在键中加入版本号。`readConsent(key)` 和 `useConsent(key)` 可在任何地方读取结果，`writeConsent` 和 `clearConsent` 修改它，每次变化都会在 `window` 上触发 `paneui:consent`。卡片只在挂载后渲染，因为选择保存在浏览器中。",
      },
    },
    {
      title: "Text",
      body: {
        en: "Without children the card asks the locale's analytics question. `text` takes inline Markdown (code, emphasis and links; HTML stays text). Allow and Decline carry the same weight, so declining is as easy as allowing.",
        zh: "没有子元素时，卡片显示语言设置中的分析询问文本。`text` 支持行内 Markdown（代码、强调和链接；HTML 按文本显示）。“允许”和“拒绝”分量相同，拒绝和允许一样容易。",
      },
    },
    {
      title: "Accessibility",
      body: {
        en: "The card is a region named “Privacy choices” and never takes focus on its own. Labels come from the locale.",
        zh: "卡片是名为“隐私选项”的区域，不会自行获取焦点。标签来自语言设置。",
      },
    },
  ],
  api: [
    {
      name: "ConsentBanner",
      extends: "div",
      props: [
        { name: "children", type: "ReactNode", description: { en: "The message. Overrides `text`.", zh: "消息内容，优先于 `text`。" } },
        { name: "text", type: "string", description: { en: "The message as inline Markdown.", zh: "以行内 Markdown 书写的消息。" } },
        { name: "policyHref", type: "string", description: { en: "Privacy policy link shown after the message.", zh: "显示在消息后的隐私政策链接。" } },
        { name: "storageKey", type: "string", description: { en: "localStorage key that keeps the answer.", zh: "保存选择的 localStorage 键。" } },
        { name: "open", type: "boolean", description: { en: "Shows or hides the card yourself, ignoring the stored answer.", zh: "自行控制显示或隐藏，忽略已存储的选择。" } },
        { name: "onAccept", type: "() => void", description: { en: "Called on Allow.", zh: "点击“允许”时调用。" } },
        { name: "onDecline", type: "() => void", description: { en: "Called on Decline.", zh: "点击“拒绝”时调用。" } },
        { name: "onCustomize", type: "() => void", description: { en: "Shows a Customize button.", zh: "显示“自定义”按钮。" } },
        { name: "placement", type: `"stack" | "inline"`, default: `"stack"`, description: { en: "Bottom stack or in place.", zh: "放入底部堆叠或原位渲染。" } },
        { name: "order", type: "number", default: "10", description: { en: "Position in the bottom stack.", zh: "在底部堆叠中的位置。" } },
      ],
      dataAttributes: [{ name: "data-leaving", description: { en: "While the card fades out after an answer.", zh: "作答后卡片淡出期间。" } }],
    },
    {
      name: "useConsent",
      description: { en: "The answer for a key, kept current; `undefined` before mount.", zh: "某个键的选择并保持同步；挂载前为 `undefined`。" },
      props: [{ name: "storageKey", type: "string", required: true, description: { en: "The key to read.", zh: "要读取的键。" } }],
    },
    {
      name: "readConsent",
      description: { en: "Returns `\"accepted\"`, `\"declined\"` or `null`.", zh: "返回 `\"accepted\"`、`\"declined\"` 或 `null`。" },
      props: [{ name: "storageKey", type: "string", required: true, description: { en: "The key to read.", zh: "要读取的键。" } }],
    },
    {
      name: "writeConsent",
      description: { en: "Stores an answer and notifies readers.", zh: "存储选择并通知读取方。" },
      props: [
        { name: "storageKey", type: "string", required: true, description: { en: "The key to write.", zh: "要写入的键。" } },
        { name: "value", type: `"accepted" | "declined"`, required: true, description: { en: "The answer.", zh: "选择结果。" } },
      ],
    },
    {
      name: "clearConsent",
      description: { en: "Forgets the answer, so the card asks again.", zh: "清除选择，卡片会再次询问。" },
      props: [{ name: "storageKey", type: "string", required: true, description: { en: "The key to forget.", zh: "要清除的键。" } }],
    },
  ],
} satisfies ComponentDoc
