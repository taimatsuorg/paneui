"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { ChevronDownIcon, ListIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { DigitSwap } from "@paneui/ui/components/digit-swap"
import { useLocale, localeLabels, type LocaleLabels } from "@paneui/ui/components/locale-provider"

type TodoStatus = "pending" | "in-progress" | "done" | "failed"

type TodoItem = {
  id: string
  title: React.ReactNode
  status?: TodoStatus
  /** Small trailing note: a duration, a file count, a reason it failed. */
  meta?: React.ReactNode
  /** Second line, shown under the title. */
  detail?: React.ReactNode
}

function getStatusLabels(l10n: LocaleLabels = localeLabels.en): Record<TodoStatus, string> {
  return ({
  pending: l10n.pending,
  "in-progress": l10n.inProgress,
  done: l10n.toolDone,
  failed: l10n.toolFailed,
})
}


const EASE_OUT = [0.22, 1, 0.36, 1] as const
const SPRING = { type: "spring", stiffness: 460, damping: 32, mass: 0.6 } as const

/**
 * One SVG that morphs between the four states: a dashed well ring (pending),
 * a spinning primary arc (in progress), a filled success disc with a drawn
 * check (done) and a tinted destructive disc with a drawn cross (failed).
 */
function TodoStatusMark({ status, className }: { status: TodoStatus; className?: string }) {
  const reduce = useReducedMotion()
  const draw = reduce ? { duration: 0 } : { duration: 0.26, ease: EASE_OUT, delay: 0.06 }

  return (
    <motion.svg
      aria-hidden
      data-slot="todo-status-mark"
      data-status={status}
      viewBox="0 0 20 20"
      className={cn("size-5 shrink-0 overflow-visible", className)}
      initial={false}
      animate={reduce ? undefined : { scale: status === "done" || status === "failed" ? [0.82, 1] : 1 }}
      transition={SPRING}
    >
      <circle
        cx="10"
        cy="10"
        r="8"
        strokeWidth="1.5"
        strokeDasharray={status === "pending" ? "2.6 2.4" : undefined}
        className={cn(
          "transition-[fill,stroke] duration-300",
          status === "pending" && "fill-muted stroke-muted-foreground/45",
          status === "in-progress" && "fill-primary/12 stroke-primary/25",
          status === "done" && "fill-success stroke-success",
          status === "failed" && "fill-destructive/14 stroke-destructive/40"
        )}
      />
      {status === "in-progress" && (
        // A CSS keyframe spin, not a Motion `animate`: the mark is rendered
        // inside `<AnimatePresence initial={false}>`, which blocks a child's
        // first animation, so a Motion rotate snapped to 360° and froze.
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="14 50.3"
          className="origin-center animate-spin stroke-primary [animation-duration:0.9s] [transform-box:fill-box] motion-reduce:animate-pulse"
        />
      )}
      <motion.path
        d="M6.2 10.3l2.5 2.5 5-5.2"
        fill="none"
        stroke="white"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: status === "done" ? 1 : 0, opacity: status === "done" ? 1 : 0 }}
        transition={draw}
      />
      <motion.path
        d="M7.3 7.3l5.4 5.4M12.7 7.3l-5.4 5.4"
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="stroke-destructive"
        initial={false}
        animate={{ pathLength: status === "failed" ? 1 : 0, opacity: status === "failed" ? 1 : 0 }}
        transition={draw}
      />
    </motion.svg>
  )
}

type TodoListProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  items: TodoItem[]
  /** Header label. */
  title?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Fold the plan away once every item is done. */
  collapseOnComplete?: boolean
  /** Cap the list height in px; it scrolls past this. */
  maxHeight?: number
}

