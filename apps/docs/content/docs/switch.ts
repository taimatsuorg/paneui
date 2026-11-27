import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Turns a single setting on or off.", zh: "开启或关闭一项设置。" },
  baseUi: {
    name: "Switch",
    href: "https://base-ui.com/react/components/switch",
  },
  usage: {
    imports: `import { Switch } from "@/components/ui/switch"`,
    code: `<Switch defaultChecked />`,
  },
  examples: [
    {
      id: "async",
      title: { en: "Saving", zh: "异步保存" },
      description: { en: "Flips right away when `onCheckedChange` returns a Promise and shakes back on error.", zh: "`onCheckedChange` 返回 Promise 时立即切换状态，失败则抖动回退。" },
    },
    {
      id: "icons",
      title: { en: "Track Icons", zh: "轨道图标" },
      description: { en: "Adds a check and ring inside the track so state does not rely on colour.", zh: "在轨道内显示对勾与圆环，不依赖颜色区分状态。" },
    },
    {
      id: "controlled",
      title: { en: "Controlled", zh: "受控" },
    },
    {
      id: "with-description",
      title: { en: "With Description", zh: "带说明" },
    },
    {
      id: "disabled",
      title: { en: "Disabled", zh: "禁用" },
    },
    {
      id: "read-only",
      title: { en: "Read Only", zh: "只读" },
    },
    { id: "sizes", title: { en: "Sizes", zh: "尺寸" } },
    {
      id: "rtl",
      title: { en: "RTL", zh: "从右到左" },
    },
  ],
  notes: [
    {
      title: "Motion and Drag",
      body: {
        en: "Pressing stretches the thumb, releasing slides it over 300ms with an overshoot curve, and dragging past the midpoint toggles it in either LTR or RTL.",
        zh: "按压时滑块会伸长，松开时以 300ms 过冲曲线滑动；支持沿从左到右或从右到左方向拖过中点切换。",
      },
    },
    {
      title: "Async Saving",
      body: {
        en: "Return a Promise from `onCheckedChange` to flip optimistically and block extra clicks while pending. A spinner appears after 400ms; rejection restores the previous value and shakes.",
        zh: "`onCheckedChange` 返回 Promise 时会乐观切换并锁定重复点击，超过 400ms 显示加载动画，拒绝则回退并抖动提示。",
      },
    },
    {
      title: "Keyboard",
      body: {
        en: "`Space` and `Enter` toggle the focused switch. It renders `role=\"switch\"` with a hidden checkbox, so it works inside forms with `name`.",
        zh: "`Space` 和 `Enter` 切换聚焦的开关。它渲染 `role=\"switch\"` 并带一个隐藏复选框，因此在带 `name` 的表单中可用。",
      },
    },
  ],
  api: [
    {
      name: "Switch",
      description: { en: "Track and thumb in one part.", zh: "轨道和滑块合为一个部分。" },
      extends: "Switch.Root",
      extendsHref: "https://base-ui.com/react/components/switch#root",
      props: [
        {
          name: "size",
          type: `"sm" | "default" | "lg"`,
          default: `"default"`,
          description: {
            en: "Track 28×16 / 36×20 / 44×24px. Inside a sized `Field` it takes the field's size (`xs` maps to `sm`).",
            zh: "轨道尺寸 28×16 / 36×20 / 44×24px。在指定尺寸的 `Field` 内采用字段的尺寸（`xs` 映射为 `sm`）。",
          },
        },
        {
          name: "icons",
          type: "boolean",
          default: "false",
          description: { en: "Render a check and ring inside the track.", zh: "在轨道内显示对勾与圆环。" },
        },
        { name: "checked", type: "boolean", description: { en: "Controlled state.", zh: "受控状态。" } },
        { name: "defaultChecked", type: "boolean", default: "false", description: { en: "Initial state when uncontrolled.", zh: "非受控时的初始状态。" } },
        {
          name: "onCheckedChange",
          type: "(checked: boolean, eventDetails) => unknown",
          description: { en: "Called when toggled. Return a Promise to enable optimistic pending state.", zh: "切换开关时调用。返回 Promise 可启用乐观异步等待状态。" },
        },
        { name: "disabled", type: "boolean", default: "false", description: { en: "Dims the switch and blocks interaction.", zh: "使开关变暗并阻止交互。" } },
        { name: "readOnly", type: "boolean", default: "false", description: { en: "Focusable but can't be toggled.", zh: "可聚焦但无法切换。" } },
        { name: "name", type: "string", description: { en: "Submits the value with a form.", zh: "随表单提交值。" } },
      ],
      dataAttributes: [
        { name: "data-size", description: { en: "The resolved size.", zh: "解析后的尺寸。" } },
        { name: "data-checked", description: { en: "Present when on.", zh: "开启时存在。" } },
        { name: "data-unchecked", description: { en: "Present when off.", zh: "关闭时存在。" } },
        { name: "data-disabled", description: { en: "Present when disabled.", zh: "禁用时存在。" } },
        { name: "data-dragging", description: { en: "Present while dragging the thumb.", zh: "拖动滑块时存在。" } },
        { name: "data-pending", description: { en: "Present while an async `onCheckedChange` Promise is pending.", zh: "异步 `onCheckedChange` 尚未完成时存在。" } },
        { name: "data-shake", description: { en: "Present briefly after an async change rejects.", zh: "异步切换拒绝回退时短暂存在。" } },
      ],
    },
  ],
} satisfies ComponentDoc
