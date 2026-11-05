"use client"

import Link from "next/link"

import { ArrowRightIcon } from "@paneui/ui/icons"
import { categoryIcons, categorySlug } from "@/components/docs/category-icons"
import { Code, GuideH2, GuidePage, TextLink } from "@/components/docs/guide-page"
import { InstallCommand } from "@/components/docs/install-command"
import { REGISTRY_NAME } from "@/lib/site-constants"
import { T } from "@/lib/site-locale"
import { Button } from "@paneui/ui/components/button"
import { Card } from "@paneui/ui/components/card"
import { SiteRoot, type SiteProps } from "@/components/site/site-root"
import type { DocNav } from "@/lib/doc-types"

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

const PRINCIPLES: { title: { en: string; zh: string }; body: { en: string; zh: string } }[] = [
  {
    title: { en: "Open code", zh: "开放代码" },
    body: {
      en: "Every item installs into your project as source through the shadcn CLI. To change a component, edit its file.",
      zh: "每个条目都通过 shadcn CLI 以源码形式安装到你的项目。要修改组件，直接编辑它的文件。",
    },
  },
  {
    title: { en: "Native desktop style", zh: "原生桌面风格" },
    body: {
      en: "Sizes and surfaces are tuned for dense app screens rather than marketing pages.",
      zh: "尺寸与界面为紧凑的应用界面调校，而非宣传页面。",
    },
  },
  {
    title: { en: "Accessible primitives", zh: "无障碍基础组件" },
    body: {
      en: "Interactive parts sit on headless primitives, so focus, keyboard and ARIA behaviour come built in.",
      zh: "交互部分构建在无头基础组件之上，因此焦点、键盘和 ARIA 行为都内置提供。",
    },
  },
  {
    title: { en: "Motion with restraint", zh: "克制的动效" },
    body: {
      en: "Animations settle without bounce, and each one becomes a cross-fade when the user prefers reduced motion.",
      zh: "动画收尾时不会回弹，当用户选择减少动态效果时，每个动画都会变成交叉淡入。",
    },
  },
  {
    title: { en: "Tokens only", zh: "只用变量" },
    body: {
      en: "Components read theme tokens, never raw colours, so a theme or accent change restyles everything at once. Lint rules enforce it.",
      zh: "组件读取主题变量，从不使用原始颜色，因此更换主题或主题色会一次性更新所有样式。Lint 规则会强制这一点。",
    },
  },
]

export type DocsIntroData = { nav: DocNav; groups: { category: string; count: number }[] }

