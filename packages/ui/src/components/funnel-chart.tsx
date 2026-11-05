"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"
import {
  ChartDataTable,
  ChartNumber,
  ChartTooltip,
  ChartTooltipRow,
  ChartTooltipTitle,
  chartColor,
  clamp,
  formatNumber,
  formatPercent,
  onFill,
  useActiveId,
  useChartSize,
  useChartTransition,
} from "@paneui/ui/components/chart-utils"

type FunnelStage = {
  id: string
  label: string
  value: number
  color?: string
  description?: string
}

type PlacedStage = FunnelStage & {
  index: number
  color: string
  /** Share of the first stage. */
  ofFirst: number
  /** Share of the previous stage (1 for the first). */
  ofPrevious: number
  dropOff: number
}

type FunnelChartProps = Omit<React.ComponentProps<"section">, "children"> & {
  stages: readonly FunnelStage[]
  direction?: "vertical" | "horizontal"
  label?: string
  unit?: string
  formatValue?: (value: number) => string
  /** Horizontal: plot height. Vertical: height of each stage row. */
  size?: number
  /** Gap between stages in px. */
  gap?: number
  /** One colour for every stage (deepening by depth) instead of the palette. */
  color?: string
  /** Smallest drawn thickness as a fraction of the largest, so tiny stages stay visible. */
  minRatio?: number
  activeId?: string | null
  defaultActiveId?: string | null
  onActiveChange?: (id: string | null) => void
}

function placeStages(stages: readonly FunnelStage[], color?: string): PlacedStage[] {
  const seen = new Set<string>()
  const valid = stages.filter((s) => {
    if (seen.has(s.id) || !Number.isFinite(s.value) || s.value < 0) return false
    seen.add(s.id)
    return true
  })
  const first = valid[0]?.value ?? 0
  return valid.map((s, i) => {
    const prev = i === 0 ? s.value : valid[i - 1].value
    return {
      ...s,
      index: i,
      color:
        s.color ??
        // Single hue fades toward the page background stage by stage, so it stays readable in both themes.
        (color ? `color-mix(in oklch, ${color} ${100 - i * (40 / Math.max(1, valid.length - 1))}%, var(--background))` : chartColor(i)),
      ofFirst: first ? s.value / first : 0,
      ofPrevious: prev ? s.value / prev : 0,
      dropOff: prev ? 1 - s.value / prev : 0,
    }
  })
}

/**
 * Stage outline along the main axis from `a` to `b`, with half-thickness
 * `h0` easing to `h1` on an S-curve, centred on `mid` of the cross axis.
 * Fixed command count so `d` morphs smoothly between data sets.
 */
function stagePath(
  a: number,
  b: number,
  h0: number,
  h1: number,
  mid: number,
  vertical: boolean,
  r: number
) {
  const k = (b - a) * 0.5
  const pt = (main: number, cross: number) => (vertical ? `${cross},${main}` : `${main},${cross}`)
  const rr = Math.min(r, h1, h0, (b - a) / 3)
  return [
    `M${pt(a, mid - h0)}`,
    `C${pt(a + k, mid - h0)} ${pt(b - k, mid - h1)} ${pt(b - rr, mid - h1)}`,
    `Q${pt(b, mid - h1)} ${pt(b, mid - h1 + rr)}`,
    `L${pt(b, mid + h1 - rr)}`,
    `Q${pt(b, mid + h1)} ${pt(b - rr, mid + h1)}`,
    `C${pt(b - k, mid + h1)} ${pt(a + k, mid + h0)} ${pt(a, mid + h0)}`,
    "Z",
  ].join(" ")
}

