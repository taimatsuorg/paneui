import { SparklesIcon } from "@/components/icons"

// icon-bold puts every line icon inside on the bold stroke tier, matching the semibold type.
export function SectionTitle() {
  return (
    <h3 className="flex items-center gap-2 text-ui-lg font-semibold text-balance icon-bold">
      <SparklesIcon className="size-4" />
      Highlights
    </h3>
  )
}
