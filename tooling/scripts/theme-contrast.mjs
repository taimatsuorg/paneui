#!/usr/bin/env node
// WCAG 2 contrast of every foreground / background role pair, for both styles (default and Paper), every accent
// preset plus sample custom accents, in light and dark. Text pairs need 4.5:1, control and graphic pairs 3:1.
//   node tooling/scripts/theme-contrast.mjs [--md <file>] [--json <file>] [--no-fail]
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parse } from "./color.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const read = (p) => fs.readFileSync(path.join(root, p), "utf8")
const args = process.argv.slice(2)
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)

/** Top-level rule blocks (nested at-rules skipped), comments removed. */
function blocks(css) {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "")
  const out = []
  let depth = 0
  let start = 0
  let selector = ""
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "{") {
      if (depth === 0) {
        selector = src.slice(start, i).trim()
        start = i + 1
      }
      depth++
    } else if (src[i] === "}") {
      depth--
      if (depth === 0) {
        if (!selector.startsWith("@")) {
          const vars = {}
          for (const [, k, v] of src.slice(start, i).matchAll(/--([\w-]+):\s*([^;]+);/g)) vars[k] = v.trim()
          out.push({ selectors: selector.split(",").map((s) => s.trim()), vars })
        }
        start = i + 1
      }
    }
  }
  return out
}
const globals = blocks(read("packages/tokens/styles/globals.css"))
const accents = blocks(read("packages/tokens/styles/theme-accents.css"))
const paper = blocks(read("packages/tokens/styles/theme-paper.css"))
const pick = (list, selector) => Object.assign({}, ...list.filter((b) => b.selectors.includes(selector)).map((b) => b.vars))

/* Custom accents go through the same derivation the Customize page uses. */
const { createJiti } = await import("jiti")
const jiti = createJiti(import.meta.url, { fsCache: false })
const { deriveAccent } = await jiti.import(path.join(root, "apps/docs/components/docs/accent-color.ts"))
const CUSTOM = { "custom #e11d48": "#e11d48", "custom #eab308": "#eab308", "custom #14b8a6": "#14b8a6", "custom #7c3aed": "#7c3aed", "custom #0ea5e9": "#0ea5e9" }

const PRESETS = ["blue", "neutral", "green", "orange", "rose", "violet"]
function vars(style, accent, mode) {
  const dark = mode === "dark"
  const v = { ...pick(globals, ":root"), ...(dark ? pick(globals, ".dark") : {}) }
  if (accent !== "blue" && PRESETS.includes(accent)) Object.assign(v, pick(accents, `html[data-accent="${accent}"]`), dark ? pick(accents, `html[data-accent="${accent}"].dark`) : {})
  if (style === "paper") {
    Object.assign(v, pick(paper, 'html[data-style="paper"]'), dark ? pick(paper, 'html[data-style="paper"].dark') : {})
    if (PRESETS.includes(accent)) {
      const sel = accent === "blue" ? 'html[data-style="paper"]:not([data-accent])' : `html[data-style="paper"][data-accent="${accent}"]`
      Object.assign(v, pick(paper, sel))
      if (dark) Object.assign(v, pick(paper, accent === "blue" ? 'html[data-style="paper"].dark:not([data-accent])' : `html[data-style="paper"][data-accent="${accent}"].dark`))
    }
  }
  if (!PRESETS.includes(accent)) Object.assign(v, deriveAccent(CUSTOM[accent])[mode])
  return v
}

// --legacy: read a theme from before the -text / fill / info roles through the roles it drew them with.
const LEGACY = { "fill-hover": "secondary", "fill-active": "accent", "border-control": "input", "primary-text": "primary", "destructive-text": "destructive", "success-text": "success", "warning-text": "warning" }
const resolve = (v, name, seen = 0) => {
  const raw = v[name] ?? (args.includes("--legacy") && LEGACY[name] ? v[LEGACY[name]] : undefined)
  if (raw === undefined) return undefined
  const m = /^var\(--([\w-]+)(?:,\s*(.+))?\)$/.exec(raw)
  if (m) return seen > 8 ? undefined : resolve(v, m[1], seen + 1) ?? m[2]
  return raw
}
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 })
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const hex = (c) => "#" + [c.r, c.g, c.b].map((n) => Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16).padStart(2, "0")).join("")

/** A surface: a role (alpha composited over its parent surface, the page by default). */
function surface(v, name, base = "background") {
  const value = resolve(v, name)
  if (!value) return undefined
  const c = parse(value)
  if (c.a >= 1) return c
  return over(c, surface(v, base))
}

