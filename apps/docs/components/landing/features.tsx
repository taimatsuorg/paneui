"use client"

import { SegmentedControl, SegmentedControlItem } from "@paneui/ui/components/segmented-control"
import { SwatchPicker } from "@paneui/ui/components/swatch-picker"
import { cn } from "@paneui/ui/lib/utils"
import { PRESET_LABELS, PRESET_THEMES, type PresetAccent } from "@/components/docs/accent-color"
import { setAccent, useAccentState } from "@/components/docs/accent-store"
import { setRadius, useRadiusState, type RadiusChoice } from "@/components/docs/radius-store"
import { RADII } from "@/components/docs/theme-script"
import { siteCopy } from "@/lib/site-copy"
import { useT } from "@/lib/site-locale"

/* The radius presets in order, smallest to largest; M is the default. */
const RADIUS_SHORT: Record<(typeof RADII)[number], string> = { none: "0", sm: "S", default: "M", lg: "L", xl: "XL" }
const isRadius = (v: unknown): v is RadiusChoice => v === "custom" || (RADII as readonly string[]).includes(v as string)

export function AccentControls({ className }: { className?: string }) {
  const t = useT()
  const { accent } = useAccentState()
  const radius = useRadiusState()
  const swatches = (Object.keys(PRESET_LABELS) as PresetAccent[]).map((a) => ({
    value: a,
    label: t(siteCopy(PRESET_LABELS[a])),
    color: a === "neutral" ? "var(--foreground)" : PRESET_THEMES[a].light.primary,
  }))
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="flex h-8 items-center rounded-control border border-border bg-card px-3">
        <SwatchPicker
          aria-label={t({ en: "Accent", zh: "主题色" })}
          swatches={swatches}
          value={accent === "custom" ? "" : accent}
          onValueChange={(v) => setAccent(v as PresetAccent)}
        />
      </div>
      <SegmentedControl
        value={radius.radius}
        onValueChange={(v) => isRadius(v) && setRadius(v)}
        aria-label={t({ en: "Radius preset", zh: "圆角预设" })}
      >
        {RADII.map((r) => (
          <SegmentedControlItem key={r} value={r} className="min-w-9">
            {RADIUS_SHORT[r]}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  )
}
