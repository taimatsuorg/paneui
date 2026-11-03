import { ComparisonTable } from "@paneui/ui/components/comparison-table"

const plans = [
  { id: "free", name: "Free", detail: "$0" },
  { id: "plus", name: "Plus", detail: "$11 USD / mo", badge: "Popular", highlighted: true },
  { id: "team", name: "Team", detail: "$29 USD / mo" },
]

const features = [
  { label: "Projects", values: { free: "3", plus: "Unlimited", team: "Unlimited" } },
  { label: "Storage", values: { free: "5 GB", plus: "100 GB", team: "1 TB" } },
  { label: "Custom domains", values: { free: false, plus: true, team: true } },
  { label: "Audit log", values: { free: false, plus: false, team: true } },
]

export default function ComparisonTableHighlighted() {
  return <ComparisonTable plans={plans} features={features} containerClassName="w-full max-w-xl" />
}
