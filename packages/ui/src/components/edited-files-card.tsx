"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { ChevronDownIcon, FolderIcon, UndoIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import { FileDiff, parseUnifiedDiff } from "@paneui/ui/components/file-diff"
import { useLocale } from "@paneui/ui/components/locale-provider"

const EASE = [0.22, 1, 0.36, 1] as const

type EditedFile = {
  path: string
  /** Unified diff for this file. */
  diff?: string
  /** Or the two versions (ACP `Diff` content: `oldText` null = new file). */
  oldText?: string | null
  newText?: string | null
  /** Counts shown before the diff loads; derived from `diff` when omitted. */
  additions?: number
  deletions?: number
}

function countLines(text: string | null | undefined) {
  if (!text) return 0
  return text.replace(/\n$/, "").split("\n").length
}

/** +/- counts for one file: from its diff rows, or a line-set comparison of old and new text. */
function fileStats(file: EditedFile) {
  if (file.additions !== undefined || file.deletions !== undefined)
    return { additions: file.additions ?? 0, deletions: file.deletions ?? 0 }
  if (file.diff) {
    let additions = 0
    let deletions = 0
    for (const r of parseUnifiedDiff(file.diff)) {
      if (r.type === "added") additions++
      else if (r.type === "removed") deletions++
    }
    return { additions, deletions }
  }
  if (file.oldText == null) return { additions: countLines(file.newText), deletions: 0 }
  if (file.newText == null) return { additions: 0, deletions: countLines(file.oldText) }
  // Cheap estimate: lines present in one version and not the other.
  const before = new Map<string, number>()
  for (const l of file.oldText.split("\n")) before.set(l, (before.get(l) ?? 0) + 1)
  let additions = 0
  for (const l of file.newText.split("\n")) {
    const n = before.get(l) ?? 0
    if (n > 0) before.set(l, n - 1)
    else additions++
  }
  let deletions = 0
  for (const n of before.values()) deletions += n
  return { additions, deletions }
}

type EditedFilesCardProps = Omit<React.ComponentProps<"div">, "title"> & {
  files: EditedFile[]
  /** Revert the turn's edits. The button hides when omitted. */
  onUndo?: () => void
  /** Open the full review (diff panel). The button hides when omitted. */
  onReview?: () => void
  /** Reveal a file in the explorer: adds a folder button to each row. */
  onRevealFile?: (path: string) => void
  /** Start with the file list open. */
  defaultOpen?: boolean
  title?: React.ReactNode
}

/**
 * Summary of the files an agent changed in a turn: "Edited 4
 * files" with total +/-, Undo and Review, and one row per file that expands
 * to its diff (`FileDiff`, row variant).
 */
function EditedFilesCard({
  files,
  onUndo,
  onReview,
  onRevealFile,
  defaultOpen = true,
  title,
  className,
  ...props
}: EditedFilesCardProps) {
  const { labels } = useLocale()
  const reduce = useReducedMotion()
  const [open, setOpen] = React.useState(defaultOpen)
  const stats = React.useMemo(() => files.map(fileStats), [files])
  const additions = stats.reduce((s, x) => s + x.additions, 0)
  const deletions = stats.reduce((s, x) => s + x.deletions, 0)
  const listId = React.useId()

  return (
    <div
      data-slot="edited-files-card"
      data-open={open || undefined}
      className={cn("@container/edited-files frame-3xl frame-inset-2 overflow-hidden bg-card text-ui shadow-raised", className)}
      {...props}
    >
      {/* 44px row: the 28px buttons sit 8px in from the top and end edges, so `rounded-inner` follows the card's corner. */}
      <div className="flex h-11 items-center gap-2 ps-3 pe-2">
        {/* The summary column clips rather than running under the buttons when the card is narrow. */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <span className="truncate font-medium">
            {title ?? labels.editedFiles(files.length)}
          </span>
          <span className="flex gap-1.5 font-mono text-ui-sm whitespace-nowrap tabular-nums">
            <span className="text-success-text">+{additions}</span>
            <span className="text-destructive-text">−{deletions}</span>
            <span className="sr-only">{labels.diffStats(additions, deletions)}</span>
          </span>
        </div>
        {onUndo && (
          <Button variant="ghost" size="sm" aria-label={labels.undo} onClick={onUndo} className="rounded-inner text-muted-foreground @max-xs/edited-files:px-2">
            {/* Under 20rem (narrow panes, phones) the button keeps only its glyph. */}
            <span className="@max-xs/edited-files:hidden">{labels.undo}</span>
            <UndoIcon className="rtl:-scale-x-100" data-icon="inline-end" />
          </Button>
        )}
        {onReview && (
          <Button variant="outline" size="sm" onClick={onReview} className="rounded-inner">
            {labels.review}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={open ? labels.hideFiles : labels.showFiles}
          onClick={() => setOpen(!open)}
          className="rounded-inner text-muted-foreground"
        >
          <ChevronDownIcon className={cn("transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")} />
        </Button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={listId}
            key="files"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            <ul data-slot="edited-files-list" className="flex flex-col border-t border-border">
              {files.map((file) => (
                <li
                  key={file.path}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    // A closed last row sits in the card's bottom corners: its name button (4px in) and
                    // chevron (6px in) follow the corner. The card's inner radius is 16 − 8, so add back
                    // the difference.
                    // eslint-disable-next-line shadcn/no-arbitrary-values -- concentric with the card's corner at a 4px inset
                    "last:[&_[data-slot=file-diff-trigger]:not([data-panel-open])]:rounded-es-[calc(var(--frame-inner-1)+4px)]",
                    // eslint-disable-next-line shadcn/no-arbitrary-values -- concentric with the card's corner at a 6px inset
                    "last:[&_[data-slot=file-diff-toggle]:not([data-panel-open])]:rounded-ee-[calc(var(--frame-inner-1)+2px)]"
                  )}
                >
                  <FileDiff
                    variant="row"
                    filename={file.path}
                    diff={file.diff}
                    {...(file.diff === undefined ? { oldFile: file.oldText ?? null, newFile: file.newText ?? null } : {})}
                    defaultOpen={false}
                    copyable={false}
                    maxHeight={280}
                    actions={
                      onRevealFile && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={labels.revealFile(file.path)}
                          onClick={() => onRevealFile(file.path)}
                          className="text-muted-foreground"
                        >
                          <FolderIcon />
                        </Button>
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { EditedFilesCard, fileStats, type EditedFile, type EditedFilesCardProps }
