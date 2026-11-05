"use client"

import { useLocale, localeLabels, type LocaleLabels } from "@paneui/ui/components/locale-provider"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { AlertCircleIcon, CheckIcon, ChevronRightIcon, LoaderIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"

export type TaskStatus = "queued" | "running" | "done" | "failed"

function getStatusText(l10n: LocaleLabels = localeLabels.en): Record<TaskStatus, string> {
  return ({
  queued: l10n.queued,
  running: l10n.toolRunning,
  done: l10n.toolDone,
  failed: l10n.toolFailed,
})
}


function StatusMark({ status }: { status: TaskStatus }) {
  return (
    <span className="relative inline-flex size-7 shrink-0 items-center justify-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-full",
            status === "done" && "bg-success text-success-foreground",
            status === "failed" && "bg-destructive/14 text-destructive-text",
            status === "running" && "bg-primary/14 text-primary-text",
            status === "queued" && "bg-muted shadow-well"
          )}
        >
          {status === "done" && <CheckIcon size={15} />}
          {status === "failed" && <AlertCircleIcon size={16} />}
          {status === "running" && <LoaderIcon size={15} className="animate-spin" />}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function TaskRow({
  title,
  detail,
  status = "queued",
  onClick,
  className,
}: {
  title: string
  detail?: string
  status?: TaskStatus
  onClick?: () => void
  className?: string
}) {
  const l10n = useLocale().labels
  const statusText = getStatusText(l10n)

  return (
    <button
      type="button"
      data-slot="task-row"
      data-status={status}
      onClick={onClick}
      className={cn(
        "group/task flex w-full cursor-pointer items-center gap-3 rounded-2xl ps-3 pe-2.5 py-2.5 text-start transition-[background-color,box-shadow] outline-none hover:bg-card focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <StatusMark status={status} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={cn("truncate text-ui-lg font-medium", status === "done" && "text-muted-foreground")}>{title}</span>
        {detail && <span className="truncate text-ui text-muted-foreground">{detail}</span>}
      </span>
      <span className="text-ui text-muted-foreground tabular-nums">{statusText[status]}</span>
      <ChevronRightIcon size={16} className="text-muted-foreground transition-transform group-hover/task:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/task:-translate-x-0.5" />
    </button>
  )
}

export function TaskList({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="task-list" className={cn("flex flex-col gap-0.5", className)} {...props} />
}
