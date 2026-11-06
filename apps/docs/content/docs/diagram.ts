import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Frames a diagram drawn in the browser, with full-screen zoom.", zh: "为浏览器中绘制的示意图提供外框，可全屏缩放。" },
  usage: {
    imports: `import { Diagram } from "@/components/ui/diagram"`,
    code: `<Diagram
  source={source}
  render={async (source, theme) => {
    const { drawSvg } = await import("./my-diagram-renderer")
    return drawSvg(source, { colors: theme.colors, dark: theme.dark })
  }}
  caption="How a request is served"
/>`,
  },
  examples: [
    {
      id: "error",
      title: { en: "Error", zh: "出错" },
    },
    {
      id: "drawn",
      title: { en: "Already Drawn", zh: "已绘制的图" },
      description: { en: "Use for a diagram drawn at build time or written by hand.", zh: "适用于构建时生成或手写的示意图。" },
    },
    {
      id: "theme-colors",
      title: { en: "Theme Colours as Hex", zh: "主题色转十六进制" },
      description: { en: "Use to hand theme colours to any renderer or canvas library.", zh: "适用于把主题色交给任意渲染器或画布库。" },
    },
  ],
  notes: [
    {
      title: "Renderer",
      body: { en: "`render(source, theme)` returns SVG markup, or a promise of it. It runs on the client when `source` or the theme on `<html>` changes (dark class, accent, style); `theme` carries `dark`, `fontFamily` and `colors`, the tokens from `colors` as `#rrggbb`. The markup is inserted as HTML, so run the renderer in its strict or sanitising mode. Load a heavy renderer inside `render` with a dynamic import so it stays out of the first bundle.", zh: "`render(source, theme)` 返回 SVG 字符串或其 Promise。它在客户端运行，`source` 或 `<html>` 上的主题（暗色 class、强调色、风格）变化时重新执行；`theme` 包含 `dark`、`fontFamily` 和 `colors`，即 `colors` 中各令牌的 `#rrggbb` 值。返回的字符串会作为 HTML 插入，请使用渲染器的严格或净化模式。较重的渲染器请在 `render` 内动态导入，避免进入首屏包。" },
    },
    {
      title: "States",
      body: { en: "A pulsing placeholder shows while the renderer runs (still under reduced motion). When it throws, the frame shows the message and the source instead of the diagram, and the full-screen view is off.", zh: "渲染器运行时显示脉动的占位块（开启减少动态效果时静止）。渲染出错时，外框显示错误信息和源码，此时不能全屏查看。" },
    },
    {
      title: "Full screen",
      body: { en: "A click opens the diagram in a dialog that fills the window. The wheel and a pinch zoom around the pointer, a drag pans, a click toggles 2x, and with the surface focused `+`, `-`, `0` and the arrow keys do the same. It shares its pan and zoom with Image Zoom.", zh: "点击后在铺满窗口的对话框中打开示意图。滚轮和双指以指针为中心缩放，拖动平移，单击切换 2 倍；表面获得焦点时，`+`、`-`、`0` 和方向键可完成同样操作。平移缩放与 Image Zoom 共用。" },
    },
    {
      title: "resolveThemeColors",
      body: { en: "`resolveThemeColors(names, { element, background })` reads each token through the cascade (so accent presets and scoped themes apply), paints it over the background on a 1×1 canvas to flatten alpha, and returns `#rrggbb`. Names can be `primary`, `--primary` or any CSS colour. It returns an empty record on the server; call it again when the theme changes.", zh: "`resolveThemeColors(names, { element, background })` 通过层叠读取每个令牌（因此强调色预设和局部主题都会生效），在 1×1 画布上叠加到背景色以消除透明度，并返回 `#rrggbb`。名称可写作 `primary`、`--primary` 或任意 CSS 颜色。在服务端返回空对象；主题变化后需重新调用。" },
    },
  ],
  api: [
    {
      name: "Diagram",
      extends: "figure",
      props: [
        { name: "source", type: "string", description: { en: "Diagram text for `render`, also shown on error.", zh: "传给 `render` 的示意图文本，出错时也会显示。" } },
        { name: "render", type: "(source: string, theme: DiagramTheme) => Promise<string> | string", description: { en: "Turns `source` into SVG markup.", zh: "把 `source` 转换为 SVG 字符串。" } },
        { name: "children", type: "ReactNode", description: { en: "An already drawn diagram, used instead of `source` and `render`.", zh: "已绘制好的示意图，代替 `source` 和 `render`。" } },
        { name: "caption", type: "ReactNode", description: { en: "Shown under the diagram and in full screen.", zh: "显示在示意图下方及全屏视图中。" } },
        { name: "colors", type: "string[]", default: "DIAGRAM_COLORS", description: { en: "Tokens resolved to hex for the renderer.", zh: "为渲染器转换为十六进制的令牌。" } },
        { name: "expandable", type: "boolean", default: "true", description: { en: "Opens full screen on click.", zh: "点击后全屏打开。" } },
        { name: "label", type: "string", default: `"Diagram"`, description: { en: "Accessible name of the figure and the full-screen view.", zh: "示意图与全屏视图的无障碍名称。" } },
        { name: "maxZoom", type: "number", default: "6", description: { en: "Largest zoom in full screen.", zh: "全屏时的最大缩放倍数。" } },
      ],
      dataAttributes: [{ name: "data-status", description: { en: "`loading`, `ready` or `error`.", zh: "`loading`、`ready` 或 `error`。" } }],
    },
    {
      name: "resolveThemeColors",
      description: { en: "Theme tokens as `#rrggbb`, keyed by the names passed.", zh: "以传入名称为键，返回主题令牌的 `#rrggbb` 值。" },
      props: [
        { name: "names", type: "string[]", required: true, description: { en: "Tokens to resolve.", zh: "要转换的令牌。" } },
        { name: "options.element", type: "Element", default: "document.body", description: { en: "Where to read the tokens.", zh: "读取令牌的元素。" } },
        { name: "options.background", type: "string", default: `"background"`, description: { en: "Token translucent colours are flattened over.", zh: "半透明颜色叠加所用的背景令牌。" } },
      ],
    },
  ],
} satisfies ComponentDoc
