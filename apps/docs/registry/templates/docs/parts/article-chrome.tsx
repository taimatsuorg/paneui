"use client"

import * as React from "react"

import { ArrowLeftIcon, ArrowRightIcon, EditIcon, ThumbsDownIcon, ThumbsUpIcon } from "@paneui/ui/icons"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@paneui/ui/components/breadcrumb"
import { Button } from "@paneui/ui/components/button"
import { Card } from "@paneui/ui/components/card"
import { PageHeader, PageHeaderContent, PageHeaderDescription, PageHeaderEyebrow, PageHeaderTitle } from "@paneui/ui/components/page-header"
import { Separator } from "@paneui/ui/components/separator"
import { cn } from "@paneui/ui/lib/utils"

import { CURRENT_PAGE, PAGER } from "./site"

/** Breadcrumb, title, lede and the page's meta line. */
export function ArticleHeader() {
  return (
    <PageHeader size="lg">
      <PageHeaderEyebrow>
        <Breadcrumb className="-ms-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Guides</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Safety</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{CURRENT_PAGE}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeaderEyebrow>
      <PageHeaderContent>
        <PageHeaderTitle>{CURRENT_PAGE}</PageHeaderTitle>
      </PageHeaderContent>
      <PageHeaderDescription>Decide which actions Tessel takes on its own, which wait for a person, and which it never takes.</PageHeaderDescription>
      <div className="flex basis-full flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>Updated Oct 9, 2026</span>
        <span>6 min read</span>
        <a
          href="#"
          className="inline-flex items-center gap-1.5 rounded-sm transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <EditIcon size={14} />
          Edit on GitHub
        </a>
      </div>
    </PageHeader>
  )
}

function PagerCard({ dir }: { dir: "prev" | "next" }) {
  const next = dir === "next"
  const page = PAGER[dir]
  const Arrow = next ? ArrowRightIcon : ArrowLeftIcon
  return (
    <Card
      interactive
      size="sm"
      render={<a href="#" rel={dir} />}
      className={cn("gap-1 px-4", next ? "items-end text-end sm:col-start-2" : "items-start")}
    >
      <span className="flex items-center gap-1.5 text-ui-sm text-muted-foreground">
        {!next && <Arrow className="size-3.5 rtl:-scale-x-100" />}
        {next ? "Next" : "Previous"} · {page.section}
        {next && <Arrow className="size-3.5 rtl:-scale-x-100" />}
      </span>
      <span className="text-ui-lg font-medium">{page.title}</span>
    </Card>
  )
}

/** "Was this helpful?" and previous / next. */
export function ArticleFooter() {
  const [helpful, setHelpful] = React.useState<boolean | null>(null)
  return (
    <footer className="flex flex-col gap-8">
      <Separator />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {helpful === null ? "Was this page helpful?" : "Thanks for the feedback."}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" aria-pressed={helpful === true} onClick={() => setHelpful(true)}>
            <ThumbsUpIcon data-icon="inline-start" />
            Yes
          </Button>
          <Button variant="secondary" size="sm" aria-pressed={helpful === false} onClick={() => setHelpful(false)}>
            <ThumbsDownIcon data-icon="inline-start" />
            No
          </Button>
        </div>
      </div>
      <nav aria-label="Pagination" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PagerCard dir="prev" />
        <PagerCard dir="next" />
      </nav>
    </footer>
  )
}
