"use client"

import * as React from "react"

import { ImageIcon, PlusIcon, SidebarIcon, SparklesIcon, StarIcon } from "@paneui/ui/icons"
import { AgentComposer } from "@paneui/ui/blocks/agent-composer/agent-composer"
import { ImageGeneration, type ImageGenerationStatus } from "@paneui/ui/components/image-generation"
import { ComposerPicker } from "@paneui/ui/components/model-picker"
import { PageHeaderTitle } from "@paneui/ui/components/page-header"
import { ScrollArea } from "@paneui/ui/components/scroll-area"
import { SidebarNav, SidebarNavContent, SidebarNavLink, SidebarNavList, SidebarNavSection } from "@paneui/ui/components/sidebar-nav"

import { ArtTile, SeededArt } from "./art-tile"
import { IconAction, SectionPanel, SectionPrimary } from "./section-panel"
import { IMAGE_STYLES } from "./workspace-data"

type Collection = "popular" | "templates" | "yours"
type Generation = { id: string; prompt: string; status: ImageGenerationStatus; aspect: string }

const ASPECTS = [
  { value: "1 / 1", label: "Square" },
  { value: "3 / 4", label: "Portrait" },
  { value: "4 / 3", label: "Landscape" },
]

const TITLES: Record<Collection, string> = { popular: "Popular", templates: "Templates", yours: "Your images" }

export function useImages() {
  const [collection, setCollection] = React.useState<Collection>("popular")
  const [generations, setGenerations] = React.useState<Generation[]>([])
  const [draft, setDraft] = React.useState("")
  const [aspect, setAspect] = React.useState(ASPECTS[0].value)
  const timers = React.useRef<number[]>([])
  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const generate = (prompt: string) => {
    const id = `img-${Date.now().toString(36)}`
    setGenerations((g) => [{ id, prompt, status: "queued", aspect }, ...g])
    setCollection("yours")
    const step = (status: ImageGenerationStatus, ms: number) =>
      timers.current.push(window.setTimeout(() => setGenerations((g) => g.map((x) => (x.id === id ? { ...x, status } : x))), ms))
    step("generating", 700)
    step("refining", 2600)
    step("complete", 4200)
  }
  return { collection, setCollection, generations, generate, draft, setDraft, aspect, setAspect }
}

export type ImagesState = ReturnType<typeof useImages>

export function ImagesSidebar({
  state,
  onHide,
  onNew,
  onNavigate,
}: {
  state: ImagesState
  onHide?: () => void
  onNew: () => void
  onNavigate?: () => void
}) {
  const go = (c: Collection) => {
    state.setCollection(c)
    onNavigate?.()
  }
  return (
    <SectionPanel
      title="Images"
      actions={
        onHide && (
          <IconAction label="Hide sidebar" shortcut="⌘B" onClick={onHide}>
            <SidebarIcon />
          </IconAction>
        )
      }
      primary={<SectionPrimary icon={<PlusIcon />} label="New image" onClick={onNew} />}
    >
      <SidebarNav indicator="fill">
        <SidebarNavContent aria-label="Image collections">
          <SidebarNavList>
            <SidebarNavLink render={<button type="button" />} className="w-full text-start" icon={<StarIcon />} active={state.collection === "popular"} onClick={() => go("popular")}>
              Popular
            </SidebarNavLink>
            <SidebarNavLink render={<button type="button" />} className="w-full text-start" icon={<SparklesIcon />} active={state.collection === "templates"} onClick={() => go("templates")}>
              Templates
            </SidebarNavLink>
            <SidebarNavLink
              render={<button type="button" />}
              className="w-full text-start"
              icon={<ImageIcon />}
              active={state.collection === "yours"}
              onClick={() => go("yours")}
              badge={state.generations.length > 0 && <span className="text-ui-xs text-muted-foreground tabular-nums">{state.generations.length}</span>}
            >
              Your images
            </SidebarNavLink>
          </SidebarNavList>
          {state.generations.length > 0 && (
            <SidebarNavSection level="label" label="Recent">
              <SidebarNavList>
                {state.generations.slice(0, 8).map((g) => (
                  <SidebarNavLink key={g.id} render={<button type="button" />} className="w-full text-start" onClick={() => go("yours")}>
                    {g.prompt}
                  </SidebarNavLink>
                ))}
              </SidebarNavList>
            </SidebarNavSection>
          )}
        </SidebarNavContent>
      </SidebarNav>
    </SectionPanel>
  )
}

/**
 * A gallery of styles with the composer floating over it. Picking a style starts the prompt
 * instead of generating straight away; a new image lands in Your images and refines in place.
 */
export function ImagesMain({
  state,
  leading,
  composerRef,
}: {
  state: ImagesState
  leading?: React.ReactNode
  composerRef?: React.Ref<HTMLTextAreaElement>
}) {
  const inner = React.useRef<HTMLTextAreaElement>(null)
  React.useImperativeHandle(composerRef, () => inner.current as HTMLTextAreaElement)
  const styles = IMAGE_STYLES.filter((s) => s.collection === state.collection)

  return (
    <div className="relative flex h-full min-w-0 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 pt-6 pb-40 md:px-8 md:pt-8">
          <div className="flex items-center gap-2">
            {leading}
            <PageHeaderTitle>{TITLES[state.collection]}</PageHeaderTitle>
          </div>
          {state.collection === "yours" ? (
            state.generations.length === 0 ? (
              <p className="text-ui text-muted-foreground">Describe an image below, or start from a style in Popular.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {state.generations.map((g) => (
                  <ImageGeneration key={g.id} status={g.status} prompt={g.prompt} aspectRatio={g.aspect} alt={g.prompt} className="max-w-none">
                    <div className="relative size-full">
                      <SeededArt seed={g.prompt} portrait={/portrait|face|person|avatar/i.test(g.prompt)} />
                    </div>
                  </ImageGeneration>
                ))}
              </div>
            )
          ) : (
            <div className="columns-2 gap-3 md:columns-3 xl:columns-4">
              {styles.map((s) => (
                <ArtTile
                  key={s.id}
                  label={s.label}
                  seed={s.seed}
                  portrait={s.portrait}
                  height={s.rows * 8}
                  onClick={() => {
                    state.setDraft(`${s.label} style, `)
                    requestAnimationFrame(() => inner.current?.focus())
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4">
        <div className="pointer-events-auto mx-auto w-full max-w-2xl">
          <AgentComposer
            ref={inner}
            value={state.draft}
            onValueChange={state.setDraft}
            placeholder="Describe an image"
            onSubmit={(t) => {
              state.setDraft("")
              state.generate(t)
            }}
            onVoice={() => inner.current?.focus()}
            toolbarEnd={<ComposerPicker label="Aspect ratio" options={ASPECTS} value={state.aspect} onValueChange={state.setAspect} align="end" />}
          />
        </div>
      </div>
    </div>
  )
}
