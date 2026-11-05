"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"

import { ArrowUpRightIcon, FolderIcon, XIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { IconChip } from "@paneui/ui/components/icon-chip"

export type ProjectFolderFile = {
  id: string
  name: string
  /** Secondary line in the expanded view, e.g. "PDF · 2.4 MB". */
  meta?: string
  /** Thumbnail art for the sheet (fills a portrait card). */
  content: React.ReactNode
}

export interface ProjectFolderProps {
  title: string
  description?: string
  files?: ProjectFolderFile[]
  /** Total item count shown on the flap; defaults to files.length. */
  count?: number
  itemLabel?: string
  /** Fan state (hover / focus). */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Folder view dialog. */
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  onFileSelect?: (file: ProjectFolderFile) => void
  disabled?: boolean
  className?: string
}

const MAX_SHEETS = 5
const SPRING = { type: "spring", stiffness: 380, damping: 28, mass: 0.8 } as const
const LAYOUT_SPRING = { type: "spring", stiffness: 300, damping: 32 } as const

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value !== undefined ? value : internal
  const set = React.useCallback(
    (next: T) => {
      if (value === undefined) setInternal(next)
      onChange?.(next)
    },
    [value, onChange]
  )
  return [current, set] as const
}

function sheetPose(index: number, count: number, open: boolean) {
  const offset = index - (count - 1) / 2
  const distance = Math.abs(offset)
  if (!open) {
    return { x: offset * 7, y: distance * 2, rotate: offset * 2.5, scale: 1 - distance * 0.02 }
  }
  return {
    x: offset * 46,
    y: -30 - Math.max(0, 2 - distance) * 9,
    rotate: offset * 8,
    scale: distance === 0 ? 1.05 : 1 - distance * 0.04,
  }
}

