"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"
import {
  CHART_EASE,
  ChartDataTable,
  ChartLegend,
  ChartLegendItem,
  ChartNumber,
  ChartTooltip,
  ChartTooltipRow,
  ChartTooltipTitle,
  chartAlpha,
  chartColor,
  clamp,
  formatNumber,
  formatPercent,
  scaleBand,
  useChartId,
  useChartSize,
  useChartTransition,
} from "@paneui/ui/components/chart-utils"

type CompositionSeries = { id: string; label: string; color?: string }

type CompositionPeriod = {
  label: string
  /** Raw values keyed by series id. Missing or non-finite values count as 0. */
  values: Record<string, number>
}

type CompositionChartProps = Omit<React.ComponentProps<"section">, "children" | "hidden"> & {
  series: readonly CompositionSeries[]
  data: readonly CompositionPeriod[]
  mode?: "bar" | "area"
  label?: string
  height?: number
  formatValue?: (value: number) => string
  showLegend?: boolean
  /** Series hidden initially (uncontrolled). */
  defaultHidden?: readonly string[]
  /** Hidden series ids (controlled). Pair with `onHiddenChange`. */
  hidden?: readonly string[]
  onHiddenChange?: (hidden: string[]) => void
}

type Stack = {
  total: number
  /** Per visible series: [start, end] share, 0..1. */
  spans: Record<string, [number, number]>
}

function stackPeriod(p: CompositionPeriod, visible: readonly CompositionSeries[]): Stack {
  const v = (id: string) => {
    const x = p.values[id]
    return Number.isFinite(x) && x > 0 ? x : 0
  }
  const total = visible.reduce((a, s) => a + v(s.id), 0)
  const spans: Stack["spans"] = {}
  let acc = 0
  for (const s of visible) {
    const share = total ? v(s.id) / total : 0
    spans[s.id] = [acc, acc + share]
    acc += share
  }
  return { total, spans }
}

