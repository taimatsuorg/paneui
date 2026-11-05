export const clamp01 = (x) => Math.min(1, Math.max(0, x))
const toGamma = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)
const toLinear = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
const num = (s, scale = 1) => (s.endsWith("%") ? (parseFloat(s) / 100) * scale : parseFloat(s))

/** Any theme colour → { r, g, b, a } in sRGB 0..1. */
export function parse(value) {
  const v = value.trim().toLowerCase()
  if (v === "transparent") return { r: 0, g: 0, b: 0, a: 0 }
  if (v.startsWith("#")) {
    let h = v.slice(1)
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("")
    const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 }
  }
  const fn = /^([a-z-]+)\((.*)\)$/.exec(v)
  if (!fn) throw new Error(`unsupported colour ${value}`)
  const [body, alphaPart] = fn[2].split("/").map((s) => s.trim())
  const a = alphaPart === undefined ? 1 : num(alphaPart)
  const parts = body.split(/[\s,]+/).filter(Boolean)
  if (fn[1] === "rgb" || fn[1] === "rgba") {
    const [r, g, b] = parts.slice(0, 3).map((p) => (p.endsWith("%") ? num(p) : parseFloat(p) / 255))
    return { r, g, b, a: parts[3] !== undefined ? num(parts[3]) : a }
  }
  if (fn[1] === "oklch") {
    const L = num(parts[0])
    const C = num(parts[1], 0.4)
    const h = ((parseFloat(parts[2]) || 0) * Math.PI) / 180
    const A = C * Math.cos(h)
    const B = C * Math.sin(h)
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
    const lin = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ]
    const [r, g, b] = lin.map((x) => toGamma(clamp01(x)))
    return { r, g, b, a }
  }
  if (fn[1] === "color" && parts[0] === "display-p3") {
    const [pr, pg, pb] = parts.slice(1, 4).map((p) => toLinear(num(p)))
    // linear Display P3 → linear sRGB
    const lin = [
      1.2249401 * pr - 0.2249404 * pg + 0 * pb,
      -0.0420569 * pr + 1.0420571 * pg + 0 * pb,
      -0.0196376 * pr - 0.0786361 * pg + 1.0982735 * pb,
    ]
    const [r, g, b] = lin.map((x) => toGamma(clamp01(x)))
    return { r, g, b, a }
  }
  throw new Error(`unsupported colour ${value}`)
}
