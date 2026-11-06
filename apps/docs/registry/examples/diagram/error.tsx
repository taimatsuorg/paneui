"use client"

import { Diagram } from "@paneui/ui/components/diagram"

const source = `Draft -> Review
Review Publish`

// A renderer that rejects the source, as a real one does on a syntax error.
async function render(text: string): Promise<string> {
  const bad = text.split("\n").findIndex((line) => !line.includes("->"))
  throw new Error(`Line ${bad + 1}: expected "->" between two steps.`)
}

export default function DiagramError() {
  return <Diagram source={source} render={render} className="w-full max-w-lg" />
}
