"use client"

import * as React from "react"
import { Meter as MeterPrimitive } from "@base-ui/react/meter"

import { cn } from "@paneui/ui/lib/utils"

/*
 * How much of a quota is used: label, "used / limit" and a bar that turns
 * warning, then destructive, as it fills. Built on the Meter primitive
 * (role="meter", value text for screen readers).
 *
 *   <UsageMeter label="Agent runs" value={8420} max={10000} unit="runs" />
 */

type UsageMeterProps = Omit<MeterPrimitive.Root.Props, "children" | "format"> & {
  label: React.ReactNode
  /** Line under the bar, e.g. "Resets on Nov 1". */
  description?: React.ReactNode
  /** Appended to the numbers ("GB", "seats"). */
  unit?: string
  /** Share (0–1) where the bar turns warning. Default 0.75. */
  warnAt?: number
  /** Share (0–1) where the bar turns destructive. Default 0.9. */
  dangerAt?: number
  /** Number format for the readout. Default compact-free grouping. */
  formatOptions?: Intl.NumberFormatOptions
  /** Show "used / max" (default) or the percentage. */
  readout?: "value" | "percent" | "none"
}

function UsageMeter({
  label,
  description,
  unit,
  value,
  min = 0,
  max = 100,
  warnAt = 0.75,
  dangerAt = 0.9,
  locale = "en-US",
  formatOptions,
  readout = "value",
  className,
  ...props
}: UsageMeterProps) {
  const share = max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0
  const level = share >= dangerAt ? "danger" : share >= warnAt ? "warn" : "ok"
  const nf = React.useMemo(() => new Intl.NumberFormat(locale, formatOptions), [locale, formatOptions])
  const text =
    readout === "percent"
      ? `${Math.round(share * 100)}%`
      : `${nf.format(value)} / ${nf.format(max)}${unit ? ` ${unit}` : ""}`

  return (
    <MeterPrimitive.Root
      data-slot="usage-meter"
      data-level={level}
      value={value}
      min={min}
      max={max}
      locale={locale}
      getAriaValueText={() => `${nf.format(value)} of ${nf.format(max)}${unit ? ` ${unit}` : ""}`}
      className={cn("group/usage flex w-full flex-col gap-2 text-ui", className)}
      {...props}
    >
      <div className="flex items-baseline justify-between gap-3">
        <MeterPrimitive.Label className="min-w-0 truncate font-medium">{label}</MeterPrimitive.Label>
        {readout !== "none" && (
          <span className="shrink-0 text-ui-sm text-muted-foreground tabular-nums group-data-[level=danger]/usage:text-destructive-text">{text}</span>
        )}
      </div>
      <MeterPrimitive.Track className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted shadow-well">
        <MeterPrimitive.Indicator
          className={cn(
            "h-full rounded-full transition-[width,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            level === "danger" ? "bg-destructive" : level === "warn" ? "bg-warning" : "bg-primary"
          )}
        />
      </MeterPrimitive.Track>
      {description && <p className="text-ui-sm text-muted-foreground">{description}</p>}
    </MeterPrimitive.Root>
  )
}

export { UsageMeter }
export type { UsageMeterProps }
