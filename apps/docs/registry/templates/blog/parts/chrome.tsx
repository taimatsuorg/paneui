"use client"

import * as React from "react"
import Link from "next/link"

import { ChevronDownIcon, HomeIcon } from "@paneui/ui/icons"
import { Button } from "@paneui/ui/components/button"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@paneui/ui/components/menu"
import { ThemeToggle } from "@paneui/ui/components/theme-toggle"

import { site } from "./data"

/**
 * The single column the blog lives in: one measure, centred, with room above the title.
 * Keep nested surfaces out of it; this template is text only.
 */
export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-reading px-5 pt-12 pb-20">{children}</div>
}

export type Crumb = { label: string; href?: string }

const crumbLink =
  "shrink-0 rounded-xs transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"

/** Underlined inline link for the intro. Faint rule at rest, foreground on hover. */
export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  const className =
    "rounded-xs font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 outline-none hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring"
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={className} rel="noreferrer">
      {children}
    </a>
  )
}

/** Home, Projects, About and RSS. Home points at the blog index; the rest are placeholders. */
function SiteMenu({ homeHref }: { homeHref: string }) {
  const items = [
    { label: "Home", href: homeHref },
    { label: "Projects", href: "#" },
    { label: "About", href: "#" },
    { label: "RSS", href: "#" },
  ]
  return (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label="More pages" />}>
        <ChevronDownIcon />
      </MenuTrigger>
      <MenuContent>
        {items.map((item) => (
          <MenuItem key={item.label} render={<Link href={item.href} />}>
            {item.label}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  )
}

/**
 * The only chrome on the page: a quiet breadcrumb line with the site menu, and the theme
 * toggle at the far end. Inline `getThemeScript()` in your root `<head>` so the first paint
 * already has the stored theme.
 */
export function BlogTopBar({ homeHref, trail = [] }: { homeHref: string; trail?: Crumb[] }) {
  return (
    <header className="mb-10 flex min-h-7 items-center gap-2 text-sm text-muted-foreground">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2">
        <Link href={homeHref} className={`inline-flex items-center gap-1.5 ${crumbLink}`}>
          <HomeIcon size={14} />
          <span>{site.name}</span>
        </Link>
        <SiteMenu homeHref={homeHref} />
        {trail.map((crumb) => (
          <React.Fragment key={crumb.label}>
            <span aria-hidden className="shrink-0 text-muted-foreground/60">
              /
            </span>
            {crumb.href ? (
              <Link href={crumb.href} className={crumbLink}>
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="min-w-0 truncate">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
      <ThemeToggle variant="ghost" className="ms-auto" />
    </header>
  )
}
