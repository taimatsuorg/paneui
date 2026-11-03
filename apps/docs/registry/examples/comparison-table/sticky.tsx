import { ComparisonTable } from "@paneui/ui/components/comparison-table"

const plans = ["Hobby", "Starter", "Pro", "Business", "Enterprise"].map((name) => ({ id: name.toLowerCase(), name }))

const rows: [string, number][] = [
  ["Deploys per day", 0],
  ["Preview links", 0],
  ["Custom domains", 1],
  ["Team roles", 2],
  ["Usage alerts", 2],
  ["Spend limits", 3],
  ["Audit log", 3],
  ["Single sign-on", 4],
  ["Dedicated support", 4],
  ["Uptime agreement", 4],
]

// Each row is included from the plan at its index upward.
const features = rows.map(([label, from]) => ({
  label,
  values: Object.fromEntries(plans.map((p, i) => [p.id, i >= from])),
}))

export default function ComparisonTableSticky() {
  return (
    <ComparisonTable
      plans={plans}
      features={features}
      stickyHeader
      stickyFeatureColumn
      maxHeight={260}
      containerClassName="w-full max-w-lg"
      className="min-w-2xl"
    />
  )
}
