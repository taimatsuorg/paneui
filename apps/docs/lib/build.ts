/*
 * Build-time helpers for Astro page frontmatter (src/pages/**). They read the repo (fs, git) and
 * highlight code, so they must never be imported by a React component: a page island only gets
 * their plain JSON results as props.
 */
import { highlight as highlightCode } from "@paneui/ui/lib/highlight"

import type { NavGroup } from "@/components/docs/docs-nav"
import type { DocNav } from "@/lib/doc-types"
import { getNavGroups, getPrevNext, lastUpdated } from "@/lib/docs"

const EXT: Record<string, string> = { mjs: "javascript", cjs: "javascript", md: "markdown", sh: "bash", yml: "yaml" }

/** Language id for a file name like `app/page.tsx` (or the fallback). */
export function languageOf(filename?: string, fallback = "text") {
  const ext = filename?.split(".").pop()?.toLowerCase()
  if (!ext || ext === filename) return fallback
  return EXT[ext] ?? ext
}

const cache = new Map<string, Promise<string>>()

/** Dual-theme markup for <CodeBlock html> / <StaticCode html>, cached per code and language. */
export function highlight(code: string, language = "text"): Promise<string> {
  const key = `${language}\u0000${code}`
  let html = cache.get(key)
  if (!html) {
    html = Promise.resolve(highlightCode(code.replace(/\n$/, ""), language))
    cache.set(key, html)
  }
  return html
}

/** Highlights every entry of a `{ key: code }` map; `lang` per key defaults to tsx. */
export async function highlightAll<K extends string>(snippets: Record<K, string>, lang: Partial<Record<K, string>> | string = "tsx") {
  const out = {} as Record<K, string>
  await Promise.all(
    (Object.keys(snippets) as K[]).map(async (k) => {
      out[k] = await highlight(snippets[k], typeof lang === "string" ? lang : (lang[k] ?? "tsx"))
    })
  )
  return out
}

let navGroups: NavGroup[] | undefined
/** Sidebar groups for the docs chrome (same shape the Next layout passed to RouteShell). */
export function siteNavGroups(): NavGroup[] {
  navGroups ??= getNavGroups().map((g) => ({
    category: g.category,
    items: g.items.map(({ name, title, summary }) => ({ name, title, description: summary })),
  }))
  return navGroups
}

/** Previous / next and last-updated date for a docs page; `sources` are repo-relative paths whose git date counts. */
export function docNav(href: string, sources: string[]): DocNav {
  const { prev, next } = getPrevNext(href)
  const updated = lastUpdated(sources.map((s) => (s.startsWith("apps/") || s.startsWith(".agents/") || s.startsWith("packages/") ? s : `apps/docs/${s}`)))
  return { prev, next, updated: updated?.toISOString() }
}
