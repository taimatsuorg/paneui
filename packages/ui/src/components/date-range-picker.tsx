"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { PopoverContent } from "@paneui/ui/components/popover"
import { useLocale } from "@paneui/ui/components/locale-provider"

/* ─────────────────────────── date helpers (no library) ─────────────────────────── */

type DateRange = { from?: Date; to?: Date }

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
/** Adds months, clamping the day so Jan 31 + 1 month = Feb 28/29. */
function addMonths(d: Date, n: number) {
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1)
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), last))
}
const sameDay = (a?: Date, b?: Date) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const sameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
const dayNum = (d: Date) => Math.round(startOfDay(d).getTime() / 864e5)
const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth()
const isoKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
/** Whole days between two dates (nights for a stay). */
const daysBetween = (a: Date, b: Date) => Math.abs(dayNum(b) - dayNum(a))

const subscribeNothing = () => () => {}
/** The given locale, or en-US until hydration, so the server and the first client render print the same text. */
function useStableLocale(locale?: string) {
  const hydrated = React.useSyncExternalStore(subscribeNothing, () => true, () => false)
  return locale ?? (hydrated ? undefined : "en-US")
}
/** ICU versions differ on thin / narrow no-break spaces around range dashes; print plain spaces. */
const plainSpaces = (s: string) => s.replace(/[\u2009\u202f]/g, " ")

function localeWeekStart(locale?: string): number {
  try {
    const loc = new Intl.Locale(locale ?? navigator.language) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number }
      weekInfo?: { firstDay: number }
    }
    const info = loc.getWeekInfo?.() ?? loc.weekInfo
    if (info) return info.firstDay % 7 // Intl uses 1..7 (Mon..Sun)
  } catch {}
  return 0
}

/* ─────────────────────────── context ─────────────────────────── */

type DateRangePickerContextValue = {
  range: DateRange
  setRange: (next: DateRange) => void
  selectDate: (d: Date) => void
  clear: () => void
  month: Date
  setMonth: (m: Date) => void
  direction: number
  numberOfMonths: number
  focused: Date
  setFocused: (d: Date, moveFocus?: boolean) => void
  focusRequest: React.RefObject<boolean>
  hovered: Date | undefined
  setHovered: (d: Date | undefined) => void
  isDisabled: (d: Date) => boolean
  weekStartsOn: number
  locale: string | undefined
  min?: Date
  max?: Date
  /** Close the popover (no-op when used inline). */
  close: () => void
}
const Ctx = React.createContext<DateRangePickerContextValue | null>(null)

/** The picker's state and actions, for custom parts inside <DateRangePicker>. */
function useDateRangePicker() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("useDateRangePicker must be used inside <DateRangePicker>.")
  return ctx
}

type DateRangePickerProps = Omit<PopoverPrimitive.Root.Props, "children"> & {
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (range: DateRange) => void
  /** BCP 47 locale for month/weekday names and formatting. Defaults to the browser's. */
  locale?: string
  /** 0 = Sunday … 6 = Saturday. Defaults to the locale's first day of the week. */
  weekStartsOn?: number
  /** Months shown side by side. Default 1. */
  numberOfMonths?: 1 | 2
  min?: Date
  max?: Date
  /** Extra rule for unavailable days (e.g. sold-out nights). */
  isDateDisabled?: (date: Date) => boolean
  /** Close the popover as soon as both ends are picked. Default false. */
  closeOnComplete?: boolean
  children?: React.ReactNode
}

/**
 * Date range state + popover root. Compose Trigger, Content, Calendar, Presets,
 * Summary, Clear and Footer — or drop the Calendar in without Trigger/Content
 * for an inline picker. Dates are local-midnight `Date`s; formatting is `Intl`.
 */
