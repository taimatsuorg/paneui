import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Lets readers switch the site's language from the header.", zh: "让读者在页头切换网站语言。" },
  usage: {
    imports: `import { LocaleSwitcher } from "@/components/ui/locale-switcher"`,
    code: `<LocaleSwitcher
  value="en"
  locales={[
    { code: "en", label: "English", href: "/docs" },
    { code: "ja", label: "日本語", href: "/ja/docs" },
  ]}
/>`,
  },
  examples: [
    {
      id: "icon",
      title: { en: "Icon Only", zh: "仅图标" },
      description: { en: "Use in phone headers where the label doesn't fit.", zh: "适用于放不下文字的手机页头。" },
    },
    {
      id: "client-routing",
      title: { en: "Client Routing", zh: "客户端路由" },
      description: { en: "Use when your router should switch pages without a reload.", zh: "适用于由路由器在不刷新的情况下切换页面。" },
    },
  ],
  notes: [
    {
      title: "Links",
      body: {
        en: "Each option is an `<a>` with `href`, `hreflang` and `lang`, so it opens in a new tab with a modified click and needs no handler. The current one has `aria-current=\"page\"` and a check. Without scripts the menu can't open, so a `<noscript>` row of the same links takes its place.",
        zh: "每个选项都是带 `href`、`hreflang` 和 `lang` 的 `<a>`，按住修饰键点击可在新标签页打开，无需处理函数。当前语言带 `aria-current=\"page\"` 和对勾。没有脚本时菜单无法打开，`<noscript>` 中同样的链接会显示在原位。",
      },
    },
    {
      title: "Labels",
      body: {
        en: "Write each label in its own language (`Deutsch`, not `German`), so readers find theirs whatever page they are on. Set `dir: \"rtl\"` on right-to-left labels. The trigger's accessible name and the menu heading come from the locale.",
        zh: "每个标签用该语言本身书写（写 `Deutsch` 而不是 `German`），读者在任何页面都能找到自己的语言。从右到左的标签设置 `dir: \"rtl\"`。触发器的无障碍名称和菜单标题来自语言设置。",
      },
    },
    {
      title: "Right to left",
      body: {
        en: "The popup aligns to the trigger's end edge in the reading direction, so it stays on screen in a mirrored header.",
        zh: "弹出层按阅读方向对齐触发器的末端边缘，在镜像的页头中也不会超出屏幕。",
      },
    },
  ],
  api: [
    {
      name: "LocaleSwitcher",
      extends: "button",
      props: [
        { name: "locales", type: "LocaleOption[]", required: true, description: { en: "`{ code, label, href, lang?, dir? }` per language.", zh: "每种语言一个 `{ code, label, href, lang?, dir? }`。" } },
        { name: "value", type: "string", required: true, description: { en: "Code of the current language.", zh: "当前语言的代码。" } },
        { name: "size", type: `"default" | "icon"`, default: `"default"`, description: { en: "`icon` shows only the globe.", zh: "`icon` 只显示地球图标。" } },
        { name: "align", type: `"start" | "center" | "end"`, default: `"end"`, description: { en: "Popup alignment to the trigger.", zh: "弹出层相对触发器的对齐方式。" } },
        {
          name: "onSelect",
          type: "(locale: LocaleOption, event: MouseEvent) => void",
          description: { en: "Called before the link is followed. Call `event.preventDefault()` to route on the client.", zh: "在打开链接前调用。调用 `event.preventDefault()` 可改由客户端路由。" },
        },
      ],
      dataAttributes: [{ name: "data-size", description: { en: "`default` or `icon`.", zh: "`default` 或 `icon`。" } }],
    },
  ],
} satisfies ComponentDoc
