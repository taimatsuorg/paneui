import { SparklesIcon } from "@/components/icons"

// A regular stroke beside semibold text looks faint next to the type.
export function SectionTitle() {
  return (
    <h3 className="flex items-center gap-2 text-ui-lg font-semibold text-balance">
      <SparklesIcon className="size-4" />
      Highlights
    </h3>
  )
}
