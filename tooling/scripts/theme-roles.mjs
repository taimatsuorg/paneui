/**
 * Role derivations for the default theme (`gen-theme.mjs`).
 *
 * Every rule here is a contrast rule, so every accent preset and status meets the same floor:
 * - a solid fill and its foreground: 4.5:1 (hover and active move away from the foreground, never towards it);
 * - a `-text` role: 4.5:1 on the page, the card and its own subtle fill (aimed at 5:1 for headroom);
 * - tag text: 4.5:1 on the page, its highlight background and its pill fill;
 * - the focus ring and the control edge: 3:1 on the page.
 */
import { Ok, ratio, solveL } from "./theme-color.mjs"

export const TEXT_TARGET = 5.0
export const SOLID_TARGET = 4.6

/** The solid nearest L_start (moving away from fg) whose fg reaches the target. */
export function solidFor(fg, H, C, LStart, target = SOLID_TARGET) {
  const lightFg = fg.L > 0.5
  if (ratio(fg, new Ok(LStart, C, H)) >= target) return new Ok(LStart, C, H)
  const L = lightFg
    ? solveL((x) => new Ok(x, C, H), (s) => ratio(fg, s) >= target, 0, LStart, "high")
    : solveL((x) => new Ok(x, C, H), (s) => ratio(fg, s) >= target, LStart, 1, "low")
  return new Ok(L, C, H)
}

/** Hover and active: further from the foreground (darker under white text, lighter under dark text). */
export function states(solid, fg, step = 0.035) {
  const d = fg.L > 0.5 ? -step : step
  return [
    solid.with({ L: Math.max(0, Math.min(1, solid.L + d)) }),
    solid.with({ L: Math.max(0, Math.min(1, solid.L + 2 * d)) }),
  ]
}

/** Accent or status text: the hue, readable on every page surface and on its subtle fill. */
export function textRole(H, C, pages, subtle, mode, target = TEXT_TARGET, LStart = null) {
  const ok = (t) => pages.every((p) => ratio(t, p) >= target) && ratio(t, subtle, pages[0]) >= target - 0.4
  if (mode === "light") {
    return new Ok(solveL((L) => new Ok(L, C, H), ok, 0.2, LStart || 0.62, "high"), C, H)
  }
  return new Ok(solveL((L) => new Ok(L, C, H), ok, LStart || 0.72, 0.95, "low"), C, H)
}

/** Focus ring: the solid when it clears 3.15:1 on every tested surface, otherwise the text role. */
export function ringRole(solid, text, page, pages = null) {
  const check = pages !== null ? pages : [page]
  return check.every((p) => ratio(solid, p) >= 3.15) ? solid : text
}

/** The ten accent roles of one preset in one mode. */
export function accentRoles(solid, fg, page, pages, mode, { alphas = null, textChroma = 0.9, textStart = null } = {}) {
  const a =
    alphas ??
    (mode === "light"
      ? { subtle: 0.1, subtleHover: 0.16, border: 0.32, selection: 0.22 }
      : { subtle: 0.16, subtleHover: 0.24, border: 0.42, selection: 0.4 })
  const [hover, active] = states(solid, fg)
  const subtle = solid.with({ a: a.subtle })
  const text = textRole(solid.H, solid.C * textChroma, pages, subtle, mode, TEXT_TARGET, textStart)
  return {
    primary: solid,
    "primary-hover": hover,
    "primary-active": active,
    "primary-foreground": fg,
    "primary-subtle": subtle,
    "primary-subtle-hover": solid.with({ a: a.subtleHover }),
    "primary-border": solid.with({ a: a.border }),
    "primary-text": text,
    ring: ringRole(solid, text, page, pages),
    selection: solid.with({ a: a.selection }),
  }
}

export function statusRoles(name, solid, fg, pages, mode, { alphas = null, textChroma = 0.9, textStart = null } = {}) {
  const a = alphas ?? (mode === "light" ? { subtle: 0.1, border: 0.3 } : { subtle: 0.16, border: 0.4 })
  const [hover] = states(solid, fg)
  const subtle = solid.with({ a: a.subtle })
  return {
    [name]: solid,
    [`${name}-hover`]: hover,
    [`${name}-foreground`]: fg,
    [`${name}-subtle`]: subtle,
    [`${name}-border`]: solid.with({ a: a.border }),
    [`${name}-text`]: textRole(solid.H, solid.C * textChroma, pages, subtle, mode, TEXT_TARGET, textStart),
  }
}

// Tag colours: hue and the chroma of their text. "default" is the plain text colour on an ink pill.
export const TAG_HUES = {
  gray: [null, 0.006],
  brown: [48, 0.07],
  orange: [55, 0.15],
  yellow: [85, 0.13],
  green: [155, 0.1],
  blue: [245, 0.12],
  purple: [305, 0.14],
  pink: [350, 0.15],
  red: [25, 0.17],
}
export const TAGS = ["default", ...Object.keys(TAG_HUES)]

/** Text, highlight background (bg) and pill fill per tag colour; text reaches 4.5:1 on all three. */
export function tagRoles(mode, pages, foreground, inkFill, grayHue, grayChroma = null, lightBgL = 0.965, lightFillL = 0.93) {
  const out = {
    "tag-default-text": foreground,
    "tag-default-bg": "transparent",
    "tag-default-fill": inkFill,
  }
  for (const [name, [rawH, rawC]] of Object.entries(TAG_HUES)) {
    const h = name === "gray" ? grayHue : rawH
    const c = name === "gray" && grayChroma !== null ? grayChroma : rawC
    let bg, fill, start
    if (mode === "light") {
      bg = new Ok(lightBgL, Math.min(c * 0.18, 0.03), h)
      fill = new Ok(lightFillL, Math.min(c * 0.35, 0.06), h)
      start = name === "orange" || name === "yellow" ? 0.47 : 0.49
    } else {
      bg = new Ok(0.27, Math.min(c * 0.2, 0.03), h)
      fill = new Ok(0.36, Math.min(c * 0.55, 0.085), h)
      start = 0.77
    }
    const tc = mode === "light" ? c : c * 0.8
    const ok = (t) => [...pages, bg, fill].every((s) => ratio(t, s) >= 4.6)
    const L =
      mode === "light"
        ? solveL((x) => new Ok(x, tc, h), ok, 0.2, start, "high")
        : solveL((x) => new Ok(x, tc, h), ok, start, 0.97, "low")
    out[`tag-${name}-text`] = new Ok(L, tc, h)
    out[`tag-${name}-bg`] = bg
    out[`tag-${name}-fill`] = fill
  }
  return out
}
