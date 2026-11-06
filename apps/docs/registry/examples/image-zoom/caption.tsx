import { ImageZoom } from "@paneui/ui/components/image-zoom"

export default function ImageZoomCaption() {
  return (
    <ImageZoom
      src="https://paneui.dev/covers/night.jpg"
      alt="Paper hills under a night sky"
      width={1200}
      height={630}
      caption="The night cover, shown on dark themes."
      className="w-80"
    />
  )
}
