"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { AnimatePresence, motion } from "motion/react"

import { ArrowUpIcon, AttachIcon, MicIcon, StopIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"

export function PromptBar({
  placeholder,
  busy = false,
  onSubmit,
  onStop,
  className,
}: {
  placeholder?: string
  busy?: boolean
  onSubmit?: (value: string) => void
  onStop?: () => void
  className?: string
}) {
  const l10n = useLocale().labels
  if (placeholder === undefined) placeholder = l10n.askAnything

  const [value, setValue] = React.useState("")
  const canSend = value.trim().length > 0

  function submit() {
    if (!canSend || busy) return
    onSubmit?.(value.trim())
    setValue("")
  }

  return (
    <form
      data-slot="prompt-bar"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className={cn(
        "flex w-full flex-col gap-2 rounded-3xl bg-card p-2 shadow-raised transition-shadow focus-within:ring-2 focus-within:ring-ring",
        className
      )}
    >
      <textarea
        data-slot="prompt-bar-input"
        rows={1}
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            submit()
          }
        }}
        className="field-sizing-content max-h-48 min-h-10 w-full resize-none bg-transparent px-3 pt-2 text-ui-lg outline-none placeholder:text-muted-foreground"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon-sm" aria-label={l10n.attach}>
            <AttachIcon />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={l10n.voice}>
            <MicIcon />
          </Button>
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          {busy ? (
            <motion.span key="stop" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
              <Button type="button" variant="secondary" size="icon-sm" aria-label={l10n.stop} onClick={onStop}>
                <StopIcon size={14} />
              </Button>
            </motion.span>
          ) : (
            <motion.span key="send" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
              <Button type="submit" size="icon-sm" aria-label={l10n.send} disabled={!canSend}>
                <ArrowUpIcon />
              </Button>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}
