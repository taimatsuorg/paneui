import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Switches the accent colour at runtime with one attribute.", "zh": "在运行时切换主题色。"},
  usage: {
    imports: `/* your Tailwind CSS file, after the theme */
@import "./theme-accents.css";`,
    code: `<html data-accent="violet">`,
  },
  examples: [
    {
      id: "switch",
      title: { en: "Switch at Runtime", zh: "运行时切换" },
      description: { en: "Use the attribute on a section when one part of a page needs its own accent.", zh: "适用于局部区域需要独立主题色的场景。" },
    },
  ],
  notes: [
    {
      title: "Presets",
      body: { en: "`blue` (the default, also what no attribute gives), `neutral`, `green`, `orange`, `rose` and `violet`. Each sets the eight accent roles (`--primary` with its `-hover`, `-active`, `-foreground`, `-subtle`, `-subtle-hover` and `-border` variants, plus `--ring`), in light and under `.dark`. The values are the same as the single `theme-<name>` items, which bake one accent into the theme instead.", zh: "`blue`（默认，也是无属性时的值）、`neutral`、`green`、`orange`、`rose` 和 `violet`。每个在亮色和 `.dark` 下设置八个主题色角色（`--primary` 及其 `-hover`、`-active`、`-foreground`、`-subtle`、`-subtle-hover` 和 `-border` 变体，加上 `--ring`）。值与单个 `theme-<name>` 项相同，后者将一个主题色烘焙到主题中。" },
    },
    {
      title: "Switching",
      body: { en: "Set or remove the attribute with `document.documentElement.dataset.accent = \"rose\"`. To keep a pick across visits, store it and set the attribute in a pre-paint script, as the theme toggle does for `.dark`. For a ready-made control, see [Accent Picker](/docs/accent-picker).", zh: "使用 `document.documentElement.dataset.accent = \"rose\"` 设置或移除该属性。要在多次访问间保留选择，请存储它并在预绘制脚本中设置属性，就像主题切换对 `.dark` 所做的那样。如需现成控件，请参阅 [Accent Picker](/docs/accent-picker)。" },
    },
  ],
  api: [],
} satisfies ComponentDoc
