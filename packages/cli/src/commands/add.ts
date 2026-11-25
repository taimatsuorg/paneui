import { CLI_NAME, DEFAULT_ICONS, NAMESPACE } from "../meta.js"
import { runShadcn } from "../shadcn.js"
import { CliError, log } from "../ui.js"
import { address, assertKnown, classify, context, emptyLock, type CommonOptions } from "../context.js"

export interface AddOptions extends CommonOptions {
  overwrite?: boolean
  yes?: boolean
  path?: string
  dryRun?: boolean
  silent?: boolean
}

export async function add(inputs: string[], opts: AddOptions) {
  if (inputs.length === 0) throw new CliError(`Name at least one item, e.g. \`${CLI_NAME} add button\`. Find names with \`${CLI_NAME} search\`.`)
  const { project, registry, lock } = context(opts)

  const ours: string[] = []
  const foreign: string[] = []
  for (const input of inputs) {
    const name = registry.nameOf(input)
    if (name) ours.push(name)
    else foreign.push(input)
  }
  const index = ours.length ? await registry.index() : null
  if (index) assertKnown(index, ours)

  const groups = { main: [] as string[], presets: [] as string[], icons: [] as string[] }
  for (const name of ours) {
    const kind = classify(index!, name)
    if (kind === "accent") groups.presets.push(name)
    else if (kind === "icons") groups.icons.push(name)
    else groups.main.push(name)
  }

  const flags = [
    ...(opts.overwrite ? ["--overwrite"] : []),
    ...(opts.yes ? ["--yes"] : []),
    ...(opts.path ? ["--path", opts.path] : []),
    ...(opts.dryRun ? ["--dry-run"] : []),
    ...(opts.silent ? ["--silent"] : []),
  ]
  const toAddress = (n: string) => address(project, registry, n)
  const batches = [
    [...groups.main.map(toAddress), ...foreign],
    groups.presets.map(toAddress),
    groups.icons.map(toAddress),
  ].filter((b) => b.length > 0)
  // Presets and icon styles go after the items so a dependency on the base theme or default icon set cannot undo them.
  for (const batch of batches) await runShadcn(["add", ...batch, ...flags], { cwd: project.cwd })

  if (opts.dryRun) return
  if (!project.hasComponentsJson()) return
  const next = emptyLock(registry, lock)
  next.items = [...next.items, ...groups.main]
  for (const name of groups.presets) {
    next.theme = { ...next.theme, accent: name.slice("theme-".length) }
  }
  const icon = groups.icons.at(-1)
  if (icon) next.icons = icon === DEFAULT_ICONS ? undefined : icon
  project.writeLockfile(next)
  if (!opts.silent) {
    log.ok(`Recorded in ${project.lockfilePath.slice(project.cwd.length + 1)}`)
    if (!project.registersNamespace(registry.base))
      log.info(`  Run \`${CLI_NAME} init\` to register ${NAMESPACE} so \`shadcn add ${NAMESPACE}/<name>\` works too.`)
  }
}
