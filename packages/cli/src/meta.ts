import { readFileSync } from "node:fs"

/**
 * The CLI's own name and version come from package.json, so renaming the npm package is one
 * field there (plus the `bin` key). The registry namespace below is separate: it is the name in
 * the registry's registry.json and what users register in components.json.
 */
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
  name: string
  version: string
  bin: Record<string, string>
}

/** The command users type (the `bin` key). */
export const CLI_NAME = Object.keys(pkg.bin)[0] ?? pkg.name
/** The npm package, for `npx <package>`. */
export const PACKAGE_NAME = pkg.name
export const CLI_VERSION = pkg.version

/** Registry namespace, as used in `@paneui/<item>` addresses and components.json `registries`. */
export const NAMESPACE = "@paneui"
/** Default registry base: items live at `${base}/<name>.json`, the index at `${base}/registry.json`. */
export const DEFAULT_REGISTRY = "https://paneui.dev/r"
/** Environment variable that overrides the registry base. */
export const REGISTRY_ENV = "PANEUI_REGISTRY"
/** Environment variable that overrides how the shadcn CLI is launched (e.g. "node ./shadcn/dist/index.js"). */
export const SHADCN_ENV = "PANEUI_SHADCN"
/** Records what this CLI installed, so `update` can reinstall it. Written next to components.json. */
export const LOCKFILE = "paneui.json"

export const DEFAULT_ACCENT = "neutral"
export const DEFAULT_ICONS = "icons"
