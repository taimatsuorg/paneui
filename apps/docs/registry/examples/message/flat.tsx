"use client"

import * as React from "react"

import { ChatIcon, EditIcon, MoreHorizontalIcon } from "@paneui/ui/icons"
import { GeneratedAvatarImage } from "@paneui/ui/components/generated-avatar"
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
  MessageReaction,
  MessageReactions,
} from "@paneui/ui/components/message"

export default function MessageFlat() {
  const [reactions, setReactions] = React.useState([
    { emoji: "🎉", count: 4, active: true },
    { emoji: "👀", count: 2, active: false },
  ])

  const actions = (
    <MessageActions>
      <MessageAction label="Reply in thread">
        <ChatIcon />
      </MessageAction>
      <MessageAction label="Edit">
        <EditIcon />
      </MessageAction>
      <MessageAction label="More">
        <MoreHorizontalIcon />
      </MessageAction>
    </MessageActions>
  )

  return (
    <MessageList variant="flat" className="max-w-xl">
      <MessageMarker>Today</MessageMarker>
      <Message from="user">
        <MessageAvatar>
          <GeneratedAvatarImage seed="mina-park" gender="female" />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            Mina Park <time>10:42</time>
          </MessageHeader>
          <MessageBubble>The new theme builder is live on the preview deploy.</MessageBubble>
          {actions}
        </MessageContent>
      </Message>
      <Message from="user">
        <MessageAvatar placeholder>10:43</MessageAvatar>
        <MessageContent>
          <MessageBubble>Try dragging the hue slider, the whole dashboard follows.</MessageBubble>
          <MessageReactions>
            {reactions.map((r, i) => (
              <MessageReaction
                key={r.emoji}
                emoji={r.emoji}
                count={r.count}
                active={r.active}
                onActiveChange={(active) =>
                  setReactions((list) =>
                    list.map((item, j) =>
                      j === i ? { ...item, active, count: item.count + (active ? 1 : -1) } : item
                    )
                  )
                }
              />
            ))}
          </MessageReactions>
          {actions}
        </MessageContent>
      </Message>
      <Message from="assistant">
        <MessageAvatar>
          <GeneratedAvatarImage seed="leo-tanaka" gender="male" />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            Leo Tanaka <time>10:51</time>
          </MessageHeader>
          <MessageBubble>Looks great. Shipping it to main after lunch.</MessageBubble>
          {actions}
        </MessageContent>
      </Message>
    </MessageList>
  )
}
