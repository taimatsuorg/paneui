"use client"

import * as React from "react"

import { BotIcon, ChartIcon, MonitorIcon, MoonIcon, PaletteIcon, SettingsIcon, SidebarIcon, SunIcon, TypeIcon } from "@paneui/ui/icons"
import { AccentPicker } from "@paneui/ui/components/accent-picker"
import { Badge } from "@paneui/ui/components/badge"
import { Button } from "@paneui/ui/components/button"
import { seededRandom } from "@paneui/ui/components/chart-utils"
import { generateHeatCalendarData, HeatCalendar } from "@paneui/ui/components/heat-calendar"
import { Input } from "@paneui/ui/components/input"
import { Kbd } from "@paneui/ui/components/kbd"
import { PageHeaderTitle } from "@paneui/ui/components/page-header"
import { ScrollArea } from "@paneui/ui/components/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paneui/ui/components/select"
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
import { SidebarNav, SidebarNavContent, SidebarNavLink, SidebarNavList } from "@paneui/ui/components/sidebar-nav"
import { StatCard, StatCardLabel, StatCardValue } from "@paneui/ui/components/stat-card"
import { Switch } from "@paneui/ui/components/switch"
import { useTheme } from "@paneui/ui/components/theme-toggle"
import { ToggleGroup, ToggleGroupItem, ToggleGroupItemIcon } from "@paneui/ui/components/toggle-group"
import { UsageMeter } from "@paneui/ui/components/usage-meter"

import type { AgentConfig } from "./agents"
import { ProviderIcon } from "./provider-icon"
import { IconAction, PageBody, SectionPanel, SectionSwitcher } from "./section-panel"
import { PROJECTS, USAGE_STATS } from "./workspace-data"

export type SettingsPage = "general" | "appearance" | "agents" | "usage" | "shortcuts"

const PAGES: { id: SettingsPage; label: string; icon: React.ReactNode; keywords: string }[] = [
  { id: "general", label: "General", icon: <SettingsIcon />, keywords: "permissions access project language" },
  { id: "appearance", label: "Appearance", icon: <PaletteIcon />, keywords: "theme dark light accent colour font" },
  { id: "agents", label: "Agents", icon: <BotIcon />, keywords: "bridge connect provider" },
  { id: "usage", label: "Usage", icon: <ChartIcon />, keywords: "tokens plan limit activity" },
  { id: "shortcuts", label: "Keyboard shortcuts", icon: <TypeIcon />, keywords: "keys hotkeys" },
]

export const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "⌘K", label: "Search threads and commands" },
  { keys: "⌘N", label: "New chat" },
  { keys: "⌘B", label: "Show or hide the sidebar" },
  { keys: "⌘J", label: "Show or hide the terminal panel" },
  { keys: "⌘\\", label: "Split chats side by side" },
  { keys: "⌘1–9", label: "Go to an open thread" },
  { keys: "⌘[  ⌘]", label: "Back and forward between threads" },
  { keys: "⇧⌘1–6", label: "Go to a page in the rail" },
  { keys: "⌘,", label: "Settings" },
]

const ACTIVITY = generateHeatCalendarData(seededRandom(11), { endDate: "2026-11-02", days: 371 })

