import { GeneratedAvatar } from "@paneui/ui/components/generated-avatar"

const users = [
  { id: "u_1029", name: "Mina Park", email: "mina@acme.dev" },
  { id: "u_2211", name: "Leo Tanaka", email: "leo@acme.dev" },
  { id: "u_3304", name: "Sara Ruiz", email: "sara@acme.dev" },
] as const

export default function AvatarGeneratorBySeed() {
  return (
    <ul className="flex w-72 flex-col gap-3">
      {users.map((user) => (
        <li key={user.id} className="flex items-center gap-3">
          <GeneratedAvatar seed={user.id} size="lg" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
