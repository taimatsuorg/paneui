"use client"

import { LandingPage } from "@/components/landing/landing-page"
import { SiteRoot, type SiteProps } from "@/components/site/site-root"

export default function LandingRoute({ site }: { site: SiteProps }) {
  return (
    <SiteRoot {...site}>
      <LandingPage />
    </SiteRoot>
  )
}
