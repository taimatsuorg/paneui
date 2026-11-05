"use client"

import { useT, type Localized } from "@/lib/site-locale"
import { siteCopy } from "@/lib/site-copy"

import * as React from "react"
import Link from "next/link"
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ChevronRightIcon, CodeIcon, CopyIcon, EyeIcon, LinkIcon, XIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import { isPanelCollapsed } from "@paneui/ui/components/collapsible"
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

/** One example the stage can show: an `<item>/<id>` example, with its optional "when to use" sentence. */
export type StudioExample = { id: string; title: Localized; html: string; description?: React.ReactNode }

/** One row of the Code view: a title, its body, and the text its copy button writes (none: no button). */
export type StudioCodeRow = { id: string; title: Localized; body: React.ReactNode; copy?: string | (() => string) }

/**
 * One registry item the page documents: the host, or a variant merged into it. Each brings its own
 * demo, examples, install command and Code rows (`lead` before the selected example's source, `tail` after).
 */
export type StudioGroup = {
  item: string
  label: Localized
  /** Shown under the example list while this group's own demo is selected (variants only). */
  summary?: React.ReactNode
  demo: { html: string; filename: string }
  examples: StudioExample[]
  lead: StudioCodeRow[]
  tail: StudioCodeRow[]
}

type PagerLink = { href: string; title: string }

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

/**
 * Whether a closed row's body should be in the page yet. Bodies arrive one at a time in idle
 * time after the Code view shows (`order` staggers them), so switching views stays quick and a
 * later click only animates a body that is already laid out.
 */
function useWarmBody(open: boolean, order: number) {
  const [warm, setWarm] = React.useState(open)
  React.useEffect(() => {
    if (warm) return
    let idle = 0
    const timer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => setWarm(true), { timeout: 1000 })
      else setWarm(true)
    }, 200 + order * 120)
    return () => {
      window.clearTimeout(timer)
      if (idle) window.cancelIdleCallback(idle)
    }
  }, [warm, order])
  return warm || open
}

/** A white row on the stage: chevron and title open its body; the copy button sits outside the trigger. */
function CodeRow({ row, order, open, onOpenChange, copyLabel }: { row: StudioCodeRow; order: number; open: boolean; onOpenChange: (open: boolean) => void; copyLabel: string }) {
  const warm = useWarmBody(open, order)
  return (
    <CollapsiblePrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      data-row={row.id}
      className="relative flex min-w-0 flex-col rounded-inner bg-background"
    >
      <CollapsiblePrimitive.Trigger className="group/row flex h-12 cursor-pointer items-center gap-2.5 rounded-inner ps-3.5 pe-12 text-start text-ui-lg font-medium text-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring">
        <ChevronRightIcon
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-data-panel-open/row:rotate-90 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-data-panel-open/row:-rotate-90"
        />
        <LocalizedText text={row.title} />
      </CollapsiblePrimitive.Trigger>
      {row.copy !== undefined && (
        <div className="absolute end-2.5 top-2.5">
          <CopyButton text={row.copy} label={copyLabel} />
        </div>
      )}
      {/* The panel clips while it animates, so its body starts 2px down: the first sheet keeps its top hairline.
          Kept mounted and laid out while closed (zero height, invisible), so opening a row only animates its height. */}
      <CollapsiblePrimitive.Panel
        keepMounted
        hidden={false}
        className={(state) =>
          cn(
            "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none",
            isPanelCollapsed(state) && "invisible h-0"
          )
        }
      >
        {warm && <div className="flex min-w-0 flex-col gap-3 px-2 pt-0.5 pb-2">{row.body}</div>}
      </CollapsiblePrimitive.Panel>
    </CollapsiblePrimitive.Root>
  )
}

/** Which row an old section anchor (`#installation`, `#api-button`, `#note-…`) opens. */
function rowForHash(hash: string) {
  if (hash === "installation") return "install"
  if (hash === "usage") return "usage"
  if (hash === "composition") return "composition"
  if (hash.startsWith("api")) return "api"
  if (hash.startsWith("note-")) return "notes"
  return undefined
}

/**
 * A component page is these two panels and nothing else. The stage shows the selected example
 * (Preview) or the page's docs as white rows (Code: install, usage, the example's source, then
 * composition, API and notes). The side panel holds the title, the one-line summary, the example
 * list (grouped by variant on merged pages), the viewport, and the share and install actions.
 * From `lg` both panels fill the viewport; the side panel stays put and scrolls inside.
 * Phones stack the side panel first.
 */
