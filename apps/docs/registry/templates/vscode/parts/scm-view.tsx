"use client"

import * as React from "react"

import { CheckIcon, GitBranchIcon, UndoIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import { getFileKind } from "@paneui/ui/components/file-tree"
import { ScrollArea } from "@paneui/ui/components/scroll-area"
import { Textarea } from "@paneui/ui/components/textarea"

import { IconAction, SectionLabel, SidebarHeader } from "./sidebar-header"
import { abs, basename, dirname, type Workspace } from "./workspace"

const STATUS: Record<"M" | "A" | "D", { label: string; className: string }> = {
  M: { label: "Modified", className: "text-warning-text" },
  A: { label: "Added", className: "text-success-text" },
  D: { label: "Deleted", className: "text-destructive-text" },
}

/**
 * Source control view: files changed since the last commit, a message field
 * and a commit button. Commits are local snapshots kept with the workspace.
 */
export function ScmView({
  ws,
  branch,
  onOpen,
  onCommitted,
}: {
  ws: Workspace
  branch: string
  onOpen: (path: string) => void
  onCommitted: (message: string, count: number) => void
}) {
  const version = React.useSyncExternalStore((cb) => ws.subscribe(cb), ws.getVersion, ws.getVersion)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `version` is the workspace's change counter
  const changes = React.useMemo(() => ws.changes(), [ws, version])
  const [message, setMessage] = React.useState("")

  const commit = () => {
    if (!changes.length || !message.trim()) return
    ws.commit()
    onCommitted(message.trim(), changes.length)
    setMessage("")
  }

  return (
    <div className="flex h-full min-w-0 flex-col">
      <SidebarHeader title="Source control">
        <IconAction label="Commit" shortcut="⌘↵" onClick={commit} disabled={!changes.length || !message.trim()}>
          <CheckIcon />
        </IconAction>
      </SidebarHeader>
      <div className="flex shrink-0 flex-col gap-2 px-3 pb-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              commit()
            }
          }}
          placeholder={`Message (⌘↵ to commit on ${branch})`}
          aria-label="Commit message"
          rows={2}
          className="min-h-14"
        />
        <Button className="w-full" disabled={!changes.length || !message.trim()} onClick={commit}>
          <CheckIcon data-icon="inline-start" />
          Commit
        </Button>
      </div>

      <SectionLabel count={changes.length}>Changes</SectionLabel>
      <ScrollArea className="min-h-0 flex-1" viewportClassName="px-2 pb-3">
        {changes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <GitBranchIcon className="size-5 text-muted-foreground" />
            <p className="text-ui text-pretty text-muted-foreground">No changes since the last commit.</p>
          </div>
        ) : (
          <ul aria-label="Changes" className="flex flex-col">
            {changes.map((c) => {
              const path = abs(c.path)
              const kind = getFileKind(basename(path))
              const status = STATUS[c.status]
              return (
                <li key={c.path} className="group/change flex h-6 items-center gap-1.5 rounded-sm pr-1 pl-1 hover:bg-secondary">
                  <button
                    type="button"
                    disabled={c.status === "D"}
                    onClick={() => onOpen(path)}
                    className="flex min-w-0 flex-1 items-center gap-1.5 text-start text-ui outline-none focus-visible:underline disabled:cursor-default"
                  >
                    <span className={cn("flex size-4 shrink-0 items-center justify-center", kind.className)}>{kind.icon}</span>
                    <span className={cn("truncate", c.status === "D" && "text-muted-foreground line-through")}>{basename(path)}</span>
                    <span className="min-w-0 flex-1 truncate text-ui-xs text-muted-foreground">{c.path.includes("/") ? dirname(c.path) : ""}</span>
                  </button>
                  <span className="opacity-0 transition-opacity duration-150 group-focus-within/change:opacity-100 group-hover/change:opacity-100 pointer-coarse:opacity-100">
                    <IconAction label="Discard changes" onClick={() => ws.discard(path)}>
                      <UndoIcon className="rtl:-scale-x-100" />
                    </IconAction>
                  </span>
                  <span title={status.label} className={cn("w-3 shrink-0 text-center font-mono text-ui-xs font-medium", status.className)}>
                    {c.status}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  )
}
