import { Marquee } from "@paneui/ui/components/marquee"

const TAGS = ["Flights", "Hotels", "Dinner"]

export default function MarqueeRepeat() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">repeat 2 (default): gaps appear</span>
        <Marquee duration={12} gap="0.5rem">
          {TAGS.map((t) => (
            <span key={t} className="rounded-control-sm bg-secondary px-3 py-1 text-sm shadow-raised">
              {t}
            </span>
          ))}
        </Marquee>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">repeat 6: the track stays full</span>
        <Marquee duration={12} gap="0.5rem" repeat={6}>
          {TAGS.map((t) => (
            <span key={t} className="rounded-control-sm bg-secondary px-3 py-1 text-sm shadow-raised">
              {t}
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  )
}
