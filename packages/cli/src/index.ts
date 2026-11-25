#!/usr/bin/env node
import { parseArgs, type ParseArgsConfig } from "node:util"

import { add } from "./commands/add.js"
import { init } from "./commands/init.js"
import { info, search } from "./commands/search.js"
import { theme } from "./commands/theme.js"
import { update } from "./commands/update.js"
import { CLI_NAME, CLI_VERSION, DEFAULT_REGISTRY, LOCKFILE, NAMESPACE, REGISTRY_ENV, SHADCN_ENV } from "./meta.js"
import { CliError, c, log } from "./ui.js"

type Options = NonNullable<ParseArgsConfig["options"]>

const common: Options = {
  cwd: { type: "string", short: "c" },
  registry: { type: "string", short: "r" },
  help: { type: "boolean", short: "h" },
}

interface Command {
  usage: string
  summary: string
  options: Options
  help: string[]
  run: (positionals: string[], values: Record<string, unknown>, rest: string[]) => Promise<void>
}

const commands: Record<string, Command> = {
  init: {
    usage: "init [-- shadcn init options]",
    summary: `Register ${NAMESPACE} in components.json (runs shadcn init first if needed) and install the theme`,
    options: {
      yes: { type: "boolean", short: "y" },
      "no-theme": { type: "boolean" },
      accent: { type: "string" },
    },
    help: ["-y, --yes             Skip shadcn prompts", "    --no-theme        Only register the namespace", "    --accent <name>   Accent preset to install with the theme"],
    run: (_p, v, rest) =>
      init({ ...v, theme: !v["no-theme"], accent: v.accent as string, passthrough: rest } as never),
  },
  add: {
    usage: "add <items...>",
    summary: "Add items with the shadcn CLI and record them for update",
    options: {
      overwrite: { type: "boolean", short: "o" },
      yes: { type: "boolean", short: "y" },
      path: { type: "string", short: "p" },
      "dry-run": { type: "boolean" },
      silent: { type: "boolean", short: "s" },
    },
    help: ["-o, --overwrite       Replace existing files", "-y, --yes             Skip confirmation prompts", "-p, --path <dir>      Install to this directory", "    --dry-run         List the changes without writing", "-s, --silent          Less output"],
    run: (p, v) => add(p, { ...v, dryRun: v["dry-run"] } as never),
  },
  search: {
    usage: "search [query]",
    summary: "Find items by name, title, description or category",
    options: {
      all: { type: "boolean", short: "a" },
      category: { type: "string" },
      type: { type: "string", short: "t" },
      limit: { type: "string", short: "l" },
      json: { type: "boolean" },
    },
    help: ["-a, --all             Include hidden presets", "    --category <name> Only this category (Forms, Agents, Charts…)", "-t, --type <type>     Only this type (ui, block, theme…)", "-l, --limit <n>       Show at most n results", "    --json            Print JSON"],
    run: (p, v) => search(p.join(" "), v as never),
  },
  list: {
    usage: "list",
    summary: "List every item (alias of search with no query)",
    options: {
      all: { type: "boolean", short: "a" },
      category: { type: "string" },
      type: { type: "string", short: "t" },
      json: { type: "boolean" },
    },
    help: ["-a, --all             Include hidden presets", "    --category <name> Only this category", "-t, --type <type>     Only this type", "    --json            Print JSON"],
    run: (p, v) => search(p.join(" "), v as never),
  },
  info: {
    usage: "info <item>",
    summary: "Show an item's dependencies, files and install commands",
    options: { json: { type: "boolean" } },
    help: ["    --json            Print the item JSON (without file contents)"],
    run: (p, v) => {
      if (!p[0]) throw new CliError(`Usage: ${CLI_NAME} info <item>`)
      return info(p[0], v as never)
    },
  },
  update: {
    usage: "update",
    summary: "Reinstall the theme and every installed item with --overwrite",
    options: {
      "theme-only": { type: "boolean" },
      "dry-run": { type: "boolean" },
      yes: { type: "boolean", short: "y" },
      templates: { type: "boolean" },
      "no-detect": { type: "boolean" },
    },
    help: [
      "    --dry-run         Show what would change and the commands, write nothing",
      "    --theme-only      Only the theme and its accent preset",
      "-y, --yes             Skip the confirmation",
      "    --templates       Also reinstall page templates (replaces their routes)",
      `    --no-detect       Only items recorded in ${LOCKFILE}`,
    ],
    run: (_p, v) => update({ ...v, themeOnly: v["theme-only"], dryRun: v["dry-run"], detect: !v["no-detect"] } as never),
  },
  theme: {
    usage: "theme [accent]",
    summary: "Reinstall the theme, optionally with an accent preset",
    options: {
      list: { type: "boolean" },
      yes: { type: "boolean", short: "y" },
      "dry-run": { type: "boolean" },
    },
    help: ["    --list            List accents", "-y, --yes             Skip confirmation prompts", "    --dry-run         List the changes without writing"],
    run: (p, v) => theme(p[0], { ...v, dryRun: v["dry-run"] } as never),
  },
}

