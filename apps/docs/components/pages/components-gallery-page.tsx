"use client"

import { T } from "@/lib/site-locale"

import Link from "next/link"

import { ArrowUpRightIcon } from "@paneui/ui/icons"
import { categorySlug } from "@/components/docs/category-icons"
import { LazyDemo } from "@/components/docs/lazy-demo"
import { SiteRoot, type SiteProps } from "@/components/site/site-root"
import { DocHeader } from "@/components/docs/doc-layout"

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

export default function ComponentsGalleryPage({ site, data }: { site: SiteProps; data: ComponentsGalleryData }) {
  // Templates have their own section in the header and sidebar.
  const groups = data.groups.filter((g) => g.category !== "Templates")
  const total = data.total - (data.groups.find((g) => g.category === "Templates")?.items.length ?? 0)
  return (
    <SiteRoot {...site}>
    <div className="flex flex-col gap-16">
      <DocHeader
        href="/docs/components"
        eyebrow="Docs"
        eyebrowHref="/docs"
        title="Components"
        lede={{ en: `${total} components and blocks, grouped by what they do.`, zh: `${total} 个组件和组合组件，按用途分组。` }}
      />
      {groups.map((g, gi) => {
        return (
          <section key={g.category} id={categorySlug(g.category)} aria-labelledby={`${categorySlug(g.category)}-title`} className="flex scroll-mt-20 flex-col gap-6">
            <h2 id={`${categorySlug(g.category)}-title`} className="font-heading flex items-baseline gap-3 text-2xl font-semibold tracking-tight text-balance">
              <T en={g.category} zh={CATEGORY_ZH[g.category] ?? g.category} />
              <span className="text-base font-normal tabular-nums text-muted-foreground">{g.items.length}</span>
            </h2>
            {/*
              A dense grid of equal cards (copy-density rule 1: name and preview only). Each card is a grey
              tile framing the live preview, scaled to fit, over a footer with the name and an open button.
              Wide demos take two columns; dense flow fills the bays they leave.
            */}
            <div className="grid grid-flow-row-dense grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {g.items.map((item, index) => {
                const span = wide.has(item.name)
                return (
                  <article key={item.name} className={`tile frame-p-1.5 group/gallery flex min-w-0 flex-col ${span ? "sm:col-span-2" : ""}`}>
                    {/* Demos mount near the viewport and unmount when far away; see LazyDemo. */}
                    <LazyDemo name={item.name} fit={span ? 880 : 440} eager={gi === 0 && index < 6} className="h-60 rounded-inner bg-background" />
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
    </SiteRoot>
  )
}
