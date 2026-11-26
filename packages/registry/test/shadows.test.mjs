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

test("opaque-child tables reserve a 1px inset channel and destructive SettingsGroup uses inset-ring", () => {
  const simpleTable = fs.readFileSync(path.join(root, "packages/ui/src/components/simple-table.tsx"), "utf8")
  assert.match(simpleTable, /\bframe-xl\b/)
  assert.match(simpleTable, /\bframe-border\b/)
  assert.match(simpleTable, /\bp-px\b/)
  assert.match(simpleTable, /\brounded-inner\b/)

  const dataTable = fs.readFileSync(path.join(root, "packages/ui/src/components/table.tsx"), "utf8")
  assert.match(dataTable, /viewportClassName="rounded-inner"/)
  assert.match(dataTable, /\bframe-xl\b/)
  assert.match(dataTable, /\bframe-border\b/)
  assert.match(dataTable, /\bp-px\b/)

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
