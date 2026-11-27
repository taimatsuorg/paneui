import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")
const SHADOW_TOKENS = ["shadow-border", "shadow-default", "shadow-lg", "shadow-xl", "skeuo-raised-hover", "skeuo-pressed"]

function parseBlocks(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "")
  const blocks = []
  for (const [, selector, body] of clean.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
    const vars = {}
    for (const [, name, value] of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
      vars[name] = value.replace(/\s+/g, " ").trim()
    }
    blocks.push({ selector: selector.trim(), vars })
  }
  return blocks
}

function mergeVars(blocks, match) {
  const merged = {}
  for (const block of blocks) {
    if (match(block.selector)) Object.assign(merged, block.vars)
  }
  return merged
}

function splitLayers(value) {
  const layers = []
  let depth = 0
  let start = 0
  for (let i = 0; i < value.length; i++) {
    const ch = value[i]
    if (ch === "(") depth++
    else if (ch === ")" && depth > 0) depth--
    else if (ch === "," && depth === 0) {
      layers.push(value.slice(start, i).trim())
      start = i + 1
    }
  }
  const tail = value.slice(start).trim()
  if (tail) layers.push(tail)
  return layers
}

function assertInsetRings(label, vars) {
  for (const token of SHADOW_TOKENS) {
    const value = vars[token]
    assert.ok(value, `${label}: missing --${token}`)
    for (const layer of splitLayers(value)) {
      if (/\b0\s+0\s+0\s+1px\b/.test(layer)) {
        assert.match(layer, /\binset\b/, `${label}: --${token} has outward 1px ring (${layer})`)
      }
    }
  }
}

test("shadow hairline rings use inset in the default theme so overflow containers do not clip them", () => {
  const globalsBlocks = parseBlocks(fs.readFileSync(path.join(root, "packages/tokens/styles/globals.css"), "utf8"))
  assertInsetRings("globals.css (:root light)", mergeVars(globalsBlocks, (s) => s === ":root"))
  assertInsetRings("globals.css (.dark)", mergeVars(globalsBlocks, (s) => s === ".dark"))

  const manifest = JSON.parse(fs.readFileSync(path.join(root, "packages/registry/registry.json"), "utf8"))
  const theme = manifest.items.find((item) => item.name === "theme")
  assertInsetRings("registry theme (light)", theme.cssVars.light)
  assertInsetRings("registry theme (dark)", theme.cssVars.dark)
})

