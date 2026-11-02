import { CoverArt } from "@paneui/ui/components/cover-art"

const files = Array.from({ length: 36 }, (_, i) => `render-${i + 1}.png`)

export default function CoverArtGallery() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-6 gap-2">
      {files.map((f) => (
        <div key={f} className="overflow-hidden rounded-lg">
          <CoverArt seed={f} renderer="css" aria-label={f} className="aspect-square" />
        </div>
      ))}
    </div>
  )
}
