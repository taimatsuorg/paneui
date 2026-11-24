#!/usr/bin/env node
/**
 * Static design checks for projects built on PaneUI.
 *
 *   node <skill>/scripts/check.mjs [paths…] [--strict] [--quiet] [--json] [--rules a,b] [--list]
 *
 *   paths      files or folders (default: app, src, apps, packages, components, registry, lib, content, skills
 *              and registry.json, whichever exist)
 *   --strict   exit 1 on warnings too (default: errors only)
 *   --quiet    print errors only
 *   --json     machine-readable output
 *   --rules    run only these rule ids
 *   --list     print the rules and exit
 *   --self-test  check the skill's examples/<rule>/{bad,good}.tsx against their rule
 *
 * No dependencies. TypeScript, when the project has it, gives exact JSX checks (nesting,
 * comments, text); without it, or with a native compiler build that has no parser API
 * (TypeScript 7), the class checks fall back to quoted strings.
 *
 * Config (optional) in paneui-design.config.json at the project root:
 *   {
 *     "theme": "app/globals.css",
 *     "ignore": ["**\/generated\/**"],
 *     "pressScale": ["expanding-arrow-button"],          // file names allowed a press scale
 *     "rtl": true,                                        // check that directional icons flip
 *     "names": ["acme"],                                  // words that must not appear in prose
 *     "nameHashes": ["<sha256 prefix>"],                  // same, stored as hashes (see --hash)
 *     "allow": [{ "rule": "type-scale", "file": "blocks/card/**", "reason": "card art" }]
 *   }
 * One line: put `design-check-ignore <rule> -- <reason>` in a comment on the line above.
 */
import { checkNativeSource } from "./native-checks.mjs"
import { createHash } from "node:crypto"
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import path from "node:path"

const cwd = process.cwd()
const argv = process.argv.slice(2)
const flag = (f) => argv.includes(f)
const opt = (f) => {
  const i = argv.indexOf(f)
  return i >= 0 ? argv[i + 1] : undefined
}
const optValues = new Set([opt("--rules"), opt("--hash")].filter(Boolean))
const inputs = argv.filter((a) => !a.startsWith("--") && !optValues.has(a))

/* ────────────────────────────── rules ────────────────────────────── */

const RULES = {
  "native-colors": ["error", "Native style colours come from semantic tokens."],
  "native-touch-target": ["error", "Native controls have a 44px minimum effective target."],
  "native-font-scaling": ["error", "Native text respects system font scaling."],
  "native-accessibility": ["error", "Native primitives expose roles and accessible names."],
  "native-radius": ["error", "Native radius stays within the shared cap."],
  "platform-boundary": ["error", "Shared source has no platform dependencies; Native has no Web dependencies."],
  "no-palette-colors": ["error", "Colours come from theme tokens, never the Tailwind palette."],
  "no-hex-colors": ["error", "No hex or rgb literals in classes or component CSS; add a token."],
  "on-solid-text": ["error", "Text on a solid uses its *-foreground token, never text-white."],
  "radius-cap": ["error", "Nothing is rounder than 16px: no rounded-4xl/5xl, no arbitrary radius above 1rem."],
  "radius-literal": ["warn", "Radii derive from --radius: use a token or calc(var(--radius)*k)."],
  "concentric-radius": ["warn", "A child inside a padded rounded container is concentric: inner = outer − padding."],
  "type-scale": ["error", "Font sizes come from the scale (text-ui-2xs…text-ui-lg, text-sm…); no text-[Npx]."],
  "tracking": ["warn", "Negative tracking only from text-xl up; wide tracking only on uppercase labels and shortcuts."],
  "no-press-scale": ["error", "Standard controls answer a press with a fill change, not a scale."],
  "no-transition-all": ["error", "Transition named properties, never all."],
  "icon-source": ["error", "Icons come from the house icon set; brand marks from per-logo imports."],
  "menu-label-group": ["error", "A menu, select or combobox label sits inside its group."],
  "copy-description": ["error", "A registry description is one plain sentence of 12 words or fewer."],
  "copy-colon-list": ["warn", "Never write the colon-list pattern (\"X: a, b, c and d\")."],
  "copy-adjectives": ["warn", "No stacked adjectives (complete, powerful, seamless…)."],
  "forbidden-names": ["error", "No third-party names or provenance in comments, copy or prose."],
  "registry-name-collision": ["warn", "A template part's file name must not equal a registry item name."],
  "upgrade": ["warn", "The installed theme is current (stale tokens, missing radius cap)."],
  // Polish rules (references/polish.md).
  "tabular-nums": ["warn", "Numbers that change on screen use tabular-nums so the layout doesn't shift."],
  "text-wrap": ["warn", "Headings balance (text-balance); code and preformatted text never balance or pretty-wrap."],
  "font-smoothing": ["warn", "Antialiased text is set once on the root, never per element."],
  "border-and-shadow": ["warn", "A shadowed surface has no CSS border: the shadow level carries the hairline."],
  "media-outline": ["warn", "Images and video get the media-outline hairline so they sit on any surface."],
  "hit-area": ["warn", "Controls under 24px extend their hit area with a pseudo-element (44px under a coarse pointer)."],
  "keyframes-on-state": ["warn", "Hover, open and toggle states use transitions (interruptible), not keyframe animations."],
  "press-scale-floor": ["error", "Where a press scale is allowed it is 0.96, never below 0.95."],
  "spring-bounce": ["error", "Springs are bounce-free (bounce 0)."],
  "spring-damping": ["warn", "Stiffness/damping springs stay near critical damping (ratio 0.6 or more), so they settle without wobble."],
  "presence-initial": ["warn", "AnimatePresence around a state swap takes initial={false} so nothing animates on load."],
  "exit-subtle": ["warn", "Exits are smaller than entrances: a short fixed offset, no deep scale-down."],
  "icon-swap": ["warn", "A state icon swap cross-fades (opacity, scale 0.25, blur 4px) instead of cutting."],
  "icon-stroke": ["warn", "House icons keep their stroke tiers; don't override strokeWidth per instance."],
  "icon-weight": ["warn", "A line icon beside semibold or bold text takes the bold stroke tier (icon-bold on the text, or weight=\"bold\")."],
  "nav-active-icon": ["warn", "An active nav item without a row fill swaps to the filled glyph (activeIcon={<NameFilledIcon />})."],
  "text-align-logical": ["warn", "Align text with text-start / text-end so it follows the reading direction; text-left / text-right only for physical alignment."],
  "icon-size": ["warn", "Icons render on their grid sizes (12, 14, 16, 18, 20, 24px…), not arbitrary fractions."],
  "icon-color": ["warn", "SVG glyphs paint with currentColor or a token; states come from CSS, not separate colours."],
  "icon-rtl": ["warn", "Directional icons flip in right-to-left (rtl:-scale-x-100). Opt in with \"rtl\": true."],
  "optical-icon-padding": ["warn", "A Button with an icon and a label marks the icon data-icon=\"inline-start|inline-end\" so that side's padding trims 2px."],
  "icon-button-label": ["error", "An icon-only button has an accessible name (aria-label or sr-only text)."],
  "will-change": ["error", "will-change only names compositor properties (transform, opacity, filter), never all."],
  "motion-restraint": ["warn", "High-frequency interactions (hover) get a quick fill or opacity change, not a long or keyframed animation."],
  "viewport-zoom": ["error", "Never turn off zoom for the whole page; lock it only while a field has focus (IosZoomLock)."],
}

if (flag("--list")) {
  for (const [id, [level, text]] of Object.entries(RULES)) console.log(`${id.padEnd(26)} ${level.padEnd(6)} ${text}`)
  process.exit(0)
}
if (opt("--hash")) {
  console.log(hashTerm(opt("--hash")))
  process.exit(0)
}

const only = opt("--rules") ? new Set(opt("--rules").split(",")) : null
const on = (id) => !only || only.has(id)

