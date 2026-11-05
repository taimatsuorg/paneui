"use client"

import * as React from "react"

import {
  AlertCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Columns2Icon,
  InfoIcon,
  PlusIcon,
  TerminalSquareIcon,
  TrashIcon,
  WarningIcon,
  XCircleIcon,
  XIcon,
} from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { getFileKind } from "@paneui/ui/components/file-tree"
import { ScrollArea } from "@paneui/ui/components/scroll-area"
import { TabStrip, TabStripItem } from "@paneui/ui/components/tab-strip"
import { Terminal, type TerminalHandle } from "@paneui/ui/components/terminal"

import type { Problem } from "./code-editor"
import { IconAction } from "./sidebar-header"
import type { Terminals } from "./terminals"
import { basename, dirname, rel } from "./workspace"

export type PanelTab = "problems" | "output" | "terminal"
export type OutputLine = { time: number; text: string; level?: "info" | "error" }

const SEVERITY = {
  error: { icon: <XCircleIcon />, className: "text-destructive-text" },
  warning: { icon: <WarningIcon />, className: "text-warning-text" },
  info: { icon: <InfoIcon />, className: "text-primary-text" },
} as const

/* -------------------------------- terminals ------------------------------- */

function TerminalArea({ terms, visible, compact }: { terms: Terminals; visible: boolean; compact: boolean }) {
  const handles = React.useRef(new Map<string, TerminalHandle>())
  const { sessions, activeGroup, active } = terms

  // Focus the active terminal when it changes or the area shows.
  React.useEffect(() => {
    if (!visible || !active) return
    const id = requestAnimationFrame(() => {
      const h = handles.current.get(active)
      h?.fit()
      h?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [visible, active])

  if (!sessions.length)
    return (
      <div className={cn("flex h-full flex-col items-center justify-center gap-2 p-6 text-center", !visible && "hidden")}>
        <p className="text-ui text-muted-foreground">No terminal running.</p>
        <button
          type="button"
          onClick={() => terms.create()}
          className="text-ui text-primary-text outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          New terminal
        </button>
      </div>
    )

  const showList = !compact && (sessions.length > 1 || activeGroup.length > 1)
  const anySplit = terms.groups.some((g) => g.length > 1)
  return (
    <div className={cn("flex h-full min-h-0", !visible && "hidden")}>
      <div className="flex min-w-0 flex-1">
        {sessions.map((s) => {
          const shown = activeGroup.includes(s.id)
          const index = activeGroup.indexOf(s.id)
          return (
            <div
              key={s.id}
              onMouseDown={() => terms.setActive(s.id)}
              className={cn("relative min-w-0 flex-1 pt-1 pl-3", !shown && "hidden", index > 0 && "border-l border-border")}
            >
              <Terminal
                ref={(h) => {
                  if (h) handles.current.set(s.id, h)
                  else handles.current.delete(s.id)
                }}
                transport={s.transport}
                fontSize={12}
                className="h-full"
              />
            </div>
          )
        })}
      </div>
      {showList && (
        <ScrollArea className="w-40 shrink-0 border-l border-border">
        <ul aria-label="Terminals" className="flex flex-col gap-px p-1">
          {terms.groups.map((g) =>
            g.map((id, i) => {
              const s = sessions.find((x) => x.id === id)!
              const selected = id === active
              return (
                <li key={id} className="group/term flex h-6 items-center gap-1 rounded-sm pr-0.5 pl-1.5 text-ui-sm hover:bg-secondary data-selected:bg-foreground/6" data-selected={selected || undefined}>
                  <button
                    type="button"
                    onClick={() => terms.setActive(id)}
                    aria-current={selected || undefined}
                    className={cn("flex min-w-0 flex-1 items-center gap-1.5 text-start outline-none focus-visible:underline", selected ? "text-foreground" : "text-muted-foreground")}
                  >
                    {anySplit && <span aria-hidden className="w-2 shrink-0 font-mono text-ui-xs text-muted-foreground">{g.length < 2 ? "" : i === g.length - 1 ? "└" : i === 0 ? "┌" : "├"}</span>}
                    <TerminalSquareIcon className="size-3.5 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Kill ${s.title}`}
                    onClick={() => terms.kill(id)}
                    className="relative flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground opacity-0 after:absolute after:-inset-0.5 outline-none group-hover/term:opacity-100 hover:bg-foreground/8 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <TrashIcon className="size-3" />
                  </button>
                </li>
              )
            })
          )}
        </ul>
        </ScrollArea>
      )}
    </div>
  )
}

/* -------------------------------- problems -------------------------------- */

function ProblemsList({ problems, onOpen }: { problems: Problem[]; onOpen: (p: Problem) => void }) {
  const byFile = React.useMemo(() => {
    const map = new Map<string, Problem[]>()
    for (const p of problems) map.set(p.path, [...(map.get(p.path) ?? []), p])
    return [...map]
  }, [problems])
  if (!problems.length) return <p className="px-4 py-3 text-ui text-muted-foreground">No problems in the workspace.</p>
  return (
    <ScrollArea className="h-full" viewportClassName="px-2 py-1">
      <ul aria-label="Problems" className="flex flex-col">
        {byFile.map(([path, list]) => {
          const kind = getFileKind(basename(path))
          return (
            <li key={path}>
              <div className="flex h-6 items-center gap-1.5 px-1 text-ui">
                <span className={cn("flex size-4 shrink-0 items-center justify-center", kind.className)}>{kind.icon}</span>
                <span className="truncate">{basename(path)}</span>
                <span className="min-w-0 truncate text-ui-xs text-muted-foreground">{rel(dirname(path))}</span>
                <span className="rounded-full bg-secondary px-1.5 text-ui-xs text-muted-foreground tabular-nums">{list.length}</span>
              </div>
              <ul>
                {list.map((p, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => onOpen(p)}
                      className="flex min-h-6 w-full items-center gap-2 rounded-sm py-0.5 pr-2 pl-7 text-start text-ui outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    >
                      <span className={cn("flex size-4 shrink-0 items-center justify-center [&_svg]:size-3.5", SEVERITY[p.severity].className)}>{SEVERITY[p.severity].icon}</span>
                      <span className="min-w-0 flex-1 truncate">{p.message}</span>
                      {p.source && <span className="shrink-0 text-ui-xs text-muted-foreground">{p.source}</span>}
                      <span className="shrink-0 text-ui-xs text-muted-foreground tabular-nums">
                        Ln {p.line}, Col {p.column}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    </ScrollArea>
  )
}

/* --------------------------------- output --------------------------------- */

function OutputLog({ lines }: { lines: OutputLine[] }) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines.length])
  return (
    <ScrollArea className="h-full" viewportRef={ref} viewportClassName="px-4 py-2">
      <ol aria-label="Output" className="font-mono text-ui-sm leading-5">
        {lines.map((l, i) => (
          <li key={i} className={cn("whitespace-pre-wrap", l.level === "error" ? "text-destructive-text" : "text-foreground")}>
            <span className="text-muted-foreground tabular-nums">[{new Date(l.time).toLocaleTimeString([], { hour12: false })}]</span> {l.text}
          </li>
        ))}
      </ol>
    </ScrollArea>
  )
}

/* ---------------------------------- panel --------------------------------- */

/**
 * The bottom panel: Problems, Output and Terminal tabs. Terminals stay mounted
 * while another tab shows, so their screens and shells keep their state.
 */
export function BottomPanel({
  tab,
  onTabChange,
  terms,
  problems,
  output,
  onOpenProblem,
  onClose,
  maximized,
  onToggleMaximize,
  compact = false,
}: {
  tab: PanelTab
  onTabChange: (tab: PanelTab) => void
  terms: Terminals
  problems: Problem[]
  output: OutputLine[]
  onOpenProblem: (p: Problem) => void
  onClose: () => void
  maximized?: boolean
  onToggleMaximize?: () => void
  /** Phone layout (in a bottom sheet): no terminal list or split. */
  compact?: boolean
}) {
  const errors = problems.filter((p) => p.severity === "error").length
  const warnings = problems.filter((p) => p.severity === "warning").length
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-9 shrink-0 items-center gap-1 px-2">
        <TabStrip variant="pill" value={tab} onValueChange={(v) => onTabChange(v as PanelTab)} aria-label="Panel" className="min-w-0 flex-1">
          <TabStripItem value="problems" icon={<AlertCircleIcon />} hint={false}>
            <span className="flex items-center gap-1.5">
              Problems
              {problems.length > 0 && <span className="rounded-full bg-secondary px-1.5 text-ui-xs tabular-nums">{errors + warnings || problems.length}</span>}
            </span>
          </TabStripItem>
          <TabStripItem value="output" icon={<InfoIcon />} hint={false}>
            Output
          </TabStripItem>
          <TabStripItem value="terminal" icon={<TerminalSquareIcon />} hint={false}>
            Terminal
          </TabStripItem>
        </TabStrip>
        {tab === "terminal" && (
          <>
            <IconAction label="New terminal" shortcut="⌃⇧`" size="icon-sm" onClick={() => terms.create()}>
              <PlusIcon />
            </IconAction>
            {!compact && (
              <IconAction label="Split terminal" size="icon-sm" onClick={() => terms.split()} disabled={!terms.sessions.length}>
                <Columns2Icon />
              </IconAction>
            )}
            <IconAction label="Kill terminal" size="icon-sm" onClick={() => terms.active && terms.kill(terms.active)} disabled={!terms.active}>
              <TrashIcon />
            </IconAction>
          </>
        )}
        {onToggleMaximize && (
          <IconAction label={maximized ? "Restore panel size" : "Maximize panel"} size="icon-sm" onClick={onToggleMaximize}>
            {maximized ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </IconAction>
        )}
        <IconAction label="Close panel" shortcut="⌃`" size="icon-sm" onClick={onClose}>
          <XIcon />
        </IconAction>
      </div>
      <div className="min-h-0 flex-1">
        <TerminalArea terms={terms} visible={tab === "terminal"} compact={compact} />
        {tab === "problems" && <ProblemsList problems={problems} onOpen={onOpenProblem} />}
        {tab === "output" && <OutputLog lines={output} />}
      </div>
    </div>
  )
}
