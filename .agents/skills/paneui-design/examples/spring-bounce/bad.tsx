import { motion } from "motion/react"

// A bouncing panel wobbles every time it opens.
export function Panel({ open }: { open: boolean }) {
  return <motion.div animate={{ height: open ? "auto" : 0 }} transition={{ type: "spring", duration: 0.45, bounce: 0.3 }} />
}
