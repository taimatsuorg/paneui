"use client"

import { T, type Localized } from "@/lib/site-locale"

import * as React from "react"
import Link from "next/link"

import { ArrowRightIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { categorySlug } from "@/components/docs/category-icons"
import { IconGrid } from "@/components/docs/icon-grid"
import { AgentSkill } from "@/components/docs/agent-skill"
import { Inline } from "@/components/docs/doc-inline"
import { DocHeading } from "@/components/docs/doc-heading"
import { DocFooter, DocHeader, DocLayout, markdownPath } from "@/components/docs/doc-layout"
import { ComponentStudio, type StudioCodeRow, type StudioGroup } from "@/components/docs/component-studio"
import type { TocEntry } from "@/components/docs/doc-toc"
import { addCommand, InstallCommand, PackageInstall, usePackageManager } from "@/components/docs/install-command"
import { PreviewTabs } from "@/components/docs/preview-tabs"
import { StaticCode } from "@/components/site/static-code"
import { SiteRoot, type SiteProps } from "@/components/site/site-root"
import { Button } from "@paneui/ui/components/button"
import { Card } from "@paneui/ui/components/card"
import {
  SimpleTable,
  SimpleTableBody,
  SimpleTableCell,
  SimpleTableHead,
  SimpleTableHeader,
  SimpleTableRow,
} from "@paneui/ui/components/simple-table"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@paneui/ui/components/tabs"
import { LocalizedText } from "@/components/docs/localized"
import { REGISTRY_NAME } from "@/lib/site-constants"
import { siteCopy } from "@/lib/site-copy"
import type { ComponentDoc, DocNav, PartDoc } from "@/lib/doc-types"

/** The subset of the registry item a page needs (the rest of DocItem is build-time detail). */
export type DocItemData = {
  name: string
  title: string
  summary: Localized
  category: string
  dependencies: string[]
  registryDependencies: string[]
}

/** One installable file: its path, the language it was highlighted as and the markup. */
export type DocFileData = { path: string; language: string; html: string }

/** One docs example: its id, its localised title and description, and the highlighted sample. */
export type DocExampleData = { id: string; title: Localized; description?: Localized; html: string }

/** A variant documented on this page (lib/doc-merges.ts): its own item, install files, usage, demo and examples. */
export type VariantData = {
  item: DocItemData
  label: Localized
  doc?: ComponentDoc
  files: DocFileData[]
  usage: { imports?: string; code?: string; composition?: string }
  examples: DocExampleData[]
  demo: { html: string; filename: string; language: string }
}

/** Everything the page needs, computed at build time in src/pages/docs/[name].astro. */
export type ComponentDocData = {
  item: DocItemData
  nav: DocNav
  isTemplate: boolean
  /** The hand-written documentation entry for this item (content/docs/<name>.ts), if any. */
  doc?: ComponentDoc
  /** Header files (install panel), in registry order. */
  files: DocFileData[]
  /** Usage samples, highlighted. */
  usage: { imports?: string; code?: string; composition?: string }
  /** Examples in `doc.examples` order, with their highlighted source. */
  examples: DocExampleData[]
  /** Variants shown after the examples, each with its own install command. */
  variants: VariantData[]
  /** The demo shown in the page's first preview tab. */
  demo: { html: string; filename: string; language: string }
  /** Site origin as the build sees it (SITE_URL), for the icon-style install commands. */
  siteUrl: string
  /** The `paneui-icons` skill text and its highlighted Markdown (icons page only). */
  iconSkill?: { text: string; html: string }
}

/** The preview route of a template example: `/templates/docs/` for the classic layout, `/templates/docs/flux/` for the others. */
function templateRoute(name: string, id: string) {
  return id === "classic" ? `/templates/${name}/` : `/templates/${name}/${id}/`
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <DocHeading id={id}>{children}</DocHeading>
}

function ApiPart({ part, compact }: { part: PartDoc; compact?: boolean }) {
  const id = `api-${part.name.toLowerCase()}`
  return (
    <div className="flex flex-col gap-3">
      {compact ? (
        <h4 className="px-1.5 pt-1 font-mono text-ui-lg font-medium text-foreground">{part.name}</h4>
      ) : (
        <DocHeading as="h3" id={id} className="font-mono text-base">
          {part.name}
        </DocHeading>
      )}
      {(part.description || part.extends) && (
        <p className={cn("text-muted-foreground", compact && "px-1.5 text-ui")}>
          {part.description && <Inline text={part.description} />}
          {part.extends && (
            <>
              {part.description ? " " : ""}<T en="Also accepts every prop of " zh="同时接受 " />
              {part.extendsHref ? (
                <a
                  href={part.extendsHref}
                  className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                >
                  {part.extends}
                </a>
              ) : (
                <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                  {part.extends}
                </code>
              )}
              <T en="." zh=" 的全部属性。" />
            </>
          )}
        </p>
      )}
      {part.props.length > 0 && (
        // Phones: one stacked entry per prop (name and default, type, description) instead of a four-column table.
        <Card data-md-skip render={<dl />} className="gap-0 py-0 sm:hidden">
          {part.props.map((p) => (
            <div key={p.name} className="flex min-w-0 flex-col gap-1 border-b border-border px-4 py-3 text-sm last:border-b-0">
              <dt className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-mono text-xs">
                <span className="min-w-0 break-all text-foreground">
                  {p.name}
                  {p.required && <span className="text-destructive-text">*</span>}
                </span>
                {p.default && <span className="min-w-0 break-all text-muted-foreground">= {p.default}</span>}
              </dt>
              <dd className="font-mono text-xs break-words text-foreground">{p.type}</dd>
              {p.description && (
                <dd className="text-pretty text-muted-foreground">
                  <Inline text={p.description} />
                </dd>
              )}
            </div>
          ))}
        </Card>
      )}
      {part.props.length > 0 && (
        <SimpleTable containerClassName="max-sm:hidden" className="min-w-xl">
          <SimpleTableHeader>
            <SimpleTableRow>
              <SimpleTableHead><T en="Prop" zh="属性" /></SimpleTableHead>
              <SimpleTableHead><T en="Type" zh="类型" /></SimpleTableHead>
              <SimpleTableHead><T en="Default" zh="默认值" /></SimpleTableHead>
              <SimpleTableHead><T en="Description" zh="描述" /></SimpleTableHead>
            </SimpleTableRow>
          </SimpleTableHeader>
          <SimpleTableBody>
            {part.props.map((p) => (
              <SimpleTableRow key={p.name}>
                <SimpleTableCell variant="code">
                  {p.name}
                  {p.required && <span className="text-destructive-text">*</span>}
                </SimpleTableCell>
                <SimpleTableCell variant="type">{p.type}</SimpleTableCell>
                <SimpleTableCell variant="code-muted">
                  {p.default ?? "—"}
                </SimpleTableCell>
                <SimpleTableCell>
                  <Inline text={p.description} />
                </SimpleTableCell>
              </SimpleTableRow>
            ))}
          </SimpleTableBody>
        </SimpleTable>
      )}
      {part.dataAttributes && part.dataAttributes.length > 0 && (
        <Card data-md-skip render={<dl />} className="gap-0 py-0 sm:hidden">
          {part.dataAttributes.map((d) => (
            <div key={d.name} className="flex min-w-0 flex-col gap-1 border-b border-border px-4 py-3 text-sm last:border-b-0">
              <dt className="font-mono text-xs break-all text-foreground">{d.name}</dt>
              <dd className="text-pretty text-muted-foreground">
                <Inline text={d.description} />
              </dd>
            </div>
          ))}
        </Card>
      )}
      {part.dataAttributes && part.dataAttributes.length > 0 && (
        <SimpleTable containerClassName="max-sm:hidden">
          <SimpleTableHeader>
            <SimpleTableRow>
              <SimpleTableHead><T en="Data attribute" zh="数据属性" /></SimpleTableHead>
              <SimpleTableHead><T en="Description" zh="描述" /></SimpleTableHead>
            </SimpleTableRow>
          </SimpleTableHeader>
          <SimpleTableBody>
            {part.dataAttributes.map((d) => (
              <SimpleTableRow key={d.name}>
                <SimpleTableCell variant="code">{d.name}</SimpleTableCell>
                <SimpleTableCell>
                  <Inline text={d.description} />
                </SimpleTableCell>
              </SimpleTableRow>
            ))}
          </SimpleTableBody>
        </SimpleTable>
      )}
    </div>
  )
}

/** The install command, and the manual route: dependencies, registry items it builds on, then the files. */
function Install({ item, files }: { item: DocItemData; files: DocFileData[] }) {
  return (
    <Tabs defaultValue="command">
      <TabsList>
        <TabsTab value="command"><T en="Command" zh="命令" /></TabsTab>
        <TabsTab value="manual"><LocalizedText text="Manual" /></TabsTab>
      </TabsList>
      <TabsPanel value="command" className="pt-2">
        <InstallCommand args={`add @${REGISTRY_NAME}/${item.name}`} />
      </TabsPanel>
      <TabsPanel value="manual" className="flex flex-col gap-5 pt-2">
        {item.dependencies.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <p className="font-medium"><T en="Install the dependencies:" zh="安装依赖：" /></p>
            <PackageInstall packages={item.dependencies} />
          </div>
        )}
        {item.registryDependencies.length > 0 && (
          <p className="text-muted-foreground">
            <T en="Add the registry items it builds on first: " zh="先添加它所依赖的组件库条目：" />
            {item.registryDependencies.map((d, i) => (
              <React.Fragment key={d}>
                {i > 0 && <T en=", " zh="、" />}
                <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                  {d}
                </code>
              </React.Fragment>
            ))}
            <T en="." zh="。" />
          </p>
        )}
        <div className="flex flex-col gap-2.5">
          <p className="font-medium"><T en="Copy the source into your project:" zh="将源码复制到你的项目：" /></p>
          {files.map((f) => (
            <StaticCode key={f.path} html={f.html} filename={f.path} language={f.language} maxHeight={420} />
          ))}
        </div>
        <p className="text-muted-foreground"><T en="Update the import paths to match your project setup." zh="按项目配置调整导入路径。" /></p>
      </TabsPanel>
    </Tabs>
  )
}

