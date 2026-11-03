"use client"

import * as React from "react"
import { useLocale, localeLabels, type LocaleLabels } from "@paneui/ui/components/locale-provider"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { CheckIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"

/*
 * Accent colour picker for an app's appearance settings. Switches the
 * ten accent roles (`--primary` … `--selection`) the theme defines, by setting
 * `data-accent` on <html> (blue, the default, has no attribute), and remembers
 * the pick in localStorage["accent"].
 *
 * The preset roles ship inside this file (the same values as the
 * `html[data-accent]` blocks in the PaneUI theme), injected once as a
 * <style>, so it works in any app that installed @paneui/theme.
 *
 *   <AccentPicker />                              ← self-contained
 *   const [accent, setAccent] = useAccent()       ← your own control
 */

const ACCENTS = ["blue", "neutral", "green", "orange", "rose", "violet"] as const
type Accent = (typeof ACCENTS)[number]

function getAccentLabels(l10n: LocaleLabels = localeLabels.en): Record<Accent, string> {
  return ({
  blue: l10n.blue,
  neutral: l10n.neutral,
  green: l10n.green,
  orange: l10n.orange,
  rose: l10n.rose,
  violet: l10n.violet,
})
}

const ACCENT_LABELS = getAccentLabels()

/** Each preset's light-mode primary (neutral follows the foreground). */
const SWATCH: Record<Accent, string> = {
  neutral: "var(--foreground)",
  blue: "oklch(56% 0.1671 251.78)",
  green: "oklch(54.5% 0.1286 157.68)",
  orange: "oklch(58% 0.1827 40)",
  rose: "oklch(59% 0.213 1.28)",
  violet: "oklch(54.17% 0.179 288.03)",
}

/** The label colour on each swatch (the preset's light-mode primary-foreground). */
const SWATCH_FG: Record<Accent, string> = {
  neutral: "var(--background)",
  blue: "oklch(100% 0 0)",
  green: "oklch(100% 0 0)",
  orange: "oklch(100% 0 0)",
  rose: "oklch(100% 0 0)",
  violet: "oklch(100% 0 0)",
}

const STORAGE_KEY = "accent"
const STYLE_ID = "qy-accent-presets"
/** Same-tab broadcast so every picker (and the PaneUI docs header) stays in step. */
const ACCENT_CHANGE_EVENT = "qy-accent-change"
const PRESETS_CSS = `html[data-accent="neutral"] { --primary: #000000f2; --primary-hover: #000000cc; --primary-active: #000000b2; --primary-foreground: #fff; --primary-subtle: #0000000f; --primary-subtle-hover: #00000017; --primary-border: #00000026; --primary-text: #000000df; --ring: #00000070; --selection: #00000029; } html[data-accent="neutral"].dark { --primary: #fffffff2; --primary-hover: #ffffffcc; --primary-active: #ffffffb2; --primary-foreground: #000; --primary-subtle: #ffffff12; --primary-subtle-hover: #ffffff1b; --primary-border: #ffffff2b; --primary-text: #ffffffed; --ring: #ffffff5c; --selection: #ffffff3d; } html[data-accent="green"] { --primary: oklch(54.5% 0.1286 157.68); --primary-hover: oklch(51% 0.1204 157.68); --primary-active: oklch(47.5% 0.1123 157.68); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(54.5% 0.1286 157.68 / 0.1); --primary-subtle-hover: oklch(54.5% 0.1286 157.68 / 0.16); --primary-border: oklch(54.5% 0.1286 157.68 / 0.32); --primary-text: oklch(51.5% 0.1158 157.68); --ring: oklch(54.5% 0.1286 157.68); --selection: oklch(54.5% 0.1286 157.68 / 0.22); } html[data-accent="green"].dark { --primary: oklch(54.5% 0.1286 157.68); --primary-hover: oklch(51% 0.1204 157.68); --primary-active: oklch(47.5% 0.1123 157.68); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(54.5% 0.1286 157.68 / 0.16); --primary-subtle-hover: oklch(54.5% 0.1286 157.68 / 0.24); --primary-border: oklch(54.5% 0.1286 157.68 / 0.42); --primary-text: oklch(72% 0.1158 157.68); --ring: oklch(54.5% 0.1286 157.68); --selection: oklch(54.5% 0.1286 157.68 / 0.4); } html[data-accent="orange"] { --primary: oklch(58% 0.1827 40); --primary-hover: oklch(54.5% 0.1718 40); --primary-active: oklch(51% 0.161 40); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(58% 0.1827 40 / 0.1); --primary-subtle-hover: oklch(58% 0.1827 40 / 0.16); --primary-border: oklch(58% 0.1827 40 / 0.32); --primary-text: oklch(54.5% 0.1645 40); --ring: oklch(58% 0.1827 40); --selection: oklch(58% 0.1827 40 / 0.22); } html[data-accent="orange"].dark { --primary: oklch(58% 0.1827 40); --primary-hover: oklch(54.5% 0.1718 40); --primary-active: oklch(51% 0.161 40); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(58% 0.1827 40 / 0.16); --primary-subtle-hover: oklch(58% 0.1827 40 / 0.24); --primary-border: oklch(58% 0.1827 40 / 0.42); --primary-text: oklch(72% 0.1645 40); --ring: oklch(58% 0.1827 40); --selection: oklch(58% 0.1827 40 / 0.4); } html[data-accent="rose"] { --primary: oklch(59% 0.213 1.28); --primary-hover: oklch(55.5% 0.213 1.28); --primary-active: oklch(52% 0.2109 1.28); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(59% 0.213 1.28 / 0.1); --primary-subtle-hover: oklch(59% 0.213 1.28 / 0.16); --primary-border: oklch(59% 0.213 1.28 / 0.32); --primary-text: oklch(55% 0.1917 1.28); --ring: oklch(59% 0.213 1.28); --selection: oklch(59% 0.213 1.28 / 0.22); } html[data-accent="rose"].dark { --primary: oklch(59% 0.213 1.28); --primary-hover: oklch(55.5% 0.213 1.28); --primary-active: oklch(52% 0.2109 1.28); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(59% 0.213 1.28 / 0.16); --primary-subtle-hover: oklch(59% 0.213 1.28 / 0.24); --primary-border: oklch(59% 0.213 1.28 / 0.42); --primary-text: oklch(72% 0.1893 1.28); --ring: oklch(59% 0.213 1.28); --selection: oklch(59% 0.213 1.28 / 0.4); } html[data-accent="violet"] { --primary: oklch(54.17% 0.179 288.03); --primary-hover: oklch(50.67% 0.179 288.03); --primary-active: oklch(47.17% 0.179 288.03); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(54.17% 0.179 288.03 / 0.1); --primary-subtle-hover: oklch(54.17% 0.179 288.03 / 0.16); --primary-border: oklch(54.17% 0.179 288.03 / 0.32); --primary-text: oklch(54% 0.1611 288.03); --ring: oklch(54.17% 0.179 288.03); --selection: oklch(54.17% 0.179 288.03 / 0.22); } html[data-accent="violet"].dark { --primary: oklch(54.17% 0.179 288.03); --primary-hover: oklch(50.67% 0.179 288.03); --primary-active: oklch(47.17% 0.179 288.03); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(54.17% 0.179 288.03 / 0.16); --primary-subtle-hover: oklch(54.17% 0.179 288.03 / 0.24); --primary-border: oklch(54.17% 0.179 288.03 / 0.42); --primary-text: oklch(72% 0.1548 288.03); --ring: oklch(54.17% 0.179 288.03); --selection: oklch(54.17% 0.179 288.03 / 0.4); }`

const isAccent = (v: unknown): v is Accent => typeof v === "string" && (ACCENTS as readonly string[]).includes(v)

function ensurePresets() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement("style")
  style.id = STYLE_ID
  style.textContent = PRESETS_CSS
  document.head.appendChild(style)
}