export default function DocsIntroPage({ site, data }: { site: SiteProps; data: DocsIntroData }) {
  const toc = [
    { id: "principles", title: { en: "Principles", zh: "设计原则" } },
    { id: "whats-inside", title: { en: "What's inside", zh: "包含内容" } },
    { id: "stack", title: { en: "Stack", zh: "技术栈" } },
    { id: "quick-start", title: { en: "Quick start", zh: "快速开始" } },
  ]

  return (
    <SiteRoot {...site}>
    <GuidePage
      href="/docs"
      nav={data.nav}
      toc={toc}
      lede={{ en: "React components you own and edit.", zh: "将组件源码加入你的项目。" }}
    >
      <div className="flex flex-col gap-4 text-muted-foreground">
        <p>
          <T
            en={
              <>
                PaneUI is a shadcn registry, not an npm package. Add the <Code>@{REGISTRY_NAME}</Code> namespace to your
                project once, then the CLI copies each component and its dependencies into your codebase. From then on
                the code is yours.
              </>
            }
            zh={
              <>
                PaneUI 是一个 shadcn 组件库，不是 npm 包。把 <Code>@{REGISTRY_NAME}</Code>{" "}
                命名空间添加到项目一次，CLI 便会把每个组件及其依赖复制到你的代码库。此后代码由你掌控。
              </>
            }
          />
        </p>
        <p>
          <T
            en="Use it for app interfaces. Start from a template when you want the pieces already wired together."
            zh="用它构建应用界面。如果希望各部分已经连好，可以从模板开始。"
          />
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <GuideH2 id="principles">
          <T en="Principles" zh="设计原则" />
        </GuideH2>
        {/* Rows: the principle's name on a fixed left column, its sentence beside it on one baseline. */}
        <dl className="flex flex-col gap-5">
          {PRINCIPLES.map((p) => (
            <div key={p.title.en} className="grid grid-cols-1 gap-1 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8">
              <dt className="font-medium">
                <T en={p.title.en} zh={p.title.zh} />
              </dt>
              <dd className="text-muted-foreground">
                <T en={p.body.en} zh={p.body.zh} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="whats-inside">
          <T en="What's inside" zh="包含内容" />
        </GuideH2>
        <div data-md="links" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.groups.map((g) => {
            const Icon = categoryIcons[g.category]
            return (
              <Card key={g.category} interactive size="sm" render={<Link href={`/docs/components#${categorySlug(g.category)}`} />} className="px-4">
                <span className="flex items-center gap-2 font-medium">
                  {Icon && <Icon size={16} className="text-muted-foreground" />}
                  <span data-md-title>
                    <T en={g.category} zh={CATEGORY_ZH[g.category] ?? g.category} />
                  </span>
                  <span className="ms-auto text-ui-xs text-muted-foreground tabular-nums">{g.count}</span>
                </span>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="stack">
          <T en="Stack" zh="技术栈" />
        </GuideH2>
        <ul className="flex list-disc flex-col gap-2 ps-5 text-muted-foreground marker:text-border">
          <li>
            <T
              en={<>Headless primitives for interactive parts (the <Code>base-nova</Code> style).</>}
              zh={<>交互部分使用无头基础组件（<Code>base-nova</Code> 风格）。</>}
            />
          </li>
          <li>
            <T
              en={
                <>
                  <TextLink href="https://tailwindcss.com">Tailwind CSS 4</TextLink> with CSS-variable tokens declared
                  in <Code>@theme inline</Code>.
                </>
              }
              zh={
                <>
                  使用 <TextLink href="https://tailwindcss.com">Tailwind CSS 4</TextLink>，并在{" "}
                  <Code>@theme inline</Code> 中声明 CSS 变量。
                </>
              }
            />
          </li>
          <li>
            <T
              en={
                <>
                  <Code>motion/react</Code> for springs and layout animation.
                </>
              }
              zh={
                <>
                  <Code>motion/react</Code> 用于弹簧动画和布局动画。
                </>
              }
            />
          </li>
          <li>
            <T
              en={
                <>
                  The <TextLink href="https://ui.shadcn.com/docs/cli">shadcn CLI</TextLink> for distribution, and an
                  icon set shipped as <Code>@{REGISTRY_NAME}/icons</Code>.
                </>
              }
              zh={
                <>
                  通过 <TextLink href="https://ui.shadcn.com/docs/cli">shadcn CLI</TextLink> 分发，图标集以{" "}
                  <Code>@{REGISTRY_NAME}/icons</Code> 提供。
                </>
              }
            />
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="quick-start">
          <T en="Quick start" zh="快速开始" />
        </GuideH2>
        <p className="text-muted-foreground">
          <T
            en={
              <>
                Add the namespace (see <TextLink href="/docs/installation">Installation</TextLink>), then install the
                theme and a first component.
              </>
            }
            zh={
              <>
                添加命名空间（见 <TextLink href="/docs/installation">安装</TextLink>），然后安装主题和第一个组件。
              </>
            }
          />
        </p>
        <InstallCommand args={`add @${REGISTRY_NAME}/theme @${REGISTRY_NAME}/button`} />
        <div data-md="links" className="flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link href="/docs/installation" />}>
            <T en="Installation" zh="安装" />
            <ArrowRightIcon className="rtl:-scale-x-100" data-icon="inline-end" />
          </Button>
          <Button variant="secondary" nativeButton={false} render={<Link href="/docs/components" />}>
            <T en="Browse components" zh="浏览组件" />
          </Button>
        </div>
      </section>
    </GuidePage>
    </SiteRoot>
  )
}
