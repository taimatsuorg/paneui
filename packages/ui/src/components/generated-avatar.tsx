import { blobatar, traits, type BlobatarOptions, type Palette, type TraitOverrides } from "blobatar"
import {
  happy,
  idle,
  love,
  mad,
  sad,
  scared,
  shy,
  sick,
  sleepy,
  smug,
  surprised,
  thinking,
  unsure,
  wink,
  type Expression,
} from "blobatar/expression"
import * as React from "react"

import { Avatar, type AvatarShape, type AvatarSize } from "@paneui/ui/components/avatar"
import { localeLabels, type LocaleLabels } from "@paneui/ui/components/locale-provider"
import { cn } from "@paneui/ui/lib/utils"

/*
 * Deterministic geometric avatars from a seed (author and MIT notice in
 * THIRD_PARTY_NOTICES.md). The same seed draws the same figure on the
 * server and the client alike; nothing is fetched.
 */

type AvatarSilhouette = "round" | "organic" | "boxy" | "capsule" | "nub" | "cloud" | "droplet" | "hexagon" | "sun" | "triangle"
type AvatarTone = "pastel" | "pale" | "mid" | "deep" | "bright" | "ink"
type AvatarExpression =
  | "idle"
  | "happy"
  | "sad"
  | "mad"
  | "surprised"
  | "wink"
  | "sleepy"
  | "smug"
  | "unsure"
  | "scared"
  | "love"
  | "shy"
  | "sick"
  | "thinking"
type AvatarBackdrop = "none" | "square" | "circle" | "squircle"
type AvatarColors = Partial<Record<"background" | "head" | "eye", string>>

type AvatarOptionItem<T extends string = string> = {
  value: T
  label: string
}

type ResolvedAvatarTraits = {
  silhouette: AvatarSilhouette
  tone: AvatarTone
  hue: number
  expression: AvatarExpression | "custom"
  background: AvatarBackdrop
}

type GeneratedAvatarOptions = {
  /** Any stable string, such as a user id, email, or username. */
  seed: string
  /** Pins one of the ten silhouettes. Omitting lets the seed pick. */
  silhouette?: AvatarSilhouette
  /** Pose expression by name or an expression value imported from `blobatar/expression`. */
  expression?: AvatarExpression | Expression
  /** `none` leaves the SVG transparent; `square`, `circle`, or `squircle` adds a contrast-checked plate; any hex/CSS colour fills a square plate. */
  background?: AvatarBackdrop | "transparent" | (string & {})
  /** Locks hue in degrees (0–360) while keeping silhouette and proportions from the seed. */
  hue?: number
  /** Locks the tone swatch (`pastel`, `pale`, `mid`, `deep`, `bright`, `ink`) or a 0–0.999 ramp position. */
  tone?: AvatarTone | number
  /** Explicit colour overrides for `background`, `head`, or `eye`. Overridden slots bypass contrast adjustments. */
  colors?: AvatarColors
  /** Low-level 0–1 trait overrides passed straight through. */
  traits?: TraitOverrides
  /** Enforces minimum WCAG contrast ratios (4.5:1 eyes on body). Defaults to `true`. */
  contrast?: boolean
  /** Applies Unicode NFC + trim + lowercase normalisation to `seed`. Defaults to `true`. */
  normalize?: boolean
}

const VIEWBOX = "0 0 100 100"

const SILHOUETTE_BANDS: readonly { name: AvatarSilhouette; edge: number; value: number; key: keyof LocaleLabels }[] = [
  { name: "round", edge: 0.22, value: 0.11, key: "avatarShapeRound" },
  { name: "organic", edge: 0.48, value: 0.35, key: "avatarShapeOrganic" },
  { name: "boxy", edge: 0.6, value: 0.54, key: "avatarShapeBoxy" },
  { name: "capsule", edge: 0.7, value: 0.65, key: "avatarShapeCapsule" },
  { name: "nub", edge: 0.79, value: 0.745, key: "avatarShapeNub" },
  { name: "cloud", edge: 0.86, value: 0.825, key: "avatarShapeCloud" },
  { name: "droplet", edge: 0.915, value: 0.8875, key: "avatarShapeDroplet" },
  { name: "hexagon", edge: 0.95, value: 0.9325, key: "avatarShapeHexagon" },
  { name: "sun", edge: 0.98, value: 0.965, key: "avatarShapeSun" },
  { name: "triangle", edge: 1, value: 0.99, key: "avatarShapeTriangle" },
]

