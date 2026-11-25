import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

import { DEFAULT_ACCENT, DEFAULT_ICONS } from "./meta.js"
import type { Project } from "./project.js"
import { iconStyles, themePresets, type Registry, type RegistryIndex, type RegistryItem } from "./registry.js"

/**
 * shadcn rewrites import paths to the project's aliases and may drop the client directive, so
 * compare files on trimmed, non-empty lines with every local import reduced to its last segment.
 * shadcn also drops a file's leading block comment, so that is skipped too.
 */
export function normalize(content: string): string[] {
  return content
    .replace(/^\s*(["']use client["'];?\s*)?\/\*[\s\S]*?\*\/\s*/, "$1")
    .split(/\r?\n/)
    .map((l) =>
      l
        .trim()
        .replace(/(from\s+|import\s*\(\s*|import\s+|require\(\s*)(["'])([@~#.][^"']*)\2/g, (_m, kw: string, q: string, spec: string) => {
          const last = spec.split("/").pop() ?? spec
          return `${kw}${q}${last}${q}`
        })
        .replace(/;$/, ""),
    )
    .filter((l) => l && !/^["']use client["']$/.test(l))
}

export interface LineDiff {
  added: number
  removed: number
  similarity: number
}

/** Multiset line diff: fast, order-insensitive, good enough for a summary and a similarity score. */
export function lineDiff(before: string, after: string): LineDiff {
  const a = normalize(before)
  const b = normalize(after)
  const counts = new Map<string, number>()
  for (const l of a) counts.set(l, (counts.get(l) ?? 0) + 1)
  let common = 0
  for (const l of b) {
    const n = counts.get(l) ?? 0
    if (n > 0) {
      common++
      counts.set(l, n - 1)
    }
  }
  const denom = Math.max(a.length, b.length) || 1
  return { added: b.length - common, removed: a.length - common, similarity: common / denom }
}

export interface FileChange {
  path: string
  status: "new" | "same" | "changed"
  added: number
  removed: number
}

export interface ItemChange {
  name: string
  files: FileChange[]
  /** CSS variables the item sets that differ from (or are missing in) the stylesheet. */
  cssVars?: { changed: number; total: number }
}

async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i])
    }
  })
  await Promise.all(workers)
  return out
}

const read = (p: string) => readFileSync(p, "utf8")

/** Items that are page templates: re-adding them would replace the app's own routes. */
export function isTemplate(item: RegistryItem) {
  return item.meta?.category === "Templates" || (item.files ?? []).some((f) => f.type === "registry:page")
}

/** Every value the stylesheet gives `--name` (in :root, .dark, @theme…), in source order. */
export function cssVarValues(css: string, name: string): string[] {
  const re = new RegExp(`--${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*([^;]+);`, "g")
  return [...css.matchAll(re)].map((m) => m[1].trim())
}

export function cssVarValue(css: string, name: string): string | null {
  return cssVarValues(css, name)[0] ?? null
}

const hasValue = (css: string, name: string, value: unknown) => cssVarValues(css, name).includes(String(value).trim())

export function cssVarChanges(css: string | null, item: RegistryItem, ignore?: Set<string>) {
  const vars = Object.fromEntries(Object.entries(item.cssVars?.light ?? {}).filter(([k]) => !ignore?.has(k)))
  const total = Object.keys(vars).length + Object.keys(item.cssVars?.dark ?? {}).length + Object.keys(item.cssVars?.theme ?? {}).length
  if (!css) return { changed: total, total }
  let changed = 0
  for (const [k, v] of Object.entries(vars)) if (!hasValue(css, k, v)) changed++
  for (const k of Object.keys(item.cssVars?.dark ?? {})) if (cssVarValue(css, k) === null) changed++
  for (const k of Object.keys(item.cssVars?.theme ?? {})) if (cssVarValue(css, k) === null) changed++
  return { changed, total }
}

export async function itemChange(project: Project, item: RegistryItem, ignoreVars?: Set<string>): Promise<ItemChange> {
  const files: FileChange[] = []
  for (const f of item.files ?? []) {
    const local = project.findInstalled(f)
    const rel = path.relative(project.cwd, local ?? project.installPaths(f)[0]).replaceAll("\\", "/")
    if (!local) {
      files.push({ path: rel, status: "new", added: f.content ? normalize(f.content).length : 0, removed: 0 })
      continue
    }
    const d = lineDiff(read(local), f.content ?? "")
    files.push({ path: rel, status: d.added === 0 && d.removed === 0 ? "same" : "changed", added: d.added, removed: d.removed })
  }
  const change: ItemChange = { name: item.name, files }
  if (item.cssVars) {
    const css = project.cssPath()
    change.cssVars = cssVarChanges(css ? read(css) : null, item, ignoreVars)
  }
  return change
}

export interface Detected {
  items: string[]
  templates: string[]
  theme: boolean
  accent?: string
  icons?: string
}

const SHARED = new Set(["utils"])

/**
 * Finds registry items already in the project without a lockfile: every file of the item exists
 * where shadcn would write it, and the local copies share at least half their lines with the
 * registry version (so a same-named file from another registry is not mistaken for ours).
 */
export async function detect(project: Project, registry: Registry, index: RegistryIndex): Promise<Detected> {
  const icons = new Set(iconStyles(index))
  const candidates = index.items.filter(
    (i) =>
      (i.files?.length ?? 0) > 0 &&
      !icons.has(i.name) &&
      !SHARED.has(i.name) &&
      i.type !== "registry:theme" &&
      (i.files ?? []).every((f) => project.findInstalled(f)),
  )
  const scored = await pool(candidates, 8, async (stub) => {
    try {
      const item = await registry.item(stub.name)
      const sims = (item.files ?? []).map((f) => {
        const local = project.findInstalled(f)
        return local && f.content ? lineDiff(read(local), f.content).similarity : 0
      })
      const avg = sims.reduce((a, b) => a + b, 0) / (sims.length || 1)
      return { item, ok: avg >= 0.5 }
    } catch {
      return { item: stub, ok: false }
    }
  })
  const found = scored.filter((s) => s.ok).map((s) => s.item)
  const result: Detected = {
    items: found.filter((i) => !isTemplate(i)).map((i) => i.name),
    templates: found.filter(isTemplate).map((i) => i.name),
    theme: false,
  }

  const cssPath = project.cssPath()
  if (cssPath) {
    const css = read(cssPath)
    try {
      const theme = await registry.item("theme")
      const keys = Object.keys(theme.cssVars?.light ?? {})
      result.theme = keys.length > 0 && keys.filter((k) => cssVarValue(css, k) !== null).length / keys.length >= 0.5
    } catch {
      // no theme item in this registry
    }
    if (result.theme) {
      const { accents } = themePresets(index)
      const matches = async (name: string) => {
        try {
          const vars = Object.entries((await registry.item(name)).cssVars?.light ?? {})
          return vars.length > 0 && vars.every(([k, v]) => hasValue(css, k, v))
        } catch {
          return false
        }
      }
      for (const a of accents) if (a !== DEFAULT_ACCENT && (await matches(`theme-${a}`))) result.accent = a
    }
  }

  const iconFile = [...icons].map((n) => index.items.find((i) => i.name === n)?.files?.[0]).find(Boolean)
  const iconPath = iconFile ? project.findInstalled(iconFile) : null
  if (iconPath && existsSync(iconPath)) {
    const local = read(iconPath)
    let best = { name: "", sim: 0 }
    for (const n of icons) {
      try {
        const content = (await registry.item(n)).files?.[0]?.content ?? ""
        const sim = lineDiff(local, content).similarity
        if (sim > best.sim) best = { name: n, sim }
      } catch {
        // skip unreachable style
      }
    }
    if (best.sim >= 0.5 && best.name !== DEFAULT_ICONS) result.icons = best.name
  }
  return result
}
