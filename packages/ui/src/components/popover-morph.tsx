"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { useDirection } from "@base-ui/react/direction-provider"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { XIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"

/*
 * A popover whose panel grows out of the trigger's own shape. It is anchored like
 * Popover (8px side offset, centred by default); while it opens, a surface layer
 * starts as an exact copy of the trigger (its box, rounded-lg radius, card colour
 * and hairline) and expands across the gap into the popover surface, with the
 * content clipped to it. Closing folds it back into the button.
 * The surface is a sibling of the popup so its hairline ring and shadow are never
 * clipped: the standard `shadow-surface` shows at rest and during the morph.
 * The Popover primitive handles focus, Escape, outside press and ARIA.
 */

const MorphPopover = PopoverPrimitive.Root

function MorphPopoverTrigger({ className, ...props }: PopoverPrimitive.Trigger.Props) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="morph-popover-trigger"
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg bg-card px-3 text-ui font-medium text-secondary-foreground shadow-raised transition-[box-shadow,background-color,scale] duration-150 ease-out outline-none select-none hover:bg-accent hover:shadow-raised-hover focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function MorphPopoverContent({
  className,
  children,
  side = "bottom",
  align = "center",
  sideOffset = 8,
  collisionPadding = 8,
  triggerRadius = "var(--radius-lg)",
  ...props
}: PopoverPrimitive.Popup.Props & {
  /** Which side of the trigger the panel opens on (and grows towards). */
  side?: "top" | "bottom"
  /** Which trigger edge the panel lines up with, as in Popover. */
  align?: "start" | "center" | "end"
  /** Gap between trigger and panel in px, as in Popover. */
  sideOffset?: number
  /** Viewport margin kept when the panel flips or shifts. */
  collisionPadding?: number
  /** Corner radius of the trigger shape the panel starts from (CSS length). Defaults to `var(--radius-lg)`, the radius of `MorphPopoverTrigger`. */
  triggerRadius?: string
}) {
  // Portaled popups leave the DOM subtree that sets `dir`; carry the provider direction over.
  const dir = useDirection() === "rtl" ? "rtl" : undefined
  return (
    <PopoverPrimitive.Portal dir={dir}>
      <PopoverPrimitive.Positioner
        className={cn(
          "z-50 outline-none",
          // The trigger's box in the panel's coordinates (inset from each panel edge), per resolved side/alignment.
          "[--mt:calc(-1_*_(var(--anchor-height)_+_var(--morph-gap)))] [--mb:calc(100%_+_var(--morph-gap))]",
          "data-[side=top]:[--mt:calc(100%_+_var(--morph-gap))] data-[side=top]:[--mb:calc(-1_*_(var(--anchor-height)_+_var(--morph-gap)))]",
          "[--ml:calc((100%_-_var(--anchor-width))_/_2)] [--mr:calc((100%_-_var(--anchor-width))_/_2)]",
          "data-[align=start]:[--ml:0px] data-[align=start]:[--mr:calc(100%_-_var(--anchor-width))]",
          "data-[align=end]:[--ml:calc(100%_-_var(--anchor-width))] data-[align=end]:[--mr:0px]"
        )}
        style={{ "--morph-gap": `${sideOffset}px`, "--morph-r0": triggerRadius } as React.CSSProperties}
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
      >
        <PopoverPrimitive.Popup
          data-slot="morph-popover-content"
          className={cn(
            "peer/morph group/morph relative flex w-72 min-w-(--anchor-width) max-w-[calc(100vw-1rem)] flex-col gap-3 p-4 text-ui text-popover-foreground outline-none",
            // Content is clipped to the surface's shape while it morphs.
            "[clip-path:inset(0_round_var(--radius-2xl))] transition-[clip-path,opacity] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:duration-300 data-ending-style:opacity-0",
            "motion-safe:data-starting-style:[clip-path:inset(var(--mt)_var(--mr)_var(--mb)_var(--ml)_round_var(--morph-r0))]",
            "motion-safe:data-ending-style:[clip-path:inset(var(--mt)_var(--mr)_var(--mb)_var(--ml)_round_var(--morph-r0))]",
            "motion-reduce:duration-150 motion-reduce:data-starting-style:opacity-0",
            className
          )}
          {...props}
        >
          {/* content settles in once the surface has mostly opened up */}
          <div
            data-slot="morph-popover-body"
            className="contents [&>*]:transition-[opacity,filter,translate] [&>*]:delay-150 [&>*]:duration-300 [&>*]:ease-[cubic-bezier(0.22,1,0.36,1)] group-data-ending-style/morph:[&>*]:opacity-0 group-data-ending-style/morph:[&>*]:delay-0 group-data-ending-style/morph:[&>*]:duration-150 group-data-starting-style/morph:[&>*]:translate-y-1 group-data-starting-style/morph:[&>*]:opacity-0 group-data-starting-style/morph:[&>*]:blur-[3px] motion-reduce:[&>*]:translate-0 motion-reduce:[&>*]:blur-none motion-reduce:[&>*]:delay-0"
          >
            {children}
          </div>
        </PopoverPrimitive.Popup>
        {/* The popover surface (fill + hairline + lift), drawn behind the popup and never clipped. */}
        <div
          aria-hidden
          data-slot="morph-popover-surface"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-popover shadow-surface",
            "transition-[top,right,bottom,left,border-radius,background-color,box-shadow,opacity] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] peer-data-ending-style/morph:duration-300 peer-data-ending-style/morph:opacity-0",
            "motion-safe:peer-data-starting-style/morph:top-(--mt) motion-safe:peer-data-starting-style/morph:right-(--mr) motion-safe:peer-data-starting-style/morph:bottom-(--mb) motion-safe:peer-data-starting-style/morph:left-(--ml) motion-safe:peer-data-starting-style/morph:rounded-(--morph-r0) motion-safe:peer-data-starting-style/morph:bg-card motion-safe:peer-data-starting-style/morph:shadow-raised",
            "motion-safe:peer-data-ending-style/morph:top-(--mt) motion-safe:peer-data-ending-style/morph:right-(--mr) motion-safe:peer-data-ending-style/morph:bottom-(--mb) motion-safe:peer-data-ending-style/morph:left-(--ml) motion-safe:peer-data-ending-style/morph:rounded-(--morph-r0) motion-safe:peer-data-ending-style/morph:bg-card motion-safe:peer-data-ending-style/morph:shadow-raised",
            "motion-reduce:duration-150 motion-reduce:peer-data-starting-style/morph:opacity-0"
          )}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function MorphPopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="morph-popover-header" className={cn("flex flex-col gap-1 pr-8", className)} {...props} />
}

function MorphPopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="morph-popover-title"
      className={cn("text-ui-lg leading-snug font-semibold icon-bold", className)}
      {...props}
    />
  )
}

function MorphPopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="morph-popover-description"
      className={cn("text-ui leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

function MorphPopoverFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="morph-popover-footer" className={cn("flex items-center justify-end gap-2", className)} {...props} />
}

/** Plain close part; pass `render` to turn any element (e.g. a Button) into a close control. */
function MorphPopoverClose(props: PopoverPrimitive.Close.Props) {
  return <PopoverPrimitive.Close data-slot="morph-popover-close" {...props} />
}

/** Round × button pinned to the panel's top-right corner. */
function MorphPopoverCloseButton({ className, ...props }: PopoverPrimitive.Close.Props) {
  const l10n = useLocale().labels

  return (
    <PopoverPrimitive.Close
      data-slot="morph-popover-close-button"
      className={cn(
        "absolute top-3 right-3 inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
      aria-label={props["aria-label"] ?? l10n.priceClose}
    >
      <XIcon size={14} />
    </PopoverPrimitive.Close>
  )
}

export {
  MorphPopover,
  MorphPopoverTrigger,
  MorphPopoverContent,
  MorphPopoverHeader,
  MorphPopoverTitle,
  MorphPopoverDescription,
  MorphPopoverFooter,
  MorphPopoverClose,
  MorphPopoverCloseButton,
}
