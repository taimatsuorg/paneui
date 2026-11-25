import { NAMESPACE } from "./meta.js"
import { Project, type Lockfile } from "./project.js"
import { Registry, iconStyles, resolveRegistry, themePresets, type RegistryIndex } from "./registry.js"
import { suggest } from "./search.js"
import { CliError } from "./ui.js"

export interface CommonOptions {
  cwd?: string
  registry?: string
}

export function context(opts: CommonOptions) {
  const project = new Project(opts.cwd ?? process.cwd())
  const lock = project.lockfile()
  const registry = new Registry(resolveRegistry({ flag: opts.registry, componentsJson: project.componentsJson(), lockRegistry: lock?.registry }))
  return { project, registry, lock }
}

/** What shadcn should be given for an item: the short name when components.json maps it here, else the URL. */
export function address(project: Project, registry: Registry, name: string) {
  return project.registersNamespace(registry.base) ? `${NAMESPACE}/${name}` : registry.itemUrl(name)
}

/** Throws with "did you mean" hints for names the index does not have. */
export function assertKnown(index: RegistryIndex, names: string[]) {
  const known = new Set(index.items.map((i) => i.name))
  const missing = names.filter((n) => !known.has(n))
  if (missing.length === 0) return
  const lines = missing.map((n) => {
    const s = suggest(index.items, n)
    return s.length ? `${n} (did you mean ${s.join(", ")}?)` : n
  })
  throw new CliError(`Not in the registry: ${lines.join("; ")}`)
}

export type ItemKind = "item" | "accent" | "icons" | "theme"

/** Theme presets and icon styles are recorded separately so `update` can re-apply them last. */
export function classify(index: RegistryIndex, name: string): ItemKind {
  if (name === "theme") return "theme"
  const { accents } = themePresets(index)
  if (name.startsWith("theme-") && accents.includes(name.slice("theme-".length))) return "accent"
  if (iconStyles(index).includes(name)) return "icons"
  return "item"
}

export function emptyLock(registry: Registry, lock: Lockfile | null): Lockfile {
  return { items: [], ...lock, registry: registry.source.from === "default" ? lock?.registry : registry.base }
}
