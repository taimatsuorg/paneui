import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Chooses an agent model.", "zh": "选择助手使用的模型。"},
  usage: {
    imports: `import { EffortPicker, ModelPicker, ModePicker, ThinkingModelPicker } from "@/components/ui/model-picker"`,
    code: `<ModePicker modes={modes} value={mode} onValueChange={setMode} />
<ModelPicker models={models} value={model} onValueChange={setModel} />
<EffortPicker value={effort} onValueChange={setEffort} />`,
  },
  examples: [
    { id: "searchable", title: { en: "Searchable", zh: "可搜索" }, description: { en: "Use when the list runs past a screen, such as a model router's catalogue.", zh: "适用于选项超过一屏的模型目录。" } },
    { id: "thinking-model", title: { en: "Model and Effort", zh: "模型与思考等级" }, description: { en: "Use when one trigger should set both the model and how long it thinks.", zh: "适用于一个触发器同时设置模型和思考时长。" } },
    { id: "composer-picker", title: { en: "Composer Picker", zh: "输入栏选择器" },  },
  ],
  notes: [
    { title: "ACP", body: { en: "Feed `ModePicker` from an agent's `SessionModeState`, `ModelPicker` from a config option with `category: \"model\"` (grouped options map to `provider`), and `EffortPicker` from `category: \"thought_level\"`.", zh: "`ModePicker` 由 agent 的 `SessionModeState` 提供数据，`ModelPicker` 由 `category: \"model\"` 的配置选项提供数据（分组选项映射到 `provider`），`EffortPicker` 由 `category: \"thought_level\"` 提供数据。" } },
    { title: "Search", body: { en: "With `searchable` focus stays in the search field: arrow keys move the highlight, Enter picks, Escape closes. Words match the label, value and group in any order. `maxPerGroup` caps each group until you search or press its “Show all” row; the current choice stays visible past the cap.", zh: "启用 `searchable` 后焦点留在搜索框：方向键移动高亮，Enter 选择，Escape 关闭。关键词可按任意顺序匹配 label、value 和 group。`maxPerGroup` 限制每组显示数量，直到你搜索或点击该组的“Show all”行；当前选中项始终可见，不受限制。" } },
    { title: "Descriptions", body: { en: "Model and effort rows show the name alone; a `description` you pass is kept and shows with `showDescriptions`. `ModePicker` and `ComposerPicker` show descriptions by default, since an access level needs its consequence spelled out.", zh: "Model 和 effort 行只显示名称；传入的 `description` 会保留，并通过 `showDescriptions` 显示。`ModePicker` 和 `ComposerPicker` 默认显示描述，因为访问级别需要说明其后果。" } },
    { title: "Logos", body: { en: "Give each model its vendor's mark with `<BrandIcon color=\"brand\">`. Marks the brand icon package leaves out, such as OpenAI and xAI, ship in `@paneui/ui/lib/brand-marks` with the same shape.", zh: "用 `<BrandIcon color=\"brand\">` 给每个模型加上其厂商标记。品牌图标包未包含的标记（如 OpenAI 和 xAI）以相同结构提供在 `@paneui/ui/lib/brand-marks` 中。" } },
    { title: "Effort", body: { en: "`ThinkingModelPicker` pins a [Reasoning Effort](/docs/reasoning-effort) track under the list and echoes the level on the trigger. Tab and Shift+Tab step through the levels while the list is open. A model with `reasoning: false` hides both.", zh: "`ThinkingModelPicker` 在列表下方固定一个 [Reasoning Effort](/docs/reasoning-effort) 分段轨道，并在触发器上显示当前等级。列表打开时 Tab 和 Shift+Tab 切换等级。`reasoning: false` 的模型会隐藏两者。" } },
    { title: "Testing", body: { en: "Every option carries its value as `data-value`, so tests can pick one without matching its label.", zh: "每个选项都通过 `data-value` 携带其值，测试可直接选取而无需匹配标签。" } },
    { title: "Tone", body: { en: "A mode with `tone: \"warning\"` (full access) or `\"destructive\"` colours the trigger while selected, so a risky setting is visible at a glance.", zh: "`tone: \"warning\"`（完全访问）或 `\"destructive\"` 的模式在选中时会给触发器着色，让风险设置一眼可见。" } },
  ],
  api: [
    {
      name: "ComposerPicker",
      props: [
        { name: "options", type: "PickerOption[]", required: true, description: { en: "`{ value, label, description?, icon?, group?, tone?, disabled? }`.", zh: "`{ value, label, description?, icon?, group?, tone?, disabled? }`。" } },
        { name: "value", type: "string", description: { en: "Selected value.", zh: "选中的值。" } },
        { name: "onValueChange", type: "(value: string) => void", description: { en: "Called on pick.", zh: "选择时调用。" } },
        { name: "label", type: "string", required: true, description: { en: "Accessible name of the trigger.", zh: "触发器的无障碍名称。" } },
        { name: "icon", type: "ReactNode", description: { en: "Trigger glyph when the option has none.", zh: "选项没有图标时触发器显示的图标。" } },
        { name: "heading", type: "string", description: { en: "Label above the options.", zh: "选项上方的标签。" } },
        { name: "side", type: `"top" | "bottom"`, default: `"top"`, description: { en: "Menu side (top suits a composer at the bottom).", zh: "菜单方向（顶部适合位于底部的 composer）。" } },
        { name: "align", type: `"start" | "center" | "end"`, default: `"start"`, description: { en: "Menu alignment.", zh: "菜单对齐方式。" } },
        { name: "footer", type: "ReactNode", description: { en: "Menu items under the options; with `searchable`, a plain button or link.", zh: "选项下方的菜单项；启用 `searchable` 时为普通按钮或链接。" } },
        { name: "searchable", type: "boolean", default: "false", description: { en: "Search field at the top of the list.", zh: "列表顶部的搜索框。" } },
        { name: "searchPlaceholder", type: "string", default: `"Search"`, description: { en: "Placeholder and accessible name of the search field.", zh: "搜索框的占位符和无障碍名称。" } },
        { name: "emptyLabel", type: "ReactNode", default: `"No results"`, description: { en: "Shown when nothing matches.", zh: "无匹配项时显示。" } },
        { name: "maxPerGroup", type: "number", description: { en: "With `searchable`, options shown per group before “Show all”.", zh: "启用 `searchable` 时，“Show all”之前每组显示的数量。" } },
        { name: "compact", type: "boolean", default: "false", description: { en: "Inside an `AgentComposer` toolbar narrower than 28rem (phones, tablets, split panes), show only the glyph and chevron; the label stays the accessible name. `ModePicker` and `EffortPicker` default to `true`.", zh: "在宽度小于 28rem 的 `AgentComposer` 工具栏中（手机、平板、分屏），只显示图标和 chevron；标签仍作为无障碍名称。`ModePicker` 和 `EffortPicker` 默认 `true`。" } },
        { name: "showDescriptions", type: "boolean", default: "true", description: { en: "Show each option's `description` under its name. `ModelPicker` and `EffortPicker` default to `false`.", zh: "在名称下方显示每个选项的 `description`。`ModelPicker` 和 `EffortPicker` 默认 `false`。" } },
      ],
    },
    { name: "ModelPicker", description: { en: "Preset grouped by `provider`.", zh: "按 `provider` 分组的预设。" }, props: [{ name: "models", type: "{ id, name, description?, provider?, icon? }[]", required: true, description: { en: "Models to offer.", zh: "要提供的模型。" } }] },
    { name: "ThinkingModelPicker", description: { en: "Model list with the reasoning effort pinned under it.", zh: "模型列表，下方固定思考等级。" }, props: [
      { name: "models", type: "{ id, name, provider?, icon?, reasoning? }[]", required: true, description: { en: "Models to offer; `reasoning: false` hides the effort.", zh: "要提供的模型；`reasoning: false` 隐藏思考等级。" } },
      { name: "levels", type: "{ value, label }[]", default: "low / medium / high", description: { en: "Effort levels, lowest first.", zh: "思考等级，从低到高。" } },
      { name: "effort", type: "string", description: { en: "Selected effort level.", zh: "选中的思考等级。" } },
      { name: "onEffortChange", type: "(effort: string) => void", description: { en: "Called when the level changes.", zh: "等级变化时调用。" } },
    ] },
    { name: "EffortPicker", description: { en: "Preset with a bolt glyph.", zh: "带 bolt 图标的预设。" }, props: [{ name: "levels", type: "{ value, label, description? }[]", default: "low / medium / high", description: { en: "Effort levels.", zh: "Effort 级别。" } }] },
    { name: "ModePicker", description: { en: "Preset with a shield glyph.", zh: "带 shield 图标的预设。" }, props: [{ name: "modes", type: "{ id, name, description?, icon?, tone? }[]", required: true, description: { en: "Modes or access levels.", zh: "模式或访问级别。" } }] },
  ],
} satisfies ComponentDoc
