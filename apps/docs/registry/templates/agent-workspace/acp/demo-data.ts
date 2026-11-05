/*
 * Content for the offline demo agent (mock-agent.ts): the workspace it
 * pretends to sit in, the past sessions it can replay through session/load,
 * and the canned terminal. Replace or delete this file once you only use real
 * agents through the bridge.
 */

export type DemoProvider = "codex" | "claude" | "gemini"

export type DemoThread = {
  sessionId: string
  title: string
  provider: DemoProvider
  repo: string
  pr?: { number: number; status: "open" | "draft" | "merged" | "closed" }
  branch: string
  group: "Recent" | "Today" | "Yesterday"
}

export const DEMO_CWD = "/Users/you/workspace"

export const DEMO_THREADS: DemoThread[] = [
  { sessionId: "sess_fix_drag", title: "Fix broken chat dragging behavior", provider: "codex", repo: "workspace", pr: { number: 1526, status: "open" }, branch: "feat/fix-chat-dragging", group: "Recent" },
  { sessionId: "sess_split_close", title: "Redesign Split Chats With Close Button", provider: "codex", repo: "workspace", pr: { number: 1525, status: "open" }, branch: "feat/simplify-split-chats", group: "Recent" },
  { sessionId: "sess_hide_empty", title: "Hide Empty Threads From Horizontal Tabs", provider: "codex", repo: "workspace", pr: { number: 1522, status: "open" }, branch: "feat/hide-empty-chats", group: "Recent" },
  { sessionId: "sess_chat_error", title: "Unexpected chat error 52a79f2a-5cfd-4c1e", provider: "codex", repo: "workspace", pr: { number: 1521, status: "open" }, branch: "feat/investigate-chat-error", group: "Recent" },
  { sessionId: "sess_long_chat", title: "Check long-chat and multi-agent bug fixes", provider: "codex", repo: "workspace", pr: { number: 1523, status: "open" }, branch: "feat/fix-chat-reliability", group: "Recent" },
  { sessionId: "sess_scrollbar", title: "Scrollbar orizzontale indesiderata nella sidebar", provider: "codex", repo: "workspace", pr: { number: 1519, status: "open" }, branch: "feat/remove-unwanted-scrollbar", group: "Today" },
  { sessionId: "sess_screenshot", title: "Check if screenshot behavior is normal", provider: "claude", repo: "landing-site", branch: "main", group: "Today" },
  { sessionId: "sess_icons", title: "Sostituire icone search bar con il set emoji", provider: "claude", repo: "landing-site", branch: "main", group: "Today" },
  { sessionId: "sess_spacing", title: "Aumentare spaziatura icone come archivio", provider: "claude", repo: "landing-site", branch: "main", group: "Today" },
  { sessionId: "sess_shortcuts", title: "Personalizzazione shortcut con tastiera", provider: "codex", repo: "billing-api", pr: { number: 1508, status: "merged" }, branch: "main", group: "Yesterday" },
  { sessionId: "sess_expiry", title: "Configurable expiry with 24h option", provider: "codex", repo: "billing-api", pr: { number: 1507, status: "merged" }, branch: "feat/configurable-expiry", group: "Yesterday" },
]

export const DEMO_FILES = [
  "apps/web/src/components/chat/SplitChatSurface.tsx",
  "apps/web/src/components/chat/SplitPaneLayout.tsx",
  "apps/web/src/components/chat/SplitPaneLayout.browser.tsx",
  "apps/web/src/components/chat/ChatComposer.tsx",
  "apps/web/src/components/chat/MessagesTimeline.tsx",
  "apps/web/src/components/sidebar/SidebarThreadRow.tsx",
  "apps/web/src/components/sidebar/ThreadTabStrip.tsx",
  "apps/web/src/lib/pointerOverlay.ts",
  "apps/web/src/lib/layoutPersistence.ts",
  "apps/web/src/index.css",
  "apps/server/src/providers/codex.ts",
  "apps/server/src/providers/claude.ts",
  "apps/desktop/src/main.ts",
  "docs/core-concepts.md",
  "docs/keybindings.md",
  "package.json",
  "README.md",
]

/* ----------------------------- generated code ----------------------------- */

