"use client"

import * as React from "react"

import { CheckIcon, CopyIcon, ExternalLinkIcon } from "@paneui/ui/icons"
import { ActionSwapBlurIcon } from "@paneui/ui/components/action-swap-blur"
import { Button } from "@paneui/ui/components/button"
import { useCopy } from "@paneui/ui/components/code-block"
import { SegmentedControl, SegmentedControlItem } from "@paneui/ui/components/segmented-control"
import { Slider } from "@paneui/ui/components/slider"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@paneui/ui/components/tabs"

import { DEFAULT_ACCENT, hexToOklch, oklchToHex, opaqueHex, PRESET_LABELS, PRESET_THEMES, themeCss, type PresetAccent } from "@/components/docs/accent-color"
import { setAccent, setCustomAccent, useAccentState } from "@/components/docs/accent-store"
import { LiveCodeBlock } from "@/components/docs/live-code-block"
import { LocalizedText } from "@/components/docs/localized"
import { DEFAULT_RADIUS, RADIUS_LABELS, RADIUS_MAX, RADIUS_MIN, radiusCss, radiusValue, setRadius, useRadiusState, type RadiusChoice } from "@/components/docs/radius-store"
import { useFrameThemeSync } from "@/components/docs/theme-sync"
import { RADII } from "@/components/docs/theme-script"
import { ThemingTokenTable } from "@/components/docs/theming-token-table"
import { TOKEN_ROLES, type ParsedTheme } from "@/components/docs/theming-tokens"
import { WallGrid } from "@/components/landing/wall"
import { SiteRoot, type SiteProps } from "@/components/site/site-root"
import { siteCopy } from "@/lib/site-copy"
import { T, useT } from "@/lib/site-locale"

export type ThemesData = {
  /** Light and dark token values read from packages/tokens/styles/globals.css at build time. */
  theme: ParsedTheme
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const PRESETS = Object.keys(PRESET_THEMES) as PresetAccent[]
const RADIUS_LABEL_ZH: Record<string, string> = { none: "无", sm: "小", default: "中", lg: "大", xl: "特大" }
const RADIUS_SHORT: Record<string, string> = { none: "0", sm: "S", default: "M", lg: "L", xl: "XL" }
const isRadius = (v: unknown): v is RadiusChoice => v === "custom" || (RADII as readonly string[]).includes(v as string)
const px = (rem: number) => Math.round(rem * 16 * 10) / 10
const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d

type Lch = { l: number; c: number; h: number }

/** Accent as OKLCH sliders, shared through the URL (`?lightness=&chroma=&hue=`) so a pick can be linked. */
function useAccentLch() {
  const { accent, custom } = useAccentState()
  const hex = custom && accent === "custom" ? custom.hex : opaqueHex(PRESET_THEMES[accent === "custom" ? DEFAULT_ACCENT : accent].light.primary)
  const fromHex = React.useMemo<Lch>(() => {
    const o = hexToOklch(hex) ?? { l: 0.6, c: 0.15, h: 250 }
    return { l: round(o.l, 2), c: round(o.c, 3), h: Math.round(o.h) }
  }, [hex])
  // While dragging, keep the sliders' own numbers (a hex round trip would nudge them).
  const [lch, setLch] = React.useState<Lch | null>(null)
  const shown = lch ?? fromHex

  const frame = React.useRef<number | null>(null)
  const pending = React.useRef<Lch | null>(null)
  const apply = React.useCallback((next: Lch) => {
    setLch(next)
    pending.current = next
    if (frame.current !== null) return
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      const p = pending.current
      if (!p) return
      setCustomAccent(oklchToHex(p))
      const url = new URL(window.location.href)
      url.searchParams.set("lightness", String(p.l))
      url.searchParams.set("chroma", String(p.c))
      url.searchParams.set("hue", String(p.h))
      window.history.replaceState(null, "", url)
    })
  }, [])
  React.useEffect(() => () => void (frame.current !== null && cancelAnimationFrame(frame.current)), [])

  // A shared link opens on its colour.
  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const l = Number(q.get("lightness"))
    const c = Number(q.get("chroma"))
    const h = Number(q.get("hue"))
    if (q.has("hue") && [l, c, h].every(Number.isFinite)) apply({ l: Math.min(1, Math.max(0, l)), c: Math.min(0.4, Math.max(0, c)), h: ((h % 360) + 360) % 360 })
  }, [apply])

  const pickPreset = (p: PresetAccent) => {
    setLch(null)
    setAccent(p)
    const url = new URL(window.location.href)
    ;["lightness", "chroma", "hue"].forEach((k) => url.searchParams.delete(k))
    window.history.replaceState(null, "", url)
  }
  return { accent, custom, lch: shown, apply, pickPreset, reset: () => pickPreset(DEFAULT_ACCENT) }
}

