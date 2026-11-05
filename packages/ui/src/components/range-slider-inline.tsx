"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@paneui/ui/lib/utils"

/**
 * Inner-box x of the thumb at min/max, in px (the control's `px-2.5` minus the `inset-1`).
 * The fill is the thumb plus EDGE, so at max it reaches the inner box's right edge and
 * sits 4px from the well on both ends.
 */
const EDGE = 6
/** Inner-box x where the label/readout text starts (the text row's `px-4`), 8px clear of the thumb at min/max. */
const TEXT = 16
const STOPS = 10

type RangeSliderInlineProps = Omit<
  SliderPrimitive.Root.Props<number>,
  "value" | "defaultValue" | "onValueChange" | "children" | "orientation"
> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number, details: SliderPrimitive.Root.ChangeEventDetails) => void
  /** Short label drawn inside the left edge of the well. */
  label: string
  /** Formats the readout on the right (and the announced value). */
  formatValue?: (value: number) => string
  /** Paint the ten evenly spaced stop markers. */
  showStops?: boolean
  /** On pointer release, settle onto the nearest of the ten stops. */
  snapToStops?: boolean
}

/**
 * Inline slider: a raised fill grows inside an inset well, with the label and
 * value printed on the track itself. The thumb is one slim bar that fades out while it
 * passes over the text, and ten stop markers hide where they would sit under it.
 */
