"use client"

import * as React from "react"
import type { AsciiRenderOptions, DiagramColors, RenderOptions, ThemeName } from "beautiful-mermaid"

import { Diagram, type DiagramProps, type DiagramTheme } from "@paneui/ui/components/diagram"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { cn } from "@paneui/ui/lib/utils"

/*
 * Mermaid diagram renderer built on `beautiful-mermaid` (author and MIT notice
 * in THIRD_PARTY_NOTICES.md). Loaded on demand so the layout engine stays out
 * of the initial bundle; SVG stylesheets and marker ids are scoped per figure,
 * external font imports are stripped, and full-screen zoom comes from `Diagram`.
 */

const MERMAID_THEMES = [
  "zinc-light",
  "zinc-dark",
  "tokyo-night",
  "tokyo-night-storm",
  "tokyo-night-light",
  "catppuccin-mocha",
  "catppuccin-latte",
  "nord",
  "nord-light",
  "dracula",
  "github-light",
  "github-dark",
  "solarized-light",
  "solarized-dark",
  "one-dark",
] as const satisfies readonly ThemeName[]

type MermaidThemeName = "auto" | ThemeName
type MermaidColors = Partial<DiagramColors>
type MermaidFormat = "svg" | "unicode" | "ascii"

type BeautifulMermaidModule = typeof import("beautiful-mermaid")

let modulePromise: Promise<BeautifulMermaidModule> | null = null

function loadMermaid() {
  modulePromise ??= import("beautiful-mermaid")
  return modulePromise
}

function scopeCssRules(css: string, scopeId: string) {
  const scope = `[data-mermaid-scope="${scopeId}"]`
  return css.replace(/([^{}]+?)\s*\{([^}]*)\}/g, (full, selectors: string, declarations: string) => {
    const trimmed = selectors.trim()
    if (!trimmed || trimmed.startsWith("@")) return full
    const scoped = trimmed
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((sel) => {
        if (sel === "svg") return scope
        if (sel.startsWith("svg ") || sel.startsWith("svg.") || sel.startsWith("svg:") || sel.startsWith("svg[")) {
          return `${scope}${sel.slice(3)}`
        }
        return `${scope} ${sel}`
      })
      .join(", ")
    return `${scoped} {${declarations}}`
  })
}

/**
 * Isolates a rendered SVG so multiple Mermaid diagrams on a page never leak CSS
 * rules, external font requests, or `<defs>` marker ids across figures.
 */
