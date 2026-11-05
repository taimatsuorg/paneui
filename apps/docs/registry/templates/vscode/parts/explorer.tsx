"use client"

import * as React from "react"

import { FileIcon, FolderIcon, ListCollapseIcon, RefreshIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@paneui/ui/components/context-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@paneui/ui/components/dialog"
import { FileTree, type FileTreeNode } from "@paneui/ui/components/file-tree"
import { Input } from "@paneui/ui/components/input"
import { ScrollArea } from "@paneui/ui/components/scroll-area"

import { IconAction, SidebarHeader, SectionLabel } from "./sidebar-header"
import { basename, dirname, normalize, rel, ROOT, type Workspace } from "./workspace"

type Status = "M" | "A" | "D"

const STATUS_CLASS: Record<Status, string> = {
  M: "text-warning-text",
  A: "text-success-text",
  D: "text-destructive-text",
}

/** Trailing slot of a row: its source-control letter, plus the path the context menu reads. */
function RowMeta({ path, status, dirty, folder }: { path: string; status?: Status; dirty?: boolean; folder?: boolean }) {
  return (
    <span data-path={path} className="flex items-center gap-1.5">
      {dirty && <span aria-label="Unsaved changes" className="size-1.5 rounded-full bg-foreground/50" />}
      {status &&
        (folder ? (
          <span aria-label="Contains changes" className={cn("flex w-2.5 justify-center", STATUS_CLASS[status])}>
            <span className="size-1.5 rounded-full bg-current" />
          </span>
        ) : (
          <span className={cn("w-2.5 text-center font-mono text-ui-xs font-medium", STATUS_CLASS[status])}>{status}</span>
        ))}
    </span>
  )
}

function buildTree(ws: Workspace, changes: Map<string, Status>, dirty: Set<string>): FileTreeNode[] {
  const byDir = new Map<string, FileTreeNode[]>()
  const push = (dir: string, node: FileTreeNode) => byDir.set(dir, [...(byDir.get(dir) ?? []), node])
  const folderStatus = (dir: string) => {
    for (const [p, s] of changes) if (p.startsWith(`${dir}/`) && s !== "D") return "M" as const
    return undefined
  }
  for (const d of ws.listDirs()) push(dirname(d), { value: d, name: basename(d), type: "folder", meta: <RowMeta path={d} status={folderStatus(d)} folder /> })
  for (const f of ws.listFiles())
    push(dirname(f), {
      value: f,
      name: basename(f),
      type: "file",
      meta: <RowMeta path={f} status={changes.get(f)} dirty={dirty.has(f)} />,
      className: changes.get(f) === "A" ? "text-success-text" : changes.get(f) === "M" ? "text-warning-text" : undefined,
    })
  const build = (dir: string): FileTreeNode[] =>
    (byDir.get(dir) ?? [])
      .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "folder" ? -1 : 1))
      .map((n) => (n.type === "folder" ? { ...n, children: build(n.value) } : n))
  return build(ROOT)
}

type Edit = { kind: "file" | "folder" | "rename"; parent: string; target?: string }

export type ExplorerHandle = {
  create: (kind: "file" | "folder") => void
  reveal: (path: string) => void
}

/**
 * Explorer view: the workspace tree with new file / folder, rename, delete and
 * a context menu on every row (or long-press on touch). New names are typed in
 * a field above the tree; a name with slashes creates the folders on the way.
 */
