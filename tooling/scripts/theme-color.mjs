/**
 * OKLCH and WCAG helpers shared by the default theme generator (`gen-theme.mjs`).
 */

function toGamma(x) {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
}

function toLinear(x) {
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}

export function oklchLinear(L, C, H) {
  const rad = (H * Math.PI) / 180
  const a = C * Math.cos(rad)
  const b = C * Math.sin(rad)
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
}

export function inGamut(L, C, H) {
  return oklchLinear(L, C, H).every((v) => v >= -0.0005 && v <= 1.0005)
}

/** Largest chroma up to C that stays inside sRGB at this lightness and hue. */
export function fit(L, C, H) {
  if (inGamut(L, C, H)) return C
  let lo = 0.0
  let hi = C
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(L, mid, H)) lo = mid
    else hi = mid
  }
  return lo
}

/** sRGB 0..1 (gamma encoded), clipped. */
export function rgb(L, C, H) {
  return oklchLinear(L, C, H).map((v) => Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, v))))))
}

export function hexToOklch(h) {
  const r = toLinear(parseInt(h.slice(1, 3), 16) / 255)
  const g = toLinear(parseInt(h.slice(3, 5), 16) / 255)
  const b = toLinear(parseInt(h.slice(5, 7), 16) / 255)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const rawHue = (Math.atan2(B, A) * 180) / Math.PI
  return [L, Math.hypot(A, B), ((rawHue % 360) + 360) % 360]
}

export function over(top, alpha, under) {
  return [
    top[0] * alpha + under[0] * (1 - alpha),
    top[1] * alpha + under[1] * (1 - alpha),
    top[2] * alpha + under[2] * (1 - alpha),
  ]
}

export function luminance(c) {
  const [r, g, b] = c.map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

function fmtNum(n, d) {
  const factor = 10 ** d
  const v = Math.round(n * factor) / factor
  return Object.is(v, -0) ? "0" : String(v)
}

/** An OKLCH colour with optional alpha; chroma is fitted to sRGB on creation. */
export class Ok {
  constructor(L, C = 0.0, H = 0.0, a = 1.0) {
    this.L = L
    this.H = H
    this.a = a
    this.C = C ? fit(L, C, H) : 0.0
  }

  rgb(under = null) {
    const c = rgb(this.L, this.C, this.H)
    return this.a < 1 && under !== null ? over(c, this.a, under) : c
  }

  css() {
    const ch = this.C >= 0.0005 ? fmtNum(this.C, 4) : "0"
    const hue = this.C >= 0.0005 ? fmtNum(this.H, 2) : "0"
    const base = `oklch(${fmtNum(this.L * 100, 2)}% ${ch} ${hue}`
    return this.a < 1 ? `${base} / ${fmtNum(this.a, 3)})` : `${base})`
  }

  with({ L = this.L, C = this.C, H = this.H, a = this.a } = {}) {
    return new Ok(L, C, H, a)
  }

  toString() {
    return this.css()
  }
}

/** Contrast of fg on bg; alpha colours are composited (bg over the page, fg over bg). */
export function ratio(fg, bg, page = null) {
  const pageRgb = page !== null ? page.rgb() : [1, 1, 1]
  const b = bg.a < 1 ? bg.rgb(pageRgb) : bg.rgb()
  const f = fg.a < 1 ? fg.rgb(b) : fg.rgb()
  return contrast(f, b)
}

/** Lightness in [lo, hi] closest to the preferred end for which ok(make(L)) holds (scan in 0.5 steps). */
export function solveL(make, ok, lo = 0.0, hi = 1.0, prefer = "high") {
  const count = Math.trunc((hi - lo) / 0.005) + 1
  const steps = Array.from({ length: count }, (_, i) => Math.round((lo + i * 0.005) * 1e4) / 1e4)
  if (prefer === "high") steps.reverse()
  for (const L of steps) {
    if (ok(make(L))) return L
  }
  throw new Error("no lightness satisfies the constraint")
}

/** Smallest alpha (0.01 steps) for which ok(make(a)) holds. */
export function solveAlpha(make, ok, lo = 0.0, hi = 1.0) {
  let a = lo
  while (a <= hi + 1e-9) {
    const rounded = Math.round(a * 1000) / 1000
    if (ok(make(rounded))) return rounded
    a += 0.01
  }
  throw new Error("no alpha satisfies the constraint")
}