const muted = "rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"

/** The API row: the primitive it builds on, then each part with its props and data attributes. */
function ApiBody({ doc, parts }: { doc?: ComponentDoc; parts: PartDoc[] }) {
  return (
    <div className="flex flex-col gap-6 pb-1">
      {doc?.baseUi && (
        <p className="px-1.5 text-ui text-muted-foreground">
          <T en="Built on " zh="基于 " />
          <a
            href={`${doc.baseUi.href}#api-reference`}
            className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            <T en={`the ${doc.baseUi.name} primitive`} zh={`${doc.baseUi.name} 原语`} />
          </a>
          <T
            en=". Only the props this library adds or changes are listed; everything else passes through."
            zh="。这里只列出本库新增或改动的属性，其余属性原样透传。"
          />
        </p>
      )}
      {parts.map((part) => (
        <ApiPart key={part.name} part={part} compact />
      ))}
    </div>
  )
}

/** The Notes row: each note as a short titled paragraph. */
function NotesBody({ notes }: { notes: NonNullable<ComponentDoc["notes"]> }) {
  return (
    <div className="flex flex-col gap-4 px-1.5 pb-2">
      {notes.map((n) => (
        <div key={n.title} className="flex flex-col gap-1">
          <h4 className="text-ui font-medium text-foreground">{n.title}</h4>
          <p className="max-w-2xl text-ui text-pretty text-muted-foreground">
            <Inline text={n.body} />
          </p>
        </div>
      ))}
    </div>
  )
}

