"use client"

import { useT } from "@/lib/site-locale"
import { siteCopy } from "@/lib/site-copy"

import * as React from "react"

import { CheckIcon, LinkIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"

const sizes = {
  h2: "font-heading text-xl font-semibold tracking-tight",
  h3: "font-heading text-lg font-semibold",
} as const

/**
 * Section heading with an anchor. Hovering the heading (or focusing the link) shows a link button;
 * pressing it copies the section URL, puts the hash in the address bar and says "Copied" inline.
 */
export function DocHeading({
  as: Tag = "h2",
  id,
  className,
  children,
}: {
  as?: "h2" | "h3"
  id: string
  className?: string
  children: React.ReactNode
}) {
  const t = useT()
  const label = (text: string) => t(siteCopy(text))
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const url = new URL(window.location.href)
    url.hash = id
    window.history.replaceState(window.history.state, "", url)
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    })
    navigator.clipboard?.writeText(url.toString()).then(
      () => {
        setCopied(true)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), 1600)
      },
      () => {},
    )
  }

  return (
    <Tag id={id} className={cn("group/heading scroll-mt-24 xl:scroll-mt-20", sizes[Tag], className)}>
      {typeof children === "string" ? label(children) : children}
      <a
        href={`#${id}`}
        onClick={onClick}
        aria-label={copied ? label("Link copied") : label("Copy link to section")}
        data-md-skip
        className={cn(
          "ms-2 inline-flex items-center gap-1 rounded-sm align-middle text-ui font-normal tracking-normal text-muted-foreground opacity-0 transition-[opacity,color] duration-150 outline-none select-none hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover/heading:opacity-100 pointer-coarse:opacity-100",
          copied && "text-foreground opacity-100",
        )}
      >
        {copied ? <CheckIcon className="size-3.5" /> : <LinkIcon className="size-3.5" />}
        <span aria-live="polite" className={cn("text-ui-sm", !copied && "sr-only")}>
          {copied ? label("Copied") : ""}
        </span>
      </a>
    </Tag>
  )
}