/* ────────────────────────────── config ────────────────────────────── */

const config = readJson(path.join(cwd, "paneui-design.config.json")) ?? {}
const PRESS_SCALE_OK = new Set([
  // Components whose motion is the point; everything else answers a press with a fill.
  "expandable-control", "card-folder", "message-bubble",
  ...(config.pressScale ?? []),
])
const IGNORE_DIRS = new Set(["node_modules", ".next", "out", "dist", "build", "public", ".git", ".agents", ".claude", ".turbo", "coverage", ".expo"])
const ignoreGlobs = (config.ignore ?? []).map(globToRegExp)
const allow = (config.allow ?? []).map((a) => ({ ...a, re: a.file ? globToRegExp(a.file) : null }))

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"))
  } catch {
    return null
  }
}

function globToRegExp(glob) {
  let re = ""
  let brace = 0
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]
    if (c === "{") {
      re += "(?:"
      brace++
    } else if (c === "}" && brace) {
      re += ")"
      brace--
    } else if (c === "," && brace) re += "|"
    else if (c === "*" && glob[i + 1] === "*") {
      re += ".*"
      i++
      if (glob[i + 1] === "/") i++
    } else if (c === "*") re += "[^/]*"
    else if (c === "?") re += "[^/]"
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&")
  }
  return new RegExp(`(^|/)${re}$`)
}

// Globs in the config use forward slashes; path.relative returns backslashes on Windows.
const relPath = (p) => path.relative(cwd, p).replace(/\\/g, "/")

/* ────────────────────────────── findings ────────────────────────────── */

const findings = []
function report(rule, file, line, message) {
  if (!on(rule)) return
  const rel = relPath(file) || file
  if (allow.some((a) => (a.rule === rule || a.rule === "*") && (!a.re || a.re.test(rel)) && (!a.match || message.includes(a.match)))) return
  const lines = fileLines.get(file)
  const above = lines?.[line - 2] ?? ""
  if (new RegExp(`design-check-ignore\\s+(${rule}|all)\\b`).test(above) || new RegExp(`design-check-ignore\\s+(${rule}|all)\\b`).test(lines?.[line - 1] ?? "")) return
  const key = `${rule}\u0000${rel}\u0000${line}\u0000${message}`
  if (seenFindings.has(key)) return
  seenFindings.add(key)
  findings.push({ rule, level: RULES[rule][0], file: rel, line, message })
}
const seenFindings = new Set()
const fileLines = new Map()

/* ────────────────────────────── files ────────────────────────────── */

const DEFAULT_ROOTS = ["app", "src", "apps", "packages", "components", "registry", "lib", "content", "skills", "registry.json"]
const roots = (inputs.length ? inputs : DEFAULT_ROOTS).map((p) => path.resolve(cwd, p)).filter((p) => fs.existsSync(p))
const EXTS = /\.(tsx|ts|jsx|js|mjs|cjs|css|md|mdx)$/
const files = []
function walk(p) {
  const st = fs.statSync(p)
  if (st.isDirectory()) {
    if (IGNORE_DIRS.has(path.basename(p))) return
    for (const f of fs.readdirSync(p)) walk(path.join(p, f))
    return
  }
  const rel = relPath(p)
  if (ignoreGlobs.some((g) => g.test(rel))) return
  if (/\.generated\.|\.d\.ts$|\.min\./.test(p)) return
  if (p.endsWith("registry.json") || EXTS.test(p)) files.push(p)
}
roots.forEach(walk)

/* ────────────────────────────── TypeScript (optional) ────────────────────────────── */

// Only the classic compiler API works here. Native compiler builds (TypeScript 7+) ship no
// `createSourceFile` / `ScriptKind`, so they count as missing and the regex checks run instead.
const hasClassicApi = (mod) => {
  try {
    return classicApi(mod)
  } catch {
    return false
  }
}
const classicApi = (mod) =>
  !!mod &&
  typeof mod.createSourceFile === "function" &&
  typeof mod.createScanner === "function" &&
  typeof mod.forEachChild === "function" &&
  !!mod.ScriptKind &&
  mod.ScriptKind.TSX !== undefined &&
  !!mod.SyntaxKind &&
  !!mod.ScriptTarget &&
  !!mod.LanguageVariant
const safeGet = (mod, key) => {
  try {
    return mod?.[key]
  } catch {
    return undefined
  }
}
let tsNote = "TypeScript not found"
function loadTs() {
  for (const from of [path.join(cwd, "package.json"), import.meta.url]) {
    let mod
    try {
      mod = createRequire(from)("typescript")
    } catch {
      continue
    }
    if (hasClassicApi(mod)) return mod
    if (hasClassicApi(safeGet(mod, "default"))) return mod.default
    const version = typeof safeGet(mod, "version") === "string" ? `${mod.version} ` : ""
    tsNote = `TypeScript ${version}has no classic compiler API`
  }
  return null
}
const ts = loadTs()

/* ────────────────────────────── class checks ────────────────────────────── */

const PALETTE =
  /(?:^|[\s:])-?(?:bg|text|border(?:-[trblxyse])?|ring|ring-offset|inset-ring|fill|stroke|from|to|via|outline|shadow|divide|decoration|caret|accent|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)\b/
