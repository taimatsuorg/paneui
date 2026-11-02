"use client"

import * as React from "react"

import { CodeIcon, EditIcon, FileIcon, FolderIcon, GridIcon, ImageIcon, ListIcon, SearchIcon, SidebarIcon, SparklesIcon, StarIcon, TableIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@paneui/ui/components/card"
import { EmptyState, EmptyStateDescription, EmptyStateTitle } from "@paneui/ui/components/empty-state"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@paneui/ui/components/input-group"
import { PageHeaderTitle } from "@paneui/ui/components/page-header"
import { ScrollArea } from "@paneui/ui/components/scroll-area"
import { SidebarNav, SidebarNavContent, SidebarNavLink, SidebarNavList, SidebarNavSection } from "@paneui/ui/components/sidebar-nav"
import { SimpleTable, SimpleTableBody, SimpleTableCell, SimpleTableHead, SimpleTableHeader, SimpleTableRow } from "@paneui/ui/components/simple-table"
import { Skeleton } from "@paneui/ui/components/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@paneui/ui/components/toggle-group"

import { SeededArt } from "./art-tile"
import { IconAction, SectionPanel, SectionPrimary } from "./section-panel"
import { LIBRARY_ITEMS, PROJECTS, type LibraryItem, type LibraryKind } from "./workspace-data"

type Shelf = "recommended" | "favourites" | "images" | "all" | `project:${string}`

const SHELVES: { id: Shelf; label: string; icon: React.ReactNode }[] = [
  { id: "recommended", label: "Recommended", icon: <SparklesIcon /> },
  { id: "favourites", label: "Favourites", icon: <StarIcon /> },
  { id: "images", label: "Images", icon: <ImageIcon /> },
  { id: "all", label: "All files", icon: <FileIcon /> },
]

const KIND_ICON: Record<LibraryKind, React.ReactNode> = {
  doc: <FileIcon />,
  code: <CodeIcon />,
  image: <ImageIcon />,
  sheet: <TableIcon />,
  folder: <FolderIcon />,
}

export function useLibrary() {
  const [shelf, setShelf] = React.useState<Shelf>("recommended")
  const [layout, setLayout] = React.useState<"grid" | "list">("grid")
  const [query, setQuery] = React.useState("")
  const [favourites, setFavourites] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(LIBRARY_ITEMS.map((i) => [i.id, !!i.favourite]))
  )
  const toggleFavourite = (id: string) => setFavourites((f) => ({ ...f, [id]: !f[id] }))
  return { shelf, setShelf, layout, setLayout, query, setQuery, favourites, toggleFavourite }
}

export type LibraryState = ReturnType<typeof useLibrary>

function shelfTitle(shelf: Shelf) {
  return shelf.startsWith("project:") ? shelf.slice(8) : SHELVES.find((s) => s.id === shelf)?.label
}

export function LibrarySidebar({ state, onHide, onNew, onNavigate }: { state: LibraryState; onHide?: () => void; onNew: () => void; onNavigate?: () => void }) {
  const go = (s: Shelf) => {
    state.setShelf(s)
    onNavigate?.()
  }
  return (
    <SectionPanel
      title="Library"
      actions={
        onHide && (
          <IconAction label="Hide sidebar" shortcut="⌘B" onClick={onHide}>
            <SidebarIcon />
          </IconAction>
        )
      }
      primary={<SectionPrimary icon={<EditIcon />} label="New chat" shortcut="⌘N" onClick={onNew} />}
    >
      <SidebarNav indicator="fill">
        <SidebarNavContent aria-label="Library">
          <SidebarNavList>
            {SHELVES.map((s) => (
              <SidebarNavLink key={s.id} render={<button type="button" />} className="w-full text-start" icon={s.icon} active={state.shelf === s.id} onClick={() => go(s.id)}>
                {s.label}
              </SidebarNavLink>
            ))}
          </SidebarNavList>
          <SidebarNavSection level="label" label="Folders">
            <SidebarNavList>
              {PROJECTS.map((p) => {
                const count = LIBRARY_ITEMS.filter((i) => i.project === p.id).length
                return (
                  <SidebarNavLink
                    key={p.id}
                    render={<button type="button" />}
                    className="w-full text-start"
                    icon={<FolderIcon />}
                    active={state.shelf === `project:${p.id}`}
                    onClick={() => go(`project:${p.id}`)}
                    badge={<span className="text-ui-xs text-muted-foreground tabular-nums">{count}</span>}
                  >
                    {p.name}
                  </SidebarNavLink>
                )
              })}
            </SidebarNavList>
          </SidebarNavSection>
        </SidebarNavContent>
      </SidebarNav>
    </SectionPanel>
  )
}

function FavouriteButton({ on, onClick, title }: { on: boolean; onClick: () => void; title: string }) {
  return (
    <IconAction label={on ? `Remove ${title} from favourites` : `Add ${title} to favourites`} size="icon-xs" pressed={on} onClick={onClick}>
      <StarIcon className={cn(on && "text-warning-text")} />
    </IconAction>
  )
}

