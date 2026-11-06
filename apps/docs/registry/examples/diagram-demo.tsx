"use client"

import { Diagram, type DiagramTheme } from "@paneui/ui/components/diagram"

const source = `Draft -> Review
Review -> Publish`

const escape = (s: string) => s.replace(/[<>&"]/g, (c) => `&#${c.charCodeAt(0)};`)

// Stands in for a diagram renderer: lays the steps out in a row, in the theme's colours.
async function render(text: string, theme: DiagramTheme) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  const steps = [...new Set(text.split(/\n|->/).map((s) => s.trim()).filter(Boolean))]
  const c = theme.colors
  const w = 112
  const h = 44
  const gap = 48
  const width = steps.length * w + (steps.length - 1) * gap
  const boxes = steps.map((step, i) => {
    const x = i * (w + gap)
    const last = i === steps.length - 1
    return `<rect x="${x + 0.5}" y="0.5" width="${w - 1}" height="${h - 1}" rx="10" fill="${last ? c.primary : c.card}" stroke="${last ? c.primary : c.border}"/>
<text x="${x + w / 2}" y="${h / 2}" dy="0.35em" text-anchor="middle" font-size="13" fill="${last ? c["primary-foreground"] : c.foreground}">${escape(step)}</text>`
  })
  const arrows = steps.slice(1).map((_, i) => {
    const x = (i + 1) * (w + gap) - gap
    return `<path d="M${x + 6} ${h / 2}H${x + gap - 8}M${x + gap - 13} ${h / 2 - 4}L${x + gap - 8} ${h / 2}L${x + gap - 13} ${h / 2 + 4}" fill="none" stroke="${c["muted-foreground"]}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${h}" width="${width}" height="${h}" font-family="${escape(theme.fontFamily)}">${boxes.join("")}${arrows.join("")}</svg>`
}

export default function DiagramDemo() {
  return <Diagram source={source} render={render} caption="Every post is reviewed before it goes out." className="w-full max-w-lg" />
}
