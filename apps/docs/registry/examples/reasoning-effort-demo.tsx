"use client"

import * as React from "react"

import { ReasoningEffort } from "@paneui/ui/components/reasoning-effort"

export default function ReasoningEffortDemo() {
  const [effort, setEffort] = React.useState("medium")
  return <ReasoningEffort model="Pro 3" value={effort} onValueChange={setEffort} />
}
