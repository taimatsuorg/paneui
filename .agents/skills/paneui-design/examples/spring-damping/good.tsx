import { motion } from "motion/react"

// 420 / 38 / 0.6 is close to critical damping: fast, no overshoot.
export function Thumb({ x }: { x: number }) {
  return <motion.span animate={{ x }} transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.6 }} className="size-4 rounded-full bg-card shadow-raised" />
}
