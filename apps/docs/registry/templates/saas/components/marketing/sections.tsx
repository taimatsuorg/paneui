"use client"

import * as React from "react"

import { ArrowRightIcon, CheckIcon } from "@paneui/ui/icons"
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@paneui/ui/components/accordion"
import { Avatar, AvatarFallback } from "@paneui/ui/components/avatar"
import { Badge } from "@paneui/ui/components/badge"
import { Button } from "@paneui/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@paneui/ui/components/card"
import { Marquee } from "@paneui/ui/components/marquee"
import { NumberTicker } from "@paneui/ui/components/number-ticker"
import { SegmentedControl, SegmentedControlItem } from "@paneui/ui/components/segmented-control"
import { StatCardDelta } from "@paneui/ui/components/stat-card"
import { TextReveal } from "@paneui/ui/components/text-reveal"
import { TrendChart } from "@paneui/ui/components/trend-chart"

import { brand, faqs, features, kpis, logos, plans, revenue, revenueSeries, stats, testimonials } from "../../lib/data"
import { AppLink, routes } from "../../lib/routes"
import { initials } from "../providers"
import { Container, SectionHeading } from "./marketing-shell"
import { Stagger, StaggerItem } from "./stagger"

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })

/* ───────────────────────── Hero ───────────────────────── */

/**
 * The headline runs the full measure; under it the pitch sits on the left and both actions on the
 * right, then the product itself at full container width on a tinted band, so the first screen
 * shows what you get.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title">
      <Container className="grid grid-cols-1 items-end gap-8 pt-16 pb-12 sm:pt-24 lg:grid-cols-12 lg:gap-x-12 lg:pb-16">
        <TextReveal
          as="h1"
          id="hero-title"
          text={brand.tagline}
          stagger={0.08}
          delay={0.1}
          blur={4}
          className="max-w-5xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:col-span-12 lg:text-6xl lg:leading-none"
        />
        <Stagger delay={0.45} className="grid grid-cols-1 items-end gap-6 lg:col-span-12 lg:grid-cols-12 lg:gap-x-12">
          <StaggerItem className="lg:col-span-6">
            <p className="text-lg leading-relaxed text-pretty text-muted-foreground">{brand.description}</p>
          </StaggerItem>
          <StaggerItem className="flex flex-wrap items-center gap-3 lg:col-span-6 lg:justify-end">
            <Button size="lg" nativeButton={false} render={<AppLink href={routes.signup} />}>
              Start free
              <ArrowRightIcon className="rtl:-scale-x-100" data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="secondary" nativeButton={false} render={<AppLink href={routes.pricing} />}>
              See pricing
            </Button>
          </StaggerItem>
          <StaggerItem className="lg:col-span-6 lg:col-start-7 lg:text-end">
            <p className="text-sm text-muted-foreground">Free for one seat · No card needed · SOC 2 Type II</p>
          </StaggerItem>
        </Stagger>
      </Container>
      <div className="bg-muted py-10 sm:py-14">
        <Container>
          <Stagger delay={0.8}>
            <StaggerItem>
              <ProductShot />
            </StaggerItem>
          </Stagger>
        </Container>
      </div>
    </section>
  )
}

/** A slice of the real dashboard, built from the same components: the KPI strip over the revenue chart. */
function ProductShot() {
  const shown = kpis.slice(0, 3)
  return (
    <Card data-ui aria-hidden className="text-start">
      <dl className="grid grid-cols-3 px-(--card-spacing)">
        {shown.map((k, i) => (
          <div key={k.id} className={i > 0 ? "flex min-w-0 flex-col gap-1 border-s border-border ps-4" : "flex min-w-0 flex-col gap-1 pe-4"}>
            <dt className="truncate text-ui text-muted-foreground">{k.label}</dt>
            <dd className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-xl font-semibold tracking-tight tabular-nums">{new Intl.NumberFormat("en-US", k.format).format(k.value)}</span>
              <span className="max-sm:hidden">
                <StatCardDelta value={k.delta} invert={k.invert} />
              </span>
            </dd>
          </div>
        ))}
      </dl>
      <CardContent>
        <TrendChart series={revenueSeries} data={revenue} variant="area" stacked height={260} showLegend={false} formatValue={(v) => usd.format(v)} label="Revenue by plan" />
      </CardContent>
    </Card>
  )
}

/* ───────────────────────── Logos + stats ───────────────────────── */

