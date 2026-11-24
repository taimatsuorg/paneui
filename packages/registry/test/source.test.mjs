import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"

import { publishPath, publishSource } from "../src/source.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")
const manifest = JSON.parse(fs.readFileSync(path.join(root, "packages/registry/registry.json"), "utf8"))

test("all registry sources exist and have portable published paths", () => {
  for (const item of manifest.items) for (const file of item.files ?? []) {
    assert.ok(fs.existsSync(path.join(root, file.path)), `${item.name}: ${file.path}`)
    assert.doesNotMatch(publishPath(file.path), /^(packages|apps)\//)
    if (file.target) assert.doesNotMatch(file.target, /^(packages|apps)\//, `${item.name}: install target`)
    const source = fs.readFileSync(path.join(root, file.path), "utf8")
    assert.doesNotMatch(publishSource(source), /(?:from\s*|import\s*\()["']@paneui\/(?:ui|core)\//, file.path)
  }
})

test("workspace imports become registry aliases without changing item identifiers", () => {
  assert.equal(publishPath("packages/ui/src/blocks/notion-editor/mdx.ts"), "registry/web/blocks/notion-editor/mdx.ts")
  assert.equal(publishPath("packages/ui/src/icons/index.tsx"), "components/icons.tsx")
  assert.equal(publishPath(".agents/skills/paneui-design/SKILL.md"), "skills/paneui-design/SKILL.md")
  assert.equal(publishSource('import { Button } from "@paneui/ui/components/button"'), 'import { Button } from "@/registry/web/ui/button"')
  assert.equal(publishSource('import { XIcon } from "@paneui/ui/icons"'), 'import { XIcon } from "@/components/icons"')
  assert.ok(manifest.items.some((item) => item.name === "button"))
})


test("published index and item files keep consumer installation targets", () => {
  const publicDir = path.join(root, "apps/docs/public/r")
  const index = JSON.parse(fs.readFileSync(path.join(publicDir, "registry.json"), "utf8"))
  const publishedItems = manifest.items.map((item) => JSON.parse(fs.readFileSync(path.join(publicDir, `${item.name}.json`), "utf8")))
  for (const published of [...publishedItems, ...index.items]) {
    for (const file of published.files ?? []) {
      assert.doesNotMatch(file.path, /^(packages|apps)\//)
      if (file.target) assert.doesNotMatch(file.target, /^(packages|apps)\//)
    }
  }
  const icons = JSON.parse(fs.readFileSync(path.join(publicDir, "icons.json"), "utf8"))
  assert.equal(icons.files[0].target, "components/icons.tsx")
})
