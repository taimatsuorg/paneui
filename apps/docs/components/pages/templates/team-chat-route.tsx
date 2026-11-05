"use client"

import TeamChatPage from "@/registry/templates/team-chat/page"
import { SiteRoot, type SiteProps } from "@/components/site/site-root"

export default function TeamChatTemplateRoute({ site }: { site: SiteProps }) {
  return (
    <SiteRoot {...site}>
      <TeamChatPage />
    </SiteRoot>
  )
}
