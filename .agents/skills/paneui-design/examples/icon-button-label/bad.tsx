import { Button } from "@/components/ui/button"
import { TrashIcon } from "@/components/icons"

// Announced as "button" and nothing else.
export function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <Button variant="ghost" size="icon-sm" onClick={onDelete}>
      <TrashIcon />
    </Button>
  )
}