/** Notes a variant carries over to its host page ("Related" would only point back to the host). */
const variantNotes = (doc?: ComponentDoc) => (doc?.notes ?? []).filter((n) => n.title !== "Related")

/** The Code rows one documented item brings: install and usage before the example's source; composition, API and notes after. */
function itemRows({
  item,
  doc,
  files,
  usage,
  composition,
  api,
  notes,
  pm,
}: {
  item: DocItemData
  doc?: ComponentDoc
  files: DocFileData[]
  usage: { imports?: string; code?: string }
  composition?: string
  api: PartDoc[]
  notes: NonNullable<ComponentDoc["notes"]>
  pm: ReturnType<typeof usePackageManager>
}) {
  const lead: StudioCodeRow[] = [
    {
      id: "install",
      title: siteCopy("Install"),
      body: <Install item={item} files={files} />,
      copy: () => addCommand(pm, REGISTRY_NAME, item.name),
    },
  ]
  if (doc)
    lead.push({
      id: "usage",
      title: siteCopy("Usage"),
      body: (
        <>
          <StaticCode html={usage.imports ?? ""} language="tsx" />
          <StaticCode html={usage.code ?? ""} language="tsx" />
        </>
      ),
      copy: `${doc.usage.imports}\n\n${doc.usage.code}`.trim(),
    })
  const tail: StudioCodeRow[] = []
  if (doc?.composition && composition)
    tail.push({ id: "composition", title: siteCopy("Composition"), body: <StaticCode html={composition} language="text" />, copy: doc.composition })
  if (api.length > 0 || doc?.baseUi) tail.push({ id: "api", title: siteCopy("API"), body: <ApiBody doc={doc} parts={api} /> })
  if (notes.length > 0) tail.push({ id: "notes", title: siteCopy("Notes"), body: <NotesBody notes={notes} /> })
  return { lead, tail }
}

