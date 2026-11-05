import { HeartIcon, SettingsIcon, StarIcon } from "@paneui/ui/icons"
import { Magnetic } from "@paneui/ui/components/magnetic"

const items = [
  { label: "Favourites", icon: HeartIcon },
  { label: "Starred", icon: StarIcon },
  { label: "Settings", icon: SettingsIcon },
]

export default function MagneticDemo() {
  return (
    <div className="flex items-center gap-4">
      {items.map(({ label, icon: Icon }) => (
        <Magnetic key={label} strength={0.4} range={20}>
          <a
            href="#"
            aria-label={label}
            className="grid size-12 place-items-center rounded-2xl bg-secondary text-foreground shadow-raised transition-shadow outline-none hover:shadow-raised-hover focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon className="size-5" />
          </a>
        </Magnetic>
      ))}
    </div>
  )
}
