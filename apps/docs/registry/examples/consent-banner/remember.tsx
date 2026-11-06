"use client"

import { Button } from "@paneui/ui/components/button"
import { clearConsent, ConsentBanner, useConsent } from "@paneui/ui/components/consent-banner"

const KEY = "docs-consent:v1"

export default function ConsentBannerRemember() {
  const answer = useConsent(KEY)

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <ConsentBanner placement="inline" storageKey={KEY} policyHref="#consent-banner" />
      {answer && (
        <div className="flex items-center gap-3 text-ui text-muted-foreground">
          <span>Stored answer: {answer}</span>
          <Button variant="outline" size="sm" onClick={() => clearConsent(KEY)}>
            Ask again
          </Button>
        </div>
      )}
    </div>
  )
}
