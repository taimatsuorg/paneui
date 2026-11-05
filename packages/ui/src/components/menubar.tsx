import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar"

import { cn } from "@paneui/ui/lib/utils"
import {
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from "@paneui/ui/components/menu"

/*
 * A row of menus, as in a desktop app's title bar. Arrow keys move between menus and,
 * once one is open, hovering another trigger switches to it. Menu parts are the Menu's own.
 */
function Menubar({ className, ...props }: MenubarPrimitive.Props) {
  return (
    <MenubarPrimitive
      data-slot="menubar"
      className={cn("frame-xl frame-p-1 flex h-9 w-fit items-center gap-0.5 bg-card shadow-raised", className)}
      {...props}
    />
  )
}

const MenubarMenu = MenuPrimitive.Root

function MenubarTrigger({ className, ...props }: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "inline-flex h-7 cursor-default items-center rounded-inner px-2.5 text-ui font-medium outline-none select-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-foreground/6",
        className
      )}
      {...props}
    />
  )
}

function MenubarContent({ sideOffset = 6, align = "start", alignOffset = -4, ...props }: React.ComponentProps<typeof MenuContent>) {
  return <MenuContent data-slot="menubar-content" sideOffset={sideOffset} align={align} alignOffset={alignOffset} {...props} />
}

export {
  Menubar,
  MenuCheckboxItem as MenubarCheckboxItem,
  MenubarContent,
  MenuGroup as MenubarGroup,
  MenuItem as MenubarItem,
  MenuLabel as MenubarLabel,
  MenubarMenu,
  MenuRadioGroup as MenubarRadioGroup,
  MenuRadioItem as MenubarRadioItem,
  MenuSeparator as MenubarSeparator,
  MenuShortcut as MenubarShortcut,
  MenuSub as MenubarSub,
  MenuSubContent as MenubarSubContent,
  MenuSubTrigger as MenubarSubTrigger,
  MenubarTrigger,
}
