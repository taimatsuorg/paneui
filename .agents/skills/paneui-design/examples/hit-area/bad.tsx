// 16px is all there is to hit; on a trackpad it takes two tries.
import { XIcon } from "@/components/icons"

export function ChipClose({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" aria-label="Remove" onClick={onClose} className="grid size-4 place-items-center rounded-sm text-muted-foreground hover:text-foreground">
      <XIcon className="size-3" />
    </button>
  )
}
