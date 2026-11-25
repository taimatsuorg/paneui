import { execFile } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import http from "node:http"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
export const BIN = path.join(here, "..", "dist", "index.js")
const FAKE_SHADCN = path.join(here, "fake-shadcn.mjs")

const button = `"use client"

import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/registry/web/lib/utils"

const buttonVariants = cva("inline-flex items-center", {
  variants: { variant: { default: "bg-primary text-primary-foreground", ghost: "hover:bg-muted" } },
})

function Button({ className, ...props }) {
  return <button data-slot="button" className={cn(buttonVariants(), className)} {...props} />
}

export { Button, buttonVariants }
`

const card = `import * as React from "react"
import { cn } from "@/registry/web/lib/utils"

function Card({ className, ...props }) {
  return <div data-slot="card" className={cn("rounded-xl bg-card", className)} {...props} />
}

export { Card }
`

/** A small registry shaped like the real one: theme + presets, icon styles, ui items, a template. */
export const ITEMS = [
  {
    name: "theme",
    type: "registry:theme",
    title: "Theme",
    description: "Design tokens every component reads.",
    cssVars: { light: { primary: "#0090ff", "primary-subtle": "#008ff519", radius: "0.875rem" }, dark: { primary: "#0090ff" } },
    meta: { category: "Foundations", version: "2.8" },
  },
  { name: "theme-blue", type: "registry:theme", title: "Theme: Blue", description: "Blue accent.", cssVars: { light: { primary: "#0090ff" } }, registryDependencies: ["@paneui/theme"], meta: { category: "Foundations", hidden: true } },
  { name: "theme-violet", type: "registry:theme", title: "Theme: Violet", description: "Violet accent.", cssVars: { light: { primary: "#6e56cf" } }, registryDependencies: ["@paneui/theme"], meta: { category: "Foundations", hidden: true } },
  { name: "icons", type: "registry:component", title: "Icons", description: "Icon set.", files: [{ path: "components/icons.tsx", type: "registry:component", target: "components/icons.tsx", content: "export const A = 1\nexport const B = 2\n// rounded\n" }], meta: { category: "Foundations" } },
  { name: "icons-custom", type: "registry:component", title: "Icons custom", description: "Custom icon set.", files: [{ path: "registry/web/icons/custom/icons.tsx", type: "registry:component", target: "components/icons.tsx", content: "export const A = 1\nexport const B = 2\n// outline\n// thin strokes\n" }], meta: { category: "Foundations", hidden: true } },
  { name: "button", type: "registry:ui", title: "Button", description: "Triggers an action or submits a form.", dependencies: ["class-variance-authority"], registryDependencies: ["@paneui/theme"], files: [{ path: "registry/web/ui/button.tsx", type: "registry:ui", content: button }], meta: { category: "Forms" } },
  { name: "card", type: "registry:ui", title: "Card", description: "Groups related content on a surface.", registryDependencies: ["@paneui/theme"], files: [{ path: "registry/web/ui/card.tsx", type: "registry:ui", content: card }], meta: { category: "Display" } },
  { name: "donut-chart", type: "registry:ui", title: "Donut Chart", description: "Shows how parts make up a whole as a ring.", files: [{ path: "registry/web/ui/donut-chart.tsx", type: "registry:ui", content: "export function DonutChart() { return null }\n" }], meta: { category: "Charts" } },
  { name: "blog", type: "registry:block", title: "Blog", description: "A blog template.", files: [{ path: "registry/web/templates/blog/app/blog/page.tsx", type: "registry:page", target: "app/blog/page.tsx", content: "export default function Page() {\n  return <main>Blog</main>\n}\n" }], meta: { category: "Templates" } },
]

export const CONTENT = { button, card }

/** Serves the mock registry at http://127.0.0.1:<port>/r. */
export async function startRegistry() {
  const index = { name: "paneui", homepage: "http://localhost", items: ITEMS.map(({ files, ...rest }) => ({ ...rest, files: files?.map((f) => ({ path: f.path, type: f.type, target: f.target })) })) }
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://x")
    const m = url.pathname.match(/^\/r\/([^/]+)\.json$/)
    const body = m ? (m[1] === "registry" ? index : ITEMS.find((i) => i.name === m[1])) : null
    if (!body) {
      res.writeHead(404).end("not found")
      return
    }
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(body))
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const base = `http://127.0.0.1:${server.address().port}/r`
  return { base, close: () => new Promise((resolve) => server.close(resolve)) }
}

/** A project directory with components.json, tsconfig paths and a global stylesheet. */
export function makeProject({ components = {}, files = {} } = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "paneui-cli-"))
  const json = {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "base-nova",
    tailwind: { css: "app/globals.css" },
    aliases: { components: "@/components", ui: "@/components/ui", utils: "@/lib/utils", lib: "@/lib", hooks: "@/hooks" },
    ...components,
  }
  write(dir, "components.json", JSON.stringify(json, null, 2))
  write(dir, "tsconfig.json", `{\n  // comments are allowed\n  "compilerOptions": { "paths": { "@/*": ["./*"] }, },\n}\n`)
  write(dir, "app/globals.css", ":root {\n  --primary: #0090ff;\n  --primary-subtle: #008ff519;\n  --radius: 0.875rem;\n}\n")
  for (const [p, content] of Object.entries(files)) write(dir, p, content)
  return dir
}

export function write(dir, p, content) {
  mkdirSync(path.dirname(path.join(dir, p)), { recursive: true })
  writeFileSync(path.join(dir, p), content)
}

export const readJson = (p) => JSON.parse(readFileSync(p, "utf8"))

/** Runs the CLI with a fake shadcn that appends each argv to calls.json. */
export function run(args, { cwd, env = {} } = {}) {
  const callsFile = path.join(cwd ?? os.tmpdir(), "calls.json")
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [BIN, ...args],
      {
        cwd,
        env: { ...process.env, NO_COLOR: "1", PANEUI_REGISTRY: "", PANEUI_SHADCN: `"${process.execPath}" ${FAKE_SHADCN}`, FAKE_SHADCN_CALLS: callsFile, ...env },
      },
      (err, stdout, stderr) => {
        let calls = []
        try {
          calls = readJson(callsFile)
        } catch {}
        resolve({ code: err ? err.code : 0, stdout, stderr, calls })
      },
    )
  })
}
