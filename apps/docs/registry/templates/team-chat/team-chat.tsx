"use client"

import * as React from "react"

import {
  AttachIcon,
  BellIcon,
  BoldIcon,
  ChatIcon,
  CodeIcon,
  EditIcon,
  InboxIcon,
  MoreHorizontalIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  ThumbsUpIcon,
  UsersIcon,
  XIcon,
} from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import { GeneratedAvatarImage } from "@paneui/ui/components/generated-avatar"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@paneui/ui/components/input-group"
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
import { MessageScroller } from "@paneui/ui/components/message-scroller"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarItem,
  SidebarMenu,
  SidebarProvider,
  SidebarRail,
  SidebarRailAvatar,
  SidebarRailGroup,
  SidebarRailItem,
  SidebarRailSpacer,
  SidebarTrigger,
} from "@paneui/ui/components/animated-sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@paneui/ui/components/tooltip"

import {
  CONVERSATIONS,
  ME,
  PEOPLE,
  WORKSPACE,
  formatTime,
  type ChatMessage,
  type Conversation,
  type Person,
} from "./parts/data"

/* ───────────────────────── State ───────────────────────── */

/** Rows from one author closer than this (minutes) fold under the first row's name. */
const GROUP_GAP = 5

function nowMinutes() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

let seq = 0
const newId = () => `local-${Date.now().toString(36)}-${(seq++).toString(36)}`

function mapMessage(list: ChatMessage[], id: string, fn: (m: ChatMessage) => ChatMessage): ChatMessage[] {
  return list.map((m) => (m.id === id ? fn(m) : m.replies ? { ...m, replies: mapMessage(m.replies, id, fn) } : m))
}

function toggleReaction(m: ChatMessage, emoji: string): ChatMessage {
  const reactions = m.reactions ?? []
  const existing = reactions.find((r) => r.emoji === emoji)
  if (!existing) return { ...m, reactions: [...reactions, { emoji, by: [ME] }] }
  const by = existing.by.includes(ME) ? existing.by.filter((p) => p !== ME) : [...existing.by, ME]
  return {
    ...m,
    reactions: by.length ? reactions.map((r) => (r.emoji === emoji ? { ...r, by } : r)) : reactions.filter((r) => r.emoji !== emoji),
  }
}

/** Display name: channels get a `#`, direct messages the other person's name. */
function titleOf(c: Conversation) {
  if (c.kind === "channel") return `#${c.name}`
  return PEOPLE[c.members.find((m) => m !== ME) ?? ME]?.name ?? c.name
}

/* ───────────────────────── Small parts ───────────────────────── */

function Avatar({ person, className }: { person: Person; className?: string }) {
  return <GeneratedAvatarImage seed={person.id} gender={person.gender} className={className} />
}

function Hash() {
  return (
    <span aria-hidden className="grid size-4 place-items-center text-ui font-medium">
      #
    </span>
  )
}

function DmIcon({ person }: { person: Person }) {
  return (
    <span className="relative grid size-4 place-items-center">
      <span className="size-4 overflow-hidden rounded-sm bg-card shadow-raised">
        <Avatar person={person} />
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute -right-0.5 -bottom-0.5 size-1.5 rounded-full ring-2 ring-shell",
          person.status === "online" ? "bg-success" : person.status === "away" ? "bg-warning" : "bg-muted-foreground/50"
        )}
      />
    </span>
  )
}

