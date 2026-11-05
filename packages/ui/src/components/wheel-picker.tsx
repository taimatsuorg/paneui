"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"

type WheelPickerOption = string | { value: string; label: React.ReactNode; textValue?: string; disabled?: boolean }

type WheelPickerProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange" | "children"> & {
  options: readonly WheelPickerOption[]
  value?: string
  defaultValue?: string
  /** Fires once the drum settles on a new row (after momentum, snap, a click or a key). */
  onValueChange?: (value: string) => void
  /** Rows visible through the window. Odd numbers look best. Default 5 (inherits from a group). */
  visibleCount?: number
  /** Row height in px. Default 36 (inherits from a group). */
  itemHeight?: number
  disabled?: boolean
  /** Hidden input name for forms. */
  name?: string
}

type GroupContextValue = { itemHeight: number; visibleCount: number }
const WheelPickerGroupContext = React.createContext<GroupContextValue | null>(null)

const DEG = Math.PI / 180

function optValue(o: WheelPickerOption) {
  return typeof o === "string" ? o : o.value
}
function optLabel(o: WheelPickerOption) {
  return typeof o === "string" ? o : o.label
}
function optText(o: WheelPickerOption) {
  if (typeof o === "string") return o
  return o.textValue ?? (typeof o.label === "string" ? o.label : o.value)
}
function optDisabled(o: WheelPickerOption) {
  return typeof o !== "string" && !!o.disabled
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/** Cylinder geometry: each row spans `angle` degrees of a drum of `radius` px. */
function useDrum(visibleCount: number, itemHeight: number) {
  return React.useMemo(() => {
    const side = Math.max(1, Math.floor(visibleCount / 2))
    const angle = 90 / (side + 1)
    const radius = itemHeight / 2 / Math.tan((angle / 2) * DEG)
    const height = Math.round(2 * radius * Math.sin(side * angle * DEG) + itemHeight)
    return { angle, radius, height, horizon: side + 1 }
  }, [visibleCount, itemHeight])
}

/**
 * Scroll-wheel picker. A real (invisible) scroll container drives a 3D drum,
 * so touch and trackpads get native momentum and CSS scroll-snap does the detents.
 * Mouse users can drag; keyboard: Up/Down, PageUp/PageDown, Home/End.
 */
function WheelPicker({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  visibleCount: visibleProp,
  itemHeight: itemProp,
  disabled = false,
  name,
  className,
  style,
  "aria-label": ariaLabel,
  onKeyDown: onKeyDownProp,
  ...props
}: WheelPickerProps) {
  const group = React.useContext(WheelPickerGroupContext)
  const itemHeight = itemProp ?? group?.itemHeight ?? 36
  const visibleCount = visibleProp ?? group?.visibleCount ?? 5
  const reduce = useReducedMotion() ?? false
  const { angle, radius, height, horizon } = useDrum(visibleCount, itemHeight)
  const pad = (height - itemHeight) / 2
  const last = options.length - 1
  const id = React.useId()

  const indexOf = React.useCallback(
    (v: string | undefined) => {
      const i = options.findIndex((o) => optValue(o) === v)
      return i < 0 ? 0 : i
    },
    [options]
  )
  const [internal, setInternal] = React.useState(() => defaultValue ?? (options[0] ? optValue(options[0]) : undefined))
  const controlled = valueProp !== undefined
  const current = controlled ? valueProp : internal
  const selectedIndex = indexOf(current)

  const scroller = React.useRef<HTMLDivElement>(null)
  const dimLayer = React.useRef<HTMLUListElement>(null)
  const crispLayer = React.useRef<HTMLUListElement>(null)
  const frame = React.useRef(0)
  const settleTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const settled = React.useRef(selectedIndex)
  const target = React.useRef<number | null>(null)
  const drag = React.useRef<{ y: number; top: number; samples: { t: number; y: number }[]; moved: boolean } | null>(null)
  const [active, setActive] = React.useState(selectedIndex)

  const rowStyle = React.useCallback(
    (d: number, dim: boolean) => {
      const hidden = Math.abs(d) > horizon
      if (reduce)
        return {
          visibility: hidden ? "hidden" : "visible",
          transform: `translateY(${d * itemHeight}px)`,
          opacity: dim ? String(clamp(1 - Math.abs(d) / (horizon + 0.5), 0, 1)) : "1",
        } as const
      return {
        visibility: hidden ? "hidden" : "visible",
        transform: `rotateX(${-d * angle}deg) translateZ(${radius}px)`,
        opacity: dim ? String(clamp(Math.cos(Math.min(Math.abs(d) * angle, 90) * DEG) * 1.1, 0, 1)) : "1",
      } as const
    },
    [horizon, reduce, itemHeight, angle, radius]
  )

  const paint = React.useCallback(() => {
    const el = scroller.current
    if (!el) return
    const pos = el.scrollTop / itemHeight
    for (const layer of [dimLayer.current, crispLayer.current]) {
      if (!layer) continue
      const dim = layer === dimLayer.current
      for (const node of Array.from(layer.children) as HTMLElement[]) {
        const next = rowStyle(Number(node.dataset.index) - pos, dim)
        // Write only what changed; unconditional writes thrash style recalc mid-fling.
        if (node.style.visibility !== next.visibility) node.style.visibility = next.visibility
        if (next.visibility === "hidden") continue
        node.style.transform = next.transform
        node.style.opacity = next.opacity
      }
    }
  }, [itemHeight, rowStyle])

  const emit = React.useCallback(
    (i: number) => {
      const o = options[i]
      if (!o) return
      setActive(i)
      if (optDisabled(o)) return
      const v = optValue(o)
      if (v === current) return
      if (!controlled) setInternal(v)
      onValueChange?.(v)
    },
    [options, current, controlled, onValueChange]
  )

  const scrollToIndex = React.useCallback(
    (i: number, smooth = true) => {
      const el = scroller.current
      if (!el) return
      const to = clamp(i, 0, last)
      target.current = to
      el.scrollTo({ top: to * itemHeight, behavior: smooth && !reduce ? "smooth" : "auto" })
    },
    [itemHeight, last, reduce]
  )

  const settle = React.useCallback(() => {
    const el = scroller.current
    if (!el || drag.current) return
    let i = clamp(Math.round(el.scrollTop / itemHeight), 0, last)
    // Never rest on a disabled row: nudge to the nearest enabled one.
    if (options[i] && optDisabled(options[i])) {
      for (let k = 1; k <= last; k++) {
        if (options[i + k] && !optDisabled(options[i + k])) { i = i + k; break }
        if (options[i - k] && !optDisabled(options[i - k])) { i = i - k; break }
      }
      scrollToIndex(i)
    }
    el.style.scrollSnapType = ""
    target.current = null
    settled.current = i
    emit(i)
  }, [itemHeight, last, options, emit, scrollToIndex])

  const onScroll = React.useCallback(() => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(paint)
    clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(settle, 120)
  }, [paint, settle])

  // Seat the drum on the selected row before paint.
  React.useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    el.scrollTop = selectedIndex * itemHeight
    settled.current = selectedIndex
    paint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemHeight, paint])

  React.useLayoutEffect(() => {
    paint()
  })

  // Follow controlled value changes made from outside.
  React.useEffect(() => {
    setActive(selectedIndex)
    if (drag.current || target.current !== null) return
    if (selectedIndex !== settled.current) {
      settled.current = selectedIndex
      scrollToIndex(selectedIndex)
    }
  }, [selectedIndex, scrollToIndex])

  React.useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
      clearTimeout(settleTimer.current)
    },
    []
  )

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDownProp?.(e)
    if (disabled) return
    const from = target.current ?? settled.current
    const page = Math.max(1, visibleCount - 1)
    const map: Record<string, number> = {
      ArrowDown: from + 1,
      ArrowUp: from - 1,
      PageDown: from + page,
      PageUp: from - page,
      Home: 0,
      End: last,
    }
    if (!(e.key in map)) return
    e.preventDefault()
    scrollToIndex(map[e.key])
  }

  // Mouse drag (touch and pens already scroll natively).
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.pointerType !== "mouse" || e.button !== 0) return
    const el = e.currentTarget
    drag.current = { y: e.clientY, top: el.scrollTop, samples: [{ t: e.timeStamp, y: e.clientY }], moved: false }
    el.style.scrollSnapType = "none"
    try {
      el.setPointerCapture(e.pointerId)
    } catch {}
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dy = e.clientY - d.y
    if (Math.abs(dy) > 3) d.moved = true
    e.currentTarget.scrollTop = d.top - dy
    d.samples.push({ t: e.timeStamp, y: e.clientY })
    while (d.samples.length > 2 && e.timeStamp - d.samples[0].t > 90) d.samples.shift()
  }
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    const el = e.currentTarget
    const first = d.samples[0]
    const lastS = d.samples[d.samples.length - 1]
    const dt = Math.max(1, lastS.t - first.t)
    const velocity = -(lastS.y - first.y) / dt // px per ms of scrollTop
    const projected = el.scrollTop + velocity * 220
    if (d.moved) scrollToIndex(Math.round(projected / itemHeight))
    else el.style.scrollSnapType = ""
  }

  const renderRows = (dim: boolean) =>
    options.map((o, i) => (
      <li
        key={optValue(o)}
        data-index={i}
        data-disabled={optDisabled(o) || undefined}
        className="absolute inset-x-0 flex items-center justify-center px-3 whitespace-nowrap [backface-visibility:hidden] data-disabled:text-muted-foreground/50 data-disabled:line-through"
        style={{ top: pad, height: itemHeight, ...rowStyle(i - selectedIndex, dim) }}
      >
        {optLabel(o)}
      </li>
    ))

  const fade = "[mask-image:linear-gradient(to_bottom,transparent,black_28%,black_72%,transparent)]"

  return (
    <div
      data-slot="wheel-picker"
      data-disabled={disabled || undefined}
      className={cn(
        "relative isolate min-w-16 flex-1 text-ui-lg select-none [-webkit-touch-callout:none] data-disabled:opacity-50",
        !group && "rounded-2xl bg-card px-1.5 shadow-raised",
        className
      )}
      style={{ height, ...style }}
      {...props}
    >
      {!group ? <WheelPickerBand itemHeight={itemHeight} className="inset-x-1.5" /> : null}
      {/* Dimmed drum */}
      <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", fade)} style={{ perspective: 600 }}>
        <ul
          ref={dimLayer}
          className="relative h-full text-muted-foreground [transform-style:preserve-3d]"
          style={{ transform: reduce ? undefined : `translateZ(${-radius}px)` }}
        >
          {renderRows(true)}
        </ul>
      </div>
      {/* Crisp copy of the same drum, clipped to the centre band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ perspective: 600, clipPath: `inset(${pad}px 0 ${pad}px 0)` }}
      >
        <ul
          ref={crispLayer}
          className="relative h-full font-medium text-foreground [transform-style:preserve-3d]"
          style={{ transform: reduce ? undefined : `translateZ(${-radius}px)` }}
        >
          {renderRows(false)}
        </ul>
      </div>
      {/* Native scroller: momentum + snap + a11y. Rows are transparent hit targets. */}
      <div
        ref={scroller}
        role="listbox"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        aria-activedescendant={`${id}-${active}`}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn(
          "absolute inset-0 snap-y snap-mandatory overflow-y-scroll overscroll-contain rounded-2xl outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-scrollbar]:hidden",
          disabled ? "pointer-events-none overflow-hidden" : "cursor-grab active:cursor-grabbing"
        )}
        style={{ paddingBlock: pad }}
      >
        {options.map((o, i) => (
          <div
            key={optValue(o)}
            id={`${id}-${i}`}
            role="option"
            aria-selected={i === selectedIndex}
            aria-disabled={optDisabled(o) || undefined}
            onClick={() => {
              if (!disabled && i !== settled.current) scrollToIndex(i)
            }}
            className="snap-center text-transparent"
            style={{ height: itemHeight, lineHeight: `${itemHeight}px` }}
          >
            {optText(o)}
          </div>
        ))}
      </div>
      {name ? <input type="hidden" name={name} value={current ?? ""} /> : null}
    </div>
  )
}

