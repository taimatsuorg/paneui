"use client"

import { useLocale } from "@paneui/ui/components/locale-provider"
import * as React from "react"

import { ChevronsUpDownIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@paneui/ui/components/avatar"
import { Menu, MenuContent, MenuGroup, MenuLabel, MenuTrigger } from "@paneui/ui/components/menu"

/*
 * The signed-in user at the foot of an app sidebar (or in a top bar): avatar,
 * name and email, opening a menu you fill with MenuItems (profile, theme,
 * sign out). `collapsed` shows only the avatar, for an icon-rail sidebar.
 *
 *   <UserMenu name="Dana Chen" email="dana@acme.dev">
 *     <MenuItem>Profile</MenuItem>
 *     <MenuSeparator />
 *     <MenuItem variant="destructive">Sign out</MenuItem>
 *   </UserMenu>
 */

type UserMenuProps = Omit<React.ComponentProps<"button">, "children"> & {
  name: string
  email?: string
  /** Photo URL; falls back to initials. */
  image?: string
  /** Avatar only (icon rail). */
  collapsed?: boolean
  /** `compact` is a bare avatar button, e.g. for a top bar. Default `row`. */
  variant?: "row" | "compact"
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  /** Menu contents. The email is shown as the first label. */
  children?: React.ReactNode
}

function initialsOf(name: string) {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function UserMenu({
  name,
  email,
  image,
  collapsed = false,
  variant = "row",
  side = "top",
  align = "start",
  children,
  className,
  ...props
}: UserMenuProps) {
  const l10n = useLocale().labels
  const compact = collapsed || variant === "compact"
  return (
    <Menu>
      <MenuTrigger
        data-slot="user-menu"
        className={cn(
          "flex min-w-0 cursor-pointer items-center rounded-inner text-start text-ui outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-secondary",
          compact ? (variant === "compact" ? "size-8 justify-center" : "h-10 w-full justify-center") : "h-11 w-full gap-2.5 px-2",
          className
        )}
        {...props}
        aria-label={props["aria-label"] ?? l10n.accountMenu(name)}
      >
        <Avatar size={variant === "compact" ? "sm" : "md"} className={variant === "row" ? "size-7" : undefined}>
          {image && <AvatarImage src={image} alt="" />}
          <AvatarFallback>{initialsOf(name)}</AvatarFallback>
        </Avatar>
        {!compact && (
          <>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate font-medium">{name}</span>
              {email && <span className="truncate text-ui-xs text-muted-foreground">{email}</span>}
            </span>
            <ChevronsUpDownIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
          </>
        )}
      </MenuTrigger>
      <MenuContent side={side} align={align} className="w-56">
        {email && (
          <MenuGroup>
            <MenuLabel>{email}</MenuLabel>
          </MenuGroup>
        )}
        {children}
      </MenuContent>
    </Menu>
  )
}

export { UserMenu }
export type { UserMenuProps }
