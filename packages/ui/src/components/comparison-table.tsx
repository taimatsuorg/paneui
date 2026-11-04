"use client"

import * as React from "react"

import { CheckIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"

/*
 * Features down the side, plans across the top, a mark where they meet.
 *
 *   <ComparisonTable
 *     plans={[{ id: "personal", name: "Personal" }, { id: "team", name: "Team", highlighted: true }]}
 *     features={[{ label: "Unlimited projects", values: { personal: true, team: true } }]}
 *   />
 *
 * `true` draws the included mark, `false` / `null` the excluded dash, anything else (a string, a
 * number, a node) is shown as is. `sections` groups rows under a heading row instead of `features`.
 * The header band and the body sheet match Table and SimpleTable: the body takes the page colour.
 */

type ComparisonValue = boolean | null | undefined | React.ReactNode

type ComparisonPlan = {
  id: string
  name: React.ReactNode
  /** A line under the name: a price, a seat count. */
  detail?: React.ReactNode
  /** A short tag after the name, e.g. "Popular". */
  badge?: React.ReactNode
  /** Tint the column and colour its name. `highlight` on the table wins. */
  highlighted?: boolean
}

type ComparisonFeature = {
  /** Stable key; defaults to the label when it is a string. */
  id?: string
  label: React.ReactNode
  /** A muted line under the label. */
  hint?: React.ReactNode
  /** One value per plan id. */
  values: Record<string, ComparisonValue>
}

type ComparisonSection = {
  id?: string
  /** Heading row above the section's features. */
  label?: React.ReactNode
  features: readonly ComparisonFeature[]
}

type ComparisonTableProps = Omit<React.ComponentProps<"table">, "children"> & {
  plans: readonly ComparisonPlan[]
  features?: readonly ComparisonFeature[]
  /** Features grouped under heading rows. Used instead of `features`. */
  sections?: readonly ComparisonSection[]
  /** Header of the feature column. Defaults to the localized "Feature". */
  featureHeader?: React.ReactNode
  /** Plan id to tint; overrides `highlighted` on the plans. */
  highlight?: string
  /** Keep the header row in view while the table scrolls inside `maxHeight`. */
  stickyHeader?: boolean
  /** Keep the feature column in view while the table scrolls sideways. */
  stickyFeatureColumn?: boolean
  /** Height of the scrolling surface, e.g. `320` or `"50vh"`. */
  maxHeight?: number | string
  /** Class for the raised, scrolling surface around the table. */
  containerClassName?: string
}

/* Sticky cells sit on the band, so they paint it opaquely: card underneath, the muted fill on top. */
const band = "bg-card shadow-[inset_0_0_0_100vmax_var(--muted)]"
const highlightFill = "shadow-[inset_0_0_0_100vmax_var(--primary-subtle)]"

function ComparisonMark({ value, labels }: { value: ComparisonValue; labels: { included: string; notIncluded: string } }) {
  if (value === true) {
    return (
      <span data-slot="comparison-table-included" className="inline-flex align-middle text-success-text">
        <CheckIcon aria-hidden className="size-4" />
        <span className="sr-only">{labels.included}</span>
      </span>
    )
  }
  if (value === false || value == null) {
    return (
      <span data-slot="comparison-table-excluded" className="inline-flex align-middle text-fg-tertiary">
        <span aria-hidden>—</span>
        <span className="sr-only">{labels.notIncluded}</span>
      </span>
    )
  }
  return <span data-slot="comparison-table-value">{value}</span>
}

function featureKey(feature: ComparisonFeature, index: number) {
  return feature.id ?? (typeof feature.label === "string" ? feature.label : String(index))
}

function ComparisonTable({
  plans,
  features,
  sections,
  featureHeader,
  highlight,
  stickyHeader = false,
  stickyFeatureColumn = false,
  maxHeight,
  containerClassName,
  className,
  ...props
}: ComparisonTableProps) {
  const { labels } = useLocale()
  const groups: readonly ComparisonSection[] = sections ?? [{ features: features ?? [] }]
  const highlighted = (plan: ComparisonPlan) => (highlight !== undefined ? plan.id === highlight : !!plan.highlighted)
  const columns = plans.length + 1
  // The body's first row carries the sheet's rounded top; a section heading can be that row.
  let firstRow = true
  const takeFirst = () => {
    const was = firstRow
    firstRow = false
    return was
  }

  return (
    <div
      data-slot="comparison-table-container"
      className={cn("overflow-auto overscroll-x-contain rounded-xl bg-card shadow-raised", containerClassName)}
      style={maxHeight !== undefined ? { maxHeight } : undefined}
    >
      <table
        data-slot="comparison-table"
        className={cn("w-full table-fixed border-separate border-spacing-0 bg-muted text-start text-ui", className)}
        {...props}
      >
        <thead data-slot="comparison-table-header">
          <tr>
            <th
              scope="col"
              className={cn(
                // Columns share the width equally; with three plans or more the labels keep 11rem.
                plans.length > 2 && "w-44",
                "border-e border-border px-3 py-2 text-start align-bottom font-medium text-foreground",
                (stickyHeader || stickyFeatureColumn) && band,
                stickyHeader && "sticky top-0 z-20",
                stickyFeatureColumn && "sticky start-0 z-30"
              )}
            >
              {featureHeader ?? labels.feature}
            </th>
            {plans.map((plan, i) => {
              const on = highlighted(plan)
              return (
                <th
                  key={plan.id}
                  scope="col"
                  data-highlighted={on || undefined}
                  className={cn(
                    "px-3 py-2 text-start align-bottom font-medium text-foreground",
                    i < plans.length - 1 && "border-e border-border",
                    stickyHeader && cn("sticky top-0 z-20", band),
                    on && (stickyHeader ? "shadow-[inset_0_0_0_100vmax_var(--primary-subtle),inset_0_0_0_100vmax_var(--muted)]" : "bg-primary-subtle")
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className={cn("truncate", on && "text-primary-text")}>{plan.name}</span>
                    {plan.badge ? (
                      <span className="shrink-0 rounded-full bg-primary-subtle px-1.5 text-ui-2xs leading-4 font-medium text-primary-text">
                        {plan.badge}
                      </span>
                    ) : null}
                  </span>
                  {plan.detail ? <span className="block text-ui-sm font-normal text-muted-foreground tabular-nums">{plan.detail}</span> : null}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody data-slot="comparison-table-body">
          {groups.map((group, g) => {
            const last = g === groups.length - 1
            return (
              <React.Fragment key={group.id ?? g}>
                {group.label ? (
                  <tr data-slot="comparison-table-section">
                    {(() => {
                      const first = takeFirst()
                      return (
                        <th
                          scope="colgroup"
                          colSpan={columns}
                          className={cn(
                            "border-b border-border bg-background px-3 pt-3 pb-1.5 text-start text-ui-sm font-medium text-muted-foreground",
                            first && "rounded-t-xl border-t"
                          )}
                        >
                          <span className={cn(stickyFeatureColumn && "sticky start-3")}>{group.label}</span>
                        </th>
                      )
                    })()}
                  </tr>
                ) : null}
                {group.features.map((feature, f) => {
                  const first = takeFirst()
                  const end = last && f === group.features.length - 1
                  return (
                    <tr key={featureKey(feature, f)} data-slot="comparison-table-row">
                      <th
                        scope="row"
                        className={cn(
                          "border-e border-border bg-background px-3 py-2 text-start font-normal text-foreground",
                          !end && "border-b",
                          first && "rounded-ss-xl border-t",
                          stickyFeatureColumn && "sticky start-0 z-10"
                        )}
                      >
                        <span className="block">{feature.label}</span>
                        {feature.hint ? <span className="block text-ui-sm text-muted-foreground">{feature.hint}</span> : null}
                      </th>
                      {plans.map((plan, i) => {
                        const lastCol = i === plans.length - 1
                        return (
                          <td
                            key={plan.id}
                            data-highlighted={highlighted(plan) || undefined}
                            className={cn(
                              "bg-background px-3 py-2 text-start text-foreground tabular-nums",
                              !lastCol && "border-e border-border",
                              !end && "border-b border-border",
                              first && "border-t border-border",
                              first && lastCol && "rounded-se-xl",
                              highlighted(plan) && highlightFill
                            )}
                          >
                            <ComparisonMark value={feature.values[plan.id]} labels={labels} />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export { ComparisonTable, ComparisonMark }
export type { ComparisonTableProps, ComparisonPlan, ComparisonFeature, ComparisonSection, ComparisonValue }
