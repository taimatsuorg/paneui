import assert from "node:assert/strict"
import { existsSync, readFileSync, rmSync } from "node:fs"
import path from "node:path"
import { after, before, describe, test } from "node:test"

import { lineDiff, normalize } from "../dist/detect.js"
import { baseFromTemplate, resolveRegistry } from "../dist/registry.js"
import { Project, nestedPath, parseJsonc } from "../dist/project.js"
import { score, search } from "../dist/search.js"
import { CONTENT, ITEMS, makeProject, readJson, run, startRegistry, write } from "./helpers.mjs"

let registry
const dirs = []
const project = (opts) => {
  const dir = makeProject(opts)
  dirs.push(dir)
  return dir
}

before(async () => {
  registry = await startRegistry()
})
after(async () => {
  await registry.close()
  for (const d of dirs) rmSync(d, { recursive: true, force: true })
})

describe("units", () => {
  test("reads the previous config and writes the new config", () => {
    const dir = project()
    const legacyName = "\u0074aimatsu.json"
    write(dir, legacyName, JSON.stringify({ items: ["button"], theme: { accent: "violet" } }))
    const app = new Project(dir)
    assert.deepEqual(app.lockfile().items, ["button"])
    app.writeLockfile({ ...app.lockfile(), items: ["button", "card"] })
    assert.deepEqual(readJson(path.join(dir, "paneui.json")).items, ["button", "card"])
    assert.deepEqual(app.lockfile().items, ["button", "card"])
    assert.deepEqual(readJson(path.join(dir, legacyName)).items, ["button"])
  })

  test("an invalid new config does not fall back to the previous config", () => {
    const dir = project()
    write(dir, "\u0074aimatsu.json", JSON.stringify({ items: ["button"] }))
    write(dir, "paneui.json", "invalid")
    assert.throws(() => new Project(dir).lockfile(), /paneui.json is not valid JSON/)
  })

  test("registry base from a components.json template", () => {
    assert.equal(baseFromTemplate("https://x.dev/ui/r/{name}.json"), "https://x.dev/ui/r")
    assert.equal(baseFromTemplate("https://x.dev/ui/r/"), "https://x.dev/ui/r")
    assert.equal(baseFromTemplate("https://x.dev/ui/r/registry.json"), "https://x.dev/ui/r")
  })

  test("registry precedence: flag, env, components.json, lockfile, default", () => {
    const cj = { registries: { "@paneui": "https://cj.dev/r/{name}.json" } }
    const prev = process.env.PANEUI_REGISTRY
    process.env.PANEUI_REGISTRY = "https://env.dev/r"
    assert.equal(resolveRegistry({ flag: "https://flag.dev/r", componentsJson: cj }).base, "https://flag.dev/r")
    assert.equal(resolveRegistry({ componentsJson: cj }).from, "env")
    delete process.env.PANEUI_REGISTRY
    assert.equal(resolveRegistry({ componentsJson: cj }).base, "https://cj.dev/r")
    assert.equal(resolveRegistry({ lockRegistry: "https://lock.dev/r" }).from, "lockfile")
    assert.equal(resolveRegistry({}).base, "https://paneui.dev/r")
    if (prev !== undefined) process.env.PANEUI_REGISTRY = prev
  })

  test("search ranks name matches first and hides hidden items", () => {
    const names = search(ITEMS, "chart").map((i) => i.name)
    assert.deepEqual(names, ["donut-chart"])
    assert.ok(score(ITEMS.find((i) => i.name === "button"), "button") > score(ITEMS.find((i) => i.name === "button"), "action"))
    assert.ok(!search(ITEMS, "theme").some((i) => i.meta?.hidden))
    assert.ok(search(ITEMS, "theme", { all: true }).some((i) => i.name === "theme-violet"))
    assert.deepEqual(search(ITEMS, "", { category: "forms" }).map((i) => i.name), ["button"])
    assert.deepEqual(search(ITEMS, "submits").map((i) => i.name), ["button"])
  })

  test("normalize ignores import paths, directives and semicolons", () => {
    const shipped = `"use client";\nimport { cn } from "@/registry/web/lib/utils";\nexport const a = 1;\n`
    const installed = `import { cn } from "@/lib/utils"\n\nexport const a = 1\n`
    assert.deepEqual(normalize(shipped), normalize(installed))
    const d = lineDiff(installed, shipped + "export const b = 2\n")
    assert.equal(d.added, 1)
    assert.equal(d.removed, 0)
  })

  test("nested install paths follow shadcn", () => {
    assert.equal(nestedPath("registry/web/ui/button.tsx", "/p/components/ui"), "button.tsx")
    assert.equal(nestedPath("registry/web/blocks/card-x/card-x.tsx", "/p/components"), "card-x.tsx")
  })

  test("parseJsonc handles comments and trailing commas", () => {
    assert.deepEqual(parseJsonc('{ // c\n "a": "http://x", /* b */ "b": [1,], }'), { a: "http://x", b: [1] })
  })
})

