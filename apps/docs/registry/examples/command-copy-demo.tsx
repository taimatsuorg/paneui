import { CommandCopy } from "@paneui/ui/components/command-copy"

export default function CommandCopyDemo() {
  return (
    <div className="w-full max-w-md">
      <CommandCopy command="npx shadcn@latest add @paneui/button" />
    </div>
  )
}
