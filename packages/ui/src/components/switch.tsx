"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cva, type VariantProps } from "class-variance-authority"

import { useControlSize, type ControlSize } from "@paneui/core/control-size"
import { CheckIcon, LoaderIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"

/*
 * Toggle control: pill track and thumb with press stretch, horizontal pointer
 * dragging, optional track glyphs, and optimistic async saves.
 */
const switchVariants = cva(
  [
    "group/switch peer relative inline-flex h-(--switch-h) w-(--switch-w) shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-none select-none",
    "bg-foreground/20 dark:bg-foreground/25 transition-[background-color,box-shadow] duration-200 ease-out",
    "[--switch-dir:1] [--switch-stretch:0px] [--switch-x:0px] rtl:[--switch-dir:-1]",
    "after:absolute after:-inset-1.5 pointer-coarse:after:-inset-3",
    "focus-visible:ring-2 focus-visible:ring-ring",
    "aria-invalid:ring-2 aria-invalid:ring-destructive/30 data-invalid:ring-2 data-invalid:ring-destructive/30",
    "data-dragging:[--switch-x:var(--switch-drag)]",
    "data-[drag=off]:bg-foreground/20 dark:data-[drag=off]:bg-foreground/25",
    "data-[drag=on]:bg-primary dark:data-[drag=on]:bg-primary",
    "[&:not([data-dragging])[data-checked]]:bg-primary dark:[&:not([data-dragging])[data-checked]]:bg-primary",
    "[&:not([data-dragging])[data-checked]]:[--switch-x:calc(var(--switch-w)-var(--switch-thumb)-4px-var(--switch-stretch))]",
    "[&:active:not([data-disabled]):not([data-readonly]):not([data-pending])]:[--switch-stretch:4px]",
    "data-pending:cursor-progress data-readonly:cursor-default",
    "data-disabled:cursor-not-allowed data-disabled:opacity-64",
    "forced-colors:border forced-colors:data-checked:bg-[Highlight]",
  ],
  {
    variants: {
      size: {
        sm: "[--switch-h:1rem] [--switch-thumb:0.75rem] [--switch-w:1.75rem]",
        default: "[--switch-h:1.25rem] [--switch-thumb:1rem] [--switch-w:2.25rem]",
        lg: "[--switch-h:1.5rem] [--switch-thumb:1.25rem] [--switch-w:2.75rem]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type SwitchSize = "sm" | "default" | "lg"

type SwitchProps = Omit<SwitchPrimitive.Root.Props, "onCheckedChange"> &
  VariantProps<typeof switchVariants> & {
    /** Show check and off-ring glyphs inside the track. */
    icons?: boolean
    /** Returning a Promise flips optimistically, shows a thumb loader past 400ms, and shakes back on error. */
    onCheckedChange?: (checked: boolean, eventDetails: SwitchPrimitive.Root.ChangeEventDetails) => unknown
  }

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return typeof value === "object" && value !== null && typeof (value as PromiseLike<unknown>).then === "function"
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** Tracks horizontal pointer dragging across the switch track and commits on release past the midpoint. */
function useThumbDrag(rootRef: React.RefObject<HTMLElement | null>, canDrag: () => boolean) {
  const drag = React.useRef<{
    id: number
    startX: number
    from: boolean
    max: number
    moved: boolean
    position: number
  } | null>(null)
  const suppressClick = React.useRef(false)
  const pendingToggle = React.useRef(false)
  const releaseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (releaseTimer.current) clearTimeout(releaseTimer.current)
    },
    []
  )

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    const root = rootRef.current
    if (!root || event.button !== 0 || !canDrag()) return
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      from: root.hasAttribute("data-checked"),
      max: 0,
      moved: false,
      position: 0,
    }
  }

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const state = drag.current
    const root = rootRef.current
    if (!state || !root || event.pointerId !== state.id) return
    const rtl = getComputedStyle(root).direction === "rtl"
    const delta = (event.clientX - state.startX) * (rtl ? -1 : 1)
    if (!state.moved && Math.abs(delta) < 3) return
    if (!state.moved) {
      const thumb = root.querySelector<HTMLElement>("[data-slot=switch-thumb]")
      state.max = Math.max(0, root.clientWidth - (thumb?.offsetWidth ?? 0) - 4)
      state.moved = true
      root.setPointerCapture?.(event.pointerId)
      root.setAttribute("data-dragging", "")
    }
    const base = state.from ? state.max : 0
    state.position = Math.min(state.max, Math.max(0, base + delta))
    root.setAttribute("data-drag", state.position > state.max / 2 ? "on" : "off")
    root.style.setProperty("--switch-drag", `${state.position}px`)
  }

  const finish = (event: React.PointerEvent<HTMLElement>) => {
    const state = drag.current
    const root = rootRef.current
    drag.current = null
    if (!state || !root || !state.moved) return
    root.removeAttribute("data-dragging")
    root.removeAttribute("data-drag")
    root.style.removeProperty("--switch-drag")
    if (root.hasPointerCapture?.(event.pointerId)) {
      root.releasePointerCapture(event.pointerId)
    }
    const to = state.position > state.max / 2
    suppressClick.current = true
    pendingToggle.current = to !== state.from && event.type === "pointerup"
    if (releaseTimer.current) clearTimeout(releaseTimer.current)
    releaseTimer.current = setTimeout(() => {
      releaseTimer.current = null
      suppressClick.current = false
      if (pendingToggle.current) {
        pendingToggle.current = false
        if (root.isConnected) root.click()
      }
    }, 0)
  }

  const onClickCapture = (event: React.MouseEvent<HTMLElement>) => {
    if (suppressClick.current) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: finish,
    onPointerCancel: finish,
    onClickCapture,
  }
}

