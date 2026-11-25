import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { CLI_NAME, LOCKFILE, NAMESPACE } from "./meta.js"
import { templateFromBase, type RegistryEntry, type RegistryFile } from "./registry.js"
import { CliError } from "./ui.js"

export interface ComponentsJson {
  tailwind?: { css?: string }
  aliases?: Record<string, string>
  registries?: Record<string, RegistryEntry>
  [key: string]: unknown
}

export interface Lockfile {
  $comment?: string
  registry?: string
  /** Items added by name (top level only; their dependencies come back with them). */
  items: string[]
  theme?: { accent?: string }
  /** Icon style item when it is not the default set. */
  icons?: string
}

/** Strips // and /* *\/ comments and trailing commas, enough for tsconfig.json. */
export function parseJsonc(text: string): unknown {
  let out = ""
  let inStr = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]
    if (inStr) {
      out += ch
      if (ch === "\\") {
        out += next ?? ""
        i++
      } else if (ch === '"') inStr = false
      continue
    }
    if (ch === '"') {
      inStr = true
      out += ch
    } else if (ch === "/" && next === "/") {
      while (i < text.length && text[i] !== "\n") i++
      out += "\n"
    } else if (ch === "/" && next === "*") {
      i += 2
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++
      i++
    } else out += ch
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"))
}

export class Project {
  readonly cwd: string

  constructor(cwd: string) {
    this.cwd = path.resolve(cwd)
    if (!existsSync(this.cwd)) throw new CliError(`No such directory: ${this.cwd}`)
  }

  get componentsJsonPath() {
    return path.join(this.cwd, "components.json")
  }

  get lockfilePath() {
    return path.join(this.cwd, LOCKFILE)
  }

  hasComponentsJson() {
    return existsSync(this.componentsJsonPath)
  }

  componentsJson(): ComponentsJson | null {
    if (!this.hasComponentsJson()) return null
    try {
      return JSON.parse(readFileSync(this.componentsJsonPath, "utf8")) as ComponentsJson
    } catch (err) {
      throw new CliError(`components.json is not valid JSON: ${(err as Error).message}`)
    }
  }

  /** True when components.json maps the namespace to this registry base. */
  registersNamespace(base: string) {
    const entry = this.componentsJson()?.registries?.[NAMESPACE]
    if (!entry) return false
    const url = typeof entry === "string" ? entry : entry.url
    return url === templateFromBase(base)
  }

  /** Adds or updates registries["@paneui"]. Returns false when it was already set to this base. */
  registerNamespace(base: string): boolean {
    const json = this.componentsJson()
    if (!json) throw new CliError("components.json not found")
    const template = templateFromBase(base)
    const current = json.registries?.[NAMESPACE]
    if (current === template || (typeof current === "object" && current?.url === template)) return false
    json.registries = { ...json.registries, [NAMESPACE]: typeof current === "object" ? { ...current, url: template } : template }
    writeFileSync(this.componentsJsonPath, JSON.stringify(json, null, 2) + "\n")
    return true
  }

  lockfile(): Lockfile | null {
    // Read the previous config name for one release; always write the new name.
    const legacyName = "\u0074aimatsu.json"
    const source = existsSync(this.lockfilePath) ? this.lockfilePath : path.join(this.cwd, legacyName)
    if (!existsSync(source)) return null
    try {
      const lock = JSON.parse(readFileSync(source, "utf8")) as Partial<Lockfile>
      return { ...lock, items: Array.isArray(lock.items) ? lock.items : [] }
    } catch (err) {
      throw new CliError(`${path.basename(source)} is not valid JSON: ${(err as Error).message}`)
    }
  }

