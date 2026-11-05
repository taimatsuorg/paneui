"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"

import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Menu, MenuContent, MenuGroup, MenuItem, MenuLabel, MenuSeparator, MenuShortcut, MenuTrigger } from "@paneui/ui/components/menu"

/*
 * Team / workspace switcher for the top of an app sidebar: the current
 * workspace's mark, name and plan, opening a menu of the others plus
 * "Create workspace". `collapsed` shrinks it to the mark for an icon rail.
 *
 *   <WorkspaceSwitcher
 *     workspaces={[{ id: "acme", name: "Acme", plan: "Pro" }]}
 *     value="acme"
 *     onValueChange={setWorkspace}
 *     onCreate={() => setCreating(true)}
 *   />
 */

type Workspace = {
  id: string
  name: string
  /** Second line: plan, role or slug. */
  plan?: string
  /** Custom mark (logo). Defaults to the first letter on a solid tile. */
  logo?: React.ReactNode
}

type WorkspaceSwitcherProps = Omit<React.ComponentProps<"button">, "value" | "onChange"> & {
  workspaces: readonly Workspace[]
  value: string
  onValueChange: (id: string) => void
  onCreate?: () => void
  createLabel?: string
  /** Show only the mark (icon-rail sidebars). */
  collapsed?: boolean
  /** Popup alignment to the trigger. Defaults to "center". */
  align?: "start" | "center" | "end"
}

function WorkspaceMark({ workspace, className }: { workspace: Workspace; className?: string }) {
  return (
    <span
      aria-hidden
      data-slot="workspace-mark"
      className={cn(
        "grid size-6 shrink-0 place-items-center overflow-hidden bg-primary text-ui-xs font-semibold icon-bold text-primary-foreground shadow-primary [&_svg]:size-3.5",
        className ?? "rounded-md"
      )}
    >
      {workspace.logo ?? workspace.name.slice(0, 1).toUpperCase()}
    </span>
  )
}

function WorkspaceSwitcher({
  workspaces,
  value,
  onValueChange,
  onCreate,
  createLabel,
  collapsed = false,
  align = "center",
  className,
  ...props
}: WorkspaceSwitcherProps) {
  const l10n = useLocale().labels
  if (createLabel === undefined) createLabel = l10n.createWorkspace

  const current = workspaces.find((w) => w.id === value) ?? workspaces[0]
  if (!current) return null
  return (
    <Menu>
      <MenuTrigger
        data-slot="workspace-switcher"
        className={cn(
          "group/ws frame-inner frame-inset-2 flex h-10 w-full min-w-0 cursor-pointer items-center gap-2.5 px-2 text-start text-ui outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-secondary",
          collapsed && "justify-center gap-0 px-0",
          className
        )}
        {...props}
        aria-label={props["aria-label"] ?? l10n.workspaceSwitch(current.name)}
      >
        {/* 8px into the row: concentric with it where that leaves a usable radius */}
        <WorkspaceMark workspace={current} className="rounded-inner-or-md" />
        <span
          className={cn(
            "flex min-w-0 flex-1 flex-col leading-tight transition-opacity duration-200",
            collapsed && "pointer-events-none w-0 flex-none opacity-0"
          )}
        >
          <span className="truncate font-semibold">{current.name}</span>
          {current.plan && <span className="truncate text-ui-xs text-muted-foreground">{current.plan}</span>}
        </span>
        {!collapsed && <ChevronsUpDownIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />}
      </MenuTrigger>
      <MenuContent align={align} className="w-60">
        <MenuGroup>
          <MenuLabel>{l10n.workspaces}</MenuLabel>
          {workspaces.map((w, i) => (
            <MenuItem key={w.id} onClick={() => onValueChange(w.id)} className="min-h-8">
              <WorkspaceMark workspace={w} className="size-5 rounded-sm" />
              <span className="min-w-0 flex-1 truncate">{w.name}</span>
              {w.id === current.id ? <CheckIcon className="text-foreground!" /> : i < 9 && <MenuShortcut>⌘{i + 1}</MenuShortcut>}
            </MenuItem>
          ))}
        </MenuGroup>
        {onCreate && (
          <>
            <MenuSeparator />
            <MenuItem onClick={onCreate}>
              <PlusIcon />
              {createLabel}
            </MenuItem>
          </>
        )}
      </MenuContent>
    </Menu>
  )
}

export { WorkspaceSwitcher, WorkspaceMark }
export type { Workspace, WorkspaceSwitcherProps }
