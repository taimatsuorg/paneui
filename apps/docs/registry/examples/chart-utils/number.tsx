"use client"

import * as React from "react"

import { Button } from "@paneui/ui/components/button"
import { ChartNumber, formatCompact, formatPercent } from "@paneui/ui/components/chart-utils"

const RANGES = [
  { label: "7 days", revenue: 48200, growth: 0.031 },
  { label: "30 days", revenue: 212900, growth: 0.084 },
  { label: "12 months", revenue: 2480000, growth: 0.226 },
]

export default function ChartUtilsNumber() {
  const [range, setRange] = React.useState(1)
  const r = RANGES[range]
  return (
    <div className="flex w-full max-w-xs flex-col gap-4 rounded-xl bg-card p-5 shadow-raised">
      <div className="flex gap-1">
        {RANGES.map((x, i) => (
          <Button key={x.label} size="xs" variant={i === range ? "secondary" : "ghost"} onClick={() => setRange(i)}>
            {x.label}
          </Button>
        ))}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="text-2xl font-semibold tracking-tight">
            <ChartNumber value={r.revenue} format={(v) => `$${formatCompact(v)}`} />
          </p>
        </div>
        <p className="text-sm font-medium text-success-text">
          <ChartNumber value={r.growth} format={(v) => `+${formatPercent(v)}`} />
        </p>
      </div>
    </div>
  )
}
