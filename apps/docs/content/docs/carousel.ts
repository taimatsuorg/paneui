import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Scrolls through slides one at a time.", "zh": "逐张浏览内容。"},
  "usage": {
    "imports": "import {\n  Carousel,\n  CarouselContent,\n  CarouselDots,\n  CarouselItem,\n  CarouselNext,\n  CarouselPrevious,\n} from \"@/components/ui/carousel\"",
    "code": "<Carousel aria-label=\"Photos\">\n  <CarouselContent>\n    <CarouselItem>…</CarouselItem>\n    <CarouselItem>…</CarouselItem>\n  </CarouselContent>\n  <CarouselPrevious />\n  <CarouselNext />\n</Carousel>"
  },
  "composition": "Carousel\n├── CarouselContent\n│   └── CarouselItem × n\n├── CarouselPrevious / CarouselNext\n└── CarouselDots",
  "examples": [
    {
      "id": "several-per-view",
      "title": {"en":"Several per View","zh":"同屏多项"},
    },
    {
      "id": "rtl",
      "title": {"en":"RTL","zh":"从右到左"},
    }
  ],
  "notes": [
    {
      "title": "Behaviour",
      "body": { en: "Slides scroll with native snapping, so touch, trackpad and wheel feel like the platform. ←/→ (↑/↓ when vertical) step one slide; with reduced motion the step jumps instead of scrolling smoothly.", zh: "幻灯片使用原生吸附滚动，触摸、触控板和滚轮的手感与平台一致。←/→（垂直时为 ↑/↓）切换一张幻灯片；减少动态效果时直接跳转而不是平滑滚动。" }
    },
    {
      "title": "Accessibility",
      "body": { en: "The root is a `region` with `aria-roledescription=\"carousel\"` and each item a `slide` group. Label both, for example \"2 of 5\" on items.", zh: "根元素是带 `aria-roledescription=\"carousel\"` 的 `region`，每个项是 `slide` 组。两者都要加标签，例如在项上写 \"2 of 5\"。" }
    }
  ],
  "api": [
    {
      "name": "Carousel",
      "extends": "div",
      "props": [
        {
          "name": "orientation",
          "type": "\"horizontal\" | \"vertical\"",
          "description": { en: "Scroll axis. A vertical carousel needs a height.", zh: "滚动轴。垂直轮播需要设置高度。" },
          "default": "\"horizontal\""
        },
        {
          "name": "loop",
          "type": "boolean",
          "description": { en: "Buttons and keys wrap at the ends.", zh: "在两端循环。" },
          "default": "false"
        },
        {
          "name": "onIndexChange",
          "type": "(index: number) => void",
          "description": { en: "Called when the current slide changes.", zh: "当前幻灯片变化时调用。" }
        }
      ]
    },
    {
      "name": "CarouselItem",
      "description": { en: "`basis-full` by default.", zh: "默认为 `basis-full`。" },
      "extends": "div",
      "props": []
    },
    {
      "name": "CarouselContent",
      "description": { en: "The scroll container; `className` goes on the track (spacing via `--carousel-gap`, padding).", zh: "滚动容器；`className` 加在轨道上（通过 `--carousel-gap` 调间距，或设置 padding）。" },
      "extends": "div",
      "props": []
    },
    {
      "name": "CarouselPrevious / CarouselNext",
      "extends": "Button",
      "extendsHref": "/docs/button#api-reference",
      "props": [
        {
          "name": "variant",
          "type": "Button variant",
          "description": "",
          "default": "\"secondary\""
        },
        {
          "name": "size",
          "type": "Button size",
          "description": "",
          "default": "\"icon-sm\""
        }
      ]
    },
    {
      "name": "CarouselDots",
      "extends": "div",
      "props": []
    },
    {
      "name": "useCarousel",
      "description": { en: "Inside a Carousel: `index`, `count`, `canPrev`, `canNext`, `scrollTo`, `scrollPrev`, `scrollNext`.", zh: "在 Carousel 内部：`index`、`count`、`canPrev`、`canNext`、`scrollTo`、`scrollPrev`、`scrollNext`。" },
      "props": []
    }
  ]
} satisfies ComponentDoc
