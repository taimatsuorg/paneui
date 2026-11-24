"use client"

import * as React from "react"

import { Button } from "@paneui/ui/components/button"
import {
  GeneratedAvatar,
  GeneratedAvatarImage,
  createGeneratedAvatar,
  getAvatarBackdrops,
  getAvatarExpressions,
  getAvatarSilhouettes,
  getAvatarTones,
  resolveAvatarTraits,
  type AvatarBackdrop,
  type AvatarExpression,
  type AvatarSilhouette,
  type AvatarTone,
} from "@paneui/ui/components/generated-avatar"
import { Input } from "@paneui/ui/components/input"
import { localeLabels, useLocale, type LocaleLabels } from "@paneui/ui/components/locale-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paneui/ui/components/select"
import { Slider } from "@paneui/ui/components/slider"
import { Tabs, TabsList, TabsTab } from "@paneui/ui/components/tabs"
import { CheckIcon, CopyIcon, DownloadIcon, RefreshIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"

/*
 * Avatar generator for deterministic geometric avatars: seed field with shuffle,
 * backdrop segmented control, silhouette / expression / tone pickers, hue slider,
 * a strip of seed variations, and SVG download / JSX copy. Layout uses the
 * two-layer inset card: tinted frame (rounded-2xl, p-1) around a raised panel
 * (rounded-inner = 14px).
 */

type AvatarGeneratorState = {
  seed: string
  silhouette?: AvatarSilhouette
  expression: AvatarExpression
  tone?: AvatarTone
  hue?: number
  background: AvatarBackdrop
}

const FROM_SEED = "__seed"
const VARIATIONS = 6

function randomSeed() {
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  return bytes[0].toString(36).slice(0, 6)
}

/** JSX for the current avatar, for the Copy code button. */
function toJsx({ seed, silhouette, expression, tone, hue, background }: AvatarGeneratorState) {
  const attrs = [`seed="${seed.replace(/"/g, "&quot;")}"`]
  if (silhouette) attrs.push(`silhouette="${silhouette}"`)
  if (expression !== "idle") attrs.push(`expression="${expression}"`)
  if (tone) attrs.push(`tone="${tone}"`)
  if (hue !== undefined) attrs.push(`hue={${hue}}`)
  if (background !== "none") attrs.push(`background="${background}"`)
  return `<GeneratedAvatar ${attrs.join(" ")} />`
}

function labelFor<T extends string>(items: { value: T; label: string }[], value: T, fallback: string) {
  return items.find((item) => item.value === value)?.label ?? fallback
}

type AvatarGeneratorProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  defaultSeed?: string
  defaultBackground?: AvatarBackdrop
  /** Called with the seed and overrides whenever they change; store this to redraw the same avatar. */
  onValueChange?: (state: AvatarGeneratorState) => void
}

