// Renders every *Icon export to a contact sheet (48px, 14px and 18px of each icon on dark).
// Usage: node sheet.cjs [out.png] [filter] [--light] [--from=N --count=M]
//   filter     comma list of name substrings
import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { writeFileSync } from "node:fs"

import * as R from "../../packages/ui/src/icons/index"

type C = React.ComponentType<{ size?: number }>
const args = process.argv.slice(2)
const flags = args.filter((a) => a.startsWith("--"))
const [outArg, filterArg] = args.filter((a) => !a.startsWith("--"))
const out = outArg ?? "/workspace/work/iconrender/sheet.png"
const filter = filterArg?.split(",")
const light = flags.includes("--light")
const num = (f: string) => Number(flags.find((a) => a.startsWith(`--${f}=`))?.split("=")[1] ?? NaN)
const from = num("from") || 0, count = num("count") || Infinity
const names = Object.keys(R)
  .filter((k) => k.endsWith("Icon") && (!filter || filter.some((f) => k.toLowerCase().includes(f.toLowerCase()))))
  .slice(from, from + count)
const cell = 72
const cols = Math.min(10, names.length), rowH = 112
const draw = (Comp: C, size: number, x: number, y: number) => renderToStaticMarkup(<Comp size={size} />).replace("<svg", `<svg x="${x}" y="${y}"`)
let body = ""
names.forEach((n, i) => {
  const x = (i % cols) * cell, y = Math.floor(i / cols) * rowH
  const Comp = (R as unknown as Record<string, C>)[n]
  body += draw(Comp, 48, x + 12, y + 10) + draw(Comp, 14, x + 12, y + 66) + draw(Comp, 18, x + 34, y + 64)
  body += `<text x="${x + 6}" y="${y + 102}" font-family="sans-serif" font-size="9" fill="#888">${n.replace("Icon", "")}</text>`
})
const W = cols * cell, H = Math.ceil(names.length / cols) * rowH
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="${light ? "#ffffff" : "#1c1d20"}"/><g color="${light ? "#171717" : "#ececec"}">${body}</g></svg>`
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Resvg } = require("@resvg/resvg-js")
writeFileSync(out, new Resvg(svg, { fitTo: { mode: "zoom", value: 2 }, font: { loadSystemFonts: true } }).render().asPng())
console.log(`${names.length} icons (rounded) -> ${out}`)
