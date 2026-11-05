"use client"

import * as React from "react"

import { Button } from "@paneui/ui/components/button"
import { Tooltip, TooltipContent, TooltipKbd, TooltipTrigger } from "@paneui/ui/components/tooltip"

/** Title row of a sidebar view, with its actions on the right. The view name leads; section labels sit one step quieter. */
export function SidebarHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-0.5 pe-1.5 ps-3">
      <h2 className="min-w-0 flex-1 truncate text-ui font-semibold">{title}</h2>
      {children}
    </div>
  )
}

/** A group label inside a view (the workspace, Changes, Built-in): sentence case, muted, with an optional count. */
export function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="flex h-7 shrink-0 items-center gap-1.5 pe-3 ps-3 text-ui-sm font-medium text-muted-foreground">
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {count !== undefined && <span className="tabular-nums">{count}</span>}
    </div>
  )
}

/** Small icon button with a tooltip, for view headers and panel toolbars. */
export function IconAction({
  label,
  shortcut,
  onClick,
  pressed,
  disabled,
  size = "icon-xs",
  children,
}: {
  label: string
  shortcut?: string
  onClick?: () => void
  pressed?: boolean
  disabled?: boolean
  size?: "icon-xs" | "icon-sm" | "icon"
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
            disabled={disabled}
            onClick={onClick}
            className={pressed ? "text-foreground" : "text-muted-foreground"}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent side="bottom">
        {label}
        {shortcut && <TooltipKbd>{shortcut}</TooltipKbd>}
      </TooltipContent>
    </Tooltip>
  )
}
