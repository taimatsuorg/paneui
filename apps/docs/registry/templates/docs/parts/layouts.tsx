"use client"

import * as React from "react"

import { ArrowRightIcon, ChevronRightIcon, MenuIcon } from "@paneui/ui/icons"
import { Badge } from "@paneui/ui/components/badge"
import { Button } from "@paneui/ui/components/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@paneui/ui/components/card"
import { CodeBlock } from "@paneui/ui/components/code-block"
import { IconChip } from "@paneui/ui/components/icon-chip"
import { Outline, OutlinePopover } from "@paneui/ui/components/outline"
import { Popover, PopoverContent, PopoverTrigger } from "@paneui/ui/components/popover"
import { Separator } from "@paneui/ui/components/separator"
import { ThemeToggle } from "@paneui/ui/components/theme-toggle"
import { cn } from "@paneui/ui/lib/utils"

import { Article, toc } from "./article"
import { ArticleFooter, ArticleHeader } from "./article-chrome"
import { Brand, DocsHeader, SearchButton, SectionTabs } from "./chrome"
import { installPnpm } from "./code"
import { DocsNav } from "./docs-nav"
import { CURRENT_PAGE, CURRENT_SECTION, SECTIONS } from "./site"

/*
 * The five page layouts. They share the header parts, the page tree, the article and its header
 * and footer; each one only decides where navigation and the outline go.
 */

/**
 * Header, article and footer in one column at the reading measure, so every layout keeps one left
 * and one right edge from the breadcrumb to the pager. `outline` adds the sticky "On this page"
 * button above the article.
 */
function ArticleColumn({
  outline,
  outlineTop = "top-14",
  className,
}: {
  outline?: "popover" | "popover-narrow"
  /** Where the sticky outline button stops: under the header (`top-14`) or under header and tabs (`top-26`). */
  outlineTop?: "top-14" | "top-26"
  className?: string
}) {
  return (
    // `text-sm` sets the column's `ch` to the prose's 14px, so the measure is the prose's own.
    <article className={cn("flex w-full max-w-reading min-w-0 flex-col gap-10 text-sm", className)}>
      <ArticleHeader />
      {outline && (
        <div className={cn("sticky z-30 -my-4 bg-background py-2", outlineTop, outline === "popover-narrow" && "xl:hidden")}>
          <OutlinePopover items={toc} activeLine={136} className="max-w-sm" />
        </div>
      )}
      <Article />
      <ArticleFooter />
    </article>
  )
}

/** The page tree in a sticky column under a header of `top` height. */
function SidebarColumn({ section, top }: { section?: string; top: "h-14" | "h-26" }) {
  return (
    <aside
      // Fills the viewport under the sticky header.
      style={{ "--aside-h": top === "h-14" ? "calc(100svh - 3.5rem)" : "calc(100svh - 6.5rem)" } as React.CSSProperties}
      className={cn("sticky h-(--aside-h) w-64 shrink-0 self-start border-e border-border max-lg:hidden", top === "h-14" ? "top-14" : "top-26")}
    >
      <DocsNav section={section} className="h-full" />
    </aside>
  )
}

/** (a) Classic: sidebar, article and an outline rail. */
export function ClassicLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DocsHeader />
      <div className="flex min-w-0 flex-1">
        <SidebarColumn top="h-14" />
        <div className="flex min-w-0 flex-1 justify-center gap-12 px-4 py-10 sm:px-8 lg:px-12">
          <ArticleColumn outline="popover-narrow" />
          <aside className="sticky top-24 w-56 shrink-0 self-start max-xl:hidden">
            <Outline items={toc} activeLine={136} maxHeight="calc(100svh - 8rem)" />
          </aside>
        </div>
      </div>
    </div>
  )
}

/** (b) Notebook: full-width header with section tabs; the sidebar shows the current section only. */
export function NotebookLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DocsHeader
        below={
          <div className="scrollbar-none h-12 overflow-x-auto border-t border-border px-1.5 sm:px-1.5">
            <SectionTabs current={CURRENT_SECTION} className="h-full" />
          </div>
        }
      />
      <div className="flex min-w-0 flex-1">
        <SidebarColumn section={CURRENT_SECTION} top="h-26" />
        <div className="flex min-w-0 flex-1 justify-center gap-12 px-4 py-10 sm:px-8 lg:px-12">
          <ArticleColumn outline="popover-narrow" outlineTop="top-26" />
          <aside className="sticky top-36 w-56 shrink-0 self-start max-xl:hidden">
            <Outline items={toc} activeLine={176} maxHeight="calc(100svh - 10.5rem)" />
          </aside>
        </div>
      </div>
    </div>
  )
}

