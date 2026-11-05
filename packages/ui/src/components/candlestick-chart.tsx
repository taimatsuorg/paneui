"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"
import {
  ChartDataTable,
  chartAlpha,
  clamp,
  formatCompact,
  niceDomain,
  onFill,
  scaleBand,
  scaleLinear,
  seededRandom,
  useChartSize,
  useChartTransition,
} from "@paneui/ui/components/chart-utils"

type Candle = {
  /** Unique, ordered key: a timestamp (ms) or any increasing number. */
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

const UP = "var(--success)"
const DOWN = "var(--destructive)"

type CandlestickChartProps = Omit<React.ComponentProps<"div">, "children"> & {
  candles: readonly Candle[]
  label?: string
  height?: number
  /** Price shown by the last-price line; defaults to the last close. */
  lastPrice?: number
  formatPrice?: (price: number) => string
  formatVolume?: (volume: number) => string
  formatTime?: (time: number) => string
  showVolume?: boolean
  showReadout?: boolean
  /** Share of the plot height used by the volume pane. */
  volumeRatio?: number
}

const defaultPrice = (p: number) =>
  p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const defaultTime = (t: number) =>
  new Date(t).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" })

function CandlestickChart({
  candles,
  label: labelProp,
  height = 320,
  lastPrice,
  formatPrice = defaultPrice,
  formatVolume = formatCompact,
  formatTime = defaultTime,
  showVolume = true,
  showReadout = true,
  volumeRatio = 0.2,
  className,
  ...props
}: CandlestickChartProps) {
  const { labels } = useLocale()
  const label = labelProp ?? labels.candlestickChart
  const [ref, size] = useChartSize<HTMLDivElement>()
  const transition = useChartTransition()
  const [hover, setHover] = React.useState<{ index: number; y: number | null } | null>(null)

  const axisW = 60
  const timeH = 20
  const width = size.width
  const plotW = Math.max(0, width - axisW)
  const plotH = height - timeH
  const volH = showVolume ? Math.round(plotH * volumeRatio) : 0
  const priceH = plotH - volH - (showVolume ? 8 : 0)

  const last = candles[candles.length - 1]
  const lastValue = lastPrice ?? last?.close ?? 0
  const prevClose = candles[candles.length - 2]?.close ?? last?.open ?? lastValue

  const [lo, hi] = React.useMemo(() => {
    if (!candles.length) return [0, 1] as const
    let l = Infinity
    let h = -Infinity
    for (const c of candles) {
      if (c.low < l) l = c.low
      if (c.high > h) h = c.high
    }
    l = Math.min(l, lastValue)
    h = Math.max(h, lastValue)
    const pad = (h - l) * 0.06 || 1
    return niceDomain([l - pad, h + pad], 5)
  }, [candles, lastValue])

  const y = scaleLinear([lo, hi], [priceH, 6])
  const maxVol = Math.max(1, ...candles.map((c) => c.volume ?? 0))
  const yVol = scaleLinear([0, maxVol], [plotH, plotH - volH])
  const band = scaleBand(candles.length, [0, plotW], candles.length > 60 ? 0.15 : 0.3)
  const bw = Math.max(1, band.bandwidth)
  const ticks = y.ticks(5)

  const hovered = hover ? candles[hover.index] : undefined
  const shown = hovered ?? last
  const up = shown ? shown.close >= shown.open : true
  const change = shown ? shown.close - shown.open : 0

  const updateFromPointer = (e: React.PointerEvent) => {
    const box = ref.current?.getBoundingClientRect()
    if (!box || !candles.length) return
    const px = e.clientX - box.left
    const py = e.clientY - box.top
    if (px > plotW) return setHover(null)
    setHover({ index: band.indexAt(px), y: py <= priceH ? py : null })
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!candles.length) return
    const cur = hover?.index ?? candles.length - 1
    let next = cur
    if (e.key === "ArrowLeft") next = cur - 1
    else if (e.key === "ArrowRight") next = cur + 1
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = candles.length - 1
    else if (e.key === "Escape") return setHover(null)
    else return
    e.preventDefault()
    setHover({ index: clamp(next, 0, candles.length - 1), y: null })
  }

  const crossX = hover ? band(hover.index) + bw / 2 : 0
  const lastY = y(lastValue)
  const lastUp = lastValue >= prevClose

  return (
    <div data-slot="candlestick-chart" className={cn("grid w-full min-w-0 gap-3", className)} {...props}>
      {showReadout && shown && (
        <div
          aria-live="polite"
          className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-ui-sm text-muted-foreground tabular-nums"
        >
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            {formatPrice(hovered ? shown.close : lastValue)}
          </span>
          <span
            className="rounded-control-sm px-2 py-0.5 font-medium shadow-chip"
            style={{ color: up ? UP : DOWN, background: chartAlpha(up ? UP : DOWN, 12) }}
          >
            {change >= 0 ? "+" : ""}
            {formatPrice(change)} ({change >= 0 ? "+" : ""}
            {shown.open ? ((change / shown.open) * 100).toFixed(2) : "0.00"}%)
          </span>
          <span>
            O <b className="font-medium text-foreground">{formatPrice(shown.open)}</b>
          </span>
          <span>
            H <b className="font-medium text-foreground">{formatPrice(shown.high)}</b>
          </span>
          <span>
            L <b className="font-medium text-foreground">{formatPrice(shown.low)}</b>
          </span>
          <span>
            C <b className="font-medium text-foreground">{formatPrice(shown.close)}</b>
          </span>
          {shown.volume !== undefined && (
            <span>
              {labels.volumeShort} <b className="font-medium text-foreground">{formatVolume(shown.volume)}</b>
            </span>
          )}
          <span className="ml-auto">{formatTime(shown.time)}</span>
        </div>
      )}

      <div
        ref={ref}
        tabIndex={0}
        role="img"
        aria-label={labels.candleHistoryHint(label)}
        onKeyDown={onKeyDown}
        onPointerMove={updateFromPointer}
        onPointerDown={updateFromPointer}
        onPointerLeave={() => setHover(null)}
        onBlur={() => setHover(null)}
        className="relative w-full touch-pan-y rounded-xl outline-none select-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ height }}
      >
        {width > 0 && (
          <svg width={width} height={height} className="block overflow-visible" aria-hidden>
            {/* grid + axis */}
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={0}
                  x2={plotW}
                  y1={y(t)}
                  y2={y(t)}
                  className="stroke-border"
                  strokeDasharray="2 4"
                />
                <text
                  x={plotW + 8}
                  y={y(t)}
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-ui-2xs tabular-nums"
                >
                  {formatPrice(t)}
                </text>
              </g>
            ))}
            {showVolume && (
              <line x1={0} x2={plotW} y1={plotH} y2={plotH} className="stroke-border" />
            )}

            {/* volume */}
            {showVolume &&
              candles.map((c, i) => {
                const isUp = c.close >= c.open
                const vy = yVol(c.volume ?? 0)
                return (
                  <motion.rect
                    key={`v-${c.time}`}
                    initial={{ x: band(i), y: plotH, height: 0, opacity: 0 }}
                    animate={{
                      x: band(i),
                      y: vy,
                      height: Math.max(0, plotH - vy),
                      opacity: hover && hover.index !== i ? 0.25 : 0.45,
                    }}
                    transition={transition}
                    width={bw}
                    rx={Math.min(2, bw / 2)}
                    style={{ fill: isUp ? UP : DOWN }}
                  />
                )
              })}

            {/* candles */}
            {candles.map((c, i) => {
              const isUp = c.close >= c.open
              const color = isUp ? UP : DOWN
              const bodyTop = y(Math.max(c.open, c.close))
              const bodyH = Math.max(1, Math.abs(y(c.open) - y(c.close)))
              const cx = band(i) + bw / 2
              const dim = hover && hover.index !== i
              return (
                <motion.g
                  key={c.time}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: dim ? 0.55 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.line
                    initial={false}
                    animate={{ x1: cx, x2: cx, y1: y(c.high), y2: y(c.low) }}
                    transition={transition}
                    strokeWidth={1}
                    strokeLinecap="round"
                    style={{ stroke: color }}
                  />
                  <motion.rect
                    initial={{ x: band(i), y: bodyTop, height: bodyH }}
                    animate={{ x: band(i), y: bodyTop, height: bodyH }}
                    transition={transition}
                    width={bw}
                    rx={Math.min(2, bw / 3)}
                    style={{
                      fill: isUp ? chartAlpha(color, 88) : color,
                      stroke: color,
                      strokeWidth: 0.75,
                    }}
                  />
                </motion.g>
              )
            })}

            {/* last-price line */}
            {candles.length > 0 && (
              <motion.g initial={false} animate={{ y: lastY }} transition={transition}>
                <line
                  x1={0}
                  x2={plotW}
                  y1={0}
                  y2={0}
                  strokeDasharray="4 3"
                  style={{ stroke: lastUp ? UP : DOWN }}
                  strokeOpacity={0.8}
                />
                <rect
                  x={plotW + 2}
                  y={-9}
                  width={axisW - 4}
                  height={18}
                  rx={9}
                  style={{ fill: lastUp ? UP : DOWN }}
                />
                <text
                  x={plotW + axisW / 2}
                  y={0}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white text-ui-2xs font-semibold tabular-nums"
                  style={{ fill: onFill(lastUp ? UP : DOWN) }}
                >
                  {formatPrice(lastValue)}
                </text>
              </motion.g>
            )}

            {/* crosshair */}
            {hover && hovered && (
              <g className="pointer-events-none">
                <line
                  x1={crossX}
                  x2={crossX}
                  y1={0}
                  y2={plotH}
                  className="stroke-foreground/40"
                  strokeDasharray="3 3"
                />
                {hover.y !== null && (
                  <>
                    <line
                      x1={0}
                      x2={plotW}
                      y1={hover.y}
                      y2={hover.y}
                      className="stroke-foreground/40"
                      strokeDasharray="3 3"
                    />
                    <rect
                      x={plotW + 2}
                      y={hover.y - 9}
                      width={axisW - 4}
                      height={18}
                      rx={9}
                      className="fill-foreground"
                    />
                    <text
                      x={plotW + axisW / 2}
                      y={hover.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-background text-ui-2xs font-semibold tabular-nums"
                    >
                      {formatPrice(y.invert(hover.y))}
                    </text>
                  </>
                )}
                <g transform={`translate(${clamp(crossX, 30, plotW - 30)}, ${plotH + 2})`}>
                  <rect x={-30} y={0} width={60} height={17} rx={8.5} className="fill-foreground" />
                  <text
                    x={0}
                    y={8.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-background text-ui-2xs font-medium tabular-nums"
                  >
                    {formatTime(hovered.time)}
                  </text>
                </g>
              </g>
            )}

            {/* first / last time labels */}
            {!hover && candles.length > 1 && (
              <g className="fill-muted-foreground text-ui-2xs tabular-nums">
                <text x={0} y={plotH + 13}>
                  {formatTime(candles[0].time)}
                </text>
                <text x={plotW} y={plotH + 13} textAnchor="end">
                  {formatTime(last.time)}
                </text>
              </g>
            )}
          </svg>
        )}
      </div>

      <ChartDataTable
        caption={labels.chartData(label)}
        columns={[labels.time, labels.priceOpen, labels.priceHigh, labels.priceLow, labels.priceClose, labels.volume]}
        rows={candles.map((c) => [
          formatTime(c.time),
          formatPrice(c.open),
          formatPrice(c.high),
          formatPrice(c.low),
          formatPrice(c.close),
          c.volume !== undefined ? formatVolume(c.volume) : "",
        ])}
      />
    </div>
  )
}

/** Deterministic random-walk candles for demos and tests. */
function generateCandles(
  count: number,
  {
    seed = 7,
    start = 100,
    startTime = Date.UTC(2026, 0, 5, 9, 30),
    interval = 60_000,
    volatility = 0.006,
  }: { seed?: number; start?: number; startTime?: number; interval?: number; volatility?: number } = {}
): Candle[] {
  const rand = seededRandom(seed)
  const out: Candle[] = []
  let price = start
  for (let i = 0; i < count; i++) {
    const open = price
    const drift = (rand() - 0.48) * volatility * 2 * open
    const close = Math.max(0.01, open + drift)
    const high = Math.max(open, close) + rand() * volatility * open
    const low = Math.min(open, close) - rand() * volatility * open
    out.push({
      time: startTime + i * interval,
      open,
      high,
      low,
      close,
      volume: Math.round(800 + rand() * 2400 + Math.abs(drift) * 900),
    })
    price = close
  }
  return out
}

export { CandlestickChart, generateCandles, type CandlestickChartProps, type Candle }
