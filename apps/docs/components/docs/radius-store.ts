"use client"

import * as React from "react"

import { CUSTOM_RADIUS_KEY, RADII, RADIUS_CHANGE_EVENT, RADIUS_KEY, type RadiusPreset } from "./theme-script"

export type RadiusChoice = RadiusPreset | "custom"
/** `custom` is in rem; it is kept while a preset is chosen, so switching back restores it. */
export type RadiusState = { radius: RadiusChoice; custom: number | null }

/** Each preset's `--radius` (mirrors the `html[data-radius]` blocks in packages/tokens/styles/globals.css). */
export const RADIUS_VALUES: Record<RadiusPreset, number> = { none: 0, sm: 0.25, default: 0.5, lg: 0.6875, xl: 0.875 }
export const RADIUS_LABELS: Record<RadiusPreset, string> = { none: "None", sm: "Small", default: "Default", lg: "Large", xl: "Extra large" }
export const DEFAULT_RADIUS: RadiusPreset = "default"
/** Bounds of the custom slider, in rem. 1rem matches --radius-max in packages/tokens/styles/globals.css: no token goes past 16px. */
export const RADIUS_MIN = 0
export const RADIUS_MAX = 1

const isPreset = (v: unknown): v is RadiusPreset => typeof v === "string" && (RADII as readonly string[]).includes(v)

export function parseCustomRadius(raw: string | null): number | null {
  if (raw == null) return null
  const n = Number.parseFloat(raw)
  // Values saved before the cap (up to 1.5rem) come back as the new maximum.
  return Number.isFinite(n) && n >= RADIUS_MIN && n <= 2 ? Math.min(n, RADIUS_MAX) : null
}

export function readRadiusState(): RadiusState {
  let radius: string | null = null
  let custom: number | null = null
  try {
    radius = localStorage.getItem(RADIUS_KEY)
    custom = parseCustomRadius(localStorage.getItem(CUSTOM_RADIUS_KEY))
  } catch {
    // storage can be unavailable (private mode, sandboxed iframes)
  }
  if (radius === "custom") return custom != null ? { radius: "custom", custom } : { radius: DEFAULT_RADIUS, custom: null }
  return { radius: isPreset(radius) ? radius : DEFAULT_RADIUS, custom }
}

/** The `--radius` a state resolves to, in rem. */
export const radiusValue = ({ radius, custom }: RadiusState) => (radius === "custom" && custom != null ? custom : RADIUS_VALUES[radius === "custom" ? DEFAULT_RADIUS : radius])

/** Apply a radius to a document's <html>: presets as `data-radius`, a custom value inline. */
export function applyRadius(root: HTMLElement, attr: string | null, inline: string | null) {
  if (attr) root.setAttribute("data-radius", attr)
  else root.removeAttribute("data-radius")
  if (inline) root.style.setProperty("--radius", inline)
  else root.style.removeProperty("--radius")
}

function applyToDocument(state: RadiusState) {
  const root = document.documentElement
  if (state.radius === "custom" && state.custom != null) applyRadius(root, "custom", `${state.custom}rem`)
  else applyRadius(root, state.radius === DEFAULT_RADIUS ? null : state.radius, null)
}

/** Choose a radius: applies it, persists it for the pre-paint script and template pages, and tells every control on the page. */
export function setRadius(radius: RadiusChoice, custom?: number | null) {
  const current = readRadiusState()
  const nextCustom = custom === undefined ? current.custom : custom
  const state: RadiusState = { radius: radius === "custom" && nextCustom == null ? DEFAULT_RADIUS : radius, custom: nextCustom }
  applyToDocument(state)
  try {
    localStorage.setItem(RADIUS_KEY, state.radius)
    if (nextCustom != null) localStorage.setItem(CUSTOM_RADIUS_KEY, String(nextCustom))
    else localStorage.removeItem(CUSTOM_RADIUS_KEY)
  } catch {
    // storage can be unavailable (private mode, sandboxed iframes)
  }
  window.dispatchEvent(new CustomEvent<RadiusState>(RADIUS_CHANGE_EVENT, { detail: state }))
}

/** Current radius, kept in step with other controls on the page and other tabs. */
export function useRadiusState(): RadiusState {
  const [state, setState] = React.useState<RadiusState>({ radius: DEFAULT_RADIUS, custom: null })
  React.useEffect(() => {
    setState(readRadiusState())
    const onChange = (e: Event) => setState((e as CustomEvent<RadiusState>).detail ?? readRadiusState())
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== RADIUS_KEY && e.key !== CUSTOM_RADIUS_KEY) return
      const next = readRadiusState()
      applyToDocument(next)
      setState(next)
    }
    window.addEventListener(RADIUS_CHANGE_EVENT, onChange)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener(RADIUS_CHANGE_EVENT, onChange)
      window.removeEventListener("storage", onStorage)
    }
  }, [])
  return state
}

/** CSS to paste into a project for a radius (the `--radius` override). */
export function radiusCss(rem: number, label: string) {
  return `/* PaneUI radius: ${label} */\n:root {\n  --radius: ${rem}rem;\n}\n`
}
