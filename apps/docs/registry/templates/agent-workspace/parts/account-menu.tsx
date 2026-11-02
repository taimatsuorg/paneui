"use client"

import * as React from "react"

import { ChartIcon, HelpCircleIcon, LogOutIcon, MoonIcon, SettingsIcon, TypeIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { MenuGroup, MenuItem, MenuSeparator, MenuShortcut } from "@paneui/ui/components/menu"
import { UsageMeter } from "@paneui/ui/components/usage-meter"
import { UserMenu } from "@paneui/ui/components/user-menu"

import { USER } from "./workspace-data"

type Connection = "disconnected" | "connecting" | "ready" | "error"

const CONNECTION: Record<Connection, { label: string; dot: string }> = {
  ready: { label: "Connected", dot: "bg-success" },
  connecting: { label: "Connecting", dot: "bg-warning" },
  error: { label: "Error", dot: "bg-destructive" },
  disconnected: { label: "Offline", dot: "bg-muted-foreground" },
}

/**
 * The account at the foot of the rail: how much of the plan is left (the one number people open
 * this menu for), the agent and its connection, then settings, shortcuts and the theme, then sign
 * out. The avatar carries a dot only while the agent is not connected.
 */
export function AccountMenu({
  onSettings,
  onShortcuts,
  onUsage,
  onToggleTheme,
  agent,
  onAgent,
  side = "right",
}: {
  onSettings: () => void
  onShortcuts: () => void
  onUsage: () => void
  onToggleTheme: () => void
  agent: { name: string; connection: Connection }
  onAgent: () => void
  side?: "right" | "top"
}) {
  const status = CONNECTION[agent.connection]
  return (
    <span className="relative flex">
      <UserMenu name={USER.name} email={USER.email} variant="compact" side={side} align="end">
        <div className="px-2 pt-1 pb-2">
          <UsageMeter label={`${USER.plan} plan`} value={8420} max={10000} readout="percent" description="Resets on Dec 1." />
        </div>
        <MenuSeparator />
        <MenuItem onClick={onAgent}>
          <span aria-hidden className="flex size-4 items-center justify-center">
            <span className={cn("size-1.5 rounded-full", status.dot)} />
          </span>
          <span className="min-w-0 flex-1 truncate">{agent.name}</span>
          {agent.connection === "ready" ? (
            <span className="sr-only">{status.label}</span>
          ) : (
            <span className="text-ui-xs text-muted-foreground">{status.label}</span>
          )}
        </MenuItem>
        <MenuSeparator />
        <MenuGroup>
          <MenuItem onClick={onUsage}>
            <ChartIcon />
            Usage
          </MenuItem>
          <MenuItem onClick={onSettings}>
            <SettingsIcon />
            Settings
            <MenuShortcut>⌘,</MenuShortcut>
          </MenuItem>
          <MenuItem onClick={onShortcuts}>
            <TypeIcon />
            Keyboard shortcuts
          </MenuItem>
          <MenuItem onClick={onToggleTheme}>
            <MoonIcon />
            Toggle dark mode
          </MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem render={<a href="https://agentclientprotocol.com" target="_blank" rel="noopener noreferrer" />}>
          <HelpCircleIcon />
          Help
        </MenuItem>
        <MenuItem>
          <LogOutIcon className="rtl:-scale-x-100" />
          Sign out
        </MenuItem>
      </UserMenu>
      {agent.connection !== "ready" && (
        <span aria-hidden className={cn("pointer-events-none absolute end-0 bottom-0 size-2 rounded-full ring-2", side === "top" ? "ring-popover" : "ring-shell", status.dot)} />
      )}
    </span>
  )
}
