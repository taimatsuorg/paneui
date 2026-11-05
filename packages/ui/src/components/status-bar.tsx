"use client"

import * as React from "react"
import { useLocale, localeLabels, type LocaleLabels } from "@paneui/ui/components/locale-provider"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"
import {
  ChartDataTable,
  ChartSwatch,
  ChartTooltip,
  ChartTooltipTitle,
  clamp,
  scaleBand,
  useActiveId,
  useChartSize,
  useChartTransition,
} from "@paneui/ui/components/chart-utils"

type StatusBarStatus = {
  label: string
  color: string
  /** Contribution to uptime: 1 = up, 0 = down, fractions for partial, null = not counted. */
  weight?: number | null
}

type StatusBarDatum = {
  id: string
  /** Period label, e.g. "Mon, Oct 12". */
  label: string
  status: string
  description?: string
}

function getStatusBarStatuses(l10n: LocaleLabels = localeLabels.en) {
  return ({
  operational: { label: l10n.operational, color: "var(--success)", weight: 1 },
  degraded: { label: l10n.degraded, color: "var(--warning)", weight: 0.5 },
  outage: { label: l10n.outage, color: "var(--destructive)", weight: 0 },
  maintenance: { label: l10n.maintenance, color: "var(--primary)", weight: null },
  nodata: {
    label: l10n.noData,
    color: "color-mix(in oklch, var(--muted-foreground) 30%, transparent)",
    weight: null,
  },
} satisfies Record<string, StatusBarStatus>)
}

const STATUS_BAR_STATUSES = getStatusBarStatuses()

type StatusBarProps = Omit<React.ComponentProps<"section">, "children" | "title"> & {
  data: readonly StatusBarDatum[]
  statuses?: Record<string, StatusBarStatus>
  label?: string
  /** Service name shown in the header row. */
  title?: React.ReactNode
  height?: number
  /** Gap between bars in px. */
  gap?: number
  showHeader?: boolean
  showLegend?: boolean
  /** Caption under the bars' left and right ends. */
  startLabel?: string
  endLabel?: string
  activeId?: string | null
  defaultActiveId?: string | null
  onActiveChange?: (id: string | null) => void
}