/** A collapsible agent task plan with morphing status marks and a live completion count. */
function TodoList({
  items,
  title: titleProp,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  collapseOnComplete = false,
  maxHeight,
  className,
  ...props
}: TodoListProps) {
  const l10n = useLocale().labels
  const STATUS_LABEL = getStatusLabels(l10n)

  const { labels } = useLocale()
  const title = titleProp ?? labels.plan
  const reduce = useReducedMotion()
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = openProp ?? internalOpen
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [openProp, onOpenChange]
  )

  const total = items.length
  const done = items.filter((i) => i.status === "done").length
  const failed = items.filter((i) => i.status === "failed").length
  const complete = total > 0 && done === total
  const current = items.find((i) => i.status === "in-progress")

  const wasComplete = React.useRef(complete)
  React.useEffect(() => {
    if (collapseOnComplete && complete && !wasComplete.current) {
      const id = window.setTimeout(() => setOpen(false), 700)
      wasComplete.current = complete
      return () => window.clearTimeout(id)
    }
    wasComplete.current = complete
  }, [collapseOnComplete, complete, setOpen])

  return (
    <CollapsiblePrimitive.Root
      open={open}
      onOpenChange={setOpen}
      data-slot="todo-list"
      data-complete={complete || undefined}
      className={cn("flex w-full flex-col frame-3xl frame-inset-2 bg-card shadow-raised", className)}
      {...props}
    >
      <CollapsiblePrimitive.Trigger
        data-slot="todo-list-trigger"
        className="group/todo flex w-full cursor-pointer items-center gap-2.5 rounded-3xl px-3.5 py-2.5 text-start outline-none select-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="relative grid size-5 shrink-0 place-items-center">
          <AnimatePresence initial={false} mode="popLayout">
            {complete ? (
              <motion.span
                key="complete"
                className="absolute inset-0 grid place-items-center"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                transition={SPRING}
              >
                <TodoStatusMark status="done" />
              </motion.span>
            ) : (
              <motion.span
                key="plan"
                className="absolute inset-0 grid place-items-center text-muted-foreground"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                transition={SPRING}
              >
                <ListIcon size={16} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-ui font-medium">{title}</span>
          <AnimatePresence initial={false}>
            {!open && current && (
              <motion.span
                key="current"
                className="truncate text-ui-sm text-muted-foreground"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
              >
                {current.title}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        {failed > 0 && (
          <span className="rounded-control-sm bg-destructive/12 px-1.5 py-0.5 text-ui-xs font-medium text-destructive-text tabular-nums">
            {labels.failedTasks(failed)}
          </span>
        )}
        <span className="sr-only">
          {labels.completedTasks(done, total)}
        </span>
        <span
          aria-hidden
          className="flex items-center rounded-control-sm bg-muted px-2 py-0.5 text-ui-sm font-medium text-muted-foreground shadow-well tabular-nums"
        >
          <DigitSwap value={done} direction="auto" />
          <span className="opacity-60">/{total}</span>
        </span>
        <ChevronDownIcon
          size={16}
          className="text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-panel-open/todo:rotate-180 motion-reduce:transition-none"
        />
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Panel
        data-slot="todo-list-panel"
        className="h-(--collapsible-panel-height) overflow-hidden transition-[height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0 motion-reduce:transition-none"
      >
        <ul
          data-slot="todo-list-items"
          className="flex flex-col gap-0.5 overflow-y-auto px-2 pb-2"
          style={maxHeight ? { maxHeight } : undefined}
        >
          <AnimatePresence initial={false}>
            {items.map((item) => {
              const status = item.status ?? "pending"
              return (
                <motion.li
                  key={item.id}
                  layout={reduce ? false : "position"}
                  data-slot="todo-item"
                  data-status={status}
                  aria-current={status === "in-progress" ? "step" : undefined}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.14 } }}
                  transition={{ duration: 0.22, ease: EASE_OUT, layout: SPRING }}
                  className={cn(
                    "flex items-start gap-2.5 rounded-inner px-1.5 py-1.5 transition-colors duration-200",
                    status === "in-progress" && "bg-primary/6"
                  )}
                >
                  <TodoStatusMark status={status} className="mt-px" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span
                      className={cn(
                        "text-ui leading-5 transition-colors duration-300",
                        status === "pending" && "text-muted-foreground",
                        status === "in-progress" && "font-medium text-foreground",
                        status === "done" && "text-muted-foreground line-through decoration-muted-foreground/40",
                        status === "failed" && "text-foreground"
                      )}
                    >
                      {item.title}
                      <span className="sr-only">, {STATUS_LABEL[status]}</span>
                    </span>
                    {item.detail != null && <span className="text-ui-sm text-muted-foreground">{item.detail}</span>}
                  </span>
                  {item.meta != null && (
                    <span
                      className={cn(
                        "shrink-0 pt-0.5 text-ui-sm text-muted-foreground tabular-nums",
                        status === "failed" && "text-destructive-text"
                      )}
                    >
                      {item.meta}
                    </span>
                  )}
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      </CollapsiblePrimitive.Panel>
    </CollapsiblePrimitive.Root>
  )
}

export { TodoList, TodoStatusMark, type TodoListProps, type TodoItem, type TodoStatus }
