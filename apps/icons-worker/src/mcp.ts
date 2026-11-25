import { deleteIcon, getIcon, listIcons, upsertIcon } from "./store.ts";
import type { Env, IconInput } from "./types.ts";

type JsonRpcId = string | number | null;
type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
};

const SERVER_INFO = {
  name: "paneui-icons-mcp",
  version: "0.1.0",
};
const PROTOCOL_VERSION = "2025-03-26";

const TOOLS = [
  {
    name: "search_icons",
    description: "Search PaneUI icons by keyword, category, or variant (outline/filled).",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keywords to match against icon names, tags, or categories." },
        category: { type: "string", description: "Optional category filter." },
        variant: { type: "string", enum: ["all", "outline", "filled"], description: "Filter outline vs filled pairs." },
        limit: { type: "number", description: "Maximum number of results (default 24, max 100)." },
      },
    },
  },
  {
    name: "get_icon",
    description: "Get the full SVG markup, React JSX component usage, tags, and metadata for one icon by name.",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", description: "Kebab-case icon name, e.g. 'sparkles' or 'arrow-right'." },
      },
    },
  },
  {
    name: "list_categories",
    description: "List all available icon categories and their current icon counts.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "add_icon",
    description: "Publish a new 24x24 rounded outline icon to the live PaneUI icon catalog (requires bearer write token).",
    inputSchema: {
      type: "object",
      required: ["name", "svg"],
      properties: {
        name: { type: "string", description: "Kebab-case icon name, e.g. 'rocket-launch'." },
        component: { type: "string", description: "Optional PascalCase component name ending in Icon (e.g. 'RocketLaunchIcon')." },
        category: { type: "string", description: "Category name, e.g. 'Actions', 'Code & AI', 'Navigation', 'UI'." },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Search keywords and synonyms.",
        },
        variant: { type: "string", enum: ["outline", "filled"], description: "Defaults to outline." },
        svg: {
          type: "string",
          description: "Safe 24x24 SVG markup (or inner primitives) using currentColor strokes and rounded geometry.",
        },
      },
    },
  },
  {
    name: "update_icon",
    description: "Update an existing live icon in the PaneUI icon catalog (requires bearer write token).",
    inputSchema: {
      type: "object",
      required: ["name", "svg"],
      properties: {
        name: { type: "string", description: "Kebab-case icon name to update." },
        component: { type: "string" },
        category: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        variant: { type: "string", enum: ["outline", "filled"] },
        svg: { type: "string", description: "Replacement 24x24 SVG markup using currentColor." },
      },
    },
  },
  {
    name: "delete_icon",
    description: "Remove a live custom icon from D1 (builtin icons remain intact; requires bearer write token).",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", description: "Kebab-case icon name to delete." },
      },
    },
  },
];

export function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  const len = Math.max(ab.length, bb.length);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < len; i++) {
    diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return diff === 0;
}

export function isWriteAuthorized(request: Request, env: Env): boolean {
  const expected = env.ICON_MCP_WRITE_TOKEN?.trim();
  if (!expected) return false;
  const auth = request.headers.get("Authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(auth.trim());
  if (!m) return false;
  return timingSafeEqual(m[1].trim(), expected);
}

function rpcOk(id: JsonRpcId, result: unknown): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function rpcErr(id: JsonRpcId, code: number, message: string, status = 200): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function toolResult(data: unknown, isError = false) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: typeof data === "object" && data !== null ? data : { value: data },
    ...(isError ? { isError: true } : {}),
  };
}

