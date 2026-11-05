"use client"

import * as React from "react"

import { CheckIcon, ChevronDownIcon, FolderIcon } from "@paneui/ui/icons"
import { AgentComposer } from "@paneui/ui/blocks/agent-composer/agent-composer"
import { Button } from "@paneui/ui/components/button"
import { Menu, MenuContent, MenuGroup, MenuItem, MenuLabel, MenuTrigger } from "@paneui/ui/components/menu"
import { ThinkingModelPicker, type EffortLevel, type ModelOption } from "@paneui/ui/components/model-picker"

import { ProviderIcon } from "./provider-icon"

const STARTERS = ["Explain this project", "Fix a failing test", "Write tests for my last change"]

export type ModelChoice = { models: ModelOption[]; levels: EffortLevel[]; model: string; effort: string }

/**
 * A chat that hasn't started. The question sits in the open space; the composer sits exactly where
 * a thread's composer does, so sending doesn't move it. Starters fill the composer instead of
 * sending, so they can be edited first.
 */
export function NewChat({
  provider,
  ready,
  projects,
  project,
  onProjectChange,
  choice,
  onChoiceChange,
  onSubmit,
  composerRef,
}: {
  provider?: string
  ready: boolean
  projects: string[]
  project: string
  onProjectChange: (project: string) => void
  choice: ModelChoice | null
  onChoiceChange: (choice: ModelChoice) => void
  onSubmit: (text: string) => void
  composerRef?: React.Ref<HTMLTextAreaElement>
}) {
  const [text, setText] = React.useState("")
  const inner = React.useRef<HTMLTextAreaElement>(null)
  React.useImperativeHandle(composerRef, () => inner.current as HTMLTextAreaElement)

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-5 py-10 text-center">
        <ProviderIcon provider={provider} className="size-7" />
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance">What should we build?</h2>
      </div>
      <div className="shrink-0 px-4 pb-3">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          <div className="flex flex-wrap gap-1.5" aria-label="Starters" role="group">
            {STARTERS.map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  setText(s)
                  requestAnimationFrame(() => inner.current?.focus())
                }}
              >
                {s}
              </Button>
            ))}
          </div>
          <AgentComposer
            ref={inner}
            value={text}
            onValueChange={setText}
            disabled={!ready}
            placeholder={ready ? "Ask anything, @ to add files" : "Connecting to the agent…"}
            onSubmit={(t) => {
              setText("")
              onSubmit(t)
            }}
            onVoice={() => inner.current?.focus()}
            toolbarStart={
              <Menu>
                <MenuTrigger render={<Button variant="ghost" size="xs" className="min-w-0 text-muted-foreground" aria-label={`Project, ${project}`} />}>
                  <FolderIcon data-icon="inline-start" />
                  <span className="truncate font-normal">{project}</span>
                  <ChevronDownIcon data-icon="inline-end" className="size-3 opacity-64" />
                </MenuTrigger>
                <MenuContent className="w-52" side="top" align="start">
                  <MenuGroup>
                    <MenuLabel>Project</MenuLabel>
                    {projects.map((p) => (
                      <MenuItem key={p} onClick={() => onProjectChange(p)}>
                        <FolderIcon />
                        <span className="min-w-0 flex-1 truncate">{p}</span>
                        {p === project && <CheckIcon className="!text-foreground" />}
                      </MenuItem>
                    ))}
                  </MenuGroup>
                </MenuContent>
              </Menu>
            }
            toolbarEnd={
              choice ? (
                <ThinkingModelPicker
                  models={choice.models}
                  value={choice.model}
                  onValueChange={(model) => onChoiceChange({ ...choice, model })}
                  levels={choice.levels}
                  effort={choice.effort}
                  onEffortChange={(effort) => onChoiceChange({ ...choice, effort })}
                  align="end"
                />
              ) : null
            }
          />
        </div>
      </div>
    </div>
  )
}
