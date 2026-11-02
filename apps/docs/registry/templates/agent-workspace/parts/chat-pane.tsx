"use client"

import * as React from "react"

import { FolderIcon, GitBranchIcon, GitPullRequestIcon, ShieldIcon } from "@paneui/ui/icons"
import { AgentComposer, AgentComposerBanner } from "@paneui/ui/blocks/agent-composer/agent-composer"
import { Loader } from "@paneui/ui/components/loader"
import { MessageScroller } from "@paneui/ui/components/message-scroller"
import { EffortPicker, ModelPicker, ModePicker, ThinkingModelPicker, type ModelOption } from "@paneui/ui/components/model-picker"
import { Skeleton } from "@paneui/ui/components/skeleton"
import { TodoList } from "@paneui/ui/components/todo-list"

import { configByCategory, flatOptions, type AcpClient, type ClientState, type SessionState, type TimelineItem } from "../acp/client"
import { modelProvider, ProviderIcon } from "./provider-icon"
import type { ThreadSummary } from "./threads-sidebar"
import { Timeline } from "./turn-timeline"

const isRisky = (id: string, name: string) => /full|bypass|yolo|danger/i.test(`${id} ${name}`)

type SelectConfig = NonNullable<ReturnType<typeof configByCategory>>

/** The model list of a session's model option, with each vendor's mark. */
function modelOptions(model: SelectConfig): ModelOption[] {
  return flatOptions(model.options).map((o) => ({
    id: o.value,
    name: o.name,
    provider: o.group,
    icon: <ProviderIcon provider={o.group?.toLowerCase() ?? modelProvider(o.value)} />,
  }))
}

/** Model and effort of a session, for a composer that has no session yet (a new chat). */
export function sessionModelChoice(session: SessionState | undefined) {
  const model = configByCategory(session, "model")
  const effort = configByCategory(session, "thought_level")
  if (!model || !effort) return null
  return {
    models: modelOptions(model),
    levels: flatOptions(effort.options).map((o) => ({ value: o.value, label: o.name })),
    model: model.currentValue,
    effort: effort.currentValue,
    modelId: model.id,
    effortId: effort.id,
  }
}

/**
 * A thread with no turns yet. The prompt sits at the foot of the column, just above the composer
 * it points to, with the workspace and branch the agent will work in.
 */
function EmptyState({ thread, cwd }: { thread?: ThreadSummary; cwd: string }) {
  return (
    <div className="flex flex-1 flex-col justify-end gap-2 pt-16 pb-2">
      <ProviderIcon provider={thread?.provider} className="mb-2 size-6" />
      <h2 className="text-xl font-semibold tracking-tight text-balance">What should we work on?</h2>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-ui text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1.5">
          <FolderIcon className="size-3.5 shrink-0" />
          <span className="truncate">{cwd || "No workspace"}</span>
        </span>
        {thread?.branch && (
          <span className="flex min-w-0 items-center gap-1.5">
            <GitBranchIcon className="size-3.5 shrink-0" />
            <span className="truncate">{thread.branch}</span>
          </span>
        )}
      </p>
    </div>
  )
}

/**
 * A thread on its way in: the shape of one turn (a prompt on the right, an answer on the left)
 * on the timeline's own column, so nothing jumps when the replay lands.
 */
function ThreadSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-6 py-2">
      <Skeleton className="h-10 w-3/5 self-end" />
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-4/6" />
      </div>
      <Skeleton shape="card" className="h-28 w-full" />
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  )
}

