"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"

/** Diagonal wave through a 3×3 grid: each cell's delay is its distance from the top-left. */
const CELLS = Array.from({ length: 9 }, (_, i) => ({ i, delay: ((i % 3) + Math.floor(i / 3)) * 0.16 }))

function formatElapsed(total: number) {
  const s = Math.max(0, total)
  const minutes = Math.floor(s / 60)
  const seconds = s - minutes * 60
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${String(minutes % 60).padStart(2, "0")}m`
  }
  return minutes > 0 ? `${minutes}m ${String(Math.floor(seconds)).padStart(2, "0")}s` : `${seconds.toFixed(1)}s`
}

type AgentProgressProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Verb for what the agent is doing ("Searching", "Compiling"). */
  label?: string
  /** Controlled elapsed time in seconds. When set, the internal clock is ignored. */
  elapsed?: number
  /** Where the internal clock starts, in seconds. */
  initialElapsed?: number
  /** Whether the internal clock runs. When false the glyph rests and the timer freezes. */
  running?: boolean
  /** Optional trailing detail, e.g. a token count. */
  meta?: React.ReactNode
}

/** Compact "agent is working" readout: a pulsing 3×3 glyph, an action verb and a live tabular timer. */
function AgentProgress({
  label: labelProp,
  elapsed,
  initialElapsed = 0,
  running = true,
  meta,
  className,
  ...props
}: AgentProgressProps) {
  const { labels } = useLocale()
  const label = labelProp ?? labels.working
  const reduce = useReducedMotion()
  const [seconds, setSeconds] = React.useState(initialElapsed)
  const baseRef = React.useRef(initialElapsed)
  baseRef.current = seconds

  React.useEffect(() => {
    if (elapsed !== undefined || !running) return
    const startedAt = performance.now() - baseRef.current * 1000
    const id = window.setInterval(() => setSeconds((performance.now() - startedAt) / 1000), 100)
    return () => window.clearInterval(id)
  }, [elapsed, running])

  const value = elapsed ?? seconds
  const animating = running && !reduce

  return (
    <span
      role="status"
      data-slot="agent-progress"
      data-running={running || undefined}
      className={cn("inline-flex items-center gap-2.5 text-ui text-muted-foreground", className)}
      {...props}
      aria-label={props["aria-label"] ?? (running ? `${label}, ${labels.inProgress}` : label)}
    >
      <span aria-hidden className={cn("grid size-4 shrink-0 grid-cols-3 gap-[2px]", running ? "text-primary-text" : "text-muted-foreground/60")}>
        {CELLS.map(({ i, delay }) => (
          <motion.span
            key={i}
            className="rounded-[1.5px] bg-current"
            initial={false}
            animate={
              animating
                ? { opacity: [0.25, 1, 0.25], scale: [0.7, 1, 0.7] }
                : running
                  ? { opacity: [0.35, 0.9, 0.35], scale: 1 }
                  : { opacity: 0.55, scale: 1 }
            }
            transition={running ? { duration: 1.5, ease: [0.45, 0, 0.55, 1], repeat: Infinity, delay } : { duration: 0.3 }}
          />
        ))}
      </span>
      <span className="font-medium text-foreground">{label}</span>
      <span aria-hidden className="font-mono text-ui-sm text-muted-foreground tabular-nums">
        {formatElapsed(value)}
      </span>
      {meta != null && (
        <>
          <span aria-hidden className="text-muted-foreground/50">·</span>
          <span className="text-ui-sm tabular-nums">{meta}</span>
        </>
      )}
    </span>
  )
}

export { AgentProgress, formatElapsed, type AgentProgressProps }