/** Smooth path through points with horizontal tangents; fixed command count so motion can morph it. */
function smoothLine(points: readonly [number, number][], move = true) {
  if (!points.length) return ""
  let d = `${move ? "M" : "L"}${points[0][0]},${points[0][1]}`
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    const mx = (x0 + x1) / 2
    d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`
  }
  return d
}

function CompositionChart({
  series,
  data,
  mode = "bar",
  label: labelProp,
  height = 260,
  formatValue = formatNumber,
  showLegend = true,
  defaultHidden,
  hidden: hiddenProp,
  onHiddenChange,
  className,
  ...props
}: CompositionChartProps) {
  const { labels } = useLocale()
  const label = labelProp ?? labels.compositionChart
  const [ref, size] = useChartSize<HTMLDivElement>()
  const reduce = useReducedMotion()
  const transition = useChartTransition()
  const clipId = useChartId("composition-clip")
  const [innerHidden, setInnerHidden] = React.useState<string[]>(() => [...(defaultHidden ?? [])])
  const controlled = hiddenProp !== undefined
  const hidden = controlled ? [...hiddenProp] : innerHidden
  const [hoverSeries, setHoverSeries] = React.useState<string | null>(null)
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null)

  const colored = series.map((s, i) => ({ ...s, color: s.color ?? chartColor(i) }))
  const visible = colored.filter((s) => !hidden.includes(s.id))
  const stacks = React.useMemo(
    () => data.map((p) => stackPeriod(p, visible)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, visible.map((s) => s.id).join("|")]
  )

  const toggle = (id: string) => {
    const isHidden = hidden.includes(id)
    // Never hide the last visible series.
    if (!isHidden && visible.length <= 1) return
    const next = isHidden ? hidden.filter((h) => h !== id) : [...hidden, id]
    if (!controlled) setInnerHidden(next)
    onHiddenChange?.(next)
  }

  const axisW = 36
  const xAxisH = 22
  const width = size.width
  const plotW = Math.max(0, width - axisW)
  const plotH = height - xAxisH
  const n = data.length
  const band = scaleBand(n, [axisW, axisW + plotW], mode === "bar" ? clamp(0.6 - n * 0.02, 0.2, 0.5) : 0)
  const bw = band.bandwidth
  const y = (share: number) => plotH - share * plotH
  const labelEvery = Math.max(1, Math.ceil((n * 46) / Math.max(1, plotW)))

  const active = hoverIndex !== null ? data[hoverIndex] : null
  const activeStack = hoverIndex !== null ? stacks[hoverIndex] : null

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!n) return
    const cur = hoverIndex ?? n - 1
    let next = cur
    if (e.key === "ArrowLeft") next = cur - 1
    else if (e.key === "ArrowRight") next = cur + 1
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = n - 1
    else if (e.key === "Escape") return setHoverIndex(null)
    else return
    e.preventDefault()
    setHoverIndex(clamp(next, 0, n - 1))
  }

  const seriesOpacity = (id: string) => (hoverSeries && hoverSeries !== id ? 0.3 : 1)

  // Area points sit at band centres, padded to the plot edges.
  const xs = data.map((_, i) => {
    if (n === 1) return axisW + plotW / 2
    return axisW + (i / (n - 1)) * plotW
  })
  const guideX = hoverIndex === null ? 0 : mode === "bar" ? band(hoverIndex) + bw / 2 : xs[hoverIndex]

  return (
    <section
      data-slot="composition-chart"
      className={cn("w-full min-w-0 space-y-4", className)}
      {...props}
      aria-label={props["aria-label"] ?? label}
    >
      <div
        ref={ref}
        tabIndex={0}
        role="img"
        aria-label={labels.statusHistoryHint(label)}
        onKeyDown={onKeyDown}
        onBlur={() => setHoverIndex(null)}
        onPointerLeave={() => setHoverIndex(null)}
        onPointerMove={(e) => {
          const box = ref.current?.getBoundingClientRect()
          if (!box || !n) return
          const px = e.clientX - box.left
          const i =
            mode === "bar"
              ? band.indexAt(px)
              : clamp(Math.round(((px - axisW) / Math.max(1, plotW)) * (n - 1)), 0, n - 1)
          if (i !== hoverIndex) setHoverIndex(i)
        }}
        className="relative w-full touch-pan-y rounded-xl outline-none select-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ height }}
      >
        {width > 0 && (
          <svg width={width} height={height} className="block overflow-visible" aria-hidden>
            <defs>
              <clipPath id={clipId}>
                <rect x={axisW} y={0} width={plotW} height={plotH} rx={12} />
              </clipPath>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <g key={t}>
                <line
                  x1={axisW}
                  x2={axisW + plotW}
                  y1={y(t)}
                  y2={y(t)}
                  className="stroke-border"
                  strokeDasharray={t === 0 || t === 1 ? undefined : "2 4"}
                />
                {(t === 0 || t === 0.5 || t === 1) && (
                  <text
                    x={axisW - 8}
                    y={y(t)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-ui-2xs tabular-nums"
                  >
                    {t * 100}%
                  </text>
                )}
              </g>
            ))}

            <AnimatePresence initial={false} mode="popLayout">
              {mode === "bar" ? (
                <motion.g
                  key="bar"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: CHART_EASE }}
                >
                  {data.map((p, i) => {
                    const st = stacks[i]
                    if (!st.total) return null
                    const x = band(i)
                    const r = Math.min(6, bw / 2)
                    const dimPeriod = hoverIndex !== null && hoverIndex !== i
                    return (
                      <g key={p.label} opacity={dimPeriod ? 0.6 : 1} style={{ transition: "opacity 200ms" }}>
                        <clipPath id={`${clipId}-b${i}`}>
                          <rect x={x} y={0} width={bw} height={plotH} rx={r} />
                        </clipPath>
                        <g clipPath={`url(#${clipId}-b${i})`}>
                          {visible.map((s) => {
                            const [a, b] = st.spans[s.id]
                            const top = y(b)
                            const h = Math.max(0, y(a) - y(b) - (b < 0.999 ? 1.5 : 0))
                            return (
                              <motion.rect
                                key={s.id}
                                x={x}
                                width={bw}
                                initial={reduce ? false : { y: plotH, height: 0 }}
                                animate={{ y: top, height: h, opacity: seriesOpacity(s.id) }}
                                transition={{ ...transition, delay: reduce ? 0 : i * 0.015 }}
                                style={{ fill: s.color }}
                              />
                            )
                          })}
                        </g>
                      </g>
                    )
                  })}
                </motion.g>
              ) : (
                <motion.g
                  key="area"
                  clipPath={`url(#${clipId})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: CHART_EASE }}
                >
                  {visible.map((s) => {
                    const topPts = xs.map((x, i) => [x, y(stacks[i].spans[s.id][1])] as [number, number])
                    const botPts = xs
                      .map((x, i) => [x, y(stacks[i].spans[s.id][0])] as [number, number])
                      .reverse()
                    const d = `${smoothLine(topPts)} ${smoothLine(botPts, false)} Z`
                    return (
                      <g key={s.id}>
                        <motion.path
                          initial={false}
                          animate={{ d, opacity: seriesOpacity(s.id) }}
                          transition={transition}
                          style={{ fill: chartAlpha(s.color, 88) }}
                        />
                        <motion.path
                          initial={false}
                          animate={{ d: smoothLine(topPts), opacity: seriesOpacity(s.id) }}
                          transition={transition}
                          fill="none"
                          strokeWidth={1.5}
                          className="stroke-card"
                        />
                      </g>
                    )
                  })}
                </motion.g>
              )}
            </AnimatePresence>

            {hoverIndex !== null && mode === "area" && (
              <line
                x1={guideX}
                x2={guideX}
                y1={0}
                y2={plotH}
                className="pointer-events-none stroke-foreground/50"
                strokeDasharray="3 3"
              />
            )}

            {data.map((p, i) =>
              i % labelEvery === 0 || i === n - 1 ? (
                <text
                  key={p.label}
                  x={mode === "bar" ? band(i) + bw / 2 : xs[i]}
                  y={plotH + 15}
                  textAnchor={mode === "area" && i === 0 ? "start" : mode === "area" && i === n - 1 ? "end" : "middle"}
                  className={cn(
                    "text-ui-2xs tabular-nums transition-colors",
                    hoverIndex === i ? "fill-foreground" : "fill-muted-foreground"
                  )}
                >
                  {p.label}
                </text>
              ) : null
            )}
          </svg>
        )}

        <ChartTooltip
          open={!!active}
          side="right"
          x={guideX}
          y={plotH / 2}
          offset={mode === "bar" ? bw / 2 + 10 : 12}
          bounds={{ width, height }}
        >
          {active && activeStack && (
            <>
              <ChartTooltipTitle className="flex items-center justify-between gap-3">
                {active.label}
                <span className="font-normal text-muted-foreground tabular-nums">
                  {formatValue(activeStack.total)}
                </span>
              </ChartTooltipTitle>
              {activeStack.total === 0 ? (
                <p className="text-muted-foreground">{labels.noDataForPeriod}</p>
              ) : (
                [...visible].reverse().map((s) => {
                  const [a, b] = activeStack.spans[s.id]
                  return (
                    <ChartTooltipRow
                      key={s.id}
                      color={s.color}
                      label={s.label}
                      className={cn(hoverSeries && hoverSeries !== s.id && "opacity-50")}
                      value={
                        <span className="flex gap-2">
                          <span className="font-normal text-muted-foreground">
                            {formatValue(active.values[s.id] ?? 0)}
                          </span>
                          <ChartNumber
                            value={b - a}
                            format={(v) => formatPercent(v, 0)}
                            className="w-9 text-end"
                          />
                        </span>
                      }
                    />
                  )
                })
              )}
            </>
          )}
        </ChartTooltip>
      </div>

      {showLegend && (
        <ChartLegend aria-label={labels.chartSeries(label)}>
          {colored.map((s) => {
            const off = hidden.includes(s.id)
            return (
              <ChartLegendItem
                key={s.id}
                color={s.color}
                inactive={off}
                highlighted={hoverSeries === s.id}
                aria-pressed={!off}
                onClick={() => toggle(s.id)}
                onPointerEnter={() => !off && setHoverSeries(s.id)}
                onPointerLeave={() => setHoverSeries(null)}
                onFocus={() => !off && setHoverSeries(s.id)}
                onBlur={() => setHoverSeries(null)}
              >
                {s.label}
              </ChartLegendItem>
            )
          })}
        </ChartLegend>
      )}

      <ChartDataTable
        caption={labels.chartDataShare(label)}
        columns={[labels.period, ...visible.map((s) => s.label)]}
        rows={data.map((p, i) => [
          p.label,
          ...visible.map((s) => {
            const [a, b] = stacks[i].spans[s.id]
            return stacks[i].total ? `${formatPercent(b - a)} (${formatValue(p.values[s.id] ?? 0)})` : "—"
          }),
        ])}
      />
    </section>
  )
}

export {
  CompositionChart,
  type CompositionChartProps,
  type CompositionSeries as CompositionChartSeries,
  type CompositionPeriod as CompositionChartPeriod,
}
