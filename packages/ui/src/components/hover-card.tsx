"use client"

import { useDirection } from "@base-ui/react/direction-provider"
import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card"

import { cn } from "@paneui/ui/lib/utils"

/** A card that opens while a link is hovered or focused, for a glance before clicking. */
const HoverCard = PreviewCardPrimitive.Root

/**
 * The link that opens the card. Pass `delay` / `closeDelay` here (ms). `variant="plain"`
 * drops the link styling, for a Button or custom element passed as `render`.
 */
function HoverCardTrigger({
  delay = 500,
  closeDelay = 200,
  variant = "link",
  className,
  ...props
}: PreviewCardPrimitive.Trigger.Props & { variant?: "link" | "plain" }) {
  return (
    <PreviewCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      delay={delay}
      closeDelay={closeDelay}
      className={cn(
        variant === "link" &&
          "rounded-2xs font-medium text-foreground underline decoration-border underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring",
        typeof className === "string" && className
      )}
      {...props}
    />
  )
}

function HoverCardContent({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "center",
  alignOffset = 0,
  ...props
}: PreviewCardPrimitive.Popup.Props &
  Pick<PreviewCardPrimitive.Positioner.Props, "side" | "sideOffset" | "align" | "alignOffset">) {
  // Portaled popups leave the DOM subtree that sets `dir`; carry the provider direction over.
  const dir = useDirection() === "rtl" ? "rtl" : undefined
  return (
    <PreviewCardPrimitive.Portal dir={dir}>
      <PreviewCardPrimitive.Positioner className="z-50 outline-none" side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset} collisionPadding={8}>
        <PreviewCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            "flex w-72 max-w-[calc(100vw-1rem)] origin-(--transform-origin) flex-col gap-2.5 rounded-xl bg-popover p-3 text-ui text-popover-foreground shadow-surface outline-none",
            "transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0 motion-reduce:data-starting-style:scale-100",
            className
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardContent, HoverCardTrigger }
