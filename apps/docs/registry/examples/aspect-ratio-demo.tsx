"use client"

import * as React from "react"

import { AspectRatio } from "@paneui/ui/components/aspect-ratio"

const ratios = [
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "3:4", value: 3 / 4 },
]

export default function AspectRatioDemo() {
  const [ratio, setRatio] = React.useState(ratios[0])

  return (
    <div className="flex w-full max-w-72 flex-col items-center gap-4">
      <div className="flex h-72 w-full items-center justify-center">
        <div className="w-full" style={{ maxWidth: `min(100%, ${18 * ratio.value}rem)` }}>
          <AspectRatio ratio={ratio.value} aria-label={`Preview at ${ratio.label}`}>
            <div className="absolute inset-0 bg-linear-to-br from-primary/70 via-primary/30 to-success/40" />
          </AspectRatio>
        </div>
      </div>
      <div role="radiogroup" aria-label="Aspect ratio" className="flex gap-1 rounded-full bg-muted p-1 shadow-well">
        {ratios.map((r) => (
          <button
            key={r.label}
            type="button"
            role="radio"
            aria-checked={r.label === ratio.label}
            onClick={() => setRatio(r)}
            className="h-7 cursor-pointer rounded-full px-3 text-xs font-medium text-muted-foreground transition-[background-color,box-shadow,color] outline-none focus-visible:ring-2 focus-visible:ring-ring aria-checked:bg-secondary aria-checked:text-foreground aria-checked:shadow-raised"
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}
