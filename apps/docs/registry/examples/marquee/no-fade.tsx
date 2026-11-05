import { Marquee } from "@paneui/ui/components/marquee"

const TICKERS = [
  { symbol: "AAPL", change: "+1.24%", up: true },
  { symbol: "MSFT", change: "+0.58%", up: true },
  { symbol: "TSLA", change: "−2.10%", up: false },
  { symbol: "NVDA", change: "+3.02%", up: true },
  { symbol: "AMZN", change: "−0.34%", up: false },
]

export default function MarqueeNoFade() {
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-lg bg-muted py-2 shadow-well">
      <Marquee fade={false} pauseOnHover={false} duration={18} gap="2rem">
        {TICKERS.map((t) => (
          <span key={t.symbol} className="flex items-center gap-2 font-mono text-sm whitespace-nowrap tabular-nums">
            <span className="font-medium">{t.symbol}</span>
            <span className={t.up ? "text-success-text" : "text-destructive-text"}>{t.change}</span>
          </span>
        ))}
      </Marquee>
    </div>
  )
}
