"use client"

import * as React from "react"
import {
  siDiscord,
  siFigma,
  siGithub,
  siGitlab,
  siGoogledrive,
  siJira,
  siLinear,
  siNotion,
  siSentry,
  siStripe,
  siVercel,
  siZapier,
} from "simple-icons"

import { SearchIcon } from "@paneui/ui/icons"
import { Badge } from "@paneui/ui/components/badge"
import { BrandIcon, type BrandIconData } from "@paneui/ui/components/brand-icon"
import { Button } from "@paneui/ui/components/button"
import { EmptyState, EmptyStateActions, EmptyStateDescription, EmptyStateTitle } from "@paneui/ui/components/empty-state"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@paneui/ui/components/input-group"
import { SegmentedControl, SegmentedControlItem } from "@paneui/ui/components/segmented-control"
import {
  SettingsGroup,
  SettingsRow,
  SettingsRowControl,
  SettingsRowDescription,
  SettingsRowText,
  SettingsRowTitle,
  SettingsSection,
  SettingsSectionDescription,
  SettingsSectionHeader,
  SettingsSectionTitle,
} from "@paneui/ui/components/settings-section"
import { useToast } from "@paneui/ui/components/toast"

type Kind = "code" | "alerts" | "docs" | "billing"
type Integration = { id: string; icon: BrandIconData; kind: Kind; description: string }

const INTEGRATIONS: Integration[] = [
  { id: "github", icon: siGithub, kind: "code", description: "Open pull requests from agent runs and post checks." },
  { id: "gitlab", icon: siGitlab, kind: "code", description: "Mirror runs to merge requests and pipelines." },
  { id: "vercel", icon: siVercel, kind: "code", description: "Run agents against every preview deployment." },
  { id: "linear", icon: siLinear, kind: "docs", description: "Turn issues into tasks and close them when runs land." },
  { id: "jira", icon: siJira, kind: "docs", description: "Sync task status with your boards." },
  { id: "notion", icon: siNotion, kind: "docs", description: "Publish run summaries to a database." },
  { id: "figma", icon: siFigma, kind: "docs", description: "Attach frames to tasks as context." },
  { id: "google-drive", icon: siGoogledrive, kind: "docs", description: "Read specs and briefs from shared folders." },
  { id: "sentry", icon: siSentry, kind: "alerts", description: "Send new errors to triage automatically." },
  { id: "discord", icon: siDiscord, kind: "alerts", description: "Post run results to a channel." },
  { id: "zapier", icon: siZapier, kind: "alerts", description: "Trigger runs from any app you already use." },
  { id: "stripe", icon: siStripe, kind: "billing", description: "Pass usage to invoices for your own customers." },
]

const KINDS: { value: "all" | Kind; label: string }[] = [
  { value: "all", label: "All" },
  { value: "code", label: "Code" },
  { value: "docs", label: "Planning" },
  { value: "alerts", label: "Alerts" },
  { value: "billing", label: "Billing" },
]

/**
 * `/dashboard/settings/integrations`: one filter bar over two ruled lists, what is connected first and
 * what is available after. Counts follow the filter; a filter with no match says so and offers a reset.
 */
export function IntegrationsSettings() {
  const toast = useToast()
  const [connected, setConnected] = React.useState<Set<string>>(() => new Set(["github", "linear", "sentry"]))
  const [kind, setKind] = React.useState<"all" | Kind>("all")
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const shown = INTEGRATIONS.filter(
    (i) => (kind === "all" || i.kind === kind) && (!q || i.icon.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
  )
  const on = shown.filter((i) => connected.has(i.id))
  const off = shown.filter((i) => !connected.has(i.id))

  const toggle = (i: Integration) => {
    const was = connected.has(i.id)
    setConnected((s) => {
      const next = new Set(s)
      if (was) next.delete(i.id)
      else next.add(i.id)
      return next
    })
    toast.add(was ? { title: `${i.icon.title} disconnected` } : { title: `${i.icon.title} connected`, type: "success" })
  }

  const list = (items: Integration[]) => (
    <SettingsGroup>
      {items.map((i) => {
        const isOn = connected.has(i.id)
        return (
          <SettingsRow key={i.id} className="flex-nowrap">
            <span aria-hidden className="grid size-5 shrink-0 place-items-center">
              <BrandIcon icon={i.icon} color="brand" />
            </span>
            <SettingsRowText className="flex-1">
              <SettingsRowTitle>{i.icon.title}</SettingsRowTitle>
              <SettingsRowDescription className="text-pretty">{i.description}</SettingsRowDescription>
            </SettingsRowText>
            <SettingsRowControl>
              <Button size="sm" variant={isOn ? "ghost" : "outline"} onClick={() => toggle(i)} aria-label={`${isOn ? "Disconnect" : "Connect"} ${i.icon.title}`}>
                {isOn ? "Disconnect" : "Connect"}
              </Button>
            </SettingsRowControl>
          </SettingsRow>
        )
      })}
    </SettingsGroup>
  )

  return (
    <>
      <SettingsSection>
        <SettingsSectionHeader>
          <SettingsSectionTitle>Integrations</SettingsSectionTitle>
          <SettingsSectionDescription>Connect the tools your team already works in.</SettingsSectionDescription>
        </SettingsSectionHeader>
        <div className="flex flex-wrap items-center gap-3">
          <InputGroup size="sm" className="min-w-48 flex-1 sm:max-w-64">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search integrations" aria-label="Search integrations" />
          </InputGroup>
          <SegmentedControl size="sm" value={kind} onValueChange={(v) => setKind(v as "all" | Kind)} aria-label="Category">
            {KINDS.map((k) => (
              <SegmentedControlItem key={k.value} value={k.value}>
                {k.label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>
        {shown.length === 0 && (
          <EmptyState variant="outline">
            <EmptyStateTitle>No integrations found</EmptyStateTitle>
            <EmptyStateDescription>Try another name or category.</EmptyStateDescription>
            <EmptyStateActions>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setQuery("")
                  setKind("all")
                }}
              >
                Clear filters
              </Button>
            </EmptyStateActions>
          </EmptyState>
        )}
      </SettingsSection>

      {on.length > 0 && (
        <SettingsSection aria-label="Connected">
          <SettingsSectionHeader className="flex-row items-center gap-2">
            <SettingsSectionTitle>Connected</SettingsSectionTitle>
            <Badge size="sm" variant="success">
              {on.length}
            </Badge>
          </SettingsSectionHeader>
          {list(on)}
        </SettingsSection>
      )}

      {off.length > 0 && (
        <SettingsSection aria-label="Available">
          <SettingsSectionHeader className="flex-row items-center gap-2">
            <SettingsSectionTitle>Available</SettingsSectionTitle>
            <Badge size="sm" variant="outline">
              {off.length}
            </Badge>
          </SettingsSectionHeader>
          {list(off)}
        </SettingsSection>
      )}
    </>
  )
}
