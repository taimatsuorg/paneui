"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@paneui/ui/lib/utils"

// Native toggles: a pressed state is a fill, never a press scale. Sizes follow the button
// density (lg h-9, h-8 default, sm h-7, xs h-6). For a one-of-many value with a raised thumb on a
// well, use SegmentedControl instead. `tile` stacks a large icon over its label, for a picker
// that swaps what is shown below it; put the glyph in ToggleGroupItemIcon, which raises when pressed.
const toggleVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-control text-ui font-medium whitespace-nowrap text-muted-foreground transition-[background-color,color,box-shadow] duration-150 ease-out outline-none select-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-64 data-pressed:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "data-pressed:bg-foreground/8 data-pressed:hover:bg-foreground/10",
        outline:
          "shadow-[inset_0_0_0_1px_var(--input)] data-pressed:bg-secondary data-pressed:shadow-[inset_0_0_0_1px_var(--input)]",
        tile: "group/toggle hover:bg-transparent",
      },
      size: {
        default: "h-8 min-w-8 px-2.5",
        sm: "h-7 min-w-7 px-2 [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-6 min-w-6 rounded-control-sm px-1.5 text-ui-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 min-w-9 px-3 text-ui-lg",
      },
    },
    compoundVariants: [
      {
        variant: "tile",
        // Tiles may give up a pixel or two in a tight row rather than overflow it.
        size: ["default", "sm", "xs", "lg"],
        className: "h-auto min-w-auto shrink flex-col gap-2.5 rounded-xl px-0 py-2 [&_svg:not([class*='size-'])]:size-6",
      },
      { variant: "tile", size: ["sm", "xs"], className: "text-ui-sm" },
      // Labels step up once the row has room.
      { variant: "tile", size: "default", className: "text-ui-sm sm:text-ui" },
      { variant: "tile", size: "lg", className: "text-ui" },
    ],
    defaultVariants: { variant: "default", size: "default" },
  }
)

type ToggleVariantProps = VariantProps<typeof toggleVariants>

/** A two-state button (bold on/off). `pressed` / `defaultPressed` / `onPressedChange`. */
function Toggle({ className, variant, size, ...props }: TogglePrimitive.Props & ToggleVariantProps) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      data-variant={variant ?? "default"}
      data-size={size ?? "default"}
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const ToggleGroupContext = React.createContext<ToggleVariantProps>({})

/**
 * A row of toggles sharing one value array (the ToggleGroup primitive). Single choice by
 * default (text alignment); `multiple` for independent marks (bold, italic).
 */
function ToggleGroup<Value extends string = string>({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: ToggleGroupPrimitive.Props<Value> & ToggleVariantProps) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "inline-flex w-fit items-center gap-0.5 data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

function ToggleGroupItem({ className, variant, size, ...props }: TogglePrimitive.Props & ToggleVariantProps) {
  const ctx = React.useContext(ToggleGroupContext)
  const v = variant ?? ctx.variant ?? "default"
  const s = size ?? ctx.size ?? "default"
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={v}
      data-size={s}
      className={cn(toggleVariants({ variant: v, size: s }), className)}
      {...props}
    />
  )
}

/** The raised square that holds a `tile` item's glyph. */
function ToggleGroupItemIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="toggle-group-item-icon"
      aria-hidden
      className={cn(
        "flex size-12 items-center justify-center rounded-2xl transition-[background-color,box-shadow] duration-200 ease-out group-hover/toggle:bg-foreground/5 group-data-pressed/toggle:bg-card group-data-pressed/toggle:shadow-raised",
        className
      )}
      {...props}
    />
  )
}

export { Toggle, ToggleGroup, ToggleGroupItem, ToggleGroupItemIcon, toggleVariants }
