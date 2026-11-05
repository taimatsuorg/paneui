"use client"

import * as React from "react"

import { DownloadIcon } from "@paneui/ui/icons"
import { BarList } from "@paneui/ui/components/bar-list"
import { Button } from "@paneui/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@paneui/ui/components/card"
import {
  addDays,
  DateRangePicker,
  DateRangePickerCalendar,
  DateRangePickerContent,
  DateRangePickerFooter,
  DateRangePickerPreset,
  DateRangePickerPresets,
  DateRangePickerSummary,
  DateRangePickerTrigger,
  type DateRange,
} from "@paneui/ui/components/date-range-picker"
import { DonutChart } from "@paneui/ui/components/donut-chart"
import { EmptyState, EmptyStateDescription, EmptyStateTitle } from "@paneui/ui/components/empty-state"
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@paneui/ui/components/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paneui/ui/components/select"
import { useToast } from "@paneui/ui/components/toast"
import { TrendChart, type TrendPoint } from "@paneui/ui/components/trend-chart"

import { KpiStrip } from "./overview-page"
import { planMix, referrers, signupsDaily, TODAY, topPages, usageDaily, usageSeries } from "../../lib/data"

const num = new Intl.NumberFormat("en-US")
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
const weekLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })

const PLAN_SHARE: Record<string, number> = { all: 1, solo: 0.12, team: 0.61, enterprise: 0.27 }
const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

type Point = TrendPoint & { date: Date }

/** Daily points inside the range, rolled up to weeks past 60 days so bars stay readable. */
function bucket(points: readonly Point[], range: DateRange, scale: number): TrendPoint[] {
  if (!range.from || !range.to) return []
  const from = day(range.from)
  const to = day(range.to)
  const inRange = points.filter((p) => day(p.date) >= from && day(p.date) <= to)
  const scaled = inRange.map((p) => ({
    label: p.label,
    date: p.date,
    values: Object.fromEntries(Object.entries(p.values).map(([k, v]) => [k, Math.round(v * scale)])),
  }))
  if (scaled.length <= 60) return scaled
  const weeks: TrendPoint[] = []
  for (let i = 0; i < scaled.length; i += 7) {
    const chunk = scaled.slice(i, i + 7)
    const values: Record<string, number> = {}
    for (const p of chunk) for (const [k, v] of Object.entries(p.values)) values[k] = (values[k] ?? 0) + v
    weeks.push({ label: `Wk ${weekLabel.format(chunk[0].date)}`, values })
  }
  return weeks
}

const total = (pts: readonly TrendPoint[]) => pts.reduce((s, p) => s + Object.values(p.values).reduce((a, b) => a + b, 0), 0)

