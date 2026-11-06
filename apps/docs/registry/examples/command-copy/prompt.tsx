import { PromptCopy } from "@paneui/ui/components/command-copy"

const text = `Add the theme and the button to this project, then replace the submit button on the sign-up page with it.

Keep the existing click handler and run the type check when you are done.`

export default function CommandCopyPrompt() {
  return (
    <div className="w-full max-w-xl">
      <PromptCopy title="Prompt" text={text} />
    </div>
  )
}
