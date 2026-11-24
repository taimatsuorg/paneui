"use client"

import * as React from "react"

import { ClaudeAI, OpenAIDark, OpenAILight } from "@ridemountainpig/svgl-react"

import { BrandIcon } from "@paneui/ui/components/brand-icon"
import { ThreadList, ThreadListGroup, ThreadListItem } from "@paneui/ui/components/thread-list-item"

export default function ThreadListItemDemo() {
  const [active, setActive] = React.useState("1")
  return (
    <div className="w-72 frame-3xl frame-p-2 bg-shell">
      <ThreadList>
        <ThreadListGroup label="Recent">
          <ThreadListItem title="Fix broken chat dragging behavior" icon={<BrandIcon icon={{ light: OpenAILight, dark: OpenAIDark }} color="current" />} repo="workspace" pr={{ number: 1526, status: "open" }} branch="feat/fix-chat-dragging" active={active === "1"} onClick={() => setActive("1")} />
          <ThreadListItem title="Redesign split chats with close button" icon={<BrandIcon icon={{ light: OpenAILight, dark: OpenAIDark }} color="current" />} repo="workspace" pr={{ number: 1525, status: "draft" }} branch="feat/simplify-split-chats" running active={active === "2"} onClick={() => setActive("2")} />
        </ThreadListGroup>
        <ThreadListGroup label="Yesterday">
          <ThreadListItem title="Configurable expiry with 24h option" icon={<BrandIcon icon={{ light: OpenAILight, dark: OpenAIDark }} color="current" />} repo="workspace" pr={{ number: 1507, status: "merged" }} branch="main" active={active === "3"} onClick={() => setActive("3")} />
          <ThreadListItem title="Check if screenshot behavior is normal" icon={<BrandIcon icon={ClaudeAI} color="current" />} repo="workspace" branch="main" unread active={active === "4"} onClick={() => setActive("4")} />
        </ThreadListGroup>
      </ThreadList>
    </div>
  )
}
