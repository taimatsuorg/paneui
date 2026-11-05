"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"

/*
 * Ranked list with a proportional bar behind each label: top pages,
 * referrers, countries, plans. The bar is a tinted wash of a chart colour so
 * the label stays readable on top of it.
 *
 *   <BarList items={[{ name: "/pricing", value: 4210 }, …]} formatValue={(v) => v.toLocaleString()} />
 */

type BarListItem = {
  name: string
  value: number
  /** Leading glyph or favicon (16px). */
  icon?: React.ReactNode
  href?: string
  key?: string
}

type BarListProps = Omit<React.ComponentProps<"ul">, "children" | "color"> & {
  items: readonly BarListItem[]
  formatValue?: (value: number) => string
  /** Sort by value, largest first (default) or keep the given order. */
  sort?: "desc" | "none"
  /** Chart token for the bars: 1–8 (chart-1…chart-8). Default 1 (blue). */
  color?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  /** Optional header labels, e.g. ["Page", "Visitors"]. */
  labels?: [string, string]
}

const WASH: Record<number, string> = {
  1: "bg-chart-1/20",
  2: "bg-chart-2/20",
  3: "bg-chart-3/20",
  4: "bg-chart-4/20",
  5: "bg-chart-5/20",
  6: "bg-chart-6/20",
  7: "bg-chart-7/20",
  8: "bg-chart-8/20",
}

function BarList({ items, formatValue = (v) => String(v), sort = "desc", color = 1, labels, className, ...props }: BarListProps) {
  const reduce = useReducedMotion()
  const list = sort === "desc" ? [...items].sort((a, b) => b.value - a.value) : items
  const max = Math.max(1, ...list.map((i) => i.value))
  return (
    <div data-slot="bar-list" className="flex min-w-0 flex-col gap-2">
      {labels && (
        <div className="flex items-center justify-between px-2 text-ui-xs font-medium text-muted-foreground">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      )}
      <ul className={cn("flex min-w-0 flex-col gap-1", className)} {...props}>
        {list.map((item, i) => {
          const share = item.value / max
          const label = (
            <>
              {item.icon && <span className="flex shrink-0 text-muted-foreground [&_svg]:size-4">{item.icon}</span>}
              <span className="truncate">{item.name}</span>
            </>
          )
          return (
            <li key={item.key ?? item.name} className="flex items-center gap-3">
              <div className="relative flex h-8 min-w-0 flex-1 items-center">
                <motion.span
                  aria-hidden
                  className={cn("absolute inset-y-0 left-0 rounded-md", WASH[color])}
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${Math.max(share * 100, 1.5)}%` }}
                  transition={{ type: "spring", stiffness: 380, damping: 40, mass: 0.7, delay: reduce ? 0 : i * 0.04 }}
                />
                {item.href ? (
                  <a
                    href={item.href}
                    className="relative flex min-w-0 items-center gap-2 rounded-md px-2 text-ui outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {label}
                  </a>
                ) : (
                  <span className="relative flex min-w-0 items-center gap-2 px-2 text-ui">{label}</span>
                )}
              </div>
              <span className="shrink-0 text-ui text-muted-foreground tabular-nums">{formatValue(item.value)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { BarList }
export type { BarListItem, BarListProps }
