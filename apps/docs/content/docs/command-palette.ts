import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Keyboard-first launcher for searching and running commands.", zh: "搜索并执行命令。" },
  usage: {
    imports: `import { CommandPalette, type CommandPaletteItem } from "@/components/command-palette"`,
    code: `<CommandPalette items={items} open={open} onOpenChange={setOpen} />`,
  },
  examples: [
    {
      id: "caller-ranked",
      title: { en: "Your own search", zh: "自定义搜索" },
      description: {
        en: "Use when your app already ranks results, such as a full-text page index.",
        zh: "当应用自己负责排序结果时使用，例如全文页面索引。",
      },
    },
  ],
  notes: [
    {
      title: "Filtering",
      body: {
        en: "By default every query runs a fuzzy match over labels, then descriptions, groups and `keywords`, and sorts by score. `filter={false}` keeps the items exactly as passed, so pair it with a controlled `query` and rank them yourself. A `filter` function returns a score per item (higher first, ties keep their order) or `null` to hide it. Items are grouped by `group` in the order each heading first appears.",
        zh: "默认情况下，每次查询都会对标签、描述、分组和 `keywords` 做模糊匹配并按得分排序。`filter={false}` 原样保留传入的条目，可配合受控的 `query` 自行排序。`filter` 函数为每个条目返回得分（越高越靠前，同分保持原顺序），返回 `null` 则隐藏。条目按 `group` 分组，分组顺序取其标题首次出现的位置。",
      },
    },
    {
      title: "Query",
      body: {
        en: "Uncontrolled, the search text clears every time the palette opens. With `query` set, it stays as you leave it; clear it in your open handler if you want a fresh search.",
        zh: "非受控时，每次打开面板都会清空搜索文字。设置 `query` 后则保持不变；如需重新搜索，请在打开时自行清空。",
      },
    },
    {
      title: "Keyboard",
      body: {
        en: "Arrow keys or Ctrl+N and Ctrl+P move through enabled rows, Ctrl+Home and Ctrl+End jump to the ends, Enter runs the active row and Esc closes. The input is a combobox that points at the active option. `hotkey` toggles the palette with Cmd or Ctrl.",
        zh: "方向键或 Ctrl+N、Ctrl+P 在可用行之间移动，Ctrl+Home 与 Ctrl+End 跳到首尾，Enter 执行当前行，Esc 关闭。输入框是指向当前选项的组合框。`hotkey` 配合 Cmd 或 Ctrl 切换面板。",
      },
    },
  ],
  api: [
    {
      name: "CommandPalette",
      props: [
        { name: "items", type: "CommandPaletteItem[]", required: true, description: { en: "Rows to show, in order.", zh: "要显示的行，按顺序。" } },
        { name: "query", type: "string", description: { en: "Controlled search text.", zh: "受控的搜索文字。" } },
        { name: "onQueryChange", type: "(query: string) => void", description: { en: "Called on every edit of the search text.", zh: "每次编辑搜索文字时调用。" } },
        {
          name: "filter",
          type: "false | (query: string, item: CommandPaletteItem) => number | null",
          description: { en: "Replaces the built-in fuzzy match; `false` shows the items as given.", zh: "替换内置模糊匹配；`false` 原样显示条目。" },
        },
        { name: "open", type: "boolean", description: { en: "Controlled open state.", zh: "受控的打开状态。" } },
        { name: "defaultOpen", type: "boolean", default: "false", description: { en: "Open state on first render.", zh: "首次渲染时的打开状态。" } },
        { name: "onOpenChange", type: "(open: boolean) => void", description: { en: "Called when the palette opens or closes.", zh: "面板打开或关闭时调用。" } },
        { name: "onSelect", type: "(item: CommandPaletteItem) => void", description: { en: "Called after the item's own `onSelect`, before the palette closes.", zh: "在条目自身的 `onSelect` 之后、面板关闭之前调用。" } },
        { name: "hotkey", type: "string | false", default: `"k"`, description: { en: "Key that toggles the palette with Cmd or Ctrl.", zh: "与 Cmd 或 Ctrl 组合切换面板的按键。" } },
        { name: "placeholder", type: "string", description: { en: "Input placeholder. Defaults to the locale's label.", zh: "输入框占位文字，默认取语言包。" } },
        { name: "emptyMessage", type: "ReactNode", description: { en: "Shown when no row matches. Defaults to the locale's label.", zh: "没有匹配行时显示，默认取语言包。" } },
        { name: "showFooter", type: "boolean", default: "true", description: { en: "Show the keyboard legend under the results.", zh: "在结果下方显示键盘提示。" } },
      ],
      dataAttributes: [
        { name: "data-slot=\"command-palette-excerpt\"", description: { en: "The second line of a row with `excerpt`.", zh: "带 `excerpt` 的行的第二行。" } },
      ],
    },
    {
      name: "CommandPaletteItem",
      description: { en: "One row.", zh: "一行。" },
      props: [
        { name: "id", type: "string", required: true, description: { en: "Stable key.", zh: "稳定的键。" } },
        { name: "label", type: "string", required: true, description: { en: "Row text; fuzzy hits are marked in it.", zh: "行文字；模糊匹配的字符会被标出。" } },
        { name: "group", type: "string", description: { en: "Heading the row is listed under. Defaults to the locale's “Results”.", zh: "该行所属的标题，默认为语言包中的“Results”。" } },
        { name: "description", type: "string", description: { en: "Muted text after the label.", zh: "标签后的弱化文字。" } },
        { name: "excerpt", type: "string", description: { en: "Second line under the label, cut to one line.", zh: "标签下方的第二行，截断为一行。" } },
        { name: "highlight", type: "[start: number, end: number][]", description: { en: "String ranges of `excerpt` to mark, end exclusive.", zh: "`excerpt` 中要标记的字符串范围，不含结束位置。" } },
        { name: "keywords", type: "string[]", description: { en: "Extra words the built-in match looks at.", zh: "内置匹配额外检查的词。" } },
        { name: "shortcut", type: "string[]", description: { en: "Keys shown as hint chips.", zh: "以按键提示显示的按键。" } },
        { name: "icon", type: "ComponentType<{ className?: string }>", description: { en: "Leading icon.", zh: "前置图标。" } },
        { name: "disabled", type: "boolean", description: { en: "Shown but skipped by the keyboard and clicks.", zh: "显示但不可通过键盘或点击选择。" } },
        { name: "onSelect", type: "() => void", description: { en: "Runs when the row is chosen.", zh: "选择该行时执行。" } },
      ],
    },
  ],
} satisfies ComponentDoc
