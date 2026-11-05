"use client"

import * as React from "react"

import { NumberTicker } from "@paneui/ui/components/number-ticker"

export default function NumberTickerLive() {
  const [count, setCount] = React.useState(1207)
  React.useEffect(() => {
    const id = setInterval(() => setCount((c) => c + 1 + Math.floor(Math.random() * 3)), 1600)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-raised">
      <span className="size-2 rounded-full bg-success" />
      <NumberTicker
        value={count}
        locale="en-US"
        startOnView={false}
        className="text-xl font-semibold"
        digitClassName="text-primary-text"
      />
      <span className="text-sm text-muted-foreground">people online</span>
    </div>
  )
}
