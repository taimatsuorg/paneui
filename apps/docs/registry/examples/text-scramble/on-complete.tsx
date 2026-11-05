"use client"

import * as React from "react"

import { CheckCircleIcon } from "@paneui/ui/icons"
import { Button } from "@paneui/ui/components/button"
import { TextScramble } from "@paneui/ui/components/text-scramble"

export default function TextScrambleOnComplete() {
  const [decoded, setDecoded] = React.useState(false)
  const [value, setValue] = React.useState("••••••••••••")
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 font-mono text-sm shadow-well">
        <TextScramble value={value} onComplete={() => setDecoded(value !== "••••••••••••")} />
        {decoded && <CheckCircleIcon className="size-4 text-success-text" />}
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          setDecoded(false)
          setValue("sk-live-4f9a")
        }}
      >
        Reveal key
      </Button>
    </div>
  )
}
