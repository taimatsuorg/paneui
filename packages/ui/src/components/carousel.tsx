"use client"

import * as React from "react"

import { ChevronLeftIcon, ChevronRightIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import { useLocale } from "@paneui/ui/components/locale-provider"

/*
 * Slides on native scroll snapping: touch, trackpad and wheel scroll as the platform does,
 * arrow keys and the buttons step one slide. No dependency beyond React.
 *
 *   <Carousel>
 *     <CarouselContent>
 *       <CarouselItem>…</CarouselItem>        ← basis-full; basis-1/2 etc. for several per view
 *     </CarouselContent>
 *     <CarouselPrevious /> <CarouselNext /> <CarouselDots />
 *   </Carousel>
 */
type Orientation = "horizontal" | "vertical"

type CarouselContextValue = {
  orientation: Orientation
  viewportRef: React.RefObject<HTMLDivElement | null>
  index: number
  count: number
  canPrev: boolean
  canNext: boolean
  scrollTo: (index: number) => void
  scrollPrev: () => void
  scrollNext: () => void
  update: () => void
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel() {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) throw new Error("Carousel parts must be used inside <Carousel>")
  return ctx
}

type CarouselProps = React.ComponentProps<"div"> & {
  orientation?: Orientation
  /** Wrap from the last slide to the first with the buttons and keys. */
  loop?: boolean
  /** Called with the index of the slide nearest the start edge. */
  onIndexChange?: (index: number) => void
}

function Carousel({ orientation = "horizontal", loop = false, onIndexChange, className, onKeyDown, children, ...props }: CarouselProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [state, setState] = React.useState({ index: 0, count: 0, canPrev: false, canNext: false })
  const onIndex = React.useRef(onIndexChange)
  onIndex.current = onIndexChange
  const lastIndex = React.useRef(0)

  const slides = React.useCallback(
    () => Array.from(viewportRef.current?.querySelectorAll<HTMLElement>(":scope > [data-slot=carousel-track] > [data-slot=carousel-item]") ?? []),
    []
  )

  const update = React.useCallback(() => {
    const vp = viewportRef.current
    if (!vp) return
    const items = slides()
    const horizontal = orientation === "horizontal"
    const pos = horizontal ? Math.abs(vp.scrollLeft) : vp.scrollTop
    const max = horizontal ? vp.scrollWidth - vp.clientWidth : vp.scrollHeight - vp.clientHeight
    // Right-to-left slides start at the viewport's right edge.
    const rtl = horizontal && getComputedStyle(vp).direction === "rtl"
    const v = vp.getBoundingClientRect()
    const start = horizontal ? (rtl ? v.right : v.left) : v.top
    let index = 0
    let best = Infinity
    items.forEach((el, i) => {
      const r = el.getBoundingClientRect()
      const d = Math.abs((horizontal ? (rtl ? r.right : r.left) : r.top) - start)
      if (d < best) {
        best = d
        index = i
      }
    })
    // At the end, the last slide counts as current (it may never reach the start edge).
    if (max > 0 && pos >= max - 2 && items.length > 0 && items[items.length - 1].getBoundingClientRect().width <= vp.clientWidth) index = Math.max(index, items.length - 1)
    if (lastIndex.current !== index) {
      lastIndex.current = index
      onIndex.current?.(index)
    }
    setState((s) => {
      const next = { index, count: items.length, canPrev: pos > 2, canNext: pos < max - 2 }
      return s.index === next.index && s.count === next.count && s.canPrev === next.canPrev && s.canNext === next.canNext ? s : next
    })
  }, [orientation, slides])

  const scrollTo = React.useCallback(
    (i: number) => {
      const vp = viewportRef.current
      const items = slides()
      const el = items[Math.max(0, Math.min(items.length - 1, i))]
      if (!vp || !el) return
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const r = el.getBoundingClientRect()
      const v = vp.getBoundingClientRect()
      const rtl = getComputedStyle(vp).direction === "rtl"
      vp.scrollBy({
        left: orientation === "horizontal" ? (rtl ? r.right - v.right : r.left - v.left) : 0,
        top: orientation === "vertical" ? r.top - v.top : 0,
        behavior: smooth ? "smooth" : "auto",
      })
    },
    [orientation, slides]
  )

  const scrollPrev = React.useCallback(() => {
    if (!state.canPrev && loop) return scrollTo(state.count - 1)
    scrollTo(state.index - 1)
  }, [loop, scrollTo, state])
  const scrollNext = React.useCallback(() => {
    if (!state.canNext && loop) return scrollTo(0)
    scrollTo(state.index + 1)
  }, [loop, scrollTo, state])

  React.useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return
    update()
    const ro = new ResizeObserver(update)
    ro.observe(vp)
    const mo = new MutationObserver(update)
    mo.observe(vp, { childList: true, subtree: true })
    vp.addEventListener("scroll", update, { passive: true })
    return () => {
      ro.disconnect()
      mo.disconnect()
      vp.removeEventListener("scroll", update)
    }
  }, [update])

  const ctx = React.useMemo(
    () => ({ orientation, viewportRef, ...state, scrollTo, scrollPrev, scrollNext, update }),
    [orientation, state, scrollTo, scrollPrev, scrollNext, update]
  )

  return (
    <CarouselContext.Provider value={ctx}>
      <div
        role="region"
        data-slot="carousel"
        data-orientation={orientation}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.defaultPrevented || (e.target as HTMLElement).closest("input,textarea,[contenteditable=true]")) return
          const rtl = getComputedStyle(e.currentTarget).direction === "rtl"
          const prev = orientation === "horizontal" ? (rtl ? "ArrowRight" : "ArrowLeft") : "ArrowUp"
          const next = orientation === "horizontal" ? (rtl ? "ArrowLeft" : "ArrowRight") : "ArrowDown"
          if (e.key === prev) {
            e.preventDefault()
            scrollPrev()
          } else if (e.key === next) {
            e.preventDefault()
            scrollNext()
          }
        }}
        className={cn("group/carousel relative", className)}
        {...props}
        aria-roledescription={props["aria-roledescription"] ?? "carousel"}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation, viewportRef } = useCarousel()
  return (
    <div
      ref={viewportRef}
      data-slot="carousel-content"
      tabIndex={-1}
      className={cn(
        "scrollbar-none w-full min-w-0 overscroll-contain outline-none",
        orientation === "horizontal" ? "snap-x snap-mandatory overflow-x-auto" : "h-full snap-y snap-mandatory overflow-y-auto"
      )}
    >
      <div
        data-slot="carousel-track"
        className={cn("flex gap-3", orientation === "vertical" && "h-full flex-col", className)}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      data-slot="carousel-item"
      className={cn("min-w-0 shrink-0 grow-0 basis-full snap-start", className)}
      {...props}
      aria-roledescription={props["aria-roledescription"] ?? "slide"}
    />
  )
}

