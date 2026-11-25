import { CLI_NAME, DEFAULT_ACCENT } from "../meta.js"
import { themePresets } from "../registry.js"
import { runShadcn } from "../shadcn.js"
import { CliError, c, log } from "../ui.js"
import { address, context, emptyLock, type CommonOptions } from "../context.js"

export interface ThemeOptions extends CommonOptions {
  list?: boolean
  yes?: boolean
  dryRun?: boolean
}

/** Reinstalls the theme, then the accent preset (given here, or the recorded one). */
export async function theme(accent: string | undefined, opts: ThemeOptions) {
  const { project, registry, lock } = context(opts)
  const index = await registry.index()
  const { accents } = themePresets(index)

  if (opts.list) {
    const current = lock?.theme ?? {}
    log.info(`${c.dim("Accents")}  ${accents.map((a) => (a === (current.accent ?? DEFAULT_ACCENT) ? c.bold(a + "*") : a)).join("  ")}`)
    log.info(c.dim(`* current. Set with \`${CLI_NAME} theme <accent>\`.`))
    return
  }
  if (accent && !accents.includes(accent)) throw new CliError(`Unknown accent "${accent}". Choose one of: ${accents.join(", ")}`)
  if (!project.hasComponentsJson()) throw new CliError(`No components.json in ${project.cwd}. Run \`${CLI_NAME} init\` first.`)

  const nextAccent = accent ?? lock?.theme?.accent
  const presets = nextAccent && nextAccent !== DEFAULT_ACCENT ? [`theme-${nextAccent}`] : []
  // The theme also ships lib/utils.ts, so a reinstall needs --overwrite or shadcn stops at that prompt.
  const flags = ["--overwrite", ...(opts.yes ? ["--yes"] : []), ...(opts.dryRun ? ["--dry-run"] : [])]
  await runShadcn(["add", address(project, registry, "theme"), ...flags], { cwd: project.cwd })
  if (presets.length) await runShadcn(["add", ...presets.map((p) => address(project, registry, p)), ...flags], { cwd: project.cwd })
  if (opts.dryRun) return

  const next = emptyLock(registry, lock)
  next.theme = {
    accent: nextAccent && nextAccent !== DEFAULT_ACCENT ? nextAccent : undefined,
  }
  project.writeLockfile(next)
  log.ok(`Theme installed${presets.length ? ` with ${presets.join(", ")}` : ""}`)
}
