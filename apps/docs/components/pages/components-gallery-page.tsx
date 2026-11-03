"use client"

import { T, useT } from "@/lib/site-locale"
import { siteCopy } from "@/lib/site-copy"

import * as React from "react"
import Link from "next/link"

import { ArrowUpRightIcon } from "@paneui/ui/icons"
import { categorySlug } from "@/components/docs/category-icons"
import { LazyDemo } from "@/components/docs/lazy-demo"
import { SiteRoot, type SiteProps } from "@/components/site/site-root"
import { Button } from "@paneui/ui/components/button"

const wide = new Set(["file-diff", "heat-calendar", "saas", "vscode", "team-chat", "agent-workspace", "docs", "blog", "chat", "prompt-bar", "recommendation-card", "task-row", "chat-app", "table", "table-editable", "table-async", "animated-sidebar", "candlestick-chart"])

const CATEGORY_ZH: Record<string, string> = {
  Foundations: "基础",
  Forms: "表单",
  Overlays: "浮层",
  Display: "展示",
  Navigation: "导航",
  Text: "文本",
  Motion: "动效",
  Data: "数据",
  Agents: "助手",
  Charts: "图表",
  Blocks: "组合组件",
  Templates: "模板",
}

/** One gallery card: the demo's name and its live preview. */
export type GalleryItem = { name: string; title: string }
/** One gallery section: the category and its cards, in registry order. */
export type GalleryGroup = { category: string; items: GalleryItem[] }

/** Everything the gallery needs, computed at build time in src/pages/docs/components.astro. */
export type ComponentsGalleryData = {
  groups: GalleryGroup[]
  /** Number of registry items (the gallery hides a few, the count does not). */
  total: number
}

/** The category whose section sits under the sticky row, for the chip that marks it. */
function useActiveCategory(slugs: string[]) {
  const [active, setActive] = React.useState(slugs[0] ?? "")
  React.useEffect(() => {
    const onScroll = () => {
      // The section whose heading has passed the header and the chip row (about 7rem).
      let current = slugs[0] ?? ""
      for (const slug of slugs) {
        const el = document.getElementById(slug)
        if (el && el.getBoundingClientRect().top <= 140) current = slug
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [slugs])
  return active
}

export default function ComponentsGalleryPage({ site, data }: { site: SiteProps; data: ComponentsGalleryData }) {
  // Templates have their own section in the header and sidebar.
  const groups = data.groups.filter((g) => g.category !== "Templates")
  const total = data.total - (data.groups.find((g) => g.category === "Templates")?.items.length ?? 0)
  const slugs = React.useMemo(() => groups.map((g) => categorySlug(g.category)), [groups])
  const active = useActiveCategory(slugs)
  const t = useT()
  return (
    <SiteRoot {...site}>
    {/* One column so the chip row can stick for the whole page (a sticky element only sticks inside its parent). */}
    <div className="flex flex-col">
        <h1 className="font-heading flex items-baseline gap-3 pb-3 text-3xl font-semibold tracking-tight">
          <T en="Components" zh="组件" />
          <span className="text-lg font-normal tabular-nums text-muted-foreground">{total}</span>
        </h1>
        {/* Category chips stand in for the sidebar: sticky under the header, bleeding into the shell's gutters. */}
        <nav
          aria-label={t(siteCopy("Categories"))}
          className="sticky top-12 z-30 -mx-5 bg-background px-5 py-2.5 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10"
        >
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 scrollbar-none">
            {groups.map((g) => {
              const slug = categorySlug(g.category)
              const on = slug === active
              return (
                <Button
                  key={g.category}
                  size="sm"
                  shape="pill"
                  variant={on ? "secondary" : "ghost"}
                  className={on ? undefined : "text-muted-foreground"}
                  aria-current={on ? "location" : undefined}
                  nativeButton={false}
                  render={<a href={`#${slug}`} />}
                >
                  <T en={g.category} zh={CATEGORY_ZH[g.category] ?? g.category} />
                  <span className="tabular-nums text-muted-foreground">{g.items.length}</span>
                </Button>
              )
            })}
          </div>
        </nav>
      <div className="flex flex-col gap-10 pt-6">
      {groups.map((g, gi) => {
        return (
          <section key={g.category} id={categorySlug(g.category)} aria-labelledby={`${categorySlug(g.category)}-title`} className="flex scroll-mt-28 flex-col gap-4">
            <h2 id={`${categorySlug(g.category)}-title`} className="font-heading text-lg font-semibold tracking-tight text-balance">
              <T en={g.category} zh={CATEGORY_ZH[g.category] ?? g.category} />
            </h2>
            {/*
              A dense grid of equal cards (copy-density rule 1: name and preview only). Each card is a grey
              tile framing the live preview, scaled to fit, over a footer with the name and an open button.
              Wide demos take two columns; dense flow fills the bays they leave.
            */}
            <div className="grid grid-flow-row-dense grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {g.items.map((item, index) => {
                const span = wide.has(item.name)
                return (
                  <article key={item.name} className={`tile frame-p-1.5 group/gallery flex min-w-0 flex-col ${span ? "sm:col-span-2" : ""}`}>
                    {/* Demos mount near the viewport and unmount when far away; see LazyDemo. */}
                    <LazyDemo name={item.name} fit={span ? 880 : 440} eager={gi === 0 && index < 10} className="h-60 rounded-inner bg-background" />
                    <Link
                      href={`/docs/${item.name}`}
                      className="flex min-w-0 items-center gap-2 rounded-b-inner py-1.5 ps-2.5 pe-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="min-w-0 flex-1 truncate text-ui-sm font-medium text-muted-foreground transition-colors duration-150 group-hover/gallery:text-foreground">{item.title}</span>
                      <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-control bg-background text-muted-foreground shadow-raised transition-colors duration-150 group-hover/gallery:text-foreground">
                        <ArrowUpRightIcon size={14} className="rtl:-scale-x-100" />
                      </span>
                    </Link>
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}
      </div>
    </div>
    </SiteRoot>
  )
}
