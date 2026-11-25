import { CLI_NAME, NAMESPACE } from "../meta.js"
import { templateFromBase } from "../registry.js"
import { runShadcn } from "../shadcn.js"
import { CliError, log } from "../ui.js"
import { context, type CommonOptions } from "../context.js"
import { theme } from "./theme.js"

export interface InitOptions extends CommonOptions {
  yes?: boolean
  theme?: boolean
  accent?: string
  /** Extra arguments for `shadcn init` (after `--`). */
  passthrough?: string[]
}

export async function init(opts: InitOptions) {
  const { project, registry } = context(opts)
  if (!project.hasComponentsJson()) {
    log.step("No components.json yet, running shadcn init")
    await runShadcn(["init", "--base", "base", ...(opts.yes ? ["--yes"] : []), ...(opts.passthrough ?? [])], { cwd: project.cwd })
    if (!project.hasComponentsJson()) throw new CliError("shadcn init finished without writing components.json")
  }
  const changed = project.registerNamespace(registry.base)
  if (changed) log.ok(`Registered ${NAMESPACE} → ${templateFromBase(registry.base)} in components.json`)
  else log.ok(`${NAMESPACE} is already registered in components.json`)

  if (opts.theme !== false) await theme(opts.accent, { ...opts, yes: true })
  log.info()
  log.info(`Next: \`${CLI_NAME} add button\`, or \`npx shadcn@latest add ${NAMESPACE}/button\`.`)
}