/** (c) Flux: content in the middle, navigation in a floating bar at the bottom. */
export function FluxLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex min-w-0 flex-1 justify-center px-4 pt-10 pb-32 sm:px-8">
        <ArticleColumn />
      </div>
      {/* The bar is a plain surface at the article's measure: an opaque popover with the floating shadow, its controls inset 6px. */}
      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-3">
        <div className="frame-2xl frame-p-1.5 flex w-full max-w-reading items-center gap-1.5 bg-popover text-sm shadow-surface">
          <Popover>
            <PopoverTrigger render={<Button variant="ghost" size="sm" aria-label="Pages" />}>
              <MenuIcon />
              <span className="max-sm:hidden">Pages</span>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" sideOffset={10} className="w-72 p-0">
              <div style={{ "--nav-h": "min(28rem, 70svh)" } as React.CSSProperties} className="flex h-(--nav-h) flex-col">
                <DocsNav />
              </div>
            </PopoverContent>
          </Popover>
          <Separator orientation="vertical" className="my-1.5" />
          <span className="min-w-0 truncate px-1.5 text-ui font-medium max-sm:hidden">{CURRENT_PAGE}</span>
          <OutlinePopover items={toc} title="On this page" className="ms-auto min-w-0 flex-1 sm:max-w-64" />
          <SearchButton compact />
          <ThemeToggle variant="ghost" modes="tri" />
        </div>
      </div>
    </div>
  )
}

/** (d) Spacious: no sidebar, one centred reading column, the outline in a popover. */
export function SpaciousLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DocsHeader menu="always" />
      <div className="flex min-w-0 flex-1 justify-center px-4 py-12 sm:px-8 lg:py-16">
        <ArticleColumn outline="popover" />
      </div>
    </div>
  )
}

/**
 * (e) Home: the docs landing page. The hero pairs the pitch and the install line with the guides
 * people open most, so the commonest next step is on the first screen; the sections follow as one
 * row. Hero, sections and footer share the page's 5xl column and its edges.
 */
export function HomeLayout() {
  const popular = SECTIONS.flatMap((s) => s.groups.flatMap((g) => g.pages.map((p) => ({ ...p, section: s.title })))).slice(0, 6)
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DocsHeader menu="none">
        <SectionTabs className="h-14 max-lg:hidden" />
      </DocsHeader>
      <main className="flex w-full flex-1 flex-col items-center px-4 sm:px-8">
        <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-10 py-12 sm:py-20 lg:grid-cols-12 lg:gap-12">
          <div className="flex min-w-0 flex-col items-start gap-6 lg:col-span-7">
            <Badge variant="primary">Tessel 2.4 · Approval policies</Badge>
            <h1 className="max-w-2xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">Ship with an agent you can trust</h1>
            <p className="max-w-xl text-lg text-pretty text-muted-foreground">Guides, references and API docs for running Tessel on your repositories.</p>
            <div className="flex flex-wrap gap-2">
              <Button size="lg" nativeButton={false} render={<a href="#" />}>
                Quickstart
                <ArrowRightIcon data-icon="inline-end" className="rtl:-scale-x-100" />
              </Button>
              <SearchButton />
            </div>
            <div className="w-full max-w-xl">
              <CodeBlock title="pnpm" language="bash" html={installPnpm} />
            </div>
          </div>

          <section aria-labelledby="popular" className="flex min-w-0 flex-col gap-3 lg:col-span-5">
            <h2 id="popular" className="text-ui-lg font-semibold text-balance">
              Popular guides
            </h2>
            <Card className="gap-0 py-1">
              {popular.map((p, i) => (
                <React.Fragment key={p.title}>
                  {i > 0 && <Separator />}
                  <a
                    href={p.href}
                    className="flex h-12 items-center gap-3 px-4 text-ui outline-none transition-colors duration-150 hover:bg-secondary focus-visible:bg-secondary active:bg-secondary"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium">{p.title}</span>
                    <span className="text-ui-sm text-muted-foreground">{p.section}</span>
                    <ChevronRightIcon className="size-3.5 text-muted-foreground rtl:-scale-x-100" />
                  </a>
                </React.Fragment>
              ))}
            </Card>
          </section>
        </div>

        <section aria-labelledby="sections" className="flex w-full max-w-5xl flex-col gap-4 border-t border-border pt-10 pb-16 sm:pt-12 sm:pb-20">
          <h2 id="sections" className="text-balance text-xl font-semibold tracking-tight">
            Browse the docs
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SECTIONS.map((s) => (
              <Card key={s.id} interactive render={<a href="#" />}>
                <CardHeader>
                  <IconChip>
                    <s.icon />
                  </IconChip>
                  <CardTitle className="mt-2">{s.title}</CardTitle>
                  <CardDescription>{s.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-border px-4 sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 py-6 text-sm text-muted-foreground">
          <Brand />
          <span>© 2026 Tessel Labs</span>
        </div>
      </footer>
    </div>
  )
}
