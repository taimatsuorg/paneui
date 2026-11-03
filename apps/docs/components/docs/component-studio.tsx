"use client"

import { useT, type Localized } from "@/lib/site-locale"
import { siteCopy } from "@/lib/site-copy"

import * as React from "react"
import Link from "next/link"
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

import { CheckIcon, ChevronRightIcon, CodeIcon, CopyIcon, EyeIcon, LinkIcon, XIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import { SegmentedControl, SegmentedControlItem } from "@paneui/ui/components/segmented-control"
import { Tooltip, TooltipContent, TooltipTrigger } from "@paneui/ui/components/tooltip"
import { useToast } from "@paneui/ui/components/toast"

import { demos } from "./demos"
import { examples } from "./examples.generated"
import { addCommand, usePackageManager } from "./install-command"
import { StaticCode } from "@/components/site/static-code"

import { LocalizedText } from "./localized"
import { PageActions } from "./page-actions"
import { DeviceFrame, isViewport, VIEWPORTS, type Viewport } from "./preview-tabs"

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** Rows that come before the Code row; the rest (API and the like) follow it. */
const LEAD_ROWS = new Set(["install", "usage"])

/** One example the stage can show: "demo" is the page's own demo, the rest are `<name>/<id>` examples. */
export type StudioExample = { id: string; title: Localized; html: string }

/** One row of the Code view: a title, its body, and the text its copy button writes (none: no button). */
export type StudioCodeRow = { id: string; title: Localized; body: React.ReactNode; copy?: string | (() => string); defaultOpen?: boolean }

/** Plain text of a highlighted code sample, for the copy buttons. */
export function codeText(html: string) {
  if (typeof window === "undefined") return ""
  return new DOMParser().parseFromString(html, "text/html").body.textContent ?? ""
}

function CopyButton({ text, label }: { text: string | (() => string); label: string }) {
  const [done, setDone] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            className="text-muted-foreground"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(typeof text === "function" ? text() : text)
                setDone(true)
                window.clearTimeout(timer.current)
                timer.current = window.setTimeout(() => setDone(false), 1600)
              } catch {
                // clipboard blocked: nothing to show
              }
            }}
          />
        }
      >
        {done ? <CheckIcon className="text-success-text" /> : <CopyIcon />}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** A white row on the panel: chevron and title open its body; the copy button sits outside the trigger. */
function CodeRow({ row, copyLabel }: { row: StudioCodeRow; copyLabel: string }) {
  return (
    <CollapsiblePrimitive.Root defaultOpen={row.defaultOpen} className="relative flex min-w-0 flex-col rounded-inner bg-background">
      <CollapsiblePrimitive.Trigger className="group/row flex h-12 cursor-pointer items-center gap-2.5 rounded-inner ps-3.5 pe-12 text-start text-ui-lg font-medium text-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring">
        <ChevronRightIcon
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-panel-open/row:rotate-90 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-data-panel-open/row:-rotate-90"
        />
        <LocalizedText text={row.title} />
      </CollapsiblePrimitive.Trigger>
      {row.copy !== undefined && (
        <div className="absolute end-2.5 top-2.5">
          <CopyButton text={row.copy} label={copyLabel} />
        </div>
      )}
      <CollapsiblePrimitive.Panel className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-300 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none">
        <div className="flex min-w-0 flex-col gap-3 px-2 pb-2">{row.body}</div>
      </CollapsiblePrimitive.Panel>
    </CollapsiblePrimitive.Root>
  )
}

/**
 * The first screen of a component page: a wide stage panel (Preview / Code, the page's Copy page
 * action) beside a narrow panel with the title, the one-line summary, which example the stage
 * shows, the viewport, and the share and install actions. Phones stack the info panel first.
 */