function CarouselPrevious({ className, variant = "secondary", size = "icon-sm", ...props }: React.ComponentProps<typeof Button>) {
  const { labels } = useLocale()
  const { canPrev, scrollPrev, orientation } = useCarousel()
  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      disabled={!canPrev}
      onClick={scrollPrev}
      className={cn("rounded-control", orientation === "vertical" && "rotate-90", className)}
      {...props}
      aria-label={props["aria-label"] ?? labels.previousSlide}
    >
      <ChevronLeftIcon className="rtl:rotate-180" />
    </Button>
  )
}

function CarouselNext({ className, variant = "secondary", size = "icon-sm", ...props }: React.ComponentProps<typeof Button>) {
  const { labels } = useLocale()
  const { canNext, scrollNext, orientation } = useCarousel()
  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      disabled={!canNext}
      onClick={scrollNext}
      className={cn("rounded-control", orientation === "vertical" && "rotate-90", className)}
      {...props}
      aria-label={props["aria-label"] ?? labels.nextSlide}
    >
      <ChevronRightIcon className="rtl:rotate-180" />
    </Button>
  )
}

/**
 * One dot per slide; the current one is filled. Dots stay 6px but sit 18px apart, so each
 * one's 24px target (the ::after) meets its neighbour's without overlapping.
 */
function CarouselDots({ className, ...props }: React.ComponentProps<"div">) {
  const { labels } = useLocale()
  const { count, index, scrollTo } = useCarousel()
  return (
    <div data-slot="carousel-dots" className={cn("flex items-center justify-center gap-4.5", className)} {...props}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={labels.goToSlide(i + 1)}
          aria-current={i === index ? "true" : undefined}
          onClick={() => scrollTo(i)}
          className="relative size-1.5 cursor-pointer rounded-full after:absolute after:-inset-[9px] bg-foreground/16 transition-[background-color,width] duration-200 outline-none hover:bg-foreground/32 focus-visible:ring-2 focus-visible:ring-ring aria-current:w-4 aria-current:bg-foreground/72 motion-reduce:transition-none"
        />
      ))}
    </div>
  )
}

export { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious, useCarousel }
export type { CarouselProps }
