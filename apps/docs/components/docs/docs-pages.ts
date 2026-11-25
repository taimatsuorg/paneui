import type { Localized } from "@/lib/site-locale"

/**
 * The docs' "Getting started" pages, in sidebar order. Shared by the sidebar,
 * the ⌘K palette, breadcrumbs and the guide pages' prev/next links, so the
 * names stay identical everywhere. Client-safe (no server-only imports).
 */
export type GuidePage = { href: string; title: string; description: Localized; keywords: string[] }

export const GUIDE_PAGES = [
  {
    href: "/docs",
    title: "Introduction",
    description: { en: "React components you own and edit.", zh: "将组件源码加入你的项目。" },
    keywords: ["about", "overview", "start", "principles"],
  },
  {
    href: "/docs/installation",
    title: "Installation",
    description: { en: "Install the theme, then add components.", zh: "安装主题，再添加组件。" },
    keywords: ["setup", "install", "components.json", "registry"],
  },
  {
    href: "/docs/theming",
    title: "Theming",
    description: { en: "Change the theme tokens.", zh: "了解并调整主题变量。" },
    keywords: ["theme", "tokens", "dark mode", "accent", "colors", "css variables", "radius", "shadow", "typography"],
  },
  {
    href: "/docs/cli",
    title: "CLI & registry",
    description: { en: "Find, inspect and install components from the command line.", zh: "在命令行查找、查看和安装组件。" },
    keywords: ["shadcn", "cli", "paneui", "add", "view", "search", "update", "registry", "json"],
  },
  {
    href: "/docs/skill",
    title: "Design skill",
    description: { en: "Design rules and checks for consistent interfaces.", zh: "让界面遵循统一设计规则。" },
    keywords: ["design", "skill", "agent", "rules", "guidelines", "lint", "check", "review", "best practices"],
  },
  {
    href: "/docs/changelog",
    title: "Changelog",
    description: { en: "Updates to PaneUI.", zh: "查看 PaneUI 的更新。" },
    keywords: ["releases", "updates", "history", "news"],
  },
] as const satisfies readonly GuidePage[]

/** The components overview (all live previews, by category). */
export const COMPONENTS_HREF = "/docs/components"
export const COMPONENTS_TITLE = "Components"
/** Public searchable icon catalog hosted independently on the Worker domain, linked from the header. */
export const ICONS_HREF = "https://icons.paneui.dev"
export const TEMPLATES_HREF = "/docs/templates"