function FunnelChart({
  stages,
  direction = "vertical",
  label: labelProp,
  unit,
  formatValue = formatNumber,
  size,
  gap = 4,
  color,
  minRatio = 0.08,
  activeId: activeIdProp,
  defaultActiveId,
  onActiveChange,
  className,
  ...props
}: FunnelChartProps) {
  const { labels } = useLocale()
  const label = labelProp ?? labels.funnelChart
  const [ref, box] = useChartSize<HTMLDivElement>()
  const [activeId, setActiveId] = useActiveId(activeIdProp, defaultActiveId, onActiveChange)
  const [pointer, setPointer] = React.useState<{ x: number; y: number } | null>(null)
  const transition = useChartTransition()
  const placed = React.useMemo(() => placeStages(stages, color), [stages, color])
  const vertical = direction === "vertical"
  const n = placed.length
  const rowSize = size ?? (vertical ? 56 : 220)

  const width = box.width
  const height = vertical ? n * rowSize : rowSize
  const mainLen = vertical ? height : width
  const crossLen = vertical ? width : height
  const step = n ? mainLen / n : 0
  const max = Math.max(1, ...placed.map((s) => s.value))
  const half = (v: number) => (crossLen / 2) * Math.max(minRatio, v / max)

  const active = placed.find((s) => s.id === activeId) ?? null
  const fmtUnit = (v: number) => `${formatValue(v)}${unit ? ` ${unit}` : ""}`

  const anchor = (s: PlacedStage) => {
    const c = s.index * step + step / 2
    return vertical ? { x: width / 2 + half(s.value), y: c } : { x: c, y: height / 2 - half(s.value) }
  }
  const tip = pointer ?? (active ? anchor(active) : { x: 0, y: 0 })

  const focusStage = (i: number) => {
    const el = ref.current?.querySelector<SVGPathElement>(`[data-index="${clamp(i, 0, n - 1)}"]`)
    el?.focus()
  }

  return (
    <section
      data-slot="funnel-chart"
      data-direction={direction}
      className={cn("w-full min-w-0", className)}
      {...props}
      aria-label={props["aria-label"] ?? label}
    >
      <div
        className={cn(
          "grid gap-x-4",
          vertical ? "grid-cols-[minmax(0,8rem)_minmax(0,1fr)_auto]" : "grid-rows-[auto_auto]"
        )}
      >
        {/* vertical: stage labels column */}
        {vertical && (
          <ol aria-hidden className="grid" style={{ gridTemplateRows: `repeat(${n}, ${rowSize}px)` }}>
            {placed.map((s) => (
              <li
                key={s.id}
                className={cn(
                  "flex flex-col justify-center text-ui transition-opacity duration-200",
                  active && active.id !== s.id && "opacity-50"
                )}
              >
                <span className="truncate font-medium text-foreground">{s.label}</span>
                <span className="text-ui-sm text-muted-foreground tabular-nums">
                  {s.index === 0 ? labels.start : labels.ofPreviousPercent(formatPercent(s.ofPrevious, 0))}
                </span>
              </li>
            ))}
          </ol>
        )}

        <div
          ref={ref}
          className="relative min-w-0"
          style={{ height }}
          onPointerLeave={() => {
            setPointer(null)
            setActiveId(null)
          }}
        >
          {width > 0 && (
            <svg width={width} height={height} className="block overflow-visible" role="group" aria-label={label}>
              {/* centre guide */}
              <line
                x1={vertical ? width / 2 : 0}
                x2={vertical ? width / 2 : width}
                y1={vertical ? 0 : height / 2}
                y2={vertical ? height : height / 2}
                className="stroke-border"
                strokeDasharray="2 4"
              />
              {placed.map((s, i) => {
                const next = placed[i + 1]
                const a = i * step + (i === 0 ? 0 : gap / 2)
                const b = (i + 1) * step - (i === n - 1 ? 0 : gap / 2)
                const h0 = half(s.value)
                const h1 = next ? half(next.value) : h0
                const d = stagePath(a, b, h0, h1, crossLen / 2, vertical, 8)
                const dim = !!active && active.id !== s.id
                return (
                  <motion.path
                    key={s.id}
                    data-index={i}
                    tabIndex={0}
                    role="img"
                    aria-label={`${s.label}: ${fmtUnit(s.value)}, ${labels.percentOf(formatPercent(s.ofFirst), placed[0].label)}`}
                    initial={false}
                    animate={{ d, opacity: dim ? 0.4 : 1 }}
                    transition={transition}
                    style={{ fill: s.color }}
                    className="cursor-default outline-none focus-visible:[filter:drop-shadow(0_0_3px_var(--ring))]"
                    onPointerMove={(e) => {
                      const r = ref.current?.getBoundingClientRect()
                      if (r) setPointer({ x: e.clientX - r.left, y: e.clientY - r.top })
                      if (activeId !== s.id) setActiveId(s.id)
                    }}
                    onFocus={() => {
                      setPointer(null)
                      setActiveId(s.id)
                    }}
                    onBlur={() => setActiveId(null)}
                    onKeyDown={(e) => {
                      const fwd = vertical ? "ArrowDown" : "ArrowRight"
                      const back = vertical ? "ArrowUp" : "ArrowLeft"
                      if (e.key === fwd) {
                        e.preventDefault()
                        focusStage(i + 1)
                      } else if (e.key === back) {
                        e.preventDefault()
                        focusStage(i - 1)
                      }
                    }}
                  />
                )
              })}
              {/* share-of-first labels inside each stage */}
              {placed.map((s, i) => {
                const a = i * step + (i === 0 ? 0 : gap / 2)
                const b = (i + 1) * step - (i === n - 1 ? 0 : gap / 2)
                const c = (a + b) / 2
                const v = Math.round((s.ofFirst || 0) * 100)
                const big = half(s.value) > 14 && step > 48
                return (
                  <motion.text
                    key={`t-${s.id}`}
                    initial={false}
                    animate={{
                      x: vertical ? width / 2 : c,
                      y: vertical ? c : height / 2,
                      opacity: big ? (active && active.id !== s.id ? 0.4 : 1) : 0,
                    }}
                    transition={transition}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none fill-white text-ui-xs font-semibold tabular-nums"
                    style={{ fill: onFill(s.color) }}
                  >
                    {v}%
                  </motion.text>
                )
              })}
            </svg>
          )}

          <ChartTooltip open={!!active} x={tip.x} y={tip.y} bounds={{ width, height }} side={vertical ? "right" : "top"}>
            {active && (
              <>
                <ChartTooltipTitle>{active.label}</ChartTooltipTitle>
                <ChartTooltipRow
                  color={active.color}
                  label={unit ? labels.valueIn(unit) : labels.value}
                  value={<ChartNumber value={active.value} format={formatValue} />}
                />
                <ChartTooltipRow
                  label={placed[0] ? labels.ofNamed(placed[0].label) : labels.ofFirst}
                  value={<ChartNumber value={active.ofFirst} format={(v) => formatPercent(v)} />}
                />
                {active.index > 0 && (
                  <>
                    <ChartTooltipRow
                      label={labels.ofPrevious}
                      value={<ChartNumber value={active.ofPrevious} format={(v) => formatPercent(v)} />}
                    />
                    <ChartTooltipRow
                      label={labels.dropOff}
                      value={
                        <span className="text-destructive-text">
                          <ChartNumber
                            value={placed[active.index - 1].value - active.value}
                            format={(v) => `−${formatValue(v)}`}
                          />
                        </span>
                      }
                    />
                  </>
                )}
                {active.description && <p className="mt-1 text-muted-foreground">{active.description}</p>}
              </>
            )}
          </ChartTooltip>
        </div>

        {/* vertical: values column */}
        {vertical && (
          <ol aria-hidden className="grid" style={{ gridTemplateRows: `repeat(${n}, ${rowSize}px)` }}>
            {placed.map((s) => (
              <li
                key={s.id}
                className={cn(
                  "flex flex-col items-end justify-center transition-opacity duration-200",
                  active && active.id !== s.id && "opacity-50"
                )}
              >
                <ChartNumber value={s.value} format={formatValue} className="text-ui font-semibold text-foreground" />
                <span className="text-ui-sm text-muted-foreground tabular-nums">{formatPercent(s.ofFirst)}</span>
              </li>
            ))}
          </ol>
        )}

        {/* horizontal: label row */}
        {!vertical && (
          <ol aria-hidden className="mt-3 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {placed.map((s) => (
              <li
                key={s.id}
                className={cn(
                  "min-w-0 px-1 text-center transition-opacity duration-200",
                  active && active.id !== s.id && "opacity-50"
                )}
              >
                <div className="truncate text-ui-sm font-medium text-muted-foreground">{s.label}</div>
                <ChartNumber value={s.value} format={formatValue} className="text-ui font-semibold text-foreground" />
                {s.index > 0 && (
                  <div className="text-ui-xs text-muted-foreground tabular-nums">
                    {labels.stepRate(formatPercent(s.ofPrevious, 0))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      <ChartDataTable
        caption={labels.chartData(label)}
        columns={[labels.stage, unit ? labels.valueIn(unit) : labels.value, labels.ofFirst, labels.ofPrevious]}
        rows={placed.map((s) => [s.label, formatValue(s.value), formatPercent(s.ofFirst), formatPercent(s.ofPrevious)])}
      />
    </section>
  )
}

export { FunnelChart, type FunnelChartProps, type FunnelStage, type PlacedStage as FunnelPlacedStage }