/** The numbers lead, set large on the left edge; the customer names run underneath. */
export function LogoStrip() {
  return (
    <section id="customers" aria-labelledby="customers-title" className="flex scroll-mt-20 flex-col gap-12 py-20">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <h2 id="customers-title" className="text-2xl leading-tight font-semibold tracking-tight text-balance lg:col-span-4">
          Trusted by 2,400 engineering teams
        </h2>
        <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse gap-1">
              <dt className="text-sm text-muted-foreground">{s.label}</dt>
              <dd className="flex items-baseline text-4xl font-semibold tracking-tight tabular-nums">
                {s.value > 99999 ? compact.format(s.value) : s.value.toLocaleString("en-US")}
                {s.suffix && <span className="text-lg text-muted-foreground">{s.suffix}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
      <Marquee duration={40} gap="3.5rem" repeat={3} aria-label="Customers">
        {logos.map((l) => (
          <span key={l} className="flex shrink-0 items-center gap-2 text-lg font-semibold whitespace-nowrap text-muted-foreground">
            <span aria-hidden className="size-4 rounded-md bg-muted-foreground/40" />
            {l}
          </span>
        ))}
      </Marquee>
    </section>
  )
}

/* ───────────────────────── Features ───────────────────────── */

/** The argument on the left, held in place while the six capabilities read down the right as a list. */
export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 bg-muted py-24">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <SectionHeading
              id="features-title"
              title="An agent you can hand real work to."
              body="Autocomplete finishes your line. Tessel finishes the ticket, with a plan you can read and a diff you can trust."
            />
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-7">
          {features.map((f) => (
            <div key={f.id} className="flex flex-col gap-2">
              <dt className="text-lg font-semibold text-balance">{f.title}</dt>
              <dd className="text-base leading-relaxed text-pretty text-muted-foreground">{f.body}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}

/* ───────────────────────── Pricing ───────────────────────── */

export type Cycle = "monthly" | "yearly"

export function CycleToggle({ cycle, onCycleChange }: { cycle: Cycle; onCycleChange: (c: Cycle) => void }) {
  return (
    <div className="flex items-center gap-3">
      <SegmentedControl value={cycle} onValueChange={(v) => onCycleChange(v as Cycle)} aria-label="Billing cycle">
        <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
        <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
      </SegmentedControl>
      <Badge size="sm" variant="success">
        Save 17%
      </Badge>
    </div>
  )
}

/** The three plan cards; shared by the home page section and /pricing. */
export function PlanCards({ cycle }: { cycle: Cycle }) {
  return (
    <div className="grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
      {plans.map((p) => {
        const price = cycle === "monthly" ? p.monthly : p.yearly
        return (
          // The featured tier gets a primary ring on a plain wrapper; Card keeps its own surface.
          <div key={p.id} className={p.featured ? "flex rounded-xl ring-2 ring-primary/50" : "flex"}>
            <Card className="flex-1 gap-6">
              <CardHeader className="gap-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  {p.featured && (
                    <Badge size="sm" variant="primary">
                      Most popular
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-pretty">{p.blurb}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex items-baseline gap-1.5">
                  <NumberTicker
                    value={price}
                    locale="en-US"
                    format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
                    className="text-4xl font-semibold tracking-tight tabular-nums"
                  />
                  <span className="text-sm text-muted-foreground">{price === 0 ? "forever" : "per seat / month"}</span>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm">
                      <CheckIcon size={16} className="mt-0.5 shrink-0 text-primary-text" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button
                  variant={p.featured ? "default" : "secondary"}
                  className="w-full"
                  nativeButton={false}
                  render={<AppLink href={p.id === "enterprise" ? "/#faq" : routes.signup} />}
                >
                  {p.cta}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )
      })}
    </div>
  )
}

export function PricingSection() {
  const [cycle, setCycle] = React.useState<Cycle>("yearly")
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 py-24">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading id="pricing-title" title="Simple pricing that scales with your team." body="Every plan includes the sandbox, approvals and PR reviews." />
          <CycleToggle cycle={cycle} onCycleChange={setCycle} />
        </div>
        <PlanCards cycle={cycle} />
        <Button variant="link" className="self-start" nativeButton={false} render={<AppLink href={routes.pricing} />}>
          Compare every feature
          <ArrowRightIcon className="rtl:-scale-x-100" data-icon="inline-end" />
        </Button>
      </Container>
    </section>
  )
}

/* ───────────────────────── Testimonials ───────────────────────── */

function Quoted({ name, role }: { name: string; role: string }) {
  return (
    <figcaption className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-sm text-muted-foreground">{role}</span>
      </span>
    </figcaption>
  )
}

/** One quote set large, the other two beside it at reading size. */
export function Testimonials() {
  const [lead, ...rest] = testimonials
  return (
    <section aria-labelledby="quotes-title" className="py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeading id="quotes-title" title="Teams that stopped babysitting their agent." />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {lead && (
            <figure className="flex flex-col gap-6 lg:col-span-7">
              <blockquote className="text-xl leading-snug font-medium tracking-tight text-balance sm:text-2xl">“{lead.quote}”</blockquote>
              <Quoted name={lead.name} role={lead.role} />
            </figure>
          )}
          <div className="flex flex-col gap-10 lg:col-span-5">
            {rest.map((t) => (
              <figure key={t.name} className="flex flex-col gap-4">
                <blockquote className="text-base leading-relaxed text-pretty">“{t.quote}”</blockquote>
                <Quoted name={t.name} role={t.role} />
              </figure>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ───────────────────────── FAQ + CTA ───────────────────────── */

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 py-24">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            id="faq-title"
            title="Questions, answered."
            body={`Can't find what you need? Write to ${brand.supportEmail} and a human will reply within a day.`}
          />
        </div>
        <Accordion defaultValue={["data"]} className="lg:col-span-7">
          {faqs.map((f) => (
            <AccordionItem key={f.id} value={f.id}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionPanel>{f.a}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  )
}

/** The close: a flat tinted field, the ask on the left and both actions on the right. */
export function Cta() {
  return (
    <section aria-labelledby="cta-title" className="bg-muted py-20">
      <Container className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <h2 id="cta-title" className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
            Give Tessel your next ticket.
          </h2>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            Install the GitHub app, point it at an issue and review the PR it opens. Free for one seat.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
          <Button size="lg" nativeButton={false} render={<AppLink href={routes.signup} />}>
            Start free
            <ArrowRightIcon className="rtl:-scale-x-100" data-icon="inline-end" />
          </Button>
          <Button size="lg" variant="secondary" nativeButton={false} render={<AppLink href={routes.login} />}>
            Sign in
          </Button>
        </div>
      </Container>
    </section>
  )
}