function RangeSliderInline({
  className,
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  label,
  formatValue = String,
  showStops = true,
  snapToStops = false,
  disabled,
  ...props
}: RangeSliderInlineProps) {
  const [inner, setInner] = React.useState(defaultValue ?? min)
  const current = value ?? inner
  const span = max - min || 1
  const p = Math.min(1, Math.max(0, (current - min) / span))

  const boxRef = React.useRef<HTMLDivElement>(null)
  const labelRef = React.useRef<HTMLSpanElement>(null)
  const readoutRef = React.useRef<HTMLSpanElement>(null)
  const [geo, setGeo] = React.useState({ width: 0, label: 0, readout: 0 })

  React.useLayoutEffect(() => {
    const box = boxRef.current
    if (!box || typeof ResizeObserver === "undefined") return
    const measure = () => {
      const next = {
        width: box.clientWidth,
        label: labelRef.current?.offsetWidth ?? 0,
        readout: readoutRef.current?.offsetWidth ?? 0,
      }
      setGeo((prev) =>
        prev.width === next.width && prev.label === next.label && prev.readout === next.readout ? prev : next
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    if (labelRef.current) ro.observe(labelRef.current)
    if (readoutRef.current) ro.observe(readoutRef.current)
    return () => ro.disconnect()
  }, [])

  // Pixel geometry inside the inner box (the well minus its 4px inset).
  const usable = Math.max(0, geo.width - EDGE * 2)
  const thumbX = EDGE + p * usable
  const labelZone: [number, number] = [TEXT - 4, TEXT + geo.label + 4]
  const readoutZone: [number, number] = [geo.width - TEXT - geo.readout - 4, geo.width - TEXT + 4]
  const inZone = (x: number, [a, b]: [number, number], pad = 0) => geo.width > 0 && x >= a - pad && x <= b + pad
  const parted = inZone(thumbX, labelZone) || inZone(thumbX, readoutZone)

  const stops = React.useMemo(
    () => Array.from({ length: STOPS }, (_, i) => snap(min + (span * i) / (STOPS - 1), min, max, step)),
    [min, max, span, step]
  )

  const set = (next: number, details: SliderPrimitive.Root.ChangeEventDetails) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next, details)
  }

  return (
    <SliderPrimitive.Root
      data-slot="range-slider-inline"
      value={current}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={(next, details) => set(next as number, details)}
      onValueCommitted={(next, details) => {
        let settled = next as number
        if (snapToStops && (details.reason === "drag" || details.reason === "track-press")) {
          const nearest = stops.reduce((a, b) => (Math.abs(b - settled) < Math.abs(a - settled) ? b : a))
          if (nearest !== settled) {
            settled = nearest
            if (value === undefined) setInner(nearest)
            onValueChange?.(nearest, details as unknown as SliderPrimitive.Root.ChangeEventDetails)
          }
        }
        onValueCommitted?.(settled, details)
      }}
      className={cn("group/ris relative w-full touch-none select-none data-disabled:opacity-50", className)}
      {...props}
    >
      <SliderPrimitive.Control
        data-slot="range-slider-inline-control"
        className={cn(
          "relative flex h-11 w-full cursor-pointer items-center frame-2xl frame-inset-1 bg-muted px-2.5 shadow-well outline-none",
          "has-focus-visible:ring-2 has-focus-visible:ring-ring data-disabled:cursor-not-allowed"
        )}
      >
        {/* Inner box: fill, stops and text all live in the same 4px-inset frame. */}
        <div ref={boxRef} aria-hidden className="pointer-events-none absolute inset-1">
          <div
            data-slot="range-slider-inline-fill"
            style={{ width: `calc(${EDGE * 2}px + ${p} * (100% - ${EDGE * 2}px))` }}
            className={cn(
              "absolute inset-y-0 left-0 rounded-inner bg-card shadow-raised",
              "transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-dragging/ris:transition-none motion-reduce:transition-none"
            )}
          />
          {showStops
            ? stops.map((stop, i) => {
                const x = EDGE + (i / (STOPS - 1)) * usable
                // Stops also stay hidden in the margin outside the text, so none sit at the very ends.
                const hidden =
                  inZone(x, [0, labelZone[1]], 3) || inZone(x, [readoutZone[0], geo.width], 3) || Math.abs(x - thumbX) < 7
                return (
                  <span
                    key={i}
                    data-slot="range-slider-inline-stop"
                    style={{ left: `calc(${EDGE}px + ${i / (STOPS - 1)} * (100% - ${EDGE * 2}px))` }}
                    className={cn(
                      "absolute top-1/2 size-1 -translate-1/2 rounded-full transition-opacity duration-200",
                      stop <= current ? "bg-foreground/25" : "bg-foreground/20",
                      hidden ? "opacity-0" : "opacity-100"
                    )}
                  />
                )
              })
            : null}
          <div className="absolute inset-0 flex items-center justify-between px-4 text-ui font-medium">
            <span ref={labelRef} className="truncate text-foreground">
              {label}
            </span>
            <span ref={readoutRef} className="text-muted-foreground tabular-nums group-data-dragging/ris:text-foreground">
              {formatValue(current)}
            </span>
          </div>
        </div>

        <SliderPrimitive.Track data-slot="range-slider-inline-track" className="relative h-full w-full">
          <SliderPrimitive.Thumb
            data-slot="range-slider-inline-thumb"
            aria-label={label}
            getAriaValueText={(_, v) => formatValue(v)}
            data-parted={parted || undefined}
            className={cn(
              "group/thumb h-7 w-3 outline-none",
              "transition-[inset-inline-start] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-dragging/ris:transition-none motion-reduce:transition-none"
            )}
          >
            {/* One grey bar (darker on hover/drag); it fades out while it crosses the label or readout. */}
            <span
              aria-hidden
              className={cn(
                "absolute top-1/2 left-1/2 h-5 w-1 -translate-1/2 rounded-full bg-muted-foreground/40 group-hover/ris:bg-muted-foreground/60 group-data-dragging/ris:bg-muted-foreground/70",
                "transition-[opacity,scale,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                "group-data-dragging/ris:scale-x-125 group-data-parted/thumb:scale-y-50 group-data-parted/thumb:opacity-0"
              )}
            />
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

function snap(v: number, min: number, max: number, step: number) {
  const s = step > 0 ? step : 1
  const n = Math.round((v - min) / s) * s + min
  return Number(Math.min(max, Math.max(min, n)).toFixed(6))
}

export { RangeSliderInline }
export type { RangeSliderInlineProps }
