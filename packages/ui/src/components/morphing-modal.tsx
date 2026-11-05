"use client"

import * as React from "react"
import { useDirection } from "@base-ui/react/direction-provider"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { ChevronLeftIcon, XIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"

/*
 * One modal surface with several inner views. Navigating pushes a view onto a
 * stack; the panel springs to the new view's height while the views slide and
 * blur past each other in the direction of travel. Back pops the stack. The dialog primitive
 * Dialog provides the focus trap, Escape, scroll lock and ARIA.
 */

const HEIGHT_SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 0.6 } as const
const VIEW_SPRING = { type: "spring", stiffness: 460, damping: 36, mass: 0.6 } as const

type MorphingModalContextValue = {
  view: string
  direction: 1 | -1
  canGoBack: boolean
  /** Go to a view (pushes it onto the back stack). */
  push: (view: string) => void
  /** Return to the previous view. */
  back: () => void
  /** Jump back to the first view and clear the stack. */
  reset: () => void
  navigated: React.RefObject<boolean>
}

const MorphingModalContext = React.createContext<MorphingModalContextValue | null>(null)

function useMorphingModal() {
  const ctx = React.useContext(MorphingModalContext)
  if (!ctx) throw new Error("useMorphingModal must be used within <MorphingModal>")
  return ctx
}

function MorphingModal({
  defaultView = "main",
  onViewChange,
  onOpenChangeComplete,
  children,
  ...props
}: DialogPrimitive.Root.Props & {
  /** The view shown when the modal opens. */
  defaultView?: string
  onViewChange?: (view: string) => void
}) {
  const [stack, setStack] = React.useState<string[]>([defaultView])
  // Mirror of `stack` so navigation reads the current stack synchronously and
  // calls onViewChange once, outside a state updater (updaters run twice in
  // StrictMode).
  const stackRef = React.useRef(stack)
  const [direction, setDirection] = React.useState<1 | -1>(1)
  const navigated = React.useRef(false)
  const view = stack[stack.length - 1]

  const commit = React.useCallback((next: string[]) => {
    stackRef.current = next
    setStack(next)
  }, [])

  const push = React.useCallback(
    (next: string) => {
      const s = stackRef.current
      if (s[s.length - 1] === next) return
      navigated.current = true
      setDirection(1)
      commit([...s, next])
      onViewChange?.(next)
    },
    [commit, onViewChange]
  )
  const back = React.useCallback(() => {
    const s = stackRef.current
    if (s.length < 2) return
    navigated.current = true
    setDirection(-1)
    commit(s.slice(0, -1))
    onViewChange?.(s[s.length - 2])
  }, [commit, onViewChange])
  const reset = React.useCallback(() => {
    const s = stackRef.current
    navigated.current = false
    setDirection(-1)
    if (s.length === 1 && s[0] === defaultView) return
    commit([defaultView])
    onViewChange?.(defaultView)
  }, [commit, defaultView, onViewChange])

  const ctx = React.useMemo<MorphingModalContextValue>(
    () => ({ view, direction, canGoBack: stack.length > 1, push, back, reset, navigated }),
    [view, direction, stack.length, push, back, reset]
  )

  return (
    <MorphingModalContext.Provider value={ctx}>
      <DialogPrimitive.Root
        onOpenChangeComplete={(open) => {
          // start from the first view next time, once the exit has finished
          if (!open) reset()
          onOpenChangeComplete?.(open)
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Root>
    </MorphingModalContext.Provider>
  )
}

const MorphingModalTrigger = DialogPrimitive.Trigger
const MorphingModalClose = DialogPrimitive.Close

function MorphingModalContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & { showCloseButton?: boolean; children?: React.ReactNode }) {
  const { labels } = useLocale()
  const { view, direction } = useMorphingModal()
  const reduce = useReducedMotion()
  // the popup (and this node) only mounts while open, so track it as state
  const [inner, setInner] = React.useState<HTMLDivElement | null>(null)
  const [height, setHeight] = React.useState<number | "auto">("auto")

  React.useLayoutEffect(() => {
    if (!inner) return
    const measure = () => setHeight(inner.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(inner)
    return () => {
      ro.disconnect()
      setHeight("auto")
    }
  }, [inner])

  const all = React.Children.toArray(children)
  const isView = (c: React.ReactNode): c is React.ReactElement<MorphingModalViewProps> =>
    React.isValidElement(c) && c.type === MorphingModalView
  const active = all.find((c) => isView(c) && c.props.name === view)
  const rest = all.filter((c) => !isView(c))

  const offset = reduce ? 0 : 28
  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * offset, filter: reduce ? "blur(0px)" : "blur(4px)" }),
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: (d: number) => ({ opacity: 0, x: d * -offset, filter: reduce ? "blur(0px)" : "blur(4px)" }),
  }

  // Portaled popups leave the DOM subtree that sets `dir`; carry the provider direction over.
  const dir = useDirection() === "rtl" ? "rtl" : undefined
  return (
    <DialogPrimitive.Portal dir={dir}>
      <DialogPrimitive.Backdrop
        data-slot="morphing-modal-backdrop"
        className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0"
      />
      <DialogPrimitive.Popup
        data-slot="morphing-modal-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-popover text-popover-foreground shadow-xl outline-none",
          "transition-[opacity,scale,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:scale-96 data-ending-style:opacity-0 data-ending-style:duration-200 data-starting-style:translate-y-[calc(-50%+12px)] data-starting-style:scale-96 data-starting-style:opacity-0",
          "motion-reduce:data-starting-style:translate-y-[-50%] motion-reduce:data-starting-style:scale-100 motion-reduce:data-ending-style:scale-100",
          className
        )}
        {...props}
      >
        <motion.div
          initial={false}
          animate={{ height }}
          transition={reduce ? { duration: 0 } : HEIGHT_SPRING}
          className="relative overflow-hidden"
        >
          <div ref={setInner} className="relative">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={view}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={reduce ? { duration: 0.15 } : VIEW_SPRING}
                className="w-full"
              >
                {active}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
        {rest}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="morphing-modal-close"
            aria-label={labels.close}
            className="absolute top-4 right-4 inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <XIcon size={16} />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

