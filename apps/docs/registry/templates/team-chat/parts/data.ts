/** Seed data for the team chat template. Replace with your own store or API. */

export type Person = { id: string; name: string; gender: "male" | "female"; status: "online" | "away" | "offline"; title: string }

export type Reaction = { emoji: string; by: string[] }

export type ChatMessage = {
  id: string
  author: string
  /** Minutes since midnight, so the seed needs no real dates. */
  at: number
  text: string
  reactions?: Reaction[]
  replies?: ChatMessage[]
}

export type Conversation = {
  id: string
  kind: "channel" | "dm"
  name: string
  topic?: string
  members: string[]
  unread?: number
  messages: ChatMessage[]
}

export const ME = "qinyang"

export const PEOPLE: Record<string, Person> = {
  qinyang: { id: "qinyang", name: "Qinyang Wang", gender: "male", status: "online", title: "Founder" },
  mina: { id: "mina", name: "Mina Park", gender: "female", status: "online", title: "Design" },
  leo: { id: "leo", name: "Leo Tanaka", gender: "male", status: "online", title: "Frontend" },
  sara: { id: "sara", name: "Sara Ruiz", gender: "female", status: "away", title: "Product" },
  omar: { id: "omar", name: "Omar Haddad", gender: "male", status: "offline", title: "Infrastructure" },
  yuki: { id: "yuki", name: "Yuki Sato", gender: "female", status: "online", title: "Docs" },
}

const everyone = Object.keys(PEOPLE)

export const WORKSPACE = { name: "Pane Studio", initials: "PS" }

export const CONVERSATIONS: Conversation[] = [
  {
    id: "general",
    kind: "channel",
    name: "general",
    topic: "Company-wide news and questions",
    members: everyone,
    messages: [
      { id: "g1", author: "sara", at: 9 * 60 + 2, text: "Morning all. Planning review moves to 3pm today." },
      { id: "g2", author: "omar", at: 9 * 60 + 15, text: "Noted. I'll have the infra numbers ready by then.", reactions: [{ emoji: "🙏", by: ["sara"] }] },
      { id: "g3", author: "yuki", at: 10 * 60 + 4, text: "Docs freeze for the release starts Friday, ping me if your page needs a change." },
    ],
  },
  {
    id: "design",
    kind: "channel",
    name: "design",
    topic: "Theme builder, icons and the docs layout",
    members: ["qinyang", "mina", "leo", "yuki"],
    messages: [
      { id: "d1", author: "mina", at: 10 * 60 + 42, text: "The new theme builder is live on the preview deploy." },
      {
        id: "d2",
        author: "mina",
        at: 10 * 60 + 43,
        text: "Try dragging the hue slider, the whole dashboard follows.",
        reactions: [
          { emoji: "🎉", by: ["qinyang", "leo", "yuki", "sara"] },
          { emoji: "👀", by: ["omar", "leo"] },
        ],
        replies: [
          { id: "d2r1", author: "leo", at: 10 * 60 + 47, text: "Chroma above 0.2 clips on the dark charts, worth a cap?" },
          { id: "d2r2", author: "mina", at: 10 * 60 + 50, text: "Good catch, I'll clamp it to 0.18 in dark." },
          { id: "d2r3", author: "qinyang", at: 10 * 60 + 58, text: "Agreed. Ship the clamp with the release." },
        ],
      },
      { id: "d3", author: "leo", at: 10 * 60 + 51, text: "Looks great. Shipping it to main after lunch." },
      { id: "d4", author: "yuki", at: 11 * 60 + 20, text: "@Mina can I grab two screenshots for the changelog? Light and dark." },
      { id: "d5", author: "mina", at: 11 * 60 + 22, text: "Sure, they're in `shots/themes` on the drive." },
    ],
  },
  {
    id: "releases",
    kind: "channel",
    name: "releases",
    topic: "What shipped and when",
    members: everyone,
    unread: 3,
    messages: [
      { id: "r1", author: "omar", at: 8 * 60 + 30, text: "0.4.2 is out: registry fixes and the new message variant." },
      { id: "r2", author: "leo", at: 8 * 60 + 41, text: "Changelog page updated.", reactions: [{ emoji: "✅", by: ["omar", "yuki"] }] },
      { id: "r3", author: "omar", at: 12 * 60 + 5, text: "Cloudflare Pages build is green for `dev` again." },
    ],
  },
  {
    id: "random",
    kind: "channel",
    name: "random",
    topic: "Lunch, links and everything else",
    members: everyone,
    unread: 1,
    messages: [{ id: "x1", author: "sara", at: 12 * 60 + 12, text: "Noodle place downstairs reopened. Who's in?" }],
  },
  {
    id: "dm-mina",
    kind: "dm",
    name: "mina",
    members: ["qinyang", "mina"],
    messages: [
      { id: "m1", author: "mina", at: 9 * 60 + 50, text: "Do you have ten minutes before the review?" },
      { id: "m2", author: "qinyang", at: 9 * 60 + 52, text: "Yes, call me at 2:45." },
    ],
  },
  {
    id: "dm-leo",
    kind: "dm",
    name: "leo",
    members: ["qinyang", "leo"],
    unread: 2,
    messages: [
      { id: "l1", author: "leo", at: 11 * 60 + 40, text: "PR for the flat message list is up." },
      { id: "l2", author: "leo", at: 11 * 60 + 41, text: "Mostly docs, one tiny change in the bubble." },
    ],
  },
  {
    id: "dm-omar",
    kind: "dm",
    name: "omar",
    members: ["qinyang", "omar"],
    messages: [{ id: "o1", author: "omar", at: 18 * 60, text: "Rotated the deploy keys, nothing for you to do." }],
  },
]

export function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}
