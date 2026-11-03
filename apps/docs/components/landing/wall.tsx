"use client"

import * as React from "react"

import { siClaude, siGooglegemini } from "simple-icons"

import { CalendarDaysIcon, FileIcon, InboxIcon, SettingsIcon, TerminalSquareIcon, UserIcon } from "@paneui/ui/icons"
import { markOpenai } from "@paneui/ui/lib/brand-marks"
import { AgentProgress } from "@paneui/ui/components/agent-progress"
import { BarList } from "@paneui/ui/components/bar-list"
import { BrandIcon } from "@paneui/ui/components/brand-icon"
import { Card, CardContent, CardHeader, CardTitle } from "@paneui/ui/components/card"
import { Checkbox } from "@paneui/ui/components/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@paneui/ui/components/command"
import { FileTree, FileTreeFile, FileTreeFolder } from "@paneui/ui/components/file-tree"
import { Label } from "@paneui/ui/components/label"
import { EffortPicker, ModelPicker } from "@paneui/ui/components/model-picker"
import { Switch } from "@paneui/ui/components/switch"
import { Timeline, TimelineItem, TimelineTitle } from "@paneui/ui/components/timeline"
import { ToolApproval, type ToolApprovalDecision, type ToolApprovalStatus } from "@paneui/ui/components/tool-approval"
import { TrendChart } from "@paneui/ui/components/trend-chart"
import { useT, type Localized } from "@/lib/site-locale"

import { cn } from "@paneui/ui/lib/utils"

import { BasicsPlate } from "./basics"
import { AccentControls } from "./features"
import { FRAME } from "./landing-chrome"
import { Checklist, Composer, Messages, Usage } from "./pieces"
import { useStill } from "./reveal"

const MODELS = [
  { id: "sol", name: "GPT-6.1 Sol", provider: "OpenAI", icon: <BrandIcon icon={markOpenai} color="brand" /> },
  { id: "sonnet", name: "Sonnet 5.5", provider: "Anthropic", icon: <BrandIcon icon={siClaude} color="brand" /> },
  { id: "gemini", name: "Gemini 4 Pro", provider: "Google", icon: <BrandIcon icon={siGooglegemini} color="brand" /> },
]

function AgentCard() {
  const t = useT()
  const [model, setModel] = React.useState("sonnet")
  const [effort, setEffort] = React.useState("high")
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t({ en: "Agent", zh: "智能体" })}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-1">
          <ModelPicker models={MODELS} value={model} onValueChange={setModel} side="bottom" />
          <EffortPicker value={effort} onValueChange={setEffort} side="bottom" />
        </div>
        <AgentProgress label={t({ en: "Refactoring", zh: "正在重构" })} meta="2.4k tokens" />
        <AgentProgress label={t({ en: "Researching", zh: "正在调研" })} initialElapsed={83} />
      </CardContent>
    </Card>
  )
}

/** Approving starts the call; it finishes a moment later. */
function useRun(decision: ToolApprovalDecision | null) {
  const [status, setStatus] = React.useState<ToolApprovalStatus | undefined>()
  React.useEffect(() => {
    if (decision !== "once" && decision !== "always") return
    const start = window.setTimeout(() => setStatus("running"), 500)
    const end = window.setTimeout(() => setStatus("done"), 1900)
    return () => {
      window.clearTimeout(start)
      window.clearTimeout(end)
      setStatus(undefined)
    }
  }, [decision])
  return status
}

function ApprovalCard() {
  const t = useT()
  const [decision, setDecision] = React.useState<ToolApprovalDecision | null>(null)
  const status = useRun(decision)
  return (
    <ToolApproval
      tool="shell.exec"
      icon={<TerminalSquareIcon />}
      risk="low"
      title={
        <>
          {t({ en: "Run", zh: "运行" })} <code>pnpm test</code>?
        </>
      }
      resultTitle={<code>pnpm test</code>}
      description={t({ en: "The command runs in this project.", zh: "命令在当前项目中运行。" })}
      decision={decision}
      onDecisionChange={setDecision}
      status={status}
    />
  )
}

const Dot = ({ className }: { className: string }) => <span className={`block size-1.5 rounded-full ${className}`} />

