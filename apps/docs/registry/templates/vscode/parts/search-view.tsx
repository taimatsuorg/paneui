"use client"

import * as React from "react"

import { ChevronRightIcon, ListCollapseIcon, XIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import { getFileKind } from "@paneui/ui/components/file-tree"
import { Input } from "@paneui/ui/components/input"
import { ScrollArea } from "@paneui/ui/components/scroll-area"

import type { Docs } from "./buffers"
import { IconAction, SidebarHeader } from "./sidebar-header"
import { basename, dirname, rel, type Workspace } from "./workspace"

type Match = { line: number; column: number; length: number; text: string; start: number }
type FileResult = { path: string; matches: Match[] }

const MAX_RESULTS = 2000

function buildPattern(query: string, opts: { caseSensitive: boolean; regex: boolean; wholeWord: boolean }) {
  if (!query) return null
  let source = opts.regex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  if (opts.wholeWord) source = `\\b${source}\\b`
  try {
    return new RegExp(source, opts.caseSensitive ? "g" : "gi")
  } catch {
    return "invalid" as const
  }
}

/** Search across every file (open buffers first, so unsaved edits count), grouped by file. */
function search(ws: Workspace, docs: Docs, pattern: RegExp) {
  const results: FileResult[] = []
  let total = 0
  for (const path of ws.listFiles()) {
    const text = docs.get(path) ?? ws.readFile(path)
    const matches: Match[] = []
    const lines = text.split("\n")
    lines.forEach((lineText, i) => {
      pattern.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = pattern.exec(lineText)) && total < MAX_RESULTS) {
        if (m[0].length === 0) {
          pattern.lastIndex++
          continue
        }
        // Trim long lines to a window around the hit.
        const start = Math.max(0, m.index - 12)
        matches.push({ line: i + 1, column: m.index + 1, length: m[0].length, text: lineText.slice(start, start + 160), start })
        total++
      }
    })
    if (matches.length) results.push({ path, matches })
  }
  return { results, total, capped: total >= MAX_RESULTS }
}

function Toggle({ label, pressed, onClick, children }: { label: string; pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "flex h-5 min-w-5 items-center justify-center rounded-sm px-1 font-mono text-ui-xs text-muted-foreground transition-colors duration-150 outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        pressed && "bg-primary-subtle text-primary-text hover:bg-primary-subtle-hover hover:text-primary-text"
      )}
    >
      {children}
    </button>
  )
}

/**
 * Search view: find text in every file, with match case, whole word and
 * regular expression toggles, matches highlighted in context, and replace
 * across files (open files get the edit as unsaved changes).
 */
