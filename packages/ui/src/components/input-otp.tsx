"use client"

import * as React from "react"
import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field"
import { cva } from "class-variance-authority"

import { MinusIcon } from "@paneui/ui/icons"
import { ControlSizeContext, useControlSize, type ControlSize } from "@paneui/core/control-size"
import { cn } from "@paneui/ui/lib/utils"

/*
 * A one-time code field: one slot per character, paste fills every slot, Backspace walks back.
 *
 *   <InputOTP length={6}>
 *     <InputOTPGroup>{slots 1–3}</InputOTPGroup>
 *     <InputOTPSeparator />
 *     <InputOTPGroup>{slots 4–6}</InputOTPGroup>
 *   </InputOTP>
 */
type InputOTPProps = OTPFieldPrimitive.Root.Props & { size?: ControlSize }

function InputOTP({ className, size, ...props }: InputOTPProps) {
  const resolved = useControlSize(size)
  return (
    <ControlSizeContext.Provider value={resolved}>
      <OTPFieldPrimitive.Root
        data-slot="input-otp"
        data-size={resolved}
        className={cn("flex items-center gap-2 has-[:disabled]:opacity-64", className)}
        {...props}
      />
    </ControlSizeContext.Provider>
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="input-otp-group" className={cn("flex items-center gap-1.5", className)} {...props} />
}

// Square slots on the control height scale (xs 24 … lg 36), same well and focus ring as Input.
const slotVariants = cva(
  "bg-background text-center font-medium tabular-nums shadow-well caret-primary transition-[box-shadow,background-color] outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none dark:bg-input/32 aria-invalid:ring-2 aria-invalid:ring-destructive/30 data-[filled]:bg-card",
  {
    variants: {
      size: {
        xs: "size-6 rounded-sm text-ui-xs",
        sm: "size-7 rounded-lg text-ui",
        default: "size-8 rounded-lg text-ui-lg",
        lg: "size-9 rounded-lg text-base",
      },
    },
    defaultVariants: { size: "default" },
  }
)

function InputOTPSlot({ className, ...props }: OTPFieldPrimitive.Input.Props) {
  const size = useControlSize()
  return (
    <OTPFieldPrimitive.Input
      data-slot="input-otp-slot"
      className={cn(slotVariants({ size }), typeof className === "string" && className)}
      {...props}
    />
  )
}

function InputOTPSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div role="separator" data-slot="input-otp-separator" className={cn("text-muted-foreground/72 [&_svg]:size-3.5", className)} {...props}>
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot }
export type { InputOTPProps }
