"use client"

import * as React from "react"

import { cn } from "@paneui/ui/lib/utils"
import { GeneratedAvatarImage } from "@paneui/ui/components/generated-avatar"
import { OgCoverArt } from "@paneui/ui/components/og-image"

/**
 * Stand-in artwork drawn from a seed: a still mesh of the seed's palette, with a face on top for
 * portrait styles. No network and no WebGL, so a gallery of them costs nothing; swap in real
 * image URLs (`<img>` with `media-outline`) when you have them.
 */
export function SeededArt({ seed, portrait = false, className }: { seed: string; portrait?: boolean; className?: string }) {
  return (
    <div aria-hidden className={cn("absolute inset-0 overflow-hidden", className)}>
      <OgCoverArt seed={seed} width={720} height={960} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      {portrait && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <div className="aspect-square w-4/5">
            <GeneratedAvatarImage seed={seed} background="none" />
          </div>
        </div>
      )}
    </div>
  )
}

/** A gallery tile: the art, its name on a glass label, and the whole tile as one button. */
export function ArtTile({
  label,
  seed,
  portrait,
  height,
  onClick,
  children,
}: {
  label: string
  seed: string
  portrait?: boolean
  height: number
  onClick?: () => void
  children?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ height }}
      className="group/tile relative mb-3 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-xl text-start shadow-raised outline-none transition-shadow duration-150 hover:shadow-raised-hover focus-visible:ring-2 focus-visible:ring-ring"
    >
      <SeededArt seed={seed} portrait={portrait} className="transition-transform duration-300 ease-out motion-safe:group-hover/tile:scale-105" />
      <span className="absolute inset-x-2 bottom-2 flex">
        <span className="min-w-0 truncate rounded-control bg-card/80 px-2 py-1 text-ui font-medium text-foreground shadow-raised backdrop-blur-xl">{label}</span>
      </span>
      {children}
    </button>
  )
}
