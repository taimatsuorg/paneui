import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {
    en: "Renders product and service logos with light and dark theme support.",
    zh: "渲染支持明暗主题切换的产品与服务品牌标识。",
  },
  usage: {
    imports: `import { GitHubDark, GitHubLight } from "@ridemountainpig/svgl-react"\nimport { BrandIcon } from "@/components/ui/brand-icon"`,
    code: `<BrandIcon icon={{ light: GitHubLight, dark: GitHubDark }} title="GitHub" />`,
  },
  examples: [
    {
      id: "colors",
      title: { en: "Color modes", zh: "色彩模式" },
      description: {
        en: "Use the default brand palette in lists and cards, or switch to the current text color in controls and toolbars.",
        zh: "在列表与卡片中默认展示品牌原色，在控件与工具栏中可切换为跟随文字色。",
      },
    },
    {
      id: "sizes",
      title: { en: "Sizes", zh: "尺寸" },
      description: {
        en: "Pass a pixel size or scale through CSS size utilities.",
        zh: "通过像素值或 CSS 尺寸类名调整图标大小。",
      },
    },
    {
      id: "sign-in",
      title: { en: "Sign-in providers", zh: "登录方式按钮" },
      description: {
        en: "Pair full-color marks or monochrome icons with outlined action buttons.",
        zh: "将品牌原色标识或单色标识放进登录按钮的左侧图标位。",
      },
    },
    {
      id: "integrations",
      title: { en: "Integrations list", zh: "集成列表" },
      description: {
        en: "Place 18px brand marks inside rounded tiles beside short descriptions.",
        zh: "在集成设置项的圆角图标位中展示 18px 品牌标识。",
      },
    },
    {
      id: "own-marks",
      title: { en: "Custom and paired marks", zh: "自定义与明暗配对标识" },
      description: {
        en: "Pass a theme pair object from SVGL or a local React SVG component.",
        zh: "既可传入 SVGL 提供的明暗配对对象，也可传入本地自定义 React SVG 组件。",
      },
    },
  ],
  notes: [
    {
      title: "Credits",
      body: {
        en: "Brand logos are imported via [`@ridemountainpig/svgl-react`](https://www.npmjs.com/package/@ridemountainpig/svgl-react) (MIT License), built on the [SVGL](https://svgl.app) directory ([pheralb/svgl](https://github.com/pheralb/svgl), MIT License). Trademarks remain the property of their respective owners; full licence details live in `THIRD_PARTY_NOTICES.md`.",
        zh: "品牌标识通过基于 [SVGL](https://svgl.app) 图标库（[pheralb/svgl](https://github.com/pheralb/svgl)，MIT 许可证）构建的 [`@ridemountainpig/svgl-react`](https://www.npmjs.com/package/@ridemountainpig/svgl-react)（MIT 许可证）按需引入。各品牌商标归其各自所有者所有，完整许可说明见 `THIRD_PARTY_NOTICES.md`。",
      },
    },
    {
      title: "Named imports only",
      body: {
        en: "Import individual components by name from `@ridemountainpig/svgl-react`. Never use namespace imports (`import *`) because the package exports hundreds of SVGs.",
        zh: "始终按名称从 `@ridemountainpig/svgl-react` 导入所需图标，切勿使用通配符导入（`import *`）。",
      },
    },
    {
      title: "Light and dark pairs",
      body: {
        en: "Logos that ship separate Light and Dark exports accept a `{ light, dark }` object and toggle visibility via `dark:hidden` and `dark:block`.",
        zh: "对分别提供 `Light` 与 `Dark` 导出的品牌，直接传入 `{ light, dark }` 对象即可自动随明暗主题切换显示。",
      },
    },
  ],
  api: [
    {
      name: "BrandIcon",
      description: {
        en: "Renders a named SVGL component, a light/dark pair, or a local React SVG component.",
        zh: "渲染单个 SVGL 组件、明暗配对对象或本地 React SVG 组件。",
      },
      props: [
        {
          name: "icon",
          type: "BrandIconSource",
          required: true,
          description: {
            en: "An SVG component `(props) => JSX.Element` or a `{ light, dark }` pair.",
            zh: "单个 SVG 组件或 `{ light, dark }` 明暗主题配对对象。",
          },
        },
        {
          name: "color",
          type: `"brand" | "current"`,
          default: `"brand"`,
          description: {
            en: "`brand` keeps native SVGL colours; `current` overrides SVG fills and strokes with `currentColor`.",
            zh: "`brand` 保留 SVGL 原始配色；`current` 将填充与描边替换为 `currentColor`。",
          },
        },
        {
          name: "size",
          type: "number",
          default: "18",
          description: {
            en: "Width and height attributes applied to the SVG in pixels.",
            zh: "应用到 SVG 元素的宽高像素值。",
          },
        },
        {
          name: "title",
          type: "string",
          description: {
            en: "Accessible label exposed with `role=\"img\"`; omit when decorative next to visible text.",
            zh: "搭配 `role=\"img\"` 使用的无障碍标签；若紧邻文字说明可省略以隐藏于读屏器。",
          },
        },
        {
          name: "name",
          type: "string",
          description: {
            en: "Optional brand identifier reflected onto the `data-brand` attribute.",
            zh: "可选的品牌标识名，将同步设置到 `data-brand` 属性。",
          },
        },
      ],
    },
  ],
} satisfies ComponentDoc
