import { Button } from "@/components/ui/button"
import { SettingsIcon } from "@/components/icons"

// The set's stroke is tuned for the label beside it; the button sets size and colour.
export function SettingsButton() {
  return (
    <Button variant="ghost">
      <SettingsIcon data-icon="inline-start" />
      Settings
    </Button>
  )
}