export async function handleMcpRequest(request: Request, env: Env): Promise<Response> {
  let payload: JsonRpcRequest;
  try {
    payload = (await request.json()) as JsonRpcRequest;
  } catch {
    return rpcErr(null, -32700, "Parse error: invalid JSON payload.", 400);
  }

  if (!payload || payload.jsonrpc !== "2.0" || typeof payload.method !== "string") {
    return rpcErr(payload?.id ?? null, -32600, "Invalid Request: expected JSON-RPC 2.0.", 400);
  }

  const id: JsonRpcId = payload.id ?? null;
  const method = payload.method;
  const params = payload.params ?? {};

  if (method === "notifications/initialized" || id === null && method.startsWith("notifications/")) {
    return new Response(null, { status: 202 });
  }

  if (method === "initialize") {
    const requestedVersion = typeof params.protocolVersion === "string" ? params.protocolVersion : PROTOCOL_VERSION;
    return rpcOk(id, {
      protocolVersion: requestedVersion,
      capabilities: {
        tools: { listChanged: false },
      },
      serverInfo: SERVER_INFO,
      instructions: "PaneUI rounded 24x24 icon library. Read tools are public; add_icon, update_icon, and delete_icon require a Bearer token in Authorization.",
    });
  }

  if (method === "ping") {
    return rpcOk(id, {});
  }

  if (method === "tools/list") {
    return rpcOk(id, { tools: TOOLS });
  }

  if (method === "tools/call") {
    const name = typeof params.name === "string" ? params.name : "";
    const args = (typeof params.arguments === "object" && params.arguments !== null ? params.arguments : {}) as Record<string, unknown>;

    if (name === "search_icons") {
      const limit = Math.min(Math.max(Number(args.limit) || 24, 1), 100);
      const data = await listIcons(env.ICONS_DB, {
        q: typeof args.query === "string" ? args.query : "",
        category: typeof args.category === "string" ? args.category : undefined,
        variant: typeof args.variant === "string" ? args.variant : undefined,
        limit,
      });
      return rpcOk(id, toolResult(data));
    }

    if (name === "get_icon") {
      const iconName = typeof args.name === "string" ? args.name : "";
      const icon = await getIcon(env.ICONS_DB, iconName);
      if (!icon) {
        return rpcOk(id, toolResult({ error: `Icon "${iconName}" not found.` }, true));
      }
      return rpcOk(id, toolResult({ icon }));
    }

    if (name === "list_categories") {
      const data = await listIcons(env.ICONS_DB);
      return rpcOk(id, toolResult({ total: data.total, live: data.live, categories: data.categories }));
    }

    if (name === "add_icon" || name === "update_icon" || name === "delete_icon") {
      if (!isWriteAuthorized(request, env)) {
        return rpcOk(id, toolResult({ error: "Unauthorized: valid Bearer ICON_MCP_WRITE_TOKEN is required for write tools." }, true));
      }
      if (!env.ICONS_DB) {
        return rpcOk(id, toolResult({ error: "D1 database (ICONS_DB) is not bound; catalog is read-only." }, true));
      }

      if (name === "delete_icon") {
        const iconName = typeof args.name === "string" ? args.name : "";
        const deleted = await deleteIcon(env.ICONS_DB, iconName);
        if (!deleted) {
          return rpcOk(id, toolResult({ error: `Live icon "${iconName}" not found in D1.` }, true));
        }
        return rpcOk(id, toolResult({ deleted: true, name: iconName.trim().toLowerCase() }));
      }

      try {
        const input: IconInput = {
          name: String(args.name ?? ""),
          component: typeof args.component === "string" ? args.component : undefined,
          category: typeof args.category === "string" ? args.category : undefined,
          tags: Array.isArray(args.tags) ? args.tags.map(String) : typeof args.tags === "string" ? args.tags : undefined,
          variant: args.variant === "filled" ? "filled" : "outline",
          svg: typeof args.svg === "string" ? args.svg : undefined,
          body: typeof args.body === "string" ? args.body : undefined,
        };
        const res = await upsertIcon(env.ICONS_DB, input);
        return rpcOk(id, toolResult({ ...res, liveUrl: `https://icons.paneui.dev/?icon=${res.icon.name}` }));
      } catch (err) {
        return rpcOk(id, toolResult({ error: err instanceof Error ? err.message : "Failed to save icon." }, true));
      }
    }

    return rpcErr(id, -32601, `Unknown tool: ${name}`);
  }

  return rpcErr(id, -32601, `Method not found: ${method}`);
}
