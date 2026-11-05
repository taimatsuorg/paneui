"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"

import {
  AlertCircleIcon,
  AttachIcon,
  CheckIcon,
  FileIcon,
  GlobeIcon,
  ImageIcon,
  PlusIcon,
  RefreshIcon,
  UploadIcon,
  XIcon,
} from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"

export type AttachmentKind = "file" | "image" | "link"
export type AttachmentStatus = "queued" | "uploading" | "success" | "error"
export type AttachmentRejectReason = "too-large" | "max-files"

export type AttachmentItem = {
  id: string
  name: string
  kind: AttachmentKind
  size?: number
  type?: string
  /** For links. */
  href?: string
  /** Image preview source (object URL, data URL or remote). Falls back to a generated gradient. */
  previewUrl?: string
  /** 0–100 */
  progress?: number
  status?: AttachmentStatus
  error?: string
  file?: File
}

export type AttachmentUploadHandler = (
  item: AttachmentItem,
  helpers: { onProgress: (progress: number) => void; signal: AbortSignal }
) => Promise<void>

export interface AttachmentUploadProps {
  value?: AttachmentItem[]
  defaultValue?: AttachmentItem[]
  onValueChange?: (items: AttachmentItem[]) => void
  /** Uploads one item; report progress, resolve on success, throw to fail. Drives queued and retried items. */
  upload?: AttachmentUploadHandler
  onFilesAdded?: (items: AttachmentItem[], files: File[]) => void
  onFilesRejected?: (files: File[], reason: AttachmentRejectReason) => void
  onRemove?: (item: AttachmentItem) => void
  onRetry?: (item: AttachmentItem) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  /** Bytes. */
  maxFileSize?: number
  disabled?: boolean
  title?: string
  description?: string
  label?: string
  className?: string
}

const EASE = [0.22, 1, 0.36, 1] as const
const iconButton =
  "inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

function formatBytes(bytes?: number) {
  if (bytes === undefined || !Number.isFinite(bytes) || bytes <= 0) return ""
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const v = bytes / 1024 ** i
  return `${v >= 10 || i === 0 ? Math.round(v) : v.toFixed(1)} ${units[i]}`
}

function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return Math.abs(h)
}

/** Deterministic two-stop gradient used when an image has no preview yet. */
export function attachmentGradient(seed: string) {
  const h = hash(seed) % 360
  return `linear-gradient(135deg, oklch(0.78 0.12 ${h}), oklch(0.58 0.16 ${(h + 55) % 360}))`
}

let counter = 0
export function createAttachment(file: File): AttachmentItem {
  counter += 1
  const image = file.type.startsWith("image/")
  return {
    id: `att-${Date.now().toString(36)}-${counter}`,
    name: file.name,
    kind: image ? "image" : "file",
    size: file.size,
    type: file.type,
    previewUrl: image && typeof URL !== "undefined" ? URL.createObjectURL(file) : undefined,
    progress: 0,
    status: "queued",
    file,
  }
}

function useItemList(
  value: AttachmentItem[] | undefined,
  defaultValue: AttachmentItem[] | undefined,
  onValueChange: ((items: AttachmentItem[]) => void) | undefined
) {
  const [internal, setInternal] = React.useState<AttachmentItem[]>(defaultValue ?? [])
  const items = value ?? internal
  const latest = React.useRef(items)
  latest.current = items
  const cb = React.useRef(onValueChange)
  cb.current = onValueChange
  const controlled = value !== undefined
  const update = React.useCallback(
    (updater: (items: AttachmentItem[]) => AttachmentItem[]) => {
      const next = updater(latest.current)
      latest.current = next
      if (!controlled) setInternal(next)
      cb.current?.(next)
    },
    [controlled]
  )
  return [items, update] as const
}

function ProgressRing({ progress }: { progress: number }) {
  const r = 9
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 24 24" className="size-6 -rotate-90" aria-hidden>
      <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/35" />
      <motion.circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={false}
        animate={{ strokeDashoffset: c * (1 - Math.max(0.04, progress / 100)) }}
        transition={{ type: "spring", stiffness: 160, damping: 24 }}
      />
    </svg>
  )
}

