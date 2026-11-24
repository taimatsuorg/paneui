import { Button } from "@/components/ui/button"
import { PlusIcon } from "@/components/icons"

// Equal padding: the icon's side bearing makes the start look wider than the end.
export function NewButton() {
  return (
    <Button>
      <PlusIcon />
      New project
    </Button>
  )
}