type MorphingModalViewProps = React.ComponentProps<"div"> & {
  /** Identifier other parts navigate to. Must be a direct child of MorphingModalContent. */
  name: string
}

/** One screen of the modal. Only the active view renders. */
function MorphingModalView({ name, className, ...props }: MorphingModalViewProps) {
  const { navigated } = useMorphingModal()
  const ref = React.useRef<HTMLDivElement>(null)

  // after an in-modal navigation the pressed control has unmounted: move focus
  // into the new view so keyboard and screen reader users land somewhere sensible
  React.useEffect(() => {
    if (!navigated.current) return
    const el = ref.current
    if (!el) return
    const focusable = el.querySelector<HTMLElement>(
      "[autofocus], input:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"
    )
    ;(focusable ?? el).focus({ preventScroll: true })
  }, [navigated])

  return (
    <div
      ref={ref}
      tabIndex={-1}
      data-slot="morphing-modal-view"
      data-view={name}
      className={cn("flex flex-col gap-4 p-6 outline-none", className)}
      {...props}
    />
  )
}

function MorphingModalHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  const { canGoBack } = useMorphingModal()
  return (
    <div data-slot="morphing-modal-header" className={cn("flex items-start gap-2 pr-8", className)} {...props}>
      {canGoBack && <MorphingModalBack className="-ml-1.5 shrink-0" />}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">{children}</div>
    </div>
  )
}

function MorphingModalTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="morphing-modal-title"
      className={cn("font-heading text-lg leading-8 font-semibold icon-bold", className)}
      {...props}
    />
  )
}

function MorphingModalDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="morphing-modal-description"
      className={cn("text-ui-lg leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

/** Round back chevron that pops to the previous view. Renders nothing on the first view. */
function MorphingModalBack({ className, onClick, ...props }: React.ComponentProps<"button">) {
  const { labels } = useLocale()
  const { back, canGoBack } = useMorphingModal()
  if (!canGoBack) return null
  return (
    <button
      type="button"
      data-slot="morphing-modal-back"
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) back()
      }}
      className={cn(
        "inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
      aria-label={props["aria-label"] ?? labels.back}
    >
      <ChevronLeftIcon className="rtl:-scale-x-100" size={16} />
    </button>
  )
}

/** A row that navigates to another view. */
function MorphingModalLink({
  to,
  className,
  onClick,
  ...props
}: React.ComponentProps<"button"> & { to: string }) {
  const { push } = useMorphingModal()
  return (
    <button
      type="button"
      data-slot="morphing-modal-link"
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) push(to)
      }}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-start text-ui font-medium transition-[background-color,box-shadow] duration-150 outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function MorphingModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="morphing-modal-footer" className={cn("flex items-center justify-end gap-2 pt-1", className)} {...props} />
}

export {
  MorphingModal,
  MorphingModalTrigger,
  MorphingModalClose,
  MorphingModalContent,
  MorphingModalView,
  MorphingModalHeader,
  MorphingModalTitle,
  MorphingModalDescription,
  MorphingModalBack,
  MorphingModalLink,
  MorphingModalFooter,
  useMorphingModal,
}
