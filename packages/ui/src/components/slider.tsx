"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { useControlSize, type ControlSize } from "@paneui/core/control-size"
import { cn } from "@paneui/ui/lib/utils"

type SliderSize = "sm" | "default" | "lg"

// Thumb 16 / 20 / 24px on a 6 / 8 / 10px track. `inset` is half the thumb, used to
// place ticks under the thumb centre with `edge` alignment.
const sliderSizes: Record<SliderSize, { control: [string, string]; track: [string, string]; thumb: string; inset: string }> = {
  sm: { control: ["h-4 w-full", "h-full w-4 flex-col justify-center"], track: ["h-1.5 w-full", "h-full w-1.5"], thumb: "size-4", inset: "0.5rem" },
  default: { control: ["h-5 w-full", "h-full w-5 flex-col justify-center"], track: ["h-2 w-full", "h-full w-2"], thumb: "size-5", inset: "0.625rem" },
  lg: { control: ["h-6 w-full", "h-full w-6 flex-col justify-center"], track: ["h-2.5 w-full", "h-full w-2.5"], thumb: "size-6", inset: "0.75rem" },
}

// `contained`: the track is as tall as the thumb plus a 2px rim, the thumb rides inside it and
// the fill runs to the thumb's far edge.
const containedSizes: Record<SliderSize, { control: [string, string]; track: [string, string]; thumb: string; inset: string }> = {
  sm: { control: ["h-6 w-full", "h-full w-6 flex-col justify-center"], track: ["h-6 w-full", "h-full w-6"], thumb: "size-5", inset: "0.625rem" },
  default: { control: ["h-7 w-full", "h-full w-7 flex-col justify-center"], track: ["h-7 w-full", "h-full w-7"], thumb: "size-6", inset: "0.75rem" },
  lg: { control: ["h-9 w-full", "h-full w-9 flex-col justify-center"], track: ["h-9 w-full", "h-full w-9"], thumb: "size-8", inset: "1rem" },
}

type SliderProps<Value extends number | readonly number[] = number | readonly number[]> =
  SliderPrimitive.Root.Props<Value> & {
    /** Dots along the track: `true` = one per step, a number = that many evenly spaced. */
    ticks?: boolean | number
    /** Floating value bubble over the thumb: on hover/drag/focus, or always. */
    showValue?: boolean | "always"
    /** Accessible label per thumb, e.g. for a range: `(i) => (i ? "Max" : "Min")`. */
    getThumbLabel?: (index: number) => string
    /** Thumb and track size. An `xs` inherited from a Field maps to `sm`. */
    size?: SliderSize
    /** `default`: a thin track under a raised thumb. `contained`: a thick track with the thumb inside it, for stepped choices. */
    variant?: "default" | "contained"
  }

/**
 * Slider with an inset well track, a primary fill and a raised thumb.
 * Pass an array value for a range. Optional tick dots and value bubble.
 */
