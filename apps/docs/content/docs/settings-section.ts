import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Layout for grouped settings pages.", "zh": "将相关设置分组。"},
  usage: {
    imports: `import {
  SettingsGroup,
  SettingsRow,
  SettingsRowDescription,
  SettingsRowLink,
  SettingsRowText,
  SettingsRowTitle,
  SettingsSection,
  SettingsSectionHeader,
  SettingsSectionTitle,
} from "@/components/ui/settings-section"`,
    code: `<SettingsSection>
  <SettingsSectionHeader>
    <SettingsSectionTitle>Notifications</SettingsSectionTitle>
  </SettingsSectionHeader>
  <SettingsGroup>
    <SettingsRow render={<label />}>
      <SettingsRowText>
        <SettingsRowTitle>Weekly digest</SettingsRowTitle>
        <SettingsRowDescription>Every Monday at 9:00.</SettingsRowDescription>
      </SettingsRowText>
      <Switch />
    </SettingsRow>
  </SettingsGroup>
</SettingsSection>`,
  },
  composition: `SettingsNav
└── SettingsNavItem
SettingsSection
├── SettingsSectionHeader
│   ├── SettingsSectionTitle
│   └── SettingsSectionDescription
└── SettingsGroup
    ├── SettingsRow (or SettingsRowLink)
    │   ├── SettingsRowText (Title, Description)
    │   └── SettingsRowControl or any control
    └── SettingsGroupFooter
        └── SettingsFooterNote`,
  examples: [
    { id: "danger-zone", title: { en: "Danger Zone", zh: "危险操作区" }, description: { en: "Use for actions that delete data or can't be undone.", zh: "适用于删除数据或无法撤销的操作。" } },
    { id: "interactive-rows", title: { en: "Interactive Rows", zh: "可交互行" }, description: { en: "Use when a row opens a page, a dialog or a link.", zh: "适用于点击后打开页面或对话框的设置行。" } },
    { id: "compact", title: { en: "Compact Rows", zh: "紧凑行" }, description: { en: "Use `size=\"sm\"` for one-line rows like shortcuts or details.", zh: "快捷键、详情等单行内容使用 `size=\"sm\"`。" } },
    { id: "nav", title: { en: "Settings Nav", zh: "设置导航" },  },
  ],
  notes: [{ title: "Rows", body: { en: "A row wraps its control under the text on narrow screens. Render it as a `<label>` (`render={<label />}`) so clicking anywhere toggles its switch.", zh: "在窄屏幕上，行会将控件换行到文本下方。将其渲染为 `<label>`（`render={<label />}`），以便点击任意位置都能切换其开关。" } }, { title: "Nav", body: { en: "Below `md` the settings nav becomes a horizontally scrolling strip.", zh: "低于 `md` 时，设置导航变为水平滚动条。" } }, { title: "Interactive rows", body: { en: "An `interactive` row is one `<button>` (or the element `render` gives): it takes the hover and press fill, an inset focus ring and a trailing chevron that flips in right-to-left layouts. Keep other controls out of it.", zh: "`interactive` 行是一个 `<button>`（或 `render` 给出的元素）：它具有悬停和按下填充、内嵌焦点环，以及一个在从右到左布局中翻转的尾部 chevron。不要在其中放置其他控件。" } }],
  api: [
    { name: "SettingsGroup", extends: "div", props: [{ name: "tone", type: `"default" | "destructive"`, default: `"default"`, description: { en: "Destructive ring for a danger zone.", zh: "用于危险区域的破坏性环。" } }] },
    {
      name: "SettingsRow",
      extends: "div (useRender)",
      description: { en: "Min 56px row (40px with `size=\"sm\"`) with a hairline between rows.", zh: "最小 56px 的行（`size=\"sm\"` 时 40px），行间有细线。" },
      props: [
        { name: "render", type: "ReactElement", description: { en: "Render as another element, e.g. `<label />` or a router link.", zh: "渲染为另一个元素，例如 `<label />` 或路由链接。" } },
        { name: "interactive", type: "boolean", default: "false", description: { en: "The row is the control: a `<button>` by default, with hover and press fill, focus ring and chevron.", zh: "行即控件：默认是 `<button>`，具有悬停和按下填充、焦点环和 chevron。" } },
        { name: "detail", type: "ReactNode", description: { en: "Muted trailing text before the chevron, such as the current value.", zh: "chevron 之前的弱化尾部文本，例如当前值。" } },
        { name: "chevron", type: "boolean", default: "true", description: { en: "Show the chevron on an interactive row.", zh: "在交互行上显示 chevron。" } },
        { name: "size", type: `"default" | "sm"`, default: `"default"`, description: { en: "`sm` sets a 40px minimum and tighter padding for one-line rows.", zh: "`sm` 为单行内容设置 40px 最小高度和更紧凑的内边距。" } },
      ],
      dataAttributes: [
        { name: "data-interactive", description: { en: "Present on an interactive row.", zh: "在交互行上存在。" } },
        { name: "data-size", description: { en: "The `size` in use.", zh: "当前使用的 `size`。" } },
      ],
    },
    {
      name: "SettingsRowLink",
      extends: "a",
      description: { en: "Interactive row that renders an `<a>` and takes every anchor attribute; pass `render` for a router link.", zh: "渲染 `<a>` 并接受所有锚点属性的交互行；为路由链接传入 `render`。" },
      props: [
        { name: "target", type: "string", description: { en: "`_blank` without `rel` adds `rel=\"noopener noreferrer\"`.", zh: "`_blank` 不带 `rel` 时会添加 `rel=\"noopener noreferrer\"`。" } },
        { name: "external", type: "boolean", default: "false", description: { en: "An external-link icon instead of the chevron.", zh: "用外部链接图标代替 chevron。" } },
        { name: "detail", type: "React.ReactNode", description: { en: "Same as `SettingsRow`.", zh: "与 `SettingsRow` 相同。" } },
        { name: "chevron", type: "boolean", default: "true", description: { en: "Same as `SettingsRow`.", zh: "与 `SettingsRow` 相同。" } },
      ],
    },
    { name: "SettingsGroupFooter", extends: "div", description: { en: "Muted band for Save / Cancel; with a `SettingsFooterNote` the note sits left.", zh: "用于 Save / Cancel 的弱化条带；使用 `SettingsFooterNote` 时，注释位于左侧。" }, props: [] },
    { name: "SettingsNavItem", extends: "a (useRender)", props: [{ name: "isActive", type: "boolean", description: { en: "Current page.", zh: "当前页。" } }, { name: "icon", type: "ReactNode", description: { en: "16px solid icon.", zh: "16px 实心图标。" } }, { name: "render", type: "ReactElement", description: { en: "Your router link.", zh: "你的路由链接。" } }] },
  ],
} satisfies ComponentDoc