const CODE = [
  "  const {name}Ref = useRef<HTMLDivElement | null>(null)",
  "  const [{name}, set{Name}] = useState<number>(() => readStoredRatio(\"{name}\"))",
  "  useLayoutEffect(() => {",
  "    const node = {name}Ref.current",
  "    if (!node) return",
  "    const rect = node.getBoundingClientRect()",
  "    {name}Width.current = rect.width",
  "  }, [{name}])",
  "  const on{Name}Move = useCallback((event: PointerEvent) => {",
  "    const delta = event.clientX - startX.current",
  "    set{Name}(clampRatio(startRatio.current + delta / {name}Width.current))",
  "  }, [])",
  "  // {name}: keep the drafts mounted while the panes resize",
  "  if (!{name}Ready) return null",
]
const NAMES = ["divider", "guide", "pane", "split", "overlay", "drag", "handle", "ratio", "left", "right", "drafts", "frame"]

function cap(s: string) {
  return s[0].toUpperCase() + s.slice(1)
}

/** `n` distinct, plausible TypeScript lines. */
function codeLines(n: number, seed: number) {
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    const name = `${NAMES[(i + seed) % NAMES.length]}${Math.floor((i + seed) / NAMES.length) || ""}`
    out.push(CODE[(i * 5 + seed) % CODE.length].replaceAll("{name}", name).replaceAll("{Name}", cap(name)) + (i % 7 === 6 ? "" : ` // ${seed}.${i}`))
  }
  return out
}

const surfaceHead = [
  'import { useCallback, useLayoutEffect, useRef, useState } from "react"',
  "",
  'import { SplitPaneLayout } from "./SplitPaneLayout"',
  'import { ChatPane } from "./ChatPane"',
  "",
  "export function SplitChatSurface({ left, right }: SplitChatSurfaceProps) {",
]
const surfaceTail = ["  )", "}", ""]

export const DEMO_EDITS: { path: string; oldText: string | null; newText: string }[] = [
  {
    path: "apps/web/src/components/chat/SplitChatSurface.tsx",
    oldText: [...surfaceHead, ...codeLines(184, 3), "  return (", ...surfaceTail].join("\n"),
    newText: [
      ...surfaceHead,
      "  return (",
      "    <SplitPaneLayout storageKey=\"split-chat\" minPaneWidth={320}>",
      "      <ChatPane thread={left} />",
      "      <ChatPane thread={right} />",
      ...surfaceTail,
    ].join("\n"),
  },
  {
    path: "apps/web/src/components/chat/SplitPaneLayout.browser.tsx",
    oldText: null,
    newText: codeLines(177, 11).join("\n"),
  },
  {
    path: "apps/web/src/components/chat/SplitPaneLayout.tsx",
    oldText: null,
    newText: codeLines(190, 23).join("\n"),
  },
  {
    path: "docs/core-concepts.md",
    oldText: [
      "## Split chats",
      "",
      "Open two threads side by side from a tab's context menu.",
      "Drag the divider to resize; the blue guide shows where it will land on release.",
      "",
      "Each pane keeps its own composer draft.",
    ].join("\n"),
    newText: [
      "## Split chats",
      "",
      "Open two threads side by side from a tab's context menu.",
      "Drag the divider to resize; both chats follow the pointer live.",
      "The layout is saved once, when you release the divider.",
      "",
      "Each pane keeps its own composer draft.",
    ].join("\n"),
  },
]

/* -------------------------------- terminal -------------------------------- */

const E = "\u001b["
export const DEMO_TERMINAL = [
  "",
  `${E}31m ▗▄▄▖ ${E}0m   ${E}1mAgent CLI${E}0m ${E}2mv2.1.289${E}0m`,
  `${E}31m▐▛██▜▌${E}0m   ${E}2mVerse 5.5 with high effort · Max plan${E}0m`,
  `${E}31m ▘▘▝▝ ${E}0m   ${E}2m~/.workspace-canary/worktrees/2d53/workspace · /rc${E}0m`,
  "",
  `${E}7m❯ what is this repo? tldr                                                   ${E}0m`,
  "",
  "● Workspace is a multi-provider coding-agent workspace. It runs as a web app,",
  "  server, CLI, and desktop app, with adapters for several agent providers, so",
  "  you can drive coding agents from one place.",
  "",
  `  - Releases: the desktop app ships as Workspace (Stable) and Workspace Beta from`,
  `    the same ${E}34mmain${E}0m branch. The release tag picks which one.`,
  "  - Focus: reliability during streaming, reconnects, cancellation, and",
  "    recovery.",
  `  - Your branch: ${E}34mfeat/fix-chat-dragging${E}0m, which is about resizing split chat`,
  "    panes.",
  "",
  `${E}2m✻ Churned for 4s · done 4:54 PM${E}0m`,
  "",
].join("\n")

