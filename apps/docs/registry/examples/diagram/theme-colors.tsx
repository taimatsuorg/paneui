"use client"

import * as React from "react"

import { resolveThemeColors } from "@paneui/ui/components/diagram"

const tokens = ["background", "foreground", "primary", "border", "chart-1", "chart-2"] as const

export default function DiagramThemeColors() {
  const [colors, setColors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    const update = () => setColors(resolveThemeColors(tokens))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  return (
    <ul className="grid w-full max-w-xs gap-1.5">
      {tokens.map((token) => (
        <li key={token} className="flex items-center gap-2 text-ui">
          <span
            aria-hidden
            className="size-4 rounded-sm bg-(--swatch) shadow-chip"
            style={{ "--swatch": colors[token] } as React.CSSProperties}
          />
          <span className="flex-1">{token}</span>
          <code className="font-mono text-ui-sm text-muted-foreground tabular-nums">{colors[token]}</code>
        </li>
      ))}
    </ul>
  )
}
