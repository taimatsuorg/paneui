"use client"

import * as React from "react"

import { ACCENT_VARS, BASE_ACCENT, customAccentStyle, DEFAULT_ACCENT, deriveAccent, type AccentTheme, type PresetAccent } from "./accent-color"
import { ACCENT_CHANGE_EVENT, ACCENT_KEY, ACCENTS, CUSTOM_ACCENT_KEY, CUSTOM_ACCENT_STYLE_ID } from "./theme-script"

/** A custom accent as stored in localStorage[CUSTOM_ACCENT_KEY]. `v: 2` is the role format (roles are re-derived from `hex` when one is missing). */
export type CustomAccent = AccentTheme & { hex: string; v: 2 }
export type AccentChoice = PresetAccent | "custom"
export type AccentState = { accent: AccentChoice; custom: CustomAccent | null }

const isPreset = (v: unknown): v is PresetAccent => typeof v === "string" && (ACCENTS as readonly string[]).includes(v)
const isVars = (v: unknown) => {
  const o = v as Record<string, unknown> | null
  return !!o && ACCENT_VARS.every((k) => typeof o[k] === "string")
}

export function parseCustomAccent(raw: string | null): CustomAccent | null {
  if (!raw) return null
  try {
    const v = JSON.parse(raw) as Partial<CustomAccent>
    // Accents saved in the earlier three-variable format are dropped (the page falls back to the default).
    if (v.v !== 2 || typeof v.hex !== "string") return null
    // Roles saved before a role was added are derived again from the picked colour.
    if (isVars(v.light) && isVars(v.dark)) return { v: 2, hex: v.hex, light: v.light as CustomAccent["light"], dark: v.dark as CustomAccent["dark"] }
    const theme = deriveAccent(v.hex)
    return theme ? { v: 2, hex: v.hex, ...theme } : null
  } catch {
    return null
  }
}

/** The stored accent; "custom" falls back to the default (blue) when its colours are missing or malformed. */
export function readAccentState(): AccentState {
  let accent: string | null = null
  let custom: CustomAccent | null = null
  try {
    accent = localStorage.getItem(ACCENT_KEY)
    custom = parseCustomAccent(localStorage.getItem(CUSTOM_ACCENT_KEY))
  } catch {
    // storage can be unavailable (private mode, sandboxed iframes)
  }
  if (accent === "custom") return custom ? { accent: "custom", custom } : { accent: DEFAULT_ACCENT, custom: null }
  return { accent: isPreset(accent) ? accent : DEFAULT_ACCENT, custom }
}

/** Write (or remove) the custom accent <style> in a document. Returns true when its text changed. */
export function syncCustomStyle(doc: Document, css: string | null): boolean {
  const existing = doc.getElementById(CUSTOM_ACCENT_STYLE_ID)
  if (!css) {
    existing?.remove()
    return !!existing
  }
  if (existing?.textContent === css) return false
  const el = existing ?? doc.createElement("style")
  el.id = CUSTOM_ACCENT_STYLE_ID
  el.textContent = css
  if (!existing) doc.head.appendChild(el)
  return true
}

/** The custom accent <style> text of a document, if any. */
export const readCustomStyle = (doc: Document) => doc.getElementById(CUSTOM_ACCENT_STYLE_ID)?.textContent ?? null

/** Apply an accent to this document's <html>. Re-sets `data-accent` so observers (template iframes) re-sync on colour edits. */
function applyToDocument({ accent, custom }: AccentState) {
  const root = document.documentElement
  if (accent === "custom" && custom) {
    syncCustomStyle(document, customAccentStyle(custom))
    root.setAttribute("data-accent", "custom")
  } else {
    if (!custom) syncCustomStyle(document, null)
    if (accent === BASE_ACCENT) root.removeAttribute("data-accent")
    else root.setAttribute("data-accent", accent)
  }
}

/**
 * Choose an accent: applies it, persists it for the pre-paint script and template pages,
 * and tells every control on this page. A custom colour is kept even while a preset is chosen,
 * so switching back restores it.
 */
export function setAccent(accent: AccentChoice, custom?: CustomAccent | null) {
  const current = readAccentState()
  const nextCustom = custom === undefined ? current.custom : custom
  const state: AccentState = { accent: accent === "custom" && !nextCustom ? DEFAULT_ACCENT : accent, custom: nextCustom }
  applyToDocument(state)
  try {
    localStorage.setItem(ACCENT_KEY, state.accent)
    if (nextCustom) localStorage.setItem(CUSTOM_ACCENT_KEY, JSON.stringify(nextCustom))
    else localStorage.removeItem(CUSTOM_ACCENT_KEY)
  } catch {
    // storage can be unavailable (private mode, sandboxed iframes)
  }
  window.dispatchEvent(new CustomEvent<AccentState>(ACCENT_CHANGE_EVENT, { detail: state }))
}

/** Pick a custom colour (hex): derives its light and dark roles and applies them. */
export function setCustomAccent(hex: string) {
  const theme = deriveAccent(hex)
  if (theme) setAccent("custom", { v: 2, hex, ...theme })
}

/** Current accent, kept in step with other controls on the page and other tabs. */
export function useAccentState(): AccentState {
  const [state, setState] = React.useState<AccentState>({ accent: DEFAULT_ACCENT, custom: null })
  React.useEffect(() => {
    setState(readAccentState())
    const onChange = (e: Event) => setState((e as CustomEvent<AccentState>).detail ?? readAccentState())
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== ACCENT_KEY && e.key !== CUSTOM_ACCENT_KEY) return
      const next = readAccentState()
      applyToDocument(next)
      setState(next)
    }
    window.addEventListener(ACCENT_CHANGE_EVENT, onChange)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener(ACCENT_CHANGE_EVENT, onChange)
      window.removeEventListener("storage", onStorage)
    }
  }, [])
  return state
}
