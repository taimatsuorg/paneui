"use client"

import * as React from "react"
import Link from "next/link"

import { ArrowRightIcon } from "@paneui/ui/icons"
import { Button } from "@paneui/ui/components/button"
import { CommandCopy } from "@paneui/ui/components/command-copy"
import { Kbd, KbdGroup } from "@paneui/ui/components/kbd"
import { Slider } from "@paneui/ui/components/slider"
import { Switch } from "@paneui/ui/components/switch"
import { ToggleGroup, ToggleGroupItem } from "@paneui/ui/components/toggle-group"
import { CLI_PACKAGE } from "@/components/docs/install-command"
import { useT, type Localized } from "@/lib/site-locale"

import { FRAME } from "./landing-chrome"

const COMMAND = `npx ${CLI_PACKAGE}@latest init`

/** One module on the faceplate: a stencilled number and name across the top, the live part below. */
function Module({ index, name, children, className = "" }: { index: string; name: Localized; children: React.ReactNode; className?: string }) {
  const t = useT()
  return (
    <div className={`flex min-h-36 flex-col gap-4 p-5 ${className}`}>
      <p className="plate-label flex items-center gap-2">
        <span className="text-foreground">{index}</span>
        {t(name)}
      </p>
      <div className="flex flex-1 items-center">{children}</div>
    </div>
  )
}

function Modules() {
  const [level, setLevel] = React.useState(64)
  return (
    <div className="grid grid-cols-1 divide-y divide-border border-t border-border sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0 [&>*:nth-child(2)]:sm:border-t-0">
      <Module index="01" name={{ en: "Switch", zh: "开关" }}>
        <div className="flex items-center gap-3">
          <Switch defaultChecked aria-label="Power" />
          <Switch aria-label="Sync" />
        </div>
      </Module>
      <Module index="02" name={{ en: "Slider", zh: "滑块" }}>
        <div className="flex w-full items-center gap-3">
          <Slider value={level} onValueChange={(v) => setLevel(Array.isArray(v) ? v[0] : v)} aria-label="Level" className="flex-1" />
          <span className="w-8 text-end font-mono text-ui-sm tabular-nums text-muted-foreground">{level}</span>
        </div>
      </Module>
      <Module index="03" name={{ en: "Toggle group", zh: "切换组" }}>
        <ToggleGroup defaultValue={["b"]} variant="outline" aria-label="Mode">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
          <ToggleGroupItem value="c">C</ToggleGroupItem>
          <ToggleGroupItem value="d">D</ToggleGroupItem>
        </ToggleGroup>
      </Module>
      <Module index="04" name={{ en: "Kbd", zh: "按键" }}>
        <KbdGroup>
          <Kbd size="lg">⌘</Kbd>
          <Kbd size="lg">K</Kbd>
        </KbdGroup>
      </Module>
    </div>
  )
}

/**
 * The first screen is one faceplate: a stencilled strip with the model line and a signal lamp, the
 * headline and the install controls in two bays, then a row of live modules. The page is the
 * library laid out like an instrument, so the first thing a visitor touches is a real component.
 */
export function Hero() {
  const t = useT()
  return (
    <section aria-labelledby="hero-title" className={`${FRAME} pt-8 pb-16 sm:pt-12 lg:pb-24`}>
      <div className="faceplate overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-7 py-2.5">
          <span aria-hidden className="signal-lamp" />
          <p className="plate-label">PaneUI</p>
          <p className="plate-label ms-auto hidden sm:block">React · Base UI · Tailwind</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:divide-x lg:divide-border">
          {/* Painted on the first frame: nothing on the first screen waits for the island to hydrate or animate in. */}
          <div className="p-5 pt-8 sm:p-8 lg:col-span-8 lg:p-10">
            <h1 id="hero-title" className="font-heading text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-6xl lg:text-7xl">
              {t({ en: "React components for app interfaces", zh: "为应用界面而做的 React 组件" })}
            </h1>
          </div>
          <div className="flex flex-col justify-end gap-5 border-t border-border p-5 sm:p-8 lg:col-span-4 lg:border-t-0">
            <p className="text-base text-pretty text-muted-foreground">
              {t({ en: "Accessible, animated and themed. The source lands in your app, ready to edit.", zh: "无障碍、带动效、可换主题。源码直接放进你的项目，随时修改。" })}
            </p>
            <CommandCopy command={COMMAND} />
            <div className="flex flex-wrap items-center gap-2">
              <Button nativeButton={false} render={<Link href="/docs" />}>
                {t({ en: "Get started", zh: "开始使用" })}
                <ArrowRightIcon data-icon="inline-end" className="rtl:-scale-x-100" />
              </Button>
              <Button variant="outline" nativeButton={false} render={<Link href="/docs/components" />}>
                {t({ en: "Browse components", zh: "浏览组件" })}
              </Button>
            </div>
          </div>
        </div>
        <Modules />
      </div>
    </section>
  )
}
