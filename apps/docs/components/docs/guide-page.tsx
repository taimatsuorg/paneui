import type { Localized } from "@/lib/site-locale"

import type * as React from "react"

import type { DocNav } from "@/lib/doc-types"
import { cn } from "@paneui/ui/lib/utils"

import { DocHeading } from "./doc-heading"
import { codeContent, INLINE_CODE_CLS } from "./doc-inline"
import { DocFooter, DocHeader, DocLayout } from "./doc-layout"
import type { TocEntry } from "./doc-toc"
import { GUIDE_PAGES } from "./docs-pages"
import { LocalizedText } from "./localized"
import { TextLink } from "./text-link"

export { TextLink }

/** Section heading with a copy-link anchor, matching the component pages. */
export function GuideH2({ id, children }: { id: string; children: React.ReactNode }) {
  return <DocHeading id={id}>{children}</DocHeading>
}

export function GuideH3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <DocHeading as="h3" id={id}>
      {children}
    </DocHeading>
  )
}

/**
 * Two-part row, the composition the introduction's principles use: a label column on the left
 * from `sm` (a date, a name, a heading) and the content beside it on the same top line. The content
 * column is the reading measure, so use it for prose and lists, not for wide code or previews.
 */
export function GuideRow({ label, children, className }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8", className)}>
      <div className="flex min-w-0 flex-col gap-1">{label}</div>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </div>
  )
}

/**
 * One numbered step (installation steps, upgrade steps, the skill's rules). From `sm` the number
 * hangs in a narrow gutter so titles, prose and code share one edge; on phones it sits before the title.
 */
export function GuideStep({
  n,
  id,
  title,
  as = "h3",
  children,
}: {
  n: number
  id: string
  title: React.ReactNode
  /** h2 when the steps are the page's sections (installation), h3 inside a section. */
  as?: "h2" | "h3"
  children?: React.ReactNode
}) {
  return (
    <section className="grid grid-cols-1 gap-x-4 sm:grid-cols-[1.5rem_minmax(0,1fr)]">
      <span data-md-skip aria-hidden className={cn("hidden font-heading leading-7 font-semibold text-muted-foreground tabular-nums sm:block", as === "h2" ? "text-xl" : "text-lg")}>
        {n}
      </span>
      <div className="flex min-w-0 flex-col gap-4">
        <DocHeading as={as} id={id} className="text-balance">
          <span data-md-skip className="me-2 text-muted-foreground tabular-nums sm:hidden">
            {n}
          </span>
          {typeof title === "string" ? <LocalizedText text={title} /> : title}
        </DocHeading>
        {children}
      </div>
    </section>
  )
}

/** Inline code in reading copy. */
export function Code({ children }: { children: React.ReactNode }) {
  return <code className={INLINE_CODE_CLS}>{codeContent(children)}</code>
}


/** The files a guide page is made from, for its "Last updated" date. */
/**
 * Layout for the "Getting started" pages: eyebrow, title, page actions and lede from
 * GUIDE_PAGES, the page body, previous / next in sidebar order with the last-updated date (`nav`,
 * computed at build time by guideNav() in lib/build.ts), and
 * the "On this page" outline.
 */
export function GuidePage({ href, nav, toc, lede, children }: { href: string; nav: DocNav; toc?: TocEntry[]; lede?: React.ReactNode | Localized; children: React.ReactNode }) {
  const page = GUIDE_PAGES.find((p) => p.href === href)!

  return (
    <DocLayout toc={toc}>
      <DocHeader href={href} eyebrow="Getting started" eyebrowHref="/docs" title={page.title} lede={lede ?? page.description} />
      {children}
      <DocFooter prev={nav.prev} next={nav.next} updated={nav.updated} />
    </DocLayout>
  )
}
