import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Picks a value or range by dragging.", "zh": "拖动选择数值或范围。"},
  baseUi: {
    name: "Slider",
    href: "https://base-ui.com/react/components/slider",
  },
  usage: {
    imports: `import { Slider } from "@/components/ui/slider"`,
    code: `<Slider defaultValue={40} aria-label="Creativity" />`,
  },
  examples: [
    {
      id: "controlled",
      title: { en: "Controlled", zh: "受控" },
      description: { en: "Use when the value is shown or used elsewhere.", zh: "适用于数值与其他界面联动的场景。" },
    },
    {
      id: "vertical",
      title: { en: "Vertical", zh: "纵向" },
      description: { en: "Use in tall, narrow spaces such as a mixer column.", zh: "适用于混音器等狭长空间。" },
    },
    {
      id: "tick-count",
      title: { en: "Tick Count", zh: "刻度数量" },
      description: { en: "Use when the steps matter, such as a rating.", zh: "适用于评分等固定步长的数值。" },
    },
    { id: "disabled", title: { en: "Disabled", zh: "禁用" } },
    { id: "sizes", title: { en: "Sizes", zh: "尺寸" } },
    {
      id: "rtl",
      title: { en: "RTL", zh: "从右到左" },
    },
  ],
  notes: [
    {
      title: "Motion",
      body: { en: "With reduced motion the thumb and value bubble don't animate.", zh: "在减少动态效果下，滑块和值气泡不会动画。" },
    },
    {
      title: "Keyboard",
      body: { en: "Arrow keys move the focused thumb by `step`; Page Up / Page Down and Home / End jump further.", zh: "方向键将聚焦的滑块移动 `step`；Page Up / Page Down 和 Home / End 跳得更远。" },
    },
    {
      title: "Related",
      body: { en: "For a single value with the label on the track, see [Range Slider Inline](/docs/range-slider-inline); for model thought levels, see [Reasoning Effort](/docs/reasoning-effort).", zh: "对于轨道上带标签的单个值，请参见 [Range Slider Inline](/docs/range-slider-inline)；模型思考强度请参见 [Reasoning Effort](/docs/reasoning-effort)。" },
    },
  ],
  api: [
    {
      name: "Slider",
      description: { en: "Inset track, primary fill and a raised thumb. Pass an array value for a range.", zh: "内嵌轨道、主色填充和凸起滑块。为范围传入数组值。" },
      extends: "Slider.Root",
      extendsHref: "https://base-ui.com/react/components/slider#root",
      props: [
        { name: "variant", type: `"default" | "contained"`, default: `"default"`, description: { en: "`contained` makes the track as tall as the thumb, which rides inside it; suits stepped choices.", zh: "`contained` 使轨道与滑块一样高，滑块在其中移动；适合分步选择。" } },
        { name: "size", type: `"sm" | "default" | "lg"`, default: `"default"`, description: { en: "Thumb 16 / 20 / 24px on a 6 / 8 / 10px track. Inside a sized `Field` it takes the field's size (`xs` maps to `sm`).", zh: "滑块在 6 / 8 / 10px 轨道上为 16 / 20 / 24px。在已设尺寸的 `Field` 内，它采用字段的尺寸（`xs` 映射到 `sm`）。" } },
        {
          name: "ticks",
          type: "boolean | number",
          description: { en: "Dots along the track. `true` draws one per step; a number (2–101) draws that many, evenly spaced.", zh: "沿轨道分布的点。`true` 每个步长绘制一个；数字（2–101）绘制该数量，均匀分布。" },
        },
        {
          name: "showValue",
          type: `boolean | "always"`,
          description: { en: "`true` shows a value bubble over each thumb on hover, focus and drag; `\"always\"` keeps it up.", zh: "`true` 在悬停、聚焦和拖动时在每个滑块上显示值气泡；`\"always\"` 让它一直显示。" },
        },
        {
          name: "getThumbLabel",
          type: "(index: number) => string",
          description: { en: "Accessible label per thumb, e.g. `(i) => (i ? \"Max\" : \"Min\")` for a range.", zh: "每个滑块的无障碍标签，例如范围用 `(i) => (i ? \"Max\" : \"Min\")`。" },
        },
        { name: "min", type: "number", default: "0", description: { en: "Lowest value.", zh: "最低值。" } },
        { name: "max", type: "number", default: "100", description: { en: "Highest value.", zh: "最高值。" } },
        { name: "step", type: "number", default: "1", description: { en: "Step between values.", zh: "值之间的步长。" } },
        {
          name: "orientation",
          type: `"horizontal" | "vertical"`,
          default: `"horizontal"`,
          description: { en: "Layout direction. Vertical fills the parent's height, at least 160px.", zh: "布局方向。垂直方向填满父元素高度，至少 160px。" },
        },
        {
          name: "thumbAlignment",
          type: `"edge" | "center"`,
          default: `"edge"`,
          description: { en: "`edge` keeps the thumb inside the track at both ends (the primitive defaults to `center`).", zh: "`edge` 让滑块在两端保持位于轨道内（原语默认为 `center`）。" },
        },
        {
          name: "format",
          type: "Intl.NumberFormatOptions",
          description: { en: "Formats the value bubble, e.g. currency.", zh: "格式化值气泡，例如货币。" },
        },
      ],
      dataAttributes: [
        { name: "data-size", description: { en: "On the root, the resolved size.", zh: "在根元素上，解析后的尺寸。" } },
        { name: "data-variant", description: { en: "On the root, `default` or `contained`.", zh: "在根元素上，`default` 或 `contained`。" } },
        { name: "data-dragging", description: { en: "On the thumb while it is dragged (scaled up).", zh: "在拖动滑块时（放大）。" } },
        { name: "data-active", description: { en: "On a tick (`data-slot=\"slider-tick\"`) inside the selected range.", zh: "在选中范围内的刻度（`data-slot=\"slider-tick\"`）上。" } },
        { name: "data-disabled", description: { en: "Present when disabled.", zh: "禁用时存在。" } },
      ],
    },
  ],
} satisfies ComponentDoc