function FilesCard() {
  const t = useT()
  const [value, setValue] = React.useState<string | null>("components/ui/button.tsx")
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t({ en: "Files", zh: "文件" })}</CardTitle>
      </CardHeader>
      {/* Rows run edge to edge, like an editor's explorer. */}
      <CardContent className="px-0">
        <FileTree
          label={t({ en: "Project files", zh: "项目文件" })}
          value={value}
          onValueChange={setValue}
          defaultExpanded={["app", "components", "components/ui"]}
        >
          <FileTreeFolder name="app">
            <FileTreeFile name="layout.tsx" />
            <FileTreeFile name="page.tsx" meta={<Dot className="bg-warning" />} />
          </FileTreeFolder>
          <FileTreeFolder name="components">
            <FileTreeFolder name="ui">
              <FileTreeFile name="button.tsx" />
              <FileTreeFile name="tabs.tsx" meta={<Dot className="bg-success" />} />
            </FileTreeFolder>
          </FileTreeFolder>
          <FileTreeFile name="package.json" />
        </FileTree>
      </CardContent>
    </Card>
  )
}

const TASKS: { time: string; title: Localized; tone?: "primary" }[] = [
  { time: "08:00", title: { en: "Morning brief", zh: "晨间简报" } },
  { time: "12:30", title: { en: "Inbox digest", zh: "收件箱摘要" }, tone: "primary" },
  { time: "18:00", title: { en: "Price check", zh: "价格检查" } },
]

function ScheduleCard() {
  const t = useT()
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t({ en: "Today", zh: "今天" })}</CardTitle>
      </CardHeader>
      <CardContent>
        <Timeline>
          {TASKS.map((task) => (
            <TimelineItem key={task.time} time={task.time} tone={task.tone}>
              <TimelineTitle>{t(task.title)}</TimelineTitle>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  )
}

const PAGES = [
  { name: "/pricing", value: 18420 },
  { name: "/", value: 15210 },
  { name: "/docs", value: 9840 },
  { name: "/changelog", value: 6120 },
]

function TrafficCard() {
  const t = useT()
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t({ en: "Top pages", zh: "热门页面" })}</CardTitle>
      </CardHeader>
      <CardContent>
        <BarList
          items={PAGES}
          labels={[t({ en: "Page", zh: "页面" }), t({ en: "Visitors", zh: "访客" })]}
          formatValue={(v) => v.toLocaleString("en-US")}
        />
      </CardContent>
    </Card>
  )
}

function NotifyCard() {
  const t = useT()
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t({ en: "Notify me", zh: "通知我" })}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Label className="gap-2.5">
          <Checkbox defaultChecked />
          {t({ en: "Mentions", zh: "提及" })}
        </Label>
        <Label className="gap-2.5">
          <Checkbox defaultChecked />
          {t({ en: "Reviews", zh: "评审" })}
        </Label>
        <Label className="gap-2.5">
          <Checkbox />
          {t({ en: "Weekly digest", zh: "每周摘要" })}
        </Label>
        <Label className="justify-between gap-3 pt-1">
          {t({ en: "Quiet hours", zh: "免打扰" })}
          <Switch defaultChecked />
        </Label>
      </CardContent>
    </Card>
  )
}

const MONTHS: Localized[] = [
  { en: "May", zh: "5月" },
  { en: "Jun", zh: "6月" },
  { en: "Jul", zh: "7月" },
  { en: "Aug", zh: "8月" },
  { en: "Sep", zh: "9月" },
  { en: "Oct", zh: "10月" },
]

function UsersCard() {
  const t = useT()
  const data = MONTHS.map((m, i) => ({ label: t(m), values: { new: 12 + i * 3 + (i % 2) * 2, back: 5 + i * 2 + ((i + 1) % 2) } }))
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t({ en: "Active users", zh: "活跃用户" })}</CardTitle>
      </CardHeader>
      <CardContent>
        <TrendChart
          series={[
            { id: "new", label: t({ en: "New", zh: "新用户" }) },
            { id: "back", label: t({ en: "Returning", zh: "回访" }) },
          ]}
          data={data}
          height={160}
          formatValue={(v) => `${v}k`}
          label={t({ en: "Active users by month", zh: "每月活跃用户" })}
        />
      </CardContent>
    </Card>
  )
}