export function ChatPane({
  client,
  state,
  session,
  thread,
  focused,
  onFocus,
  showAutofix,
  onDismissAutofix,
  onReview,
  onFork,
  onReveal,
}: {
  client: AcpClient
  state: ClientState
  session: SessionState | undefined
  thread?: ThreadSummary
  focused: boolean
  onFocus: () => void
  showAutofix: boolean
  onDismissAutofix: () => void
  onReview: (files: Extract<TimelineItem, { kind: "edits" }>["files"]) => void
  onFork: (text: string) => void
  onReveal: (path: string) => void
}) {
  const composerRef = React.useRef<HTMLTextAreaElement>(null)
  const [autofixOn, setAutofixOn] = React.useState(false)

  React.useEffect(() => {
    if (focused) composerRef.current?.focus({ preventScroll: true })
  }, [focused, session?.id])

  if (!session) {
    return (
      <div className="mx-auto h-full w-full max-w-3xl overflow-hidden px-5 pt-5">
        <ThreadSkeleton label="Loading thread" />
      </div>
    )
  }

  const working = session.status === "working"
  const model = configByCategory(session, "model")
  const effort = configByCategory(session, "thought_level")
  const modes = session.modes
  const plan = session.plan
  const showPlan = plan.length > 0 && (working || plan.some((p) => p.status !== "completed"))

  const header =
    showPlan || (showAutofix && thread?.pr) ? (
      <>
        {showPlan && (
          <TodoList
            title="Plan"
            items={plan.map((p, i) => ({
              id: String(i),
              title: p.content,
              status: p.status === "completed" ? "done" : p.status === "in_progress" ? "in-progress" : "pending",
            }))}
            maxHeight={160}
          />
        )}
        {showAutofix && thread?.pr && (
          <AgentComposerBanner
            icon={<GitPullRequestIcon />}
            title={autofixOn ? `Auto-fix is on for #${thread.pr.number}.` : "Want to turn on auto-fix for this PR?"}
            actionLabel={autofixOn ? undefined : "Turn on"}
            onAction={() => setAutofixOn(true)}
            onDismiss={onDismissAutofix}
          />
        )}
      </>
    ) : undefined

  return (
    <div className="flex h-full min-w-0 flex-col" onPointerDownCapture={onFocus} onFocusCapture={onFocus}>
      <MessageScroller
        key={session.id}
        className="min-h-0 flex-1"
        viewportClassName="scrollbar-thin"
        contentClassName="mx-auto flex min-h-full w-full max-w-3xl flex-col px-5 pt-5 pb-8"
        jumpButton="icon"
        jumpLabel="Scroll to bottom"
      >
        {session.status === "loading" ? (
          <ThreadSkeleton label="Replaying thread" />
        ) : session.timeline.length === 0 ? (
          <EmptyState thread={thread} cwd={session.cwd} />
        ) : (
          <Timeline session={session} terminals={state.terminals} client={client} onReview={onReview} onFork={onFork} onReveal={onReveal} />
        )}
      </MessageScroller>
      <div className="shrink-0 px-4 pb-3">
        <div className="mx-auto w-full max-w-3xl">
          <AgentComposer
            ref={composerRef}
            busy={working}
            onSubmit={(text) => void client.prompt(session.id, text)}
            onStop={() => void client.cancel(session.id)}
            mentions={state.files.map((f) => ({ value: f }))}
            commands={session.commands.map((c) => ({ name: c.name, description: c.description, hint: c.input?.hint }))}
            onVoice={() => composerRef.current?.focus()}
            header={header}
            toolbarStart={
              modes && modes.availableModes.length > 0 ? (
                <ModePicker
                  label="Access"
                  value={modes.currentModeId}
                  onValueChange={(id) => void client.setMode(session.id, id)}
                  modes={modes.availableModes.map((m) => ({
                    id: m.id,
                    name: m.name,
                    description: m.description ?? undefined,
                    icon: <ShieldIcon />,
                    tone: isRisky(m.id, m.name) ? "warning" : "default",
                  }))}
                />
              ) : null
            }
            toolbarEnd={
              <>
                {working && <Loader variant="ring" size="sm" label="Agent is working" className="mr-0.5 size-3.5 text-muted-foreground" />}
                {model && effort ? (
                  <ThinkingModelPicker
                    value={model.currentValue}
                    onValueChange={(v) => void client.setConfigOption(session.id, model.id, v)}
                    models={modelOptions(model)}
                    levels={flatOptions(effort.options).map((o) => ({ value: o.value, label: o.name }))}
                    effort={effort.currentValue}
                    onEffortChange={(v) => void client.setConfigOption(session.id, effort.id, v)}
                    align="end"
                  />
                ) : model ? (
                  <ModelPicker
                    value={model.currentValue}
                    onValueChange={(v) => void client.setConfigOption(session.id, model.id, v)}
                    models={modelOptions(model)}
                    align="end"
                  />
                ) : session.models ? (
                  <ModelPicker
                    value={session.models.currentModelId}
                    onValueChange={(v) => void client.setModel(session.id, v)}
                    models={session.models.availableModels.map((m) => {
                      const provider = modelProvider(m.modelId) ?? modelProvider(m.name)
                      return { id: m.modelId, name: m.name, icon: provider ? <ProviderIcon provider={provider} /> : undefined }
                    })}
                    align="end"
                  />
                ) : null}
                {effort && !model && (
                  <EffortPicker
                    value={effort.currentValue}
                    onValueChange={(v) => void client.setConfigOption(session.id, effort.id, v)}
                    levels={flatOptions(effort.options).map((o) => ({ value: o.value, label: o.name }))}
                    align="end"
                  />
                )}
              </>
            }
          />
        </div>
      </div>
    </div>
  )
}