/** Icons page rows: switching the icon style, and drawing new icons with the skill. */
function iconRows(siteUrl: string, iconSkill?: { text: string; html: string }): StudioCodeRow[] {
  return [
    {
      id: "icon-styles",
      title: "Icon styles",
      body: (
        <div className="flex flex-col gap-3 px-1.5 pb-1">
          <p className="max-w-2xl text-ui text-pretty text-muted-foreground">
            <T
              en={
                <>
                  The default set is rounded: outline glyphs on a 24×24 grid with 1.75px round strokes and soft
                  corners. The same names and props also ship in an emoji style: full-colour glossy objects, with
                  arrows and text tools kept as heavier glyphs in the text colour. Both styles install to{" "}
                  <code className={muted}>components/icons.tsx</code>, so one command switches every component in
                  your project. Preview them with the style toggle on the grid.
                </>
              }
              zh={
                <>
                  默认图标集是圆角风格：在 24×24 网格上绘制轮廓，1.75px 圆头描边，转角柔和。相同的名称和属性也提供 emoji 拟物风格：彩色光泽的小物件，箭头和文字工具保留为跟随文字颜色的加粗字形。两种风格都安装到{" "}
                  <code className={muted}>components/icons.tsx</code>，因此一条命令即可切换项目中所有组件。可用图标网格上的风格切换器预览。
                </>
              }
            />
          </p>
          <InstallCommand args={`add ${siteUrl}/r/icons-emoji.json --overwrite`} />
          <p className="text-ui text-muted-foreground"><T en="Back to rounded:" zh="返回圆角风格：" /></p>
          <InstallCommand args={`add ${siteUrl}/r/icons.json --overwrite`} />
          <p className="max-w-2xl text-ui text-pretty text-muted-foreground">
            <T
              en={
                <>
                  Components list the icon set as a dependency, so adding one later asks whether to overwrite{" "}
                  <code className={muted}>components/icons.tsx</code>. Answer no (the default) to keep your style. If you
                  add components with <code className={muted}>--overwrite</code>, the rounded set comes back: run your
                  style&apos;s command again afterwards.
                </>
              }
              zh={
                <>
                  组件会把图标集列为依赖，因此之后再添加组件时会询问是否覆盖{" "}
                  <code className={muted}>components/icons.tsx</code>。选择否（默认值）即可保留你的风格。如果使用{" "}
                  <code className={muted}>--overwrite</code> 添加组件，圆角图标集会被恢复：之后请再次运行你所选风格的命令。
                </>
              }
            />
          </p>
        </div>
      ),
    },
    {
      id: "make-your-own-icons",
      title: "Make your own icons",
      body: (
        <div className="flex flex-col gap-3 px-1.5 pb-1">
          <p className="max-w-2xl text-ui text-pretty text-muted-foreground">
            <T
              en={
                <>
                  Need a glyph the set doesn&apos;t have? Install the <code className={muted}>paneui-icons</code> agent
                  skill and ask your coding agent for it. The skill carries the drawing rules for every style (grids,
                  primitives, corner radii), reference icons, a preview script to check the result at small sizes, and
                  how to add it to your <code className={muted}>components/icons.tsx</code>.
                </>
              }
              zh={
                <>
                  需要图标集中没有的字形？安装 <code className={muted}>paneui-icons</code> 智能体技能，然后向你的编程智能体索取。该技能包含适用于所有风格的绘制规则（网格、基础图形、圆角半径）、参考图标、用于检查小尺寸效果的预览脚本，以及如何把它加入{" "}
                  <code className={muted}>components/icons.tsx</code>。
                </>
              }
            />
          </p>
          <AgentSkill name="paneui-icons" skill={iconSkill?.text ?? ""} html={iconSkill?.html ?? ""} />
        </div>
      ),
    },
  ]
}

