import type * as acp from "@agentclientprotocol/sdk"

import {
  DEMO_CWD,
  DEMO_EDITS,
  DEMO_FILES,
  DEMO_THREADS,
  demoShell,
  fixDragReplay,
  genericReplay,
} from "./demo-data"
import { createEmitter, type AcpTransport, type JsonRpcId, type JsonRpcMessage } from "./transport"

/**
 * An in-memory ACP agent. It answers the same JSON-RPC methods a real agent
 * does (initialize, session/new, session/load, session/list, session/prompt,
 * session/cancel, session/set_mode, session/set_config_option) and plays a
 * scripted turn for every prompt: thoughts, a plan, tool calls, a permission
 * request in "Ask" mode, a diff, terminal output and a streamed answer. It
 * also fakes the bridge's `_bridge/*` methods so the explorer and terminal
 * work offline.
 */

const MODES: acp.SessionMode[] = [
  { id: "ask", name: "Ask first", description: "Ask before editing files or running commands" },
  { id: "auto", name: "Auto-edit", description: "Edit files freely, ask before commands" },
  { id: "full", name: "Full access", description: "Edit files and run commands without asking" },
]

function configOptions(model = "gpt-6.1-sol", effort = "high"): acp.SessionConfigOption[] {
  return [
    {
      id: "model",
      name: "Model",
      category: "model",
      type: "select",
      currentValue: model,
      options: [
        {
          group: "codex",
          name: "Codex",
          options: [
            { value: "gpt-6.1-sol", name: "Sol 6.1", description: "Most capable for long coding tasks" },
            { value: "gpt-6.1", name: "Core 6.1", description: "Fast and capable" },
            { value: "gpt-6.1-mini", name: "Core 6.1 Mini", description: "Quick edits and questions" },
          ],
        },
        {
          group: "claude",
          name: "Claude",
          options: [
            { value: "sonnet-5.5", name: "Verse 5.5", description: "Balanced speed and depth" },
            { value: "opus-5", name: "Verse 5 Deep", description: "Deepest reasoning" },
          ],
        },
      ],
    },
    {
      id: "effort",
      name: "Reasoning effort",
      category: "thought_level",
      type: "select",
      currentValue: effort,
      options: [
        { value: "low", name: "Low", description: "Fastest, for small edits" },
        { value: "medium", name: "Medium", description: "Balanced" },
        { value: "high", name: "High", description: "Thinks longer on hard problems" },
        { value: "xhigh", name: "Extra high", description: "Slowest, most thorough" },
      ],
    },
  ]
}

const COMMANDS: acp.AvailableCommand[] = [
  { name: "review", description: "Review the current diff before you push" },
  { name: "plan", description: "Outline the steps before editing", input: { hint: "what to plan" } },
  { name: "test", description: "Run the relevant tests and fix failures" },
  { name: "compact", description: "Summarise the conversation to free context" },
  { name: "init", description: "Write an AGENTS.md for this repository" },
  { name: "status", description: "Show model, branch and context usage" },
]

type MockSession = { mode: string; model: string; effort: string; timers: number[]; promptId: JsonRpcId | null; turn: number }

export type MockTransportOptions = {
  /** Speed multiplier for the scripted turn (2 = twice as fast). */
  speed?: number
}