const TAGS = ["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]
const STATUS = ["destructive", "success", "warning", "info"]
// [foreground, background, minimum, kind]; a background "a/b" is role a composited over surface b.
function pairs() {
  const p = []
  const text = (fg, bgs) => bgs.forEach((bg) => p.push([fg, bg, 4.5, "text"]))
  const ui = (fg, bgs) => bgs.forEach((bg) => p.push([fg, bg, 3, "ui"]))
  text("foreground", ["background", "card", "popover", "shell", "fill-hover", "fill-active", "selection"])
  text("muted-foreground", ["background", "card", "popover", "shell", "fill-hover"])
  text("secondary-foreground", ["secondary"])
  text("accent-foreground", ["accent"])
  text("standout-foreground", ["surface-standout"])
  text("primary-foreground", ["primary", "primary-hover", "primary-active"])
  text("primary-text", ["background", "card", "popover", "primary-subtle"])
  text("muted-foreground", ["fill-active"])
  for (const s of STATUS) {
    text(`${s}-foreground`, [s, `${s}-hover`])
    text(`${s}-text`, ["background", "card", `${s}-subtle`])
  }
  for (const t of TAGS) text(`tag-${t}-text`, ["background", `tag-${t}-bg`, `tag-${t}-fill`])
  ui("fg-tertiary", ["background", "card"])
  ui("border-control", ["background", "card"])
  ui("ring", ["background", "card"])
  // Reference only: a solid carries its own label, so its edge against the page is not a requirement.
  p.push(["primary", "background", 0, "ref"])
  for (const s of STATUS) p.push([s, "background", 0, "ref"])
  for (let i = 1; i <= 8; i++) ui(`chart-${i}`, ["background", "card"])
  return p
}

const SOLID_BG = new Set(["background", "card", "popover", "shell", "surface-standout"])
const rows = []
for (const style of ["default", "paper"]) {
  for (const accent of [...PRESETS, ...Object.keys(CUSTOM)]) {
    for (const mode of ["light", "dark"]) {
      const v = vars(style, accent, mode)
      for (const [fg, bg, min, kind] of pairs()) {
        // Solids sit on the page; alpha fills (subtle, selection, tag fills) are composited over the page.
        const back = SOLID_BG.has(bg) ? surface(v, bg) : surface(v, bg, "background")
        const fv = resolve(v, fg)
        if (!back || !fv) {
          rows.push({ style, accent, mode, fg, bg, min, kind, ratio: null })
          continue
        }
        const front = parse(fv)
        const f = front.a < 1 ? over(front, back) : front
        rows.push({ style, accent, mode, fg, bg, min, kind, ratio: +ratio(f, back).toFixed(2), fgHex: hex(f), bgHex: hex(back) })
      }
    }
  }
}

const missing = rows.filter((r) => r.ratio === null)
const failing = rows.filter((r) => r.ratio !== null && r.ratio < r.min)
// Accent-independent pairs are reported once per style/mode; accent pairs per accent.
const ACCENT_ROLES = /^(primary|ring)/
const md = [
  "# Theme contrast (after)",
  "",
  `Generated by \`node tooling/scripts/theme-contrast.mjs\` on ${new Date().toISOString().slice(0, 10)}. WCAG 2 ratios; alpha roles are composited over the page (` +
    "`--background`) of the same style and mode. Text pairs need 4.5:1, controls and graphics (tertiary text, control edge, focus ring, solids, charts) 3:1.",
  "",
  `**${rows.length - missing.length} pairs checked, ${failing.length} below their minimum, ${missing.length} missing.**`,
  "",
]
if (failing.length) {
  md.push("## Failing", "", "| Style | Accent | Mode | Foreground | Background | Ratio | Min |", "|---|---|---|---|---|---|---|")
  for (const r of failing) md.push(`| ${r.style} | ${r.accent} | ${r.mode} | ${r.fg} | ${r.bg} | ${r.ratio} | ${r.min} |`)
  md.push("")
}
if (missing.length) {
  md.push("## Missing roles", "", ...[...new Set(missing.map((r) => `- ${r.style} ${r.accent} ${r.mode}: ${r.fg} on ${r.bg}`))], "")
}
for (const style of ["default", "paper"]) {
  md.push(`## ${style === "paper" ? "Paper style (the docs site)" : "Default style"}`, "")
  md.push("### Neutral, status and tag roles (accent blue)", "", "| Foreground | Background | Min | Light | Dark |", "|---|---|---|---|---|")
  const base = rows.filter((r) => r.style === style && r.accent === "blue" && !ACCENT_ROLES.test(r.fg))
  const keyed = new Map()
  for (const r of base) {
    const k = `${r.fg}|${r.bg}|${r.min}`
    keyed.set(k, { ...(keyed.get(k) ?? {}), [r.mode]: r })
  }
  const cell = (r) => (r ? `${r.ratio < r.min ? "**" : ""}${r.ratio}${r.ratio < r.min ? "** ✗" : ""} \`${r.fgHex}\`/\`${r.bgHex}\`` : "—")
  for (const [k, m] of keyed) {
    const [fg, bg, min] = k.split("|")
    md.push(`| ${fg} | ${bg} | ${min} | ${cell(m.light)} | ${cell(m.dark)} |`)
  }
  md.push("", "### Accent roles per preset", "", "| Accent | Foreground | Background | Min | Light | Dark |", "|---|---|---|---|---|---|")
  for (const accent of [...PRESETS, ...Object.keys(CUSTOM)]) {
    const accRows = rows.filter((r) => r.style === style && r.accent === accent && ACCENT_ROLES.test(r.fg))
    const map = new Map()
    for (const r of accRows) {
      const k = `${r.fg}|${r.bg}|${r.min}`
      map.set(k, { ...(map.get(k) ?? {}), [r.mode]: r })
    }
    for (const [k, m] of map) {
      const [fg, bg, min] = k.split("|")
      md.push(`| ${accent} | ${fg} | ${bg} | ${min} | ${cell(m.light)} | ${cell(m.dark)} |`)
    }
  }
  md.push("")
}
const out = md.join("\n")
if (flag("--md")) fs.writeFileSync(flag("--md"), out + "\n")
if (flag("--json")) fs.writeFileSync(flag("--json"), JSON.stringify(rows, null, 1))
console.log(`${rows.length - missing.length} pairs, ${failing.length} failing, ${missing.length} missing`)
for (const r of failing.slice(0, 60)) console.log(`  ✗ ${r.style}/${r.accent}/${r.mode} ${r.fg} on ${r.bg}: ${r.ratio} < ${r.min}`)
if ((failing.length || missing.length) && !args.includes("--no-fail")) process.exit(1)
