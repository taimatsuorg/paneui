import { AnimatePresence, motion } from "motion/react"

// initial={false}: the current status is simply there on load; only changes animate.
export function Status({ status }: { status: "saved" | "saving" }) {
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span key={status} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ui-sm text-muted-foreground">
        {status === "saved" ? "Saved" : "Saving…"}
      </motion.span>
    </AnimatePresence>
  )
}
