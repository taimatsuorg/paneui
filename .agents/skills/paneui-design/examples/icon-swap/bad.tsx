import { Button } from "@/components/ui/button"
import { CheckIcon, CopyIcon } from "@/components/icons"

// The glyph cuts from copy to check, so the change is easy to miss.
export function CopyButton({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <Button variant="ghost" size="icon-sm" aria-label={copied ? "Copied" : "Copy"} onClick={onCopy}>
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}
