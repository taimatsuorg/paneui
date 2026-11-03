"use client"

import { useT } from "@/lib/site-locale"
import { siteCopy } from "@/lib/site-copy"

import * as React from "react"

import { Button } from "@paneui/ui/components/button"
import { cn } from "@paneui/ui/lib/utils"

import { examples } from "./examples.generated"
import { InstallChip } from "./install-command"

/**
 * One docs example as a card: the live example on a grey tile, then a footer with its title (and one
 * line on when to use it), the install chip for the item it belongs to, and a View code toggle that
 * opens the source under the footer.
 */
export function ExampleCard({
  id,
  example,
  item,
  registry,
  title,
  description,
  code,
  className,
}: {
  /** Anchor for the table of contents. */
  id: string
  /** "<name>/<example id>" in examples.generated. */
  example: string
  /** Registry item the install chip names. */
  item: string
  registry: string
  title: React.ReactNode
  description?: React.ReactNode
  code: React.ReactNode
  className?: string
}) {
  const t = useT()
  const Demo = examples[example]
  const [open, setOpen] = React.useState(false)
  const codeId = `${id}-code`
  return (
    <div id={id} data-slot="example-card" className={cn("tile flex min-w-0 scroll-mt-24 flex-col xl:scroll-mt-20", className)}>
      <div className="flex min-h-56 items-center justify-center p-6 sm:p-10">{Demo ? <Demo /> : null}</div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 pb-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="text-ui font-medium text-foreground">{title}</h3>
          {description && <p className="text-ui-sm text-pretty text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <InstallChip item={item} registry={registry} />
          <Button size="sm" variant="secondary" className="bg-background shadow-raised" aria-expanded={open} aria-controls={codeId} onClick={() => setOpen((v) => !v)}>
            {t(siteCopy(open ? "Hide code" : "View code"))}
          </Button>
        </div>
      </div>
      {open && (
        <div id={codeId} className="px-1.5 pb-1.5">
          {code}
        </div>
      )}
    </div>
  )
}
