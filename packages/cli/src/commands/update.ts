import { CLI_NAME, DEFAULT_ACCENT, LOCKFILE } from "../meta.js"
import { detect, isTemplate, itemChange, type ItemChange } from "../detect.js"
import { runShadcn, formatCommand } from "../shadcn.js"
import { CliError, c, confirm, log } from "../ui.js"
import { address, classify, context, emptyLock, type CommonOptions } from "../context.js"

export interface UpdateOptions extends CommonOptions {
  themeOnly?: boolean
  dryRun?: boolean
  yes?: boolean
  templates?: boolean
  detect?: boolean
}

function summarize(changes: ItemChange[]) {
  let changedFiles = 0
  let newFiles = 0
  let same = 0
  for (const ch of changes) {
    const files = ch.files.filter((f) => f.status !== "same")
    same += ch.files.length - files.length
    const vars = ch.cssVars && ch.cssVars.changed > 0 ? c.dim(`  ${ch.cssVars.changed}/${ch.cssVars.total} css variables differ`) : ""
    if (files.length === 0 && !vars) {
      log.info(`  ${c.dim("=")} ${ch.name} ${c.dim("up to date")}`)
      continue
    }
    log.info(`  ${c.yellow("~")} ${c.bold(ch.name)}${vars}`)
    for (const f of files) {
      if (f.status === "new") {
        newFiles++
        log.info(`      ${c.green("+")} ${f.path} ${c.dim("(new)")}`)
      } else {
        changedFiles++
        log.info(`      ${c.yellow("~")} ${f.path} ${c.green(`+${f.added}`)} ${c.red(`-${f.removed}`)}`)
      }
    }
  }
  log.info()
  log.info(c.dim(`${changedFiles} changed, ${newFiles} new, ${same} unchanged files (line counts ignore import paths)`))
}

/**
 * Reinstalls everything this project got from the registry: the theme, then the recorded and
 * detected items with --overwrite, then the accent preset and the icon style, so a
 * dependency on the defaults cannot undo them.
 */
export async function update(opts: UpdateOptions) {
  const { project, registry, lock } = context(opts)
  if (!project.hasComponentsJson()) throw new CliError(`No components.json in ${project.cwd}. Run \`${CLI_NAME} init\` first.`)
  const index = await registry.index()
  const known = new Set(index.items.map((i) => i.name))

  const recorded = (lock?.items ?? []).filter((n) => known.has(n))
  const gone = (lock?.items ?? []).filter((n) => !known.has(n))
  const found = opts.detect === false ? null : await detect(project, registry, index)

  const byName = new Map(index.items.map((i) => [i.name, i]))
  const all = [...new Set([...recorded, ...(found?.items ?? []), ...(found?.templates ?? [])])].filter((n) => classify(index, n) === "item")
  const tpl = all.filter((n) => isTemplate(byName.get(n)!))
  const items = opts.themeOnly ? [] : all.filter((n) => opts.templates || !tpl.includes(n))
  const skippedTemplates = opts.themeOnly || opts.templates ? [] : tpl

  const accent = lock?.theme?.accent ?? found?.accent
  const icons = opts.themeOnly ? undefined : (lock?.icons ?? found?.icons)
  const presets = (accent && accent !== DEFAULT_ACCENT ? [`theme-${accent}`] : []).filter((n) => known.has(n))

  const detectedOnly = [...(found?.items ?? []), ...(found?.templates ?? [])].filter((n) => !recorded.includes(n))
  log.step(`Registry ${registry.base}`)
  if (lock) log.info(c.dim(`  ${recorded.length} items recorded in ${LOCKFILE}`))
  else log.info(c.dim(`  No ${LOCKFILE}; using items found in the project`))
  if (detectedOnly.length) log.info(c.dim(`  Found ${detectedOnly.length} more in the project: ${detectedOnly.join(", ")}`))
  if (gone.length) log.warn(`No longer in the registry, skipped: ${gone.join(", ")}`)
  if (skippedTemplates.length) log.warn(`Templates skipped, they would replace your routes (add --templates to include): ${skippedTemplates.join(", ")}`)

  const steps: string[][] = [["theme", ...items.filter((n) => n !== "theme")]]
  if (presets.length) steps.push(presets)
  if (icons) steps.push([icons])

  log.info()
  log.step(opts.dryRun ? "Would change" : "Changes")
  const names = steps.flat()
  const fetched = await Promise.all(names.map((n) => registry.item(n)))
  // Variables a preset sets are compared against the preset, not the base theme it overrides.
  const presetKeys = new Set(fetched.filter((i) => presets.includes(i.name)).flatMap((i) => Object.keys(i.cssVars?.light ?? {})))
  summarize(await Promise.all(fetched.map((item) => itemChange(project, item, item.name === "theme" ? presetKeys : undefined))))

  const commands = steps.map((s) => ["add", ...s.map((n) => address(project, registry, n)), "--overwrite", "--yes"])
  log.info()
  if (opts.dryRun) {
    log.step("Would run")
    for (const cmd of commands) log.info(`  ${formatCommand(cmd)}`)
    return
  }
  if (!opts.yes) {
    if (!process.stdin.isTTY) throw new CliError("Pass --yes to update without a prompt, or --dry-run to preview.")
    const go = await confirm(`Overwrite these files? Local edits to them are replaced.`, false)
    if (!go) {
      log.info("Nothing changed.")
      return
    }
  }
  for (const cmd of commands) await runShadcn(cmd, { cwd: project.cwd })

  const next = emptyLock(registry, lock)
  if (!opts.themeOnly) next.items = [...recorded, ...items.filter((n) => n !== "theme")]
  next.theme = { accent: accent && accent !== DEFAULT_ACCENT ? accent : undefined }
  if (!opts.themeOnly) next.icons = icons
  project.writeLockfile(next)
  log.ok(`Updated ${opts.themeOnly ? "the theme" : `the theme and ${items.length} items`}`)
}
