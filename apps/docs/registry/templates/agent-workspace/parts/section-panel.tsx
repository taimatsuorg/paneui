"use client"

import * as React from "react"

import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import { Kbd } from "@paneui/ui/components/kbd"
import { Tooltip, TooltipContent, TooltipKbd, TooltipTrigger } from "@paneui/ui/components/tooltip"

/** An icon-only button with its name in a tooltip (and the shortcut, when it has one). */
export function IconAction({
  label,
  shortcut,
  onClick,
  pressed,
  size = "icon-sm",
  side = "bottom",
  className,
  children,
}: {
  label: string
  shortcut?: string
  onClick?: () => void
  pressed?: boolean
  size?: "icon-xs" | "icon-sm" | "icon"
  side?: "top" | "bottom" | "left" | "right"
  className?: string
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size={size}
            aria-label={label}
            aria-pressed={pressed}
            onClick={onClick}
            className={cn("text-muted-foreground", pressed && "text-foreground", className)}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent side={side}>
        {label}
        {shortcut && <TooltipKbd>{shortcut}</TooltipKbd>}
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * The second column every page shares: its title (or a menu in the title's place), a few icon
 * actions, one primary row ("New chat", "New task") and the page's own index below. Keeping the
 * header and the primary row in the same place on every page is what makes switching pages calm.
 */
export function SectionPanel({
  title,
  heading,
  actions,
  primary,
  children,
  className,
}: {
  /** Plain title; ignored when `heading` is given. */
  title?: string
  /** Replaces the title, e.g. a workspace menu. */
  heading?: React.ReactNode
  actions?: React.ReactNode
  primary?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex h-full min-w-0 flex-col", className)}>
      <div className="flex h-12 shrink-0 items-center gap-1 ps-3 pe-2">
        <div className="flex min-w-0 flex-1 items-center">
          {heading ?? <h2 className="truncate font-heading text-base font-semibold">{title}</h2>}
        </div>
        {actions}
      </div>
      {primary && <div className="flex shrink-0 flex-col gap-0.5 px-2 pb-2">{primary}</div>}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

/** The primary row under the title: a ghost button with an icon, a label and its shortcut. */
export function SectionPrimary({
  icon,
  label,
  shortcut,
  keys,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  shortcut?: string
  /** `aria-keyshortcuts` value, such as `Meta+N`. */
  keys?: string
  onClick?: () => void
}) {
  return (
    <Button variant="ghost" className="w-full justify-start text-foreground" onClick={onClick} aria-keyshortcuts={keys}>
      <span data-icon="inline-start" className="flex text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      <span className="font-normal">{label}</span>
      {shortcut && <Kbd className="ms-auto">{shortcut}</Kbd>}
    </Button>
  )
}

/** A centred page body for the views beside the chat: a readable column with page padding. */
export function PageBody({ wide = false, className, children }: { wide?: boolean; className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto flex w-full flex-col gap-6 px-5 pt-6 pb-10 md:px-8 md:pt-8", wide ? "max-w-6xl" : "max-w-3xl", className)}>{children}</div>
}