const HEX_CLASS = /\[(?:[a-z-]+:)?(?:#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/
const RADIUS_TOKEN = /(?:^|[\s:])rounded(?:-[trblse]{1,2})?-(4xl|5xl)\b/
const RADIUS_ARB = /(?:^|[\s:])rounded(?:-[trblse]{1,2})?-\[(\d*\.?\d+)(px|rem)\]/g
// em sizes stay relative to the surrounding text (inline code, superscripts), so they pass.
const TEXT_ARB = /(?:^|[\s:])text-\[(?:length:)?(\d*\.?\d+)(px|rem)\]/
const ICON_PKGS = /^(lucide-react|@heroicons\/react|react-icons|@tabler\/icons-react|@phosphor-icons\/react|@radix-ui\/react-icons|@remixicon\/react|react-feather)(\/|$)/
const CLASSY = /^[\w!:\-[\]/.()%#,&>*@=+'~|^$<]+$/

function looksLikeClasses(s) {
  const t = s.trim()
  if (!t || t.length > 2000) return false
  const tokens = t.split(/\s+/)
  return tokens.every((x) => CLASSY.test(x)) && tokens.some((x) => /-|^(flex|grid|hidden|block|uppercase|truncate)$/.test(x))
}

const SIZE_ORDER = { "ui-2xs": 0, "ui-xs": 1, "ui-sm": 2, ui: 3, "ui-lg": 4, xs: 1, sm: 3, base: 4, lg: 5, xl: 6, "2xl": 7, "3xl": 8, "4xl": 9, "5xl": 10, "6xl": 11, "7xl": 12, "8xl": 13, "9xl": 14 }

function checkClasses(s, file, line) {
  const base = path.basename(file).replace(/\.\w+$/, "")
  if (PALETTE.test(s)) report("no-palette-colors", file, line, `"${s.match(PALETTE)[0].trim()}" is a palette colour; use a token (foreground, muted-foreground, primary, success, chart-N…).`)
  if (HEX_CLASS.test(s)) report("no-hex-colors", file, line, "Arbitrary colour literal in a class; add a token to the theme instead.")
  const tokens = s.split(/\s+/)
  if (tokens.includes("bg-primary") && tokens.includes("text-white")) report("on-solid-text", file, line, "bg-primary with text-white: use text-primary-foreground.")
  const rt = s.match(RADIUS_TOKEN)
  if (rt) report("radius-cap", file, line, `rounded-${rt[1]} is only an alias at the 16px cap; use rounded-3xl (or rounded-full).`)
  for (const m of s.matchAll(RADIUS_ARB)) {
    const px = parseFloat(m[1]) * (m[2] === "rem" ? 16 : 1)
    if (px > 16) report("radius-cap", file, line, `rounded-[${m[1]}${m[2]}] is above the 16px cap.`)
    else if (px > 2) report("radius-literal", file, line, `rounded-[${m[1]}${m[2]}] ignores --radius; use a token or rounded-[calc(var(--radius)*k)].`)
  }
  const ta = s.match(TEXT_ARB)
  if (ta) report("type-scale", file, line, `text-[${ta[1]}${ta[2]}] is off the type scale; use text-ui-2xs…text-ui-lg (10–14px) or text-sm and up for reading copy.`)
  const size = tokens.map((t) => t.match(/^text-(ui(?:-(?:2xs|xs|sm|lg))?|xs|sm|base|lg|[2-9]?xl)$/)?.[1]).find(Boolean)
  const neg = tokens.find((t) => /^(-?tracking-(tight|tighter)|tracking-\[-)/.test(t))
  if (neg && size !== undefined && SIZE_ORDER[size] < SIZE_ORDER.xl) report("tracking", file, line, `${neg} on text-${size}: negative tracking only from text-xl up.`)
  const wide = tokens.find((t) => /^(tracking-(wide|wider|widest)|tracking-\[0?\.)/.test(t))
  if (wide && !tokens.includes("uppercase") && !/shortcut|kbd/.test(s)) report("tracking", file, line, `${wide} on mixed-case text; keep the font's tracking.`)
  if (/(?:^|\s)(?:[\w-]+:)*active:(?:-?scale|scale-)/.test(s) && !PRESS_SCALE_OK.has(base)) report("no-press-scale", file, line, "active:scale on a control; answer the press with a fill (bg-secondary / -hover / -active) instead.")
  if (/(?:^|\s)(?:[\w-]+:)*transition-all\b/.test(s)) report("no-transition-all", file, line, "transition-all: name the properties (transition-colors, transition-[box-shadow,background-color]).")
  checkPolishClasses(s, tokens, file, line)
}

/* ────────────────────────────── polish checks (classes) ────────────────────────────── */

const COMPOSITED = new Set(["transform", "opacity", "filter", "translate", "scale", "rotate", "backdrop-filter", "scroll-position", "auto"])
const SHADOW_LEVEL = /^shadow-(raised|surface|well|chip|primary|sm|md|lg|xl|2xl)$/
const STATE_VARIANT = /(?:^|:)(?:group-|peer-)?(?:hover|focus|focus-visible|active|open|data-(?:open|closed|checked|unchecked|active|pressed|expanded|state)|data-\[(?:state|open|checked|pressed|expanded)[^\]]*\]|aria-(?:expanded|pressed|checked|selected)):/

function checkPolishClasses(s, tokens, file, line) {
  const base = path.basename(file).replace(/\.\w+$/, "")
  for (const t of tokens) {
    const wc = t.match(/(?:^|:)will-change-(?:\[([^\]]+)\]|(\w+))$/)
    if (wc) {
      const props = (wc[1] ?? wc[2]).split(",").map((x) => x.trim())
      if (props.includes("all")) report("will-change", file, line, `${t}: never will-change all; name transform, opacity or filter.`)
      else {
        const bad = props.filter((x) => !COMPOSITED.has(x))
        if (bad.length) report("will-change", file, line, `${t}: ${bad.join(", ")} can't be composited, so the hint only costs memory.`)
      }
    }
    // Press scale below 0.95, even where a press scale is allowed.
    const ps = t.match(/(?:^|:)active:-?scale(?:-[xy])?-(?:\[(0?\.\d+)\]|(\d+))$/)
    if (ps) {
      const v = ps[1] ? parseFloat(ps[1]) : parseInt(ps[2], 10) / 100
      if (v < 0.95 && PRESS_SCALE_OK.has(base)) report("press-scale-floor", file, line, `${t}: a press scale is 0.96 (scale-[0.96]); below 0.95 it looks like a bug.`)
    }
    if (/(?:^|:)animate-(?!none$)[\w[\]-]+$/.test(t)) {
      if (/(?:^|:)(?:group-|peer-)?hover:/.test(t)) report("motion-restraint", file, line, `${t}: a keyframe animation on hover replays on every pass; use a transition-colors / opacity change at duration-150.`)
      // Loops (spinners, pulses) shown in a state are fine; a one-shot keyframe per state is not.
      else if (STATE_VARIANT.test(t) && !/^motion-/.test(t) && !/animate-(spin|pulse|ping|bounce)$/.test(t)) report("keyframes-on-state", file, line, `${t}: keyframes restart when the state flips mid-way; drive the state with a transition (data-starting-style / data-ending-style or transition-[…]).`)
    }
  }
  // A full CSS border on a surface that already has a shadow level (rule 4).
  const border = tokens.find((t) => /^border(?:-[0-9.]+|-\[[^\]]+\])?$/.test(t))
  const shadow = tokens.find((t) => SHADOW_LEVEL.test(t))
  if (border && shadow && !tokens.some((t) => /^border-(0|none|transparent)$/.test(t)))
    report("border-and-shadow", file, line, `${border} with ${shadow}: the shadow level already draws the hairline; drop the border (dividers stay border-b / border-t).`)
  // Long transitions on hover-only styles.
  const dur = tokens.map((t) => t.match(/^duration-(\d+)$/)?.[1]).find(Boolean)
  if (dur && Number(dur) >= 300 && tokens.some((t) => /^(?:group-)?hover:/.test(t)) && !tokens.some((t) => STATE_VARIANT.test(t) && !/^(?:group-)?hover:/.test(t)) && !/\b(open|expanded|closed|starting|ending)\b/.test(s))
    report("motion-restraint", file, line, `duration-${dur} on a hover style: hover answers within 150ms.`)
  // Icons styled through [&_svg] in a semibold/bold class list take the bold stroke tier.
  if (tokens.some((t) => /^font-(semibold|bold|extrabold|black)$/.test(t)) && tokens.some((t) => /^\[&(?:_|>)svg/.test(t)) && !tokens.some((t) => /^icon-(bold|regular)$/.test(t)))
    report("icon-weight", file, line, "font-semibold with icons styled by [&_svg]: add icon-bold so the line icons take the bold stroke tier.")
  // Physical text alignment flips the wrong way in right-to-left.
  const phys = tokens.find((t) => /^(?:\S*:)?text-(left|right)$/.test(t) && !/(?:^|:)(?:ltr|rtl):/.test(t))
  if (phys) report("text-align-logical", file, line, `${phys}: use ${phys.replace(/text-left$/, "text-start").replace(/text-right$/, "text-end")} so the alignment follows the reading direction.`)
  if (tokens.includes("subpixel-antialiased")) report("font-smoothing", file, line, "subpixel-antialiased per element makes this text heavier than the rest; smoothing is set once on the root.")
}

/* ────────────────────────────── prose checks ────────────────────────────── */

// "complete" only as filler before a noun ("a complete set"), not as a state ("once complete").
const ADJECTIVES = /(?<!\b(?:once|when|is|are|be|to|on|goes|marked|as)\s)\bcomplete(?=\s+[a-z]{3,})|\b(comprehensive|powerful|seamless(ly)?|robust|beautiful(ly)?|modern|flexible|fully[- ]featured|blazing(ly)?[- ]fast|blazing|stunning|cutting[- ]edge|best[- ]in[- ]class|world[- ]class)\b/i
const COLON_LIST = /:\s+[^.:;!?]+?,\s+[^.:;!?]+?(?:,\s+[^.:;!?]+?)*,?\s+(?:and|or)\s+[^.:;!?]+/
const PROVENANCE = /\b(inspired by|port of|modell?ed (?:on|after))\b/i

function hashTerm(t) {
  return createHash("sha256").update(t.toLowerCase().trim()).digest("hex").slice(0, 12)
}
const NAME_TERMS = new Set((config.names ?? []).map((n) => n.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()))
const NAME_HASHES = new Set(config.nameHashes ?? [])

function stripSpecifiers(text) {
  return text
    .replace(/`[^`]*`/g, " ") // inline code is an identifier
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/(["'`])[@\w.-]+\/[\w./@-]*\1/g, " ") // package specifiers and paths in quotes
    .replace(/(?:^|\s)@[\w-]+\/[\w./-]+/g, " ") // bare @scope/pkg
}

