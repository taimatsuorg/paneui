"use client"

import * as React from "react"
import { useLocale, localeLabels, type LocaleLabels } from "@paneui/ui/components/locale-provider"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import {
  AlertCircleIcon,
  CheckIcon,
  FileIcon,
  ImageIcon,
  RefreshIcon,
  UploadIcon,
  XIcon,
} from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"

export type FileUploadStatus = "queued" | "uploading" | "success" | "error"

export type FileUploadItem = {
  id: string
  name: string
  size: number
  type?: string
  /** 0–100 */
  progress?: number
  status?: FileUploadStatus
  error?: string
  file?: File
}

export type FileUploadHandler = (
  item: FileUploadItem,
  helpers: { onProgress: (progress: number) => void; signal: AbortSignal }
) => Promise<void>

export interface FileUploadProps {
  value?: FileUploadItem[]
  defaultValue?: FileUploadItem[]
  onValueChange?: (items: FileUploadItem[]) => void
  /**
   * Uploads one item. Report progress with `onProgress(0–100)`, resolve on success, throw to fail.
   * When provided, the queue drives itself: new and retried items are uploaded automatically.
   */
  upload?: FileUploadHandler
  onFilesAdded?: (items: FileUploadItem[], files: File[]) => void
  onRemove?: (item: FileUploadItem) => void
  onRetry?: (item: FileUploadItem) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  /** Bytes. Larger files are added in the error state. */
  maxFileSize?: number
  disabled?: boolean
  title?: string
  description?: string
  browseLabel?: string
  className?: string
}

const EASE = [0.22, 1, 0.36, 1] as const

function getStatusLabel(l10n: LocaleLabels = localeLabels.en): Record<FileUploadStatus, string> {
  return ({
  queued: l10n.queued,
  uploading: l10n.uploading,
  success: l10n.uploaded,
  error: l10n.toolFailed,
})
}


export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / 1024 ** i
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}

let idCounter = 0
export function createFileUploadItem(file: File): FileUploadItem {
  idCounter += 1
  return {
    id: `upload-${Date.now().toString(36)}-${idCounter}`,
    name: file.name,
    size: file.size,
    type: file.type,
    progress: 0,
    status: "queued",
    file,
  }
}

/** Controlled-or-uncontrolled list whose updater always reads the latest value. */
function useItemList(
  value: FileUploadItem[] | undefined,
  defaultValue: FileUploadItem[] | undefined,
  onValueChange: ((items: FileUploadItem[]) => void) | undefined
) {
  const [internal, setInternal] = React.useState<FileUploadItem[]>(defaultValue ?? [])
  const items = value ?? internal
  const latest = React.useRef(items)
  latest.current = items
  const onChangeRef = React.useRef(onValueChange)
  onChangeRef.current = onValueChange
  const controlled = value !== undefined

  const update = React.useCallback(
    (updater: (items: FileUploadItem[]) => FileUploadItem[]) => {
      const next = updater(latest.current)
      latest.current = next
      if (!controlled) setInternal(next)
      onChangeRef.current?.(next)
    },
    [controlled]
  )
  return [items, update] as const
}

function isImage(item: FileUploadItem) {
  return item.type?.startsWith("image/") || /\.(png|jpe?g|gif|webp|avif|svg|heic)$/i.test(item.name)
}

function extension(name: string) {
  const ext = name.split(".").pop()
  return ext && ext !== name ? ext.slice(0, 4).toUpperCase() : "FILE"
}

