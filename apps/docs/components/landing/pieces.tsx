"use client"

import * as React from "react"

import {
  ChartIcon,
  HomeFilledIcon,
  HomeIcon,
  SendIcon,
  ServerIcon,
  SettingsFilledIcon,
  SettingsIcon,
  UserFilledIcon,
  UserIcon,
} from "@paneui/ui/icons"
import { Badge } from "@paneui/ui/components/badge"
import { Button } from "@paneui/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@paneui/ui/components/card"
import { Input } from "@paneui/ui/components/input"
import { Label } from "@paneui/ui/components/label"
import { MessageBubble, MessageBubbleGroup } from "@paneui/ui/components/message-bubble"
import { Progress, ProgressLabel, ProgressValue } from "@paneui/ui/components/progress"
import { SegmentedControl, SegmentedControlItem } from "@paneui/ui/components/segmented-control"
import { Separator } from "@paneui/ui/components/separator"
import { Slider } from "@paneui/ui/components/slider"
import { Sparkline } from "@paneui/ui/components/sparkline"
import {
  StatCard,
  StatCardDelta,
  StatCardFooter,
  StatCardHeader,
  StatCardHint,
  StatCardLabel,
  StatCardSparkline,
  StatCardValue,
} from "@paneui/ui/components/stat-card"
import { Switch } from "@paneui/ui/components/switch"
import { TabBar, TabBarItem } from "@paneui/ui/components/tab-bar"
import { TodoList, type TodoStatus } from "@paneui/ui/components/todo-list"
import { ToolApproval, type ToolApprovalDecision, type ToolApprovalStatus } from "@paneui/ui/components/tool-approval"
import { useT, type Localized } from "@/lib/site-locale"

/* Live library components, composed the way an app would use them. */

export function Messages() {
  const t = useT()
  return (
    <div className="flex flex-col gap-3">
      <MessageBubbleGroup align="end">
        <MessageBubble tone="primary">{t({ en: "Can you check the release before I ship?", zh: "发布前帮我检查一下？" })}</MessageBubble>
      </MessageBubbleGroup>
      <MessageBubbleGroup>
        <MessageBubble>{t({ en: "Tests pass. One step needs your OK.", zh: "测试已通过，还有一步需要你确认。" })}</MessageBubble>
      </MessageBubbleGroup>
    </div>
  )
}

export function Deploy() {
  const t = useT()
  const [decision, setDecision] = React.useState<ToolApprovalDecision | null>(null)
  const [status, setStatus] = React.useState<ToolApprovalStatus | undefined>()
  React.useEffect(() => {
    if (decision !== "once" && decision !== "always") return
    const start = window.setTimeout(() => setStatus("running"), 400)
    const end = window.setTimeout(() => setStatus("done"), 2000)
    return () => {
      window.clearTimeout(start)
      window.clearTimeout(end)
      setStatus(undefined)
    }
  }, [decision])
  return (
    <ToolApproval
      tool="deploy.run"
      icon={<ServerIcon />}
      risk="medium"
      title={t({ en: "Deploy to production?", zh: "部署到生产环境？" })}
      resultTitle={t({ en: "Build 248 is live", zh: "第 248 次构建已上线" })}
      description={t({ en: "Build 248 from main", zh: "来自 main 的第 248 次构建" })}
      decision={decision}
      onDecisionChange={setDecision}
      status={status}
    />
  )
}

export function Composer() {
  const t = useT()
  return (
    <div className="flex items-center gap-2">
      <Input aria-label={t({ en: "Message", zh: "消息" })} placeholder={t({ en: "Ask a follow-up", zh: "继续提问" })} className="flex-1" />
      <Button size="icon" aria-label={t({ en: "Send", zh: "发送" })}>
        <SendIcon className="rtl:-scale-x-100" />
      </Button>
    </div>
  )
}

export function Requests() {
  const t = useT()
  return (
    <StatCard>
      <StatCardHeader>
        <StatCardLabel>{t({ en: "Requests", zh: "请求数" })}</StatCardLabel>
        <StatCardDelta value={18.2} />
      </StatCardHeader>
      <StatCardValue>1.28M</StatCardValue>
      <StatCardFooter>
        <StatCardHint>{t({ en: "Last 7 days", zh: "近 7 天" })}</StatCardHint>
        <StatCardSparkline values={[22, 25, 24, 29, 27, 33, 31, 36, 35, 41]} label={t({ en: "Requests trend", zh: "请求趋势" })} />
      </StatCardFooter>
    </StatCard>
  )
}

export function Rollout() {
  const t = useT()
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t({ en: "Rollout", zh: "发布设置" })}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Label className="justify-between gap-3">
          {t({ en: "Canary first", zh: "先灰度" })}
          <Switch defaultChecked />
        </Label>
        <Label className="justify-between gap-3">
          {t({ en: "Notify the team", zh: "通知团队" })}
          <Switch />
        </Label>
        <Slider defaultValue={25} showValue aria-label={t({ en: "Traffic", zh: "流量" })} />
      </CardContent>
    </Card>
  )
}

