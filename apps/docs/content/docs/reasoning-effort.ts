import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Sets how much a model reasons before it answers.", zh: "设置模型回答前的思考强度。" },
  usage: {
    imports: `import { ReasoningEffort } from "@/components/ui/reasoning-effort"`,
    code: `const [effort, setEffort] = React.useState("medium")

<ReasoningEffort model="Pro 3" value={effort} onValueChange={setEffort} />`,
  },
  examples: [
    {
      id: "always",
      title: { en: "Label Always Shown", zh: "常显标签" },
      description: { en: "Use where the track stands alone and needs its level visible.", zh: "适用于单独放置、需要一直显示等级的场景。" },
    },
    {
      id: "levels",
      title: { en: "Custom Levels", zh: "自定义等级" },
    },
    {
      id: "small",
      title: { en: "Small", zh: "小尺寸" },
      description: { en: "Use in composers, menus and toolbars.", zh: "适用于输入框、菜单和工具栏。" },
    },
  ],
  notes: [
    {
      title: "Interaction",
      body: { en: "Drag the thumb or click the track; the thumb snaps to the nearest level on release and the value changes as each level is crossed. While dragging, a tab rises from the track's top edge naming the model and the level under the pointer, then sinks back.", zh: "拖动滑块或点击轨道；松手时吸附到最近的等级，拖过每个等级时数值随之更新。拖动时，轨道上沿会升起一个标签，显示模型和指针下的等级，松手后收回。" },
    },
    {
      title: "Keyboard and accessibility",
      body: { en: "The track is a `slider`: ← / ↓ and → / ↑ step one level, Home and End jump to the ends. `aria-valuetext` reads the model and level, e.g. \"Pro 3 High\". Under reduced motion the thumb, fill and tab move without springs and the label swaps without blur.", zh: "轨道使用 `slider` 角色：← / ↓ 与 → / ↑ 每次移动一级，Home 和 End 跳到两端。`aria-valuetext` 会读出模型和等级，例如“Pro 3 High”。开启减少动态效果时，滑块、填充和标签不使用弹簧动画，标签切换也不模糊。" },
    },
    {
      title: "Radius and surface",
      body: { en: "The track follows the control radius and the thumb stays concentric inside it, so every radius preset applies. In a popover or menu, set `--reasoning-effort-surface: var(--popover)` so the track and tab sit on the same surface as their container. [Model Picker](/docs/model-picker)'s `ThinkingModelPicker` uses it under its list.", zh: "轨道跟随控件圆角，滑块在其中保持同心，所有圆角预设都适用。放在弹出层或菜单中时，设置 `--reasoning-effort-surface: var(--popover)`，让轨道和标签与容器同一底色。[Model Picker](/docs/model-picker) 的 `ThinkingModelPicker` 在列表下方使用它。" },
    },
  ],
  api: [
    {
      name: "ReasoningEffort",
      extends: "div",
      props: [
        { name: "levels", type: "{ value: string; label: string }[]", description: { en: "Levels, lowest first. Defaults to low, medium, high and extra high.", zh: "等级，从低到高。默认为低、中、高、极高。" } },
        { name: "value / defaultValue", type: "string", description: { en: "Selected level, controlled or uncontrolled.", zh: "选中的等级，受控或非受控。" } },
        { name: "onValueChange", type: "(value: string) => void", description: { en: "Called as each level is crossed and on release.", zh: "拖过每个等级和松手时调用。" } },
        { name: "model", type: "ReactNode", description: { en: "Shown before the level in the tab.", zh: "显示在标签中等级之前。" } },
        { name: "showLabel", type: `"drag" | "always" | "never"`, default: `"drag"`, description: { en: "When the tab shows.", zh: "标签何时显示。" } },
        { name: "size", type: `"sm" | "default"`, default: `"default"`, description: { en: "Track height: 24 or 32px.", zh: "轨道高度：24 或 32px。" } },
        { name: "disabled", type: "boolean", default: "false", description: { en: "Dims the track and ignores input.", zh: "变暗并忽略输入。" } },
        { name: "aria-label", type: "string", default: `"Reasoning effort"`, description: { en: "Accessible name of the slider.", zh: "滑块的无障碍名称。" } },
      ],
      dataAttributes: [
        { name: "data-dragging", description: { en: "While the thumb is dragged.", zh: "拖动滑块时。" } },
        { name: "data-tone", description: { en: "On each tick: `track`, `fill`, `thumb` or `target` (the level the drag will land on).", zh: "在每个刻度上：`track`、`fill`、`thumb` 或 `target`（拖动将落到的等级）。" } },
      ],
    },
  ],
} satisfies ComponentDoc
