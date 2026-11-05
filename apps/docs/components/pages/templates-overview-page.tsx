"use client"

import { T, useT, type Localized } from "@/lib/site-locale"

import Link from "next/link"

import { ArrowUpRightIcon } from "@paneui/ui/icons"
import { Button } from "@paneui/ui/components/button"
import { DocHeader } from "@/components/docs/doc-layout"
import { SiteRoot, type SiteProps } from "@/components/site/site-root"

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** One template card, computed at build time in src/pages/docs/templates.astro. */
export type TemplateCard = { name: string; title: string; description: Localized }

const DESCRIPTION_ZH: Record<string, string> = {
  saas: "产品官网和后台的一整套页面。",
  vscode: "在浏览器里编辑项目、运行命令。",
  "agent-workspace": "和编程智能体对话，审阅它们的改动。",
  docs: "带搜索、导航和页面大纲的文档站。",
  blog: "按年份归档文章的个人博客。",
  "team-chat": "带频道、私信和话题串的团队聊天。",
}

/*
 * Screenshots are made from the built site by `pnpm templates:shots` (light and dark, 1440×900)
 * into public/templates-shots; the card swaps them with the theme.
 */
function Shot({ name, title }: { name: string; title: string }) {
  return (
    <>
      <img src={`${BASE_PATH}/templates-shots/${name}-light.jpg`} alt={title} loading="lazy" width={1440} height={900} className="media-outline block w-full dark:hidden" />
      <img src={`${BASE_PATH}/templates-shots/${name}-dark.jpg`} alt={title} loading="lazy" width={1440} height={900} className="media-outline hidden w-full dark:block" />
    </>
  )
}

function Description({ name, text }: { name: string; text: Localized }) {
  const t = useT()
  const zh = DESCRIPTION_ZH[name]
  return <>{typeof text === "string" && zh ? t({ en: text, zh }) : t(text)}</>
}

/** The two ways in, always visible beside the caption: the live page in a new tab, and the docs page. */
function Actions({ name }: { name: string }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" nativeButton={false} render={<a href={`${BASE_PATH}/templates/${name}/`} target="_blank" rel="noreferrer" />}>
        <T en="Live preview" zh="在线预览" />
        <ArrowUpRightIcon data-icon="inline-end" className="rtl:-scale-x-100" />
      </Button>
      <Button size="sm" nativeButton={false} render={<Link href={`/docs/${name}`} />}>
        <T en="View details" zh="查看详情" />
      </Button>
    </div>
  )
}

/**
 * One template: its screenshot (a link to the docs page) and a caption with the name, one line and
 * the two actions. `lead` sets a template across both columns, its caption beside the picture;
 * `mirror` puts that caption on the left.
 */
function TemplateEntry({ tpl, lead, mirror }: { tpl: TemplateCard; lead?: boolean; mirror?: boolean }) {
  return (
    <article className={lead ? "grid grid-cols-1 gap-4 md:col-span-2 lg:grid-cols-12 lg:items-end lg:gap-10" : "flex flex-col gap-4"}>
      <Link
        href={`/docs/${tpl.name}`}
        aria-label={tpl.title}
        className={`block overflow-hidden frame-xl bg-shell shadow-raised outline-none focus-visible:ring-2 focus-visible:ring-ring ${lead ? "lg:col-span-8" : ""}`}
      >
        <Shot name={tpl.name} title={tpl.title} />
      </Link>
      <div className={lead ? `flex flex-col gap-4 lg:col-span-4 ${mirror ? "lg:order-first" : ""}` : "flex flex-col gap-3"}>
        <div className="flex min-w-0 flex-col gap-1 px-1">
          <h2 className={lead ? "font-heading text-2xl font-semibold tracking-tight text-balance" : "text-lg font-semibold text-balance"}>
            <Link href={`/docs/${tpl.name}`} className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
              {tpl.title}
            </Link>
          </h2>
          <p className={lead ? "text-base text-pretty text-muted-foreground" : "text-ui-lg text-pretty text-muted-foreground"}>
            <Description name={tpl.name} text={tpl.description} />
          </p>
        </div>
        <div className="px-1">
          <Actions name={tpl.name} />
        </div>
      </div>
    </article>
  )
}

export default function TemplatesOverviewPage({ site, templates }: { site: SiteProps; templates: TemplateCard[] }) {
  const [first, ...rest] = templates
  // The grid is two columns from md. With an odd number left after the lead, the last template
  // spans both columns too (caption on the other side), so the grid always ends on a full row.
  const closing = rest.length % 2 === 1 ? rest[rest.length - 1] : undefined
  const pairs = closing ? rest.slice(0, -1) : rest
  return (
    <SiteRoot {...site}>
      <div className="flex flex-col gap-12">
        <DocHeader
          href="/docs/templates"
          eyebrow="Docs"
          eyebrowHref="/docs"
          title="Templates"
          lede={{ en: "Whole apps built from the components. Install one and make it yours.", zh: "用组件搭好的完整应用。装上一个，改成你自己的。" }}
        />
        <div className="grid gap-x-6 gap-y-14 md:grid-cols-2">
          {first && <TemplateEntry tpl={first} lead />}
          {pairs.map((tpl) => (
            <TemplateEntry key={tpl.name} tpl={tpl} />
          ))}
          {closing && <TemplateEntry tpl={closing} lead mirror />}
        </div>
      </div>
    </SiteRoot>
  )
}
