"use client"

import * as React from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from "motion/react"

import { cn } from "@paneui/ui/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                   Colours                                  */
/* -------------------------------------------------------------------------- */

/**
 * Series palette: the theme's --chart-1..8, each with a semantic fallback for
 * themes that do not define them.
 */
const CHART_COLORS = [
  "var(--chart-1, var(--primary))",
  "var(--chart-2, var(--warning))",
  "var(--chart-3, var(--primary))",
  "var(--chart-4, var(--success))",
  "var(--chart-5, var(--destructive))",
  "var(--chart-6, var(--warning))",
  "var(--chart-7, var(--primary))",
  "var(--chart-8, var(--muted-foreground))",
] as const

/** Colour for series `index`; past eight it blends the base palette for more hues. */
function chartColor(index: number) {
  const base = CHART_COLORS.length
  const i = ((index % (base * 3)) + base * 3) % (base * 3)
  const c = CHART_COLORS[i % base]
  const round = Math.floor(i / base)
  if (round === 0) return c
  const next = CHART_COLORS[(i + 2) % base]
  return `color-mix(in oklch, ${c} ${round === 1 ? 62 : 38}%, ${next})`
}

/** Mix a colour toward transparent: handy for fills and value-area tints. */
function chartAlpha(color: string, percent: number) {
  return `color-mix(in oklch, ${color} ${percent}%, transparent)`
}

/**
 * Readable label colour on a chart fill: white on dark fills, near-black on light ones
 * (the light theme's foreground). CSS relative colour; pair it with a `fill-white`
 * class so browsers without relative colour keep white labels.
 */
function onFill(fill: string) {
  return `oklch(from ${fill} clamp(0.2435, calc((0.72 - l) * 100000), 1) 0 0)`
}

/* -------------------------------------------------------------------------- */
/*                                   Easing                                   */
/* -------------------------------------------------------------------------- */

const CHART_EASE = [0.22, 1, 0.36, 1] as const
const CHART_SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } as const

