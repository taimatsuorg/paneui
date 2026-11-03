import { ComparisonTable } from "@paneui/ui/components/comparison-table"

const plans = [
  { id: "starter", name: "Starter" },
  { id: "growth", name: "Growth" },
  { id: "scale", name: "Scale" },
]

const sections = [
  {
    label: "Workspace",
    features: [
      { label: "Members", values: { starter: "3", growth: "25", scale: "Unlimited" } },
      { label: "Guests", hint: "Read-only access to shared pages", values: { starter: false, growth: true, scale: true } },
    ],
  },
  {
    label: "Security",
    features: [
      { label: "Single sign-on", values: { starter: false, growth: false, scale: true } },
      { label: "Two-step sign-in", values: { starter: true, growth: true, scale: true } },
    ],
  },
]

export default function ComparisonTableSections() {
  return <ComparisonTable plans={plans} sections={sections} containerClassName="w-full max-w-xl" />
}
