"use client"

import * as React from "react"

import {
  CheckIcon,
  ChevronDownIcon,
  EditIcon,
  FilterIcon,
  FolderIcon,
  FolderOpenIcon,
  SearchIcon,
  SettingsIcon,
  SidebarIcon,
} from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import { Input } from "@paneui/ui/components/input"
import { Menu, MenuContent, MenuGroup, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@paneui/ui/components/menu"
import { SidebarNav, SidebarNavContent, SidebarNavSection } from "@paneui/ui/components/sidebar-nav"
import { Tooltip, TooltipContent, TooltipTrigger } from "@paneui/ui/components/tooltip"
import { ThreadList, ThreadListItem, type PullRequestStatus } from "@paneui/ui/components/thread-list-item"

import type { AgentConfig } from "./agents"
import { ProviderIcon } from "./provider-icon"
import { IconAction, SectionPanel, SectionPrimary } from "./section-panel"

export type ThreadSummary = {
  sessionId: string
  title: string
  provider?: string
  repo?: string
  pr?: { number: number; status: PullRequestStatus }
  branch?: string
  group: string
  running?: boolean
  unread?: boolean
}

type Filter = "all" | "running" | "pr"
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All threads" },
  { id: "running", label: "Running" },
  { id: "pr", label: "With pull request" },
]

/**
 * The chat page's index. Every thread lives in exactly one place, its project folder, so the
 * list never shows the same thread twice; search and the filter open every folder they match in.
 */
export function ThreadsSidebar({
  threads,
  activeId,
  onSelect,
  onNewThread,
  onHide,
  agents,
  agentId,
  onSelectAgent,
  onOpenSettings,
}: {
  threads: ThreadSummary[]
  activeId: string | null
  onSelect: (sessionId: string) => void
  onNewThread: () => void
  /** Hides the column; omitted where the column can't hide (the phone drawer). */
  onHide?: () => void
  agents: AgentConfig[]
  agentId: string
  onSelectAgent: (id: string) => void
  onOpenSettings: () => void
}) {
  const [query, setQuery] = React.useState("")
  const [searching, setSearching] = React.useState(false)
  const [filter, setFilter] = React.useState<Filter>("all")
  const [closed, setClosed] = React.useState<Record<string, boolean>>({})
  const searchRef = React.useRef<HTMLInputElement>(null)
  const agent = agents.find((a) => a.id === agentId)

  const visible = threads.filter((t) => {
    if (filter === "running" && !t.running) return false
    if (filter === "pr" && !t.pr) return false
    if (!query) return true
    const q = query.toLowerCase()
    return [t.title, t.repo, t.branch, t.pr ? `#${t.pr.number}` : ""].some((s) => s?.toLowerCase().includes(q))
  })
  const narrowed = query !== "" || filter !== "all"

  const projects = React.useMemo(() => {
    const map = new Map<string, ThreadSummary[]>()
    for (const t of visible) {
      const key = t.repo ?? "Chats"
      map.set(key, [...(map.get(key) ?? []), t])
    }
    return [...map.entries()]
  }, [visible])

  const openSearch = () => {
    setSearching((s) => !s)
    setQuery("")
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  const heading = (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" size="sm" className="-ms-2 min-w-0" aria-label={`Workspace, agent ${agent?.name ?? "none"}`} />}>
        <span className="truncate font-heading text-base font-semibold">Workspace</span>
        <ChevronDownIcon data-icon="inline-end" className="size-3 opacity-64" />
      </MenuTrigger>
      <MenuContent className="w-60">
        <MenuGroup>
          <MenuLabel>Agent</MenuLabel>
          {agents.map((a) => (
            <MenuItem key={a.id} onClick={() => onSelectAgent(a.id)}>
              <ProviderIcon provider={a.provider} />
              <span className="min-w-0 flex-1 truncate">{a.name}</span>
              {a.id === agentId && <CheckIcon className="!text-foreground" />}
            </MenuItem>
          ))}
        </MenuGroup>
        <MenuSeparator />
        <MenuItem onClick={onOpenSettings}>
          <SettingsIcon />
          Manage agents…
        </MenuItem>
      </MenuContent>
    </Menu>
  )

  const actions = (
    <>
      <Menu>
        <Tooltip>
          <TooltipTrigger
            render={
              <MenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Filter threads"
                    className={cn("text-muted-foreground", filter !== "all" && "text-foreground")}
                  />
                }
              />
            }
          >
            <FilterIcon />
          </TooltipTrigger>
          <TooltipContent side="bottom">Filter threads</TooltipContent>
        </Tooltip>
        <MenuContent className="w-48" align="end">
          <MenuGroup>
            <MenuLabel>Show</MenuLabel>
            {FILTERS.map((f) => (
              <MenuItem key={f.id} onClick={() => setFilter(f.id)}>
                <span className="flex-1">{f.label}</span>
                {f.id === filter && <CheckIcon className="!text-foreground" />}
              </MenuItem>
            ))}
          </MenuGroup>
        </MenuContent>
      </Menu>
      <IconAction label="Search threads" pressed={searching} onClick={openSearch}>
        <SearchIcon />
      </IconAction>
      {onHide && (
        <IconAction label="Hide sidebar" shortcut="⌘B" onClick={onHide}>
          <SidebarIcon />
        </IconAction>
      )}
    </>
  )

  return (
    <SectionPanel
      heading={heading}
      actions={actions}
      primary={
        <>
          {searching && (
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearching(false)
                  setQuery("")
                }
              }}
              placeholder="Search threads"
              aria-label="Search threads"
              size="sm"
              className="mb-1"
            />
          )}
          <SectionPrimary icon={<EditIcon />} label="New chat" shortcut="⌘N" keys="Meta+N" onClick={onNewThread} />
        </>
      }
    >
      <SidebarNav indicator="fill">
        <SidebarNavContent aria-label="Threads">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-2 py-6 text-center">
              <p className="text-ui text-pretty text-muted-foreground">{threads.length ? "No threads match." : "No threads yet."}</p>
              {narrowed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuery("")
                    setFilter("all")
                  }}
                >
                  Clear search and filter
                </Button>
              )}
            </div>
          ) : (
            <SidebarNavSection level="label" label="Projects">
              {projects.map(([project, items]) => {
                const open = narrowed || !closed[project]
                return (
                  <SidebarNavSection
                    key={project}
                    level="group"
                    label={project}
                    icon={open ? <FolderOpenIcon /> : <FolderIcon />}
                    open={open}
                    onOpenChange={(o) => setClosed((c) => ({ ...c, [project]: !o }))}
                  >
                    <ThreadList className="gap-px">
                      {items.map((t) => (
                        <ThreadListItem
                          key={t.sessionId}
                          size="sm"
                          title={t.title}
                          pr={t.pr}
                          running={t.running}
                          unread={t.unread}
                          active={t.sessionId === activeId}
                          onClick={() => onSelect(t.sessionId)}
                        />
                      ))}
                    </ThreadList>
                  </SidebarNavSection>
                )
              })}
            </SidebarNavSection>
          )}
        </SidebarNavContent>
      </SidebarNav>
    </SectionPanel>
  )
}
