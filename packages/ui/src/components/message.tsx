"use client"

import * as React from "react"
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react"

import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import {
  MessageBubbleGroup,
  MessageSideContext,
  MessageVariantContext,
  type MessageSide,
  type MessageVariant,
} from "@paneui/ui/components/message-bubble"
import { Tooltip, TooltipContent, TooltipTrigger } from "@paneui/ui/components/tooltip"
import { useLocale } from "@paneui/ui/components/locale-provider"

type MessageFrom = "user" | "assistant" | "system"

const MessageFromContext = React.createContext<MessageFrom>("assistant")

const sideOf = (from: MessageFrom, variant: MessageVariant = "bubble"): MessageSide =>
  variant === "flat" || from !== "user" ? "start" : "end"

const useFlat = () => React.useContext(MessageVariantContext) === "flat"

/**
 * Vertical stack of message rows. `bubble` puts each sender on their own side
 * in speech bubbles; `flat` lines every row up on the left as a channel feed,
 * with square avatars, a name line and plain text.
 */
function MessageList({
  variant = "bubble",
  spacing = "default",
  className,
  ...props
}: React.ComponentProps<"div"> & { variant?: MessageVariant; spacing?: "compact" | "default" }) {
  const flat = variant === "flat"
  return (
    <MessageVariantContext.Provider value={variant}>
      <div
        data-slot="message-list"
        data-variant={variant}
        className={cn(
          "flex w-full flex-col",
          flat ? (spacing === "compact" ? "gap-0" : "gap-1") : spacing === "compact" ? "gap-2" : "gap-5",
          className
        )}
        {...props}
      />
    </MessageVariantContext.Provider>
  )
}

/**
 * One conversation row. `user` rows hug the right edge, `assistant` and
 * `system` rows the left. `animateIn` plays a pop-up from the sender's
 * corner once on mount, for rows that were just sent.
 */
function Message({
  from = "assistant",
  animateIn = false,
  className,
  style,
  children,
  ...props
}: Omit<HTMLMotionProps<"article">, "children"> & {
  from?: MessageFrom
  animateIn?: boolean
  children?: React.ReactNode
}) {
  const { labels } = useLocale()
  const reduce = useReducedMotion() ?? false
  const flat = useFlat()
  const side = sideOf(from, flat ? "flat" : "bubble")
  return (
    <MessageFromContext.Provider value={from}>
      <MessageSideContext.Provider value={side}>
        <motion.article
          data-slot="message"
          data-from={from}
          data-side={side}
          initial={
            animateIn ? (reduce ? { opacity: 0 } : flat ? { opacity: 0, y: 6 } : { opacity: 0, y: 10, scale: 0.94 }) : false
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 480, damping: 32, mass: 0.6 }}
          style={{ transformOrigin: side === "end" ? "100% 100%" : "0% 100%", ...style }}
          className={cn(
            "group/message flex w-full min-w-0",
            flat
              ? "relative items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-100 hover:bg-foreground/4 focus-within:bg-foreground/4"
              : "items-end gap-2.5",
            side === "end" && "flex-row-reverse",
            className
          )}
          {...props}
          aria-label={props["aria-label"] ?? labels.messageFrom(from)}
        >
          {children}
        </motion.article>
      </MessageSideContext.Provider>
    </MessageFromContext.Provider>
  )
}

/**
 * Avatar slot: round in bubble lists, rounded square in flat ones. Pass an
 * `<img>`, initials or an icon. Use `placeholder` on follow-up rows to keep
 * content aligned without repeating the avatar; in flat lists its children
 * (usually the time) show in the gutter while the row is hovered.
 */
