"use client"

import * as React from "react"

import { BoltIcon, CheckIcon, PlugIcon, PlusIcon, SearchIcon, SidebarIcon } from "@paneui/ui/icons"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@paneui/ui/components/breadcrumb"
import { Button } from "@paneui/ui/components/button"
import { EmptyState, EmptyStateDescription } from "@paneui/ui/components/empty-state"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@paneui/ui/components/input-group"
import { PageHeaderTitle } from "@paneui/ui/components/page-header"
import { ScrollArea } from "@paneui/ui/components/scroll-area"
import {
  SettingsGroup,
  SettingsRow,
  SettingsRowDescription,
  SettingsRowText,
  SettingsRowTitle,
  SettingsSection,
  SettingsSectionHeader,
  SettingsSectionTitle,
} from "@paneui/ui/components/settings-section"
import { SidebarNav, SidebarNavContent, SidebarNavLink, SidebarNavList, SidebarNavSection } from "@paneui/ui/components/sidebar-nav"
import { Switch } from "@paneui/ui/components/switch"
import { Tabs, TabsList, TabsTab } from "@paneui/ui/components/tabs"

import { IconAction, PageBody, SectionPanel, SectionPrimary, SectionSwitcher } from "./section-panel"
import { ItemChip, ItemGlyph } from "./view-icons"
import { PLUGINS, SKILLS, type Plugin } from "./workspace-data"

type Page = { kind: "browse" } | { kind: "skills" } | { kind: "plugin"; id: string }

export function usePlugins() {
  const [page, setPage] = React.useState<Page>({ kind: "browse" })
  const [installed, setInstalled] = React.useState<Record<string, boolean>>(() => Object.fromEntries(PLUGINS.map((p) => [p.id, !!p.installed])))
  const [skills, setSkills] = React.useState<Record<string, boolean>>({ review: true, release: true })
  const toggle = (id: string) => setInstalled((s) => ({ ...s, [id]: !s[id] }))
  return { page, setPage, installed, toggle, skills, setSkills }
}

export type PluginsState = ReturnType<typeof usePlugins>

export function PluginsSidebar({ state, onHide, onNavigate }: { state: PluginsState; onHide?: () => void; onNavigate?: () => void }) {
  const go = (p: Page) => {
    state.setPage(p)
    onNavigate?.()
  }
  const installed = PLUGINS.filter((p) => state.installed[p.id])
  return (
    <SectionPanel
      title="Plugins"
      actions={
        onHide && (
          <IconAction label="Hide sidebar" shortcut="⌘B" onClick={onHide}>
            <SidebarIcon />
          </IconAction>
        )
      }
      primary={<SectionPrimary icon={<PlusIcon />} label="Add plugin" onClick={() => go({ kind: "browse" })} />}
    >
      <SidebarNav indicator="fill">
        <SidebarNavContent aria-label="Plugins">
          <SidebarNavList>
            <SidebarNavLink render={<button type="button" />} className="w-full text-start" icon={<PlugIcon />} active={state.page.kind === "browse"} onClick={() => go({ kind: "browse" })}>
              Browse
            </SidebarNavLink>
            <SidebarNavLink render={<button type="button" />} className="w-full text-start" icon={<BoltIcon />} active={state.page.kind === "skills"} onClick={() => go({ kind: "skills" })}>
              Skills
            </SidebarNavLink>
          </SidebarNavList>
          <SidebarNavSection level="label" label="Installed" count={installed.length}>
            <SidebarNavList>
              {installed.map((p) => (
                <SidebarNavLink
                  key={p.id}
                  render={<button type="button" />}
                  className="w-full text-start"
                  icon={<ItemGlyph icon={p.icon} />}
                  active={state.page.kind === "plugin" && state.page.id === p.id}
                  onClick={() => go({ kind: "plugin", id: p.id })}
                >
                  {p.name}
                </SidebarNavLink>
              ))}
            </SidebarNavList>
          </SidebarNavSection>
        </SidebarNavContent>
      </SidebarNav>
    </SectionPanel>
  )
}

function PluginRow({ plugin, installed, onOpen, onToggle }: { plugin: Plugin; installed: boolean; onOpen: () => void; onToggle: () => void }) {
  return (
    <li className="flex items-center gap-1">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-inner p-2 text-start text-ui outline-none transition-colors duration-150 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ItemChip icon={plugin.icon} tone={plugin.tone} size="lg" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{plugin.name}</span>
          <span className="truncate text-muted-foreground">{plugin.description}</span>
        </span>
      </button>
      <IconAction label={installed ? `${plugin.name} is installed` : `Install ${plugin.name}`} pressed={installed} onClick={onToggle}>
        {installed ? <CheckIcon /> : <PlusIcon />}
      </IconAction>
    </li>
  )
}

