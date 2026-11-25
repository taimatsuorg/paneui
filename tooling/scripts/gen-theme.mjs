/**
 * Writes the colour tokens of the default neutral style and everything that mirrors them:
 *
 * - packages/tokens/styles/globals.css: the colour mappings in `@theme inline`, the `:root` / `.dark` token blocks,
 *   and the `html[data-accent]` preset blocks (between `gen-theme` markers);
 * - packages/tokens/styles/theme-accents.css (the runtime preset bundle);
 * - apps/docs/components/docs/accent-presets.generated.ts and the preset CSS inside packages/ui/src/components/accent-picker.tsx;
 * - packages/registry/registry.json: the `theme` item (cssVars, css, version) and the `theme-<accent>` items.
 *
 * Run through `pnpm tokens:gen`. Values live here; never edit the generated blocks by hand.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Ok, ratio, solveAlpha, solveL } from "./theme-color.mjs"
import { TAGS, accentRoles, solidFor, states, tagRoles } from "./theme-roles.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const GLOBALS = path.join(ROOT, "packages/tokens/styles/globals.css")
const ACCENTS_CSS = path.join(ROOT, "packages/tokens/styles/theme-accents.css")
const PRESETS_TS = path.join(ROOT, "apps/docs/components/docs/accent-presets.generated.ts")
const PICKER = path.join(ROOT, "packages/ui/src/components/accent-picker.tsx")
const REGISTRY = path.join(ROOT, "packages/registry/registry.json")
const THEME_VERSION = "2.8"

const WHITE = new Ok(1)
const PAGE = { light: new Ok(0.988, 0, 0), dark: new Ok(0.13, 0.002, 286) }
const CARD = { light: new Ok(1, 0, 0), dark: new Ok(0.2, 0.003, 286) }
const POPOVER = { light: new Ok(1, 0, 0), dark: new Ok(0.22, 0.003, 286) }
const SHELL = { light: new Ok(0.972, 0.002, 286), dark: new Ok(0.165, 0.002, 286) }
const CODE = { light: new Ok(1, 0, 0), dark: new Ok(0.18, 0.003, 286) }

function inkOk(alpha, dark = false) {
  return dark ? new Ok(0.96, 0.002, 286, alpha) : new Ok(0.18, 0.003, 286, alpha)
}

function solveInk(target, dark, pages, under) {
  return solveAlpha((a) => inkOk(a, dark), (c) => pages.every((p) => ratio(c, p, under) >= target), 0.02, 1)
}

// ───────────────────────────── neutrals ─────────────────────────────
function neutrals(mode) {
  const dark = mode === "dark"
  const page = PAGE[mode]
  const fg = dark ? new Ok(0.96, 0.002, 286) : new Ok(0.18, 0.003, 286)
  const fillHover = inkOk(dark ? 0.07 : 0.05, dark)
  const fillActive = inkOk(dark ? 0.12 : 0.09, dark)
  const fillStrong = inkOk(dark ? 0.18 : 0.14, dark)
  let mutedFg
  if (dark) {
    const surfs = [page, CARD[mode], POPOVER[mode], SHELL[mode], fillHover, fillActive]
    const mutedL = solveL((L) => new Ok(L, 0.006, 286), (c) => surfs.every((p) => ratio(c, p, page) >= 4.6), 0.7, 0.9, "low")
    mutedFg = new Ok(mutedL, 0.006, 286)
  } else {
    mutedFg = new Ok(0.5, 0.006, 286)
  }
  const tertAlpha = solveInk(3.1, dark, [page, CARD[mode]], page)
  const borderControl = solveInk(3.1, dark, [page, CARD[mode]], page)
  return {
    // Surfaces: off-white light canvas with pure white panels, deep dark canvas with elevated panels, opaque.
    background: page,
    card: CARD[mode],
    popover: POPOVER[mode],
    "surface-sunken": new Ok(0, 0, 0, dark ? 0.36 : 0.045),
    "surface-standout": fg,
    "standout-foreground": dark ? new Ok(0.18, 0.003, 286) : new Ok(0.988, 0, 0),
    // Text: primary, secondary (>= 4.5:1), tertiary (>= 3:1: meta, placeholders), disabled.
    foreground: fg,
    "card-foreground": fg,
    "popover-foreground": fg,
    "muted-foreground": mutedFg,
    "fg-tertiary": inkOk(tertAlpha, dark),
    "fg-disabled": inkOk(Math.round(tertAlpha * 0.68 * 1000) / 1000, dark),
    // Fills, translucent ink: hover (rest of a filled control), active (pressed, open, selected), strong (pressed on hover).
    "fill-hover": fillHover,
    "fill-active": fillActive,
    "fill-strong": fillStrong,
    // The shadcn names read the fills.
    secondary: "var(--fill-hover)",
    "secondary-foreground": fg,
    muted: "var(--fill-hover)",
    accent: "var(--fill-active)",
    "accent-foreground": fg,
    // Borders: translucent hairlines for crisp contrast and control edges.
    border: inkOk(0.1, dark),
    "border-subtle": inkOk(0.06, dark),
    "border-strong": inkOk(0.18, dark),
    "border-control": inkOk(borderControl, dark),
    input: inkOk(0.12, dark),
  }
}

// ───────────────────────────── status ─────────────────────────────
const STATUS_SPEC = {
  destructive: {
    light: [WHITE, 25.331, 0.237, 0.637, new Ok(0.505, 0.213, 27.518)],
    dark: [new Ok(0.145, 0, 0), 23.35, 0.2212, 0.6551, new Ok(0.704, 0.191, 22.216)],
  },
  success: {
    light: [WHITE, 162.48, 0.17, 0.696, new Ok(0.508, 0.118, 165.612)],
    dark: [new Ok(0.145, 0, 0), 162.48, 0.17, 0.696, new Ok(0.765, 0.177, 163.223)],
  },
  warning: {
    light: [new Ok(0.145, 0, 0), 70.08, 0.188, 0.769, new Ok(0.555, 0.163, 48.998)],
    dark: [new Ok(0.145, 0, 0), 70.08, 0.188, 0.769, new Ok(0.828, 0.189, 84.429)],
  },
  info: {
    light: [WHITE, 259.815, 0.214, 0.623, new Ok(0.488, 0.243, 264.376)],
    dark: [new Ok(0.145, 0, 0), 259.815, 0.214, 0.623, new Ok(0.707, 0.165, 254.624)],
  },
}

function status(mode) {
  const dark = mode === "dark"
  const a = dark ? { subtle: 0.16, border: 0.4 } : { subtle: 0.1, border: 0.3 }
  const out = {}
  for (const name of ["destructive", "success", "warning", "info"]) {
    const [fg, H, C, L, textC] = STATUS_SPEC[name][mode]
    const solid = solidFor(fg, H, C, L)
    const [hover] = states(solid, fg)
    Object.assign(out, {
      [name]: solid,
      [`${name}-hover`]: hover,
      [`${name}-foreground`]: fg,
      [`${name}-subtle`]: solid.with({ a: a.subtle }),
      [`${name}-border`]: solid.with({ a: a.border }),
      [`${name}-text`]: textC,
    })
  }
  return out
}

// ───────────────────────────── accents ─────────────────────────────
const PRESET_ORDER = ["neutral", "blue", "green", "orange", "rose", "violet"]
const PRESET_LIGHT = {
  blue: [0.623, 0.214, 259.815],
  green: [0.696, 0.17, 162.48],
  orange: [0.646, 0.222, 41.116],
  rose: [0.586, 0.253, 17.585],
  violet: [0.558, 0.288, 302.321],
}
const PRESET_DARK = {
  blue: [0.707, 0.165, 254.624],
  green: [0.765, 0.177, 163.223],
  orange: [0.75, 0.183, 55.934],
  rose: [0.712, 0.194, 13.428],
  violet: [0.714, 0.203, 305.504],
}
const ACC = [
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
]

function neutralPreset(mode) {
  if (mode === "light") {
    const ringL = solveL(
      (L) => new Ok(L, 0.005, 286),
      (c) => [PAGE.light, CARD.light].every((p) => ratio(c, p) >= 3.1),
      0.4,
      0.708,
      "high",
    )
    return {
      primary: new Ok(0.18, 0.003, 286),
      "primary-hover": new Ok(0.25, 0.003, 286),
      "primary-active": new Ok(0.32, 0.003, 286),
      "primary-foreground": new Ok(0.988, 0, 0),
      "primary-subtle": inkOk(0.05, false),
      "primary-subtle-hover": inkOk(0.09, false),
      "primary-border": inkOk(0.16, false),
      "primary-text": new Ok(0.18, 0.003, 286),
      ring: new Ok(ringL, 0.005, 286),
      selection: inkOk(0.16, false),
    }
  }
  return {
    primary: new Ok(0.96, 0.002, 286),
    "primary-hover": new Ok(0.9, 0.002, 286),
    "primary-active": new Ok(0.84, 0.002, 286),
    "primary-foreground": new Ok(0.18, 0.003, 286),
    "primary-subtle": inkOk(0.07, true),
    "primary-subtle-hover": inkOk(0.12, true),
    "primary-border": inkOk(0.18, true),
    "primary-text": new Ok(0.96, 0.002, 286),
    ring: new Ok(0.58, 0.005, 286),
    selection: inkOk(0.24, true),
  }
}

function preset(name, mode) {
  if (name === "neutral") return neutralPreset(mode)
  const pages = [PAGE[mode], CARD[mode], POPOVER[mode]]
  if (mode === "light") {
    const [L, C, H] = PRESET_LIGHT[name]
    const solid = solidFor(WHITE, H, C, L)
    return accentRoles(solid, WHITE, PAGE[mode], pages, mode)
  }
  const [L, C, H] = PRESET_DARK[name]
  const fg = new Ok(0.145, 0, 0)
  const solid = solidFor(fg, H, C, L)
  return accentRoles(solid, fg, PAGE[mode], pages, mode, { textChroma: 0.95, textStart: solid.L })
}

function charts(mode) {
  if (mode === "dark") {
    return {
      "chart-1": new Ok(0.623, 0.214, 259.815),
      "chart-2": new Ok(0.696, 0.17, 162.48),
      "chart-3": new Ok(0.769, 0.188, 70.08),
      "chart-4": new Ok(0.627, 0.265, 303.9),
      "chart-5": new Ok(0.645, 0.246, 16.439),
      "chart-6": new Ok(0.715, 0.143, 215.221),
      "chart-7": new Ok(0.705, 0.213, 47.604),
      "chart-8": new Ok(0.708, 0, 0),
    }
  }
  return {
    "chart-1": new Ok(0.646, 0.222, 41.116),
    "chart-2": new Ok(0.6, 0.118, 184.704),
    "chart-3": new Ok(0.398, 0.07, 227.392),
    "chart-4": new Ok(0.555, 0.163, 48.998),
    "chart-5": new Ok(0.59, 0.155, 65.0),
    "chart-6": new Ok(0.558, 0.288, 302.321),
    "chart-7": new Ok(0.586, 0.253, 17.585),
    "chart-8": new Ok(0.556, 0, 0),
  }
}

function tags(mode) {
  const dark = mode === "dark"
  const pages = [PAGE[mode], CARD[mode], POPOVER[mode]]
  const fg = dark ? new Ok(0.96, 0.002, 286) : new Ok(0.18, 0.003, 286)
  return tagRoles(mode, pages, fg, inkOk(dark ? 0.08 : 0.06, dark), 0, 0)
}

const cssVal = (v) => (v instanceof Ok ? v.css() : v)

function tokens(mode) {
  const dark = mode === "dark"
  const acc = preset("neutral", mode)
  const d = {
    ...neutrals(mode),
    ...Object.fromEntries(ACC.map((k) => [k, acc[k]])),
    ...status(mode),
    ...charts(mode),
    code: CODE[mode],
    scrollbar: inkOk(0.16, dark),
    "scrollbar-hover": inkOk(0.28, dark),
    shell: SHELL[mode],
    "shell-border": inkOk(0.08, dark),
    ...tags(mode),
  }
  return Object.fromEntries(Object.entries(d).map(([k, v]) => [k, cssVal(v)]))
}

const LIGHT = tokens("light")
const DARK = tokens("dark")
const PRESETS = Object.fromEntries(
  PRESET_ORDER.map((n) => [
    n,
    Object.fromEntries(
      ["light", "dark"].map((m) => [m, Object.fromEntries(Object.entries(preset(n, m)).map(([k, v]) => [k, cssVal(v)]))]),
    ),
  ]),
)

// ───────────────────────────── globals.css ─────────────────────────────
const GROUPS = [
  ["Surfaces: off-white light and deep dark canvas, elevated container (card) and modal (popover), opaque.", ["background", "card", "popover"]],
  ["Sunken wells, and the inverted standout surface (neutral callouts, toasts).", ["surface-sunken", "surface-standout", "standout-foreground"]],
  ["Text: primary, secondary (≥ 4.5:1), tertiary (≥ 3:1, meta and placeholders) and disabled.", ["foreground", "card-foreground", "popover-foreground", "muted-foreground", "fg-tertiary", "fg-disabled"]],
  ["Accent: solid, hover, active and its label (≥ 4.5:1), subtle fills, border, text (links, active items: ≥ 4.5:1 on the page and the subtle fill), focus ring (≥ 3:1) and text selection. Presets swap these ten.", ACC],
  ["Fills, translucent ink: hover (a filled control at rest, hovered rows), active (pressed, open, selected), strong (pressed on hover). Never surfaces.", ["fill-hover", "fill-active", "fill-strong"]],
  ["The shadcn fill names read the fills above.", ["secondary", "secondary-foreground", "muted", "accent", "accent-foreground"]],
  ["Status: solid, hover, label on the solid (≥ 4.5:1), subtle fill, border and text (≥ 4.5:1 on the page and the subtle fill).", ["destructive", "success", "warning", "info"].flatMap((n) => ["", "-hover", "-foreground", "-subtle", "-border", "-text"].map((r) => `${n}${r}`))],
  ["Borders: translucent hairlines for dividers, cards, outline buttons, focusable edges and field rings.", ["border", "border-subtle", "border-strong", "border-control", "input"]],
  ["Charts: chart-1…8, each ≥ 3:1 on the page and card. Never follow the accent.", Array.from({ length: 8 }, (_, i) => `chart-${i + 1}`)],
  ["Code well; scrollbar thumb at rest and hovered.", ["code", "scrollbar", "scrollbar-hover"]],
  ["Shell band (sidebar chrome, rail, tile wells) and its hairline border.", ["shell", "shell-border"]],
  ["Tags and highlights: per colour, text, a highlight background and a pill fill; text is ≥ 4.5:1 on all three. They never follow the accent.", TAGS.flatMap((t) => ["text", "bg", "fill"].map((r) => `tag-${t}-${r}`))],
]

const groupKeys = GROUPS.flatMap(([, ks]) => ks).sort()
const lightKeys = Object.keys(LIGHT).sort()
if (JSON.stringify(groupKeys) !== JSON.stringify(lightKeys)) {
  throw new Error(`GROUPS mismatch with LIGHT keys`)
}

const SHADOWS = {
  light: `
  /* Shadow scale: inset hairline ring plus subtle bottom drop depth. */
  --shadow-border: inset 0 0 0 1px oklch(0% 0 0 / 0.08);
  --shadow-default: inset 0 0 0 1px oklch(0% 0 0 / 0.08), 0 1px 0 oklch(0% 0 0 / 0.04), 0 1px 2px oklch(0% 0 0 / 0.05);
  --shadow-lg: inset 0 0 0 1px oklch(0% 0 0 / 0.08), 0 1px 0 oklch(0% 0 0 / 0.04), 0 10px 15px -3px oklch(0% 0 0 / 0.05), 0 4px 6px -4px oklch(0% 0 0 / 0.05);
  --shadow-xl: inset 0 0 0 1px oklch(0% 0 0 / 0.08), 0 1px 0 oklch(0% 0 0 / 0.04), 0 20px 25px -5px oklch(0% 0 0 / 0.08), 0 8px 10px -6px oklch(0% 0 0 / 0.06);
  /* Named elevation (components use these), restated in .dark so they resolve per mode. */
  --skeuo-raised: var(--shadow-default);
  --skeuo-raised-hover: inset 0 0 0 1px oklch(0% 0 0 / 0.14), 0 1px 0 oklch(0% 0 0 / 0.05), 0 2px 4px oklch(0% 0 0 / 0.06);
  --skeuo-pressed: inset 0 1px 2px oklch(0% 0 0 / 0.1), inset 0 0 0 1px oklch(0% 0 0 / 0.12);
  --skeuo-primary: 0 1px 0 oklch(0% 0 0 / 0.08), 0 1px 2px oklch(0% 0 0 / 0.08);
  --skeuo-well: inset 0 0 0 1px var(--input);
  --skeuo-surface: var(--shadow-lg);
  --skeuo-chip: var(--shadow-border);