function checkNames(text, file, line) {
  if (!NAME_TERMS.size && !NAME_HASHES.size) {
    const p = text.match(PROVENANCE)
    if (p) report("forbidden-names", file, line, `"${p[0]}": describe what the thing does, not where it came from.`)
    return
  }
  const words = stripSpecifiers(text).toLowerCase().match(/[a-z0-9]+/g) ?? []
  const p = text.match(PROVENANCE)
  if (p) report("forbidden-names", file, line, `"${p[0]}": describe what the thing does, not where it came from.`)
  for (let i = 0; i < words.length; i++) {
    for (const term of [words[i], i + 1 < words.length ? `${words[i]} ${words[i + 1]}` : null]) {
      if (!term) continue
      if (NAME_TERMS.has(term) || NAME_HASHES.has(hashTerm(term))) {
        report("forbidden-names", file, line, `Third-party name "${term}" in prose; describe the thing instead (licence notices only in THIRD_PARTY_NOTICES.md).`)
        return
      }
    }
  }
}

function checkCopy(text, file, line, kind) {
  const a = text.match(ADJECTIVES)
  if (a) report("copy-adjectives", file, line, `"${a[0]}" in a ${kind}; say what it does.`)
  if (COLON_LIST.test(text)) report("copy-colon-list", file, line, `Colon list in a ${kind}; let the preview or the API table carry the list.`)
}

/* ────────────────────────────── source files ────────────────────────────── */

const RADIUS_PX = { none: 0, xs: 2, "2xs": 2, sm: 4, md: 6, lg: 8, xl: 10, "2xl": 12, "3xl": 16, "4xl": 16, "5xl": 16, shell: 12 }
const LABEL_GROUP = /^(Menu|ContextMenu|DropdownMenu|Menubar|Select|MorphSelect|Combobox)(Group)?Label$/

function boxOf(classes) {
  let radius = null, pad = null, inner = false
  for (const t of classes.split(/\s+/)) {
    if (t.includes(":")) continue
    let m
    if ((m = t.match(/^(?:rounded|frame)-(none|xs|2xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|shell)$/))) radius = RADIUS_PX[m[1]]
    else if (t === "rounded-inner" || t.startsWith("rounded-inner-") || t === "frame-inner" || t === "rounded-[inherit]") inner = true
    else if ((m = t.match(/^(?:p|frame-p)-([\d.]+)$/))) pad = parseFloat(m[1]) * 4
  }
  return { radius, pad, inner }
}

