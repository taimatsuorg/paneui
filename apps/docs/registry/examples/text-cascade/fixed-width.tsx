"use client"

import * as React from "react"

import { Button } from "@paneui/ui/components/button"
import { TextCascade } from "@paneui/ui/components/text-cascade"

const PLANS = ["Free", "Pro", "Business"]

export default function TextCascadeFixedWidth() {
  const [i, setI] = React.useState(0)
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-col gap-2 text-sm">
        <p>
          You are on the <TextCascade text={PLANS[i]} className="font-medium text-primary-text" /> plan, billed monthly.
        </p>
        <p>
          You are on the <TextCascade text={PLANS[i]} animateWidth={false} className="font-medium text-primary-text" /> plan,
          billed monthly.
        </p>
      </div>
      <Button size="sm" variant="secondary" onClick={() => setI((n) => (n + 1) % PLANS.length)}>
        Switch plan
      </Button>
    </div>
  )
}