function CommandCard() {
  const t = useT()
  return (
    <div className="rounded-xl shadow-raised">
      <Command>
        <CommandInput placeholder={t({ en: "Type a command", zh: "输入命令" })} aria-label={t({ en: "Search commands", zh: "搜索命令" })} />
        <CommandList>
          <CommandEmpty>{t({ en: "No results.", zh: "没有结果。" })}</CommandEmpty>
          <CommandGroup heading={t({ en: "Suggestions", zh: "建议" })}>
            <CommandItem>
              <InboxIcon />
              {t({ en: "Inbox", zh: "收件箱" })}
            </CommandItem>
            <CommandItem>
              <CalendarDaysIcon />
              {t({ en: "Calendar", zh: "日历" })}
            </CommandItem>
            <CommandItem>
              <FileIcon />
              {t({ en: "New file", zh: "新建文件" })}
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t({ en: "Settings", zh: "设置" })}>
            <CommandItem>
              <UserIcon />
              {t({ en: "Profile", zh: "个人资料" })}
            </CommandItem>
            <CommandItem>
              <SettingsIcon />
              {t({ en: "Preferences", zh: "偏好设置" })}
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}

function ChatCard() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-background p-4 shadow-raised">
      <Messages />
      <Composer />
    </div>
  )
}

/** The wall's cards in masonry columns: one on phones, two from sm, then three or four from xl. */
export function WallGrid({ columns: count = 4, className }: { columns?: 3 | 4; className?: string }) {
  const still = useStill()
  const usage = <div key="usage" className="overflow-hidden rounded-xl bg-card shadow-raised"><Usage /></div>
  const columns: React.ReactNode[][] =
    count === 3
      ? [
          [<AgentCard key="agent" />, <FilesCard key="files" />, <NotifyCard key="notify" />],
          [<ApprovalCard key="approval" />, <TrafficCard key="traffic" />, usage, <UsersCard key="users" />],
          [<CommandCard key="command" />, <ScheduleCard key="schedule" />, <ChatCard key="chat" />, <Checklist key="checklist" live={!still} />],
        ]
      : [
          [<AgentCard key="agent" />, <FilesCard key="files" />, <NotifyCard key="notify" />],
          [<ApprovalCard key="approval" />, <TrafficCard key="traffic" />, usage],
          [<CommandCard key="command" />, <ScheduleCard key="schedule" />],
          [<ChatCard key="chat" />, <UsersCard key="users" />, <Checklist key="checklist" live={!still} />],
        ]
  return (
    <div className={cn("grid w-full max-w-7xl grid-cols-1 items-start gap-4 sm:grid-cols-2", count === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4", className)}>
      {columns.map((col, i) => (
        <div key={i} className="flex min-w-0 flex-col gap-4">
          {/* data-ui: each card is a real interface fragment (its borders, shadows and code faces belong to the components). */}
          {col.map((card, j) => (
            <div key={j} data-ui className="min-w-0">
              {card}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * The component wall, the page's stage: the heading on the left and the accent and radius controls
 * at the far end of the same row, then the everyday components on one faceplate. Changing either
 * control repaints every bay at once. WallGrid (the blocks) stays for the Customize preview.
 */
export function Wall({ footer }: { footer?: React.ReactNode }) {
  const t = useT()
  return (
    <section aria-labelledby="wall-title" className="flex flex-col gap-8">
      <div className={`${FRAME} grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-10`}>
        <div className="flex flex-col gap-3 lg:col-span-7">
          <h2 id="wall-title" className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t({ en: "One install, and it already looks like this", zh: "装上就是这个样子" })}
          </h2>
          <p className="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
            {t({
              en: "Press anything. Then change the accent or the corners: every part reads the same tokens.",
              zh: "随便点点看。再换个主题色或圆角：所有组件读取同一套变量。",
            })}
          </p>
        </div>
        <AccentControls className="lg:col-span-5 lg:justify-end" />
      </div>
      <div className={`${FRAME} flex flex-col gap-8`}>
        <BasicsPlate />
        {footer}
      </div>
    </section>
  )
}
