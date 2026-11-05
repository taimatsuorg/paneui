"use client"

import * as React from "react"

import { BellIcon, ChartIcon, DownloadIcon, FileIcon, PlusIcon, ServerIcon, UsersIcon } from "@paneui/ui/icons"
import { Button } from "@paneui/ui/components/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@paneui/ui/components/card"
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@paneui/ui/components/page-header"
import { SegmentedControl, SegmentedControlItem } from "@paneui/ui/components/segmented-control"
import { StatCardDelta } from "@paneui/ui/components/stat-card"
import { useToast } from "@paneui/ui/components/toast"
import { TrendChart } from "@paneui/ui/components/trend-chart"
import { UsageMeter } from "@paneui/ui/components/usage-meter"

import { activity, billing, customers, kpis, revenue, revenueSeries, usageDaily, usageSeries, type Activity } from "../../lib/data"
import { AppLink, routes } from "../../lib/routes"

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const num = new Intl.NumberFormat("en-US")

export type KpiCell = { id: string; label: string; value: string; delta?: number; invert?: boolean; unit?: string; hint: string }

/**
 * Headline numbers in one card split by hairlines: label, figure, then how it moved.
 * Two columns on phones, one row from xl. Shared by Overview and Analytics.
 */
export function KpiStrip({ items, label }: { items: KpiCell[]; label: string }) {
  return (
    <section aria-label={label} className="overflow-hidden rounded-xl bg-card text-ui text-card-foreground shadow-raised">
      <dl className="grid grid-cols-2 xl:grid-cols-4">
        {items.map((k, i) => (
          <div
            key={k.id}
            className={[
              "flex min-w-0 flex-col gap-1 p-4",
              i % 2 === 1 ? "border-s border-border" : "",
              i >= 2 ? "border-t border-border xl:border-t-0" : "",
              i === 2 ? "xl:border-s" : "",
            ].join(" ")}
          >
            <dt className="truncate text-ui text-muted-foreground">{k.label}</dt>
            <dd className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-2xl font-semibold tracking-tight tabular-nums">{k.value}</span>
              {k.delta !== undefined && <StatCardDelta value={k.delta} invert={k.invert} unit={k.unit} />}
            </dd>
            <dd className="truncate text-ui-sm text-muted-foreground">{k.hint}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** `/dashboard`: the month at a glance, with what needs a hand (seats, usage) beside the revenue it drives. */
export function OverviewPage() {
  const toast = useToast()
  const [chart, setChart] = React.useState<"area" | "bar">("area")
  const last30 = usageDaily.slice(-30)

  return (
    <>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Overview</PageHeaderTitle>
          <PageHeaderDescription>Revenue, usage and activity across 1,584 workspaces.</PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button variant="secondary" size="sm" onClick={() => toast.add({ title: "Export started", description: "We'll email you the CSV.", type: "success" })}>
            <DownloadIcon data-icon="inline-start" />
            Export
          </Button>
          <Button size="sm" nativeButton={false} render={<AppLink href={routes.customers} />}>
            <PlusIcon data-icon="inline-start" />
            Add customer
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <KpiStrip
        label="Key metrics"
        items={kpis.map((k) => ({
          id: k.id,
          label: k.label,
          value: new Intl.NumberFormat("en-US", k.format).format(k.value),
          delta: k.delta,
          invert: k.invert,
          unit: k.format.style === "percent" ? " pts" : "%",
          hint: k.hint,
        }))}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>MRR by plan, last 12 months</CardDescription>
            <CardAction>
              <SegmentedControl size="sm" value={chart} onValueChange={(v) => setChart(v as "area" | "bar")} aria-label="Chart type">
                <SegmentedControlItem value="area">Area</SegmentedControlItem>
                <SegmentedControlItem value="bar">Bars</SegmentedControlItem>
              </SegmentedControl>
            </CardAction>
          </CardHeader>
          <CardContent>
            <TrendChart series={revenueSeries} data={revenue} variant={chart} stacked height={240} formatValue={(v) => usd.format(v)} label="Revenue by plan" />
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Plan usage</CardTitle>
            <CardDescription>
              {billing.plan} · renews {billing.renews}
            </CardDescription>
            <CardAction>
              <Button variant="ghost" size="xs" nativeButton={false} render={<AppLink href={routes.settingsBilling} />}>
                Manage
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {billing.usage.map((u) => (
              <UsageMeter key={u.id} label={u.label} value={u.value} max={u.max} unit={u.unit} description={u.description} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader>
            <CardTitle>Agent runs</CardTitle>
            <CardDescription>Last 30 days, by kind</CardDescription>
            <CardAction>
              <Button variant="ghost" size="xs" nativeButton={false} render={<AppLink href={routes.analytics} />}>
                Open analytics
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <TrendChart series={usageSeries} data={last30} variant="bar" stacked height={200} formatValue={(v) => num.format(v)} label="Agent runs by kind" />
          </CardContent>
        </Card>
        <ActivityCard />
      </div>

      <TopCustomers />
    </>
  )
}

const activityIcon: Record<Activity["kind"], React.ReactNode> = {
  upgrade: <ChartIcon />,
  invoice: <FileIcon />,
  member: <UsersIcon />,
  alert: <BellIcon />,
  deploy: <ServerIcon />,
}

/** Newest first. One grey glyph per kind; only the usage alert carries colour, since it asks for something. */
function ActivityCard() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Across all workspaces</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col gap-4">
          {activity.map((a) => (
            <li key={a.id} className="flex gap-3">
              <span aria-hidden className={`mt-0.5 shrink-0 [&_svg]:size-4 ${a.kind === "alert" ? "text-warning-text" : "text-muted-foreground"}`}>
                {activityIcon[a.kind]}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-medium">{a.title}</span>
                  <span className="shrink-0 text-ui-sm text-muted-foreground tabular-nums">{a.time}</span>
                </div>
                <span className="truncate text-ui-sm text-muted-foreground">{a.detail}</span>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

/** The five largest accounts as a ruled table: identity on the left, seats and MRR right-aligned. */
function TopCustomers() {
  const top = [...customers].sort((a, b) => b.mrr - a.mrr).slice(0, 5)
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Top customers</CardTitle>
        <CardDescription>By monthly recurring revenue</CardDescription>
        <CardAction>
          <Button variant="ghost" size="xs" nativeButton={false} render={<AppLink href={routes.customers} />}>
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <table className="w-full text-ui">
          <thead>
            <tr className="text-ui-sm text-muted-foreground">
              <th scope="col" className="pb-2 text-start font-normal">
                Company
              </th>
              <th scope="col" className="pb-2 text-start font-normal max-sm:hidden">
                Plan
              </th>
              <th scope="col" className="pb-2 text-end font-normal max-sm:hidden">
                Seats
              </th>
              <th scope="col" className="pb-2 text-end font-normal">
                MRR
              </th>
            </tr>
          </thead>
          <tbody>
            {top.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="py-2.5">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{c.company}</span>
                    <span className="truncate text-ui-sm text-muted-foreground">
                      {c.name}
                      <span className="sm:hidden"> · {c.seats} seats</span>
                    </span>
                  </span>
                </td>
                <td className="py-2.5 text-muted-foreground max-sm:hidden">{c.plan}</td>
                <td className="py-2.5 text-end tabular-nums max-sm:hidden">{c.seats}</td>
                <td className="py-2.5 text-end font-medium tabular-nums">{usd.format(c.mrr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
