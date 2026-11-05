"use client"

import * as React from "react"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { cn } from "@paneui/ui/lib/utils"

/**
 * Pick one colour from a fixed palette (text colour, highlight, tag colour).
 * A radio group: arrow keys move between swatches, the selected one gets a
 * concentric ring. `variant="letter"` shows an "A" in each colour (text colour
 * menus); `dot` shows the colour itself. A swatch without `color` is the
 * "none / default" choice and is drawn with a diagonal slash.
 */
type Swatch = {
  value: string
  label: string
  /** Any CSS colour (`var(--chart-1)`, `#e11d48`). Omit for "none". */
  color?: string
}

type SwatchPickerProps = Omit<RadioGroupPrimitive.Props<string>, "children"> & {
  swatches: Swatch[]
  variant?: "dot" | "letter"
  /** Optional visible label above the swatches. */
  label?: React.ReactNode
}

function SwatchPicker({ swatches, variant = "dot", label, className, ...props }: SwatchPickerProps) {
  const labelId = React.useId()
  return (
    <div data-slot="swatch-picker" className={cn("flex flex-col gap-1", className)}>
      {label && (
        <div id={labelId} className="px-0.5 text-ui-xs font-medium text-muted-foreground">
          {label}
        </div>
      )}
      <RadioGroupPrimitive
        className="-m-0.75 flex flex-wrap gap-0.5"
        {...props}
        aria-labelledby={props["aria-labelledby"] ?? (label ? labelId : undefined)}
      >
        {swatches.map((s) => (
          <SwatchPickerItem key={s.value} swatch={s} variant={variant} />
        ))}
      </RadioGroupPrimitive>
    </div>
  )
}

function SwatchPickerItem({ swatch, variant }: { swatch: Swatch; variant: "dot" | "letter" }) {
  const none = !swatch.color
  return (
    <RadioPrimitive.Root
      value={swatch.value}
      aria-label={swatch.label}
      title={swatch.label}
      data-slot="swatch-picker-item"
      className={cn(
        "group/swatch inline-flex size-6 cursor-pointer items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring data-disabled:cursor-not-allowed data-disabled:opacity-64",
        // letter tiles sit 2px inside the item, so its focus ring follows them
        variant === "letter" ? "frame-lg frame-inset-0.5" : "rounded-full"
      )}
    >
      {variant === "letter" ? (
        <span
          aria-hidden
          className={cn(
            "flex size-5 items-center justify-center rounded-inner text-ui font-semibold shadow-[inset_0_0_0_1px_var(--border)] transition-[box-shadow,background-color] duration-150 group-hover/swatch:bg-secondary",
            "group-data-checked/swatch:shadow-[inset_0_0_0_1px_var(--border),0_0_0_1.5px_var(--popover),0_0_0_3px_var(--foreground)]",
            none && "text-foreground"
          )}
          style={none ? undefined : { color: swatch.color }}
        >
          A
        </span>
      ) : (
        <span
          aria-hidden
          className={cn(
            "relative size-4.5 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground)_12%,transparent)] transition-[scale,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/swatch:scale-110 group-data-checked/swatch:scale-100 motion-reduce:transition-none",
            "group-data-checked/swatch:shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground)_12%,transparent),0_0_0_1.5px_var(--popover),0_0_0_3px_var(--foreground)]",
            none && "bg-background"
          )}
          style={none ? undefined : { background: swatch.color }}
        >
          {none && <span className="absolute top-1/2 left-1/2 h-px w-5 -translate-1/2 -rotate-45 bg-destructive" />}
        </span>
      )}
    </RadioPrimitive.Root>
  )
}

export { SwatchPicker }
export type { Swatch, SwatchPickerProps }
