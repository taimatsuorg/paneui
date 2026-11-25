#!/usr/bin/env node
/**
 * Nested-radius audit (`pnpm audit:radius`).
 *
 * Loads every docs page of the static site and, for each rounded element, compares its corner
 * radius with the concentric value its nearest rounded ancestor implies:
 *
 *   expected = max(R − d, 0)   R = ancestor corner radius, d = the element's inset from that
 *                              corner (min of the x/y offsets), only for corners with d < 16px
 *   flag when |r − expected| > 2px and (r > 0 or expected > 4px)
 *
 * Fully round elements (r ≥ half the short side: pills, avatars, dots, switches) are skipped as
 * intentional. Elements and ancestors that paint nothing are reported as "latent" (they only
 * show on hover/selection), the rest as "visible".
 *
 * Usage
 *   pnpm audit:radius                      # light theme, docs index pages + the components gallery
 *   pnpm audit:radius -- --dark            # dark theme
 *   pnpm audit:radius -- --pages menu,card # only these docs pages ("components" for the gallery)
 *   pnpm audit:radius -- --all             # every page under out/docs (blocks too)
 *   pnpm audit:radius -- --no-actions      # skip the hover/click steps from the config
 *   pnpm audit:radius -- --url <u1,u2>     # audit arbitrary pages (e.g. a local demo harness)
 *   pnpm audit:radius -- --out <dir>       # default node_modules/.cache/radius-audit
 *   pnpm audit:radius -- --resume          # resume this output directory against the same export
 *   BASE_URL=http://localhost:3123          # the served static export (out/)
 *
 * Interactions (hover a row, open a menu) are listed in scripts/audit-radius.config.mjs.
 * Allow-listed findings (intentional cases) live in the same config.
 *
 * Needs playwright (resolved from the project, $PLAYWRIGHT_PATH, or /workspace/work/pw) and a
 * Chromium ($CHROMIUM_PATH, default /usr/bin/chromium).
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const require = createRequire(import.meta.url)

function loadPlaywright() {
  const tries = [process.env.PLAYWRIGHT_PATH, "playwright", "/workspace/work/pw/node_modules/playwright"].filter(Boolean)
  for (const t of tries) {
    try {
      return require(t)
    } catch {}
  }
  console.error("audit-radius: playwright not found. Set PLAYWRIGHT_PATH to a playwright package.")
  process.exit(2)
}

// ── args ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const flag = (n) => argv.includes(n)
const opt = (n, d) => {
  const i = argv.indexOf(n)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d
}
const BASE = (process.env.BASE_URL || opt("--base", "http://localhost:3123")).replace(/\/$/, "")
const THEME = flag("--dark") ? "dark" : "light"
// --radius <none|sm|lg|xl|custom:REM>: audit under an explicit radius override
const RADIUS = opt("--radius", "")
// --style <name>: optional html data-style attribute to test
const STYLE = opt("--style", "")
const OUT = path.resolve(ROOT, opt("--out", "node_modules/.cache/radius-audit"))
const CONCURRENCY = Number(opt("--concurrency", "3"))
const TOL = Number(opt("--tolerance", "2"))
const MAX_INSET = Number(opt("--max-inset", "16"))

const config = (await import(path.join(ROOT, "tooling/scripts/audit-radius.config.mjs"))).default

function docNames() {
  const src = fs.readFileSync(path.join(ROOT, "apps/docs/content/docs/index.generated.ts"), "utf8")
  return [...src.matchAll(/from "\.\/([a-z0-9-]+)"/g)].map((m) => m[1])
}
let pages
if (opt("--url")) pages = opt("--url").split(",").map((s) => s.trim()).filter(Boolean)
else if (opt("--pages")) pages = opt("--pages").split(",").map((s) => s.trim()).filter(Boolean)
else if (flag("--all")) pages = [...new Set(["components", ...fs.readdirSync(path.join(ROOT, "apps/docs/out/docs")).filter((d) => !d.includes("."))])]
else pages = ["components", ...docNames()]
const urlFor = (p) => (/^(https?|file):/.test(p) ? p : p === "/" ? `${BASE}/` : `${BASE}/docs/${p}/`)

// ── in-page measurement ─────────────────────────────────────────────────────
// Runs in the browser. Returns raw findings; scope says where the element lives.
function measure({ tol, maxInset, phase }) {
  const px = (v, w) => {
    const first = String(v).trim().split(/\s+/)[0]
    if (first.endsWith("%")) return (parseFloat(first) / 100) * w
    return parseFloat(first) || 0
  }
  const alpha = (c) => {
    if (!c || c === "transparent") return 0
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (m) {
      const parts = m[1].split(/[ ,/]+/).filter(Boolean)
      return parts.length > 3 ? parseFloat(parts[3]) : 1
    }
    const a = c.match(/\/\s*([\d.]+%?)\s*\)/)
    if (a) return a[1].endsWith("%") ? parseFloat(a[1]) / 100 : parseFloat(a[1])
    return 1
  }
  // Does the box paint anything at this corner (or anywhere, when corner is omitted)?
  const SIDES = { tl: ["Top", "Left"], tr: ["Top", "Right"], br: ["Bottom", "Right"], bl: ["Bottom", "Left"] }
  const painted = (el, cs, corner) => {
    if (/^(IMG|VIDEO|CANVAS|IFRAME|PICTURE)$/.test(el.tagName)) return true
    const textClip = /text/.test(cs.backgroundClip || cs.webkitBackgroundClip || "")
    if (!textClip && (alpha(cs.backgroundColor) > 0.01 || cs.backgroundImage !== "none")) return true
    if (cs.boxShadow && cs.boxShadow !== "none") return true
    for (const s of corner ? SIDES[corner] : ["Top", "Right", "Bottom", "Left"]) {
      if (parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none" && alpha(cs[`border${s}Color`]) > 0.01) return true
    }
    if (cs.backdropFilter && cs.backdropFilter !== "none") return true
    return false
  }
  // A scroll container between the element and its ancestor (or the ancestor itself) moves
  // the element, so its offsets depend on the scroll position.
  const scrolls = (n) => {
    const c = getComputedStyle(n)
    return /(auto|scroll)/.test(c.overflowY + c.overflowX) && (n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1)
  }
  const radii = (el, cs, r) => {
    const w = r.width, h = r.height, cap = Math.min(w, h) / 2
    const c = (v) => Math.min(px(v, w), cap)
    return {
      tl: c(cs.borderTopLeftRadius),
      tr: c(cs.borderTopRightRadius),
      br: c(cs.borderBottomRightRadius),
      bl: c(cs.borderBottomLeftRadius),
      cap,
    }
  }
  const isRound = (rr) => rr.cap > 0 && Math.max(rr.tl, rr.tr, rr.br, rr.bl) >= rr.cap - 1 && Math.min(rr.tl, rr.tr, rr.br, rr.bl) >= rr.cap - 1
  const RADIUS_CLASS = /^(?:[a-z0-9-]+:)*(rounded|frame|p|px|py|pt|pb|pl|pr|ps|pe|border|inset|gap|m|mx|my|shell-inset)(-|$)/
  const radiusClasses = (el) =>
    String(el.getAttribute("class") || "")
      .split(/\s+/)
      .filter((c) => RADIUS_CLASS.test(c))
      .join(" ")
  const short = (el) => {
    let s = el.tagName.toLowerCase()
    const slot = el.getAttribute("data-slot")
    if (slot) return `${s}[data-slot="${slot}"]`
    if (el.id) return `${s}#${el.id}`
    const role = el.getAttribute("role")
    if (role) s += `[role="${role}"]`
    const cls = String(el.getAttribute("class") || "").split(/\s+/).filter((c) => c && !c.includes(":") && !c.includes("[") && !c.includes("/"))
    if (cls.length) s += "." + cls.slice(0, 2).join(".")
    const parent = el.parentElement
    if (parent) {
      const same = [...parent.children].filter((c) => c.tagName === el.tagName)
      if (same.length > 1) s += `:nth-of-type(${same.indexOf(el) + 1})`
    }
    return s
  }
  const selector = (el, stop) => {
    const parts = []
    for (let n = el; n && n !== stop && n !== document.body && parts.length < 5; n = n.parentElement) {
      parts.unshift(short(n))
      if (n.getAttribute("data-slot") && parts.length >= 2) break
    }
    return parts.join(" > ")
  }
  const slotOf = (el) => {
    for (let n = el; n; n = n.parentElement) if (n.getAttribute && n.getAttribute("data-slot")) return n.getAttribute("data-slot")
    return null
  }
  // Scope: which example preview (or the site shell / a portal) the element lives in.
  const main = document.querySelector("main")
  const shellRoot = main ? main.closest("body > *") : null
  const scopeOf = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const p = n.parentElement
      if (p && p.getAttribute("role") === "tabpanel" && /min-h-(56|80)/.test(n.className || "")) {
        const block = p.closest("[data-slot='tabs']")?.parentElement
        const h3 = block?.querySelector(":scope > h3[id^='example-']")
        return { kind: "demo", id: h3 ? h3.id.replace(/^example-/, "") : "main-demo" }
      }
      if (n.getAttribute && n.getAttribute("data-slot") === "gallery-preview") {
        const card = n.parentElement
        const a = card?.querySelector("a[href*='/docs/']")
        return { kind: "demo", id: a ? a.getAttribute("href").replace(/.*\/docs\/|\/$/g, "") : "gallery" }
      }
    }
    if (shellRoot && !shellRoot.contains(el)) return { kind: "portal", id: "portal" }
    return { kind: "site", id: "site" }
  }

  const out = []
  const all = document.body.querySelectorAll("*")
  for (const el of all) {
    if (el.closest("svg")) continue
    const cs = getComputedStyle(el)
    if (cs.display === "none" || cs.display === "contents") continue
    const r = el.getBoundingClientRect()
    if (r.width < 4 || r.height < 4) continue
    if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue
    const rr = radii(el, cs, r)
    // Find the nearest rounded ancestor with a box.
    let anc = null, acs = null, ar = null, arr = null
    for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const ncs = getComputedStyle(n)
      if (ncs.display === "contents") continue
      const nr = n.getBoundingClientRect()
      if (nr.width < 4 || nr.height < 4) continue
      const nrr = radii(n, ncs, nr)
      if (nrr.tl + nrr.tr + nrr.br + nrr.bl > 0) {
        anc = n; acs = ncs; ar = nr; arr = nrr
        break
      }
    }
    if (!anc) continue
    if (isRound(rr)) continue // pills, avatars, dots: intentional
    const elRounded = rr.tl + rr.tr + rr.br + rr.bl > 0
    const corners = [
      ["tl", r.left - ar.left, r.top - ar.top],
      ["tr", ar.right - r.right, r.top - ar.top],
      ["br", ar.right - r.right, ar.bottom - r.bottom],
      ["bl", r.left - ar.left, ar.bottom - r.bottom],
    ]
    const clips = acs.overflow !== "visible" || acs.overflowX !== "visible" || acs.overflowY !== "visible"
    const bad = []
    const elPaints = painted(el, cs)
    for (const [k, dx, dy] of corners) {
      if (dx < -0.5 || dy < -0.5) continue
      if (Math.max(dx, dy) >= maxInset) continue
      const d = Math.max(0, Math.min(dx, dy))
      const R = arr[k], rv = rr[k]
      if (d < 1 && clips) continue // flush inside a clipping parent: the parent's curve wins
      if (rv < 0.5 && !painted(el, cs, k)) continue // square corner that paints nothing
      const expected = Math.max(R - d, 0)
      // Concentric below 4px means the inset is too large for the container's radius: the child
      // keeps its own token (AGENTS.md), unless it is rounder than the container itself.
      if (expected < 4 && rv <= R + tol) continue
      if (Math.abs(rv - expected) > tol && (rv > 0 || expected > 4)) {
        // must: a tight inset where concentric gives a usable radius; should: the rest.
        const level = d <= 8 && expected >= 4 && !isRound(arr) ? "must" : "should"
        bad.push({ corner: k, r: +rv.toFixed(1), R: +R.toFixed(1), dx: +dx.toFixed(1), dy: +dy.toFixed(1), expected: +expected.toFixed(1), uneven: Math.abs(dx - dy) > 2, level })
      }
    }
    if (!bad.length) continue
    if (!elRounded && !elPaints) continue // square and invisible: nothing to see
    let scrolling = false, cut = false
    for (let n = el.parentElement; n && n !== anc.parentElement; n = n.parentElement) {
      if (!scrolls(n)) continue
      scrolling = true
      const sr = n.getBoundingClientRect()
      if (r.top < sr.top - 0.5 || r.bottom > sr.bottom + 0.5 || r.left < sr.left - 0.5 || r.right > sr.right + 0.5) cut = true
    }
    if (cut) continue // a row passing under a scroll edge: transient, not a nesting decision
    if (scrolling && clips && Math.min(...bad.map((b) => Math.min(b.dx, b.dy))) < 6) continue // scroll content touching a clipped edge
    const scope = scopeOf(el)
    out.push({
      phase,
      scope,
      slot: slotOf(el),
      ancestorSlot: slotOf(anc),
      selector: selector(el, null),
      ancestor: selector(anc, null),
      classes: radiusClasses(el),
      ancestorClasses: radiusClasses(anc),
      visible: elPaints && painted(anc, acs),
      level: bad.some((b) => b.level === "must") ? "must" : "should",
      control:
        /^(BUTTON|INPUT|SELECT|TEXTAREA|KBD)$/.test(el.tagName) ||
        /^(button|checkbox|switch|radio|tab)$/.test(el.getAttribute("role") || "") ||
        /^(icon-chip|alert-icon|badge|kbd)$/.test(el.getAttribute("data-slot") || ""),
      minInset: Math.min(...bad.map((b) => Math.max(0, Math.min(b.dx, b.dy)))),
      scrolling,
      roundAncestor: isRound(arr),
      corners: bad,
    })
  }
  return out
}

// ── run ─────────────────────────────────────────────────────────────────────
const { chromium } = loadPlaywright()
const executablePath = process.env.CHROMIUM_PATH || (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined)
const browser = await chromium.launch({ executablePath })
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  colorScheme: THEME,
  reducedMotion: "reduce",
})
await context.addInitScript(([theme, radius, style]) => {
  try {
    localStorage.setItem("theme", theme)
    localStorage.setItem("native-docs-theme", theme)
    localStorage.setItem("native-docs-style", style || "default")
    if (style) localStorage.setItem("style", style)
    if (radius && radius.startsWith("custom:")) {
      localStorage.setItem("radius", "custom")
      localStorage.setItem("radius-custom", radius.slice(7))
    } else if (radius) localStorage.setItem("radius", radius)
  } catch {}
}, [THEME, RADIUS, STYLE])

const allow = config.allow ?? []
const isAllowed = (page, f) =>
  allow.find(
    (a) =>
      (!a.page || a.page === page) &&
      (!a.slot || a.slot === f.slot) &&
      (!a.ancestorSlot || a.ancestorSlot === f.ancestorSlot) &&
      (!a.selector || f.selector.includes(a.selector)) &&
      (!a.scope || a.scope === f.scope.id) &&
      (a.control === undefined || a.control === f.control) &&
      (a.minInset === undefined || f.minInset >= a.minInset) &&
      (!a.level || a.level === f.level)
  )

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {})
  await page.evaluate(() => document.fonts?.ready).catch(() => {})
  await page.waitForTimeout(600)
}

async function auditPage(name, page) {
  const findings = []
  try {
    const res = await page.goto(urlFor(name), { waitUntil: "domcontentloaded", timeout: 45000 })
    if (!res || (res.status() >= 400 && !urlFor(name).startsWith("file:"))) return { name, error: `HTTP ${res?.status()}`, findings }
    await page.evaluate((t) => {
      document.documentElement.classList.toggle("dark", t === "dark")
    }, THEME)
    await settle(page)
    if (name === "/") {
      // The gallery mounts demos as they scroll in: audit in viewport-sized steps.
      const h = await page.evaluate(() => document.documentElement.scrollHeight)
      for (let y = 0; y < h; y += 800) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y)
        await page.waitForTimeout(350)
        findings.push(...(await page.evaluate(measure, { tol: TOL, maxInset: MAX_INSET, phase: "rest" })))
      }
    } else {
      findings.push(...(await page.evaluate(measure, { tol: TOL, maxInset: MAX_INSET, phase: "rest" })))
    }
    if (!flag("--no-actions")) {
      for (const a of (config.actions ?? []).filter((x) => x.page === name)) {
        try {
          const loc = page.locator(`${a.selector} >> visible=true`).nth(a.nth ?? 0)
          await loc.scrollIntoViewIfNeeded({ timeout: 3000 })
          if (a.type === "click") await loc.click({ timeout: 3000 })
          else if (a.type === "contextmenu") await loc.click({ button: "right", timeout: 3000 })
          else await loc.hover({ timeout: 3000 })
          await page.waitForTimeout(a.wait ?? 400)
          const label = `${a.type ?? "hover"} ${a.selector}`
          findings.push(...(await page.evaluate(measure, { tol: TOL, maxInset: MAX_INSET, phase: label })))
          if (a.thenHover) {
            // e.g. hover the first row of the menu that just opened
            await page.locator(`${a.thenHover} >> visible=true`).nth(a.thenHoverNth ?? 0).hover({ timeout: 3000 })
            await page.waitForTimeout(250)
            findings.push(...(await page.evaluate(measure, { tol: TOL, maxInset: MAX_INSET, phase: `${label} → hover ${a.thenHover}` })))
          }
          if (a.type === "click" || a.type === "contextmenu") await page.keyboard.press("Escape").catch(() => {})
          await page.mouse.move(0, 0)
          await page.waitForTimeout(150)
        } catch (e) {
          findings.push({ phase: "action-error", error: `${a.type ?? "hover"} ${a.selector}: ${String(e.message).split("\n")[0]}` })
        }
      }
    }
    return { name, findings }
  } catch (e) {
    return { name, error: String(e.message).split("\n")[0], findings }
  }
}

fs.mkdirSync(OUT, { recursive: true })
const checkpointPath = path.join(OUT, "progress.json")
const runKey = JSON.stringify({ base: BASE, theme: THEME, radius: RADIUS, style: STYLE, tolerance: TOL, maxInset: MAX_INSET, actions: !flag("--no-actions"), pages, exportTime: fs.statSync(path.join(ROOT, "apps/docs/out")).mtimeMs })
const checkpoint = flag("--resume") && fs.existsSync(checkpointPath) ? JSON.parse(fs.readFileSync(checkpointPath, "utf8")) : null
const results = checkpoint?.key === runKey ? checkpoint.results.filter((r) => !r.error && !r.findings.some((f) => f.phase === "action-error")) : []
const completed = new Set(results.map((r) => r.name))
const queue = pages.filter((name) => !completed.has(name))
async function worker() {
  const page = await context.newPage()
  try {
  while (queue.length) {
    const name = queue.shift()
    const r = await auditPage(name, page)
    results.push(r)
    fs.writeFileSync(`${checkpointPath}.tmp`, JSON.stringify({ key: runKey, results }))
    fs.renameSync(`${checkpointPath}.tmp`, checkpointPath)
    process.stderr.write(`${r.error ? "!" : "."} ${name} ${r.findings.length}${r.error ? " " + r.error : ""}\n`)
  }
  } finally {
    await page.close()
  }
}
await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, worker))
await browser.close()

// ── report ──────────────────────────────────────────────────────────────────
// Site-shell and portal findings repeat on every page: keep the first page that showed them.
const seen = new Set()
// The home gallery renders the same demos as the docs pages: report a gallery finding only when
// no docs page already showed the same nesting.
const shell = (slot) => (slot === "gallery-preview" || slot === "tabs-panel" ? "" : slot)
const sig = (f) => [shell(f.slot), f.classes, shell(f.ancestorSlot), f.ancestorClasses, f.corners.map((c) => c.corner + c.r + ">" + c.expected).join()].join("|")
const docSigs = new Set(results.filter((r) => r.name !== "/").flatMap((r) => r.findings.filter((f) => f.corners).map(sig)))
const report = { base: BASE, theme: THEME, style: STYLE || "default", radius: RADIUS || "default", tolerance: TOL, maxInset: MAX_INSET, generated: new Date().toISOString(), pages: [] }
let total = 0, allowed = 0
for (const name of pages) {
  const r = results.find((x) => x.name === name)
  if (!r) continue
  const items = []
  const actionErrors = []
  for (const f of r.findings) {
    if (f.phase === "action-error") {
      actionErrors.push(f.error)
      continue
    }
    const key = (f.scope.kind === "demo" ? `${name}|${f.scope.id}|` : `${f.scope.kind}|`) + `${f.selector}|${f.ancestor}`
    if (seen.has(key)) continue
    seen.add(key)
    if (name === "/" && f.scope.kind === "demo" && docSigs.has(sig(f))) continue
    const a = isAllowed(name, f)
    if (a) {
      allowed++
      continue
    }
    items.push(f)
  }
  total += items.length
  report.pages.push({ page: name, url: urlFor(name), error: r.error, actionErrors, findings: items })
}
report.total = total
report.allowed = allowed

fs.mkdirSync(OUT, { recursive: true })
const SUFFIX = `${THEME}${STYLE ? `-${STYLE}` : ""}${RADIUS ? `-${RADIUS.replace(":", "-")}` : ""}`
const jsonPath = path.join(OUT, `report-${SUFFIX}.json`)
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))

const md = []
md.push(`# Radius audit (${SUFFIX})`, "", `${report.generated} · ${BASE} · tolerance ${TOL}px · inset < ${MAX_INSET}px`, "")
const musts = report.pages.reduce((n, p) => n + p.findings.filter((f) => f.level === "must").length, 0)
md.push(
  `**${total} findings** (${musts} must, ${total - musts} should; ${allowed} allow-listed).`,
  "",
  "MUST = inset ≤ 8px and the concentric radius is ≥ 4px: use rounded-inner. should = inset 9–15px or a round container:",
  "fix surfaces (rows, panels, media); controls keep their token (allow-listed). Corners whose concentric radius would be",
  "< 4px are not reported (the inset is too large for concentric; the child keeps its own token).",
  '"visible" = both surfaces paint; "latent" = one only paints on hover/selection; "scrolling" = offsets depend on scroll.',
  ""
)
for (const p of report.pages) {
  if (!p.findings.length && !p.error && !p.actionErrors.length) continue
  md.push(`## ${p.page}`, "")
  if (p.error) md.push(`- ERROR: ${p.error}`)
  for (const e of p.actionErrors) md.push(`- action failed: ${e}`)
  const groups = new Map()
  for (const f of p.findings) {
    const g = `${f.scope.kind === "demo" ? f.scope.id : f.scope.kind} · ${f.slot ?? "(no slot)"}`
    if (!groups.has(g)) groups.set(g, [])
    groups.get(g).push(f)
  }
  for (const [g, fs_] of groups) {
    md.push(`### ${g}`)
    for (const f of fs_) {
      const c = f.corners.map((x) => `${x.corner} r=${x.r} want ${x.expected} (R=${x.R}, d=${Math.min(x.dx, x.dy)}${x.uneven ? `, uneven ${x.dx}/${x.dy}` : ""})`).join("; ")
      md.push(
        `- ${f.level === "must" ? "**MUST**" : "should"} · ${f.visible ? "visible" : "latent"}${f.scrolling ? " · scrolling" : ""}${f.phase !== "rest" ? ` [${f.phase}]` : ""} \`${f.selector}\``,
        `  - in \`${f.ancestor}\`${f.roundAncestor ? " (round)" : ""}`,
        `  - ${c}`,
        `  - classes: \`${f.classes || "-"}\` ⊂ \`${f.ancestorClasses || "-"}\``
      )
    }
    md.push("")
  }
}
const mdPath = path.join(OUT, `report-${SUFFIX}.md`)
fs.writeFileSync(mdPath, md.join("\n"))
console.log(`radius audit: ${total} findings (${musts} must) (${allowed} allowed) across ${report.pages.length} pages`)
console.log(`  ${path.relative(ROOT, mdPath)}\n  ${path.relative(ROOT, jsonPath)}`)
if (flag("--strict") && musts > 0) process.exit(1)
