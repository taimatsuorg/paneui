import { Button } from "@/components/ui/button"
import { PlusIcon } from "@/components/icons"

// data-icon trims 2px on the icon side, so the content looks centred.
export function NewButton() {
  return (
    <Button>
      <PlusIcon data-icon="inline-start" />
      New project
    </Button>
  )
}
