/**
 * Colour tokens grouped by role for the Colors page, plus a small parser that
 * reads their light and dark values straight out of packages/tokens/styles/globals.css at build
 * time (so the tables can never drift from the theme). Client-safe: the page
 * reads the file and passes the parsed values down.
 */

import type { Localized } from "@/lib/site-locale"

/** How a token is previewed: a fill on the mode's page, text on it, or a hairline. */
export type TokenKind = "surface" | "fill" | "text" | "line"

/** `on`: preview text tokens on this token's fill instead of the page (primary-foreground on primary). */
export type TokenRow = { name: string; cls: string; kind: TokenKind; note?: string; on?: string }
export type TokenRole = { id: string; title: Localized; description: Localized; tokens: TokenRow[] }

const stateTokens = (n: string): TokenRow[] => [
  { name: n, cls: `bg-${n}`, kind: "fill" },
  { name: `${n}-hover`, cls: `bg-${n}-hover`, kind: "fill" },
  { name: `${n}-subtle`, cls: `bg-${n}-subtle`, kind: "fill" },
  { name: `${n}-border`, cls: `border-${n}-border`, kind: "line" },
  { name: `${n}-foreground`, cls: `text-${n}-foreground`, kind: "text", on: n },
  { name: `${n}-text`, cls: `text-${n}-text`, kind: "text" },
]

const TAG_COLOURS = ["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]
const tagTokens = (c: string): TokenRow[] => [
  // The default pill is translucent, so its text previews on the page.
  { name: `tag-${c}-text`, cls: `text-tag-${c}-text`, kind: "text", on: c === "default" ? undefined : `tag-${c}-fill` },
  { name: `tag-${c}-bg`, cls: `bg-tag-${c}-bg`, kind: "fill" },
  { name: `tag-${c}-fill`, cls: `bg-tag-${c}-fill`, kind: "fill" },
]

export const TOKEN_ROLES: TokenRole[] = [
  {
    id: "background",
    title: { en: "Background", zh: "背景" },
    description: {
      en: "Use these for anything that must be opaque, and sunken for wells inside a surface.",
      zh: "需要不透明的地方用这些变量，表面内部的凹槽用 sunken。",
    },
    tokens: [
      { name: "background", cls: "bg-background", kind: "surface" },
      { name: "card", cls: "bg-card", kind: "surface" },
      { name: "popover", cls: "bg-popover", kind: "surface" },
      { name: "surface-sunken", cls: "bg-surface-sunken", kind: "fill" },
      { name: "surface-standout", cls: "bg-surface-standout", kind: "surface" },
      { name: "shell", cls: "bg-shell", kind: "surface" },
      { name: "code", cls: "bg-code", kind: "surface" },
    ],
  },
  {
    id: "fill",
    title: { en: "Fill", zh: "填充" },
    description: {
      en: "Use fill-hover for hovered rows and filled controls, fill-active for pressed, open and selected, and fill-strong for pressed on hover. secondary and muted read fill-hover, accent reads fill-active. All are translucent, so never use them as surfaces.",
      zh: "悬停的行和带底色的控件用 fill-hover，按下、展开和选中用 fill-active，悬停时按下用 fill-strong。secondary 和 muted 读取 fill-hover，accent 读取 fill-active。它们都是半透明的，不要用作表面。",
    },
    tokens: [
      { name: "primary", cls: "bg-primary", kind: "fill", note: "accent" },
      { name: "fill-hover", cls: "bg-fill-hover", kind: "fill" },
      { name: "fill-active", cls: "bg-fill-active", kind: "fill" },
      { name: "fill-strong", cls: "bg-fill-strong", kind: "fill" },
      { name: "secondary", cls: "bg-secondary", kind: "fill" },
      { name: "muted", cls: "bg-muted", kind: "fill" },
      { name: "accent", cls: "bg-accent", kind: "fill" },
    ],
  },
  {
    id: "accent-roles",
    title: { en: "Accent roles", zh: "主题色角色" },
    description: {
      en: "Use hover and active for pressed solids, subtle for selected rows and tinted chips, and primary-text for links and accent text: the solid is for fills only.",
      zh: "按下的实色用 hover 和 active，选中的行和带底色的标签用 subtle，链接和主题色文字用 primary-text：实色只用于填充。",
    },
    tokens: [
      { name: "primary-hover", cls: "bg-primary-hover", kind: "fill", note: "accent" },
      { name: "primary-active", cls: "bg-primary-active", kind: "fill", note: "accent" },
      { name: "primary-subtle", cls: "bg-primary-subtle", kind: "fill", note: "accent" },
      { name: "primary-subtle-hover", cls: "bg-primary-subtle-hover", kind: "fill", note: "accent" },
      { name: "primary-border", cls: "border-primary-border", kind: "line", note: "accent" },
      { name: "primary-text", cls: "text-primary-text", kind: "text", note: "accent" },
      { name: "selection", cls: "bg-selection", kind: "fill", note: "accent" },
    ],
  },
  {
    id: "text",
    title: { en: "Text", zh: "文字" },
    description: {
      en: "Use foreground for primary text, muted-foreground for captions and nav icons, and fg-tertiary only for placeholders and hints.",
      zh: "主要文字用 foreground，说明文字和导航图标用 muted-foreground，fg-tertiary 只用于占位符和提示。",
    },
    tokens: [
      { name: "foreground", cls: "text-foreground", kind: "text" },
      { name: "muted-foreground", cls: "text-muted-foreground", kind: "text" },
      { name: "fg-tertiary", cls: "text-fg-tertiary", kind: "text" },
      { name: "fg-disabled", cls: "text-fg-disabled", kind: "text" },
      { name: "card-foreground", cls: "text-card-foreground", kind: "text" },
      { name: "popover-foreground", cls: "text-popover-foreground", kind: "text" },
      { name: "primary-foreground", cls: "text-primary-foreground", kind: "text", note: "accent", on: "primary" },
      { name: "standout-foreground", cls: "text-standout-foreground", kind: "text", on: "surface-standout" },
      { name: "secondary-foreground", cls: "text-secondary-foreground", kind: "text" },
      { name: "accent-foreground", cls: "text-accent-foreground", kind: "text" },
    ],
  },
  {
    id: "border",
    title: { en: "Border", zh: "边框" },
    description: {
      en: "Use border for dividers, border-strong or input for field outlines, border-control where an edge must reach 3:1, and ring at /50 for focus.",
      zh: "分隔线用 border，输入框轮廓用 border-strong 或 input，边缘需要达到 3:1 时用 border-control，聚焦环用 /50 的 ring。",
    },
    tokens: [
      { name: "border", cls: "border-border", kind: "line" },
      { name: "border-subtle", cls: "border-border-subtle", kind: "line" },
      { name: "border-strong", cls: "border-border-strong", kind: "line" },
      { name: "border-control", cls: "border-border-control", kind: "line" },
      { name: "input", cls: "border-input", kind: "line" },
      { name: "shell-border", cls: "border-shell-border", kind: "line" },
      { name: "ring", cls: "ring-ring", kind: "line", note: "accent" },
      { name: "scrollbar", cls: "var(--scrollbar)", kind: "fill" },
      { name: "scrollbar-hover", cls: "var(--scrollbar-hover)", kind: "fill" },
    ],
  },
  {
    id: "state",
    title: { en: "State", zh: "状态" },
    description: {
      en: "These keep their meaning under every accent. Use subtle for alert and badge washes, -text for text and icons, and the solid with its foreground for filled controls.",
      zh: "这些颜色在任何主题色下都保持含义。提示和徽标的浅底色用 subtle，文字和图标用 -text，带底色的控件用实色及其 foreground。",
    },
    tokens: [...stateTokens("destructive"), ...stateTokens("success"), ...stateTokens("warning"), ...stateTokens("info")],
  },
  {
    id: "tag",
    title: { en: "Tag", zh: "标签" },
    description: {
      en: "Label and highlight colours for tags, selects and callouts. Use fill for pills, bg for highlights, and text on either.",
      zh: "用于标签、选择项和标注的颜色。胶囊用 fill，高亮用 bg，文字两者都可以搭配。",
    },
    tokens: TAG_COLOURS.flatMap(tagTokens),
  },
  {
    id: "chart",
    title: { en: "Chart", zh: "图表" },
    description: {
      en: "Charts never read primary, so data keeps its colours under every accent. Use them as classes, or as var(--chart-n) in SVG.",
      zh: "图表从不读取 primary，因此数据在任何主题色下都保持自身颜色。可以把它们用作类名，或在 SVG 中使用 var(--chart-n)。",
    },
    tokens: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ name: `chart-${n}`, cls: `bg-chart-${n}`, kind: "fill" as const })),
  },
]

