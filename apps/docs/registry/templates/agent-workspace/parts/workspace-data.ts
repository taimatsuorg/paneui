/*
 * Demo content for the pages beside the chat: scheduled tasks, the library,
 * image styles, plugins, projects and usage. Swap each list for your own data
 * source; the pages only read these shapes.
 */

export type TaskTone = "primary" | "success" | "warning" | "neutral" | "destructive"
export type TaskIcon = "chart" | "mail" | "pr" | "terminal" | "shield" | "calendar"

export type TaskTemplate = {
  id: string
  title: string
  description: string
  icon: TaskIcon
  tone: TaskTone
  schedule: string
  prompt: string
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: "standup",
    title: "Morning standup notes",
    description: "Sum up yesterday's merged work and what is still open.",
    icon: "calendar",
    tone: "primary",
    schedule: "Weekdays at 09:00",
    prompt: "List what merged yesterday and the pull requests still waiting for review.",
  },
  {
    id: "triage",
    title: "Triage new issues",
    description: "Label new issues and flag the ones that look urgent.",
    icon: "mail",
    tone: "warning",
    schedule: "Every 2 hours",
    prompt: "Read issues opened since the last run, label them and flag anything urgent.",
  },
  {
    id: "review",
    title: "Review stale pull requests",
    description: "Nudge pull requests with no activity for three days.",
    icon: "pr",
    tone: "success",
    schedule: "Daily at 14:00",
    prompt: "Find pull requests idle for three days and leave a short review or a nudge.",
  },
  {
    id: "deps",
    title: "Dependency check",
    description: "Open one pull request with safe minor upgrades.",
    icon: "terminal",
    tone: "neutral",
    schedule: "Mondays at 08:00",
    prompt: "Upgrade minor and patch dependencies, run the tests and open one pull request.",
  },
  {
    id: "audit",
    title: "Security audit",
    description: "Scan the lockfile for advisories and report what to patch.",
    icon: "shield",
    tone: "destructive",
    schedule: "Fridays at 17:00",
    prompt: "Check the lockfile against known advisories and list what needs a patch.",
  },
  {
    id: "metrics",
    title: "Weekly build report",
    description: "Chart build times and flaky tests from the last week.",
    icon: "chart",
    tone: "primary",
    schedule: "Sundays at 18:00",
    prompt: "Summarise build durations and flaky tests from the last seven days.",
  },
]

export type ScheduledTask = TaskTemplate & { enabled: boolean; runs: { at: string; ok: boolean }[] }

export const SCHEDULE_OPTIONS = ["Every hour", "Every 2 hours", "Weekdays at 09:00", "Daily at 14:00", "Mondays at 08:00", "Fridays at 17:00", "Sundays at 18:00"]

/* --------------------------------- library -------------------------------- */

export type LibraryKind = "doc" | "code" | "image" | "sheet" | "folder"

export type LibraryItem = {
  id: string
  title: string
  kind: LibraryKind
  /** Masonry height in grid rows (1 row = 8px). */
  rows: number
  updated: string
  project: string
  favourite?: boolean
  /** Short excerpt shown on document cards. */
  excerpt?: string
  /** Stable seed for generated art. */
  seed: string
}