export const DEMO_STATUS = `${E}34mVerse 5.5${E}0m  ${E}2mhigh${E}0m  ${E}2mworkspace:workspace75/${E}0m${E}35mfeat/fix-chat-dragging${E}0m  ${E}34m#1526 pending${E}0m\n${E}32m5%${E}0m  ${E}2m1.0M${E}0m  ${E}32m3%${E}0m  ${E}31m95%${E}0m  ${E}33m▸▸ auto mode on${E}0m ${E}2m(shift+tab to cycle) · PR #1526 · ← 1 agent${E}0m`

/** Canned replies for the demo terminal's command line. */
export function demoShell(command: string): string {
  const c = command.trim()
  if (c === "git status")
    return `On branch feat/fix-chat-dragging\nChanges not staged for commit:\n  ${E}31mmodified:   apps/web/src/components/chat/SplitChatSurface.tsx${E}0m\n  ${E}31mmodified:   docs/core-concepts.md${E}0m\nUntracked files:\n  ${E}31mapps/web/src/components/chat/SplitPaneLayout.tsx${E}0m\n  ${E}31mapps/web/src/components/chat/SplitPaneLayout.browser.tsx${E}0m\n`
  if (c === "ls") return `${E}34mapps${E}0m  ${E}34mdocs${E}0m  ${E}34mpackages${E}0m  package.json  README.md  turbo.json\n`
  if (c.startsWith("bun") || c.startsWith("pnpm") || c.startsWith("npm"))
    return `${E}2m$ vitest run src/components/chat${E}0m\n ${E}32m✓${E}0m SplitPaneLayout.browser.tsx ${E}2m(12 tests)${E}0m\n ${E}32m✓${E}0m SplitChatSurface.test.tsx ${E}2m(34 tests)${E}0m\n\n ${E}32mTest Files  2 passed${E}0m\n      Tests  46 passed\n`
  if (c === "clear") return ""
  return `${E}2mdemo shell: \`${c.split(" ")[0]}\` runs for real once you connect the bridge (Settings → Agents).${E}0m\n`
}

/* --------------------------- replayed sessions ---------------------------- */

function at(h: number, m: number, s = 0) {
  const d = new Date()
  d.setHours(h, m, s, 0)
  return d.getTime()
}

const say = (text: string, chunk = 18) => {
  const parts: string[] = []
  for (let i = 0; i < text.length; i += chunk) parts.push(text.slice(i, i + chunk))
  return parts
}

