import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Cover images for posts and cards.", "zh": "为文章和卡片生成封面。"},
  usage: {
    imports: `import { CoverArt } from "@/components/ui/cover-art"`,
    code: `<CoverArt seed={post.slug} aria-label={post.title} className="aspect-video rounded-xl" />
<CoverArt image={post.image} className="aspect-video" />`,
  },
  examples: [
    { id: "seed", title: { en: "From a Seed", zh: "按种子生成" } },
    { id: "shader", title: { en: "Palette", zh: "配色" }, description: { en: "Use when the cover should match your brand colours.", zh: "封面需要贴合品牌配色时使用。" } },
    { id: "gallery", title: { en: "Gallery", zh: "图库" }, description: { en: "Use `renderer=\"css\"` for grids of many tiles.", zh: "大量缩略图的网格使用 `renderer=\"css\"`。" } },
    { id: "image", title: { en: "Image", zh: "图片" }, description: { en: "Use when the post already has its own artwork.", zh: "文章已有配图时使用。" } },
    { id: "rtl", title: { en: "RTL", zh: "从右到左" } },
  ],
  notes: [
    {
      title: "Shader",
      body: { en: "Without `image` the cover renders [Shader Background](/docs/shader-background), which pauses offscreen and under reduced motion. A `seed` picks a random palette from a stable hash, so the same slug gets the same colours on every visit and in `OgCoverArt`. `palette=\"random\"` without a seed picks new colours after mount; with neither, the shader uses the theme colours. `renderer=\"css\"` draws a still frame of the mesh gradient with CSS radial gradients in the same palette instead: no WebGL context and no client code, so dozens of tiles stay cheap (browsers cap live WebGL contexts at about 16).", zh: "没有 `image` 时，封面渲染 [Shader Background](/docs/shader-background)，在屏幕外和减少动态效果下暂停。`seed` 从稳定哈希中选取随机调色板，因此相同 slug 每次访问和 `OgCoverArt` 中得到相同颜色。`palette=\"random\"` 没有 seed 时在挂载后选取新颜色；两者都没有时，着色器使用主题色。`renderer=\"css\"` 改用 CSS 径向渐变绘制同一配色的网格渐变静帧：没有 WebGL 上下文，也没有客户端代码，几十个缩略图也不费力（浏览器同时最多约 16 个 WebGL 上下文）。" },
    },
    {
      title: "Accessibility",
      body: { en: "The art is `role=\"img\"`, named by the locale’s `coverArt` label (“Abstract cover illustration” in English) through a hidden element. Pass `aria-label` with the post title, or `aria-hidden` when a caption next to it already names the post.", zh: "图像为 `role=\"img\"`，通过隐藏元素由区域设置的 `coverArt` 标签命名（英文为“Abstract cover illustration”）。传入 `aria-label` 和帖子标题，或当旁边的说明文字已命名帖子时传入 `aria-hidden`。" },
    },
    {
      title: "Share images",
      body: { en: "This art is WebGL for the page. For an `opengraph-image` route use `OgCoverArt` from [OG Image](/docs/og-image): the same `image`, `palette` and `seed`, with the shader drawn as a still frame of the same colours. Clip the cover with a wrapper (`overflow-hidden rounded-xl`) to round its corners.", zh: "此图是页面的 WebGL。对于 `opengraph-image` 路由，使用 [OG Image](/docs/og-image) 中的 `OgCoverArt`：相同的 `image`、`palette` 和 `seed`，着色器绘制为相同颜色的静态帧。用包装器（`overflow-hidden rounded-xl`）裁剪封面以圆角。" },
    },
  ],
  api: [
    {
      name: "CoverArt",
      extends: "div",
      props: [
        { name: "image", type: "string", description: { en: "Image URL drawn edge to edge. Wins over the shader.", zh: "边到边绘制的图像 URL。优先于着色器。" } },
        { name: "palette", type: 'string[] | "random"', description: { en: "Shader colours, or a random set. Defaults to random with `seed`, else the theme.", zh: "着色器颜色，或随机一组。默认使用 `seed` 随机，否则使用主题。" } },
        { name: "shader", type: "ShaderVariant", default: '"mesh-gradient"', description: { en: "Which shader to draw.", zh: "绘制哪个着色器。" } },
        { name: "renderer", type: '"shader" | "css"', default: '"shader"', description: { en: "`css` draws a still mesh gradient instead of the WebGL shader.", zh: "`css` 绘制静态网格渐变，代替 WebGL 着色器。" } },
        { name: "seed", type: "string", description: { en: "Keeps the random palette stable, from a hash of the string.", zh: "从字符串哈希保持随机调色板稳定。" } },
      ],
      dataAttributes: [{ name: "data-variant", description: { en: "`image`, `shader` or `gradient` (with `renderer=\"css\"`).", zh: "`image`、`shader` 或 `gradient`（`renderer=\"css\"` 时）。" } }],
    },
  ],
} satisfies ComponentDoc
