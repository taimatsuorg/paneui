"use client"

import { useT, useSiteLocale } from "@/lib/site-locale"
import { siteCopy } from "@/lib/site-copy"
import { LocaleProvider } from "@paneui/ui/components/locale-provider"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { GithubIcon, MenuIcon, PaneuiLogoIcon, SearchIcon } from "@paneui/ui/icons"
import { CommandPalette, type CommandPaletteItem } from "@paneui/ui/blocks/command-palette/command-palette"
import { Button } from "@paneui/ui/components/button"
import { Drawer, DrawerContent, DrawerTitle } from "@paneui/ui/components/drawer"
import { Kbd } from "@paneui/ui/components/kbd"
import { ThemeSwitch } from "@paneui/ui/components/theme-toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@paneui/ui/components/tooltip"


import { categoryIcons, ComponentsIcon, guideIcons } from "./category-icons"
import { DocsNav, normalizePath, sectionOf, type DocsSection, type NavGroup } from "./docs-nav"
import { COMPONENTS_HREF, TEMPLATES_HREF, THEMES_HREF, GUIDE_PAGES } from "./docs-pages"
import { LanguageToggle } from "./language-toggle"
import { THEME_KEY } from "./theme-script"
import { ThemeSync } from "./theme-sync"

const GITHUB_URL = "https://github.com/taimatsuorg/paneui"

const headerLink =
  "rounded-md px-2 py-1 text-ui text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:text-foreground"

function useIsMac() {
  const [mac, setMac] = React.useState(true)
  React.useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)), [])
  return mac
}

/** Mark plus wordmark; the mark is the favicon and the registry logo. */
function Brand() {
  return (
    <Link
      href="/"
      className="-ms-1 flex h-8 items-center gap-2 rounded-lg ps-1 pe-2 text-ui-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <PaneuiLogoIcon size={20} className="text-foreground" />
      PaneUI
    </Link>
  )
}

/*
 * Docs chrome: one white surface split by hairlines. The header's brand column is exactly the
 * sidebar's width and starts on the sidebar's content edge; the header tabs share the sidebar's
 * active treatment (a 2px indicator line, on the bottom edge here and the guide line there).
 * Notes: notes/docs-shell.md.
 */
