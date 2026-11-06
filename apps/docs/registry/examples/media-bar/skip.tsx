"use client"

import * as React from "react"

import { MediaBar } from "@paneui/ui/components/media-bar"

const TOTAL = 12

export default function MediaBarSkip() {
  const [playing, setPlaying] = React.useState(true)
  const [part, setPart] = React.useState(3)

  return (
    <MediaBar
      placement="inline"
      activity="playing"
      playing={playing}
      onPlayingChange={setPlaying}
      onSkipBack={() => setPart((p) => Math.max(1, p - 1))}
      onSkipForward={() => setPart((p) => Math.min(TOTAL, p + 1))}
      onStop={() => setPlaying(false)}
      current={part}
      total={TOTAL}
    />
  )
}