  writeLockfile(lock: Lockfile) {
    const out: Lockfile = {
      $comment: `Written by \`${CLI_NAME} add\`; \`${CLI_NAME} update\` reinstalls these.`,
      registry: lock.registry,
      items: [...new Set(lock.items)].sort(),
      ...(lock.theme?.accent ? { theme: { accent: lock.theme.accent } } : {}),
      ...(lock.icons ? { icons: lock.icons } : {}),
    }
    writeFileSync(this.lockfilePath, JSON.stringify(out, null, 2) + "\n")
  }

  private pathsCache?: { baseUrl: string; paths: Record<string, string[]> } | null

  private tsPaths() {
    if (this.pathsCache !== undefined) return this.pathsCache
    this.pathsCache = null
    for (const file of ["tsconfig.json", "jsconfig.json"]) {
      const p = path.join(this.cwd, file)
      if (!existsSync(p)) continue
      try {
        const json = parseJsonc(readFileSync(p, "utf8")) as { compilerOptions?: { baseUrl?: string; paths?: Record<string, string[]> } }
        const opts = json.compilerOptions ?? {}
        if (opts.paths) {
          this.pathsCache = { baseUrl: path.resolve(this.cwd, opts.baseUrl ?? "."), paths: opts.paths }
          break
        }
      } catch {
        // unreadable tsconfig: fall back to the conventional layout
      }
    }
    return this.pathsCache
  }

  get srcDir() {
    return existsSync(path.join(this.cwd, "src"))
  }

  /** "@/components/ui" → absolute directory, using tsconfig paths (or ./ / ./src when there are none). */
  resolveAlias(alias: string): string {
    const ts = this.tsPaths()
    if (ts) {
      for (const [key, targets] of Object.entries(ts.paths)) {
        const prefix = key.replace(/\*$/, "")
        if (key.endsWith("*") ? alias.startsWith(prefix) : alias === key) {
          const target = (targets[0] ?? "").replace(/\*$/, "")
          return path.resolve(ts.baseUrl, target + alias.slice(prefix.length))
        }
      }
    }
    const rest = alias.replace(/^[@~#]\//, "")
    return path.resolve(this.cwd, this.srcDir ? "src" : ".", rest)
  }

  aliasDir(kind: "ui" | "components" | "lib" | "hooks"): string {
    const aliases = this.componentsJson()?.aliases ?? {}
    const fallback: Record<string, string> = {
      components: "@/components",
      ui: `${aliases.components ?? "@/components"}/ui`,
      lib: "@/lib",
      hooks: "@/hooks",
    }
    return this.resolveAlias(aliases[kind] ?? fallback[kind])
  }

  /** Where shadcn writes a registry file, as candidates (the first existing one wins). */
  installPaths(file: RegistryFile): string[] {
    if (file.target) {
      if (file.target.startsWith("~/")) return [path.join(this.cwd, file.target.slice(2))]
      const plain = path.join(this.cwd, file.target)
      const inSrc = path.join(this.cwd, "src", file.target.replace(/^src\//, ""))
      return this.srcDir ? [inSrc, plain] : [plain, inSrc]
    }
    const kind =
      file.type === "registry:ui" ? "ui" : file.type === "registry:lib" ? "lib" : file.type === "registry:hook" ? "hooks" : "components"
    const dir = this.aliasDir(kind)
    return [path.join(dir, nestedPath(file.path, dir))]
  }

  findInstalled(file: RegistryFile): string | null {
    return this.installPaths(file).find((p) => existsSync(p)) ?? null
  }

  cssPath(): string | null {
    const css = this.componentsJson()?.tailwind?.css
    if (!css) return null
    const p = path.join(this.cwd, css)
    return existsSync(p) ? p : null
  }
}

/** The part of a registry path after the target directory's last segment (or the file name). */
export function nestedPath(filePath: string, targetDir: string): string {
  const last = path.basename(targetDir)
  const parts = filePath.split("/")
  const at = parts.lastIndexOf(last)
  return at >= 0 && at < parts.length - 1 ? parts.slice(at + 1).join("/") : parts[parts.length - 1]
}
