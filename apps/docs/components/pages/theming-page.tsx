"use client"

import type * as React from "react"

import { DEFAULT_ACCENT, PRESET_THEMES, type PresetAccent } from "@/components/docs/accent-color"
import { Code, GuideH2, GuidePage, TextLink } from "@/components/docs/guide-page"
import { InstallCommand } from "@/components/docs/install-command"
import { ThemingSystem } from "@/components/docs/theming-system"
import { REGISTRY_NAME } from "@/lib/site-constants"
import { StaticCode } from "@/components/site/static-code"
import { SiteRoot, type SiteProps } from "@/components/site/site-root"
import { Inline } from "@/components/docs/doc-inline"
import { T, type Localized } from "@/lib/site-locale"
import type { DocNav } from "@/lib/doc-types"
import { Badge } from "@paneui/ui/components/badge"
import {
  SimpleTable,
  SimpleTableBody,
  SimpleTableCell,
  SimpleTableHead,
  SimpleTableHeader,
  SimpleTableRow,
} from "@paneui/ui/components/simple-table"

function Table({ head, children }: { head: Localized[]; children: React.ReactNode }) {
  return (
    <SimpleTable className="min-w-xl">
      <SimpleTableHeader>
        <SimpleTableRow>
          {head.map((h, i) =>
            typeof h === "string" && !h ? (
              // The preview column has nothing to name; the Markdown copy leaves it out.
              <SimpleTableHead key={i} data-md-skip>
                <span className="sr-only">
                  <T en="Preview" zh="预览" />
                </span>
              </SimpleTableHead>
            ) : (
              <SimpleTableHead key={i}>{typeof h === "string" ? h : <T en={h.en} zh={h.zh} />}</SimpleTableHead>
            ),
          )}
        </SimpleTableRow>
      </SimpleTableHeader>
      <SimpleTableBody>{children}</SimpleTableBody>
    </SimpleTable>
  )
}

/* Swatch classes are written out in full so Tailwind generates them. */
const SWATCHES: { token: string; swatch: string }[] = [
  { token: "background", swatch: "bg-background" },
  { token: "card", swatch: "bg-card" },
  { token: "surface-sunken", swatch: "bg-surface-sunken" },
  { token: "surface-standout", swatch: "bg-surface-standout" },
  { token: "primary", swatch: "bg-primary" },
  { token: "primary-subtle", swatch: "bg-primary-subtle" },
  { token: "primary-text", swatch: "bg-primary-text" },
  { token: "fill-hover", swatch: "bg-fill-hover" },
  { token: "muted-foreground", swatch: "bg-muted-foreground" },
  { token: "fg-tertiary", swatch: "bg-fg-tertiary" },
  { token: "border", swatch: "bg-border" },
  { token: "border-strong", swatch: "bg-border-strong" },
  { token: "border-control", swatch: "bg-border-control" },
  { token: "ring", swatch: "bg-ring" },
  { token: "destructive", swatch: "bg-destructive" },
  { token: "success", swatch: "bg-success" },
  { token: "warning", swatch: "bg-warning" },
  { token: "info", swatch: "bg-info" },
  { token: "tag-blue-fill", swatch: "bg-tag-blue-fill" },
  { token: "chart-1…8", swatch: "bg-chart-1" },
  { token: "shell", swatch: "bg-shell" },
]

/** Accent presets with their light and dark primaries (accent-color.ts mirrors packages/tokens/styles/globals.css). */
const ACCENTS = (Object.keys(PRESET_THEMES) as PresetAccent[]).map((name) => ({
  name,
  light: PRESET_THEMES[name].light.primary,
  dark: PRESET_THEMES[name].dark.primary,
  isDefault: name === DEFAULT_ACCENT,
}))

type Prose = { en: string; zh: string }

