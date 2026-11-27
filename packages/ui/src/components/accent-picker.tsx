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
 * `data-accent` on <html> (neutral, the default, has no attribute), and remembers
 * the pick in localStorage["accent"].
 *
 * The preset roles ship inside this file (the same values as the
 * `html[data-accent]` blocks in the PaneUI theme), injected once as a
 * <style>, so it works in any app that installed @paneui/theme.
 *
 *   <AccentPicker />                              ← self-contained
 *   const [accent, setAccent] = useAccent()       ← your own control
 */

const ACCENTS = ["neutral", "blue", "green", "orange", "rose", "violet"] as const
type Accent = (typeof ACCENTS)[number]

function getAccentLabels(l10n: LocaleLabels = localeLabels.en): Record<Accent, string> {
  return ({
  neutral: l10n.neutral,
  blue: l10n.blue,
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
  blue: "oklch(54.61% 0.2152 262.88)",
  green: "oklch(54.5% 0.1191 162.48)",
  orange: "oklch(58% 0.1787 41.12)",
  rose: "oklch(58.6% 0.2352 17.59)",
  violet: "oklch(55.8% 0.288 302.32)",
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
const PRESETS_CSS = `html[data-accent="blue"] { --primary: oklch(54.61% 0.2152 262.88); --primary-hover: oklch(51.11% 0.2152 262.88); --primary-active: oklch(47.61% 0.2152 262.88); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(54.61% 0.2152 262.88 / 0.1); --primary-subtle-hover: oklch(54.61% 0.2152 262.88 / 0.16); --primary-border: oklch(54.61% 0.2152 262.88 / 0.32); --primary-text: oklch(53.5% 0.1937 262.88); --ring: oklch(54.61% 0.2152 262.88); --selection: oklch(54.61% 0.2152 262.88 / 0.22); } html[data-accent="blue"].dark { --primary: oklch(69% 0.1626 262.88); --primary-hover: oklch(72.5% 0.1423 262.88); --primary-active: oklch(76% 0.1225 262.88); --primary-foreground: oklch(10% 0 0); --primary-subtle: oklch(69% 0.1626 262.88 / 0.16); --primary-subtle-hover: oklch(69% 0.1626 262.88 / 0.24); --primary-border: oklch(69% 0.1626 262.88 / 0.42); --primary-text: oklch(69% 0.1544 262.88); --ring: oklch(69% 0.1626 262.88); --selection: oklch(69% 0.1626 262.88 / 0.4); } html[data-accent="green"] { --primary: oklch(54.5% 0.1191 162.48); --primary-hover: oklch(51% 0.1115 162.48); --primary-active: oklch(47.5% 0.1039 162.48); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(54.5% 0.1191 162.48 / 0.1); --primary-subtle-hover: oklch(54.5% 0.1191 162.48 / 0.16); --primary-border: oklch(54.5% 0.1191 162.48 / 0.32); --primary-text: oklch(51.5% 0.1072 162.48); --ring: oklch(54.5% 0.1191 162.48); --selection: oklch(54.5% 0.1191 162.48 / 0.22); } html[data-accent="green"].dark { --primary: oklch(76.5% 0.165 163.22); --primary-hover: oklch(80% 0.165 163.22); --primary-active: oklch(83.5% 0.165 163.22); --primary-foreground: oklch(10% 0 0); --primary-subtle: oklch(76.5% 0.165 163.22 / 0.16); --primary-subtle-hover: oklch(76.5% 0.165 163.22 / 0.24); --primary-border: oklch(76.5% 0.165 163.22 / 0.42); --primary-text: oklch(76.5% 0.1568 163.22); --ring: oklch(76.5% 0.165 163.22); --selection: oklch(76.5% 0.165 163.22 / 0.4); } html[data-accent="orange"] { --primary: oklch(58% 0.1787 41.12); --primary-hover: oklch(54.5% 0.1681 41.12); --primary-active: oklch(51% 0.1574 41.12); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(58% 0.1787 41.12 / 0.1); --primary-subtle-hover: oklch(58% 0.1787 41.12 / 0.16); --primary-border: oklch(58% 0.1787 41.12 / 0.32); --primary-text: oklch(54.5% 0.1608 41.12); --ring: oklch(58% 0.1787 41.12); --selection: oklch(58% 0.1787 41.12 / 0.22); } html[data-accent="orange"].dark { --primary: oklch(75% 0.1753 55.93); --primary-hover: oklch(78.5% 0.1461 55.93); --primary-active: oklch(82% 0.1187 55.93); --primary-foreground: oklch(10% 0 0); --primary-subtle: oklch(75% 0.1753 55.93 / 0.16); --primary-subtle-hover: oklch(75% 0.1753 55.93 / 0.24); --primary-border: oklch(75% 0.1753 55.93 / 0.42); --primary-text: oklch(75% 0.1666 55.93); --ring: oklch(75% 0.1753 55.93); --selection: oklch(75% 0.1753 55.93 / 0.4); } html[data-accent="rose"] { --primary: oklch(58.6% 0.2352 17.59); --primary-hover: oklch(55.1% 0.2212 17.59); --primary-active: oklch(51.6% 0.2073 17.59); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(58.6% 0.2352 17.59 / 0.1); --primary-subtle-hover: oklch(58.6% 0.2352 17.59 / 0.16); --primary-border: oklch(58.6% 0.2352 17.59 / 0.32); --primary-text: oklch(54.5% 0.2117 17.59); --ring: oklch(58.6% 0.2352 17.59); --selection: oklch(58.6% 0.2352 17.59 / 0.22); } html[data-accent="rose"].dark { --primary: oklch(71.2% 0.1844 13.43); --primary-hover: oklch(74.7% 0.1557 13.43); --primary-active: oklch(78.2% 0.1292 13.43); --primary-foreground: oklch(10% 0 0); --primary-subtle: oklch(71.2% 0.1844 13.43 / 0.16); --primary-subtle-hover: oklch(71.2% 0.1844 13.43 / 0.24); --primary-border: oklch(71.2% 0.1844 13.43 / 0.42); --primary-text: oklch(71.2% 0.1752 13.43); --ring: oklch(71.2% 0.1844 13.43); --selection: oklch(71.2% 0.1844 13.43 / 0.4); } html[data-accent="violet"] { --primary: oklch(55.8% 0.288 302.32); --primary-hover: oklch(52.3% 0.2763 302.32); --primary-active: oklch(48.8% 0.258 302.32); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(55.8% 0.288 302.32 / 0.1); --primary-subtle-hover: oklch(55.8% 0.288 302.32 / 0.16); --primary-border: oklch(55.8% 0.288 302.32 / 0.32); --primary-text: oklch(55.5% 0.2592 302.32); --ring: oklch(55.8% 0.288 302.32); --selection: oklch(55.8% 0.288 302.32 / 0.22); } html[data-accent="violet"].dark { --primary: oklch(71.4% 0.1889 305.5); --primary-hover: oklch(74.9% 0.1633 305.5); --primary-active: oklch(78.4% 0.1384 305.5); --primary-foreground: oklch(10% 0 0); --primary-subtle: oklch(71.4% 0.1889 305.5 / 0.16); --primary-subtle-hover: oklch(71.4% 0.1889 305.5 / 0.24); --primary-border: oklch(71.4% 0.1889 305.5 / 0.42); --primary-text: oklch(71.4% 0.1794 305.5); --ring: oklch(71.4% 0.1889 305.5); --selection: oklch(71.4% 0.1889 305.5 / 0.4); }`

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
  return "neutral"
}

function applyAccent(accent: Accent) {
  ensurePresets()
  const root = document.documentElement
  if (accent === "neutral") root.removeAttribute("data-accent")
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
  const [accent, setState] = React.useState<Accent>("neutral")
  React.useEffect(() => {
    ensurePresets()
    const sync = () => setState(readAccent())
    const stored = readAccent()
    if (stored !== "neutral" && !document.documentElement.hasAttribute("data-accent")) {
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

const ACCENT_SCRIPT = `(function(){try{var a=localStorage.getItem("${STORAGE_KEY}");if(a&&a!=="neutral"&&${JSON.stringify(ACCENTS)}.indexOf(a)>-1)document.documentElement.setAttribute("data-accent",a)}catch(e){}})()`

/**
 * The preset roles as a <style> plus a tiny pre-paint script that applies the stored
 * accent before first paint. Render once near the top of your root layout's <body>
 * (or <head>) so a reload never flashes the default neutral.
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