export function ComponentStudio({
  name,
  title,
  summary,
  registry,
  backHref,
  markdownPath,
  pagePath,
  groups,
  stage,
  stageHint,
  prev,
  next,
}: {
  name: string
  title: string
  summary: React.ReactNode
  registry: string
  /** Where the close button goes (the gallery section this item is in). */
  backHref: string
  markdownPath: string
  pagePath: string
  /** The host first, then each merged variant. */
  groups: StudioGroup[]
  /** Replaces the host's default demo on the stage (the icon grid on the icons page). */
  stage?: React.ReactNode
  /** One line for the side panel while the custom stage shows (how to use it). */
  stageHint?: React.ReactNode
  prev?: PagerLink
  next?: PagerLink
}) {
  const t = useT()
  const label = (text: string) => t(siteCopy(text))
  const toast = useToast()
  const pm = usePackageManager()
  const [mode, setMode] = React.useState<"preview" | "code">("preview")
  const [sel, setSel] = React.useState<{ g: number; id: string }>({ g: 0, id: "demo" })
  const [viewport, setViewport] = React.useState<Viewport>("fit")
  const [open, setOpen] = React.useState<Set<string>>(() => new Set(["install"]))

  const group = groups[sel.g] ?? groups[0]
  const current = group.examples.find((e) => e.id === sel.id)
  const example = current ? `${group.item}/${current.id}` : undefined
  const Demo = example ? examples[example] : demos[group.item]
  const sourceHtml = current?.html ?? group.demo.html
  const sourceName = current ? `${current.id}.tsx` : group.demo.filename
  const customStage = sel.g === 0 && sel.id === "demo" ? stage : undefined
  const intro = customStage ? stageHint : current ? current.description : sel.g > 0 ? group.summary : undefined
  // A lone "Default" chip says nothing: the list shows once there is something to pick.
  const showList = groups.length > 1 || groups[0].examples.length > 0

  const query = new URLSearchParams(example ? { example } : { demo: group.item })
  const src = `${BASE_PATH}/preview/?${query.toString()}`
  const device = customStage ? undefined : VIEWPORTS.find((v) => v.value === viewport)
  const command = addCommand(pm, registry, group.item)

  const toggleRow = (id: string, on: boolean) =>
    setOpen((prevOpen) => {
      const nextOpen = new Set(prevOpen)
      if (on) nextOpen.add(id)
      else nextOpen.delete(id)
      return nextOpen
    })

  const select = (g: number, id: string) => {
    setSel({ g, id })
    // In the Code view a new example means its source: open that row.
    if (mode === "code") toggleRow("code", true)
  }

  // Old links: a variant's URL redirects to `#variant-<name>`, examples were `#example-<id>`, docs sections had their own anchors.
  React.useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1))
    if (!hash) return
    const g = groups.findIndex((x) => hash === `variant-${x.item}`)
    if (g > 0) return setSel({ g, id: "demo" })
    for (const [gi, x] of groups.entries()) {
      const ex = x.examples.find((e) => hash === `example-${e.id}` || hash === `example-${x.item}-${e.id}`)
      if (ex) return setSel({ g: gi, id: ex.id })
    }
    const row = rowForHash(hash)
    if (row) {
      setMode("code")
      setOpen(new Set([row]))
    }
  }, [groups])

  // Keep the selected example in view inside the list (it scrolls on its own; the page must not move).
  const listRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const list = listRef.current
    const el = list?.querySelector<HTMLElement>('[aria-checked="true"]')
    if (!list || !el) return
    const l = list.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    if (r.top < l.top) list.scrollTop += r.top - l.top - 4
    else if (r.bottom > l.bottom) list.scrollTop += r.bottom - l.bottom + 4
    if (r.left < l.left) list.scrollLeft += r.left - l.left - 4
    else if (r.right > l.right) list.scrollLeft += r.right - l.right + 4
  }, [sel])

  const copy = async (text: string, ok: string, fail: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.add({ title: label(ok), type: "success" })
    } catch {
      toast.add({ title: label(fail), type: "error" })
    }
  }

  const rows: StudioCodeRow[] = [
    ...group.lead,
    {
      id: "code",
      title: siteCopy("Code"),
      body: <StaticCode html={sourceHtml} filename={sourceName} language="tsx" />,
      copy: () => codeText(sourceHtml),
    },
    ...group.tail,
  ]
  const grouped = groups.length > 1

  return (
    <div
      id="preview"
      data-md-skip
      // Header (3rem) plus the shell's top and bottom padding (2.5rem each from lg).
      style={{ "--studio-h": "calc(100svh - 8rem)" } as React.CSSProperties}
      className="flex scroll-mt-24 flex-col gap-3"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Stage panel */}
        <section
          aria-label={label(mode === "preview" ? "Preview" : "Code")}
          className="tile frame-p-2 flex min-h-96 min-w-0 flex-col gap-2 md:min-h-136 lg:min-h-(--studio-h)"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 p-1">
            <SegmentedControl value={mode} onValueChange={(v) => setMode(v === "code" ? "code" : "preview")} aria-label={label("View")}>
              <SegmentedControlItem value="preview" data-mode="preview">
                <EyeIcon />
                <span className="max-sm:sr-only">{label("Preview")}</span>
              </SegmentedControlItem>
              <SegmentedControlItem value="code" data-mode="code">
                <CodeIcon />
                <span className="max-sm:sr-only">{label("Code")}</span>
              </SegmentedControlItem>
            </SegmentedControl>
            <PageActions variant="default" markdownPath={markdownPath} pagePath={pagePath} title={title} />
          </div>
          {mode === "preview" ? (
            customStage ? (
              <div className="flex min-w-0 flex-1 flex-col rounded-inner bg-background p-3 sm:p-5">{customStage}</div>
            ) : device?.width ? (
              <div className="flex flex-1 items-start justify-center overflow-hidden p-2">
                <DeviceFrame key={src + device.width} src={src} width={device.width} title={`${example ?? group.item} preview, ${device.label}`} />
              </div>
            ) : (
              <div className="flex min-w-0 flex-1 items-center justify-center overflow-x-auto p-6 sm:p-10">
                {Demo ? <Demo key={`${sel.g}-${sel.id}`} /> : null}
              </div>
            )
          ) : (
            <div className="flex min-w-0 flex-col gap-2">
              {rows.map((row, i) => (
                <CodeRow
                  key={row.id === "code" ? `code-${sel.g}-${sel.id}` : `${sel.g}-${row.id}`}
                  row={row}
                  order={i}
                  open={open.has(row.id)}
                  onOpenChange={(on) => toggleRow(row.id, on)}
                  copyLabel={label("Copy code")}
                />
              ))}
            </div>
          )}
        </section>

        {/* Side panel: phones show it above the stage; from lg it fills the viewport and scrolls inside. */}
        <aside className="tile flex min-w-0 flex-col gap-5 p-5 max-md:order-first lg:sticky lg:top-22 lg:h-(--studio-h)">
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

          {/* Only the example list scrolls; the intro under it and the viewport stay in view. */}
          <div className="flex min-h-0 flex-1 flex-col gap-5">
            {showList ? (
            <div className="flex min-h-0 min-w-0 flex-col gap-2">
              <p id={`${name}-example-label`} className="text-ui font-medium text-foreground">
                {label("Example")}
              </p>
              {/* A column on wider screens; phones scroll one row of chips sideways so the stage stays near the top. */}
              <div ref={listRef} role="radiogroup" aria-labelledby={`${name}-example-label`} className="-mx-1 flex gap-1 overflow-x-auto px-1 py-0.5 scrollbar-none md:-mx-2 md:min-h-0 md:flex-col md:gap-0.5 md:overflow-x-visible md:overflow-y-auto md:px-2 md:scrollbar-thin">
                {groups.map((g, gi) => (
                  <React.Fragment key={g.item}>
                    {grouped && (
                      <span
                        className={cn(
                          "flex shrink-0 items-center px-1 text-ui-xs font-medium whitespace-nowrap text-muted-foreground md:h-7 md:px-3",
                          gi > 0 && "max-md:ms-2 md:mt-2"
                        )}
                      >
                        <LocalizedText text={g.label} />
                      </span>
                    )}
                    {[{ id: "demo", title: siteCopy("Default") as Localized }, ...g.examples].map((ex) => {
                      const on = gi === sel.g && ex.id === sel.id
                      return (
                        <button
                          key={ex.id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          data-example={`${g.item}/${ex.id}`}
                          onClick={() => select(gi, ex.id)}
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
                  </React.Fragment>
                ))}
              </div>
              {intro && <p className="shrink-0 text-ui text-pretty text-muted-foreground md:px-3">{intro}</p>}
            </div>
            ) : (
              intro && <p className="text-ui text-pretty text-muted-foreground">{intro}</p>
            )}

            {/* Device widths need room to compare against; phones keep the inline preview. */}
            {!customStage && (
              <div className="flex shrink-0 items-center justify-between gap-3 max-md:hidden">
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
            )}
          </div>

          <div className="flex flex-col gap-2">
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

      {/* Neighbours in sidebar order: one quiet line, mainly for phones where the sidebar is a drawer. */}
      {(prev || next) && (
        <nav aria-label={label("Pagination")} className="flex items-center justify-between gap-4 px-1 text-ui-sm">
          {prev ? (
            <Link href={prev.href} rel="prev" className="flex min-w-0 items-center gap-1.5 rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
              <ArrowLeftIcon size={14} className="shrink-0 rtl:-scale-x-100" />
              <span className="truncate"><LocalizedText text={prev.title} /></span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={next.href} rel="next" className="flex min-w-0 items-center gap-1.5 rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
              <span className="truncate"><LocalizedText text={next.title} /></span>
              <ArrowRightIcon size={14} className="shrink-0 rtl:-scale-x-100" />
            </Link>
          ) : <span />}
        </nav>
      )}
    </div>
  )
}