export function SiteShell({ groups, children }: { groups: NavGroup[]; children: React.ReactNode }) {
  const t = useT()
  const locale = useSiteLocale()
  React.useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en"
  }, [locale])
  const label = React.useCallback((text: string) => t(siteCopy(text)), [t])
  const pathname = normalizePath(usePathname())
  const router = useRouter()
  const mac = useIsMac()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const items = React.useMemo<CommandPaletteItem[]>(() => {
    const go = (href: string) => () => router.push(href)
    return [
      ...GUIDE_PAGES.map((p) => ({
        id: p.href,
        label: label(p.title),
        group: label("Getting started"),
        icon: guideIcons[p.href],
        keywords: [...p.keywords, t(p.description)],
        onSelect: go(p.href),
      })),
      {
        id: COMPONENTS_HREF,
        label: label("Components overview"),
        group: label("Getting started"),
        icon: ComponentsIcon,
        keywords: ["components", "all", "gallery", "previews", "home"],
        onSelect: go(COMPONENTS_HREF),
      },
      {
        id: THEMES_HREF,
        label: label("Customize"),
        group: label("Getting started"),
        icon: guideIcons[THEMES_HREF],
        keywords: ["customize", "theme", "builder", "radius", "accent", "color", "colour", "oklch", "hue", "chroma", "css variables"],
        onSelect: go(THEMES_HREF),
      },
      ...groups.flatMap((g) =>
        g.items.map((i) => ({
          id: i.name,
          label: i.title,
          group: label(g.category),
          icon: categoryIcons[g.category],
          keywords: [i.name, t(i.description)],
          onSelect: go(`/docs/${i.name}`),
        }))
      ),
    ]
  }, [groups, router, t, label])

  const shortcut = mac ? "⌘K" : "Ctrl K"
  const section = sectionOf(pathname, groups)
  const headerLinks: { id: DocsSection; label: string; href: string }[] = [
    { id: "docs", label: "Docs", href: "/docs" },
    { id: "components", label: "Components", href: COMPONENTS_HREF },
    { id: "templates", label: "Templates", href: TEMPLATES_HREF },
    { id: "themes", label: "Customize", href: THEMES_HREF },
  ]
  // The theme builder brings its own control column, so it gets the header without the sidebar.
  const bare = section === "themes"
  // The gallery is a full-width grid with its own category row, so it drops the sidebar too.
  const gallery = pathname === COMPONENTS_HREF
  const openSearch = React.useCallback(() => {
    setDrawerOpen(false)
    setSearchOpen(true)
  }, [])

  return (
    <LocaleProvider locale={locale}>
      <div data-slot="docs-shell" className="min-h-svh bg-background text-foreground">
        {/* A theme, accent or radius picked in another tab applies here too (the header only follows theme and accent). */}
        <ThemeSync />
        <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b border-border bg-background px-3 lg:px-4">
          <Button variant="ghost" size="icon-sm" aria-label={label("Open navigation")} onClick={() => setDrawerOpen(true)} className="lg:hidden">
            <MenuIcon />
          </Button>
          <Brand />
          <nav aria-label={label("Main")} className="ms-4 flex items-center gap-0.5 max-md:hidden">
            {headerLinks.map((l) => (
              <Link key={l.id} href={l.href} aria-current={section === l.id ? "page" : undefined} className={headerLink}>
                {label(l.label)}
              </Link>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={openSearch}
              aria-label={label("Search docs")}
              aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}
              // eslint-disable-next-line shadcn/no-restyle -- header search morphs from an icon button (below lg) to a field (lg+)
              className="me-1 w-7 justify-center px-0 text-muted-foreground lg:w-56 lg:justify-start lg:ps-2 lg:pe-1"
            >
              <SearchIcon />
              <span className="hidden lg:inline">{label("Search docs…")}</span>
              <Kbd size="sm" className="ms-auto hidden lg:inline-flex">
                {shortcut}
              </Kbd>
            </Button>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<a href={GITHUB_URL} target="_blank" rel="noreferrer" />}
                    aria-label={label("GitHub repository")}
                  />
                }
              >
                <GithubIcon className="size-4.5" />
              </TooltipTrigger>
              <TooltipContent side="bottom">GitHub</TooltipContent>
            </Tooltip>
            <LanguageToggle />
            <ThemeSwitch storageKey={THEME_KEY} className="ms-1" />
          </div>
        </header>

        <div className="flex">
          {!bare && !gallery && (
          <aside
            // Fills the viewport under the header and sticks while the page scrolls.
            style={{ "--docs-aside-h": "calc(100svh - 3rem)" } as React.CSSProperties}
            className="sticky top-12 hidden h-(--docs-aside-h) w-64 shrink-0 flex-col bg-shell lg:flex"
          >
            <DocsNav groups={groups} pathname={pathname} section={section} onSearch={openSearch} searchShortcut={shortcut} />
          </aside>
          )}

          <main className="min-w-0 flex-1">
            {bare ? (
              children
            ) : (
              <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
                <div className={gallery ? "mx-auto w-full max-w-(--breakpoint-2xl)" : "mx-auto w-full max-w-6xl"}>{children}</div>
              </div>
            )}
          </main>
        </div>

        <Drawer side="left" open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent
            className="w-80"
            // a link inside the drawer navigates, so the drawer has done its job
            onClickCapture={(e) => {
              if ((e.target as HTMLElement).closest("a[href]")) setDrawerOpen(false)
            }}
          >
            <div className="flex h-14 shrink-0 items-center px-4">
              <DrawerTitle className="flex items-center gap-2 text-ui-lg font-semibold">
                <PaneuiLogoIcon size={20} />
                PaneUI
              </DrawerTitle>
            </div>
            <nav aria-label={label("Main")} className="flex gap-1 px-3 pb-1">
              {headerLinks.map((l) => (
                <Link key={l.id} href={l.href} aria-current={section === l.id ? "page" : undefined} className={headerLink}>
                  {label(l.label)}
                </Link>
              ))}
            </nav>
            <DocsNav groups={groups} pathname={pathname} section={section} onSearch={openSearch} searchShortcut={shortcut} showSearch />
          </DrawerContent>
        </Drawer>

        <CommandPalette items={items} open={searchOpen} onOpenChange={setSearchOpen} placeholder={label("Search docs and components…")} />
      </div>
    </LocaleProvider>
  )
}
