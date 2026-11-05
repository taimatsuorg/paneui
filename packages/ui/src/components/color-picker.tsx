"use client"

import * as React from "react"
import { useDirection } from "@base-ui/react/direction-provider"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"

/* ─────────────────────────── colour math ─────────────────────────── */

type Hsva = { h: number; s: number; v: number; a: number }
type Rgba = { r: number; g: number; b: number; a: number }

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

function hsvaToRgba({ h, s, v, a }: Hsva): Rgba {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
  }
  return { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255), a }
}

/** RGB → HSV. Pass the previous colour to keep its hue when the new one is grey (hue is undefined there). */
function rgbaToHsva({ r, g, b, a }: Rgba, previous?: Hsva): Hsva {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const d = max - Math.min(rn, gn, bn)
  let h = previous?.h ?? 0
  if (d) {
    if (max === rn) h = 60 * (((gn - bn) / d) % 6)
    else if (max === gn) h = 60 * ((bn - rn) / d + 2)
    else h = 60 * ((rn - gn) / d + 4)
    if (h < 0) h += 360
  }
  const s = max ? d / max : (previous?.s ?? 0)
  return { h, s, v: max, a }
}

/** Accepts #rgb, #rgba, #rrggbb, #rrggbbaa (with or without #). */
function parseHex(input: string): Rgba | null {
  let hex = input.trim().replace(/^#/, "")
  if (!/^([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)) return null
  if (hex.length <= 4) hex = [...hex].map((c) => c + c).join("")
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16)
  return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? Math.round((n(6) / 255) * 100) / 100 : 1 }
}

/** #rrggbb, or #rrggbbaa when alpha < 1. Lowercase. */
function formatHex({ r, g, b, a }: Rgba): string {
  const h = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0")
  return `#${h(r)}${h(g)}${h(b)}${a < 1 ? h(a * 255) : ""}`
}

const hsvaToHex = (c: Hsva) => formatHex(hsvaToRgba(c))

/** The default light theme's `--primary` (oklch(0.205 0 0), neutral black) in hex: the server-render default before the live token is read. */
const PRIMARY_FALLBACK = "#155dfc"

/** Resolve the live `--primary` token to RGBA (any CSS colour syntax) by painting one canvas pixel. */
function readPrimary(): Rgba | null {
  if (typeof document === "undefined") return null
  const token = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()
  const ctx = token ? document.createElement("canvas").getContext("2d", { willReadFrequently: true }) : null
  if (!ctx) return null
  ctx.fillStyle = "#010203"
  ctx.fillStyle = token
  if (ctx.fillStyle === "#010203") return null // the browser could not parse the token
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return { r, g, b, a: 1 }
}
const rgbaCss = ({ r, g, b, a }: Rgba) => `rgb(${r} ${g} ${b} / ${a})`

const CHECKER =
  "repeating-conic-gradient(color-mix(in oklch, var(--foreground) 14%, transparent) 0% 25%, transparent 0% 50%) 50% / 8px 8px"

/* ─────────────────────────── context ─────────────────────────── */

type ColorPickerContextValue = {
  hsva: Hsva
  hex: string
  setHsva: (next: Hsva, commit?: boolean) => void
  commit: () => void
  alpha: boolean
  disabled: boolean
}
const ColorPickerContext = React.createContext<ColorPickerContextValue | null>(null)

/** Current colour plus setters, for building custom parts inside <ColorPicker>. */
function useColorPicker() {
  const ctx = React.useContext(ColorPickerContext)
  if (!ctx) throw new Error("useColorPicker must be used inside <ColorPicker>.")
  return ctx
}

