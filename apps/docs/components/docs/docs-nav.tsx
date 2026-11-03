"use client"

import { useT, type Localized } from "@/lib/site-locale"
import { siteCopy } from "@/lib/site-copy"

import * as React from "react"
import Link from "next/link"

import { Badge } from "@paneui/ui/components/badge"
import {
  SidebarNav,
  SidebarNavContent,
  SidebarNavLink,
  SidebarNavList,
  SidebarNavSearch,
  SidebarNavSection,
} from "@paneui/ui/components/sidebar-nav"

import { COMPONENTS_HREF, COMPONENTS_TITLE, GUIDE_PAGES, TEMPLATES_HREF, THEMES_HREF } from "./docs-pages"
import { isNew } from "./whats-new"

export type NavGroup = { category: string; items: { name: string; title: string; description: Localized }[] }

/** Strip basePath-independent trailing slash so "/docs/button/" and "/docs/button" match. */
export function normalizePath(pathname: string | null) {
  if (!pathname || pathname === "/") return "/"
  return pathname.replace(/\/+$/, "")
}

export type DocsSection = "docs" | "components" | "templates" | "themes"

/** The header section a path belongs to. */
export function sectionOf(pathname: string, groups: NavGroup[]): DocsSection {
  if (pathname === THEMES_HREF) return "themes"
  if (GUIDE_PAGES.some((g) => g.href === pathname)) return "docs"
  if (pathname === TEMPLATES_HREF || groups.some((g) => g.category === "Templates" && g.items.some((i) => pathname === `/docs/${i.name}`))) return "templates"
  return "components"
}

/**
 * Docs navigation on the grey band, one list per header section: Docs (the guides), Components
 * (the overview, then each category) or Templates. Flat rows under small captions; the current
 * row is a fill.
 */
export function DocsNav({
  groups,
  pathname,
  onSearch,
  searchShortcut,
  showSearch = false,
  section,
  className,
}: {
  groups: NavGroup[]
  pathname: string
  onSearch: () => void
  searchShortcut: string
  /** The drawer has no header search, so it shows the field. */
  showSearch?: boolean
  /** Which list to show; matches the header link that is current. */
  section: DocsSection
  className?: string
}) {
  const t = useT()
  const label = (text: string) => t(siteCopy(text))

  const templates = groups.filter((g) => g.category === "Templates").flatMap((g) => g.items)
  const components = groups.filter((g) => g.category !== "Templates")
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
    <SidebarNav variant="fill" indicator="fill" data-docs-nav="" className={className}>
      {showSearch && (
        <SidebarNavSearch shortcut={searchShortcut} onClick={onSearch} aria-label={label("Search docs")}>
          {label("Search docs…")}
        </SidebarNavSearch>
      )}
      <SidebarNavContent aria-label={label(section === "docs" ? "Docs" : section === "templates" ? "Templates" : "Components")} className="pt-3">
        {section === "docs" && (
          <SidebarNavSection level="label" label={label("Getting started")}>
            <SidebarNavList>{GUIDE_PAGES.map((p) => link(p.href, p.title))}</SidebarNavList>
          </SidebarNavSection>
        )}

        {section === "components" && (
          <>
            <SidebarNavList>{link(COMPONENTS_HREF, COMPONENTS_TITLE)}</SidebarNavList>
            {components.map((g) => (
              <SidebarNavSection key={g.category} level="label" label={label(g.category)}>
                <SidebarNavList>{g.items.map((i) => link(`/docs/${i.name}`, i.title, newBadge(i.name)))}</SidebarNavList>
              </SidebarNavSection>
            ))}
          </>
        )}

        {section === "templates" && (
          <>
          <SidebarNavList>{link(TEMPLATES_HREF, "All templates")}</SidebarNavList>
          <SidebarNavSection level="label" label={label("Templates")}>
            <SidebarNavList>{templates.map((i) => link(`/docs/${i.name}`, i.title, newBadge(i.name)))}</SidebarNavList>
          </SidebarNavSection>
          </>
        )}
      </SidebarNavContent>
    </SidebarNav>
  )
}