function IconAction({ label, children, className, ...props }: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon-sm" className={cn("text-muted-foreground hover:text-foreground", className)} {...props} aria-label={label}>
            {children}
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** Turns `@Name` into a mention chip, `code` into inline code and **text** into bold. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(@[A-Za-z]+|`[^`]+`|\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("@") && part.length > 1)
          return (
            <span key={i} className="rounded-sm bg-primary/10 px-0.5 font-medium text-primary-text">
              {part}
            </span>
          )
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
          return (
            <code key={i} className="rounded-sm bg-foreground/6 px-1 py-px font-mono text-ui">
              {part.slice(1, -1)}
            </code>
          )
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          )
        return <React.Fragment key={i}>{part}</React.Fragment>
      })}
    </>
  )
}

/* ───────────────────────── Message rows ───────────────────────── */

type RowHandlers = {
  onReact: (id: string, emoji: string) => void
  onOpenThread?: (id: string) => void
}

/** On touch screens the row toolbar shows for the tapped row only, so it never sits over the text above. */
const TapContext = React.createContext<{ tapped: string | null; setTapped: (id: string | null) => void }>({ tapped: null, setTapped: () => {} })

function MessageRow({ message, grouped, handlers }: { message: ChatMessage; grouped: boolean; handlers: RowHandlers }) {
  const person = PEOPLE[message.author] ?? PEOPLE[ME]!
  const time = formatTime(message.at)
  const replies = message.replies ?? []
  const { tapped, setTapped } = React.useContext(TapContext)
  return (
    <Message
      from={message.author === ME ? "user" : "assistant"}
      aria-label={`${person.name}, ${time}`}
      onClick={(e) => !(e.target as HTMLElement).closest("button,a") && setTapped(tapped === message.id ? null : message.id)}
    >
      {grouped ? (
        <MessageAvatar placeholder>{time}</MessageAvatar>
      ) : (
        <MessageAvatar>
          <Avatar person={person} />
        </MessageAvatar>
      )}
      <MessageContent>
        {!grouped && (
          <MessageHeader>
            {person.name} <time>{time}</time>
          </MessageHeader>
        )}
        <MessageBubble>
          <RichText text={message.text} />
        </MessageBubble>
        {!!message.reactions?.length && (
          <MessageReactions>
            {message.reactions.map((r) => (
              <MessageReaction
                key={r.emoji}
                emoji={r.emoji}
                count={r.by.length}
                active={r.by.includes(ME)}
                title={r.by.map((p) => PEOPLE[p]?.name ?? p).join(", ")}
                onActiveChange={() => handlers.onReact(message.id, r.emoji)}
              />
            ))}
          </MessageReactions>
        )}
        {handlers.onOpenThread && replies.length > 0 && (
          <button
            type="button"
            onClick={() => handlers.onOpenThread?.(message.id)}
            className="-mx-1 mt-1 flex w-fit cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 text-ui-sm outline-none hover:bg-card hover:shadow-raised focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AvatarStack people={[...new Set(replies.map((r) => r.author))].map((id) => PEOPLE[id]!)} max={3} />
            <span className="font-medium text-primary-text">
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </span>
            <span className="text-ui-xs text-muted-foreground">Last reply {formatTime(replies[replies.length - 1]!.at)}</span>
          </button>
        )}
        {/* eslint-disable-next-line shadcn/no-restyle -- touch screens show the toolbar only on the tapped row (it overlaps the row above in the flat list) */}
        <MessageActions className={tapped === message.id ? "pointer-coarse:opacity-100" : "pointer-coarse:opacity-0"}>
          <MessageAction label="Thumbs up" onClick={() => handlers.onReact(message.id, "👍")}>
            <ThumbsUpIcon />
          </MessageAction>
          {handlers.onOpenThread && (
            <MessageAction label="Reply in thread" onClick={() => handlers.onOpenThread?.(message.id)}>
              <ChatIcon />
            </MessageAction>
          )}
          <MessageAction label="More">
            <MoreHorizontalIcon />
          </MessageAction>
        </MessageActions>
      </MessageContent>
    </Message>
  )
}

/** `newFrom` is the index of the first unread row; a "New" marker sits above it and breaks the group. */
function Rows({ messages, handlers, newFrom }: { messages: ChatMessage[]; handlers: RowHandlers; newFrom?: number }) {
  return (
    <>
      {messages.map((m, i) => {
        const prev = messages[i - 1]
        const isNew = i === newFrom
        const grouped = !isNew && !!prev && prev.author === m.author && m.at - prev.at <= GROUP_GAP
        return (
          <React.Fragment key={m.id}>
            {isNew && (
              <MessageMarker>
                <span className="text-primary-text">New</span>
              </MessageMarker>
            )}
            <MessageRow message={m} grouped={grouped} handlers={handlers} />
          </React.Fragment>
        )
      })}
    </>
  )
}

/* ───────────────────────── Composer ───────────────────────── */

function Composer({ placeholder, onSend, autoFocus }: { placeholder: string; onSend: (text: string) => void; autoFocus?: boolean }) {
  const [value, setValue] = React.useState("")
  const ref = React.useRef<HTMLTextAreaElement>(null)
  const canSend = value.trim().length > 0

  function send() {
    if (!canSend) return
    onSend(value.trim())
    setValue("")
    ref.current?.focus()
  }

  function wrap(mark: string) {
    const el = ref.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const next = value.slice(0, s) + mark + value.slice(s, e) + mark + value.slice(e)
    setValue(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(s + mark.length, e + mark.length)
    })
  }

  return (
    <form
      data-slot="team-chat-composer"
      onSubmit={(e) => {
        e.preventDefault()
        send()
      }}
      className="frame-xl frame-p-1 flex flex-col bg-card shadow-raised transition-shadow focus-within:ring-2 focus-within:ring-ring"
    >
      <textarea
        ref={ref}
        rows={1}
        value={value}
        autoFocus={autoFocus}
        aria-label={placeholder}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            send()
          }
        }}
        className="field-sizing-content max-h-40 min-h-9 w-full resize-none bg-transparent px-2.5 pt-2 pb-1 text-ui-lg outline-none placeholder:text-muted-foreground"
      />
      <div className="flex items-center gap-0.5">
        <IconAction label="Attach" type="button">
          <AttachIcon />
        </IconAction>
        <IconAction label="Bold" type="button" onClick={() => wrap("**")}>
          <BoldIcon />
        </IconAction>
        <IconAction label="Code" type="button" onClick={() => wrap("`")}>
          <CodeIcon />
        </IconAction>
        <span aria-hidden className="flex-1" />
        <span className="me-1.5 hidden text-ui-2xs text-muted-foreground sm:inline">Shift + Enter for a new line</span>
        <Button type="submit" size="icon-sm" variant={canSend ? "default" : "ghost"} disabled={!canSend} aria-label="Send">
          <SendIcon className="rtl:-scale-x-100" />
        </Button>
      </div>
    </form>
  )
}