export function SearchView({
  ws,
  docs,
  onOpenMatch,
  autoFocus,
}: {
  ws: Workspace
  docs: Docs
  onOpenMatch: (path: string, line: number, column: number, length: number) => void
  autoFocus?: boolean
}) {
  const wsVersion = React.useSyncExternalStore((cb) => ws.subscribe(cb), ws.getVersion, ws.getVersion)
  const docsVersion = React.useSyncExternalStore((cb) => docs.subscribe(cb), docs.getVersion, docs.getVersion)
  const [query, setQuery] = React.useState("")
  const [replace, setReplace] = React.useState("")
  const [showReplace, setShowReplace] = React.useState(false)
  const [caseSensitive, setCaseSensitive] = React.useState(false)
  const [regex, setRegex] = React.useState(false)
  const [wholeWord, setWholeWord] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set())
  const deferred = React.useDeferredValue(query)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const pattern = React.useMemo(() => buildPattern(deferred, { caseSensitive, regex, wholeWord }), [deferred, caseSensitive, regex, wholeWord])
  const found = React.useMemo(
    () => (pattern && pattern !== "invalid" ? search(ws, docs, pattern) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the versions are the stores' change counters
    [pattern, ws, docs, wsVersion, docsVersion]
  )

  const replaceAll = () => {
    if (!found || !pattern || pattern === "invalid") return
    for (const { path } of found.results) {
      const text = docs.get(path) ?? ws.readFile(path)
      pattern.lastIndex = 0
      // With a regular expression, $1 and friends expand; plain text is taken literally.
      const next = regex ? text.replace(pattern, replace) : text.replace(pattern, () => replace)
      if (docs.has(path)) docs.set(path, next)
      else ws.writeFile(path, next)
    }
  }

  return (
    <div className="flex h-full min-w-0 flex-col">
      <SidebarHeader title="Search">
        <IconAction label="Collapse all" onClick={() => setCollapsed(new Set(found?.results.map((r) => r.path)))} disabled={!found?.results.length}>
          <ListCollapseIcon />
        </IconAction>
        <IconAction label="Clear results" onClick={() => setQuery("")} disabled={!query}>
          <XIcon />
        </IconAction>
      </SidebarHeader>

      <div className="flex shrink-0 gap-1 pr-2 pb-2 pl-1">
        <button
          type="button"
          aria-label={showReplace ? "Hide replace" : "Show replace"}
          aria-expanded={showReplace}
          onClick={() => setShowReplace((s) => !s)}
          className="flex w-4 shrink-0 items-start justify-center rounded-sm pt-2 text-muted-foreground outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRightIcon className={cn("size-3 transition-transform duration-150 rtl:-scale-x-100", showReplace && "rotate-90 rtl:-rotate-90")} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search files"
              aria-invalid={pattern === "invalid" || undefined}
              className="h-7 flex-1"
              spellCheck={false}
            />
            <div className="flex shrink-0 items-center gap-0.5">
              <Toggle label="Match case" pressed={caseSensitive} onClick={() => setCaseSensitive((v) => !v)}>
                Aa
              </Toggle>
              <Toggle label="Match whole word" pressed={wholeWord} onClick={() => setWholeWord((v) => !v)}>
                ab
              </Toggle>
              <Toggle label="Use regular expression" pressed={regex} onClick={() => setRegex((v) => !v)}>
                .*
              </Toggle>
            </div>
          </div>
          {showReplace && (
            <div className="flex gap-1">
              <Input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="Replace" aria-label="Replace with" className="h-7" spellCheck={false} />
              <Button variant="secondary" size="sm" onClick={replaceAll} disabled={!found?.total}>
                Replace all
              </Button>
            </div>
          )}
        </div>
      </div>

      {pattern === "invalid" ? (
        <p className="px-4 text-ui-sm text-destructive-text">That regular expression is not valid.</p>
      ) : found ? (
        <p className="shrink-0 px-4 pb-1.5 text-ui-xs text-muted-foreground tabular-nums">
          {found.total === 0
            ? "No results."
            : `${found.capped ? "More than " : ""}${found.total} ${found.total === 1 ? "result" : "results"} in ${found.results.length} ${found.results.length === 1 ? "file" : "files"}`}
        </p>
      ) : null}

      <ScrollArea className="min-h-0 flex-1" viewportClassName="px-2 pb-3">
        <ul aria-label="Search results" className="flex flex-col">
          {found?.results.map(({ path, matches }) => {
            const open = !collapsed.has(path)
            const kind = getFileKind(basename(path))
            return (
              <li key={path}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() =>
                    setCollapsed((c) => {
                      const next = new Set(c)
                      if (next.has(path)) next.delete(path)
                      else next.add(path)
                      return next
                    })
                  }
                  className="flex h-6 w-full items-center gap-1.5 rounded-sm px-1 text-start text-ui outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <ChevronRightIcon className={cn("size-3 shrink-0 text-muted-foreground transition-transform duration-150 rtl:-scale-x-100", open && "rotate-90 rtl:-rotate-90")} />
                  <span className={cn("flex size-4 shrink-0 items-center justify-center", kind.className)}>{kind.icon}</span>
                  <span className="truncate">{basename(path)}</span>
                  <span className="min-w-0 flex-1 truncate text-ui-xs text-muted-foreground">{rel(dirname(path))}</span>
                  <span className="shrink-0 rounded-full bg-secondary px-1.5 text-ui-xs text-muted-foreground tabular-nums">{matches.length}</span>
                </button>
                {open && (
                  <ul>
                    {matches.map((m) => {
                      const at = m.column - 1 - m.start
                      return (
                        <li key={`${m.line}:${m.column}`}>
                          <button
                            type="button"
                            onClick={() => onOpenMatch(path, m.line, m.column, m.length)}
                            className="flex h-6 w-full items-center gap-2 rounded-sm pr-1 pl-8 text-start font-mono text-ui-sm whitespace-pre text-muted-foreground outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {m.start > 0 && "…"}
                              {m.text.slice(0, at).trimStart()}
                              <mark className="bg-warning/30 text-foreground">{m.text.slice(at, at + m.length)}</mark>
                              {m.text.slice(at + m.length)}
                            </span>
                            <span className="shrink-0 font-sans text-ui-xs tabular-nums">{m.line}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
        {!query && <p className="px-2 py-6 text-center text-ui text-pretty text-muted-foreground">Type to search every file in the workspace.</p>}
      </ScrollArea>
    </div>
  )
}
