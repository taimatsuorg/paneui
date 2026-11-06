"use client"

import * as React from "react"

import { BottomStack } from "@paneui/ui/components/bottom-stack"
import { Button } from "@paneui/ui/components/button"
import { MediaBar, markSpeaking } from "@paneui/ui/components/media-bar"
import { Volume2Icon } from "@paneui/ui/icons"

const BLOCKS = [
  "Release notes",
  "Projects now open twice as fast on large workspaces.",
  "Search finds files by their path as well as their name.",
  "The sidebar remembers which folders you left open.",
]

export default function MediaBarDemo() {
  const article = React.useRef<HTMLDivElement>(null)
  const [index, setIndex] = React.useState<number | null>(null)
  const [playing, setPlaying] = React.useState(false)

  // Stands in for speech: moves to the next block every two seconds.
  React.useEffect(() => {
    if (index === null || !playing) return
    const id = window.setTimeout(() => setIndex((i) => (i === null || i + 1 >= BLOCKS.length ? null : i + 1)), 2000)
    return () => window.clearTimeout(id)
  }, [index, playing])

  React.useEffect(() => {
    const el = index === null ? null : (article.current?.children[index] ?? null)
    markSpeaking(el, { scroll: false })
    if (index === null) setPlaying(false)
  }, [index])

  React.useEffect(() => () => markSpeaking(null), [])

  return (
    <div className="relative h-96 w-full max-w-xl overflow-hidden rounded-2xl bg-background shadow-raised">
      <div className="flex justify-end p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIndex(0)
            setPlaying(true)
          }}
        >
          <Volume2Icon data-icon="inline-start" />
          Listen
        </Button>
      </div>
      <div ref={article} className="flex flex-col gap-3 px-6 text-sm">
        <h3 className="text-lg font-semibold text-balance">{BLOCKS[0]}</h3>
        {BLOCKS.slice(1).map((text) => (
          <p key={text}>{text}</p>
        ))}
      </div>
      <BottomStack className="absolute">
        {index !== null && (
          <MediaBar
            playing={playing}
            onPlayingChange={setPlaying}
            onStop={() => setIndex(null)}
            current={index + 1}
            total={BLOCKS.length}
          />
        )}
      </BottomStack>
    </div>
  )
}
