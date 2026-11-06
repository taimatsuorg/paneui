"use client"

import * as React from "react"

import { LocaleSwitcher } from "@paneui/ui/components/locale-switcher"

const locales = [
  { code: "en", label: "English", href: "/docs" },
  { code: "fr", label: "Français", href: "/fr/docs" },
  { code: "ko", label: "한국어", href: "/ko/docs" },
]

export default function LocaleSwitcherClientRouting() {
  const [value, setValue] = React.useState("en")
  const current = locales.find((l) => l.code === value)
  return (
    <div className="flex flex-col items-center gap-3">
      <LocaleSwitcher
        locales={locales}
        value={value}
        onSelect={(locale, event) => {
          event.preventDefault()
          setValue(locale.code)
        }}
      />
      <span className="font-mono text-ui-sm text-muted-foreground">{current?.href}</span>
    </div>
  )
}