function UploadProgress({ status, progress }: { status: FileUploadStatus; progress: number }) {
  const l10n = useLocale().labels

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-label={l10n.uploadProgress}
      className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted shadow-well"
    >
      <motion.div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full",
          status === "error" ? "bg-destructive" : status === "success" ? "bg-success" : "bg-primary"
        )}
        initial={false}
        animate={{ width: `${Math.max(status === "queued" ? 0 : 4, progress)}%` }}
        transition={{ type: "spring", stiffness: 180, damping: 26, mass: 0.6 }}
      />
      {status === "uploading" && (
        <div className="pointer-events-none absolute inset-0 animate-pulse bg-linear-to-r from-transparent via-background/25 to-transparent" />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: FileUploadStatus }) {
  const l10n = useLocale().labels
  const statusLabel = getStatusLabel(l10n)

  return (
    <span className="relative inline-flex h-5 items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          initial={{ opacity: 0, y: 4, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
          transition={{ duration: 0.2, ease: EASE }}
          className={cn(
            "inline-flex items-center gap-1 text-ui-sm font-medium",
            status === "queued" && "text-muted-foreground",
            status === "uploading" && "text-primary-text",
            status === "success" && "text-success-text",
            status === "error" && "text-destructive-text"
          )}
        >
          {status === "success" && <CheckIcon size={13} />}
          {status === "error" && <AlertCircleIcon size={13} />}
          {statusLabel[status]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function FileUploadRow({
  item,
  onRemove,
  onRetry,
  disabled,
}: {
  item: FileUploadItem
  onRemove: (item: FileUploadItem) => void
  onRetry: (item: FileUploadItem) => void
  disabled?: boolean
}) {
  const l10n = useLocale().labels

  const reduce = useReducedMotion()
  const status = item.status ?? "queued"
  const progress = status === "success" ? 100 : Math.min(100, Math.max(0, item.progress ?? 0))
  const image = isImage(item)

  return (
    <motion.li
      layout={!reduce}
      data-slot="file-upload-item"
      data-status={status}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: -12, scale: 0.98, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      className="flex items-center gap-3 frame-2xl frame-p-2.5 pr-2 bg-card shadow-raised"
    >
      <span
        className={cn(
          "relative inline-flex size-10 shrink-0 items-center justify-center rounded-inner bg-muted shadow-well",
          status === "error" ? "text-destructive-text" : "text-muted-foreground"
        )}
      >
        {image ? <ImageIcon size={18} /> : <FileIcon size={18} />}
        <span className="absolute -bottom-1 rounded-md bg-popover px-1 text-[0.55rem] leading-3.5 font-semibold tracking-wide text-foreground shadow-chip">
          {extension(item.name)}
        </span>
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-ui font-medium" title={item.name}>
            {item.name}
          </span>
          <StatusBadge status={status} />
        </div>
        {status === "error" ? (
          <span className="tabular-nums truncate text-ui-sm text-destructive-text/90">
            {item.error ?? l10n.uploadFailed} · {formatBytes(item.size)}
          </span>
        ) : (
          <div className="flex items-center gap-2.5">
            <UploadProgress status={status} progress={progress} />
            <span className="w-24 shrink-0 text-end text-ui-sm text-muted-foreground tabular-nums">
              {status === "uploading"
                ? `${Math.round(progress)}% · ${formatBytes(item.size)}`
                : formatBytes(item.size)}
            </span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {status === "error" && (
          <button
            type="button"
            onClick={() => onRetry(item)}
            disabled={disabled}
            aria-label={l10n.retryNamed(item.name)}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <RefreshIcon size={15} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(item)}
          disabled={disabled}
          aria-label={status === "uploading" ? l10n.cancelNamed(item.name) : l10n.removeNamed(item.name)}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <XIcon size={15} />
        </button>
      </div>
    </motion.li>
  )
}

export function FileUpload({
  value,
  defaultValue,
  onValueChange,
  upload,
  onFilesAdded,
  onRemove,
  onRetry,
  accept,
  multiple = true,
  maxFiles,
  maxFileSize,
  disabled = false,
  title,
  description = "or browse from your computer",
  browseLabel,
  className,
}: FileUploadProps) {
  const l10n = useLocale().labels
  if (title === undefined) title = l10n.dropFilesToUpload
  if (browseLabel === undefined) browseLabel = l10n.browseFiles

  const reduce = useReducedMotion()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const inputId = React.useId()
  const [items, setItems] = useItemList(value, defaultValue, onValueChange)
  const [dragging, setDragging] = React.useState(false)
  const dragDepth = React.useRef(0)
  const [announcement, setAnnouncement] = React.useState("")

  const uploadRef = React.useRef(upload)
  uploadRef.current = upload
  const controllers = React.useRef(new Map<string, AbortController>())

  const patch = React.useCallback(
    (id: string, next: Partial<FileUploadItem>) =>
      setItems((all) => all.map((it) => (it.id === id ? { ...it, ...next } : it))),
    [setItems]
  )

  const start = React.useCallback(
    (item: FileUploadItem) => {
      const run = uploadRef.current
      if (!run || controllers.current.has(item.id)) return
      const controller = new AbortController()
      controllers.current.set(item.id, controller)
      patch(item.id, { status: "uploading", progress: 0, error: undefined })
      run(item, {
        signal: controller.signal,
        onProgress: (p) => {
          if (!controller.signal.aborted) patch(item.id, { progress: Math.min(99, Math.max(0, p)) })
        },
      })
        .then(() => {
          if (controller.signal.aborted) return
          patch(item.id, { status: "success", progress: 100 })
          setAnnouncement(`${item.name} uploaded`)
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return
          const message = err instanceof Error ? err.message : typeof err === "string" ? err : l10n.uploadFailed
          patch(item.id, { status: "error", error: message })
          setAnnouncement(`${item.name} failed: ${message}`)
        })
        .finally(() => {
          if (controllers.current.get(item.id) === controller) controllers.current.delete(item.id)
        })
    },
    [patch]
  )

  // Drive queued items when an upload handler is provided. Items without a `file` are still
  // handed to `upload` (useful for resumable/server-side items and demos).
  React.useEffect(() => {
    if (!upload) return
    for (const item of items) {
      const status = item.status ?? "queued"
      // "uploading" without a live request = interrupted (remount, seeded value): resume it.
      if (status === "queued" || (status === "uploading" && !controllers.current.has(item.id))) start(item)
    }
  }, [items, upload, start])

  React.useEffect(() => {
    const map = controllers.current
    return () => {
      map.forEach((c) => c.abort())
      map.clear()
    }
  }, [])

  const addFiles = (list: FileList | File[] | null) => {
    if (!list || disabled) return
    let files = Array.from(list)
    if (!multiple) files = files.slice(0, 1)
    if (maxFiles !== undefined) files = files.slice(0, Math.max(0, maxFiles - items.length))
    if (files.length === 0) {
      setAnnouncement(l10n.fileLimit(maxFiles ?? 0))
      return
    }
    const created = files.map((file) => {
      const item = createFileUploadItem(file)
      if (maxFileSize !== undefined && file.size > maxFileSize) {
        return { ...item, status: "error" as const, error: l10n.largerThan(formatBytes(maxFileSize)) }
      }
      return item
    })
    setItems((all) => (multiple ? [...all, ...created] : created))
    onFilesAdded?.(created, files)
    setAnnouncement(l10n.filesAdded(created.length))
  }

  const handleRemove = (item: FileUploadItem) => {
    controllers.current.get(item.id)?.abort()
    controllers.current.delete(item.id)
    setItems((all) => all.filter((it) => it.id !== item.id))
    onRemove?.(item)
    setAnnouncement(`${item.name} removed`)
  }

  const handleRetry = (item: FileUploadItem) => {
    onRetry?.(item)
    if (uploadRef.current) start(item)
    else patch(item.id, { status: "queued", progress: 0, error: undefined })
  }

  const full = maxFiles !== undefined && items.length >= maxFiles
  const inactive = disabled || full
  const doneCount = items.filter((i) => i.status === "success").length

  return (
    <div data-slot="file-upload" className={cn("flex w-full flex-col gap-3", className)}>
      <motion.div
        data-slot="file-upload-dropzone"
        data-dragging={dragging || undefined}
        data-disabled={inactive || undefined}
        onDragEnter={(e) => {
          e.preventDefault()
          if (inactive) return
          dragDepth.current += 1
          setDragging(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = inactive ? "none" : "copy"
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          dragDepth.current = Math.max(0, dragDepth.current - 1)
          if (dragDepth.current === 0) setDragging(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          dragDepth.current = 0
          setDragging(false)
          if (!inactive) addFiles(e.dataTransfer.files)
        }}
        animate={reduce ? undefined : { scale: dragging ? 1.015 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "relative flex flex-col items-center gap-3 rounded-3xl bg-background dark:bg-input/32 px-6 py-7 text-center shadow-well transition-colors",
          "outline-2 -outline-offset-8 outline-transparent outline-dashed",
          dragging && "bg-primary/8 outline-primary/50",
          inactive && "opacity-60"
        )}
      >
        <motion.span
          animate={reduce ? undefined : { y: dragging ? -4 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-2xl bg-card shadow-raised",
            dragging ? "text-primary-text" : "text-muted-foreground"
          )}
        >
          <UploadIcon size={20} />
        </motion.span>
        <div className="flex flex-col gap-0.5">
          <span className="text-ui font-medium">{dragging ? l10n.releaseToAdd : full ? l10n.uploadLimitReached : title}</span>
          <span className="text-ui-sm text-muted-foreground">
            {description}
            {maxFileSize !== undefined && ` · up to ${formatBytes(maxFileSize)}`}
          </span>
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          tabIndex={-1}
          accept={accept}
          multiple={multiple}
          disabled={inactive}
          onChange={(e) => {
            addFiles(e.currentTarget.files)
            e.currentTarget.value = ""
          }}
        />
        <button
          type="button"
          disabled={inactive}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-card px-3.5 text-ui-sm font-medium text-secondary-foreground shadow-raised transition-[box-shadow,background-color,scale] duration-150 ease-out outline-none hover:bg-accent hover:shadow-raised-hover focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
        >
          {browseLabel}
        </button>
      </motion.div>

      {items.length > 0 && (
        <div className="flex items-center justify-between px-1 text-ui-sm text-muted-foreground">
          <span>
            {items.length} file{items.length === 1 ? "" : "s"}
          </span>
          <span className="tabular-nums">
            {doneCount}/{items.length} uploaded
          </span>
        </div>
      )}

      <ul data-slot="file-upload-queue" aria-label={l10n.uploadQueue} className="flex flex-col gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((item) => (
            <FileUploadRow key={item.id} item={item} onRemove={handleRemove} onRetry={handleRetry} disabled={disabled} />
          ))}
        </AnimatePresence>
      </ul>

      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  )
}