function scopeMermaidSvg(svg: string, scopeId: string, hasCustomFont: boolean) {
  const openEnd = svg.indexOf(">")
  if (openEnd === -1) return svg

  const openTag = svg.slice(0, openEnd + 1).replace(/<svg\b/, `<svg data-mermaid-scope="${scopeId}"`)
  let body = svg.slice(openEnd + 1)

  body = body.replace(/<style>([\s\S]*?)<\/style>/g, (_match, css: string) => {
    let next = css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/@import\s+url\([^)]*\)\s*;?/g, "")
    if (!hasCustomFont) {
      next = next
        .replace(/\btext\s*\{[^}]*\}/g, "text { font-family: var(--font-sans, system-ui, sans-serif); }")
        .replace(/\.mono\s*\{[^}]*\}/g, ".mono { font-family: var(--font-mono, ui-monospace, monospace); }")
    }
    next = scopeCssRules(next, scopeId).trim()
    return next ? `<style>${next}</style>` : ""
  })

  const ids = new Set(Array.from(body.matchAll(/\sid="([^"]+)"/g), (m) => m[1]))
  if (ids.size > 0) {
    body = body.replace(/(\sid="|url\(#|(?:xlink:)?href="#)([^")]+)/g, (match, lead: string, id: string) =>
      ids.has(id) ? `${lead}${scopeId}-${id}` : match
    )
  }

  return openTag + body
}

function resolveDiagramThemeColors(diagramTheme: DiagramTheme, overrides?: MermaidColors): RenderOptions {
  const c = diagramTheme.colors
  return {
    bg: overrides?.bg ?? c.card ?? "#ffffff",
    fg: overrides?.fg ?? c.foreground ?? "#171717",
    accent: overrides?.accent ?? c.primary,
    muted: overrides?.muted ?? c["muted-foreground"],
    ...(overrides?.line ? { line: overrides.line } : {}),
    ...(overrides?.surface ? { surface: overrides.surface } : {}),
    ...(overrides?.border ? { border: overrides.border } : {}),
  }
}

/**
 * Renders Mermaid syntax to an isolated, theme-ready SVG string without React.
 * Useful for server rendering, build scripts, or passing children to `Diagram`.
 */
async function renderMermaidDiagram(
  chart: string,
  options: RenderOptions & { theme?: ThemeName; scopeId?: string } = {}
): Promise<string> {
  const mod = await loadMermaid()
  const { theme, scopeId = "mermaid", font, ...rest } = options
  const preset = theme ? mod.THEMES[theme] : undefined
  const renderOpts: RenderOptions = {
    ...(preset ?? {}),
    ...rest,
    ...(font ? { font } : {}),
  }
  const svg = await mod.renderMermaidSVGAsync(chart, renderOpts)
  return scopeMermaidSvg(svg, scopeId, Boolean(font))
}

/**
 * Renders Mermaid syntax as plain ASCII or Unicode box drawings without React.
 */
async function renderMermaidText(chart: string, options: AsciiRenderOptions = {}): Promise<string> {
  const mod = await loadMermaid()
  return mod.renderMermaidASCII(chart, options)
}

type MermaidProps = Omit<DiagramProps, "source" | "render" | "children" | "colors" | "renderKey"> & {
  /** Mermaid diagram definition text. */
  chart: string
  /** `"auto"` follows PaneUI's active light/dark/accent tokens; any named preset applies its own palette. */
  theme?: MermaidThemeName
  /** Color overrides for `--bg`, `--fg`, `--line`, `--accent`, `--muted`, `--surface`, and `--border`. */
  colors?: MermaidColors
  /** `"svg"` renders inside `Diagram` with zoom; `"unicode"` or `"ascii"` renders monospace box art. */
  format?: MermaidFormat
  /** Font family passed to SVG rendering. Defaults to the library's `--font-sans` stack. */
  font?: string
  padding?: number
  nodeSpacing?: number
  layerSpacing?: number
  componentSpacing?: number
  /** Omit SVG backdrop fill. Defaults to `true` when `theme="auto"` and `false` for named presets. */
  transparent?: boolean
  /** Enables hover value tooltips on XY charts (`xychart-beta`). */
  interactive?: boolean
  /** Spacing options passed to ASCII / Unicode rendering (`format="unicode" | "ascii"`). */
  asciiOptions?: Omit<AsciiRenderOptions, "useAscii" | "colorMode">
}

type AsciiState = { status: "loading" } | { status: "ready"; text: string } | { status: "error"; message: string }

/** Renders a Mermaid flowchart, state, sequence, class, ER or XY chart diagram. */
function Mermaid({
  chart,
  theme = "auto",
  colors,
  format = "svg",
  font,
  padding,
  nodeSpacing,
  layerSpacing,
  componentSpacing,
  transparent,
  interactive,
  asciiOptions,
  label,
  caption,
  expandable = true,
  maxZoom = 6,
  className,
  ...props
}: MermaidProps) {
  const { labels } = useLocale()
  const reactId = React.useId()
  const scopeId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`
  const isSvg = format === "svg"
  const isTransparent = transparent ?? theme === "auto"

  const colorsKey = JSON.stringify(colors)
  const asciiKey = JSON.stringify(asciiOptions)
  const renderKey = JSON.stringify({
    theme,
    colorsKey,
    font,
    padding,
    nodeSpacing,
    layerSpacing,
    componentSpacing,
    isTransparent,
    interactive,
  })

  const [asciiState, setAsciiState] = React.useState<AsciiState>({ status: "loading" })

  React.useEffect(() => {
    if (isSvg) return
    let alive = true
    const parsedAscii = asciiKey ? (JSON.parse(asciiKey) as Omit<AsciiRenderOptions, "useAscii" | "colorMode">) : undefined
    void renderMermaidText(chart, {
      ...parsedAscii,
      useAscii: format === "ascii",
      colorMode: "none",
    }).then(
      (text) => alive && setAsciiState({ status: "ready", text }),
      (error: unknown) =>
        alive && setAsciiState({ status: "error", message: error instanceof Error ? error.message : String(error) })
    )
    return () => {
      alive = false
    }
  }, [chart, format, isSvg, asciiKey])

  if (!isSvg) {
    const name = label ?? labels.diagram
    return (
      <figure
        data-slot="mermaid"
        data-format={format}
        data-status={asciiState.status}
        aria-label={name}
        aria-busy={asciiState.status === "loading" || undefined}
        className={cn("frame-2xl frame-p-1.5 m-0 flex flex-col bg-card text-card-foreground shadow-raised", className)}
        {...props}
      >
        {asciiState.status === "loading" ? (
          <div data-slot="diagram-skeleton" aria-hidden className="min-h-40 animate-pulse rounded-inner bg-foreground/6 motion-reduce:animate-none" />
        ) : asciiState.status === "error" ? (
          <div data-slot="diagram-error" className="flex flex-col gap-2 rounded-inner p-3 text-start">
            <p className="m-0 text-ui text-destructive-text">{labels.diagramError}</p>
            {asciiState.message && <p className="m-0 text-ui-sm text-muted-foreground">{asciiState.message}</p>}
            {chart && (
              <pre className="m-0 max-h-60 overflow-auto font-mono text-ui-xs whitespace-pre text-muted-foreground">
                <code>{chart}</code>
              </pre>
            )}
          </div>
        ) : (
          <div data-slot="mermaid-ascii" className="overflow-x-auto rounded-inner p-4">
            <pre className="m-0 font-mono text-ui-sm leading-snug whitespace-pre text-foreground">
              <code>{asciiState.text}</code>
            </pre>
          </div>
        )}
        {caption != null && (
          <figcaption data-slot="diagram-caption" className="px-3 pt-1.5 pb-2 text-center text-ui-sm text-pretty text-muted-foreground">
            {caption}
          </figcaption>
        )}
      </figure>
    )
  }

  const renderSvg = async (source: string, diagramTheme: DiagramTheme) => {
    const mod = await loadMermaid()
    const parsedColors = colorsKey ? (JSON.parse(colorsKey) as MermaidColors) : undefined
    const palette =
      theme === "auto"
        ? resolveDiagramThemeColors(diagramTheme, parsedColors)
        : {
            ...mod.THEMES[theme],
            ...parsedColors,
          }

    const svg = await mod.renderMermaidSVGAsync(source, {
      ...palette,
      ...(font ? { font } : {}),
      ...(padding !== undefined ? { padding } : {}),
      ...(nodeSpacing !== undefined ? { nodeSpacing } : {}),
      ...(layerSpacing !== undefined ? { layerSpacing } : {}),
      ...(componentSpacing !== undefined ? { componentSpacing } : {}),
      transparent: isTransparent,
      ...(interactive !== undefined ? { interactive } : {}),
    })
    return scopeMermaidSvg(svg, scopeId, Boolean(font))
  }

  return (
    <Diagram
      data-slot="mermaid"
      source={chart}
      render={renderSvg}
      renderKey={renderKey}
      label={label}
      caption={caption}
      expandable={expandable}
      maxZoom={maxZoom}
      className={cn(!isTransparent && "[&_svg]:rounded-lg", className)}
      {...props}
    />
  )
}

export {
  Mermaid,
  MERMAID_THEMES,
  renderMermaidDiagram,
  renderMermaidText,
  type MermaidProps,
  type MermaidThemeName,
  type MermaidColors,
  type MermaidFormat,
}
