"use client"

import * as React from "react"

import { ClaudeAI, OpenAIDark, OpenAILight } from "@ridemountainpig/svgl-react"

import { PlusIcon } from "@paneui/ui/icons"
import { BrandIcon } from "@paneui/ui/components/brand-icon"
import { Button } from "@paneui/ui/components/button"
import { TabStrip, TabStripItem } from "@paneui/ui/components/tab-strip"

const INITIAL = [
  { id: "a", title: "Fix broken chat dragging", provider: "codex" },
  { id: "b", title: "Redesign split chats so both panes keep their scroll", provider: "codex" },
  { id: "c", title: "Hide empty threads", provider: "claude" },
]

export default function TabStripDemo() {
  const [tabs, setTabs] = React.useState(INITIAL)
  const [active, setActive] = React.useState("a")
  const close = (id: string) => {
    const rest = tabs.filter((t) => t.id !== id)
    setTabs(rest)
    if (active === id && rest[0]) setActive(rest[0].id)
  }
  return (
    <div className="w-full max-w-xl frame-3xl frame-inset-1.75 bg-shell p-1.5">
      <TabStrip
        value={active}
        onValueChange={setActive}
        order={tabs.map((t) => t.id)}
        onReorder={(order) => setTabs(order.map((id) => tabs.find((t) => t.id === id)!))}
        onClose={close}
        aria-label="Open threads"
        actions={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="New tab"
            onClick={() => {
              const id = `t${Date.now()}`
              setTabs([...tabs, { id, title: "New thread", provider: "claude" }])
              setActive(id)
            }}
          >
            <PlusIcon />
          </Button>
        }
      >
        {tabs.map((t) => (
          <TabStripItem key={t.id} value={t.id} icon={<BrandIcon icon={t.provider === "codex" ? { light: OpenAILight, dark: OpenAIDark } : ClaudeAI} color="current" />} className="w-40">
            {t.title}
          </TabStripItem>
        ))}
      </TabStrip>
    </div>
  )
}
