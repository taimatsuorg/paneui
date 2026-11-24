"use client"

import * as React from "react"

import { Mermaid, type MermaidThemeName } from "@paneui/ui/components/mermaid"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paneui/ui/components/select"

const THEME_OPTIONS: { value: MermaidThemeName; label: string }[] = [
  { value: "auto", label: "Auto (PaneUI theme)" },
  { value: "zinc-light", label: "Zinc Light" },
  { value: "zinc-dark", label: "Zinc Dark" },
  { value: "tokyo-night", label: "Tokyo Night" },
  { value: "catppuccin-mocha", label: "Catppuccin Mocha" },
  { value: "nord", label: "Nord" },
  { value: "dracula", label: "Dracula" },
  { value: "github-light", label: "GitHub Light" },
  { value: "github-dark", label: "GitHub Dark" },
  { value: "solarized-dark", label: "Solarized Dark" },
  { value: "one-dark", label: "One Dark" },
]

const chart = `sequenceDiagram
  Client->>Edge: GET /api/status
  Edge->>Cache: Lookup key
  Cache-->>Edge: Cached payload
  Edge-->>Client: 200 OK`

export default function MermaidThemesExample() {
  const [theme, setTheme] = React.useState<MermaidThemeName>("auto")

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <div className="w-52">
        <Select items={THEME_OPTIONS} value={theme} onValueChange={(value) => setTheme(value as MermaidThemeName)}>
          <SelectTrigger size="sm" aria-label="Mermaid theme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEME_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Mermaid chart={chart} theme={theme} className="w-full" />
    </div>
  )
}
