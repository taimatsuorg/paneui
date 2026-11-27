import { CommandCopy } from "@paneui/ui/components/command-copy"

export default function CommandCopyFloating() {
  return (
    <div className="flex w-full max-w-xl justify-center rounded-2xl bg-primary/12 px-6 py-10">
      <CommandCopy command="npx @taimatsu/paneui@latest init" variant="floating" />
    </div>
  )
}
