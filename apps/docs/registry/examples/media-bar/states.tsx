"use client"

import { MediaBar } from "@paneui/ui/components/media-bar"

export default function MediaBarStates() {
  return (
    <div className="flex flex-col items-center gap-3">
      <MediaBar placement="inline" playing onStop={() => {}} />
      <MediaBar placement="inline" playing={false} onStop={() => {}} />
      <MediaBar placement="inline" playing status="Chapter 2" onStop={() => {}} />
    </div>
  )
}
