import { Button } from "@/components/ui/button"
import { SettingsIcon } from "@/components/icons"

// A thicker stroke on one glyph makes it look like it came from another set.
export function SettingsButton() {
  return (
    <Button variant="ghost">
      <SettingsIcon data-icon="inline-start" strokeWidth={2.5} />
      Settings
    </Button>
  )
}