function readAccent(): Accent {
  const attr = document.documentElement.getAttribute("data-accent")
  if (isAccent(attr)) return attr
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isAccent(stored)) return stored
  } catch {
    // storage can be unavailable (private mode, sandboxed iframes)
  }
  return "blue"
}

function applyAccent(accent: Accent) {
  ensurePresets()
  const root = document.documentElement
  if (accent === "blue") root.removeAttribute("data-accent")
  else root.setAttribute("data-accent", accent)
  try {
    localStorage.setItem(STORAGE_KEY, accent)
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(ACCENT_CHANGE_EVENT))
}

/** Current accent and a setter. Re-applies the stored accent on mount. */
function useAccent(): [Accent, (accent: Accent) => void] {
  const [accent, setState] = React.useState<Accent>("blue")
  React.useEffect(() => {
    ensurePresets()
    const sync = () => setState(readAccent())
    const stored = readAccent()
    if (stored !== "blue" && !document.documentElement.hasAttribute("data-accent")) {
      document.documentElement.setAttribute("data-accent", stored)
    }
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-accent"] })
    window.addEventListener(ACCENT_CHANGE_EVENT, sync)
    return () => {
      mo.disconnect()
      window.removeEventListener(ACCENT_CHANGE_EVENT, sync)
    }
  }, [])
  const set = React.useCallback((next: Accent) => {
    setState(next)
    applyAccent(next)
  }, [])
  return [accent, set]
}

