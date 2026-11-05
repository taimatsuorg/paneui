"use client"

import * as React from "react"

import { ChevronLeftIcon, ChevronRightIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"

/*
 * A month grid for picking one date or a range. Arrow keys move by day and week, Home/End
 * to the week's edges, PageUp/PageDown by month (Shift for a year). Weeks start on the
 * locale's first day unless `weekStartsOn` says otherwise.
 */
type DateRange = { from?: Date; to?: Date }

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
function addMonths(d: Date, n: number) {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1)
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), last))
}
const dayNum = (d: Date) => Math.round(startOfDay(d).getTime() / 864e5)
const sameDay = (a?: Date, b?: Date) => !!a && !!b && dayNum(a) === dayNum(b)
const sameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth()
const isoKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

const subscribeNothing = () => () => {}
/** The given locale, or en-US until hydration, so the server and the first client render print the same text. */
function useStableLocale(locale?: string) {
  const hydrated = React.useSyncExternalStore(subscribeNothing, () => true, () => false)
  return locale ?? (hydrated ? undefined : "en-US")
}

function localeWeekStart(locale?: string): number {
  try {
    const loc = new Intl.Locale(locale ?? navigator.language) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number }
      weekInfo?: { firstDay: number }
    }
    const info = loc.getWeekInfo?.() ?? loc.weekInfo
    if (info) return info.firstDay % 7
  } catch {}
  return 0
}

type CommonProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  /** Month shown first (uncontrolled start: the selection's month, else today). */
  defaultMonth?: Date
  month?: Date
  onMonthChange?: (month: Date) => void
  /** Months side by side. */
  numberOfMonths?: number
  min?: Date
  max?: Date
  /** Extra rule for unavailable days. */
  disabled?: (date: Date) => boolean
  /** 0 = Sunday … 6 = Saturday. Defaults to the locale's. */
  weekStartsOn?: number
  locale?: string
  /** Show the trailing and leading days of neighbouring months (single month only). */
  showOutsideDays?: boolean
}

type SingleProps = CommonProps & {
  mode?: "single"
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (date: Date | null) => void
}

type RangeProps = CommonProps & {
  mode: "range"
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (range: DateRange) => void
}

type CalendarProps = SingleProps | RangeProps

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [inner, setInner] = React.useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : inner
  const set = React.useCallback(
    (v: T) => {
      if (!controlled) setInner(v)
      onChange?.(v)
    },
    [controlled, onChange]
  )
  return [current, set] as const
}

const navButton =
  "inline-flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4"