export function ComponentStudio({
  name,
  title,
  summary,
  registry,
  backHref,
  markdownPath,
  pagePath,
  demo,
  items,
  codeRows,
}: {
  name: string
  title: string
  summary: React.ReactNode
  registry: string
  /** Where the close button goes (the gallery section this item is in). */
  backHref: string
  markdownPath: string
  pagePath: string
  demo: { html: string; filename: string }
  items: StudioExample[]
  /** Install and Usage, then rows such as API; the Code row for the selected example goes between them. */
  codeRows: StudioCodeRow[]
}) {
  const t = useT()
  const label = (text: string) => t(siteCopy(text))
  const toast = useToast()
  const pm = usePackageManager()
  const [mode, setMode] = React.useState<"preview" | "code">("preview")
  const [selected, setSelected] = React.useState("demo")
  const [viewport, setViewport] = React.useState<Viewport>("fit")

  const example = selected === "demo" ? undefined : `${name}/${selected}`
  const Demo = example ? examples[example] : demos[name]
  const current = items.find((i) => i.id === selected)
  const sourceHtml = current?.html ?? demo.html
  const sourceName = current ? `${current.id}.tsx` : demo.filename

  const query = new URLSearchParams(example ? { example } : { demo: name })
  const src = `${BASE_PATH}/preview/?${query.toString()}`
  const device = VIEWPORTS.find((v) => v.value === viewport)
  const command = addCommand(pm, registry, name)

  const copy = async (text: string, ok: string, fail: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.add({ title: label(ok), type: "success" })
    } catch {
      toast.add({ title: label(fail), type: "error" })
    }
  }

  const rows: StudioCodeRow[] = [
    ...codeRows.filter((r) => LEAD_ROWS.has(r.id)),
    {
      id: "code",
      title: siteCopy("Code"),
      body: <StaticCode html={sourceHtml} filename={sourceName} language="tsx" maxHeight={420} />,
      copy: () => codeText(sourceHtml),
    },
    ...codeRows.filter((r) => !LEAD_ROWS.has(r.id)),
  ]

  return (
    <div id="preview" data-md-skip className="grid scroll-mt-24 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_19rem] xl:scroll-mt-20 xl:grid-cols-[minmax(0,1fr)_21rem]">
      {/* Stage panel */}
      <section aria-label={label(mode === "preview" ? "Preview" : "Code")} className="tile frame-p-2 flex min-h-96 min-w-0 flex-col gap-2 md:min-h-136">
        <div className="flex flex-wrap items-center justify-between gap-2 p-1">
          <SegmentedControl value={mode} onValueChange={(v) => setMode(v === "code" ? "code" : "preview")} aria-label={label("Preview")}>
            <SegmentedControlItem value="preview">
              <EyeIcon />
              <span className="max-sm:sr-only">{label("Preview")}</span>
            </SegmentedControlItem>
            <SegmentedControlItem value="code">
              <CodeIcon />
              <span className="max-sm:sr-only">{label("Code")}</span>
            </SegmentedControlItem>
          </SegmentedControl>
          <PageActions variant="default" markdownPath={markdownPath} pagePath={pagePath} title={title} />
        </div>
        {mode === "preview" ? (
          device?.width ? (
            <div className="flex flex-1 items-start justify-center overflow-hidden p-2">
              <DeviceFrame key={src + device.width} src={src} width={device.width} title={`${example ?? name} preview, ${device.label}`} />
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 items-center justify-center overflow-x-auto p-6 sm:p-10">
              {Demo ? <Demo key={selected} /> : null}
            </div>
          )
        ) : (
          <div className="flex min-w-0 flex-col gap-2">
            {rows.map((row) => (
              <CodeRow
                key={row.id === "code" ? `code-${selected}` : row.id}
                row={row}
                copyLabel={label("Copy code")}
              />
            ))}
          </div>
        )}
      </section>

      {/* Info panel: phones show it above the stage. */}
      <aside className="tile flex min-w-0 flex-col gap-5 p-5 max-md:order-first">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance text-foreground">
              <LocalizedText text={title} />
            </h1>
            <Tooltip>
              <TooltipTrigger
                render={<Button variant="ghost" size="icon-sm" className="-me-1.5 text-muted-foreground" nativeButton={false} render={<Link href={backHref} />} aria-label={label("Back to components")} />}
              >
                <XIcon />
              </TooltipTrigger>
              <TooltipContent>{label("Back to components")}</TooltipContent>
            </Tooltip>
          </div>
          <p className="text-ui-lg text-pretty text-muted-foreground">{summary}</p>
        </div>

        {items.length > 0 && (
          <div className="flex min-w-0 flex-col gap-2">
            <p id={`${name}-example-label`} className="text-ui font-medium text-foreground">
              {label("Example")}
            </p>
            {/* A column on wider screens; phones scroll one row of chips sideways so the stage stays near the top. */}
            <div role="radiogroup" aria-labelledby={`${name}-example-label`} className="-mx-1 flex gap-1 overflow-x-auto px-1 py-0.5 scrollbar-none md:mx-0 md:max-h-80 md:flex-col md:gap-0.5 md:overflow-x-visible md:overflow-y-auto md:px-0 md:scrollbar-thin">
              {[{ id: "demo", title: siteCopy("Default") as Localized, html: demo.html }, ...items].map((ex) => {
                const on = ex.id === selected
                return (
                  <button
                    key={ex.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setSelected(ex.id)}
                    className={cn(
                      "flex h-8 shrink-0 cursor-pointer items-center rounded-control px-3 text-start text-ui whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      on ? "bg-background font-medium text-foreground shadow-raised" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <span className="truncate">
                      <LocalizedText text={ex.title} />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Device widths need room to compare against; phones keep the inline preview. */}
        <div className="flex items-center justify-between gap-3 max-md:hidden">
          <span className="text-ui font-medium text-foreground">{label("Viewport")}</span>
          <SegmentedControl value={viewport} onValueChange={(v) => isViewport(v) && setViewport(v)} aria-label={label("Viewport")}>
            {VIEWPORTS.map((v) => (
              <Tooltip key={v.value}>
                <TooltipTrigger render={<SegmentedControlItem value={v.value} aria-label={label(v.label)} />}>
                  <v.icon />
                </TooltipTrigger>
                <TooltipContent>{v.width ? `${label(v.label)}, ${v.width}px` : label(v.label)}</TooltipContent>
              </Tooltip>
            ))}
          </SegmentedControl>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => copy(new URL(`${BASE_PATH}${pagePath}`, window.location.origin).toString(), "Link copied", "Couldn't copy the link")}
          >
            <LinkIcon data-icon="inline-start" />
            {label("Share")}
          </Button>
          <Button size="lg" className="w-full" onClick={() => copy(command, "Install command copied", "Couldn't copy the command")}>
            <CopyIcon data-icon="inline-start" />
            {label("Copy install")}
          </Button>
        </div>
      </aside>
    </div>
  )
}
