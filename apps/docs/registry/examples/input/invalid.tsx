import { Input } from "@paneui/ui/components/input"
import { Label } from "@paneui/ui/components/label"

export default function InputInvalid() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor="input-invalid">Email</Label>
      <Input id="input-invalid" type="email" defaultValue="dana@" aria-invalid aria-describedby="input-invalid-error" />
      <p id="input-invalid-error" className="text-xs text-destructive-text">
        Enter a full email address, like dana@example.com.
      </p>
    </div>
  )
}
