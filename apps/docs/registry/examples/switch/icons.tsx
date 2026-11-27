import { Label } from "@paneui/ui/components/label"
import { Switch } from "@paneui/ui/components/switch"

export default function SwitchIcons() {
  return (
    <div className="flex flex-col gap-4">
      <Label className="gap-3">
        <Switch icons defaultChecked />
        Captions
      </Label>
      <Label className="gap-3">
        <Switch icons size="lg" />
        Reduce transparency
      </Label>
    </div>
  )
}
