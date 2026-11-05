import "server-only"

import type { Localized } from "./site-locale"
import { DOC_SUMMARIES } from "./doc-summaries"
import { HOST_TITLES, MERGES } from "./doc-merges"

import { execFileSync } from "node:child_process"
import fs from "node:fs"
import { REPO_ROOT, repoPath } from "./repo-path"
import { publishSource } from "@paneui/registry/source"

import { COMPONENTS_HREF, COMPONENTS_TITLE, GUIDE_PAGES } from "@/components/docs/docs-pages"
import registry from "@paneui/registry/manifest.json"

export type Category = (typeof ORDER)[number]

export type DocItem = {
  name: string
  title: string
  description: Localized
  /** One-line description for cards, nav and page ledes; falls back to description. */
  summary: Localized
  category: Category
  type: string
  dependencies: string[]
  registryDependencies: string[]
  files: string[]
}

/** Component categories first (sidebar "Components" section, gallery), full-page templates last. */
export const ORDER = ["Foundations", "Forms", "Overlays", "Display", "Navigation", "Text", "Motion", "Data", "Agents", "Charts", "Blocks", "Templates"] as const

/**
 * Short display copy for items whose registry description is a full spec
 * (the registry text stays complete for `shadcn view`; the docs show this).
 */
const SUMMARIES = DOC_SUMMARIES

function categoryOf(type: string, meta?: { category?: string }): Category {
  if (meta?.category && (ORDER as readonly string[]).includes(meta.category)) return meta.category as Category
  if (type === "registry:block") return "Blocks"
  if (type === "registry:ui") return "Display"
  return "Foundations"
}

export const REGISTRY_NAME = registry.name
export const SITE_URL = process.env.SITE_URL || registry.homepage
export const REGISTRY_URL = `${SITE_URL}/r/{name}.json`

export function getItems(): DocItem[] {
  return registry.items
    // Accent presets (theme-blue, …) are installable but documented on the Installation page, not as their own pages.
    .filter((item) => !(item as { meta?: { hidden?: boolean } }).meta?.hidden)
    .map((item) => {
      const i = item as typeof item & { dependencies?: string[]; registryDependencies?: string[]; files?: { path: string }[] }
      return {
        name: i.name,
        title: HOST_TITLES[i.name] ?? i.title ?? i.name,
        description: i.description ?? "",
        summary: SUMMARIES[i.name] ?? i.description ?? "",
        type: i.type,
        category: categoryOf(i.type, (i as { meta?: { category?: string } }).meta),
        dependencies: i.dependencies ?? [],
        registryDependencies: i.registryDependencies ?? [],
        files: i.name === "theme" ? ["packages/tokens/styles/globals.css"] : (i.files ?? []).map((f) => f.path),
      }
    })
    .sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category))
}

/** Items that have their own page: every item but the variants documented on a host page (lib/doc-merges.ts). */
export function getPageItems() {
  return getItems().filter((i) => !(i.name in MERGES))
}

export function getGroups() {
  const items = getPageItems()
  return ORDER.map((category) => ({ category, items: items.filter((i) => i.category === category) })).filter((g) => g.items.length > 0)
}

/**
 * Sidebar order: categories in ORDER, items A–Z inside each (
 * component list). The gallery keeps the curated registry order instead.
 */
export function getNavGroups() {
  return getGroups().map((g) => ({ ...g, items: [...g.items].sort((a, b) => a.title.localeCompare(b.title)) }))
}

export function getItem(name: string) {
  return getItems().find((i) => i.name === name)
}

export function readSource(file: string) {
  return publishSource(fs.readFileSync(repoPath(file), "utf8").trimEnd())
}

export function demoFile(name: string) {
  return `apps/docs/registry/examples/${name}-demo.tsx`
}

/** One docs page in sidebar order: its section (the page eyebrow) and its title. */
export type DocsPageRef = { href: string; title: string; section: string }

/**
 * Every docs page in sidebar order: the Getting started pages, the components overview, each
 * component category (A–Z inside it), then templates. Drives the prev/next cards.
 */
export function getDocsSequence(): DocsPageRef[] {
  return [
    ...GUIDE_PAGES.map((p) => ({ href: p.href, title: p.title, section: "Getting started" })),
    { href: COMPONENTS_HREF, title: COMPONENTS_TITLE, section: "Components" },
    ...getNavGroups().flatMap((g) => g.items.map((i) => ({ href: `/docs/${i.name}`, title: i.title, section: g.category }))),
  ]
}

export function getPrevNext(href: string) {
  const seq = getDocsSequence()
  const i = seq.findIndex((p) => p.href === href)
  return { prev: i > 0 ? seq[i - 1] : undefined, next: i >= 0 ? seq[i + 1] : undefined }
}

/**
 * Last commit date touching any of these paths, read from git at build time. Returns undefined when
 * git is missing, the checkout is shallow or the paths have no history yet, so the page simply
 * leaves the date out.
 */
export function lastUpdated(paths: string[]): Date | undefined {
  const existing = paths.filter((p) => fs.existsSync(repoPath(p)))
  if (existing.length === 0) return undefined
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%ct", "--", ...existing], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    }).trim()
    const seconds = Number(out)
    return out && Number.isFinite(seconds) ? new Date(seconds * 1000) : undefined
  } catch {
    return undefined
  }
}

/** The source files behind a component or template page, for its "Last updated" date. */
export function docSources(name: string): string[] {
  const item = getItem(name)
  const variants = Object.entries(MERGES).filter(([, m]) => m.host === name).map(([v]) => v)
  return [
    ...variants.flatMap((v) => docSources(v)),
    `apps/docs/content/docs/${name}.ts`,
    `apps/docs/registry/examples/${name}`,
    demoFile(name),
    ...(item?.files ?? []),
  ]
}