const TYPE: { cls: string; size: string; use: Prose }[] = [
  { cls: "text-ui-2xs", size: "10px", use: { en: "Tiny counters and labels.", zh: "极小的计数与标签。" } },
  { cls: "text-ui-xs", size: "11px", use: { en: "Meta text, shortcuts and counts.", zh: "元信息文字、快捷键和计数。" } },
  { cls: "text-ui-sm", size: "12px", use: { en: "Captions, badges, small controls, tooltips.", zh: "说明文字、徽标、小型控件和提示框。" } },
  { cls: "text-ui", size: "13px", use: { en: "The default for controls, menus and text inside components.", zh: "控件、菜单和组件内文字的默认值。" } },
  { cls: "text-ui-lg", size: "14px", use: { en: "Large controls and card titles.", zh: "较大的控件和卡片标题。" } },
]

const RADII: { cls: string; corner: string; px: string; use: Prose }[] = [
  { cls: "rounded-xs", corner: "rounded-tl-xs", px: "2px", use: { en: "Search highlights, favicons and tiny segments.", zh: "搜索高亮、网站图标和极小的分段。" } },
  { cls: "rounded-sm", corner: "rounded-tl-sm", px: "4px", use: { en: "Checkboxes, extra-small buttons, keys and small chips.", zh: "复选框、超小按钮、按键和小标签。" } },
  { cls: "rounded-md", corner: "rounded-tl-md", px: "6px", use: { en: "Tab indicators inside a p-0.5 list.", zh: "p-0.5 列表中的标签页指示器。" } },
  { cls: "rounded-lg", corner: "rounded-tl-lg", px: "8px", use: { en: "Controls and menu rows.", zh: "控件和菜单行。" } },
  { cls: "rounded-xl", corner: "rounded-tl-xl", px: "10px", use: { en: "Cards, tables and code blocks.", zh: "卡片、表格和代码块。" } },
  { cls: "rounded-2xl", corner: "rounded-tl-2xl", px: "12px", use: { en: "Menus and popups, two-layer inset cards.", zh: "菜单和弹出层，以及双层内嵌卡片。" } },
  { cls: "rounded-3xl", corner: "rounded-tl-3xl", px: "16px", use: { en: "Dialogs, drawers and big panels.", zh: "对话框、抽屉和大面板。" } },
  { cls: "rounded-4xl", corner: "rounded-tl-4xl", px: "16px", use: { en: "Kept for older code; sits at the 16px cap.", zh: "为旧代码保留；停在 16px 上限。" } },
  { cls: "rounded-5xl", corner: "rounded-tl-5xl", px: "16px", use: { en: "Kept for older code; sits at the 16px cap.", zh: "为旧代码保留；停在 16px 上限。" } },
]

const SHADOW_SCALE: { cls: string; token: string; use: Prose }[] = [
  { cls: "shadow-xs", token: "--shadow-border", use: { en: "A 1px ring, no lift.", zh: "1px 描边环，无浮起。" } },
  { cls: "shadow-sm", token: "--shadow-default", use: { en: "Resting controls and cards.", zh: "静止状态的控件和卡片。" } },
  { cls: "shadow-lg", token: "--shadow-lg", use: { en: "Menus, popovers and floating panels (shadow-md is the same).", zh: "菜单、浮层和浮动面板（shadow-md 与之相同）。" } },
  { cls: "shadow-xl", token: "--shadow-xl", use: { en: "Dialogs, drawers and sheets.", zh: "对话框、抽屉和底部面板。" } },
]

const FONTS: { cls: string; face: string; use: Prose }[] = [
  { cls: "font-sans", face: "Noto Sans, Noto Sans SC", use: { en: "All UI text.", zh: "所有界面文字。" } },
  { cls: "font-mono", face: "JetBrains Mono", use: { en: "Code, keys, terminals and tabular IDs.", zh: "代码、按键、终端和对齐的 ID。" } },
  { cls: "font-serif", face: "Newsreader, Noto Serif SC", use: { en: "Long-form reading (the reading typeset preset).", zh: "长文阅读（阅读排版预设）。" } },
]

