"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { ChevronsUpDownIcon } from "@paneui/ui/icons"
import { useControlSize } from "@paneui/core/control-size"
import { cn } from "@paneui/ui/lib/utils"

// Same well, heights and text as Input; the browser draws the option list.
const nativeSelectVariants = cva(
  "w-full min-w-0 cursor-pointer appearance-none bg-background shadow-well transition-[box-shadow,background-color] outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-64 dark:bg-input/32 aria-invalid:ring-2 aria-invalid:ring-destructive/30 [&>option]:bg-popover [&>option]:text-popover-foreground",
  {
    variants: {
      size: {
        xs: "h-6 rounded-sm ps-2 pe-6 text-ui-xs",
        sm: "h-7 rounded-lg ps-2.5 pe-7 text-ui",
        default: "h-8 rounded-lg ps-2.5 pe-8 text-ui",
        lg: "h-9 rounded-lg ps-3 pe-8 text-ui-lg",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> &
  VariantProps<typeof nativeSelectVariants> & {
    /** The native `size` attribute (visible rows). */
    htmlSize?: number
  }

/** The browser's own select, styled as a field. Best on touch devices and in long forms. */
function NativeSelect({ className, size, htmlSize, ...props }: NativeSelectProps) {
  const resolved = useControlSize(size)
  return (
    <div data-slot="native-select-wrapper" className={cn("relative w-full min-w-0", className)}>
      <select
        data-slot="native-select"
        data-size={resolved}
        size={htmlSize}
        className={nativeSelectVariants({ size: resolved })}
        {...props}
      />
      <ChevronsUpDownIcon
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          resolved === "xs" ? "end-1.5 size-3" : "end-2.5 size-3.5"
        )}
      />
    </div>
  )
}

function NativeSelectOption(props: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

function NativeSelectOptGroup(props: React.ComponentProps<"optgroup">) {
  return <optgroup data-slot="native-select-optgroup" {...props} />
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption, nativeSelectVariants }
export type { NativeSelectProps }