test("default theme fixes xl radius at 0.875rem with a 1rem cap and removes Paper, Studio, and radius presets", () => {
  const globalsSrc = fs.readFileSync(path.join(root, "packages/tokens/styles/globals.css"), "utf8")
  const globalsBlocks = parseBlocks(globalsSrc)
  const light = mergeVars(globalsBlocks, (s) => s === ":root")
  assert.equal(light.radius, "0.875rem")
  assert.equal(light["radius-max"], "1rem")
  assert.doesNotMatch(globalsSrc, /html\[data-radius/)
  assert.doesNotMatch(globalsSrc, /theme-(paper|studio)\.css/)

  const manifest = JSON.parse(fs.readFileSync(path.join(root, "packages/registry/registry.json"), "utf8"))
  const theme = manifest.items.find((item) => item.name === "theme")
  assert.equal(theme.cssVars.theme.radius, "0.875rem")
  assert.equal(theme.cssVars.light.radius, "0.875rem")
  for (const removed of ["theme-paper", "theme-radii"]) {
    assert.equal(manifest.items.some((i) => i.name === removed), false, `${removed} must be removed`)
  }
  assert.equal(manifest.items.some((i) => i.name.startsWith("theme-radius-")), false, "theme-radius-* items must be removed")
})

test("default theme uses pure achromatic surfaces, monochrome neutral ink, and royal blue preset", () => {
  const globalsBlocks = parseBlocks(fs.readFileSync(path.join(root, "packages/tokens/styles/globals.css"), "utf8"))
  const light = mergeVars(globalsBlocks, (s) => s === ":root")
  const dark = mergeVars(globalsBlocks, (s) => s === ".dark")

  assert.equal(light.background, "oklch(100% 0 0)")
  assert.equal(light.shell, "oklch(97.6% 0 0)")
  assert.equal(light.foreground, "oklch(10% 0 0)")
  assert.equal(light.primary, "oklch(10% 0 0)")

  assert.equal(dark.background, "oklch(14.5% 0 0)")
  assert.equal(dark.card, "oklch(20.5% 0 0)")
  assert.equal(dark.popover, "oklch(26.8% 0 0)")
  assert.equal(dark.foreground, "oklch(98.5% 0 0)")
  assert.equal(dark.primary, "oklch(98.5% 0 0)")

  const manifest = JSON.parse(fs.readFileSync(path.join(root, "packages/registry/registry.json"), "utf8"))
  const blue = manifest.items.find((i) => i.name === "theme-blue")
  assert.equal(blue.cssVars.light.primary, "oklch(54.61% 0.2152 262.88)")
})

test("tables use clean horizontal row hairlines, opaque sticky/pinned tokens, and enhanced interactions", () => {
  const simpleTable = fs.readFileSync(path.join(root, "packages/ui/src/components/simple-table.tsx"), "utf8")
  assert.match(simpleTable, /\bframe-xl\b/)
  assert.match(simpleTable, /\bframe-border\b/)
  assert.match(simpleTable, /\bp-px\b/)
  assert.match(simpleTable, /\brounded-inner\b/)
  assert.match(simpleTable, /\bshadow-border\b/)
  assert.match(simpleTable, /color-mix\(in_oklab,var\(--foreground\)_3\.5%,var\(--table-bg\)\)/)
  assert.match(simpleTable, /\buseScrollEdges\b/)
  assert.match(simpleTable, /\bSimpleTableFooter\b/)
  assert.match(simpleTable, /\bSimpleTableCaption\b/)
  assert.match(simpleTable, /\bstickyHeader\b/)
  assert.match(simpleTable, /\bscrollFade\b/)
  assert.match(simpleTable, /\bpinnedEdge\b/)

  const table = fs.readFileSync(path.join(root, "packages/ui/src/components/table.tsx"), "utf8")
  assert.match(table, /viewportClassName="[^"]*\brounded-inner\b/)
  assert.match(table, /\bframe-xl\b/)
  assert.match(table, /\bframe-border\b/)
  assert.match(table, /\bp-px\b/)
  assert.match(table, /\bshadow-border\b/)
  assert.match(table, /color-mix\(in_oklab,var\(--foreground\)_3\.5%,var\(--table-bg\)\)/)
  assert.doesNotMatch(table, /\bborder-e\b/)
  assert.doesNotMatch(table, /\bTableSheetEdge\b/)
  assert.match(table, /data-swipe-selecting/)
  assert.match(table, /data-slot="table-announcer"/)
  assert.match(table, /data-pinned/)

  const dataTable = fs.readFileSync(path.join(root, "packages/ui/src/components/data-table.tsx"), "utf8")
  assert.match(dataTable, /\bpinStart\b/)
  assert.match(dataTable, /\bloadingRows\b/)
  assert.match(dataTable, /data-slot="data-table-announcer"/)
  assert.match(dataTable, /\bclearSearch\b/)

  const comparisonTable = fs.readFileSync(path.join(root, "packages/ui/src/components/comparison-table.tsx"), "utf8")
  assert.match(comparisonTable, /\bframe-xl\b/)
  assert.match(comparisonTable, /\bframe-border\b/)
  assert.match(comparisonTable, /\brounded-inner\b/)
  assert.match(comparisonTable, /\bshadow-border\b/)
  assert.match(comparisonTable, /color-mix\(in_oklab,var\(--foreground\)_3\.5%,var\(--card\)\)/)
  assert.doesNotMatch(comparisonTable, /\bborder-e\b/)

  const schemaTree = fs.readFileSync(path.join(root, "packages/ui/src/components/schema-tree.tsx"), "utf8")
  assert.match(schemaTree, /\bframe-xl\b/)
  assert.match(schemaTree, /\bframe-border\b/)
  assert.match(schemaTree, /\brounded-inner\b/)
  assert.match(schemaTree, /\bshadow-border\b/)
  assert.match(schemaTree, /color-mix\(in_oklab,var\(--foreground\)_3\.5%,var\(--card\)\)/)
  assert.doesNotMatch(schemaTree, /\bborder-e\b/)

  const settings = fs.readFileSync(path.join(root, "packages/ui/src/components/settings-section.tsx"), "utf8")
  assert.match(settings, /\binset-ring\b/)
  assert.doesNotMatch(settings, /\bring-1\s+ring-destructive/)
})

test("carousel reserves cross-axis shadow bleed and moves slide gap to leading item padding", () => {
  const carousel = fs.readFileSync(path.join(root, "packages/ui/src/components/carousel.tsx"), "utf8")
  assert.match(carousel, /-my-1 w-full/)
  assert.match(carousel, /\bpy-1\b/)
  assert.match(carousel, /-mx-1 h-full w-\[calc\(100%\+var\(--spacing\)\*2\)\]/)
  assert.match(carousel, /\bpx-1\b/)
  assert.match(carousel, /\[--carousel-gap:calc\(var\(--spacing\)\*3\)\]/)
  assert.match(carousel, /-ms-\(--carousel-gap\)/)
  assert.match(carousel, /ps-\(--carousel-gap\)/)
  assert.match(carousel, /-scroll-ms-\(--carousel-gap\)/)
  assert.match(carousel, /-mt-\(--carousel-gap\)/)
  assert.match(carousel, /pt-\(--carousel-gap\)/)
  assert.match(carousel, /-scroll-mt-\(--carousel-gap\)/)
  assert.doesNotMatch(carousel, /"flex gap-3"/)

  const published = JSON.parse(fs.readFileSync(path.join(root, "apps/docs/public/r/carousel.json"), "utf8"))
  const publishedContent = published.files[0].content
  assert.match(publishedContent, /\bpy-1\b/)
  assert.match(publishedContent, /--carousel-gap/)
})

test("switch supports track icons, pointer drag, and optimistic pending state without ios variant", () => {
  const sw = fs.readFileSync(path.join(root, "packages/ui/src/components/switch.tsx"), "utf8")
  assert.doesNotMatch(sw, /data-variant|\bios:/)
  assert.match(sw, /\bicons\s*=\s*false\b/)
  assert.match(sw, /data-dragging/)
  assert.match(sw, /data-pending/)
  assert.match(sw, /\brounded-full\b/)

  const published = JSON.parse(fs.readFileSync(path.join(root, "apps/docs/public/r/switch.json"), "utf8"))
  assert.ok(published.registryDependencies.some((d) => /icons(\.json)?$/.test(d)))
})