/** Transition helper: springy normally, instant when the user prefers reduced motion. */
function useChartTransition(delay = 0) {
  const reduce = useReducedMotion()
  return React.useMemo(
    () => (reduce ? { duration: 0 } : { ...CHART_SPRING, delay }),
    [reduce, delay]
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Size                                    */
/* -------------------------------------------------------------------------- */

type ChartSize = { width: number; height: number }

/** Observe an element's content box with ResizeObserver. */
function useChartSize<T extends HTMLElement = HTMLDivElement>(
  initial: ChartSize = { width: 0, height: 0 }
) {
  const ref = React.useRef<T>(null)
  const [size, setSize] = React.useState<ChartSize>(initial)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = (w: number, h: number) =>
      setSize((s) =>
        Math.abs(s.width - w) < 0.5 && Math.abs(s.height - h) < 0.5
          ? s
          : { width: w, height: h }
      )
    const rect = el.getBoundingClientRect()
    measure(rect.width, rect.height)
    if (typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(([entry]) => {
      const box = entry.contentRect
      measure(box.width, box.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

/* -------------------------------------------------------------------------- */
/*                                   Scales                                   */
/* -------------------------------------------------------------------------- */

type LinearScale = ((value: number) => number) & {
  domain: readonly [number, number]
  range: readonly [number, number]
  invert: (pixel: number) => number
  ticks: (count?: number) => number[]
}

function niceStep(span: number, count: number) {
  const raw = span / Math.max(1, count)
  const pow = Math.pow(10, Math.floor(Math.log10(raw || 1)))
  const n = raw / pow
  const nice = n >= 7.5 ? 10 : n >= 3.5 ? 5 : n >= 1.5 ? 2 : 1
  return nice * pow
}

/** Round a domain outward to tidy tick boundaries. */
function niceDomain([lo, hi]: readonly [number, number], count = 5): [number, number] {
  if (lo === hi) return [lo - 1, hi + 1]
  const step = niceStep(hi - lo, count)
  return [Math.floor(lo / step) * step, Math.ceil(hi / step) * step]
}

function scaleLinear(
  domain: readonly [number, number],
  range: readonly [number, number]
): LinearScale {
  const [d0, d1] = domain
  const [r0, r1] = range
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0)
  const scale = ((v: number) => r0 + (v - d0) * k) as LinearScale
  scale.domain = domain
  scale.range = range
  scale.invert = (p: number) => (k === 0 ? d0 : d0 + (p - r0) / k)
  scale.ticks = (count = 5) => {
    const lo = Math.min(d0, d1)
    const hi = Math.max(d0, d1)
    if (lo === hi) return [lo]
    const step = niceStep(hi - lo, count)
    const out: number[] = []
    const start = Math.ceil(lo / step) * step
    for (let t = start; t <= hi + step * 1e-6; t += step) out.push(Number(t.toFixed(10)))
    return out
  }
  return scale
}

type BandScale = ((index: number) => number) & {
  bandwidth: number
  step: number
  /** Band index under a pixel, clamped to the domain. */
  indexAt: (pixel: number) => number
}

/** Evenly spaced bands across a range with `padding` (0..1) of each step left empty. */
function scaleBand(count: number, range: readonly [number, number], padding = 0.2): BandScale {
  const [r0, r1] = range
  const n = Math.max(1, count)
  const step = (r1 - r0) / n
  const bandwidth = step * (1 - padding)
  const scale = ((i: number) => r0 + i * step + (step - bandwidth) / 2) as BandScale
  scale.bandwidth = bandwidth
  scale.step = step
  scale.indexAt = (p: number) => Math.min(n - 1, Math.max(0, Math.floor((p - r0) / (step || 1))))
  return scale
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/* -------------------------------------------------------------------------- */
/*                                Seeded data                                 */
/* -------------------------------------------------------------------------- */

/** mulberry32: tiny deterministic PRNG so demos render the same on server and client. */
function seededRandom(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* -------------------------------------------------------------------------- */
/*                                 Formatting                                 */
/* -------------------------------------------------------------------------- */

const compactFmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
const plainFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })

function formatCompact(value: number) {
  return compactFmt.format(value)
}
function formatNumber(value: number) {
  return plainFmt.format(value)
}
function formatPercent(share: number, digits = 1) {
  return `${(share * 100).toFixed(digits)}%`
}

/* -------------------------------------------------------------------------- */
/*                               Animated number                              */
/* -------------------------------------------------------------------------- */

type ChartNumberProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
  value: number
  format?: (value: number) => string
}

/** Springs between values (not from zero) and renders through any formatter. */
function ChartNumber({ value, format = formatNumber, className, ...props }: ChartNumberProps) {
  const reduce = useReducedMotion()
  const target = useMotionValue(value)
  const spring = useSpring(target, { stiffness: 220, damping: 28, restDelta: 0.001 })
  const [text, setText] = React.useState(() => format(value))
  const formatRef = React.useRef(format)
  formatRef.current = format

  React.useEffect(() => {
    if (reduce) spring.jump(value)
    target.set(value)
  }, [value, reduce, spring, target])

  useMotionValueEvent(spring, "change", (v) => setText(formatRef.current(v)))
  React.useEffect(() => setText(format(spring.get())), [format, spring])

  return (
    <span data-slot="chart-number" className={cn("tabular-nums", className)} {...props}>
      <span className="sr-only">{format(value)}</span>
      <span aria-hidden>{text}</span>
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Tooltip                                  */
/* -------------------------------------------------------------------------- */

type ChartTooltipProps = Omit<React.ComponentProps<typeof motion.div>, "children"> & {
  /** Anchor point in px, relative to the nearest positioned chart container. */
  x: number
  y: number
  open: boolean
  /** Size of the container, used to keep the tooltip inside it. */
  bounds: ChartSize
  /** Preferred side; flips when there is not enough room. */
  side?: "top" | "bottom" | "left" | "right"
  offset?: number
  /** Flip to the opposite side when the preferred side would leave the bounds. */
  avoidCollisions?: boolean
  children?: React.ReactNode
}

/**
 * In-chart floating surface with the same look as TooltipContent / Popover:
 * bg-popover, shadow-surface, soft top highlight. It follows a data point
 * rather than a DOM trigger, so it lives inside the chart (no portal).
 */
function ChartTooltip({
  x,
  y,
  open,
  bounds,
  side = "top",
  offset = 12,
  avoidCollisions = true,
  className,
  children,
  style,
  ...props
}: ChartTooltipProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [box, setBox] = React.useState({ w: 0, h: 0 })

  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el || !open) return
    const r = el.getBoundingClientRect()
    if (Math.abs(r.width - box.w) > 0.5 || Math.abs(r.height - box.h) > 0.5)
      setBox({ w: r.width, h: r.height })
  })

  let left: number
  let top: number
  let s = side
  if (!avoidCollisions) {
    // keep the preferred side
  } else if (s === "top" && y - offset - box.h < 0) s = "bottom"
  else if (s === "bottom" && y + offset + box.h > bounds.height) s = "top"
  else if (s === "right" && x + offset + box.w > bounds.width) s = "left"
  else if (s === "left" && x - offset - box.w < 0) s = "right"

  if (s === "top" || s === "bottom") {
    left = clamp(x - box.w / 2, 0, Math.max(0, bounds.width - box.w))
    top = s === "top" ? y - offset - box.h : y + offset
  } else {
    top = clamp(y - box.h / 2, 0, Math.max(0, bounds.height - box.h))
    left = s === "left" ? x - offset - box.w : x + offset
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="status"
          aria-live="polite"
          data-slot="chart-tooltip"
          data-side={s}
          initial={{ opacity: 0, scale: 0.94, left, top }}
          animate={{ opacity: box.w ? 1 : 0, scale: 1, left, top }}
          exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.12 } }}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  left: { type: "spring", stiffness: 520, damping: 42 },
                  top: { type: "spring", stiffness: 520, damping: 42 },
                  default: { duration: 0.16, ease: CHART_EASE },
                }
          }
          style={{ position: "absolute", ...style }}
          className={cn(
            "pointer-events-none z-20 min-w-32 max-w-64 origin-center rounded-2xl bg-popover px-3 py-2.5 text-ui-sm text-popover-foreground shadow-surface",
            className
          )}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ChartTooltipTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chart-tooltip-title"
      className={cn("mb-1.5 font-medium text-popover-foreground", className)}
      {...props}
    />
  )
}