function LibraryCard({ item, favourite, onFavourite }: { item: LibraryItem; favourite: boolean; onFavourite: () => void }) {
  const meta = (
    <CardFooter className="justify-between gap-2">
      <span className="truncate text-ui-sm text-muted-foreground">
        {item.project} · {item.updated}
      </span>
      <FavouriteButton on={favourite} onClick={onFavourite} title={item.title} />
    </CardFooter>
  )
  if (item.kind === "image")
    return (
      <Card size="sm" className="mb-3 break-inside-avoid pt-0">
        <div className="relative" style={{ height: item.rows * 8 - 64 }}>
          <SeededArt seed={item.seed} />
        </div>
        <CardHeader>
          <CardTitle className="truncate">{item.title}</CardTitle>
        </CardHeader>
        {meta}
      </Card>
    )
  return (
    <Card size="sm" className="mb-3 break-inside-avoid">
      <CardHeader className="flex-row items-center gap-2">
        <span className="flex text-muted-foreground [&_svg]:size-4">{KIND_ICON[item.kind]}</span>
        <CardTitle className="min-w-0 truncate">{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {item.kind === "code" ? (
          <pre className="overflow-hidden rounded-md bg-muted p-2 font-mono text-ui-xs whitespace-pre-wrap text-muted-foreground">{item.excerpt}</pre>
        ) : (
          <p className="text-ui text-pretty text-muted-foreground">{item.excerpt}</p>
        )}
      </CardContent>
      {meta}
    </Card>
  )
}

/** Masonry while it loads, so the page keeps its shape when the cards arrive. */
function LibrarySkeleton() {
  return (
    <div role="status" aria-label="Loading library" className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
      {[26, 34, 22, 30, 24, 28, 30, 22].map((rows, i) => (
        <Skeleton key={i} shape="card" className="mb-3 break-inside-avoid" style={{ height: rows * 8 }} />
      ))}
    </div>
  )
}

export function LibraryMain({ state, leading }: { state: LibraryState; leading?: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 700)
    return () => window.clearTimeout(t)
  }, [])

  const q = state.query.toLowerCase()
  const items = LIBRARY_ITEMS.filter((i) => {
    if (state.shelf === "favourites" && !state.favourites[i.id]) return false
    if (state.shelf === "images" && i.kind !== "image") return false
    if (state.shelf === "recommended" && i.updated.includes("Oct")) return false
    if (state.shelf.startsWith("project:") && i.project !== state.shelf.slice(8)) return false
    return !q || `${i.title} ${i.project} ${i.excerpt ?? ""}`.toLowerCase().includes(q)
  })

  return (
    <ScrollArea className="h-full min-w-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 pt-6 pb-10 md:px-8 md:pt-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {leading}
            <PageHeaderTitle className="truncate">{shelfTitle(state.shelf)}</PageHeaderTitle>
          </div>
          <InputGroup className="w-full sm:w-64">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput value={state.query} onChange={(e) => state.setQuery(e.target.value)} placeholder="Search the library" aria-label="Search the library" />
          </InputGroup>
          <ToggleGroup
            aria-label="Layout"
            value={[state.layout]}
            onValueChange={(v) => v[0] && state.setLayout(v[0] as "grid" | "list")}
          >
            <ToggleGroupItem value="grid" aria-label="Grid">
              <GridIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List">
              <ListIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {loading ? (
          <LibrarySkeleton />
        ) : items.length === 0 ? (
          <EmptyState variant="outline">
            <EmptyStateTitle>{state.query ? "Nothing matches" : "Nothing here yet"}</EmptyStateTitle>
            <EmptyStateDescription>
              {state.query ? "Try another word, or look in All files." : "Star a file to keep it in Favourites."}
            </EmptyStateDescription>
            {state.query && (
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => state.setQuery("")}>
                Clear search
              </Button>
            )}
          </EmptyState>
        ) : state.layout === "grid" ? (
          <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
            {items.map((i) => (
              <LibraryCard key={i.id} item={i} favourite={!!state.favourites[i.id]} onFavourite={() => state.toggleFavourite(i.id)} />
            ))}
          </div>
        ) : (
          <SimpleTable>
            <SimpleTableHeader>
              <SimpleTableRow>
                <SimpleTableHead>Name</SimpleTableHead>
                <SimpleTableHead>Folder</SimpleTableHead>
                <SimpleTableHead>Updated</SimpleTableHead>
                <SimpleTableHead align="right">
                  <span className="sr-only">Favourite</span>
                </SimpleTableHead>
              </SimpleTableRow>
            </SimpleTableHeader>
            <SimpleTableBody>
              {items.map((i) => (
                <SimpleTableRow key={i.id}>
                  <SimpleTableCell>
                    <span className="flex items-center gap-2">
                      <span className="flex text-muted-foreground [&_svg]:size-4">{KIND_ICON[i.kind]}</span>
                      <span className="truncate font-medium">{i.title}</span>
                    </span>
                  </SimpleTableCell>
                  <SimpleTableCell>{i.project}</SimpleTableCell>
                  <SimpleTableCell>{i.updated}</SimpleTableCell>
                  <SimpleTableCell align="right">
                    <FavouriteButton on={!!state.favourites[i.id]} onClick={() => state.toggleFavourite(i.id)} title={i.title} />
                  </SimpleTableCell>
                </SimpleTableRow>
              ))}
            </SimpleTableBody>
          </SimpleTable>
        )}
      </div>
    </ScrollArea>
  )
}
