import { motion } from "motion/react"

// Bounce-free: the panel settles once.
export function Panel({ open }: { open: boolean }) {
  return <motion.div animate={{ height: open ? "auto" : 0 }} transition={{ type: "spring", duration: 0.3, bounce: 0 }} />
}
