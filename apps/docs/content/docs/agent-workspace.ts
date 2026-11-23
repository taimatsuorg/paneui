import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Chat with coding agents and review their work.", "zh": "与编码助手对话并查看工作进度。"},
  usage: {
    imports: `// One command, into a new app:
// pnpm dlx shadcn@latest init -d -n my-agent https://paneui.dev/r/agent-workspace.json
// or into an existing one (replaces app/page.tsx):
// pnpm dlx shadcn@latest add https://paneui.dev/r/agent-workspace.json
import { AgentWorkspace } from "@/components/agent-workspace/agent-workspace"`,
    code: `// app/page.tsx (installed for you: the workspace is the home page)
export default function AgentPage() {
  return <AgentWorkspace />
}

// Then, to drive real agents:
// node server/acp-bridge.mjs --root .
// and paste the printed address + token into Settings → Agents.`,
  },
  composition: `AgentWorkspace
├── SidebarRail                   app rail, provider avatars, settings
├── ResizablePanelGroup
│   ├── ThreadsSidebar            ThreadList / ThreadListItem
│   └── shell-inset panel
│       ├── TabStrip              open threads, reorder + close
│       ├── ChatPane (× 2 split)  MessageScroller → WorkSummary, messages,
│       │                         ToolApproval, EditedFilesCard;
│       │                         AgentComposer + ModePicker · ThinkingModelPicker
│       └── Dock                  Terminal (TerminalView) · Explorer (FileTree) · Browser
├── CommandPalette (⌘K) · SettingsDialog · review Dialog (FileDiff)
└── acp/                          AcpClient store, transports, demo agent
server/acp-bridge.mjs             WebSocket ↔ stdio bridge for real agents`,
  examples: [],
  notes: [
    {
      title: "What it is",
      body: { en: "A multi-provider coding-agent workspace that is a real [Agent Client Protocol](https://agentclientprotocol.com/get-started/introduction) client. Threads are ACP sessions. Streamed `session/update` notifications become messages, step logs (`tool_call` / `tool_call_update`), the plan, slash commands (`available_commands_update`), modes and models. `session/request_permission` opens an approval card, and `diff` content becomes the Edited files card with Undo and Review.", zh: "一个多提供方编码 agent 工作区，是真正的 [Agent Client Protocol](https://agentclientprotocol.com/get-started/introduction) 客户端。线程是 ACP 会话。流式 `session/update` 通知变成消息、步骤日志（`tool_call` / `tool_call_update`）、计划、斜杠命令（`available_commands_update`）、模式和模型。`session/request_permission` 打开审批卡片，`diff` 内容变成带有撤销和审阅的已编辑文件卡片。" },
    },
    {
      title: "Offline demo",
      body: { en: "Out of the box it connects to an in-browser demo agent (`acp/mock-agent.ts`) that answers the same JSON-RPC methods as a real agent and replays a scripted session, so the page works as a static site. Switch Access to “Ask first” to see a permission request. Delete `acp/demo-data.ts` and the demo entry in `parts/agents.ts` when you only use real agents.", zh: "开箱即用，它连接到一个浏览器内的演示 agent（`acp/mock-agent.ts`），它像真实 agent 一样回答相同的 JSON-RPC 方法，并重放脚本化会话，因此页面可作为静态站点工作。将 Access 切换为“先询问”以查看权限请求。当你只使用真实 agent 时，删除 `acp/demo-data.ts` 和 `parts/agents.ts` 中的演示条目。" },
    },
    {
      title: "Running the bridge",
      body: { en: "Browsers cannot spawn agents, so `server/acp-bridge.mjs` (Node 18+, needs `ws`) does it. Run `node server/acp-bridge.mjs --root /path/to/repo` (options `--port 8787`, `--host 127.0.0.1`, `--token`, `--verbose`; or `ACP_BRIDGE_*` env vars). It prints `ws://127.0.0.1:8787` and a token. In the workspace open Settings → Agents, paste both, pick an agent and press Connect.", zh: "浏览器无法启动 agent，所以由 `server/acp-bridge.mjs`（Node 18+，需要 `ws`）来完成。运行 `node server/acp-bridge.mjs --root /path/to/repo`（选项 `--port 8787`、`--host 127.0.0.1`、`--token`、`--verbose`；或 `ACP_BRIDGE_*` 环境变量）。它会打印 `ws://127.0.0.1:8787` 和一个 token。在工作区中打开 Settings → Agents，粘贴两者，选择一个 agent 并按 Connect。" },
    },
    {
      title: "Agents",
      body: { en: "Any ACP agent works; the presets are Claude Code (`npx -y @zed-industries/claude-code-acp`, sign in with `claude /login` or set `ANTHROPIC_API_KEY`), Codex (`npx -y @zed-industries/codex-acp`, `OPENAI_API_KEY` or a ChatGPT login) and Gemini CLI (`gemini --experimental-acp`). Add others with a name, command, arguments and environment; they are saved in localStorage.", zh: "任何 ACP agent 都可以；预设为 Claude Code（`npx -y @zed-industries/claude-code-acp`，用 `claude /login` 登录或设置 `ANTHROPIC_API_KEY`）、Codex（`npx -y @zed-industries/codex-acp`、`OPENAI_API_KEY` 或 ChatGPT 登录）和 Gemini CLI（`gemini --experimental-acp`）。用名称、命令、参数和环境添加其他 agent；它们保存在 localStorage 中。" },
    },
    {
      title: "What the bridge serves",
      body: { en: "It pipes ACP between the WebSocket and the agent's stdio and answers the client-side methods itself (`fs/read_text_file`, `fs/write_text_file` and `terminal/create` · `output` · `wait_for_exit` · `kill` · `release`), all confined to `--root`. Terminal output and file writes are mirrored to the page as `_bridge/*` notifications (live output in the dock, Undo on edited files), and `_bridge/list_files`, `read_file`, `write_file` and `exec` power the explorer, @mentions and the terminal.", zh: "它在 WebSocket 和 agent 的 stdio 之间管道传输 ACP，并自行回答客户端方法（`fs/read_text_file`、`fs/write_text_file` 和 `terminal/create` · `output` · `wait_for_exit` · `kill` · `release`），全部限制在 `--root` 内。终端输出和文件写入作为 `_bridge/*` 通知镜像到页面（停靠区中的实时输出，已编辑文件的撤销），而 `_bridge/list_files`、`read_file`、`write_file` 和 `exec` 为资源管理器、@提及和终端提供支持。" },
    },
    {
      title: "Security",
      body: { en: "Whoever holds the token can run commands as you inside the workspace root. The bridge binds to 127.0.0.1 and rejects WebSocket upgrades without the token; keep it that way, and do not expose the port.", zh: "持有 token 的任何人都可以在工作区根目录内以你的身份运行命令。桥接仅绑定到 127.0.0.1，并拒绝没有 token 的 WebSocket 升级；保持这样，不要暴露端口。" },
    },
    {
      title: "Keyboard",
      body: { en: "⌘K command palette, ⌘N new thread, ⌘B threads sidebar, ⌘J terminal panel, ⌘\\\\ split chats, ⌘1–9 switch tabs, ⌘, settings. In the composer, Enter sends, Shift+Enter adds a line, Esc stops the agent, @ mentions files and / lists the agent's commands. Every divider drags, collapses (Enter) and remembers its size.", zh: "⌘K 命令面板，⌘N 新线程，⌘B 线程侧边栏，⌘J 终端面板，⌘\\\\ 拆分聊天，⌘1–9 切换标签页，⌘, 设置。在 composer 中，Enter 发送，Shift+Enter 换行，Esc 停止 agent，@ 提及文件，/ 列出 agent 的命令。每个分隔条都可拖动、折叠（Enter）并记住其大小。" },
    },
  ],
  api: [
    {
      name: "AcpClient",
      description: { en: "Framework-free ACP client store (`acp/client.ts`); read it in React with `useAcpClient(client)`.", zh: "无框架的 ACP 客户端存储（`acp/client.ts`）；在 React 中用 `useAcpClient(client)` 读取它。" },
      props: [
        { name: "connect", type: "(transport, options?) => Promise<InitializeResponse>", description: { en: "Attach a transport and run `initialize`; `beforeInitialize` runs first (the bridge's `_bridge/spawn`).", zh: "附加传输并运行 `initialize`；`beforeInitialize` 先运行（桥接的 `_bridge/spawn`）。" } },
        { name: "newSession / loadSession / listSessions", type: "(cwd, …) => Promise", description: { en: "`session/new`, `session/load` (history replays into the timeline), `session/list`.", zh: "`session/new`、`session/load`（历史重放到时间线）、`session/list`。" } },
        { name: "prompt", type: "(sessionId, text) => Promise<PromptResponse | null>", description: { en: "`session/prompt`; `@path` mentions become `resource_link` blocks. Sending while the agent works cancels and steers.", zh: "`session/prompt`；`@path` 提及变成 `resource_link` 块。agent 工作时发送会取消并转向。" } },
        { name: "cancel", type: "(sessionId) => void", description: { en: "`session/cancel`; pending permission requests resolve as cancelled.", zh: "`session/cancel`；待处理的权限请求解析为已取消。" } },
        { name: "setMode / setConfigOption / setModel", type: "(sessionId, id, value?) => Promise", description: { en: "`session/set_mode`, `session/set_config_option`, unstable `session/set_model`.", zh: "`session/set_mode`、`session/set_config_option`、不稳定的 `session/set_model`。" } },
        { name: "resolvePermission", type: "(sessionId, itemId, optionId | null) => void", description: { en: "Answer a `session/request_permission`.", zh: "回答 `session/request_permission`。" } },
        { name: "runShell / refreshFiles / readFile / undoEdits", type: "…", description: { en: "Bridge helpers for the terminal, explorer and Undo.", zh: "用于终端、资源管理器和撤销的桥接辅助函数。" } },
      ],
    },
    {
      name: "createWebSocketTransport / createMockTransport",
      description: { en: "Transports implementing `AcpTransport` (`send`, `onMessage`, `onClose`, `close`).", zh: "实现 `AcpTransport`（`send`、`onMessage`、`onClose`、`close`）的传输。" },
      props: [
        { name: "createWebSocketTransport", type: "(url: string) => Promise<AcpTransport>", description: { en: "WebSocket to the bridge, e.g. `ws://127.0.0.1:8787/?token=…`.", zh: "到桥接的 WebSocket，例如 `ws://127.0.0.1:8787/?token=…`。" } },
        { name: "createMockTransport", type: "({ speed? }) => AcpTransport", description: { en: "In-memory demo agent.", zh: "内存演示 agent。" } },
      ],
    },
  ],
} satisfies ComponentDoc
