"use client"

import * as React from "react"
import { useDirection } from "@base-ui/react/direction-provider"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { CheckIcon, ChevronDownIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"

/*
 * A select whose trigger grows into the option list. The popup is laid over the
 * trigger (negative side offset) and starts as a box with the trigger's exact
 * size, radius and raised shadow, then its real height animates to the measured
 * content height (and back on close). Because the ring and shadow are drawn by
 * the box itself, the border stays continuous at every frame of the morph. Its
 * first row mirrors the trigger, which is what makes the hand-off seamless.
 * Built on the Select primitive, so keyboard navigation, typeahead, focus and ARIA
 * come for free. The box uses overflow-clip (not hidden) so the primitive scrolling the
 * selected item into view cannot scroll the morphing box itself.
 *
 * Geometry: `--morph-h` is the content's natural height (ResizeObserver). The
 * popup animates `height` between `--anchor-height` and `--morph-h`, and an
 * opposite margin makes up the difference so the positioner keeps a constant
 * size: the anchored edge never moves and Floating UI never flips mid-morph.
 * When the popup opens upward (data-side=top) the margin sits on top and the
 * content is bottom-aligned, so the box grows up out of the trigger.
 */

const MorphSelect = SelectPrimitive.Root
const MorphSelectGroup = SelectPrimitive.Group

/** Shared row geometry for the trigger and the popup's mirrored header. */
const ROW = "flex h-8 w-full items-center gap-2 pr-2.5 pl-3 text-ui [&_svg]:size-3.5 [&_svg]:shrink-0"

function MorphSelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="morph-select-value"
      className={cn("flex-1 truncate text-start data-placeholder:text-muted-foreground", className)}
      {...props}
    />
  )
}

function MorphSelectTrigger({ className, children, ...props }: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="morph-select-trigger"
      className={cn(
        ROW,
        "min-w-44 cursor-pointer rounded-xl bg-card shadow-raised transition-[box-shadow,background-color,opacity] duration-200 outline-none select-none hover:bg-accent hover:shadow-raised-hover focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="flex text-muted-foreground">
        <ChevronDownIcon />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

/**
 * The popup's natural-height content. Publishes its measured height as
 * `--morph-h` on the popup so the box can animate its real height to it.
 */
function MorphContent({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    const el = ref.current
    const popup = el?.parentElement
    if (!el || !popup) return
    const publish = () => popup.style.setProperty("--morph-h", `${el.offsetHeight}px`)
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={ref} className="flex shrink-0 flex-col group-data-[side=top]/morph:flex-col-reverse">
      {children}
    </div>
  )
}

function MorphSelectContent({
  className,
  children,
  header,
  ...props
}: SelectPrimitive.Popup.Props & {
  /** What the mirrored first row shows. Defaults to the current value; match it to your trigger's content. */
  header?: React.ReactNode
}) {
  // Portaled popups leave the DOM subtree that sets `dir`; carry the provider direction over.
  const dir = useDirection() === "rtl" ? "rtl" : undefined
  return (
    <SelectPrimitive.Portal dir={dir}>
      <SelectPrimitive.Positioner
        className="z-50 outline-none select-none"
        side="bottom"
        align="start"
        alignItemWithTrigger={false}
        // sit on top of the trigger so the popup can grow out of it
        sideOffset={({ anchor }) => -anchor.height}
        collisionPadding={8}
      >
        <SelectPrimitive.Popup
          data-slot="morph-select-content"
          className={cn(
            "group/morph flex h-(--morph-h) w-(--anchor-width) flex-col overflow-clip frame-xl frame-inset-1.5 rounded-xl bg-popover text-popover-foreground shadow-[var(--shadow-default),var(--shadow-xl)] outline-none data-[side=top]:justify-end",
            "transition-[height,margin,background-color,box-shadow] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)]",
            // closed geometry: trigger-sized box; the margin keeps the positioner at full size
            "data-starting-style:h-(--anchor-height) data-starting-style:bg-card data-starting-style:shadow-raised",
            "data-ending-style:h-(--anchor-height) data-ending-style:bg-card data-ending-style:shadow-raised data-ending-style:duration-300",
            "data-[side=bottom]:data-starting-style:mb-[calc(var(--morph-h)_-_var(--anchor-height))] data-[side=bottom]:data-ending-style:mb-[calc(var(--morph-h)_-_var(--anchor-height))]",
            "data-[side=top]:data-starting-style:mt-[calc(var(--morph-h)_-_var(--anchor-height))] data-[side=top]:data-ending-style:mt-[calc(var(--morph-h)_-_var(--anchor-height))]",
            "motion-reduce:transition-opacity motion-reduce:data-starting-style:m-0 motion-reduce:data-starting-style:h-(--morph-h) motion-reduce:data-starting-style:opacity-0 motion-reduce:data-ending-style:m-0 motion-reduce:data-ending-style:h-(--morph-h) motion-reduce:data-ending-style:opacity-0",
            className
          )}
          {...props}
        >
          <MorphContent>
            {/* Mirrors the trigger row; clicks fall through to the trigger beneath, which closes the menu. */}
            <div aria-hidden className={cn(ROW, "pointer-events-none shrink-0")}>
              {header ?? <SelectPrimitive.Value className="flex-1 truncate text-start data-placeholder:text-muted-foreground" />}
              <ChevronDownIcon className="text-muted-foreground transition-transform duration-300 rotate-180 group-data-ending-style/morph:rotate-0 group-data-starting-style/morph:rotate-0" />
            </div>
            <div
              aria-hidden
              className="mx-3 h-px shrink-0 bg-border transition-opacity duration-300 group-data-ending-style/morph:opacity-0 group-data-starting-style/morph:opacity-0"
            />
            <SelectPrimitive.List
              className={cn(
                "max-h-[min(18rem,calc(var(--available-height)_-_var(--anchor-height)))] overflow-y-auto p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                "transition-[opacity,translate,filter] delay-75 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "group-data-starting-style/morph:-translate-y-1.5 group-data-starting-style/morph:opacity-0 group-data-starting-style/morph:blur-[3px]",
                "group-data-ending-style/morph:opacity-0 group-data-ending-style/morph:blur-[2px] group-data-ending-style/morph:delay-0 group-data-ending-style/morph:duration-150",
                "motion-reduce:translate-0 motion-reduce:blur-none"
              )}
            >
              {children}
            </SelectPrimitive.List>
          </MorphContent>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function MorphSelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="morph-select-item"
      className={cn(
        "relative flex h-8.5 cursor-default items-center gap-2 rounded-inner pr-8 pl-2.5 text-ui outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 items-center gap-2 truncate">{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2.5 flex text-primary-text">
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function MorphSelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="morph-select-label"
      className={cn("px-2.5 pt-1.5 pb-1 text-ui-sm font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function MorphSelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="morph-select-separator"
      className={cn("mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  MorphSelect,
  MorphSelectGroup,
  MorphSelectValue,
  MorphSelectTrigger,
  MorphSelectContent,
  MorphSelectItem,
  MorphSelectLabel,
  MorphSelectSeparator,
}
