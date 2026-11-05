"use client"

import * as React from "react"

import { ArrowDownIcon, ArrowUpIcon } from "@paneui/ui/icons"
import { Button } from "@paneui/ui/components/button"
import { DigitSwap } from "@paneui/ui/components/digit-swap"

export default function DigitSwapAutoDirection() {
  const [price, setPrice] = React.useState(184.32)
  const [last, setLast] = React.useState(0)

  function move(delta: number) {
    setLast(delta)
    setPrice((p) => Math.max(1, Math.round((p + delta) * 100) / 100))
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-muted-foreground">ACME</span>
        <DigitSwap value={`$${price.toFixed(2)}`} className="text-3xl font-semibold tracking-tight" />
        <span className={last >= 0 ? "text-sm font-medium text-success-text tabular-nums" : "text-sm font-medium text-destructive-text tabular-nums"}>
          {last >= 0 ? "+" : "−"}
          {Math.abs(last).toFixed(2)}
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => move(-2.47)}>
          <ArrowDownIcon data-icon="inline-start" />
          Drop
        </Button>
        <Button variant="secondary" size="sm" onClick={() => move(3.18)}>
          <ArrowUpIcon data-icon="inline-start" />
          Rise
        </Button>
      </div>
    </div>
  )
}
