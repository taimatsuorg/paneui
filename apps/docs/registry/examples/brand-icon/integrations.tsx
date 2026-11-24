"use client"

import * as React from "react"
import { GitHubDark, GitHubLight, Linear, Notion, Slack } from "@ridemountainpig/svgl-react"

import { BrandIcon, type BrandIconSource } from "@paneui/ui/components/brand-icon"
import { Switch } from "@paneui/ui/components/switch"

const INTEGRATIONS: ReadonlyArray<{
  id: string
  name: string
  detail: string
  icon: BrandIconSource
  defaultEnabled: boolean
}> = [
  {
    id: "github",
    name: "GitHub",
    detail: "Pull requests and commit checks",
    icon: { light: GitHubLight, dark: GitHubDark },
    defaultEnabled: true,
  },
  {
    id: "linear",
    name: "Linear",
    detail: "Link commits to active issues",
    icon: Linear,
    defaultEnabled: true,
  },
  {
    id: "slack",
    name: "Slack",
    detail: "Post deploy status to channels",
    icon: Slack,
    defaultEnabled: false,
  },
  {
    id: "notion",
    name: "Notion",
    detail: "Sync project notes and specs",
    icon: Notion,
    defaultEnabled: false,
  },
]

export default function BrandIconIntegrationsExample() {
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(INTEGRATIONS.map((item) => [item.id, item.defaultEnabled]))
  )

  return (
    <div className="flex w-full max-w-md flex-col divide-y rounded-lg border bg-card">
      {INTEGRATIONS.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
              <BrandIcon icon={item.icon} name={item.name} size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-ui font-medium">{item.name}</span>
              <span className="text-ui-xs text-muted-foreground">{item.detail}</span>
            </div>
          </div>
          <Switch
            checked={enabled[item.id]}
            aria-label={`Toggle ${item.name}`}
            onCheckedChange={(next) =>
              setEnabled((prev) => ({
                ...prev,
                [item.id]: next,
              }))
            }
          />
        </div>
      ))}
    </div>
  )
}
