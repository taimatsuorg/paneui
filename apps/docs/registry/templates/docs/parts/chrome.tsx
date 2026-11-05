"use client"

import * as React from "react"
import { siGithub } from "simple-icons"

import { MenuIcon, SearchIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Badge } from "@paneui/ui/components/badge"
import { BrandIcon } from "@paneui/ui/components/brand-icon"
import { Button } from "@paneui/ui/components/button"
import { Kbd } from "@paneui/ui/components/kbd"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@paneui/ui/components/navigation-menu"
import { ThemeToggle } from "@paneui/ui/components/theme-toggle"

import { SECTIONS } from "./site"

/** Opens the search palette and the navigation drawer; provided once by DocsTemplate. */
export const DocsChromeContext = React.createContext<{ openSearch: () => void; openNav: () => void }>({
  openSearch: () => {},
  openNav: () => {},
})
export const useDocsChrome = () => React.useContext(DocsChromeContext)

export function Brand() {
  return (
    <a href="#" className="flex shrink-0 items-center rounded-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span>
        Tessel <span className="font-normal text-muted-foreground">Docs</span>
      </span>
    </a>
  )
}

/** Search field on wide screens, an icon button on phones. `compact` keeps it an icon at every width. */
export function SearchButton({ compact }: { compact?: boolean }) {
  const { openSearch } = useDocsChrome()
  if (compact)
    return (
      <Button variant="ghost" size="icon-sm" onClick={openSearch} aria-label="Search docs" aria-keyshortcuts="Meta+K">
        <SearchIcon />
      </Button>
    )
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={openSearch}
      aria-label="Search docs"
      aria-keyshortcuts="Meta+K"
      // eslint-disable-next-line shadcn/no-restyle -- header search morphs from an icon button (mobile) to a 256px field (sm+)
      className="w-8 px-0 text-muted-foreground sm:w-64 sm:justify-start sm:px-3"
    >
      <SearchIcon />
      <span className="hidden sm:inline">Search docs…</span>
      <Kbd className="ms-auto max-sm:hidden">⌘K</Kbd>
    </Button>
  )
}

export function HeaderActions({ compactSearch }: { compactSearch?: boolean }) {
  return (
    <div className="-me-1.5 ms-auto flex items-center gap-1.5">
      <SearchButton compact={compactSearch} />
      <Button variant="ghost" size="icon-sm" nativeButton={false} render={<a href="#" />} aria-label="GitHub">
        <BrandIcon icon={siGithub} />
      </Button>
      <ThemeToggle variant="ghost" modes="tri" />
    </div>
  )
}

/** Section links as header tabs: the current section has the bar. */
export function SectionTabs({ current, className }: { current?: string; className?: string }) {
  return (
    <NavigationMenu aria-label="Sections" className={className}>
      <NavigationMenuList className="h-full items-stretch gap-1">
        {SECTIONS.map((s) => (
          <NavigationMenuItem key={s.id}>
            <NavigationMenuLink variant="tab" href="#" active={s.id === current} aria-current={s.id === current ? "page" : undefined}>
              {s.title}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

/**
 * The top bar. `menu` adds the button that opens the navigation drawer (`lg:hidden` by default,
 * `always` on layouts without a sidebar); `children` sit between the brand and the actions.
 */
export function DocsHeader({
  menu = "narrow",
  version = true,
  compactSearch,
  children,
  below,
}: {
  menu?: "narrow" | "always" | "none"
  version?: boolean
  compactSearch?: boolean
  children?: React.ReactNode
  /** A second row under the bar (section tabs). */
  below?: React.ReactNode
}) {
  const { openNav } = useDocsChrome()
  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-background">
      {/* 16px from the edge at every width: the content's phone inset. Ghost icon buttons at either end pull out by their 6px inset so their glyphs sit on that edge too. */}
      <div className="flex h-14 items-center gap-3 px-4">
        {menu !== "none" && (
          <Button variant="ghost" size="icon-sm" className={cn("-ms-1.5", menu === "narrow" && "lg:hidden")} aria-label="Open navigation" onClick={openNav}>
            <MenuIcon />
          </Button>
        )}
        <Brand />
        {version && (
          <Badge size="sm" variant="outline" className="max-sm:hidden">
            v2.4
          </Badge>
        )}
        {children}
        <HeaderActions compactSearch={compactSearch} />
      </div>
      {below}
    </header>
  )
}
