import { motion } from "motion/react"

// Damping 12 on stiffness 400 overshoots and rings around its target.
export function Thumb({ x }: { x: number }) {
  return <motion.span animate={{ x }} transition={{ type: "spring", stiffness: 400, damping: 12 }} className="size-4 rounded-full bg-card shadow-raised" />
}
