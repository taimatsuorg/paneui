"use client"

import * as React from "react"

import { CheckIcon, CopyIcon } from "@paneui/ui/icons"
import { LiveCodeBlock } from "@/components/docs/live-code-block"
import { T, useT } from "@/lib/site-locale"
import { siteCopy } from "@/lib/site-copy"
import { ActionSwapBlurIcon } from "@paneui/ui/components/action-swap-blur"
import { useCopy } from "@paneui/ui/components/code-block"
import { Badge } from "@paneui/ui/components/badge"
import { Button } from "@paneui/ui/components/button"
import { Card, CardPanel } from "@paneui/ui/components/card"
import { Checkbox } from "@paneui/ui/components/checkbox"
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerHexInput,
  ColorPickerHue,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@paneui/ui/components/color-picker"
import { Radio, RadioGroup } from "@paneui/ui/components/radio"
import { Slider } from "@paneui/ui/components/slider"
import { Switch } from "@paneui/ui/components/switch"

import { ACCENT_VARS, DEFAULT_ACCENT, opaqueHex, PRESET_LABELS, PRESET_THEMES, themeCss, type PresetAccent } from "./accent-color"
import { setAccent, setCustomAccent, useAccentState } from "./accent-store"

const PRESETS = Object.keys(PRESET_THEMES) as PresetAccent[]
/** Each mode's page colour, so translucent roles read as they do there. Mirrors --background. */
const PAGE = { light: "#fff", dark: "oklch(15% 0 0)" } as const
/** Short role name under the strip: `primary-subtle-hover` → `subtle-hover`, `primary` → `solid`. */
const roleLabel = (k: string) => (k === "ring" ? "ring" : k.replace("primary-", "").replace("primary", "solid"))
const CHARTS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5", "bg-chart-6", "bg-chart-7", "bg-chart-8"]


/**
 * Live accent: presets and a custom colour recolour the whole site (header, demos,
 * template previews) by switching `data-accent` on <html>; "Copy theme CSS" exports
 * the exact :root/.dark role overrides for the current pick.
 */
