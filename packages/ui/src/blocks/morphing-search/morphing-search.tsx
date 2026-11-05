"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Transition } from "motion/react"

import { SearchIcon, XIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"

type MorphingSearchItem = {
  id: string
  title: string
  description?: string
  /** Heading the item is listed under. Items without one go under "Results". */
  group?: string
  /** Extra words that should match. */
  keywords?: string[]
  icon?: React.ReactNode
  disabled?: boolean
  onSelect?: () => void
}

type MorphingSearchProps = {
  items: MorphingSearchItem[]
  placeholder?: string
  /** Render the closed trigger as a compact round icon instead of a field. */
  iconOnly?: boolean
  /**
   * Opt-in global shortcut: a letter pressed with ⌘ (macOS) or Ctrl opens the search,
   * e.g. "k". Off by default.
   */
  shortcut?: string
  /** Which edge of the trigger the surface stays pinned to. Default "start". */
  align?: "start" | "end"
  emptyMessage?: React.ReactNode
  /** Most results shown. Default 8. */
  limit?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onQueryChange?: (query: string) => void
  onSelect?: (item: MorphingSearchItem) => void
  /** Custom matcher; defaults to a word-start-aware substring match. */
  filter?: (item: MorphingSearchItem, query: string) => number | null
  className?: string
  /** Width of the open surface. */
  surfaceClassName?: string
}

const MORPH: Transition = { type: "spring", duration: 0.52, bounce: 0 }

/** Score an item: title prefix > word start > substring > keyword/description hit. */
function defaultFilter(item: MorphingSearchItem, query: string): number | null {
  const q = query.trim().toLowerCase()
  if (!q) return 0
  const title = item.title.toLowerCase()
  if (title.startsWith(q)) return 100 - title.length / 100
  const at = title.indexOf(q)
  if (at > 0 && /[\s\-_/.]/.test(title[at - 1])) return 80 - at / 100
  if (at > 0) return 60 - at / 100
  const extra = [...(item.keywords ?? []), item.description ?? ""].join(" ").toLowerCase()
  if (extra.includes(q)) return 40
  // All words present somewhere.
  const words = q.split(/\s+/)
  const hay = `${title} ${extra}`
  return words.every((w) => hay.includes(w)) ? 20 : null
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
  if (at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-2xs bg-primary/15 text-foreground">{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  )
}

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)

/**
 * A search field (or a compact icon) that morphs into a results surface. Results are
 * grouped, filtered as you type and driven from the keyboard: ↑/↓ to move, Enter to
 * pick, Escape to clear then close.
 */
function MorphingSearch({
  items,
  placeholder,
  iconOnly = false,
  shortcut,
  align = "start",
  emptyMessage,
  limit = 8,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onQueryChange,
  onSelect,
  filter = defaultFilter,
  className,
  surfaceClassName,
}: MorphingSearchProps) {
  const l10n = useLocale().labels
  if (placeholder === undefined) placeholder = l10n.search
  if (emptyMessage === undefined) emptyMessage = l10n.noMatches

  const reduceMotion = useReducedMotion()
  const uid = React.useId()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const open = openProp !== undefined ? openProp : uncontrolledOpen
  const [query, setQueryState] = React.useState("")
  const [cursor, setCursor] = React.useState(0)
  const [mac, setMac] = React.useState(false)
  React.useEffect(() => setMac(isMac()), [])

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange, openProp]
  )
  const setQuery = (next: string) => {
    setQueryState(next)
    setCursor(0)
    onQueryChange?.(next)
  }

  const close = React.useCallback(
    (restoreFocus = true) => {
      setOpen(false)
      if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus())
    },
    [setOpen]
  )

  // Ranked, grouped results. `flat` is the keyboard order.
  const { groups, flat } = React.useMemo(() => {
    const scored = items
      .map((item, index) => ({ item, index, score: filter(item, query) }))
      .filter((r): r is { item: MorphingSearchItem; index: number; score: number } => r.score !== null)
    if (query.trim()) scored.sort((a, b) => b.score - a.score || a.index - b.index)
    const top = scored.slice(0, limit).map((r) => r.item)
    const map = new Map<string, MorphingSearchItem[]>()
    for (const item of top) {
      const key = item.group ?? l10n.labelResults
      map.set(key, [...(map.get(key) ?? []), item])
    }
    const groups = [...map.entries()].map(([label, items]) => ({ label, items }))
    return { groups, flat: groups.flatMap((g) => g.items) }
  }, [items, query, filter, limit])

  const enabledFlat = flat.filter((item) => !item.disabled)
  const activeItem = enabledFlat[Math.min(cursor, enabledFlat.length - 1)]

  const choose = (item: MorphingSearchItem) => {
    if (item.disabled) return
    item.onSelect?.()
    onSelect?.(item)
    setQuery("")
    close()
  }

  // Focus the field as soon as the surface mounts.
  React.useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
    else setQueryState("")
  }, [open])

  // Outside press closes.
  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open, close])

  // Opt-in global shortcut.
  React.useEffect(() => {
    if (!shortcut) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === shortcut.toLowerCase() && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen(!open)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [shortcut, open, setOpen])

  // Keep the active option in view.
  React.useEffect(() => {
    if (!activeItem) return
    listRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(activeItem.id)}"]`)?.scrollIntoView({ block: "nearest" })
  }, [activeItem])

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const n = enabledFlat.length
    if (event.key === "ArrowDown" && n) {
      event.preventDefault()
      setCursor((c) => (Math.min(c, n - 1) + 1) % n)
    } else if (event.key === "ArrowUp" && n) {
      event.preventDefault()
      setCursor((c) => (Math.min(c, n - 1) - 1 + n) % n)
    } else if (event.key === "Home" && event.ctrlKey) {
      setCursor(0)
    } else if (event.key === "End" && event.ctrlKey) {
      setCursor(n - 1)
    } else if (event.key === "Enter" && activeItem) {
      event.preventDefault()
      choose(activeItem)
    } else if (event.key === "Escape") {
      event.preventDefault()
      if (query) setQuery("")
      else close()
    } else if (event.key === "Tab") {
      close(false)
    }
  }

  const surfaceId = `${uid}-surface`
  const listboxId = `${uid}-listbox`
  const optionId = (item: MorphingSearchItem) => `${uid}-opt-${item.id}`
  const transition = reduceMotion ? { duration: 0 } : MORPH
  const shortcutLabel = shortcut ? `${mac ? "⌘" : "Ctrl "}${shortcut.toUpperCase()}` : null

  return (
    <LayoutGroup id={uid}>
      <div
        ref={rootRef}
        data-slot="morphing-search"
        data-open={open || undefined}
        className={cn("relative inline-flex", iconOnly ? "size-8" : "h-8 w-64", className)}
      >
        {/* Closed trigger. The root keeps its size while open, so the layout never jumps. */}
        {!open && (
          <motion.button
            ref={triggerRef}
            type="button"
            layoutId={surfaceId}
            transition={transition}
            aria-label={iconOnly ? placeholder.replace(/…$/, "") : undefined}
            aria-haspopup="listbox"
            aria-expanded={false}
            aria-keyshortcuts={shortcut ? `${mac ? "Meta" : "Control"}+${shortcut.toUpperCase()}` : undefined}
            onClick={() => setOpen(true)}
            style={{ borderRadius: 999 }}
            className={cn(
              "flex size-full cursor-pointer items-center gap-2 bg-muted/70 text-ui text-muted-foreground shadow-well outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
              iconOnly ? "justify-center" : "px-3"
            )}
          >
            <motion.span layoutId={`${surfaceId}-icon`} transition={transition} className="flex shrink-0">
              <SearchIcon size={16} />
            </motion.span>
            {!iconOnly && (
              <>
                <span className="flex-1 truncate text-start">{placeholder}</span>
                {shortcutLabel && (
                  <kbd className="rounded-md bg-card px-1.5 py-0.5 font-sans text-ui-xs text-muted-foreground shadow-chip">
                    {shortcutLabel}
                  </kbd>
                )}
              </>
            )}
          </motion.button>
        )}

        <AnimatePresence>
          {open && (
            <motion.div
              key="surface"
              layoutId={surfaceId}
              transition={transition}
              style={{ borderRadius: 20 }}
              data-slot="morphing-search-surface"
              className={cn(
                "absolute top-0 z-50 flex w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden bg-popover text-popover-foreground shadow-surface",
                align === "start" ? "left-0" : "right-0",
                surfaceClassName
              )}
            >
              <div className="flex h-11 shrink-0 items-center gap-2.5 px-3.5">
                <motion.span layoutId={`${surfaceId}-icon`} transition={transition} className="flex shrink-0 text-muted-foreground">
                  <SearchIcon size={16} />
                </motion.span>
                <input
                  ref={inputRef}
                  role="combobox"
                  aria-expanded
                  aria-controls={listboxId}
                  aria-autocomplete="list"
                  aria-activedescendant={activeItem ? optionId(activeItem) : undefined}
                  aria-label={placeholder.replace(/…$/, "")}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={placeholder}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-full min-w-0 flex-1 bg-transparent text-ui text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  aria-label={query ? l10n.clearSearch : l10n.closeSearch}
                  onClick={() => (query ? (setQuery(""), inputRef.current?.focus()) : close())}
                  className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <XIcon size={13} />
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0, filter: reduceMotion ? "none" : "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)", transition: { delay: reduceMotion ? 0 : 0.08, duration: 0.22 } }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
                className="border-t border-border/60"
              >
                <div
                  ref={listRef}
                  id={listboxId}
                  role="listbox"
                  aria-label={l10n.labelResults}
                  className="max-h-80 overflow-y-auto overscroll-contain p-1.5"
                >
                  {groups.length === 0 ? (
                    <div role="presentation" className="px-3 py-6 text-center text-ui text-muted-foreground">
                      {emptyMessage}
                    </div>
                  ) : (
                    groups.map((group) => (
                      <div key={group.label} role="group" aria-labelledby={`${uid}-g-${group.label}`} className="not-first:mt-1.5">
                        <div id={`${uid}-g-${group.label}`} className="px-2.5 pt-1.5 pb-1 text-ui-xs font-medium tracking-wide text-muted-foreground uppercase">
                          {group.label}
                        </div>
                        {group.items.map((item) => {
                          const selected = item.id === activeItem?.id
                          return (
                            <div
                              key={item.id}
                              id={optionId(item)}
                              data-id={item.id}
                              role="option"
                              aria-selected={selected}
                              aria-disabled={item.disabled || undefined}
                              onPointerMove={() => {
                                const i = enabledFlat.indexOf(item)
                                if (i >= 0 && i !== cursor) setCursor(i)
                              }}
                              onPointerDown={(event) => event.preventDefault()}
                              onClick={() => choose(item)}
                              className={cn(
                                "relative flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-ui aria-disabled:cursor-default aria-disabled:opacity-50",
                                "[&_svg]:size-4 [&_svg]:shrink-0"
                              )}
                            >
                              {selected && (
                                <motion.span
                                  layoutId={`${surfaceId}-highlight`}
                                  transition={reduceMotion ? { duration: 0 } : { type: "spring", duration: 0.3, bounce: 0 }}
                                  className="absolute inset-0 rounded-lg bg-secondary"
                                />
                              )}
                              {item.icon && <span className="relative flex text-muted-foreground">{item.icon}</span>}
                              <span className="relative min-w-0 flex-1">
                                <span className="block truncate text-foreground">
                                  <Highlight text={item.title} query={query} />
                                </span>
                                {item.description && (
                                  <span className="block truncate text-ui-sm text-muted-foreground">{item.description}</span>
                                )}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    ))
                  )}
                </div>
                <div className="flex items-center gap-3 border-t border-border/60 px-3.5 py-2 text-ui-xs text-muted-foreground">
                  <span>
                    <kbd className="font-sans">↑↓</kbd> navigate
                  </span>
                  <span>
                    <kbd className="font-sans">↵</kbd> open
                  </span>
                  <span>
                    <kbd className="font-sans">esc</kbd> {l10n.close.toLowerCase()}
                  </span>
                  <span className="ml-auto tabular-nums" aria-live="polite">
                    {flat.length} {flat.length === 1 ? "result" : l10n.results}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  )
}

export { MorphingSearch }
export type { MorphingSearchItem, MorphingSearchProps }
