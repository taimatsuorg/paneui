import "server-only"

import { highlight as highlightCode } from "@paneui/ui/lib/highlight"

import { CodeBlock, type CodeBlockProps } from "@paneui/ui/components/code-block"

/*
 * Static code on the docs site: highlighted while the page is built, rendered by
 * CodeBlock, so nothing is tokenized in the browser. Live code (the interactive
 * accent CSS output) uses LiveCodeBlock instead.
 */

const EXT: Record<string, string> = { mjs: "javascript", cjs: "javascript", md: "markdown", sh: "bash", yml: "yaml" }
const cache = new Map<string, Promise<string>>()

/** Language id for a file name like `app/page.tsx` (or the fallback). */
export function languageOf(filename?: string, fallback = "text") {
  const ext = filename?.split(".").pop()?.toLowerCase()
  if (!ext || ext === filename) return fallback
  const lang = EXT[ext] ?? ext
  return lang
}

/** Dual-theme markup for <CodeBlock html>, cached per code and language. */
export function highlight(code: string, language = "text") {
  const lang = language
  const key = `${lang}\u0000${code}`
  let html = cache.get(key)
  if (!html) {
    html = highlightCode(code.replace(/\n$/, ""), lang)
    cache.set(key, html)
  }
  return html
}

type DocsCodeProps = Omit<CodeBlockProps, "html" | "children"> & {
  code: string
  /** Title bar text, usually the file name; also picks the language when `language` is not set. */
  filename?: string
}

/** A CodeBlock for code known at build time. */
export async function DocsCode({ code, filename, title, language, lineNumbers = Boolean(filename), ...props }: DocsCodeProps) {
  const lang = language ?? languageOf(filename)
  const head = title ?? filename
  return <CodeBlock html={await highlight(code, lang)} title={head} language={head !== undefined ? lang : undefined} lineNumbers={lineNumbers} {...props} />
}