const pagerLink = (p?: { href: string; title: string }) => (p ? { href: p.href, title: p.title } : undefined)

export default function ComponentDocPage({ site, data }: { site: SiteProps; data: ComponentDocData }) {
  const pm = usePackageManager()
  return (
    <SiteRoot {...site}>
      {data.isTemplate ? <TemplateDoc data={data} /> : <ComponentPage data={data} pm={pm} />}
    </SiteRoot>
  )
}

/** A component page: the two panels hold everything (the Markdown twin carries the same text as prose). */
function ComponentPage({ data, pm }: { data: ComponentDocData; pm: ReturnType<typeof usePackageManager> }) {
  const { item, doc } = data
  const name = item.name
  const host = itemRows({
    item,
    doc,
    files: data.files,
    usage: data.usage,
    composition: data.usage.composition,
    api: doc?.api ?? [],
    notes: doc?.notes ?? [],
    pm,
  })
  const groups: StudioGroup[] = [
    {
      item: name,
      label: item.title,
      demo: { html: data.demo.html, filename: data.demo.filename },
      examples: data.examples.map((ex) => ({
        id: ex.id,
        title: ex.title,
        html: ex.html,
        description: ex.description ? <Inline text={ex.description} /> : undefined,
      })),
      lead: host.lead,
      tail: name === "icons" ? [...host.tail, ...iconRows(data.siteUrl, data.iconSkill)] : host.tail,
    },
    ...data.variants.map((v) => {
      const rows = itemRows({
        item: v.item,
        doc: v.doc,
        files: v.files,
        usage: v.usage,
        composition: v.usage.composition,
        api: v.doc?.api ?? [],
        notes: variantNotes(v.doc),
        pm,
      })
      return {
        item: v.item.name,
        label: v.label,
        summary: <Inline text={v.doc?.summary ?? v.item.summary} />,
        demo: { html: v.demo.html, filename: v.demo.filename },
        examples: v.examples.map((ex) => ({
          id: ex.id,
          title: ex.title,
          html: ex.html,
          description: ex.description ? <Inline text={ex.description} /> : undefined,
        })),
        lead: rows.lead,
        tail: rows.tail,
      }
    }),
  ]

  return (
    <ComponentStudio
      name={name}
      title={item.title}
      summary={<Inline text={doc?.summary ?? item.summary} />}
      registry={REGISTRY_NAME}
      backHref={`/docs/components/#${categorySlug(item.category)}`}
      markdownPath={markdownPath(`/docs/${name}`)}
      pagePath={`/docs/${name}/`}
      groups={groups}
      stage={name === "icons" ? <IconGrid /> : undefined}
      stageHint={name === "icons" ? <T en="Click an icon to copy its JSX." zh="点击图标复制其 JSX。" /> : undefined}
      prev={pagerLink(data.nav.prev)}
      next={pagerLink(data.nav.next)}
    />
  )
}

