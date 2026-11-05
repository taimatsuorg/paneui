"use client"

import { useT } from "@/lib/site-locale"
import { siteCopy } from "@/lib/site-copy"

import * as React from "react"
import { siClaude } from "simple-icons"

import { ChatIcon, CheckIcon, ChevronDownIcon, CopyIcon, ExternalLinkIcon, FileIcon, LinkIcon } from "@paneui/ui/icons"
import { ActionSwapBlurIcon } from "@paneui/ui/components/action-swap-blur"
import { BrandIcon } from "@paneui/ui/components/brand-icon"
import { Button } from "@paneui/ui/components/button"
import { ButtonGroup, ButtonGroupSeparator } from "@paneui/ui/components/button-group"
import { Menu, MenuContent, MenuGroup, MenuItem, MenuSeparator, MenuTrigger } from "@paneui/ui/components/menu"
import { useToast } from "@paneui/ui/components/toast"

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** Absolute URL of a site path on the host the page is served from. */
const absolute = (p: string) => new URL(`${BASE_PATH}${p}`, window.location.origin).toString()

/**
 * "Copy page" and its menu, next to the page title (on component pages, on the preview panel). The Markdown is the static `/docs/<slug>.md`
 * written at build time, so the copy, the raw view and the chat links all read the same file.
 */
export function PageActions({
  markdownPath,
  pagePath,
  title,
  variant = "outline",
}: {
  markdownPath: string
  pagePath: string
  title: string
  /** `default` is the primary pill a component page puts on its preview panel. */
  variant?: "outline" | "default"
}) {
  const t = useT()
  const label = (text: string) => t(siteCopy(text))
  const toast = useToast()
  const [copied, setCopied] = React.useState(false)
  const cache = React.useRef<Promise<string> | null>(null)
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const markdown = () => {
    cache.current ??= fetch(absolute(markdownPath)).then((r) => {
      if (!r.ok) throw new Error(String(r.status))
      return r.text()
    })
    cache.current.catch(() => (cache.current = null))
    return cache.current
  }

  const flash = () => {
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
  }

  const copyMarkdown = async () => {
    try {
      // Safari only allows a clipboard write inside the gesture, so hand it a promise of the text.
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ "text/plain": markdown().then((t) => new Blob([t], { type: "text/plain" })) })])
      } else {
        await navigator.clipboard.writeText(await markdown())
      }
      flash()
      toast.add({ title: label("Copied as Markdown"), type: "success" })
    } catch {
      toast.add({ title: label("Couldn't copy this page"), description: label("Open it as Markdown instead."), type: "error" })
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(absolute(pagePath))
      toast.add({ title: label("Link copied"), type: "success" })
    } catch {
      toast.add({ title: label("Couldn't copy the link"), type: "error" })
    }
  }

  const openChat = (base: string) => {
    const prompt = `Read ${absolute(markdownPath)} so I can ask questions about ${title} in PaneUI.`
    window.open(`${base}${encodeURIComponent(prompt)}`, "_blank", "noopener,noreferrer")
  }

  return (
    <ButtonGroup data-md-skip className="shrink-0">
      <Button variant={variant} size={variant === "default" ? "default" : "sm"} onClick={copyMarkdown}>
        <ActionSwapBlurIcon value={copied ? "copied" : "copy"} className="size-3.5">
          {copied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
        </ActionSwapBlurIcon>
        {label("Copy page")}
      </Button>
      <ButtonGroupSeparator />
      <Menu>
        <MenuTrigger render={<Button variant={variant} size={variant === "default" ? "icon" : "icon-sm"} aria-label={label("More page actions")} />}>
          <ChevronDownIcon />
        </MenuTrigger>
        <MenuContent align="end" className="min-w-52">
          <MenuGroup>
            <MenuItem onClick={copyMarkdown}>
              <CopyIcon />
              {label("Copy as Markdown")}
            </MenuItem>
            <MenuItem onClick={() => window.open(absolute(markdownPath), "_blank", "noopener,noreferrer")}>
              <FileIcon />
              {label("View as Markdown")}
            </MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuGroup>
            <MenuItem onClick={() => openChat("https://chatgpt.com/?hints=search&q=")}>
              {/* The brand icon package leaves this mark out, so it gets a neutral chat glyph. */}
              <ChatIcon />
              {label("Open in ChatGPT")}
              <ExternalLinkIcon className="ms-auto rtl:-scale-x-100" />
            </MenuItem>
            <MenuItem onClick={() => openChat("https://claude.ai/new?q=")}>
              <BrandIcon icon={siClaude} />
              {label("Open in Claude")}
              <ExternalLinkIcon className="ms-auto rtl:-scale-x-100" />
            </MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuItem onClick={copyLink}>
            <LinkIcon />
            {label("Copy page link")}
          </MenuItem>
        </MenuContent>
      </Menu>
    </ButtonGroup>
  )
}
