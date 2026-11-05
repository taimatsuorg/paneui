"use client"

import * as React from "react"

import { Button } from "@paneui/ui/components/button"
import { ShaderBackground } from "@paneui/ui/components/shader-background"

export default function ShaderBackgroundPaused() {
  const [paused, setPaused] = React.useState(false)
  return (
    <ShaderBackground
      variant="warp"
      speed={1.2}
      paused={paused}
      className="flex h-56 w-full max-w-lg items-end justify-between gap-3 rounded-3xl p-6 shadow-surface"
    >
      <p className="rounded-control-sm bg-card/80 px-3 py-1 text-xs font-medium shadow-chip backdrop-blur-md">
        speed 1.2 {paused ? "· paused" : ""}
      </p>
      <Button size="sm" variant="secondary" onClick={() => setPaused((p) => !p)}>
        {paused ? "Play" : "Pause"}
      </Button>
    </ShaderBackground>
  )
}
