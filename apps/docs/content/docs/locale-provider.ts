import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Sets the language of every built-in label.", "zh": "设置组件内置标签的语言。"},
  usage: {
    imports: `import { LocaleProvider } from "@/components/ui/locale-provider"`,
    code: `<LocaleProvider locale="zh-CN">
  <App />
</LocaleProvider>`,
  },
  examples: [{ id: "chinese", title: { en: "Chinese", zh: "简体中文" } }, { id: "japanese", title: { en: "Japanese", zh: "日语" } }, { id: "overrides", title: { en: "Overrides", zh: "覆盖设置" },  }],
  notes: [
    { title: "Locales", body: { en: "Built in are `en` (the default without a provider), `zh-CN` and `ja`; a tag matches by language too, so `zh-Hans` and `zh-TW` get `zh-CN` and `ja-JP` gets `ja`. Any other tag keeps the parent's strings, which you can replace with `labels`. Every set is typed as `LocaleLabels`, so a set missing a key fails type checking.", zh: "内置了 `en`（无 provider 时的默认值）、`zh-CN` 和 `ja`；标签也按语言匹配，因此 `zh-Hans` 和 `zh-TW` 获得 `zh-CN`，`ja-JP` 获得 `ja`。任何其他标签保留父级的字符串，你可以用 `labels` 替换。每个集合都声明为 `LocaleLabels` 类型，缺少键时类型检查会失败。" } },
    { title: "Merging", body: { en: "`labels` is merged over the locale's set key by key, and nested providers merge over their parent. A component prop such as `label` or `jumpLabel` still wins over the provider.", zh: "`labels` 按键逐个合并到 locale 的集合上，嵌套 provider 合并到其父级上。组件 prop 如 `label` 或 `jumpLabel` 仍然优先于 provider。" } },
    { title: "Content", body: { en: "The provider translates built-in controls and announcements. Supply translated document content, table headers, filter options, file names and agent responses yourself. Terminal command output and exported document content keep their original text.", zh: "provider 翻译内置控件和播报。翻译的文档内容、表格表头、过滤选项、文件名和代理响应需自行提供。终端命令输出和导出的文档内容保留原始文本。" } },
    { title: "Editor labels", body: { en: "Editor toolbars, block menus, colour options and placeholders read the provider. Custom `slashItems`, palettes, placeholders and labels still win. Pure helpers such as `getDefaultSlashItems(labels)`, `getBlockTypes(labels)` and `getAvatarParts(slot, gender, labels)` accept a label set; their default is English.", zh: "编辑器工具栏、块菜单、颜色选项和占位符读取 provider。自定义 `slashItems`、调色板、占位符和标签仍然优先。纯辅助函数如 `getDefaultSlashItems(labels)`、`getBlockTypes(labels)` 和 `getAvatarParts(slot, gender, labels)` 接受标签集；其默认值为英文。" } },
    { title: "Changing language", body: { en: "Change `locale` on the existing provider to update controls without remounting the editor or discarding entered content. Existing user content and recorded agent turns keep their language.", zh: "在现有 provider 上更改 `locale` 以更新控件，而无需重新挂载编辑器或丢弃已输入的内容。现有用户内容和记录的代理轮次保留其语言。" } },
    { title: "Coverage", body: { en: "Close, back and dismiss buttons on overlays, toasts and alerts; password, combobox, multi-select, stepper and date fields; pagination, calendar, carousel and breadcrumb controls; loaders, code copy buttons, messages and the message scroller; the page outline, sidebar nav, command palette, theme toggle and cover art; the agent parts (work summary, tool result, tool approval, edited files, file diffs, streaming response, thread rows, model pickers, composer and tab bar badges); the AI sidebar, editable table, colour picker, pagination summary and chart captions, tooltips and data tables. Also covered are data-table filters and selection, async-table states, activity summaries, avatar controls, editor controls, upload announcements, signup validation, availability controls and composed chat controls.", zh: "覆盖层、toast 和警告上的关闭、返回和忽略按钮；密码、组合框、多选、步进器和日期字段；分页、日历、轮播和面包屑控件；加载器、代码复制按钮、消息和消息滚动器；页面大纲、侧边栏导航、命令面板、主题切换和封面图；代理部分（工作摘要、工具结果、工具审批、已编辑文件、文件差异、流式响应、线程行、模型选择器、编辑器和标签栏徽章）；AI 侧边栏、可编辑表格、颜色选择器、分页摘要以及图表说明、提示和数据表格。还包括数据表格过滤和选择、异步表格状态、活动摘要、头像控件、编辑器控件、上传播报、注册验证、可用性控件和组合聊天控件。" } },
    { title: "Navigation and theme keys", body: { en: "`onThisPage`, `backToTop`, `linkTo(title)`, `toggleSection`, `toggleNamed(label)`, `commandPalette`, `searchCommands`, `commandPlaceholder`, `commandNoMatches`, `navigate`, `open`, `toggleTheme`, `switchToLightTheme`, `switchToDarkTheme`, `themeLight`, `themeDark`, `themeSystem`, `themeCycle(current, next)` and `coverArt`. The command palette also reads `commands` and `close`, and the sidebar search reads `searchPlaceholder`.", zh: "`onThisPage`、`backToTop`、`linkTo(title)`、`toggleSection`、`toggleNamed(label)`、`commandPalette`、`searchCommands`、`commandPlaceholder`、`commandNoMatches`、`navigate`、`open`、`toggleTheme`、`switchToLightTheme`、`switchToDarkTheme`、`themeLight`、`themeDark`、`themeSystem`、`themeCycle(current, next)` 和 `coverArt`。命令面板还读取 `commands` 和 `close`，侧边栏搜索读取 `searchPlaceholder`。" } },
    { title: "Table, file and chart keys", body: { en: "`insertBefore` and `insertAfter` name the column inserts by reading order, so they stay right in right-to-left. Charts read `chart`, `total`, `value`, `share` and their own names (`donutChart`, `funnelChart`…); file parts read `editedFiles(count)`, `diffStats(added, removed)` and `changesTo(file)`; `PaginationSummary` reads `results`, `noItems(noun)` and `itemRange(from, to, total, noun)`.", zh: "`insertBefore` 和 `insertAfter` 按阅读顺序命名列插入，因此在从右到左时保持正确。图表读取 `chart`、`total`、`value`、`share` 及其自身名称（`donutChart`、`funnelChart`…）；文件部分读取 `editedFiles(count)`、`diffStats(added, removed)` 和 `changesTo(file)`；`PaginationSummary` 读取 `results`、`noItems(noun)` 和 `itemRange(from, to, total, noun)`。" } },
    { title: "Values", body: { en: "Strings that carry a value are functions, such as `workedFor: (duration) => …` and `page: (n) => …`.", zh: "携带值的字符串是函数，例如 `workedFor: (duration) => …` 和 `page: (n) => …`。" } },
  ],
  api: [
    {
      name: "LocaleProvider",
      props: [
        { name: "locale", type: "string", description: { en: "BCP 47 tag. Picks a built-in label set when one matches.", zh: "BCP 47 标签。当有匹配时选择一个内置标签集。" } },
        { name: "labels", type: "Partial<LocaleLabels>", description: { en: "Overrides on top of the locale's set.", zh: "覆盖在 locale 的集合之上。" } },
      ],
    },
    { name: "useLocale", description: { en: "Returns `{ locale, labels }` for your own components.", zh: "为你的组件返回 `{ locale, labels }`。" }, props: [] },
    { name: "localeLabels", description: { en: "The built-in sets, keyed by tag; spread one to start a new language.", zh: "内置集合，按标签键控；展开一个以开始新语言。" }, props: [] },
    { name: "LocaleText", description: { en: "`<LocaleText label=\"backToTop\" />` renders one string label, so a component without client code can show it.", zh: "`<LocaleText label=\"backToTop\" />` 渲染一个字符串标签，因此没有客户端代码的组件也可以显示它。" }, props: [{ name: "label", type: "LocaleTextKey", required: true, description: { en: "A key whose label is a string.", zh: "标签为字符串的键。" } }] },
  ],
} satisfies ComponentDoc
