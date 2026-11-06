import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Announces news in a bar above the site header.", zh: "在网站页头上方用横条发布公告。" },
  usage: {
    imports: `import { Banner } from "@/components/ui/banner"`,
    code: `<Banner storageKey="banner:v2-launch">
  Version 2 is out. Read the <a href="/changelog">release notes</a>.
</Banner>`,
  },
  examples: [
    {
      id: "tones",
      title: { en: "Tones", zh: "色调" },
      description: { en: "Use `warning` only for news that affects people now, such as downtime.", zh: "`warning` 只用于当下会影响用户的消息，例如停机维护。" },
    },
    {
      id: "link",
      title: { en: "Whole-Bar Link", zh: "整条链接" },
      description: { en: "Use when the bar points to one page.", zh: "适用于整条横条只指向一个页面的情况。" },
    },
    {
      id: "persistent",
      title: { en: "Remember Dismissal", zh: "记住关闭" },
      description: { en: "Use for site-wide news that people should only have to close once.", zh: "适用于用户只需关闭一次的全站公告。" },
    },
  ],
  notes: [
    {
      title: "Dismissal",
      body: { en: "With `storageKey`, closing the bar writes the key to localStorage and the bar stays hidden on later visits. Put a version in the key (`banner:v3`) and change it to show a new message to people who closed the last one. Without a key, the bar closes for the current page view only.", zh: "设置 `storageKey` 后，关闭横条会把该键写入 localStorage，之后访问时横条保持隐藏。在键中加入版本号（如 `banner:v3`），更换版本即可向关闭过旧消息的用户显示新消息。不设键时，只在当前页面中关闭。" },
    },
    {
      title: "No flash on server-rendered pages",
      body: { en: "Add `<BannerScript storageKey=\"banner:v3\" />` to the document head, or put `bannerScript(\"banner:v3\")` in your own inline script. It runs before paint and adds the key to `data-banner-dismissed` on `<html>`; each bar renders the one CSS rule that hides it while its key is listed, so a closed bar never appears. Without the script the bar hides right after hydration.", zh: "在文档 head 中加入 `<BannerScript storageKey=\"banner:v3\" />`，或在自己的内联脚本中放入 `bannerScript(\"banner:v3\")`。它在首次绘制前运行，把键加入 `<html>` 的 `data-banner-dismissed`；每个横条会输出一条 CSS 规则，在其键被列出时隐藏自己，因此已关闭的横条不会闪现。不加脚本时，横条会在水合后立即隐藏。" },
    },
    {
      title: "Content",
      body: { en: "Links and `code` inside the message are styled for each tone. With `href` the whole bar is one link, so leave other links out of the message.", zh: "消息中的链接和 `code` 会按色调设置样式。设置 `href` 后整条横条就是一个链接，消息中不要再放其他链接。" },
    },
    {
      title: "Accessibility",
      body: { en: "The bar is a region named “Announcement” and the dismiss button has its own label, both from the locale. Closing collapses the bar's height; under reduced motion it fades out instead.", zh: "横条是名为“公告”的区域，关闭按钮有独立的标签，二者都来自语言设置。关闭时横条高度收起；开启减少动态效果时改为淡出。" },
    },
  ],
  api: [
    {
      name: "Banner",
      extends: "div",
      props: [
        { name: "tone", type: `"primary" | "neutral" | "warning"`, default: `"primary"`, description: { en: "Colour of the bar.", zh: "横条的颜色。" } },
        { name: "href", type: "string", description: { en: "Makes the whole bar a link.", zh: "让整条横条成为链接。" } },
        { name: "linkProps", type: "ComponentProps<\"a\">", description: { en: "Props for the whole-bar link, such as `target`.", zh: "整条链接的属性，例如 `target`。" } },
        { name: "storageKey", type: "string", description: { en: "localStorage key that remembers a dismissal.", zh: "记录关闭状态的 localStorage 键。" } },
        { name: "dismissible", type: "boolean", default: "storageKey != null", description: { en: "Shows the dismiss button.", zh: "显示关闭按钮。" } },
        { name: "onDismiss", type: "() => void", description: { en: "Called when the bar is closed.", zh: "横条关闭时调用。" } },
      ],
      dataAttributes: [
        { name: "data-tone", description: { en: "The tone.", zh: "色调。" } },
        { name: "data-banner-key", description: { en: "The storage key, matched by the hiding rule.", zh: "存储键，供隐藏规则匹配。" } },
        { name: "data-leaving", description: { en: "While the bar collapses after a dismissal.", zh: "关闭后横条收起期间。" } },
      ],
    },
    {
      name: "BannerScript",
      description: { en: "The inline head script as an element.", zh: "以元素形式提供的内联 head 脚本。" },
      props: [
        { name: "storageKey", type: "string | string[]", required: true, description: { en: "Every key the page's banners use.", zh: "页面上横条使用的所有键。" } },
        { name: "nonce", type: "string", description: { en: "Nonce for a content security policy.", zh: "内容安全策略所需的 nonce。" } },
      ],
    },
    {
      name: "bannerScript",
      description: { en: "Returns the same script as a string, for your own `<script>` tag.", zh: "以字符串返回同一段脚本，用于自己的 `<script>` 标签。" },
      props: [{ name: "storageKey", type: "string | string[]", required: true, description: { en: "Every key the page's banners use.", zh: "页面上横条使用的所有键。" } }],
    },
    {
      name: "clearBannerDismissal",
      description: { en: "Forgets a dismissal, so the bar shows again on its next render.", zh: "清除关闭记录，横条在下次渲染时重新显示。" },
      props: [{ name: "storageKey", type: "string", required: true, description: { en: "The key to forget.", zh: "要清除的键。" } }],
    },
  ],
} satisfies ComponentDoc
