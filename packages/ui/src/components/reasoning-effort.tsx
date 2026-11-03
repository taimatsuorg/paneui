"use client"

import * as React from "react"
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react"

import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"

/*
 * A stepped track for how hard a model thinks. The fill runs to the thumb, and the tick at each
 * stop grows taller with the level, so the track reads as a meter. While the thumb is dragged a
 * tab rises out of the track's top edge above it, naming the model and the level under the
 * pointer, and sinks back on release.
 *
 *   <ReasoningEffort model="4.7" value={effort} onValueChange={setEffort} />
 *
 * Levels default to low / medium / high / extra high; pass `levels` for your provider's set.
 * Inside a popover or menu, set `--reasoning-effort-surface: var(--popover)` so the track and the
 * tab are painted on the surface they sit on.
 */

type ReasoningEffortLevel = { value: string; label: string }

type ReasoningEffortSize = "sm" | "default"

// Track height, thumb at rest and while dragged, tab height and the width of its shoulders.
const SIZES: Record<ReasoningEffortSize, { track: number; thumb: number; drag: number; tab: number; shoulder: number }> = {
  sm: { track: 24, thumb: 20, drag: 26, tab: 16, shoulder: 11 },
  default: { track: 32, thumb: 28, drag: 36, tab: 20, shoulder: 14 },
}
const INSET = 2
const LABEL_PAD = 7
const SPRING = { type: "spring", stiffness: 520, damping: 38, mass: 0.7 } as const
const DRAG_THRESHOLD = 3

type ReasoningEffortProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  /** Levels, lowest first. */
  levels?: readonly ReasoningEffortLevel[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Shown before the level in the tab, e.g. a model version. */
  model?: React.ReactNode
  /** When the tab shows: while dragging (default), always, or never. */
  showLabel?: "drag" | "always" | "never"
  size?: ReasoningEffortSize
  disabled?: boolean
  "aria-label"?: string
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** The tab: a plateau over `centre` with S-curved shoulders that meet the track's top edge. */
function tabPath(centre: number, open: number, plateau: number, width: number, radius: number, tab: number, shoulder: number) {
  if (open < 0.01 || width <= 0) return "M0 0Z"
  const minFoot = radius
  const maxFoot = width - radius
  let left = centre - plateau / 2
  let right = left + plateau
  if (left - shoulder < minFoot) {
    right += minFoot - (left - shoulder)
    left = minFoot + shoulder
  }
  if (right + shoulder > maxFoot) {
    left -= right + shoulder - maxFoot
    right = maxFoot - shoulder
  }
  const top = tab * (1 - open)
  const base = tab + 1 // one pixel into the track so the seam never shows
  const f = (n: number) => n.toFixed(2)
  return [
    `M${f(left - shoulder)} ${base}`,
    `V${tab}`,
    `C${f(left - shoulder * 0.45)} ${tab} ${f(left - shoulder * 0.55)} ${f(top)} ${f(left)} ${f(top)}`,
    `H${f(right)}`,
    `C${f(right + shoulder * 0.55)} ${f(top)} ${f(right + shoulder * 0.45)} ${tab} ${f(right + shoulder)} ${tab}`,
    `V${base}Z`,
  ].join("")
}

function useLatest<V>(value: V) {
  const ref = React.useRef(value)
  ref.current = value
  return ref
}

function ReasoningEffort({
  levels: levelsProp,
  value,
  defaultValue,
  onValueChange,
  model,
  showLabel = "drag",
  size = "default",
  disabled = false,
  "aria-label": ariaLabel,
  className,
  style,
  ...props
}: ReasoningEffortProps) {
  const { labels } = useLocale()
  const reduce = useReducedMotion()
  const dims = SIZES[size]
  const half = dims.track / 2

  const levels = React.useMemo<readonly ReasoningEffortLevel[]>(
    () =>
      levelsProp ?? [
        { value: "low", label: labels.effortLow },
        { value: "medium", label: labels.effortMedium },
        { value: "high", label: labels.effortHigh },
        { value: "xhigh", label: labels.effortExtraHigh },
      ],
    [levelsProp, labels]
  )
  const last = Math.max(1, levels.length - 1)

  /* value ------------------------------------------------------------------ */
  const [inner, setInner] = React.useState(defaultValue ?? levels[0]?.value)
  const current = value !== undefined ? value : inner
  const index = Math.max(0, levels.findIndex((l) => l.value === current))
  const indexRef = useLatest(index)
  const onChangeRef = useLatest(onValueChange)
  const commit = React.useCallback(
    (next: number) => {
      const level = levels[clamp(Math.round(next), 0, levels.length - 1)]
      if (!level || level.value === levels[indexRef.current]?.value) return
      if (value === undefined) setInner(level.value)
      onChangeRef.current?.(level.value)
    },
    [levels, value, indexRef, onChangeRef]
  )

  /* geometry --------------------------------------------------------------- */
  const trackRef = React.useRef<HTMLDivElement>(null)
  const labelRef = React.useRef<HTMLSpanElement>(null)
  const width = useMotionValue(0)
  const radius = useMotionValue(0)
  const labelWidth = useMotionValue(0)
  const pos = useMotionValue(index)
  const open = useMotionValue(showLabel === "always" ? 1 : 0)
  const thumbWidth = useMotionValue(dims.thumb)
  // The ticks are plain elements placed in render, so they need the width as state too.
  const [trackWidth, setTrackWidth] = React.useState(0)

  React.useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return
    const read = () => {
      width.set(el.clientWidth)
      setTrackWidth(el.clientWidth)
      radius.set(Math.min(half, parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0))
    }
    read()
    const observer = new ResizeObserver(read)
    observer.observe(el)
    return () => observer.disconnect()
  }, [width, radius, half])

  const centreAt = React.useCallback((p: number, w: number) => half + (p / last) * Math.max(0, w - 2 * half), [half, last])
  const fillWidth = useTransform(() => centreAt(pos.get(), width.get()) + half)
  const thumbX = useTransform(() => {
    const w = thumbWidth.get()
    return clamp(centreAt(pos.get(), width.get()) - w / 2, INSET, Math.max(INSET, width.get() - INSET - w))
  })
  const path = useTransform(() =>
    tabPath(
      centreAt(pos.get(), width.get()),
      open.get(),
      labelWidth.get() + LABEL_PAD * 2,
      width.get(),
      radius.get(),
      dims.tab,
      dims.shoulder
    )
  )
  const labelX = useTransform(() => {
    const w = width.get()
    const lw = labelWidth.get()
    const plateau = lw + LABEL_PAD * 2
    const r = radius.get()
    const centre = clamp(centreAt(pos.get(), w), r + dims.shoulder + plateau / 2, w - r - dims.shoulder - plateau / 2)
    return (Number.isFinite(centre) ? centre : w / 2) - lw / 2
  })
  const labelY = useTransform(() => (1 - open.get()) * dims.tab * 0.6)

  /* motion ----------------------------------------------------------------- */
  const to = React.useCallback(
    (mv: MotionValue<number>, target: number) => {
      if (reduce) mv.set(target)
      else animate(mv, target, SPRING)
    },
    [reduce]
  )

  const [dragging, setDragging] = React.useState(false)
  const draggingRef = useLatest(dragging)
  React.useEffect(() => {
    if (!draggingRef.current) to(pos, index)
  }, [index, pos, to, draggingRef])
  React.useEffect(() => {
    to(open, showLabel === "always" || (dragging && showLabel === "drag") ? 1 : 0)
    to(thumbWidth, dragging ? dims.drag : dims.thumb)
  }, [dragging, showLabel, open, thumbWidth, dims.drag, dims.thumb, to])

  // Ticks change colour as the fill and the thumb pass them; re-render only when that changes.
  const [live, setLive] = React.useState(index)
  useMotionValueEvent(pos, "change", (p) => {
    const rounded = Math.round(p * 20) / 20
    if (rounded !== live) setLive(rounded)
  })

  /* the level under the pointer while dragging ----------------------------- */
  const [hover, setHover] = React.useState(index)
  const shown = dragging ? hover : index
  const level = levels[shown]

  React.useLayoutEffect(() => {
    if (labelRef.current) labelWidth.set(labelRef.current.offsetWidth)
  }, [level?.label, model, labelWidth, size])

  /* pointer ---------------------------------------------------------------- */
  const press = React.useRef<{ x: number; id: number; moved: boolean } | null>(null)
  const pFromClientX = (clientX: number) => {
    const el = trackRef.current
    if (!el) return indexRef.current
    const rect = el.getBoundingClientRect()
    return clamp(((clientX - rect.left - half) / Math.max(1, rect.width - 2 * half)) * last, 0, last)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    press.current = { x: e.clientX, id: e.pointerId, moved: false }
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = press.current
    if (!p || p.id !== e.pointerId) return
    if (!p.moved && Math.abs(e.clientX - p.x) < DRAG_THRESHOLD) return
    if (!p.moved) {
      p.moved = true
      setDragging(true)
    }
    const next = pFromClientX(e.clientX)
    pos.stop()
    pos.set(next)
    const nearest = Math.round(next)
    setHover(nearest)
    commit(nearest)
  }
  const release = (e: React.PointerEvent<HTMLDivElement>, cancelled = false) => {
    const p = press.current
    if (!p || p.id !== e.pointerId) return
    press.current = null
    const target = cancelled ? indexRef.current : Math.round(p.moved ? pos.get() : pFromClientX(e.clientX))
    setDragging(false)
    commit(target)
    to(pos, target)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const steps: Record<string, number> = {
      ArrowRight: 1,
      ArrowUp: 1,
      PageUp: 1,
      ArrowLeft: -1,
      ArrowDown: -1,
      PageDown: -1,
      Home: -Infinity,
      End: Infinity,
    }
    const step = steps[e.key]
    if (step === undefined) return
    e.preventDefault()
    commit(clamp(indexRef.current + step, 0, levels.length - 1))
  }

  /* render ----------------------------------------------------------------- */
  const valueText = [typeof model === "string" || typeof model === "number" ? String(model) : null, levels[index]?.label]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      data-slot="reasoning-effort"
      data-size={size}
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      className={cn("relative w-56 touch-none select-none data-disabled:opacity-64", className)}
      style={{ height: dims.tab + dims.track, ...style }}
      {...props}
    >
      {/* The tab, painted like the track: the card, then the muted fill over it. */}
      <svg aria-hidden data-slot="reasoning-effort-tab" className="pointer-events-none absolute inset-x-0 top-0 w-full overflow-visible" height={dims.tab + 1}>
        <motion.path d={path} className="fill-(--reasoning-effort-surface,var(--card))" />
        <motion.path d={path} className="fill-muted" />
      </svg>
      <motion.span
        ref={labelRef}
        aria-hidden
        data-slot="reasoning-effort-label"
        className={cn(
          "pointer-events-none absolute top-0 left-0 flex items-center gap-1 font-medium whitespace-nowrap",
          size === "sm" ? "text-ui-2xs leading-4" : "text-ui-xs leading-5"
        )}
        style={{ x: labelX, y: labelY, opacity: open }}
      >
        {model != null && model !== "" ? <span className="text-foreground">{model}</span> : null}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={level?.value}
            className={model != null && model !== "" ? "text-muted-foreground" : "text-foreground"}
            initial={reduce ? false : { opacity: 0.35, filter: "blur(2.5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.08 } }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {level?.label}
          </motion.span>
        </AnimatePresence>
      </motion.span>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel ?? labels.reasoningEffort}
        aria-valuemin={0}
        aria-valuemax={levels.length - 1}
        aria-valuenow={index}
        aria-valuetext={valueText}
        aria-disabled={disabled || undefined}
        aria-orientation="horizontal"
        data-slot="reasoning-effort-track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => release(e)}
        onPointerCancel={(e) => release(e, true)}
        onKeyDown={onKeyDown}
        className={cn(
          "frame-control frame-p-0.5 absolute inset-x-0 bottom-0 cursor-grab bg-(--reasoning-effort-surface,var(--card)) outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "data-[dragging=true]:cursor-grabbing aria-disabled:cursor-not-allowed"
        )}
        data-dragging={dragging || undefined}
        style={{ height: dims.track }}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-muted" />
        <motion.span
          aria-hidden
          data-slot="reasoning-effort-fill"
          className="pointer-events-none absolute inset-y-0 left-0 rounded-[inherit] bg-primary"
          style={{ width: fillWidth }}
        />
        {trackWidth > 0 && levels.map((l, i) => {
          const w = trackWidth
          const x = centreAt(i, w)
          const thumbCentre = centreAt(live, w)
          const thumbHalf = (dragging ? dims.drag : dims.thumb) / 2
          const onThumb = Math.abs(x - thumbCentre) < thumbHalf - 1
          const filled = x < thumbCentre
          const target = dragging && i === hover && !onThumb
          const tone = onThumb ? "thumb" : target ? "target" : filled ? "fill" : "track"
          return (
            <span
              key={l.value}
              aria-hidden
              data-slot="reasoning-effort-tick"
              data-tone={tone}
              className={cn(
                "pointer-events-none absolute top-1/2 z-10 w-[1.5px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-150",
                "data-[tone=track]:bg-foreground/20 data-[tone=fill]:bg-primary-foreground/45 data-[tone=thumb]:bg-foreground/40 data-[tone=target]:bg-primary-text"
              )}
              style={{ left: x, height: Math.round(dims.track * (0.15 + (0.15 * i) / last) * 2) / 2 }}
            />
          )
        })}
        <motion.span
          aria-hidden
          data-slot="reasoning-effort-thumb"
          className="pointer-events-none absolute top-0.5 left-0 rounded-inner bg-card shadow-raised"
          style={{ x: thumbX, width: thumbWidth, height: dims.thumb }}
        />
      </div>
    </div>
  )
}

export { ReasoningEffort }
export type { ReasoningEffortProps, ReasoningEffortLevel, ReasoningEffortSize }