function DateRangePicker({
  value,
  defaultValue,
  onValueChange,
  locale: localeProp,
  weekStartsOn: weekStartsOnProp,
  numberOfMonths = 1,
  min,
  max,
  isDateDisabled,
  closeOnComplete = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: DateRangePickerProps) {
  const locale = useStableLocale(localeProp)
  const [internal, setInternal] = React.useState<DateRange>(defaultValue ?? {})
  const range = value ?? internal
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState

  const initial = startOfDay(range.from ?? new Date())
  const [month, setMonthState] = React.useState(() => startOfMonth(initial))
  const [direction, setDirection] = React.useState(0)
  const [focused, setFocusedState] = React.useState(initial)
  const [hovered, setHovered] = React.useState<Date | undefined>()
  const focusRequest = React.useRef(false)
  const [weekStartsOn, setWeekStartsOn] = React.useState(weekStartsOnProp ?? 0)
  React.useEffect(() => {
    setWeekStartsOn(weekStartsOnProp ?? localeWeekStart(localeProp))
  }, [weekStartsOnProp, localeProp])

  const isDisabled = React.useCallback(
    (d: Date) => (min ? dayNum(d) < dayNum(min) : false) || (max ? dayNum(d) > dayNum(max) : false) || !!isDateDisabled?.(d),
    [min, max, isDateDisabled]
  )

  const actions = React.useRef<PopoverPrimitive.Root.Actions | null>(null)
  // Closes through the popover primitive so onOpenChange gets proper event details.
  const close = React.useCallback(() => actions.current?.close(), [])

  const setMonth = React.useCallback((m: Date) => {
    setMonthState((prev) => {
      const next = startOfMonth(m)
      setDirection(Math.sign(monthIndex(next) - monthIndex(prev)))
      return next
    })
  }, [])

  const setRange = React.useCallback(
    (next: DateRange) => {
      if (value === undefined) setInternal(next)
      onValueChange?.(next)
    },
    [value, onValueChange]
  )

  const selectDate = React.useCallback(
    (raw: Date) => {
      const d = startOfDay(raw)
      if (isDisabled(d)) return
      setHovered(undefined)
      if (!range.from || range.to || dayNum(d) < dayNum(range.from)) {
        setRange({ from: d, to: undefined })
        return
      }
      // Don't let a range swallow an unavailable day.
      for (let t = addDays(range.from, 1); dayNum(t) < dayNum(d); t = addDays(t, 1))
        if (isDisabled(t)) {
          setRange({ from: d, to: undefined })
          return
        }
      setRange({ from: range.from, to: d })
      if (closeOnComplete) close()
    },
    [range, isDisabled, setRange, closeOnComplete, close]
  )

  const setFocused = React.useCallback(
    (d: Date, moveFocus = false) => {
      const day = startOfDay(d)
      setFocusedState(day)
      if (moveFocus) focusRequest.current = true
      setMonthState((prev) => {
        const first = monthIndex(prev)
        const at = monthIndex(day)
        if (at >= first && at < first + numberOfMonths) return prev
        const next = startOfMonth(at < first ? day : addMonths(startOfMonth(day), -(numberOfMonths - 1)))
        setDirection(Math.sign(at - first))
        return next
      })
    },
    [numberOfMonths]
  )

  // When the popup opens, show the month that holds the selection.
  React.useEffect(() => {
    if (!open) return
    const anchor = startOfDay(range.from ?? new Date())
    setMonthState(startOfMonth(anchor))
    setFocusedState(anchor)
    setDirection(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const ctx: DateRangePickerContextValue = {
    range,
    setRange,
    selectDate,
    clear: () => setRange({}),
    month,
    setMonth,
    direction,
    numberOfMonths,
    focused,
    setFocused,
    focusRequest,
    hovered,
    setHovered,
    isDisabled,
    weekStartsOn,
    locale,
    min,
    max,
    close,
  }

  return (
    <Ctx.Provider value={ctx}>
      <PopoverPrimitive.Root
        actionsRef={actions}
        open={open}
        onOpenChange={(next, details) => {
          if (openProp === undefined) setOpenState(next)
          onOpenChange?.(next, details)
        }}
        {...props}
      >
        {children}
      </PopoverPrimitive.Root>
    </Ctx.Provider>
  )
}

/* ─────────────────────────── trigger + content ─────────────────────────── */

function formatRange(range: DateRange, locale?: string, opts?: Intl.DateTimeFormatOptions) {
  const fmt = new Intl.DateTimeFormat(locale, opts ?? { month: "short", day: "numeric", year: "numeric" })
  if (range.from && range.to) return plainSpaces(fmt.formatRange(range.from, range.to))
  if (range.from) return `${plainSpaces(fmt.format(range.from))} – …`
  return ""
}

/** Raised pill showing the formatted range (Intl.formatRange) or a placeholder. */
function DateRangePickerTrigger({
  className,
  placeholder: placeholderProp,
  formatOptions,
  children,
  ...props
}: PopoverPrimitive.Trigger.Props & { placeholder?: string; formatOptions?: Intl.DateTimeFormatOptions }) {
  const { labels } = useLocale()
  const placeholder = placeholderProp ?? labels.pickDates
  const { range, locale } = useDateRangePicker()
  const text = formatRange(range, locale, formatOptions)
  return (
    <PopoverPrimitive.Trigger
      data-slot="date-range-picker-trigger"
      data-placeholder={!text || undefined}
      className={cn(
        "inline-flex h-8 min-w-56 cursor-pointer items-center gap-2 rounded-lg bg-card px-2.5 text-ui text-secondary-foreground shadow-raised transition-[box-shadow,background-color,scale] duration-150 ease-out outline-none hover:bg-accent hover:shadow-raised-hover focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-accent",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <CalendarIcon size={16} className="shrink-0 text-muted-foreground" />
          <span className={cn("truncate tabular-nums", !text && "text-muted-foreground")}>{text || placeholder}</span>
        </>
      )}
    </PopoverPrimitive.Trigger>
  )
}

function DateRangePickerContent({ className, align = "start", ...props }: React.ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent
      data-slot="date-range-picker-content"
      align={align}
      className={cn("w-auto gap-0 p-3", className)}
      {...props}
    />
  )
}

/* ─────────────────────────── calendar ─────────────────────────── */

const navButton =
  "inline-flex size-8 cursor-pointer items-center justify-center rounded-control text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-35"

/** Header (month names + prev/next) and one grid per visible month. */
function DateRangePickerCalendar({ className, ...props }: React.ComponentProps<"div">) {
  const { labels } = useLocale()
  const { month, numberOfMonths, setMonth, min, max, locale, direction } = useDateRangePicker()
  const reduce = useReducedMotion()
  const months = Array.from({ length: numberOfMonths }, (_, i) => addMonths(month, i))
  const canPrev = !min || monthIndex(month) > monthIndex(min)
  const canNext = !max || monthIndex(months[months.length - 1]) < monthIndex(max)
  const titleFmt = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" })
  const baseId = React.useId()

  return (
    <div data-slot="date-range-picker-calendar" className={cn("relative flex gap-5", className)} {...props}>
      <button
        type="button"
        aria-label={labels.previousMonth}
        disabled={!canPrev}
        onClick={() => setMonth(addMonths(month, -1))}
        className={cn(navButton, "absolute top-0 left-0 z-10")}
      >
        <ChevronLeftIcon className="rtl:-scale-x-100" size={16} />
      </button>
      <button
        type="button"
        aria-label={labels.nextMonth}
        disabled={!canNext}
        onClick={() => setMonth(addMonths(month, 1))}
        className={cn(navButton, "absolute top-0 right-0 z-10")}
      >
        <ChevronRightIcon className="rtl:-scale-x-100" size={16} />
      </button>
      {months.map((m, i) => (
        <div key={i} className="flex w-[17.5rem] flex-col gap-2 overflow-hidden">
          <div className="relative h-8 overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
              <motion.div
                key={isoKey(m)}
                id={`${baseId}-${i}`}
                aria-live="polite"
                custom={direction}
                initial={{ opacity: 0, y: reduce ? 0 : direction * 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : direction * -8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-8 items-center justify-center text-ui font-semibold"
              >
                {titleFmt.format(m)}
              </motion.div>
            </AnimatePresence>
          </div>
          <DateRangePickerGrid month={m} aria-labelledby={`${baseId}-${i}`} hideOutsideDays={numberOfMonths > 1} />
        </div>
      ))}
    </div>
  )
}

/** One month's day grid (role="grid", roving focus). */
function DateRangePickerGrid({
  month,
  hideOutsideDays = false,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { month: Date; hideOutsideDays?: boolean }) {
  const {
    range,
    hovered,
    setHovered,
    focused,
    setFocused,
    focusRequest,
    selectDate,
    isDisabled,
    weekStartsOn,
    locale,
    direction,
    month: firstVisible,
    numberOfMonths,
  } = useDateRangePicker()
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  // Keep exactly one tabbable day even after paging away from the focused date.
  const focusedVisible =
    monthIndex(focused) >= monthIndex(firstVisible) && monthIndex(focused) < monthIndex(firstVisible) + numberOfMonths
  const tabbable = focusedVisible ? focused : startOfMonth(firstVisible)

  const first = startOfMonth(month)
  const lead = (first.getDay() - weekStartsOn + 7) % 7
  const gridStart = addDays(first, -lead)
  const weeks = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d)))
  const today = startOfDay(new Date())

  const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: "short" })
  const weekdayNarrow = new Intl.DateTimeFormat(locale, { weekday: "narrow" })
  const labelFmt = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  const dayFmt = new Intl.DateTimeFormat(locale, { day: "numeric" })

  // Preview end while choosing the second date.
  const previewEnd =
    range.from && !range.to && hovered && dayNum(hovered) >= dayNum(range.from) && !isDisabled(hovered) ? hovered : undefined
  const lo = range.from ? dayNum(range.from) : undefined
  const hi = range.to ? dayNum(range.to) : previewEnd ? dayNum(previewEnd) : undefined

  React.useEffect(() => {
    if (!focusRequest.current || !sameMonth(focused, month)) return
    const btn = ref.current?.querySelector<HTMLButtonElement>(`button[data-date="${isoKey(focused)}"]`)
    if (btn) {
      focusRequest.current = false
      btn.focus({ preventScroll: true })
    }
  })

  const onKeyDown = (e: React.KeyboardEvent, d: Date) => {
    const dow = (d.getDay() - weekStartsOn + 7) % 7
    const map: Record<string, () => Date> = {
      ArrowLeft: () => addDays(d, -1),
      ArrowRight: () => addDays(d, 1),
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
    if (range.from && !range.to) setHovered(next)
  }

  return (
    <div
      ref={ref}
      role="grid"
      data-slot="date-range-picker-grid"
      className={cn("flex flex-col gap-0.5 text-ui", className)}
      onPointerLeave={() => setHovered(undefined)}
      {...props}
    >
      <div role="row" className="grid grid-cols-7">
        {weeks[0].map((d) => (
          <div
            key={d.getDay()}
            role="columnheader"
            aria-label={weekdayFmt.format(d)}
            className="flex h-7 items-center justify-center text-ui-sm font-medium text-muted-foreground"
          >
            {weekdayNarrow.format(d)}
          </div>
        ))}
      </div>
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <motion.div
          key={isoKey(first)}
          role="rowgroup"
          initial={{ opacity: 0, x: reduce ? 0 : direction * 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduce ? 0 : direction * -28 }}
          transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.6 }}
          className="flex flex-col gap-0.5"
        >
          {weeks.map((week, w) => (
            <div key={w} role="row" className="grid grid-cols-7">
              {week.map((d, c) => {
                const n = dayNum(d)
                const outside = !sameMonth(d, month)
                if (outside && hideOutsideDays) return <div key={c} role="gridcell" />
                const disabled = isDisabled(d)
                const inRange = lo !== undefined && hi !== undefined && n >= lo && n <= hi
                const isStart = lo === n
                const isEnd = hi === n
                const preview = !range.to
                const selectedEnd = isStart || (isEnd && !!range.to)
                const between = inRange && !isStart && !isEnd
                // Is the neighbouring cell blank (hidden outside day)? Then round the band there.
                const edgeL = c === 0 || (hideOutsideDays && !sameMonth(addDays(d, -1), month))
                const edgeR = c === 6 || (hideOutsideDays && !sameMonth(addDays(d, 1), month))
                return (
                  <div
                    key={c}
                    role="gridcell"
                    aria-selected={inRange && !!range.to ? true : undefined}
                    className="relative flex h-9 items-center justify-center"
                  >
                    {inRange && lo !== hi ? (
                      <span
                        aria-hidden
                        data-slot="date-range-picker-band"
                        className={cn(
                          "absolute inset-y-0.5",
                          preview ? "bg-primary/8" : "bg-primary/14",
                          isStart ? "left-1/2" : edgeL ? "left-0.5 rounded-l-full" : "left-0",
                          isEnd ? "right-1/2" : edgeR ? "right-0.5 rounded-r-full" : "right-0"
                        )}
                      />
                    ) : null}
                    <button
                      type="button"
                      data-date={isoKey(d)}
                      tabIndex={sameDay(d, tabbable) && !outside ? 0 : -1}
                      disabled={disabled}
                      aria-label={labelFmt.format(d)}
                      aria-current={sameDay(d, today) ? "date" : undefined}
                      aria-pressed={selectedEnd || undefined}
                      data-outside={outside || undefined}
                      data-selected={selectedEnd || undefined}
                      data-preview-end={(isEnd && preview && !isStart) || undefined}
                      data-in-range={between || undefined}
                      onClick={() => {
                        setFocused(d)
                        selectDate(d)
                      }}
                      onPointerEnter={() => range.from && !range.to && setHovered(d)}
                      onFocus={() => range.from && !range.to && setHovered(d)}
                      onKeyDown={(e) => onKeyDown(e, d)}
                      className={cn(
                        "relative z-10 inline-flex size-9 cursor-pointer items-center justify-center rounded-control tabular-nums outline-none transition-[background-color,color,box-shadow,scale] duration-150",
                        "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                        "data-outside:text-muted-foreground/60 data-in-range:hover:bg-primary/12",
                        "data-preview-end:shadow-[inset_0_0_0_1.5px_var(--primary)] data-preview-end:hover:bg-primary/12",
                        "data-selected:bg-primary data-selected:font-semibold data-selected:text-primary-foreground data-selected:shadow-primary data-selected:hover:bg-primary",
                        "disabled:cursor-not-allowed disabled:text-muted-foreground/40 disabled:line-through disabled:hover:bg-transparent",
                        "aria-[current=date]:not-data-selected:font-semibold aria-[current=date]:not-data-selected:text-primary-text",
                        "motion-reduce:transition-none"
                      )}
                    >
                      {dayFmt.format(d)}
                      {sameDay(d, today) ? (
                        <span
                          aria-hidden
                          className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-current opacity-70"
                        />
                      ) : null}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────── extras ─────────────────────────── */

/** "Mar 3 – 9, 2026 · 6 nights", or a prompt for the next click. */
function DateRangePickerSummary({
  className,
  unit,
  formatOptions,
  ...props
}: Omit<React.ComponentProps<"p">, "children"> & {
  /** Singular / plural for the length; pass `null` to hide it. */
  unit?: [string, string] | null
  formatOptions?: Intl.DateTimeFormatOptions
}) {
  const l10n = useLocale().labels

  const { range, locale } = useDateRangePicker()
  let text = l10n.selectAStartDate
  if (range.from && !range.to) text = l10n.selectAnEndDate
  if (range.from && range.to) {
    const n = daysBetween(range.from, range.to)
    text = formatRange(range, locale, formatOptions ?? { month: "short", day: "numeric" })
    if (unit !== null) text += ` · ${unit ? `${n} ${n === 1 ? unit[0] : unit[1]}` : l10n.nights(n)}`
  }
  return (
    <p
      aria-live="polite"
      data-slot="date-range-picker-summary"
      className={cn("text-ui text-muted-foreground tabular-nums", range.to && "text-foreground", className)}
      {...props}
    >
      {text}
    </p>
  )
}

function DateRangePickerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="date-range-picker-footer"
      className={cn("mt-3 flex items-center justify-between gap-3 border-t border-border pt-3", className)}
      {...props}
    />
  )
}

function DateRangePickerClear({ className, children: childrenProp, onClick, ...props }: React.ComponentProps<"button">) {
  const { labels } = useLocale()
  const children = childrenProp ?? labels.clear
  const { range, clear } = useDateRangePicker()
  return (
    <button
      type="button"
      data-slot="date-range-picker-clear"
      disabled={!range.from}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) clear()
      }}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center rounded-lg px-3 text-ui-sm font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function DateRangePickerPresets({ className, ...props }: React.ComponentProps<"div">) {
  const { labels } = useLocale()
  return (
    <div
      role="group"
      data-slot="date-range-picker-presets"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
      aria-label={props["aria-label"] ?? labels.presets}
    />
  )
}

/** Quick range. `range` may be a function so "Last 7 days" is computed at click time. */
function DateRangePickerPreset({
  range: presetRange,
  className,
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "value"> & { range: DateRange | (() => DateRange) }) {
  const { range, setRange, setMonth, setFocused, numberOfMonths } = useDateRangePicker()
  const resolved = typeof presetRange === "function" ? presetRange() : presetRange
  const active = sameDay(resolved.from, range.from) && sameDay(resolved.to, range.to)
  return (
    <button
      type="button"
      data-slot="date-range-picker-preset"
      aria-pressed={active}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        const r = typeof presetRange === "function" ? presetRange() : presetRange
        const next = { from: r.from && startOfDay(r.from), to: r.to && startOfDay(r.to) }
        setRange(next)
        const show = next.to && numberOfMonths > 1 ? addMonths(next.to, -(numberOfMonths - 1)) : next.from
        if (show) {
          setMonth(show)
          setFocused(next.from ?? show)
        }
      }}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center rounded-lg px-3 text-start text-ui-sm font-medium whitespace-nowrap text-muted-foreground transition-[background-color,color,box-shadow] outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        "aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-raised",
        className
      )}
      {...props}
    />
  )
}

export {
  DateRangePicker,
  DateRangePickerTrigger,
  DateRangePickerContent,
  DateRangePickerCalendar,
  DateRangePickerGrid,
  DateRangePickerSummary,
  DateRangePickerFooter,
  DateRangePickerClear,
  DateRangePickerPresets,
  DateRangePickerPreset,
  useDateRangePicker,
  addDays,
  addMonths,
  startOfDay,
}
export type { DateRange, DateRangePickerProps }