const ACCENT_SCRIPT = `(function(){try{var a=localStorage.getItem("${STORAGE_KEY}");if(a&&a!=="blue"&&${JSON.stringify(ACCENTS)}.indexOf(a)>-1)document.documentElement.setAttribute("data-accent",a)}catch(e){}})()`

/**
 * The preset roles as a <style> plus a tiny pre-paint script that applies the stored
 * accent before first paint. Render once near the top of your root layout's <body>
 * (or <head>) so a reload never flashes the default blue.
 */
function AccentPresets() {
  return (
    <>
      <style id={STYLE_ID} dangerouslySetInnerHTML={{ __html: PRESETS_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: ACCENT_SCRIPT }} />
    </>
  )
}

type AccentPickerProps = Omit<RadioGroupPrimitive.Props<string>, "value" | "defaultValue" | "onValueChange" | "children"> & {
  /** Presets to offer, in order. Default all six. */
  accents?: readonly Accent[]
  /** Show the name under each swatch. */
  showLabels?: boolean
}

function AccentPicker({ accents = ACCENTS, showLabels = false, className, ...props }: AccentPickerProps) {
  const l10n = useLocale().labels
  const ACCENT_LABELS = getAccentLabels(l10n)

  const [accent, setAccent] = useAccent()
  return (
    <RadioGroupPrimitive
      data-slot="accent-picker"
      value={accent}
      onValueChange={(v) => isAccent(v) && setAccent(v)}
      className={cn("flex flex-wrap items-start gap-3", className)}
      {...props}
      aria-label={props["aria-label"] ?? l10n.accentColour}
    >
      {accents.map((a) => (
        <label key={a} className="flex cursor-pointer flex-col items-center gap-1.5 text-ui-sm text-muted-foreground has-data-checked:text-foreground">
          <RadioPrimitive.Root
            value={a}
            aria-label={ACCENT_LABELS[a]}
            style={{ "--swatch": SWATCH[a], "--swatch-fg": SWATCH_FG[a] } as React.CSSProperties}
            className="relative grid size-7 cursor-pointer place-items-center rounded-full bg-(--swatch) text-background outline-none ring-offset-2 ring-offset-background transition-[box-shadow] duration-150 after:absolute after:inset-0 after:rounded-full after:ring-1 after:ring-foreground/10 after:ring-inset focus-visible:ring-2 focus-visible:ring-ring data-checked:ring-2 data-checked:ring-foreground/30"
          >
            <RadioPrimitive.Indicator className="flex transition-[opacity,scale] duration-150 data-ending-style:scale-50 data-ending-style:opacity-0 data-starting-style:scale-50 data-starting-style:opacity-0 [&_svg]:size-3.5">
              <CheckIcon className="text-(--swatch-fg)" />
            </RadioPrimitive.Indicator>
          </RadioPrimitive.Root>
          {showLabels && <span>{ACCENT_LABELS[a]}</span>}
        </label>
      ))}
    </RadioGroupPrimitive>
  )
}

export { AccentPicker, AccentPresets, useAccent, ACCENTS, ACCENT_LABELS, ACCENT_CHANGE_EVENT }
export type { Accent, AccentPickerProps }
