"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"
import {
  ChartNumber,
  ChartTooltip,
  ChartTooltipRow,
  ChartTooltipTitle,
  chartAlpha,
  clamp,
  formatNumber,
  useChartSize,
} from "@paneui/ui/components/chart-utils"

/* -------------------------------------------------------------------------- */
/*                                  Dates (UTC)                               */
/* -------------------------------------------------------------------------- */

const DAY = 86_400_000

/** Parse "YYYY-MM-DD" (or any ISO string) to UTC midnight ms. */
function utcDay(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number)
  return Date.UTC(y, (m || 1) - 1, d || 1)
}
function isoDay(ms: number) {
  return new Date(ms).toISOString().slice(0, 10)
}

const fmtLong = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
})
const fmtShort = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" })
const fmtMonth = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short" })
const fmtWeekday = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short" })

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type HeatCalendarDatum = { date: string; count: number }

/** Inclusive range of UTC dates ("YYYY-MM-DD"); `end` is absent while a range is being picked. */
type HeatCalendarSelection = { start: string; end?: string }

type HeatCalendarDay = {
  date: string
  time: number
  week: number
  day: number
  count: number
  level: number
  /** After `endDate`: rendered as an empty placeholder. */
  future: boolean
}

type HeatCalendarProps = Omit<React.ComponentProps<"div">, "children"> & {
  data: readonly HeatCalendarDatum[]
  /** Last UTC day shown ("YYYY-MM-DD"); defaults to the latest date in `data`. */
  endDate?: string
  weeks?: number
  /** 0 = Sunday (contribution-graph convention), 1 = Monday. */
  weekStartsOn?: 0 | 1
  /** Noun after every count. */
  unit?: string
  /** The single hue; strength maps to magnitude. */
  color?: string
  /** Count that maps to the strongest level; defaults to the visible maximum. */
  maxCount?: number
  cellSize?: number
  gap?: number
  label?: string
  selection?: HeatCalendarSelection | null
  defaultSelection?: HeatCalendarSelection | null
  onSelectionChange?: (selection: HeatCalendarSelection | null) => void
  /** Custom composition; defaults to grid (with tooltip), summary and legend. */
  children?: React.ReactNode
}

const LEVEL_ALPHA = [0, 28, 50, 74, 100] as const

type Ctx = {
  days: HeatCalendarDay[]
  byDate: Map<string, HeatCalendarDay>
  weeks: number
  weekStartsOn: 0 | 1
  unit: string
  color: string
  cellSize: number
  gap: number
  label: string
  total: number
  max: number
  selection: HeatCalendarSelection | null
  setSelection: (s: HeatCalendarSelection | null) => void
  inSelection: (date: string) => boolean
  hot: HeatCalendarDay | null
  setHot: (d: HeatCalendarDay | null) => void
  levelColor: (level: number) => string
  /** Grid geometry shared by grid and tooltip. */
  geo: {
    labelW: number
    monthH: number
    pitch: number
    scrollLeft: number
    setScrollLeft: (v: number) => void
    viewportW: number
    setViewportW: (v: number) => void
  }
}

const HeatCalendarContext = React.createContext<Ctx | null>(null)
function useHeatCalendar() {
  const ctx = React.useContext(HeatCalendarContext)
  if (!ctx) throw new Error("HeatCalendar parts must be rendered inside <HeatCalendar>.")
  return ctx
}

function sortRange(a: string, b?: string) {
  if (!b) return [a, a] as const
  return a <= b ? ([a, b] as const) : ([b, a] as const)
}

/* -------------------------------------------------------------------------- */
/*                                    Root                                    */
/* -------------------------------------------------------------------------- */

