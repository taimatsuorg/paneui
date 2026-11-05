import { ComparisonTable } from "@paneui/ui/components/comparison-table"

const plans = [
  { id: "personal", name: "Personal" },
  { id: "team", name: "Team" },
]

const features = [
  { label: "Unlimited projects", values: { personal: true, team: true } },
  { label: "Every component", values: { personal: true, team: true } },
  { label: "Shared workspace", values: { personal: false, team: true } },
  { label: "Priority support", values: { personal: false, team: true } },
]

export default function ComparisonTableDemo() {
  return <ComparisonTable plans={plans} features={features} containerClassName="w-full max-w-md" />
}
