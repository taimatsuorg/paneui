"use client"

import * as React from "react"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cva, type VariantProps } from "class-variance-authority"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"

import { useControlSize, type ControlSize } from "@paneui/core/control-size"
import { cn } from "@paneui/ui/lib/utils"

// Circle sizes: sm 14px, default 16px, lg 20px; the dot keeps half the diameter.
// An `xs` inherited from a Field maps to `sm`.
const radioVariants = cva("", {
  variants: {
    size: {
      sm: "size-3.5 [&_[data-slot=radio-dot]]:size-1.5",
      default: "size-4 [&_[data-slot=radio-dot]]:size-2",
      lg: "size-5 [&_[data-slot=radio-dot]]:size-2.5",
    },
  },
  defaultVariants: { size: "default" },
})

type RadioSize = "sm" | "default" | "lg"

const RadioGroupContext = React.createContext<string | null>(null)
const RadioSizeContext = React.createContext<RadioSize | undefined>(undefined)

/** Groups radios; the selected dot glides from one radio to the next. `size` sizes every radio. */
function RadioGroup<Value>({ className, size, ...props }: RadioGroupPrimitive.Props<Value> & { size?: RadioSize }) {
  const id = React.useId()
  return (
    <RadioSizeContext.Provider value={size}>
      <RadioGroupContext.Provider value={id}>
        <LayoutGroup id={id}>
          <RadioGroupPrimitive
            data-slot="radio-group"
            data-size={size}
            className={cn("flex flex-col gap-3", className)}
            {...props}
          />
        </LayoutGroup>
      </RadioGroupContext.Provider>
    </RadioSizeContext.Provider>
  )
}

function Radio<Value>({ className, size: sizeProp, ...props }: RadioPrimitive.Root.Props<Value> & VariantProps<typeof radioVariants>) {
  const groupId = React.useContext(RadioGroupContext)
  const groupSize = React.useContext(RadioSizeContext)
  const inherited = useControlSize<ControlSize>(sizeProp ?? groupSize)
  const size: RadioSize = inherited === "xs" ? "sm" : inherited
  const reduce = useReducedMotion()

  return (
    <RadioPrimitive.Root
      data-slot="radio"
      data-size={size}
      className={cn(
        radioVariants({ size }),
        "peer group/radio relative inline-flex shrink-0 cursor-pointer after:absolute after:-inset-1 items-center justify-center rounded-full bg-background shadow-[inset_0_0_0_1px_var(--border-control)] outline-none dark:bg-input/32",
                "focus-visible:ring-2 focus-visible:ring-ring data-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] data-disabled:cursor-not-allowed data-disabled:opacity-64",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator data-slot="radio-indicator" className="flex items-center justify-center">
        <motion.span
          layoutId={groupId ? `${groupId}-dot` : undefined}
          initial={groupId ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32, mass: 0.6 }}
          data-slot="radio-dot"
          className="block rounded-full bg-primary"
        />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, Radio, radioVariants }
export type { RadioSize }
