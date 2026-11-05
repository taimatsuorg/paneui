"use client"

import * as React from "react"

import { BellIcon, CheckIcon, PauseIcon, PlayIcon, PlusIcon } from "@paneui/ui/icons"
import { ActionSwapRollButton } from "@paneui/ui/components/action-swap-roll"

export default function ActionSwapRollDemo() {
  const [following, setFollowing] = React.useState("follow")
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ActionSwapRollButton
        variant={following === "follow" ? "default" : "secondary"}
        value={following}
        onValueChange={setFollowing}
        items={[
          { value: "follow", label: "Follow", icon: <PlusIcon /> },
          { value: "following", label: "Following", icon: <CheckIcon /> },
        ]}
      />
      <ActionSwapRollButton
        variant="secondary"
        items={[
          { value: "play", label: "Play", icon: <PlayIcon /> },
          { value: "pause", label: "Pause", icon: <PauseIcon /> },
        ]}
      />
      <ActionSwapRollButton
        variant="ghost"
        size="icon"
        items={[
          { value: "off", label: "Turn on alerts", icon: <BellIcon /> },
          { value: "on", label: "Alerts on", icon: <CheckIcon className="text-success-text" /> },
        ]}
      />
    </div>
  )
}