export function SettingsSidebar({
  page,
  onPage,
  onHide,
  onNavigate,
}: {
  page: SettingsPage
  onPage: (page: SettingsPage) => void
  onHide?: () => void
  onNavigate?: () => void
}) {
  const [query, setQuery] = React.useState("")
  const q = query.toLowerCase()
  const pages = PAGES.filter((p) => !q || `${p.label} ${p.keywords}`.toLowerCase().includes(q))
  return (
    <SectionPanel
      title="Settings"
      actions={
        onHide && (
          <IconAction label="Hide sidebar" shortcut="⌘B" onClick={onHide}>
            <SidebarIcon />
          </IconAction>
        )
      }
      primary={<Input size="sm" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search settings" aria-label="Search settings" />}
    >
      <SidebarNav indicator="fill">
        <SidebarNavContent aria-label="Settings">
          {pages.length === 0 ? (
            <p className="px-2 text-ui text-muted-foreground">No settings match.</p>
          ) : (
            <SidebarNavList>
              {pages.map((p) => (
                <SidebarNavLink
                  key={p.id}
                  render={<button type="button" />}
                  className="w-full text-start"
                  icon={p.icon}
                  active={page === p.id}
                  onClick={() => {
                    onPage(p.id)
                    onNavigate?.()
                  }}
                >
                  {p.label}
                </SidebarNavLink>
              ))}
            </SidebarNavList>
          )}
        </SidebarNavContent>
      </SidebarNav>
    </SectionPanel>
  )
}

function SelectRow({ title, description, value, options }: { title: string; description?: string; value: string; options: string[] }) {
  return (
    <SettingsRow>
      <SettingsRowText>
        <SettingsRowTitle>{title}</SettingsRowTitle>
        {description && <SettingsRowDescription>{description}</SettingsRowDescription>}
      </SettingsRowText>
      <Select defaultValue={value}>
        <SelectTrigger aria-label={title} className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SettingsRow>
  )
}

function SwitchRow({ title, description, defaultChecked }: { title: string; description?: string; defaultChecked?: boolean }) {
  return (
    <SettingsRow render={<label />}>
      <SettingsRowText>
        <SettingsRowTitle>{title}</SettingsRowTitle>
        {description && <SettingsRowDescription>{description}</SettingsRowDescription>}
      </SettingsRowText>
      <Switch defaultChecked={defaultChecked} />
    </SettingsRow>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SettingsSection>
      <SettingsSectionHeader>
        <SettingsSectionTitle>{title}</SettingsSectionTitle>
      </SettingsSectionHeader>
      {children}
    </SettingsSection>
  )
}

function General() {
  return (
    <>
      <Section title="Permissions">
        <SettingsGroup>
          <SelectRow title="Default access" description="What a new thread may do without asking." value="Auto-edit" options={["Ask first", "Auto-edit", "Full access"]} />
          <SwitchRow title="Allow network commands" description="Commands that reach the network still ask first when this is off." />
        </SettingsGroup>
      </Section>
      <Section title="Chats">
        <SettingsGroup>
          <SelectRow title="Default project" value={PROJECTS[0].name} options={PROJECTS.map((p) => p.name)} />
          <SelectRow title="Language" value="Automatic" options={["Automatic", "English", "Deutsch", "日本語", "中文"]} />
          <SwitchRow title="Confirm before closing a running thread" defaultChecked />
          <SwitchRow title="Open new chats beside the current one" />
        </SettingsGroup>
      </Section>
    </>
  )
}

function Appearance() {
  const { theme, setTheme } = useTheme()
  const modes = [
    { value: "system", label: "System", icon: <MonitorIcon /> },
    { value: "light", label: "Light", icon: <SunIcon /> },
    { value: "dark", label: "Dark", icon: <MoonIcon /> },
  ] as const
  return (
    <>
      <Section title="Theme">
        <SettingsGroup>
          <SettingsRow>
            <SettingsRowText>
              <SettingsRowTitle>Mode</SettingsRowTitle>
            </SettingsRowText>
            <ToggleGroup
              aria-label="Mode"
              variant="tile"
              value={theme ? [theme] : []}
              onValueChange={(v) => v[0] && setTheme(v[0] as "system" | "light" | "dark")}
              className="gap-2"
            >
              {modes.map((m) => (
                <ToggleGroupItem key={m.value} value={m.value} className="w-16">
                  <ToggleGroupItemIcon>{m.icon}</ToggleGroupItemIcon>
                  {m.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </SettingsRow>
          <SettingsRow>
            <SettingsRowText>
              <SettingsRowTitle>Accent</SettingsRowTitle>
            </SettingsRowText>
            <AccentPicker aria-label="Accent" />
          </SettingsRow>
          <SelectRow title="Code font size" value="13" options={["12", "13", "14", "15"]} />
        </SettingsGroup>
      </Section>
    </>
  )
}

function Agents({
  agents,
  activeAgentId,
  connection,
  onManage,
  onConnect,
}: {
  agents: AgentConfig[]
  activeAgentId: string
  connection: string
  onManage: () => void
  onConnect: (id: string) => void
}) {
  return (
    <Section title="Agents">
      <SettingsGroup>
        {agents.map((a) => {
          const active = a.id === activeAgentId
          return (
            <SettingsRow key={a.id}>
              <span className="flex min-w-0 items-center gap-3">
                <ProviderIcon provider={a.provider} className="size-5 shrink-0" />
                <SettingsRowText>
                  <SettingsRowTitle>{a.name}</SettingsRowTitle>
                  <SettingsRowDescription>
                    <span className="block truncate font-mono">{a.builtin ? "Runs in the browser" : [a.command, ...a.args].join(" ")}</span>
                  </SettingsRowDescription>
                </SettingsRowText>
              </span>
              <span className="flex items-center gap-2">
                {active && <Badge variant={connection === "ready" ? "success" : "chip"}>{connection === "ready" ? "Connected" : connection}</Badge>}
                {!active && (
                  <Button variant="outline" size="sm" onClick={() => onConnect(a.id)}>
                    Connect
                  </Button>
                )}
              </span>
            </SettingsRow>
          )
        })}
      </SettingsGroup>
      <div>
        <Button variant="outline" size="sm" onClick={onManage}>
          Add or edit agents…
        </Button>
      </div>
    </Section>
  )
}

function Usage() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {USAGE_STATS.map((s) => (
          <StatCard key={s.label}>
            <StatCardLabel>{s.label}</StatCardLabel>
            <StatCardValue>{s.value}</StatCardValue>
          </StatCard>
        ))}
      </div>
      <Section title="Activity">
        <HeatCalendar data={ACTIVITY} endDate="2026-11-02" weeks={52} unit="runs" label="Agent runs, last 52 weeks" color="var(--chart-1)" />
      </Section>
      <Section title="Plan">
        <SettingsGroup>
          <SettingsRow>
            <UsageMeter label="Agent runs this month" value={8420} max={10000} unit="runs" description="Resets on Dec 1." />
          </SettingsRow>
        </SettingsGroup>
      </Section>
    </>
  )
}

function Shortcuts() {
  return (
    <SettingsGroup>
      {SHORTCUTS.map((s) => (
        <SettingsRow key={s.keys} size="sm">
          <span>{s.label}</span>
          <Kbd>{s.keys}</Kbd>
        </SettingsRow>
      ))}
    </SettingsGroup>
  )
}

export function SettingsMain({
  page,
  onPage,
  leading,
  agents,
  activeAgentId,
  connection,
  onManageAgents,
  onConnect,
}: {
  page: SettingsPage
  onPage: (page: SettingsPage) => void
  leading?: React.ReactNode
  agents: AgentConfig[]
  activeAgentId: string
  connection: string
  onManageAgents: () => void
  onConnect: (id: string) => void
}) {
  const title = PAGES.find((p) => p.id === page)?.label
  return (
    <ScrollArea className="h-full min-w-0">
      <PageBody wide={page === "usage"}>
        <div className="flex items-center gap-2">
          {leading}
          <PageHeaderTitle>{title}</PageHeaderTitle>
          {leading && (
            <SectionSwitcher
              label="Switch section"
              value={page}
              onValueChange={(v) => onPage(v as SettingsPage)}
              groups={[{ options: PAGES.map((p) => ({ value: p.id, label: p.label, icon: p.icon })) }]}
            />
          )}
        </div>
        {page === "general" && <General />}
        {page === "appearance" && <Appearance />}
        {page === "agents" && <Agents agents={agents} activeAgentId={activeAgentId} connection={connection} onManage={onManageAgents} onConnect={onConnect} />}
        {page === "usage" && <Usage />}
        {page === "shortcuts" && <Shortcuts />}
      </PageBody>
    </ScrollArea>
  )
}
