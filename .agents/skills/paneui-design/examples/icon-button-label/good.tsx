import { Button } from "@/components/ui/button"
import { TrashIcon } from "@/components/icons"

// The name a screen reader announces, and the text its tooltip shows.
export function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={onDelete}>
      <TrashIcon />
    </Button>
  )
}
