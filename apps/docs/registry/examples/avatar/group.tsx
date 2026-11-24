import { AvatarGroup, AvatarGroupCount } from "@paneui/ui/components/avatar"
import { GeneratedAvatar } from "@paneui/ui/components/generated-avatar"

const team = ["aiko", "ben", "chloe", "dev", "emi"] as const

export default function AvatarGroupExample() {
  return (
    <div className="flex flex-col items-center gap-5">
      <AvatarGroup>
        {team.map((seed) => (
          <GeneratedAvatar key={seed} seed={seed} title={seed} />
        ))}
        <AvatarGroupCount>+8</AvatarGroupCount>
      </AvatarGroup>
      <AvatarGroup size="lg" shape="rounded">
        {team.slice(0, 4).map((seed) => (
          <GeneratedAvatar key={seed} seed={seed} title={seed} />
        ))}
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>
      <AvatarGroup size="sm">
        {team.map((seed) => (
          <GeneratedAvatar key={seed} seed={seed} title={seed} />
        ))}
      </AvatarGroup>
    </div>
  )
}