const TONE_BANDS: readonly { name: AvatarTone; edge: number; value: number; key: keyof LocaleLabels }[] = [
  { name: "pastel", edge: 0.2, value: 0.1, key: "avatarTonePastel" },
  { name: "pale", edge: 0.36, value: 0.28, key: "avatarTonePale" },
  { name: "mid", edge: 0.62, value: 0.49, key: "avatarToneMid" },
  { name: "deep", edge: 0.8, value: 0.71, key: "avatarToneDeep" },
  { name: "bright", edge: 0.93, value: 0.865, key: "avatarToneBright" },
  { name: "ink", edge: 1, value: 0.965, key: "avatarToneInk" },
]

const EXPRESSION_META: readonly { name: AvatarExpression; value: Expression; key: keyof LocaleLabels }[] = [
  { name: "idle", value: idle, key: "avatarExprIdle" },
  { name: "happy", value: happy, key: "avatarExprHappy" },
  { name: "sad", value: sad, key: "avatarExprSad" },
  { name: "mad", value: mad, key: "avatarExprMad" },
  { name: "surprised", value: surprised, key: "avatarExprSurprised" },
  { name: "wink", value: wink, key: "avatarExprWink" },
  { name: "sleepy", value: sleepy, key: "avatarExprSleepy" },
  { name: "smug", value: smug, key: "avatarExprSmug" },
  { name: "unsure", value: unsure, key: "avatarExprUnsure" },
  { name: "scared", value: scared, key: "avatarExprScared" },
  { name: "love", value: love, key: "avatarExprLove" },
  { name: "shy", value: shy, key: "avatarExprShy" },
  { name: "sick", value: sick, key: "avatarExprSick" },
  { name: "thinking", value: thinking, key: "avatarExprThinking" },
]

const EXPRESSIONS: Record<AvatarExpression, Expression> = Object.fromEntries(
  EXPRESSION_META.map((item) => [item.name, item.value])
) as Record<AvatarExpression, Expression>

function silhouetteValue(name: AvatarSilhouette) {
  return SILHOUETTE_BANDS.find((band) => band.name === name)?.value ?? 0.11
}

function silhouetteFromRatio(value: number): AvatarSilhouette {
  return (SILHOUETTE_BANDS.find((band) => value < band.edge) ?? SILHOUETTE_BANDS[0]).name
}

function toneValue(tone: AvatarTone | number): number {
  if (typeof tone === "number") return Math.min(0.999, Math.max(0, tone))
  return TONE_BANDS.find((band) => band.name === tone)?.value ?? 0.1
}

function toneFromRatio(value: number): AvatarTone {
  return (TONE_BANDS.find((band) => value < band.edge) ?? TONE_BANDS[0]).name
}

function normalizeColor(value: string) {
  return /^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value) ? `#${value}` : value
}

/** Localised silhouette options in canonical order, for building your own pickers. */
function getAvatarSilhouettes(l10n: LocaleLabels = localeLabels.en): AvatarOptionItem<AvatarSilhouette>[] {
  return SILHOUETTE_BANDS.map((band) => ({ value: band.name, label: String(l10n[band.key]) }))
}

/** Localised expression options in canonical order, for building your own pickers. */
function getAvatarExpressions(l10n: LocaleLabels = localeLabels.en): AvatarOptionItem<AvatarExpression>[] {
  return EXPRESSION_META.map((item) => ({ value: item.name, label: String(l10n[item.key]) }))
}

/** Localised tone swatch options from pastel to ink. */
function getAvatarTones(l10n: LocaleLabels = localeLabels.en): AvatarOptionItem<AvatarTone>[] {
  return TONE_BANDS.map((band) => ({ value: band.name, label: String(l10n[band.key]) }))
}

/** Localised backdrop shape options (`none`, `squircle`, `circle`, `square`). */
function getAvatarBackdrops(l10n: LocaleLabels = localeLabels.en): AvatarOptionItem<AvatarBackdrop>[] {
  return [
    { value: "none", label: l10n.none },
    { value: "squircle", label: l10n.squircle },
    { value: "circle", label: l10n.circle },
    { value: "square", label: l10n.square },
  ]
}

