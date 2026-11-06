"use client"

import * as React from "react"

import { Banner, clearBannerDismissal } from "@paneui/ui/components/banner"
import { Button } from "@paneui/ui/components/button"

const KEY = "docs-banner:survey-2026"

export default function BannerPersistent() {
  const [round, setRound] = React.useState(0)

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <div className="w-full">
        <Banner key={round} storageKey={KEY} tone="neutral">
          Tell us how you use the library in a two-minute <a href="#banner">survey</a>.
        </Banner>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          clearBannerDismissal(KEY)
          setRound((n) => n + 1)
        }}
      >
        Forget dismissal
      </Button>
    </div>
  )
}
