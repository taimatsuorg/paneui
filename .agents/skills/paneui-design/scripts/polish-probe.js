/**
 * Polish probe for any page: paste into the browser console (or run with Playwright's
 * page.evaluate) after opening the screen you want to check. It reads what the static check
 * can't see, from computed styles and layout:
 *
 *   hit-area          interactive targets under 24px (44px under a coarse pointer), counting
 *                     an absolutely positioned ::before / ::after as part of the target, that
 *                     have another target within that distance
 *   hit-overlap       two targets whose extended areas overlap while their boxes don't
 *   optical-padding   a button with an icon on one side and equal padding on both sides
 *   media-outline     images and video of 24px or more with no outline
 *   text-wrap         a heading that wraps onto more lines without text-wrap: balance / pretty
 *   tabular-nums      live numbers (role timer, status, progressbar, aria-live, <output>) in
 *                     proportional digits
 *   font-smoothing    body text not antialiased (only matters on macOS)
 *   transition-all    an element that transitions every property
 *   will-change       a hint on a property that can't be composited
 *
 * Returns the findings and prints them as a table. Inline text links and hidden elements are
 * skipped. The library's own audit runs the same function.
 */
;(() => {
  function polish({ coarse = matchMedia("(pointer: coarse)").matches } = {}) {
    const MIN = coarse ? 44 : 24
    const out = []
    const sel = (el) => {
      const slot = el.getAttribute("data-slot")
      const id = el.id ? `#${el.id}` : ""
      const label = el.getAttribute("aria-label")
      return `${el.tagName.toLowerCase()}${id}${slot ? `[data-slot=${slot}]` : ""}${label ? `[aria-label="${label.slice(0, 30)}"]` : ""}`
    }
    const shown = (el, r) => {
      if (r.width < 1 || r.height < 1) return false
      const cs = getComputedStyle(el)
      return cs.visibility !== "hidden" && cs.display !== "none" && parseFloat(cs.opacity) > 0.01
    }
    const add = (rule, el, detail) => out.push({ rule, element: sel(el), detail })

    /* Hit areas */
    const TARGETS =
      'button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=checkbox], [role=radio], [role=switch], [role=tab], [role=menuitem], [role=option], [role=slider], [tabindex="0"]'
    const boxes = []
    for (const el of document.querySelectorAll(TARGETS)) {
      const r = el.getBoundingClientRect()
      if (!shown(el, r)) continue
      if (el.closest("[inert], [aria-hidden=true]")) continue
      const cs = getComputedStyle(el)
      // Inline links inside running text are exempt (their line sets the target).
      if (el.tagName === "A" && cs.display === "inline" && el.parentElement && /\S/.test(el.parentElement.textContent.replace(el.textContent, ""))) continue
      // A control wrapped in a label takes the label's box as its target.
      const label = el.closest("label")
      let hit = { l: r.left, t: r.top, r: r.right, b: r.bottom }
      if (label && label !== el) {
        const lr = label.getBoundingClientRect()
        hit = { l: Math.min(hit.l, lr.left), t: Math.min(hit.t, lr.top), r: Math.max(hit.r, lr.right), b: Math.max(hit.b, lr.bottom) }
      }
      for (const pseudo of ["::before", "::after"]) {
        const ps = getComputedStyle(el, pseudo)
        if (ps.content === "none" || ps.display === "none" || !/absolute|fixed/.test(ps.position)) continue
        const v = (k) => (ps[k] === "auto" ? null : parseFloat(ps[k]))
        const [top, right, bottom, left] = ["top", "right", "bottom", "left"].map(v)
        const w = parseFloat(ps.width), h = parseFloat(ps.height)
        // Resolved against the element itself (the usual `relative` host).
        // Centred with a transform (top/left 50% plus a translate): sized by width and height.
        if (ps.transform !== "none" && w > 0 && h > 0) {
          hit = { l: Math.min(hit.l, r.left + (r.width - w) / 2), t: Math.min(hit.t, r.top + (r.height - h) / 2), r: Math.max(hit.r, r.left + (r.width + w) / 2), b: Math.max(hit.b, r.top + (r.height + h) / 2) }
          continue
        }
        const pl = left != null ? r.left + left : right != null ? r.right - right - w : r.left + (r.width - w) / 2
        const pt = top != null ? r.top + top : bottom != null ? r.bottom - bottom - h : r.top + (r.height - h) / 2
        const pr = right != null ? r.right - right : pl + w
        const pb = bottom != null ? r.bottom - bottom : pt + h
        hit = { l: Math.min(hit.l, pl), t: Math.min(hit.t, pt), r: Math.max(hit.r, pr), b: Math.max(hit.b, pb) }
      }
      boxes.push({ el, r, hit, small: Math.min(hit.r - hit.l, hit.b - hit.t) + 0.5 < MIN })
    }
    // An undersized target passes when a MIN-sized square centred on it reaches no other target
    // (the spacing exception), so a lone 20px switch is fine and a row of 6px dots is not.
    for (const a of boxes) {
      if (!a.small) continue
      const cx = (a.hit.l + a.hit.r) / 2, cy = (a.hit.t + a.hit.b) / 2, h = MIN / 2
      const zone = { l: Math.min(a.hit.l, cx - h), t: Math.min(a.hit.t, cy - h), r: Math.max(a.hit.r, cx + h), b: Math.max(a.hit.b, cy + h) }
      const near = boxes.find((b) => b !== a && !a.el.contains(b.el) && !b.el.contains(a.el) && b.hit.l < zone.r - 0.5 && b.hit.r > zone.l + 0.5 && b.hit.t < zone.b - 0.5 && b.hit.b > zone.t + 0.5)
      if (near) add("hit-area", a.el, `${Math.round(a.hit.r - a.hit.l)}×${Math.round(a.hit.b - a.hit.t)}px target, under ${MIN}px and within ${MIN}px of ${sel(near.el)}`)
    }
    // Overlapping extended targets (sorted sweep on x).
    boxes.sort((a, b) => a.hit.l - b.hit.l)
    for (let i = 0; i < boxes.length; i++) {
      const a = boxes[i]
      for (let j = i + 1; j < boxes.length && boxes[j].hit.l < a.hit.r; j++) {
        const b = boxes[j]
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue
        const ix = Math.min(a.hit.r, b.hit.r) - Math.max(a.hit.l, b.hit.l)
        const iy = Math.min(a.hit.b, b.hit.b) - Math.max(a.hit.t, b.hit.t)
        if (ix <= 1 || iy <= 1) continue
        const vx = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left)
        const vy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top)
        if (vx > 0 && vy > 0) continue // the boxes themselves overlap: a layout choice, not a hit-area one
        add("hit-overlap", a.el, `extended target overlaps ${sel(b.el)} by ${Math.round(ix)}×${Math.round(iy)}px`)
      }
    }

    /* Buttons with an icon on one side */
    for (const el of document.querySelectorAll("button, a[data-slot=button], [role=button]")) {
      const r = el.getBoundingClientRect()
      if (!shown(el, r) || !el.textContent.trim()) continue
      const kids = [...el.children].filter((k) => getComputedStyle(k).position !== "absolute")
      if (kids.length < 1) continue
      const firstIcon = kids[0]?.tagName === "svg"
      const lastIcon = kids[kids.length - 1]?.tagName === "svg"
      if (firstIcon === lastIcon) continue
      const cs = getComputedStyle(el)
      if (/inset/.test(cs.boxShadow)) continue // a field-styled trigger keeps the input's padding
      const ps = parseFloat(cs.paddingInlineStart), pe = parseFloat(cs.paddingInlineEnd)
      if (ps >= 6 && Math.abs(ps - pe) < 0.5) add("optical-padding", el, `icon on the ${firstIcon ? "start" : "end"} side with ${ps}px padding on both sides; trim 2px on the icon side`)
    }

    /* Media */
    for (const el of document.querySelectorAll("img, video, picture > img")) {
      const r = el.getBoundingClientRect()
      if (!shown(el, r) || Math.min(r.width, r.height) < 24 || el.getAttribute("aria-hidden") === "true") continue
      const cs = getComputedStyle(el)
      if (cs.outlineStyle === "none" || parseFloat(cs.outlineWidth) === 0) add("media-outline", el, "no outline; add media-outline")
    }

    /* Headings */
    for (const el of document.querySelectorAll("h1, h2, h3")) {
      const r = el.getBoundingClientRect()
      if (!shown(el, r)) continue
      const cs = getComputedStyle(el)
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2
      const wrap = cs.textWrapStyle || cs.textWrap || ""
      if (r.height > lh * 1.5 && !/balance|pretty/.test(wrap) && cs.whiteSpace !== "nowrap") add("text-wrap", el, `wraps to ${Math.round(r.height / lh)} lines without text-wrap: balance`)
    }

    /* Live numbers */
    for (const el of document.querySelectorAll('[role=timer], [role=status], [role=progressbar], [aria-live]:not([aria-live=off]), output, [data-live-number]')) {
      if (!/\d/.test(el.textContent)) continue
      const r = el.getBoundingClientRect()
      if (!shown(el, r)) continue
      const cs = getComputedStyle(el)
      if (!/tabular-nums/.test(cs.fontVariantNumeric) && !/mono/i.test(cs.fontFamily)) add("tabular-nums", el, `live number in proportional digits ("${el.textContent.trim().slice(0, 24)}")`)
    }

    /* Root text */
    const body = getComputedStyle(document.body)
    if (body.webkitFontSmoothing && body.webkitFontSmoothing !== "antialiased") add("font-smoothing", document.body, `-webkit-font-smoothing is ${body.webkitFontSmoothing}`)

    /* Transitions and compositing hints */
    const OK = /^(auto|transform|opacity|filter|translate|scale|rotate|backdrop-filter|scroll-position)$/
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el)
      if (cs.transitionProperty.split(",").some((p) => p.trim() === "all") && cs.transitionDuration.split(",").some((d) => parseFloat(d) > 0))
        add("transition-all", el, `transition-property: all (${cs.transitionDuration})`)
      if (cs.willChange !== "auto") {
        const bad = cs.willChange.split(",").map((p) => p.trim()).filter((p) => !OK.test(p))
        if (bad.length) add("will-change", el, `will-change: ${cs.willChange}`)
      }
    }
    return out
  }

  const found = polish()
  console.table(found)
  return found
})()
