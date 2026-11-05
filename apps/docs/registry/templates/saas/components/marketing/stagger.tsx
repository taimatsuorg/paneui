"use client"

import * as React from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"

/*
 * Staged entrance for a hero or page header: children marked <StaggerItem>
 * enter 100ms apart with opacity, 4px blur and 12px rise over 300ms ease-out.
 * Under reduced motion they render in place.
 */

const item: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: "easeOut" } },
}
const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
}

const ReduceContext = React.createContext(false)

export function Stagger({ delay = 0, className, children }: { delay?: number; className?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion() ?? false
  return (
    <ReduceContext.Provider value={reduce}>
      <motion.div
        className={className}
        // reduced motion: start finished, so nothing waits on an animation to be readable
        initial={reduce ? false : "hidden"}
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: delay } } }}
      >
        {children}
      </motion.div>
    </ReduceContext.Provider>
  )
}

export function StaggerItem({ className, children }: { className?: string; children: React.ReactNode }) {
  const reduce = React.useContext(ReduceContext)
  return (
    <motion.div className={className} variants={reduce ? fade : item}>
      {children}
    </motion.div>
  )
}
