"use client"

import * as React from "react"
import type * as acp from "@agentclientprotocol/sdk"

import { CheckIcon, CopyIcon, CornerDownRightIcon, GitBranchIcon, PinIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { ActionSwapBlurIcon } from "@paneui/ui/components/action-swap-blur"
import { EditedFilesCard } from "@paneui/ui/components/edited-files-card"
import { ResponseMarkdown } from "@paneui/ui/components/streaming-response"
import { Terminal, TerminalOutput } from "@paneui/ui/components/terminal-view"
import { ToolApproval, type ToolApprovalDecision } from "@paneui/ui/components/tool-approval"
import { MessageAction, MessageActions } from "@paneui/ui/components/message"
import { WorkSummary, WorkSummaryStep, WorkSummaryThought, type WorkStepKind } from "@paneui/ui/components/work-summary"

import type { AcpClient, ClientState, SessionState, TimelineItem, ToolCallState } from "../acp/client"

const time = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })

function relPath(path: string, cwd: string) {
  return cwd && path.startsWith(cwd) ? path.slice(cwd.length).replace(/^\//, "") : path
}

function stepDetail(tc: ToolCallState, cwd: string) {
  const input = tc.rawInput as { command?: string } | undefined
  if (tc.kind === "execute" && input?.command) return null
  const loc = tc.locations?.[0]?.path
  if (loc && !tc.title.includes(loc.split("/").pop() ?? "")) return relPath(loc, cwd)
  const diff = tc.content?.find((c) => c.type === "diff")
  if (diff && diff.type === "diff") {
    const added = diff.newText.split("\n").length
    return diff.oldText == null ? `new file · ${added} lines` : null
  }
  return null
}

function StepBody({ tc, terminals }: { tc: ToolCallState; terminals: ClientState["terminals"] }) {
  const parts: React.ReactNode[] = []
  for (const [i, c] of (tc.content ?? []).entries()) {
    if (c.type === "terminal") {
      const t = terminals[c.terminalId]
      if (t?.output)
        parts.push(
          <Terminal key={i} variant="embedded">
            <TerminalOutput text={t.output} className="max-h-40" />
          </Terminal>
        )
    } else if (c.type === "content" && c.content.type === "text" && c.content.text) {
      parts.push(
        <Terminal key={i} variant="embedded">
          <TerminalOutput text={c.content.text} className="max-h-32" />
        </Terminal>
      )
    }
  }
  if (!parts.length) return null
  return <div className="flex flex-col gap-1.5 pb-1">{parts}</div>
}

function WorkGroup({
  item,
  session,
  terminals,
}: {
  item: Extract<TimelineItem, { kind: "work" }>
  session: SessionState
  terminals: ClientState["terminals"]
}) {
  const running = item.endedAt === undefined && session.status === "working"
  const duration = ((item.endedAt ?? Date.now()) - item.startedAt) / 1000
  return (
    <WorkSummary running={running} startedAt={item.startedAt} duration={duration}>
      {item.thoughts && (
        <WorkSummaryThought>{item.thoughts}</WorkSummaryThought>
      )}
      {item.toolCallIds.map((id) => {
        const tc = session.toolCalls[id]
        if (!tc) return null
        const command = (tc.rawInput as { command?: string } | undefined)?.command
        return (
          <WorkSummaryStep
            key={id}
            kind={(tc.kind ?? "other") as WorkStepKind}
            status={tc.status ?? "completed"}
            title={tc.title}
            detail={command && !tc.title.includes(command) ? command : stepDetail(tc, session.cwd)}
          >
            <StepBody tc={tc} terminals={terminals} />
          </WorkSummaryStep>
        )
      })}
    </WorkSummary>
  )
}

function AssistantMessage({ item, onFork }: { item: Extract<TimelineItem, { kind: "assistant" }>; onFork: () => void }) {
  const [copied, setCopied] = React.useState(false)
  const [pinned, setPinned] = React.useState(false)
  return (
    <div className="group/msg flex flex-col gap-1.5">
      <ResponseMarkdown text={item.text} caret={item.streaming} />
      {!item.streaming && (
        <MessageActions visible className="-ml-1.5 mt-0">
          <MessageAction
            label={copied ? "Copied" : "Copy"}
            onClick={() => {
              void navigator.clipboard?.writeText(item.text)
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1400)
            }}
          >
            <ActionSwapBlurIcon value={copied ? "copied" : "copy"} className="size-3.5">
              {copied ? <CheckIcon /> : <CopyIcon />}
            </ActionSwapBlurIcon>
          </MessageAction>
          <MessageAction label="Branch into a new thread" onClick={onFork}>
            <GitBranchIcon />
          </MessageAction>
          <MessageAction label={pinned ? "Unpin" : "Pin"} aria-pressed={pinned} onClick={() => setPinned((p) => !p)}>
            <PinIcon />
          </MessageAction>
          <time className="ml-1.5 text-ui-xs text-muted-foreground tabular-nums">{time(item.at)}</time>
        </MessageActions>
      )}
    </div>
  )
}

