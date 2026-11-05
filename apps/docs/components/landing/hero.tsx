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

/** One tile: the part's name in the corner, the live part centred below. */
function Module({ name, children, className = "" }: { index?: string; name: Localized; children: React.ReactNode; className?: string }) {
  const t = useT()
  return (
    <div className={`tile flex min-h-44 flex-col gap-4 p-5 ${className}`}>
      <p className="tile-label">{t(name)}</p>
      <div className="flex flex-1 items-center justify-center pb-4">{children}</div>
    </div>
  )
}

function Modules() {
  const [level, setLevel] = React.useState(64)
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Module index="01" name={{ en: "Switch", zh: "开关" }}>
        <div className="flex items-center gap-3">
          <Switch defaultChecked aria-label="Power" />
          <Switch aria-label="Sync" />
        </div>
      </Module>
      <Module index="02" name={{ en: "Slider", zh: "滑块" }}>
        <div className="flex w-full max-w-56 items-center gap-3">
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
 * The first screen is centred type on a white page: headline, one line of lede, the install command
 * and two actions, then a row of live parts on grey tiles, so the first thing a visitor touches is a
 * real component.
 */
export function Hero() {
  const t = useT()
  return (
    <section aria-labelledby="hero-title" className={`${FRAME} pt-16 pb-16 sm:pt-24 lg:pb-24`}>
      {/* Painted on the first frame: nothing on the first screen waits for the island to hydrate or animate in. */}
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <h1 id="hero-title" className="font-heading text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-6xl">
          {t({ en: "React components for app interfaces", zh: "为应用界面而做的 React 组件" })}
        </h1>
        <p className="max-w-xl text-lg text-pretty text-muted-foreground">
          {t({ en: "Accessible, animated and themed. The source lands in your app, ready to edit.", zh: "无障碍、带动效、可换主题。源码直接放进你的项目，随时修改。" })}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button size="lg" nativeButton={false} render={<Link href="/docs" />}>
            {t({ en: "Get started", zh: "开始使用" })}
            <ArrowRightIcon data-icon="inline-end" className="rtl:-scale-x-100" />
          </Button>
          <Button size="lg" variant="secondary" nativeButton={false} render={<Link href="/docs/components" />}>
            {t({ en: "Browse components", zh: "浏览组件" })}
          </Button>
        </div>
        <CommandCopy command={COMMAND} className="w-full max-w-md" />
      </div>
      <div className="mt-16">
        <Modules />
      </div>
    </section>
  )
}