/** A template page keeps the long-form layout: header, preview, install, usage, examples, notes and API. */
function TemplateDoc({ data }: { data: ComponentDocData }) {
  const { item, doc } = data
  const name = item.name
  const apiParts = doc?.api ?? []
  const hasApi = apiParts.length > 0 || Boolean(doc?.baseUi)
  const { prev, next } = data.nav
  const toc: TocEntry[] = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    ...(doc ? [{ id: "usage", title: "Usage" }] : []),
    ...(doc?.composition ? [{ id: "composition", title: "Composition" }] : []),
    ...(doc && doc.examples.length > 0
      ? [{ id: "examples", title: "Examples" }, ...doc.examples.map((e) => ({ id: `example-${e.id}`, title: e.title, depth: 2 as const }))]
      : []),
    ...(doc?.notes ?? []).map((n) => ({ id: `note-${n.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, title: n.title })),
    ...(hasApi ? [{ id: "api-reference", title: "API Reference" }] : []),
  ]

  return (
    <DocLayout toc={toc} wide>
      <DocHeader
        href={`/docs/${name}`}
        eyebrow={item.category}
        eyebrowHref={`/#${categorySlug(item.category)}`}
        title={item.title}
        lede={doc?.summary ?? item.summary}
      >
        <div className="flex flex-wrap gap-2 pt-1">
          <Button nativeButton={false} render={<Link href={`/templates/${item.name}/`} />}>
            <LocalizedText text="Open template" />
            <ArrowRightIcon className="rtl:-scale-x-100" data-icon="inline-end" />
          </Button>
        </div>
      </DocHeader>

      <div id="preview" className="scroll-mt-24 xl:scroll-mt-20">
        <PreviewTabs name={name} code={<StaticCode html={data.demo.html} filename={data.demo.filename} language={data.demo.language} maxHeight={520} />} />
      </div>

      <section className="flex flex-col gap-4">
        <H2 id="installation">Installation</H2>
        <Install item={item} files={data.files} />
      </section>

      {doc && (
        <section className="flex flex-col gap-4">
          <H2 id="usage">Usage</H2>
          <StaticCode html={data.usage.imports ?? ""} language="tsx" />
          <StaticCode html={data.usage.code ?? ""} language="tsx" />
        </section>
      )}

      {doc?.composition && (
        <section className="flex flex-col gap-4">
          <H2 id="composition">Composition</H2>
          <StaticCode html={data.usage.composition ?? ""} language="text" />
        </section>
      )}

      {doc && doc.examples.length > 0 && (
        <section className="flex flex-col gap-4">
          <H2 id="examples">Examples</H2>
          {data.examples.map((ex) => (
            <div key={ex.id} className="flex flex-col gap-3">
              <DocHeading as="h3" id={`example-${ex.id}`}>
                <LocalizedText text={ex.title} />
              </DocHeading>
              <PreviewTabs
                example={`${name}/${ex.id}`}
                templatePath={templateRoute(name, ex.id)}
                code={<StaticCode html={ex.html} filename={`${ex.id}.tsx`} language="tsx" maxHeight={420} />}
              />
            </div>
          ))}
        </section>
      )}

      {doc?.notes?.map((n) => (
        <section key={n.title} className="flex flex-col gap-3">
          <H2 id={`note-${n.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{n.title}</H2>
          <div className="typeset typeset-docs text-muted-foreground">
            <p>
              <Inline text={n.body} />
            </p>
          </div>
        </section>
      ))}

      {hasApi && (
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <H2 id="api-reference">API Reference</H2>
          </div>
          <ApiBody doc={doc} parts={apiParts} />
        </section>
      )}

      <DocFooter prev={prev} next={next} updated={data.nav.updated} />
    </DocLayout>
  )
}
