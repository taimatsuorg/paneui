"use client"

import { ConsentBanner } from "@paneui/ui/components/consent-banner"

export default function ConsentBannerMarkdown() {
  return (
    <div className="w-full max-w-sm">
      <ConsentBanner
        placement="inline"
        text="We use **analytics** and a `session` cookie. See [what we collect](#consent-banner)."
        onCustomize={() => {}}
      />
    </div>
  )
}
