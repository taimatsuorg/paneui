/** localStorage key shared by the pre-paint script, ThemeToggle and the theme menu. Holds "light" | "dark" | "system". */
export const THEME_KEY = "theme"

/** localStorage key for the accent ("neutral" | another preset | "custom"). Applied as `data-accent` on <html>; neutral, the default, has no attribute. */
export const ACCENT_KEY = "accent"

/**
 * localStorage key for a custom accent picked on the Theming page: JSON `{ v: 2, hex, light, dark }`, where light/dark map
 * each accent role (`primary`, `primary-hover`, … `ring`) to a colour. Only read while ACCENT_KEY is "custom".
 */
export const CUSTOM_ACCENT_KEY = "accent-custom"

/** id of the <style> that carries the custom accent's `html[data-accent="custom"]` rules. */
export const CUSTOM_ACCENT_STYLE_ID = "accent-custom"

/** Same-tab broadcast when the accent changes (storage events only reach other tabs). */
export const ACCENT_CHANGE_EVENT = "qy-accent-change"

/** Accent presets. "neutral" is the base and default (its roles sit on :root and .dark, no attribute); the rest have a `html[data-accent]` block in packages/tokens/styles/globals.css. */
export const ACCENTS = ["neutral", "blue", "green", "orange", "rose", "violet"] as const

/** Mirror accent-color.ts DEFAULT_ACCENT and BASE_ACCENT (kept here so the pre-paint script has no extra import). */
const DEFAULT = "neutral"
const BASE = "neutral"

export type Accent = (typeof ACCENTS)[number]

/** Runs before paint (inlined in <head>) so the page never flashes the wrong theme or accent. */
export const themeScript = `(function(){try{var m=localStorage.getItem("${THEME_KEY}")||"system";var d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";var a=localStorage.getItem("${ACCENT_KEY}")||"${DEFAULT}";if(a!=="${BASE}"&&${JSON.stringify(ACCENTS)}.indexOf(a)>-1)e.setAttribute("data-accent",a);else if(a==="custom"){var c=JSON.parse(localStorage.getItem("${CUSTOM_ACCENT_KEY}")||"null"),v=function(o){var r="";for(var k in o)if(/^(primary|ring|selection)[a-z-]*$/.test(k)&&typeof o[k]==="string"&&!/[;{}<]/.test(o[k]))r+="--"+k+":"+o[k]+";";return r};if(c&&c.v===2&&c.light&&c.dark){var s=document.createElement("style");s.id="${CUSTOM_ACCENT_STYLE_ID}";s.textContent='html[data-accent="custom"]{'+v(c.light)+'}html[data-accent="custom"].dark{'+v(c.dark)+"}";document.head.appendChild(s);e.setAttribute("data-accent","custom")}}}catch(_){}})()`
