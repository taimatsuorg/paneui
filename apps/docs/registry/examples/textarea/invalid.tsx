import { Label } from "@paneui/ui/components/label"
import { Textarea } from "@paneui/ui/components/textarea"

export default function TextareaInvalid() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="textarea-invalid">Reason for refund</Label>
      <Textarea id="textarea-invalid" aria-invalid aria-describedby="textarea-invalid-error" />
      <p id="textarea-invalid-error" className="text-xs text-destructive-text">
        Tell us what went wrong so we can route your request.
      </p>
    </div>
  )
}
