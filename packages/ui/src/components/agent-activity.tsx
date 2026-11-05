"use client"

import * as React from "react"
import { useLocale, type LocaleLabels } from "@paneui/ui/components/locale-provider"
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import {
  CheckIcon,
  ChevronDownIcon,
  CodeIcon,
  EditIcon,
  FileIcon,
  LightbulbIcon,
  ListIcon,
  LoaderIcon,
  SearchIcon,
  TerminalIcon,
  XIcon,
} from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { CitationFavicon, type CitationSource } from "@paneui/ui/components/citations"
import { TextShimmer } from "@paneui/ui/components/text-shimmer"
import { AGENT_EASE, formatDuration, useControllableOpen, useElapsed } from "@paneui/ui/components/tool-result"

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type AgentActivityItemStatus = "active" | "complete" | "error"

type AgentActivityBase = { id: string; status?: AgentActivityItemStatus }

type AgentActivityReasoning = AgentActivityBase & {
  type: "reasoning"
  text: React.ReactNode
  /** Seconds spent, used in the collapsed summary. */
  duration?: number
}
type AgentActivitySearch = AgentActivityBase & {
  type: "search"
  query: string
  results?: CitationSource[]
}
type AgentActivityTool = AgentActivityBase & {
  type: "tool"
  /** `read`, `edit`, `run`, or any tool name. */
  action: string
  target: React.ReactNode
  detail?: React.ReactNode
  additions?: number
  deletions?: number
}
type AgentActivityStep = AgentActivityBase & {
  type: "step"
  label: React.ReactNode
  detail?: React.ReactNode
}

type AgentActivityItem = AgentActivityReasoning | AgentActivitySearch | AgentActivityTool | AgentActivityStep
type AgentActivityType = AgentActivityItem["type"]

type ActivityGroup = { id: string; type: AgentActivityType; items: AgentActivityItem[]; active: boolean; error: boolean }

/** Consecutive items of the same type collapse into one group. */
function groupItems(items: AgentActivityItem[], working: boolean): ActivityGroup[] {
  const groups: ActivityGroup[] = []
  for (const item of items) {
    const last = groups[groups.length - 1]
    if (last && last.type === item.type) last.items.push(item)
    else groups.push({ id: item.id, type: item.type, items: [item], active: false, error: false })
  }
  groups.forEach((g, i) => {
    g.error = g.items.some((it) => it.status === "error")
    // A group is live if any item says so, or (while working) it is the newest group with no explicit status.
    g.active =
      g.items.some((it) => it.status === "active") ||
      (working && i === groups.length - 1 && g.items[g.items.length - 1].status === undefined)
  })
  return groups
}

function groupLabel(group: ActivityGroup, l10n: LocaleLabels): string {
  const n = group.items.length
  if (group.type === "reasoning") {
    if (group.active) return l10n.labelThinking
    const secs = group.items.reduce((sum, it) => sum + ((it as AgentActivityReasoning).duration ?? 0), 0)
    return secs ? l10n.thoughtFor(formatDuration(secs)) : l10n.reasoned
  }
  if (group.type === "search") {
    if (group.active) return l10n.searchingTheWeb
    const sources = group.items.reduce((sum, it) => sum + ((it as AgentActivitySearch).results?.length ?? 0), 0)
    return l10n.searchedQueries(n, sources)
  }
  if (group.type === "tool") {
    if (group.active) {
      const live = [...group.items].reverse().find((it) => it.status === "active") ?? group.items[n - 1]
      return `${actionVerb((live as AgentActivityTool).action, true, l10n)}…`
    }
    return l10n.usedTools(n)
  }
  return group.active ? l10n.workingThroughSteps : l10n.completedSteps(n)
}

function actionVerb(action: string, live: boolean, l10n: LocaleLabels) {
  const map: Record<string, [string, string]> = {
    read: [l10n.read, l10n.reading],
    edit: [l10n.edited, l10n.editing],
    write: [l10n.wrote, l10n.writing],
    run: [l10n.ran, l10n.toolRunning],
  }
  const verbs = map[action]
  return verbs ? verbs[live ? 1 : 0] : live ? l10n.callingTool(action) : action
}

