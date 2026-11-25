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

const DOT_SPRING = { type: "spring", stiffness: 420, damping: 32, mass: 0.6 } as const
const INSTANT = { duration: 0 } as const

type RadioGroupContextValue = {
  id: string
  value: unknown
  reduce: boolean
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)
const RadioSizeContext = React.createContext<RadioSize | undefined>(undefined)

/** Groups radios; the selected dot glides from one radio to the next. `size` sizes every radio. */
function RadioGroup<Value>({ className, size, value, defaultValue, onValueChange, ...props }: RadioGroupPrimitive.Props<Value> & { size?: RadioSize }) {
  const id = React.useId()
  const reduce = useReducedMotion() ?? false
  const [inner, setInner] = React.useState<unknown>(defaultValue)
  const current = value !== undefined ? value : inner
  const ctx = React.useMemo(() => ({ id, value: current, reduce }), [id, current, reduce])

  return (
    <RadioSizeContext.Provider value={size}>
      <RadioGroupContext.Provider value={ctx}>
        <LayoutGroup id={id}>
          <RadioGroupPrimitive
            data-slot="radio-group"
            data-size={size}
            value={value}
            defaultValue={defaultValue}
            onValueChange={(nextValue, details) => {
              onValueChange?.(nextValue, details)
              if (value === undefined && !details.isCanceled) setInner(nextValue)
            }}
            className={cn("flex flex-col gap-3", className)}
            {...props}
          />
        </LayoutGroup>
      </RadioGroupContext.Provider>
    </RadioSizeContext.Provider>
  )
}

function Radio<Value>({ className, size: sizeProp, value, ...props }: RadioPrimitive.Root.Props<Value> & VariantProps<typeof radioVariants>) {
  const group = React.useContext(RadioGroupContext)
  const groupSize = React.useContext(RadioSizeContext)
  const inherited = useControlSize<ControlSize>(sizeProp ?? groupSize)
  const size: RadioSize = inherited === "xs" ? "sm" : inherited
  const standaloneReduce = useReducedMotion() ?? false
  const reduce = group ? group.reduce : standaloneReduce
  const selected = group !== null && group.value !== undefined && group.value === value

  return (
    <RadioPrimitive.Root
      data-slot="radio"
      data-size={size}
      value={value}
      className={cn(
        radioVariants({ size }),
        "peer group/radio relative inline-flex shrink-0 cursor-pointer after:absolute after:-inset-1 items-center justify-center rounded-full bg-background shadow-[inset_0_0_0_1px_var(--border-control)] outline-none dark:bg-input/32",
                "focus-visible:ring-2 focus-visible:ring-ring data-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] data-disabled:cursor-not-allowed data-disabled:opacity-64",
        className
      )}
      {...props}
    >
      {group ? (
        // Render synchronously from group state so only one shared-layout dot exists per commit
        // and its snapshot is taken with the current scroll offset.
        selected && (
          <span data-slot="radio-indicator" className="flex items-center justify-center">
            <motion.span
              layout={reduce ? undefined : "position"}
              layoutId={reduce ? undefined : `${group.id}-dot`}
              initial={false}
              transition={reduce ? INSTANT : DOT_SPRING}
              data-slot="radio-dot"
              className="block rounded-full bg-primary will-change-transform"
            />
          </span>
        )
      ) : (
        <RadioPrimitive.Indicator data-slot="radio-indicator" className="flex items-center justify-center">
          <motion.span
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={reduce ? INSTANT : DOT_SPRING}
            data-slot="radio-dot"
            className="block rounded-full bg-primary"
          />
        </RadioPrimitive.Indicator>
      )}
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, Radio, radioVariants }
export type { RadioSize }
