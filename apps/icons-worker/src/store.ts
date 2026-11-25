import { normalizeIconInput } from "./svg-sanitize.ts";
import type { ActivityDay, CatalogStats, D1Database, IconEvent, IconInput, IconRecord } from "./types.ts";

type DbRow = {
  name: string;
  component: string;
  category: string;
  tags: string;
  variant: string;
  body: string;
  svg: string;
  jsx: string;
  source?: string;
  created_at: string;
  updated_at: string;
};

type EventRow = {
  id: number;
  action: string;
  icon_name: string;
  component: string;
  category: string;
  created_at: string;
};

function rowToIcon(row: DbRow): IconRecord {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(row.tags);
    if (Array.isArray(parsed)) tags = parsed.map(String);
  } catch {
    tags = [];
  }
  return {
    name: row.name,
    component: row.component,
    category: row.category,
    tags,
    variant: row.variant === "filled" ? "filled" : "outline",
    body: row.body,
    svg: row.svg,
    jsx: row.jsx,
    source: row.source === "builtin" ? "builtin" : "mcp",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToEvent(row: EventRow): IconEvent {
  const action = row.action === "delete" ? "delete" : row.action === "update" ? "update" : "add";
  return {
    id: Number(row.id) || 0,
    action,
    iconName: row.icon_name,
    component: row.component,
    category: row.category,
    createdAt: row.created_at,
  };
}

export async function getAllIcons(
  db?: D1Database,
): Promise<{ icons: IconRecord[]; live: boolean; updatedAt: string | null }> {
  if (!db) {
    return { icons: [], live: false, updatedAt: null };
  }

  try {
    const { results } = await db
      .prepare(
        "SELECT name, component, category, tags, variant, body, svg, jsx, source, created_at, updated_at FROM icons ORDER BY name ASC",
      )
      .all<DbRow>();
    const icons = (results ?? []).map(rowToIcon);
    let latest: string | null = null;
    for (const icon of icons) {
      if (!latest || (icon.updatedAt && icon.updatedAt > latest)) {
        latest = icon.updatedAt ?? latest;
      }
    }
    return { icons, live: true, updatedAt: latest };
  } catch {
    return { icons: [], live: false, updatedAt: null };
  }
}

export async function getRecentEvents(
  db?: D1Database,
  limit = 20,
): Promise<{ events: IconEvent[]; totalEvents: number }> {
  if (!db) return { events: [], totalEvents: 0 };
  try {
    const { results } = await db
      .prepare("SELECT id, action, icon_name, component, category, created_at FROM icon_events ORDER BY id DESC LIMIT ?")
      .bind(limit)
      .all<EventRow>();
    const countRow = await db.prepare("SELECT COUNT(*) AS count FROM icon_events").first<{ count: number }>();
    return {
      events: (results ?? []).map(rowToEvent),
      totalEvents: Number(countRow?.count ?? results?.length ?? 0),
    };
  } catch {
    return { events: [], totalEvents: 0 };
  }
}

export function scoreIcon(icon: IconRecord, terms: string[]): number {
  if (terms.length === 0) return 1;
  const name = icon.name.toLowerCase();
  const component = icon.component.toLowerCase();
  const category = icon.category.toLowerCase();
  const tags = icon.tags.map((t) => t.toLowerCase());
  let total = 0;

  for (const term of terms) {
    let best = 0;
    if (name === term) best = Math.max(best, 100);
    else if (name.startsWith(term)) best = Math.max(best, 75);
    else if (name.includes(term)) best = Math.max(best, 55);

    if (component.includes(term)) best = Math.max(best, 50);
    if (tags.some((t) => t === term)) best = Math.max(best, 60);
    else if (tags.some((t) => t.includes(term))) best = Math.max(best, 35);
    if (category.includes(term)) best = Math.max(best, 25);

    if (best === 0) return 0;
    total += best;
  }
  return total;
}

function buildStats(icons: IconRecord[], eventCount: number): CatalogStats {
  let mcpAdded = 0;
  let filled = 0;
  for (const icon of icons) {
    if (icon.source === "mcp") mcpAdded++;
    if (icon.variant === "filled") filled++;
  }
  return {
    total: icons.length,
    mcpAdded,
    outline: icons.length - filled,
    filled,
    eventCount,
  };
}

export async function getDailyActivity(
  db: D1Database | undefined,
  icons: IconRecord[],
  days = 120,
): Promise<ActivityDay[]> {
  const counts = new Map<string, number>();
  for (const icon of icons) {
    if (icon.source === "builtin" && icon.createdAt) {
      const date = icon.createdAt.slice(0, 10);
      if (date) counts.set(date, (counts.get(date) ?? 0) + 1);
    }
  }

  if (db) {
    try {
      const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
      const { results } = await db
        .prepare(
          `SELECT substr(created_at, 1, 10) AS date, COUNT(*) AS count
           FROM icon_events
           WHERE created_at >= ?
           GROUP BY substr(created_at, 1, 10)
           ORDER BY date ASC`,
        )
        .bind(cutoff)
        .all<{ date: string; count: number }>();
      for (const row of results ?? []) {
        if (!row.date) continue;
        counts.set(row.date, (counts.get(row.date) ?? 0) + (Number(row.count) || 0));
      }
    } catch {
      // Non-fatal if icon_events migration has not yet applied
    }
  }

  return [...counts.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function listIcons(
  db: D1Database | undefined,
  opts: { q?: string; category?: string; variant?: string; limit?: number } = {},
) {
  const [{ icons, live, updatedAt }, { events, totalEvents }] = await Promise.all([
    getAllIcons(db),
    getRecentEvents(db, 16),
  ]);

  const query = (opts.q ?? "").trim().toLowerCase();
  const terms = query ? query.split(/[\s,]+/).filter(Boolean) : [];
  const categoryFilter = (opts.category ?? "").trim().toLowerCase();
  const variantFilter = (opts.variant ?? "").trim().toLowerCase();

  const categoryCounts = new Map<string, number>();
  for (const icon of icons) {
    categoryCounts.set(icon.category, (categoryCounts.get(icon.category) ?? 0) + 1);
  }
  const categories = [...categoryCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const filtered = icons
    .map((icon) => ({ icon, score: scoreIcon(icon, terms) }))
    .filter(({ icon, score }) => {
      if (score === 0) return false;
      if (categoryFilter && categoryFilter !== "all" && icon.category.toLowerCase() !== categoryFilter) return false;
      if (variantFilter && variantFilter !== "all" && icon.variant !== variantFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (terms.length > 0 && b.score !== a.score) return b.score - a.score;
      if (a.icon.source !== b.icon.source) return a.icon.source === "mcp" ? -1 : 1;
      return a.icon.name.localeCompare(b.icon.name);
    })
    .map(({ icon }) => icon);

  const limited = opts.limit && opts.limit > 0 ? filtered.slice(0, opts.limit) : filtered;
  const activity = await getDailyActivity(db, icons);
  return {
    icons: limited,
    total: icons.length,
    matched: filtered.length,
    categories,
    stats: buildStats(icons, totalEvents),
    recentEvents: events,
    activity,
    live,
    updatedAt,
  };
}

export async function getFeed(db: D1Database | undefined, limit = 20) {
  const [{ icons, live }, { events, totalEvents }] = await Promise.all([
    getAllIcons(db),
    getRecentEvents(db, limit),
  ]);
  const activity = await getDailyActivity(db, icons);
  return {
    events,
    stats: buildStats(icons, totalEvents),
    activity,
    live,
  };
}

export async function getIcon(db: D1Database | undefined, name: string): Promise<IconRecord | null> {
  const clean = name.trim().toLowerCase();
  if (!clean || !db) return null;
  try {
    const row = await db
      .prepare(
        "SELECT name, component, category, tags, variant, body, svg, jsx, source, created_at, updated_at FROM icons WHERE name = ?",
      )
      .bind(clean)
      .first<DbRow>();
    return row ? rowToIcon(row) : null;
  } catch {
    return null;
  }
}

async function recordEvent(
  db: D1Database,
  action: "add" | "update" | "delete",
  icon: { name: string; component: string; category: string },
  now: string,
) {
  try {
    await db
      .prepare("INSERT INTO icon_events (action, icon_name, component, category, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(action, icon.name, icon.component, icon.category, now)
      .run();
  } catch {
    // Non-fatal if icon_events migration has not yet applied
  }
}

export async function upsertIcon(db: D1Database, input: IconInput): Promise<{ icon: IconRecord; created: boolean }> {
  const existing = await db
    .prepare("SELECT created_at FROM icons WHERE name = ?")
    .bind(String(input.name ?? "").trim().toLowerCase())
    .first<{ created_at: string }>();

  const now = new Date().toISOString();
  const normalized = normalizeIconInput(input, now);
  const createdAt = existing?.created_at ?? now;

  await db
    .prepare(
      `INSERT INTO icons (name, component, category, tags, variant, body, svg, jsx, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'mcp', ?, ?)
       ON CONFLICT(name) DO UPDATE SET
         component = excluded.component,
         category = excluded.category,
         tags = excluded.tags,
         variant = excluded.variant,
         body = excluded.body,
         svg = excluded.svg,
         jsx = excluded.jsx,
         source = 'mcp',
         updated_at = excluded.updated_at`,
    )
    .bind(
      normalized.name,
      normalized.component,
      normalized.category,
      JSON.stringify(normalized.tags),
      normalized.variant,
      normalized.body,
      normalized.svg,
      normalized.jsx,
      createdAt,
      now,
    )
    .run();

  await recordEvent(db, existing ? "update" : "add", normalized, now);

  return {
    icon: { ...normalized, source: "mcp", createdAt, updatedAt: now },
    created: !existing,
  };
}

export async function deleteIcon(db: D1Database, name: string): Promise<boolean> {
  const clean = name.trim().toLowerCase();
  if (!clean) return false;
  const existing = await db
    .prepare("SELECT name, component, category FROM icons WHERE name = ?")
    .bind(clean)
    .first<{ name: string; component: string; category: string }>();
  if (!existing) return false;
  await db.prepare("DELETE FROM icons WHERE name = ?").bind(clean).run();
  await recordEvent(db, "delete", existing, new Date().toISOString());
  return true;
}

export async function getHealth(db?: D1Database): Promise<{ ok: boolean; count: number; d1Bound: boolean }> {
  if (!db) {
    return { ok: true, count: 0, d1Bound: false };
  }
  try {
    const row = await db.prepare("SELECT COUNT(*) AS count FROM icons").first<{ count: number }>();
    return { ok: true, count: Number(row?.count ?? 0), d1Bound: true };
  } catch {
    return { ok: false, count: 0, d1Bound: false };
  }
}
