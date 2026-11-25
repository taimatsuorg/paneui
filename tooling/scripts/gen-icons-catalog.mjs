#!/usr/bin/env node
/**
 * Generates the static JSON icon catalog from `packages/ui/src/icons/index.tsx`
 * for both `apps/docs` and `apps/icons-worker`.
 *
 * Run via `pnpm icons:catalog`.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const srcPath = path.join(root, "packages/ui/src/icons/index.tsx")
const outputs = [
  path.join(root, "apps/icons-worker/src/catalog.generated.json"),
]

const src = fs.readFileSync(srcPath, "utf8")

function toKebab(componentName) {
  return componentName
    .replace(/Icon$/, "")
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .toLowerCase()
}

function normalizeBody(raw) {
  let body = raw.trim()
  body = body
    .replace(/\{\.\.\.line\}/g, 'stroke="currentColor"')
    .replace(/\{\.\.\.fillShape\}/g, 'fill="currentColor" stroke="currentColor" fill-rule="evenodd"')
    .replace(/\{\.\.\.dot\}/g, 'fill="currentColor" stroke="none"')
    .replace(/\{\.\.\.solid\}/g, 'fill="currentColor" stroke="none"')
    .replace(/\{\.\.\.accent\}/g, 'fill="var(--primary, currentColor)"')
    .replace(/\bfillRule=/g, "fill-rule=")
    .replace(/\bclipRule=/g, "clip-rule=")
    .replace(/\bstrokeWidth=/g, "stroke-width=")
    .replace(/\bstrokeLinecap=/g, "stroke-linecap=")
    .replace(/\bstrokeLinejoin=/g, "stroke-linejoin=")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim()
  return body
}

function wrapSvg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
}

const CATEGORIES = {
  Brand: new Set(["PaneuiLogoIcon", "PaneuiLogoMonoIcon", "GithubIcon"]),
  Arrows: new Set([
    "ChevronDownIcon",
    "ChevronUpIcon",
    "ChevronLeftIcon",
    "ChevronRightIcon",
    "ChevronsUpDownIcon",
    "ArrowRightIcon",
    "ArrowLeftIcon",
    "ArrowUpIcon",
    "ArrowDownIcon",
    "ArrowUpRightIcon",
    "CornerDownRightIcon",
    "UndoIcon",
    "MoveVerticalIcon",
    "RefreshIcon",
    "ExternalLinkIcon",
    "LogOutIcon",
    "NavigationIcon",
  ]),
  Navigation: new Set([
    "HomeIcon",
    "HomeFilledIcon",
    "MenuIcon",
    "SidebarIcon",
    "PanelBottomIcon",
    "PanelRightIcon",
    "GridIcon",
    "Columns2Icon",
    "Rows2Icon",
    "SearchIcon",
    "GlobeIcon",
    "PinIcon",
    "MoreHorizontalIcon",
    "MoreVerticalIcon",
    "GripVerticalIcon",
  ]),
  Actions: new Set([
    "CheckIcon",
    "PlusIcon",
    "MinusIcon",
    "XIcon",
    "CopyIcon",
    "TrashIcon",
    "EditIcon",
    "UploadIcon",
    "DownloadIcon",
    "FilterIcon",
    "SlidersIcon",
    "SortIcon",
    "LinkIcon",
    "AttachIcon",
    "MaximizeIcon",
    "EyeIcon",
    "EyeOffIcon",
  ]),
  Files: new Set([
    "FileIcon",
    "FolderIcon",
    "FolderOpenIcon",
    "FolderFilledIcon",
    "ClipboardListIcon",
    "BookmarkIcon",
    "TagIcon",
    "FlagIcon",
    "LibraryIcon",
    "ScrollTextIcon",
  ]),
  Communication: new Set([
    "MailIcon",
    "InboxIcon",
    "InboxFilledIcon",
    "ChatIcon",
    "ChatFilledIcon",
    "SendIcon",
    "MessageSquareIcon",
    "PhoneIcon",
    "UsersIcon",
    "UserIcon",
    "UserFilledIcon",
    "BellIcon",
    "BellFilledIcon",
    "RssIcon",
    "LanguagesIcon",
  ]),
  Media: new Set([
    "ImageIcon",
    "CameraIcon",
    "PlayIcon",
    "PauseIcon",
    "StopIcon",
    "SkipBackIcon",
    "SkipForwardIcon",
    "Volume2Icon",
    "VolumeXIcon",
    "HeadphonesIcon",
    "AudioLinesIcon",
    "MonitorIcon",
    "SmartphoneIcon",
    "TabletIcon",
    "ApertureIcon",
  ]),
  Editor: new Set([
    "BoldIcon",
    "ItalicIcon",
    "UnderlineIcon",
    "StrikethroughIcon",
    "HighlighterIcon",
    "BaselineIcon",
    "ListIcon",
    "ListOrderedIcon",
    "ListTodoIcon",
    "ListCollapseIcon",
    "QuoteIcon",
    "TypeIcon",
    "TableIcon",
    "CalloutIcon",
    "AlignLeftIcon",
    "AlignCenterIcon",
    "AlignRightIcon",
    "Heading1Icon",
    "Heading2Icon",
    "Heading3Icon",
  ]),
  Status: new Set([
    "InfoIcon",
    "AlertCircleIcon",
    "HelpCircleIcon",
    "CheckCircleIcon",
    "XCircleIcon",
    "WarningIcon",
    "ClockIcon",
    "HistoryIcon",
    "LoaderIcon",
    "ShieldIcon",
    "KeyIcon",
    "LockIcon",
    "CircleDotIcon",
  ]),
  "Code & AI": new Set([
    "CodeIcon",
    "SquareCodeIcon",
    "TerminalIcon",
    "TerminalSquareIcon",
    "BracesIcon",
    "GitBranchIcon",
    "GitPullRequestIcon",
    "BotIcon",
    "SparklesIcon",
    "DatabaseIcon",
    "ServerIcon",
    "PlugIcon",
    "BlocksIcon",
  ]),
}

function categoryOf(componentName) {
  for (const [category, members] of Object.entries(CATEGORIES)) {
    if (members.has(componentName)) return category
  }
  return "UI"
}

const SYNONYMS = {
  x: ["close", "cancel", "dismiss", "remove", "cross"],
  plus: ["add", "create", "new"],
  minus: ["subtract", "remove", "collapse"],
  check: ["tick", "confirm", "done", "success", "approve"],
  trash: ["delete", "remove", "bin", "garbage"],
  edit: ["pencil", "write", "rename", "modify"],
  search: ["find", "magnifier", "lookup", "query"],
  settings: ["gear", "cog", "preferences", "config"],
  home: ["house", "start", "main"],
  user: ["person", "account", "profile", "member"],
  users: ["team", "group", "people", "members"],
  bell: ["notification", "alert", "alarm"],
  mail: ["email", "envelope", "message", "letter"],
  inbox: ["tray", "mail", "messages"],
  chat: ["comment", "bubble", "message", "conversation"],
  send: ["submit", "paper-plane", "reply"],
  calendar: ["date", "schedule", "event", "month"],
  clock: ["time", "schedule", "watch"],
  sparkles: ["ai", "magic", "generate", "assistant"],
  bot: ["ai", "agent", "robot", "assistant"],
  terminal: ["cli", "console", "shell", "command"],
  code: ["brackets", "source", "developer"],
  braces: ["json", "curly", "syntax", "object"],
  warning: ["alert", "caution", "danger", "triangle"],
  info: ["details", "about", "help"],
  lock: ["security", "private", "password", "auth"],
  key: ["token", "secret", "password", "auth"],
  shield: ["security", "protect", "verify"],
  eye: ["view", "show", "visible", "preview"],
  copy: ["duplicate", "clipboard", "clone"],
  download: ["save", "export"],
  upload: ["import", "share"],
  sliders: ["controls", "filters", "tune"],
  filter: ["funnel", "sort"],
  refresh: ["reload", "sync", "retry"],
  globe: ["world", "web", "language", "internet"],
  pin: ["location", "map", "marker"],
  star: ["favorite", "rating", "bookmark"],
  heart: ["like", "love", "favorite"],
  bolt: ["lightning", "fast", "zap", "flash", "energy"],
  palette: ["theme", "color", "design"],
  folder: ["directory", "collection"],
  file: ["document", "page", "note"],
  loader: ["spinner", "loading", "progress"],
  paneui: ["logo", "brand", "mark"],
  github: ["git", "repo", "brand"],
}

function tagsFor(name, category, variant) {
  const tokens = name.split("-").filter(Boolean)
  const set = new Set([name, category.toLowerCase(), variant, ...tokens])
  for (const token of tokens) {
    for (const extra of SYNONYMS[token] ?? []) set.add(extra)
  }
  return [...set]
}

const componentRegex = /export const ([A-Za-z0-9]+Icon)\s*=\s*\([^)]*\)\s*=>\s*\(\s*<Icon\b[^>]*>([\s\S]*?)<\/Icon>\s*\);/g
const aliasRegex = /export const ([A-Za-z0-9]+Icon)\s*=\s*([A-Za-z0-9]+Icon);/g

const parsedMap = new Map()
let match
while ((match = componentRegex.exec(src)) !== null) {
  const [, component, rawBody] = match
  const body = normalizeBody(rawBody)
  if (!body) {
    console.error(`gen-icons-catalog: empty SVG body for ${component}`)
    process.exit(1)
  }
  parsedMap.set(component, { component, body })
}

while ((match = aliasRegex.exec(src)) !== null) {
  const [, component, target] = match
  const ref = parsedMap.get(target)
  if (!ref) {
    console.error(`gen-icons-catalog: alias target ${target} missing for ${component}`)
    process.exit(1)
  }
  parsedMap.set(component, { component, body: ref.body })
}

const declaredExports = [...src.matchAll(/^export const ([A-Za-z0-9]+Icon)\b/gm)].map((m) => m[1])
if (declaredExports.length === 0) {
  console.error("gen-icons-catalog: found zero icons")
  process.exit(1)
}
for (const exp of declaredExports) {
  if (!parsedMap.has(exp)) {
    console.error(`gen-icons-catalog: failed to parse ${exp}`)
    process.exit(1)
  }
}

const catalog = declaredExports.map((component) => {
  const { body } = parsedMap.get(component)
  const name = toKebab(component)
  const variant = component.endsWith("FilledIcon") ? "filled" : "outline"
  const category = categoryOf(component)
  return {
    name,
    component,
    category,
    tags: tagsFor(name, category, variant),
    variant,
    body,
    svg: wrapSvg(body),
    jsx: `<${component} />`,
    source: "builtin",
  }
})

const jsonText = JSON.stringify(catalog, null, 2) + "\n"
for (const outPath of outputs) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, jsonText)
}

console.log(`gen-icons-catalog: wrote ${catalog.length} icons to ${outputs.map((p) => path.relative(root, p)).join(" & ")}`)