const COMMON_HELP = [
  "-c, --cwd <dir>       Project directory (default: current directory)",
  `-r, --registry <url>  Registry base (default: ${DEFAULT_REGISTRY})`,
  "-h, --help            Show help",
]

function mainHelp() {
  const w = Math.max(...Object.values(commands).map((cmd) => cmd.usage.split(" ")[0].length)) + 2
  return [
    `${c.bold(CLI_NAME)} ${c.dim(CLI_VERSION)}  PaneUI components and themes, on top of the shadcn CLI`,
    "",
    `Usage: ${CLI_NAME} <command> [options]`,
    "",
    "Commands:",
    ...Object.entries(commands).map(([name, cmd]) => `  ${name.padEnd(w)}${cmd.summary}`),
    "",
    "Options:",
    ...COMMON_HELP.map((l) => `  ${l}`),
    "  -v, --version         Show the version",
    "",
    `Registry: --registry, then $${REGISTRY_ENV}, then registries["${NAMESPACE}"] in components.json.`,
    `shadcn runs as \`npx --yes shadcn@latest\`; set $${SHADCN_ENV} to use another command.`,
    "",
    `Run \`${CLI_NAME} <command> --help\` for a command's options.`,
  ].join("\n")
}

function commandHelp(name: string, cmd: Command) {
  return [`Usage: ${CLI_NAME} ${cmd.usage} [options]`, "", cmd.summary, "", "Options:", ...[...cmd.help, ...COMMON_HELP].map((l) => `  ${l}`)].join("\n")
}

export async function main(argv = process.argv.slice(2)) {
  const [first, ...args] = argv
  if (!first || first === "-h" || first === "--help" || first === "help") {
    const target = first === "help" ? args[0] : undefined
    console.log(target && commands[target] ? commandHelp(target, commands[target]) : mainHelp())
    return
  }
  if (first === "-v" || first === "--version") {
    console.log(CLI_VERSION)
    return
  }
  const cmd = commands[first]
  if (!cmd) throw new CliError(`Unknown command "${first}". Run \`${CLI_NAME} --help\`.`)
  const dash = args.indexOf("--")
  const own = dash >= 0 ? args.slice(0, dash) : args
  const rest = dash >= 0 ? args.slice(dash + 1) : []
  let parsed
  try {
    parsed = parseArgs({ args: own, options: { ...common, ...cmd.options }, allowPositionals: true, strict: true })
  } catch (err) {
    throw new CliError(`${(err as Error).message}\n\n${commandHelp(first, cmd)}`)
  }
  if (parsed.values.help) {
    console.log(commandHelp(first, cmd))
    return
  }
  await cmd.run(parsed.positionals, parsed.values as Record<string, unknown>, rest)
}

main().catch((err: unknown) => {
  // exitCode, not exit(): an immediate exit can outrun the stderr pipe on Windows
  // (libuv assertion) and skip the pending write.
  if (err instanceof CliError) {
    log.error(err.message)
    process.exitCode = err.exitCode
  } else {
    log.error((err as Error)?.stack ?? String(err))
    process.exitCode = 1
  }
})
