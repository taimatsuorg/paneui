/**
 * Accent colour model for the docs: the preset roles (generated from the `html[data-accent]`
 * blocks in packages/tokens/styles/globals.css), OKLCH maths to derive a light + dark accent from any picked
 * colour, and the CSS a user takes home. Pure and client-safe.
 *
 * An accent is ten role variables per mode: `--primary` (solid), `--primary-hover`,
 * `--primary-active`, `--primary-foreground` (label on the solid, 4.5:1 on all three), `--primary-subtle`
 * and `--primary-subtle-hover` (tinted fills), `--primary-border`, `--primary-text` (links and accent
 * text, 4.5:1 on the page and the subtle fill), `--ring` (focus, 3:1) and `--selection`. Presets and a
 * picked colour follow the same contrast rules. Blue is the base (no `data-accent`).
 */

import { PRESET_ROLES } from "./accent-presets.generated"

export const ACCENT_VARS = [
  "primary",
  "primary-hover",
  "primary-active",
  "primary-foreground",
  "primary-subtle",
  "primary-subtle-hover",
  "primary-border",
  "primary-text",
  "ring",
  "selection",
] as const
export type AccentVar = (typeof ACCENT_VARS)[number]
export type AccentVars = Record<AccentVar, string>
export type AccentTheme = { light: AccentVars; dark: AccentVars }
export type PresetAccent = "blue" | "neutral" | "green" | "orange" | "rose" | "violet"

/** The accent with no `data-accent` attribute: its roles are the ones on `:root` and `.dark`. */
export const DEFAULT_ACCENT: PresetAccent = "neutral"
/** The accent whose roles sit on :root and .dark (no `data-accent` attribute). */
export const BASE_ACCENT: PresetAccent = "blue"

/** Resolved roles of each preset, mirroring packages/tokens/styles/globals.css. */
export const PRESET_THEMES: Record<PresetAccent, AccentTheme> = PRESET_ROLES

/** Display names for the presets. */
export const PRESET_LABELS: Record<PresetAccent, string> = {
  neutral: "Neutral",
  blue: "Blue",
  green: "Green",
  orange: "Orange",
  rose: "Rose",
  violet: "Violet",
}

/** `#rrggbb` of a hex colour, alpha dropped (`#000000f2` → `#000000`, `#fff` → `#ffffff`). */
export function opaqueHex(hex: string): string {
  let h = hex.trim().replace(/^#/, "")
  if (h.length <= 4) h = [...h.slice(0, 3)].map((ch) => ch + ch).join("")
  return `#${h.slice(0, 6)}`
}

/* ─────────────────────────── OKLCH maths ─────────────────────────── */

type Oklch = { l: number; c: number; h: number }

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)

function linearToOklch([r, g, b]: [number, number, number]): Oklch {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const h = (Math.atan2(B, A) * 180) / Math.PI
  return { l: L, c: Math.hypot(A, B), h: h < 0 ? h + 360 : h }
}

function oklchToLinear({ l: L, c, h }: Oklch): [number, number, number] {
  const A = c * Math.cos((h * Math.PI) / 180)
  const B = c * Math.sin((h * Math.PI) / 180)
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

const inGamut = (rgb: [number, number, number]) => rgb.every((v) => v >= -0.0005 && v <= 1.0005)

/** Lower chroma (keeping lightness and hue) until the colour fits sRGB. */
function fitGamut(c: Oklch): Oklch {
  if (inGamut(oklchToLinear(c))) return c
  let lo = 0
  let hi = c.c
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(oklchToLinear({ ...c, c: mid }))) lo = mid
    else hi = mid
  }
  return { ...c, c: lo }
}

/** WCAG relative luminance of an OKLCH colour (via linear sRGB). */
function luminance(c: Oklch) {
  const [r, g, b] = oklchToLinear(fitGamut(c)).map((v) => clamp(v, 0, 1))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: Oklch, b: Oklch) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

export function hexToOklch(hex: string): Oklch | null {
  let h = hex.trim().replace(/^#/, "")
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})([0-9a-f]{2})?$/i.test(h) && !/^[0-9a-f]{4}$/i.test(h)) return null
  if (h.length <= 4) h = [...h].map((ch) => ch + ch).join("")
  const n = (i: number) => toLinear(parseInt(h.slice(i, i + 2), 16) / 255)
  return linearToOklch([n(0), n(2), n(4)])
}

export function oklchToHex(c: Oklch): string {
  const rgb = oklchToLinear(fitGamut(c)).map((v) => Math.round(clamp(toGamma(clamp(v, 0, 1)), 0, 1) * 255))
  return `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`
}

/** Parse `oklch(L C H)` (L as 0–1 or %). Alpha is ignored. */
export function parseOklch(css: string): Oklch | null {
  const m = /oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/i.exec(css)
  if (!m) return null
  return { l: m[2] ? +m[1] / 100 : +m[1], c: +m[3], h: +m[4] }
}

const fmt = (c: Oklch) => {
  const r = (n: number, d: number) => +n.toFixed(d)
  return c.c < 0.0005 ? `oklch(${r(c.l, 3)} 0 0)` : `oklch(${r(c.l, 3)} ${r(c.c, 3)} ${r(c.h, 1)})`
}

const WHITE: Oklch = { l: 1, c: 0, h: 0 }
/** The pages an accent must read on in each mode: the default and Paper page, card and popover. */
const PAGES: Record<"light" | "dark", Oklch[]> = {
  light: [WHITE, { l: 0.99, c: 0.002, h: 234.82 }],
  dark: [{ l: 0.15, c: 0, h: 0 }, { l: 0.252, c: 0, h: 0 }, { l: 0.195, c: 0.004, h: 289.15 }, { l: 0.255, c: 0.004, h: 289.15 }],
}