function StatusBar({
  data,
  statuses,
  label,
  title,
  height = 36,
  gap = 3,
  showHeader = true,
  showLegend = true,
  startLabel,
  endLabel,
  activeId: activeIdProp,
  defaultActiveId,
  onActiveChange,
  className,
  ...props
}: StatusBarProps) {
  const l10n = useLocale().labels
  if (statuses === undefined) statuses = getStatusBarStatuses(l10n)

  if (label === undefined) label = l10n.statusHistory
  if (endLabel === undefined) endLabel = l10n.today

  const [ref, size] = useChartSize<HTMLDivElement>()
  const [activeId, setActiveId] = useActiveId(activeIdProp, defaultActiveId, onActiveChange)
  const reduce = useReducedMotion()
  const transition = useChartTransition()
  // The left-to-right stagger is for the entrance only. Kept on every animate,
  // it made hover lag by up to 0.5s on the right-hand bars, so the dim wave
  // trailed behind the pointer instead of tracking it.
  const [entered, setEntered] = React.useState(false)

  const fallback: StatusBarStatus = { label: l10n.unknown, color: "var(--muted-foreground)", weight: null }
  const rows = data.map((datum) => ({ datum, status: statuses[datum.status] ?? fallback }))

  const counted = rows.filter((r) => r.status.weight != null)
  const uptime = counted.length
    ? counted.reduce((a, r) => a + (r.status.weight as number), 0) / counted.length
    : null
  const latest = rows[rows.length - 1]

  const width = size.width
  const n = rows.length
  const padding = n ? clamp(gap / Math.max(1, width / n), 0, 0.6) : 0
  const band = scaleBand(n, [0, width], padding)
  const bw = Math.max(1, band.bandwidth)
  const activeIndex = rows.findIndex((r) => r.datum.id === activeId)
  const active = activeIndex >= 0 ? rows[activeIndex] : null

  const counts = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const d of data) m.set(d.status, (m.get(d.status) ?? 0) + 1)
    return m
  }, [data])

  React.useEffect(() => {
    if (entered || size.width <= 0) return
    const t = window.setTimeout(() => setEntered(true), reduce ? 0 : 900)
    return () => window.clearTimeout(t)
  }, [entered, size.width, reduce])

  const indexAtPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    // Measure at event time, so scroll and resize never leave stale offsets.
    const box = e.currentTarget.getBoundingClientRect()
    if (!n || box.width <= 0) return null
    // Map through the live box width, in case it differs from the last measured size.
    const x = ((e.clientX - box.left) / box.width) * width
    return band.indexAt(x)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!n) return
    const cur = activeIndex >= 0 ? activeIndex : n - 1
    let next = cur
    if (e.key === "ArrowLeft") next = cur - 1
    else if (e.key === "ArrowRight") next = cur + 1
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = n - 1
    else if (e.key === "Escape") return setActiveId(null)
    else return
    e.preventDefault()
    setActiveId(rows[clamp(next, 0, n - 1)].datum.id)
  }

  return (
    <section
      data-slot="status-bar"
      className={cn("w-full min-w-0 space-y-2.5", className)}
      {...props}
      aria-label={props["aria-label"] ?? label}
    >
      {showHeader && (
        <div className="flex items-center gap-2 text-ui">
          {latest && (
            <span className="relative flex size-2.5">
              {latest.status.weight === 1 && (
                <span
                  className="absolute inset-0 animate-ping rounded-full opacity-50 motion-reduce:hidden motion-reduce:animate-none"
                  style={{ background: latest.status.color }}
                />
              )}
              <span className="relative size-2.5 rounded-full" style={{ background: latest.status.color }} />
            </span>
          )}
          <span className="font-medium text-foreground">{title ?? label}</span>
          {latest && <span className="text-muted-foreground">{latest.status.label}</span>}
          {uptime !== null && (
            <span className="ml-auto text-ui-sm font-medium text-muted-foreground tabular-nums">
              <span className="text-foreground">{(uptime * 100).toFixed(2)}%</span> {l10n.uptime}
            </span>
          )}
        </div>
      )}

      <div
        ref={ref}
        tabIndex={0}
        role="img"
        aria-label={l10n.statusHistoryHint(label)}
        onKeyDown={onKeyDown}
        onBlur={() => setActiveId(null)}
        onPointerLeave={() => setActiveId(null)}
        onPointerMove={(e) => {
          const i = indexAtPointer(e)
          if (i == null) return
          const id = rows[i].datum.id
          if (id !== activeId) setActiveId(id)
        }}
        onPointerDown={(e) => {
          const i = indexAtPointer(e)
          if (i != null) setActiveId(rows[i].datum.id)
        }}
        className="relative w-full touch-pan-y rounded-lg outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{ height }}
      >
        {width > 0 && (
          <svg width={width} height={height} className="block overflow-visible" aria-hidden>
            {rows.map(({ datum, status }, i) => {
              const isActive = i === activeIndex
              const dim = activeIndex >= 0 && !isActive
              return (
                <motion.rect
                  key={datum.id}
                  initial={reduce ? false : { x: band(i), scaleY: 0, opacity: 0 }}
                  animate={{
                    x: band(i),
                    scaleY: isActive ? 1 : dim ? 0.86 : 1,
                    opacity: dim ? 0.55 : 1,
                  }}
                  transition={{ ...transition, delay: reduce || entered ? 0 : Math.min(i * 0.008, 0.5) }}
                  y={0}
                  width={bw}
                  height={height}
                  rx={Math.min(bw / 2, 4)}
                  style={{ fill: status.color, transformBox: "fill-box", originY: 1 }}
                />
              )
            })}
          </svg>
        )}

        <ChartTooltip
          open={!!active}
          x={active ? band(activeIndex) + bw / 2 : 0}
          y={0}
          bounds={{ width, height }}
          side="top"
          avoidCollisions={false}
          offset={10}
        >
          {active && (
            <>
              <ChartTooltipTitle>{active.datum.label}</ChartTooltipTitle>
              <div className="flex items-center gap-2 text-popover-foreground">
                <ChartSwatch color={active.status.color} />
                <span className="font-medium">{active.status.label}</span>
              </div>
              {active.datum.description && (
                <p className="mt-1 text-muted-foreground">{active.datum.description}</p>
              )}
            </>
          )}
        </ChartTooltip>
      </div>

      {(startLabel || endLabel) && (
        <div className="flex items-center gap-3 text-ui-xs text-muted-foreground">
          <span>{startLabel ?? l10n.periodsAgo(n)}</span>
          <span className="h-px flex-1 bg-border" />
          <span>{endLabel}</span>
        </div>
      )}

      {showLegend && (
        <ul aria-label={l10n.legendFor(label)} className="flex flex-wrap gap-x-3 gap-y-1 text-ui-sm text-muted-foreground">
          {Object.entries(statuses)
            .filter(([key]) => counts.has(key))
            .map(([key, s]) => (
              <li key={key} className="flex items-center gap-1.5">
                <ChartSwatch color={s.color} className="size-2" />
                {s.label}
                <span className="text-foreground tabular-nums">{counts.get(key)}</span>
              </li>
            ))}
        </ul>
      )}

      <ChartDataTable
        caption={l10n.chartData(label)}
        columns={[l10n.period, l10n.status, l10n.details]}
        rows={rows.map(({ datum, status }) => [datum.label, status.label, datum.description ?? ""])}
      />
    </section>
  )
}

export {
  StatusBar,
  STATUS_BAR_STATUSES,
  type StatusBarProps,
  type StatusBarDatum,
  type StatusBarStatus,
}
