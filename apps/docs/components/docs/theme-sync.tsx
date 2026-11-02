"use client"

import * as React from "react"

import { BASE_ACCENT, customAccentStyle } from "./accent-color"
import { readAccentState, readCustomStyle, syncCustomStyle } from "./accent-store"
import { applyRadius, readRadiusState } from "./radius-store"
import { applyStyle, DEFAULT_STYLE, readStyle } from "./style-store"
import {
  ACCENT_CHANGE_EVENT,
  ACCENT_KEY,
  CUSTOM_ACCENT_KEY,
  CUSTOM_RADIUS_KEY,
  RADIUS_CHANGE_EVENT,
  RADIUS_KEY,
  STYLE_CHANGE_EVENT,
  STYLE_KEY,
  THEME_KEY,
} from "./theme-script"

/** Mirrors THEME_CHANGE_EVENT in the theme toggle (fired once a light/dark switch is done). */
const THEME_CHANGE_EVENT = "theme-change"

/**
 * Theme state carried on <html>: the `dark` class, `color-scheme` and `data-accent`,
 * plus the custom accent's <style> text when `data-accent` is "custom", and `data-radius` with
 * the inline `--radius` a custom radius sets, and `data-style`.
 */
export type RootTheme = {
  dark: boolean
  accent: string | null
  custom?: string | null
  radius?: string | null
  radiusValue?: string | null
  style?: string | null
}

export const readRootTheme = (root: HTMLElement): RootTheme => {
  const accent = root.getAttribute("data-accent")
  return {
    dark: root.classList.contains("dark"),
    accent,
    custom: accent === "custom" ? readCustomStyle(root.ownerDocument) : null,
    radius: root.getAttribute("data-radius"),
    radiusValue: root.style.getPropertyValue("--radius") || null,
    style: root.getAttribute("data-style"),
  }
}

/**
 * Apply theme state to a document's <html> with transitions muted for the swap,
 * so an embedded or background page snaps to the new colours instead of easing.
 */
export function applyRootTheme(doc: Document, { dark, accent, custom = null, radius = null, radiusValue = null, style = null }: RootTheme) {
  const root = doc.documentElement
  applyStyle(root, style)
  // Radius needs no transition muting (nothing animates border-radius on a swap).
  if (root.getAttribute("data-radius") !== radius || (root.style.getPropertyValue("--radius") || null) !== radiusValue) applyRadius(root, radius, radiusValue)
  // The custom accent's colours live in a <style>, so they can change while data-accent stays "custom".
  const styleChanged = syncCustomStyle(doc, accent === "custom" ? custom : null)
  if (!styleChanged && root.classList.contains("dark") === dark && root.getAttribute("data-accent") === accent) return
  const mute = doc.createElement("style")
  mute.textContent = "*,*::before,*::after{transition:none!important}"
  doc.head.appendChild(mute)
  root.classList.toggle("dark", dark)
  root.style.colorScheme = dark ? "dark" : "light"
  if (accent) root.setAttribute("data-accent", accent)
  else root.removeAttribute("data-accent")
  const win = doc.defaultView
  if (!win) return mute.remove()
  // No forced recalc here: the mute and the flip share the frame's one recalc. Lift the mute after
  // the toggle's reveal has played, so its recalc never lands inside the animation.
  win.setTimeout(() => mute.remove(), 700)
}

/** Theme state as stored in localStorage (what the pre-paint script reads). */
function readStoredTheme(): RootTheme {
  let mode: string | null = null
  try {
    mode = localStorage.getItem(THEME_KEY)
  } catch {
    // storage can be unavailable (private mode, sandboxed iframes)
  }
  const m = mode ?? "system"
  const dark = m === "dark" || (m === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
  const { accent, custom } = readAccentState()
  const r = readRadiusState()
  const s = readStyle()
  const style = s === DEFAULT_STYLE ? null : s
  const radius = r.radius === "custom" && r.custom != null ? { radius: "custom", radiusValue: `${r.custom}rem` } : { radius: r.radius === "default" ? null : r.radius, radiusValue: null }
  if (accent === "custom" && custom) return { dark, accent, custom: customAccentStyle(custom), style, ...radius }
  return { dark, accent: accent === BASE_ACCENT ? null : accent, style, ...radius }
}

/**
 * Keeps a chrome-less page (the /templates/* routes) in step with theme and
 * accent changes made elsewhere: another tab, or the docs page embedding it,
 * via `storage` events, plus OS theme flips while in "system" mode.
 */
export function ThemeSync() {
  React.useEffect(() => {
    const sync = () => applyRootTheme(document, readStoredTheme())
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === THEME_KEY || e.key === ACCENT_KEY || e.key === CUSTOM_ACCENT_KEY || e.key === RADIUS_KEY || e.key === CUSTOM_RADIUS_KEY || e.key === STYLE_KEY) sync()
    }
    const mq = matchMedia("(prefers-color-scheme: dark)")
    window.addEventListener("storage", onStorage)
    mq.addEventListener("change", sync)
    return () => {
      window.removeEventListener("storage", onStorage)
      mq.removeEventListener("change", sync)
    }
  }, [])
  return null
}

/**
 * Keeps a same-origin preview iframe in the docs page's theme: copies the `dark` class, accent,
 * custom accent <style>, radius and style from this page's <html> into the frame whenever any of them
 * change (attribute changes, the custom accent's <style> text, and the same-tab change events),
 * and once more on every load. Returns the sync function for the iframe's `onLoad`.
 */
export function useFrameThemeSync(frameRef: React.RefObject<HTMLIFrameElement | null>, enabled = true) {
  const sync = React.useCallback(() => {
    try {
      const doc = frameRef.current?.contentDocument
      // about:blank before the frame navigates: the real page applies the stored theme before paint
      if (!doc?.documentElement || !doc.head || doc.URL === "about:blank") return
      applyRootTheme(doc, readRootTheme(document.documentElement))
    } catch {
      // cross-origin frame: it follows via storage events instead (ThemeSync)
    }
  }, [frameRef])

  React.useEffect(() => {
    if (!enabled) return
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-accent", "data-radius", "data-style", "style"] })
    mo.observe(document.head, { childList: true, subtree: true, characterData: true })
    const events = [ACCENT_CHANGE_EVENT, RADIUS_CHANGE_EVENT, STYLE_CHANGE_EVENT, THEME_CHANGE_EVENT, "storage"]
    for (const e of events) window.addEventListener(e, sync)
    return () => {
      mo.disconnect()
      for (const e of events) window.removeEventListener(e, sync)
    }
  }, [enabled, sync])

  return sync
}
