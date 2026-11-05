"use client"

import * as React from "react"

import {
  CodeIcon,
  FileIcon,
  FolderIcon,
  GitBranchIcon,
  GridIcon,
  MenuIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PanelBottomIcon,
  RefreshIcon,
  SearchIcon,
  SettingsIcon,
  SidebarIcon,
  TerminalSquareIcon,
  WarningIcon,
} from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { CommandPalette, type CommandPaletteItem } from "@paneui/ui/blocks/command-palette/command-palette"
import { BottomSheet, BottomSheetContent, BottomSheetTitle } from "@paneui/ui/components/bottom-sheet"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@paneui/ui/components/breadcrumb"
import { Button } from "@paneui/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@paneui/ui/components/dialog"
import { Drawer, DrawerContent, DrawerTitle } from "@paneui/ui/components/drawer"
import { getFileKind } from "@paneui/ui/components/file-tree"
import { Kbd } from "@paneui/ui/components/kbd"
import { SidebarRail, SidebarRailGroup, SidebarRailItem, SidebarRailSpacer } from "@paneui/ui/components/animated-sidebar"
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuShortcut, MenuTrigger } from "@paneui/ui/components/menu"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  type ResizablePanelGroupHandle,
} from "@paneui/ui/components/resizable"
import { TabStrip, TabStripItem } from "@paneui/ui/components/tab-strip"
import { useThemeToggle } from "@paneui/ui/components/theme-toggle"
import { TooltipProvider } from "@paneui/ui/components/tooltip"

import { BottomPanel, type OutputLine, type PanelTab } from "./parts/bottom-panel"
import { CodeEditor, type CodeEditorHandle, type Problem } from "./parts/code-editor"
import { Docs } from "./parts/buffers"
import { Explorer, type ExplorerHandle } from "./parts/explorer"
import { ExtensionsView } from "./parts/extensions-view"
import type { HostCommand, VsCodeHost } from "./parts/host"
import { languageOf } from "./parts/languages"
import { ScmView } from "./parts/scm-view"
import { SearchView } from "./parts/search-view"
import { IconAction } from "./parts/sidebar-header"
import { StatusLine } from "./parts/status-line"
import { useTerminals } from "./parts/terminals"
import { abs, basename, dirname, rel, Workspace } from "./parts/workspace"

type View = "explorer" | "search" | "scm" | "extensions"
type Session = { tabs: string[]; active: string | null; view: View }

const SESSION_KEY = "vscode-template:session"
const BRANCH = "main"
const DEFAULT_TABS = [abs("src/App.tsx"), abs("src/hooks/useTasks.ts")]
const MOBILE_QUERY = "(max-width: 767.98px)"

function useIsMobile() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(MOBILE_QUERY)
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    },
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  )
}

function loadSession(ws: Workspace): Session {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as Session | null
    if (s) {
      const tabs = s.tabs.filter((p) => ws.exists(p) && !ws.isDir(p))
      return { tabs, active: s.active && tabs.includes(s.active) ? s.active : (tabs[0] ?? null), view: s.view ?? "explorer" }
    }
  } catch {
    /* ignore a broken session */
  }
  return { tabs: DEFAULT_TABS, active: DEFAULT_TABS[0], view: "explorer" }
}

const VIEWS: { id: View; label: string; shortcut: string; icon: React.ReactNode }[] = [
  { id: "explorer", label: "Explorer", shortcut: "⇧⌘E", icon: <FolderIcon /> },
  { id: "search", label: "Search", shortcut: "⇧⌘F", icon: <SearchIcon /> },
  { id: "scm", label: "Source control", shortcut: "⌃⇧G", icon: <GitBranchIcon /> },
  { id: "extensions", label: "Extensions", shortcut: "⇧⌘X", icon: <GridIcon /> },
]

/**
 * A desktop code editor on an in-browser workspace: an activity rail, a
 * resizable sidebar (explorer, search, source control, extensions), editor
 * tabs with breadcrumbs, a bottom panel with terminals, problems and output,
 * and a status bar. The explorer, the editor and every local terminal share
 * one file system, saved in this browser. `?pty=ws://…` connects new
 * terminals to a real shell instead. Below `md` the sidebar becomes a drawer
 * and the panel a bottom sheet. A `host` (a desktop shell) adds folders on
 * disk, real terminals, a native menu and a draggable title bar.
 */
