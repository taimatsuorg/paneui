import assert from "node:assert/strict";
import { describe, test } from "node:test";
import worker from "../src/index.ts";

function createSeededMockD1() {
  const now = "2026-11-25T12:00:00.000Z";
  const rows = new Map([
    [
      "sparkles",
      {
        name: "sparkles",
        component: "SparklesIcon",
        category: "Code & AI",
        tags: JSON.stringify(["sparkles", "ai", "magic"]),
        variant: "outline",
        body: '<path stroke="currentColor" d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path stroke="currentColor" d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /></svg>',
        jsx: "<SparklesIcon />",
        source: "builtin",
        created_at: now,
        updated_at: now,
      },
    ],
    [
      "home-filled",
      {
        name: "home-filled",
        component: "HomeFilledIcon",
        category: "Navigation",
        tags: JSON.stringify(["home", "filled"]),
        variant: "filled",
        body: '<path fill="currentColor" stroke="currentColor" d="M3 10l9-7 9 7v10H3z" />',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path fill="currentColor" stroke="currentColor" d="M3 10l9-7 9 7v10H3z" /></svg>',
        jsx: "<HomeFilledIcon />",
        source: "builtin",
        created_at: now,
        updated_at: now,
      },
    ],
  ]);

  const events = [];
  let nextEventId = 1;

  function makeStmt(query, bound = []) {
    return {
      bind(...values) {
        return makeStmt(query, values);
      },
      async first() {
        const q = query.trim().toUpperCase();
        if (q.startsWith("SELECT COUNT(*) AS COUNT FROM ICONS")) {
          return { count: rows.size };
        }
        if (q.startsWith("SELECT COUNT(*) AS COUNT FROM ICON_EVENTS")) {
          return { count: events.length };
        }
        if (q.includes("FROM ICONS WHERE NAME = ?")) {
          const row = rows.get(bound[0]);
          return row ? { ...row } : null;
        }
        return null;
      },
      async all() {
        const q = query.trim().toUpperCase();
        if (q.includes("GROUP BY") && q.includes("FROM ICON_EVENTS")) {
          const cutoff = typeof bound[0] === "string" ? bound[0] : "";
          const counts = new Map();
          for (const ev of events) {
            if (cutoff && ev.created_at < cutoff) continue;
            const date = ev.created_at.slice(0, 10);
            counts.set(date, (counts.get(date) ?? 0) + 1);
          }
          const results = [...counts.entries()]
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
          return { results, success: true };
        }
        if (q.includes("FROM ICON_EVENTS")) {
          const limit = Number(bound[0] ?? 20);
          return { results: events.slice(0, limit), success: true };
        }
        return {
          results: [...rows.values()].sort((a, b) => a.name.localeCompare(b.name)),
          success: true,
        };
      },
      async run() {
        const q = query.trim().toUpperCase();
        if (q.startsWith("INSERT INTO ICONS")) {
          const [name, component, category, tags, variant, body, svg, jsx, created_at, updated_at] = bound;
          const prev = rows.get(name);
          rows.set(name, {
            name,
            component,
            category,
            tags,
            variant,
            body,
            svg,
            jsx,
            source: "mcp",
            created_at: prev?.created_at ?? created_at,
            updated_at,
          });
          return { results: [], success: true };
        }
        if (q.startsWith("INSERT INTO ICON_EVENTS")) {
          const [action, icon_name, component, category, created_at] = bound;
          events.unshift({ id: nextEventId++, action, icon_name, component, category, created_at });
          return { results: [], success: true };
        }
        if (q.startsWith("DELETE FROM ICONS WHERE NAME = ?")) {
          rows.delete(bound[0]);
          return { results: [], success: true };
        }
        return { results: [], success: true };
      },
    };
  }

  return {
    prepare(query) {
      return makeStmt(query);
    },
  };
}

