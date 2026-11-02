"use client"

import * as React from "react"

import { ChartIcon, HelpCircleIcon, LogOutIcon, MoonIcon, SettingsIcon, TypeIcon } from "@paneui/ui/icons"
import { MenuGroup, MenuItem, MenuSeparator, MenuShortcut } from "@paneui/ui/components/menu"
import { UsageMeter } from "@paneui/ui/components/usage-meter"
import { UserMenu } from "@paneui/ui/components/user-menu"

import { USER } from "./workspace-data"

/**
 * The account at the foot of the rail: how much of the plan is left (the one number people open
 * this menu for), then settings, shortcuts and the theme, then sign out.
 */
export function AccountMenu({
  onSettings,
  onShortcuts,
  onUsage,
  onToggleTheme,
  side = "right",
}: {
  onSettings: () => void
  onShortcuts: () => void
  onUsage: () => void
  onToggleTheme: () => void
  side?: "right" | "top"
}) {
  return (
    <UserMenu name={USER.name} email={USER.email} variant="compact" side={side} align="end">
      <div className="px-2 pt-1 pb-2">
        <UsageMeter label={`${USER.plan} plan`} value={8420} max={10000} readout="percent" description="Resets on Dec 1." />
      </div>
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
  )
}