function WheelPickerBand({ itemHeight, className }: { itemHeight: number; className?: string }) {
  return (
    <div
      aria-hidden
      data-slot="wheel-picker-band"
      className={cn("pointer-events-none absolute top-1/2 -z-10 -translate-y-1/2 rounded-xl bg-muted shadow-well", className)}
      style={{ height: itemHeight }}
    />
  )
}

/**
 * Lays several wheels side by side (e.g. hours / minutes / AM-PM) on one shared
 * raised surface with a single selection band.
 */
function WheelPickerGroup({
  className,
  itemHeight = 36,
  visibleCount = 5,
  children,
  ...props
}: React.ComponentProps<"div"> & { itemHeight?: number; visibleCount?: number }) {
  const ctx = React.useMemo(() => ({ itemHeight, visibleCount }), [itemHeight, visibleCount])
  return (
    <WheelPickerGroupContext.Provider value={ctx}>
      <div
        role="group"
        data-slot="wheel-picker-group"
        className={cn(
          "relative isolate flex items-stretch gap-0.5 rounded-2xl bg-card px-1.5 shadow-raised",
          className
        )}
        {...props}
      >
        <WheelPickerBand itemHeight={itemHeight} className="inset-x-1.5" />
        {children}
      </div>
    </WheelPickerGroupContext.Provider>
  )
}

export { WheelPicker, WheelPickerGroup }
export type { WheelPickerOption, WheelPickerProps }