function checkSourceTs(file, text) {
  const kind = /\.tsx$/.test(file) ? ts.ScriptKind.TSX : /\.jsx$/.test(file) ? ts.ScriptKind.JSX : /\.ts$/.test(file) ? ts.ScriptKind.TS : ts.ScriptKind.JS
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind)
  const relative = relPath(file)
  const matches = (patterns) => (patterns ?? []).some((pattern) => globToRegExp(pattern).test(relative))
  const native = matches(config.platforms?.native) || /\.native\.[jt]sx?$/.test(file) || sf.statements.some((node) => ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && /^(react-native|@paneui\/ui-native)(?:\/|$)/.test(node.moduleSpecifier.text))
  checkNativeSource(ts, sf, { native, shared: matches(config.platforms?.shared), report })
  const lineOf = (pos) => sf.getLineAndCharacterOfPosition(pos).line + 1

  // Comments, from the scanner so strings and regexes never read as comments.
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, kind === ts.ScriptKind.TSX || kind === ts.ScriptKind.JSX ? ts.LanguageVariant.JSX : ts.LanguageVariant.Standard, text)
  for (let tok = scanner.scan(); tok !== ts.SyntaxKind.EndOfFileToken; tok = scanner.scan()) {
    if (tok === ts.SyntaxKind.SingleLineCommentTrivia || tok === ts.SyntaxKind.MultiLineCommentTrivia) {
      const c = scanner.getTokenText()
      if (/design-check-ignore/.test(c)) continue
      const start = lineOf(scanner.getTokenPos())
      c.split("\n").forEach((l, i) => checkNames(l, file, start + i))
    }
  }

  const classAttr = (el) => {
    const attr = el.attributes?.properties?.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === "className")
    if (!attr?.initializer) return ""
    const parts = []
    const visit = (n) => {
      if (ts.isStringLiteralLike(n)) parts.push(n.text)
      else if (ts.isTemplateExpression(n)) {
        parts.push(n.head.text)
        n.templateSpans.forEach((s) => parts.push(s.literal.text))
      }
      ts.forEachChild(n, visit)
    }
    visit(attr.initializer)
    return parts.join(" ")
  }
  const tagName = (n) => (ts.isJsxElement(n) ? n.openingElement.tagName.getText(sf) : ts.isJsxSelfClosingElement(n) ? n.tagName.getText(sf) : null)
  const opening = (n) => (ts.isJsxElement(n) ? n.openingElement : ts.isJsxSelfClosingElement(n) ? n : null)

  const visit = (node, ancestors) => {
    // Imports: icon packages.
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const spec = node.moduleSpecifier.text
      if (ICON_PKGS.test(spec)) report("icon-source", file, lineOf(node.getStart(sf)), `"${spec}": use the house icon set (components/icons) for glyphs.`)
      if ((spec === "@ridemountainpig/svgl-react" || spec === "simple-icons") && node.importClause?.namedBindings && ts.isNamespaceImport(node.importClause.namedBindings))
        report("icon-source", file, lineOf(node.getStart(sf)), "import * from the brand icon package pulls in every logo; import each logo by name.")
      return
    }
    if (ts.isExportDeclaration(node) || ts.isExternalModuleReference?.(node)) return
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText?.(sf) === "require")) return

    // Strings: class lists and prose.
    if (ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      const s = node.text
      const line = lineOf(node.getStart(sf))
      const parent = node.parent
      const key = (
        (parent && ts.isPropertyAssignment(parent) && parent.name.getText(sf)) ||
        (parent && ts.isJsxAttribute(parent) && parent.name.getText(sf)) ||
        (parent && ts.isJsxExpression(parent) && ts.isJsxAttribute(parent.parent) && parent.parent.name.getText(sf)) ||
        ""
      ).replace(/["']/g, "")
      // Markup and CSS held in strings are code, not copy.
      const code = /<[a-z][\w-]*[\s>]|\{[^}]*?[\w-]+\s*:[^;{}]+;/.test(s)
      if (looksLikeClasses(s)) checkClasses(s, file, line)
      else if (!code && !/^(type|name|default|id|href|src|value|lang|language|className)$/.test(key) && /\s/.test(s) && /[a-z]{3}/i.test(s)) {
        checkNames(s, file, line)
        if (/^(description|lede|summary)$/.test(key)) checkCopy(s, file, line, key)
      }
    }
    if (ts.isJsxText(node)) {
      const s = node.getText(sf)
      if (s.trim()) s.split("\n").forEach((l, i) => l.trim() && checkNames(l, file, lineOf(node.getStart(sf)) + i))
    }

    // JSX: motion press scale, concentric radius, menu labels.
    if (ts.isJsxAttribute(node) && node.name.getText(sf) === "whileTap" && /scale/.test(node.initializer?.getText(sf) ?? "")) {
      const base = path.basename(file).replace(/\.\w+$/, "")
      if (!PRESS_SCALE_OK.has(base)) report("no-press-scale", file, lineOf(node.getStart(sf)), "whileTap scale on a control; answer the press with a fill instead.")
    }
    const name = tagName(node)
    if (name) {
      if (LABEL_GROUP.test(name)) {
        const family = name.replace(/(Group)?Label$/, "")
        const inGroup = ancestors.some((a) => {
          const n = tagName(a)
          return n === `${family}Group` || n === `${family}RadioGroup` || n === `${family}CheckboxGroup` || n === "Group"
        })
        if (!inGroup) report("menu-label-group", file, lineOf(node.getStart(sf)), `<${name}> outside <${family}Group>: the primitive throws at runtime. Wrap the label and its items in a group.`)
      }
      if (ts.isJsxElement(node)) {
        const outer = boxOf(classAttr(node.openingElement))
        if (outer.radius != null && outer.pad) {
          const want = Math.max(outer.radius - outer.pad, 0)
          if (want >= 4)
            for (const child of node.children) {
              const o = opening(child)
              if (!o) continue
              const box = boxOf(classAttr(o))
              if (box.inner || box.radius == null || Math.abs(box.radius - want) <= 2) continue
              report("concentric-radius", file, lineOf(o.getStart(sf)),
                `${box.radius}px inside a ${outer.radius}px container with ${outer.pad}px padding: concentric is ${want}px. Put frame-* on the container and rounded-inner on the child.`)
            }
        }
      }
    }
    if (name) checkPolishJsx(node, name, ancestors)
    if (ts.isConditionalExpression(node)) {
      const branch = (b) => {
        while (b && ts.isParenthesizedExpression(b)) b = b.expression
        return b && tagName(b)
      }
      const a = branch(node.whenTrue), b = branch(node.whenFalse)
      const inChildren = ts.isJsxExpression(node.parent) && (ts.isJsxElement(node.parent.parent) || ts.isJsxFragment(node.parent.parent))
      const stateful = /copied|open|expand|collaps|active|show|reveal|visible|checked|selected|playing|paused|muted|done|complete|loading|pending|busy|liked|saved|pinned|starred|enabled|dark|theme|on\b|toggled|status|phase|success/i.test(node.condition.getText(sf))
      if (a && b && a !== b && /Icon$/.test(a) && /Icon$/.test(b) && inChildren && stateful) {
        const animated = ancestors.some((x) => /^(AnimatePresence|motion\.|m\.|\w*Swap\w*)/.test(tagName(x) ?? "") || /\b(transition-|animate-)/.test(classAttr(opening(x)) ?? ""))
        if (!animated) report("icon-swap", file, lineOf(node.getStart(sf)), `<${a}> / <${b}> swap cuts between glyphs; cross-fade them (both in the DOM, opacity + scale 0.25 + blur 4px, or AnimatePresence initial={false}).`)
      }
    }
    const next = name ? [...ancestors, node] : ancestors
    ts.forEachChild(node, (c) => visit(c, next))
  }

  // One side of `cond ? <A/> : <B/>`: the element is swapped for another, not removed.
  function isSwapBranch(n) {
    let p = n.parent
    while (p && ts.isParenthesizedExpression(p)) p = p.parent
    return !!p && ts.isConditionalExpression(p)
  }

  /* Polish checks on one JSX element. */
  function checkPolishJsx(node, name, ancestors) {
    const o = opening(node)
    if (!o) return
    const attrs = new Map()
    let spread = false
    for (const a of o.attributes.properties) {
      if (ts.isJsxSpreadAttribute(a)) spread = true
      else attrs.set(a.name.getText(sf), a.initializer ? (ts.isStringLiteral(a.initializer) ? a.initializer.text : a.initializer.getText(sf)) : "true")
    }
    const cls = classAttr(o)
    const toks = cls.split(/\s+/).filter(Boolean)
    const chain = () => [cls, ...ancestors.map((x) => classAttr(opening(x)))].join(" ")
    const at = lineOf(o.getStart(sf))
    const kids = ts.isJsxElement(node) ? node.children.filter((c) => !(ts.isJsxText(c) && !c.getText(sf).trim())) : []
    const intrinsic = /^[a-z]/.test(name)

    // Changing numbers: a JSX child expression that formats or names a number.
    for (const c of kids) {
      if (!ts.isJsxExpression(c) || !c.expression) continue
      const e = c.expression.getText(sf)
      if (/^(children|props\.children|label|title|name|text|description)$/.test(e)) continue
      // Only a plain value or a formatter call: no markup, callbacks, branches or string building.
      if (e.length > 60 || /\.\.\.|\{|<|=>|\?|&&|\|\||`|["']/.test(e) || /\.(map|filter|length\b)/.test(e)) continue
      if (NUMERIC_EXPR.test(e) && !/\b(tabular-nums|font-mono|font-code|slashed-zero|sr-only)\b/.test(chain()) && !/^(NumberFlow|Counter|DigitSwap|AnimatedNumber|SlidingNumber|Kbd|Badge|\w*Count|\w*Number)$/.test(name))
        report("tabular-nums", file, lineOf(c.getStart(sf)), `{${e.length > 40 ? e.slice(0, 40) + "…" : e}} changes on screen; add tabular-nums to <${name}> so the digits keep their width.`)
    }

    // Headings balance; code never balances.
    if (/^h[1-3]$/.test(name) && toks.some((t) => /^text-(sm|base|lg|[2-9]?xl|ui(-lg)?)$/.test(t)) && !toks.some((t) => /^(text-balance|text-pretty|text-nowrap|truncate|line-clamp-\d+|whitespace-nowrap|text-wrap|sr-only)$/.test(t)))
      report("text-wrap", file, at, `<${name}> without text-balance: a heading that wraps leaves one word on the last line.`)
    if (/^(pre|code)$/.test(name) && toks.some((t) => /^text-(balance|pretty)$/.test(t)))
      report("text-wrap", file, at, `text-balance / text-pretty on <${name}>: code keeps its own line breaks.`)

    // Media hairline.
    if ((name === "img" || name === "video" || name === "Image" || name === "picture") && !/\bmedia-outline\b/.test(chain()) && attrs.get("aria-hidden") !== "true" && !attrs.has("data-no-outline"))
      report("media-outline", file, at, `<${name}> without media-outline: add the class (a 1px inset black/10, white/10 in dark) so the image edge holds on any surface.`)

    // Hit area under 24px on an interactive element.
    const interactive = (intrinsic && (name === "button" || (name === "a" && attrs.has("href")) || attrs.get("role") === "button")) || (!intrinsic && /(^|\.)(Root|Trigger|Thumb)$/.test(name) && /Checkbox|Radio|Switch|Toggle/.test(name))
    if (interactive) {
      const px = sizePx(toks)
      const extended = toks.some((t) => /^(after|before):(absolute|-?inset|size-|h-|w-|-m)/.test(t)) || /\bhit-area\b/.test(cls)
      if (px != null && px < 24 && !extended)
        report("hit-area", file, at, `<${name}> is ${px}px: extend the target to 24px with a pseudo-element (after:absolute after:-inset-1) and to 44px under pointer-coarse:, without overlapping a neighbour.`)
    }

    // Icon-only buttons need a name.
    const iconOnly = kids.length === 1 && (() => {
      const k = kids[0]
      const t = tagName(k)
      return !!t && /Icon$/.test(t)
    })()
    const isButton = name === "button" || name === "Button" || /IconButton$|Toggle$|ToolbarButton$/.test(name)
    if (isButton && (iconOnly || (/^icon/.test(attrs.get("size") ?? "") && kids.length === 0 && !attrs.has("children"))) && !spread && !["aria-label", "aria-labelledby", "title", "label", "render"].some((a) => attrs.has(a)))
      report("icon-button-label", file, at, `Icon-only <${name}> has no accessible name; add aria-label (and a Tooltip with the same text).`)

    // Root smoothing: the root layout's <html>/<body> (or the theme) sets antialiased.
    if ((name === "body" || name === "html") && /(^|\/)layout\.(tsx|jsx)$|_document\.(tsx|jsx)$/.test(file) && !THEME_SMOOTHS()) {
      if (name === "body" && !/\bantialiased\b/.test(chain()))
        report("font-smoothing", file, at, "The root layout doesn't set antialiased (and the theme stylesheet doesn't either); add it to <body> so text renders the same weight everywhere.")
    }

    // Icon + label in a Button: the icon side trims its padding (optical centring).
    if (name === "Button" && kids.length >= 2 && attrs.get("variant") !== "link") {
      const first = kids[0], last = kids[kids.length - 1]
      // A label: text, an expression, or an element that isn't a glyph or a key cap.
      const textLike = (k) => ts.isJsxText(k) || (ts.isJsxExpression(k) && !!k.expression && !tagName(k.expression)) || (!!tagName(k) && !/Icon$|^(Kbd|KbdGroup|svg|Spinner|Loader)$/.test(tagName(k)))
      for (const [k, side, other] of [[first, "inline-start", last], [last, "inline-end", first]]) {
        const t = tagName(k)
        if (!t || !/Icon$/.test(t) || !textLike(other)) continue
        const ko = opening(k)
        // On the icon itself, or on the glyphs inside a wrapper (an icon-swap component).
        const marked = ko.attributes.properties.some((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === "data-icon") || /\bdata-icon=/.test(k.getText(sf))
        if (!marked) report("optical-icon-padding", file, lineOf(k.getStart(sf)), `<${t}> beside a label: add data-icon="${side}" so the Button trims 2px on the icon side and the content looks centred.`)
      }
    }

    // House icons: stroke, size, colour.
    if (/Icon$/.test(name) && !intrinsic) {
      if (attrs.has("strokeWidth") || toks.some((t) => /^(stroke-\[|stroke-\d|\[stroke-width)/.test(t)))
        report("icon-stroke", file, at, `strokeWidth on <${name}>: strokes come in tiers, not per glyph; use weight="bold" (or icon-bold on the text) beside semibold text, or switch the icon style.`)
      const sz = toks.map((t) => t.match(/^(?:size|h|w)-\[(\d*\.?\d+)px\]$/)?.[1]).find(Boolean)
      if (sz && !ICON_GRID.has(Number(sz))) report("icon-size", file, at, `${sz}px icon: render on the grid (12, 14, 16, 18, 20, 24…) so strokes land on whole pixels.`)
      if (config.rtl && /^(Chevron|Arrow|Caret)(Left|Right)|^(Undo|Redo|Reply|Send|Forward|Back|LogOut|LogIn)\w*Icon$|^Corner\w*(Left|Right)Icon$|ArrowUpRight|ExternalLink/.test(name) && !/\brtl:/.test(chain()))
        report("icon-rtl", file, at, `<${name}> points in the reading direction; add rtl:-scale-x-100 so it flips in right-to-left.`)
    }
    // Stroke tier: a line icon whose nearest weighted text is semibold or bold.
    if (/Icon$/.test(name) && !intrinsic && !/FilledIcon$|LogoIcon$|^BrandIcon$/.test(name) && !attrs.has("weight") && !/\bicon-(bold|regular)\b/.test(cls)) {
      for (const a of [...ancestors].reverse()) {
        const at2 = classAttr(opening(a)).split(/\s+/)
        if (at2.some((t) => /^icon-(bold|regular)$/.test(t))) break
        const w = at2.map((t) => t.match(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)?.[1]).find(Boolean)
        if (!w) continue
        const texty = ts.isJsxElement(a) && a.children.some((c) => (ts.isJsxText(c) && c.getText(sf).trim()) || (ts.isJsxExpression(c) && !!c.expression && !tagName(c.expression)))
        if (/^(semibold|bold|extrabold|black)$/.test(w) && texty)
          report("icon-weight", file, at, `<${name}> beside font-${w} text: add icon-bold to the text's element (or weight="bold") so the stroke matches the type.`)
        break
      }
    }

    // Active nav item without a row fill: the filled glyph carries the state.
    if (name === "TabBarItem" && attrs.has("active") && attrs.get("active") !== "{false}" && attrs.has("icon") && !attrs.has("activeIcon") && !spread)
      report("nav-active-icon", file, at, `<TabBarItem active> keeps its outline glyph: the bar has no row fill, so pass activeIcon={<…FilledIcon />}.`)

    if (/^(svg|path|circle|rect|line|polyline|polygon|ellipse|g)$/.test(name))
      for (const k of ["fill", "stroke"]) {
        const v = attrs.get(k)
        if (v && /^(#|rgb|hsl|oklch\()|^(black|white|red|blue|green|gray|grey)$/i.test(v.replace(/^\{?["'`]?/, "")))
          report("icon-color", file, at, `${k}="${v}" on <${name}>: paint with currentColor (or a token var) and set the colour with a text-* class.`)
      }

    // AnimatePresence around a keyed swap.
    if (name === "AnimatePresence" && !attrs.has("initial")) {
      const keyed = kids.some((k) => {
        let e = k
        if (ts.isJsxExpression(e) && e.expression) e = e.expression
        const ko = opening(e)
        const key = ko?.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === "key")
        return !!key?.initializer && /\?|state|mode|active|status|copied|checked|open/.test(key.initializer.getText(sf))
      })
      if (keyed || /popLayout|wait/.test(attrs.get("mode") ?? ""))
        report("presence-initial", file, at, `<AnimatePresence> around a state swap without initial={false}: the current state animates in on page load.`)
    }

    // Icon swaps use one recipe; other exits stay small (no deep scale-down or full-height travel).
    const exit = attrs.get("exit")
    if (/^motion\./.test(name) && (exit || attrs.has("initial"))) {
      const only = kids.length === 1 ? kids[0] : null
      const onlyTag = only && (tagName(only) ?? (ts.isJsxExpression(only) && only.expression && /^(icon|Icon|glyph)\b|Icon\b/.test(only.expression.getText(sf)) ? "Icon" : null))
      const key = attrs.get("key") ?? ""
      const iconish = (!!onlyTag && /^(svg|Icon|\w+Icon)$/.test(onlyTag)) || (only && ts.isJsxExpression(only) && only.expression && ts.isConditionalExpression(only.expression) && /Icon\b/.test(only.expression.getText(sf)))
      if (iconish) {
        const scales = [attrs.get("initial"), exit].filter(Boolean).flatMap((v) => [...v.matchAll(/\bscale\s*:\s*(\d*\.?\d+)/g)].map((m) => parseFloat(m[1])))
        if (scales.some((v) => v !== 0.25 && v < 0.95))
          report("icon-swap", file, at, `Icon enters/exits at scale ${scales.find((v) => v !== 0.25)}: an icon swap starts from scale 0.25 with blur(4px) and opacity 0 (spring duration 0.3, bounce 0).`)
      } else if (exit && !/\?|status|phase|state/.test(key) && !isSwapBranch(node)) {
        const sc = exit.match(/\bscale\s*:\s*(\d*\.?\d+)/)
        if ((sc && parseFloat(sc[1]) < 0.9) || /\b[xy]\s*:\s*["'`]-?\d+%/.test(exit))
          report("exit-subtle", file, at, `exit ${exit.replace(/\s+/g, " ").slice(0, 60)}: leave with a short fixed offset (y: -8…-12) and opacity, shorter than the entrance.`)
      }
    }
  }
  visit(sf, [])
}

let themeSmooths
function THEME_SMOOTHS() {
  if (themeSmooths === undefined) {
    const css = themeFile()
    themeSmooths = !!css && /\bantialiased\b|-webkit-font-smoothing\s*:\s*antialiased/.test(fs.readFileSync(css, "utf8"))
  }
  return themeSmooths
}
const NUMERIC_EXPR = /(?:^|[^\w.])(?:count|total|price|amount|percent(?:age)?|progress|elapsed|remaining|seconds|secs|minutes|mins|duration|score|balance|quantity|qty|votes|likes|views|downloads|stars|unread(?:Count)?|tokens|cost|usage|files?Count|\w+Count|\w+Total)\b|\.toFixed\(|\.toLocaleString\(|NumberFormat|\bformat(?:Number|Currency|Price|Bytes|Size|Duration|Time|Elapsed|Percent|Count|Compact|Tokens|Cost)\w*\(|\bMath\.(?:round|floor|ceil)\(/
const ICON_GRID = new Set([10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 40, 48, 64])
const SPACING_PX = (n) => parseFloat(n) * 4
function sizePx(toks) {
  let w = null, h = null
  for (const t of toks) {
    if (t.includes(":")) continue
    let m
    if ((m = t.match(/^size-([\d.]+)$/))) w = h = SPACING_PX(m[1])
    else if ((m = t.match(/^size-\[(\d+)px\]$/))) w = h = Number(m[1])
    else if ((m = t.match(/^w-([\d.]+)$/))) w = SPACING_PX(m[1])
    else if ((m = t.match(/^h-([\d.]+)$/))) h = SPACING_PX(m[1])
  }
  return w != null && h != null ? Math.min(w, h) : null
}

function checkSourceText(file, text) {
  const lines = text.split("\n")
  const base = path.basename(file).replace(/\.\w+$/, "")
  lines.forEach((l, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(l)) return
    for (const m of l.matchAll(/\bbounce\s*:\s*(\d*\.?\d+)/g))
      if (parseFloat(m[1]) > 0) report("spring-bounce", file, i + 1, `bounce: ${m[1]}; springs are bounce-free (bounce: 0, or stiffness 380–520 / damping 26–42).`)
    const st = l.match(/\bstiffness\s*:\s*(\d+(?:\.\d+)?)/), dm = l.match(/\bdamping\s*:\s*(\d+(?:\.\d+)?)/)
    if (st && dm) {
      const mass = parseFloat(l.match(/\bmass\s*:\s*(\d*\.?\d+)/)?.[1] ?? "1")
      const ratio = parseFloat(dm[1]) / (2 * Math.sqrt(parseFloat(st[1]) * mass))
      if (ratio < 0.6) report("spring-damping", file, i + 1, `stiffness ${st[1]} / damping ${dm[1]}${mass !== 1 ? ` / mass ${mass}` : ""} is ${ratio.toFixed(2)} of critical damping and overshoots; raise damping to ${Math.ceil(1.6 * Math.sqrt(parseFloat(st[1]) * mass))} or more.`)
    }
    const tap = l.match(/whileTap\s*=\s*\{\{[^}]*\bscale\s*:\s*(\d*\.?\d+)/)
    if (tap && parseFloat(tap[1]) < 0.95 && PRESS_SCALE_OK.has(base)) report("press-scale-floor", file, i + 1, `whileTap scale ${tap[1]}: a press scale is 0.96; below 0.95 it looks like a bug.`)
    const vz = l.match(/\bmaximumScale\s*:\s*1(?:\.0*)?(?![\d.])|\buserScalable\s*:\s*false\b/) ??
      (/\bname\s*[=:]\s*["'`{]*viewport\b/.test(l) || /\bviewport\b.*\bcontent\s*[=:]/.test(l)
        ? l.match(/maximum-scale\s*=\s*1(?:\.0*)?(?![\d.])|user-scalable\s*=\s*(?:no|0)\b/)
        : null)
    if (vz) report("viewport-zoom", file, i + 1, `${vz[0]} turns off zoom for the whole page; drop it and mount IosZoomLock, which locks only while a field has focus.`)
    const wc = l.match(/willChange\s*:\s*["'`]([^"'`]+)["'`]/)
    if (wc) {
      const props = wc[1].split(",").map((x) => x.trim())
      if (props.includes("all")) report("will-change", file, i + 1, "willChange: all; name transform, opacity or filter.")
      else if (props.some((x) => !COMPOSITED.has(x))) report("will-change", file, i + 1, `willChange: ${wc[1]}; only transform, opacity and filter can be composited.`)
    }
  })
}

function checkSourcePlain(file, text) {
  text.split("\n").forEach((l, i) => {
    const line = i + 1
    const imp = l.match(/from\s+["']([^"']+)["']/)
    if (imp && ICON_PKGS.test(imp[1])) report("icon-source", file, line, `"${imp[1]}": use the house icon set (components/icons) for glyphs.`)
    if (/^\s*import\b/.test(l)) return
    for (const m of l.matchAll(/(["'`])((?:(?!\1).)*)\1/g)) if (looksLikeClasses(m[2])) checkClasses(m[2], file, line)
    const c = l.match(/\/\/(.*)$|\/\*(.*?)(\*\/|$)/)
    if (c) checkNames(c[1] ?? c[2] ?? "", file, line)
  })
}

/* ────────────────────────────── CSS, markdown, registry ────────────────────────────── */

function checkCss(file, text) {
  let inComment = false
  selector = ""
  text.split("\n").forEach((l, i) => {
    const line = i + 1
    const comments = l.match(/\/\*.*?(\*\/|$)/g)
    if (comments || inComment) checkNames((comments ?? [l]).join(" "), file, line)
    if (l.includes("/*") && !l.includes("*/")) inComment = true
    if (l.includes("*/")) inComment = false
    const apply = l.match(/@apply\s+([^;]+);/)
    if (apply) checkClasses(apply[1], file, line)
    if (/\btransition(?:-property)?\s*:\s*all\b/.test(l)) report("no-transition-all", file, line, "transition: all; name the properties.")
    const sel = l.match(/^\s*([^@{}/][^{}]*?)\s*\{\s*$/)
    if (sel) selector = sel[1]
    const wc = l.match(/\bwill-change\s*:\s*([^;]+);?/)
    if (wc) {
      const props = wc[1].split(",").map((x) => x.trim())
      if (props.includes("all")) report("will-change", file, line, "will-change: all; name transform, opacity or filter.")
      else if (props.some((x) => !COMPOSITED.has(x))) report("will-change", file, line, `will-change: ${wc[1].trim()}; only transform, opacity and filter can be composited.`)
    }
    if (/^\s*animation(?:-name)?\s*:/.test(l) && !/\bnone\b/.test(l) && /:hover|:focus|:active|\[data-(?:state|open|checked|pressed|expanded)|\[aria-(?:expanded|pressed|checked)|\[open\]|\.open\b|\.is-open\b/.test(selector))
      report(/:hover/.test(selector) ? "motion-restraint" : "keyframes-on-state", file, line, `animation on "${selector.trim()}": state changes use a transition, which retargets when the state flips mid-way.`)
    if (/-webkit-font-smoothing\s*:\s*(antialiased|subpixel-antialiased|auto)|-moz-osx-font-smoothing\s*:/.test(l) && !/^(html|body|:root|html,\s*body|:root,\s*html|\*)$/.test(selector.trim()))
      report("font-smoothing", file, line, `font smoothing on "${selector.trim()}": set it once on html or body so all text renders the same.`)
  })
}
let selector = ""

function checkMarkdown(file, text) {
  let fence = false
  text.split("\n").forEach((l, i) => {
    if (/^\s*(```|~~~)/.test(l)) fence = !fence
    if (fence) return
    checkNames(l.replace(/`[^`]*`/g, " "), file, i + 1)
  })
}

function checkRegistry(file, text) {
  const reg = readJson(file)
  if (!reg?.items) return
  const lines = text.split("\n")
  const lineOf = (needle) => Math.max(1, lines.findIndex((l) => l.includes(needle)) + 1)
  const names = new Set(reg.items.map((i) => i.name))
  for (const item of reg.items) {
    const at = lineOf(`"name": "${item.name}"`)
    const d = item.description ?? ""
    const words = d.trim().split(/\s+/).filter(Boolean).length
    if (!d) report("copy-description", file, at, `${item.name}: no description.`)
    else if (words > 12) report("copy-description", file, at, `${item.name}: description is ${words} words (max 12).`)
    else if ((d.match(/[.!?](\s|$)/g) ?? []).length > 1) report("copy-description", file, at, `${item.name}: description is more than one sentence.`)
    if (d) {
      checkCopy(d, file, at, "registry description")
      checkNames(`${item.title ?? ""} ${d}`, file, at)
      if (/\d+\s?(px|rem|ms)\b|\.(tsx?|css|json)\b|\//.test(d)) report("copy-description", file, at, `${item.name}: values and paths belong on the detail page, not in the description.`)
    }
    for (const f of item.files ?? []) {
      const base = path.basename(f.path).replace(/\.\w+$/, "")
      if (/\/parts\//.test(f.path) && base !== item.name && names.has(base))
        report("registry-name-collision", file, lineOf(f.path), `${item.name}: part "${path.basename(f.path)}" has the same name as the "${base}" item; rename it so imports and installs can't collide.`)
    }
  }
}

/* ────────────────────────────── theme upgrade ────────────────────────────── */

function themeFile() {
  if (config.theme) return path.join(cwd, config.theme)
  const cfg = readJson(path.join(cwd, "components.json"))
  const cand = [cfg?.tailwind?.css, "app/globals.css", "src/app/globals.css", "styles/globals.css", "src/styles/globals.css"].filter(Boolean)
  return cand.map((p) => path.join(cwd, p)).find((p) => fs.existsSync(p))
}

function checkUpgrade() {
  if (!on("upgrade")) return
  const script = ["scripts/paneui-upgrade-check.mjs", "registry/base-nova/scripts/upgrade-check.mjs"].map((p) => path.join(cwd, p)).find((p) => fs.existsSync(p))
  if (script) {
    const r = spawnSync(process.execPath, [script], { cwd, encoding: "utf8" })
    const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim()
    if (r.status !== 0) report("upgrade", script, 1, `the upgrade check found something to fix:\n${out.replace(/^/gm, "      ")}`)
    return
  }
  const css = themeFile()
  if (!css) return
  const text = fs.readFileSync(css, "utf8")
  if (!/--radius:/.test(text)) return // not a PaneUI theme
  if (/--(?:color-)?accent-(?:50|[1-9]00|950):/.test(text)) report("upgrade", css, 1, "The removed accent ramp (--accent-50…950) is still in the stylesheet; install the upgrade-check item and run it with --fix.")
  if (!/--radius-max:/.test(text)) report("upgrade", css, 1, "No --radius-max: the theme predates the 16px cap; reinstall the theme.")
  const r = text.match(/--radius:\s*([\d.]+)rem/)
  if (r && parseFloat(r[1]) > 1) report("upgrade", css, 1, `--radius ${r[1]}rem is above the supported 1rem.`)
}

/* ────────────────────────────── run ────────────────────────────── */

const SELF = path.resolve(fileURLToPath(import.meta.url))

// Rules that read JSX structure, so they only run with the TypeScript parser.
const JSX_RULES = new Set(["native-colors", "native-touch-target", "native-font-scaling", "native-accessibility", "native-radius", "platform-boundary", "concentric-radius", "menu-label-group", "tabular-nums", "text-wrap", "media-outline", "hit-area", "presence-initial", "exit-subtle", "icon-swap", "icon-stroke", "icon-weight", "nav-active-icon", "icon-size", "icon-color", "icon-rtl", "optical-icon-padding", "icon-button-label"])

// --self-test: every examples/<rule>/bad.tsx must trip <rule>; every good.tsx must be clean.
if (flag("--self-test")) {
  const dir = path.join(path.dirname(path.dirname(SELF)), "examples")
  PRESS_SCALE_OK.add("good").add("bad")
  config.rtl = true
  themeSmooths = false
  config.platforms ??= {}
  config.platforms.shared = [...(config.platforms.shared ?? []), relPath(path.join(dir, "platform-boundary", "*.tsx"))]
  let failed = 0, cases = 0
  for (const rule of fs.readdirSync(dir).sort()) {
    if (!RULES[rule]) {
      console.log(`  ?  examples/${rule}: no rule with this id`)
      failed++
      continue
    }
    if (!ts && JSX_RULES.has(rule)) {
      console.log(`  --  ${rule}: needs TypeScript to read JSX, skipped`)
      continue
    }
    for (const kind of ["bad", "good"]) {
      const file = path.join(dir, rule, `${kind}.tsx`)
      if (!fs.existsSync(file)) continue
      cases++
      findings.length = 0
      seenFindings.clear()
      const text = fs.readFileSync(file, "utf8")
      fileLines.set(file, text.split("\n"))
      checkSourceText(file, text)
      if (ts) checkSourceTs(file, text)
      else checkSourcePlain(file, text)
      const hit = findings.filter((f) => f.rule === rule)
      const ok = kind === "bad" ? hit.length > 0 : findings.length === 0
      if (!ok) failed++
      console.log(`  ${ok ? "ok" : "FAIL"}  ${rule}/${kind}${ok ? "" : `: ${kind === "bad" ? "not reported" : findings.map((f) => `${f.rule} (line ${f.line})`).join(", ")}`}`)
    }
  }
  console.log(`\n${cases} examples, ${failed} failed${ts ? "" : ` (${tsNote}: JSX checks skipped)`}`)
  process.exit(failed ? 1 : 0)
}
const SKILL_DIR = path.dirname(path.dirname(SELF)) + path.sep
let tsFailures = 0
for (const file of files) {
  if (path.resolve(file) === SELF) continue
  // Installed copies of this skill are reference text, not project code.
  if (path.resolve(file).startsWith(SKILL_DIR) && !/\.md$/.test(file)) continue
  if (/[\\/]skills[\\/]paneui-design[\\/]/.test(file) && !path.resolve(file).startsWith(SKILL_DIR)) continue
  const text = fs.readFileSync(file, "utf8")
  if (/^\s*(\/\/|\/\*|#)\s*GENERATED\b/.test(text.slice(0, 200))) continue
  fileLines.set(file, text.split("\n"))
  if (/\.(tsx|jsx|ts|js|mjs|cjs)$/.test(file)) checkSourceText(file, text)
  if (file.endsWith("registry.json")) checkRegistry(file, text)
  else if (/\.css$/.test(file)) checkCss(file, text)
  else if (/\.mdx?$/.test(file)) checkMarkdown(file, text)
  else if (ts) {
    // A compiler that loads but fails on a file falls back to the regex checks for that file.
    const before = findings.length
    try {
      checkSourceTs(file, text)
    } catch {
      for (const f of findings.splice(before)) seenFindings.delete(`${f.rule}\u0000${f.file}\u0000${f.line}\u0000${f.message}`)
      tsFailures++
      checkSourcePlain(file, text)
    }
  } else checkSourcePlain(file, text)
}
checkUpgrade()

const shown = flag("--quiet") ? findings.filter((f) => f.level === "error") : findings
const errors = findings.filter((f) => f.level === "error").length
const warns = findings.length - errors

if (flag("--json")) console.log(JSON.stringify({ files: files.length, errors, warnings: warns, findings: shown }, null, 2))
else {
  let last = ""
  for (const f of shown.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
    if (f.file !== last) console.log(`\n${f.file}`)
    last = f.file
    console.log(`  ${String(f.line).padStart(4)}  ${f.level === "error" ? "error" : "warn "}  ${f.rule.padEnd(24)} ${f.message}`)
  }
  console.log(`\n${files.length} files, ${errors} errors, ${warns} warnings${ts ? (tsFailures ? ` (${tsFailures} files read without TypeScript)` : "") : ` (${tsNote}: JSX nesting checks skipped)`}`)
}
process.exit(errors || (flag("--strict") && warns) ? 1 : 0)
