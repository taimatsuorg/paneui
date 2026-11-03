"use client"

import { T } from "@/lib/site-locale"

import Link from "next/link"

import { ArrowRightIcon } from "@paneui/ui/icons"
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

/** Wide items take the whole row; a lone half-width item at the end does too, so no empty bay shows the hairline colour. */
function spans<I extends { name: string }>(items: I[]) {
  const out = items.map((item) => ({ item, span: wide.has(item.name) }))
  let open: { item: I; span: boolean } | null = null
  for (const cell of out) {
    if (cell.span) {
      if (open) open.span = true
      open = null
    } else if (open) open = null
    else open = cell
  }
  if (open) open.span = true
  return out
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
            {/* One grey tile per item: its name over the live preview (copy-density rule 1), the name its one link. */}
            <div>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {spans(g.items).map(({ item, span }, index) => (
                  <article key={item.name} className={`tile group/gallery flex min-w-0 flex-col overflow-hidden ${span ? "xl:col-span-2" : ""}`}>
                    <Link
                      href={`/docs/${item.name}`}
                      className="flex items-center gap-2 px-5 pt-4 outline-none focus-visible:underline"
                    >
                      <span className="tile-label transition-colors duration-150 group-hover/gallery:text-foreground">{item.title}</span>
                      <ArrowRightIcon
                        size={14}
                        className="ms-auto shrink-0 text-muted-foreground transition-transform duration-150 group-hover/gallery:translate-x-0.5 group-hover/gallery:text-foreground rtl:-scale-x-100 rtl:group-hover/gallery:-translate-x-0.5"
                      />
                    </Link>
                    {/* Demos mount near the viewport and unmount when far away; see LazyDemo. */}
                    <LazyDemo name={item.name} eager={gi === 0 && index < 4} className="flex-1 border-b-0 bg-transparent" />
                  </article>
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </div>
    </SiteRoot>
  )
}
