"use client"

import * as React from "react"

import { BotIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { AccentPresets } from "@paneui/ui/components/accent-picker"
import { ToastProvider } from "@paneui/ui/components/toast"
import { TooltipProvider } from "@paneui/ui/components/tooltip"

import { brand } from "../lib/data"
import { AppLink } from "../lib/routes"

/** Applies the stored light / dark choice before first paint (ThemeToggle writes localStorage["theme"]). */
const THEME_SCRIPT = `(function(){try{var m=localStorage.getItem("theme");var d=m==="dark"||((!m||m==="system")&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light"}catch(_){}})()`

/**
 * Providers every template page needs: toasts, tooltips, the accent presets and
 * the pre-paint theme script. Move them into your root layout if you like.
 */
export function SaasProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <TooltipProvider>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <AccentPresets />
        {children}
      </TooltipProvider>
    </ToastProvider>
  )
}

/** Product mark + name. */
export function BrandMark({ className, href = "/", showName = true }: { className?: string; href?: string; showName?: boolean }) {
  return (
    <AppLink
      href={href}
      className={cn("flex items-center gap-2 rounded-lg font-semibold icon-bold outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
    >
      <BotIcon size={18} className="text-primary-text" />
      {showName ? <span>{brand.name}</span> : <span className="sr-only">{brand.name}</span>}
    </AppLink>
  )
}

/** Initials avatar used across the template. */
export function initials(name: string) {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