function callWorker(urlPath, { method = "GET", body, headers = {}, env } = {}) {
  const req = new Request(`https://worker.test${urlPath}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: typeof body === "string" ? body : JSON.stringify(body) } : {}),
  });
  return worker.fetch(req, env);
}

describe("icons-worker cloud D1 + MCP", () => {
  test("degrades cleanly to empty non-live state when D1 is unbound", async () => {
    const health = await callWorker("/health", { env: {} });
    assert.equal(health.status, 200);
    const healthData = await health.json();
    assert.equal(healthData.ok, true);
    assert.equal(healthData.d1Bound, false);
    assert.equal(healthData.count, 0);

    const list = await callWorker("/api/icons?q=sparkles", { env: {} });
    assert.equal(list.status, 200);
    const listData = await list.json();
    assert.equal(listData.live, false);
    assert.equal(listData.icons.length, 0);
  });

  test("serves cloud D1 icons, stats, feed, and MCP read tools", async () => {
    const env = { ICONS_DB: createSeededMockD1(), ICON_MCP_WRITE_TOKEN: "secret-token-123" };

    const health = await callWorker("/health", { env });
    const healthData = await health.json();
    assert.equal(healthData.count, 2);
    assert.equal(healthData.d1Bound, true);

    const init = await callWorker("/mcp", {
      method: "POST",
      body: { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26" } },
      env,
    });
    assert.equal(init.status, 200);
    const initJson = await init.json();
    assert.equal(initJson.result.serverInfo.name, "paneui-icons-mcp");

    const tools = await callWorker("/mcp", {
      method: "POST",
      body: { jsonrpc: "2.0", id: 2, method: "tools/list" },
      env,
    });
    const toolNames = (await tools.json()).result.tools.map((t) => t.name);
    assert.deepEqual(toolNames, ["search_icons", "get_icon", "list_categories", "add_icon", "update_icon", "delete_icon"]);

    const search = await callWorker("/mcp", {
      method: "POST",
      body: { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "search_icons", arguments: { query: "sparkles" } } },
      env,
    });
    const searchData = (await search.json()).result.structuredContent;
    assert.equal(searchData.live, true);
    assert.equal(searchData.icons[0].name, "sparkles");

    const getRes = await callWorker("/mcp", {
      method: "POST",
      body: { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "get_icon", arguments: { name: "home-filled" } } },
      env,
    });
    const getData = (await getRes.json()).result.structuredContent;
    assert.equal(getData.icon.component, "HomeFilledIcon");
    assert.equal(getData.icon.variant, "filled");

    const catsRes = await callWorker("/mcp", {
      method: "POST",
      body: { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "list_categories", arguments: {} } },
      env,
    });
    const catsData = (await catsRes.json()).result.structuredContent;
    assert.equal(catsData.total, 2);
    assert.equal(catsData.categories.length, 2);

    const apiRes = await callWorker("/api/icons", { env });
    const apiData = await apiRes.json();
    assert.deepEqual(apiData.activity, [{ date: "2026-11-25", count: 2 }]);
  });

  test("rejects unauthenticated writes and unsafe SVGs, then logs add/update/delete events to /api/feed", async () => {
    const env = {
      ICONS_DB: createSeededMockD1(),
      ICON_MCP_WRITE_TOKEN: "top-secret-token",
    };

    const unauthHttp = await callWorker("/api/icons", {
      method: "POST",
      body: { name: "rocket", svg: '<path d="M12 2l4 8H8z" />' },
      env,
    });
    assert.equal(unauthHttp.status, 401);

    const xssMcp = await callWorker("/mcp", {
      method: "POST",
      headers: { Authorization: "Bearer top-secret-token" },
      body: {
        jsonrpc: "2.0",
        id: 11,
        method: "tools/call",
        params: {
          name: "add_icon",
          arguments: { name: "evil", svg: '<svg viewBox="0 0 24 24"><script>alert(1)</script><path d="M2 2h20" /></svg>' },
        },
      },
      env,
    });
    assert.equal((await xssMcp.json()).result.isError, true);

    const hexMcp = await callWorker("/mcp", {
      method: "POST",
      headers: { Authorization: "Bearer top-secret-token" },
      body: {
        jsonrpc: "2.0",
        id: 12,
        method: "tools/call",
        params: {
          name: "add_icon",
          arguments: { name: "red-box", svg: '<rect x="3" y="3" width="18" height="18" stroke="#ff0000" />' },
        },
      },
      env,
    });
    assert.equal((await hexMcp.json()).result.isError, true);

    const addRes = await callWorker("/mcp", {
      method: "POST",
      headers: { Authorization: "Bearer top-secret-token" },
      body: {
        jsonrpc: "2.0",
        id: 13,
        method: "tools/call",
        params: {
          name: "add_icon",
          arguments: {
            name: "orbit",
            category: "Code & AI",
            tags: ["planet", "satellite"],
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3" /><ellipse cx="12" cy="12" rx="10" ry="4" /></svg>',
          },
        },
      },
      env,
    });
    const addJson = await addRes.json();
    assert.equal(addJson.result.isError, undefined);
    assert.equal(addJson.result.structuredContent.created, true);
    assert.equal(addJson.result.structuredContent.icon.source, "mcp");

    const apiList = await callWorker("/api/icons?q=satellite", { env });
    const apiListJson = await apiList.json();
    assert.equal(apiListJson.icons.length, 1);
    assert.equal(apiListJson.stats.mcpAdded, 1);

    await callWorker("/mcp", {
      method: "POST",
      headers: { Authorization: "Bearer top-secret-token" },
      body: {
        jsonrpc: "2.0",
        id: 14,
        method: "tools/call",
        params: {
          name: "update_icon",
          arguments: { name: "orbit", category: "UI", svg: '<circle cx="12" cy="12" r="8" />' },
        },
      },
      env,
    });

    await callWorker("/mcp", {
      method: "POST",
      headers: { Authorization: "Bearer top-secret-token" },
      body: {
        jsonrpc: "2.0",
        id: 15,
        method: "tools/call",
        params: { name: "delete_icon", arguments: { name: "orbit" } },
      },
      env,
    });

    const afterDelete = await callWorker("/api/icons/orbit", { env });
    assert.equal(afterDelete.status, 404);

    const feedRes = await callWorker("/api/feed", { env });
    const feedJson = await feedRes.json();
    assert.equal(feedJson.events.length, 3);
    assert.deepEqual(
      feedJson.events.map((e) => e.action),
      ["delete", "update", "add"],
    );
    assert.equal(
      feedJson.activity.reduce((sum, d) => sum + d.count, 0),
      5,
    );
  });

  test("serves static web UI via ASSETS binding for non-API routes", async () => {
    const env = {
      ASSETS: {
        async fetch(req) {
          const u = new URL(req.url);
          return new Response(`<html>${u.pathname}</html>`, {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        },
      },
    };
    const rootRes = await callWorker("/", { env });
    assert.equal(rootRes.status, 200);
    assert.equal(await rootRes.text(), "<html>/</html>");

    const apiMissing = await callWorker("/api/unknown", { env });
    assert.equal(apiMissing.status, 404);
  });
});