function Calendar(props: CalendarProps) {
  const { labels } = useLocale()
  const {
    mode = "single",
    value,
    defaultValue,
    onValueChange,
    defaultMonth,
    month: monthProp,
    onMonthChange,
    numberOfMonths = 1,
    min,
    max,
    disabled,
    weekStartsOn: weekStartsOnProp,
    locale: localeProp,
    showOutsideDays = true,
    className,
    ...rest
  } = props
  const isRange = mode === "range"
  const locale = useStableLocale(localeProp)

  const [single, setSingle] = useControllable<Date | null>(
    isRange ? undefined : (value as Date | null | undefined),
    isRange ? null : ((defaultValue as Date | null | undefined) ?? null),
    isRange ? undefined : (onValueChange as ((d: Date | null) => void) | undefined)
  )
  const [range, setRange] = useControllable<DateRange>(
    isRange ? (value as DateRange | undefined) : undefined,
    isRange ? ((defaultValue as DateRange | undefined) ?? {}) : {},
    isRange ? (onValueChange as ((r: DateRange) => void) | undefined) : undefined
  )

  const anchor = (isRange ? range.from : single) ?? undefined
  const [month, setMonthState] = useControllable<Date>(
    monthProp,
    startOfMonth(defaultMonth ?? anchor ?? new Date()),
    onMonthChange
  )
  const [focused, setFocusedState] = React.useState<Date>(() => startOfDay(anchor ?? new Date()))
  const [hovered, setHovered] = React.useState<Date>()
  const focusRequest = React.useRef(false)
  const [weekStartsOn, setWeekStartsOn] = React.useState(weekStartsOnProp ?? 0)
  React.useEffect(() => setWeekStartsOn(weekStartsOnProp ?? localeWeekStart(localeProp)), [weekStartsOnProp, localeProp])

  const isDisabled = React.useCallback(
    (d: Date) => (!!min && dayNum(d) < dayNum(min)) || (!!max && dayNum(d) > dayNum(max)) || !!disabled?.(d),
    [min, max, disabled]
  )

  const setFocused = (d: Date, move = false) => {
    setFocusedState(d)
    const mi = monthIndex(d)
    if (mi < monthIndex(month)) setMonthState(startOfMonth(d))
    else if (mi >= monthIndex(month) + numberOfMonths) setMonthState(startOfMonth(addMonths(d, -(numberOfMonths - 1))))
    if (move) focusRequest.current = true
  }

  const select = (d: Date) => {
    if (!isRange) return setSingle(sameDay(single ?? undefined, d) ? null : d)
    if (!range.from || range.to || dayNum(d) < dayNum(range.from)) return setRange({ from: d, to: undefined })
    setRange({ from: range.from, to: d })
  }

  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!focusRequest.current) return
    const btn = ref.current?.querySelector<HTMLButtonElement>(`button[data-date="${isoKey(focused)}"]:not([data-outside])`)
    if (btn) {
      focusRequest.current = false
      btn.focus({ preventScroll: true })
    }
  })

  const months = Array.from({ length: numberOfMonths }, (_, i) => addMonths(month, i))
  const canPrev = !min || monthIndex(month) > monthIndex(min)
  const canNext = !max || monthIndex(months[months.length - 1]) < monthIndex(max)
  const titleFmt = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" })
  const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: "short" })
  const weekdayNarrow = new Intl.DateTimeFormat(locale, { weekday: "narrow" })
  const labelFmt = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  const today = startOfDay(new Date())
  const baseId = React.useId()

  const visible = monthIndex(focused) >= monthIndex(month) && monthIndex(focused) < monthIndex(month) + numberOfMonths
  const tabbable = visible ? focused : month

  const previewEnd =
    isRange && range.from && !range.to && hovered && dayNum(hovered) >= dayNum(range.from) && !isDisabled(hovered) ? hovered : undefined
  const lo = isRange && range.from ? dayNum(range.from) : undefined
  const hi = isRange ? (range.to ? dayNum(range.to) : previewEnd ? dayNum(previewEnd) : undefined) : undefined

  const onKeyDown = (e: React.KeyboardEvent, d: Date) => {
    const dow = (d.getDay() - weekStartsOn + 7) % 7
    // In right-to-left the week runs right to left, so the horizontal arrows swap.
    const step = getComputedStyle(e.currentTarget).direction === "rtl" ? -1 : 1
    const map: Record<string, () => Date> = {
      ArrowLeft: () => addDays(d, -step),
      ArrowRight: () => addDays(d, step),
      ArrowUp: () => addDays(d, -7),
      ArrowDown: () => addDays(d, 7),
      Home: () => addDays(d, -dow),
      End: () => addDays(d, 6 - dow),
      PageUp: () => addMonths(d, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(d, e.shiftKey ? 12 : 1),
    }
    const fn = map[e.key]
    if (!fn) return
    e.preventDefault()
    const next = fn()
    setFocused(next, true)
    if (isRange && range.from && !range.to) setHovered(next)
  }

  return (
    <div
      ref={ref}
      data-slot="calendar"
      data-mode={mode}
      className={cn("relative flex w-fit gap-4 text-ui", className)}
      onPointerLeave={() => setHovered(undefined)}
      {...rest}
    >
      <button type="button" aria-label={labels.previousMonth} disabled={!canPrev} onClick={() => setMonthState(addMonths(month, -1))} className={cn(navButton, "absolute start-0 top-0 z-10")}>
        <ChevronLeftIcon className="rtl:rotate-180" />
      </button>
      <button type="button" aria-label={labels.nextMonth} disabled={!canNext} onClick={() => setMonthState(addMonths(month, 1))} className={cn(navButton, "absolute end-0 top-0 z-10")}>
        <ChevronRightIcon className="rtl:rotate-180" />
      </button>
      {months.map((m, mi) => {
        const first = startOfMonth(m)
        const lead = (first.getDay() - weekStartsOn + 7) % 7
        const gridStart = addDays(first, -lead)
        const weeks = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, c) => addDays(gridStart, w * 7 + c)))
        const hideOutside = !showOutsideDays || numberOfMonths > 1
        return (
          <div key={isoKey(first)} className="flex flex-col gap-1">
            <div id={`${baseId}-${mi}`} aria-live="polite" className="flex h-7 items-center justify-center font-semibold">
              {titleFmt.format(m)}
            </div>
            <div role="grid" aria-labelledby={`${baseId}-${mi}`} className="flex flex-col gap-0.5">
              <div role="row" className="grid grid-cols-7">
                {weeks[0].map((d) => (
                  <div key={d.getDay()} role="columnheader" aria-label={weekdayFmt.format(d)} className="flex h-6 items-center justify-center text-ui-xs font-medium text-muted-foreground">
                    {weekdayNarrow.format(d)}
                  </div>
                ))}
              </div>
              {weeks.map((week, w) => (
                <div key={w} role="row" className="grid grid-cols-7">
                  {week.map((d, c) => {
                    const outside = !sameMonth(d, m)
                    if (outside && hideOutside) return <div key={c} role="gridcell" className="size-8" />
                    const n = dayNum(d)
                    const off = isDisabled(d)
                    const selected = isRange ? (lo === n || (hi === n && !!range.to)) : sameDay(single ?? undefined, d)
                    const inRange = lo !== undefined && hi !== undefined && n > lo && n < hi
                    const preview = isRange && !range.to && hi === n && lo !== n
                    const bandStart = lo !== undefined && hi !== undefined && lo !== hi && n === lo
                    const bandEnd = lo !== undefined && hi !== undefined && lo !== hi && n === hi
                    return (
                      <div
                        key={c}
                        role="gridcell"
                        aria-selected={selected || (inRange && !!range.to) || undefined}
                        data-in-range={inRange || undefined}
                        data-range-start={bandStart || undefined}
                        data-range-end={bandEnd || undefined}
                        className="relative flex size-8 items-center justify-center data-in-range:bg-primary/12 data-range-start:rounded-s-lg data-range-start:bg-primary/12 data-range-end:rounded-e-lg data-range-end:bg-primary/12"
                      >
                        <button
                          type="button"
                          data-date={isoKey(d)}
                          tabIndex={sameDay(d, tabbable) && !outside ? 0 : -1}
                          disabled={off}
                          aria-label={labelFmt.format(d)}
                          aria-current={sameDay(d, today) ? "date" : undefined}
                          aria-pressed={selected || undefined}
                          data-outside={outside || undefined}
                          data-selected={selected || undefined}
                          data-preview={preview || undefined}
                          onClick={() => {
                            setFocused(d)
                            select(d)
                          }}
                          onPointerEnter={() => isRange && range.from && !range.to && setHovered(d)}
                          onKeyDown={(e) => onKeyDown(e, d)}
                          className={cn(
                            "relative inline-flex size-8 cursor-pointer items-center justify-center rounded-lg tabular-nums outline-none transition-colors duration-150",
                            "hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring",
                            "data-outside:text-muted-foreground/60",
                            "data-preview:shadow-[inset_0_0_0_1.5px_var(--primary)]",
                            "data-selected:bg-primary data-selected:font-semibold data-selected:text-primary-foreground data-selected:hover:bg-primary",
                            "disabled:cursor-not-allowed disabled:text-muted-foreground/40 disabled:line-through disabled:hover:bg-transparent",
                            "aria-[current=date]:not-data-selected:font-semibold aria-[current=date]:not-data-selected:text-primary-text"
                          )}
                        >
                          {d.getDate()}
                        </button>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { Calendar }
export type { CalendarProps, DateRange }
