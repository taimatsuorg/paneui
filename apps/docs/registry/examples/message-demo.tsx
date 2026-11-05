"use client"

import * as React from "react"

import { BotIcon, CheckIcon, CopyIcon, RefreshIcon, ThumbsDownIcon, ThumbsUpIcon } from "@paneui/ui/icons"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAvatar,
  MessageBubble,
  MessageContent,
  MessageHeader,
  MessageList,
  MessageMarker,
  MessageMeta,
  MessageTyping,
} from "@paneui/ui/components/message"

export default function MessageDemo() {
  const [liked, setLiked] = React.useState<boolean | null>(null)
  return (
    <MessageList className="max-w-lg">
      <MessageMarker>Today</MessageMarker>
      <Message from="user">
        <MessageContent>
          <MessageBubble tone="primary">Find me a table for 4 near the office tonight.</MessageBubble>
          <MessageBubble tone="primary">Somewhere quiet, ideally Japanese.</MessageBubble>
          <MessageMeta>
            <CheckIcon /> Read 7:42 pm
          </MessageMeta>
        </MessageContent>
      </Message>

      <Message from="assistant">
        <MessageAvatar>
          <BotIcon />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Hark</MessageHeader>
          <MessageBubble>Kaiseki Mori has a 4-top at 8:15 pm, a 6-minute walk away.</MessageBubble>
          <MessageBubble>Want me to book it under your name?</MessageBubble>
          <MessageActions visible>
            <MessageAction label="Copy">
              <CopyIcon />
            </MessageAction>
            <MessageAction label="Regenerate">
              <RefreshIcon />
            </MessageAction>
            <MessageAction label="Good response" aria-pressed={liked === true} onClick={() => setLiked(true)}>
              <ThumbsUpIcon className={liked === true ? "text-primary-text" : undefined} />
            </MessageAction>
            <MessageAction label="Bad response" aria-pressed={liked === false} onClick={() => setLiked(false)}>
              <ThumbsDownIcon className={liked === false ? "text-destructive-text" : undefined} />
            </MessageAction>
          </MessageActions>
        </MessageContent>
      </Message>

      <Message from="assistant">
        <MessageAvatar placeholder />
        <MessageTyping />
      </Message>
    </MessageList>
  )
}
