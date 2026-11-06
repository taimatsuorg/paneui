import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Picks the docs version at the top of a sidebar.", zh: "在侧边栏顶部选择文档版本。" },
  usage: {
    imports: `import { VersionSwitcher } from "@/components/ui/version-switcher"`,
    code: `<VersionSwitcher
  value="v2"
  versions={[
    { value: "v2", label: "v2", href: "/docs", tag: "latest" },
    { value: "v1", label: "v1", href: "/v1/docs", tag: "archived" },
  ]}
/>`,
  },
  examples: [
    {
      id: "tags",
      title: { en: "Tags", zh: "标签" },
      description: { en: "Use a custom tag for states the presets don't cover, such as long-term support.", zh: "预设未覆盖的状态（例如长期支持）可使用自定义标签。" },
    },
  ],
  notes: [
    {
      title: "Links",
      body: {
        en: "Each version is an `<a>`, so it works with any router and opens in a new tab with a modified click. Point `href` at the same page in that version when it exists. The current one has `aria-current=\"page\"` and a check. Without scripts a `<noscript>` row of the same links takes the trigger's place.",
        zh: "每个版本都是一个 `<a>`，可配合任意路由，按住修饰键点击可在新标签页打开。若该版本中有相同页面，让 `href` 指向它。当前版本带 `aria-current=\"page\"` 和对勾。没有脚本时，`<noscript>` 中同样的链接会取代触发器。",
      },
    },
    {
      title: "Tags",
      body: {
        en: "`latest`, `beta` and `archived` are labelled from the locale; any other string shows as written. `VersionTagBadge` renders the same tag elsewhere, such as above an archived page.",
        zh: "`latest`、`beta` 和 `archived` 的文字来自语言设置；其他字符串按原样显示。`VersionTagBadge` 可在其他位置显示相同的标签，例如已归档页面的顶部。",
      },
    },
  ],
  api: [
    {
      name: "VersionSwitcher",
      extends: "button",
      props: [
        { name: "versions", type: "VersionOption[]", required: true, description: { en: "`{ value, label, href, tag? }` per version.", zh: "每个版本一个 `{ value, label, href, tag? }`。" } },
        { name: "value", type: "string", required: true, description: { en: "Value of the version being read.", zh: "正在阅读的版本值。" } },
        {
          name: "onSelect",
          type: "(version: VersionOption, event: MouseEvent) => void",
          description: { en: "Called before the link is followed. Call `event.preventDefault()` to route on the client.", zh: "在打开链接前调用。调用 `event.preventDefault()` 可改由客户端路由。" },
        },
      ],
    },
    {
      name: "VersionTagBadge",
      description: { en: "The tag on its own.", zh: "单独的版本标签。" },
      props: [{ name: "tag", type: `"latest" | "beta" | "archived" | string`, required: true, description: { en: "Preset or custom tag.", zh: "预设或自定义标签。" } }],
    },
  ],
} satisfies ComponentDoc
