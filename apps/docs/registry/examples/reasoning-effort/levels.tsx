"use client"

import * as React from "react"

import { ReasoningEffort } from "@paneui/ui/components/reasoning-effort"

const LEVELS = [
  { value: "off", label: "Off" },
  { value: "minimal", label: "Minimal" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

export default function ReasoningEffortLevels() {
  const [effort, setEffort] = React.useState("low")
  const level = LEVELS.find((l) => l.value === effort)
  return (
    <div className="flex flex-col items-center gap-2">
      <ReasoningEffort levels={LEVELS} value={effort} onValueChange={setEffort} className="w-64" />
      <p className="text-ui-sm text-muted-foreground">Thinking: {level?.label}</p>
    </div>
  )
}
