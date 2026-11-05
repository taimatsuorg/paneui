import { SparklesIcon } from "@paneui/ui/icons"
import { ReasoningText } from "@paneui/ui/components/reasoning-text"

export default function ReasoningTextCustomIndicator() {
  return (
    <div className="flex flex-col gap-3">
      <ReasoningText indicator={<SparklesIcon className="size-4 text-primary-text" />} phrases={["Brainstorming names", "Checking domains"]} />
      <ReasoningText indicator={null} phrases={["Summarising the thread", "Pulling out action items"]} />
    </div>
  )
}
