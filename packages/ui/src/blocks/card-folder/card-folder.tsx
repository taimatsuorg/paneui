"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { CopyIcon, EyeIcon, EyeOffIcon, MoreHorizontalIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"

export interface CardFolderProps {
  /** Label above the pocket, e.g. "Business card". */
  title: string
  /** Name printed on the card face. */
  holder?: string
  /** Brand or issuer printed top-left on the card. */
  brand?: string
  cardNumber: string
  expiry: string
  cvv: string
  /** Replace the default card art (rendered behind the details). */
  card?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  detailsVisible?: boolean
  defaultDetailsVisible?: boolean
  onDetailsVisibleChange?: (visible: boolean) => void
  /** Overflow action (e.g. open a menu). Hidden when omitted. */
  onAction?: () => void
  actionLabel?: string
  /** Called with the full number when the copy button is pressed. Hidden when omitted. */
  onCopy?: (cardNumber: string) => void
  disabled?: boolean
  className?: string
  cardClassName?: string
}

const SPRING = { type: "spring", stiffness: 340, damping: 26, mass: 0.9 } as const
const iconButton =
  "inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-96 disabled:pointer-events-none disabled:opacity-50"

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value !== undefined ? value : internal
  const set = (next: T) => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }
  return [current, set] as const
}

function groups(number: string) {
  return number.replace(/\D/g, "").match(/.{1,4}/g) ?? []
}

function Swap({ visible, shown, hidden, className }: { visible: boolean; shown: string; hidden: string; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <span className={cn("relative inline-grid", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={visible ? "shown" : "hidden"}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="col-start-1 row-start-1 whitespace-nowrap"
        >
          {visible ? shown : hidden}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function DefaultArt() {
  return (
    <span
      aria-hidden
      className="absolute inset-0 bg-primary"
    >
      <span className="absolute -right-10 -bottom-16 size-48 rounded-full border-[18px] border-primary-foreground/10" />
      <span className="absolute -right-2 -bottom-24 size-48 rounded-full border-[18px] border-primary-foreground/6" />
    </span>
  )
}

export function CardFolder({
  title,
  holder,
  brand,
  cardNumber,
  expiry,
  cvv,
  card,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  detailsVisible: detailsProp,
  defaultDetailsVisible = false,
  onDetailsVisibleChange,
  onAction,
  actionLabel,
  onCopy,
  disabled = false,
  className,
  cardClassName,
}: CardFolderProps) {
  const l10n = useLocale().labels
  if (brand === undefined) brand = l10n.debit
  if (actionLabel === undefined) actionLabel = l10n.moreOptions

  const reduce = useReducedMotion()
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const [details, setDetails] = useControllable(detailsProp, defaultDetailsVisible, onDetailsVisibleChange)
  const parts = groups(cardNumber)
  const last4 = parts.at(-1) ?? ""
  const masked = [...parts.slice(0, -1).map(() => "••••"), last4].join(" ")
  const full = parts.join(" ")

  return (
    <div data-slot="card-folder" data-open={open || undefined} className={cn("flex w-80 flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-ui font-medium">{title}</span>
          <span className="text-ui-sm text-muted-foreground tabular-nums">
            {brand} ·· {last4}
          </span>
        </div>
        <div className="flex items-center">
          {onCopy && (
            <button
              type="button"
              className={iconButton}
              disabled={disabled}
              onClick={() => onCopy(parts.join(""))}
              aria-label={l10n.copyCardNumber}
            >
              <CopyIcon size={15} />
            </button>
          )}
          <button
            type="button"
            className={iconButton}
            disabled={disabled}
            aria-pressed={details}
            aria-label={details ? l10n.hideCardDetails : l10n.showCardDetails}
            onClick={() => setDetails(!details)}
          >
            {details ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
          {onAction && (
            <button type="button" className={iconButton} disabled={disabled} onClick={onAction} aria-label={actionLabel}>
              <MoreHorizontalIcon size={16} />
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-label={open ? l10n.tuckCard(title) : l10n.pullCard(title)}
        onClick={() => setOpen(!open)}
        className="group/pocket relative h-60 w-full cursor-pointer rounded-[min(calc(var(--radius)*2.8),var(--radius-max))] outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
      >
        {/* Inside of the pocket */}
        <span aria-hidden className="absolute inset-x-0 top-10 bottom-0 rounded-[min(calc(var(--radius)*2.8),var(--radius-max))] bg-muted shadow-well" />

        {/* The card */}
        <motion.span
          className={cn(
            "absolute top-5 left-1/2 block aspect-[1.586] w-[17.5rem] overflow-hidden rounded-2xl text-start text-primary-foreground shadow-raised",
            cardClassName
          )}
          initial={false}
          animate={
            reduce
              ? undefined
              : {
                  y: open ? -10 : 0,
                  scale: open ? 1.035 : 1,
                  boxShadow: open
                    ? "0 0 0 1px rgb(0 0 0 / 0.06), 0 16px 28px -14px rgb(0 0 0 / 0.28)"
                    : "0 0 0 1px rgb(0 0 0 / 0.06), 0 1px 2px rgb(0 0 0 / 0.06)",
                }
          }
          transition={{ ...SPRING, delay: open ? 0.04 : 0 }}
          style={{ x: "-50%" }}
        >
          {card ?? <DefaultArt />}
          <span className="relative flex size-full flex-col justify-between p-4">
            <span className="flex items-start justify-between">
              <span className="text-ui font-semibold tracking-wide">{brand}</span>
              <span aria-hidden className="h-6 w-8 rounded-md bg-warning/90" />
            </span>
            <span className="flex flex-col gap-2">
              <Swap
                visible={details}
                shown={full}
                hidden={masked}
                className="font-mono text-[1.05rem] tracking-[0.12em] tabular-nums"
              />
              <span className="flex items-end justify-between gap-3 text-ui-xs uppercase">
                <span className="truncate opacity-85">{holder}</span>
                <span className="flex gap-3 font-mono tabular-nums">
                  <span className="flex flex-col">
                    <span className="text-[0.55rem] opacity-60">{l10n.exp}</span>
                    {expiry}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[0.55rem] opacity-60">CVV</span>
                    <Swap visible={details} shown={cvv} hidden={"•".repeat(cvv.length || 3)} />
                  </span>
                </span>
              </span>
            </span>
          </span>
        </motion.span>

        {/* Front of the pocket: compresses into its bottom seam as the card lifts */}
        <motion.span
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-10 block overflow-hidden rounded-[min(calc(var(--radius)*2.8),var(--radius-max))] bg-card shadow-raised"
          initial={false}
          animate={{ height: open ? 52 : 150 }}
          transition={reduce ? { duration: 0.15 } : SPRING}
        >
          <span className="absolute inset-2 rounded-[max(0px,calc(min(var(--radius)*2.8,var(--radius-max))-8px))] border-[1.5px] border-dashed border-foreground/15" />
          <span className="absolute inset-x-0 bottom-0 flex h-[52px] items-center justify-center text-ui-sm font-medium text-muted-foreground">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={open ? "tuck" : "pull"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                {open ? l10n.tapToTuckAway : l10n.tapToPullOut}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.span>
      </button>
    </div>
  )
}