function ChartTooltipRow({
  color,
  label,
  value,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  color?: string
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div
      data-slot="chart-tooltip-row"
      className={cn("flex items-center gap-2 py-0.5 text-muted-foreground", className)}
      {...props}
    >
      {color && <ChartSwatch color={color} />}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="font-medium text-popover-foreground tabular-nums">{value}</span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Legend                                   */
/* -------------------------------------------------------------------------- */

function ChartSwatch({
  color,
  className,
  style,
  ...props
}: React.ComponentProps<"span"> & { color: string }) {
  return (
    <span
      aria-hidden
      data-slot="chart-swatch"
      className={cn("size-2.5 shrink-0 rounded-full shadow-chip", className)}
      style={{ background: color, ...style }}
      {...props}
    />
  )
}

function ChartLegend({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chart-legend"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  )
}

type ChartLegendItemProps = Omit<React.ComponentProps<"button">, "color"> & {
  color: string
  /** Shown dimmed with a hollow swatch (series toggled off). */
  inactive?: boolean
  /** Emphasised because the matching mark is hovered. */
  highlighted?: boolean
  /** Optional trailing value (share, count...). */
  value?: React.ReactNode
}

/** Raised pill legend entry; a real button so it is keyboard reachable. */
function ChartLegendItem({
  color,
  inactive,
  highlighted,
  value,
  className,
  children,
  ...props
}: ChartLegendItemProps) {
  return (
    <button
      type="button"
      data-slot="chart-legend-item"
      data-inactive={inactive || undefined}
      data-highlighted={highlighted || undefined}
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-control bg-card px-2.5 text-ui-sm font-medium text-secondary-foreground shadow-raised outline-none transition-[box-shadow,background-color,opacity,scale] duration-150 ease-out select-none hover:bg-accent hover:shadow-raised-hover focus-visible:ring-2 focus-visible:ring-ring data-highlighted:shadow-raised-hover data-inactive:text-muted-foreground data-inactive:opacity-60",
        className
      )}
      {...props}
    >
      <ChartSwatch
        color={color}
        className={cn("transition-[background,box-shadow] duration-200", inactive && "bg-transparent!")}
        style={inactive ? { boxShadow: `inset 0 0 0 1.5px ${color}` } : undefined}
      />
      <span className="truncate">{children}</span>
      {value !== undefined && (
        <span className="text-muted-foreground tabular-nums">{value}</span>
      )}
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Surfaces                                  */
/* -------------------------------------------------------------------------- */

/** Accessible data table mirror for screen readers. */
function ChartDataTable({
  caption,
  columns,
  rows,
}: {
  caption: string
  columns: readonly string[]
  rows: readonly (readonly React.ReactNode[])[]
}) {
  return (
    <div className="sr-only">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={j}>{cell}</td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Stable-ish id for SVG defs (clip paths, gradients). */
function useChartId(prefix: string) {
  return `${prefix}-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
}

/** Read whether the device can hover (pointer: fine), for tap-vs-hover tooltips. */
function useHoverCapable() {
  const [can, setCan] = React.useState(true)
  React.useEffect(() => {
    const mq = window.matchMedia("(hover: hover)")
    setCan(mq.matches)
    const on = () => setCan(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return can
}

/** Controlled/uncontrolled active id shared by the charts. */
function useActiveId<T = string>(
  controlled: T | null | undefined,
  defaultValue: T | null | undefined,
  onChange?: (id: T | null) => void
) {
  const [inner, setInner] = React.useState<T | null>(defaultValue ?? null)
  const isControlled = controlled !== undefined
  const value = isControlled ? (controlled as T | null) : inner
  const set = React.useCallback(
    (id: T | null) => {
      if (!isControlled) setInner(id)
      onChange?.(id)
    },
    [isControlled, onChange]
  )
  return [value, set] as const
}

export {
  CHART_COLORS,
  CHART_EASE,
  CHART_SPRING,
  chartColor,
  chartAlpha,
  onFill,
  useChartTransition,
  useChartSize,
  scaleLinear,
  scaleBand,
  niceDomain,
  clamp,
  seededRandom,
  formatCompact,
  formatNumber,
  formatPercent,
  ChartNumber,
  ChartTooltip,
  ChartTooltipTitle,
  ChartTooltipRow,
  ChartSwatch,
  ChartLegend,
  ChartLegendItem,
  ChartDataTable,
  useChartId,
  useHoverCapable,
  useActiveId,
  type ChartSize,
  type LinearScale,
  type BandScale,
  type ChartNumberProps,
  type ChartTooltipProps,
  type ChartLegendItemProps,
}
