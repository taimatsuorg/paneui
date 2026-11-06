import { ImageZoom } from "@paneui/ui/components/image-zoom"

// The image element is yours (a framework image, or what a Markdown renderer outputs); the
// viewer reads its current source and size.
export default function ImageZoomWrap() {
  return (
    <ImageZoom alt="Paper hills under a summer sky" zoomSrc="https://paneui.dev/covers/sky.jpg">
      {/* eslint-disable-next-line @next/next/no-img-element -- stands for the image your renderer outputs */}
      <img
        src="https://paneui.dev/covers/sky.jpg"
        alt="Paper hills under a summer sky"
        width={1200}
        height={630}
        className="block h-auto w-64 rounded-lg media-outline"
      />
    </ImageZoom>
  )
}
