import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Creates and edits geometric avatars.", zh: "生成与编辑确定性几何头像。" },
  usage: {
    imports: `import { GeneratedAvatar } from "@/components/ui/generated-avatar"
import { AvatarGenerator } from "@/components/ui/avatar-generator"`,
    code: `<GeneratedAvatar seed={user.id} size="lg" title={user.name} />`,
  },
  composition: `GeneratedAvatar        Avatar frame + deterministic geometric SVG
GeneratedAvatarImage   bare <svg>, e.g. inside AvatarFallback
createGeneratedAvatar  no React: SVG string, data URI, resolved traits
AvatarGenerator        editor for seed, backdrop, silhouette, expression, tone and hue`,
  examples: [
    {
      id: "by-seed",
      title: { en: "From a Seed", zh: "按种子生成" },
      description: { en: "Use a stable seed, like a user id, so a person gets the same avatar everywhere.", zh: "使用固定种子，让同一用户始终获得同一头像。" },
    },
    {
      id: "expressions",
      title: { en: "Expressions", zh: "表情" },
      description: { en: "Pass any of the fourteen pose expressions while keeping the character's identity.", zh: "在保留角色轮廓与配色的同时传入十四种静态表情之一。" },
    },
    {
      id: "options",
      title: { en: "Options", zh: "选项" },
    },
    {
      id: "generator",
      title: { en: "Generator", zh: "生成器" },
    },
  ],
  notes: [
    {
      title: "Credits",
      body: {
        en: "Generated avatars are powered by [blobatar](https://blobatar.dev) by Alain ([GitHub](https://github.com/Alain00/blobatar)), licensed under MIT and installed as a zero-dependency npm package. Nothing is fetched at runtime. Full licence notice in `THIRD_PARTY_NOTICES.md`.",
        zh: "头像生成由 Alain 创作的 [blobatar](https://blobatar.dev)（[GitHub](https://github.com/Alain00/blobatar)）提供支持，采用 MIT 许可证并作为零依赖 npm 包随组件安装，运行时不发起任何网络请求。完整致谢与许可声明见 `THIRD_PARTY_NOTICES.md`。",
      },
    },
    {
      title: "Silhouettes and tones",
      body: {
        en: "Each seed maps deterministically to one of ten silhouettes (`round`, `organic`, `boxy`, `capsule`, `nub`, `cloud`, `droplet`, `hexagon`, `sun`, `triangle`), six tone swatches (`pastel`, `pale`, `mid`, `deep`, `bright`, `ink`), and a continuous hue angle. Override `silhouette`, `tone` or `hue` individually while keeping the rest seed-driven.",
        zh: "每个种子都会确定性地映射到十种轮廓（`round`、`organic`、`boxy`、`capsule`、`nub`、`cloud`、`droplet`、`hexagon`、`sun`、`triangle`）、六个色调档位（`pastel`、`pale`、`mid`、`deep`、`bright`、`ink`）以及连续色相角。可以单独覆盖 `silhouette`、`tone` 或 `hue`，其余特征仍由种子决定。",
      },
    },
    {
      title: "Contrast and dark mode",
      body: {
        en: "Eyes stay at least 4.5:1 against the body across every hue and tone, and dark bodies stay legible on dark surfaces. The default `none` backdrop sits cleanly inside `bg-card`, `bg-secondary` or any tinted surface, while `squircle`, `circle` and `square` add a matched backdrop plate.",
        zh: "眼睛与主体的对比度在所有色相与色调下均保持至少 4.5:1，深色主体在暗色背景下依然清晰可辨。默认的 `none` 底板可自然叠放在 `bg-card`、`bg-secondary` 等容器上，而 `squircle`、`circle` 和 `square` 会绘制配套的底板。",
      },
    },
    {
      title: "Storing an avatar",
      body: {
        en: "Store only the `seed` when an avatar can regenerate from user data. When edited in `AvatarGenerator`, store `{ seed, silhouette, expression, tone, hue, background }` from `onValueChange`.",
        zh: "仅需基于用户标识复现时保存 `seed` 即可。若用户在 `AvatarGenerator` 中调整过样式，可保存 `onValueChange` 返回的 `{ seed, silhouette, expression, tone, hue, background }`。",
      },
    },
    {
      title: "Generator width",
      body: {
        en: "`AvatarGenerator` lays out by its own width rather than the screen's. Below 36rem it stacks vertically; from 36rem upward the preview sits beside the controls up to `max-w-2xl`.",
        zh: "`AvatarGenerator` 按自身容器宽度而非屏幕宽度布局。低于 36rem 时上下堆叠，达到 36rem 及以上时预览与控件左右并排，最大宽度为 `max-w-2xl`。",
      },
    },
  ],
  api: [
    {
      name: "GeneratedAvatar",
      description: { en: "A deterministic geometric avatar inside the library's `Avatar` frame. Children (e.g. `AvatarStatus`) render on top.", zh: "位于组件库 `Avatar` 框架内的确定性几何头像。子元素（例如 `AvatarStatus`）渲染在上层。" },
      extends: "Avatar",
      props: [
        { name: "seed", type: "string", required: true, description: { en: "Any stable string.", zh: "任意稳定字符串。" } },
        { name: "silhouette", type: `"round" | "organic" | "boxy" | "capsule" | "nub" | "cloud" | "droplet" | "hexagon" | "sun" | "triangle"`, description: { en: "Pins one of the ten silhouettes. Omitting lets the seed pick.", zh: "固定十种轮廓之一。省略则由种子决定。" } },
        { name: "expression", type: `"idle" | "happy" | "sad" | "mad" | "surprised" | "wink" | "sleepy" | "smug" | "unsure" | "scared" | "love" | "shy" | "sick" | "thinking" | Expression`, default: `"idle"`, description: { en: "Static pose by name or imported from `blobatar/expression`.", zh: "静态表情名称或来自 `blobatar/expression` 的表情对象。" } },
        { name: "background", type: `"none" | "square" | "circle" | "squircle" | string`, default: `"none"`, description: { en: "Backdrop plate shape or a custom hex / CSS colour for a square plate.", zh: "底板形状，或用于方形底板的十六进制 / CSS 颜色。" } },
        { name: "tone", type: `"pastel" | "pale" | "mid" | "deep" | "bright" | "ink" | number`, description: { en: "Locks a named tone swatch or a 0–0.999 position on the tone ramp.", zh: "锁定命名色调档位或 0–0.999 色调区间值。" } },
        { name: "hue", type: "number", description: { en: "Locks hue in degrees (0–360) while silhouette and eye proportions still come from the seed.", zh: "锁定色相角度（0–360°），同时轮廓与眼睛比例仍由种子决定。" } },
        { name: "colors", type: `{ background?, head?, eye?: string }`, description: { en: "Direct colour overrides for backdrop plate, body (`head`) or eyes.", zh: "直接覆盖底板、主体（`head`）或眼睛颜色。" } },
        { name: "traits", type: "TraitOverrides", description: { en: "Low-level 0–1 trait overrides passed straight to the generator.", zh: "直接透传给生成器的底层 0–1 特征覆盖映射。" } },
        { name: "contrast", type: "boolean", default: "true", description: { en: "Enforces minimum 4.5:1 eye contrast and dark-surface body contrast.", zh: "强制启用 4.5:1 眼睛对比度与深色背景辨识度保护。" } },
        { name: "normalize", type: "boolean", default: "true", description: { en: "Applies Unicode NFC, trim and lowercase normalisation to `seed`.", zh: "对 `seed` 应用 Unicode NFC、去空白与小写规范化。" } },
        { name: "size", type: `"xs" | "sm" | "md" | "lg" | "xl" | number`, default: `"md"`, description: { en: "An Avatar size or a pixel size. Inside an `AvatarGroup` it follows the group.", zh: "Avatar 尺寸或像素尺寸。在 `AvatarGroup` 内跟随组尺寸。" } },
        { name: "shape", type: `"circle" | "rounded"`, default: `"circle"`, description: { en: "Passed to `Avatar`.", zh: "传递给 `Avatar`。" } },
        { name: "title", type: "string", description: { en: "Accessible name. Without it the avatar is decorative.", zh: "可访问名称。未提供时头像为装饰性元素。" } },
      ],
    },
    {
      name: "GeneratedAvatarImage",
      description: { en: "The drawing alone as a bare `<svg>` that fills its box. Same options as `GeneratedAvatar` minus `size` and `shape`.", zh: "仅绘制图形本身作为填充容器的 `<svg>`。选项与 `GeneratedAvatar` 相同（不含 `size` 与 `shape`）。" },
      extends: "svg",
      props: [],
    },
    {
      name: "createGeneratedAvatar",
      description: { en: "Framework-free builder. Returns `{ resolved, viewBox, content, toString(size?), toDataUri(size?) }`.", zh: "无框架构建器。返回 `{ resolved, viewBox, content, toString(size?), toDataUri(size?) }`。" },
      props: [
        { name: "options", type: "GeneratedAvatarOptions", required: true, description: { en: "Same options as `GeneratedAvatar`.", zh: "选项与 `GeneratedAvatar` 相同。" } },
      ],
    },
    {
      name: "getAvatarSilhouettes / getAvatarExpressions / getAvatarTones / getAvatarBackdrops",
      description: { en: "Pure helpers returning localised `{ value, label }[]` lists for custom avatar pickers.", zh: "纯辅助函数，返回本地化的 `{ value, label }[]` 列表用于自定义选择器。" },
      props: [
        { name: "labels", type: "LocaleLabels", default: "localeLabels.en", description: { en: "Optional locale label map from `LocaleProvider`.", zh: "可选的 `LocaleProvider` 语言标签集。" } },
      ],
    },
    {
      name: "AvatarGenerator",
      description: { en: "Interactive editor for seed, backdrop, silhouette, expression, tone and hue.", zh: "用于编辑种子、底板、轮廓、表情、色调与色相的交互式生成器。" },
      extends: "div",
      props: [
        { name: "defaultSeed", type: "string", default: `"paneui"`, description: { en: "Initial seed.", zh: "初始种子。" } },
        { name: "defaultBackground", type: `"none" | "squircle" | "circle" | "square"`, default: `"none"`, description: { en: "Initial backdrop style.", zh: "初始底板风格。" } },
        { name: "onValueChange", type: "(state: AvatarGeneratorState) => void", description: { en: "Called on every change with `{ seed, silhouette, expression, tone, hue, background }`.", zh: "每次更改时触发，返回 `{ seed, silhouette, expression, tone, hue, background }`。" } },
      ],
    },
  ],
} satisfies ComponentDoc