const DECISION: Record<ToolApprovalDecision, acp.PermissionOptionKind[]> = {
  once: ["allow_once"],
  always: ["allow_always", "allow_once"],
  deny: ["reject_once", "reject_always"],
}

function Permission({ item, onResolve }: { item: Extract<TimelineItem, { kind: "permission" }>; onResolve: (optionId: string | null) => void }) {
  const chosen = item.options.find((o) => o.optionId === item.outcome)
  const decision: ToolApprovalDecision | null = chosen
    ? chosen.kind === "allow_always"
      ? "always"
      : chosen.kind === "allow_once"
        ? "once"
        : "deny"
    : item.outcome === "cancelled"
      ? "deny"
      : null
  const diff = item.toolCall.content?.find((c) => c.type === "diff")
  const command = (item.toolCall.rawInput as { command?: string } | undefined)?.command
  return (
    <ToolApproval
      tool={item.toolCall.kind ?? "tool"}
      title={item.toolCall.title ?? "Allow this action?"}
      description={item.outcome === "cancelled" ? "Cancelled with the turn." : undefined}
      risk={item.toolCall.kind === "execute" || item.toolCall.kind === "delete" ? "high" : "medium"}
      args={command ?? (diff && diff.type === "diff" ? diff.path : item.toolCall.rawInput)}
      argsLanguage={command ? "bash" : undefined}
      revocable={false}
      allowAlways={item.options.some((o) => o.kind === "allow_always")}
      status={
        item.toolCall.status === "in_progress"
          ? "running"
          : item.toolCall.status === "completed"
            ? "done"
            : item.toolCall.status === "failed"
              ? "failed"
              : undefined
      }
      decision={decision}
      onDecisionChange={(d) => {
        if (!d || item.outcome !== undefined) return
        const option = DECISION[d].map((k) => item.options.find((o) => o.kind === k)).find(Boolean)
        onResolve(option?.optionId ?? null)
      }}
    />
  )
}

/** Renders a session's timeline: work summaries, messages, approvals and edited-files cards. */
export function Timeline({
  session,
  terminals,
  client,
  onReview,
  onFork,
  onReveal,
}: {
  session: SessionState
  terminals: ClientState["terminals"]
  client: AcpClient
  onReview: (files: Extract<TimelineItem, { kind: "edits" }>["files"]) => void
  onFork: (text: string) => void
  onReveal: (path: string) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      {session.timeline.map((item) => {
        switch (item.kind) {
          case "user":
            return (
              <div key={item.id} className="flex flex-col items-end gap-1.5">
                {item.steering && (
                  <span className="flex items-center gap-1.5 text-ui text-muted-foreground">
                    <CornerDownRightIcon className="size-3.5 rtl:-scale-x-100" />
                    Steering conversation
                  </span>
                )}
                <div className="max-w-4/5 rounded-2xl bg-secondary px-3.5 py-2 text-ui-lg leading-relaxed text-pretty whitespace-pre-wrap">
                  {item.text}
                </div>
              </div>
            )
          case "assistant":
            return <AssistantMessage key={item.id} item={item} onFork={() => onFork(item.text)} />
          case "work":
            return <WorkGroup key={item.id} item={item} session={session} terminals={terminals} />
          case "edits":
            return (
              <div key={item.id} className="flex flex-col gap-1.5">
                <EditedFilesCard
                  files={item.files.map((f) => ({ path: relPath(f.path, session.cwd), oldText: f.oldText, newText: f.newText }))}
                  title={item.undone ? `Reverted ${item.files.length} ${item.files.length === 1 ? "file" : "files"}` : undefined}
                  onUndo={item.undone ? undefined : () => void client.undoEdits(session.id, item.id)}
                  onReview={() => onReview(item.files)}
                  onRevealFile={onReveal}
                />
                <MessageActions visible className="-ml-1.5 mt-0">
                  <MessageAction label="Copy file list" onClick={() => void navigator.clipboard?.writeText(item.files.map((f) => f.path).join("\n"))}>
                    <CopyIcon />
                  </MessageAction>
                  <MessageAction label="Branch into a new thread" onClick={() => onFork("")}>
                    <GitBranchIcon />
                  </MessageAction>
                  <MessageAction label="Pin">
                    <PinIcon />
                  </MessageAction>
                  <time className="ml-1.5 text-ui-xs text-muted-foreground tabular-nums">{time(item.at)}</time>
                </MessageActions>
              </div>
            )
          case "permission":
            return <Permission key={item.id} item={item} onResolve={(optionId) => client.resolvePermission(session.id, item.id, optionId)} />
          case "notice":
            return (
              <p key={item.id} role={item.tone === "error" ? "alert" : undefined} className={cn("text-ui", item.tone === "error" ? "text-destructive-text" : "text-muted-foreground")}>
                {item.text}
              </p>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
