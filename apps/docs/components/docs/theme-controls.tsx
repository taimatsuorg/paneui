"use client"

import { useT } from "@/lib/site-locale"
import { siteCopy } from "@/lib/site-copy"

import * as React from "react"

import { ChevronDownIcon, MonitorIcon, MoonIcon, SunIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import { Menu, MenuContent, MenuGroup, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@paneui/ui/components/menu"
import { THEME_CHANGE_EVENT, ThemeToggle, useThemeToggle, type ThemeChangeDetail } from "@paneui/ui/components/theme-toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@paneui/ui/components/tooltip"

import { DEFAULT_ACCENT, PRESET_LABELS, PRESET_THEMES, type PresetAccent } from "./accent-color"
import { setAccent, useAccentState, type AccentChoice } from "./accent-store"
import { THEME_KEY } from "./theme-script"

type Mode = "light" | "dark" | "system"
const isMode = (v: unknown): v is Mode => v === "light" || v === "dark" || v === "system"
const systemDark = () => matchMedia("(prefers-color-scheme: dark)").matches

function store(mode: Mode) {
  try {
    localStorage.setItem(THEME_KEY, mode)
  } catch {
    // storage can be unavailable (private mode, sandboxed iframes)
  }
}

/** Instant swap (no reveal) for changes the user did not click: OS theme flips, other tabs. */
function applyInstant(dark: boolean) {
  const root = document.documentElement
  if (root.classList.contains("dark") === dark) return
  const mute = document.createElement("style")
  mute.textContent = "*,*::before,*::after{transition:none!important}"
  document.head.appendChild(mute)
  root.classList.toggle("dark", dark)
  root.style.colorScheme = dark ? "dark" : "light"
  void window.getComputedStyle(root).opacity
  requestAnimationFrame(() => requestAnimationFrame(() => mute.remove()))
}

/** Menu swatches: each preset's light primary (neutral follows the current foreground); neutral is the default. Values from accent-color.ts. */
const accentOptions: { accent: PresetAccent; label: string; swatch: string }[] = (Object.keys(PRESET_LABELS) as PresetAccent[]).map(
  (a) => ({ accent: a, label: PRESET_LABELS[a], swatch: a === "neutral" ? "var(--foreground)" : PRESET_THEMES[a].light.primary })
)

const isChoice = (v: unknown, hasCustom: boolean): v is AccentChoice =>
  (v === "custom" && hasCustom) || accentOptions.some((o) => o.accent === v)

/**
 * Accent picker: swaps `data-accent` on <html> (presets live in packages/tokens/styles/globals.css; a custom colour
 * picked on the Theming page rides in its own <style>), persists localStorage["accent"] for the
 * pre-paint script and syncs other tabs and the Theming page.
 */
export function AccentControl() {
  const t = useT()
  const label = (text: string) => t(siteCopy(text))
  const { accent, custom } = useAccentState()
  const accentLabel = label(accent === "custom" ? "Custom" : PRESET_LABELS[accent])

  return (
    <Menu>
      <Tooltip>
        <TooltipTrigger
          render={
            <MenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`${label("Accent")}: ${accentLabel}`} />} />
          }
        >
          <span aria-hidden className="size-3.5 rounded-full bg-primary shadow-chip" />
        </TooltipTrigger>
        <TooltipContent side="bottom">{label("Accent")}: {label(accent === "custom" ? "Custom" : PRESET_LABELS[accent])}</TooltipContent>
      </Tooltip>
      <MenuContent align="end" className="min-w-40">
        <MenuGroup>
          <MenuLabel>{label("Accent")}</MenuLabel>
          <MenuRadioGroup value={accent} onValueChange={(v) => isChoice(v, !!custom) && setAccent(v)}>
            {accentOptions.map(({ accent: a, label: l, swatch }) => (
              <MenuRadioItem key={a} value={a} closeOnClick>
                <span
                  aria-hidden
                  className="size-3.5 shrink-0 rounded-full bg-(--swatch) shadow-chip"
                  style={{ "--swatch": swatch } as React.CSSProperties}
                />
                {label(l)}
                {a === DEFAULT_ACCENT ? <span className="ms-auto text-ui-xs text-muted-foreground">{label("Default")}</span> : null}
              </MenuRadioItem>
            ))}
            {custom ? (
              <MenuRadioItem value="custom" closeOnClick>
                <span
                  aria-hidden
                  className="size-3.5 shrink-0 rounded-full bg-(--swatch) shadow-chip"
                  style={{ "--swatch": custom.light.primary } as React.CSSProperties}
                />
                {label("Custom")}
              </MenuRadioItem>
            ) : null}
          </MenuRadioGroup>
        </MenuGroup>
      </MenuContent>
    </Menu>
  )
}