function Slider<Value extends number | readonly number[]>({
  className,
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  ticks,
  showValue,
  getThumbLabel,
  orientation = "horizontal",
  thumbAlignment = "edge",
  size: sizeProp,
  variant = "default",
  ...props
}: SliderProps<Value>) {
  const inherited = useControlSize<ControlSize>(sizeProp)
  const size: SliderSize = inherited === "xs" ? "sm" : inherited
  const contained = variant === "contained"
  const dims = (contained ? containedSizes : sliderSizes)[size]
  const initial = (value ?? defaultValue ?? min) as number | readonly number[]
  const [values, setValues] = React.useState<readonly number[]>(toArray(initial))

  React.useEffect(() => {
    if (value !== undefined) setValues(toArray(value as number | readonly number[]))
  }, [value])

  const vertical = orientation === "vertical"
  // With `edge` alignment the thumb's centre travels from half a thumb (10px)
  // inside one end of the track to half a thumb inside the other, so ticks use
  // the same inset to sit exactly under the thumb at every step, min/max included.
  const thumbInset = thumbAlignment === "center" ? "0px" : dims.inset
  const span = max - min || 1
  const low = values.length > 1 ? Math.min(...values) : min
  const high = Math.max(...values)

  const tickValues = React.useMemo(() => {
    if (!ticks) return []
    const count = typeof ticks === "number" ? ticks : Math.floor(span / step) + 1
    if (count < 2 || count > 101) return []
    return Array.from({ length: count }, (_, i) => min + (span * i) / (count - 1))
  }, [ticks, span, step, min])

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      data-size={size}
      data-variant={variant}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      orientation={orientation}
      thumbAlignment={thumbAlignment}
      onValueChange={(next, details) => {
        setValues(toArray(next as number | readonly number[]))
        onValueChange?.(next, details)
      }}
      className={cn(
        "group/slider relative touch-none select-none data-disabled:opacity-50",
        vertical ? "h-full min-h-40 w-fit" : "w-full",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Control
        data-slot="slider-control"
        className={cn(
          "relative flex cursor-pointer items-center data-disabled:cursor-not-allowed",
          vertical ? dims.control[1] : dims.control[0]
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "relative rounded-control-sm bg-muted shadow-well",
            // the rim: positions below are inside it, so the thumb and fill sit 2px in
            contained && "border-2 border-transparent",
            vertical ? dims.track[1] : dims.track[0]
          )}
        >
          {contained ? (
            <span
              aria-hidden
              data-slot="slider-indicator"
              style={
                vertical
                  ? { bottom: `calc((100% - 2 * ${thumbInset}) * ${(low - min) / span})`, height: `calc(2 * ${thumbInset} + (100% - 2 * ${thumbInset}) * ${(high - low) / span})` }
                  : { insetInlineStart: `calc((100% - 2 * ${thumbInset}) * ${(low - min) / span})`, width: `calc(2 * ${thumbInset} + (100% - 2 * ${thumbInset}) * ${(high - low) / span})` }
              }
              className={cn("pointer-events-none absolute rounded-control-sm bg-primary", vertical ? "inset-x-0" : "inset-y-0")}
            />
          ) : (
            <SliderPrimitive.Indicator data-slot="slider-indicator" className="rounded-control-sm bg-primary" />
          )}
          {tickValues.map((tick) => {
            const pct = ((tick - min) / span) * 100
            const active = tick >= low - 1e-9 && tick <= high + 1e-9
            return (
              <span
                key={tick}
                aria-hidden
                data-slot="slider-tick"
                data-active={active || undefined}
                style={{ [vertical ? "bottom" : "insetInlineStart"]: `calc(${thumbInset} + (100% - 2 * ${thumbInset}) * ${pct / 100})` }}
                className={cn(
                  "pointer-events-none absolute rounded-full transition-colors duration-150",
                  contained ? "size-1.5 bg-foreground/25 data-active:bg-primary-foreground/45" : "size-1 bg-foreground/20 data-active:bg-primary-foreground/70",
                  vertical ? "left-1/2 -translate-x-1/2 translate-y-1/2" : "top-1/2 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
                )}
              />
            )
          })}
          {values.map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              index={index}
              getAriaLabel={getThumbLabel}
              data-slot="slider-thumb"
              className={cn(
                "group/thumb block rounded-full bg-card shadow-raised outline-none",
                dims.thumb,
                "transition-[scale,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] has-focus-visible:ring-2 has-focus-visible:ring-ring motion-reduce:transition-none",
                contained ? "data-dragging:scale-95" : "hover:scale-110 data-dragging:scale-115"
              )}
            >
              {showValue ? (
                <SliderPrimitive.Value
                  data-slot="slider-value"
                  className={cn(
                    "pointer-events-none absolute rounded-md bg-popover px-2 py-0.5 text-ui-sm font-medium whitespace-nowrap text-popover-foreground tabular-nums shadow-surface",
                    "transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                    vertical
                      ? "top-1/2 left-full ml-2 origin-left -translate-y-1/2"
                      : "bottom-full left-1/2 mb-2 origin-bottom -translate-x-1/2",
                    showValue === "always"
                      ? "opacity-100"
                      : "scale-75 opacity-0 group-hover/thumb:scale-100 group-hover/thumb:opacity-100 group-has-focus-visible/thumb:scale-100 group-has-focus-visible/thumb:opacity-100 group-data-dragging/thumb:scale-100 group-data-dragging/thumb:opacity-100"
                  )}
                >
                  {(formatted) => formatted[index]}
                </SliderPrimitive.Value>
              ) : null}
            </SliderPrimitive.Thumb>
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

function toArray(v: number | readonly number[]): readonly number[] {
  return typeof v === "number" ? [v] : v
}

export { Slider }
export type { SliderProps, SliderSize }