type ColorPickerProps = Omit<PopoverPrimitive.Root.Props, "children"> & {
  /** Hex colour (#rrggbb or #rrggbbaa). */
  value?: string
  /** Initial colour when uncontrolled. Defaults to the theme's `--primary`. */
  defaultValue?: string
  /** Fires continuously while dragging. */
  onValueChange?: (hex: string) => void
  /** Fires when a gesture ends (pointer up, key, hex commit, preset). */
  onValueCommit?: (hex: string) => void
  /** Allow transparency (enables the alpha channel in hex output). Default false. */
  alpha?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

/**
 * Colour picker state + popover root. Compose the parts:
 * Trigger → Content → Area, Hue, (Alpha), HexInput, Presets.
 * Parts also work inline without Trigger/Content.
 */
function ColorPicker({
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  alpha = false,
  disabled = false,
  children,
  ...props
}: ColorPickerProps) {
  const [hsva, setHsvaState] = React.useState<Hsva>(() => rgbaToHsva(parseHex(value ?? defaultValue ?? PRIMARY_FALLBACK) ?? parseHex("#000")!))
  const latest = React.useRef(hsva)
  latest.current = hsva

  // No value or defaultValue: adopt the live theme primary once mounted (no change callbacks fire).
  const usesThemeDefault = React.useRef(value === undefined && defaultValue === undefined)
  React.useEffect(() => {
    if (!usesThemeDefault.current) return
    const rgba = readPrimary()
    if (rgba && formatHex(rgba) !== hsvaToHex(latest.current)) setHsvaState(rgbaToHsva(rgba))
  }, [])

  // Adopt controlled values from outside without losing the hue on greys.
  React.useEffect(() => {
    if (value === undefined) return
    const rgba = parseHex(value)
    if (!rgba) return
    if (formatHex(rgba) === hsvaToHex(latest.current)) return
    setHsvaState(rgbaToHsva(rgba, latest.current))
  }, [value])

  const setHsva = React.useCallback(
    (next: Hsva, commitNow = false) => {
      const c = { ...next, a: alpha ? clamp(next.a, 0, 1) : 1 }
      const before = hsvaToHex(latest.current)
      latest.current = c
      setHsvaState(c)
      const hex = hsvaToHex(c)
      if (hex !== before) onValueChange?.(hex)
      if (commitNow) onValueCommit?.(hex)
    },
    [alpha, onValueChange, onValueCommit]
  )
  const commit = React.useCallback(() => onValueCommit?.(hsvaToHex(latest.current)), [onValueCommit])

  const ctx = React.useMemo(
    () => ({ hsva, hex: hsvaToHex(hsva), setHsva, commit, alpha, disabled }),
    [hsva, setHsva, commit, alpha, disabled]
  )

  return (
    <ColorPickerContext.Provider value={ctx}>
      <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>
    </ColorPickerContext.Provider>
  )
}

/* ─────────────────────────── trigger + content ─────────────────────────── */

/** Raised chip showing the colour and its hex. The popup grows from a chip-shaped seed just below it. */
function ColorPickerTrigger({
  className,
  children,
  showHex = true,
  ...props
}: PopoverPrimitive.Trigger.Props & { showHex?: boolean }) {
  const { hex, hsva, disabled } = useColorPicker()
  return (
    <PopoverPrimitive.Trigger
      data-slot="color-picker-trigger"
      disabled={disabled}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg bg-card py-1 pr-3 pl-1.5 text-ui font-medium text-secondary-foreground shadow-raised transition-[box-shadow,background-color,opacity,scale] duration-150 ease-out outline-none hover:bg-accent hover:shadow-raised-hover focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        !showHex && "pr-1.5",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <ColorPickerSwatch />
          {showHex ? <span className="font-mono text-ui-sm tabular-nums uppercase">{hex}</span> : null}
          <span className="sr-only">{`, current colour ${hex}${hsva.a < 1 ? `, ${Math.round(hsva.a * 100)}% opacity` : ""}`}</span>
        </>
      )}
    </PopoverPrimitive.Trigger>
  )
}

/**
 * Popup panel. It opens below the trigger, start-aligned so its left edge lines
 * up with the trigger's, and grows from a chip-shaped seed the trigger's size
 * (clip-path morph), then shrinks back into it on close.
 */
