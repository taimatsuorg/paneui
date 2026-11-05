"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field"
import { AnimatePresence, LayoutGroup, animate, motion, useReducedMotion } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"

type OTPStatus = "idle" | "error" | "success"

type OTPInputProps = Omit<OTPFieldPrimitive.Root.Props, "length" | "children"> & {
  /** Number of slots. Default 6. */
  length?: number
  /** Visible label above the slots (also labels the field). */
  label?: React.ReactNode
  /** Helper text below the slots while idle. */
  hint?: React.ReactNode
  /** "error" shakes the row and tints it; "success" tints it and draws a check. */
  status?: OTPStatus
  errorMessage?: React.ReactNode
  successMessage?: React.ReactNode
  /** Insert a gap after this many slots, e.g. 3 for "123 456". */
  groupSize?: number
}

/**
 * One-time-code input built on the OTPField primitive: per-slot inputs with paste,
 * SMS autofill and arrow-key navigation. A focus ring glides between slots,
 * digits roll in, errors shake and success draws a check.
 */
function OTPInput({
  length = 6,
  label,
  hint,
  status = "idle",
  errorMessage,
  successMessage,
  groupSize,
  value,
  defaultValue,
  onValueChange,
  mask,
  disabled,
  className,
  "aria-label": ariaLabel,
  ...props
}: OTPInputProps) {
  const l10n = useLocale().labels

  const id = React.useId()
  const reduce = useReducedMotion()
  const rowRef = React.useRef<HTMLDivElement>(null)
  const [current, setCurrent] = React.useState(value ?? defaultValue ?? "")
  const [focused, setFocused] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (value !== undefined) setCurrent(value)
  }, [value])

  // Replays on every transition into "error".
  React.useEffect(() => {
    if (status !== "error" || reduce || !rowRef.current) return
    animate(rowRef.current, { x: [0, -6, 6, -4, 4, -1.5, 0] }, { duration: 0.45, ease: [0.22, 1, 0.36, 1] })
  }, [status, reduce])

  const message = status === "error" ? errorMessage : status === "success" ? successMessage : hint
  const labelId = `${id}-label`

  return (
    <div data-slot="otp-input" className={cn("inline-flex flex-col gap-2.5", className)}>
      {label ? (
        <span id={labelId} className="text-ui font-medium text-foreground">
          {label}
        </span>
      ) : null}
      <div className="relative inline-flex w-max items-center">
        <OTPFieldPrimitive.Root
          length={length}
          value={value}
          defaultValue={defaultValue}
          mask={mask}
          disabled={disabled}
          aria-label={label ? undefined : (ariaLabel ?? l10n.onetimeCode)}
          aria-invalid={status === "error" || undefined}
          onValueChange={(next, details) => {
            setCurrent(next)
            onValueChange?.(next, details)
          }}
          {...props}
          aria-labelledby={props["aria-labelledby"] ?? (label ? labelId : undefined)}
          ref={rowRef}
          className="flex items-center gap-2"
        >
          <LayoutGroup id={id}>
            {Array.from({ length }, (_, i) => {
              const char = current[i] ?? ""
              const isFocused = focused === i
              return (
                <React.Fragment key={i}>
                  {groupSize && i > 0 && i % groupSize === 0 ? (
                    <span aria-hidden className="mx-0.5 h-0.5 w-2.5 rounded-full bg-foreground/20" />
                  ) : null}
                  <div
                    data-slot="otp-slot"
                    data-filled={char ? "" : undefined}
                    data-status={status}
                    className={cn(
                      "relative grid h-12 w-10 place-items-center rounded-xl bg-muted shadow-well transition-[background-color,box-shadow] duration-200",
                      char && "bg-card",
                      status === "error" && "inset-ring inset-ring-destructive ring-3 ring-destructive/18",
                      status === "success" && "inset-ring inset-ring-success ring-3 ring-success/16",
                      disabled && "opacity-50"
                    )}
                  >
                    <OTPFieldPrimitive.Input
                      data-slot="otp-slot-input"
                      onFocus={() => setFocused(i)}
                      onBlur={() => setFocused((f) => (f === i ? null : f))}
                      className="absolute inset-0 z-10 size-full cursor-text rounded-xl bg-transparent text-center text-transparent caret-transparent outline-none selection:bg-transparent disabled:cursor-not-allowed"
                    />
                    {isFocused && status === "idle" ? (
                      <motion.span
                        layoutId="otp-focus-ring"
                        aria-hidden
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 460, damping: 34, mass: 0.6 }}
                        className="pointer-events-none absolute inset-0 rounded-xl inset-ring-2 inset-ring-primary ring-3 ring-ring"
                      />
                    ) : null}
                    {isFocused && !char && status === "idle" ? (
                      <motion.span
                        aria-hidden
                        animate={reduce ? undefined : { opacity: [1, 1, 0, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="pointer-events-none absolute h-5 w-0.5 rounded-full bg-primary"
                      />
                    ) : null}
                    <AnimatePresence initial={false}>
                      {char ? (
                        <motion.span
                          key={char}
                          aria-hidden
                          initial={reduce ? { opacity: 0 } : { y: 16, opacity: 0, filter: "blur(3px)" }}
                          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                          exit={reduce ? { opacity: 0 } : { y: -16, opacity: 0, filter: "blur(3px)" }}
                          transition={reduce ? { duration: 0.1 } : { type: "spring", stiffness: 500, damping: 32, mass: 0.6 }}
                          className="pointer-events-none absolute inset-0 grid place-items-center text-xl font-semibold text-foreground tabular-nums"
                        >
                          {mask ? "•" : char}
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </React.Fragment>
              )
            })}
          </LayoutGroup>
        </OTPFieldPrimitive.Root>

        <AnimatePresence>
          {status === "success" ? (
            <motion.span
              aria-hidden
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              transition={reduce ? { duration: 0 } : { type: "spring", duration: 0.3, bounce: 0 }}
              className="absolute -right-9 grid size-6 place-items-center rounded-full bg-success text-success-foreground"
            >
              <svg viewBox="0 0 18 18" fill="none" className="size-4">
                <motion.path
                  d="M4.4 9.6l3 3 6.2-6.4"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: reduce ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      {message ? (
        <p
          aria-live="polite"
          className={cn(
            "text-ui",
            status === "error" ? "text-destructive-text" : status === "success" ? "text-success-text" : "text-muted-foreground"
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}

export { OTPInput }
export type { OTPInputProps, OTPStatus }