export function createMockTransport({ speed = 1 }: MockTransportOptions = {}): AcpTransport {
  const toClient = createEmitter<JsonRpcMessage>()
  const closed = createEmitter<string>()
  const sessions = new Map<string, MockSession>()
  const permissionWaiters = new Map<JsonRpcId, (r: acp.RequestPermissionResponse) => void>()
  let rid = 1000
  let alive = true

  const emit = (m: Omit<JsonRpcMessage, "jsonrpc">) => {
    if (!alive) return
    // Deliver asynchronously, like a real transport.
    setTimeout(() => toClient.emit({ jsonrpc: "2.0", ...m }), 0)
  }
  const update = (sessionId: string, u: Record<string, unknown>) =>
    emit({ method: "session/update", params: { sessionId, update: u } })
  const respond = (id: JsonRpcId, result: unknown) => emit({ id, result })
  const fail = (id: JsonRpcId, code: number, message: string) => emit({ id, error: { code, message } })

  const ask = (sessionId: string, toolCall: acp.ToolCallUpdate) =>
    new Promise<acp.RequestPermissionResponse>((resolve) => {
      const id = rid++
      permissionWaiters.set(id, resolve)
      emit({
        id,
        method: "session/request_permission",
        params: {
          sessionId,
          toolCall,
          options: [
            { optionId: "allow_once", name: "Allow once", kind: "allow_once" },
            { optionId: "allow_always", name: "Always allow", kind: "allow_always" },
            { optionId: "reject_once", name: "Reject", kind: "reject_once" },
          ],
        } satisfies acp.RequestPermissionRequest,
      })
    })

  function newSession(id: string) {
    const s: MockSession = { mode: "full", model: "gpt-6.1-sol", effort: "high", timers: [], promptId: null, turn: 0 }
    sessions.set(id, s)
    setTimeout(() => update(id, { sessionUpdate: "available_commands_update", availableCommands: COMMANDS }), 30)
    return s
  }

  /** The scripted turn played for each prompt. */
  async function play(sessionId: string, promptId: JsonRpcId, text: string) {
    const s = sessions.get(sessionId)!
    s.promptId = promptId
    const turn = ++s.turn
    // Tool call ids must stay unique within the session, replayed history included.
    const tag = `${turn}-${Date.now().toString(36)}`
    const live = () => s.promptId === promptId && s.turn === turn && alive
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        s.timers.push(window.setTimeout(resolve, ms / speed))
      })
    const say = async (kind: "agent_message_chunk" | "agent_thought_chunk", body: string, chunk = 6, every = 28) => {
      const words = body.split(/(?<=\s)/)
      for (let i = 0; i < words.length && live(); i += chunk) {
        update(sessionId, { sessionUpdate: kind, content: { type: "text", text: words.slice(i, i + chunk).join("") } })
        await wait(every)
      }
    }
    const stop = (reason: acp.StopReason) => {
      if (s.promptId !== promptId) return
      s.promptId = null
      respond(promptId, { stopReason: reason } satisfies acp.PromptResponse)
    }

    if (text.trim().startsWith("/")) {
      const name = text.trim().slice(1).split(/\s/)[0]
      await wait(400)
      await say("agent_message_chunk", name === "status"
        ? `**Status**\n\n- Model: \`${s.model}\` · effort \`${s.effort}\`\n- Mode: ${MODES.find((m) => m.id === s.mode)?.name}\n- Branch: \`feat/fix-chat-dragging\` · PR #1526\n- Context: 18% of 1M tokens used`
        : `Ran \`/${name}\`. In this demo commands are acknowledged only; connect a real agent through the bridge to run them.`)
      update(sessionId, { sessionUpdate: "usage_update", used: 182_000, size: 1_000_000 })
      return stop("end_turn")
    }

    await wait(350)
    await say("agent_thought_chunk", `Figure out what "${text.slice(0, 60)}" touches, change it, then run the checks.`, 4, 40)
    if (!live()) return
    const plan = (done: number): acp.PlanEntry[] =>
      ["Find the code involved", "Make the change", "Run lint and tests"].map((content, i) => ({
        content,
        priority: "medium",
        status: i < done ? "completed" : i === done ? "in_progress" : "pending",
      }))
    update(sessionId, { sessionUpdate: "plan", entries: plan(0) })
    update(sessionId, { sessionUpdate: "tool_call", toolCallId: `r-${tag}`, title: "Search the workspace", kind: "search", status: "in_progress" })
    await wait(900)
    update(sessionId, {
      sessionUpdate: "tool_call_update",
      toolCallId: `r-${tag}`,
      status: "completed",
      content: [{ type: "content", content: { type: "text", text: "3 matches in 2 files" } }],
    })
    update(sessionId, { sessionUpdate: "tool_call", toolCallId: `f-${tag}`, title: "Read SplitPaneLayout.tsx", kind: "read", status: "in_progress", locations: [{ path: `${DEMO_CWD}/${DEMO_EDITS[2].path}` }] })
    await wait(700)
    update(sessionId, { sessionUpdate: "tool_call_update", toolCallId: `f-${tag}`, status: "completed" })
    if (!live()) return
    update(sessionId, { sessionUpdate: "plan", entries: plan(1) })

    const path = "docs/core-concepts.md"
    const oldText = DEMO_EDITS[3].newText
    const newText = `${oldText}\n\n> ${text.replace(/\n/g, " ").slice(0, 120)}`
    const edit: acp.ToolCallUpdate = {
      toolCallId: `e-${tag}`,
      title: `Edit ${path}`,
      kind: "edit",
      status: "pending",
      locations: [{ path: `${DEMO_CWD}/${path}` }],
      content: [{ type: "diff", path, oldText, newText }],
    }
    update(sessionId, { sessionUpdate: "tool_call", ...edit, title: edit.title! })
    if (s.mode === "ask") {
      const res = await ask(sessionId, edit)
      if (!live()) return
      if (res.outcome.outcome === "cancelled") return stop("cancelled")
      if (res.outcome.optionId === "reject_once") {
        update(sessionId, { sessionUpdate: "tool_call_update", toolCallId: edit.toolCallId, status: "failed" })
        await say("agent_message_chunk", "Understood, I left the file untouched. Tell me what you would like instead.")
        return stop("end_turn")
      }
      if (res.outcome.optionId === "allow_always") {
        s.mode = "auto"
        update(sessionId, { sessionUpdate: "current_mode_update", currentModeId: "auto" })
      }
    }
    update(sessionId, { sessionUpdate: "tool_call_update", toolCallId: edit.toolCallId, status: "in_progress" })
    await wait(800)
    update(sessionId, { sessionUpdate: "tool_call_update", toolCallId: edit.toolCallId, status: "completed" })
    if (!live()) return
    update(sessionId, { sessionUpdate: "plan", entries: plan(2) })

    // A command whose output streams into an embedded terminal.
    const terminalId = `term-${sessionId}-${turn}`
    update(sessionId, {
      sessionUpdate: "tool_call",
      toolCallId: `x-${tag}`,
      title: "Run bun run test src/components/chat",
      kind: "execute",
      status: "in_progress",
      rawInput: { command: "bun run test src/components/chat" },
      content: [{ type: "terminal", terminalId }],
    })
    const lines = demoShell("bun run test").split("\n")
    for (const line of lines) {
      if (!live()) return
      emit({ method: "_bridge/terminal_output", params: { terminalId, data: `${line}\n`, title: "bun test", sessionId } })
      await wait(160)
    }
    emit({ method: "_bridge/terminal_exit", params: { terminalId, exitStatus: { exitCode: 0, signal: null } } })
    update(sessionId, { sessionUpdate: "tool_call_update", toolCallId: `x-${tag}`, status: "completed" })
    update(sessionId, { sessionUpdate: "plan", entries: plan(3) })
    if (!live()) return
    await wait(300)
    await say(
      "agent_message_chunk",
      `Done. I noted your request in \`${path}\` and re-ran the chat tests:\n\n- 46 tests pass across 2 files.\n- No lint or type errors.\n\nThis is the offline demo agent. Open **Settings → Agents** to connect Claude Code, Codex or Gemini through the ACP bridge.`
    )
    update(sessionId, { sessionUpdate: "usage_update", used: 182_000 + turn * 9_000, size: 1_000_000 })
    stop("end_turn")
  }

  function replay(sessionId: string, id: JsonRpcId) {
    const thread = DEMO_THREADS.find((t) => t.sessionId === sessionId)
    if (!thread) return fail(id, -32002, `Session ${sessionId} not found`)
    const s = sessions.get(sessionId) ?? newSession(sessionId)
    const steps = sessionId === "sess_fix_drag" ? fixDragReplay() : genericReplay(thread)
    for (const step of steps) update(sessionId, { ...step.update, _meta: { ...(step.update._meta as object), timestamp: step.at } })
    if (thread.provider === "claude") s.model = "sonnet-5.5"
    respond(id, { modes: { currentModeId: s.mode, availableModes: MODES }, configOptions: configOptions(s.model, s.effort) } satisfies acp.LoadSessionResponse)
  }

  function handle(msg: JsonRpcMessage) {
    // Responses to our requests (permission answers).
    if (!msg.method && msg.id != null) {
      const resolve = permissionWaiters.get(msg.id)
      permissionWaiters.delete(msg.id)
      resolve?.((msg.result as acp.RequestPermissionResponse) ?? { outcome: { outcome: "cancelled" } })
      return
    }
    const { id, method } = msg
    const params = (msg.params ?? {}) as Record<string, unknown>
    switch (method) {
      case "initialize":
        return respond(id!, {
          protocolVersion: 1,
          agentInfo: { name: "demo-agent", title: "Demo agent", version: "1.0.0" },
          agentCapabilities: {
            loadSession: true,
            promptCapabilities: { image: false, audio: false, embeddedContext: true },
            sessionCapabilities: { list: {} },
          },
          authMethods: [],
        } satisfies acp.InitializeResponse)
      case "session/new": {
        const sessionId = `sess_${Math.random().toString(36).slice(2, 10)}`
        const s = newSession(sessionId)
        return respond(id!, { sessionId, modes: { currentModeId: s.mode, availableModes: MODES }, configOptions: configOptions() } satisfies acp.NewSessionResponse)
      }
      case "session/list":
        return respond(id!, {
          sessions: DEMO_THREADS.map((t) => ({
            sessionId: t.sessionId,
            cwd: DEMO_CWD,
            title: t.title,
            _meta: { provider: t.provider, repo: t.repo, pr: t.pr, branch: t.branch, group: t.group },
          })),
        } satisfies acp.ListSessionsResponse)
      case "session/load":
        return replay(String(params.sessionId), id!)
      case "session/prompt": {
        const sessionId = String(params.sessionId)
        if (!sessions.has(sessionId)) newSession(sessionId)
        const prompt = (params.prompt as acp.ContentBlock[]) ?? []
        const text = prompt.map((b) => (b.type === "text" ? b.text : "")).join("")
        void play(sessionId, id!, text)
        return
      }
      case "session/cancel": {
        const s = sessions.get(String(params.sessionId))
        if (!s) return
        for (const t of s.timers) window.clearTimeout(t)
        s.timers = []
        for (const [rid, resolve] of permissionWaiters) {
          resolve({ outcome: { outcome: "cancelled" } })
          permissionWaiters.delete(rid)
        }
        if (s.promptId != null) {
          const pid = s.promptId
          s.promptId = null
          respond(pid, { stopReason: "cancelled" } satisfies acp.PromptResponse)
        }
        return
      }
      case "session/set_mode": {
        const s = sessions.get(String(params.sessionId))
        if (s) s.mode = String(params.modeId)
        respond(id!, {})
        return update(String(params.sessionId), { sessionUpdate: "current_mode_update", currentModeId: String(params.modeId) })
      }
      case "session/set_config_option": {
        const s = sessions.get(String(params.sessionId))
        if (s && params.configId === "model") s.model = String(params.value)
        if (s && params.configId === "effort") s.effort = String(params.value)
        return respond(id!, { configOptions: configOptions(s?.model, s?.effort) } satisfies acp.SetSessionConfigOptionResponse)
      }
      /* Bridge extension methods, faked for the offline demo. */
      case "_bridge/list_files":
        return respond(id!, { files: DEMO_FILES, root: DEMO_CWD })
      case "_bridge/read_file": {
        const path = String(params.path)
        const edit = DEMO_EDITS.find((e) => e.path === path)
        return respond(id!, { content: edit?.newText ?? `// ${path}\n// (demo workspace: connect the bridge to browse real files)\n` })
      }
      case "_bridge/write_file":
        return respond(id!, {})
      case "_bridge/exec": {
        const terminalId = String(params.terminalId)
        const out = demoShell(String(params.command))
        setTimeout(() => {
          emit({ method: "_bridge/terminal_output", params: { terminalId, data: out } })
          respond(id!, { exitCode: 0 })
        }, 180 / speed)
        return
      }
      default:
        if (id != null) fail(id, -32601, `Method not found: ${method}`)
    }
  }

  return {
    label: "Demo agent (offline)",
    send: (m) => {
      if (alive) setTimeout(() => handle(m), 0)
    },
    onMessage: toClient.on,
    onClose: closed.on,
    close: () => {
      alive = false
      for (const s of sessions.values()) for (const t of s.timers) window.clearTimeout(t)
      closed.emit("Closed")
    },
  }
}
