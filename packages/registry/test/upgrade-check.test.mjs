import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")
const script = path.join(root, "packages/registry/files/scripts/upgrade-check.mjs")

/** Runs the upgrade check in a throwaway project holding `css` (and optional source files). */
function check(css, files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "paneui-upgrade-check-"))
  try {
    fs.mkdirSync(path.join(dir, "src/styles"), { recursive: true })
    fs.writeFileSync(path.join(dir, "components.json"), JSON.stringify({ tailwind: { css: "src/styles/theme.css" } }))
    fs.writeFileSync(path.join(dir, "src/styles/theme.css"), css)
    for (const [name, content] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true })
      fs.writeFileSync(path.join(dir, name), content)
    }
    return spawnSync(process.execPath, [script], { cwd: dir, encoding: "utf8" }).stdout
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

const current = fs.readFileSync(path.join(root, "packages/tokens/styles/globals.css"), "utf8")

test("the fonts note names the faces the current stack lists", () => {
  const out = check(current)
  const line = out.split("\n").find((l) => l.includes("nothing imports fonts.css"))
  assert.ok(line, out)
  assert.match(line, /Noto Sans/)
  assert.match(line, /JetBrains Mono/)
  assert.match(line, /Newsreader/)
  assert.doesNotMatch(line, /Inter/)
  assert.doesNotMatch(out, /no longer use/)
})

test("the fonts note stays quiet when a source file imports fonts.css", () => {
  const out = check(current, { "src/app/layout.tsx": 'import "@/styles/fonts.css"\n' })
  assert.doesNotMatch(out, /fonts\.css/)
})

test("an older stack with a retired face gets its own note", () => {
  const old = current.replace(/--font-sans:\s*"Noto Sans Variable"/, '--font-sans: "Inter Variable"')
  const out = check(old)
  assert.match(out, /the font stack names .*JetBrains Mono.* but nothing imports fonts\.css/)
  assert.match(out, /still names Inter, which the theme and fonts item no longer use/)
})

test("a stack of system faces only gets no fonts note", () => {
  const system = current.replace(/--font-(sans|mono|serif|heading):[^;]*;/g, "--font-$1: system-ui, sans-serif;")
  assert.doesNotMatch(check(system), /font stack/)
})
