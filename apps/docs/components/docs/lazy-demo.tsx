"use client"

import * as React from "react"

import { cn } from "@paneui/ui/lib/utils"

import { demos } from "./demos"
import { galleryHeights } from "./gallery-heights"

/** Mount a little before the card scrolls in… */
const MOUNT_MARGIN = "200px 0px"
/** …and unmount only once it is well clear, so a card at the edge doesn't thrash. */
const UNMOUNT_MARGIN = "800px 0px"

/**
 * One gallery preview, rendered only while it is near the viewport.
 *
 * The gallery holds ~150 live demos (infinite motion loops, canvases, smooth-scroll
 * instances, timers). Keeping them all mounted kept every loop running and the
 * DOM at ~20k nodes, so the page got steadily slower. Here a demo mounts when it
 * comes within MOUNT_MARGIN of the viewport and unmounts (stopping its loops and
 * observers) once it is beyond UNMOUNT_MARGIN. While unmounted the preview keeps
 * its last measured height — or, before first mount, the measured estimate from
 * gallery-heights — so the layout never jumps.
 */
export function LazyDemo({
  name,
  eager = false,
  fit,
  className,
}: {
  name: string
  eager?: boolean
  /** Lay the demo out at least this wide (px) and scale it down to fit a fixed-size box (see FittedDemo). */
  fit?: number
  className?: string
}) {
  const Demo = demos[name]
  const ref = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(eager)
  const [held, setHeld] = React.useState<number | null>(null)
  const last = React.useRef<number | null>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const near = new IntersectionObserver(([e]) => e?.isIntersecting && setMounted(true), { rootMargin: MOUNT_MARGIN })
    const far = new IntersectionObserver(([e]) => e && !e.isIntersecting && setMounted(false), { rootMargin: UNMOUNT_MARGIN })
    near.observe(el)
    far.observe(el)
    // A held height is only valid for the width it was measured at.
    const onResize = () => {
      last.current = null
      setHeld(null)
    }
    window.addEventListener("resize", onResize)
    return () => {
      near.disconnect()
      far.disconnect()
      window.removeEventListener("resize", onResize)
    }
  }, [])

  // Track the rendered height while mounted; hold it once unmounted.
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (!mounted) {
      setHeld(last.current)
      return
    }
    setHeld(null)
    const ro = new ResizeObserver(() => {
      last.current = el.getBoundingClientRect().height
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [mounted])

  const estimate = galleryHeights[name]

  if (fit) {
    return (
      <div ref={ref} data-slot="gallery-preview" data-mounted={mounted || undefined} className={cn("relative overflow-hidden", className)}>
        {mounted && Demo ? <FittedDemo width={fit}><Demo /></FittedDemo> : null}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      data-slot="gallery-preview"
      data-mounted={mounted || undefined}
      style={
        {
          ...(estimate ? { "--demo-h": `${estimate}px` } : {}),
          ...(held != null && !mounted ? { minHeight: held } : {}),
        } as React.CSSProperties
      }
      className={cn(
        "flex min-h-64 flex-1 items-center justify-center overflow-hidden border-b border-border bg-background/40 p-6 sm:p-8",
        estimate && "xl:min-h-(--demo-h)",
        className
      )}
    >
      {mounted && Demo ? <Demo /> : null}
    </div>
  )
}

/** Never shrink a demo past this; anything taller is cropped from the top instead. */
const MIN_SCALE = 0.5

/**
 * A demo laid out at `width` px (or the box's width, when wider) and scaled down until it fits the
 * box it fills, centred. Small demos stay at full size; tall ones shrink, then crop.
 */
function FittedDemo({ width, children }: { width: number; children: React.ReactNode }) {
  const boxRef = React.useRef<HTMLDivElement>(null)
  const innerRef = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState({ w: 0, h: 0 })
  const [content, setContent] = React.useState(0)

  React.useLayoutEffect(() => {
    const el = boxRef.current
    const inner = innerRef.current
    if (!el || !inner) return
    const ro = new ResizeObserver(() => {
      setBox({ w: el.clientWidth, h: el.clientHeight })
      setContent(inner.scrollHeight)
    })
    ro.observe(el)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [])

  const layoutW = Math.max(box.w, width)
  const byWidth = box.w > 0 ? box.w / layoutW : 0
  const byHeight = content > 0 ? box.h / content : 1
  const scale = Math.max(MIN_SCALE, Math.min(1, byWidth, byHeight))
  const ready = box.w > 0 && content > 0
  const top = Math.max(0, (box.h - content * scale) / 2)
  const left = (box.w - layoutW * scale) / 2

  return (
    <div ref={boxRef} className="absolute inset-0">
      <div
        ref={innerRef}
        style={
          {
            "--fit-w": `${layoutW}px`,
            "--fit-x": `${left}px`,
            "--fit-y": `${top}px`,
            "--fit-s": scale,
          } as React.CSSProperties
        }
        className={cn(
          "absolute top-0 left-0 flex w-(--fit-w) origin-top-left translate-x-(--fit-x) translate-y-(--fit-y) scale-(--fit-s) items-center justify-center p-6 transition-opacity duration-200",
          ready ? "opacity-100" : "opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  )
}