const SHADOWS: { cls: string; use: Prose }[] = [
  { cls: "shadow-raised", use: { en: "Resting controls and cards (reads shadow-sm). Hover steps to shadow-raised-hover.", zh: "静止状态的控件和卡片（读取 shadow-sm）。悬停时变为 shadow-raised-hover。" } },
  { cls: "shadow-surface", use: { en: "Popovers, menus and floating panels (reads shadow-lg).", zh: "浮层、菜单和浮动面板（读取 shadow-lg）。" } },
  { cls: "shadow-well", use: { en: "Inset hairline for fields and tracks.", zh: "用于输入框和轨道的细内描边。" } },
  { cls: "shadow-chip", use: { en: "Keys and small chips.", zh: "按键和小标签。" } },
  { cls: "shadow-primary", use: { en: "Filled primary buttons (none in dark).", zh: "填充的主按钮（深色模式下没有）。" } },
]

export type ThemingData = {
  nav: DocNav
  /** Highlighted at build time in src/pages/docs/theming.astro. */
  code: { css: string; darkScript: string; accentRuntime: string; newToken: string }
}

export default function ThemingPage({ site, data }: { site: SiteProps; data: ThemingData }) {
  const toc = [
    { id: "how-it-works", title: "How the system works" },
    { id: "colors", title: "Colors" },
    { id: "dark-mode", title: "Dark mode" },
    { id: "accent-presets", title: "Accent presets" },
    { id: "styles", title: "Styles" },
    { id: "typography", title: "Typography" },
    { id: "fonts", title: "Fonts" },
    { id: "radius", title: "Radius" },
    { id: "elevation", title: "Elevation" },
    { id: "native-style", title: "Native style rules" },
    { id: "adding-tokens", title: "Adding tokens" },
  ]
  return (
    <SiteRoot {...site}>
    <GuidePage href="/docs/theming" nav={data.nav} toc={toc}>
      <section className="flex flex-col gap-4">
        <GuideH2 id="how-it-works">How the system works</GuideH2>
        <ThemingSystem />
        <InstallCommand args={`add @${REGISTRY_NAME}/theme`} />
        <p className="text-muted-foreground">
          <T
            en={
              <>
                <Code>@{REGISTRY_NAME}/theme</Code> writes the variables below and installs <Code>@{REGISTRY_NAME}/utils</Code>,
                whose <Code>cn()</Code> merges the <Code>text-ui-*</Code> sizes as font sizes. For a tinted wash, use the{" "}
                <Code>-subtle</Code> token, such as <Code>bg-success-subtle</Code>.
              </>
            }
            zh={
              <>
                <Code>@{REGISTRY_NAME}/theme</Code> 写入下列变量，并安装 <Code>@{REGISTRY_NAME}/utils</Code>，其 <Code>cn()</Code>{" "}
                会把 <Code>text-ui-*</Code> 字号当作字体大小合并。需要带色底纹时，使用 <Code>-subtle</Code> 变量，例如{" "}
                <Code>bg-success-subtle</Code>。
              </>
            }
          />
        </p>
        <StaticCode html={data.code.css} filename="globals.css (excerpt)" language="css" maxHeight={360} />
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="colors">Colors</GuideH2>
        <p className="text-muted-foreground">
          <T
            en={
              <>
                Colours are named by role, and each surface has a matching <Code>-foreground</Code> token for text on it. Use
                tokens in components, never palette colours (<Code>bg-zinc-100</Code>) or hex values. Every token&apos;s light and
                dark value is on <TextLink href="/themes">Customize</TextLink>.
              </>
            }
            zh={
              <>
                颜色按角色命名，每种表面都有一个配套的 <Code>-foreground</Code> 变量用于其上的文字。组件里请使用变量，不要使用调色板颜色（{" "}
                <Code>bg-zinc-100</Code>）或十六进制值。每个变量的浅色与深色值见{" "}
                <TextLink href="/themes">自定义</TextLink>。
              </>
            }
          />
        </p>
        <p className="text-muted-foreground">
          <T
            en={
              <>
                Solids are for fills. For coloured text and icons use the <Code>-text</Code> role, such as{" "}
                <Code>text-primary-text</Code> or <Code>text-destructive-text</Code>: it reaches 4.5:1 on the page and on its{" "}
                <Code>-subtle</Code> wash in both modes. Labels and highlights take the <Code>tag-*</Code> colours.
              </>
            }
            zh={
              <>
                实色只用于填充。彩色文字和图标请用 <Code>-text</Code> 角色，例如 <Code>text-primary-text</Code> 或{" "}
                <Code>text-destructive-text</Code>：它在两种模式下对页面和自身的 <Code>-subtle</Code> 底色都达到 4.5:1。标签和高亮使用{" "}
                <Code>tag-*</Code> 颜色。
              </>
            }
          />
        </p>
        {/* Swatches of the main roles; the Markdown copy points at the full list instead. */}
        <ul data-md-text="Every role, with its light and dark value, is listed on Customize." className="flex flex-wrap gap-2">
          {SWATCHES.map((s) => (
            <li key={s.token}>
              <Badge variant="outline">
                <span className={`block size-4 rounded-full shadow-chip ${s.swatch}`} />
                <span className="font-mono">{s.token}</span>
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="dark-mode">Dark mode</GuideH2>
        <p className="text-muted-foreground">
          <T
            en={
              <>
                Put <Code>.dark</Code> on <Code>&lt;html&gt;</Code> to switch every token. The theme declares the variant as{" "}
                <Code>@custom-variant dark (&amp;:is(.dark *))</Code>. Set <Code>color-scheme</Code> at the same time so native
                scrollbars and form controls follow. Pair <Code>primary</Code> with <Code>text-primary-foreground</Code>, never <Code>text-white</Code>, because the
                neutral preset makes it near-white in dark mode.
              </>
            }
            zh={
              <>
                在 <Code>&lt;html&gt;</Code> 上添加 <Code>.dark</Code> 即可切换所有变量。主题把该变体声明为{" "}
                <Code>@custom-variant dark (&amp;:is(.dark *))</Code>。同时设置 <Code>color-scheme</Code>，让原生滚动条和表单控件也跟着切换。
                搭配 <Code>primary</Code> 时请用 <Code>text-primary-foreground</Code>，不要用 <Code>text-white</Code>，因为中性预设会让它在深色模式下接近白色。
              </>
            }
          />
        </p>
        <StaticCode html={data.code.darkScript} filename="theme-script.js" language="js" />
        <p className="text-muted-foreground">
          <T
            en={
              <>
                To let users switch, use <TextLink href="/docs/theme-toggle">Theme Toggle</TextLink>, which stores the choice for
                the script above.
              </>
            }
            zh={
              <>
                要让用户自行切换，请使用 <TextLink href="/docs/theme-toggle">主题切换</TextLink>，它会为上面的脚本保存选择。
              </>
            }
          />
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="accent-presets">Accent presets</GuideH2>
        <p className="text-muted-foreground">
          <T
            en={
              <>
                The accent is ten role variables per mode, blue by default: <Code>primary</Code> and its{" "}
                <Code>-hover</Code>, <Code>-active</Code>, <Code>-foreground</Code>, <Code>-subtle</Code>,{" "}
                <Code>-subtle-hover</Code>, <Code>-border</Code> and <Code>-text</Code> variants, plus <Code>ring</Code> and{" "}
                <Code>selection</Code>. Every preset meets the same contrast: 4.5:1 for the label on the solid and for{" "}
                <Code>primary-text</Code>, 3:1 for the ring. Surfaces, text and charts stay the same. Install one after the theme.
              </>
            }
            zh={
              <>
                主题色在每种模式下是十个角色变量，默认为蓝色：<Code>primary</Code> 及其 <Code>-hover</Code>、<Code>-active</Code>、{" "}
                <Code>-foreground</Code>、<Code>-subtle</Code>、<Code>-subtle-hover</Code>、<Code>-border</Code> 和 <Code>-text</Code> 变体，再加{" "}
                <Code>ring</Code> 和 <Code>selection</Code>。每个预设都满足相同的对比度：实色上的文字和 <Code>primary-text</Code> 达到 4.5:1，ring 达到 3:1。
                表面、文字和图表保持一致。请在主题之后安装一个预设。
              </>
            }
          />
        </p>
        <ul
          data-md-text={`The presets are ${ACCENTS.map((a) => `\`theme-${a.name}\`${a.isDefault ? " (the default)" : ""}`).join(", ")}.`}
          className="flex flex-wrap gap-2"
        >
          {ACCENTS.map((a) => (
            <li key={a.name}>
              <Badge variant="outline">
                <span className="flex">
                  <span className="block size-4 rounded-full bg-(--swatch) ring-2 ring-card" style={{ "--swatch": a.light } as React.CSSProperties} />
                  <span className="-ms-1.5 block size-4 rounded-full bg-(--swatch) ring-2 ring-card" style={{ "--swatch": a.dark } as React.CSSProperties} />
                </span>
                <span className="font-mono">theme-{a.name}</span>
                {a.isDefault ? (
                  <span className="text-muted-foreground">
                    <T en="default" zh="默认" />
                  </span>
                ) : null}
              </Badge>
            </li>
          ))}
        </ul>
        <InstallCommand args={`add @${REGISTRY_NAME}/theme-violet`} />
        <p className="text-muted-foreground">
          <T
            en={
              <>
                An installed preset overwrites the variables on <Code>:root</Code> and <Code>.dark</Code>, so the accent is fixed.
                To let users switch, keep the default roles on <Code>:root</Code>, add one block per accent keyed on an attribute,
                and apply the saved choice in the same pre-paint script as dark mode.
              </>
            }
            zh={
              <>
                安装的预设会覆盖 <Code>:root</Code> 和 <Code>.dark</Code> 上的变量，因此主题色是固定的。要让用户切换，请把默认角色留在{" "}
                <Code>:root</Code> 上，为每个主题色添加一个以属性为键的块，并在与深色模式相同的预渲染脚本中应用已保存的选择。
              </>
            }
          />
        </p>
        <p className="text-muted-foreground">
          <T
            en={
              <>
                For a brand colour, use the picker on <TextLink href="/themes">Customize</TextLink> to derive the ten
                roles and copy them.
              </>
            }
            zh={
              <>
                要使用品牌色，请用 <TextLink href="/themes">自定义</TextLink> 中的选择器推导出这十个角色并复制。
              </>
            }
          />
        </p>
        <StaticCode html={data.code.accentRuntime} filename="globals.css" language="css" />
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="styles">Styles</GuideH2>
        <p className="text-muted-foreground">
          <Inline
            text={{
              en: "Paper gives pale surfaces, serif titles and pill controls. Install it, import `theme-paper.css` after the theme and set `data-style=\"paper\"` on `<html>`.",
              zh: "Paper 提供浅色纸面、衬线标题与胶囊形控件。安装后在主题之后导入 `theme-paper.css`，并在 `<html>` 上设置 `data-style=\"paper\"`。",
            }}
          />
        </p>
        <InstallCommand args={`add @${REGISTRY_NAME}/theme-paper`} />
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="typography">Typography</GuideH2>
        <p className="text-muted-foreground">
          <T
            en={
              <>
                Use the <Code>text-ui*</Code> sizes inside components, and keep <Code>text-sm</Code> to <Code>text-2xl</Code> for
                reading copy and page headings. Set titles in <Code>font-semibold</Code>, labels and buttons in{" "}
                <Code>font-medium</Code>, and use <Code>font-semimedium</Code> (450) where 400 reads too light on a dense row.
              </>
            }
            zh={
              <>
                组件内部使用 <Code>text-ui*</Code> 字号，阅读正文和页面标题保用 <Code>text-sm</Code> 至 <Code>text-2xl</Code>。标题用{" "}
                <Code>font-semibold</Code>，标签和按钮用 <Code>font-medium</Code>；在密集行中 400 显得太细时，改用{" "}
                <Code>font-semimedium</Code>（450）。
              </>
            }
          />
        </p>
        <Table head={[{ en: "Class", zh: "类名" }, { en: "Size", zh: "尺寸" }, { en: "Use for", zh: "用途" }]}>
          {TYPE.map((t) => (
            <SimpleTableRow key={t.cls}>
              <SimpleTableCell variant="code">{t.cls}</SimpleTableCell>
              <SimpleTableCell variant="numeric">{t.size}</SimpleTableCell>
              <SimpleTableCell>
                <T en={t.use.en} zh={t.use.zh} />
              </SimpleTableCell>
            </SimpleTableRow>
          ))}
        </Table>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="fonts">Fonts</GuideH2>
        <p className="text-muted-foreground">
          <T
            en={
              <>
                The theme names its faces in <Code>--font-sans</Code>, <Code>--font-mono</Code> and <Code>--font-serif</Code>, each
                with a CJK face and the system stack behind it. Without the font files it renders in system fonts, so installing
                them is optional.
              </>
            }
            zh={
              <>
                主题在 <Code>--font-sans</Code>、<Code>--font-mono</Code> 和 <Code>--font-serif</Code> 中声明字体，每个都在系统字体栈之前配有中日韩字体。
                没有字体文件时会以系统字体渲染，因此安装字体是可选的。
              </>
            }
          />
        </p>
        <Table head={[{ en: "Utility", zh: "工具类" }, { en: "Face", zh: "字体" }, { en: "Use for", zh: "用途" }]}>
          {FONTS.map((f) => (
            <SimpleTableRow key={f.cls}>
              <SimpleTableCell variant="code">{f.cls}</SimpleTableCell>
              <SimpleTableCell className="whitespace-nowrap">{f.face}</SimpleTableCell>
              <SimpleTableCell>
                <T en={f.use.en} zh={f.use.zh} />
              </SimpleTableCell>
            </SimpleTableRow>
          ))}
        </Table>
        <InstallCommand args={`add @${REGISTRY_NAME}/fonts`} />
        <p className="text-muted-foreground">
          <T
            en={
              <>
                This adds the font packages and <Code>packages/tokens/styles/fonts.css</Code>; import that file once in your root layout. Each face is
                split by unicode range, so a page downloads only the glyph sets it shows. For code that lines up with Chinese text,
                install a CJK-aligned monospace such as Sarasa Gothic or Maple Mono yourself and put it first in{" "}
                <Code>--font-mono</Code>.
              </>
            }
            zh={
              <>
                这会添加字体包和 <Code>packages/tokens/styles/fonts.css</Code>；在根布局中导入该文件一次。每种字体按 unicode 范围拆分，
                因此页面只会下载它实际展示的字形集。要让代码与中文对齐，请自行安装等宽的中日韩字体（如 Sarasa Gothic 或 Maple Mono），
                并把它放在 <Code>--font-mono</Code> 的首位。
              </>
            }
          />
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="radius">Radius</GuideH2>
        <p className="text-muted-foreground">
          <T
            en={
              <>
                Every step is a multiple of <Code>--radius</Code>, so change the base and the whole scale follows. No step goes
                past <Code>--radius-max</Code> (16px): larger corners turn controls into pills and push nested parts apart. Keep nested
                corners concentric, with the inner radius equal to the outer radius minus the padding between them. That is why{" "}
                <Code>p-1</Code> menus (<Code>rounded-2xl</Code>) hold <Code>rounded-lg</Code> rows. Use <Code>rounded-full</Code>{" "}
                only for shapes that are actually round. Sizes below are at the default <Code>0.5rem</Code>; try other
                values on <TextLink href="/themes">Customize</TextLink>.
              </>
            }
            zh={
              <>
                每一级都是 <Code>--radius</Code> 的倍数，因此改动基准值，整个色阶都会跟随。没有一级会超过 <Code>--radius-max</Code>（16px）：
                更大的圆角会把控件变成胶囊形，并把嵌套的部分推开。嵌套圆角要保持同心，内圆角等于外圆角减去两者之间的内边距。这也是{" "}
                <Code>p-1</Code> 菜单（<Code>rounded-2xl</Code>）里放 <Code>rounded-lg</Code> 行的原因。<Code>rounded-full</Code>{" "}
                只用于真正圆形的形状。下表尺寸基于默认的 <Code>0.5rem</Code>；可在 <TextLink href="/themes">自定义</TextLink> 中试用其他值。
              </>
            }
          />
        </p>
        <Table head={["", { en: "Class", zh: "类名" }, { en: "Size", zh: "尺寸" }, { en: "Use for", zh: "用途" }]}>
          {RADII.map((r) => (
            <SimpleTableRow key={r.cls}>
              <SimpleTableCell data-md-skip className="w-12">
                <span className={`block size-7 border-t-2 border-l-2 border-foreground/40 ${r.corner}`} />
              </SimpleTableCell>
              <SimpleTableCell variant="code">{r.cls}</SimpleTableCell>
              <SimpleTableCell variant="numeric">{r.px}</SimpleTableCell>
              <SimpleTableCell>
                <T en={r.use.en} zh={r.use.zh} />
              </SimpleTableCell>
            </SimpleTableRow>
          ))}
        </Table>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="elevation">Elevation</GuideH2>
        <p className="text-muted-foreground">
          <T
            en={
              <>
                Four shadow levels back Tailwind&apos;s <Code>shadow-xs</Code> to <Code>shadow-xl</Code>, so plain utilities pick
                them up. Give resting cards, tables and code blocks <Code>shadow-raised</Code>, never a floating level. Show hover
                on rows, menu items and ghost buttons with a fill (<Code>bg-secondary</Code>), not a ring.
              </>
            }
            zh={
              <>
                四个阴影级别支撑 Tailwind 的 <Code>shadow-xs</Code> 到 <Code>shadow-xl</Code>，普通工具类即可直接使用。
                静止的卡片、表格和代码块用 <Code>shadow-raised</Code>，不要用浮起级别。行、菜单项和幽灵按钮的悬停请用填充（{" "}
                <Code>bg-secondary</Code>）表示，而不是描边环。
              </>
            }
          />
        </p>
        <Table head={["", { en: "Class", zh: "类名" }, { en: "Token", zh: "变量" }, { en: "Use for", zh: "用途" }]}>
          {SHADOW_SCALE.map((s) => (
            <SimpleTableRow key={s.cls}>
              <SimpleTableCell data-md-skip className="w-14">
                <span className={`block size-8 rounded-lg bg-popover ${s.cls}`} />
              </SimpleTableCell>
              <SimpleTableCell variant="code">{s.cls}</SimpleTableCell>
              <SimpleTableCell variant="code-muted">{s.token}</SimpleTableCell>
              <SimpleTableCell>
                <T en={s.use.en} zh={s.use.zh} />
              </SimpleTableCell>
            </SimpleTableRow>
          ))}
        </Table>
        <p className="text-muted-foreground">
          <T en="Components read these named levels, each built on the scale above." zh="组件读取这些具名级别，它们都建立在上面色阶之上。" />
        </p>
        {/* The named levels in the same table as the scale, so the two read as one system and no grid cell is left empty. */}
        <Table head={["", { en: "Class", zh: "类名" }, { en: "Use for", zh: "用途" }]}>
          {SHADOWS.map((s) => (
            <SimpleTableRow key={s.cls}>
              <SimpleTableCell data-md-skip className="w-14">
                <span aria-hidden className={`block size-8 rounded-lg bg-card ${s.cls}`} />
              </SimpleTableCell>
              <SimpleTableCell variant="code">{s.cls}</SimpleTableCell>
              <SimpleTableCell>
                <T en={s.use.en} zh={s.use.zh} />
              </SimpleTableCell>
            </SimpleTableRow>
          ))}
        </Table>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="native-style">Native style rules</GuideH2>
        <p className="text-muted-foreground">
          <T en="Follow these rules when you build a new component." zh="构建新组件时请遵循这些规则。" />
        </p>
        <ul className="flex list-disc flex-col gap-2 ps-5 text-muted-foreground marker:text-border">
          <li>
            <T
              en={
                <>
                  <Code>secondary</Code>, <Code>muted</Code> and <Code>accent</Code> are fills; use <Code>bg-card</Code>,{" "}
                  <Code>bg-popover</Code> or <Code>bg-background</Code> for anything that must be opaque.
                </>
              }
              zh={
                <>
                  <Code>secondary</Code>、<Code>muted</Code> 和 <Code>accent</Code> 是填充色；任何必须不透明的地方请用 <Code>bg-card</Code>、{" "}
                  <Code>bg-popover</Code> 或 <Code>bg-background</Code>。
                </>
              }
            />
          </li>
          <li>
            <T en="No gradient sheens, inset highlights, text shadows or glows." zh="不要渐变光泽、内嵌高光、文字阴影或发光。" />
          </li>
          <li>
            <T
              en={
                <>
                  Size buttons and inputs at <Code>h-8</Code> (sm <Code>h-7</Code>, xs <Code>h-6</Code>) and menu rows at 26px.
                  Show disabled with <Code>opacity-64</Code>.
                </>
              }
              zh={
                <>
                  按钮和输入框高度设为 <Code>h-8</Code>（sm 为 <Code>h-7</Code>，xs 为 <Code>h-6</Code>），菜单行为 26px。
                  禁用状态用 <Code>opacity-64</Code> 表示。
                </>
              }
            />
          </li>
          <li>
            <T
              en={
                <>
                  Answer a press on standard controls with a fill change, not a scale. Popups enter from <Code>scale-98</Code> and
                  opacity.
                </>
              }
              zh={
                <>
                  标准控件的按下状态用填充变化回应，而不是缩放。弹出层以 <Code>scale-98</Code> 和透明度进入。
                </>
              }
            />
          </li>
          <li>
            <T
              en={
                <>
                  Show focus with <Code>focus-visible:ring-2 focus-visible:ring-ring</Code>.
                </>
              }
              zh={
                <>
                  焦点用 <Code>focus-visible:ring-2 focus-visible:ring-ring</Code> 表示。
                </>
              }
            />
          </li>
          <li>
            <T
              en={
                <>
                  Put app chrome on <Code>bg-shell</Code> and the content in a <Code>shell-inset</Code> panel.
                </>
              }
              zh={
                <>
                  应用外壳用 <Code>bg-shell</Code>，内容放在 <Code>shell-inset</Code> 面板里。
                </>
              }
            />
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="adding-tokens">Adding tokens</GuideH2>
        <p className="text-muted-foreground">
          <T
            en={
              <>
                Define a new token with a value for both modes, then map it in <Code>@theme inline</Code> to get the utilities.
              </>
            }
            zh={
              <>
                为新变量分别定义两种模式下的值，然后在 <Code>@theme inline</Code> 中映射它，以获得对应的工具类。
              </>
            }
          />
        </p>
        <StaticCode html={data.code.newToken} filename="globals.css" language="css" />
      </section>
    </GuidePage>
    </SiteRoot>
  )
}
