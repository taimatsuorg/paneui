"use client"

import * as React from "react"

import { PlusIcon } from "@paneui/ui/icons"
import { Avatar, AvatarFallback, AvatarGroup } from "@paneui/ui/components/avatar"
import { Badge } from "@paneui/ui/components/badge"
import { Button } from "@paneui/ui/components/button"
import { Checkbox } from "@paneui/ui/components/checkbox"
import { Field, FieldLabel } from "@paneui/ui/components/field"
import { Input } from "@paneui/ui/components/input"
import { Label } from "@paneui/ui/components/label"
import { Progress, ProgressLabel, ProgressValue } from "@paneui/ui/components/progress"
import { Radio, RadioGroup } from "@paneui/ui/components/radio"
import { SegmentedControl, SegmentedControlItem } from "@paneui/ui/components/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paneui/ui/components/select"
import { Tabs, TabsList, TabsTab } from "@paneui/ui/components/tabs"
import { Textarea } from "@paneui/ui/components/textarea"
import { Tooltip, TooltipContent, TooltipKbd, TooltipTrigger } from "@paneui/ui/components/tooltip"
import { useT, type Localized } from "@/lib/site-locale"

/** One bay of the plate: the stencilled number and name, then the live component, centred in what is left. */
function Bay({ index, name, children }: { index: number; name: Localized; children: React.ReactNode }) {
  const t = useT()
  return (
    <div data-ui className="flex min-h-48 min-w-0 flex-col gap-4 p-5">
      <p className="plate-label flex items-center gap-2">
        <span className="text-foreground">{String(index).padStart(2, "0")}</span>
        {t(name)}
      </p>
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </div>
  )
}

const REGIONS = [
  { value: "hkg", label: "Hong Kong" },
  { value: "nrt", label: "Tokyo" },
  { value: "sin", label: "Singapore" },
  { value: "fra", label: "Frankfurt" },
]

/**
 * The everyday parts on one faceplate, numbered on from the hero's modules: buttons, fields, choices,
 * tabs, status and feedback. Hairlines draw the bays, so the components carry their own edges.
 */
export function BasicsPlate({ start = 5 }: { start?: number }) {
  const t = useT()
  const bays: { name: Localized; body: React.ReactNode }[] = [
    {
      name: { en: "Button", zh: "按钮" },
      body: (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button>{t({ en: "Save", zh: "保存" })}</Button>
          <Button variant="secondary">{t({ en: "Cancel", zh: "取消" })}</Button>
          <Button variant="outline" size="icon" aria-label={t({ en: "Add", zh: "添加" })}>
            <PlusIcon />
          </Button>
        </div>
      ),
    },
    {
      name: { en: "Input", zh: "输入框" },
      body: (
        <Field className="w-full max-w-60">
          <FieldLabel>{t({ en: "Email", zh: "邮箱" })}</FieldLabel>
          <Input type="email" placeholder="you@example.com" />
        </Field>
      ),
    },
    {
      name: { en: "Select", zh: "选择器" },
      body: (
        <Field className="w-full max-w-60">
          <FieldLabel>{t({ en: "Region", zh: "区域" })}</FieldLabel>
          <Select items={REGIONS} defaultValue="nrt">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ),
    },
    {
      name: { en: "Checkbox", zh: "复选框" },
      body: (
        <div className="flex flex-col gap-3">
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
        </div>
      ),
    },
    {
      name: { en: "Radio", zh: "单选" },
      body: (
        <RadioGroup defaultValue="m" aria-label={t({ en: "Size", zh: "尺寸" })} className="gap-3">
          {[
            ["s", { en: "Small", zh: "小" }],
            ["m", { en: "Medium", zh: "中" }],
            ["l", { en: "Large", zh: "大" }],
          ].map(([value, label]) => (
            <Label key={value as string} className="gap-2.5">
              <Radio value={value as string} />
              {t(label as Localized)}
            </Label>
          ))}
        </RadioGroup>
      ),
    },
    {
      name: { en: "Tabs", zh: "标签页" },
      body: (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTab value="overview">{t({ en: "Overview", zh: "概览" })}</TabsTab>
            <TabsTab value="activity">{t({ en: "Activity", zh: "动态" })}</TabsTab>
            <TabsTab value="settings">{t({ en: "Settings", zh: "设置" })}</TabsTab>
          </TabsList>
        </Tabs>
      ),
    },
    {
      name: { en: "Segmented control", zh: "分段控件" },
      body: (
        <SegmentedControl defaultValue="30d" aria-label={t({ en: "Range", zh: "范围" })}>
          <SegmentedControlItem value="7d">7d</SegmentedControlItem>
          <SegmentedControlItem value="30d">30d</SegmentedControlItem>
          <SegmentedControlItem value="90d">90d</SegmentedControlItem>
        </SegmentedControl>
      ),
    },
    {
      name: { en: "Badge", zh: "徽章" },
      body: (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="primary">Beta</Badge>
          <Badge variant="success">{t({ en: "Paid", zh: "已付" })}</Badge>
          <Badge variant="destructive">{t({ en: "Overdue", zh: "逾期" })}</Badge>
          <Badge variant="outline">{t({ en: "Draft", zh: "草稿" })}</Badge>
        </div>
      ),
    },
    {
      name: { en: "Progress", zh: "进度条" },
      body: (
        <Progress value={64} className="w-full max-w-60">
          <ProgressLabel>{t({ en: "Uploading", zh: "上传中" })}</ProgressLabel>
          <ProgressValue />
        </Progress>
      ),
    },
    {
      name: { en: "Avatar", zh: "头像" },
      body: (
        <AvatarGroup>
          {["Q", "L", "H", "Y"].map((n) => (
            <Avatar key={n}>
              <AvatarFallback>{n}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      ),
    },
    {
      name: { en: "Textarea", zh: "多行输入" },
      body: <Textarea aria-label={t({ en: "Note", zh: "备注" })} placeholder={t({ en: "Leave a note", zh: "写点备注" })} className="w-full max-w-60" rows={3} />,
    },
    {
      name: { en: "Tooltip", zh: "提示" },
      body: (
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>{t({ en: "Hover me", zh: "悬停查看" })}</TooltipTrigger>
          <TooltipContent>
            {t({ en: "Search", zh: "搜索" })}
            <TooltipKbd>⌘K</TooltipKbd>
          </TooltipContent>
        </Tooltip>
      ),
    },
  ]
  return (
    <div className="faceplate overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 [&>*]:border-border [&>*]:border-b sm:[&>*]:border-e sm:[&>*:nth-child(2n)]:border-e-0 lg:[&>*:nth-child(2n)]:border-e lg:[&>*:nth-child(4n)]:border-e-0 lg:[&>*:nth-last-child(-n+4)]:border-b-0">
        {bays.map((bay, i) => (
          <Bay key={i} index={start + i} name={bay.name}>
            {bay.body}
          </Bay>
        ))}
      </div>
    </div>
  )
}