/** The session shown first in the demo, replayed with `session/load`. */
export function fixDragReplay(): { at: number; update: Record<string, unknown> }[] {
  const steps: { at: number; update: Record<string, unknown> }[] = []
  const push = (t: number, update: Record<string, unknown>) => steps.push({ at: t, update })
  const tool = (t: number, id: string, title: string, kind: string, extra: Record<string, unknown> = {}, done = 3) => {
    push(t, { sessionUpdate: "tool_call", toolCallId: id, title, kind, status: "in_progress", ...extra })
    push(t + done * 1000, { sessionUpdate: "tool_call_update", toolCallId: id, status: "completed" })
  }
  const t0 = at(14, 52, 20)
  push(t0, {
    sessionUpdate: "user_message_chunk",
    content: { type: "text", text: "Dragging a chat out of the sidebar leaves a small floating fragment instead of the row preview. Horizontal tabs are fine. Can you find out why?" },
  })
  push(t0 + 15000, { sessionUpdate: "agent_thought_chunk", content: { type: "text", text: "Compare the sidebar row's dragstart with the tab strip's reorder handler." } })
  tool(t0 + 15000, "t1", "Read SidebarThreadRow.tsx", "read", { locations: [{ path: `${DEMO_CWD}/apps/web/src/components/sidebar/SidebarThreadRow.tsx` }] })
  tool(t0 + 20000, "t2", "Search “setDragImage” in apps/web/src", "search", { content: [{ type: "content", content: { type: "text", text: "2 matches in 1 file" } }] })
  tool(t0 + 26000, "t3", "Read ThreadTabStrip.tsx", "read", { locations: [{ path: `${DEMO_CWD}/apps/web/src/components/sidebar/ThreadTabStrip.tsx` }] })
  const m1 = at(14, 53, 0)
  for (const p of say(
    "The sidebar uses native drag events, while horizontal tabs use a separate reorder handler. I'm checking the sidebar's drag preview and drop events to see why you're getting that small floating fragment."
  ))
    push(m1, { sessionUpdate: "agent_message_chunk", content: { type: "text", text: p } })

  const u2 = at(14, 53, 18)
  push(u2, {
    sessionUpdate: "user_message_chunk",
    content: { type: "text", text: "Where did you start the drag shown here? The divider between the two chats" },
    _meta: { steering: true },
  })
  const w = at(14, 53, 26)
  tool(w, "t4", "Read SplitChatSurface.tsx", "read", { locations: [{ path: `${DEMO_CWD}/${DEMO_EDITS[0].path}` }] }, 2)
  tool(w + 4000, "t5", "Read pointerOverlay.ts", "read", { locations: [{ path: `${DEMO_CWD}/apps/web/src/lib/pointerOverlay.ts` }] }, 2)
  push(w + 9000, { sessionUpdate: "agent_thought_chunk", content: { type: "text", text: "The divider only moves a guide and commits on pointerup; make both panes follow the pointer and persist once." } })
  DEMO_EDITS.forEach((e, i) => {
    tool(w + 40000 + i * 50000, `e${i}`, `Edit ${e.path.split("/").pop()}`, "edit", {
      locations: [{ path: `${DEMO_CWD}/${e.path}` }],
      content: [{ type: "diff", path: e.path, oldText: e.oldText, newText: e.newText }],
    }, 6)
  })
  tool(w + 260000, "x1", "Run bun fmt && bun lint && bun typecheck", "execute", {
    rawInput: { command: "bun fmt && bun lint && bun typecheck" },
    content: [{ type: "content", content: { type: "text", text: "Checked 1,284 files in 2.1s. No fixes applied.\nlint: 0 problems\ntypecheck: done in 18.4s" } }],
  }, 40)
  tool(w + 310000, "x2", "Run bun run test src/components/chat", "execute", {
    rawInput: { command: "bun run test src/components/chat" },
    content: [{ type: "content", content: { type: "text", text: "✓ SplitPaneLayout.browser.tsx (12 tests)\n✓ SplitChatSurface.test.tsx (34 tests)\nTest Files  2 passed · Tests  46 passed" } }],
  }, 30)
  tool(w + 350000, "x3", "Check live resize in Chromium", "execute", { rawInput: { command: "bun run browser-check split-resize" } }, 30)
  const m2 = at(15, 0, 0)
  for (const p of say(
    "Fixed locally. The old divider moved only a blue guide and resized the chats on release. Both chats now resize continuously while dragging, with the layout saved once on release.\n\n- Formatting, lint, typecheck, and 46 relevant tests pass.\n- Mouse-driven Chromium check confirms live resizing and preserved drafts.\n- Reused the existing layout and pointer-overlay helpers.\n\nThe running Canary app hasn't been updated or verified yet.",
    24
  ))
    push(m2, { sessionUpdate: "agent_message_chunk", content: { type: "text", text: p } })
  return steps
}

/** A short replay for every other demo thread. */
export function genericReplay(thread: DemoThread): { at: number; update: Record<string, unknown> }[] {
  const base = thread.group === "Yesterday" ? Date.now() - 26 * 3600_000 : thread.group === "Today" ? Date.now() - 3 * 3600_000 : Date.now() - 50 * 60_000
  return [
    { at: base, update: { sessionUpdate: "user_message_chunk", content: { type: "text", text: thread.title } } },
    { at: base + 4000, update: { sessionUpdate: "tool_call", toolCallId: "g1", title: "Search the workspace", kind: "search", status: "completed" } },
    { at: base + 9000, update: { sessionUpdate: "tool_call", toolCallId: "g2", title: "Read MessagesTimeline.tsx", kind: "read", status: "completed" } },
    {
      at: base + 21000,
      update: {
        sessionUpdate: "agent_message_chunk",
        content: {
          type: "text",
          text: `I looked into **${thread.title}**. The behaviour comes from \`MessagesTimeline.tsx\`; the fix is on \`${thread.branch}\`${thread.pr ? ` in #${thread.pr.number}` : ""}. Ask me to continue, or open the diff to review it.`,
        },
      },
    },
  ]
}
