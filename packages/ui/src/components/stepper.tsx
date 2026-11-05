"use client"

import * as React from "react"
import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { MinusIcon, PlusIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"

type StepperProps = NumberFieldPrimitive.Root.Props & {
  /** Accessible label for the value input. */
  "aria-label"?: string
  /** Text after the number, e.g. "guests". Visual only. */
  unit?: React.ReactNode
  size?: "sm" | "default"
  /** Accessible name of the − button. */
  decrementLabel?: string
  /** Accessible name of the + button. */
  incrementLabel?: string
}

/**
 * Numeric stepper: − value +. Digits roll up or down as the value changes and
 * the buttons switch off at min / max. Typing, arrow keys and wheel scrub come
 * from the NumberField primitive.
 */
function Stepper({
  className,
  value,
  defaultValue,
  onValueChange,
  format,
  locale,
  unit,
  size = "default",
  decrementLabel: decrementLabelProp,
  incrementLabel: incrementLabelProp,
  "aria-label": ariaLabel,
  ...props
}: StepperProps) {
  const { labels } = useLocale()
  const incrementLabel = incrementLabelProp ?? labels.increase
  const decrementLabel = decrementLabelProp ?? labels.decrease
  const [current, setCurrent] = React.useState<number | null>(value ?? defaultValue ?? null)
  const [direction, setDirection] = React.useState<1 | -1>(1)
  const [editing, setEditing] = React.useState(false)
  const reduce = useReducedMotion()
  const currentRef = React.useRef(current)
  currentRef.current = current

  React.useEffect(() => {
    if (value !== undefined) setCurrent(value)
  }, [value])

  const formatter = React.useMemo(() => new Intl.NumberFormat(locale, format), [locale, format])
  const text = current == null ? "–" : formatter.format(current)
  const chars = Array.from(text)
  const sm = size === "sm"

  return (
    <NumberFieldPrimitive.Root
      data-slot="stepper"
      value={value}
      defaultValue={defaultValue}
      format={format}
      locale={locale}
      onValueChange={(next, details) => {
        const prev = currentRef.current
        if (prev != null && next != null && next !== prev) setDirection(next > prev ? 1 : -1)
        setCurrent(next)
        onValueChange?.(next, details)
      }}
      className={cn("inline-flex", className)}
      {...props}
    >
      <NumberFieldPrimitive.Group
        data-slot="stepper-group"
        className={cn(
          "group/stepper inline-flex items-center gap-1 rounded-lg bg-muted p-1 shadow-well data-disabled:opacity-50",
          sm ? "h-8" : "h-10"
        )}
      >
        <NumberFieldPrimitive.Decrement data-slot="stepper-decrement" className={stepButton(sm)} aria-label={decrementLabel}>
          <MinusIcon />
        </NumberFieldPrimitive.Decrement>

        <div className={cn("relative grid h-full place-items-center", sm ? "min-w-9" : "min-w-12")}>
          <NumberFieldPrimitive.Input
            data-slot="stepper-input"
            aria-label={ariaLabel}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            className={cn(
              "absolute inset-0 w-full bg-transparent text-center font-medium tabular-nums outline-none selection:bg-primary/25",
              sm ? "text-ui" : "text-base",
              editing ? "text-foreground" : "text-transparent caret-transparent"
            )}
          />
          {/* Rolling display; hidden while the field is being typed into. */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none flex items-center justify-center overflow-hidden px-1 font-medium tabular-nums text-foreground transition-opacity duration-150",
              sm ? "h-6 text-ui" : "h-7 text-base",
              editing && "opacity-0"
            )}
          >
            {chars.map((char, i) => {
              const slot = chars.length - i
              return (
                <span key={slot} className="relative inline-flex h-full items-center justify-center">
                  <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                    <motion.span
                      key={char}
                      custom={direction}
                      variants={{
                        enter: (d: number) => (reduce ? { opacity: 0 } : { y: d * 14, opacity: 0, filter: "blur(2px)" }),
                        center: { y: 0, opacity: 1, filter: "blur(0px)" },
                        exit: (d: number) => (reduce ? { opacity: 0 } : { y: d * -14, opacity: 0, filter: "blur(2px)" }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 520, damping: 34, mass: 0.6 }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  </AnimatePresence>
                </span>
              )
            })}
            {unit ? <span className="ms-1 text-muted-foreground">{unit}</span> : null}
          </span>
        </div>

        <NumberFieldPrimitive.Increment data-slot="stepper-increment" className={stepButton(sm)} aria-label={incrementLabel}>
          <PlusIcon />
        </NumberFieldPrimitive.Increment>
      </NumberFieldPrimitive.Group>
    </NumberFieldPrimitive.Root>
  )
}

function stepButton(sm: boolean) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md bg-card text-foreground shadow-raised outline-none select-none",
    "transition-[scale,box-shadow,background-color,opacity,color] duration-150 ease-out hover:bg-accent hover:shadow-raised-hover",
    "focus-visible:ring-2 focus-visible:ring-ring",
    "data-disabled:pointer-events-none data-disabled:bg-transparent data-disabled:bg-none data-disabled:text-muted-foreground/60 data-disabled:shadow-none",
    sm ? "size-6 [&_svg]:size-3.5" : "size-8 [&_svg]:size-4"
  )
}

export { Stepper }
export type { StepperProps }
