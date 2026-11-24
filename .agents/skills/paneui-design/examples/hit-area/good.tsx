// A 16px close button keeps its look and reaches 24px through a pseudo-element.
import { XIcon } from "@/components/icons"

export function ChipClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      aria-label="Remove"
      onClick={onClose}
      className="relative grid size-4 place-items-center rounded-sm text-muted-foreground after:absolute after:-inset-1 hover:text-foreground pointer-coarse:after:-inset-3.5"
    >
      <XIcon className="size-3" />
    </button>
  )
}
