"use client"

import { useT } from "@/lib/site-locale"
import { siteCopy } from "@/lib/site-copy"

import * as React from "react"

import { CheckIcon, ChevronDownIcon, CopyIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { ActionSwapBlurButton, type ActionSwapItem } from "@paneui/ui/components/action-swap-blur"
import { CommandGroup } from "@paneui/ui/components/command-copy"
import { Button } from "@paneui/ui/components/button"
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@paneui/ui/components/menu"
import cliPackage from "@paneui/cli-metadata/package.json"

const MANAGERS = {
  pnpm: "pnpm dlx shadcn@latest",
  npm: "npx shadcn@latest",
  yarn: "yarn dlx shadcn@latest",
  bun: "bunx --bun shadcn@latest",
} as const
type Manager = keyof typeof MANAGERS

/** The library's own CLI (packages/cli); its npm name is the one field to change when it is renamed. */
/** The npm package (for npx) and the command it installs. */
export const CLI_PACKAGE = cliPackage.name
export const CLI_NAME = Object.keys(cliPackage.bin ?? {})[0] ?? cliPackage.name
const RUNNERS = {
  pnpm: "pnpm dlx",
  npm: "npx",
  yarn: "yarn dlx",
  bun: "bunx",
} as const satisfies Record<Manager, string>
const PM_KEY = "package-manager"
const isManager = (v: unknown): v is Manager => typeof v === "string" && v in MANAGERS

/* One package-manager choice shared by every command block on the page (and remembered). */
const listeners = new Set<() => void>()
let current: Manager = "pnpm"
function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
function setManager(pm: Manager) {
  current = pm
  try {
    localStorage.setItem(PM_KEY, pm)
  } catch {}
  listeners.forEach((fn) => fn())
}
export function usePackageManager() {
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(PM_KEY)
      if (isManager(stored) && stored !== current) setManager(stored)
    } catch {}
  }, [])
  return React.useSyncExternalStore(
    subscribe,
    () => current,
    () => "pnpm" as Manager,
  )
}

const COPY_ITEMS = [
  {
    value: "copy",
    label: "Copy",
    icon: <CopyIcon />,
    ariaLabel: "Copy command",
  },
  {
    value: "copied",
    label: "Copied",
    icon: <CheckIcon className="text-success-text" />,
    ariaLabel: "Copied",
  },
] satisfies ActionSwapItem[]

/** A raised pill holding one shell command, with a blur-swap copy button. */
export function CommandPill({ command, className }: { command: string; className?: string }) {
  const t = useT()
  const items = React.useMemo(() => COPY_ITEMS.map((item) => ({ ...item, label: t(siteCopy(item.label)), ariaLabel: t(siteCopy(item.ariaLabel ?? "Copy command")) })), [t])
  const [state, setState] = React.useState("copy")
  return (
    <div
      data-slot="command-pill"
      className={cn(
        "flex h-10 min-w-0 items-center gap-2 rounded-xl bg-card ps-3 pe-1 font-mono text-ui text-card-foreground shadow-raised",
        className,
      )}
    >
      <span aria-hidden className="text-muted-foreground select-none">
        $
      </span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap scrollbar-none">{command}</code>
      <ActionSwapBlurButton
        items={items}
        value={state}
        onValueChange={setState}
        cycle={false}
        resetAfter={1600}
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-foreground"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(command)
            setState("copied")
          } catch {
            // clipboard blocked: leave the button as is
          }
        }}
      />
    </div>
  )
}

/**
 * CLI command with pnpm / npm / yarn / bun tabs. `args` is everything after the CLI, e.g. "add @x/button".
 * `cli="paneui"` runs the library's own CLI instead of shadcn.
 */
export function InstallCommand({ args, cli = "shadcn", className }: { args: string; cli?: "shadcn" | "paneui"; className?: string }) {
  const pm = usePackageManager()
  const runner = (m: Manager) => (cli === "shadcn" ? MANAGERS[m] : `${RUNNERS[m]} ${CLI_PACKAGE}@latest`)
  const items = React.useMemo(
    () => (Object.keys(MANAGERS) as Manager[]).map((m) => ({ value: m, command: `${runner(m)} ${args}` })),
    // runner closes over args and cli only
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [args, cli]
  )
  return <CommandGroup items={items} value={pm} onValueChange={(v) => isManager(v) && setManager(v)} storageKey={PM_KEY} className={className} />
}

const ADD = {
  pnpm: "pnpm add",
  npm: "npm install",
  yarn: "yarn add",
  bun: "bun add",
} as const satisfies Record<Manager, string>

/** `pnpm add <packages>` with the same remembered package-manager tabs. */
export function PackageInstall({ packages, className }: { packages: string[]; className?: string }) {
  const pm = usePackageManager()
  const key = packages.join("\u0000")
  const items = React.useMemo(
    () => (Object.keys(ADD) as Manager[]).map((m) => ({ value: m, command: `${ADD[m]} ${key.split("\u0000").join(" ")}` })),
    [key]
  )
  return <CommandGroup items={items} value={pm} onValueChange={(v) => isManager(v) && setManager(v)} storageKey={PM_KEY} className={className} />
}

/** The shadcn add command for one registry item with the given package manager. */
export function addCommand(pm: Manager, registry: string, item: string) {
  return `${MANAGERS[pm]} add @${registry}/${item}`
}

const MANAGER_LABELS = { pnpm: "pnpm", npm: "npm", yarn: "yarn", bun: "bun" } as const satisfies Record<Manager, string>

/**
 * A compact install control for a card footer: the remembered package manager, the registry item's
 * name and a copy button. The copy writes the whole command (`pnpm dlx shadcn@latest add @x/name`).
 */
export function InstallChip({ item, registry, className }: { item: string; registry: string; className?: string }) {
  const t = useT()
  const pm = usePackageManager()
  const command = addCommand(pm, registry, item)
  const items = React.useMemo(() => COPY_ITEMS.map((i) => ({ ...i, label: t(siteCopy(i.label)), ariaLabel: t(siteCopy(i.ariaLabel ?? "Copy command")) })), [t])
  const [state, setState] = React.useState("copy")
  return (
    <div data-slot="install-chip" className={cn("flex h-7 min-w-0 items-center rounded-control bg-background text-ui-sm shadow-raised", className)}>
      <Menu>
        <MenuTrigger render={<Button variant="ghost" size="xs" className="text-muted-foreground" aria-label={t(siteCopy("Package manager"))} />}>
          <span className="font-mono">{MANAGER_LABELS[pm]}</span>
          <ChevronDownIcon data-icon="inline-end" />
        </MenuTrigger>
        <MenuContent className="min-w-28">
          <MenuRadioGroup value={pm} onValueChange={(v) => isManager(v) && setManager(v)}>
            {(Object.keys(MANAGER_LABELS) as Manager[]).map((m) => (
              <MenuRadioItem key={m} value={m}>{MANAGER_LABELS[m]}</MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
      <span aria-hidden className="h-4 w-px bg-border" />
      <code className="min-w-0 truncate ps-2.5 font-mono text-ui-xs text-muted-foreground">@{registry}/{item}</code>
      <ActionSwapBlurButton
        items={items}
        value={state}
        onValueChange={setState}
        cycle={false}
        resetAfter={1600}
        variant="ghost"
        size="icon-xs"
        className="me-0.5 ms-0.5 text-muted-foreground hover:text-foreground"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(command)
            setState("copied")
          } catch {
            // clipboard blocked: leave the button as is
          }
        }}
      />
    </div>
  )
}
