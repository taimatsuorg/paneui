// Icon preview sheet: renders every *Icon export of your icons file at
// 48px, 18px and 14px, so you can check a new glyph next to its neighbours.
//
// Bundle it with your project's icons file aliased to "icons", then run it:
//
//   npx esbuild path/to/paneui-icons/scripts/preview.tsx --bundle --platform=node \
//     --jsx=automatic --alias:icons=./components/icons.tsx \
//     --external:@resvg/resvg-js --outfile=.icon-preview.cjs
//   node .icon-preview.cjs icon-preview.png heart,bell,yourNew [--light]
//
// Arguments: output file (.png or .svg), optional comma list of name filters
// (case-insensitive substrings), optional --light for a light background.
// PNG output needs `@resvg/resvg-js` (npm i -D @resvg/resvg-js); without it,
// or with an .svg output path, the sheet is written as SVG.
import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { writeFileSync } from "node:fs"

// Resolved by esbuild's --alias:icons=<your icons file>.
import * as I from "icons"

const args = process.argv.slice(2)
const light = args.includes("--light")
const [outArg, filterArg] = args.filter((a) => !a.startsWith("--"))
const out = outArg ?? "icon-preview.png"
const filter = filterArg?.split(",").map((f) => f.trim().toLowerCase()).filter(Boolean)

type IconComponent = React.ComponentType<{ size?: number }>
const icons = I as unknown as Record<string, IconComponent>
const names = Object.keys(icons).filter(
  (k) => k.endsWith("Icon") && (!filter || filter.some((f) => k.toLowerCase().includes(f)))
)
if (names.length === 0) {
  console.error("No icons matched. Check the --alias:icons path and the filter.")
  process.exit(1)
}

const cols = Math.min(10, names.length)
const cell = 72
const rowH = 112
const bg = light ? "#fcfcfc" : "#1c1d20"
const fg = light ? "#262626" : "#ececec"
const place = (Icon: IconComponent, size: number, x: number, y: number) =>
  renderToStaticMarkup(<Icon size={size} />).replace("<svg", `<svg x="${x}" y="${y}"`)

let body = ""
names.forEach((name, i) => {
  const Icon = icons[name]
  const x = (i % cols) * cell
  const y = Math.floor(i / cols) * rowH
  body += place(Icon, 48, x + 12, y + 10)
  body += place(Icon, 14, x + 12, y + 66)
  body += place(Icon, 18, x + 34, y + 64)
  body += `<text x="${x + 6}" y="${y + 102}" font-family="sans-serif" font-size="9" fill="#888">${name.replace(/Icon$/, "")}</text>`
})
const W = cols * cell
const H = Math.ceil(names.length / cols) * rowH
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="${bg}"/><g color="${fg}">${body}</g></svg>`

let written = false
if (out.endsWith(".png")) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Resvg } = require("@resvg/resvg-js")
    const png = new Resvg(svg, { fitTo: { mode: "zoom", value: 2 }, font: { loadSystemFonts: true } }).render().asPng()
    writeFileSync(out, png)
    written = true
  } catch {
    console.warn("@resvg/resvg-js not found: writing SVG instead.")
  }
}
if (!written) {
  const svgOut = out.replace(/\.png$/, ".svg")
  writeFileSync(svgOut, svg)
  console.log(`${names.length} icons -> ${svgOut}`)
} else {
  console.log(`${names.length} icons -> ${out}`)
}
