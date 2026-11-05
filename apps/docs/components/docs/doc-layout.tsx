import { LocalizedDate, LocalizedText } from "./localized"
import type { Localized } from "@/lib/site-locale"

import type * as React from "react"
import Link from "next/link"

import { ArrowLeftIcon, ArrowRightIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import type { DocsPageRef } from "@/lib/docs"
import { Card } from "@paneui/ui/components/card"
import { Outline, OutlinePopover } from "@paneui/ui/components/outline"
import { PageHeader, PageHeaderActions, PageHeaderContent, PageHeaderDescription, PageHeaderTitle } from "@paneui/ui/components/page-header"
import { Separator } from "@paneui/ui/components/separator"

import { toOutline, type TocEntry } from "./doc-toc"
import { PageActions } from "./page-actions"

/** The page's Markdown twin, written by scripts/gen-docs-md.mjs: `/docs` → `/docs/index.md`, `/docs/button` → `/docs/button.md`. */
export function markdownPath(href: string) {
  return href === "/docs" ? "/docs/index.md" : `${href}.md`
}

/**
 * Page header: the title with the page actions at the far end of its row, the lede on its own
 * row under them, then anything page-specific (badges, buttons), closed by a hairline. The actions
 * wrap under the title on phones. `eyebrow` is kept for callers but not shown.
 */
export function DocHeader({
  href,
  eyebrow,
  eyebrowHref,
  title,
  lede,
  children,
}: {
  href: string
  eyebrow: string
  eyebrowHref: string
  title: string
  lede?: React.ReactNode | Localized
  children?: React.ReactNode
}) {
  void eyebrow
  void eyebrowHref
  return (
    <div data-slot="doc-header" className="flex flex-col gap-5 border-b border-border pb-8">
      <PageHeader size="lg">
        <PageHeaderContent>
          <PageHeaderTitle className="sm:group-data-[size=lg]/page-header:text-4xl"><LocalizedText text={title} /></PageHeaderTitle>
        </PageHeaderContent>
        <PageHeaderActions>
          <PageActions markdownPath={markdownPath(href)} pagePath={href === "/docs" ? "/docs/" : `${href}/`} title={title} />
        </PageHeaderActions>
        {lede && (
          <PageHeaderDescription>
            {/* The row is full width; the sentence keeps a reading measure. */}
            <span className="block max-w-xl">{typeof lede === "object" && "en" in lede ? <LocalizedText text={lede} /> : typeof lede === "string" ? <LocalizedText text={lede} /> : lede}</span>
          </PageHeaderDescription>
        )}
      </PageHeader>
      {children && <div className="flex flex-col gap-3">{children}</div>}
    </div>
  )
}

function PageCard({ page, dir }: { page: DocsPageRef; dir: "prev" | "next" }) {
  const Arrow = dir === "prev" ? ArrowLeftIcon : ArrowRightIcon
  return (
    <Card
      interactive
      size="sm"
      render={<Link href={page.href} rel={dir} />}
      className={cn("min-w-0 flex-1 gap-1 px-4", dir === "next" && "items-end text-end")}
    >
      <span className="flex items-center gap-1 text-ui-sm text-muted-foreground">
        {dir === "prev" && <Arrow className="size-3.5" />}
        <LocalizedText text={dir === "prev" ? "Previous" : "Next"} />
        {dir === "next" && <Arrow className="size-3.5" />}
      </span>
      <span className="w-full truncate text-ui-lg font-medium text-foreground"><LocalizedText text={page.title} /></span>
      <span className="w-full truncate text-ui-sm text-muted-foreground"><LocalizedText text={page.section} /></span>
    </Card>
  )
}

/** Previous and next page in sidebar order, then when the page's sources last changed. */
/** `updated` is an ISO date string (props cross the island boundary as JSON). */
export function DocFooter({ prev, next, updated }: { prev?: DocsPageRef; next?: DocsPageRef; updated?: string }) {
  return (
    <footer data-md-skip className="flex flex-col gap-4">
      <Separator className="mb-2" />
      <nav aria-label="Pagination" className="flex flex-col gap-3 sm:flex-row">
        {prev ? <PageCard page={prev} dir="prev" /> : <span className="hidden flex-1 sm:block" />}
        {next ? <PageCard page={next} dir="next" /> : <span className="hidden flex-1 sm:block" />}
      </nav>
      {updated && (
        <p className="text-ui-sm text-muted-foreground">
          <LocalizedText text="Last updated" /> <LocalizedDate iso={updated} />
        </p>
      )}
    </footer>
  )
}

/** Caps paragraphs and lists that aren't part of a component (no `data-slot` on them or between them and the article). */
const PROSE_MEASURE = "[&_:is(p,ul,ol):not([data-slot],article_[data-slot]_*)]:max-w-xl"

/**
 * Article plus outline on the content frame. The article hangs from the frame's left edge (the
 * same line the gallery and the overview pages start on) at a reading width; regular pages keep
 * the outline in a sticky rail on the frame's right edge from `xl` and fold it into a popover
 * button above the content below that. `wide` pages give the rail's width to the content and
 * always use the popover.
 */
export function DocLayout({ toc, wide, children }: { toc?: TocEntry[]; wide?: boolean; children: React.ReactNode }) {
  const hasToc = !!toc && toc.length > 0
  const rail = hasToc && !wide
  return (
    <div className={cn("grid grid-cols-1 gap-12", rail && "xl:grid-cols-[minmax(0,1fr)_12rem]")}>
      {/*
        The column is 768px so previews, tables and code get the room; running prose (paragraphs and
        lists outside any component) stops at a reading measure of about 70 characters.
      */}
      <article className={cn("flex w-full min-w-0 flex-col gap-12", wide ? "max-w-6xl" : "max-w-3xl", PROSE_MEASURE)}>
        {hasToc && (
          // Sticky under the header. The band bleeds into the page gutters (px-5/8/10 in site-shell) so
          // nothing scrolls past at its sides; on wide pages the button keeps a reading width.
          <div data-md-skip className={cn("sticky top-12 z-30 -mx-5 -my-6 bg-background px-5 py-2 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10", !wide && "xl:hidden")}>
            <OutlinePopover items={toOutline(toc)} className={cn(wide && "max-w-sm")} />
          </div>
        )}
        {children}
      </article>
      {rail && (
        <aside className="hidden xl:block">
          <div className="sticky top-20">
            <Outline items={toOutline(toc)} />
          </div>
        </aside>
      )}
    </div>
  )
}
