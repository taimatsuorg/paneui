"use client"

import Link from "next/link"

import { GithubIcon, PaneuiLogoIcon } from "@paneui/ui/icons"
import { Button } from "@paneui/ui/components/button"
import { ThemeSwitch } from "@paneui/ui/components/theme-toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@paneui/ui/components/tooltip"
import { LanguageToggle } from "@/components/docs/language-toggle"
import { THEME_KEY } from "@/components/docs/theme-script"
import { useT, type Localized } from "@/lib/site-locale"


export const GITHUB_URL = "https://github.com/taimatsuorg/paneui"

/** The page's one frame: every band of the homepage, the header and the footer share these margins. */
export const FRAME = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"

const navLink =
  "rounded-md px-2 py-1 text-ui text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"

/** A plain sticky bar on the page's frame: mark and two links on the left, GitHub, language, theme and Get started on the right. */
export function LandingHeader() {
  const t = useT()
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className={`${FRAME} flex h-12 items-center gap-2`}>
        <Link
          href="/"
          aria-label={t({ en: "PaneUI home", zh: "PaneUI 首页" })}
          className="flex items-center gap-2 rounded-sm text-ui-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PaneuiLogoIcon size={20} />
          PaneUI
        </Link>
        <nav aria-label={t({ en: "Main", zh: "主导航" })} className="ms-3 hidden items-center md:flex">
          <Link href="/docs" className={navLink}>
            {t({ en: "Docs", zh: "文档" })}
          </Link>
          <Link href="/docs/components" className={navLink}>
            {t({ en: "Components", zh: "组件" })}
          </Link>
          <Link href="/docs/templates" className={navLink}>
            {t({ en: "Templates", zh: "模板" })}
          </Link>
          <Link href="/themes" className={navLink}>
            {t({ en: "Customize", zh: "自定义" })}
          </Link>
        </nav>
        <div className="ms-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  nativeButton={false}
                  render={<a href={GITHUB_URL} target="_blank" rel="noreferrer" />}
                  aria-label={t({ en: "GitHub repository", zh: "GitHub 仓库" })}
                />
              }
            >
              <GithubIcon />
            </TooltipTrigger>
            <TooltipContent side="bottom">GitHub</TooltipContent>
          </Tooltip>
          <LanguageToggle />
          <ThemeSwitch storageKey={THEME_KEY} className="mx-1" />
          <Button variant="secondary" size="sm" nativeButton={false} render={<Link href="/docs" />} className="max-sm:hidden">
            {t({ en: "Get started", zh: "开始使用" })}
          </Button>
        </div>
      </div>
    </header>
  )
}

const LINKS: { label: Localized; href: string; external?: boolean }[] = [
  { label: { en: "Docs", zh: "文档" }, href: "/docs" },
  { label: { en: "Components", zh: "组件" }, href: "/docs/components" },
  { label: { en: "Templates", zh: "模板" }, href: "/docs/templates" },
  { label: { en: "Customize", zh: "自定义" }, href: "/themes" },
  { label: "GitHub", href: GITHUB_URL, external: true },
]

const footLink = "rounded-sm text-ui text-muted-foreground outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"

/** The close: the mark set large on the frame's left edge, then the licence and the links on one row. */
export function LandingFooter() {
  const t = useT()
  return (
    <footer className={`${FRAME} flex flex-col gap-10 pt-16 pb-10 lg:pt-24`}>
      <Link
        href="/"
        aria-label={t({ en: "PaneUI home", zh: "PaneUI 首页" })}
        className="flex w-fit items-center gap-3 rounded-lg font-heading text-5xl font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-4 sm:text-7xl"
      >
        <PaneuiLogoIcon size={56} className="size-11 sm:size-16" />
        PaneUI
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-ui text-muted-foreground">{t({ en: "MIT License", zh: "MIT 许可" })}</span>
        <nav aria-label={t({ en: "Footer", zh: "页脚" })}>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                {link.external ? (
                  <a href={link.href} className={footLink} target="_blank" rel="noreferrer">
                    {t(link.label)}
                  </a>
                ) : (
                  <Link href={link.href} className={footLink}>
                    {t(link.label)}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