export const LIBRARY_ITEMS: LibraryItem[] = [
  { id: "l1", title: "Split view spec", kind: "doc", rows: 26, updated: "2h ago", project: "workspace", favourite: true, seed: "split-spec", excerpt: "Two chats side by side, one composer each. Closing a pane keeps its tab." },
  { id: "l2", title: "Hero artwork", kind: "image", rows: 34, updated: "Yesterday", project: "landing-site", seed: "hero-artwork" },
  { id: "l3", title: "useDragHandle.ts", kind: "code", rows: 22, updated: "3h ago", project: "workspace", seed: "drag-handle", excerpt: "export function useDragHandle(ref) {\n  const [dragging, setDragging] = useState(false)\n  …" },
  { id: "l4", title: "Release checklist", kind: "doc", rows: 30, updated: "Mon", project: "workspace", favourite: true, seed: "release", excerpt: "Bump versions, regenerate the registry, build the docs and tag the release." },
  { id: "l5", title: "Pricing tiers", kind: "sheet", rows: 24, updated: "Last week", project: "billing-api", seed: "pricing", excerpt: "Free · Team · Business, with seat and run limits per tier." },
  { id: "l6", title: "Onboarding flow", kind: "image", rows: 28, updated: "Tue", project: "landing-site", favourite: true, seed: "onboarding" },
  { id: "l7", title: "Invoices schema", kind: "code", rows: 30, updated: "Last week", project: "billing-api", seed: "invoices", excerpt: "create table invoices (\n  id uuid primary key,\n  customer_id uuid not null,\n  …" },
  { id: "l8", title: "Design review notes", kind: "doc", rows: 22, updated: "Oct 28", project: "landing-site", seed: "review-notes", excerpt: "Tighten the header, one accent per screen, drop the second CTA." },
  { id: "l9", title: "Empty states", kind: "image", rows: 24, updated: "Oct 26", project: "workspace", seed: "empty-states" },
  { id: "l10", title: "Usage export", kind: "sheet", rows: 26, updated: "Oct 24", project: "billing-api", seed: "usage-export", excerpt: "Runs, tokens and minutes per workspace, by day." },
]

/* --------------------------------- images --------------------------------- */

export type ImageStyle = {
  id: string
  label: string
  seed: string
  /** Portrait styles draw a face over the generated backdrop. */
  portrait?: boolean
  rows: number
  collection: "popular" | "templates"
}

export const IMAGE_STYLES: ImageStyle[] = [
  { id: "aerial", label: "Aerial", seed: "aerial-meadow", rows: 34, collection: "popular" },
  { id: "keepsake", label: "Keepsake tin", seed: "keepsake", rows: 28, collection: "popular" },
  { id: "eighties", label: "Back to the 80s", seed: "eighties", portrait: true, rows: 38, collection: "popular" },
  { id: "comic", label: "Bold comic", seed: "comic-pop", portrait: true, rows: 30, collection: "popular" },
  { id: "sketch", label: "Pencil sketch", seed: "sketch-paper", rows: 26, collection: "popular" },
  { id: "sticker", label: "Sticker sheet", seed: "sticker", portrait: true, rows: 30, collection: "popular" },
  { id: "photobooth", label: "Photo booth", seed: "booth", portrait: true, rows: 36, collection: "popular" },
  { id: "y2k", label: "Digicam", seed: "y2k-digicam", rows: 28, collection: "popular" },
  { id: "anime", label: "Cel shading", seed: "cel-shading", portrait: true, rows: 32, collection: "popular" },
  { id: "seventies", label: "70s portrait", seed: "seventies", portrait: true, rows: 34, collection: "popular" },
  { id: "app-icon", label: "App icon", seed: "app-icon", rows: 26, collection: "templates" },
  { id: "og", label: "Share card", seed: "share-card", rows: 22, collection: "templates" },
  { id: "avatar", label: "Team avatar", seed: "team-avatar", portrait: true, rows: 30, collection: "templates" },
  { id: "wallpaper", label: "Wallpaper", seed: "wallpaper", rows: 38, collection: "templates" },
  { id: "poster", label: "Event poster", seed: "poster", rows: 34, collection: "templates" },
]

/* -------------------------------- plugins --------------------------------- */

export type PluginIcon = "mail" | "calendar" | "database" | "cloud" | "pr" | "chart" | "globe" | "terminal" | "lock"

export type Plugin = {
  id: string
  name: string
  description: string
  icon: PluginIcon
  tone: TaskTone
  installed?: boolean
  section: "popular" | "new"
  scope: "public" | "personal"
  version: string
  capabilities: string
  category: string
  about: string
  tools: { name: string; description: string }[]
}

