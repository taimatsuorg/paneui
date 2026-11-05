"use client"

import * as React from "react"
import { siCss, siGit, siJson, siMarkdown, siTypescript } from "simple-icons"

import { TerminalSquareIcon } from "@paneui/ui/icons"
import { BrandIcon } from "@paneui/ui/components/brand-icon"
import { Input } from "@paneui/ui/components/input"
import { ScrollArea } from "@paneui/ui/components/scroll-area"
import { Switch } from "@paneui/ui/components/switch"

import { SectionLabel, SidebarHeader } from "./sidebar-header"

type Extension = { id: string; name: string; summary: string; icon: React.ReactNode }

const BUILT_IN: Extension[] = [
  { id: "ts", name: "TypeScript and JavaScript", summary: "Types, completions and errors as you type", icon: <BrandIcon icon={siTypescript} color="brand" /> },
  { id: "json", name: "JSON", summary: "Validation and formatting for config files", icon: <BrandIcon icon={siJson} /> },
  { id: "css", name: "CSS", summary: "Completions and color previews", icon: <BrandIcon icon={siCss} color="brand" /> },
  { id: "md", name: "Markdown", summary: "Headings, lists and code fences", icon: <BrandIcon icon={siMarkdown} /> },
  { id: "git", name: "Source control", summary: "Changes, discard and commit", icon: <BrandIcon icon={siGit} color="brand" /> },
  { id: "shell", name: "Terminal", summary: "A shell on the workspace files", icon: <TerminalSquareIcon /> },
]

/** Extensions view: the built-in language features, searchable, each with an on/off switch. */
export function ExtensionsView() {
  const [query, setQuery] = React.useState("")
  const [disabled, setDisabled] = React.useState<Set<string>>(new Set())
  const q = query.trim().toLowerCase()
  const list = BUILT_IN.filter((e) => !q || e.name.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q))

  return (
    <div className="flex h-full min-w-0 flex-col">
      <SidebarHeader title="Extensions" />
      <div className="shrink-0 px-3 pb-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search extensions" aria-label="Search extensions" size="sm" />
      </div>
      <SectionLabel count={list.length}>Built-in</SectionLabel>
      <ScrollArea className="min-h-0 flex-1" viewportClassName="px-2 pb-3">
        <ul aria-label="Built-in extensions" className="flex flex-col gap-0.5">
          {list.map((e) => {
            const on = !disabled.has(e.id)
            return (
              <li key={e.id} className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-secondary">
                <span aria-hidden className="flex size-6 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4">
                  {e.icon}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-ui font-medium">{e.name}</span>
                  <span className="truncate text-ui-xs text-muted-foreground">{e.summary}</span>
                </div>
                <Switch
                  aria-label={`${on ? "Disable" : "Enable"} ${e.name}`}
                  checked={on}
                  onCheckedChange={(v) =>
                    setDisabled((d) => {
                      const next = new Set(d)
                      if (v) next.delete(e.id)
                      else next.add(e.id)
                      return next
                    })
                  }
                />
              </li>
            )
          })}
        </ul>
        {list.length === 0 && <p className="px-2 py-6 text-center text-ui text-muted-foreground">No extensions match.</p>}
      </ScrollArea>
    </div>
  )
}