/** Gamma-encoded sRGB of a colour, optionally composited at `alpha` over `under`. */
function srgb(c: Oklch, alpha = 1, under?: Oklch): number[] {
  const top = oklchToLinear(fitGamut(c)).map((v) => toGamma(clamp(v, 0, 1)))
  if (alpha >= 1 || !under) return top
  const bottom = srgb(under)
  return top.map((v, i) => v * alpha + bottom[i] * (1 - alpha))
}
const lum = (rgb: number[]) => {
  const [r, g, b] = rgb.map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratioRgb = (a: number[], b: number[]) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

/**
 * White text unless a dark tint of the hue reads clearly better. White is favoured on saturated
 * fills, as on the presets; light fills (yellow, lime, cyan) take dark text.
 */
function pickForeground(fill: Oklch): Oklch {
  const dark: Oklch = { l: 0.2, c: Math.min(fill.c, 0.04), h: fill.h }
  if (fill.c < 0.03) return contrast(fill, WHITE) >= contrast(fill, dark) ? WHITE : { l: 0.205, c: 0, h: 0 }
  return contrast(fill, WHITE) * 1.6 >= contrast(fill, dark) ? WHITE : dark
}

/** Step lightness by `step` until `ok` holds (or the range ends). */
function walk(c: Oklch, step: number, ok: (c: Oklch) => boolean): Oklch {
  let out = fitGamut(c)
  for (let i = 0; i < 200 && !ok(out) && out.l > 0 && out.l < 1; i++) out = fitGamut({ ...out, l: clamp(out.l + step, 0, 1) })
  return out
}

const fmtA = (c: Oklch, alpha: number) => fmt(c).replace(/\)$/, ` / ${Math.round(alpha * 1000) / 10}%)`)
const shift = (c: Oklch, dl: number) => fitGamut({ ...c, l: clamp(c.l + dl, 0, 1) })

const ALPHAS = {
  light: { subtle: 0.1, hover: 0.16, border: 0.32, selection: 0.22 },
  dark: { subtle: 0.16, hover: 0.24, border: 0.42, selection: 0.4 },
}

/**
 * Derive both modes from one picked colour, on the same rules as the presets. The solid starts as
 * picked (lifted to 3:1 on the dark page), takes white or dark text, and moves away from that text until
 * the label reaches 4.5:1; hover and active move further away, so they keep it. `primary-text` is the
 * hue at the lightness that reads at 4.5:1 on every page and on the subtle fill; the ring is the solid
 * when it clears 3:1 on the page, otherwise the text colour. A near-grey pick mirrors the neutral preset.
 */
export function deriveAccent(hex: string): AccentTheme | null {
  const base = hexToOklch(hex)
  if (!base) return null
  if (base.c < 0.03) return PRESET_THEMES.neutral
  const mode = (m: "light" | "dark"): AccentVars => {
    const pages = PAGES[m]
    const page = pages[0]
    const a = ALPHAS[m]
    const start = m === "dark" ? walk(base, 0.01, (c) => contrast(c, page) >= 3) : fitGamut(base)
    const fg = pickForeground(start)
    const away = fg.l > 0.5 ? -0.005 : 0.005
    const fill = walk(start, away, (c) => contrast(c, fg) >= 4.6)
    const text = walk({ l: m === "light" ? 0.62 : 0.72, c: fill.c * 0.9, h: fill.h }, m === "light" ? -0.005 : 0.005, (t) => {
      const onPages = pages.every((p) => contrast(t, p) >= 5)
      return onPages && pages.every((p) => ratioRgb(srgb(t), srgb(fill, a.subtle, p)) >= 4.6)
    })
    const ring = contrast(fill, page) >= 3.2 ? fill : text
    return {
      primary: fmt(fill),
      "primary-hover": fmt(shift(fill, away * 7)),
      "primary-active": fmt(shift(fill, away * 14)),
      "primary-foreground": fmt(fg),
      "primary-subtle": fmtA(fill, a.subtle),
      "primary-subtle-hover": fmtA(fill, a.hover),
      "primary-border": fmtA(fill, a.border),
      "primary-text": fmt(text),
      ring: fmt(ring),
      selection: fmtA(fill, a.selection),
    }
  }
  return { light: mode("light"), dark: mode("dark") }
}

/* ─────────────────────────── CSS output ─────────────────────────── */

const declarations = (v: AccentVars, indent = "") => ACCENT_VARS.map((k) => `${indent}--${k}: ${v[k]};`)

/** The overrides a user pastes after the theme variables: exactly what this page applies. */
export function themeCss(theme: AccentTheme, label: string): string {
  return [
    `/* PaneUI accent: ${label} */`,
    "/* Paste after the theme variables in globals.css. */",
    ":root {",
    ...declarations(theme.light, "  "),
    "}",
    "",
    ".dark {",
    ...declarations(theme.dark, "  "),
    "}",
  ].join("\n")
}

/** Runtime stylesheet for a custom accent, keyed on `data-accent="custom"` like the preset blocks. */
export function customAccentStyle(theme: AccentTheme): string {
  const one = (v: AccentVars) => ACCENT_VARS.map((k) => `--${k}:${v[k]}`).join(";")
  return `html[data-accent="custom"]{${one(theme.light)}}html[data-accent="custom"].dark{${one(theme.dark)}}`
}