export const PLUGINS: Plugin[] = [
  { id: "mail", name: "Mail", description: "Read and draft email", icon: "mail", tone: "primary", installed: true, section: "popular", scope: "public", version: "2.4.0", capabilities: "Read, write", category: "Productivity", about: "Search the inbox, read threads and draft replies for you to send.", tools: [{ name: "search_mail", description: "Find messages by sender, subject or text." }, { name: "draft_reply", description: "Write a reply and leave it in drafts." }] },
  { id: "repos", name: "Repositories", description: "Triage pull requests, issues and checks", icon: "pr", tone: "success", installed: true, section: "popular", scope: "public", version: "3.1.2", capabilities: "Read, write", category: "Developer tools", about: "Open pull requests, review diffs, label issues and re-run checks.", tools: [{ name: "list_pulls", description: "Pull requests by state, author or label." }, { name: "rerun_checks", description: "Re-run failed checks on a branch." }] },
  { id: "db", name: "Database", description: "Query and inspect tables", icon: "database", tone: "warning", section: "popular", scope: "public", version: "1.8.0", capabilities: "Read", category: "Data", about: "Run read-only queries and describe tables, indexes and row counts.", tools: [{ name: "query", description: "Run a read-only SQL query." }] },
  { id: "deploy", name: "Deploy", description: "Ship previews and promote builds", icon: "cloud", tone: "neutral", installed: true, section: "popular", scope: "public", version: "1.2.5", capabilities: "Read, write", category: "Developer tools", about: "Create preview deployments, read build logs and promote a build.", tools: [{ name: "create_preview", description: "Deploy a branch to a preview URL." }, { name: "promote", description: "Promote a preview to production." }] },
  { id: "calendar", name: "Calendar", description: "Read and plan events", icon: "calendar", tone: "destructive", section: "new", scope: "public", version: "0.9.1", capabilities: "Read, write", category: "Productivity", about: "Find free time, list today's events and propose meetings.", tools: [{ name: "free_busy", description: "Free slots for a set of people." }] },
  { id: "analytics", name: "Analytics", description: "Charts from product events", icon: "chart", tone: "primary", section: "new", scope: "public", version: "0.6.0", capabilities: "Read", category: "Data", about: "Pull funnels and retention from product events and chart them.", tools: [{ name: "funnel", description: "Conversion between two or more events." }] },
  { id: "browser", name: "Browser", description: "Open pages and read them", icon: "globe", tone: "success", section: "new", scope: "public", version: "1.0.0", capabilities: "Read", category: "Web", about: "Load a page, read its text and take a screenshot.", tools: [{ name: "open", description: "Load a URL and return its text." }] },
  { id: "shell", name: "Team scripts", description: "Run your team's saved scripts", icon: "terminal", tone: "neutral", installed: true, section: "new", scope: "personal", version: "0.3.0", capabilities: "Run", category: "Developer tools", about: "Run the scripts in your team's tools folder with their arguments.", tools: [{ name: "run_script", description: "Run a saved script by name." }] },
  { id: "vault", name: "Secrets", description: "Read keys from your vault", icon: "lock", tone: "warning", section: "new", scope: "personal", version: "0.2.4", capabilities: "Read", category: "Security", about: "Read named secrets at run time without writing them to disk.", tools: [{ name: "get_secret", description: "Read one secret by name." }] },
]

export const SKILLS = [
  { id: "review", name: "Code review", description: "Reviews a diff against the team's checklist" },
  { id: "release", name: "Release notes", description: "Writes notes from merged pull requests" },
  { id: "tests", name: "Test writer", description: "Adds tests for changed functions" },
  { id: "a11y", name: "Accessibility pass", description: "Checks focus, names and contrast" },
]

/* -------------------------------- projects -------------------------------- */

export type Project = { id: string; name: string; path: string; updated: string; threads: number; pinned?: boolean }

export const PROJECTS: Project[] = [
  { id: "workspace", name: "workspace", path: "~/code/workspace", updated: "2h ago", threads: 6, pinned: true },
  { id: "landing-site", name: "landing-site", path: "~/code/landing-site", updated: "Today", threads: 3, pinned: true },
  { id: "billing-api", name: "billing-api", path: "~/code/billing-api", updated: "Yesterday", threads: 2 },
  { id: "design-tokens", name: "design-tokens", path: "~/code/design-tokens", updated: "Last month", threads: 0 },
]

/* ---------------------------------- usage --------------------------------- */

export const USAGE_STATS = [
  { label: "Tokens this month", value: "3.04B" },
  { label: "Busiest day", value: "220M" },
  { label: "Longest run", value: "4h 28m" },
  { label: "Longest streak", value: "11 days" },
]

export const USER = { name: "Alex Rivera", email: "alex@example.com", plan: "Team" }