function MessageAvatar({
  placeholder = false,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { placeholder?: boolean }) {
  const flat = useFlat()
  if (flat && placeholder) {
    return (
      <div
        data-slot="message-avatar"
        data-placeholder=""
        className={cn(
          "flex h-[1.625rem] w-9 shrink-0 items-center justify-end text-ui-2xs text-muted-foreground tabular-nums opacity-0 transition-opacity duration-100 group-hover/message:opacity-100 group-focus-within/message:opacity-100",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
  return (
    <div
      data-slot="message-avatar"
      aria-hidden={placeholder || undefined}
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden bg-card text-ui-sm font-semibold icon-bold text-muted-foreground shadow-raised [&_img]:size-full [&_img]:object-cover [&_svg]:size-4 [&_svg[data-slot=generated-avatar]]:size-full",
        flat ? "mt-0.5 size-9 rounded-lg" : "mb-0.5 size-8 rounded-full",
        placeholder && "invisible",
        className
      )}
      {...props}
    >
      {placeholder ? null : children}
    </div>
  )
}

/**
 * Column holding the row's bubbles, metadata and actions. Bubbles inside are
 * grouped automatically: consecutive bubbles join with tightened corners.
 */
function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  const from = React.useContext(MessageFromContext)
  const flat = useFlat()
  const side = sideOf(from, flat ? "flat" : "bubble")
  return (
    <MessageBubbleGroup
      data-slot="message-content"
      align={side}
      className={cn(flat ? "flex-1 gap-0.5" : "max-w-[min(80%,36rem)] gap-1", className)}
      {...props}
    />
  )
}

/**
 * Small line above the bubbles: sender name, model or role. In flat lists it
 * is the bold name line; a `<time>` inside reads as the quiet timestamp.
 */
function MessageHeader({ className, ...props }: React.ComponentProps<"div">) {
  const flat = useFlat()
  return (
    <div
      data-slot="message-header"
      className={cn(
        flat
          ? "flex items-baseline gap-2 text-ui font-semibold text-foreground [&_time]:text-ui-xs [&_time]:font-normal [&_time]:text-muted-foreground [&_time]:tabular-nums"
          : "mb-0.5 flex items-center gap-1.5 px-1 text-ui-sm font-medium text-muted-foreground group-data-[side=end]/message:flex-row-reverse",
        className
      )}
      {...props}
    />
  )
}

/** Timestamp / delivery status line below the bubbles. */
function MessageMeta({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-meta"
      className={cn(
        "mt-0.5 flex items-center gap-1.5 px-1 text-ui-xs text-muted-foreground tabular-nums group-data-[side=end]/message:flex-row-reverse [&_svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

/**
 * Row of quiet icon actions (copy, retry, feedback…). Fades in on hover or
 * keyboard focus of the message; pass `visible` to keep it shown, e.g. on the
 * latest assistant reply.
 */
function MessageActions({
  visible = false,
  className,
  ...props
}: React.ComponentProps<"div"> & { visible?: boolean }) {
  const flat = useFlat()
  return (
    <div
      role="toolbar"
      data-slot="message-actions"
      data-visible={visible || undefined}
      className={cn(
        "flex items-center gap-0.5 transition-opacity duration-200 group-data-[side=end]/message:flex-row-reverse",
        flat
          ? "frame-lg frame-p-0.5 absolute -top-3.5 right-2 z-10 bg-popover shadow-raised"
          : "mt-0.5",
        !visible &&
          "opacity-0 group-hover/message:opacity-100 group-focus-within/message:opacity-100 pointer-coarse:opacity-100",
        className
      )}
      {...props}
    />
  )
}

/** Icon button for `MessageActions` with a tooltip from its `label`. */
function MessageAction({
  label,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "aria-label"> & { label: string }) {
  const flat = useFlat()
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className={cn(
              "size-7 text-muted-foreground hover:text-foreground [&_svg]:size-3.5",
              flat && "rounded-inner",
              className
            )}
            {...props}
            aria-label={label}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** Three-dot typing indicator in a bubble-shaped chip. */
function MessageTyping({ label: labelProp, className, ...props }: React.ComponentProps<"div"> & { label?: string }) {
  const { labels } = useLocale()
  const label = labelProp ?? labels.typing
  const reduce = useReducedMotion() ?? false
  const flat = useFlat()
  return (
    <div
      role="status"
      data-slot="message-typing"
      className={cn(
        "flex items-center gap-1 self-start",
        flat
          ? "h-6 px-0.5"
          : "h-10 w-16 justify-center rounded-3xl rounded-bl-md bg-card shadow-[var(--skeuo-well),var(--skeuo-primary)]",
        className
      )}
      {...props}
      aria-label={props["aria-label"] ?? label}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground"
          animate={reduce ? { opacity: [0.4, 1, 0.4] } : { y: [0, -3, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

/** Wrapping row of reaction chips under a message. */
function MessageReactions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-reactions"
      className={cn("mt-1 flex flex-wrap items-center gap-1 group-data-[side=end]/message:justify-end", className)}
      {...props}
    />
  )
}

/**
 * One reaction: an emoji and its count. `active` marks the reader's own
 * reaction; clicking toggles through `onActiveChange`.
 */
function MessageReaction({
  emoji,
  count,
  active = false,
  onActiveChange,
  className,
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  emoji: React.ReactNode
  count: number
  active?: boolean
  onActiveChange?: (active: boolean) => void
}) {
  return (
    <button
      type="button"
      data-slot="message-reaction"
      data-active={active || undefined}
      aria-pressed={active}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) onActiveChange?.(!active)
      }}
      className={cn(
        "inline-flex h-6 cursor-pointer items-center gap-1 rounded-control-sm bg-foreground/5 px-2 text-ui-xs font-medium text-muted-foreground tabular-nums shadow-[inset_0_0_0_1px_transparent] transition-[background-color,color,box-shadow] duration-100 outline-none hover:bg-foreground/8 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        active && "bg-primary/10 text-primary-text shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--primary),transparent_60%)] hover:bg-primary/15 hover:text-primary-text",
        className
      )}
      {...props}
    >
      <span className="text-ui leading-none">{emoji}</span>
      {count}
    </button>
  )
}

/** Centred divider between turns: a date, "New", or a system note. */
function MessageMarker({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      data-slot="message-marker"
      className={cn(
        "flex items-center gap-3 text-ui-xs font-medium text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border",
        className
      )}
      {...props}
    >
      <span className="rounded-control-sm bg-muted px-2.5 py-0.5 shadow-chip">{children}</span>
    </div>
  )
}

export {
  MessageList,
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageMeta,
  MessageActions,
  MessageAction,
  MessageTyping,
  MessageMarker,
  MessageReactions,
  MessageReaction,
  type MessageFrom,
  type MessageVariant,
}
export {
  MessageBubble,
  MessageBubbleGroup,
  MessageBubbleCollapsible,
} from "@paneui/ui/components/message-bubble"