function Browse({ state, leading, switcher }: { state: PluginsState; leading?: React.ReactNode; switcher?: React.ReactNode }) {
  const [scope, setScope] = React.useState<"public" | "personal">("public")
  const [query, setQuery] = React.useState("")
  const q = query.toLowerCase()
  const list = PLUGINS.filter((p) => p.scope === scope && (!q || `${p.name} ${p.description}`.toLowerCase().includes(q)))
  const sections = [
    { id: "popular", label: "Popular" },
    { id: "new", label: "New" },
  ].map((s) => ({ ...s, items: list.filter((p) => p.section === s.id) }))

  return (
    <PageBody wide>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {leading}
          <PageHeaderTitle>Plugins</PageHeaderTitle>
          {switcher}
        </div>
        <InputGroup className="w-full sm:w-64">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search plugins" aria-label="Search plugins" />
        </InputGroup>
      </div>
      <Tabs value={scope} onValueChange={(v) => setScope(v as "public" | "personal")}>
        <TabsList variant="ghost" aria-label="Source">
          <TabsTab value="public">Public</TabsTab>
          <TabsTab value="personal">Your team</TabsTab>
        </TabsList>
      </Tabs>
      {list.length === 0 ? (
        <EmptyState variant="outline" size="sm">
          <EmptyStateDescription>No plugins match.</EmptyStateDescription>
        </EmptyState>
      ) : (
        sections
          .filter((s) => s.items.length)
          .map((s) => (
            <section key={s.id} className="flex flex-col gap-2" aria-labelledby={`plugins-${s.id}`}>
              <h2 id={`plugins-${s.id}`} className="text-sm font-semibold text-balance">
                {s.label}
              </h2>
              <ul className="-mx-2 grid gap-x-6 gap-y-1 md:grid-cols-2">
                {s.items.map((p) => (
                  <PluginRow
                    key={p.id}
                    plugin={p}
                    installed={!!state.installed[p.id]}
                    onOpen={() => state.setPage({ kind: "plugin", id: p.id })}
                    onToggle={() => state.toggle(p.id)}
                  />
                ))}
              </ul>
            </section>
          ))
      )}
    </PageBody>
  )
}

function Detail({ plugin, state, leading, switcher }: { plugin: Plugin; state: PluginsState; leading?: React.ReactNode; switcher?: React.ReactNode }) {
  const installed = !!state.installed[plugin.id]
  return (
    <PageBody>
      <div className="flex items-center gap-2">
        {leading}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<button type="button" />} onClick={() => state.setPage({ kind: "browse" })}>
                Plugins
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{plugin.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {switcher}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <ItemChip icon={plugin.icon} tone={plugin.tone} size="xl" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <PageHeaderTitle>{plugin.name}</PageHeaderTitle>
          <p className="text-ui text-muted-foreground">{plugin.description}</p>
        </div>
        <Button variant={installed ? "outline" : "default"} onClick={() => state.toggle(plugin.id)}>
          {installed ? "Remove" : "Install"}
        </Button>
      </div>
      <p className="text-sm text-pretty">{plugin.about}</p>
      <SettingsSection>
        <SettingsSectionHeader>
          <SettingsSectionTitle>Tools</SettingsSectionTitle>
        </SettingsSectionHeader>
        <SettingsGroup>
          {plugin.tools.map((t) => (
            <SettingsRow key={t.name}>
              <SettingsRowText>
                <SettingsRowTitle>
                  <code className="font-mono">{t.name}</code>
                </SettingsRowTitle>
                <SettingsRowDescription>{t.description}</SettingsRowDescription>
              </SettingsRowText>
            </SettingsRow>
          ))}
        </SettingsGroup>
      </SettingsSection>
      <SettingsSection>
        <SettingsSectionHeader>
          <SettingsSectionTitle>Details</SettingsSectionTitle>
        </SettingsSectionHeader>
        <SettingsGroup>
          {[
            ["Access", plugin.capabilities],
            ["Category", plugin.category],
            ["Version", plugin.version],
          ].map(([k, v]) => (
            <SettingsRow key={k} size="sm">
              <span className="text-muted-foreground">{k}</span>
              <span>{v}</span>
            </SettingsRow>
          ))}
        </SettingsGroup>
      </SettingsSection>
    </PageBody>
  )
}

function Skills({ state, leading, switcher }: { state: PluginsState; leading?: React.ReactNode; switcher?: React.ReactNode }) {
  return (
    <PageBody>
      <div className="flex items-center gap-2">
        {leading}
        <PageHeaderTitle>Skills</PageHeaderTitle>
        {switcher}
      </div>
      <SettingsGroup>
        {SKILLS.map((s) => (
          <SettingsRow key={s.id} render={<label />}>
            <SettingsRowText>
              <SettingsRowTitle>{s.name}</SettingsRowTitle>
              <SettingsRowDescription>{s.description}</SettingsRowDescription>
            </SettingsRowText>
            <Switch checked={!!state.skills[s.id]} onCheckedChange={(on) => state.setSkills((x) => ({ ...x, [s.id]: on }))} />
          </SettingsRow>
        ))}
      </SettingsGroup>
    </PageBody>
  )
}

export function PluginsMain({ state, leading }: { state: PluginsState; leading?: React.ReactNode }) {
  const plugin = state.page.kind === "plugin" ? PLUGINS.find((p) => p.id === (state.page as { id: string }).id) : undefined
  const value = state.page.kind === "plugin" ? `plugin:${state.page.id}` : state.page.kind
  const switcher = leading && (
    <SectionSwitcher
      label="Switch page"
      value={value}
      onValueChange={(v) => state.setPage(v.startsWith("plugin:") ? { kind: "plugin", id: v.slice(7) } : { kind: v as "browse" | "skills" })}
      groups={[
        {
          options: [
            { value: "browse", label: "Browse", icon: <PlugIcon /> },
            { value: "skills", label: "Skills", icon: <BoltIcon /> },
          ],
        },
        { label: "Installed", options: PLUGINS.filter((p) => state.installed[p.id]).map((p) => ({ value: `plugin:${p.id}`, label: p.name, icon: <ItemGlyph icon={p.icon} /> })) },
      ]}
    />
  )
  return (
    <ScrollArea className="h-full min-w-0">
      {plugin ? (
        <Detail plugin={plugin} state={state} leading={leading} switcher={switcher} />
      ) : state.page.kind === "skills" ? (
        <Skills state={state} leading={leading} switcher={switcher} />
      ) : (
        <Browse state={state} leading={leading} switcher={switcher} />
      )}
    </ScrollArea>
  )
}
