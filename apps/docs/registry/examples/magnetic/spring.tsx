"use client"

import * as React from "react"

import { Magnetic } from "@paneui/ui/components/magnetic"
import { Switch } from "@paneui/ui/components/switch"

export default function MagneticSpring() {
  const [enabled, setEnabled] = React.useState(true)
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <Magnetic disabled={!enabled} strength={0.4} spring={{ stiffness: 500, damping: 30, mass: 0.5 }}>
            <span className="rounded-control bg-secondary px-4 py-2 text-sm font-medium shadow-raised">Tight</span>
          </Magnetic>
          <span className="text-xs text-muted-foreground">500 / 30</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Magnetic disabled={!enabled} strength={0.4} spring={{ stiffness: 90, damping: 10, mass: 0.6 }}>
            <span className="rounded-control bg-secondary px-4 py-2 text-sm font-medium shadow-raised">Loose</span>
          </Magnetic>
          <span className="text-xs text-muted-foreground">90 / 10</span>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Switch checked={enabled} onCheckedChange={setEnabled} />
        Magnetic effect
      </label>
    </div>
  )
}
