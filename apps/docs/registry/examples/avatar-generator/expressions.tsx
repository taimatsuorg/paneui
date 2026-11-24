import { GeneratedAvatar, type AvatarExpression } from "@paneui/ui/components/generated-avatar"

const expressions: AvatarExpression[] = [
  "idle",
  "happy",
  "wink",
  "surprised",
  "love",
  "thinking",
  "sleepy",
  "smug",
  "shy",
  "mad",
]

export default function AvatarGeneratorExpressions() {
  return (
    <div className="@container w-full max-w-lg">
      <div className="grid grid-cols-3 gap-4 @md:grid-cols-5">
        {expressions.map((expr) => (
          <figure key={expr} className="flex flex-col items-center gap-2">
            <GeneratedAvatar seed="hana" expression={expr} size={64} shape="rounded" />
            <figcaption className="text-center text-xs capitalize text-muted-foreground">{expr}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
