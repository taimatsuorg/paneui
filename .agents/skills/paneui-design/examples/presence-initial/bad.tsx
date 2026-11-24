import { AnimatePresence, motion } from "motion/react"

// Without initial={false} the label fades in on every page load.
export function Status({ status }: { status: "saved" | "saving" }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span key={status} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ui-sm text-muted-foreground">
        {status === "saved" ? "Saved" : "Saving…"}
      </motion.span>
    </AnimatePresence>
  )
}
