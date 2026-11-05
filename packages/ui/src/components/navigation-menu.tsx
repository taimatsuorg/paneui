"use client"

import * as React from "react"
import { useDirection } from "@base-ui/react/direction-provider"
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"

import { ChevronDownIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"

/*
 * Site navigation with panels of links. One shared popup resizes and slides between
 * panels as the pointer moves across triggers.
 *
 *   <NavigationMenu>
 *     <NavigationMenuList>
 *       <NavigationMenuItem>
 *         <NavigationMenuTrigger>Product</NavigationMenuTrigger>
 *         <NavigationMenuContent>…<NavigationMenuLink /></NavigationMenuContent>
 *       </NavigationMenuItem>
 *     </NavigationMenuList>
 *   </NavigationMenu>
 */
function NavigationMenu({ className, children, ...props }: NavigationMenuPrimitive.Root.Props) {
  // Portaled popups leave the DOM subtree that sets `dir`; carry the provider direction over.
  const dir = useDirection() === "rtl" ? "rtl" : undefined
  return (
    <NavigationMenuPrimitive.Root data-slot="navigation-menu" className={cn("relative min-w-max", className)} {...props}>
      {children}
      <NavigationMenuPrimitive.Portal dir={dir}>
        <NavigationMenuPrimitive.Positioner
          sideOffset={6}
          collisionPadding={8}
          collisionAvoidance={{ side: "none" }}
          className="z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none motion-reduce:transition-none"
        >
          <NavigationMenuPrimitive.Popup
            data-slot="navigation-menu-popup"
            className="relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-surface outline-none transition-[opacity,scale,width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:scale-98 data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:scale-98 data-starting-style:opacity-0 motion-reduce:transition-opacity"
          >
            <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden" />
          </NavigationMenuPrimitive.Popup>
        </NavigationMenuPrimitive.Positioner>
      </NavigationMenuPrimitive.Portal>
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({ className, ...props }: NavigationMenuPrimitive.List.Props) {
  return <NavigationMenuPrimitive.List data-slot="navigation-menu-list" className={cn("flex items-center gap-0.5", className)} {...props} />
}

function NavigationMenuItem(props: NavigationMenuPrimitive.Item.Props) {
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" {...props} />
}

const triggerClass =
  "inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg px-3 text-ui font-medium text-foreground outline-none select-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-secondary"

function NavigationMenuTrigger({ className, children, ...props }: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger data-slot="navigation-menu-trigger" className={cn(triggerClass, className)} {...props}>
      {children}
      <NavigationMenuPrimitive.Icon className="text-muted-foreground transition-transform duration-200 data-popup-open:rotate-180 motion-reduce:transition-none">
        <ChevronDownIcon className="size-3.5" />
      </NavigationMenuPrimitive.Icon>
    </NavigationMenuPrimitive.Trigger>
  )
}

/** A panel of links. Size it with `className` (`w-96`, a grid). */
function NavigationMenuContent({ className, ...props }: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "frame-xl frame-p-1.5 w-[calc(100vw-1rem)] sm:w-max",
        "transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:opacity-0 data-starting-style:opacity-0",
        "motion-safe:data-starting-style:data-[activation-direction=left]:-translate-x-1/3 motion-safe:data-starting-style:data-[activation-direction=right]:translate-x-1/3",
        "motion-safe:data-ending-style:data-[activation-direction=left]:translate-x-1/3 motion-safe:data-ending-style:data-[activation-direction=right]:-translate-x-1/3",
        className
      )}
      {...props}
    />
  )
}

const linkVariants = {
  panel:
    "flex flex-col gap-0.5 rounded-inner px-2.5 py-2 text-ui outline-none hover:bg-secondary focus-visible:bg-secondary data-active:bg-foreground/6 [&>span+span]:text-ui-sm [&>span+span]:text-muted-foreground [&>span:first-child]:font-medium",
  trigger: triggerClass,
  // Section tabs in a header: full height, a 2px bar on the bottom edge under the active one.
  tab: "relative flex h-full items-center rounded-md px-2.5 text-ui font-medium text-muted-foreground outline-none transition-colors duration-150 after:absolute after:inset-x-2.5 after:-bottom-px after:h-0.5 after:rounded-full hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-active:text-foreground data-active:after:bg-foreground",
} as const

/**
 * A link in a panel (title plus an optional muted line), a top-level link styled like a trigger, or
 * a header section tab (`variant="tab"`; set `active` on the current section).
 */
function NavigationMenuLink({
  className,
  variant = "panel",
  ...props
}: NavigationMenuPrimitive.Link.Props & { variant?: keyof typeof linkVariants }) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      data-variant={variant}
      className={cn(linkVariants[variant], className)}
      {...props}
    />
  )
}

export { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger }
