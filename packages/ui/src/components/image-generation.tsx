"use client"

import * as React from "react"
import { useLocale, localeLabels, type LocaleLabels } from "@paneui/ui/components/locale-provider"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { AlertCircleIcon, CheckIcon, ClockIcon, DownloadIcon, RefreshIcon, SparklesIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { AGENT_EASE, AgentCopyButton, AgentIconButton } from "@paneui/ui/components/tool-result"

type ImageGenerationStatus = "queued" | "generating" | "refining" | "complete" | "error"

const DEFAULT_PROGRESS: Record<ImageGenerationStatus, number> = {
  queued: 0,
  generating: 0.3,
  refining: 0.75,
  complete: 1,
  error: 0,
}

function getStatusText(l10n: LocaleLabels = localeLabels.en): Record<ImageGenerationStatus, string> {
  return ({
  queued: l10n.queued,
  generating: l10n.generating,
  refining: l10n.refiningDetails,
  complete: l10n.ready,
  error: l10n.generationFailed,
})
}


// Fine film grain from an SVG turbulence filter; tiled and jittered while working.
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1.6 -0.35'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const IMAGE_GEN_CSS =
  "@keyframes qy-grain{0%{background-position:0 0}20%{background-position:-40px 30px}40%{background-position:25px -55px}60%{background-position:-60px -15px}80%{background-position:45px 60px}100%{background-position:0 0}}" +
  "@keyframes qy-sweep{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}" +
  "@keyframes qy-dots{0%,100%{opacity:.35}50%{opacity:.8}}" +
  "@media (prefers-reduced-motion: reduce){[data-slot=image-generation] *{animation:none!important}}"

type ImageGenerationProps = Omit<React.ComponentProps<"figure">, "children"> & {
  /** The generated media (img, canvas, svg...). Rendered from the start so it can refine in place. */
  children?: React.ReactNode
  status?: ImageGenerationStatus
  /** 0–1. Drives the blur/noise reveal; derived from status when omitted. */
  progress?: number
  prompt?: string
  /** Small meta line, e.g. `1024 × 1024 · v6`. */
  meta?: React.ReactNode
  /** Queue position shown while queued. */
  queuePosition?: number
  aspectRatio?: React.CSSProperties["aspectRatio"]
  onRetry?: () => void
  onDownload?: () => void
  /** Message in the frame when `status` is `error`. */
  errorText?: React.ReactNode
  /** Label of the error frame's retry button (shown with `onRetry`). */
  retryLabel?: React.ReactNode
  /** Accessible description of the finished image. */
  alt?: string
  mediaClassName?: string
}

/**
 * Generated-image surface with a fixed frame: queued (breathing dot grid) →
 * generating (grain + heavy blur + scan sweep) → refining (blur and grain
 * fading with progress) → complete (sharp, with actions). No layout shift.
 */
function ImageGeneration({
  children,
  status = "generating",
  progress: progressProp,
  prompt,
  meta,
  queuePosition,
  aspectRatio = "1 / 1",
  onRetry,
  onDownload,
  errorText,
  retryLabel,
  alt,
  className,
  mediaClassName,
  ...props
}: ImageGenerationProps) {
  const l10n = useLocale().labels
  const STATUS_TEXT = getStatusText(l10n)

  if (errorText === undefined) errorText = l10n.couldntFinishThisImage
  if (retryLabel === undefined) retryLabel = l10n.tryAgain

  const reduce = useReducedMotion()
  const progress = Math.min(1, Math.max(0, progressProp ?? DEFAULT_PROGRESS[status]))
  const working = status === "queued" || status === "generating" || status === "refining"
  const complete = status === "complete"
  const showMedia = status !== "queued" && status !== "error"
  // Reveal curve: heavy blur early, settling quickly as progress rises.
  const blur = complete ? 0 : Math.round(28 * Math.pow(1 - progress, 1.6) + 2)
  const grain = complete ? 0 : status === "queued" ? 0 : 0.15 + 0.55 * (1 - progress)
  const pct = Math.round(progress * 100)

  return (
    <figure
      data-slot="image-generation"
      data-status={status}
      aria-busy={working}
      className={cn("flex w-full max-w-sm flex-col gap-2.5", className)}
      {...props}
    >
      <style href="qy-image-generation" precedence="default">
        {IMAGE_GEN_CSS}
      </style>
      <div
        className="relative isolate w-full overflow-hidden rounded-2xl bg-muted shadow-well"
        style={{ aspectRatio }}
        role="img"
        aria-label={complete ? (alt ?? prompt ?? l10n.generatedImage) : `${STATUS_TEXT[status]}${working ? `, ${pct}%` : ""}`}
      >
        {/* Media refines in place */}
        <motion.div
          aria-hidden
          className={cn("absolute inset-0 [&>*]:size-full [&>img]:object-cover", mediaClassName)}
          initial={false}
          animate={{
            opacity: showMedia ? (complete ? 1 : 0.35 + 0.65 * progress) : 0,
            filter: `blur(${blur}px) saturate(${complete ? 1 : 0.7 + 0.3 * progress})`,
            scale: reduce || complete ? 1 : 1.04 - 0.04 * progress,
          }}
          transition={{ duration: reduce ? 0 : complete ? 0.9 : 0.6, ease: AGENT_EASE }}
        >
          {children}
        </motion.div>

        {/* Queued: breathing dot grid */}
        <AnimatePresence>
          {status === "queued" ? (
            <motion.div
              key="dots"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 text-muted-foreground"
              style={{
                backgroundImage: "radial-gradient(currentColor 1px, transparent 1.4px)",
                backgroundSize: "14px 14px",
                animation: "qy-dots 2.4s cubic-bezier(0.45,0,0.55,1) infinite",
                maskImage: "radial-gradient(circle at center, black 20%, transparent 75%)",
              }}
            />
          ) : null}
        </AnimatePresence>

        {/* Grain */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-16 mix-blend-overlay dark:mix-blend-soft-light"
          initial={false}
          animate={{ opacity: grain }}
          transition={{ duration: reduce ? 0 : 0.6 }}
          style={{ backgroundImage: NOISE, animation: "qy-grain 0.9s steps(5) infinite" }}
        />

        {/* Scan sweep while generating */}
        {status === "generating" || status === "refining" ? (
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-x-0 h-full bg-linear-to-b from-transparent via-foreground/8 to-transparent"
              style={{ animation: `qy-sweep ${status === "refining" ? 2.6 : 1.8}s cubic-bezier(0.45,0,0.55,1) infinite` }}
            />
          </div>
        ) : null}

        {/* Error */}
        {status === "error" ? (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div className="flex flex-col items-center gap-2 text-ui text-muted-foreground">
              <AlertCircleIcon className="size-5 text-destructive-text" />
              {errorText}
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-1 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-card px-3 text-ui-sm font-medium text-secondary-foreground shadow-raised transition-[box-shadow,background-color,scale] duration-150 ease-out outline-none hover:bg-accent hover:shadow-raised-hover focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <RefreshIcon className="size-3.5" />
                  {retryLabel}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Status chip */}
        <div className="absolute top-2.5 left-2.5 flex items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={complete ? "done" : status}
              role="status"
              initial={{ opacity: 0, y: reduce ? 0 : -4, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: reduce ? 0 : 4, filter: "blur(2px)" }}
              transition={{ duration: 0.25, ease: AGENT_EASE }}
              className="inline-flex h-6 items-center gap-1.5 rounded-control-sm bg-popover/85 px-2 text-ui-xs font-medium text-popover-foreground shadow-chip backdrop-blur-md [&_svg]:size-3"
            >
              {complete ? (
                <CheckIcon className="text-success-text" />
              ) : status === "queued" ? (
                <ClockIcon className="text-muted-foreground" />
              ) : status === "error" ? (
                <AlertCircleIcon className="text-destructive-text" />
              ) : (
                <SparklesIcon className="text-primary-text" />
              )}
              {status === "queued" && queuePosition ? l10n.queuedPosition(queuePosition) : STATUS_TEXT[status]}
              {status === "generating" || status === "refining" ? (
                <span className="font-mono text-muted-foreground tabular-nums">{pct}%</span>
              ) : null}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {prompt || meta || complete ? (
        <figcaption className="flex items-start gap-2 px-0.5">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {prompt ? <p className="line-clamp-2 text-ui leading-snug text-foreground/90">{prompt}</p> : null}
            {meta ? <p className="text-ui-sm text-muted-foreground">{meta}</p> : null}
          </div>
          <motion.div
            className="flex shrink-0 items-center"
            initial={false}
            animate={{ opacity: complete ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: AGENT_EASE }}
            aria-hidden={!complete}
            inert={!complete}
          >
            {prompt ? <AgentCopyButton value={prompt} label={l10n.copyPrompt} /> : null}
            {onRetry ? (
              <AgentIconButton label={l10n.generateAgain} onClick={onRetry}>
                <RefreshIcon />
              </AgentIconButton>
            ) : null}
            {onDownload ? (
              <AgentIconButton label={l10n.download} onClick={onDownload}>
                <DownloadIcon />
              </AgentIconButton>
            ) : null}
          </motion.div>
        </figcaption>
      ) : null}
    </figure>
  )
}

export { ImageGeneration, type ImageGenerationProps, type ImageGenerationStatus }
