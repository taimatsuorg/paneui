"use client"

import * as React from "react"

import { FileIcon, ListIcon, SearchIcon } from "@paneui/ui/icons"
import { CommandPalette, type CommandPaletteItem } from "@paneui/ui/blocks/command-palette/command-palette"
import { Button } from "@paneui/ui/components/button"

type Section = { id: string; page: string; heading?: string; text: string }

const sections: Section[] = [
  { id: "install", page: "Installation", text: "Add the theme first, then any item. Each item lists the items it depends on." },
  { id: "install-update", page: "Installation", heading: "Updating", text: "Run the update command to pull new versions of the items you installed." },
  { id: "theming", page: "Theming", text: "Colours, radius and fonts come from tokens, so one change restyles every item." },
  { id: "theming-dark", page: "Theming", heading: "Dark mode", text: "Add the dark class to the root element. Every token has a dark value." },
  { id: "radius", page: "Radius", text: "Nested corners follow their container. Change the base radius to rescale them." },
  { id: "typeset", page: "Typeset", text: "Long-form text gets headings, lists, tables, code and math styles from one class." },
]

/** Your own search: plain substring hits, title hits first. */
function search(query: string): CommandPaletteItem[] {
  const q = query.trim().toLowerCase()
  const hits = sections.flatMap((s) => {
    const title = s.heading ?? s.page
    const at = s.text.toLowerCase().indexOf(q)
    const inTitle = title.toLowerCase().includes(q)
    if (q && at === -1 && !inTitle) return []
    const start = Math.max(0, at - 24)
    const excerpt = (start > 0 ? "…" : "") + s.text.slice(start)
    const offset = start > 0 ? 1 - start : 0
    return [
      {
        rank: inTitle ? 0 : 1,
        item: {
          id: s.id,
          label: title,
          description: s.heading ? s.page : undefined,
          icon: s.heading ? ListIcon : FileIcon,
          excerpt: q ? excerpt : undefined,
          highlight: q && at !== -1 ? [[at + offset, at + offset + q.length] as const] : undefined,
        } satisfies CommandPaletteItem,
      },
    ]
  })
  return hits.sort((a, b) => a.rank - b.rank).map((h) => h.item)
}

export default function CallerRankedExample() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const items = React.useMemo(() => search(query), [query])

  return (
    <div className="flex justify-center">
      <div className="w-64">
        <Button
          variant="secondary"
          onClick={() => {
            setQuery("")
            setOpen(true)
          }}
          className="w-full justify-start text-muted-foreground"
        >
          <SearchIcon data-icon="inline-start" />
          Search the docs…
        </Button>
      </div>
      <CommandPalette
        items={items}
        query={query}
        onQueryChange={setQuery}
        filter={false}
        hotkey={false}
        open={open}
        onOpenChange={setOpen}
        placeholder="Search the docs…"
      />
    </div>
  )
}