export function Explorer({
  ws,
  selected,
  onSelect,
  onOpen,
  onRenamed,
  onDeleted,
  onOpenTerminal,
  changes,
  dirty,
  handleRef,
}: {
  ws: Workspace
  selected: string | null
  onSelect: (path: string) => void
  onOpen: (path: string) => void
  onRenamed: (from: string, to: string) => void
  onDeleted: (path: string) => void
  onOpenTerminal: (dir: string) => void
  changes: Map<string, Status>
  dirty: Set<string>
  handleRef?: React.Ref<ExplorerHandle>
}) {
  const version = React.useSyncExternalStore((cb) => ws.subscribe(cb), ws.getVersion, ws.getVersion)
  const items = React.useMemo(
    () => buildTree(ws, changes, dirty),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `version` is the workspace's change counter
    [ws, version, changes, dirty]
  )
  const [expanded, setExpanded] = React.useState<string[]>([`${ROOT}/src`, `${ROOT}/src/components`])
  const [edit, setEdit] = React.useState<Edit | null>(null)
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [menuTarget, setMenuTarget] = React.useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Open the folders above the selection (a file opened from search or quick open).
  React.useEffect(() => {
    if (!selected?.startsWith(`${ROOT}/`)) return
    const ancestors: string[] = []
    for (let d = dirname(selected); d !== ROOT && d.startsWith(ROOT); d = dirname(d)) ancestors.push(d)
    if (ancestors.length) setExpanded((e) => (ancestors.every((a) => e.includes(a)) ? e : [...new Set([...e, ...ancestors])]))
  }, [selected])

  const folderOf = (path: string | null) => (!path ? ROOT : ws.isDir(path) ? path : dirname(path))

  const start = (kind: Edit["kind"], target: string | null) => {
    if (kind === "rename") {
      if (!target || target === ROOT) return
      setEdit({ kind, parent: dirname(target), target })
      setName(basename(target))
    } else {
      const parent = folderOf(target)
      if (parent !== ROOT) setExpanded((e) => [...new Set([...e, parent])])
      setEdit({ kind, parent })
      setName("")
    }
    setError(null)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      if (kind === "rename") {
        const dot = basename(target!).lastIndexOf(".")
        inputRef.current?.setSelectionRange(0, dot > 0 ? dot : basename(target!).length)
      }
    })
  }

  React.useImperativeHandle(handleRef, () => ({
    create: (kind) => start(kind, selected),
    reveal: (path) => onSelect(path),
  }))

  const validate = (value: string) => {
    const v = value.trim()
    if (!v) return "Enter a name."
    if (v.startsWith("/") || v.split("/").some((s) => s === "." || s === "..")) return "Use a name inside this folder."
    const dest = normalize(`${edit!.parent}/${v}`)
    if (dest !== edit!.target && ws.exists(dest)) return `${v} already exists here.`
    return null
  }

  const commit = () => {
    if (!edit) return
    const problem = validate(name)
    if (problem) return setError(problem)
    const dest = normalize(`${edit.parent}/${name.trim()}`)
    try {
      if (edit.kind === "file") {
        ws.writeFile(dest, "")
        onSelect(dest)
        onOpen(dest)
      } else if (edit.kind === "folder") {
        ws.mkdir(dest)
        setExpanded((e) => [...new Set([...e, dest])])
        onSelect(dest)
      } else if (edit.target && dest !== edit.target) {
        ws.rename(edit.target, dest)
        onRenamed(edit.target, dest)
        setExpanded((e) => e.map((p) => (p === edit.target || p.startsWith(`${edit.target}/`) ? dest + p.slice(edit.target!.length) : p)))
        onSelect(dest)
      }
      setEdit(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const remove = (path: string) => {
    ws.rm(path, { recursive: true })
    onDeleted(path)
    setConfirmDelete(null)
  }

  const copy = (text: string) => void navigator.clipboard?.writeText(text).catch(() => undefined)

  const target = menuTarget ?? ROOT
  const targetIsRoot = target === ROOT
  const targetName = basename(confirmDelete ?? "")
  const targetIsDir = confirmDelete ? ws.isDir(confirmDelete) : false

  return (
    <div className="flex h-full min-w-0 flex-col">
      <SidebarHeader title="Explorer">
        <IconAction label="New file…" onClick={() => start("file", selected)}>
          <FileIcon />
        </IconAction>
        <IconAction label="New folder…" onClick={() => start("folder", selected)}>
          <FolderIcon />
        </IconAction>
        <IconAction label="Refresh" onClick={() => setExpanded((e) => [...e])}>
          <RefreshIcon />
        </IconAction>
        <IconAction label="Collapse folders" onClick={() => setExpanded([])}>
          <ListCollapseIcon />
        </IconAction>
      </SidebarHeader>

      <SectionLabel>{ws.name}</SectionLabel>

      {edit && (
        <form
          className="flex shrink-0 flex-col gap-1 px-2 pb-1.5"
          onSubmit={(e) => {
            e.preventDefault()
            commit()
          }}
        >
          <label htmlFor="explorer-name" className="truncate px-0.5 text-ui-xs text-muted-foreground">
            {edit.kind === "rename" ? "Rename" : edit.kind === "file" ? "New file" : "New folder"} in {rel(edit.parent) || ws.name}
          </label>
          <Input
            id="explorer-name"
            ref={inputRef}
            value={name}
            aria-invalid={!!error || undefined}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            onBlur={() => !name.trim() && setEdit(null)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault()
                setEdit(null)
              }
            }}
            placeholder={edit.kind === "folder" ? "folder-name" : "file-name.ts"}
            className="h-7"
          />
          {error && (
            <p role="alert" className="px-0.5 text-ui-xs text-destructive-text">
              {error}
            </p>
          )}
        </form>
      )}

      <ContextMenu>
        <ContextMenuTrigger
          className="flex min-h-0 flex-1 flex-col"
          onContextMenuCapture={(e: React.MouseEvent) => {
            const row = (e.target as HTMLElement).closest('[data-slot="file-tree-item"]')
            const path = row?.querySelector<HTMLElement>("[data-path]")?.dataset.path ?? null
            setMenuTarget(path)
            if (path) onSelect(path)
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (!selected || edit) return
            if (e.key === "F2" || (e.key === "Enter" && e.altKey)) {
              e.preventDefault()
              start("rename", selected)
            } else if (e.key === "Delete" || (e.key === "Backspace" && (e.metaKey || e.ctrlKey))) {
              e.preventDefault()
              setConfirmDelete(selected)
            }
          }}
        >
          <ScrollArea className="min-h-0 flex-1" viewportClassName="pb-3">
            <FileTree
              items={items}
              value={selected}
              onValueChange={(v) => onSelect(v)}
              onOpenFile={(n) => onOpen(n.value)}
              expanded={expanded}
              onExpandedChange={setExpanded}
              size="sm"
              label="Workspace files"
            />
            {items.length === 0 && <p className="px-2 py-6 text-center text-ui text-muted-foreground">This folder is empty.</p>}
          </ScrollArea>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={() => start("file", target)}>New file…</ContextMenuItem>
          <ContextMenuItem onClick={() => start("folder", target)}>New folder…</ContextMenuItem>
          <ContextMenuItem onClick={() => onOpenTerminal(folderOf(target))}>Open in terminal</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => copy(target)}>Copy path</ContextMenuItem>
          <ContextMenuItem onClick={() => copy(rel(target) || ".")}>Copy relative path</ContextMenuItem>
          {!targetIsRoot && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => start("rename", target)}>
                Rename…
                <ContextMenuShortcut>F2</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem variant="destructive" onClick={() => setConfirmDelete(target)}>
                Delete
                <ContextMenuShortcut>⌦</ContextMenuShortcut>
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <Dialog open={confirmDelete !== null} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {targetName}?</DialogTitle>
            <DialogDescription>
              {targetIsDir ? "The folder and everything in it will be removed." : "The file will be removed."} Source control can bring back committed files.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => confirmDelete && remove(confirmDelete)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
