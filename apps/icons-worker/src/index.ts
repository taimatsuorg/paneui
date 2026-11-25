import { handleMcpRequest, isWriteAuthorized } from "./mcp.ts";
import { deleteIcon, getFeed, getHealth, getIcon, listIcons, upsertIcon } from "./store.ts";
import type { Env, IconInput } from "./types.ts";

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const configured = (env.ALLOWED_ORIGINS || "*").trim();
  const origin = request.headers.get("Origin");
  let allowOrigin = "*";
  if (configured !== "*") {
    const list = configured.split(",").map((s) => s.trim()).filter(Boolean);
    allowOrigin = origin && list.includes(origin) ? origin : list[0] ?? "*";
  }
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Mcp-Session-Id, MCP-Protocol-Version",
    "Access-Control-Expose-Headers": "Mcp-Session-Id",
    ...(allowOrigin !== "*" ? { Vary: "Origin" } : {}),
  };
}

function withCors(response: Response, cors: Record<string, string>, extraHeaders: Record<string, string> = {}): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries({ ...cors, ...extraHeaders })) {
    headers.set(k, v);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function json(data: unknown, status = 200, cors: Record<string, string> = {}, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...cors,
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "GET" && pathname === "/health") {
      return json(await getHealth(env.ICONS_DB), 200, cors);
    }

    if (pathname === "/mcp") {
      if (request.method === "POST") {
        const res = await handleMcpRequest(request, env);
        return withCors(res, cors);
      }
      if (request.method === "DELETE") {
        return new Response(null, { status: 204, headers: cors });
      }
      return json(
        { error: "Method not allowed. Send JSON-RPC 2.0 requests via POST /mcp." },
        405,
        cors,
        { Allow: "POST, DELETE, OPTIONS" },
      );
    }

    if (pathname === "/api/feed" && request.method === "GET") {
      const limitParam = Number(url.searchParams.get("limit") ?? 20);
      const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 20;
      return json(await getFeed(env.ICONS_DB, limit), 200, cors, {
        "Cache-Control": "public, max-age=5, stale-while-revalidate=30",
      });
    }

    if (pathname === "/api/icons" && request.method === "GET") {
      const q = url.searchParams.get("q") ?? "";
      const category = url.searchParams.get("category") ?? undefined;
      const variant = url.searchParams.get("variant") ?? undefined;
      const limitParam = Number(url.searchParams.get("limit") ?? 0);
      const data = await listIcons(env.ICONS_DB, {
        q,
        category,
        variant,
        limit: Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined,
      });
      return json(data, 200, cors, {
        "Cache-Control": "public, max-age=5, stale-while-revalidate=30",
      });
    }

    if (pathname === "/api/icons" && request.method === "POST") {
      if (!isWriteAuthorized(request, env)) {
        return json({ error: "Unauthorized" }, 401, cors);
      }
      if (!env.ICONS_DB) {
        return json({ error: "D1 database (ICONS_DB) is not bound." }, 503, cors);
      }
      try {
        const body = (await request.json()) as IconInput;
        const result = await upsertIcon(env.ICONS_DB, body);
        return json(result, result.created ? 201 : 200, cors);
      } catch (err) {
        return json({ error: err instanceof Error ? err.message : "Invalid icon payload." }, 400, cors);
      }
    }

    const itemMatch = /^\/api\/icons\/([a-z0-9-]+)$/.exec(pathname);
    if (itemMatch) {
      const name = itemMatch[1];
      if (request.method === "GET") {
        const icon = await getIcon(env.ICONS_DB, name);
        if (!icon) return json({ error: "Icon not found" }, 404, cors);
        return json({ icon }, 200, cors, {
          "Cache-Control": "public, max-age=5, stale-while-revalidate=30",
        });
      }
      if (request.method === "DELETE") {
        if (!isWriteAuthorized(request, env)) {
          return json({ error: "Unauthorized" }, 401, cors);
        }
        if (!env.ICONS_DB) {
          return json({ error: "D1 database (ICONS_DB) is not bound." }, 503, cors);
        }
        const deleted = await deleteIcon(env.ICONS_DB, name);
        if (!deleted) return json({ error: "Icon not found in D1" }, 404, cors);
        return json({ deleted: true, name }, 200, cors);
      }
    }

    if (env.ASSETS && !pathname.startsWith("/api/") && pathname !== "/mcp" && pathname !== "/health") {
      return env.ASSETS.fetch(request);
    }

    return json({ error: "Not found" }, 404, cors);
  },
};
