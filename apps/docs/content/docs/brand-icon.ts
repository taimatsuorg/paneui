import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Shows brand logos.", "zh": "显示品牌标志。"},
  usage: {
    imports: `import { siGithub } from "simple-icons"

import { BrandIcon } from "@/components/ui/brand-icon"`,
    code: `<BrandIcon icon={siGithub} />`,
  },
  examples: [
    { id: "colors", title: { en: "Colors", zh: "颜色" },  },
    { id: "sizes", title: { en: "Sizes", zh: "尺寸" } },
    { id: "sign-in", title: { en: "Sign-in Buttons", zh: "登录按钮" } },
    { id: "integrations", title: { en: "Integrations", zh: "集成" } },
    { id: "own-marks", title: { en: "Your Own Marks", zh: "自定义标志" }, description: { en: "Use for a brand the package leaves out, or for your own product.", zh: "适用于自己的产品或图标集中没有的品牌。" } },
  ],
  notes: [
    {
      title: "Bundle size",
      body: { en: "Import each logo by name (`import { siGithub } from \"simple-icons\"`). The package is marked side-effect free, so only the logos you import reach the bundle. Avoid `import * as icons` and slug lookups in app code: the full set is several megabytes.", zh: "按名称导入每个 logo（`import { siGithub } from \"simple-icons\"`）。该包标记为无副作用，因此只有你导入的 logo 会进入打包。避免在应用代码中使用 `import * as icons` 和 slug 查找：完整集合有数兆字节。" },
    },
    {
      title: "Brands that are not in the package",
      body: { en: "Brands whose owners asked for removal or never gave permission are not in the package: Microsoft and its products (Teams, Outlook, Azure, VS Code, LinkedIn, Xbox), Amazon and AWS, OpenAI, Salesforce and Slack, Adobe, Oracle and Java, IBM, Twilio and Yahoo, among others. Use the brand's own asset under its guidelines, or a neutral glyph from the icon set (the templates use one for the Codex agent). A few ship with this item in `@paneui/ui/lib/brand-marks`, in the same shape; every other mark comes from the package.", zh: "所有者要求移除或从未给予许可的品牌不在包中：Microsoft 及其产品（Teams、Outlook、Azure、VS Code、LinkedIn、Xbox）、Amazon 和 AWS、OpenAI、Salesforce 和 Slack、Adobe、Oracle 和 Java、IBM、Twilio 和 Yahoo 等。根据品牌指南使用品牌自己的资产，或使用图标集中的中性字形（模板为 Codex 代理使用了一个）。其中少数随本组件提供在 `@paneui/ui/lib/brand-marks` 中，结构相同；其余标志都来自图标包。" },
    },
    {
      title: "Dark marks",
      body: { en: "With `color=\"brand\"`, near-black logos (GitHub, Vercel, X) switch to the foreground colour in dark mode and near-white ones do the same in light mode, so no logo disappears on either theme.", zh: "使用 `color=\"brand\"` 时，近黑色 logo（GitHub、Vercel、X）在深色模式下切换到前景色，近白色 logo 在浅色模式下同样如此，因此没有 logo 在任一主题下消失。" },
    },
    {
      title: "Trademarks",
      body: { en: "The logos belong to their owners. Showing one says which service a feature connects to; it does not imply endorsement. Check each brand's guidelines before using its colour or mark more prominently.", zh: "logo 属于其所有者。显示一个表示某功能连接到哪个服务；并不暗示认可。在使用其颜色或更显眼地使用其标志之前，请查看每个品牌的指南。" },
    },
    {
      title: "Accessibility",
      body: { en: "Without `title` the logo is hidden from assistive tech, which is right when a visible name sits next to it. Pass `title` for a logo that stands alone.", zh: "没有 `title` 时，logo 对辅助技术隐藏，当旁边有可见名称时这是正确的。对于单独存在的 logo，请传递 `title`。" },
    },
  ],
  api: [
    {
      name: "BrandIcon",
      description: { en: "One brand logo on the icon set's grid.", zh: "图标集网格上的一个品牌 logo。" },
      extends: "svg",
      props: [
        { name: "icon", type: "{ title: string; path: string; hex?: string }", required: true, description: { en: "An icon object from the package, or your own 24×24 mark in the same shape.", zh: "包中的图标对象，或你自己的相同形状的 24×24 标志。" } },
        { name: "color", type: `"current" | "brand"`, default: `"current"`, description: { en: "Follow the text colour, or paint the brand's colour.", zh: "跟随文本颜色，或绘制品牌颜色。" } },
        { name: "size", type: "number", default: "18", description: { en: "Pixel size. Buttons, menus and icon chips size their icons themselves.", zh: "像素尺寸。按钮、菜单和图标胶囊会自行设置图标尺寸。" } },
        { name: "title", type: "string", description: { en: "Accessible name for a logo without a visible label.", zh: "没有可见标签的 logo 的可访问名称。" } },
        { name: "inset", type: "boolean", default: "true", description: { en: "Keep the icon set's 2px margin so logos sit at the same optical size as icons.", zh: "保留图标集的 2px 边距，以便 logo 与图标的光学尺寸相同。" } },
      ],
      dataAttributes: [{ name: "data-brand", description: { en: "The brand's name, for styling or tests.", zh: "品牌名称，用于样式或测试。" } }],
    },
  ],
} satisfies ComponentDoc