/* ───────────────────────── Panes ───────────────────────── */

function ChannelIntro({ conversation }: { conversation: Conversation }) {
  if (conversation.kind === "dm") {
    const other = PEOPLE[conversation.members.find((m) => m !== ME) ?? ME]!
    return (
      <div className="flex flex-col gap-2 px-2 pt-6 pb-4">
        <span className="size-16 overflow-hidden rounded-xl bg-card shadow-raised">
          <Avatar person={other} />
        </span>
        <p className="text-ui-lg font-semibold">{other.name}</p>
        <p className="text-ui text-muted-foreground">
          {other.title}. This is the start of your conversation with {other.name.split(" ")[0]}.
        </p>
      </div>
    )
  }
  const members = conversation.members.map((id) => PEOPLE[id]!).filter(Boolean)
  return (
    <div className="flex flex-col gap-2 px-2 pt-6 pb-4">
      <p className="text-ui-lg font-semibold">#{conversation.name}</p>
      <p className="text-ui text-muted-foreground">
        This is the start of #{conversation.name}. {conversation.topic}.
      </p>
      <div className="flex items-center gap-2 text-ui-sm text-muted-foreground">
        <AvatarStack people={members} />
        <span className="tabular-nums">{members.length} members</span>
      </div>
    </div>
  )
}

/** Up to four faces, overlapping, for a channel's member count or a thread's repliers. */
function AvatarStack({ people, max = 4 }: { people: Person[]; max?: number }) {
  return (
    <span className="flex -space-x-1">
      {people.slice(0, max).map((p) => (
        <span key={p.id} className="size-5 overflow-hidden rounded-sm bg-card ring-2 ring-background">
          <Avatar person={p} />
        </span>
      ))}
    </span>
  )
}

function ThreadPane({
  conversation,
  parent,
  onClose,
  onReact,
  onSend,
}: {
  conversation: Conversation
  parent: ChatMessage
  onClose: () => void
  onReact: (id: string, emoji: string) => void
  onSend: (text: string) => void
}) {
  const replies = parent.replies ?? []
  return (
    <aside
      aria-label="Thread"
      className="absolute inset-0 z-20 flex min-h-0 flex-col bg-background md:static md:w-88 md:shrink-0 md:border-s md:border-border"
    >
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
        <div className="flex min-w-0 flex-col">
          <h2 className="text-ui-lg font-semibold text-balance">Thread</h2>
          <p className="truncate text-ui-sm text-muted-foreground">in {titleOf(conversation)}</p>
        </div>
        <IconAction label="Close thread" className="ms-auto" onClick={onClose}>
          <XIcon />
        </IconAction>
      </header>
      <MessageScroller key={parent.id} className="min-h-0 flex-1" contentClassName="px-2 py-3">
        <MessageList variant="flat">
          <MessageRow message={parent} grouped={false} handlers={{ onReact }} />
          {replies.length > 0 ? (
            <>
              <MessageMarker>
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </MessageMarker>
              <Rows messages={replies} handlers={{ onReact }} />
            </>
          ) : (
            <p className="px-2 py-4 text-ui text-muted-foreground">No replies yet. Start the thread below.</p>
          )}
        </MessageList>
      </MessageScroller>
      <div className="shrink-0 p-3 pt-1">
        <Composer placeholder="Reply…" onSend={onSend} />
      </div>
    </aside>
  )
}

/* ───────────────────────── App ───────────────────────── */

