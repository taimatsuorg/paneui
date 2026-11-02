"use client"

import * as React from "react"

import { Treemap, type TreemapNode } from "@paneui/ui/components/treemap"

const DATA: TreemapNode[] = [
  { id: "tokyo", label: "Tokyo", value: 9 },
  { id: "osaka", label: "Osaka", value: 4 },
  { id: "kyoto", label: "Kyoto", value: 3 },
  { id: "sapporo", label: "Sapporo", value: 2 },
  { id: "fukuoka", label: "Fukuoka", value: 2 },
]

const nights = (v: number) => `${v} nights`

export default function TreemapControlled() {
  const [active, setActive] = React.useState<string | null>("kyoto")
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {DATA.map((d) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={active === d.id}
            onClick={() => setActive(active === d.id ? null : d.id)}
            className="rounded-control bg-muted px-3 py-1 text-xs font-medium text-muted-foreground shadow-chip transition-[color,background-color] duration-150 ease-out hover:text-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            {d.label}
          </button>
        ))}
      </div>
      <Treemap data={DATA} label="Nights by city" formatValue={nights} activeId={active} onActiveChange={setActive} height={240} showLegend={false} />
    </div>
  )
}