function ColorPickerContent({
  className,
  style,
  align = "start",
  sideOffset = 8,
  collisionPadding = 8,
  triggerRadius = "var(--radius-lg)",
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "sideOffset" | "collisionPadding"> & {
    /** Corner radius of the trigger shape the panel starts from (CSS length). Defaults to `var(--radius-lg)`, the radius of `ColorPickerTrigger`. */
    triggerRadius?: string
  }) {
  // Portaled popups leave the DOM subtree that sets `dir`; carry the provider direction over.
  const dir = useDirection() === "rtl" ? "rtl" : undefined
  return (
    <PopoverPrimitive.Portal dir={dir}>
      <PopoverPrimitive.Positioner
        className="z-50 outline-none"
        side="bottom"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
      >
        <PopoverPrimitive.Popup
          data-slot="color-picker-content"
          style={(state) =>
            ({ "--morph-r0": triggerRadius, ...(typeof style === "function" ? style(state) : style) }) as React.CSSProperties
          }
          className={cn(
            "flex w-64 flex-col gap-3 frame-2xl frame-p-3 bg-popover text-ui text-popover-foreground shadow-surface outline-none",
            // Morph: rest shape keeps the shadow; start/end shape is the trigger chip.
            "[clip-path:inset(-24px_round_44px)] transition-[clip-path,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:duration-250",
            "data-[side=bottom]:data-starting-style:[clip-path:inset(0_calc(100%_-_var(--anchor-width))_calc(100%_-_var(--anchor-height))_0_round_var(--morph-r0))]",
            "data-[side=bottom]:data-ending-style:[clip-path:inset(0_calc(100%_-_var(--anchor-width))_calc(100%_-_var(--anchor-height))_0_round_var(--morph-r0))]",
            "data-[side=top]:data-starting-style:[clip-path:inset(calc(100%_-_var(--anchor-height))_calc(100%_-_var(--anchor-width))_0_0_round_var(--morph-r0))]",
            "data-[side=top]:data-ending-style:[clip-path:inset(calc(100%_-_var(--anchor-height))_calc(100%_-_var(--anchor-width))_0_0_round_var(--morph-r0))]",
            "data-ending-style:opacity-0 data-starting-style:opacity-60",
            "motion-reduce:transition-opacity motion-reduce:data-starting-style:[clip-path:inset(-24px_round_44px)] motion-reduce:data-ending-style:[clip-path:inset(-24px_round_44px)] motion-reduce:data-starting-style:opacity-0",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

/* ─────────────────────────── area ─────────────────────────── */

/** Saturation (x) × brightness (y) plane. Arrow keys nudge 1% (Shift = 10%). */
function ColorPickerArea({
  className,
  style,
  label: labelProp,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { label?: string }) {
  const { labels } = useLocale()
  const label = labelProp ?? labels.saturationBrightness
  const { hsva, setHsva, commit, disabled } = useColorPicker()
  const ref = React.useRef<HTMLDivElement>(null)
  const thumb = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)

  const fromPointer = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    const s = clamp((e.clientX - r.left) / r.width, 0, 1)
    const v = clamp(1 - (e.clientY - r.top) / r.height, 0, 1)
    setHsva({ ...hsva, s, v })
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.01
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    }
    const d = delta[e.key]
    if (!d) return
    e.preventDefault()
    setHsva({ ...hsva, s: clamp(hsva.s + d[0], 0, 1), v: clamp(hsva.v + d[1], 0, 1) }, true)
  }

  const rgb = hsvaToRgba({ ...hsva, a: 1 })

  return (
    <div
      ref={ref}
      data-slot="color-picker-area"
      data-disabled={disabled || undefined}
      className={cn(
        "relative h-40 w-full cursor-crosshair touch-none rounded-inner select-none data-disabled:pointer-events-none data-disabled:opacity-50",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-well",
        className
      )}
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsva.h} 100% 50%))`,
        ...style,
      }}
      {...props}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        e.currentTarget.setPointerCapture(e.pointerId)
        setDragging(true)
        fromPointer(e)
        thumb.current?.focus({ preventScroll: true })
      }}
      onPointerMove={(e) => {
        if (dragging) fromPointer(e)
      }}
      onPointerUp={() => {
        if (!dragging) return
        setDragging(false)
        commit()
      }}
      onPointerCancel={() => setDragging(false)}
    >
      <div
        ref={thumb}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-roledescription={labels.slider2d}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(hsva.s * 100)}
        aria-valuetext={labels.saturationBrightnessValue(Math.round(hsva.s * 100), Math.round(hsva.v * 100))}
        onKeyDown={onKeyDown}
        data-dragging={dragging || undefined}
        className={cn(
          "absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none",
          "shadow-[0_0_0_2.5px_white,0_0_0_3px_rgb(0_0_0/0.2),0_2px_6px_rgb(0_0_0/0.35)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Loupe: the thumb lifts and magnifies while dragging.
          "transition-[scale,translate,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] data-dragging:-translate-y-[calc(50%+14px)] data-dragging:scale-[1.8] data-dragging:shadow-[0_0_0_2px_white,0_0_0_2.5px_rgb(0_0_0/0.2),0_8px_18px_-4px_rgb(0_0_0/0.45)] motion-reduce:transition-none motion-reduce:data-dragging:translate-y-[-50%] motion-reduce:data-dragging:scale-110"
        )}
        style={{ left: `${hsva.s * 100}%`, top: `${(1 - hsva.v) * 100}%`, background: rgbaCss(rgb) }}
      />
    </div>
  )
}

/* ─────────────────────────── channel sliders ─────────────────────────── */

type ChannelSliderPassthrough = Omit<
  SliderPrimitive.Root.Props,
  "value" | "defaultValue" | "min" | "max" | "step" | "onValueChange" | "onValueCommitted" | "onChange" | "children" | "className"
> & { className?: string }

function ChannelSlider({
  className,
  value,
  max,
  step,
  label,
  track,
  thumbColor,
  onChange,
  onCommit,
  disabled,
  checker,
  ...props
}: Omit<ChannelSliderPassthrough, "disabled"> & {
  className?: string
  value: number
  max: number
  step: number
  label: string
  track: string
  thumbColor: string
  onChange: (v: number) => void
  onCommit: () => void
  disabled: boolean
  checker?: boolean
}) {
  return (
    <SliderPrimitive.Root
      data-slot="color-picker-slider"
      {...props}
      value={value}
      min={0}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))}
      onValueCommitted={() => onCommit()}
      className={cn("w-full touch-none select-none data-disabled:opacity-50", className)}
    >
      <SliderPrimitive.Control className="relative flex h-5 w-full cursor-pointer items-center">
        <SliderPrimitive.Track
          className="relative h-3 w-full rounded-full shadow-well"
          style={{ background: checker ? `${track}, ${CHECKER}` : track }}
        >
          <SliderPrimitive.Thumb
            getAriaLabel={() => label}
            className="block size-4.5 rounded-full shadow-[0_0_0_2.5px_white,0_0_0_3px_rgb(0_0_0/0.2),0_2px_5px_rgb(0_0_0/0.3)] outline-none transition-[scale] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 data-dragging:scale-115 has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 motion-reduce:transition-none"
            style={{ background: thumbColor }}
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

type ColorPickerChannelProps = ChannelSliderPassthrough & {
  /** Accessible name of the thumb. */
  label?: string
}

/** Hue slider (0–360). Other props go to the Slider root. */
function ColorPickerHue({ label, disabled: disabledProp, ...props }: ColorPickerChannelProps) {
  const { labels } = useLocale()
  const { hsva, setHsva, commit, disabled } = useColorPicker()
  return (
    <ChannelSlider
      {...props}
      label={label ?? labels.hue}
      value={hsva.h}
      max={360}
      step={1}
      disabled={disabled || !!disabledProp}
      track="linear-gradient(to right, #f00 0%, #ff0 16.66%, #0f0 33.33%, #0ff 50%, #00f 66.66%, #f0f 83.33%, #f00 100%)"
      thumbColor={`hsl(${hsva.h} 100% 50%)`}
      onChange={(h) => setHsva({ ...hsva, h })}
      onCommit={commit}
    />
  )
}

/** Opacity slider. Only meaningful with `alpha` on the root. Other props go to the Slider root. */
function ColorPickerAlpha({ label, disabled: disabledProp, ...props }: ColorPickerChannelProps) {
  const { labels } = useLocale()
  const { hsva, setHsva, commit, disabled } = useColorPicker()
  const { r, g, b } = hsvaToRgba(hsva)
  return (
    <ChannelSlider
      {...props}
      label={label ?? labels.opacity}
      value={Math.round(hsva.a * 100)}
      max={100}
      step={1}
      disabled={disabled || !!disabledProp}
      checker
      track={`linear-gradient(to right, rgb(${r} ${g} ${b} / 0), rgb(${r} ${g} ${b}))`}
      thumbColor={rgbaCss(hsvaToRgba(hsva))}
      onChange={(a) => setHsva({ ...hsva, a: a / 100 })}
      onCommit={commit}
    />
  )
}

/* ─────────────────────────── fields + swatches ─────────────────────────── */

/** Hex field in an inset well. Commits on Enter or blur; invalid input reverts. */
function ColorPickerHexInput({
  className,
  "aria-label": ariaLabelProp,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange">) {
  const { labels } = useLocale()
  const ariaLabel = ariaLabelProp ?? labels.hexColour
  const { hex, hsva, setHsva, disabled } = useColorPicker()
  const [draft, setDraft] = React.useState(hex.slice(1))
  const [focused, setFocused] = React.useState(false)
  React.useEffect(() => {
    if (!focused) setDraft(hex.slice(1))
  }, [hex, focused])

  const apply = () => {
    const rgba = parseHex(draft)
    if (rgba) setHsva(rgbaToHsva(rgba, hsva), true)
    else setDraft(hex.slice(1))
  }

  return (
    <label
      data-slot="color-picker-hex"
      className={cn(
        "flex h-8 min-w-0 flex-1 items-center gap-1 rounded-inner bg-background dark:bg-input/32 px-2.5 font-mono text-ui-sm shadow-well transition-[box-shadow,background-color] focus-within:ring-2 focus-within:ring-ring",
        className
      )}
    >
      <span aria-hidden className="text-muted-foreground">
        #
      </span>
      <input
        aria-label={ariaLabel}
        spellCheck={false}
        autoComplete="off"
        maxLength={9}
        disabled={disabled}
        value={draft}
        onFocus={(e) => {
          setFocused(true)
          e.currentTarget.select()
        }}
        onBlur={() => {
          setFocused(false)
          apply()
        }}
        onChange={(e) => {
          const next = e.target.value.replace(/[^0-9a-f#]/gi, "").replace(/^#/, "")
          setDraft(next)
          // Live-apply complete 6/8-digit values while typing.
          if (next.length === 6 || next.length === 8) {
            const rgba = parseHex(next)
            if (rgba) setHsva(rgbaToHsva(rgba, hsva))
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            apply()
          } else if (e.key === "Escape" && draft !== hex.slice(1)) {
            e.stopPropagation()
            setDraft(hex.slice(1))
          }
        }}
        className="w-full min-w-0 bg-transparent uppercase tabular-nums outline-none disabled:opacity-50"
        {...props}
      />
    </label>
  )
}

/** The current colour over a checkerboard (so transparency shows). */
function ColorPickerSwatch({ className, style, ...props }: React.ComponentProps<"span">) {
  const { hsva } = useColorPicker()
  return (
    <span
      aria-hidden
      data-slot="color-picker-swatch"
      className={cn(
        "relative inline-block size-5 shrink-0 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground)_12%,transparent)]",
        className
      )}
      style={{ background: `linear-gradient(${rgbaCss(hsvaToRgba(hsva))}, ${rgbaCss(hsvaToRgba(hsva))}), ${CHECKER}`, ...style }}
      {...props}
    />
  )
}

function ColorPickerPresets({ className, ...props }: React.ComponentProps<"div">) {
  const { labels } = useLocale()
  return (
    <div
      role="group"
      data-slot="color-picker-presets"
      className={cn("-m-0.75 flex flex-wrap gap-0.5", className)}
      {...props}
      aria-label={props["aria-label"] ?? labels.presets}
    />
  )
}

/**
 * One preset colour. `value` is a hex string. An 18px swatch centred in a 24px
 * hit area; the selected ring sits concentric around it (1.5px gap + 1.5px ring).
 */
function ColorPickerPreset({
  value,
  label,
  className,
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "value"> & { value: string; label?: string }) {
  const { hex, hsva, setHsva, disabled } = useColorPicker()
  const rgba = parseHex(value)
  const active = rgba ? formatHex(rgba) === hex : false
  return (
    <button
      type="button"
      data-slot="color-picker-preset"
      aria-pressed={active}
      disabled={disabled || !rgba}
      onClick={(e) => {
        onClick?.(e)
        if (rgba && !e.defaultPrevented) setHsva(rgbaToHsva(rgba, hsva), true)
      }}
      className={cn(
        "group/preset inline-flex size-6 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
      aria-label={props["aria-label"] ?? label ?? value}
    >
      <span
        aria-hidden
        className={cn(
          "size-4.5 rounded-full shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground)_12%,transparent)] transition-[scale,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/preset:scale-110 group-disabled/preset:scale-100 motion-reduce:transition-none",
          "group-aria-pressed/preset:scale-100 group-aria-pressed/preset:shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground)_12%,transparent),0_0_0_1.5px_var(--popover),0_0_0_3px_var(--foreground)]"
        )}
        style={{ background: rgba ? `linear-gradient(${rgbaCss(rgba)}, ${rgbaCss(rgba)}), ${CHECKER}` : undefined }}
      />
    </button>
  )
}

export {
  ColorPicker,
  ColorPickerTrigger,
  ColorPickerContent,
  ColorPickerArea,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerHexInput,
  ColorPickerSwatch,
  ColorPickerPresets,
  ColorPickerPreset,
  useColorPicker,
  hsvaToRgba,
  rgbaToHsva,
  parseHex,
  formatHex,
}
export type { Hsva, Rgba, ColorPickerProps, ColorPickerChannelProps }