/** `/dashboard/analytics` */
export function AnalyticsPage() {
  const toast = useToast()
  const first = usageDaily[0].date
  const [range, setRange] = React.useState<DateRange>({ from: addDays(TODAY, -29), to: TODAY })
  const [plan, setPlan] = React.useState("all")
  const scale = PLAN_SHARE[plan] ?? 1

  const usage = React.useMemo(() => bucket(usageDaily, range, scale), [range, scale])
  const signups = React.useMemo(() => bucket(signupsDaily, range, scale), [range, scale])
  const days = range.from && range.to ? Math.round((day(range.to) - day(range.from)) / 864e5) + 1 : 0
  const previous = React.useMemo<DateRange>(
    () => (range.from && range.to ? { from: addDays(range.from, -days), to: addDays(range.from, -1) } : {}),
    [range, days]
  )
  const runs = total(usage)
  const prevRuns = total(bucket(usageDaily, previous, scale))
  const newSignups = total(signups)
  const prevSignups = total(bucket(signupsDaily, previous, scale))
  const change = (a: number, b: number) => (b > 0 ? ((a - b) / b) * 100 : 0)
  const hasPrevious = prevRuns > 0

  const preset = (n: number) => () => ({ from: addDays(TODAY, -(n - 1)), to: TODAY })

  return (
    <>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Analytics</PageHeaderTitle>
          <PageHeaderDescription>Agent runs, sign-ups and traffic for the selected period.</PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Select value={plan} onValueChange={(v) => setPlan(String(v))}>
            <SelectTrigger size="sm" aria-label="Plan" className="w-36">
              <SelectValue>{(v: string) => ({ all: "All plans", solo: "Solo", team: "Team", enterprise: "Enterprise" })[v] ?? v}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              <SelectItem value="solo">Solo</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <DateRangePicker value={range} onValueChange={setRange} numberOfMonths={2} min={first} max={TODAY}>
            <DateRangePickerTrigger placeholder="Pick a range" className="w-60" />
            <DateRangePickerContent>
              <div className="flex gap-3">
                <div className="hidden border-r border-border pr-3 sm:block">
                  <DateRangePickerPresets>
                    <DateRangePickerPreset range={preset(7)}>Last 7 days</DateRangePickerPreset>
                    <DateRangePickerPreset range={preset(30)}>Last 30 days</DateRangePickerPreset>
                    <DateRangePickerPreset range={preset(90)}>Last 90 days</DateRangePickerPreset>
                    <DateRangePickerPreset range={preset(180)}>Last 6 months</DateRangePickerPreset>
                  </DateRangePickerPresets>
                </div>
                <DateRangePickerCalendar />
              </div>
              <DateRangePickerFooter>
                <DateRangePickerSummary />
              </DateRangePickerFooter>
            </DateRangePickerContent>
          </DateRangePicker>
          <Button variant="secondary" size="sm" onClick={() => toast.add({ title: "Report exported", type: "success" })}>
            <DownloadIcon data-icon="inline-start" />
            Export
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <KpiStrip
        label="Summary"
        items={[
          metric("runs", "Agent runs", compact.format(runs), hasPrevious ? change(runs, prevRuns) : undefined, `${days} days`),
          metric("per-day", "Runs per day", num.format(days ? Math.round(runs / days) : 0), hasPrevious ? change(runs, prevRuns) : undefined, "Average"),
          metric("signups", "Sign-ups", num.format(newSignups), hasPrevious ? change(newSignups, prevSignups) : undefined, "New workspaces"),
          { ...metric("conversion", "Trial conversion", "18.4%", 1.2, "Trials that paid"), unit: " pts" },
        ]}
      />

      {usage.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState variant="outline">
              <EmptyStateTitle>Pick a date range</EmptyStateTitle>
              <EmptyStateDescription>Choose a start and end date to load the charts.</EmptyStateDescription>
            </EmptyState>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Agent runs</CardTitle>
              <CardDescription>{usage.length > 60 || days > 60 ? "Weekly totals by kind" : "Daily runs by kind"}</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart series={usageSeries} data={usage} variant="area" stacked height={280} formatValue={(v) => num.format(v)} label="Agent runs by kind" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="min-w-0 xl:col-span-2">
              <CardHeader>
                <CardTitle>Sign-ups</CardTitle>
                <CardDescription>New workspaces created</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendChart
                  series={[{ id: "signups", label: "Sign-ups", color: "var(--chart-3)" }]}
                  data={signups}
                  variant="bar"
                  height={300}
                  formatValue={(v) => num.format(v)}
                  label="Sign-ups"
                />
              </CardContent>
            </Card>
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle>Plan mix</CardTitle>
                <CardDescription>Active workspaces by plan</CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart segments={planMix} totalLabel="Workspaces" label="Workspaces by plan" legendPosition="bottom" maxSize={200} formatValue={(v) => num.format(v)} />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Top pages</CardTitle>
            <CardDescription>Marketing site visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList items={topPages.map((p) => ({ ...p, value: Math.round(p.value * scale) }))} labels={["Page", "Visitors"]} formatValue={(v) => num.format(v)} />
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Referrers</CardTitle>
            <CardDescription>Where sign-ups came from</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList items={referrers.map((p) => ({ ...p, value: Math.round(p.value * scale) }))} labels={["Source", "Visitors"]} color={2} formatValue={(v) => num.format(v)} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

/** A range figure: the hint names the comparison only when there is a previous period to compare with. */
function metric(id: string, label: string, value: string, delta: number | undefined, hint: string) {
  return { id, label, value, delta, hint: delta !== undefined ? `${hint} · vs. previous period` : hint }
}