describe("commands", () => {
  test("search prints a table and --json", async () => {
    const cwd = project()
    const r = await run(["search", "button", "--registry", registry.base], { cwd })
    assert.equal(r.code, 0, r.stderr)
    assert.match(r.stdout, /NAME\s+CATEGORY\s+DESCRIPTION/)
    assert.match(r.stdout, /button\s+Forms\s+Triggers an action/)
    const j = await run(["list", "--json", "--registry", registry.base], { cwd })
    const names = JSON.parse(j.stdout).map((i) => i.name)
    assert.ok(names.includes("card") && !names.includes("theme-violet"))
  })

  test("info shows files at their install path", async () => {
    const cwd = project()
    const r = await run(["info", "button", "-r", registry.base], { cwd })
    assert.equal(r.code, 0, r.stderr)
    assert.match(r.stdout, /components\/ui\/button\.tsx/)
    assert.match(r.stdout, /Requires\s+theme/)
  })

  test("unknown items fail with a suggestion and never call shadcn", async () => {
    const cwd = project()
    const r = await run(["add", "buton", "-r", registry.base], { cwd })
    assert.equal(r.code, 1)
    assert.match(r.stderr, /did you mean button/)
    assert.equal(r.calls.length, 0)
  })

  test("add delegates to shadcn by URL, then presets and icon styles, and records them", async () => {
    const cwd = project()
    const r = await run(["add", "button", "@paneui/card", "theme-violet", "icons-custom", "--yes", "-r", registry.base], { cwd })
    assert.equal(r.code, 0, r.stderr)
    assert.deepEqual(
      r.calls.map((c) => c.args),
      [
        ["add", `${registry.base}/button.json`, `${registry.base}/card.json`, "--yes"],
        ["add", `${registry.base}/theme-violet.json`, "--yes"],
        ["add", `${registry.base}/icons-custom.json`, "--yes"],
      ],
    )
    const lock = readJson(path.join(cwd, "paneui.json"))
    assert.deepEqual(lock.items, ["button", "card"])
    assert.deepEqual(lock.theme, { accent: "violet" })
    assert.equal(lock.icons, "icons-custom")
    assert.equal(lock.registry, registry.base)
  })

  test("add uses @paneui/<name> when components.json registers this registry", async () => {
    const cwd = project({ components: { registries: { "@paneui": `${registry.base}/{name}.json` } } })
    const r = await run(["add", "card", "--overwrite"], { cwd })
    assert.equal(r.code, 0, r.stderr)
    assert.deepEqual(r.calls[0].args, ["add", "@paneui/card", "--overwrite"])
  })

  test("add --dry-run passes through and records nothing", async () => {
    const cwd = project()
    const r = await run(["add", "card", "--dry-run", "-r", registry.base], { cwd })
    assert.equal(r.code, 0, r.stderr)
    assert.deepEqual(r.calls[0].args, ["add", `${registry.base}/card.json`, "--dry-run"])
    assert.ok(!existsSync(path.join(cwd, "paneui.json")))
  })

  test("init registers the namespace for the shadcn CLI", async () => {
    const cwd = project()
    const r = await run(["init", "--no-theme", "-r", registry.base], { cwd })
    assert.equal(r.code, 0, r.stderr)
    const cj = readJson(path.join(cwd, "components.json"))
    assert.equal(cj.registries["@paneui"], `${registry.base}/{name}.json`)
    assert.equal(cj.style, "base-nova")
    assert.equal(r.calls.length, 0)
  })

  test("init installs the theme with --overwrite", async () => {
    const cwd = project()
    const r = await run(["init", "-r", registry.base], { cwd })
    assert.equal(r.code, 0, r.stderr)
    assert.deepEqual(r.calls[0].args, ["add", "@paneui/theme", "--overwrite", "--yes"])
  })

  test("theme <accent> reinstalls the theme, then the preset", async () => {
    const cwd = project()
    const r = await run(["theme", "violet", "-y", "-r", registry.base], { cwd })
    assert.equal(r.code, 0, r.stderr)
    assert.deepEqual(
      r.calls.map((c) => c.args),
      [
        ["add", `${registry.base}/theme.json`, "--overwrite", "--yes"],
        ["add", `${registry.base}/theme-violet.json`, "--overwrite", "--yes"],
      ],
    )
    assert.deepEqual(readJson(path.join(cwd, "paneui.json")).theme, { accent: "violet" })
    const bad = await run(["theme", "pink", "-r", registry.base], { cwd })
    assert.equal(bad.code, 1)
    assert.match(bad.stderr, /Choose one of: blue, violet/)
    const badOpt = await run(["theme", "violet", "--radius", "lg", "-r", registry.base], { cwd })
    assert.equal(badOpt.code, 1)
  })

  test("update --dry-run finds installed items without a lockfile and summarises changes", async () => {
    const cwd = project({
      files: {
        // Installed copy: imports rewritten by shadcn, plus one local edit.
        "components/ui/button.tsx": CONTENT.button.replace("@/registry/web/lib/utils", "@/lib/utils").replace("hover:bg-muted", "hover:bg-accent"),
        "components/ui/card.tsx": CONTENT.card.replace("@/registry/web/lib/utils", "@/lib/utils"),
        // Same name, someone else's file: must not be picked up.
        "components/ui/donut-chart.tsx": "import { Pie } from 'charts'\nexport const DonutChart = () => <Pie />\n// local\n",
        "app/blog/page.tsx": "export default function Page() {\n  return <main>Blog</main>\n}\n",
        "components/icons.tsx": "export const A = 1\nexport const B = 2\n// outline\n// thin strokes\n",
      },
    })
    write(cwd, "app/globals.css", ":root {\n  --primary: #6e56cf;\n  --primary-subtle: #008ff519;\n  --radius: 0.875rem;\n}\n")
    const r = await run(["update", "--dry-run", "-r", registry.base], { cwd })
    assert.equal(r.code, 0, r.stderr)
    assert.equal(r.calls.length, 0, "dry run must not call shadcn")
    assert.match(r.stdout, /Found 3 more in the project: button, card, blog/)
    assert.match(r.stderr, /Templates skipped.*blog/)
    assert.match(r.stdout, /~ button\n\s+~ components\/ui\/button\.tsx \+1 -1/)
    assert.match(r.stdout, /= card up to date/)
    assert.doesNotMatch(r.stdout, /donut-chart/)
    const cmds = r.stdout.split("Would run")[1]
    assert.match(cmds, /add \S+\/theme\.json \S+\/button\.json \S+\/card\.json --overwrite --yes/)
    assert.match(cmds, /add \S+\/theme-violet\.json --overwrite --yes/)
    assert.match(cmds, /add \S+\/icons-custom\.json --overwrite --yes/)
  })

  test("update --yes reinstalls recorded items in order and keeps the lockfile", async () => {
    const cwd = project({ components: { registries: { "@paneui": `${registry.base}/{name}.json` } } })
    write(cwd, "paneui.json", JSON.stringify({ items: ["card", "gone-item"], theme: { accent: "violet" } }))
    const r = await run(["update", "--yes", "--no-detect"], { cwd })
    assert.equal(r.code, 0, r.stderr)
    assert.match(r.stderr, /No longer in the registry, skipped: gone-item/)
    assert.deepEqual(
      r.calls.map((c) => c.args),
      [
        ["add", "@paneui/theme", "@paneui/card", "--overwrite", "--yes"],
        ["add", "@paneui/theme-violet", "--overwrite", "--yes"],
      ],
    )
    const lock = readJson(path.join(cwd, "paneui.json"))
    assert.deepEqual(lock.items, ["card"])
    assert.deepEqual(lock.theme, { accent: "violet" })
  })

  test("update --theme-only touches only the theme and presets", async () => {
    const cwd = project()
    write(cwd, "paneui.json", JSON.stringify({ registry: registry.base, items: ["card"], theme: { accent: "violet" }, icons: "icons-custom" }))
    const r = await run(["update", "--theme-only", "--yes", "--no-detect"], { cwd })
    assert.equal(r.code, 0, r.stderr)
    assert.deepEqual(
      r.calls.map((c) => c.args),
      [
        ["add", `${registry.base}/theme.json`, "--overwrite", "--yes"],
        ["add", `${registry.base}/theme-violet.json`, "--overwrite", "--yes"],
      ],
    )
    const lock = readJson(path.join(cwd, "paneui.json"))
    assert.deepEqual(lock.items, ["card"])
    assert.equal(lock.icons, "icons-custom")
  })

  test("update without --yes refuses to run non-interactively", async () => {
    const cwd = project()
    const r = await run(["update", "-r", registry.base], { cwd })
    assert.equal(r.code, 1)
    assert.match(r.stderr, /Pass --yes/)
    assert.equal(r.calls.length, 0)
  })

  test("--version and unknown commands", async () => {
    const v = await run(["--version"], { cwd: project() })
    assert.equal(v.stdout.trim(), JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version)
    const u = await run(["frobnicate"], { cwd: project() })
    assert.equal(u.code, 1)
    assert.match(u.stderr, /Unknown command/)
  })
})
