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
  blue: "oklch(52% 0.145 250)",
  neutral: "var(--foreground)",
  green: "oklch(52% 0.1221 158)",
  orange: "oklch(57% 0.175 40)",
  rose: "oklch(56% 0.19 3)",
  violet: "oklch(53% 0.165 286)",
}

/** The label colour on each swatch (the preset's light-mode primary-foreground). */
const SWATCH_FG: Record<Accent, string> = {
  blue: "oklch(100% 0 0)",
  neutral: "var(--background)",
  green: "oklch(100% 0 0)",
  orange: "oklch(100% 0 0)",
  rose: "oklch(100% 0 0)",
  violet: "oklch(100% 0 0)",
}

const STORAGE_KEY = "accent"
const STYLE_ID = "qy-accent-presets"
/** Same-tab broadcast so every picker (and the PaneUI docs header) stays in step. */
const ACCENT_CHANGE_EVENT = "qy-accent-change"
const PRESETS_CSS = `html[data-accent="neutral"] { --primary: oklch(20% 0.01 65); --primary-hover: oklch(27% 0.01 65); --primary-active: oklch(33% 0.01 65); --primary-foreground: oklch(98% 0.004 85); --primary-subtle: oklch(20% 0.01 65 / 0.07); --primary-subtle-hover: oklch(20% 0.01 65 / 0.11); --primary-border: oklch(20% 0.01 65 / 0.2); --primary-text: oklch(20% 0.01 65); --ring: oklch(20% 0.01 65 / 0.49); --selection: oklch(20% 0.01 65 / 0.18); } html[data-accent="neutral"].dark { --primary: oklch(94.5% 0.008 82); --primary-hover: oklch(88% 0.008 82); --primary-active: oklch(82% 0.008 82); --primary-foreground: oklch(17.5% 0.007 70); --primary-subtle: oklch(94.5% 0.008 82 / 0.08); --primary-subtle-hover: oklch(94.5% 0.008 82 / 0.12); --primary-border: oklch(94.5% 0.008 82 / 0.2); --primary-text: oklch(94.5% 0.008 82); --ring: oklch(94.5% 0.008 82 / 0.38); --selection: oklch(94.5% 0.008 82 / 0.26); } html[data-accent="green"] { --primary: oklch(52% 0.1221 158); --primary-hover: oklch(48.5% 0.114 158); --primary-active: oklch(45% 0.1059 158); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(52% 0.1221 158 / 0.1); --primary-subtle-hover: oklch(52% 0.1221 158 / 0.16); --primary-border: oklch(52% 0.1221 158 / 0.32); --primary-text: oklch(49% 0.1099 158); --ring: oklch(52% 0.1221 158); --selection: oklch(52% 0.1221 158 / 0.22); } html[data-accent="green"].dark { --primary: oklch(73% 0.115 158); --primary-hover: oklch(76.5% 0.115 158); --primary-active: oklch(80% 0.115 158); --primary-foreground: oklch(20% 0.02 158); --primary-subtle: oklch(73% 0.115 158 / 0.16); --primary-subtle-hover: oklch(73% 0.115 158 / 0.24); --primary-border: oklch(73% 0.115 158 / 0.42); --primary-text: oklch(73% 0.1092 158); --ring: oklch(73% 0.115 158); --selection: oklch(73% 0.115 158 / 0.4); } html[data-accent="orange"] { --primary: oklch(57% 0.175 40); --primary-hover: oklch(53.5% 0.1687 40); --primary-active: oklch(50% 0.1579 40); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(57% 0.175 40 / 0.1); --primary-subtle-hover: oklch(57% 0.175 40 / 0.16); --primary-border: oklch(57% 0.175 40 / 0.32); --primary-text: oklch(52% 0.1575 40); --ring: oklch(57% 0.175 40); --selection: oklch(57% 0.175 40 / 0.22); } html[data-accent="orange"].dark { --primary: oklch(75% 0.145 45); --primary-hover: oklch(78.5% 0.1334 45); --primary-active: oklch(82% 0.1081 45); --primary-foreground: oklch(20% 0.02 45); --primary-subtle: oklch(75% 0.145 45 / 0.16); --primary-subtle-hover: oklch(75% 0.145 45 / 0.24); --primary-border: oklch(75% 0.145 45 / 0.42); --primary-text: oklch(75% 0.1377 45); --ring: oklch(75% 0.145 45); --selection: oklch(75% 0.145 45 / 0.4); } html[data-accent="rose"] { --primary: oklch(56% 0.19 3); --primary-hover: oklch(52.5% 0.19 3); --primary-active: oklch(49% 0.19 3); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(56% 0.19 3 / 0.1); --primary-subtle-hover: oklch(56% 0.19 3 / 0.16); --primary-border: oklch(56% 0.19 3 / 0.32); --primary-text: oklch(52.5% 0.171 3); --ring: oklch(56% 0.19 3); --selection: oklch(56% 0.19 3 / 0.22); } html[data-accent="rose"].dark { --primary: oklch(73% 0.145 3); --primary-hover: oklch(76.5% 0.145 3); --primary-active: oklch(80% 0.1221 3); --primary-foreground: oklch(20% 0.02 3); --primary-subtle: oklch(73% 0.145 3 / 0.16); --primary-subtle-hover: oklch(73% 0.145 3 / 0.24); --primary-border: oklch(73% 0.145 3 / 0.42); --primary-text: oklch(73% 0.1377 3); --ring: oklch(73% 0.145 3); --selection: oklch(73% 0.145 3 / 0.4); } html[data-accent="violet"] { --primary: oklch(53% 0.165 286); --primary-hover: oklch(49.5% 0.165 286); --primary-active: oklch(46% 0.165 286); --primary-foreground: oklch(100% 0 0); --primary-subtle: oklch(53% 0.165 286 / 0.1); --primary-subtle-hover: oklch(53% 0.165 286 / 0.16); --primary-border: oklch(53% 0.165 286 / 0.32); --primary-text: oklch(51.5% 0.1485 286); --ring: oklch(53% 0.165 286); --selection: oklch(53% 0.165 286 / 0.22); } html[data-accent="violet"].dark { --primary: oklch(73% 0.135 286); --primary-hover: oklch(76.5% 0.126 286); --primary-active: oklch(80% 0.1057 286); --primary-foreground: oklch(20% 0.02 286); --primary-subtle: oklch(73% 0.135 286 / 0.16); --primary-subtle-hover: oklch(73% 0.135 286 / 0.24); --primary-border: oklch(73% 0.135 286 / 0.42); --primary-text: oklch(73% 0.1283 286); --ring: oklch(73% 0.135 286); --selection: oklch(73% 0.135 286 / 0.4); }`

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
