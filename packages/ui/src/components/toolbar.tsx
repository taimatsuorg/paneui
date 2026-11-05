"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@paneui/ui/lib/utils"

// A roving-focus row of controls (arrow keys move between items). `floating` is the
// popover surface used for selection bubbles: frame-xl, p-1, rows follow the frame (rounded-inner).
const toolbarVariants = cva("flex items-center gap-0.5 outline-none data-[orientation=vertical]:flex-col", {
  variants: {
    variant: {
      default: "",
      floating: "frame-xl frame-p-1 w-fit bg-popover text-popover-foreground shadow-surface",
      inset: "frame-lg frame-p-0.5 w-fit bg-muted shadow-well",
    },
  },
  defaultVariants: { variant: "default" },
})

const toolbarItemClass =
  "inline-flex h-7 min-w-7 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-inner px-1.5 data-[size=label]:gap-1 data-[size=label]:px-2 text-ui font-medium whitespace-nowrap text-muted-foreground outline-none select-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-64 data-pressed:bg-foreground/8 data-pressed:text-foreground aria-expanded:bg-secondary aria-expanded:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

function Toolbar({ className, variant, ...props }: ToolbarPrimitive.Root.Props & VariantProps<typeof toolbarVariants>) {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      data-variant={variant ?? "default"}
      className={cn(toolbarVariants({ variant }), className)}
      {...props}
    />
  )
}

function ToolbarGroup({ className, ...props }: ToolbarPrimitive.Group.Props) {
  return (
    <ToolbarPrimitive.Group
      data-slot="toolbar-group"
      className={cn("flex items-center gap-0.5 data-[orientation=vertical]:flex-col", className)}
      {...props}
    />
  )
}

type ToolbarItemSize = { /** `icon` (square, default) or `label` (text + icon, a little more padding). */ size?: "icon" | "label" }

/** A toolbar action. Pass `render` to turn another trigger (a Menu or Popover trigger) into a toolbar item. */
function ToolbarButton({ className, size = "icon", ...props }: ToolbarPrimitive.Button.Props & ToolbarItemSize) {
  return <ToolbarPrimitive.Button data-slot="toolbar-button" data-size={size} className={cn(toolbarItemClass, className)} {...props} />
}

/** A pressed / unpressed toolbar item (bold, italic): a toggle inside the toolbar's focus loop. */
function ToolbarToggle({
  className,
  size = "icon",
  pressed,
  defaultPressed,
  onPressedChange,
  value,
  ...props
}: ToolbarPrimitive.Button.Props & ToolbarItemSize & Pick<TogglePrimitive.Props, "pressed" | "defaultPressed" | "onPressedChange" | "value">) {
  return (
    <ToolbarPrimitive.Button
      data-slot="toolbar-toggle"
      data-size={size}
      className={cn(toolbarItemClass, className)}
      render={<TogglePrimitive pressed={pressed} defaultPressed={defaultPressed} onPressedChange={onPressedChange} value={value} />}
      {...props}
    />
  )
}

function ToolbarLink({ className, ...props }: ToolbarPrimitive.Link.Props) {
  return (
    <ToolbarPrimitive.Link
      data-slot="toolbar-link"
      className={cn(toolbarItemClass, "text-primary-text hover:text-primary-text", className)}
      {...props}
    />
  )
}

function ToolbarInput({ className, ...props }: ToolbarPrimitive.Input.Props) {
  return (
    <ToolbarPrimitive.Input
      data-slot="toolbar-input"
      className={cn(
        "h-7 min-w-0 rounded-inner bg-transparent px-2 text-ui outline-none placeholder:text-muted-foreground/72 focus-visible:bg-secondary",
        className
      )}
      {...props}
    />
  )
}

function ToolbarSeparator({ className, ...props }: ToolbarPrimitive.Separator.Props) {
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn(
        "mx-0.5 h-4 w-px shrink-0 bg-border data-[orientation=horizontal]:mx-0 data-[orientation=horizontal]:my-0.5 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-4",
        className
      )}
      {...props}
    />
  )
}

export { Toolbar, ToolbarGroup, ToolbarButton, ToolbarToggle, ToolbarLink, ToolbarInput, ToolbarSeparator, toolbarVariants }
