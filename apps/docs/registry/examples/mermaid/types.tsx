"use client"

import * as React from "react"

import { Mermaid } from "@paneui/ui/components/mermaid"
import { Tabs, TabsList, TabsTab } from "@paneui/ui/components/tabs"

const CHARTS = {
  flowchart: {
    label: "Flowchart",
    caption: "Directed pipeline rendered with theme tokens.",
    chart: `flowchart TD
  Client[Client App] --> Gateway[API Gateway]
  Gateway --> Auth{Valid Token?}
  Auth -->|Yes| Handler[Route Handler]
  Auth -->|No| Unauthorized[401 Error]`,
  },
  sequence: {
    label: "Sequence",
    caption: "Message exchanges between participants.",
    chart: `sequenceDiagram
  User->>Client: Submit prompt
  Client->>Agent: Stream request
  Agent-->>Client: Token chunk
  Agent-->>Client: Done`,
  },
  state: {
    label: "State",
    caption: "Task lifecycle transitions.",
    chart: `stateDiagram-v2
  [*] --> Queued
  Queued --> Running: dispatch
  Running --> Complete: finish
  Running --> Failed: timeout
  Complete --> [*]`,
  },
  class: {
    label: "Class",
    caption: "Entities, fields, and inheritance relationships.",
    chart: `classDiagram
  class Renderer {
    +String id
    +render(source) String
  }
  class SvgRenderer
  class AsciiRenderer
  Renderer <|-- SvgRenderer
  Renderer <|-- AsciiRenderer`,
  },
  er: {
    label: "ER",
    caption: "Tables and cardinality links.",
    chart: `erDiagram
  WORKSPACE ||--o{ PROJECT : contains
  PROJECT ||--|{ TASK : tracks
  USER ||--o{ TASK : owns`,
  },
  xychart: {
    label: "XY Chart",
    caption: "Hover bars and points to inspect exact values.",
    chart: `xychart-beta
  title "Weekly Throughput"
  x-axis [Mon, Tue, Wed, Thu, Fri]
  y-axis "Tasks" 0 --> 120
  bar [42, 68, 54, 92, 86]
  line [48, 62, 64, 88, 96]`,
  },
} as const

type ChartKind = keyof typeof CHARTS

export default function MermaidTypesExample() {
  const [kind, setKind] = React.useState<ChartKind>("flowchart")
  const active = CHARTS[kind]

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <Tabs value={kind} onValueChange={(value) => setKind(value as ChartKind)}>
        <TabsList className="flex-wrap">
          {(Object.keys(CHARTS) as ChartKind[]).map((key) => (
            <TabsTab key={key} value={key}>
              {CHARTS[key].label}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
      <Mermaid
        chart={active.chart}
        caption={active.caption}
        interactive={kind === "xychart"}
        className="w-full"
      />
    </div>
  )
}
