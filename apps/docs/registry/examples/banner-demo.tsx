"use client"

import * as React from "react"

import { Banner } from "@paneui/ui/components/banner"
import { Button } from "@paneui/ui/components/button"

export default function BannerDemo() {
  const [round, setRound] = React.useState(0)
  const [open, setOpen] = React.useState(true)

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <div className="w-full overflow-hidden rounded-xl bg-background shadow-raised">
        <Banner
          key={round}
          dismissible
          onDismiss={() => setOpen(false)}
        >
          Version 2.0 is out. Update with <code>npm update</code> or read the <a href="#banner">release notes</a>.
        </Banner>
        <div className="flex h-12 items-center border-b border-border px-4 text-ui font-semibold">Acme Docs</div>
        <div className="h-20" />
      </div>
      {!open && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRound((n) => n + 1)
            setOpen(true)
          }}
        >
          Show again
        </Button>
      )}
    </div>
  )
}
