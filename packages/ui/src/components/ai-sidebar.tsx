"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import {
  BookmarkIcon,
  ChevronRightIcon,
  EditIcon,
  FileIcon,
  FolderIcon,
  GridIcon,
  SearchIcon,
  SidebarIcon,
  XIcon,
} from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { TooltipContent } from "@paneui/ui/components/tooltip"

type SidebarResourceKind = "folder" | "project" | "file" | "bookmark"

type SidebarResource = {
  id: string
  label: string
  kind: SidebarResourceKind
  children?: SidebarResource[]
  /** Trailing hint (a count, a time). */
  meta?: React.ReactNode
  disabled?: boolean
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const WIDTH_SPRING = { type: "spring", stiffness: 420, damping: 40, mass: 0.7 } as const

const isContainer = (r: SidebarResource) => (r.kind === "folder" || r.kind === "project") && !!r.children

function ResourceIcon({ kind, className }: { kind: SidebarResourceKind; className?: string }) {
  const Comp = kind === "folder" ? FolderIcon : kind === "project" ? GridIcon : kind === "bookmark" ? BookmarkIcon : FileIcon
  return (
    <Comp
      size={16}
      className={cn(
        "shrink-0",
        kind === "project" && "text-primary-text",
        kind === "bookmark" && "text-warning-text",
        (kind === "folder" || kind === "file") && "text-muted-foreground",
        className
      )}
    />
  )
}

type Flat = { item: SidebarResource; depth: number; parentId: string | null; setSize: number; posInSet: number }

function flatten(items: SidebarResource[], expanded: Set<string>, depth = 0, parentId: string | null = null): Flat[] {
  return items.flatMap((item, i) => {
    const row: Flat = { item, depth, parentId, setSize: items.length, posInSet: i + 1 }
    if (!isContainer(item) || !expanded.has(item.id)) return [row]
    return [row, ...flatten(item.children!, expanded, depth + 1, item.id)]
  })
}

/** Keeps items that match, plus the ancestors of anything that matches. */
function filterTree(items: SidebarResource[], q: string): SidebarResource[] {
  if (!q) return items
  return items.flatMap((item) => {
    const self = item.label.toLowerCase().includes(q)
    const kids = item.children ? filterTree(item.children, q) : undefined
    if (self) return [item]
    if (kids?.length) return [{ ...item, children: kids }]
    return []
  })
}

function containerIds(items: SidebarResource[]): string[] {
  return items.flatMap((i) => (i.children ? [i.id, ...containerIds(i.children)] : []))
}

function renameIn(items: SidebarResource[], id: string, label: string): SidebarResource[] {
  return items.map((i) =>
    i.id === id ? { ...i, label } : i.children ? { ...i, children: renameIn(i.children, id, label) } : i
  )
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const at = text.toLowerCase().indexOf(query)
  if (at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-2xs bg-primary/18 text-foreground">{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length)}
    </>
  )
}

/* ────────────────────────────── Tree ────────────────────────────── */

type ResourceTreeProps = {
  label: string
  items: SidebarResource[]
  query: string
  expanded: Set<string>
  onToggle: (id: string, open?: boolean) => void
  activeId: string | null
  onActivate: (item: SidebarResource) => void
  onRename?: (item: SidebarResource, label: string) => void
}

function ResourceTree({ label, items, query, expanded, onToggle, activeId, onActivate, onRename }: ResourceTreeProps) {
  const { labels } = useLocale()
  const reduce = useReducedMotion()
  const rows = React.useMemo(() => flatten(items, expanded), [items, expanded])
  const [focusId, setFocusId] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const refs = React.useRef(new Map<string, HTMLDivElement>())
  const typeahead = React.useRef({ text: "", at: 0 })

  // The roving tab stop: the focused row, else the active one, else the first.
  const tabId = rows.some((r) => r.item.id === focusId)
    ? focusId
    : rows.some((r) => r.item.id === activeId)
      ? activeId
      : (rows[0]?.item.id ?? null)

  const focus = (id: string | undefined) => {
    if (!id) return
    setFocusId(id)
    refs.current.get(id)?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    if (editingId) return
    const row = rows[index]
    const { item } = row
    const open = expanded.has(item.id)
    switch (e.key) {
      case "ArrowDown":
        focus(rows[index + 1]?.item.id)
        break
      case "ArrowUp":
        focus(rows[index - 1]?.item.id)
        break
      case "Home":
        focus(rows[0]?.item.id)
        break
      case "End":
        focus(rows[rows.length - 1]?.item.id)
        break
      case "ArrowRight":
        if (!isContainer(item)) return
        if (!open) onToggle(item.id, true)
        else focus(rows[index + 1]?.item.id)
        break
      case "ArrowLeft":
        if (isContainer(item) && open) onToggle(item.id, false)
        else if (row.parentId) focus(row.parentId)
        else return
        break
      case "Enter":
      case " ":
        if (item.disabled) return
        if (isContainer(item)) onToggle(item.id)
        else onActivate(item)
        break
      case "F2":
        if (!onRename || item.disabled) return
        setEditingId(item.id)
        break
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          const now = Date.now()
          const t = typeahead.current
          t.text = now - t.at > 600 ? e.key.toLowerCase() : t.text + e.key.toLowerCase()
          t.at = now
          const order = [...rows.slice(index + 1), ...rows.slice(0, index + 1)]
          const hit = order.find((r) => r.item.label.toLowerCase().startsWith(t.text))
          if (hit) focus(hit.item.id)
          break
        }
        return
    }
    e.preventDefault()
  }

  if (!rows.length) return null

  return (
    <div role="tree" aria-label={label} data-slot="ai-sidebar-tree" className="flex flex-col">
      <AnimatePresence initial={false}>
        {rows.map((row, index) => {
          const { item, depth } = row
          const container = isContainer(item)
          const open = expanded.has(item.id)
          const active = item.id === activeId
          const editing = item.id === editingId
          return (
            <motion.div
              key={item.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <div
                ref={(el) => {
                  if (el) refs.current.set(item.id, el)
                  else refs.current.delete(item.id)
                }}
                role="treeitem"
                aria-level={depth + 1}
                aria-setsize={row.setSize}
                aria-posinset={row.posInSet}
                aria-expanded={container ? open : undefined}
                aria-selected={active}
                aria-current={active ? "page" : undefined}
                aria-disabled={item.disabled || undefined}
                tabIndex={item.id === tabId ? 0 : -1}
                data-slot="ai-sidebar-item"
                data-kind={item.kind}
                data-active={active || undefined}
                onFocus={() => setFocusId(item.id)}
                onKeyDown={(e) => onKeyDown(e, index)}
                onClick={() => {
                  if (item.disabled || editing) return
                  setFocusId(item.id)
                  if (container) onToggle(item.id)
                  else onActivate(item)
                }}
                onDoubleClick={() => onRename && !item.disabled && setEditingId(item.id)}
                style={{ paddingLeft: 6 + depth * 14 }}
                className={cn(
                  "group/item relative mx-1 my-px flex h-8 cursor-pointer items-center gap-1.5 rounded-lg pr-2 text-ui outline-none select-none",
                  "transition-[background-color,color] duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-foreground/6 font-medium text-foreground"
                    : "text-foreground/85 hover:bg-secondary",
                  item.disabled && "pointer-events-none opacity-50"
                )}
              >
                <span className="grid size-4 shrink-0 place-items-center text-muted-foreground">
                  {container && (
                    <ChevronRightIcon
                      size={13}
                      className={cn(
                        "transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none rtl:-scale-x-100",
                        open && "rotate-90 rtl:-rotate-90"
                      )}
                    />
                  )}
                </span>
                <ResourceIcon kind={item.kind} />
                {editing ? (
                  <RenameField
                    initial={item.label}
                    onDone={(next) => {
                      setEditingId(null)
                      if (next && next !== item.label) onRename?.(item, next)
                      requestAnimationFrame(() => refs.current.get(item.id)?.focus())
                    }}
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate" title={item.label}>
                    <Highlight text={item.label} query={query} />
                  </span>
                )}
                {item.meta != null && !editing && (
                  <span className="shrink-0 text-ui-sm text-muted-foreground tabular-nums">{item.meta}</span>
                )}
                {onRename && !editing && !item.disabled && (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={labels.renameNamed(item.label)}
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingId(item.id)
                    }}
                    className="hidden size-6 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground group-hover/item:grid hover:bg-background hover:text-foreground"
                  >
                    <EditIcon size={13} />
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

function RenameField({ initial, onDone }: { initial: string; onDone: (value: string | null) => void }) {
  const { labels } = useLocale()
  const [value, setValue] = React.useState(initial)
  const done = React.useRef(false)
  const finish = (v: string | null) => {
    if (done.current) return
    done.current = true
    onDone(v)
  }
  return (
    <input
      autoFocus
      aria-label={labels.rename}
      value={value}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setValue(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === "Enter") finish(value.trim())
        if (e.key === "Escape") finish(null)
      }}
      onBlur={() => finish(value.trim())}
      className="h-6 min-w-0 flex-1 rounded-lg bg-background px-1.5 text-ui shadow-well outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  )
}

/* ──────────────────────────── Shortcut ──────────────────────────── */

// One window listener for every AISidebar on the page. Instances stack in mount
// order; focusing or pressing inside one moves it to the top, and only the
// topmost instance with a matching key handles ⌘/Ctrl+key.
type HotkeyEntry = { key: string; run: () => void }
const hotkeyStack: HotkeyEntry[] = []

function onHotkey(e: KeyboardEvent) {
  if (!(e.metaKey || e.ctrlKey) || e.altKey || e.defaultPrevented) return
  const key = e.key.toLowerCase()
  for (let i = hotkeyStack.length - 1; i >= 0; i--) {
    if (hotkeyStack[i].key !== key) continue
    e.preventDefault()
    hotkeyStack[i].run()
    return
  }
}

function useSearchHotkey(key: string | null | undefined, run: () => void) {
  const runRef = React.useRef(run)
  React.useLayoutEffect(() => {
    runRef.current = run
  })
  const entryRef = React.useRef<HotkeyEntry | null>(null)

  React.useEffect(() => {
    if (!key) return
    const entry: HotkeyEntry = { key: key.toLowerCase(), run: () => runRef.current() }
    entryRef.current = entry
    hotkeyStack.push(entry)
    if (hotkeyStack.length === 1) window.addEventListener("keydown", onHotkey)
    return () => {
      const at = hotkeyStack.indexOf(entry)
      if (at >= 0) hotkeyStack.splice(at, 1)
      if (hotkeyStack.length === 0) window.removeEventListener("keydown", onHotkey)
      if (entryRef.current === entry) entryRef.current = null
    }
  }, [key])

  // Make this instance the one the shortcut drives.
  return React.useCallback(() => {
    const entry = entryRef.current
    const at = entry ? hotkeyStack.indexOf(entry) : -1
    if (entry && at >= 0 && at !== hotkeyStack.length - 1) {
      hotkeyStack.splice(at, 1)
      hotkeyStack.push(entry)
    }
  }, [])
}

const noopSubscribe = () => () => {}
/** ⌘ on Apple platforms, Ctrl elsewhere (⌘ while server rendering). */
function useModKeyLabel() {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => (/Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent) ? "⌘" : "Ctrl+"),
    () => "⌘"
  )
}

/* ──────────────────────────── Sidebar ──────────────────────────── */

type AISidebarProps = Omit<React.HTMLAttributes<HTMLElement>, "title"> & {
  /** Workspace tree: folders and projects hold children; files are leaves. */
  items?: SidebarResource[]
  defaultItems?: SidebarResource[]
  onItemsChange?: (items: SidebarResource[]) => void
  /** Pinned shortcuts shown in their own section. */
  bookmarks?: SidebarResource[]
  activeId?: string | null
  defaultActiveId?: string | null
  onActiveChange?: (id: string, item: SidebarResource) => void
  defaultExpandedIds?: string[]
  /** Expanded (true) or folded down to an icon rail (false). */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Brand/title row content. */
  title?: React.ReactNode
  /** Rendered under the title, e.g. a "New chat" button. Receives the open state. */
  actions?: (open: boolean) => React.ReactNode
  /** Pinned to the bottom, e.g. the account row. Receives the open state. */
  footer?: (open: boolean) => React.ReactNode
  searchable?: boolean
  /**
   * ⌘/Ctrl + this key focuses search (opening the sidebar). With several sidebars
   * on a page only the most recently mounted, focused or clicked one responds.
   * `null` disables the shortcut.
   */
  searchHotkey?: string | null
  /** Allow inline rename (F2, double-click or the pencil). */
  renamable?: boolean
  onRename?: (item: SidebarResource, label: string) => void
  /** Expanded width as a CSS length. */
  width?: string
}

function AISidebar({
  items: itemsProp,
  defaultItems = [],
  onItemsChange,
  bookmarks = [],
  activeId: activeProp,
  defaultActiveId = null,
  onActiveChange,
  defaultExpandedIds = [],
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  title: titleProp,
  actions,
  footer,
  searchable = true,
  searchHotkey = "k",
  renamable = false,
  onRename,
  width = "16rem",
  className,
  onFocusCapture,
  onPointerDownCapture,
  ...props
}: AISidebarProps) {
  const { labels } = useLocale()
  const title = titleProp ?? labels.workspace
  const reduce = useReducedMotion()
  const [innerItems, setInnerItems] = React.useState(defaultItems)
  const items = itemsProp ?? innerItems
  const [innerActive, setInnerActive] = React.useState<string | null>(defaultActiveId)
  const activeId = activeProp !== undefined ? activeProp : innerActive
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen)
  const open = openProp ?? innerOpen
  const [expanded, setExpanded] = React.useState(() => new Set(defaultExpandedIds))
  const [query, setQuery] = React.useState("")
  const searchRef = React.useRef<HTMLInputElement>(null)
  const q = query.trim().toLowerCase()

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInnerOpen(next)
    onOpenChange?.(next)
  }

  const toggle = React.useCallback((id: string, force?: boolean) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      const on = force ?? !next.has(id)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const activate = (item: SidebarResource) => {
    if (activeProp === undefined) setInnerActive(item.id)
    onActiveChange?.(item.id, item)
  }

  const rename = (item: SidebarResource, label: string) => {
    const inBookmarks = bookmarks.some((b) => b.id === item.id)
    if (!inBookmarks) {
      const next = renameIn(items, item.id, label)
      if (itemsProp === undefined) setInnerItems(next)
      onItemsChange?.(next)
    }
    onRename?.(item, label)
  }

  const filtered = React.useMemo(() => filterTree(items, q), [items, q])
  const filteredBookmarks = React.useMemo(() => filterTree(bookmarks, q), [bookmarks, q])
  // While searching, every branch that leads to a match is open.
  const shownExpanded = React.useMemo(
    () => (q ? new Set([...expanded, ...containerIds(filtered)]) : expanded),
    [q, expanded, filtered]
  )

  // ⌘K / Ctrl+K jumps to search (opening the sidebar first).
  const claimShortcut = useSearchHotkey(searchable ? searchHotkey : null, () => {
    if (openProp === undefined) setInnerOpen(true)
    onOpenChange?.(true)
    requestAnimationFrame(() => searchRef.current?.focus())
  })
  const modKey = useModKeyLabel()

  const railItems = [...items, ...bookmarks]

  return (
    <motion.nav
      data-slot="ai-sidebar"
      data-state={open ? "open" : "collapsed"}
      initial={false}
      animate={{ width: open ? width : "3.5rem" }}
      transition={reduce ? { duration: 0 } : WIDTH_SPRING}
      className={cn(
        "relative flex h-full shrink-0 flex-col overflow-hidden border-e border-border/60 bg-card/60 text-ui",
        className
      )}
      onFocusCapture={(e) => {
        claimShortcut()
        onFocusCapture?.(e)
      }}
      onPointerDownCapture={(e) => {
        claimShortcut()
        onPointerDownCapture?.(e)
      }}
      {...(props as React.ComponentProps<typeof motion.nav>)}
      aria-label={props["aria-label"] ?? labels.aiWorkspace}
    >
      {/* Header */}
      <div className={cn("flex h-12 shrink-0 items-center gap-2 px-2.5", !open && "justify-center px-0")}>
        {open && <div className="min-w-0 flex-1 truncate ps-1 text-ui-lg font-semibold icon-bold">{title}</div>}
        <RailTip label={open ? labels.collapseSidebar : labels.expandSidebar} enabled>
          <button
            type="button"
            aria-label={open ? labels.collapseSidebar : labels.expandSidebar}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <SidebarIcon size={17} />
          </button>
        </RailTip>
      </div>

      {actions && <div className={cn("shrink-0 px-2.5 pb-2", !open && "flex justify-center px-0")}>{actions(open)}</div>}

      {/* Search */}
      {searchable && (
        <div className={cn("shrink-0 px-2.5 pb-2", !open && "flex justify-center px-0")}>
          {open ? (
            <label className="flex h-8 items-center gap-2 rounded-xl bg-muted/70 px-2.5 shadow-well focus-within:ring-2 focus-within:ring-ring">
              <SearchIcon size={14} className="shrink-0 text-muted-foreground" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setQuery("")
                }}
                placeholder={labels.searchPlaceholder}
                aria-label={labels.searchWorkspace}
                className="min-w-0 flex-1 bg-transparent text-ui outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <button
                  type="button"
                  aria-label={labels.clearSearch}
                  onClick={() => {
                    setQuery("")
                    searchRef.current?.focus()
                  }}
                  className="relative grid size-5 cursor-pointer place-items-center rounded-full text-muted-foreground after:absolute after:-inset-0.5 hover:bg-muted hover:text-foreground"
                >
                  <XIcon size={12} />
                </button>
              ) : (
                searchHotkey && (
                  <kbd className="rounded-sm bg-background px-1.5 font-mono text-ui-2xs text-muted-foreground shadow-chip">
                    {modKey}
                    {searchHotkey.toUpperCase()}
                  </kbd>
                )
              )}
            </label>
          ) : (
            <RailTip label={labels.searchPlaceholder} enabled>
              <button
                type="button"
                aria-label={labels.searchPlaceholder}
                onClick={() => {
                  setOpen(true)
                  requestAnimationFrame(() => searchRef.current?.focus())
                }}
                className="grid size-8 cursor-pointer place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <SearchIcon size={16} />
              </button>
            </RailTip>
          )}
        </div>
      )}

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {open ? (
          <motion.div
            key="open"
            initial={reduce ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT, delay: 0.05 }}
            className="flex flex-col gap-3"
            style={{ width }}
          >
            {filteredBookmarks.length > 0 && (
              <Section label={labels.bookmarks}>
                <ResourceTree
                  label={labels.bookmarks}
                  items={filteredBookmarks}
                  query={q}
                  expanded={shownExpanded}
                  onToggle={toggle}
                  activeId={activeId}
                  onActivate={activate}
                  onRename={renamable ? rename : undefined}
                />
              </Section>
            )}
            {filtered.length > 0 && (
              <Section label={labels.workspace}>
                <ResourceTree
                  label={labels.workspace}
                  items={filtered}
                  query={q}
                  expanded={shownExpanded}
                  onToggle={toggle}
                  activeId={activeId}
                  onActivate={activate}
                  onRename={renamable ? rename : undefined}
                />
              </Section>
            )}
            {q && !filtered.length && !filteredBookmarks.length && (
              <p className="px-4 py-6 text-center text-ui text-muted-foreground">
                {labels.nothingMatches(query.trim())}
              </p>
            )}
          </motion.div>
        ) : (
          <ul className="flex flex-col items-center gap-1" aria-label={labels.workspace}>
            {railItems.map((item) => {
              const active = item.id === activeId || hasDescendant(item, activeId)
              return (
                <li key={item.id}>
                  <RailTip label={item.label} enabled>
                    <button
                      type="button"
                      aria-label={item.label}
                      aria-current={item.id === activeId ? "page" : undefined}
                      disabled={item.disabled}
                      onClick={() => {
                        if (isContainer(item)) {
                          toggle(item.id, true)
                          setOpen(true)
                        } else activate(item)
                      }}
                      className={cn(
                        "grid size-8 cursor-pointer place-items-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                        active ? "bg-foreground/6" : "hover:bg-secondary"
                      )}
                    >
                      <ResourceIcon kind={item.kind} />
                    </button>
                  </RailTip>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {footer && <div className={cn("shrink-0 border-t border-border/60 p-2", !open && "flex justify-center")}>{footer(open)}</div>}
    </motion.nav>
  )
}

function hasDescendant(item: SidebarResource, id: string | null): boolean {
  if (!id || !item.children) return false
  return item.children.some((c) => c.id === id || hasDescendant(c, id))
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div data-slot="ai-sidebar-section" className="flex flex-col">
      <div className="px-3.5 pb-1 text-ui-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</div>
      {children}
    </div>
  )
}

/** Tooltip shown beside rail buttons. */
function RailTip({ label, enabled, children }: { label: string; enabled: boolean; children: React.ReactElement }) {
  if (!enabled) return children
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger render={children} />
      <TooltipContent side="right">{label}</TooltipContent>
    </TooltipPrimitive.Root>
  )
}

export { AISidebar, ResourceIcon, type AISidebarProps, type SidebarResource, type SidebarResourceKind }
