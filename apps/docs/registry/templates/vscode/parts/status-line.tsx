"use client"

import * as React from "react"

import { GitBranchIcon, MoonIcon, SunIcon, WarningIcon, XCircleIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { ActionSwapBlurIcon } from "@paneui/ui/components/action-swap-blur"
import { Tooltip, TooltipContent, TooltipTrigger } from "@paneui/ui/components/tooltip"

const ITEM =
  "flex h-5 shrink-0 items-center gap-1 rounded-sm px-1.5 whitespace-nowrap tabular-nums outline-none [&_svg]:size-3"

/** A clickable status item; Tooltip's trigger merges its props in. */
function StatusAction({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        ITEM,
        "cursor-default transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  )
}

function Item({ label, onClick, children }: { label: string; onClick?: () => void; children: React.ReactNode }) {
  if (!onClick) return <span className={ITEM}>{children}</span>
  return (
    <Tooltip>
      <TooltipTrigger render={<StatusAction aria-label={label} onClick={onClick} />}>{children}</TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

/** The window's bottom bar: branch, problem counts, cursor, indentation, encoding, line endings, language. */
export function StatusLine({
  branch,
  changes,
  errors,
  warnings,
  cursor,
  language,
  remote,
  dark,
  onBranch,
  onProblems,
  onGoToLine,
  onLanguage,
  onTheme,
  compact = false,
}: {
  branch: string
  changes: number
  errors: number
  warnings: number
  cursor: { line: number; column: number; selected: number } | null
  language: string | null
  remote: boolean
  dark: boolean
  onBranch: () => void
  onProblems: () => void
  onGoToLine: () => void
  onLanguage: () => void
  onTheme: () => void
  compact?: boolean
}) {
  return (
    <footer aria-label="Status" className="flex h-6 shrink-0 items-center gap-0.5 px-1.5 text-ui-xs text-muted-foreground">
      <Item label={`${changes ? `${changes} uncommitted ${changes === 1 ? "change" : "changes"}` : "Source control"}`} onClick={onBranch}>
        <GitBranchIcon />
        {branch}
        {changes > 0 && "*"}
      </Item>
      <Item label={`${errors} errors, ${warnings} warnings`} onClick={onProblems}>
        <XCircleIcon className={errors ? "text-destructive-text" : undefined} />
        {errors}
        <WarningIcon className={cn("ml-1", warnings ? "text-warning-text" : undefined)} />
        {warnings}
      </Item>
      {remote && !compact && <Item label="Terminal connection">PTY</Item>}
      <span className="flex-1" />
      {cursor && (
        <Item label="Go to line" onClick={onGoToLine}>
          Ln {cursor.line}, Col {cursor.column}
          {cursor.selected > 0 && ` (${cursor.selected} selected)`}
        </Item>
      )}
      {!compact && <Item label="Indentation">Spaces: 2</Item>}
      {!compact && <Item label="Encoding">UTF-8</Item>}
      {!compact && <Item label="Line endings">LF</Item>}
      {language && (
        <Item label="Language mode" onClick={onLanguage}>
          {language}
        </Item>
      )}
      <Item label={dark ? "Light theme" : "Dark theme"} onClick={onTheme}>
        <ActionSwapBlurIcon value={dark ? "light" : "dark"} className="size-3">
          {dark ? <SunIcon /> : <MoonIcon />}
        </ActionSwapBlurIcon>
      </Item>
    </footer>
  )
}
