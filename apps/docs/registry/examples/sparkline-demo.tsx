import { Sparkline } from "@paneui/ui/components/sparkline"

const revenue = [12, 14, 13, 17, 16, 19, 22, 21, 24, 27, 26, 31]
const errors = [9, 7, 8, 6, 7, 5, 6, 4, 5, 3, 4, 3]

export default function SparklineDemo() {
  return (
    <div className="grid w-full max-w-md grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 text-sm">
      <span className="text-muted-foreground">Revenue</span>
      <div className="text-success-text"><Sparkline values={revenue} label="Revenue, up 158% over 12 months" className="h-8" /></div>
      <span className="font-medium tabular-nums">$31k</span>
      <span className="text-muted-foreground">Errors</span>
      <div className="text-chart-1"><Sparkline values={errors} variant="line" label="Errors, down 67%" className="h-8" /></div>
      <span className="font-medium tabular-nums">3</span>
      <span className="text-muted-foreground">Deploys</span>
      <div className="text-chart-3"><Sparkline values={[3, 5, 2, 6, 4, 7, 5, 8, 6, 9, 4, 7]} variant="bar" label="Deploys per day" className="h-8" /></div>
      <span className="font-medium tabular-nums">7</span>
    </div>
  )
}