function AvatarGenerator({
  className,
  defaultSeed = "paneui",
  defaultBackground = "none",
  onValueChange,
  ...props
}: AvatarGeneratorProps) {
  const l10n: LocaleLabels = useLocale().labels ?? localeLabels.en
  const backdrops = getAvatarBackdrops(l10n)
  const silhouettes = getAvatarSilhouettes(l10n)
  const expressions = getAvatarExpressions(l10n)
  const tones = getAvatarTones(l10n)

  const [state, setState] = React.useState<AvatarGeneratorState>({
    seed: defaultSeed,
    expression: "idle",
    background: defaultBackground,
  })
  const [copied, setCopied] = React.useState(false)
  const seedId = React.useId()

  const update = (patch: Partial<AvatarGeneratorState>) => {
    const next = { ...state, ...patch }
    setState(next)
    onValueChange?.(next)
  }

  const avatarOptions = {
    seed: state.seed,
    silhouette: state.silhouette,
    expression: state.expression,
    tone: state.tone,
    hue: state.hue,
    background: state.background,
  }
  const resolved = resolveAvatarTraits(avatarOptions)

  const download = () => {
    const svg = createGeneratedAvatar(avatarOptions).toString(512)
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `avatar-${state.seed || "seed"}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toJsx(state))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  const silhouetteItems = [
    { value: FROM_SEED, label: l10n.seedPart(labelFor(silhouettes, resolved.silhouette, resolved.silhouette)) },
    ...silhouettes,
  ]
  const toneItems = [
    { value: FROM_SEED, label: l10n.seedPart(labelFor(tones, resolved.tone, resolved.tone)) },
    ...tones,
  ]

  return (
    <div
      data-slot="avatar-generator"
      className={cn("@container/avatar-generator frame-2xl frame-p-1 w-full max-w-2xl bg-muted shadow-raised dark:bg-background", className)}
      {...props}
    >
      <div className="grid gap-5 rounded-inner bg-card p-4 shadow-raised @xl/avatar-generator:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] @2xl/avatar-generator:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <div
            data-slot="avatar-generator-preview"
            className="flex h-44 items-center justify-center rounded-xl bg-secondary @xl/avatar-generator:aspect-square @xl/avatar-generator:h-auto"
          >
            <GeneratedAvatarImage {...avatarOptions} title={l10n.avatarFor(state.seed)} className="size-38" />
          </div>
          <div
            className="flex items-center justify-center gap-2 @xl/avatar-generator:justify-between @xl/avatar-generator:gap-0"
            role="group"
            aria-label={l10n.variations}
          >
            {Array.from({ length: VARIATIONS }, (_, i) => {
              const seed = `${state.seed}-${i + 1}`
              return (
                <button
                  key={seed}
                  type="button"
                  aria-label={l10n.useSeed(seed)}
                  onClick={() => update({ seed, silhouette: undefined, tone: undefined, hue: undefined })}
                  className="cursor-pointer rounded-full outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <GeneratedAvatar seed={seed} expression={state.expression} background={state.background} size="md" />
                </button>
              )
            })}
          </div>
        </div>

        <div className="@container/avatar-generator-controls flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={seedId} className="text-ui font-medium">
              {l10n.seed}
            </label>
            <div className="flex gap-2">
              <Input
                id={seedId}
                value={state.seed}
                spellCheck={false}
                autoComplete="off"
                placeholder={l10n.userIdEmailOrName}
                onChange={(event) => update({ seed: event.target.value })}
              />
              <Button
                variant="outline"
                onClick={() => update({ seed: randomSeed(), silhouette: undefined, tone: undefined, hue: undefined })}
                aria-label={l10n.shuffleSeed}
              >
                <RefreshIcon data-icon="inline-start" />
                {l10n.shuffle}
              </Button>
            </div>
            <p className="text-ui-sm text-pretty text-muted-foreground">{l10n.theSameSeedAlwaysDrawsTheSameAvatar}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span id={`${seedId}-backdrop`} className="text-ui font-medium">
              {l10n.backdrop}
            </span>
            <Tabs value={state.background} onValueChange={(value) => update({ background: value as AvatarBackdrop })}>
              <TabsList aria-labelledby={`${seedId}-backdrop`} className="w-full">
                {backdrops.map((item) => (
                  <TabsTab key={item.value} value={item.value} className="flex-1">
                    {item.label}
                  </TabsTab>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-x-2 gap-y-2 @2xs/avatar-generator-controls:grid-cols-2 @2xs/avatar-generator-controls:gap-y-3">
            <div className="grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] items-center gap-2 @2xs/avatar-generator-controls:flex @2xs/avatar-generator-controls:flex-col @2xs/avatar-generator-controls:items-stretch @2xs/avatar-generator-controls:gap-1.5">
              <span className="text-ui-sm text-muted-foreground">{l10n.silhouette}</span>
              <Select
                items={silhouetteItems}
                value={state.silhouette ?? FROM_SEED}
                onValueChange={(value) => update({ silhouette: value === FROM_SEED ? undefined : (value as AvatarSilhouette) })}
              >
                <SelectTrigger size="sm" aria-label={l10n.silhouette} className="min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {silhouetteItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] items-center gap-2 @2xs/avatar-generator-controls:flex @2xs/avatar-generator-controls:flex-col @2xs/avatar-generator-controls:items-stretch @2xs/avatar-generator-controls:gap-1.5">
              <span className="text-ui-sm text-muted-foreground">{l10n.expression}</span>
              <Select
                items={expressions}
                value={state.expression}
                onValueChange={(value) => update({ expression: value as AvatarExpression })}
              >
                <SelectTrigger size="sm" aria-label={l10n.expression} className="min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expressions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] items-center gap-2 @2xs/avatar-generator-controls:flex @2xs/avatar-generator-controls:flex-col @2xs/avatar-generator-controls:items-stretch @2xs/avatar-generator-controls:gap-1.5">
              <span className="text-ui-sm text-muted-foreground">{l10n.tone}</span>
              <Select
                items={toneItems}
                value={state.tone ?? FROM_SEED}
                onValueChange={(value) => update({ tone: value === FROM_SEED ? undefined : (value as AvatarTone) })}
              >
                <SelectTrigger size="sm" aria-label={l10n.tone} className="min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toneItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] items-center gap-2 @2xs/avatar-generator-controls:flex @2xs/avatar-generator-controls:flex-col @2xs/avatar-generator-controls:items-stretch @2xs/avatar-generator-controls:gap-1.5">
              <span className="text-ui-sm text-muted-foreground">{l10n.hue}</span>
              <div className="flex h-7 min-w-0 items-center gap-2">
                <Slider
                  size="sm"
                  min={0}
                  max={360}
                  step={1}
                  value={state.hue ?? resolved.hue}
                  onValueChange={(value) => update({ hue: Array.isArray(value) ? value[0] : value })}
                  aria-label={l10n.hue}
                  className="min-w-0 flex-1"
                />
                <span className="w-8 shrink-0 text-end text-ui-xs text-muted-foreground tabular-nums">{resolved.hue}°</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={state.hue === undefined}
                  onClick={() => update({ hue: undefined })}
                  aria-label={l10n.reset}
                >
                  <RefreshIcon />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap justify-end gap-2 pt-1">
            <Button variant="outline" onClick={download} className="grow @sm/avatar-generator-controls:grow-0">
              <DownloadIcon data-icon="inline-start" />
              {l10n.downloadSVG}
            </Button>
            <Button onClick={copy} aria-live="polite" className="grow @sm/avatar-generator-controls:grow-0">
              <span className="relative inline-grid shrink-0 place-items-center *:col-start-1 *:row-start-1 *:transition-[opacity,scale,filter] *:duration-300 *:ease-[cubic-bezier(0.22,1,0.36,1)]">
                <CheckIcon className={!copied ? "opacity-0 motion-safe:scale-25 motion-safe:blur-xs" : undefined} />
                <CopyIcon className={copied ? "opacity-0 motion-safe:scale-25 motion-safe:blur-xs" : undefined} />
              </span>
              {copied ? l10n.copied : l10n.copyCode}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { AvatarGenerator, type AvatarGeneratorProps, type AvatarGeneratorState }
