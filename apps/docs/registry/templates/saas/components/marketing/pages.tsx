"use client"

import * as React from "react"

import { CheckIcon, MinusIcon } from "@paneui/ui/icons"
import { Badge } from "@paneui/ui/components/badge"

import { changelog, comparison, plans } from "../../lib/data"
import { Container, MarketingShell, SectionHeading } from "./marketing-shell"
import { CycleToggle, Cta, Faq, Features, Hero, LogoStrip, PlanCards, PricingSection, Testimonials, type Cycle } from "./sections"
import { Stagger, StaggerItem } from "./stagger"

/** `/` */
export function HomePage() {
  return (
    <MarketingShell>
      <Hero />
      <LogoStrip />
      <Features />
      <PricingSection />
      <Testimonials />
      <Faq />
      <Cta />
    </MarketingShell>
  )
}

/** `/pricing`: plan cards with the cycle toggle, a full comparison table, FAQ. */
export function PricingPage() {
  const [cycle, setCycle] = React.useState<Cycle>("yearly")
  return (
    <MarketingShell>
      <section className="py-20">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <Stagger className="flex flex-col gap-3">
              <StaggerItem>
                <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Pricing</h1>
              </StaggerItem>
              <StaggerItem>
                <p className="max-w-xl text-lg text-pretty text-muted-foreground">
                  Start free on one seat. Upgrade when your team does. Every plan includes the sandbox, approvals and PR reviews.
                </p>
              </StaggerItem>
            </Stagger>
            <CycleToggle cycle={cycle} onCycleChange={setCycle} />
          </div>
          <PlanCards cycle={cycle} />
        </Container>
      </section>

      <section aria-labelledby="compare-title" className="pb-4">
        <Container className="flex flex-col gap-8">
          <SectionHeading id="compare-title" title="Every feature, side by side." />
          <div className="overflow-x-auto rounded-xl bg-card shadow-raised">
            <table className="w-full min-w-xl text-sm">
              <caption id="compare" className="sr-only">
                Plan comparison
              </caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="w-2/5 px-5 py-4 text-start font-medium text-muted-foreground">
                    Feature
                  </th>
                  {plans.map((p) => (
                    <th key={p.id} scope="col" className="px-5 py-4 text-start font-semibold">
                      <span className="flex items-center gap-2">
                        {p.name}
                        {p.featured && (
                          <Badge size="sm" variant="primary">
                            Popular
                          </Badge>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              {comparison.map((g) => (
                <tbody key={g.group}>
                  <tr className="border-t border-border">
                    <th scope="colgroup" colSpan={plans.length + 1} className="px-5 pt-6 pb-2 text-start text-sm font-semibold">
                      {g.group}
                    </th>
                  </tr>
                  {g.rows.map((r) => (
                    <tr key={r.label} className="border-t border-border">
                      <th scope="row" className="px-5 py-3 text-start font-normal">
                        {r.label}
                      </th>
                      {plans.map((p) => {
                        const v = r.values[p.id]
                        return (
                          <td key={p.id} className="px-5 py-3">
                            {v === true ? (
                              <CheckIcon size={16} className="text-primary-text" aria-label="Included" />
                            ) : v === false ? (
                              <MinusIcon size={16} className="text-muted-foreground/60" aria-label="Not included" />
                            ) : (
                              <span className="text-muted-foreground">{v}</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </Container>
      </section>

      <Faq />
      <Cta />
    </MarketingShell>
  )
}

/** `/changelog`: release notes from `changelog` in data.ts. */
export function ChangelogPage() {
  return (
    <MarketingShell>
      <section className="py-20">
        <Container className="flex max-w-3xl flex-col gap-12">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-semibold tracking-tight text-balance">Changelog</h1>
            <p className="text-lg text-pretty text-muted-foreground">New in Tessel, newest first.</p>
          </div>
          <ol className="flex flex-col gap-16">
            {changelog.map((c) => (
              <li key={c.version} className="grid grid-cols-1 gap-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium tabular-nums">v{c.version}</span>
                  <time className="text-sm text-muted-foreground">{c.date}</time>
                </div>
                <article className="flex flex-col gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-balance">{c.title}</h2>
                  <p className="leading-relaxed text-pretty text-muted-foreground">{c.body}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.tags.map((t) => (
                      <Badge key={t} size="sm" variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </MarketingShell>
  )
}
