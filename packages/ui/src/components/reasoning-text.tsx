"use client"

import { useLocale, localeLabels, type LocaleLabels } from "@paneui/ui/components/locale-provider"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"
import { TextCascade } from "@paneui/ui/components/text-cascade"
import { TextScramble } from "@paneui/ui/components/text-scramble"
import { TextShimmer } from "@paneui/ui/components/text-shimmer"

/** Terminal frame sets, the spinners CLI agents tick through. */
const SPINNER_FRAMES = {
  braille: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  dots: ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"],
  line: ["|", "/", "-", "\\"],
  star: ["✶", "✸", "✹", "✺", "✹", "✸"],
} as const

type AsciiSpinnerKind = keyof typeof SPINNER_FRAMES

type AsciiSpinnerProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Which frame set to cycle. */
  kind?: AsciiSpinnerKind
  /** Milliseconds per frame. */
  interval?: number
}

/** A monospace glyph that ticks through terminal spinner frames. Decorative. */
function AsciiSpinner({ kind = "braille", interval = 80, className, ...props }: AsciiSpinnerProps) {
  const reduce = useReducedMotion()
  const frames = SPINNER_FRAMES[kind]
  const [frame, setFrame] = React.useState(0)

  React.useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => setFrame((f) => (f + 1) % frames.length), interval)
    return () => window.clearInterval(id)
  }, [frames.length, interval, reduce])

  return (
    <span
      aria-hidden
      data-slot="ascii-spinner"
      className={cn(
        "inline-grid w-[1.1em] shrink-0 place-items-center font-mono leading-none text-primary-text",
        reduce && "animate-pulse",
        className
      )}
      {...props}
    >
      {frames[reduce ? 0 : frame]}
    </span>
  )
}

function getDefaultPhrases(l10n: LocaleLabels = localeLabels.en) {
  return ([l10n.thinking, l10n.readingTheContext, l10n.weighingTheOptions, l10n.draftingAReply])
}


type ReasoningTextMode = "swap" | "cascade" | "scramble"

type ReasoningTextProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Phrases cycled while the agent works. A single phrase never changes. */
  phrases?: string[]
  /** Transition used when the phrase changes. */
  mode?: ReasoningTextMode
  /** Milliseconds each phrase stays up. */
  interval?: number
  /** Controlled phrase index; when set, the component stops cycling on its own. */
  index?: number
  /** Seconds per shimmer sweep. */
  shimmerDuration?: number
  /** Leading glyph. Defaults to a braille ASCII spinner; pass `null` to hide. */
  indicator?: React.ReactNode
  /** Spinner frame set used by the default indicator. */
  spinner?: AsciiSpinnerKind
  /** Append an ellipsis to every phrase. */
  ellipsis?: boolean
}

const MASK_CSS =
  "@keyframes qy-reasoning-mask{from{mask-position:100% 0;-webkit-mask-position:100% 0}to{mask-position:0% 0;-webkit-mask-position:0% 0}}" +
  "@media (prefers-reduced-motion: reduce){[data-slot=reasoning-text-mask]{animation:none!important;mask-position:50% 0!important}}"

const SWAP_TRANSITION = { type: "spring", stiffness: 460, damping: 34, mass: 0.6 } as const

/**
 * Shimmering "the agent is reasoning" copy: an ASCII spinner and a phrase that
 * trades places by swap (blur roll), cascade (letter roll) or scramble.
 */
function ReasoningText({
  phrases,
  mode = "swap",
  interval = 2400,
  index,
  shimmerDuration = 1.8,
  indicator,
  spinner = "braille",
  ellipsis = true,
  className,
  ...props
}: ReasoningTextProps) {
  const l10n = useLocale().labels
  if (phrases === undefined) phrases = getDefaultPhrases(l10n)

  const reduce = useReducedMotion()
  const [internal, setInternal] = React.useState(0)
  const controlled = index !== undefined
  const count = phrases.length

  React.useEffect(() => {
    if (controlled || count < 2) return
    const id = window.setInterval(() => setInternal((i) => (i + 1) % count), interval)
    return () => window.clearInterval(id)
  }, [controlled, count, interval])

  const active = count ? ((controlled ? index! : internal) % count + count) % count : 0
  const phrase = (phrases[active] ?? "") + (ellipsis ? "…" : "")

  let body: React.ReactNode
  if (mode === "cascade") {
    // Letters are transformed layers, which background-clip:text cannot reach,
    // so the cascade shimmers through a moving mask instead.
    body = (
      <>
        <style href="qy-reasoning-mask" precedence="default">
          {MASK_CSS}
        </style>
        <span
          data-slot="reasoning-text-mask"
          className="inline-block text-foreground"
          style={{
            maskImage: "linear-gradient(100deg, rgb(0 0 0/0.5) 36%, #000 50%, rgb(0 0 0/0.5) 64%)",
            WebkitMaskImage: "linear-gradient(100deg, rgb(0 0 0/0.5) 36%, #000 50%, rgb(0 0 0/0.5) 64%)",
            maskSize: "250% 100%",
            WebkitMaskSize: "250% 100%",
            animation: `qy-reasoning-mask ${shimmerDuration}s cubic-bezier(0.45,0,0.55,1) infinite`,
          }}
        >
          <TextCascade text={phrase} />
        </span>
      </>
    )
  } else if (mode === "scramble") {
    body = (
      <TextShimmer duration={shimmerDuration}>
        <TextScramble value={phrase} />
      </TextShimmer>
    )
  } else {
    body = (
      <span className="relative inline-grid overflow-hidden align-bottom">
        <AnimatePresence initial={false} mode="popLayout">
          {/* design-check-ignore exit-subtle -- the status line rolls up out of its one-line slot; the travel is the effect */}
          <motion.span
            key={phrase}
            className="col-start-1 row-start-1 whitespace-pre"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: "70%", filter: "blur(4px)" }}
            animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-70%", filter: "blur(4px)" }}
            transition={reduce ? { duration: 0.15 } : SWAP_TRANSITION}
          >
            <TextShimmer duration={shimmerDuration}>{phrase}</TextShimmer>
          </motion.span>
        </AnimatePresence>
      </span>
    )
  }

  return (
    <span
      role="status"
      aria-live="polite"
      data-slot="reasoning-text"
      data-mode={mode}
      className={cn("inline-flex items-center gap-2 text-ui font-medium text-muted-foreground", className)}
      {...props}
    >
      {indicator === undefined ? <AsciiSpinner kind={spinner} /> : indicator}
      <span className="sr-only">{phrase}</span>
      <span aria-hidden className="min-w-0">
        {body}
      </span>
    </span>
  )
}

export { ReasoningText, AsciiSpinner, type ReasoningTextProps, type ReasoningTextMode, type AsciiSpinnerProps, type AsciiSpinnerKind }
