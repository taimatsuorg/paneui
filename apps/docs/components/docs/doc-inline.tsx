import type { Localized } from "@/lib/site-locale"
import { LocalizedInline } from "./localized-inline"

import * as React from "react"

/** Tokens up to this length never break inside; longer ones (URLs, paths) may wrap anywhere. */
const NOWRAP_MAX = 32

/**
 * Inline code chip classes. `doc-code` (styles/globals.css) sizes the chip in em with the typeset
 * values, so it follows the text around it and never touches a chip on the next line.
 * `box-decoration-clone` gives every line fragment its own padding, background and radius, so a
 * chip that does wrap stays whole on both lines.
 * `whitespace-normal` overrides the typeset rule, since tokens here get their own nowrap spans.
 */
export const INLINE_CODE_CLS =
  "doc-code box-decoration-clone rounded-md bg-muted font-mono whitespace-normal text-foreground wrap-anywhere"

/** Flattens string/number children to text, or returns null when they hold elements. */
function textOf(children: React.ReactNode): string | null {
  let out = ""
  for (const c of React.Children.toArray(children)) {
    if (typeof c === "string" || typeof c === "number") out += c
    else return null
  }
  return out
}

/**
 * Inline code content with no break inside a short token. Browsers may wrap at a hyphen,
 * which split `text-muted-foreground` as `text-muted-` / `foreground` and left a dangling `-`
 * at a line edge. Each whitespace-separated token up to NOWRAP_MAX characters is kept on one
 * line; the spaces between tokens stay the only break points.
 */
export function codeContent(children: React.ReactNode): React.ReactNode {
  const text = textOf(children)
  if (text == null) return children
  const parts = text.split(/(\s+)/)
  if (parts.length === 1) return text.length <= NOWRAP_MAX ? <span className="whitespace-nowrap">{text}</span> : text
  return parts.map((part, i) =>
    part === "" || /^\s+$/.test(part) || part.length > NOWRAP_MAX ? (
      part
    ) : (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ),
  )
}

/** Renders `code` spans and [text](href) links in hand-written doc strings. */
export function Inline({ text }: { text: Localized }) {
  return <LocalizedInline text={text} />
}

export function InlineText({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  const re = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[1] != null)
      parts.push(
        <code key={m.index} className={INLINE_CODE_CLS}>
          {codeContent(m[1])}
        </code>,
      )
    else
      parts.push(
        <a
          key={m.index}
          href={m[3]}
          className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          {m[2]}
        </a>,
      )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}
