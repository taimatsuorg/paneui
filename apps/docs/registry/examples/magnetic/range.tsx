import { Magnetic } from "@paneui/ui/components/magnetic"

export default function MagneticRange() {
  return (
    <div className="flex items-center gap-12">
      {[8, 24, 64].map((range) => (
        <div key={range} className="flex flex-col items-center gap-3">
          <Magnetic range={range} strength={0.35}>
            <span className="rounded-control bg-secondary px-4 py-2 text-sm font-medium shadow-raised">Pull me</span>
          </Magnetic>
          <span className="text-xs text-muted-foreground tabular-nums">range {range}px</span>
        </div>
      ))}
    </div>
  )
}
