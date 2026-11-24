"use client"

import * as React from "react"

import { Mermaid } from "@paneui/ui/components/mermaid"
import { Tabs, TabsList, TabsTab } from "@paneui/ui/components/tabs"

const chart = `graph LR
  Build --> Test --> Publish`

export default function MermaidAsciiExample() {
  const [format, setFormat] = React.useState<"unicode" | "ascii">("unicode")

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <Tabs value={format} onValueChange={(value) => setFormat(value as "unicode" | "ascii")}>
        <TabsList>
          <TabsTab value="unicode">Unicode</TabsTab>
          <TabsTab value="ascii">ASCII</TabsTab>
        </TabsList>
      </Tabs>
      <Mermaid
        chart={chart}
        format={format}
        caption={format === "unicode" ? "Box-drawing characters for terminals." : "Plain ASCII for maximum compatibility."}
        className="w-full"
      />
    </div>
  )
}
