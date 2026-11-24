import { Figma, GitHubDark, GitHubLight, Linear, Stripe } from "@ridemountainpig/svgl-react"

import { BrandIcon, type BrandIconSource } from "@paneui/ui/components/brand-icon"

const ITEMS: ReadonlyArray<{ name: string; icon: BrandIconSource }> = [
  { name: "GitHub", icon: { light: GitHubLight, dark: GitHubDark } },
  { name: "Figma", icon: Figma },
  { name: "Linear", icon: Linear },
  { name: "Stripe", icon: Stripe },
]

export default function BrandIconColorsExample() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <span className="w-16 text-ui-xs text-muted-foreground">brand</span>
        {ITEMS.map((item) => (
          <BrandIcon key={item.name} icon={item.icon} name={item.name} size={20} />
        ))}
      </div>
      <div className="flex items-center gap-4 text-muted-foreground">
        <span className="w-16 text-ui-xs">current</span>
        {ITEMS.map((item) => (
          <BrandIcon
            key={item.name}
            icon={item.icon}
            name={item.name}
            color="current"
            size={20}
          />
        ))}
      </div>
    </div>
  )
}
