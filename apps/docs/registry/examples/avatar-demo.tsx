import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage, AvatarStatus } from "@paneui/ui/components/avatar"
import { GeneratedAvatar } from "@paneui/ui/components/generated-avatar"

export default function AvatarDemo() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          <AvatarImage src="https://github.com/QinYangWang.png" alt="Qinyang" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <GeneratedAvatar seed="mika" size="lg">
          <AvatarStatus status="online" label="Online" />
        </GeneratedAvatar>
        <Avatar size="lg" shape="rounded">
          <AvatarFallback>QW</AvatarFallback>
        </Avatar>
      </div>
      <AvatarGroup>
        {["aiko", "ben", "chloe", "dev"].map((seed) => (
          <GeneratedAvatar key={seed} seed={seed} title={seed} />
        ))}
        <AvatarGroupCount>+5</AvatarGroupCount>
      </AvatarGroup>
    </div>
  )
}
