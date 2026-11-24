import { motion } from "motion/react"

// The toast leaves with a short rise and a fade, faster than it came in.
export function Toast({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(4px)", transition: { duration: 0.15 } }}
      className="rounded-xl bg-popover p-3 shadow-surface"
    >
      {children}
    </motion.div>
  )
}
