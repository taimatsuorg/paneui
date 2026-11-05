"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"
import {
  CHART_EASE,
  ChartDataTable,
  ChartNumber,
  ChartSwatch,
  chartColor,
  formatNumber,
  formatPercent,
  useActiveId,
  useChartTransition,
} from "@paneui/ui/components/chart-utils"

type DonutSegment = {
  id: string
  label: string
  value: number
  color?: string
  description?: string
}

type PlacedSegment = DonutSegment & {
  color: string
  share: number
  /** Arc start / length along the ring (viewBox units), already trimmed for caps and the pad gap. */
  start: number
  length: number
}

const VIEW = 200

type DonutChartProps = Omit<React.ComponentProps<"div">, "children"> & {
  segments: readonly DonutSegment[]
  label?: string
  /** Ring thickness in viewBox units (the ring is drawn in a 200×200 box). */
  thickness?: number
  /** Gap between segments in viewBox units. */
  gap?: number
  formatValue?: (value: number) => string
  /** Centre caption when nothing is hovered. */
  totalLabel?: string
  /** Max diameter of the ring in px; it shrinks with its container. */
  maxSize?: number
  showLegend?: boolean
  legendPosition?: "side" | "bottom"
  activeId?: string | null
  defaultActiveId?: string | null
  onActiveChange?: (id: string | null) => void
}

/** Extra stroke the hovered segment grows by (half of it lands past each edge). */
const ACTIVE_GROW = 6

function placeSegments(
  segments: readonly DonutSegment[],
  circumference: number,
  thickness: number,
  gap: number
): { placed: PlacedSegment[]; round: boolean } {
  const valid = segments.filter((s) => Number.isFinite(s.value) && s.value > 0)
  const total = valid.reduce((a, s) => a + s.value, 0)
  if (!total) return { placed: [], round: false }
  const spans = valid.map((s) => (s.value / total) * circumference)
  const single = valid.length === 1
  // A round cap reaches half the stroke width past each end of its dash (and
  // ACTIVE_GROW / 2 more on the hovered segment), so round-capped dashes are
  // trimmed by the stroke width plus a gap that is never smaller than that
  // extra reach. Round caps are only used when every segment is long enough to
  // absorb the trim; otherwise all segments use butt caps, whose ends stop
  // exactly at the pad, so neighbours can never overlap.
  const capTrim = thickness + Math.max(gap, ACTIVE_GROW / 2 + 1)
  const round = !single && spans.every((span) => span - capTrim >= thickness * 0.5)
  const trim = single ? 0 : round ? capTrim : gap
  let cursor = 0
  const placed = valid.map((s, i) => {
    const span = spans[i]
    const length = Math.max(0, span - trim)
    const seg: PlacedSegment = {
      ...s,
      color: s.color ?? chartColor(segments.indexOf(s)),
      share: s.value / total,
      // Centre whatever is left of a tiny segment inside its own span.
      start: cursor + (span - length) / 2,
      length,
    }
    cursor += span
    return seg
  })
  return { placed, round }
}