export function Latency() {
  const t = useT()
  return (
    <Card size="sm">
      <CardHeader className="flex-row items-baseline justify-between gap-3">
        <CardTitle>{t({ en: "Latency", zh: "延迟" })}</CardTitle>
        <span className="text-ui-lg font-semibold tabular-nums">84 ms</span>
      </CardHeader>
      <CardContent className="text-chart-3">
        <Sparkline variant="bar" values={[9, 7, 8, 6, 7, 5, 6, 4, 5, 4, 3, 4, 3, 3]} label={t({ en: "Latency per hour", zh: "每小时延迟" })} className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

const CHECKS: Localized[] = [
  { en: "Run the tests", zh: "运行测试" },
  { en: "Check bundle size", zh: "检查包体积" },
  { en: "Write release notes", zh: "撰写发布说明" },
]

/** Ticks through its items while `live`; stays finished otherwise. */
export function Checklist({ live }: { live: boolean }) {
  const t = useT()
  const [tick, setTick] = React.useState(CHECKS.length)
  React.useEffect(() => {
    if (!live) return
    const id = window.setTimeout(() => setTick((v) => (v > CHECKS.length ? 0 : v + 1)), tick >= CHECKS.length ? 2600 : 1100)
    return () => window.clearTimeout(id)
  }, [tick, live])
  const status = (i: number): TodoStatus => (tick > i ? "done" : tick === i ? "in-progress" : "pending")
  return (
    <TodoList
      title={t({ en: "Release checklist", zh: "发布清单" })}
      items={CHECKS.map((c, i) => ({ id: String(i), title: t(c), status: status(i) }))}
    />
  )
}

const SERIES = [14, 18, 16, 21, 19, 24, 23, 28, 26, 31, 30, 35, 33, 38, 41]

/** A usage panel: range switch, a total and its trend. */
export function Usage() {
  const t = useT()
  const [range, setRange] = React.useState("week")
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex items-center gap-2">
          <ChartIcon size={16} className="text-muted-foreground" />
          <span className="text-ui-lg font-semibold">{t({ en: "Usage", zh: "用量" })}</span>
        </div>
        <SegmentedControl size="sm" value={range} onValueChange={(v) => setRange(String(v))} aria-label={t({ en: "Range", zh: "范围" })}>
          <SegmentedControlItem value="day">{t({ en: "Day", zh: "日" })}</SegmentedControlItem>
          <SegmentedControlItem value="week">{t({ en: "Week", zh: "周" })}</SegmentedControlItem>
          <SegmentedControlItem value="month">{t({ en: "Month", zh: "月" })}</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">{range === "day" ? "5.2k" : range === "month" ? "151k" : "38.4k"}</span>
        <Badge size="sm" variant="success">
          +21%
        </Badge>
      </div>
      <div className="text-primary-text">
        <Sparkline
          values={range === "day" ? SERIES.slice(8) : range === "month" ? [...SERIES].reverse().concat(SERIES) : SERIES}
          label={t({ en: "Usage trend", zh: "用量趋势" })}
          className="h-24 w-full sm:h-32"
        />
      </div>
    </div>
  )
}

/** A phone running a settings screen with a tab bar. */
export function Phone({ className }: { className?: string }) {
  const t = useT()
  const [tab, setTab] = React.useState("settings")
  return (
    <div className={className}>
      <div className="frame-3xl frame-p-1.5 w-full rounded-3xl bg-shell shadow-xl">
        <div className="frame-inner flex flex-col overflow-hidden bg-background">
          <div className="flex items-center justify-between px-4 pt-2.5 text-ui-xs font-medium tabular-nums">
            <span>9:41</span>
            <span aria-hidden className="h-1.5 w-12 rounded-full bg-foreground/15" />
            <span aria-hidden className="h-2 w-4 rounded-xs bg-foreground/40" />
          </div>
          <div className="flex flex-col gap-3 px-3 pt-4 pb-3">
            <span className="px-1 text-xl font-semibold tracking-tight">{t({ en: "Settings", zh: "设置" })}</span>
            <div className="flex flex-col rounded-xl bg-card shadow-raised">
              <Label className="h-11 justify-between gap-3 px-3">
                {t({ en: "Notifications", zh: "通知" })}
                <Switch defaultChecked />
              </Label>
              <div className="ps-3">
                <Separator />
              </div>
              <Label className="h-11 justify-between gap-3 px-3">
                {t({ en: "Sync", zh: "同步" })}
                <Switch defaultChecked />
              </Label>
              <div className="ps-3">
                <Separator />
              </div>
              <Label className="h-11 justify-between gap-3 px-3">
                {t({ en: "Haptics", zh: "触感" })}
                <Switch />
              </Label>
            </div>
            <div className="flex flex-col gap-2 rounded-xl bg-card p-3 shadow-raised">
              <Progress value={72}>
                <ProgressLabel>{t({ en: "Storage", zh: "存储" })}</ProgressLabel>
                <ProgressValue />
              </Progress>
            </div>
          </div>
          <TabBar>
            <TabBarItem icon={<HomeIcon />} activeIcon={<HomeFilledIcon />} label={t({ en: "Home", zh: "首页" })} active={tab === "home"} onClick={() => setTab("home")} />
            <TabBarItem icon={<UserIcon />} activeIcon={<UserFilledIcon />} label={t({ en: "Profile", zh: "我的" })} active={tab === "profile"} onClick={() => setTab("profile")} />
            <TabBarItem
              icon={<SettingsIcon />}
              activeIcon={<SettingsFilledIcon />}
              label={t({ en: "Settings", zh: "设置" })}
              active={tab === "settings"}
              onClick={() => setTab("settings")}
            />
          </TabBar>
        </div>
      </div>
    </div>
  )
}
