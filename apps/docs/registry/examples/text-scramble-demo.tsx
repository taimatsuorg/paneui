"use client"

import * as React from "react"

import { Button } from "@paneui/ui/components/button"
import { TextScramble } from "@paneui/ui/components/text-scramble"

const STATUSES = ["SEARCHING", "COMPARING", "BOOKED", "CONFIRMED"]

export default function TextScrambleDemo() {
  const [i, setI] = React.useState(0)
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="rounded-2xl bg-muted px-4 py-3 font-mono text-lg tracking-widest shadow-well">
        STATUS: <TextScramble value={STATUSES[i]} className="text-primary-text" />
      </div>
      <Button size="sm" onClick={() => setI((n) => (n + 1) % STATUSES.length)}>
        Next status
      </Button>
    </div>
  )
}
