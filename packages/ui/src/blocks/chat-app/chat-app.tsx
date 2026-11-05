"use client"

import * as React from "react"
import { useLocale, localeLabels, type LocaleLabels } from "@paneui/ui/components/locale-provider"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { BotIcon, PlusIcon, SparklesIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { ChatBubble, ChatThread } from "@paneui/ui/blocks/chat/chat"
import { PromptBar } from "@paneui/ui/blocks/prompt-bar/prompt-bar"
import { AgentProgress, formatElapsed } from "@paneui/ui/components/agent-progress"
import { AISidebar, type SidebarResource } from "@paneui/ui/components/ai-sidebar"
import { Button } from "@paneui/ui/components/button"
import { IconChip } from "@paneui/ui/components/icon-chip"
import { ReasoningText } from "@paneui/ui/components/reasoning-text"
import { TodoList, type TodoItem } from "@paneui/ui/components/todo-list"

/* ───────────────────────────── Script model ───────────────────────────── */

/** What a (fake) agent does with one prompt. */
type AgentScript = {
  /** Phrases shown by the reasoning line before the plan appears. */
  thinking?: string[]
  /** Milliseconds spent "thinking". */
  thinkMs?: number
  /** Plan steps, run in order. `ms` is how long each one takes. */
  plan?: { title: string; ms: number; meta?: string; fail?: boolean }[]
  /** Verb shown in the progress readout while the plan runs. */
  verb?: string
  /** The reply, streamed word by word. */
  reply: string
}

type Turn =
  | { id: string; role: "user"; text: string }
  | {
      id: string
      role: "assistant"
      phase: "thinking" | "working" | "streaming" | "done" | "stopped"
      thinking: string[]
      verb: string
      plan: TodoItem[]
      text: string
      startedAt: number
      elapsed?: number
    }

const SAMPLE_SCRIPTS: { match: RegExp; script: AgentScript }[] = [
  {
    match: /trip|flight|kyoto|travel/i,
    script: {
      thinking: ["Thinking", "Checking your calendar", "Comparing routes"],
      verb: "Planning",
      plan: [
        { title: "Find free weekends in November", ms: 900, meta: "3 found" },
        { title: "Compare flights TPE → KIX", ms: 1500, meta: "14 fares" },
        { title: "Shortlist ryokan near Gion", ms: 1200, meta: "4 stays" },
        { title: "Draft a two-day itinerary", ms: 800 },
      ],
      reply:
        "The weekend of Nov 14–16 is open and fares are lowest then: a 07:40 TPE → KIX flight lands at 11:10, about NT$9,800 return. I shortlisted four ryokan within a ten-minute walk of Gion; Hiiragiya has the best reviews for a first stay. Want me to hold the flight and the room?",
    },
  },
  {
    match: /bug|test|fix|code|build/i,
    script: {
      thinking: ["Reading the repo", "Tracing the failure", "Forming a fix"],
      verb: "Debugging",
      plan: [
        { title: "Run the failing test suite", ms: 1100, meta: "2 failing" },
        { title: "Trace the hydration mismatch", ms: 1600 },
        { title: "Patch Date formatting on the server", ms: 900, meta: "1 file" },
        { title: "Re-run tests", ms: 1000, meta: "48 passed" },
      ],
      reply:
        "Fixed. The mismatch came from formatting dates with the server's locale while the client used the browser's. I pinned both to the user's timezone in `formatDate`, and all 48 tests pass now. The change is a single file, ready for review.",
    },
  },
]

const FALLBACK_SCRIPT: AgentScript = {
  thinking: ["Thinking", "Reading the context", "Connecting the details"],
  verb: "Working",
  plan: [
    { title: "Understand the request", ms: 700 },
    { title: "Gather what's relevant", ms: 1300, meta: "6 sources" },
    { title: "Write the answer", ms: 900 },
  ],
  reply:
    "Here's what I found: the short version is that it's doable this week. I've laid out the steps above and kept the details tight, so you can skim the plan and tell me which part to start on.",
}

function defaultRespond(prompt: string, labels: LocaleLabels = localeLabels.en): AgentScript {
  const index = SAMPLE_SCRIPTS.findIndex((s) => s.match.test(prompt))
  const kind = index === 0 ? "travel" : index === 1 ? "code" : "general"
  return { ...(SAMPLE_SCRIPTS[index]?.script ?? FALLBACK_SCRIPT), thinking: labels.chatThinking(kind), verb: labels.chatVerb(kind) }
}

/* ──────────────────────────── Sample sidebar ──────────────────────────── */

const SAMPLE_ITEMS: SidebarResource[] = [
  {
    id: "p-travel",
    label: "Travel",
    kind: "project",
    children: [
      { id: "c-kyoto", label: "Kyoto long weekend", kind: "file" },
      { id: "c-visa", label: "Japan visa checklist", kind: "file" },
    ],
  },
  {
    id: "p-app",
    label: "Dashboard app",
    kind: "project",
    children: [
      { id: "c-hydration", label: "Fix hydration bug in the date picker", kind: "file" },
      { id: "f-specs", label: "Specs", kind: "folder", children: [{ id: "c-onboarding", label: "Onboarding flow review", kind: "file" }] },
    ],
  },
  {
    id: "f-personal",
    label: "Personal",
    kind: "folder",
    children: [
      { id: "c-gift", label: "Birthday gift ideas", kind: "file" },
      { id: "c-budget", label: "October budget", kind: "file" },
    ],
  },
]

const SAMPLE_BOOKMARKS: SidebarResource[] = [{ id: "b-weekly", label: "Weekly review prompt", kind: "bookmark" }]

const SUGGESTIONS = ["Plan a Kyoto trip in November", "Fix the failing date picker test"]

/* ─────────────────────────────── Helpers ─────────────────────────────── */

let uid = 0
const nextId = (p: string) => `${p}-${++uid}`

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("Aborted", "AbortError"))
    const onAbort = () => {
      window.clearTimeout(id)
      reject(new DOMException("Aborted", "AbortError"))
    }
    // Drop the abort listener once the wait is over, so a long streamed reply
    // doesn't pile up one closure per token on the signal.
    const id = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort)
      resolve()
    }, ms)
    signal.addEventListener("abort", onAbort, { once: true })
  })