function HeatCalendar({
  data,
  endDate,
  weeks = 26,
  weekStartsOn = 0,
  unit: unitProp,
  color = "var(--chart-4, var(--success))",
  maxCount,
  cellSize = 12,
  gap = 3,
  label: labelProp,
  selection: selectionProp,
  defaultSelection = null,
  onSelectionChange,
  className,
  children,
  ...props
}: HeatCalendarProps) {
  const { labels } = useLocale()
  const unit = unitProp ?? labels.contributions
  const label = labelProp ?? labels.activityCalendar
  const counts = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const d of data) {
      if (!Number.isFinite(d.count) || d.count < 0) continue
      const k = d.date.slice(0, 10)
      m.set(k, (m.get(k) ?? 0) + d.count)
    }
    return m
  }, [data])

  const end = React.useMemo(() => {
    if (endDate) return utcDay(endDate)
    let latest = 0
    for (const k of counts.keys()) latest = Math.max(latest, utcDay(k))
    return latest || Date.UTC(2026, 0, 1)
  }, [endDate, counts])

  const { days, byDate, total, max } = React.useMemo(() => {
    const endDow = (new Date(end).getUTCDay() - weekStartsOn + 7) % 7
    const lastWeekStart = end - endDow * DAY
    const first = lastWeekStart - (weeks - 1) * 7 * DAY
    const list: HeatCalendarDay[] = []
    let sum = 0
    let peak = 0
    for (let w = 0; w < weeks; w++)
      for (let d = 0; d < 7; d++) {
        const time = first + (w * 7 + d) * DAY
        const date = isoDay(time)
        const future = time > end
        const count = future ? 0 : counts.get(date) ?? 0
        sum += count
        peak = Math.max(peak, count)
        list.push({ date, time, week: w, day: d, count, level: 0, future })
      }
    const top = maxCount ?? peak
    for (const day of list)
      day.level = day.count <= 0 || !top ? 0 : clamp(Math.ceil((day.count / top) * 4), 1, 4)
    return { days: list, byDate: new Map(list.map((d) => [d.date, d])), total: sum, max: top }
  }, [end, weeks, weekStartsOn, counts, maxCount])

  const [inner, setInner] = React.useState<HeatCalendarSelection | null>(defaultSelection)
  const selection = selectionProp === undefined ? inner : selectionProp
  const cb = React.useRef(onSelectionChange)
  cb.current = onSelectionChange
  const controlled = selectionProp !== undefined
  const setSelection = React.useCallback(
    (s: HeatCalendarSelection | null) => {
      if (!controlled) setInner(s)
      cb.current?.(s)
    },
    [controlled]
  )
  const [lo, hi] = selection ? sortRange(selection.start, selection.end) : ["", ""]
  const inSelection = React.useCallback((date: string) => !!lo && date >= lo && date <= hi, [lo, hi])

  const [hot, setHot] = React.useState<HeatCalendarDay | null>(null)
  const [scrollLeft, setScrollLeft] = React.useState(0)
  const [viewportW, setViewportW] = React.useState(0)

  const levelColor = React.useCallback(
    (level: number) => (level <= 0 ? "var(--muted)" : chartAlpha(color, LEVEL_ALPHA[clamp(level, 0, 4)])),
    [color]
  )

  const value: Ctx = {
    days,
    byDate,
    weeks,
    weekStartsOn,
    unit,
    color,
    cellSize,
    gap,
    label,
    total,
    max,
    selection,
    setSelection,
    inSelection,
    hot,
    setHot,
    levelColor,
    geo: { labelW: 30, monthH: 18, pitch: cellSize + gap, scrollLeft, setScrollLeft, viewportW, setViewportW },
  }

  return (
    <HeatCalendarContext.Provider value={value}>
      <div data-slot="heat-calendar" className={cn("grid w-full min-w-0 grid-cols-1 gap-3", className)} {...props}>
        {children ?? (
          <>
            <HeatCalendarGrid />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <HeatCalendarSummary />
              <HeatCalendarLegend />
            </div>
          </>
        )}
      </div>
    </HeatCalendarContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Grid                                    */
/* -------------------------------------------------------------------------- */

function HeatCalendarGrid({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { labels } = useLocale()
  const {
    days,
    byDate,
    weeks,
    cellSize,
    gap,
    label,
    unit,
    selection,
    setSelection,
    inSelection,
    hot,
    setHot,
    levelColor,
    color,
    geo,
  } = useHeatCalendar()
  const reduce = useReducedMotion()
  const scroller = React.useRef<HTMLDivElement>(null)
  const cellRefs = React.useRef(new Map<string, HTMLDivElement>())
  const dragging = React.useRef<string | null>(null)
  const lastReal = [...days].reverse().find((d) => !d.future)
  const [focusDate, setFocusDate] = React.useState<string | null>(null)
  const focusKey = focusDate && byDate.has(focusDate) ? focusDate : lastReal?.date ?? null

  // Start scrolled to the most recent week.
  React.useLayoutEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [weeks])

  React.useEffect(() => {
    const up = () => (dragging.current = null)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
    return () => {
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
    }
  }, [])

  const months = React.useMemo(() => {
    const out: { week: number; label: string }[] = []
    let prev = -1
    for (let w = 0; w < weeks; w++) {
      const first = days[w * 7]
      const m = new Date(first.time).getUTCMonth()
      if (m !== prev) {
        // skip a label squeezed into the first column when the month starts mid-week
        if (!(w === 0 && new Date(days[6].time).getUTCMonth() !== m))
          out.push({ week: w, label: fmtMonth.format(first.time) })
        prev = m
      }
    }
    return out
  }, [days, weeks])

  const moveFocus = (to: HeatCalendarDay | undefined, extend: boolean) => {
    if (!to || to.future) return
    setFocusDate(to.date)
    setHot(to)
    cellRefs.current.get(to.date)?.focus()
    if (extend) setSelection({ start: selection?.start ?? focusKey ?? to.date, end: to.date })
  }

  const onKeyDown = (e: React.KeyboardEvent, day: HeatCalendarDay) => {
    const i = day.week * 7 + day.day
    let next: HeatCalendarDay | undefined
    if (e.key === "ArrowLeft") next = days[i - 7]
    else if (e.key === "ArrowRight") next = days[i + 7]
    else if (e.key === "ArrowUp") next = day.day > 0 ? days[i - 1] : undefined
    else if (e.key === "ArrowDown") next = day.day < 6 ? days[i + 1] : undefined
    else if (e.key === "Home") next = days[day.week * 7]
    else if (e.key === "End") next = days[day.week * 7 + 6]
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (!selection || selection.end) setSelection({ start: day.date })
      else if (selection.start === day.date) setSelection(null)
      else setSelection({ start: selection.start, end: day.date })
      return
    } else if (e.key === "Escape") {
      setSelection(null)
      return
    } else return
    e.preventDefault()
    moveFocus(next, e.shiftKey)
  }

  const rows = Array.from({ length: 7 }, (_, d) => d)
  const [outer, outerSize] = useChartSize<HTMLDivElement>()
  const { setViewportW } = geo
  React.useEffect(() => setViewportW(outerSize.width), [outerSize.width, setViewportW])

  return (
    <div
      ref={outer}
      data-slot="heat-calendar-grid"
      className={cn("relative min-w-0", className)}
      onPointerLeave={() => setHot(null)}
    >
      <div
        ref={scroller}
        onScroll={(e) => geo.setScrollLeft(e.currentTarget.scrollLeft)}
        className="overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin]"
      >
        <div className="relative w-max" style={{ paddingLeft: geo.labelW, paddingTop: geo.monthH }}>
          {/* month labels */}
          {months.map((m) => (
            <span
              key={`${m.week}-${m.label}`}
              aria-hidden
              className="absolute top-0 text-ui-2xs text-muted-foreground"
              style={{ left: geo.labelW + m.week * geo.pitch }}
            >
              {m.label}
            </span>
          ))}
          {/* weekday labels */}
          {[1, 3, 5].map((d) => (
            <span
              key={d}
              aria-hidden
              className="absolute left-0 text-ui-2xs leading-none text-muted-foreground"
              style={{ top: geo.monthH + d * geo.pitch + (cellSize - 10) / 2 }}
            >
              {fmtWeekday.format(days[d]?.time ?? 0)}
            </span>
          ))}

          <div
            role="grid"
            aria-label={labels.calendarRangeHint(label)}
            aria-multiselectable
            className="grid touch-pan-x select-none"
            style={{ gridTemplateColumns: `repeat(${weeks}, ${cellSize}px)`, gap }}
          >
            {rows.map((d) => (
              <div role="row" key={d} className="contents">
                {Array.from({ length: weeks }, (_, w) => {
                  const day = days[w * 7 + d]
                  if (day.future) return <div role="gridcell" key={day.date} aria-disabled style={{ width: cellSize, height: cellSize }} />
                  const selected = inSelection(day.date)
                  const isHot = hot?.date === day.date
                  return (
                    <motion.div
                      key={day.date}
                      ref={(el) => {
                        if (el) cellRefs.current.set(day.date, el)
                        else cellRefs.current.delete(day.date)
                      }}
                      role="gridcell"
                      tabIndex={focusKey === day.date ? 0 : -1}
                      aria-selected={selected}
                      aria-label={`${fmtLong.format(day.time)}: ${formatNumber(day.count)} ${unit}`}
                      data-level={day.level}
                      data-selected={selected || undefined}
                      initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                      animate={{ opacity: selection && !selected ? 0.45 : 1, scale: isHot ? 1.25 : 1 }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : {
                              opacity: { duration: 0.25, delay: 0 },
                              scale: { type: "spring", stiffness: 500, damping: 28, delay: 0 },
                              default: { delay: w * 0.012 },
                            }
                      }
                      onPointerDown={(e) => {
                        if (e.button !== 0) return
                        e.currentTarget.focus()
                        setFocusDate(day.date)
                        if (e.shiftKey && selection) {
                          setSelection({ start: selection.start, end: day.date })
                          return
                        }
                        if (selection && !selection.end && selection.start === day.date) {
                          setSelection(null)
                          return
                        }
                        dragging.current = day.date
                        setSelection({ start: day.date })
                      }}
                      onPointerEnter={() => {
                        setHot(day)
                        if (dragging.current && dragging.current !== day.date)
                          setSelection({ start: dragging.current, end: day.date })
                      }}
                      onFocus={() => {
                        setFocusDate(day.date)
                        setHot(day)
                      }}
                      onBlur={() => setHot(null)}
                      onKeyDown={(e) => onKeyDown(e, day)}
                      className={cn(
                        "relative cursor-pointer rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        day.level === 0 && "shadow-well"
                      )}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        background: levelColor(day.level),
                        boxShadow: selected ? `0 0 0 1.5px ${color}` : undefined,
                        zIndex: isHot ? 2 : undefined,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {children ?? <HeatCalendarTooltip />}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Tooltip                                  */
/* -------------------------------------------------------------------------- */

function HeatCalendarTooltip({
  className,
  children,
}: {
  className?: string
  /** Custom body for the hovered/focused day. */
  children?: (day: HeatCalendarDay) => React.ReactNode
}) {
  const { labels } = useLocale()
  const { hot, unit, levelColor, cellSize, geo, weeks, max } = useHeatCalendar()
  const x = hot ? geo.labelW + hot.week * geo.pitch + cellSize / 2 - geo.scrollLeft : 0
  const y = hot ? geo.monthH + hot.day * geo.pitch : 0
  const width = geo.viewportW || geo.labelW + weeks * geo.pitch
  return (
    <ChartTooltip
      open={!!hot}
      x={x}
      y={y}
      bounds={{ width, height: geo.monthH + 7 * geo.pitch }}
      side="top"
      offset={8}
      avoidCollisions={false}
      className={cn("min-w-0", className)}
    >
      {hot &&
        (children ? (
          children(hot)
        ) : (
          <>
            <ChartTooltipTitle>{fmtLong.format(hot.time)}</ChartTooltipTitle>
            <ChartTooltipRow
              color={levelColor(hot.level)}
              label={unit}
              value={formatNumber(hot.count)}
            />
            {max > 0 && hot.count > 0 && (
              <ChartTooltipRow label={labels.ofBusiestDay} value={`${Math.round((hot.count / max) * 100)}%`} />
            )}
          </>
        ))}
    </ChartTooltip>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Legend / Summary                             */
/* -------------------------------------------------------------------------- */

function HeatCalendarLegend({ className, ...props }: React.ComponentProps<"div">) {
  const { labels } = useLocale()
  const { levelColor } = useHeatCalendar()
  return (
    <div
      data-slot="heat-calendar-legend"
      aria-hidden
      className={cn("flex items-center gap-1 text-ui-2xs text-muted-foreground", className)}
      {...props}
    >
      <span className="me-1">{labels.less}</span>
      {[0, 1, 2, 3, 4].map((l) => (
        <span
          key={l}
          className={cn("size-2.5 rounded-2xs", l === 0 && "shadow-well")}
          style={{ background: levelColor(l) }}
        />
      ))}
      <span className="ms-1">{labels.more}</span>
    </div>
  )
}

function HeatCalendarSummary({ className, ...props }: React.ComponentProps<"div">) {
  const { labels } = useLocale()
  const { selection, total, unit, days, weeks, setSelection } = useHeatCalendar()
  const real = days.filter((d) => !d.future)
  let content: React.ReactNode
  if (selection) {
    const [lo, hi] = sortRange(selection.start, selection.end)
    const span = real.filter((d) => d.date >= lo && d.date <= hi)
    const sum = span.reduce((s, d) => s + d.count, 0)
    const active = span.filter((d) => d.count > 0).length
    content = (
      <>
        <span className="font-medium text-foreground">
          {lo === hi ? fmtShort.format(utcDay(lo)) : `${fmtShort.format(utcDay(lo))} – ${fmtShort.format(utcDay(hi))}`}
        </span>
        <span>·</span>
        <span>
          <ChartNumber value={sum} className="font-medium text-foreground" /> {unit}
        </span>
        <span>
          · {labels.activeDays(active, span.length)}
        </span>
        <button
          type="button"
          onClick={() => setSelection(null)}
          className="ml-1 rounded-md bg-card px-2 py-0.5 text-ui-xs font-medium text-secondary-foreground shadow-raised transition-[box-shadow,background-color,scale] duration-150 ease-out outline-none hover:bg-accent hover:shadow-raised-hover focus-visible:ring-2 focus-visible:ring-ring"
        >
          {labels.clear}
        </button>
      </>
    )
  } else {
    content = (
      <span>
        <ChartNumber value={total} className="font-medium text-foreground" /> {unit} {labels.inLastWeeks(weeks)}
      </span>
    )
  }
  return (
    <div
      data-slot="heat-calendar-summary"
      aria-live="polite"
      className={cn("flex min-h-6 flex-wrap items-center gap-1.5 text-ui-sm text-muted-foreground tabular-nums", className)}
      {...props}
    >
      {content}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Demo data                                 */
/* -------------------------------------------------------------------------- */

/** Deterministic daily counts ending on `endDate` (UTC), with quieter weekends. */
function generateHeatCalendarData(
  rand: () => number,
  { endDate = "2026-10-13", days = 371, intensity = 9 }: { endDate?: string; days?: number; intensity?: number } = {}
): HeatCalendarDatum[] {
  const end = utcDay(endDate)
  const out: HeatCalendarDatum[] = []
  let streak = 0
  for (let i = days - 1; i >= 0; i--) {
    const t = end - i * DAY
    const dow = new Date(t).getUTCDay()
    const weekend = dow === 0 || dow === 6
    if (rand() < 0.08) streak = Math.floor(rand() * 6)
    const busy = streak > 0 ? (streak--, 1.8) : 1
    const p = weekend ? 0.35 : 0.85
    const count = rand() < p ? Math.round(rand() * intensity * busy * (weekend ? 0.5 : 1)) : 0
    out.push({ date: isoDay(t), count })
  }
  return out
}

export {
  HeatCalendar,
  HeatCalendarGrid,
  HeatCalendarTooltip,
  HeatCalendarLegend,
  HeatCalendarSummary,
  useHeatCalendar,
  generateHeatCalendarData,
  type HeatCalendarProps,
  type HeatCalendarDatum,
  type HeatCalendarDay,
  type HeatCalendarSelection,
}
