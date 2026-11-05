"use client"

import * as React from "react"
import { AnimatePresence, animate, motion, useReducedMotion, type AnimationPlaybackControls } from "motion/react"

import { CheckIcon, ChevronDownIcon, ShieldIcon, UndoIcon, WarningIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { ActionSwapRollText } from "@paneui/ui/components/action-swap-roll"
import { Button } from "@paneui/ui/components/button"
import { IconChip } from "@paneui/ui/components/icon-chip"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { AGENT_EASE, CodeHighlight, ToolStatusIcon, type CodeLanguage } from "@paneui/ui/components/tool-result"

type ToolApprovalDecision = "once" | "always" | "deny"
type ToolApprovalRisk = "low" | "medium" | "high"
/** What happened after an approval: the call is running, finished or failed. */
type ToolApprovalStatus = "running" | "done" | "failed"

const RISK: Record<ToolApprovalRisk, { label: "riskLow" | "riskMedium" | "riskHigh"; tone: "neutral" | "warning" | "destructive" }> = {
  low: { label: "riskLow", tone: "neutral" },
  medium: { label: "riskMedium", tone: "warning" },
  high: { label: "riskHigh", tone: "destructive" },
}
const HEIGHT_SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 0.6 } as const

function readRemembered(key?: string) {
  if (!key || typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(key) === "always"
  } catch {
    return false
  }
}

function writeRemembered(key: string | undefined, value: boolean) {
  if (!key || typeof window === "undefined") return
  try {
    if (value) window.localStorage.setItem(key, "always")
    else window.localStorage.removeItem(key)
  } catch {}
}

/**
 * Forget a remembered "Always allow": removes the `rememberKey` entry from
 * localStorage (the value is stored under the key itself). Use it when a
 * controlled parent resets `decision` from "always" to `null`, which on its own
 * does not clear the saved permission. Safe to call on the server or with an unset key.
 */
function forgetToolApproval(rememberKey: string | undefined) {
  writeRemembered(rememberKey, false)
}

/**
 * Animates a frame's height whenever `morphKey` changes: from the height it had
 * before the commit to the height of its new content, then back to `auto`.
 */
function useHeightMorph(morphKey: number, disabled: boolean | null) {
  const outerRef = React.useRef<HTMLDivElement>(null)
  const innerRef = React.useRef<HTMLDivElement>(null)
  const lastHeight = React.useRef(0)
  const controls = React.useRef<AnimationPlaybackControls | null>(null)

  // Track the settled height; the observer reports after layout, so inside the
  // layout effect below it still holds the height from before the commit.
  React.useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    lastHeight.current = el.offsetHeight
    if (typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => {
      lastHeight.current = el.offsetHeight
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  React.useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!morphKey || !outer || !inner) return
    const from = controls.current ? outer.offsetHeight : lastHeight.current
    const to = inner.offsetHeight
    controls.current?.stop()
    controls.current = null
    if (disabled || from === to || !from) {
      outer.style.height = ""
      return
    }
    outer.style.height = `${from}px`
    const run = animate(outer, { height: [from, to] }, HEIGHT_SPRING)
    controls.current = run
    run.then(() => {
      if (controls.current !== run) return
      controls.current = null
      outer.style.height = ""
    })
  }, [morphKey, disabled])

  return [outerRef, innerRef] as const
}

type ToolApprovalProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Tool identifier, e.g. `github.create_pull_request`. */
  tool: string
  /** The question while pending. Inline `<code>` is styled, e.g. ``Run `rm -rf dist`?``. */
  title?: React.ReactNode
  /** One line under the title while pending. Defaults to the tool identifier. */
  description?: React.ReactNode
  /** Text of the result line. Defaults to a string `title` without its question mark, else `tool`. */
  resultTitle?: React.ReactNode
  /** Icon in the tile. Defaults to a shield, or a warning sign for `risk="high"`. */
  icon?: React.ReactNode
  /** Arguments preview: an object is pretty-printed as JSON, a string is shown as-is. */
  args?: unknown
  /** Language for a string `args` preview (e.g. `bash` for a command). */
  argsLanguage?: CodeLanguage
  risk?: ToolApprovalRisk
  /** Controlled decision (`null` = pending). */
  decision?: ToolApprovalDecision | null
  defaultDecision?: ToolApprovalDecision | null
  onDecisionChange?: (decision: ToolApprovalDecision | null) => void
  /** Outcome of an approved call, shown on the result line. */
  status?: ToolApprovalStatus
  /** Show an Always allow button next to Approve. Defaults to on when `rememberKey` is set. */
  allowAlways?: boolean
  /**
   * localStorage key that remembers "Always allow" across sessions. When it is
   * already set, the item mounts as approved and `onDecisionChange("always")` fires.
   * Only Revoke clears it; a controlled parent resetting `decision` to `null` must
   * call `forgetToolApproval(rememberKey)` itself.
   */
  rememberKey?: string
  /**
   * Show Undo (after Approve / Deny) and Revoke (after Always allow) on the
   * result line until a `status` arrives. Only Revoke clears the `rememberKey` entry.
   */
  revocable?: boolean
  /** Show the arguments while pending, on mount and whenever the decision returns to `null`. */
  defaultArgsOpen?: boolean
}