export function TeamChatApp({ initial = CONVERSATIONS }: { initial?: Conversation[] }) {
  const [conversations, setConversations] = React.useState(initial)
  const [activeId, setActiveId] = React.useState(initial.find((c) => c.id === "design")?.id ?? initial[0]!.id)
  const [threadId, setThreadId] = React.useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [query, setQuery] = React.useState("")
  const [tapped, setTapped] = React.useState<string | null>(null)
  const tap = React.useMemo(() => ({ tapped, setTapped }), [tapped])
  // The first unread message when a conversation was opened, so the "New" marker survives the reset to 0.
  const [firstNew, setFirstNew] = React.useState<Record<string, string>>({})

  // Phones start with the channel list folded into the rail.
  React.useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) setSidebarOpen(false)
  }, [])

  const active = conversations.find((c) => c.id === activeId)!
  const parent = threadId ? active.messages.find((m) => m.id === threadId) : undefined
  const q = query.trim().toLowerCase()
  const matches = (c: Conversation) => !q || titleOf(c).toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
  const channels = conversations.filter((c) => c.kind === "channel" && matches(c))
  const dms = conversations.filter((c) => c.kind === "dm" && matches(c))
  const unread = conversations.reduce((n, c) => n + (c.unread ?? 0), 0)

  const update = (id: string, fn: (c: Conversation) => Conversation) =>
    setConversations((list) => list.map((c) => (c.id === id ? fn(c) : c)))

  function open(id: string) {
    const target = conversations.find((c) => c.id === id)
    const first = target?.unread ? target.messages[Math.max(0, target.messages.length - target.unread)] : undefined
    if (first) setFirstNew((n) => ({ ...n, [id]: first.id }))
    setActiveId(id)
    setThreadId(null)
    update(id, (c) => ({ ...c, unread: 0 }))
    if (window.matchMedia("(max-width: 767px)").matches) setSidebarOpen(false)
  }

  const react = (id: string, emoji: string) =>
    update(activeId, (c) => ({ ...c, messages: mapMessage(c.messages, id, (m) => toggleReaction(m, emoji)) }))

  const send = (text: string) =>
    update(activeId, (c) => ({ ...c, messages: [...c.messages, { id: newId(), author: ME, at: nowMinutes(), text }] }))

  const reply = (text: string) =>
    threadId &&
    update(activeId, (c) => ({
      ...c,
      messages: mapMessage(c.messages, threadId, (m) => ({
        ...m,
        replies: [...(m.replies ?? []), { id: newId(), author: ME, at: nowMinutes(), text }],
      })),
    }))

  const me = PEOPLE[ME]!
  const members = active.members.map((id) => PEOPLE[id]!).filter(Boolean)
  const newIndex = active.messages.findIndex((m) => m.id === firstNew[active.id])
  const newFrom = newIndex >= 0 ? newIndex : undefined

  return (
    <TooltipProvider>
      <TapContext.Provider value={tap}>
        <div className="flex h-dvh w-full overflow-hidden bg-shell text-foreground">
          <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen} className="h-full">
            <Sidebar
              aria-label={WORKSPACE.name}
              variant="sidebar"
              panelClassName="border-e-0"
              rail={
                <SidebarRail aria-label="Sections">
                  <SidebarRailGroup>
                    <span
                      aria-hidden
                      className="mb-1 grid size-8 place-items-center rounded-lg bg-primary text-ui-xs font-semibold text-primary-foreground shadow-primary"
                    >
                      {WORKSPACE.initials}
                    </span>
                    <SidebarRailItem label="Home" icon={<ChatIcon />} shortcut="⌘1" active badge={unread || undefined} />
                    <SidebarRailItem label="Direct messages" icon={<UsersIcon />} shortcut="⌘2" />
                    <SidebarRailItem label="Activity" icon={<BellIcon />} shortcut="⌘3" />
                    <SidebarRailItem label="Later" icon={<InboxIcon />} shortcut="⌘4" />
                  </SidebarRailGroup>
                  <SidebarRailSpacer />
                  <SidebarRailGroup>
                    <SidebarRailItem label="Settings" icon={<SettingsIcon />} shortcut="⌘," />
                    <SidebarRailAvatar label={me.name} status="online" hint="Active">
                      <Avatar person={me} />
                    </SidebarRailAvatar>
                  </SidebarRailGroup>
                </SidebarRail>
              }
            >
              <SidebarHeader className="gap-2 px-2 pt-0 pb-1">
                <div className="flex h-12 items-center justify-between ps-1">
                  <span className="truncate text-ui-lg font-semibold">{WORKSPACE.name}</span>
                  <IconAction label="New message">
                    <EditIcon />
                  </IconAction>
                </div>
                <InputGroup size="sm">
                  <InputGroupAddon>
                    <SearchIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && setQuery("")}
                    placeholder="Find a conversation"
                    aria-label="Find a conversation"
                  />
                  {query && (
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton size="icon-xs" aria-label="Clear" onClick={() => setQuery("")}>
                        <XIcon />
                      </InputGroupButton>
                    </InputGroupAddon>
                  )}
                </InputGroup>
              </SidebarHeader>
              <SidebarContent>
                {channels.length === 0 && dms.length === 0 && (
                  <p className="px-3 py-2 text-ui text-muted-foreground">No conversations match “{query.trim()}”.</p>
                )}
                {channels.length > 0 && (
                  <SidebarGroup>
                    <SidebarGroupLabel>Channels</SidebarGroupLabel>
                    <SidebarMenu>
                      {channels.map((c) => (
                        <SidebarItem
                          key={c.id}
                          icon={<Hash />}
                          label={<span className={cn(c.unread && "font-semibold text-foreground")}>{c.name}</span>}
                          tooltip={c.name}
                          badge={c.unread || undefined}
                          isActive={c.id === activeId}
                          onClick={() => open(c.id)}
                        />
                      ))}
                    </SidebarMenu>
                  </SidebarGroup>
                )}
                {dms.length > 0 && (
                  <SidebarGroup>
                    <SidebarGroupLabel>Direct messages</SidebarGroupLabel>
                    <SidebarMenu>
                      {dms.map((c) => {
                        const other = PEOPLE[c.members.find((m) => m !== ME) ?? ME]!
                        return (
                          <SidebarItem
                            key={c.id}
                            icon={<DmIcon person={other} />}
                            label={<span className={cn(c.unread && "font-semibold text-foreground")}>{other.name}</span>}
                            tooltip={other.name}
                            badge={c.unread || undefined}
                            isActive={c.id === activeId}
                            onClick={() => open(c.id)}
                          />
                        )
                      })}
                    </SidebarMenu>
                  </SidebarGroup>
                )}
              </SidebarContent>
            </Sidebar>

            <SidebarInset className="min-h-0">
              <div className="relative shell-inset mt-0.75 flex min-h-0 min-w-0 flex-1 overflow-hidden">
                <section aria-label={titleOf(active)} className="flex min-h-0 min-w-0 flex-1 flex-col">
                  <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
                    <SidebarTrigger />
                    <div className="flex min-w-0 flex-col">
                      <h1 className="truncate text-ui-lg font-semibold">{titleOf(active)}</h1>
                      <p className="truncate text-ui-sm text-muted-foreground">
                        {active.kind === "channel" ? active.topic : (PEOPLE[active.members.find((m) => m !== ME) ?? ME]?.title ?? "")}
                      </p>
                    </div>
                    <div className="ms-auto flex shrink-0 items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button variant="ghost" size="sm" aria-label={`${members.length} members`} className="text-muted-foreground">
                              <span className="flex -space-x-1.5">
                                {members.slice(0, 3).map((p) => (
                                  <span key={p.id} className="size-5 overflow-hidden rounded-sm bg-card ring-2 ring-background">
                                    <Avatar person={p} />
                                  </span>
                                ))}
                              </span>
                              <span className="tabular-nums">{members.length}</span>
                            </Button>
                          }
                        />
                        <TooltipContent>{members.map((p) => p.name.split(" ")[0]).join(", ")}</TooltipContent>
                      </Tooltip>
                      <IconAction label="Search">
                        <SearchIcon />
                      </IconAction>
                    </div>
                  </header>

                  <MessageScroller key={active.id} className="min-h-0 flex-1" contentClassName="mx-auto w-full max-w-3xl px-2 pb-4">
                    <ChannelIntro conversation={active} />
                    <MessageList variant="flat">
                      <MessageMarker>Today</MessageMarker>
                      <Rows messages={active.messages} newFrom={newFrom} handlers={{ onReact: react, onOpenThread: setThreadId }} />
                    </MessageList>
                  </MessageScroller>

                  <div className="mx-auto w-full max-w-3xl shrink-0 px-3 pb-3">
                    <Composer key={active.id} placeholder={`Message ${titleOf(active)}`} onSend={send} />
                  </div>
                </section>

                {parent && (
                  <ThreadPane conversation={active} parent={parent} onClose={() => setThreadId(null)} onReact={react} onSend={reply} />
                )}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </TapContext.Provider>
    </TooltipProvider>
  )
}
