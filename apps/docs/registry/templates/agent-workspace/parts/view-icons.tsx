"use client"

import * as React from "react"

import {
  CalendarDaysIcon,
  ChartIcon,
  CloudIcon,
  DatabaseIcon,
  GitPullRequestIcon,
  GlobeIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
  TerminalSquareIcon,
} from "@paneui/ui/icons"
import { IconChip } from "@paneui/ui/components/icon-chip"

import type { PluginIcon, TaskIcon, TaskTone } from "./workspace-data"

const GLYPHS: Record<TaskIcon | PluginIcon, React.ComponentType> = {
  chart: ChartIcon,
  mail: MailIcon,
  pr: GitPullRequestIcon,
  terminal: TerminalSquareIcon,
  shield: ShieldIcon,
  calendar: CalendarDaysIcon,
  database: DatabaseIcon,
  cloud: CloudIcon,
  globe: GlobeIcon,
  lock: LockIcon,
}

/** A task or plugin glyph in the house chip, tinted by its tone. */
export function ItemChip({ icon, tone, size = "default" }: { icon: TaskIcon | PluginIcon; tone: TaskTone; size?: "sm" | "default" | "lg" | "xl" }) {
  const Glyph = GLYPHS[icon]
  return (
    <IconChip tone={tone} size={size}>
      <Glyph />
    </IconChip>
  )
}

/** The bare glyph, for nav rows. */
export function ItemGlyph({ icon }: { icon: TaskIcon | PluginIcon }) {
  const Glyph = GLYPHS[icon]
  return <Glyph />
}