const options: { mode: Mode; label: string; icon: typeof SunIcon }[] = [
  { mode: "light", label: "Light", icon: SunIcon },
  { mode: "dark", label: "Dark", icon: MoonIcon },
  { mode: "system", label: "System", icon: MonitorIcon },
]

/**
 * The registry ThemeToggle (circular View Transition reveal) plus a small menu
 * that adds the third "System" mode. Everything shares localStorage["theme"]
 * with the pre-paint script in <head>.
 */
export function ThemeControls({ className }: { className?: string }) {
  const t = useT()
  const label = (text: string) => t(siteCopy(text))
  const [mode, setMode] = React.useState<Mode | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  // Set while a "System" choice is animating; the toggle hook writes light/dark, we restore "system" after.
  const pendingSystem = React.useRef(false)

  const { setTheme } = useThemeToggle({
    storageKey: THEME_KEY,
    onThemeChange: () => {
      if (!pendingSystem.current) return
      pendingSystem.current = false
      store("system")
      setMode("system")
    },
  })

  React.useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY)
    setMode(isMode(stored) ? stored : "system")
    // ThemeToggle (header or a demo) changed the theme: that is an explicit light/dark pick.
    const onThemeChange = (e: Event) => {
      const detail = (e as CustomEvent<ThemeChangeDetail>).detail
      if (detail?.storageKey && detail.storageKey !== THEME_KEY) return
      if (isMode(detail?.theme)) setMode(detail.theme)
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_KEY) return
      const m = isMode(e.newValue) ? e.newValue : "system"
      setMode(m)
      applyInstant(m === "dark" || (m === "system" && systemDark()))
    }
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  React.useEffect(() => {
    if (mode !== "system") return
    const mq = matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => applyInstant(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [mode])

  const choose = (next: Mode) => {
    const rect = triggerRef.current?.getBoundingClientRect()
    const origin = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined
    const dark = next === "dark" || (next === "system" && systemDark())
    const current = document.documentElement.classList.contains("dark")
    pendingSystem.current = false
    if (dark === current) {
      // nothing to repaint, only the stored preference changes
      store(next)
      setMode(next)
      return
    }
    if (next === "system") pendingSystem.current = true
    else setMode(next)
    setTheme(dark ? "dark" : "light", { origin })
  }

  const ActiveIcon = options.find((o) => o.mode === mode)?.icon ?? MonitorIcon

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <AccentControl />
      <ThemeToggle variant="ghost" storageKey={THEME_KEY} />
      <Menu>
        <Tooltip>
          <TooltipTrigger
            render={
              <MenuTrigger
                ref={triggerRef}
                // eslint-disable-next-line shadcn/no-restyle -- compact 28px-wide trigger beside the GitHub icon (existing header design)
                render={<Button variant="ghost" size="icon-sm" aria-label={label("Theme")} className="w-7 text-muted-foreground" />}
              />
            }
          >
            <ChevronDownIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <ActiveIcon size={13} />
            {label("Theme")}: {label(options.find((o) => o.mode === mode)?.label ?? "System")}
          </TooltipContent>
        </Tooltip>
        <MenuContent align="end" className="min-w-40">
          <MenuGroup>
            <MenuLabel>{label("Theme")}</MenuLabel>
            <MenuRadioGroup value={mode ?? "system"} onValueChange={(v) => isMode(v) && choose(v)}>
              {options.map(({ mode: m, label: optionLabel, icon: Icon }) => (
                <MenuRadioItem key={m} value={m} closeOnClick>
                  <Icon />
                  {label(optionLabel)}
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </MenuGroup>
        </MenuContent>
      </Menu>
    </div>
  )
}