function Switch({
  className,
  size: sizeProp,
  icons = false,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  readOnly,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onClickCapture,
  ref,
  ...props
}: SwitchProps) {
  const inherited = useControlSize<ControlSize>(sizeProp)
  const size: SwitchSize = inherited === "xs" ? "sm" : inherited

  const rootRef = React.useRef<HTMLElement | null>(null)
  const [internal, setInternal] = React.useState(defaultChecked)
  const [pending, setPending] = React.useState(false)
  const [optimistic, setOptimistic] = React.useState<boolean | null>(null)
  const [slow, setSlow] = React.useState(false)
  const controlled = checkedProp !== undefined
  const checked = pending && optimistic !== null ? optimistic : controlled ? checkedProp : internal
  const latest = React.useRef(0)
  const shakeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    if (!pending) {
      setSlow(false)
      return
    }
    const timer = setTimeout(() => setSlow(true), 400)
    return () => clearTimeout(timer)
  }, [pending])

  React.useEffect(
    () => () => {
      latest.current += 1
      if (shakeTimer.current) clearTimeout(shakeTimer.current)
    },
    []
  )

  const blocked = Boolean(disabled || readOnly || pending)
  const dragHandlers = useThumbDrag(rootRef, () => !blocked)

  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node
      if (typeof ref === "function") return ref(node)
      if (ref) ref.current = node
      return undefined
    },
    [ref]
  )

  const triggerShake = (root: HTMLElement) => {
    if (prefersReducedMotion()) return
    if (shakeTimer.current) clearTimeout(shakeTimer.current)
    root.setAttribute("data-shake", "")
    const clear = () => {
      if (root.isConnected) root.removeAttribute("data-shake")
      shakeTimer.current = null
    }
    if (typeof root.animate === "function") {
      const anim = root.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-3px)" },
          { transform: "translateX(3px)" },
          { transform: "translateX(-2px)" },
          { transform: "translateX(2px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 320, easing: "ease-out" }
      )
      anim.onfinish = clear
      anim.oncancel = clear
    } else {
      shakeTimer.current = setTimeout(clear, 350)
    }
  }

  const handleChange = (next: boolean, details: SwitchPrimitive.Root.ChangeEventDetails) => {
    if (pending) {
      details.cancel()
      return
    }
    if (!controlled) setInternal(next)
    const result = onCheckedChange?.(next, details)
    if (!isThenable(result)) return
    const id = ++latest.current
    setOptimistic(next)
    setPending(true)
    Promise.resolve(result).then(
      () => {
        if (latest.current !== id) return
        setPending(false)
        setOptimistic(null)
      },
      () => {
        if (latest.current !== id) return
        setPending(false)
        setOptimistic(null)
        if (!controlled) setInternal(!next)
        if (rootRef.current) triggerShake(rootRef.current)
      }
    )
  }

  return (
    <SwitchPrimitive.Root
      ref={setRef}
      checked={checked}
      onCheckedChange={handleChange}
      disabled={disabled}
      readOnly={readOnly}
      aria-busy={pending || undefined}
      data-pending={pending ? "" : undefined}
      data-size={size}
      className={(state) => cn(switchVariants({ size }), typeof className === "function" ? className(state) : className)}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (!event.defaultPrevented) dragHandlers.onPointerDown(event)
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        dragHandlers.onPointerMove(event)
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event)
        dragHandlers.onPointerUp(event)
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event)
        dragHandlers.onPointerCancel(event)
      }}
      onClickCapture={(event) => {
        onClickCapture?.(event)
        dragHandlers.onClickCapture(event)
      }}
      {...props}
      data-slot="switch"
    >
      {icons ? (
        <span
          aria-hidden="true"
          data-slot="switch-icons"
          className="pointer-events-none absolute inset-0 flex items-center justify-between px-[calc((var(--switch-h)-0.625rem)/2)] text-primary-foreground [&_svg]:size-2.5"
        >
          <CheckIcon
            weight="bold"
            className="opacity-0 transition-opacity duration-200 group-data-[drag=off]/switch:opacity-0 group-data-[drag=on]/switch:opacity-100 group-[:not([data-dragging])[data-checked]]/switch:opacity-100"
          />
          <span className="size-2 rounded-full opacity-100 inset-ring-[1.5px] inset-ring-muted-foreground transition-opacity duration-200 group-data-[drag=off]/switch:opacity-100 group-data-[drag=on]/switch:opacity-0 group-[:not([data-dragging])[data-checked]]/switch:opacity-0" />
        </span>
      ) : null}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none relative z-1 flex h-(--switch-thumb) w-[calc(var(--switch-thumb)+var(--switch-stretch))] translate-x-[calc(var(--switch-x)*var(--switch-dir))] items-center justify-center rounded-full bg-background shadow-raised transition-[translate,width] duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)] group-data-dragging/switch:transition-none motion-reduce:transition-none",
          "dark:bg-foreground dark:group-data-[drag=off]/switch:bg-foreground dark:group-data-[drag=on]/switch:bg-primary-foreground dark:group-[:not([data-dragging])[data-checked]]/switch:bg-primary-foreground",
          "forced-colors:border forced-colors:bg-[CanvasText]"
        )}
      >
        {pending && slow ? (
          <LoaderIcon
            aria-hidden
            className="size-[calc(var(--switch-thumb)-0.375rem)] animate-spin text-muted-foreground dark:text-background/70 dark:group-data-checked/switch:text-muted-foreground motion-reduce:animate-none"
          />
        ) : null}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch, switchVariants }
export type { SwitchProps, SwitchSize }
