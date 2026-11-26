"use client"

import { useT, type Localized } from "@/lib/site-locale"
import { siteCopy } from "@/lib/site-copy"

import * as React from "react"
import Link from "next/link"

import { Badge } from "@paneui/ui/components/badge"
import {
  SidebarNav,
  SidebarNavContent,
  SidebarNavFooter,
  SidebarNavLink,
  SidebarNavList,
  SidebarNavSearch,
  SidebarNavSection,
} from "@paneui/ui/components/sidebar-nav"

import { COMPONENTS_HREF, COMPONENTS_TITLE, GUIDE_PAGES, TEMPLATES_HREF } from "./docs-pages"
import { isNew } from "./whats-new"

export type NavGroup = { category: string; items: { name: string; title: string; description: Localized }[] }

/** Strip basePath-independent trailing slash so "/docs/button/" and "/docs/button" match. */
export function normalizePath(pathname: string | null) {
  if (!pathname || pathname === "/") return "/"
  return pathname.replace(/\/+$/, "")
}

export type DocsSection = "docs" | "components" | "icons" | "templates"

/** The header section a path belongs to. */
export function sectionOf(pathname: string, groups: NavGroup[]): DocsSection {
  if (GUIDE_PAGES.some((g) => g.href === pathname)) return "docs"
  if (pathname === TEMPLATES_HREF || groups.some((g) => g.category === "Templates" && g.items.some((i) => pathname === `/docs/${i.name}`))) return "templates"
  return "components"
}

const COLLAPSED_KEY = "docs-nav-collapsed"

/** Collapsed sections and groups, persisted across visits while expanding active ancestors on navigation. */
function useCollapsed(activeIds: string[]) {
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set())
  const activeKey = activeIds.join("\0")

  React.useEffect(() => {
    let stored: string[] = []
    try {
      const raw = localStorage.getItem(COLLAPSED_KEY)
      if (raw) stored = JSON.parse(raw) as string[]
    } catch {
      // storage can be unavailable
    }
    const active = activeKey ? activeKey.split("\0") : []
    setCollapsed(new Set(stored.filter((id) => !active.includes(id))))
  }, [activeKey])

  const setOpen = React.useCallback((id: string, open: boolean) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (open) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...next]))
      } catch {
        // storage can be unavailable
      }
      return next
    })
  }, [])

  return [collapsed, setOpen] as const
}

/**
 * Docs navigation using Default SidebarNav: collapsible sections, folder-like category groups
 * with counts and guide lines, a 2px gutter bar on the current row, and a pinned Changelog footer.
 */
export function DocsNav({
  groups,
  pathname,
  onSearch,
  searchShortcut,
  showSearch = false,
  className,
}: {
  groups: NavGroup[]
  pathname: string
  onSearch: () => void
  searchShortcut: string
  /** The drawer has no header search, so it shows the field. */
  showSearch?: boolean
  className?: string
}) {
  const t = useT()
  const label = (text: string) => t(siteCopy(text))

  const templates = groups.filter((g) => g.category === "Templates").flatMap((g) => g.items)
  const components = groups.filter((g) => g.category !== "Templates")
  const componentCount = components.reduce((n, g) => n + g.items.length, 0)
  const guideLinks = GUIDE_PAGES.filter((p) => p.href !== "/docs/changelog")
  const changelog = GUIDE_PAGES.find((p) => p.href === "/docs/changelog")

  const activeGroup = components.find((g) => g.items.some((i) => pathname === `/docs/${i.name}`))
  const inGuides = guideLinks.some((p) => p.href === pathname)
  const inComponents = pathname === COMPONENTS_HREF || activeGroup !== undefined
  const inTemplates = pathname === TEMPLATES_HREF || templates.some((i) => pathname === `/docs/${i.name}`)
  const activeIds = [
    ...(inGuides ? ["docs"] : []),
    ...(inComponents ? ["components"] : []),
    ...(activeGroup ? [`group:${activeGroup.category}`] : []),
    ...(inTemplates ? ["templates"] : []),
  ]
  const [collapsed, setOpen] = useCollapsed(activeIds)

  const newBadge = (name: string) =>
    isNew(name) ? (
      <Badge variant="success" size="sm">
        {label("New")}
      </Badge>
    ) : undefined
  const link = (href: string, title: string, badge?: React.ReactNode) => (
    <SidebarNavLink key={href} active={pathname === href} badge={badge} render={<Link href={href} />}>
      {label(title)}
    </SidebarNavLink>
  )

  return (
    <SidebarNav className={className}>
      {showSearch && (
        <SidebarNavSearch shortcut={searchShortcut} onClick={onSearch} aria-label={label("Search docs")}>
          {label("Search docs…")}
        </SidebarNavSearch>
      )}
      <SidebarNavContent aria-label={label("Docs")} className={showSearch ? undefined : "pt-3"}>
        <SidebarNavSection label={label("Getting started")} open={!collapsed.has("docs")} onOpenChange={(open) => setOpen("docs", open)}>
          <SidebarNavList>{guideLinks.map((p) => link(p.href, p.title))}</SidebarNavList>
        </SidebarNavSection>

        <SidebarNavSection
          label={label(COMPONENTS_TITLE)}
          count={componentCount}
          labelRender={<Link href={COMPONENTS_HREF} />}
          active={pathname === COMPONENTS_HREF}
          open={!collapsed.has("components")}
          onOpenChange={(open) => setOpen("components", open)}
        >
          {components.map((g) => (
            <SidebarNavSection
              key={g.category}
              level="group"
              label={label(g.category)}
              count={g.items.length}
              open={!collapsed.has(`group:${g.category}`)}
              onOpenChange={(open) => setOpen(`group:${g.category}`, open)}
            >
              <SidebarNavList>{g.items.map((i) => link(`/docs/${i.name}`, i.title, newBadge(i.name)))}</SidebarNavList>
            </SidebarNavSection>
          ))}
        </SidebarNavSection>

        {templates.length > 0 && (
          <SidebarNavSection
            label={label("Templates")}
            count={templates.length}
            labelRender={<Link href={TEMPLATES_HREF} />}
            active={pathname === TEMPLATES_HREF}
            open={!collapsed.has("templates")}
            onOpenChange={(open) => setOpen("templates", open)}
          >
            <SidebarNavList>{templates.map((i) => link(`/docs/${i.name}`, i.title, newBadge(i.name)))}</SidebarNavList>
          </SidebarNavSection>
        )}
      </SidebarNavContent>

      {changelog && (
        <SidebarNavFooter>
          <SidebarNavList>{link(changelog.href, changelog.title)}</SidebarNavList>
        </SidebarNavFooter>
      )}
    </SidebarNav>
  )
}