function resolveExpressionOption(expression: GeneratedAvatarOptions["expression"]): {
  name: AvatarExpression | "custom"
  value?: Expression
} {
  if (!expression || expression === "idle") return { name: "idle" }
  if (typeof expression === "string") {
    return { name: expression, value: EXPRESSIONS[expression] }
  }
  const matched = EXPRESSION_META.find((item) => item.value === expression)
  return { name: matched ? matched.name : "custom", value: expression }
}

function toBlobatarOptions(options: GeneratedAvatarOptions): {
  rendererOptions: BlobatarOptions
  resolvedBackdrop: AvatarBackdrop
  resolvedExpression: AvatarExpression | "custom"
  mergedTraits: TraitOverrides | undefined
} {
  const { silhouette, expression, background, hue, tone, colors, traits: traitOverrides, contrast, normalize } = options

  const mergedTraits: TraitOverrides | undefined =
    silhouette || traitOverrides
      ? {
          ...traitOverrides,
          ...(silhouette ? { shape: silhouetteValue(silhouette) } : {}),
        }
      : undefined

  let resolvedBg: BlobatarOptions["background"] = false
  let resolvedBackdrop: AvatarBackdrop = "none"
  const palette: Palette = {}

  if (background === "square" || background === "circle" || background === "squircle") {
    const backdropShape = background as Exclude<AvatarBackdrop, "none">
    resolvedBg = backdropShape
    resolvedBackdrop = backdropShape
  } else if (background && background !== "none" && background !== "transparent") {
    resolvedBg = "square"
    resolvedBackdrop = "square"
    palette.bg = normalizeColor(background)
  } else if (background === undefined && colors?.background) {
    resolvedBg = "square"
    resolvedBackdrop = "square"
  }

  if (colors?.background) palette.bg = normalizeColor(colors.background)
  if (colors?.head) palette.head = normalizeColor(colors.head)
  if (colors?.eye) palette.eye = normalizeColor(colors.eye)

  const expr = resolveExpressionOption(expression)
  const rendererOptions: BlobatarOptions = {
    background: resolvedBg,
    ...(Object.keys(palette).length ? { palette } : {}),
    ...(hue !== undefined ? { hue } : {}),
    ...(tone !== undefined ? { tone: toneValue(tone) } : {}),
    ...(mergedTraits ? { traits: mergedTraits } : {}),
    ...(expr.value ? { expression: expr.value } : {}),
    ...(contrast !== undefined ? { contrast } : {}),
    ...(normalize !== undefined ? { normalize } : {}),
  }

  return {
    rendererOptions,
    resolvedBackdrop,
    resolvedExpression: expr.name,
    mergedTraits,
  }
}

/** Resolves the seed and overrides into the silhouette, tone, hue, expression and backdrop values drawn. */
function resolveAvatarTraits(options: GeneratedAvatarOptions): ResolvedAvatarTraits {
  const { resolvedBackdrop, resolvedExpression, mergedTraits } = toBlobatarOptions(options)
  const t = traits(options.seed, options.normalize ?? true, mergedTraits)
  const hue = options.hue !== undefined ? Math.round(options.hue) : Math.round(t.num("hue", 0, 360)) % 360
  const tonePos = options.tone !== undefined ? toneValue(options.tone) : t("tone")
  return {
    silhouette: options.silhouette ?? silhouetteFromRatio(t("shape")),
    tone: toneFromRatio(tonePos),
    hue,
    expression: resolvedExpression,
    background: resolvedBackdrop,
  }
}

/** Strips only the outer `<svg>` wrapper because the rendered output contains pure geometry without defs or element ids. */
function innerMarkup(svg: string) {
  return svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "")
}

/**
 * Framework-free avatar builder. Returns the resolved trait values, inner SVG markup
 * and viewBox, plus `toString(size?)` and `toDataUri(size?)` for downloads or `<img>`.
 */
