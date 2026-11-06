"use client"

import { useState } from "react"

import { FeedbackWidget } from "@paneui/ui/blocks/feedback-widget/feedback-widget"
import { CodeBlock } from "@paneui/ui/components/code-block"
import { LocaleProvider } from "@paneui/ui/components/locale-provider"
import { Pagination } from "@paneui/ui/components/pagination"

const code = '<pre class="code-syntax"><code><span class="line">const greeting = "こんにちは"</span></code></pre>'

export default function LocaleProviderJapanese() {
  const [page, setPage] = useState(2)
  return (
    <LocaleProvider locale="ja-JP">
      <div className="flex w-full max-w-lg min-w-0 flex-col gap-6">
        <CodeBlock title="greeting.ts" html={code} />
        <Pagination page={page} pageCount={5} onPageChange={setPage} compact />
        <FeedbackWidget placement="inline" />
      </div>
    </LocaleProvider>
  )
}