/* ─────────────────────────────── Turns ─────────────────────────────── */

function AssistantTurn({ turn }: { turn: Extract<Turn, { role: "assistant" }> }) {
  const l10n = useLocale().labels

  const reduce = useReducedMotion()
  const live = turn.phase === "thinking" || turn.phase === "working" || turn.phase === "streaming"

  return (
    <motion.div
      data-slot="chat-app-assistant-turn"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="flex max-w-[88%] flex-col gap-2.5 self-start"
    >
      <div className="flex h-6 items-center gap-2 pl-1">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-primary">
          <SparklesIcon size={13} />
        </span>
        <AnimatePresence mode="popLayout" initial={false}>
          {turn.phase === "thinking" ? (
            <motion.span key="think" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ReasoningText phrases={turn.thinking} mode="cascade" interval={1400} />
            </motion.span>
          ) : live ? (
            <motion.span key="work" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AgentProgress
                label={turn.phase === "streaming" ? l10n.writing : turn.verb}
                initialElapsed={(performance.now() - turn.startedAt) / 1000}
              />
            </motion.span>
          ) : (
            <motion.span
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-ui-sm text-muted-foreground tabular-nums"
            >
              {turn.phase === "stopped" ? l10n.stoppedAfter(formatElapsed(turn.elapsed ?? 0)) : l10n.workedFor(formatElapsed(turn.elapsed ?? 0))}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {turn.plan.length > 0 && <TodoList items={turn.plan} title={l10n.plan} collapseOnComplete className="w-[min(26rem,100%)]" />}

      {turn.text && (
        <ChatBubble from="assistant">
          {turn.text}
          {turn.phase === "streaming" && (
            <span
              aria-hidden
              className="ml-0.5 inline-block h-[1.05em] w-[0.45em] translate-y-[0.15em] animate-pulse rounded-[2px] bg-foreground/70"
            />
          )}
        </ChatBubble>
      )}
    </motion.div>
  )
}

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  const l10n = useLocale().labels

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <IconChip size="xl" className="text-primary-text">
        <BotIcon />
      </IconChip>
      <div className="flex flex-col gap-1">
        <p className="text-lg font-semibold">{l10n.whatShouldWeWorkOn}</p>
        <p className="text-ui text-muted-foreground">{l10n.askAnythingOrStartFromOneOfThese}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <Button key={s} variant="secondary" size="sm" onClick={() => onPick(s)}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────── ChatApp ─────────────────────────────── */

type ChatAppProps = {
  /** Workspace tree for the sidebar. */
  items?: SidebarResource[]
  bookmarks?: SidebarResource[]
  /** Maps a prompt to what the (fake) agent does. Swap in your own transport for real streaming. */
  respond?: (prompt: string) => AgentScript
  /** Sends this prompt once on mount, so a demo plays by itself. */
  autoPlayPrompt?: string
  /** Shell width (px) below which the sidebar folds to its rail. */
  collapseSidebarBelow?: number
  /** ⌘/Ctrl + this key focuses the sidebar search. `null` disables it (e.g. when the page owns ⌘K). */
  searchHotkey?: string | null
  className?: string
}

/**
 * A complete agent workspace: an AI sidebar, a conversation where each agent
 * turn reasons, lays out a plan, works through it and streams its reply, and a
 * prompt bar with stop. Ships with a scripted fake agent.
 */
function ChatApp({
  items = SAMPLE_ITEMS,
  bookmarks = SAMPLE_BOOKMARKS,
  respond,
  autoPlayPrompt,
  collapseSidebarBelow = 640,
  searchHotkey = "k",
  className,
}: ChatAppProps) {
  const l10n = useLocale().labels

  const [turns, setTurns] = React.useState<Turn[]>([])
  const [busy, setBusy] = React.useState(false)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [chatTitle, setChatTitle] = React.useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const abortRef = React.useRef<AbortController | null>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const stickRef = React.useRef(true)

  const patchAssistant = React.useCallback(
    (id: string, fn: (t: Extract<Turn, { role: "assistant" }>) => Extract<Turn, { role: "assistant" }>) =>
      setTurns((prev) => prev.map((t) => (t.id === id && t.role === "assistant" ? fn(t) : t))),
    []
  )

  const send = React.useCallback(
    async (prompt: string) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const { signal } = controller
      const script = respond ? respond(prompt) : defaultRespond(prompt, l10n)
      const aId = nextId("a")
      const startedAt = performance.now()
      stickRef.current = true
      setBusy(true)
      setChatTitle((t) => (t ?? prompt.slice(0, 48)))
      setTurns((prev) => [
        ...prev,
        { id: nextId("u"), role: "user", text: prompt },
        {
          id: aId,
          role: "assistant",
          phase: "thinking",
          thinking: script.thinking ?? [l10n.thinking],
          verb: script.verb ?? l10n.working,
          plan: [],
          text: "",
          startedAt,
        },
      ])

      const elapsed = () => (performance.now() - startedAt) / 1000
      try {
        await sleep(script.thinkMs ?? 2200, signal)
        const plan = script.plan ?? []
        patchAssistant(aId, (t) => ({
          ...t,
          phase: "working",
          plan: plan.map((s, i) => ({ id: `${aId}-s${i}`, title: s.title, status: "pending" })),
        }))
        for (let i = 0; i < plan.length; i++) {
          const step = plan[i]
          patchAssistant(aId, (t) => ({
            ...t,
            plan: t.plan.map((p, j) => (j === i ? { ...p, status: "in-progress" } : p)),
          }))
          await sleep(step.ms, signal)
          patchAssistant(aId, (t) => ({
            ...t,
            plan: t.plan.map((p, j) => (j === i ? { ...p, status: step.fail ? "failed" : "done", meta: step.meta } : p)),
          }))
        }
        patchAssistant(aId, (t) => ({ ...t, phase: "streaming" }))
        const words = script.reply.split(/(\s+)/)
        let text = ""
        for (const w of words) {
          text += w
          const snapshot = text
          patchAssistant(aId, (t) => ({ ...t, text: snapshot }))
          if (w.trim()) await sleep(28 + Math.random() * 40, signal)
        }
        patchAssistant(aId, (t) => ({ ...t, phase: "done", elapsed: elapsed() }))
      } catch {
        patchAssistant(aId, (t) => ({
          ...t,
          phase: "stopped",
          elapsed: elapsed(),
          plan: t.plan.map((p) => (p.status === "in-progress" ? { ...p, status: "failed", meta: l10n.stopped } : p)),
        }))
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null
          setBusy(false)
        }
      }
    },
    [patchAssistant, respond, l10n]
  )

  const stop = () => abortRef.current?.abort()

  React.useEffect(() => () => abortRef.current?.abort(), [])

  // Demo autoplay, once.
  const autoplayed = React.useRef(false)
  React.useEffect(() => {
    if (!autoPlayPrompt || autoplayed.current) return
    autoplayed.current = true
    const id = window.setTimeout(() => void send(autoPlayPrompt), 600)
    return () => {
      window.clearTimeout(id)
      autoplayed.current = false
    }
  }, [autoPlayPrompt, send])

  // Follow the stream while the reader is at the bottom.
  React.useEffect(() => {
    const el = scrollRef.current
    if (el && stickRef.current) el.scrollTo({ top: el.scrollHeight })
  }, [turns])

  // Fold the sidebar to its rail when the shell itself gets narrow; only act on crossings.
  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    let narrow: boolean | null = null
    const ro = new ResizeObserver(([entry]) => {
      const now = entry.contentRect.width < collapseSidebarBelow
      if (now !== narrow) {
        if (now) setSidebarOpen(false)
        else if (narrow !== null) setSidebarOpen(true)
        narrow = now
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [collapseSidebarBelow])

  const newChat = () => {
    abortRef.current?.abort()
    setTurns([])
    setChatTitle(null)
    setActiveId(null)
  }

  return (
    <div
      ref={rootRef}
      data-slot="chat-app"
      className={cn("flex h-full min-h-0 w-full overflow-hidden rounded-2xl bg-background shadow-raised", className)}
    >
      <AISidebar
        items={items}
        bookmarks={bookmarks}
        activeId={activeId}
        onActiveChange={(id, item) => {
          setActiveId(id)
          setChatTitle(item.label)
        }}
        defaultExpandedIds={["p-travel"]}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        title={l10n.agent}
        searchHotkey={searchHotkey}
        renamable
        actions={(open) =>
          open ? (
            <Button variant="secondary" size="sm" className="w-full justify-start" onClick={newChat}>
              <PlusIcon data-icon="inline-start" />
              {l10n.newChat}
            </Button>
          ) : (
            <Button variant="secondary" size="icon-sm" aria-label={l10n.newChat} onClick={newChat}>
              <PlusIcon />
            </Button>
          )
        }
      />

      <section aria-label={l10n.conversation} className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border/60 px-4">
          <h2 className="min-w-0 flex-1 truncate text-ui font-semibold">{chatTitle ?? l10n.newChat}</h2>
          <AnimatePresence initial={false}>
            {busy && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-ui-sm font-medium text-primary-text"
              >
                {l10n.toolRunning}
              </motion.span>
            )}
          </AnimatePresence>
        </header>

        <div
          ref={scrollRef}
          onScroll={(e) => {
            const el = e.currentTarget
            stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
          }}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5"
        >
          {turns.length === 0 ? (
            <EmptyState onPick={(s) => void send(s)} />
          ) : (
            <ChatThread className="mx-auto w-full max-w-2xl gap-4" aria-busy={busy}>
              {turns.map((t) =>
                t.role === "user" ? (
                  <ChatBubble key={t.id} from="user">
                    {t.text}
                  </ChatBubble>
                ) : (
                  <AssistantTurn key={t.id} turn={t} />
                )
              )}
            </ChatThread>
          )}
        </div>

        <div className="shrink-0 px-4 pb-4">
          <PromptBar
            className="mx-auto max-w-2xl"
            placeholder={l10n.messageTheAgent}
            busy={busy}
            onSubmit={(v) => void send(v)}
            onStop={stop}
          />
        </div>
      </section>
    </div>
  )
}

export { ChatApp, defaultRespond, type ChatAppProps, type AgentScript }
