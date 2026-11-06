"use client"

import { FeedbackWidget } from "@paneui/ui/blocks/feedback-widget/feedback-widget"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function FeedbackWidgetInline() {
  return (
    <article className="flex w-full max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-ui-lg font-semibold text-balance">Deploy a preview</h3>
        <p className="text-ui text-muted-foreground">
          Every pull request gets its own address. Share it with reviewers before you merge.
        </p>
      </div>
      <FeedbackWidget
        placement="inline"
        onSubmit={async ({ message }) => {
          await wait(1000)
          if (/fail/i.test(message)) throw new Error("Network error")
        }}
      />
    </article>
  )
}
