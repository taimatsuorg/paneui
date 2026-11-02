"use client"

import * as React from "react"

import { EditIcon, FolderIcon, MoreHorizontalIcon, PinIcon, PlusIcon, SearchIcon, SidebarIcon, TrashIcon } from "@paneui/ui/icons"
import { Button } from "@paneui/ui/components/button"
import { EmptyState, EmptyStateDescription } from "@paneui/ui/components/empty-state"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@paneui/ui/components/input-group"
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@paneui/ui/components/menu"
import { PageHeaderTitle } from "@paneui/ui/components/page-header"
import { ScrollArea } from "@paneui/ui/components/scroll-area"
import { SidebarNav, SidebarNavContent, SidebarNavLink, SidebarNavList, SidebarNavSection } from "@paneui/ui/components/sidebar-nav"
import { SimpleTable, SimpleTableBody, SimpleTableCell, SimpleTableHead, SimpleTableHeader, SimpleTableRow } from "@paneui/ui/components/simple-table"

import { IconAction, PageBody, SectionPanel, SectionPrimary } from "./section-panel"
import { PROJECTS, type Project } from "./workspace-data"

export function useProjects() {
  const [projects, setProjects] = React.useState<Project[]>(PROJECTS)
  const [query, setQuery] = React.useState("")
  const togglePin = (id: string) => setProjects((p) => p.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)))
  const remove = (id: string) => setProjects((p) => p.filter((x) => x.id !== id))
  const add = () =>
    setProjects((p) => {
      const n = p.filter((x) => x.name.startsWith("untitled")).length + 1
      const name = n === 1 ? "untitled" : `untitled-${n}`
      return [{ id: `${name}-${Date.now().toString(36)}`, name, path: `~/code/${name}`, updated: "Just now", threads: 0 }, ...p]
    })
  return { projects, query, setQuery, togglePin, remove, add }
}

export type ProjectsState = ReturnType<typeof useProjects>

export function ProjectsSidebar({ state, onHide, onOpen }: { state: ProjectsState; onHide?: () => void; onOpen: (project: string) => void }) {
  const pinned = state.projects.filter((p) => p.pinned)
  const rest = state.projects.filter((p) => !p.pinned)
  const row = (p: Project) => (
    <SidebarNavLink key={p.id} render={<button type="button" />} className="w-full text-start" icon={<FolderIcon />} onClick={() => onOpen(p.name)}>
      {p.name}
    </SidebarNavLink>
  )
  return (
    <SectionPanel
      title="Projects"
      actions={
        onHide && (
          <IconAction label="Hide sidebar" shortcut="⌘B" onClick={onHide}>
            <SidebarIcon />
          </IconAction>
        )
      }
      primary={<SectionPrimary icon={<PlusIcon />} label="New project" onClick={state.add} />}
    >
      <SidebarNav indicator="fill">
        <SidebarNavContent aria-label="Projects">
          {pinned.length > 0 && (
            <SidebarNavSection level="label" label="Pinned">
              <SidebarNavList>{pinned.map(row)}</SidebarNavList>
            </SidebarNavSection>
          )}
          {rest.length > 0 && (
            <SidebarNavSection level="label" label="Others">
              <SidebarNavList>{rest.map(row)}</SidebarNavList>
            </SidebarNavSection>
          )}
        </SidebarNavContent>
      </SidebarNav>
    </SectionPanel>
  )
}

export function ProjectsMain({ state, leading, onOpen }: { state: ProjectsState; leading?: React.ReactNode; onOpen: (project: string) => void }) {
  const q = state.query.toLowerCase()
  const list = state.projects.filter((p) => !q || `${p.name} ${p.path}`.toLowerCase().includes(q))
  return (
    <ScrollArea className="h-full min-w-0">
      <PageBody wide>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {leading}
            <PageHeaderTitle>Projects</PageHeaderTitle>
          </div>
          <InputGroup className="w-full sm:w-64">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput value={state.query} onChange={(e) => state.setQuery(e.target.value)} placeholder="Search projects" aria-label="Search projects" />
          </InputGroup>
          <Button variant="inverse" onClick={state.add}>
            <PlusIcon data-icon="inline-start" />
            New project
          </Button>
        </div>
        {list.length === 0 ? (
          <EmptyState variant="outline" size="sm">
            <EmptyStateDescription>No projects match.</EmptyStateDescription>
          </EmptyState>
        ) : (
          <SimpleTable>
            <SimpleTableHeader>
              <SimpleTableRow>
                <SimpleTableHead>Name</SimpleTableHead>
                <SimpleTableHead>Threads</SimpleTableHead>
                <SimpleTableHead>Updated</SimpleTableHead>
                <SimpleTableHead align="right">
                  <span className="sr-only">Actions</span>
                </SimpleTableHead>
              </SimpleTableRow>
            </SimpleTableHeader>
            <SimpleTableBody>
              {list.map((p) => (
                <SimpleTableRow key={p.id}>
                  <SimpleTableCell>
                    <span className="flex min-w-0 items-center gap-2.5">
                      <FolderIcon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">{p.name}</span>
                        <span className="truncate font-mono text-ui-xs text-muted-foreground">{p.path}</span>
                      </span>
                    </span>
                  </SimpleTableCell>
                  <SimpleTableCell variant="numeric">{p.threads}</SimpleTableCell>
                  <SimpleTableCell>{p.updated}</SimpleTableCell>
                  <SimpleTableCell align="right">
                    <span className="inline-flex items-center gap-0.5">
                      <IconAction label={`New chat in ${p.name}`} size="icon-xs" onClick={() => onOpen(p.name)}>
                        <EditIcon />
                      </IconAction>
                      <IconAction label={p.pinned ? `Unpin ${p.name}` : `Pin ${p.name}`} size="icon-xs" pressed={p.pinned} onClick={() => state.togglePin(p.id)}>
                        <PinIcon />
                      </IconAction>
                      <Menu>
                        <MenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`More for ${p.name}`} className="text-muted-foreground" />}>
                          <MoreHorizontalIcon />
                        </MenuTrigger>
                        <MenuContent align="end" className="w-44">
                          <MenuItem onClick={() => onOpen(p.name)}>
                            <EditIcon />
                            New chat
                          </MenuItem>
                          <MenuSeparator />
                          <MenuItem variant="destructive" onClick={() => state.remove(p.id)}>
                            <TrashIcon />
                            Remove
                          </MenuItem>
                        </MenuContent>
                      </Menu>
                    </span>
                  </SimpleTableCell>
                </SimpleTableRow>
              ))}
            </SimpleTableBody>
          </SimpleTable>
        )}
      </PageBody>
    </ScrollArea>
  )
}
