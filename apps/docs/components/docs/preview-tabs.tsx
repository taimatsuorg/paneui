"use client"

import { useT } from "@/lib/site-locale"
import { siteCopy } from "@/lib/site-copy"

import * as React from "react"

import { ExternalLinkIcon, MaximizeIcon, MonitorIcon, SmartphoneIcon, TabletIcon } from "@paneui/ui/icons"
import { Button } from "@paneui/ui/components/button"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@paneui/ui/components/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@paneui/ui/components/tooltip"

import { demos } from "./demos"
import { examples } from "./examples.generated"
import { TemplatePreview } from "./template-preview"
import { useFrameThemeSync } from "./theme-sync"

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** "fit" renders inline at the card's width; the others load the /preview frame at a device width. */
export type Viewport = "fit" | "desktop" | "tablet" | "mobile"
export const VIEWPORTS: { value: Viewport; label: string; icon: React.ComponentType; width?: number }[] = [
  { value: "fit", label: "Fit", icon: MaximizeIcon },
  { value: "desktop", label: "Desktop", icon: MonitorIcon, width: 1024 },
  { value: "tablet", label: "Tablet", icon: TabletIcon, width: 768 },
  { value: "mobile", label: "Mobile", icon: SmartphoneIcon, width: 390 },
]

export const isViewport = (v: unknown): v is Viewport => VIEWPORTS.some((x) => x.value === v)

/**
 * A device-width preview: the /preview frame in an iframe at `width`, scaled down to fit the
 * card when it is wider, grown to its content's height, and kept in the docs' theme.
 */
export function DeviceFrame({ src, width, title }: { src: string; width: number; title: string }) {
  const boxRef = React.useRef<HTMLDivElement>(null)
  const frameRef = React.useRef<HTMLIFrameElement>(null)
  const [box, setBox] = React.useState(0)
  const [height, setHeight] = React.useState(420)
  const scale = box > 0 ? Math.min(1, box / width) : 0

  React.useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => e && setBox(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const sync = useFrameThemeSync(frameRef)

  // Follow the framed page's height (popups and accordions change it).
  const onLoad = React.useCallback(() => {
    sync()
    const doc = frameRef.current?.contentDocument
    const body = doc?.querySelector<HTMLElement>("[data-slot=preview-frame]")
    if (!body) return
    const measure = () => setHeight(Math.min(900, Math.max(320, Math.ceil(body.scrollHeight))))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(body)
    frameRef.current?.addEventListener("load", () => ro.disconnect(), { once: true })
  }, [sync])

  return (
    <div ref={boxRef} className="flex w-full justify-center">
      {scale > 0 && (
        <div
          style={{ "--w": `${width * scale}px`, "--h": `${height * scale}px` } as React.CSSProperties}
          className="relative h-(--h) w-(--w) overflow-hidden rounded-inner bg-background shadow-raised"
        >
          <iframe
            ref={frameRef}
            src={src}
            title={title}
            onLoad={onLoad}
            loading="lazy"
            style={{ "--vw": `${width}px`, "--vh": `${height}px`, "--scale": scale } as React.CSSProperties}
            className="absolute top-0 left-0 h-(--vh) w-(--vw) origin-top-left scale-(--scale) border-0"
          />
        </div>
      )}
    </div>
  )
}

/**
 * Preview / Code tabs with a viewport switch: fit, or a device width in an iframe so media and
 * container queries react. The switch is the same tab list as Preview / Code, icon-only.
 * `name` is a gallery demo key; `example` ("<name>/<id>") picks a docs example instead.
 */
export function PreviewTabs({
  name,
  example,
  templatePath,
  code,
  className,
}: {
  name?: string
  example?: string
  /** A full-page template route: the preview is that page in a scaled frame instead of the inline example. */
  templatePath?: string
  code: React.ReactNode
  className?: string
}) {
  const t = useT()
  const label = (text: string) => t(siteCopy(text))
  const Demo = example ? examples[example] : name ? demos[name] : undefined
  const [tab, setTab] = React.useState("preview")
  const [viewport, setViewport] = React.useState<Viewport>("fit")

  const query = new URLSearchParams(example ? { example } : { demo: name ?? "" })
  const src = `${BASE_PATH}/preview/?${query.toString()}`
  const device = VIEWPORTS.find((v) => v.value === viewport)

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className={className}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <TabsList>
          <TabsTab value="preview">{label("Preview")}</TabsTab>
          <TabsTab value="code">{label("Code")}</TabsTab>
        </TabsList>
        {tab === "preview" && !templatePath && (
          <div data-slot="preview-toolbar" className="ms-auto flex flex-wrap items-center gap-2">
            {/* Device widths need room to compare against; small screens keep the inline preview. */}
            <Tabs value={viewport} onValueChange={(v) => isViewport(v) && setViewport(v)} className="max-md:hidden">
              <TabsList aria-label={label("Viewport")}>
                {VIEWPORTS.map((v) => (
                  <Tooltip key={v.value}>
                    <TooltipTrigger render={<TabsTab value={v.value} aria-label={label(v.label)} />}>
                      <v.icon />
                    </TooltipTrigger>
                    <TooltipContent>{v.width ? `${label(v.label)}, ${v.width}px` : label(v.label)}</TooltipContent>
                  </Tooltip>
                ))}
              </TabsList>
            </Tabs>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<a href={src} target="_blank" rel="noreferrer" />}
                    aria-label={label("Open preview in a new tab")}
                  />
                }
              >
                <ExternalLinkIcon className="rtl:-scale-x-100" />
              </TooltipTrigger>
              <TooltipContent>{label("Open in a new tab")}</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
      <TabsPanel value="preview">
        {templatePath ? (
          <TemplatePreview name={example ?? name ?? "template"} path={templatePath} height={480} />
        ) : device?.width ? (
          <div className="frame-2xl frame-p-3 bg-secondary">
            <DeviceFrame key={src + device.width} src={src} width={device.width} title={`${example ?? name} preview, ${device.label}`} />
          </div>
        ) : (
          <div
            className={
              example
                ? "tile flex min-h-56 items-center justify-center p-6 sm:p-8"
                : "tile flex min-h-80 items-center justify-center p-6 sm:p-10"
            }
          >
            {Demo ? <Demo /> : null}
          </div>
        )}
      </TabsPanel>
      <TabsPanel value="code">{code}</TabsPanel>
    </Tabs>
  )
}
