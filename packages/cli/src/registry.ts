import { DEFAULT_REGISTRY, NAMESPACE, REGISTRY_ENV } from "./meta.js"
import { CliError } from "./ui.js"

export interface RegistryFile {
  path: string
  type: string
  target?: string
  content?: string
}

export interface RegistryItem {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  files?: RegistryFile[]
  cssVars?: { theme?: Record<string, string>; light?: Record<string, string>; dark?: Record<string, string> }
  meta?: { category?: string; hidden?: boolean; version?: string; [key: string]: unknown }
}

export interface RegistryIndex {
  name: string
  homepage?: string
  items: RegistryItem[]
}

/** components.json `registries` values are either a URL template or `{ url, headers }`. */
export type RegistryEntry = string | { url: string; headers?: Record<string, string> }

/** "https://x/r/{name}.json" → "https://x/r"; a plain base passes through. */
export function baseFromTemplate(template: string): string {
  return template.replace(/\/?\{name\}(\.json)?$/, "").replace(/\/registry\.json$/, "").replace(/\/+$/, "")
}

export function templateFromBase(base: string): string {
  return `${base}/{name}.json`
}

export interface RegistrySource {
  base: string
  /** Where the base came from, for messages. */
  from: "flag" | "env" | "components.json" | "lockfile" | "default"
  headers?: Record<string, string>
}

/** Order: --registry, $PANEUI_REGISTRY, components.json registries["@paneui"], paneui.json, default. */
export function resolveRegistry(opts: {
  flag?: string
  componentsJson?: { registries?: Record<string, RegistryEntry> } | null
  lockRegistry?: string
}): RegistrySource {
  if (opts.flag) return { base: baseFromTemplate(opts.flag), from: "flag" }
  const env = process.env[REGISTRY_ENV]
  if (env) return { base: baseFromTemplate(env), from: "env" }
  const entry = opts.componentsJson?.registries?.[NAMESPACE]
  if (entry) {
    const url = typeof entry === "string" ? entry : entry.url
    const headers = typeof entry === "string" ? undefined : expandEnv(entry.headers)
    if (url) return { base: baseFromTemplate(url), from: "components.json", headers }
  }
  if (opts.lockRegistry) return { base: baseFromTemplate(opts.lockRegistry), from: "lockfile" }
  return { base: DEFAULT_REGISTRY, from: "default" }
}

function expandEnv(headers?: Record<string, string>) {
  if (!headers) return undefined
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k, v.replace(/\$\{(\w+)\}/g, (_, n: string) => process.env[n] ?? "")]),
  )
}

async function getJson<T>(url: string, headers?: Record<string, string>): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, { headers: { accept: "application/json", ...headers } })
  } catch (err) {
    throw new CliError(`Could not reach ${url}: ${(err as Error).message}`)
  }
  if (res.status === 404) throw new CliError(`Not found: ${url}`)
  if (!res.ok) throw new CliError(`${url} answered ${res.status} ${res.statusText}`)
  try {
    return (await res.json()) as T
  } catch {
    throw new CliError(`${url} did not return JSON`)
  }
}

export class Registry {
  private indexCache?: Promise<RegistryIndex>
  private itemCache = new Map<string, Promise<RegistryItem>>()

  constructor(readonly source: RegistrySource) {}

  get base() {
    return this.source.base
  }

  itemUrl(name: string) {
    return `${this.base}/${name}.json`
  }

  index(): Promise<RegistryIndex> {
    this.indexCache ??= getJson<RegistryIndex>(`${this.base}/registry.json`, this.source.headers).then((idx) => {
      if (!idx || !Array.isArray(idx.items)) throw new CliError(`${this.base}/registry.json is not a registry index`)
      return idx
    })
    return this.indexCache
  }

  item(name: string): Promise<RegistryItem> {
    let p = this.itemCache.get(name)
    if (!p) {
      p = getJson<RegistryItem>(this.itemUrl(name), this.source.headers)
      this.itemCache.set(name, p)
    }
    return p
  }

  /** Accepts "button", "@paneui/button" or this registry's item URL; returns the bare name, or null for anything else. */
  nameOf(address: string): string | null {
    if (address.startsWith(`${NAMESPACE}/`)) return address.slice(NAMESPACE.length + 1)
    if (/^https?:\/\//.test(address)) {
      const prefix = `${this.base}/`
      if (address.startsWith(prefix) && address.endsWith(".json")) {
        const name = address.slice(prefix.length, -".json".length)
        return name.includes("/") ? null : name
      }
      return null
    }
    if (/^[a-z0-9][a-z0-9-]*$/i.test(address)) return address
    return null
  }
}

/** Accent presets are `theme-<colour>`. */
export function themePresets(index: RegistryIndex) {
  const themes = index.items.filter((i) => i.type === "registry:theme" && i.name.startsWith("theme-"))
  return {
    accents: themes.map((i) => i.name.slice("theme-".length)),
  }
}

/** Items whose files all install to components/icons.tsx: the icon styles. */
export function iconStyles(index: RegistryIndex) {
  return index.items.filter((i) => /^icons(-|$)/.test(i.name) && i.type === "registry:component").map((i) => i.name)
}
