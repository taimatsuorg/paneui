import { GeneratedAvatar } from "@paneui/ui/components/generated-avatar"

const variants = [
  { label: "Default", props: {} },
  { label: "Squircle", props: { background: "squircle" } },
  { label: "Circle", props: { background: "circle" } },
  { label: "Square", props: { background: "square" } },
  { label: "Sun", props: { silhouette: "sun" as const } },
  { label: "Cloud", props: { silhouette: "cloud" as const } },
  { label: "Happy", props: { expression: "happy" as const } },
  { label: "Ink tone", props: { tone: "ink" as const } },
  { label: "Hue 220°", props: { hue: 220 } },
  { label: "Custom colours", props: { background: "square", colors: { background: "#EAF2FB" } } },
]

export default function AvatarGeneratorOptions() {
  return (
    <div className="@container w-full max-w-lg">
      <div className="grid grid-cols-3 gap-4 @md:grid-cols-5">
        {variants.map((variant) => (
          <figure key={variant.label} className="flex flex-col items-center gap-2">
            <GeneratedAvatar seed="hana" size={64} shape="rounded" {...variant.props} />
            <figcaption className="text-center text-xs text-balance text-muted-foreground">{variant.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
