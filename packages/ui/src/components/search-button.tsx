"use client"

import * as React from "react"
import { cva } from "class-variance-authority"

import { SearchIcon } from "@paneui/ui/icons"
import { Kbd } from "@paneui/ui/components/kbd"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { cn } from "@paneui/ui/lib/utils"

const searchButtonVariants = cva(
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center gap-2 frame-control frame-inset-2 bg-background text-ui text-muted-foreground shadow-well outline-none hover:bg-secondary hover:text-foreground active:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-64 sm:w-64 sm:justify-start sm:px-2.5 [&_[data-slot=kbd]]:rounded-inner-or-2xs"
)

type SearchButtonProps = Omit<React.ComponentProps<"button">, "children"> & {
  label?: string
  shortcut?: React.ReactNode
}

/** Opens search; the application owns its dialog and keyboard shortcut. */
function SearchButton({ label, shortcut = "⌘K", className, ...props }: SearchButtonProps) {
  const { labels } = useLocale()
  const name = label ?? labels.searchPlaceholder
  return (
    <button type="button" data-slot="search-button" aria-label={name} title={name} className={cn(searchButtonVariants(), className)} {...props}>
      <SearchIcon className="size-4 shrink-0" />
      <span aria-hidden className="hidden min-w-0 flex-1 truncate text-start sm:block">{name}</span>
      <span aria-hidden className="hidden sm:block">{shortcut && <Kbd size="sm">{shortcut}</Kbd>}</span>
    </button>
  )
}

export { SearchButton }
export type { SearchButtonProps }
