"use client"

import * as React from "react"

import { MenuIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@paneui/ui/components/drawer"
import { ThemeToggle } from "@paneui/ui/components/theme-toggle"

import { useSession } from "../../lib/auth"
import { brand, footerColumns, marketingNav } from "../../lib/data"
import { AppLink, routes, useRoute } from "../../lib/routes"
import { BrandMark, SaasProviders } from "../providers"

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>
}

/** Public pages: sticky nav, page content, footer. */
export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <SaasProviders>
      <div className="flex min-h-svh flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </SaasProviders>
  )
}

function SiteHeader() {
  const [open, setOpen] = React.useState(false)
  const route = useRoute()
  const { signedIn } = useSession()

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background">
      <Container className="flex h-full items-center gap-6">
        <BrandMark />
        <nav aria-label="Main" className="flex items-center gap-0.5 max-md:hidden">
          {marketingNav.map((l) => {
            const active = l.href === route
            return (
              <Button
                key={l.href}
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<AppLink href={l.href} aria-current={active ? "page" : undefined} />}
                className={active ? "text-foreground" : "text-muted-foreground"}
              >
                {l.label}
              </Button>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {signedIn ? (
            <Button size="sm" nativeButton={false} render={<AppLink href={routes.dashboard} />}>
              Open dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" nativeButton={false} render={<AppLink href={routes.login} />} className="max-sm:hidden">
                Sign in
              </Button>
              <Button size="sm" nativeButton={false} render={<AppLink href={routes.signup} />}>
                Start free
              </Button>
            </>
          )}
          <ThemeToggle variant="ghost" modes="tri" />
          <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <MenuIcon />
          </Button>
        </div>
      </Container>

      <Drawer side="right" open={open} onOpenChange={setOpen}>
        <DrawerContent className="w-72">
          <DrawerHeader>
            <DrawerTitle>{brand.name}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="flex flex-col gap-1">
            {marketingNav.map((l) => (
              <Button
                key={l.href}
                variant="ghost"
                className="justify-start"
                nativeButton={false}
                render={<AppLink href={l.href} onClick={() => setOpen(false)} />}
              >
                {l.label}
              </Button>
            ))}
          </DrawerBody>
          <DrawerFooter className="flex flex-col gap-2">
            <Button variant="secondary" className="w-full" nativeButton={false} render={<AppLink href={routes.login} />}>
              Sign in
            </Button>
            <Button className="w-full" nativeButton={false} render={<AppLink href={routes.signup} />}>
              Start free
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-border py-14">
      <Container className="grid grid-cols-2 gap-10 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
          <BrandMark />
          <p className="max-w-xs text-sm text-pretty text-muted-foreground">{brand.tagline}</p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {brand.company}
          </p>
        </div>
        {footerColumns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
            <h3 className="text-xs font-medium text-muted-foreground">{col.title}</h3>
            <ul className="flex flex-col gap-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <AppLink href={l.href} className="text-sm text-foreground/80 transition-colors hover:text-foreground">
                    {l.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
    </footer>
  )
}

/** Title + lead, left-aligned, used by every marketing section. Pass `id` to label the section with it. */
export function SectionHeading({ id, title, body }: { id?: string; title: string; body?: string }) {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <h2 id={id} className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {body && <p className="text-lg leading-relaxed text-pretty text-muted-foreground">{body}</p>}
    </div>
  )
}
