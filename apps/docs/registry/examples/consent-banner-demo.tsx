"use client"

import * as React from "react"

import { BottomStack } from "@paneui/ui/components/bottom-stack"
import { Button } from "@paneui/ui/components/button"
import { ConsentBanner } from "@paneui/ui/components/consent-banner"

export default function ConsentBannerDemo() {
  const [round, setRound] = React.useState(0)
  const [answer, setAnswer] = React.useState<string | null>(null)

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-background shadow-raised">
        <div className="flex flex-col gap-2.5 p-5" aria-hidden>
          <div className="h-5 w-48 rounded-full bg-foreground/15" />
          <div className="h-3 w-full rounded-full bg-foreground/8" />
          <div className="h-3 w-4/5 rounded-full bg-foreground/8" />
        </div>
        <BottomStack className="absolute">
          <ConsentBanner
            key={round}
            policyHref="#consent-banner"
            onAccept={() => setAnswer("Allowed")}
            onDecline={() => setAnswer("Declined")}
          />
        </BottomStack>
      </div>
      {answer && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setAnswer(null)
            setRound((n) => n + 1)
          }}
        >
          {answer}. Ask again
        </Button>
      )}
    </div>
  )
}
