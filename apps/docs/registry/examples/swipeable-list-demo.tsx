"use client"

import * as React from "react"

import { BookmarkIcon, CheckIcon, FlagIcon, MailIcon, TrashIcon } from "@paneui/ui/icons"
import { SwipeableList, type SwipeableListItem } from "@paneui/ui/blocks/swipeable-list/swipeable-list"

const avatar = (initials: string, hue: number) => (
  <span
    className="flex size-9 items-center justify-center rounded-full text-xs font-semibold text-white shadow-raised"
    style={{ background: `linear-gradient(135deg, oklch(0.68 0.14 ${hue}), oklch(0.55 0.16 ${hue + 30}))` }}
  >
    {initials}
  </span>
)

const seed = [
  { id: "1", from: "Mei Lin", initials: "ML", hue: 250, subject: "Pricing page copy, final pass", time: "09:41" },
  { id: "2", from: "Stripe", initials: "S", hue: 280, subject: "Your payout of $1,240 is on its way", time: "08:15" },
  { id: "3", from: "Kenji Sato", initials: "KS", hue: 160, subject: "Dinner Friday? Found a place in Shibuya", time: "Mon" },
  { id: "4", from: "GitHub", initials: "GH", hue: 20, subject: "[PaneUI] PR #212 approved", time: "Sun" },
]

export default function SwipeableListDemo() {
  const [mail, setMail] = React.useState(seed)
  const [read, setRead] = React.useState<Set<string>>(new Set())
  const remove = (id: string) => setMail((list) => list.filter((m) => m.id !== id))

  const items: SwipeableListItem[] = mail.map((m) => ({
    id: m.id,
    leading: avatar(m.initials, m.hue),
    title: <span className={read.has(m.id) ? "font-normal text-muted-foreground" : undefined}>{m.from}</span>,
    description: m.subject,
    meta: m.time,
    leftActions: [
      {
        id: "read",
        label: read.has(m.id) ? "Unread" : "Read",
        icon: read.has(m.id) ? <MailIcon /> : <CheckIcon />,
        tone: "primary",
        onAction: () =>
          setRead((s) => {
            const next = new Set(s)
            if (next.has(m.id)) next.delete(m.id)
            else next.add(m.id)
            return next
          }),
      },
    ],
    rightActions: [
      { id: "flag", label: "Flag", icon: <FlagIcon />, tone: "warning" },
      { id: "save", label: "Save", icon: <BookmarkIcon />, tone: "neutral" },
      { id: "delete", label: "Delete", icon: <TrashIcon />, tone: "destructive", onAction: () => remove(m.id) },
    ],
  }))

  return (
    <div className="w-full max-w-sm">
      <SwipeableList items={items} aria-label="Inbox" />
      {mail.length === 0 && (
        <button
          type="button"
          onClick={() => setMail(seed)}
          className="mx-auto mt-2 block cursor-pointer text-sm text-primary-text hover:underline"
        >
          Restore inbox
        </button>
      )}
    </div>
  )
}
