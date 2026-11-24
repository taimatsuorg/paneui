import { motion } from "motion/react"

// Shrinking to half size and flying a full height pulls the eye back to something that is leaving.
export function Toast({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: "-100%", scale: 0.5 }} className="rounded-xl bg-popover p-3 shadow-surface">
      {children}
    </motion.div>
  )
}
