#!/usr/bin/env node
/**
 * Writes a Markdown twin of every docs page into the static export (run after `astro build`):
 *   out/docs/<name>.md   component and template pages, from registry.json, apps/docs/content/docs/<name>.ts and the example files
 *   out/docs/index.md, out/docs/<guide>.md   Getting started pages, from their built HTML (the design skill page from SKILL.md)
 * The page actions menu copies, opens and shares these files; public/llms.txt links to them.
 *
 * Needs Node 22 with TypeScript type stripping (`node --experimental-strip-types`) to read apps/docs/content/docs/*.ts.
 * SITE_URL sets the absolute links (defaults to registry.json's homepage).
 */
import { publishSource } from "../../packages/registry/src/source.mjs"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const outDir = path.join(root, process.argv[2] ?? "apps/docs/out")
const registry = JSON.parse(fs.readFileSync(path.join(root, "packages/registry/registry.json"), "utf8"))
const base = (process.env.SITE_URL || registry.homepage).replace(/\/$/, "")
const ns = registry.name
const read = (f) => publishSource(fs.readFileSync(path.join(root, f), "utf8").trimEnd())
const exists = (f) => fs.existsSync(path.join(root, f))

if (!fs.existsSync(path.join(outDir, "docs"))) {
  console.error(`gen-docs-md: ${path.relative(root, outDir)}/docs not found; run astro build first`)
  process.exit(1)
}

const fence = (code, lang = "") => {
  const ticks = code.match(/`{3,}/g)?.reduce((m, t) => Math.max(m, t.length + 1), 3) ?? 3
  return `${"`".repeat(ticks)}${lang}\n${code}\n${"`".repeat(ticks)}`
}
const cell = (s = "") => String(s).replace(/\|/g, "\\|").replace(/\n+/g, " ")
/** A value as inline code; one that already holds code spans ("true for `icon*` sizes") keeps them as written. */
const codeCell = (s = "") => (String(s).includes("`") ? cell(s) : `\`${cell(s)}\``)
/** Inline docs text keeps its `code` and [links](…); site-relative links become absolute. */
const english = (text) => typeof text === "string" ? text : text.en
const inline = (s = "") => english(s).replace(/\]\((\/[^)]*)\)/g, (_, href) => `](${base}${href})`)

// ---------- components and templates ----------

const visible = registry.items.filter((i) => !i.meta?.hidden)
let count = 0

for (const item of visible) {
  const name = item.name
  const pageDir = path.join(outDir, "docs", name)
  if (!fs.existsSync(pageDir)) continue
  const doc = exists(`apps/docs/content/docs/${name}.ts`) ? (await import(path.join(root, `apps/docs/content/docs/${name}.ts`))).default : undefined
  const title = item.title ?? name
  const md = [`# ${title}`, ""]
  if (item.description) md.push(`> ${item.description}`, "")
  md.push(`Page: ${base}/docs/${name}/`, "")

  md.push("## Installation", "", fence(`npx shadcn@latest add @${ns}/${name}`, "bash"), "")
  md.push(`Without the \`@${ns}\` namespace in components.json:`, "", fence(`npx shadcn@latest add ${base}/r/${name}.json`, "bash"), "")
  if (item.dependencies?.length) md.push(`Packages: ${item.dependencies.map((d) => `\`${d}\``).join(", ")}.`, "")
  if (item.registryDependencies?.length) md.push(`Registry items it builds on: ${item.registryDependencies.map((d) => `\`${d}\``).join(", ")}.`, "")

  if (doc) {
    md.push("## Usage", "", fence(doc.usage.imports, "tsx"), "", fence(doc.usage.code, "tsx"), "")
    if (doc.composition) md.push("## Composition", "", fence(doc.composition, "text"), "")
  } else if (exists(`apps/docs/registry/examples/${name}-demo.tsx`)) {
    md.push("## Usage", "", fence(read(`apps/docs/registry/examples/${name}-demo.tsx`), "tsx"), "")
  }

  if (doc?.examples?.length) {
    md.push("## Examples", "")
    for (const ex of doc.examples) {
      md.push(`### ${english(ex.title)}`, "")
      if (ex.description) md.push(inline(ex.description), "")
      const file = `apps/docs/registry/examples/${name}/${ex.id}.tsx`
      if (exists(file)) md.push(fence(read(file), "tsx"), "")
    }
  }

  for (const n of doc?.notes ?? []) md.push(`## ${n.title}`, "", inline(n.body), "")

  if (doc && (doc.api.length || doc.baseUi)) {
    md.push("## API Reference", "")
    if (doc.baseUi)
      md.push(`Built on [the ${doc.baseUi.name} primitive](${doc.baseUi.href}#api-reference). Only the props this library adds or changes are listed; everything else passes through.`, "")
    for (const part of doc.api) {
      md.push(`### ${part.name}`, "")
      const lead = [part.description && inline(part.description), part.extends && `Also accepts every prop of ${part.extendsHref ? `[${part.extends}](${part.extendsHref})` : `\`${part.extends}\``}.`]
        .filter(Boolean)
        .join(" ")
      if (lead) md.push(lead, "")
      if (part.props.length) {
        md.push("| Prop | Type | Default | Description |", "| --- | --- | --- | --- |")
        for (const p of part.props)
          md.push(`| \`${p.name}\`${p.required ? " (required)" : ""} | ${codeCell(p.type)} | ${p.default ? codeCell(p.default) : "—"} | ${cell(inline(p.description))} |`)
        md.push("")
      }
      if (part.dataAttributes?.length) {
        md.push("| Data attribute | Description |", "| --- | --- |")
        for (const d of part.dataAttributes) md.push(`| \`${d.name}\` | ${cell(inline(d.description))} |`)
        md.push("")
      }
    }
  }

  fs.writeFileSync(path.join(outDir, "docs", `${name}.md`), md.join("\n").trimEnd() + "\n")
  count++
}

