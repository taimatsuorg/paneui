import { BellIcon, BotIcon, HeartIcon, SearchIcon, SendIcon, SparklesIcon } from "@paneui/ui/icons"

export default function IconsDemo() {
  return (
    <div className="flex items-center gap-5 text-foreground">
      <HeartIcon />
      <SearchIcon />
      <SparklesIcon />
      <BotIcon size={24} />
      <BellIcon className="text-primary-text" />
      <SendIcon className="text-success-text rtl:-scale-x-100" />
    </div>
  )
}
