"use client"

import * as React from "react"

import { CheckCircleIcon, ClockIcon, MoreHorizontalIcon, PlayIcon, PlusIcon, SearchIcon, SidebarIcon, TrashIcon, XCircleIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import { Card } from "@paneui/ui/components/card"
import { EmptyState, EmptyStateActions, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from "@paneui/ui/components/empty-state"
import { Input } from "@paneui/ui/components/input"
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@paneui/ui/components/menu"
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
import { Switch } from "@paneui/ui/components/switch"
import { Textarea } from "@paneui/ui/components/textarea"

import { IconAction, PageBody, SectionPanel, SectionPrimary } from "./section-panel"
import { ItemChip, ItemGlyph } from "./view-icons"
import { PROJECTS, SCHEDULE_OPTIONS, TASK_TEMPLATES, type ScheduledTask, type TaskTemplate } from "./workspace-data"

export function useScheduledTasks() {
  const [tasks, setTasks] = React.useState<ScheduledTask[]>([])
  const [selected, setSelected] = React.useState<string | null>(null)
  const create = (template: TaskTemplate | null) => {
    const base: TaskTemplate = template ?? {
      id: "blank",
      title: "Untitled task",
      description: "",
      icon: "calendar",
      tone: "neutral",
      schedule: SCHEDULE_OPTIONS[2],
      prompt: "",
    }
    const id = `${base.id}-${Date.now().toString(36)}`
    setTasks((t) => [{ ...base, id, enabled: true, runs: [] }, ...t])
    setSelected(id)
  }
  const update = (id: string, patch: Partial<ScheduledTask>) => setTasks((t) => t.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const remove = (id: string) => {
    setTasks((t) => t.filter((x) => x.id !== id))
    setSelected(null)
  }
  return { tasks, selected, setSelected, create, update, remove }
}

export type ScheduledTasksState = ReturnType<typeof useScheduledTasks>

export function TasksSidebar({ state, onHide, onNavigate }: { state: ScheduledTasksState; onHide?: () => void; onNavigate?: () => void }) {
  const [query, setQuery] = React.useState("")
  const [searching, setSearching] = React.useState(false)
  const list = state.tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
  return (
    <SectionPanel
      title="Scheduled"
      actions={
        <>
          <IconAction label="Search tasks" pressed={searching} onClick={() => (setSearching((s) => !s), setQuery(""))}>
            <SearchIcon />
          </IconAction>
          {onHide && (
            <IconAction label="Hide sidebar" shortcut="⌘B" onClick={onHide}>
              <SidebarIcon />
            </IconAction>
          )}
        </>
      }
      primary={
        <>
          {searching && (
            <Input autoFocus size="sm" className="mb-1" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks" aria-label="Search tasks" />
          )}
          <SectionPrimary
            icon={<PlusIcon />}
            label="New task"
            onClick={() => {
              state.setSelected(null)
              onNavigate?.()
            }}
          />
        </>
      }
    >
      <SidebarNav indicator="fill">
        <SidebarNavContent aria-label="Scheduled tasks">
          {list.length === 0 ? (
            <p className="px-2 py-1 text-ui text-muted-foreground">{state.tasks.length ? "No tasks match." : "Nothing scheduled yet."}</p>
          ) : (
            <SidebarNavList>
              {list.map((t) => (
                <SidebarNavLink
                  key={t.id}
                  render={<button type="button" />}
                  className="w-full text-start"
                  icon={<ItemGlyph icon={t.icon} />}
                  active={t.id === state.selected}
                  onClick={() => {
                    state.setSelected(t.id)
                    onNavigate?.()
                  }}
                  badge={!t.enabled && <span className="shrink-0 text-ui-xs text-muted-foreground">Paused</span>}
                >
                  {t.title}
                </SidebarNavLink>
              ))}
            </SidebarNavList>
          )}
        </SidebarNavContent>
      </SidebarNav>
    </SectionPanel>
  )
}

/** Nothing selected: what a scheduled task is, and six to start from. */
function TaskTemplates({ onPick, onBlank }: { onPick: (t: TaskTemplate) => void; onBlank: () => void }) {
  return (
    <PageBody className="gap-8">
      <EmptyState size="sm">
        <EmptyStateIcon>
          <ClockIcon />
        </EmptyStateIcon>
        <EmptyStateTitle>Schedule a task</EmptyStateTitle>
        <EmptyStateDescription>The agent runs it on time and leaves the result in a thread.</EmptyStateDescription>
        <EmptyStateActions className="mt-3">
          <Button variant="outline" size="sm" onClick={onBlank}>
            Start blank
          </Button>
        </EmptyStateActions>
      </EmptyState>
      <ul className="grid gap-3 sm:grid-cols-2" aria-label="Templates">
        {TASK_TEMPLATES.map((t) => (
          <li key={t.id} className="flex">
            <Card interactive size="sm" render={<button type="button" onClick={() => onPick(t)} />} className="w-full flex-row items-start gap-3 px-3 text-start">
              <ItemChip icon={t.icon} tone={t.tone} />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-medium">{t.title}</span>
                <span className="text-ui text-pretty text-muted-foreground">{t.description}</span>
              </span>
            </Card>
          </li>
        ))}
      </ul>
    </PageBody>
  )
}

export function TasksMain({ state, leading }: { state: ScheduledTasksState; leading?: React.ReactNode }) {
  const task = state.tasks.find((t) => t.id === state.selected)
  return (
    <div className="flex h-full min-w-0 flex-col">
      {leading && <div className="flex h-10 shrink-0 items-center px-2">{leading}</div>}
      <ScrollArea className="min-h-0 flex-1">
        {task ? <TaskDetail task={task} state={state} /> : <TaskTemplates onPick={state.create} onBlank={() => state.create(null)} />}
      </ScrollArea>
    </div>
  )
}

function TaskDetail({ task, state }: { task: ScheduledTask; state: ScheduledTasksState }) {
  const runNow = () =>
    state.update(task.id, {
      runs: [{ at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), ok: task.prompt.trim().length > 0 }, ...task.runs].slice(0, 6),
    })
  return (
    <PageBody>
      <div className="flex items-center gap-3">
        <ItemChip icon={task.icon} tone={task.tone} size="lg" />
        <PageHeaderTitle className="min-w-0 flex-1 truncate">{task.title}</PageHeaderTitle>
        <Button variant="outline" size="sm" onClick={runNow}>
          <PlayIcon data-icon="inline-start" />
          Run now
        </Button>
        <Menu>
          <MenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="More actions" className="text-muted-foreground" />}>
            <MoreHorizontalIcon />
          </MenuTrigger>
          <MenuContent align="end" className="w-44">
            <MenuItem onClick={() => state.update(task.id, { enabled: !task.enabled })}>{task.enabled ? "Pause" : "Resume"}</MenuItem>
            <MenuSeparator />
            <MenuItem variant="destructive" onClick={() => state.remove(task.id)}>
              <TrashIcon />
              Delete task
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>

      <SettingsGroup>
        <SettingsRow render={<label />}>
          <SettingsRowText>
            <SettingsRowTitle>Active</SettingsRowTitle>
            <SettingsRowDescription>{task.enabled ? `Next run ${task.schedule.toLowerCase()}.` : "Paused until you turn it back on."}</SettingsRowDescription>
          </SettingsRowText>
          <Switch checked={task.enabled} onCheckedChange={(enabled) => state.update(task.id, { enabled })} />
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText>
            <SettingsRowTitle>Schedule</SettingsRowTitle>
          </SettingsRowText>
          <Select value={task.schedule} onValueChange={(v) => state.update(task.id, { schedule: v as string })}>
            <SelectTrigger aria-label="Schedule" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(SCHEDULE_OPTIONS.includes(task.schedule) ? SCHEDULE_OPTIONS : [task.schedule, ...SCHEDULE_OPTIONS]).map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText>
            <SettingsRowTitle>Project</SettingsRowTitle>
          </SettingsRowText>
          <Select defaultValue={PROJECTS[0].id}>
            <SelectTrigger aria-label="Project" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECTS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsGroup>

      <SettingsSection>
        <SettingsSectionHeader>
          <SettingsSectionTitle>Prompt</SettingsSectionTitle>
        </SettingsSectionHeader>
        <Textarea
          value={task.prompt}
          onChange={(e) => state.update(task.id, { prompt: e.target.value })}
          placeholder="What should the agent do each time?"
          aria-label="Prompt"
          rows={4}
        />
      </SettingsSection>

      <SettingsSection>
        <SettingsSectionHeader>
          <SettingsSectionTitle>Runs</SettingsSectionTitle>
        </SettingsSectionHeader>
        {task.runs.length === 0 ? (
          <EmptyState variant="outline" size="sm">
            <EmptyStateDescription>Runs show up here. Try one now to check the prompt.</EmptyStateDescription>
          </EmptyState>
        ) : (
          <SettingsGroup>
            {task.runs.map((r, i) => (
              <SettingsRow key={i}>
                <span className="flex items-center gap-2">
                  {r.ok ? <CheckCircleIcon className="size-4 text-success-text" /> : <XCircleIcon className="size-4 text-destructive-text" />}
                  <span>{r.ok ? "Finished" : "Failed, the prompt is empty"}</span>
                </span>
                <span className={cn("text-ui-sm text-muted-foreground tabular-nums")}>Today {r.at}</span>
              </SettingsRow>
            ))}
          </SettingsGroup>
        )}
      </SettingsSection>
    </PageBody>
  )
}