/**
 * Human-in-the-loop permission request: a compact row with Deny and Approve
 * that collapses into a single tool line showing the outcome.
 */
function ToolApproval({
  tool,
  title: titleProp,
  description,
  resultTitle,
  icon,
  args,
  argsLanguage = "bash",
  risk = "medium",
  decision: decisionProp,
  defaultDecision = null,
  onDecisionChange,
  status,
  allowAlways,
  rememberKey,
  revocable = true,
  defaultArgsOpen = false,
  className,
  ...props
}: ToolApprovalProps) {
  const { labels } = useLocale()
  const title = titleProp ?? labels.allowToolQuestion
  const reduce = useReducedMotion()
  const argsId = React.useId()
  const [internal, setInternal] = React.useState<ToolApprovalDecision | null>(defaultDecision)
  const decision = decisionProp !== undefined ? decisionProp : internal
  const pending = decision == null
  const [argsOpen, setArgsOpen] = React.useState(defaultArgsOpen && pending)
  const onChangeRef = React.useRef(onDecisionChange)
  onChangeRef.current = onDecisionChange

  // The frame animates its height only while the content swaps (request row ↔
  // result line, arguments shown ↔ hidden); otherwise it stays `auto`.
  const [morphKey, setMorphKey] = React.useState(0)
  const [outerRef, innerRef] = useHeightMorph(morphKey, reduce)
  const [skipMorph, setSkipMorph] = React.useState(false)

  // Follow the decision, controlled or not: resolving folds the arguments,
  // going back to pending (Undo, or a parent resetting `decision` to null)
  // reopens them as `defaultArgsOpen` says.
  const [prevDecision, setPrevDecision] = React.useState(decision)
  if (decision !== prevDecision) {
    setPrevDecision(decision)
    setArgsOpen(decision == null ? defaultArgsOpen : false)
    if ((decision == null) !== (prevDecision == null)) {
      if (skipMorph) setSkipMorph(false)
      else setMorphKey((k) => k + 1)
    }
  }

  const toggleArgs = () => {
    setMorphKey((k) => k + 1)
    setArgsOpen((open) => !open)
  }

  const decide = React.useCallback(
    (next: ToolApprovalDecision | null) => {
      if (decisionProp === undefined) setInternal(next)
      if (next === "always") writeRemembered(rememberKey, true)
      // Only revoking an "Always allow" forgets it; undoing Approve or Deny
      // leaves a permission saved earlier alone.
      if (next === null && decision === "always") writeRemembered(rememberKey, false)
      onChangeRef.current?.(next)
    },
    [decision, decisionProp, rememberKey]
  )

  // Remembered permission from an earlier session: resolve without the morph.
  React.useEffect(() => {
    if (pending && readRemembered(rememberKey)) {
      setSkipMorph(true)
      if (decisionProp === undefined) setInternal("always")
      onChangeRef.current?.("always")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rememberKey])

  const argsText = React.useMemo(() => {
    if (args == null) return null
    return typeof args === "string" ? args : JSON.stringify(args, null, 2)
  }, [args])
  const argsLang: CodeLanguage = typeof args === "string" ? argsLanguage : "json"
  const riskInfo = RISK[risk]
  const showAlways = allowAlways ?? rememberKey != null
  const tileIcon = icon ?? (risk === "high" ? <WarningIcon /> : <ShieldIcon />)
  const lineTitle =
    resultTitle ??
    (titleProp === undefined ? tool : typeof titleProp === "string" ? titleProp.replace(/\s*[?？]$/, "") : titleProp)

  const outcome = pending ? null : decision === "deny" ? "denied" : (status ?? (decision === "always" ? "always" : "approved"))
  const OUTCOME: Record<NonNullable<typeof outcome>, { label: string; tone: string; icon: React.ReactNode }> = {
    approved: { label: labels.approved, tone: "text-success-text", icon: <CheckIcon className="size-3.5" /> },
    always: { label: labels.alwaysAllowed, tone: "text-success-text", icon: <CheckIcon className="size-3.5" /> },
    running: { label: labels.toolRunning, tone: "text-primary-text", icon: <ToolStatusIcon status="running" /> },
    done: { label: labels.toolDone, tone: "text-success-text", icon: <ToolStatusIcon status="success" /> },
    failed: { label: labels.toolFailed, tone: "text-destructive-text", icon: <ToolStatusIcon status="error" /> },
    denied: { label: labels.denied, tone: "text-muted-foreground", icon: <ToolStatusIcon status="cancelled" /> },
  }

  const enter = { opacity: 0 }
  const fadeIn = { duration: reduce ? 0.15 : 0.22, ease: AGENT_EASE, delay: reduce ? 0 : 0.04 }
  const fadeOut = { duration: 0.12, ease: AGENT_EASE }

  return (
    <div
      role="group"
      data-slot="tool-approval"
      data-decision={decision ?? "pending"}
      data-status={pending ? undefined : (status ?? undefined)}
      className={cn(
        "@container/tool-approval frame-3xl frame-inset-2 w-full overflow-hidden bg-card text-ui text-foreground ring-1 ring-border ring-inset",
        className
      )}
      {...props}
      aria-label={props["aria-label"] ?? labels.permissionRequest(tool)}
    >
      <div ref={outerRef} className="relative overflow-hidden">
        <div ref={innerRef} className="relative p-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {pending ? (
              <motion.div
                key="request"
                data-slot="tool-approval-request"
                initial={enter}
                animate={{ opacity: 1, transition: fadeIn }}
                exit={{ opacity: 0, transition: fadeOut }}
                className="flex flex-col"
              >
                <div
                  className={cn(
                    "flex flex-col gap-2",
                    // Three buttons need a wider row before the actions sit beside the text.
                    showAlways
                      ? "@lg/tool-approval:flex-row @lg/tool-approval:items-center @lg/tool-approval:gap-3"
                      : "@sm/tool-approval:flex-row @sm/tool-approval:items-center @sm/tool-approval:gap-3"
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <IconChip tone={riskInfo.tone} className="rounded-inner">
                      {tileIcon}
                    </IconChip>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span
                        data-slot="tool-approval-title"
                        className="font-medium text-pretty [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:py-px [&_code]:font-mono [&_code]:text-ui-sm"
                      >
                        {title}
                      </span>
                      <span
                        data-slot="tool-approval-description"
                        className={cn("text-ui-sm text-pretty text-muted-foreground", description == null && "truncate font-mono")}
                      >
                        {description ?? tool}
                        <span className="sr-only">. {labels[riskInfo.label]}.</span>
                      </span>
                    </div>
                    {argsText ? (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-expanded={argsOpen}
                        aria-controls={argsOpen ? argsId : undefined}
                        aria-label={argsOpen ? labels.hideArguments : labels.showArguments}
                        title={argsOpen ? labels.hideArguments : labels.showArguments}
                        onClick={toggleArgs}
                        className="text-muted-foreground"
                      >
                        <ChevronDownIcon
                          className={cn(
                            "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                            argsOpen && "rotate-180"
                          )}
                        />
                      </Button>
                    ) : null}
                  </div>
                  <div
                    data-slot="tool-approval-actions"
                    className={cn(
                      "ms-10 flex shrink-0 flex-wrap items-center gap-1.5",
                      showAlways ? "@lg/tool-approval:ms-0" : "@sm/tool-approval:ms-0"
                    )}
                  >
                    <Button size="sm" variant="outline" onClick={() => decide("deny")}>
                      {labels.deny}
                    </Button>
                    {showAlways ? (
                      <Button size="sm" variant="secondary" onClick={() => decide("always")}>
                        {labels.alwaysAllow}
                      </Button>
                    ) : null}
                    <Button size="sm" onClick={() => decide("once")}>
                      {labels.approve}
                    </Button>
                  </div>
                </div>
                <AnimatePresence mode="popLayout" initial={false}>
                  {argsText && argsOpen ? (
                    <motion.div
                      key="args"
                      id={argsId}
                      data-slot="tool-approval-args"
                      initial={enter}
                      animate={{ opacity: 1, transition: fadeIn }}
                      exit={{ opacity: 0, transition: fadeOut }}
                      className="mt-2 max-h-52 w-full overflow-auto rounded-inner bg-code p-3 shadow-well scrollbar-thin"
                    >
                      <CodeHighlight code={argsText} language={argsLang} wrap />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                data-slot="tool-approval-result"
                initial={enter}
                animate={{ opacity: 1, transition: fadeIn }}
                exit={{ opacity: 0, transition: fadeOut }}
                className="flex min-h-6 w-full items-center gap-2"
              >
                <IconChip size="sm" className="rounded-inner">
                  {tileIcon}
                </IconChip>
                <span className="flex min-w-0 flex-1 items-baseline gap-2">
                  <span className="max-w-full shrink-0 truncate font-medium [&_code]:font-mono [&_code]:text-ui-sm">{lineTitle}</span>
                  {lineTitle !== tool ? (
                    <span className="hidden min-w-0 truncate font-mono text-ui-xs text-muted-foreground @sm/tool-approval:inline">
                      {tool}
                    </span>
                  ) : null}
                </span>
                {outcome ? (
                  <span
                    role="status"
                    className={cn("inline-flex shrink-0 items-center gap-1 text-ui-sm font-medium", OUTCOME[outcome].tone)}
                  >
                    {OUTCOME[outcome].icon}
                    <ActionSwapRollText value={outcome}>{OUTCOME[outcome].label}</ActionSwapRollText>
                  </span>
                ) : null}
                {revocable && status == null ? (
                  <Button size="xs" variant="ghost" onClick={() => decide(null)} className="rounded-inner text-muted-foreground">
                    <UndoIcon className="rtl:-scale-x-100" data-icon="inline-start" />
                    {decision === "always" ? labels.revoke : labels.undo}
                  </Button>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export {
  ToolApproval,
  forgetToolApproval,
  type ToolApprovalProps,
  type ToolApprovalDecision,
  type ToolApprovalRisk,
  type ToolApprovalStatus,
}
