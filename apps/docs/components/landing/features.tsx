"use client"

import { SwatchPicker } from "@paneui/ui/components/swatch-picker"
import { cn } from "@paneui/ui/lib/utils"
import { PRESET_LABELS, PRESET_THEMES, type PresetAccent } from "@/components/docs/accent-color"
import { setAccent, useAccentState } from "@/components/docs/accent-store"
import { siteCopy } from "@/lib/site-copy"
import { useT } from "@/lib/site-locale"

export function AccentControls({ className }: { className?: string }) {
  const t = useT()
  const { accent } = useAccentState()
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
    </div>
  )
}