function createGeneratedAvatar(options: GeneratedAvatarOptions) {
  const { rendererOptions } = toBlobatarOptions(options)
  const resolved = resolveAvatarTraits(options)
  const svg = blobatar(options.seed, rendererOptions)
  const content = innerMarkup(svg)
  const toString = (size = 256) => blobatar(options.seed, { ...rendererOptions, size })

  return {
    resolved,
    viewBox: VIEWBOX,
    content,
    toString,
    toDataUri: (size?: number) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(toString(size))}`,
  }
}

type GeneratedAvatarImageProps = GeneratedAvatarOptions &
  Omit<React.ComponentProps<"svg">, "children" | "dangerouslySetInnerHTML"> & {
    /** Accessible name. Without it the avatar is decorative (`aria-hidden`), right next to a visible name. */
    title?: string
  }

function useGeneratedAvatar(options: GeneratedAvatarOptions) {
  const { seed, silhouette, expression, background, hue, tone, colors, traits: traitOverrides, contrast, normalize } = options
  const colorsKey = JSON.stringify(colors)
  const traitsKey = JSON.stringify(traitOverrides)
  return React.useMemo(() => {
    const parsedColors = colorsKey ? (JSON.parse(colorsKey) as AvatarColors) : undefined
    const parsedTraits = traitsKey ? (JSON.parse(traitsKey) as TraitOverrides) : undefined
    return createGeneratedAvatar({
      seed,
      silhouette,
      expression,
      background,
      hue,
      tone,
      colors: parsedColors,
      traits: parsedTraits,
      contrast,
      normalize,
    })
  }, [seed, silhouette, expression, background, hue, tone, colorsKey, traitsKey, contrast, normalize])
}

/**
 * Just the drawing as a bare `<svg>` that fills its box. Use it inside your own
 * frame, such as the `AvatarFallback` of a photo avatar.
 */
function GeneratedAvatarImage({
  seed,
  silhouette,
  expression,
  background,
  hue,
  tone,
  colors,
  traits: traitOverrides,
  contrast,
  normalize,
  title,
  className,
  ...props
}: GeneratedAvatarImageProps) {
  const avatar = useGeneratedAvatar({
    seed,
    silhouette,
    expression,
    background,
    hue,
    tone,
    colors,
    traits: traitOverrides,
    contrast,
    normalize,
  })
  return (
    <svg
      data-slot="generated-avatar"
      data-silhouette={avatar.resolved.silhouette}
      viewBox={avatar.viewBox}
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      className={cn("size-full overflow-hidden rounded-[inherit]", className)}
      dangerouslySetInnerHTML={{ __html: (title ? `<title>${escapeText(title)}</title>` : "") + avatar.content }}
      {...props}
      aria-label={props["aria-label"] ?? title}
    />
  )
}

type GeneratedAvatarProps = GeneratedAvatarOptions &
  Omit<React.ComponentProps<typeof Avatar>, "size" | "render"> & {
    /** An `Avatar` size, or a pixel size for big previews. Defaults to the enclosing `AvatarGroup`'s size, else `md`. */
    size?: AvatarSize | number
    shape?: AvatarShape
    /** Accessible name. Without it the avatar is decorative (`aria-hidden`), right next to a visible name. */
    title?: string
  }

/** A deterministic geometric avatar drawn from `seed` inside an `Avatar` frame. Children (e.g. `AvatarStatus`) render on top. */
function GeneratedAvatar({
  seed,
  silhouette,
  expression,
  background,
  hue,
  tone,
  colors,
  traits: traitOverrides,
  contrast,
  normalize,
  size,
  shape,
  title,
  className,
  style,
  children,
  ...props
}: GeneratedAvatarProps) {
  const pixelSize = typeof size === "number" ? size : undefined
  return (
    <Avatar
      size={pixelSize ? undefined : (size as AvatarSize)}
      shape={shape}
      className={className}
      style={pixelSize ? { width: pixelSize, height: pixelSize, ...style } : style}
      {...props}
    >
      <GeneratedAvatarImage
        seed={seed}
        silhouette={silhouette}
        expression={expression}
        background={background}
        hue={hue}
        tone={tone}
        colors={colors}
        traits={traitOverrides}
        contrast={contrast}
        normalize={normalize}
        title={title}
      />
      {children}
    </Avatar>
  )
}

function escapeText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export {
  GeneratedAvatar,
  GeneratedAvatarImage,
  createGeneratedAvatar,
  resolveAvatarTraits,
  getAvatarSilhouettes,
  getAvatarExpressions,
  getAvatarTones,
  getAvatarBackdrops,
  type AvatarSilhouette,
  type AvatarTone,
  type AvatarExpression,
  type AvatarBackdrop,
  type AvatarColors,
  type AvatarOptionItem,
  type ResolvedAvatarTraits,
  type GeneratedAvatarOptions,
  type GeneratedAvatarProps,
  type GeneratedAvatarImageProps,
}