`,
  dark: `
  /* Shadow scale: inset hairline ring plus subtle bottom drop depth and crisp top highlight. */
  --shadow-border: inset 0 0 0 1px oklch(100% 0 0 / 0.1);
  --shadow-default: inset 0 0.5px 0 oklch(100% 0 0 / 0.1), inset 0 0 0 1px oklch(100% 0 0 / 0.08), 0 1px 2px oklch(0% 0 0 / 0.28);
  --shadow-lg: inset 0 0.5px 0 oklch(100% 0 0 / 0.1), inset 0 0 0 1px oklch(100% 0 0 / 0.1), 0 10px 15px -3px oklch(0% 0 0 / 0.45), 0 4px 6px -4px oklch(0% 0 0 / 0.35);
  --shadow-xl: inset 0 0.5px 0 oklch(100% 0 0 / 0.1), inset 0 0 0 1px oklch(100% 0 0 / 0.1), 0 20px 25px -5px oklch(0% 0 0 / 0.55), 0 8px 10px -6px oklch(0% 0 0 / 0.4);
  /* Named elevation (components use these), restated in .dark so they resolve per mode. */
  --skeuo-raised: var(--shadow-default);
  --skeuo-raised-hover: inset 0 0.5px 0 oklch(100% 0 0 / 0.14), inset 0 0 0 1px oklch(100% 0 0 / 0.14), 0 1px 3px oklch(0% 0 0 / 0.34);
  --skeuo-pressed: inset 0 1px 2px oklch(0% 0 0 / 0.45), inset 0 0 0 1px oklch(100% 0 0 / 0.1);
  --skeuo-primary: 0 0 0 0 transparent;
  --skeuo-well: inset 0 0 0 1px var(--input);
  --skeuo-surface: var(--shadow-lg);
  --skeuo-chip: var(--shadow-border);