export function VsCodeApp({ host }: { host?: VsCodeHost } = {}) {
  const [stores, setStores] = React.useState<{ ws: Workspace; docs: Docs } | null>(null)
  React.useEffect(() => {
    const ws = new Workspace()
    setStores({ ws, docs: new Docs(ws) })
  }, [])
  if (!stores) return <div className="h-dvh w-full bg-shell" />
  return <Shell ws={stores.ws} docs={stores.docs} host={host} />
}

function Shell({ ws, docs, host }: { ws: Workspace; docs: Docs; host?: VsCodeHost }) {
  const initial = React.useMemo(() => loadSession(ws), [ws])
  const mobile = useIsMobile()
  const { theme, toggle: toggleTheme } = useThemeToggle()
  const wsVersion = React.useSyncExternalStore((cb) => ws.subscribe(cb), ws.getVersion, ws.getVersion)
  const docsVersion = React.useSyncExternalStore((cb) => docs.subscribe(cb), docs.getVersion, docs.getVersion)

  const [tabs, setTabs] = React.useState<string[]>(initial.tabs)
  const [active, setActive] = React.useState<string | null>(initial.active)
  const [selected, setSelected] = React.useState<string | null>(initial.active)
  const [view, setView] = React.useState<View>(initial.view)
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [panelOpen, setPanelOpen] = React.useState(true)
  const [panelTab, setPanelTab] = React.useState<PanelTab>("terminal")
  const [maximized, setMaximized] = React.useState<number[] | null>(null)
  const [palette, setPalette] = React.useState<null | "commands" | "files">(null)
  const [cursor, setCursor] = React.useState<{ line: number; column: number; selected: number } | null>(null)
  const [problems, setProblems] = React.useState<Problem[]>([])
  const [output, setOutput] = React.useState<OutputLine[]>([])
  const [confirmClose, setConfirmClose] = React.useState<string | null>(null)
  const [confirmReset, setConfirmReset] = React.useState(false)
  const [navOpen, setNavOpen] = React.useState(false)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [ptyUrl] = React.useState(() => new URLSearchParams(window.location.search).get("pty"))

  const outer = React.useRef<ResizablePanelGroupHandle>(null)
  const inner = React.useRef<ResizablePanelGroupHandle>(null)
  const editorRef = React.useRef<CodeEditorHandle>(null)
  const explorerRef = React.useRef<ExplorerHandle>(null)
  const pendingReveal = React.useRef<{ path: string; line: number; column: number; endColumn: number } | null>(null)

  const log = React.useCallback((text: string, level?: OutputLine["level"]) => {
    setOutput((o) => [...o.slice(-499), { time: Date.now(), text, level }])
  }, [])

  /* -------------------------------- files --------------------------------- */

  const openFile = React.useCallback(
    (path: string, at?: { line: number; column: number; length?: number }) => {
      if (!ws.exists(path) || ws.isDir(path)) return
      docs.open(path)
      setTabs((t) => (t.includes(path) ? t : [...t, path]))
      setActive(path)
      setSelected(path)
      setNavOpen(false)
      if (at) pendingReveal.current = { path, line: at.line, column: at.column, endColumn: at.column + (at.length ?? 0) }
    },
    [ws, docs]
  )

  // Reveal a search hit or problem once its model is in the editor.
  React.useEffect(() => {
    const r = pendingReveal.current
    if (!r || r.path !== active) return
    pendingReveal.current = null
    const id = requestAnimationFrame(() => editorRef.current?.reveal(r.line, r.column, r.line, r.endColumn))
    return () => cancelAnimationFrame(id)
  })

  const removeTabs = React.useCallback((gone: string[]) => {
    if (!gone.length) return
    setTabs((t) => {
      const next = t.filter((p) => !gone.includes(p))
      setActive((a) => (a && gone.includes(a) ? (next[Math.max(0, t.indexOf(a) - 1)] ?? next[0] ?? null) : a))
      return next
    })
  }, [])

  const closeTab = (path: string, force = false) => {
    if (!force && docs.isDirty(path)) return setConfirmClose(path)
    docs.close(path)
    removeTabs([path])
  }

  const save = React.useCallback(
    (path = active) => {
      if (!path || !docs.has(path)) return
      docs.save(path)
      log(`Saved ${rel(path)}`)
    },
    [active, docs, log]
  )

  const saveAll = () => {
    const dirty = docs.dirtyPaths()
    dirty.forEach((p) => docs.save(p))
    if (dirty.length) log(`Saved ${dirty.length} ${dirty.length === 1 ? "file" : "files"}`)
  }

  // Keep buffers and tabs in step with the disk (terminal commands, deletes).
  React.useEffect(() => ws.subscribe(() => removeTabs(docs.sync())), [ws, docs, removeTabs])

  // Open buffers for the restored tabs.
  React.useEffect(() => {
    tabs.forEach((p) => docs.open(p))
  }, [tabs, docs])

  React.useEffect(() => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ tabs, active, view } satisfies Session))
    } catch {
      /* storage blocked */
    }
  }, [tabs, active, view])

  const changes = React.useMemo(
    () => new Map(ws.changes().map((c) => [abs(c.path), c.status] as const)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `wsVersion` is the workspace's change counter
    [ws, wsVersion]
  )
  const dirty = React.useMemo(
    () => new Set(docs.dirtyPaths()),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the versions are the stores' change counters
    [docs, docsVersion, wsVersion]
  )

  /* ------------------------------ terminals ------------------------------- */

  const terms = useTerminals({ ws, ptyUrl, host, onOpenFile: openFile })
  const started = React.useRef(false)
  React.useEffect(() => {
    if (started.current) return
    started.current = true
    terms.create()
    log(ws.restored ? `Restored ${ws.name} from this browser (${ws.listFiles().length} files)` : `Created ${ws.name} from the starter project`)
    log(host?.terminal ? "Terminals run your shell" : ptyUrl ? `Terminals connect to ${ptyUrl}` : "Terminals run a local shell on the workspace files")
  }, [terms, log, ws, ptyUrl, host])

  /* ------------------------------- folders -------------------------------- */

  const showFiles = (paths: string[]) => {
    docs.clear()
    paths.forEach((p) => docs.open(p))
    setTabs(paths)
    setActive(paths[0] ?? null)
    setSelected(paths[0] ?? null)
  }

  const openFolder = async () => {
    if (!host?.openFolder || !host.fs) return
    const unsaved = docs.dirtyPaths().length
    let folder
    try {
      folder = await host.openFolder()
    } catch (e) {
      return log(`Couldn’t open the folder: ${e instanceof Error ? e.message : String(e)}`, "error")
    }
    if (!folder) return
    ws.mount(folder, host.fs, (e) => log(`Couldn’t write to disk: ${e instanceof Error ? e.message : String(e)}`, "error"))
    const readme = ["README.md", "readme.md", "package.json"].map(abs).find((p) => ws.exists(p))
    showFiles(readme ? [readme] : [])
    const count = ws.listFiles().length
    log(`Opened ${folder.name} (${count} ${count === 1 ? "file" : "files"}${folder.skipped ? `, ${folder.skipped} skipped` : ""})`)
    if (unsaved) log(`Discarded unsaved changes in ${unsaved} ${unsaved === 1 ? "file" : "files"}`)
    terms.create()
  }

  const closeFolder = async () => {
    if (!ws.mounted) return
    await host?.closeFolder?.()
    ws.unmount()
    showFiles(DEFAULT_TABS.filter((p) => ws.exists(p)))
    log(`Back to ${ws.name}`)
  }

  // Changes on disk from outside the editor.
  React.useEffect(() => host?.onChanges?.((changes) => ws.mounted && ws.applyExternal(changes)), [host, ws])

  /* ------------------------------- layout --------------------------------- */

  const showSidebar = (v: View) => {
    setView(v)
    if (mobile) setNavOpen(true)
    else outer.current?.expand("sidebar")
  }
  const toggleView = (v: View) => {
    if (!mobile && v === view && sidebarOpen) outer.current?.collapse("sidebar")
    else showSidebar(v)
  }
  const toggleSidebar = () => (mobile ? setNavOpen((o) => !o) : outer.current?.toggle("sidebar"))
  const showPanel = (tab: PanelTab) => {
    setPanelTab(tab)
    if (mobile) setSheetOpen(true)
    else inner.current?.expand("panel")
  }
  const togglePanel = () => (mobile ? setSheetOpen((o) => !o) : inner.current?.toggle("panel"))
  const closePanel = () => (mobile ? setSheetOpen(false) : inner.current?.collapse("panel"))
  const toggleMaximize = () => {
    const g = inner.current
    if (!g) return
    if (maximized) {
      g.setSizes(maximized)
      setMaximized(null)
    } else {
      setMaximized(g.getSizes())
      g.setSizes([12, 88])
    }
  }
  const newTerminal = (cwd?: string) => {
    terms.create(cwd)
    showPanel("terminal")
  }
  const createInExplorer = (kind: "file" | "folder") => {
    showSidebar("explorer")
    requestAnimationFrame(() => requestAnimationFrame(() => explorerRef.current?.create(kind)))
  }
  const openProblem = (p: Problem) => {
    openFile(p.path, { line: p.line, column: p.column, length: p.endLine === p.line ? p.endColumn - p.column : 0 })
    if (mobile) setSheetOpen(false)
  }

  /* ------------------------------ shortcuts ------------------------------- */

  const keys = React.useRef<(e: KeyboardEvent) => void>(() => {})
  keys.current = (e) => {
    const mod = e.metaKey || e.ctrlKey
    const k = e.key.toLowerCase()
    let handled = true
    if (e.ctrlKey && !e.metaKey && e.code === "Backquote") {
      if (e.shiftKey) newTerminal()
      else togglePanel()
    } else if (e.key === "F1" || (mod && e.shiftKey && k === "p")) setPalette("commands")
    else if (mod && !e.shiftKey && k === "p") setPalette("files")
    else if (mod && e.altKey && k === "s") saveAll()
    else if (mod && !e.shiftKey && k === "s") save()
    else if (mod && !e.shiftKey && k === "b") toggleSidebar()
    else if (mod && !e.shiftKey && k === "j") togglePanel()
    else if (mod && e.shiftKey && k === "e") showSidebar("explorer")
    else if (mod && e.shiftKey && k === "f") showSidebar("search")
    else if (e.ctrlKey && e.shiftKey && k === "g") showSidebar("scm")
    else if (mod && e.shiftKey && k === "x") showSidebar("extensions")
    else if (mod && e.shiftKey && k === "m") showPanel("problems")
    else handled = false
    if (handled) {
      e.preventDefault()
      e.stopPropagation()
    }
  }
  // Commands from a native menu.
  const command = React.useRef<(c: HostCommand) => void>(() => {})
  command.current = (c) => {
    if (c === "open-folder") void openFolder()
    else if (c === "close-folder") void closeFolder()
    else if (c === "save") save()
    else if (c === "save-all") saveAll()
    else if (c === "new-file") createInExplorer("file")
    else if (c === "new-folder") createInExplorer("folder")
    else if (c === "commands") setPalette("commands")
    else if (c === "files") setPalette("files")
    else if (c === "toggle-sidebar") toggleSidebar()
    else if (c === "toggle-panel") togglePanel()
    else if (c === "new-terminal") newTerminal()
  }
  React.useEffect(() => host?.onCommand?.((c) => command.current(c)), [host])

  React.useEffect(() => {
    // Capture phase, so the shortcuts win over the editor's and the terminal's own key handling.
    const onKey = (e: KeyboardEvent) => keys.current(e)
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [])

  /* ---------------------------- command palette --------------------------- */

  const paletteItems: CommandPaletteItem[] =
    palette === "files"
      ? [
          ...[...tabs].reverse().map((p) => ({ id: `open:${p}`, label: basename(p), description: rel(dirname(p)) || ws.name, keywords: [rel(p)], group: "Open editors", icon: FileIcon, onSelect: () => openFile(p) })),
          ...ws
            .listFiles()
            .filter((p) => !tabs.includes(p))
            .map((p) => ({ id: `file:${p}`, label: basename(p), description: rel(dirname(p)) || ws.name, keywords: [rel(p)], group: "Files", icon: FileIcon, onSelect: () => openFile(p) })),
        ]
      : [
          ...(host?.openFolder
            ? [
                { id: "open-folder", label: "File: Open folder…", group: "File", shortcut: ["⌘", "O"], icon: FolderIcon, onSelect: () => void openFolder() },
                { id: "close-folder", label: "File: Close folder", group: "File", icon: FolderIcon, disabled: !ws.mounted, onSelect: () => void closeFolder() },
              ]
            : []),
          { id: "save", label: "File: Save", group: "File", shortcut: ["⌘", "S"], icon: FileIcon, disabled: !active, onSelect: () => save() },
          { id: "save-all", label: "File: Save all", group: "File", shortcut: ["⌥", "⌘", "S"], icon: FileIcon, onSelect: saveAll },
          { id: "new-file", label: "File: New file…", group: "File", icon: FileIcon, onSelect: () => createInExplorer("file") },
          { id: "new-folder", label: "File: New folder…", group: "File", icon: FolderIcon, onSelect: () => createInExplorer("folder") },
          { id: "revert", label: "File: Revert file", group: "File", icon: RefreshIcon, disabled: !active || !dirty.has(active), onSelect: () => active && docs.revert(active) },
          { id: "close", label: "View: Close editor", group: "File", icon: FileIcon, disabled: !active, onSelect: () => active && closeTab(active) },
          { id: "quick-open", label: "Go to file…", group: "Go", shortcut: ["⌘", "P"], icon: SearchIcon, onSelect: () => setTimeout(() => setPalette("files"), 0) },
          { id: "go-line", label: "Go to line…", group: "Go", shortcut: ["⌃", "G"], icon: CodeIcon, disabled: !active, onSelect: () => editorRef.current?.run("editor.action.gotoLine") },
          { id: "format", label: "Format document", group: "Editor", shortcut: ["⇧", "⌥", "F"], icon: CodeIcon, disabled: !active, onSelect: () => editorRef.current?.run("editor.action.formatDocument") },
          { id: "explorer", label: "View: Show explorer", group: "View", shortcut: ["⇧", "⌘", "E"], icon: FolderIcon, onSelect: () => showSidebar("explorer") },
          { id: "search", label: "View: Search in files", group: "View", shortcut: ["⇧", "⌘", "F"], icon: SearchIcon, onSelect: () => showSidebar("search") },
          { id: "scm", label: "View: Show source control", group: "View", shortcut: ["⌃", "⇧", "G"], icon: GitBranchIcon, onSelect: () => showSidebar("scm") },
          { id: "extensions", label: "View: Show extensions", group: "View", shortcut: ["⇧", "⌘", "X"], icon: GridIcon, onSelect: () => showSidebar("extensions") },
          { id: "sidebar", label: "View: Toggle sidebar", group: "View", shortcut: ["⌘", "B"], icon: SidebarIcon, onSelect: toggleSidebar },
          { id: "panel", label: "View: Toggle panel", group: "View", shortcut: ["⌃", "`"], icon: PanelBottomIcon, onSelect: togglePanel },
          { id: "problems", label: "View: Show problems", group: "View", shortcut: ["⇧", "⌘", "M"], icon: WarningIcon, onSelect: () => showPanel("problems") },
          { id: "output", label: "View: Show output", group: "View", icon: PanelBottomIcon, onSelect: () => showPanel("output") },
          { id: "term-new", label: "Terminal: New terminal", group: "Terminal", shortcut: ["⌃", "⇧", "`"], icon: TerminalSquareIcon, onSelect: () => newTerminal() },
          ...(mobile ? [] : [{ id: "term-split", label: "Terminal: Split terminal", group: "Terminal", icon: TerminalSquareIcon, onSelect: () => (terms.split(), showPanel("terminal")) }]),
          { id: "term-kill", label: "Terminal: Kill the active terminal", group: "Terminal", icon: TerminalSquareIcon, disabled: !terms.active, onSelect: () => terms.active && terms.kill(terms.active) },
          { id: "theme", label: "Preferences: Toggle dark theme", group: "Preferences", icon: MoonIcon, onSelect: toggleTheme },
          { id: "reset", label: "Workspace: Reset to the starter project…", group: "Workspace", icon: RefreshIcon, onSelect: () => setConfirmReset(true) },
        ]

  const resetWorkspace = () => {
    if (ws.mounted) void host?.closeFolder?.()
    ws.reset()
    docs.clear()
    DEFAULT_TABS.forEach((p) => docs.open(p))
    setTabs(DEFAULT_TABS)
    setActive(DEFAULT_TABS[0])
    setSelected(DEFAULT_TABS[0])
    setConfirmReset(false)
    log(`Reset ${ws.name} to the starter project`)
  }

  /* -------------------------------- render -------------------------------- */

  const errors = problems.filter((p) => p.severity === "error").length
  const warnings = problems.filter((p) => p.severity === "warning").length
  const language = active ? languageOf(basename(active)).label : null
  const dark = theme === "dark"

  const sidebarView = (
    <>
      {view === "explorer" && (
        <Explorer
          ws={ws}
          selected={selected}
          onSelect={setSelected}
          onOpen={(p) => openFile(p)}
          onRenamed={(from, to) => {
            docs.move(from, to)
            const map = (p: string) => (p === from || p.startsWith(`${from}/`) ? to + p.slice(from.length) : p)
            setTabs((t) => t.map(map))
            setActive((a) => (a ? map(a) : a))
            log(`Renamed ${rel(from)} to ${rel(to)}`)
          }}
          onDeleted={(p) => log(`Deleted ${rel(p)}`)}
          onOpenTerminal={(dir) => {
            setNavOpen(false)
            newTerminal(dir)
          }}
          changes={changes}
          dirty={dirty}
          handleRef={explorerRef}
        />
      )}
      {view === "search" && <SearchView ws={ws} docs={docs} autoFocus onOpenMatch={(p, line, column, length) => openFile(p, { line, column, length })} />}
      {view === "scm" && <ScmView ws={ws} branch={BRANCH} onOpen={(p) => openFile(p)} onCommitted={(m, n) => log(`Committed ${n} ${n === 1 ? "file" : "files"} to ${BRANCH}: ${m}`)} />}
      {view === "extensions" && <ExtensionsView />}
    </>
  )

  const rail = (orientation: "vertical" | "horizontal") => (
    <SidebarRail aria-label="Views" orientation={orientation}>
      <SidebarRailGroup>
        {VIEWS.map((v) => (
          <SidebarRailItem
            key={v.id}
            label={v.label}
            shortcut={v.shortcut}
            icon={v.icon}
            active={view === v.id && (mobile || sidebarOpen)}
            badge={v.id === "scm" && changes.size ? changes.size : undefined}
            onClick={() => (mobile ? setView(v.id) : toggleView(v.id))}
          />
        ))}
      </SidebarRailGroup>
      <SidebarRailSpacer />
      <SidebarRailGroup>
        {!mobile && <SidebarRailItem label="Toggle panel" shortcut="⌃`" icon={<TerminalSquareIcon />} active={panelOpen} onClick={togglePanel} />}
        <SidebarRailItem
          label="Show all commands"
          shortcut="⇧⌘P"
          icon={<SettingsIcon />}
          onClick={() => {
            setNavOpen(false)
            setPalette("commands")
          }}
        />
      </SidebarRailGroup>
    </SidebarRail>
  )

  const editorTabs = (
    <TabStrip
      value={active}
      onValueChange={(p) => {
        setActive(p)
        setSelected(p)
      }}
      order={tabs}
      onReorder={setTabs}
      onClose={(p) => closeTab(p)}
      aria-label="Open editors"
      className="min-w-0 flex-1"
      actions={
        <Menu>
          <MenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Editor actions" className="text-muted-foreground" />}>
            <MoreHorizontalIcon />
          </MenuTrigger>
          <MenuContent align="end" className="w-52">
            <MenuItem onClick={saveAll} disabled={!dirty.size}>
              Save all
              <MenuShortcut>⌥⌘S</MenuShortcut>
            </MenuItem>
            <MenuSeparator />
            <MenuItem onClick={() => removeTabs(tabs.filter((p) => !docs.isDirty(p)).map((p) => (docs.close(p), p)))}>Close saved</MenuItem>
            <MenuItem
              onClick={() => {
                const clean = tabs.filter((p) => !docs.isDirty(p))
                clean.forEach((p) => docs.close(p))
                removeTabs(clean)
                const left = tabs.find((p) => docs.isDirty(p))
                if (left) setConfirmClose(left)
              }}
            >
              Close all
            </MenuItem>
          </MenuContent>
        </Menu>
      }
    >
      {tabs.map((p) => {
        const kind = getFileKind(basename(p))
        return (
          <TabStripItem key={p} value={p} icon={<span className={kind.className}>{kind.icon}</span>} indicator={dirty.has(p)} hint={rel(p)} className={mobile ? "max-w-36" : undefined}>
            {basename(p)}
          </TabStripItem>
        )
      })}
    </TabStrip>
  )

  const crumbs = active && (
    <div className="flex h-7 shrink-0 items-center overflow-hidden px-1.5 max-md:px-2">
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap overflow-hidden">
        {rel(active)
          .split("/")
          .map((seg, i, all) => {
            const path = abs(all.slice(0, i + 1).join("/"))
            const last = i === all.length - 1
            if (last) {
              const kind = getFileKind(seg)
              return (
                <BreadcrumbItem key={path} className="min-w-0">
                  <BreadcrumbPage className="min-w-0">
                    <span className={kind.className}>{kind.icon}</span>
                    <span className="truncate">{seg}</span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              )
            }
            const dir = path
            const siblings = ws.isDir(dir) ? ws.readdir(dir) : []
            return (
              <React.Fragment key={path}>
                <BreadcrumbItem className="shrink-0">
                  <Menu>
                    <BreadcrumbLink render={<MenuTrigger />}>{seg}</BreadcrumbLink>
                    <MenuContent className="max-h-80 w-56">
                      {siblings.map((s) => {
                        const child = `${dir}/${s.name}`
                        return (
                          <MenuItem
                            key={s.name}
                            onClick={() => {
                              if (s.dir) {
                                setSelected(child)
                                showSidebar("explorer")
                              } else openFile(child)
                            }}
                          >
                            {s.dir ? <FolderIcon /> : <FileIcon />}
                            <span className="truncate">{s.name}</span>
                          </MenuItem>
                        )
                      })}
                    </MenuContent>
                  </Menu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </React.Fragment>
            )
          })}
      </BreadcrumbList>
    </Breadcrumb>
    </div>
  )

  // No file open: the workspace's name and the ways in, each one click away.
  const emptyActions: { label: string; keys?: string; run: () => void }[] = [
    { label: "Go to file", keys: "⌘P", run: () => setPalette("files") },
    { label: "Show all commands", keys: "⇧⌘P", run: () => setPalette("commands") },
    { label: "New file", run: () => createInExplorer("file") },
    { label: "New terminal", keys: "⌃⇧`", run: () => newTerminal() },
  ]
  const emptyEditor = (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-72 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="truncate text-ui-lg font-semibold">{ws.name}</h2>
          <p className="text-ui text-muted-foreground">No file open.</p>
        </div>
        <ul aria-label="Start" className="-mx-2 flex flex-col">
          {emptyActions.map((a) => (
            <li key={a.label}>
              <button
                type="button"
                onClick={a.run}
                className="flex h-8 w-full items-center justify-between gap-3 rounded-md px-2 text-start text-ui transition-colors duration-150 outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring active:bg-secondary"
              >
                {a.label}
                {a.keys && <Kbd>{a.keys}</Kbd>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  const editor = (
    <CodeEditor
      ws={ws}
      docs={docs}
      path={active}
      onCursor={setCursor}
      onProblems={setProblems}
      onSave={() => save()}
      compact={mobile}
      empty={emptyEditor}
      handleRef={editorRef}
    />
  )

  const panel = (compact: boolean) => (
    <BottomPanel
      tab={panelTab}
      onTabChange={setPanelTab}
      terms={terms}
      problems={problems}
      output={output}
      onOpenProblem={openProblem}
      onClose={closePanel}
      maximized={!!maximized}
      onToggleMaximize={compact ? undefined : toggleMaximize}
      compact={compact}
    />
  )

  const status = (
    <StatusLine
      branch={BRANCH}
      changes={changes.size}
      errors={errors}
      warnings={warnings}
      cursor={active ? cursor : null}
      language={language}
      remote={!!ptyUrl || !!host?.terminal}
      dark={dark}
      onBranch={() => showSidebar("scm")}
      onProblems={() => showPanel("problems")}
      onGoToLine={() => editorRef.current?.run("editor.action.gotoLine")}
      onLanguage={() => setPalette("commands")}
      onTheme={toggleTheme}
      compact={mobile}
    />
  )

  const dirtyName = confirmClose ? basename(confirmClose) : ""

  return (
    <TooltipProvider>
      <h1 className="sr-only">{active ? `${basename(active)} · ${ws.name}` : ws.name}</h1>
      {mobile ? (
        <div className="flex h-dvh w-full flex-col overflow-hidden bg-shell text-foreground">
          <header className="flex h-11 shrink-0 items-center gap-1 px-1.5">
            <IconAction label="Files and views" shortcut="⌘B" size="icon" pressed={navOpen} onClick={() => setNavOpen(true)}>
              <MenuIcon />
            </IconAction>
            {editorTabs}
            <IconAction label="Go to file" shortcut="⌘P" size="icon" onClick={() => setPalette("files")}>
              <SearchIcon />
            </IconAction>
            <IconAction label="Terminal and problems" shortcut="⌃`" size="icon" pressed={sheetOpen} onClick={() => setSheetOpen(true)}>
              <TerminalSquareIcon />
            </IconAction>
          </header>
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-shell border-t border-shell-border bg-background">
            {crumbs}
            <div className="min-h-0 flex-1">{editor}</div>
          </main>
          <div className="border-t border-border bg-background">{status}</div>
        </div>
      ) : (
        <div className="flex h-dvh w-full flex-col overflow-hidden bg-shell text-foreground">
          {host?.titleBar && (
            <header
              className={cn(
                "window-drag flex h-9 shrink-0 items-center justify-center px-3 text-ui-sm font-medium text-muted-foreground",
                host.titleBar.controls === "left" && "ps-20",
                host.titleBar.controls === "right" && "pe-36"
              )}
            >
              <span className="truncate">
                {active ? `${basename(active)} — ` : ""}
                {ws.name}
              </span>
            </header>
          )}
          <div className="flex min-h-0 flex-1">
            {rail("vertical")}
            <ResizablePanelGroup direction="horizontal" autoSaveId="vscode-template-shell" handleRef={outer} className="min-w-0 flex-1">
              <ResizablePanel id="sidebar" defaultSize="264px" minSize="200px" maxSize="520px" collapsible onCollapsedChange={(c) => setSidebarOpen(!c)}>
                <div className="flex h-full flex-col pt-0.75">{sidebarView}</div>
              </ResizablePanel>
              <ResizableHandle variant="hidden" />
              <ResizablePanel id="main" minSize={30}>
                <div className="flex h-full flex-col">
                  <div className="shell-inset mt-0.75 flex min-h-0 flex-1 flex-col overflow-hidden">
                    <ResizablePanelGroup direction="vertical" autoSaveId="vscode-template-editor" handleRef={inner}>
                      <ResizablePanel id="editor" minSize="96px">
                        <div className="flex h-full min-h-0 flex-col">
                          <div className="flex h-10 shrink-0 items-center gap-1 border-b border-border px-1.5">
                            {!sidebarOpen && (
                              <IconAction label="Show sidebar" shortcut="⌘B" size="icon-sm" onClick={toggleSidebar}>
                                <SidebarIcon />
                              </IconAction>
                            )}
                            {editorTabs}
                          </div>
                          {crumbs}
                          <div className="min-h-0 flex-1">{editor}</div>
                        </div>
                      </ResizablePanel>
                      <ResizableHandle />
                      <ResizablePanel
                        id="panel"
                        defaultSize={34}
                        minSize="120px"
                        collapsible
                        onCollapsedChange={(c) => {
                          setPanelOpen(!c)
                          if (c) setMaximized(null)
                        }}
                      >
                        {panel(false)}
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
          {status}
        </div>
      )}

      {mobile && (
        <>
          <Drawer side="left" open={navOpen} onOpenChange={setNavOpen}>
            <DrawerContent showClose={false} className="p-0">
              <DrawerTitle className="sr-only">{VIEWS.find((v) => v.id === view)?.label}</DrawerTitle>
              <div className="min-h-0 flex-1 pt-2">{sidebarView}</div>
              <div className="shrink-0 border-t border-border">{rail("horizontal")}</div>
            </DrawerContent>
          </Drawer>
          <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} snapPoints={[0.55, 0.92]}>
            <BottomSheetContent className="max-w-none">
              <BottomSheetTitle className="sr-only">Panel</BottomSheetTitle>
              <div className="min-h-0 flex-1">{panel(true)}</div>
            </BottomSheetContent>
          </BottomSheet>
        </>
      )}

      <CommandPalette
        items={paletteItems}
        open={palette !== null}
        onOpenChange={(o) => !o && setPalette(null)}
        hotkey={false}
        placeholder={palette === "files" ? "Search files by name" : "Run a command"}
        emptyMessage={palette === "files" ? "No files match." : "No commands match."}
      />

      <Dialog open={confirmClose !== null} onOpenChange={(o) => !o && setConfirmClose(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save changes to {dirtyName}?</DialogTitle>
            <DialogDescription>Your changes are lost if you don’t save them.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => confirmClose && (closeTab(confirmClose, true), setConfirmClose(null))}>
              Don’t save
            </Button>
            <Button variant="outline" onClick={() => setConfirmClose(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!confirmClose) return
                save(confirmClose)
                closeTab(confirmClose, true)
                setConfirmClose(null)
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset the workspace?</DialogTitle>
            <DialogDescription>Every file goes back to the starter project. Unsaved and committed changes are lost.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={resetWorkspace}>
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