const TYPE_ICON: Record<AgentActivityType, React.ComponentType<{ className?: string }>> = {
  reasoning: LightbulbIcon,
  search: SearchIcon,
  tool: CodeIcon,
  step: ListIcon,
}

const ACTION_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  read: FileIcon,
  edit: EditIcon,
  write: EditIcon,
  run: TerminalIcon,
}

/* -------------------------------------------------------------------------- */
/* Rows                                                                        */
/* -------------------------------------------------------------------------- */

function RowStatus({ status }: { status?: AgentActivityItemStatus }) {
  if (status === "active") return <LoaderIcon className="size-3.5 shrink-0 animate-spin text-primary-text motion-reduce:animate-none" />
  if (status === "error") return <XIcon className="size-3.5 shrink-0 text-destructive-text" />
  if (status === "complete") return <CheckIcon className="size-3.5 shrink-0 text-success-text" />
  return null
}

function ActivityRow({ item }: { item: AgentActivityItem }) {
  const l10n = useLocale().labels

  const reduce = useReducedMotion()
  if (item.type === "reasoning") {
    return <p className="text-ui leading-relaxed text-muted-foreground">{item.text}</p>
  }
  if (item.type === "search") {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex min-w-0 items-center gap-1.5 text-ui">
          <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
          {item.status === "active" ? (
            <TextShimmer className="min-w-0 truncate">{item.query}</TextShimmer>
          ) : (
            <span className="min-w-0 truncate text-foreground/85">{item.query}</span>
          )}
          <span className="ml-auto">
            <RowStatus status={item.status === "complete" ? undefined : item.status} />
          </span>
        </div>
        {item.results?.length ? (
          <ul className="flex flex-wrap gap-1 pl-5">
            <AnimatePresence initial={false}>
              {item.results.map((r, i) => (
                <motion.li
                  key={r.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 3 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: AGENT_EASE, delay: reduce ? 0 : Math.min(i, 6) * 0.04 }}
                >
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    title={typeof r.title === "string" ? r.title : undefined}
                    className="inline-flex h-6 max-w-48 items-center gap-1.5 rounded-control-sm bg-muted pr-2 pl-0.5 text-ui-xs text-muted-foreground shadow-chip outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <CitationFavicon source={r} className="size-5 rounded-full shadow-none" />
                    <span className="truncate">{r.domain ?? (typeof r.title === "string" ? r.title : l10n.source)}</span>
                  </a>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : null}
      </div>
    )
  }
  if (item.type === "tool") {
    const Icon = ACTION_ICON[item.action] ?? CodeIcon
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-1.5 text-ui">
          <Icon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="shrink-0 text-muted-foreground">{actionVerb(item.action, item.status === "active", l10n)}</span>
          <span className="min-w-0 truncate font-mono text-ui-sm text-foreground/85">{item.target}</span>
          {item.additions || item.deletions ? (
            <span className="shrink-0 font-mono text-ui-xs tabular-nums">
              {item.additions ? <span className="text-success-text">+{item.additions}</span> : null}
              {item.additions && item.deletions ? " " : null}
              {item.deletions ? <span className="text-destructive-text">−{item.deletions}</span> : null}
            </span>
          ) : null}
          <span className="ml-auto">
            <RowStatus status={item.status} />
          </span>
        </div>
        {item.detail ? <div className="pl-5 text-ui-sm text-muted-foreground">{item.detail}</div> : null}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex min-w-0 items-center gap-2 text-ui">
        <span
          aria-hidden
          className={cn(
            "grid size-3.5 shrink-0 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_currentColor] [&_svg]:size-2.5",
            item.status === "complete" && "bg-success text-success [&_svg]:text-success-foreground",
            item.status === "active" && "text-primary-text",
            item.status === "error" && "text-destructive-text",
            !item.status && "text-muted-foreground/50"
          )}
        >
          {item.status === "complete" ? <CheckIcon /> : item.status === "active" ? <span className="size-1.5 animate-pulse rounded-full bg-current" /> : null}
        </span>
        {item.status === "active" ? (
          <TextShimmer>{item.label}</TextShimmer>
        ) : (
          <span className={cn(item.status ? "text-foreground/85" : "text-muted-foreground")}>{item.label}</span>
        )}
      </div>
      {item.detail ? <div className="pl-5.5 text-ui-sm text-muted-foreground">{item.detail}</div> : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Group                                                                       */
/* -------------------------------------------------------------------------- */

const PANEL =
  "h-(--collapsible-panel-height) overflow-hidden transition-[height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0 motion-reduce:transition-none"

/**
 * Live halo on a group icon. It grows to 1.5x (5px past the 20px icon), which
 * stays inside the stream's left inset, so the ring is never cut by the
 * panel's overflow clip. Reduced motion shows no halo.
 */
function PulseRing() {
  const reduce = useReducedMotion()
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-full bg-primary/20 motion-reduce:hidden"
      initial={{ scale: 1, opacity: 0.9 }}
      animate={{ scale: reduce ? 1 : 1.5, opacity: 0 }}
      transition={{ duration: reduce ? 0 : 1.2, ease: "easeOut", repeat: reduce ? 0 : Infinity }}
    />
  )
}

function ActivityGroupView({
  group,
  open,
  onOpenChange,
  last,
}: {
  group: ActivityGroup
  open: boolean
  onOpenChange: (open: boolean) => void
  last: boolean
}) {
  const l10n = useLocale().labels
  const Icon = TYPE_ICON[group.type]
  const label = groupLabel(group, l10n)
  return (
    <CollapsiblePrimitive.Root open={open} onOpenChange={onOpenChange} className="relative flex flex-col" render={<li />}>
      {/* timeline rail */}
      {!last ? <span aria-hidden className="absolute top-7 bottom-0 left-[0.6875rem] w-px bg-border" /> : null}
      {/* Concentric with the round 20px icon: 4px inset all round (h-7, pl-1), so 10px + 4px = rounded-xl (14px). */}
      <CollapsiblePrimitive.Trigger className="group/activity-group -ml-1 flex h-7 w-fit max-w-full cursor-pointer items-center gap-2 rounded-xl pr-2.5 pl-1 text-start text-ui outline-none select-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
        <span
          aria-hidden
          className={cn(
            "relative grid size-5 shrink-0 place-items-center rounded-full bg-card shadow-chip [&_svg]:size-3",
            group.active ? "text-primary-text" : group.error ? "text-destructive-text" : "text-muted-foreground"
          )}
        >
          <Icon />
          {group.active ? <PulseRing /> : null}
        </span>
        {group.active ? (
          <TextShimmer className="truncate font-medium">{label}</TextShimmer>
        ) : (
          <span className="truncate font-medium text-muted-foreground group-hover/activity-group:text-foreground">{label}</span>
        )}
        <ChevronDownIcon className="size-3 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-panel-open/activity-group:rotate-180 motion-reduce:transition-none" />
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Panel className={PANEL}>
        <ul className="flex flex-col gap-2 pt-1 pb-3 pl-7">
          <AnimatePresence initial={false}>
            {group.items.map((item) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: AGENT_EASE }}
              >
                <ActivityRow item={item} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </CollapsiblePrimitive.Panel>
    </CollapsiblePrimitive.Root>
  )
}

/* -------------------------------------------------------------------------- */
/* AgentActivity                                                               */
/* -------------------------------------------------------------------------- */

type AgentActivityProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Chronological activity. Append or update items as events stream in. */
  items: AgentActivityItem[]
  status?: "working" | "complete"
  /** Total seconds; while working the header ticks on its own. */
  duration?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Fold the whole stream into its summary line when the run completes. */
  collapseOnComplete?: boolean
  /** Override the live header label. */
  activeLabel?: React.ReactNode
  /** Override the completed summary. */
  summary?: React.ReactNode
}

function summarize(items: AgentActivityItem[], l10n: LocaleLabels) {
  const count = (t: AgentActivityType) => items.filter((i) => i.type === t).length
  return l10n.activitySummary(count("search"), count("tool"), count("step"))
}

/**
 * One adaptive activity stream for an agent run. Consecutive reasoning,
 * searches, tool calls and steps fold into groups on a timeline; the live group
 * stays open with a shimmering label, finished ones collapse. When the run
 * completes the whole stream folds into a one-line summary.
 */
function AgentActivity({
  items,
  status = "working",
  duration,
  open,
  defaultOpen = false,
  onOpenChange,
  collapseOnComplete = true,
  activeLabel,
  summary,
  className,
  ...props
}: AgentActivityProps) {
  const l10n = useLocale().labels

  const working = status === "working"
  const elapsed = useElapsed(working)
  const seconds = duration ?? elapsed
  const [isOpen, setOpen] = useControllableOpen(open, working || defaultOpen, onOpenChange)
  const prev = React.useRef(status)
  const groups = React.useMemo(() => groupItems(items, working), [items, working])
  const [overrides, setOverrides] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    if (prev.current === "complete" && status === "working") setOpen(true)
    if (prev.current === "working" && status === "complete" && collapseOnComplete) setOpen(false)
    prev.current = status
  }, [status, collapseOnComplete, setOpen])

  const liveGroup = [...groups].reverse().find((g) => g.active)
  const headerLabel = activeLabel ?? (liveGroup ? groupLabel(liveGroup, l10n) : l10n.labelWorking)
  const detail = summarize(items, l10n)
  const expanded = working || isOpen

  return (
    <CollapsiblePrimitive.Root
      data-slot="agent-activity"
      data-status={status}
      open={expanded}
      onOpenChange={(next) => {
        if (!working) setOpen(next)
      }}
      aria-busy={working}
      className={cn("flex w-full flex-col text-ui", className)}
      {...props}
    >
      <CollapsiblePrimitive.Trigger
        disabled={working}
        className="group/activity -ml-1.5 flex h-8 w-fit max-w-full cursor-pointer items-center gap-2 rounded-md px-1.5 text-start outline-none select-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-disabled:cursor-default data-disabled:hover:bg-transparent"
      >
        <span role="status" className="flex min-w-0 items-center gap-2">
          {working ? (
            <TextShimmer className="truncate font-medium">{headerLabel}</TextShimmer>
          ) : (
            <span className="truncate font-medium text-foreground/85">
              {summary ?? (
                <>
                  <span className="tabular-nums">{l10n.workedFor(formatDuration(seconds))}</span>
                </>
              )}
            </span>
          )}
          <span className="shrink-0 font-mono text-ui-xs text-muted-foreground tabular-nums">
            {working ? formatDuration(seconds) : detail}
          </span>
        </span>
        {!working ? (
          <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-panel-open/activity:rotate-180 motion-reduce:transition-none" />
        ) : null}
      </CollapsiblePrimitive.Trigger>

      {/* The panel clips for its height transition. Pull its box 6px left (the
          header's own -ml-1.5) and pad it back, so the group triggers' hover
          fill, focus rings and live halos have room inside the clip. */}
      <CollapsiblePrimitive.Panel className={cn(PANEL, "-ml-1.5 pl-1.5")}>
        <ol aria-label={l10n.agentActivity} className="flex flex-col pt-1.5 pl-0.5">
          {groups.map((group, i) => (
            <ActivityGroupView
              key={group.id}
              group={group}
              last={i === groups.length - 1}
              open={overrides[group.id] ?? (group.active || (!working && groups.length === 1))}
              onOpenChange={(next) => setOverrides((o) => ({ ...o, [group.id]: next }))}
            />
          ))}
        </ol>
      </CollapsiblePrimitive.Panel>
    </CollapsiblePrimitive.Root>
  )
}

export {
  AgentActivity,
  type AgentActivityProps,
  type AgentActivityItem,
  type AgentActivityItemStatus,
  type AgentActivityReasoning,
  type AgentActivitySearch,
  type AgentActivityTool,
  type AgentActivityStep,
}
