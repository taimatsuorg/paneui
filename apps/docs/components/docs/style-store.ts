"use client"

import * as React from "react"

import { STYLE_CHANGE_EVENT, STYLE_KEY, STYLES, type StylePreset } from "./theme-script"

export const DEFAULT_STYLE: StylePreset = "studio"
export const STYLE_LABELS: Record<StylePreset, string> = { studio: "Studio" }

const isStyle = (v: unknown): v is StylePreset => typeof v === "string" && (STYLES as readonly string[]).includes(v)

export function readStyle(): StylePreset {
  try {
    const v = localStorage.getItem(STYLE_KEY)
    return isStyle(v) ? v : DEFAULT_STYLE
  } catch {
    // storage can be unavailable (private mode, sandboxed iframes)
    return DEFAULT_STYLE
  }
}

/** Apply a style to a document's <html> as `data-style`. Studio is the only style, so anything else falls back to it. Colours swap at once, without transitions. */
export function applyStyle(root: HTMLElement, style: string | null) {
  const next: string = isStyle(style) ? style : DEFAULT_STYLE
  if (root.getAttribute("data-style") === next) return
  const doc = root.ownerDocument
  const mute = doc.createElement("style")
  mute.textContent = "*,*::before,*::after{transition:none!important}"
  doc.head.appendChild(mute)
  root.setAttribute("data-style", next)
  const win = doc.defaultView
  if (!win) return mute.remove()
  void win.getComputedStyle(root).opacity
  win.requestAnimationFrame(() => win.requestAnimationFrame(() => mute.remove()))
}

/** Choose a style: applies it, persists it for the pre-paint script and template pages, and tells every control on the page. */
export function setStyle(style: StylePreset) {
  applyStyle(document.documentElement, style)
  try {
    localStorage.setItem(STYLE_KEY, style)
  } catch {
    // storage can be unavailable (private mode, sandboxed iframes)
  }
  window.dispatchEvent(new CustomEvent<StylePreset>(STYLE_CHANGE_EVENT, { detail: style }))
}

/** Current style, kept in step with other controls on the page and other tabs. */
export function useStyle(): StylePreset {
  const [style, set] = React.useState<StylePreset>(DEFAULT_STYLE)
  React.useEffect(() => {
    set(readStyle())
    const onChange = (e: Event) => set((e as CustomEvent<StylePreset>).detail ?? readStyle())
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== STYLE_KEY) return
      const next = readStyle()
      applyStyle(document.documentElement, next)
      set(next)
    }
    window.addEventListener(STYLE_CHANGE_EVENT, onChange)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener(STYLE_CHANGE_EVENT, onChange)
      window.removeEventListener("storage", onStorage)
    }
  }, [])
  return style
}
