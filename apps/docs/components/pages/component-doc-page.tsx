"use client"

import { T, type Localized } from "@/lib/site-locale"

import * as React from "react"
import Link from "next/link"

import { ArrowRightIcon } from "@paneui/ui/icons"
import { categorySlug } from "@/components/docs/category-icons"
import { IconGrid } from "@/components/docs/icon-grid"
import { AgentSkill } from "@/components/docs/agent-skill"
import { Inline } from "@/components/docs/doc-inline"
import { DocHeading } from "@/components/docs/doc-heading"
import { DocFooter, DocHeader, DocLayout } from "@/components/docs/doc-layout"
import type { TocEntry } from "@/components/docs/doc-toc"
import { InstallCommand, PackageInstall } from "@/components/docs/install-command"
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
import type { ComponentDoc, DocNav, PartDoc } from "@/lib/doc-types"
import { variantAnchor } from "@/lib/doc-merges"

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
  usage: { imports?: string; code?: string }
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

function ApiPart({ part }: { part: PartDoc }) {
  const id = `api-${part.name.toLowerCase()}`
  return (
    <div className="flex flex-col gap-3">
      <DocHeading as="h3" id={id} className="font-mono text-base">
        {part.name}
      </DocHeading>
      {(part.description || part.extends) && (
        <p className="text-muted-foreground">
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

/** Notes a variant carries over to its host page ("Related" would only point back to the host). */
const variantNotes = (doc?: ComponentDoc) => (doc?.notes ?? []).filter((n) => n.title !== "Related")
const noteId = (title: string, prefix = "") => `note-${prefix}${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`

/** One variant's section: its demo, install command, usage, examples and notes, under its own heading. */
function VariantSection({ variant }: { variant: VariantData }) {
  const { item, doc } = variant
  const anchor = variantAnchor(item.name)
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <H2 id={anchor}>
          <LocalizedText text={variant.label} />
        </H2>
        <p className="text-pretty text-muted-foreground">
          <Inline text={doc?.summary ?? item.summary} />
        </p>
      </div>
      <PreviewTabs name={item.name} code={<StaticCode html={variant.demo.html} filename={variant.demo.filename} language={variant.demo.language} maxHeight={520} />} />
      <div className="flex flex-col gap-4">
        <DocHeading as="h3" id={`${anchor}-installation`}>
          <LocalizedText text="Installation" />
        </DocHeading>
        <Install item={item} files={variant.files} />
      </div>
      {doc && (
        <div className="flex flex-col gap-4">
          <DocHeading as="h3" id={`${anchor}-usage`}>
            <LocalizedText text="Usage" />
          </DocHeading>
          <StaticCode html={variant.usage.imports ?? ""} language="tsx" />
          <StaticCode html={variant.usage.code ?? ""} language="tsx" />
        </div>
      )}
      {variant.examples.map((ex) => (
        <div key={ex.id} className="flex flex-col gap-3">
          <DocHeading as="h3" id={`example-${item.name}-${ex.id}`}>
            <LocalizedText text={ex.title} />
          </DocHeading>
          {ex.description && (
            <div className="typeset typeset-docs text-muted-foreground">
              <p>
                <Inline text={ex.description} />
              </p>
            </div>
          )}
          <PreviewTabs
            example={`${item.name}/${ex.id}`}
            code={<StaticCode html={ex.html} filename={`${ex.id}.tsx`} language="tsx" maxHeight={420} />}
          />
        </div>
      ))}
      {variantNotes(doc).map((n) => (
        <div key={n.title} className="flex flex-col gap-3">
          <DocHeading as="h3" id={noteId(n.title, `${item.name}-`)}>
            {n.title}
          </DocHeading>
          <div className="typeset typeset-docs text-muted-foreground">
            <p>
              <Inline text={n.body} />
            </p>
          </div>
        </div>
      ))}
    </section>
  )
}

export default function ComponentDocPage({ site, data }: { site: SiteProps; data: ComponentDocData }) {
  const { item, doc, isTemplate } = data
  const name = item.name

  // API parts of the host first, then each variant's parts not already listed.
  const apiParts: PartDoc[] = []
  for (const part of [...(doc?.api ?? []), ...data.variants.flatMap((v) => v.doc?.api ?? [])]) {
    if (!apiParts.some((p) => p.name === part.name)) apiParts.push(part)
  }
  const hasApi = apiParts.length > 0 || Boolean(doc?.baseUi)

  // Prev/next follow the sidebar: Getting started, the overview, categories in order (A–Z inside each), templates.
  const { prev, next } = data.nav
  const toc: TocEntry[] = [
    // Template pages are mostly their preview, so the outline starts there.
    ...(isTemplate ? [{ id: "preview", title: "Preview" }] : []),
    { id: "installation", title: "Installation" },
    ...(doc ? [{ id: "usage", title: "Usage" }] : []),
    ...(doc?.composition ? [{ id: "composition", title: "Composition" }] : []),
    ...(doc && doc.examples.length > 0
      ? [
          { id: "examples", title: "Examples" },
          ...doc.examples.map((e) => ({
            id: `example-${e.id}`,
            title: e.title,
            depth: 2 as const,
          })),
        ]
      : []),
    ...data.variants.map((v) => ({ id: variantAnchor(v.item.name), title: v.label })),
    ...(doc?.notes ?? []).map((n) => ({
      id: `note-${n.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: n.title,
    })),
    ...(name === "icons"
      ? [
          { id: "icon-styles", title: "Icon styles" },
          { id: "make-your-own-icons", title: "Make your own icons" },
          { id: "all-icons", title: "All icons" },
        ]
      : []),
    ...(hasApi ? [{ id: "api-reference", title: "API Reference" }] : []),
  ]

  return (
    <SiteRoot {...site}>
    <DocLayout toc={toc} wide={isTemplate}>
      <DocHeader
        href={`/docs/${name}`}
        eyebrow={item.category}
        eyebrowHref={`/#${categorySlug(item.category)}`}
        title={item.title}
        lede={doc?.summary ?? item.summary}
      >
        {isTemplate && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button nativeButton={false} render={<Link href={`/templates/${item.name}/`} />}>
              <LocalizedText text="Open template" />
              <ArrowRightIcon className="rtl:-scale-x-100" data-icon="inline-end" />
            </Button>
          </div>
        )}
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
        <section className="flex flex-col gap-10">
          <H2 id="examples">Examples</H2>
          {data.examples.map((ex) => (
            <div key={ex.id} className="flex flex-col gap-3">
              <DocHeading as="h3" id={`example-${ex.id}`}>
                <LocalizedText text={ex.title} />
              </DocHeading>
              {ex.description && (
                <div className="typeset typeset-docs text-muted-foreground">
                  <p>
                    <Inline text={ex.description} />
                  </p>
                </div>
              )}
              <PreviewTabs
                example={`${name}/${ex.id}`}
                templatePath={isTemplate ? templateRoute(name, ex.id) : undefined}
                code={<StaticCode html={ex.html} filename={`${ex.id}.tsx`} language="tsx" maxHeight={420} />}
              />
            </div>
          ))}
        </section>
      )}

      {data.variants.map((v) => (
        <VariantSection key={v.item.name} variant={v} />
      ))}

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

      {name === "icons" && (
        <section className="flex flex-col gap-3">
          <H2 id="icon-styles">Icon styles</H2>
          <p className="text-pretty text-muted-foreground">
            <T
              en={
                <>
                  The default set is rounded: outline glyphs on a 24×24 grid with 1.75px round strokes and soft
                  corners. The same names and props also ship in an emoji style: full-colour glossy objects, with
                  arrows and text tools kept as heavier glyphs in the text colour. Both styles install to{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">components/icons.tsx</code>,
                  so one command switches every component in your project. Preview them with the toggle under All
                  icons.
                </>
              }
              zh={
                <>
                  默认图标集是圆角风格：在 24×24 网格上绘制轮廓，1.75px 圆头描边，转角柔和。相同的名称和属性也提供 emoji 拟物风格：彩色光泽的小物件，箭头和文字工具保留为跟随文字颜色的加粗字形。两种风格都安装到{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">components/icons.tsx</code>，
                  因此一条命令即可切换项目中所有组件。可在“全部图标”下方的切换器中预览它们。
                </>
              }
            />
          </p>
          <InstallCommand args={`add ${data.siteUrl}/r/icons-emoji.json --overwrite`} />
          <p className="text-pretty text-muted-foreground"><T en="Back to rounded:" zh="返回圆角风格：" /></p>
          <InstallCommand args={`add ${data.siteUrl}/r/icons.json --overwrite`} />
          <p className="text-pretty text-muted-foreground">
            <T
              en={
                <>
                  Components list the icon set as a dependency, so adding one later asks whether to overwrite{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">components/icons.tsx</code>.
                  Answer no (the default) to keep your style. If you add components with{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">--overwrite</code>, the
                  rounded set comes back: run your style&apos;s command again afterwards.
                </>
              }
              zh={
                <>
                  组件会把图标集列为依赖，因此之后再添加组件时会询问是否覆盖{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">components/icons.tsx</code>。
                  选择否（默认值）即可保留你的风格。如果使用{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">--overwrite</code>{" "}
                  添加组件，圆角图标集会被恢复：之后请再次运行你所选风格的命令。
                </>
              }
            />
          </p>
        </section>
      )}

      {name === "icons" && (
        <section className="flex flex-col gap-3">
          <H2 id="make-your-own-icons">Make your own icons</H2>
          <p className="text-pretty text-muted-foreground">
            <T
              en={
                <>
                  Need a glyph the set doesn&apos;t have? Install the{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">paneui-icons</code>{" "}
                  agent skill and ask your coding agent for it. The skill carries the drawing rules for every style
                  (grids, primitives, corner radii), reference icons, a preview script to check the result at small
                  sizes, and how to add it to your{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">components/icons.tsx</code>.
                  Works with any coding agent that reads Agent Skills.
                </>
              }
              zh={
                <>
                  需要图标集中没有的字形？安装{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">paneui-icons</code>{" "}
                  智能体技能，然后向你的编程智能体索取。该技能包含适用于所有风格的绘制规则
                  （网格、基础图形、圆角半径）、参考图标、用于检查小尺寸效果的预览脚本，以及如何把它加入{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">components/icons.tsx</code>。
                  适用于任何能读取 Agent Skills 的编程智能体。
                </>
              }
            />
          </p>
          <AgentSkill name="paneui-icons" skill={data.iconSkill?.text ?? ""} html={data.iconSkill?.html ?? ""} />
        </section>
      )}

      {name === "icons" && (
        <section className="flex flex-col gap-3">
          <H2 id="all-icons">All icons</H2>
          <p className="text-muted-foreground"><T en="Click an icon to copy its JSX." zh="点击图标复制其 JSX。" /></p>
          <IconGrid />
        </section>
      )}

      {hasApi && (
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <H2 id="api-reference">API Reference</H2>
            {doc?.baseUi && (
              <p className="text-muted-foreground">
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
          </div>
          {apiParts.map((part) => (
            <ApiPart key={part.name} part={part} />
          ))}
        </section>
      )}

      <DocFooter prev={prev} next={next} updated={data.nav.updated} />
    </DocLayout>
    </SiteRoot>
  )
}
