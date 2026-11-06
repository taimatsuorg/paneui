import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Opens an image full size to zoom and pan.", zh: "点击图片全屏查看，可缩放和拖动。" },
  baseUi: { name: "Dialog", href: "https://base-ui.com/react/components/dialog" },
  usage: {
    imports: `import { ImageZoom } from "@/components/ui/image-zoom"`,
    code: `<ImageZoom src="/screenshots/editor.png" alt="The editor with two panes open" />`,
  },
  examples: [
    {
      id: "caption",
      title: { en: "Caption", zh: "说明文字" },
    },
    {
      id: "wrap",
      title: { en: "Wrap an Image", zh: "包裹图片" },
      description: { en: "Use when a framework or Markdown renderer already outputs the image.", zh: "适用于框架或 Markdown 渲染器已经输出图片的情况。" },
    },
  ],
  notes: [
    {
      title: "Zoom and pan",
      body: { en: "The wheel and a trackpad or touch pinch zoom around the pointer, up to `maxZoom`. A click toggles between fit and 2x; a drag pans while zoomed in. With the image focused, `+` and `-` zoom, `0` resets and the arrow keys pan.", zh: "滚轮以及触控板或触屏的双指缩放以指针为中心缩放，最大到 `maxZoom`。单击在适配大小与 2 倍之间切换；放大后拖动可平移。图片获得焦点时，`+` 和 `-` 缩放，`0` 复位，方向键平移。" },
    },
    {
      title: "Motion",
      body: { en: "The open image grows out of the thumbnail and shrinks back into it on close. Under reduced motion, or when the thumbnail is off screen, it fades instead.", zh: "打开时大图从缩略图的位置放大展开，关闭时缩回缩略图。开启减少动态效果，或缩略图不在屏幕内时，改为淡入淡出。" },
    },
    {
      title: "Closing and focus",
      body: { en: "Escape, the close button or a click on the backdrop closes it. Focus moves to the image on open and returns to the thumbnail on close.", zh: "按 Esc、点击关闭按钮或点击背景即可关闭。打开时焦点移到图片上，关闭后回到缩略图。" },
    },
    {
      title: "Sizes",
      body: { en: "The open image fits the window and is never drawn larger than its own pixels, unless `zoomSrc` points to a larger file. Until that file loads, the thumbnail's file stands in.", zh: "打开的图片适配窗口大小，且不会超过其原始像素尺寸，除非 `zoomSrc` 指向更大的文件。在该文件加载完成前，先显示缩略图的文件。" },
    },
  ],
  api: [
    {
      name: "ImageZoom",
      extends: "img",
      props: [
        { name: "src", type: "string", description: { en: "The thumbnail. Leave it out when you pass an image as children.", zh: "缩略图。以子元素传入图片时可省略。" } },
        { name: "zoomSrc", type: "string", description: { en: "A larger file for the open view.", zh: "打开后显示的更大文件。" } },
        { name: "caption", type: "ReactNode", description: { en: "Shown under the thumbnail and the open image.", zh: "显示在缩略图和打开的图片下方。" } },
        { name: "maxZoom", type: "number", default: "4", description: { en: "Largest zoom in the open view.", zh: "打开后的最大缩放倍数。" } },
        { name: "children", type: "ReactNode", description: { en: "An image element to use as the thumbnail.", zh: "用作缩略图的图片元素。" } },
        { name: "rootClassName", type: "string", description: { en: "Class for the trigger, or the figure when there is a caption. `className` goes to the image.", zh: "触发器（有说明文字时为 figure）的 class。`className` 作用于图片。" } },
        { name: "open", type: "boolean", description: { en: "Controlled open state.", zh: "受控的打开状态。" } },
        { name: "defaultOpen", type: "boolean", default: "false", description: { en: "Open on first render.", zh: "首次渲染时即打开。" } },
        { name: "onOpenChange", type: "(open: boolean) => void", description: { en: "Called when it opens or starts to close.", zh: "打开或开始关闭时调用。" } },
      ],
      dataAttributes: [{ name: "data-viewing", description: { en: "On the trigger while the open image stands in for the thumbnail.", zh: "在大图代替缩略图显示期间，位于触发器上。" } }],
    },
    {
      name: "useZoomPan",
      description: { en: "Pan and zoom state for your own viewer. Returns the controller `ZoomPan` and `ZoomToolbar` take.", zh: "为自定义查看器提供平移和缩放状态，返回 `ZoomPan` 与 `ZoomToolbar` 所需的控制器。" },
      props: [
        { name: "maxZoom", type: "number", default: "4", description: { en: "Largest scale.", zh: "最大缩放倍数。" } },
        { name: "bounds", type: `"viewport" | "surface"`, default: `"surface"`, description: { en: "What the zoomed content keeps covered: the window, or the surface's own box.", zh: "放大后的内容需覆盖的范围：整个窗口，或表面自身的区域。" } },
      ],
    },
    {
      name: "ZoomPan",
      extends: "div",
      description: { en: "The surface that pans and zooms its children.", zh: "可平移和缩放其子元素的表面。" },
      props: [
        { name: "zoom", type: "ZoomPanController", required: true, description: { en: "The controller from `useZoomPan`.", zh: "来自 `useZoomPan` 的控制器。" } },
        { name: "contentClassName", type: "string", description: { en: "Class for the transformed layer.", zh: "被变换图层的 class。" } },
      ],
      dataAttributes: [
        { name: "data-zoomed", description: { en: "While the scale is above 1.", zh: "缩放倍数大于 1 时。" } },
        { name: "data-gesture", description: { en: "While a drag or pinch is under way.", zh: "拖动或双指缩放进行中。" } },
      ],
    },
    {
      name: "ZoomToolbar",
      extends: "div",
      description: { en: "Zoom out, zoom in and close buttons. Render it inside a dialog popup.", zh: "缩小、放大和关闭按钮，需放在对话框弹层内。" },
      props: [{ name: "zoom", type: "ZoomPanController", required: true, description: { en: "The controller from `useZoomPan`.", zh: "来自 `useZoomPan` 的控制器。" } }],
    },
  ],
} satisfies ComponentDoc