function Thumb({ item, layout }: { item: AttachmentItem; layout: boolean }) {
  const status = item.status ?? "queued"
  return (
    <motion.span
      layoutId={layout ? `attachment-preview-${item.id}` : undefined}
      className={cn(
        "relative block size-full overflow-hidden rounded-[inherit] bg-cover bg-center",
        // Real photos get the 1px inset image outline (better-ui); generated gradients need none.
        item.previewUrl && "outline-1 -outline-offset-1 outline-foreground/10"
      )}
      style={{
        backgroundImage: item.previewUrl ? `url("${item.previewUrl}")` : attachmentGradient(item.name),
      }}
    >
      <AnimatePresence>
        {(status === "uploading" || status === "queued") && (
          <motion.span
            key="ring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/35"
          >
            <ProgressRing progress={item.progress ?? 0} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  )
}

function StatusMark({ status }: { status: AttachmentStatus }) {
  const l10n = useLocale().labels

  const reduce = useReducedMotion()
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {status === "success" && (
        <motion.span
          key="ok"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          className="inline-flex size-4 items-center justify-center rounded-full bg-success/14 text-success-text"
          aria-label={l10n.uploaded}
        >
          <CheckIcon size={10} />
        </motion.span>
      )}
      {status === "error" && (
        <motion.span
          key="err"
          initial={reduce ? { opacity: 0 } : { x: -4, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { x: [0, -3, 3, -2, 0], opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="inline-flex text-destructive-text"
          aria-label={l10n.toolFailed}
        >
          <AlertCircleIcon size={14} />
        </motion.span>
      )}
    </AnimatePresence>
  )
}

function AttachmentRow({
  item,
  delay,
  onRemove,
  onRetry,
  onPreview,
  previewing,
  disabled,
}: {
  item: AttachmentItem
  delay: number
  onRemove: (item: AttachmentItem) => void
  onRetry: (item: AttachmentItem) => void
  onPreview: (item: AttachmentItem) => void
  previewing: boolean
  disabled?: boolean
}) {
  const l10n = useLocale().labels

  const reduce = useReducedMotion()
  const status = item.status ?? (item.kind === "link" ? "success" : "queued")
  const progress = status === "success" ? 100 : Math.min(100, Math.max(0, item.progress ?? 0))
  const meta =
    item.kind === "link"
      ? item.href?.replace(/^https?:\/\//, "").replace(/\/$/, "")
      : status === "uploading"
        ? `${Math.round(progress)}% of ${formatBytes(item.size)}`
        : status === "queued"
          ? l10n.waitingSize(formatBytes(item.size))
          : status === "error"
            ? (item.error ?? l10n.uploadFailed)
            : formatBytes(item.size)

  return (
    <motion.li
      layout={!reduce}
      data-slot="attachment-row"
      data-kind={item.kind}
      data-status={status}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.96, filter: "blur(4px)", transition: { duration: 0.2, ease: EASE } }
      }
      transition={{ type: "spring", stiffness: 380, damping: 32, delay }}
      className={cn(
        "group/row relative flex items-center gap-3 overflow-hidden frame-inner frame-p-2 pr-1.5 transition-colors duration-150 hover:bg-secondary"
      )}
    >
      {item.kind === "image" ? (
        <button
          type="button"
          onClick={() => onPreview(item)}
          aria-label={l10n.previewNamed(item.name)}
          className="relative size-11 shrink-0 cursor-zoom-in rounded-inner outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {!previewing && <Thumb item={item} layout={!reduce} />}
        </button>
      ) : (
        <span
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-inner transition-colors",
            status === "error" ? "bg-destructive/8 text-destructive-text" : "bg-muted text-muted-foreground"
          )}
        >
          {item.kind === "link" ? <GlobeIcon size={18} /> : <FileIcon size={18} />}
        </span>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          {item.kind === "link" && item.href ? (
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="truncate text-ui font-medium underline-offset-4 outline-none hover:underline focus-visible:underline"
            >
              {item.name}
            </a>
          ) : (
            <span className="truncate text-ui font-medium" title={item.name}>
              {item.name}
            </span>
          )}
          <StatusMark status={status} />
        </div>
        <span
          className={cn("truncate text-ui-sm tabular-nums", status === "error" ? "text-destructive-text" : "text-muted-foreground")}
        >
          {meta}
        </span>
        {item.kind === "file" && (status === "uploading" || status === "queued") && (
          <div
            role="progressbar"
            aria-label={l10n.uploadingNamed(item.name)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            className="relative mt-0.5 h-1 w-full overflow-hidden rounded-full bg-foreground/8"
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              initial={false}
              animate={{ width: `${Math.max(3, progress)}%` }}
              transition={{ type: "spring", stiffness: 170, damping: 26 }}
            />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center">
        {status === "error" && (
          <button
            type="button"
            className={iconButton}
            onClick={() => onRetry(item)}
            disabled={disabled}
            aria-label={l10n.retryNamed(item.name)}
          >
            <RefreshIcon size={15} />
          </button>
        )}
        <button
          type="button"
          className={cn(iconButton, "sm:opacity-0 sm:group-hover/row:opacity-100 sm:focus-visible:opacity-100", status === "error" && "sm:opacity-100")}
          onClick={() => onRemove(item)}
          disabled={disabled}
          aria-label={l10n.removeNamed(item.name)}
        >
          <XIcon size={15} />
        </button>
      </div>
    </motion.li>
  )
}

export function AttachmentUpload({
  value,
  defaultValue,
  onValueChange,
  upload,
  onFilesAdded,
  onFilesRejected,
  onRemove,
  onRetry,
  accept,
  multiple = true,
  maxFiles,
  maxFileSize,
  disabled = false,
  title,
  description,
  label,
  className,
}: AttachmentUploadProps) {
  const l10n = useLocale().labels
  if (title === undefined) title = l10n.dragFilesHere
  if (description === undefined) description = l10n.imagesDocumentsAndArchives
  if (label === undefined) label = l10n.attachments

  const reduce = useReducedMotion()
  const [items, setItems] = useItemList(value, defaultValue, onValueChange)
  const [dragging, setDragging] = React.useState(false)
  const [previewId, setPreviewId] = React.useState<string | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const depth = React.useRef(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const staggers = React.useRef(new Map<string, number>())
  const controllers = React.useRef(new Map<string, AbortController>())
  const uploadRef = React.useRef(upload)
  uploadRef.current = upload

  const patch = React.useCallback(
    (id: string, next: Partial<AttachmentItem>) =>
      setItems((all) => all.map((it) => (it.id === id ? { ...it, ...next } : it))),
    [setItems]
  )

  const start = React.useCallback(
    (item: AttachmentItem) => {
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
          const message = err instanceof Error ? err.message : l10n.uploadFailed
          patch(item.id, { status: "error", error: message })
          setAnnouncement(`${item.name} failed`)
        })
        .finally(() => {
          if (controllers.current.get(item.id) === controller) controllers.current.delete(item.id)
        })
    },
    [patch]
  )

  React.useEffect(() => {
    if (!upload) return
    for (const item of items) {
      if (item.kind === "link") continue
      const status = item.status ?? "queued"
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

  const addFiles = (list: FileList | null) => {
    if (!list || disabled) return
    let files = Array.from(list)
    if (!multiple) files = files.slice(0, 1)
    if (maxFileSize !== undefined) {
      const tooLarge = files.filter((f) => f.size > maxFileSize)
      if (tooLarge.length) {
        onFilesRejected?.(tooLarge, "too-large")
        setAnnouncement(l10n.filesTooLarge(tooLarge.length, formatBytes(maxFileSize)))
      }
      files = files.filter((f) => f.size <= maxFileSize)
    }
    if (maxFiles !== undefined) {
      const room = Math.max(0, maxFiles - items.length)
      if (files.length > room) {
        onFilesRejected?.(files.slice(room), "max-files")
        files = files.slice(0, room)
      }
    }
    if (!files.length) return
    const created = files.map(createAttachment)
    created.forEach((it, i) => staggers.current.set(it.id, i * 0.06))
    setItems((all) => (multiple ? [...all, ...created] : created))
    onFilesAdded?.(created, files)
    setAnnouncement(`${created.length} attachment${created.length === 1 ? "" : "s"} added`)
  }

  const remove = (item: AttachmentItem) => {
    controllers.current.get(item.id)?.abort()
    controllers.current.delete(item.id)
    if (item.file && item.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl)
    setItems((all) => all.filter((it) => it.id !== item.id))
    onRemove?.(item)
    setAnnouncement(`${item.name} removed`)
  }

  const retry = (item: AttachmentItem) => {
    onRetry?.(item)
    staggers.current.set(item.id, 0)
    if (uploadRef.current) start(item)
    else patch(item.id, { status: "queued", progress: 0, error: undefined })
  }

  const full = maxFiles !== undefined && items.length >= maxFiles
  const inactive = disabled || full
  const compact = items.length > 0
  const preview = items.find((i) => i.id === previewId) ?? null
  const uploading = items.filter((i) => i.status === "uploading" || i.status === "queued").length

  return (
    <LayoutGroup>
      <div
        data-slot="attachment-upload"
        className={cn(
          "flex w-full flex-col gap-3 frame-3xl frame-p-2 bg-card shadow-raised",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2 px-2.5 pt-1.5">
          <div className="flex items-center gap-2 text-ui font-medium">
            <AttachIcon size={16} className="text-muted-foreground" />
            {label}
            {items.length > 0 && (
              <span className="text-ui-sm text-muted-foreground tabular-nums">
                {items.length}
              </span>
            )}
          </div>
          <span className="text-ui-sm text-muted-foreground tabular-nums" aria-hidden>
            {uploading > 0 ? l10n.uploadingCount(uploading) : items.length > 0 ? l10n.allSynced : ""}
          </span>
        </div>

        <motion.div
          layout={!reduce}
          data-slot="attachment-dropzone"
          data-dragging={dragging || undefined}
          onDragEnter={(e) => {
            e.preventDefault()
            if (inactive) return
            depth.current += 1
            setDragging(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = inactive ? "none" : "copy"
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            depth.current = Math.max(0, depth.current - 1)
            if (!depth.current) setDragging(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            depth.current = 0
            setDragging(false)
            if (!inactive) addFiles(e.dataTransfer.files)
          }}
          onClick={() => !inactive && inputRef.current?.click()}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className={cn(
            // Borderless well: a soft fill, the card's hairline is the only edge. A dashed
            // hairline appears only while files are dragged over it.
            "relative flex bg-muted transition-[background-color,outline-color] duration-150 ease-out",
            "outline-1 -outline-offset-1 outline-transparent outline-dashed",
            // compact: p-1.5 inset, so the Add button follows the well concentrically (14 − 6 = 8px)
            compact
              ? "frame-inner frame-p-1.5 items-center gap-2.5 pl-3"
              : "rounded-inner flex-col items-center gap-2 px-6 py-8 text-center",
            inactive ? "opacity-64" : "cursor-pointer hover:bg-foreground/6",
            dragging && "bg-primary/6 outline-primary/40 hover:bg-primary/6"
          )}
        >
          <motion.span
            layout={!reduce}
            animate={reduce ? undefined : { y: dragging ? -3 : 0 }}
            className={cn(
              "inline-flex shrink-0 items-center justify-center transition-colors duration-150",
              dragging ? "text-primary-text" : "text-muted-foreground"
            )}
          >
            <UploadIcon size={compact ? 16 : 22} />
          </motion.span>
          <motion.div layout={!reduce ? "position" : false} className="flex min-w-0 flex-1 flex-col">
            <span className="text-ui font-medium">{dragging ? l10n.releaseToAttach : full ? l10n.attachmentLimitReached : title}</span>
            {!compact && (
              <span className="text-ui-sm text-muted-foreground">
                {description}
                {maxFileSize !== undefined && ` · up to ${formatBytes(maxFileSize)} each`}
              </span>
            )}
          </motion.div>
          <input
            ref={inputRef}
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
          <motion.button
            layout={!reduce ? "position" : false}
            type="button"
            disabled={inactive}
            onClick={(e) => {
              e.stopPropagation()
              inputRef.current?.click()
            }}
            className={cn(
              "inline-flex shrink-0 cursor-pointer items-center gap-1 pr-3 pl-2 text-ui font-medium text-foreground transition-colors duration-150 ease-out outline-none hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none",
              // empty state: a quiet secondary fill, still no ring of its own
              compact ? "h-8 rounded-inner" : "mt-1 h-8 rounded-lg bg-foreground/6 hover:bg-foreground/10"
            )}
          >
            <PlusIcon size={14} />
            {compact ? l10n.add : l10n.chooseFiles}
          </motion.button>
        </motion.div>

        {items.length > 0 && (
          <ul data-slot="attachment-list" aria-label={label} className="flex flex-col gap-0.5">
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((item) => (
                <AttachmentRow
                  key={item.id}
                  item={item}
                  delay={staggers.current.get(item.id) ?? 0}
                  onRemove={remove}
                  onRetry={retry}
                  onPreview={(it) => setPreviewId(it.id)}
                  previewing={previewId === item.id}
                  disabled={disabled}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}

        <span aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </div>

      <DialogPrimitive.Root open={preview !== null} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/45 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <DialogPrimitive.Popup
            className="fixed inset-0 z-50 flex items-center justify-center p-6 outline-none"
            onClick={(e) => e.target === e.currentTarget && setPreviewId(null)}
          >
            {preview && (
              <div className="flex w-full max-w-lg flex-col gap-3">
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl shadow-surface">
                  <Thumb item={preview} layout={!reduce} />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.25, ease: EASE }}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-popover px-4 py-2.5 text-popover-foreground shadow-surface"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <ImageIcon size={16} className="shrink-0 text-muted-foreground" />
                    <DialogPrimitive.Title className="truncate text-ui font-medium">{preview.name}</DialogPrimitive.Title>
                    <span className="tabular-nums shrink-0 text-ui-sm text-muted-foreground">{formatBytes(preview.size)}</span>
                  </div>
                  <DialogPrimitive.Close aria-label={l10n.closePreview} className={iconButton}>
                    <XIcon size={15} />
                  </DialogPrimitive.Close>
                </motion.div>
              </div>
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </LayoutGroup>
  )
}
