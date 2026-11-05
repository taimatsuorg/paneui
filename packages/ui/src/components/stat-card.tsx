"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"

import { ArrowDownIcon, ArrowUpIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Badge } from "@paneui/ui/components/badge"
import { Sparkline, type SparklineProps } from "@paneui/ui/components/sparkline"

/*
 * One KPI: a label, a big number, how it moved and a sparkline of the trend.
 *
 *   <StatCard>
 *     <StatCardHeader>
 *       <StatCardLabel>MRR</StatCardLabel>
 *       <StatCardDelta value={12.4} />
 *     </StatCardHeader>
 *     <StatCardValue>$48,210</StatCardValue>
 *     <StatCardFooter>
 *       <StatCardHint>vs. last 30 days</StatCardHint>
 *       <StatCardSparkline values={trend} />
 *     </StatCardFooter>
 *   </StatCard>
 *
 * The delta decides its own tone: up is good unless `invert` (churn, latency).
 * The sparkline follows the delta's tone unless you colour it yourself.
 */

type Tone = "positive" | "negative" | "neutral"
const StatCardContext = React.createContext<{ tone: Tone; setTone: (t: Tone) => void }>({ tone: "neutral", setTone: () => {} })

function StatCard({ className, children, ...props }: React.ComponentProps<"div">) {
  const [tone, setTone] = React.useState<Tone>("neutral")
  const ctx = React.useMemo(() => ({ tone, setTone }), [tone])
  return (
    <StatCardContext.Provider value={ctx}>
      <div
        data-slot="stat-card"
        data-tone={tone}
        className={cn("flex min-w-0 flex-col gap-2 rounded-xl bg-card p-4 text-ui text-card-foreground shadow-raised", className)}
        {...props}
      >
        {children}
      </div>
    </StatCardContext.Provider>
  )
}

function StatCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stat-card-header" className={cn("flex min-h-6 items-center justify-between gap-3", className)} {...props} />
}

function StatCardLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stat-card-label" className={cn("flex min-w-0 items-center gap-1.5 truncate text-ui text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0", className)} {...props} />
}

function StatCardValue({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-card-value"
      className={cn("truncate text-2xl leading-tight font-semibold tracking-tight tabular-nums", className)}
      {...props}
    />
  )
}

type StatCardDeltaProps = Omit<React.ComponentProps<typeof Badge>, "children" | "variant"> & {
  /** Change as a number; its sign sets the arrow. */
  value: number
  /** Unit after the number. Default "%". */
  unit?: string
  /** A rise is bad (churn, errors, latency). */
  invert?: boolean
  /** Decimal places. Default 1. */
  precision?: number
}

function StatCardDelta({ value, unit = "%", invert = false, precision = 1, className, ...props }: StatCardDeltaProps) {
  const l10n = useLocale().labels

  const { setTone } = React.useContext(StatCardContext)
  const tone: Tone = value === 0 ? "neutral" : value > 0 !== invert ? "positive" : "negative"
  React.useLayoutEffect(() => setTone(tone), [tone, setTone])
  const Arrow = value >= 0 ? ArrowUpIcon : ArrowDownIcon
  const variant = tone === "positive" ? "success" : tone === "negative" ? "destructive" : "outline"
  return (
    <Badge
      data-slot="stat-card-delta"
      size="sm"
      variant={variant}
      className={cn("tabular-nums", className)}
      {...props}
      aria-label={props["aria-label"] ?? `${value >= 0 ? l10n.up : l10n.down} ${Math.abs(value).toFixed(precision)}${unit}`}
    >
      {value !== 0 && <Arrow />}
      {Math.abs(value).toFixed(precision)}
      {unit}
    </Badge>
  )
}

function StatCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stat-card-footer" className={cn("flex min-w-0 items-end justify-between gap-4", className)} {...props} />
}

function StatCardHint({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stat-card-hint" className={cn("min-w-0 truncate text-ui-sm text-muted-foreground", className)} {...props} />
}

/** Sparkline tinted by the card's delta (success / destructive / muted). Pass a text colour to override. */
function StatCardSparkline({ className, ...props }: SparklineProps) {
  const { tone } = React.useContext(StatCardContext)
  return (
    <Sparkline
      data-slot="stat-card-sparkline"
      className={cn(
        "h-9 w-24 shrink-0",
        tone === "positive" ? "text-success-text" : tone === "negative" ? "text-destructive-text" : "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { StatCard, StatCardHeader, StatCardLabel, StatCardValue, StatCardDelta, StatCardFooter, StatCardHint, StatCardSparkline }
export type { StatCardDeltaProps }