// ---------- Getting started pages, from their built HTML ----------

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"])
const SKIP = new Set(["script", "style", "svg", "button", "template", "noscript", "iframe", "select", "textarea", "input"])

/** A small HTML reader for the export's own markup (well formed, React output). */
function parse(html) {
  const rootNode = { tag: "#root", attrs: {}, children: [] }
  const stack = [rootNode]
  const tagRe = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g
  let last = 0
  for (const m of html.matchAll(tagRe)) {
    if (m.index > last) stack.at(-1).children.push(decode(html.slice(last, m.index)))
    last = m.index + m[0].length
    if (m[0].startsWith("<!--")) continue
    const [, close, rawTag, rawAttrs, selfClose] = m
    const tag = rawTag.toLowerCase()
    if (close) {
      const i = stack.findLastIndex((n) => n.tag === tag)
      if (i > 0) stack.length = i
      continue
    }
    const attrs = {}
    for (const a of rawAttrs.matchAll(/([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? "")
    const node = { tag, attrs, children: [] }
    stack.at(-1).children.push(node)
    if (tag === "script" || tag === "style") {
      const end = html.indexOf(`</${tag}>`, last)
      last = end < 0 ? html.length : end + tag.length + 3
      tagRe.lastIndex = last
      continue
    }
    if (!selfClose && !VOID.has(tag)) stack.push(node)
  }
  return rootNode
}

function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
}

const find = (node, pred) => {
  if (typeof node === "string") return undefined
  if (pred(node)) return node
  for (const c of node.children) {
    const hit = find(c, pred)
    if (hit) return hit
  }
}
/*
 * Markup hooks for this script (see AGENTS.md › Component docs pages):
 *   data-md-skip, data-md="skip"   leave the element out (page chrome, interactive previews, phone-only duplicates)
 *   data-md-text="…"               write this Markdown instead of the element's content (a fallback for a widget)
 *   data-md-only                   visually hidden (`hidden`), written only to the Markdown
 *   data-md-after="…"              text after the element (": " between a label and its description)
 *   data-md="links"                link tiles: each <a> inside becomes "- [title](url): description", the title from
 *                                  [data-md-title] (else the link text), the description from [data-md-desc]
 */
const hidden = (n) =>
  !("data-md-only" in n.attrs) &&
  (SKIP.has(n.tag) ||
    "data-md-skip" in n.attrs ||
    n.attrs["data-md"] === "skip" ||
    n.attrs["aria-hidden"] === "true" ||
    "hidden" in n.attrs ||
    n.attrs.class?.split(/\s+/).includes("sr-only") ||
    (n.attrs.role === "tabpanel" && n.attrs["data-hidden"] !== undefined))
const textOf = (n) => (typeof n === "string" ? n : n.children.map(textOf).join(""))

/** Inline Markdown for a run of nodes. */
function inlineMd(nodes) {
  let s = ""
  let prevSpan = false
  for (const n of nodes) {
    // Two elements laid out side by side (a name and a count, a token and its class) read as two words.
    const span = typeof n !== "string" && n.tag !== "br" && !hidden(n)
    if (span && prevSpan && s && !/[\s(]$/.test(s)) s += " "
    if (typeof n === "string") {
      if (n) prevSpan = false
      s += n.replace(/\s+/g, " ")
      continue
    }
    if (hidden(n)) continue
    prevSpan = span
    if ("data-md-text" in n.attrs) {
      s += n.attrs["data-md-text"]
      continue
    }
    const after = n.attrs["data-md-after"] ?? ""
    const inner = () => inlineMd(n.children)
    if (n.tag === "code") s += "`" + textOf(n).replace(/\s+/g, " ") + "`"
    else if (n.tag === "strong" || n.tag === "b") s += `**${inner().trim()}**`
    else if (n.tag === "em" || n.tag === "i") s += `_${inner().trim()}_`
    else if (n.tag === "br") s += "\n"
    else if (n.tag === "a" && n.attrs.href && !n.attrs.href.startsWith("#")) {
      const href = n.attrs.href.startsWith("/") ? base + n.attrs.href.replace(/^\/ui(?=\/)/, "") : n.attrs.href
      const label = inner().trim()
      s += label ? `[${label}](${href})` : ""
    } else s += inner()
    if (after) s = s.replace(/\s+$/, "") + after
  }
  return s
}

/** Link tiles: one list item per link, title and optional one-line description, no counts or icons. */
function linkList(node) {
  const links = []
  const walk = (x) => {
    if (typeof x === "string" || hidden(x)) return
    if (x.tag === "a" && x.attrs.href) links.push(x)
    else x.children.forEach(walk)
  }
  walk(node)
  return links
    .map((a) => {
      const href = a.attrs.href.startsWith("/") ? base + a.attrs.href.replace(/^\/ui(?=\/)/, "") : a.attrs.href
      const t = find(a, (x) => "data-md-title" in x.attrs)
      const d = find(a, (x) => "data-md-desc" in x.attrs)
      const title = inlineMd(t ? t.children : a.children).replace(/\s+/g, " ").trim()
      const desc = d ? inlineMd(d.children).replace(/\s+/g, " ").trim() : ""
      return `- [${title}](${href})${desc ? `: ${desc}` : ""}`
    })
    .join("\n")
}

const BLOCK = new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "pre", "table", "blockquote", "section", "div", "header", "footer", "article", "figure", "dl", "li", "hr", "nav", "aside", "main", "details", "summary", "dt", "dd", "figcaption"])
const hasBlock = (n) => typeof n !== "string" && n.children.some((c) => typeof c !== "string" && (BLOCK.has(c.tag) || hasBlock(c)))

/** Block Markdown: one string per block. */
function blocks(node, out = []) {
  let run = []
  const flush = () => {
    const t = inlineMd(run).replace(/[ \t]+/g, " ").trim()
    if (t) out.push(t)
    run = []
  }
  for (const n of node.children) {
    const special = typeof n !== "string" && ("data-md-text" in n.attrs || n.attrs["data-md"] === "links")
    if (typeof n === "string" || (!special && !BLOCK.has(n.tag) && !hasBlock(n) && !n.attrs["data-slot"]?.startsWith("command-pill"))) {
      run.push(n)
      continue
    }
    flush()
    if (hidden(n)) continue
    const h = /^h([1-6])$/.exec(n.tag)
    const slot = n.attrs["data-slot"]
    if ("data-md-text" in n.attrs) {
      if (n.attrs["data-md-text"]) out.push(n.attrs["data-md-text"])
    } else if (n.attrs["data-md"] === "links") {
      const list = linkList(n)
      if (list) out.push(list)
    } else if (n.tag === "dl") {
      // Term and description pairs: "- **Term**: description".
      const items = []
      const walk = (x) => {
        if (typeof x === "string" || hidden(x)) return
        if (x.tag === "dt") items.push({ dt: inlineMd(x.children).trim(), dd: [] })
        else if (x.tag === "dd") items.at(-1)?.dd.push(inlineMd(x.children).trim())
        else x.children.forEach(walk)
      }
      walk(n)
      out.push(items.map((i) => `- **${i.dt}**${i.dd.length ? `: ${i.dd.join(" ")}` : ""}`).join("\n"))
    } else if (slot === "command-pill") {
      // An install command: the shell prompt glyph is aria-hidden, the command is the <code>.
      const code = find(n, (x) => x.tag === "code")
      if (code) out.push(fence(textOf(code).trim(), "bash"))
    } else if (slot === "code-block") {
      // Header spans: icon, file name, language. The fence takes the language and keeps the file name as its title.
      const header = find(n, (x) => x.attrs["data-slot"] === "code-block-header")
      const labels = header ? header.children.filter((c) => typeof c !== "string" && c.tag === "span").map((c) => textOf(c).trim()).filter(Boolean) : []
      const pre = find(n, (x) => x.tag === "pre")
      const [title, lang] = labels.length >= 2 ? labels : [undefined, labels[0]]
      if (pre) out.push(fence(textOf(pre).replace(/\n$/, ""), `${lang ?? ""}${title ? ` title="${title}"` : ""}`))
    } else if (slot?.endsWith("-title") && !h) {
      const t = inlineMd(n.children).trim()
      if (t) out.push(`**${t}**`)
    } else if (h) {
      const t = inlineMd(n.children).trim()
      if (t) out.push(`${"#".repeat(Number(h[1]))} ${t}`)
    } else if (n.tag === "pre") {
      out.push(fence(textOf(n).replace(/\n$/, ""), n.attrs["data-lang"] || ""))
    } else if (n.tag === "ul" || n.tag === "ol") {
      const items = n.children.filter((c) => typeof c !== "string" && c.tag === "li" && !hidden(c))
      out.push(
        items
          .map((li, i) => {
            const sub = blocks(li)
            const mark = n.tag === "ol" ? `${i + 1}.` : "-"
            return `${mark} ${sub.join("\n\n").replace(/\n/g, "\n   ")}`
          })
          .join("\n"),
      )
    } else if (n.tag === "table") {
      const rows = []
      const walk = (x) => typeof x !== "string" && (x.tag === "tr" ? rows.push(x) : x.children.forEach(walk))
      walk(n)
      if (rows.length) {
        // Cells a SimpleTable marks as code (names, types, defaults) keep their code formatting.
        const cellMd = (c) => {
          if (hidden(c)) return ""
          const t = inlineMd(c.children).trim()
          return ["code", "code-muted", "type"].includes(c.attrs["data-variant"]) && t && !t.includes("`") && t !== "—" ? codeCell(t) : cell(t)
        }
        const cells = rows.map((r) => r.children.filter((c) => typeof c !== "string" && (c.tag === "td" || c.tag === "th")).map(cellMd))
        // A column with no text in any row (a swatch or preview column) is left out.
        const cols = Math.max(...cells.map((c) => c.length))
        const keep = Array.from({ length: cols }, (_, i) => i).filter((i) => cells.some((c) => (c[i] ?? "").trim()))
        cells.forEach((c, r) => (cells[r] = keep.map((i) => c[i] ?? "")))
        const width = keep.length
        const line = (c) => `| ${Array.from({ length: width }, (_, i) => c[i] ?? "").join(" | ")} |`
        out.push([line(cells[0]), line(Array(width).fill("---")), ...cells.slice(1).map(line)].join("\n"))
      }
    } else if (n.tag === "blockquote") {
      out.push(blocks(n).map((b) => b.replace(/^/gm, "> ")).join("\n>\n"))
    } else if (n.tag === "hr") {
      out.push("---")
    } else blocks(n, out)
  }
  flush()
  return out
}

/** The language a CodeBlock declares (data-language on an ancestor), so fences keep it. */
function annotateLanguages(node, lang = "") {
  if (typeof node === "string") return
  const here = node.attrs["data-language"] ?? lang
  if (node.tag === "pre") node.attrs["data-lang"] = here
  node.children.forEach((c) => annotateLanguages(c, here))
}

const GUIDES = [
  { href: "/docs", file: "docs/index.html", md: "docs/index.md" },
  ...["installation", "theming", "colors", "cli", "skill", "changelog"].map((s) => ({ href: `/docs/${s}`, file: `docs/${s}/index.html`, md: `docs/${s}.md` })),
]

for (const g of GUIDES) {
  const htmlPath = path.join(outDir, g.file)
  if (!fs.existsSync(htmlPath)) continue
  const tree = parse(fs.readFileSync(htmlPath, "utf8"))
  const article = find(tree, (n) => n.tag === "article")
  if (!article) continue
  annotateLanguages(article)
  let md
  if (g.href === "/docs/skill") {
    // The page renders the skill's rules with live examples; the skill file itself is the readable form.
    const h1 = textOf(find(article, (n) => n.tag === "h1") ?? { children: [] }).trim()
    const skill = read(".agents/skills/paneui-design/SKILL.md").replace(/^---[\s\S]*?---\n+/, "")
    md = [`# ${h1}`, "", `Page: ${base}${g.href}/`, "", fence(`npx shadcn@latest add @${ns}/design-skill`, "bash"), "", skill.replace(/^# .*\n+/, "")].join("\n")
  } else {
    const fixed = blocks(article)
    const h1 = fixed.findIndex((b) => b.startsWith("# "))
    if (h1 >= 0) fixed.splice(h1 + 1, 0, `Page: ${base}${g.href}/`)
    md = fixed
      .slice(Math.max(0, h1))
      .map((b) => (b.startsWith("`") ? b : b.replace(/[ \t]+$/gm, "").replace(/(\S) {2,}/g, "$1 ")))
      .join("\n\n")
  }
  fs.writeFileSync(path.join(outDir, g.md), md.trimEnd() + "\n")
  count++
}

console.log(`gen-docs-md: ${count} Markdown pages in ${path.relative(root, outDir)}/docs`)
