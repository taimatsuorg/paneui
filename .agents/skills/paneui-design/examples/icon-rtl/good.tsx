import { ChevronRightIcon } from "@/components/icons"

// Points forward in either reading direction (checked when the config sets "rtl": true).
export function NextGlyph() {
  return <ChevronRightIcon className="size-4 rtl:-scale-x-100" />
}
