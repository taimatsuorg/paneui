"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"

/*
 * A word-sized trend chart: no axes, no labels, just the shape of a series.
 * Colour comes from `currentColor`, so tint it with a text token
 * (`text-success-text`, `text-chart-1`, `text-muted-foreground`). The SVG stretches
 * to its box: size it with `h-*` / `w-*` (default 36px tall, full width).
 *
 * Missing points (`null`, `undefined`, `NaN`) are gaps, drawn per `gap`. A series with
 * no points draws a quiet dashed baseline instead of an empty box.
 */

type SparklineValue = number | null | undefined

type SparklineGap = "bridge" | "break" | "zero"

type SparklineProps = Omit<React.ComponentProps<"svg">, "values" | "children"> & {
  /** The series, oldest first. `null` / `undefined` / `NaN` mark a missing point. */
  values: readonly SparklineValue[]
  /** `area` adds a soft wash under the line; `bar` draws one column per value. */
  variant?: "line" | "area" | "bar"
  /**
   * Missing points. `bridge` (default) joins the points either side with a faint dashed line
   * (bars: a faint stub), `break` leaves the space empty, `zero` plots them as 0.
   */
  gap?: SparklineGap
  /** Accessible summary, e.g. "Revenue, up 12% over 30 days". Without it the chart is decorative. */
  label?: string
  /** Draw the chart in on mount. Default true (always off under reduced motion). */
  animate?: boolean
  /** Mark the first minimum and maximum in a line or area series. */
  extrema?: boolean
}

const W = 120
const H = 36
const PAD = 3
/** The faint parts (bridges, gap stubs, the empty baseline). */
const QUIET = 0.35
const EASE = [0.22, 1, 0.36, 1] as const

const isPoint = (v: SparklineValue): v is number => typeof v === "number" && Number.isFinite(v)

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
}

const path = (pts: readonly (readonly [number, number])[]) =>
  pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(2)} ${py.toFixed(2)}`).join(" ")

function Sparkline({
  values,
  variant = "area",
  gap = "bridge",
  label,
  animate = true,
  extrema = false,
  className,
  ...props
}: SparklineProps) {
  const id = React.useId().replace(/:/g, "")
  const reduce = useReducedMotion()
  const play = animate && !reduce

  const list = gap === "zero" ? values.map((v) => (isPoint(v) ? v : 0)) : values
  const known = list.filter(isPoint)
  const a11y = label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true as const }
  const svgProps = {
    "data-slot": "sparkline",
    "data-variant": variant,
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none",
    ...a11y,
    ...props,
  }

  // Nothing to plot, or one point with no trend: a flat dashed baseline (plus the lone point).
  if (known.length < 2) {
    const at = list.findIndex(isPoint)
    const px = list.length > 1 ? (at / (list.length - 1)) * W : W / 2
    return (
      <svg {...svgProps} data-empty={known.length === 0 || undefined} className={cn("block h-9 w-full overflow-visible", className)}>
        <path d={`M0 ${H / 2} L${W} ${H / 2}`} {...stroke} strokeDasharray="2 4" opacity={QUIET} />
        {at >= 0 && <path d={`M${px.toFixed(2)} ${H / 2} L${px.toFixed(2)} ${H / 2}`} {...stroke} strokeWidth={3} />}
      </svg>
    )
  }

  if (variant === "bar") {
    const space = 2
    const bw = (W - space * (list.length - 1)) / list.length
    const floor = Math.min(0, ...known)
    const top = Math.max(...known, 0)
    const range = top - floor || 1
    return (
      <svg {...svgProps} className={cn("block h-9 w-full", className)}>
        {list.map((v, i) => {
          const missing = !isPoint(v)
          if (missing && gap === "break") return null
          const h = missing ? 1 : Math.max(1.5, ((v - floor) / range) * (H - 1))
          return (
            <motion.rect
              key={i}
              data-gap={missing || undefined}
              x={i * (bw + space)}
              width={Math.max(bw, 1)}
              y={H - h}
              height={h}
              rx={Math.min(1.5, bw / 2)}
              fill="currentColor"
              opacity={missing ? QUIET * 0.6 : i === list.length - 1 ? 1 : 0.45}
              initial={play ? { scaleY: 0 } : false}
              animate={{ scaleY: 1 }}
              style={{ transformOrigin: `0 ${H}px`, transformBox: "view-box" }}
              transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.6, delay: play ? i * 0.015 : 0 }}
            />
          )
        })}
      </svg>
    )
  }

  const min = Math.min(...known)
  const max = Math.max(...known)
  const span = max - min || 1
  const x = (i: number) => (i / (list.length - 1)) * W
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2 - 2)

  // Runs of consecutive known points, and the bridges between them.
  const runs: [number, number][][] = []
  let run: [number, number][] = []
  list.forEach((v, i) => {
    if (isPoint(v)) run.push([x(i), y(v)])
    else if (run.length) {
      runs.push(run)
      run = []
    }
  })
  if (run.length) runs.push(run)
  const bridges = gap === "bridge" ? runs.slice(1).map((r, i) => [runs[i][runs[i].length - 1], r[0]] as const) : []

  return (
    <svg {...svgProps} className={cn("block h-9 w-full overflow-visible", className)}>
      <defs>
        {variant === "area" && (
          <linearGradient id={`spark-${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.2} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        )}
        {/* Draw-in: a clip that sweeps left to right. Animating the stroke's length instead breaks
            the line into dashes, because the stroke doesn't scale with the stretched box. */}
        {/* Always rendered, so server and client markup match whatever the motion setting. */}
        <clipPath id={`spark-clip-${id}`}>
          <motion.rect
            x={-PAD}
            y={-PAD}
            width={W + PAD * 2}
            height={H + PAD * 2}
            initial={play ? { scaleX: 0 } : false}
            animate={{ scaleX: 1 }}
            style={{ transformOrigin: "0 0", transformBox: "view-box" }}
            transition={play ? { duration: 0.8, ease: EASE } : { duration: 0 }}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#spark-clip-${id})`}>
        {variant === "area" &&
          runs
            .filter((r) => r.length > 1)
            .map((r, i) => (
              <path key={`a${i}`} d={`${path(r)} L${r[r.length - 1][0].toFixed(2)} ${H} L${r[0][0].toFixed(2)} ${H} Z`} fill={`url(#spark-${id})`} />
            ))}
        {bridges.map((b, i) => (
          <path key={`b${i}`} data-slot="sparkline-bridge" d={path(b)} {...stroke} strokeDasharray="2 3" opacity={QUIET} />
        ))}
        {runs.map((r, i) => (
          // A lone point between gaps is a zero-length path: its round cap draws a dot.
          <path key={`l${i}`} d={r.length > 1 ? path(r) : path([r[0], r[0]])} {...stroke} strokeWidth={r.length > 1 ? 1.5 : 2.5} />
        ))}
        {extrema && [...new Set([min, max])].map((v) => (
          <path key={v} data-slot="sparkline-extremum" d={path([[x(list.indexOf(v)), y(v)], [x(list.indexOf(v)), y(v)]])} {...stroke} strokeWidth={5} />
        ))}
      </g>
    </svg>
  )
}

export { Sparkline }
export type { SparklineProps, SparklineValue, SparklineGap }