function ControlGroup({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-ui-sm font-medium text-muted-foreground">{title}</h2>
      {children}
    </section>
  )
}

function SliderRow({ label, value, display, min, max, step, onChange }: { label: string; value: number; display: string; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-ui">
        <span>{label}</span>
        <span className="font-mono text-ui-sm text-muted-foreground tabular-nums">{display}</span>
      </div>
      <Slider value={value} min={min} max={max} step={step} onValueChange={(v) => onChange(typeof v === "number" ? v : v[0])} aria-label={label} />
    </div>
  )
}

/** A full-page template, scaled to the panel's width and as tall as the panel allows. */
function TemplateFrame({ path, title }: { path: string; title: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const frameRef = React.useRef<HTMLIFrameElement>(null)
  const [size, setSize] = React.useState({ w: 0, h: 0 })
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => e && setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const scale = size.w ? Math.min(1, size.w / 1440) : 0
  const syncTheme = useFrameThemeSync(frameRef, scale > 0)
  const src = `${BASE_PATH}${path}`
  return (
    <div className="flex h-full flex-col gap-3">
      <div ref={ref} className="relative min-h-[28rem] flex-1 overflow-hidden rounded-xl bg-background shadow-raised">
        {scale > 0 && (
          <iframe
            ref={frameRef}
            src={src}
            onLoad={syncTheme}
            title={title}
            // Measured at runtime: the template renders at desktop width, scaled to fit.
            style={{ "--vw": `${size.w / scale}px`, "--vh": `${size.h / scale}px`, "--scale": scale } as React.CSSProperties}
            className="absolute top-0 left-0 h-(--vh) w-(--vw) origin-top-left scale-(--scale) border-0"
          />
        )}
      </div>
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" nativeButton={false} render={<a href={src} target="_blank" rel="noreferrer" />}>
          <T en="Open full page" zh="打开完整页面" />
          <ExternalLinkIcon className="rtl:-scale-x-100" data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}

/*
 * Theme builder: controls on the left (accent preset or OKLCH sliders, radius), a live preview on
 * the right. Every change writes the same stores the rest of the site reads, so the header, the
 * preview and the template iframes repaint together; "Copy CSS" exports the overrides.
 */
export default function ThemesPage({ site, data }: { site: SiteProps; data: ThemesData }) {
  const t = useT()
  const { accent, custom, lch, apply, pickPreset, reset } = useAccentLch()
  const radius = useRadiusState()
  const rem = radiusValue(radius)
  const { copied, copy } = useCopy()

  const accentTheme = accent === "custom" && custom ? custom : PRESET_THEMES[accent === "custom" ? DEFAULT_ACCENT : accent]
  const accentLabel = accent === "custom" && custom ? `custom ${custom.hex}` : PRESET_LABELS[accent as PresetAccent].toLowerCase()
  const radiusLabel = radius.radius === "custom" ? `custom ${rem}rem` : RADIUS_LABELS[radius.radius].toLowerCase()
  const css = `${themeCss(accentTheme, accentLabel)}\n\n${radiusCss(rem, radiusLabel)}`
  const swatch = oklchToHex(lch)

  return (
    <SiteRoot {...site}>
      <div className="flex min-h-[calc(100svh-3rem)] flex-col lg:flex-row">
        <aside className="flex shrink-0 flex-col border-b border-border bg-shell lg:sticky lg:top-12 lg:h-[calc(100svh-3rem)] lg:w-64 lg:border-e lg:border-b-0">
          <div className="flex flex-col gap-8 overflow-y-auto px-5 py-6 lg:flex-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
              <T en="Customize" zh="自定义" />
            </h1>

            <ControlGroup title={<T en="Accent" zh="主题色" />}>
              <div role="radiogroup" aria-label={t({ en: "Accent preset", zh: "主题色预设" })} className="flex flex-wrap items-center gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={accent === p}
                    aria-label={t(siteCopy(PRESET_LABELS[p]))}
                    title={t(siteCopy(PRESET_LABELS[p]))}
                    onClick={() => pickPreset(p)}
                    className="grid size-8 cursor-pointer place-items-center rounded-full outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring aria-checked:ring-2 aria-checked:ring-foreground/70"
                  >
                    <span
                      aria-hidden
                      className="flex size-6 overflow-hidden rounded-full shadow-chip"
                      style={{ "--sl": PRESET_THEMES[p].light.primary, "--sd": PRESET_THEMES[p].dark.primary } as React.CSSProperties}
                    >
                      <span className="flex-1 bg-(--sl)" />
                      <span className="flex-1 bg-(--sd)" />
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-ui">
                <span aria-hidden className="size-5 rounded-full bg-(--swatch) shadow-chip" style={{ "--swatch": swatch } as React.CSSProperties} />
                <span className="font-mono text-ui-sm text-muted-foreground">{swatch}</span>
              </div>
              <SliderRow label={t({ en: "Lightness", zh: "明度" })} value={lch.l} display={lch.l.toFixed(2)} min={0.3} max={0.95} step={0.01} onChange={(l) => apply({ ...lch, l })} />
              <SliderRow label={t({ en: "Chroma", zh: "彩度" })} value={lch.c} display={lch.c.toFixed(3)} min={0} max={0.37} step={0.005} onChange={(c) => apply({ ...lch, c })} />
              <SliderRow label={t({ en: "Hue", zh: "色相" })} value={lch.h} display={`${lch.h}°`} min={0} max={360} step={1} onChange={(h) => apply({ ...lch, h })} />
            </ControlGroup>

            <ControlGroup title={<T en="Radius" zh="圆角" />}>
              <SegmentedControl
                value={radius.radius === "custom" ? "" : radius.radius}
                onValueChange={(v) => isRadius(v) && setRadius(v)}
                aria-label={t({ en: "Radius preset", zh: "圆角预设" })}
                className="w-full *:flex-1"
              >
                {RADII.map((r) => (
                  <SegmentedControlItem key={r} value={r} aria-label={t({ en: RADIUS_LABELS[r], zh: RADIUS_LABEL_ZH[r] })}>
                    {RADIUS_SHORT[r]}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
              <SliderRow
                label={t({ en: "Base radius", zh: "基础圆角" })}
                value={rem}
                display={`${px(rem)}px`}
                min={RADIUS_MIN}
                max={RADIUS_MAX}
                step={0.0625}
                onChange={(v) => setRadius("custom", v)}
              />
            </ControlGroup>
          </div>

          <div className="flex gap-2 border-t border-border p-4">
            <Button
              variant="ghost"
              onClick={() => {
                reset()
                setRadius(DEFAULT_RADIUS, null)
              }}
            >
              <T en="Reset" zh="重置" />
            </Button>
            <Button className="flex-1" onClick={() => copy(css)}>
              <ActionSwapBlurIcon value={copied ? "copied" : "copy"}>
                {copied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
              </ActionSwapBlurIcon>
              <T en={copied ? "Copied" : "Copy CSS"} zh={copied ? "已复制" : "复制 CSS"} />
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-10">
          <Tabs defaultValue="components" className="h-full gap-5">
            <TabsList variant="underline" className="max-w-full overflow-x-auto">
              <TabsTab value="components">
                <T en="Components" zh="组件" />
              </TabsTab>
              <TabsTab value="dashboard">
                <T en="Dashboard" zh="仪表盘" />
              </TabsTab>
              <TabsTab value="agent">
                <T en="Agent" zh="智能体" />
              </TabsTab>
              <TabsTab value="tokens">
                <T en="Tokens" zh="变量" />
              </TabsTab>
              <TabsTab value="css">CSS</TabsTab>
            </TabsList>
            <TabsPanel value="components">
              <WallGrid columns={3} className="max-w-none" />
            </TabsPanel>
            <TabsPanel value="dashboard" className="h-[calc(100svh-11rem)]">
              <TemplateFrame path="/templates/saas/dashboard/" title={t({ en: "Dashboard template preview", zh: "仪表盘模板预览" })} />
            </TabsPanel>
            <TabsPanel value="agent" className="h-[calc(100svh-11rem)]">
              <TemplateFrame path="/templates/agent-workspace/" title={t({ en: "Agent workspace template preview", zh: "智能体工作区模板预览" })} />
            </TabsPanel>
            <TabsPanel value="tokens" className="flex max-w-4xl flex-col gap-10">
              {TOKEN_ROLES.map((role) => (
                <section key={role.id} id={role.id} className="flex flex-col gap-3">
                  <h2 className="text-lg font-semibold text-balance">
                    <LocalizedText text={role.title} />
                  </h2>
                  <p className="text-ui text-muted-foreground">
                    <LocalizedText text={role.description} />
                  </p>
                  <ThemingTokenTable role={role} theme={data.theme} />
                </section>
              ))}
            </TabsPanel>
            <TabsPanel value="css" className="max-w-3xl">
              <LiveCodeBlock code={css} title="globals.css" />
            </TabsPanel>
          </Tabs>
        </main>
      </div>
    </SiteRoot>
  )
}
