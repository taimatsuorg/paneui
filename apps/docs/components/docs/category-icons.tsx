import type * as React from "react"

import {
  BoltIcon,
  BookmarkIcon,
  BotIcon,
  ChartIcon,
  CopyIcon,
  EditIcon,
  FileIcon,
  FolderIcon,
  GridIcon,
  HomeIcon,
  InboxIcon,
  MonitorIcon,
  NavigationIcon,
  ServerIcon,
  SettingsIcon,
  ShapesIcon,
  SparklesIcon,
  TerminalSquareIcon,
} from "@paneui/ui/icons"

import { ICONS_HREF } from "./docs-pages"

type IconComponent = React.ComponentType<{ className?: string; size?: number }>

/**
 * One icon per docs category (sidebar rail, command palette).
 * They render side by side, so all of them are solid puff shapes of the same
 * optical weight; no outlined ring or open line glyph belongs in this set.
 */
export const categoryIcons: Record<string, IconComponent> = {
  Templates: MonitorIcon,
  Foundations: SparklesIcon,
  Forms: EditIcon,
  Overlays: CopyIcon,
  Display: ShapesIcon,
  Navigation: NavigationIcon,
  Text: FileIcon,
  Motion: BoltIcon,
  Data: ServerIcon,
  Agents: BotIcon,
  Charts: ChartIcon,
  Blocks: InboxIcon,
}

/** Components overview (the gallery at /). */
export const ComponentsIcon: IconComponent = GridIcon

/** "Getting started" pages, keyed by href (see docs-pages.ts). Same solid family as the categories. */
export const guideIcons: Record<string, IconComponent> = {
  "/docs": HomeIcon,
  "/docs/installation": TerminalSquareIcon,
  "/docs/theming": SettingsIcon,
  [ICONS_HREF]: ShapesIcon,
  "/docs/cli": FolderIcon,
  "/docs/changelog": BookmarkIcon,
}

export const categorySlug = (category: string) => category.toLowerCase().replace(/\s+/g, "-")