export type ModeValues = Record<string, string>
export type ParsedTheme = { light: ModeValues; dark: ModeValues }

/**
 * Read the custom properties declared on `:root` and `.dark` in a stylesheet.
 * Later blocks win, as in CSS. Selector variants (html[data-accent] …) are ignored; a token
 * that `.dark` does not redeclare keeps its `:root` value (see `modeValue`).
 */
export function parseThemeTokens(css: string): ParsedTheme {
  const out: ParsedTheme = { light: {}, dark: {} }
  const src = stripAtSupports(css.replace(/\/\*[\s\S]*?\*\//g, ""))
  const block = /(?:^|[\n}])\s*(:root|\.dark)\s*\{([^{}]*)\}/g
  for (let m = block.exec(src); m; m = block.exec(src)) {
    const target = m[1] === ":root" ? out.light : out.dark
    for (const decl of m[2].split(";")) {
      const i = decl.indexOf(":")
      if (i < 0) continue
      const prop = decl.slice(0, i).trim()
      if (prop.startsWith("--")) target[prop.slice(2)] = decl.slice(i + 1).replace(/\s+/g, " ").trim()
    }
  }
  return out
}

/** Drop `@supports { … }` blocks (wide-gamut and color-mix overrides) so the tables show the base values. */
function stripAtSupports(css: string): string {
  let out = ""
  let i = 0
  for (let at = css.indexOf("@supports", i); at >= 0; at = css.indexOf("@supports", i)) {
    out += css.slice(i, at)
    let j = css.indexOf("{", at)
    let depth = 0
    for (; j < css.length; j++) {
      if (css[j] === "{") depth++
      else if (css[j] === "}" && --depth === 0) break
    }
    i = j + 1
  }
  return out + css.slice(i)
}

/** A token's value in one mode: dark falls back to the light value when `.dark` does not redeclare it. */
export const modeValue = (theme: ParsedTheme, name: string, which: "light" | "dark", depth = 0): string | undefined => {
  const value = which === "dark" ? (theme.dark[name] ?? theme.light[name]) : theme.light[name]
  // Aliases (secondary → var(--fill-hover)) show the value they resolve to in that mode.
  const ref = /^var\(--([\w-]+)\)$/.exec(value ?? "")
  return ref && depth < 8 ? modeValue(theme, ref[1], which, depth + 1) : value
}