`,
}

function tokenBlock(sel, values, mode) {
  const lines = [`${sel} {`]
  if (mode === "light") {
    lines.push("  --radius: 0.875rem;", "  /* The largest radius any token reaches (16px cap). */", "  --radius-max: 1rem;", "")
  }
  for (const [comment, keys] of GROUPS) {
    lines.push(`  /* ${comment} */`)
    for (const k of keys) lines.push(`  --${k}: ${values[k]};`)
  }
  return lines.join("\n") + SHADOWS[mode].replace(/\n+$/, "") + "\n}\n"
}

function themeInline() {
  const names = [
    "background",
    "foreground",
    "card",
    "card-foreground",
    "popover",
    "popover-foreground",
    ...ACC.filter((k) => k !== "selection"),
    "selection",
    "fill-hover",
    "fill-active",
    "fill-strong",
    "secondary",
    "secondary-foreground",
    "muted",
    "muted-foreground",
    "fg-tertiary",
    "fg-disabled",
    "accent",
    "accent-foreground",
    ...["destructive", "success", "warning", "info"].flatMap((n) => ["", "-hover", "-foreground", "-subtle", "-border", "-text"].map((r) => `${n}${r}`)),
    "surface-sunken",
    "surface-standout",
    "standout-foreground",
    "border",
    "border-subtle",
    "border-strong",
    "border-control",
    "input",
    "ring",
    "code",
    ...Array.from({ length: 8 }, (_, i) => `chart-${i + 1}`),
    ...TAGS.flatMap((t) => ["text", "bg", "fill"].map((r) => `tag-${t}-${r}`)),
  ]
  const unique = [...new Set(names)]
  const out = unique.map((n) => `  --color-${n}: var(--${n});`)
  out.push("  /* App chrome: the window band/sidebar tone and the hairline of the inset content panel. */", "  --color-shell: var(--shell);", "  --color-shell-border: var(--shell-border);")
  return out.join("\n") + "\n"
}

const decls = (d, indent) =>
  Object.entries(d)
    .map(([k, v]) => `${indent}--${k}: ${v};\n`)
    .join("")

function replaceBetween(src, start, end, body) {
  const a = src.indexOf(start)
  const b = src.indexOf(end)
  if (a < 0 || b < 0) throw new Error(`marker not found: ${start} .. ${end}`)
  return src.slice(0, a + start.length) + "\n" + body + src.slice(b)
}

function varsOf(body) {
  const clean = body.replace(/\/\*[\s\S]*?\*\//g, "")
  const out = {}
  for (const m of clean.matchAll(/--([\w-]+):\s*([\s\S]*?);/g)) {
    out[m[1]] = m[2].replace(/\s+/g, " ").trim()
  }
  return out
}

function main() {
  let css = fs.readFileSync(GLOBALS, "utf8")
  const markers = Object.fromEntries(
    ["inline", "tokens", "accents"].map((k) => [
      k,
      [`/* gen-theme:${k}:start (tooling/scripts/gen-theme.mjs; do not edit) */`, `/* gen-theme:${k}:end */`],
    ]),
  )
  css = replaceBetween(css, markers.inline[0], `  ${markers.inline[1]}`, themeInline())
  const tok = `${tokenBlock(":root", LIGHT, "light")}\n${tokenBlock(".dark", DARK, "dark")}`
  css = replaceBetween(css, markers.tokens[0], markers.tokens[1], tok)

  const accCss = [
    "/*",
    " * Accent presets: `data-accent` on <html> swaps the ten accent roles (default, no attribute, is neutral).",
    " * Every preset meets the same contrast floor: label on the solid, hover and active ≥ 4.5:1, primary-text ≥ 4.5:1 on",
    " * the page and the subtle fill, ring ≥ 3:1. Coloured solids take white text in light mode and dark neutral ink in dark mode;",
    ' * neutral is the inverted neutral-800 / neutral-100 solid. The docs header persists the pick in localStorage["accent"];',
    " * registry items theme-<name> ship the same values.",
    " */",
  ]
  for (const n of PRESET_ORDER) {
    if (n === "neutral") continue
    accCss.push(`html[data-accent="${n}"] {\n${decls(PRESETS[n].light, "  ")}}`)
    accCss.push(`html[data-accent="${n}"].dark {\n${decls(PRESETS[n].dark, "  ")}}`)
  }
  css = replaceBetween(css, markers.accents[0], markers.accents[1], accCss.join("\n") + "\n")
  fs.writeFileSync(GLOBALS, css)

  // ───────────────────────────── runtime bundles ─────────────────────────────
  const bundle = [
    "/*\n * Accent presets, switched at runtime with data-accent on <html> (no attribute = neutral).\n * The attribute also works on any element to give one section its own accent.\n * Generated by tooling/scripts/gen-theme.mjs from the theme-<name> registry items; import after the theme.\n */\n",
  ]
  for (const n of PRESET_ORDER) {
    bundle.push(`html[data-accent="${n}"],\n[data-accent="${n}"] {\n${decls(PRESETS[n].light, "  ")}}\n`)
    bundle.push(`html[data-accent="${n}"].dark,\n.dark [data-accent="${n}"] {\n${decls(PRESETS[n].dark, "  ")}}\n`)
  }
  fs.writeFileSync(ACCENTS_CSS, bundle.join("\n"))

  fs.writeFileSync(
    PRESETS_TS,
    "/* Generated by tooling/scripts/gen-theme.mjs (the html[data-accent] blocks in packages/tokens/styles/globals.css). Do not edit. */\n\n" +
      `export const PRESET_ROLES = ${JSON.stringify(PRESETS, null, 2)} as const\n`,
  )

  const pick = PRESET_ORDER.filter((n) => n !== "neutral")
    .map(
      (n) =>
        `html[data-accent="${n}"] { ${Object.entries(PRESETS[n].light).map(([k, v]) => `--${k}: ${v};`).join(" ")} } ` +
        `html[data-accent="${n}"].dark { ${Object.entries(PRESETS[n].dark).map(([k, v]) => `--${k}: ${v};`).join(" ")} }`,
    )
    .join(" ")
  let pickerSrc = fs.readFileSync(PICKER, "utf8")
  pickerSrc = pickerSrc.replace(/^const PRESETS_CSS = `.*`$/m, () => `const PRESETS_CSS = \`${pick}\``)
  const swatch = Object.fromEntries(PRESET_ORDER.map((n) => [n, n === "neutral" ? "var(--foreground)" : PRESETS[n].light.primary]))
  pickerSrc = pickerSrc.replace(
    /const SWATCH: Record<Accent, string> = \{[\s\S]*?\n\}/,
    () => `const SWATCH: Record<Accent, string> = {\n${PRESET_ORDER.map((n) => `  ${n}: "${swatch[n]}",`).join("\n")}\n}`,
  )
  const fg = Object.fromEntries(PRESET_ORDER.map((n) => [n, n === "neutral" ? "var(--background)" : PRESETS[n].light["primary-foreground"]]))
  pickerSrc = pickerSrc.replace(
    /const SWATCH_FG: Record<Accent, string> = \{[\s\S]*?\n\}/,
    () => `const SWATCH_FG: Record<Accent, string> = {\n${PRESET_ORDER.map((n) => `  ${n}: "${fg[n]}",`).join("\n")}\n}`,
  )
  fs.writeFileSync(PICKER, pickerSrc)

  // ───────────────────────────── registry ─────────────────────────────
  const nextCss = fs.readFileSync(GLOBALS, "utf8")
  const root = {}
  const dark = {}
  for (const m of nextCss.matchAll(/^:root \{\n([\s\S]*?)\n\}/gm)) {
    for (const [k, v] of Object.entries(varsOf(m[1]))) if (!(k in root)) root[k] = v
  }
  for (const m of nextCss.matchAll(/^\.dark \{\n([\s\S]*?)\n\}/gm)) {
    for (const [k, v] of Object.entries(varsOf(m[1]))) if (!(k in dark)) dark[k] = v
  }
  const inline = varsOf(/@theme inline \{([\s\S]*?)\n\}/.exec(nextCss)[1])
  const statics = {}
  for (const m of nextCss.matchAll(/^@theme \{\n([\s\S]*?)\n\}/gm)) {
    Object.assign(statics, varsOf(m[1]))
  }
  const STD = new Set([
    "color-background",
    "color-foreground",
    "color-card",
    "color-card-foreground",
    "color-popover",
    "color-popover-foreground",
    "color-primary",
    "color-primary-foreground",
    "color-secondary",
    "color-secondary-foreground",
    "color-muted",
    "color-muted-foreground",
    "color-accent",
    "color-accent-foreground",
    "color-destructive",
    "color-border",
    "color-input",
    "color-ring",
  ])
  const reg = JSON.parse(fs.readFileSync(REGISTRY, "utf8"))
  const items = Object.fromEntries(reg.items.map((i) => [i.name, i]))
  const theme = items.theme
  theme.cssVars = {
    theme: {
      ...Object.fromEntries(Object.entries(inline).filter(([k]) => !STD.has(k))),
      ...statics,
      radius: root.radius,
    },
    light: root,
    dark,
  }
  delete theme.css["@supports (color: color(display-p3 1 1 1))"]
  delete theme.css["@supports (color: color-mix(in oklab, red, red))"]
  theme.css["@layer base"] ??= {}
  theme.css["@layer base"]["::selection"] = { "background-color": "var(--selection)" }
  theme.meta ??= {}
  theme.meta.version = THEME_VERSION
  for (const n of PRESET_ORDER) {
    const item = items[`theme-${n}`]
    item.cssVars = { light: PRESETS[n].light, dark: PRESETS[n].dark }
    delete item.css
  }
  fs.writeFileSync(REGISTRY, JSON.stringify(reg, null, 2) + "\n")
  console.log(`gen-theme: ${Object.keys(LIGHT).length} roles per mode, ${PRESET_ORDER.length} accent presets, theme v${THEME_VERSION}`)
}

main()
