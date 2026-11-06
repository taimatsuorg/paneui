"use client"

import * as React from "react"

import { BottomStack, BottomStackItem } from "@paneui/ui/components/bottom-stack"
import { Button } from "@paneui/ui/components/button"
import { MediaBar } from "@paneui/ui/components/media-bar"

export default function BottomStackOwnItem() {
  const [saved, setSaved] = React.useState(false)
  const [playing, setPlaying] = React.useState(false)

  return (
    <div className="relative h-80 w-full max-w-xl overflow-hidden rounded-2xl bg-background shadow-raised">
      <div className="flex flex-col gap-2.5 p-5" aria-hidden>
        <div className="h-5 w-40 rounded-full bg-foreground/15" />
        <div className="h-3 w-full rounded-full bg-foreground/8" />
        <div className="h-3 w-3/5 rounded-full bg-foreground/8" />
      </div>
      <div className="absolute end-4 bottom-[calc(var(--bottom-overlay-offset,0px)+--spacing(4))] transition-[bottom] duration-200">
        <Button variant="secondary" size="sm" onClick={() => setSaved(false)}>
          Edit again
        </Button>
      </div>
      <BottomStack className="absolute">
        <MediaBar playing={playing} onPlayingChange={setPlaying} activity="playing" />
        {!saved && (
          <BottomStackItem order={10} className="self-stretch">
            <div className="flex w-full items-center justify-between gap-3 rounded-2xl bg-popover p-3 ps-4 text-ui shadow-surface">
              <span className="text-muted-foreground">You have unsaved changes.</span>
              <Button size="sm" onClick={() => setSaved(true)}>
                Save
              </Button>
            </div>
          </BottomStackItem>
        )}
      </BottomStack>
    </div>
  )
}
