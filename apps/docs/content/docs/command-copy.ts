import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Shows a command or prompt with a button that copies it.", zh: "展示命令或提示词，并可一键复制。" },
  usage: {
    imports: `import { CommandCopy, PromptCopy } from "@/components/ui/command-copy"`,
    code: `<CommandCopy command="npx @taimatsu/paneui@latest init" />`,
  },
  examples: [
    { id: "group", title: { en: "Tabs", zh: "标签页" }, description: { en: "Tabs and command in one frame, for a command that changes with a setting.", zh: "标签页与命令共用一个边框，用于随设置变化的命令。" } },
    { id: "sizes", title: { en: "Sizes", zh: "尺寸" }, description: { en: "Use `lg` for the one install line on a landing page.", zh: "落地页上的安装命令用 `lg`。" } },
    { id: "floating", title: { en: "Floating", zh: "悬浮" }, description: { en: "Use on pictures and tinted sections.", zh: "用于图片或有底色的区块上。" } },
    { id: "no-prompt", title: { en: "Without prompt", zh: "无提示符" } },
    { id: "prompt", title: { en: "Multi-line text", zh: "多行文本" }, description: { en: "Use `PromptCopy` for a prompt or any text longer than one line.", zh: "提示词或超过一行的文本用 `PromptCopy`。" } },
  ],
  notes: [
    { title: "Copy feedback", body: { en: "The copy glyph cross-fades to a check for 1.6s and a polite live region says “Copied”. Under reduced motion the swap is an opacity fade only. If the clipboard is blocked nothing changes and `onCopy` is not called.", zh: "复制图标交叉淡入为对勾，持续 1.6 秒，礼貌的实时区域朗读“已复制”。在减少动态效果下，仅以不透明度淡入淡出切换。如果剪贴板被阻止，则无变化且不调用 `onCopy`。" } },
    { title: "Labels", body: { en: "The button reads “Copy command” and “Copied” from the nearest `LocaleProvider` (`copyCommand`, `copied`); `label` overrides the first. The prompt glyph is hidden from assistive tech and never copied.", zh: "按钮从最近的 `LocaleProvider` 读取“Copy command”和“Copied”（`copyCommand`、`copied`）；`label` 覆盖第一个。提示图标对辅助技术隐藏，且永远不会被复制。" } },
    { title: "Long commands", body: { en: "The command stays on one line and scrolls sideways without a scrollbar, so the button never moves.", zh: "命令保持在一行并横向滚动，不显示滚动条，因此按钮永远不会移动。" } },
    { title: "Groups", body: { en: "`CommandGroup` puts the tabs on the frame's top line and the command under it, so a package-manager switch and the command it runs read as one control instead of a segmented track above a separate bar. `storageKey` remembers the choice and keeps every group with that key in step.", zh: "`CommandGroup` 把标签页放在边框的顶行、命令放在它下面，因此包管理器切换与其运行的命令被读作一个控件，而不是一个分段轨道加一条独立的条。`storageKey` 记住选择，并让使用同一键的所有分组保持同步。" } },
  ],
  api: [
    {
      name: "CommandCopy",
      extends: "div",
      props: [
        { name: "command", type: "string", required: true, description: { en: "The command, exactly as it is copied.", zh: "命令，与复制时完全一致。" } },
        { name: "prompt", type: "ReactNode", default: `"$"`, description: { en: "Glyph before the command; `null` hides it.", zh: "命令前的图标；`null` 隐藏它。" } },
        { name: "label", type: "string", description: { en: "Accessible name of the copy button.", zh: "复制按钮的无障碍名称。" } },
        { name: "onCopy", type: "(command: string) => void", description: { en: "Called after the command reaches the clipboard.", zh: "命令到达剪贴板后调用。" } },
        { name: "variant", type: `"default" | "floating" | "plain"`, default: `"default"`, description: { en: "`default` is a raised card; `floating` is a translucent, blurred bar with a deeper shadow; `plain` drops the frame for use inside `CommandGroup`.", zh: "`default` 是凸起卡片；`floating` 是半透明、模糊且阴影更深的条；`plain` 去掉边框，供 `CommandGroup` 内部使用。" } },
        { name: "size", type: `"default" | "lg"`, default: `"default"`, description: { en: "`default` is 40px with a ghost button; `lg` is a 56px round bar with a solid round 40px button and larger type from the `sm` breakpoint.", zh: "`default` 是 40px 带幽灵按钮；`lg` 是 56px 圆形条，带实心圆形 40px 按钮，从 `sm` 断点起使用更大字号。" } },
      ],
      dataAttributes: [
        { name: "data-variant", description: { en: "The variant.", zh: "变体。" } },
        { name: "data-size", description: { en: "The size.", zh: "尺寸。" } },
      ],
    },
    {
      name: "PromptCopy",
      extends: "div",
      description: { en: "Multi-line text under a title bar with the copy button.", zh: "标题栏带复制按钮，下方是多行文本。" },
      props: [
        { name: "text", type: "string", required: true, description: { en: "The text, exactly as it is copied. Line breaks are kept and long lines wrap.", zh: "文本，与复制时完全一致。保留换行，长行自动折行。" } },
        { name: "title", type: "ReactNode", description: { en: "Shown on the title bar.", zh: "显示在标题栏上。" } },
        { name: "label", type: "string", description: { en: "Accessible name of the copy button. Defaults to the locale's `copyPrompt`.", zh: "复制按钮的无障碍名称，默认取语言包的 `copyPrompt`。" } },
        { name: "onCopy", type: "(text: string) => void", description: { en: "Called after the text reaches the clipboard.", zh: "文本到达剪贴板后调用。" } },
      ],
    },
    {
      name: "CommandGroup",
      extends: "div",
      description: { en: "Tabs on the frame's top line with one command under them.", zh: "标签页位于边框顶行，下面是一条命令。" },
      props: [
        { name: "items", type: "readonly CommandGroupItem[]", required: true, description: { en: "`{ value, command, label? }`, one entry per tab.", zh: "`{ value, command, label? }`，每个标签页一项。" } },
        { name: "value", type: "string", description: { en: "Controlled tab. Falls back to the first item.", zh: "受控标签页。默认取第一项。" } },
        { name: "defaultValue", type: "string", description: { en: "Tab shown before the reader picks one.", zh: "读者选择前显示的标签页。" } },
        { name: "onValueChange", type: "(value: string) => void", description: { en: "Called when the tab changes.", zh: "标签页变化时调用。" } },
        { name: "storageKey", type: "string", description: { en: "Remember the tab in localStorage and keep groups with the same key in sync.", zh: "在 localStorage 中记住标签页，并让使用同一键的分组保持同步。" } },
        { name: "prompt", type: "ReactNode", default: `"$"`, description: { en: "Glyph before each command; `null` hides it.", zh: "每条命令前的图标；`null` 隐藏它。" } },
      ],
    },
  ],
} satisfies ComponentDoc
