"use client"

import { Button } from "@paneui/ui/components/button"
import { Timeline, TimelineDescription, TimelineItem, TimelineTitle } from "@paneui/ui/components/timeline"
import { BellIcon } from "@paneui/ui/icons"

export default function TimelineChangelog() {
  return (
    <Timeline
      className="w-full max-w-md"
      actions={
        <Button variant="ghost" size="sm" nativeButton={false} render={<a href="#feed" />}>
          <BellIcon data-icon="inline-start" />
          Subscribe
        </Button>
      }
    >
      <TimelineItem time="Nov 6" timeDetail="2026" tone="primary">
        <TimelineTitle anchor render={<h3 />}>Version 2.5</TimelineTitle>
        <TimelineDescription>Japanese labels and an inline feedback form.</TimelineDescription>
      </TimelineItem>
      <TimelineItem time="Oct 20" timeDetail="2026">
        <TimelineTitle anchor render={<h3 />}>Version 2.4</TimelineTitle>
        <TimelineDescription>Image zoom, banners and diagrams.</TimelineDescription>
      </TimelineItem>
      <TimelineItem time="Oct 2" timeDetail="2026">
        <TimelineTitle anchor="v2-3" render={<h3 />}>Version 2.3</TimelineTitle>
        <TimelineDescription>Faster search on large sites.</TimelineDescription>
      </TimelineItem>
    </Timeline>
  )
}