export function ThemingAccent() {
  const t = useT()
  const { accent, custom } = useAccentState()
  const { copied, copy } = useCopy()
  const preset = PRESET_THEMES[accent === "custom" ? DEFAULT_ACCENT : accent]
  const theme = accent === "custom" && custom ? custom : preset
  const label = accent === "custom" && custom ? `custom ${custom.hex}` : PRESET_LABELS[accent as PresetAccent].toLowerCase()
  const css = themeCss(theme, label)

  // The picker shows the custom colour once there is one, otherwise the current light primary.
  const pickerHex = custom?.hex ?? opaqueHex(preset.light.primary)

  // Coalesce drag updates to one per frame (each writes localStorage and re-syncs template iframes).
  const frame = React.useRef<number | null>(null)
  const pending = React.useRef<string | null>(null)
  const pick = React.useCallback((hex: string) => {
    pending.current = hex
    if (frame.current !== null) return
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      if (pending.current) setCustomAccent(pending.current)
    })
  }, [])
  React.useEffect(() => () => void (frame.current !== null && cancelAnimationFrame(frame.current)), [])

  return (
    <div className="flex flex-col gap-4">
      <Card
        variant="inset"
        data-md-text={t({
          en: "The web page has a live accent picker here: choose a preset or a brand colour to see it on real controls. The CSS below is for the default accent.",
          zh: "网页在这里提供实时主题色选择器：选择一个预设或品牌色，即可在真实控件上查看效果。下方的 CSS 对应默认主题色。",
        })}
      >
        <CardPanel className="gap-0 py-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b px-4 py-3">
            <div role="radiogroup" aria-label={t({ en: "Accent preset", zh: "主题色预设" })} className="flex items-center gap-2">
              {PRESETS.map((p) => {
                const checked = accent === p
                return (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    aria-label={t(siteCopy(PRESET_LABELS[p]))}
                    title={t(siteCopy(PRESET_LABELS[p]))}
                    onClick={() => setAccent(p)}
                    className="grid size-8 cursor-pointer place-items-center rounded-full outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring aria-checked:ring-2 aria-checked:ring-foreground/70"
                  >
                    {/* Left half: the light-mode primary; right half: the dark-mode one. */}
                    <span
                      aria-hidden
                      className="flex size-6 overflow-hidden rounded-full shadow-chip"
                      style={{ "--sl": PRESET_THEMES[p].light.primary, "--sd": PRESET_THEMES[p].dark.primary } as React.CSSProperties}
                    >
                      <span className="flex-1 bg-(--sl)" />
                      <span className="flex-1 bg-(--sd)" />
                    </span>
                  </button>
                )
              })}
            </div>
            <span aria-hidden className="h-6 w-px bg-border max-sm:hidden" />
            <div className="flex items-center gap-2">
              <ColorPicker value={pickerHex} onValueChange={pick}>
                <ColorPickerTrigger showHex aria-label={t({ en: "Custom accent colour", zh: "自定义主题色" })} />
                <ColorPickerContent>
                  <ColorPickerArea />
                  <ColorPickerHue />
                  <div className="flex items-center gap-2">
                    <ColorPickerSwatch className="size-8" />
                    <ColorPickerHexInput />
                  </div>
                </ColorPickerContent>
              </ColorPicker>
              {accent === "custom" ? (
                <Badge variant="primary" size="sm">
                  <T en="Custom" zh="自定义" />
                </Badge>
              ) : custom ? (
                <Button variant="ghost" size="xs" onClick={() => setAccent("custom")}>
                  <T en="Use custom" zh="使用自定义" />
                </Button>
              ) : null}
            </div>
            <Button variant="ghost" size="sm" className="ms-auto" onClick={() => setAccent(DEFAULT_ACCENT, null)}>
              <T en="Reset" zh="重置" />
            </Button>
          </div>

          <div className="flex flex-col gap-1.5 border-b px-4 py-3 max-sm:hidden">
            {(["light", "dark"] as const).map((mode) => (
              <div key={mode} className="flex items-center gap-3">
                <span className="w-8 shrink-0 text-ui-xs text-muted-foreground capitalize">
                  <T en={mode} zh={mode === "dark" ? "深色" : "浅色"} />
                </span>
                <div
                  className="flex h-6 flex-1 overflow-hidden rounded-md bg-(--page) shadow-chip"
                  style={{ "--page": PAGE[mode] } as React.CSSProperties}
                  role="img"
                  aria-label={t({
                    en: `Accent roles, ${mode} mode`,
                    zh: `主题色角色，${mode === "dark" ? "深色" : "浅色"}模式`,
                  })}
                >
                  {ACCENT_VARS.map((k) => (
                    <span key={k} title={`--${k}`} className="flex-1 bg-(--stop)" style={{ "--stop": theme[mode][k] } as React.CSSProperties} />
                  ))}
                </div>
              </div>
            ))}
            <div aria-hidden className="flex ps-11 font-mono text-ui-2xs text-muted-foreground">
              {ACCENT_VARS.map((k) => (
                <span key={k} className="min-w-0 flex-1 truncate text-center">
                  {roleLabel(k)}
                </span>
              ))}
            </div>
          </div>

          {/* Phones: one row per role, so every label fits in full. */}
          <div data-md-skip className="grid grid-cols-[auto_1fr_1fr] items-center gap-x-3 gap-y-1 border-b px-4 py-3 sm:hidden">
            <span />
            {(["light", "dark"] as const).map((mode) => (
              <span key={mode} className="text-ui-xs text-muted-foreground capitalize">
                <T en={mode} zh={mode === "dark" ? "深色" : "浅色"} />
              </span>
            ))}
            {ACCENT_VARS.map((k) => (
              <React.Fragment key={k}>
                <span className="font-mono text-ui-2xs whitespace-nowrap text-muted-foreground">{roleLabel(k)}</span>
                {(["light", "dark"] as const).map((mode) => (
                  <span
                    key={mode}
                    role="img"
                    aria-label={t({
                      en: `--${k}, ${mode} mode`,
                      zh: `--${k}，${mode === "dark" ? "深色" : "浅色"}模式`,
                    })}
                    className="flex h-5 overflow-hidden rounded-sm bg-(--page) shadow-chip"
                    style={{ "--page": PAGE[mode] } as React.CSSProperties}
                  >
                    <span className="flex-1 bg-(--stop)" style={{ "--stop": theme[mode][k] } as React.CSSProperties} />
                  </span>
                ))}
              </React.Fragment>
            ))}
          </div>

          <div className="grid gap-x-8 gap-y-5 px-4 py-5 sm:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button>
                  <T en="Deploy" zh="部署" />
                </Button>
                <Button variant="outline">
                  <T en="Cancel" zh="取消" />
                </Button>
                <Badge variant="primary">
                  <T en="Selected" zh="已选中" />
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-5 text-ui">
                <label className="flex items-center gap-2">
                  <Switch defaultChecked aria-label={t({ en: "Sync", zh: "同步" })} />
                  <T en="Sync" zh="同步" />
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox defaultChecked />
                  <T en="Notify" zh="通知" />
                </label>
                <RadioGroup defaultValue="a" aria-label={t({ en: "Plan", zh: "套餐" })} className="flex-row gap-4">
                  <label className="flex items-center gap-2">
                    <Radio value="a" />
                    <T en="Pro" zh="专业版" />
                  </label>
                  <label className="flex items-center gap-2">
                    <Radio value="b" />
                    <T en="Team" zh="团队" />
                  </label>
                </RadioGroup>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Slider defaultValue={62} aria-label={t({ en: "Volume", zh: "音量" })} />
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-8 flex-1 items-center rounded-lg bg-card px-3 text-ui text-muted-foreground shadow-well ring-2 ring-ring">
                  <T en="Focus ring" zh="焦点环" />
                </div>
                <span className="text-ui font-medium text-primary-text underline underline-offset-4">
                  <T en="Link" zh="链接" />
                </span>
                <span className="flex items-center gap-1" title={t({ en: "Charts keep their own colours", zh: "图表保留各自的颜色" })}>
                  {CHARTS.map((c) => (
                    <span key={c} className={`block size-2.5 rounded-full ${c}`} />
                  ))}
                </span>
              </div>
            </div>
          </div>
        </CardPanel>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 basis-64 text-sm text-pretty text-muted-foreground">
          <T
            en="Paste these overrides after the theme variables to keep this accent in your project."
            zh="将这些覆盖写在主题变量之后，即可在你的项目中保留此主题色。"
          />
        </p>
        <Button onClick={() => copy(css)}>
          <ActionSwapBlurIcon value={copied ? "copied" : "copy"}>
            {copied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
          </ActionSwapBlurIcon>
          <T en={copied ? "Copied" : "Copy theme CSS"} zh={copied ? "已复制" : "复制主题 CSS"} />
        </Button>
      </div>
      <LiveCodeBlock code={css} title="globals.css" copyable={false} />
    </div>
  )
}
