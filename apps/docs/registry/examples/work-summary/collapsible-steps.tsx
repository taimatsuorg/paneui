"use client"

import { WorkSummary, WorkSummaryStep, WorkSummaryThought } from "@paneui/ui/components/work-summary"

export default function WorkSummaryCollapsibleSteps() {
  return (
    <WorkSummary duration={48} defaultOpen className="w-full max-w-lg">
      <WorkSummaryThought>{"The failing test points at the date parser, so I'll read it before changing anything."}</WorkSummaryThought>
      <WorkSummaryStep kind="read" title="Read" detail="lib/parse-date.ts" />
      <WorkSummaryStep kind="execute" title="Run tests" detail="pnpm test parse-date" collapsible>
        <pre className="font-mono text-ui-sm text-muted-foreground">{"✓ parses ISO dates\n✓ parses relative dates\n✗ keeps the time zone"}</pre>
      </WorkSummaryStep>
      <WorkSummaryThought title="Thought for 4s">The offset is dropped when the string has no seconds. A stricter pattern fixes it.</WorkSummaryThought>
      <WorkSummaryStep kind="edit" title="Edit" detail="lib/parse-date.ts" collapsible defaultOpen>
        <pre className="font-mono text-ui-sm text-success-text">{"+ const ISO = /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2})?([+-]\\d{2}:\\d{2}|Z)$/"}</pre>
      </WorkSummaryStep>
    </WorkSummary>
  )
}
