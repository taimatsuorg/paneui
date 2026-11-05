// Screenshots of every template for /docs/templates, light and dark, at 1440×900.
// Serve the built site first: `cd apps/docs/out && python3 -m http.server 3123`.
// Usage: node tooling/scripts/template-shots.mjs [baseUrl] [name…]   (needs playwright + chromium; names limit the run)
import { mkdir } from "node:fs/promises"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT ?? "playwright")
const base = process.argv[2] ?? "http://localhost:3123"
const registry = require("../../packages/registry/registry.json")
const only = process.argv.slice(3)
const names = registry.items
  .filter((i) => i.meta?.category === "Templates")
  .map((i) => i.name)
  .filter((n) => only.length === 0 || only.includes(n))
const outDir = new URL("../../apps/docs/public/templates-shots/", import.meta.url)
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/usr/bin/chromium" })
for (const scheme of ["light", "dark"]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: scheme })
  await page.addInitScript((s) => localStorage.setItem("theme", s), scheme)
  for (const name of names) {
    await page.goto(`${base}/templates/${name}/`, { waitUntil: "load" })
    // The editor template loads Monaco after the page; give it time.
    await page.waitForTimeout(name === "vscode" ? 6000 : 2000)
    const file = new URL(`${name}-${scheme}.jpg`, outDir)
    await page.screenshot({ path: file.pathname, type: "jpeg", quality: 82 })
    console.log(file.pathname)
  }
  await page.close()
}
await browser.close()
