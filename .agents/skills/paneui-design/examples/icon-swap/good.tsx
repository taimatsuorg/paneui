import { AnimatePresence, motion } from "motion/react"

import { CheckIcon, CopyIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"

// The glyph changes in place: scale 0.25, blur 4px and opacity 0 on the way in and out.
// With the action-swap-blur item installed, <ActionSwapBlurIcon value={…}> does the same.
const hidden = { opacity: 0, scale: 0.25, filter: "blur(4px)" }

export function CopyButton({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <Button variant="ghost" size="icon-sm" aria-label={copied ? "Copied" : "Copy"} onClick={onCopy}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={copied ? "copied" : "copy"}
          initial={hidden}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={hidden}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          className="inline-flex"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}