function DonutChart({
  segments,
  label: labelProp,
  thickness = 22,
  gap = 4,
  formatValue = formatNumber,
  totalLabel: totalLabelProp,
  maxSize = 240,
  showLegend = true,
  legendPosition = "side",
  activeId: activeIdProp,
  defaultActiveId,
  onActiveChange,
  className,
  ...props
}: DonutChartProps) {
  const { labels } = useLocale()
  const label = labelProp ?? labels.donutChart
  const totalLabel = totalLabelProp ?? labels.total
  const [activeId, setActiveId] = useActiveId(activeIdProp, defaultActiveId, onActiveChange)
  const reduce = useReducedMotion()
  const baseId = React.useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const transition = useChartTransition()
  const radius = (VIEW - thickness - 12) / 2
  const circumference = 2 * Math.PI * radius
  const { placed, round } = React.useMemo(
    () => placeSegments(segments, circumference, thickness, gap),
    [segments, circumference, thickness, gap]
  )
  const total = placed.reduce((a, s) => a + s.value, 0)
  const active = placed.find((s) => s.id === activeId) ?? null
  const hasDescriptions = placed.some((s) => s.description)

  const focusSegment = (index: number) => {
    const n = placed.length
    const i = ((index % n) + n) % n
    document.getElementById(`${baseId}-seg-${i}`)?.focus()
  }

  return (
    <div
      data-slot="donut-chart"
      className={cn(
        "grid w-full items-center gap-6",
        showLegend && legendPosition === "side" && "sm:grid-cols-[minmax(10rem,auto)_1fr]",
        className
      )}
      {...props}
    >
      <div
        className="@container relative mx-auto aspect-square w-full min-w-0"
        style={{ maxWidth: maxSize }}
        onPointerLeave={() => setActiveId(null)}
      >
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="block size-full -rotate-90 overflow-visible"
          role="group"
          aria-label={label}
        >
          {/* inset track */}
          <circle
            cx={VIEW / 2}
            cy={VIEW / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness + 6}
            className="stroke-muted"
          />
          <circle
            cx={VIEW / 2}
            cy={VIEW / 2}
            r={radius + thickness / 2 + 3}
            fill="none"
            strokeWidth={1}
            className="stroke-border"
          />
          {placed.map((s, i) => {
            const isActive = s.id === activeId
            const dim = !!active && !isActive
            return (
              <motion.circle
                key={s.id}
                id={`${baseId}-seg-${i}`}
                cx={VIEW / 2}
                cy={VIEW / 2}
                r={radius}
                fill="none"
                strokeWidth={thickness}
                strokeLinecap={round ? "round" : "butt"}
                tabIndex={0}
                role="img"
                aria-label={`${s.label}: ${formatValue(s.value)}, ${formatPercent(s.share)}${s.description ? `. ${s.description}` : ""}`}
                className="cursor-pointer outline-none focus-visible:[filter:drop-shadow(0_0_3px_var(--ring))]"
                style={{ stroke: s.color }}
                initial={
                  reduce
                    ? false
                    : {
                        strokeDasharray: `0 ${circumference}`,
                        strokeDashoffset: -s.start,
                        strokeWidth: thickness,
                        opacity: 0,
                      }
                }
                animate={{
                  // The gap part of the dash is a full circumference, so the dash never repeats.
                  strokeDasharray: `${s.length} ${circumference}`,
                  strokeDashoffset: -s.start,
                  strokeWidth: isActive ? thickness + ACTIVE_GROW : thickness,
                  opacity: dim ? 0.4 : 1,
                }}
                transition={{ ...transition, delay: reduce ? 0 : i * 0.04 }}
                onPointerEnter={() => setActiveId(s.id)}
                onFocus={() => setActiveId(s.id)}
                onBlur={() => setActiveId(null)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault()
                    focusSegment(i + 1)
                  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault()
                    focusSegment(i - 1)
                  } else if (e.key === "Escape") {
                    ;(e.currentTarget as SVGElement).blur()
                  }
                }}
              />
            )
          })}
        </svg>

        {/* linked centre readout */}
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
          aria-live="polite"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={active?.id ?? "__total"}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4, filter: "blur(2px)" }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: "blur(2px)" }}
              transition={{ duration: 0.18, ease: CHART_EASE }}
              className="flex max-w-[64%] items-center gap-1.5 truncate text-[min(0.8125rem,7.5cqw)] font-medium text-muted-foreground"
            >
              {active && <ChartSwatch color={active.color} />}
              {active?.label ?? totalLabel}
            </motion.span>
          </AnimatePresence>
          <ChartNumber
            value={active?.value ?? total}
            format={formatValue}
            className="mt-0.5 max-w-[72%] truncate text-[min(1.5rem,12cqw)] leading-tight font-semibold tracking-tight text-foreground"
          />
          <motion.span
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            className="max-w-[64%] truncate text-[min(0.8125rem,7cqw)] text-muted-foreground tabular-nums"
          >
            {active ? labels.percentOf(formatPercent(active.share), totalLabel) : "\u00a0"}
          </motion.span>
        </div>
      </div>

      {showLegend && (
        <ul
          aria-label={labels.legendFor(label)}
          className="flex w-full flex-col gap-1 frame-3xl frame-p-1.5 bg-background shadow-well dark:bg-input/32"
        >
          {placed.map((s) => {
            const isActive = s.id === activeId
            return (
              <li key={s.id}>
                <button
                  type="button"
                  data-active={isActive || undefined}
                  onPointerEnter={() => setActiveId(s.id)}
                  onPointerLeave={() => setActiveId(null)}
                  onFocus={() => setActiveId(s.id)}
                  onBlur={() => setActiveId(null)}
                  className={cn(
                    "relative flex w-full items-center gap-2.5 rounded-inner px-2.5 py-1.5 text-start text-ui outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active && !isActive && "opacity-55",
                    "transition-opacity duration-200"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId={`${baseId}-legend-hl`}
                      transition={transition}
                      className="absolute inset-0 -z-0 rounded-inner bg-card shadow-raised"
                    />
                  )}
                  <ChartSwatch color={s.color} className="relative" />
                  <span className="relative flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-foreground">{s.label}</span>
                    {s.description && (
                      <span className="truncate text-ui-sm text-muted-foreground">{s.description}</span>
                    )}
                  </span>
                  <span className="relative text-muted-foreground tabular-nums">
                    {formatValue(s.value)}
                  </span>
                  <span className="relative w-12 text-end font-medium text-foreground tabular-nums">
                    {formatPercent(s.share, 0)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <ChartDataTable
        caption={labels.chartData(label)}
        columns={[labels.segment, labels.value, labels.share, ...(hasDescriptions ? [labels.description] : [])]}
        rows={placed.map((s) => [
          s.label,
          formatValue(s.value),
          formatPercent(s.share),
          ...(hasDescriptions ? [s.description ?? ""] : []),
        ])}
      />
    </div>
  )
}

export { DonutChart, type DonutChartProps, type DonutSegment, type PlacedSegment as DonutPlacedSegment }