export function ProjectFolder({
  title,
  description,
  files = [],
  count,
  itemLabel = "files",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  onFileSelect,
  disabled = false,
  className,
}: ProjectFolderProps) {
  const l10n = useLocale().labels

  const reduce = useReducedMotion()
  const uid = React.useId()
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const [expanded, setExpanded] = useControllable(expandedProp, defaultExpanded, onExpandedChange)
  const sheets = files.slice(0, MAX_SHEETS)
  const total = count ?? files.length
  const fanned = (open || expanded) && !disabled
  const shared = !reduce

  return (
    <LayoutGroup id={uid}>
      <div data-slot="project-folder" data-open={fanned || undefined} className={cn("relative w-72 [perspective:900px]", className)}>
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={expanded}
          aria-label={`${title}, ${total} ${itemLabel}. Open folder`}
          onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
          onFocus={(e) => e.currentTarget.matches(":focus-visible") && setOpen(true)}
          onBlur={() => setOpen(false)}
          onClick={() => setExpanded(true)}
          className="group/folder relative block h-52 w-full cursor-pointer rounded-3xl text-start outline-none [--folder-back:color-mix(in_oklch,var(--primary),black_22%)] focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          {/*
           * Back panel with tab. The tab owns the top-left corner, so the panel's own corner is square
           * there (a rounded one left a notch below the tab). Both tab corners are no taller than its
           * 14px rise, so each curve ends above the panel's top edge instead of
           * stepping into it. The right corner (--tab-r) ends --tab-f (= 14px − --tab-r) above the panel, exactly where a
           * concave fillet of that radius starts, so the edge is one S-curve.
           * No hairline ring: the tab could not carry it, so the outline broke where they meet.
           */}
          <span aria-hidden className="absolute inset-x-0 top-3.5 bottom-0 rounded-3xl rounded-tl-none bg-(--folder-back) [--tab-r:min(calc(var(--radius)*1.25),0.75rem)] [--tab-f:calc(0.875rem-var(--tab-r))]">
            <span className="absolute -top-3.5 left-0 h-7 w-24 rounded-tl-xl rounded-tr-(--tab-r) bg-(--folder-back)" />
            <span className="absolute -top-(--tab-f) left-24 size-(--tab-f) bg-[radial-gradient(circle_at_100%_0,transparent_var(--tab-f),var(--folder-back)_calc(var(--tab-f)+0.5px))]" />
          </span>

          {/* Sheets */}
          <span aria-hidden className="absolute inset-x-0 bottom-9 flex justify-center">
            {sheets.map((file, i) =>
              expanded ? (
                <span key={file.id} className="absolute bottom-0 h-32 w-24" />
              ) : (
                <motion.span
                  key={file.id}
                  layoutId={shared ? `${uid}-sheet-${file.id}` : undefined}
                  className="absolute bottom-0 block h-32 w-24 overflow-hidden rounded-xl bg-card p-1 shadow-raised"
                  style={{ zIndex: 10 - Math.abs(i - (sheets.length - 1) / 2) * 2, transformOrigin: "50% 100%" }}
                  initial={false}
                  animate={sheetPose(i, sheets.length, reduce ? false : fanned)}
                  transition={{ ...SPRING, delay: fanned ? Math.abs(i - (sheets.length - 1) / 2) * 0.025 : 0 }}
                >
                  <span className="block size-full overflow-hidden rounded-lg">{file.content}</span>
                </motion.span>
              )
            )}
          </span>

          {/* Front flap */}
          <motion.span
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-20 flex h-[68%] flex-col justify-end rounded-3xl bg-primary p-4 text-primary-foreground shadow-primary"
            style={{ transformOrigin: "50% 100%" }}
            initial={false}
            animate={reduce ? undefined : { rotateX: fanned ? -22 : 0, y: fanned ? 2 : 0 }}
            transition={SPRING}
          >
            <span className="flex items-end justify-between gap-3">
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-ui-lg font-semibold">{title}</span>
                <span className="tabular-nums truncate text-ui-sm text-primary-foreground/75">
                  {description ? `${description} · ` : ""}
                  {total} {itemLabel}
                </span>
              </span>
              <motion.span
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15"
                animate={reduce ? undefined : { scale: fanned ? 1 : 0.85, opacity: fanned ? 1 : 0.7 }}
                transition={SPRING}
              >
                <ArrowUpRightIcon className="rtl:-scale-x-100" size={15} />
              </motion.span>
            </span>
          </motion.span>
        </button>
      </div>

      <DialogPrimitive.Root open={expanded} onOpenChange={(next) => setExpanded(next)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <DialogPrimitive.Popup
            className="fixed inset-0 z-50 flex justify-center overflow-y-auto p-4 outline-none"
            onClick={(e) => e.target === e.currentTarget && setExpanded(false)}
          >
            {expanded && (
              <div className="relative isolate my-auto flex w-full max-w-2xl flex-col gap-4 p-5 text-popover-foreground">
                {/* Surface fades on its own so the sheets flying in via layoutId stay fully opaque. */}
                <motion.span
                  aria-hidden
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 -z-10 rounded-3xl bg-popover shadow-surface"
                />
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.05 }}
                  className="flex items-start gap-3 pr-10"
                >
                  <IconChip size="lg" tone="solid">
                    <FolderIcon />
                  </IconChip>
                  <div className="flex min-w-0 flex-col">
                    <DialogPrimitive.Title className="truncate text-lg leading-snug font-semibold">
                      {title}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="tabular-nums text-ui text-muted-foreground">
                      {description ? `${description} · ` : ""}
                      {total} {itemLabel}
                    </DialogPrimitive.Description>
                  </div>
                </motion.div>
                <DialogPrimitive.Close
                  aria-label={l10n.closeFolder}
                  className="absolute top-4 right-4 inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <XIcon size={16} />
                </DialogPrimitive.Close>

                <ul className="-m-1 grid grid-cols-2 gap-3 p-1 sm:grid-cols-3 md:grid-cols-4">
                  {files.map((file, i) => {
                    const inFan = i < MAX_SHEETS
                    const thumb = (
                      <motion.span
                        layoutId={shared && inFan ? `${uid}-sheet-${file.id}` : undefined}
                        initial={shared && inFan ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={shared && inFan ? LAYOUT_SPRING : { duration: 0.25, delay: 0.08 + i * 0.03 }}
                        className="block aspect-3/4 w-full overflow-hidden rounded-xl bg-card p-1 shadow-raised"
                      >
                        <span className="block size-full overflow-hidden rounded-lg">{file.content}</span>
                      </motion.span>
                    )
                    const label = (
                      <span className="flex min-w-0 flex-col px-0.5">
                        <span className="truncate text-ui font-medium">{file.name}</span>
                        {file.meta && <span className="truncate text-ui-sm text-muted-foreground">{file.meta}</span>}
                      </span>
                    )
                    return (
                      <li key={file.id}>
                        {onFileSelect ? (
                          <button
                            type="button"
                            onClick={() => onFileSelect(file)}
                            className="flex w-full cursor-pointer flex-col gap-2 rounded-2xl p-1.5 text-start transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {thumb}
                            {label}
                          </button>
                        ) : (
                          <div className="flex flex-col gap-2 p-1.5">
                            {thumb}
                            {label}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </LayoutGroup>
  )
}
