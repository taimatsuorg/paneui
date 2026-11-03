"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"

import { BoltIcon, CheckIcon, ChevronDownIcon, ShieldIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Button } from "@paneui/ui/components/button"
import { Kbd } from "@paneui/ui/components/kbd"
import { ReasoningEffort } from "@paneui/ui/components/reasoning-effort"
import {
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSearch,
  ComboboxSeparator,
} from "@paneui/ui/components/combobox"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { Menu, MenuContent, MenuGroup, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@paneui/ui/components/menu"

type PickerTone = "default" | "warning" | "destructive"

type PickerOption = {
  value: string
  label: string
  description?: string
  /** Leading glyph in the menu row and, when selected, on the trigger. */
  icon?: React.ReactNode
  /** Group heading; options with the same group sit together. */
  group?: string
  /** Colours the trigger while this option is selected (e.g. full access = warning). */
  tone?: PickerTone
  disabled?: boolean
}

type ComposerPickerProps = {
  options: PickerOption[]
  value?: string
  onValueChange?: (value: string) => void
  /** Accessible name of the trigger, e.g. "Model". */
  label: string
  /** Trigger glyph when the selected option has none. */
  icon?: React.ReactNode
  /** Heading above the options. */
  heading?: string
  /** Shown on the trigger when nothing is selected. */
  placeholder?: string
  side?: "top" | "bottom"
  align?: "start" | "center" | "end"
  disabled?: boolean
  className?: string
  /**
   * Extra content under the options (a "Manage models…" item). With `searchable` the list is not a
   * menu, so pass a plain button or link here instead of a `MenuItem`.
   */
  footer?: React.ReactNode
  /** A search field at the top of the list, filtering on label, value and group. Suits long lists. */
  searchable?: boolean
  /** Placeholder and accessible name of the search field. */
  searchPlaceholder?: string
  /** Shown when the search matches nothing. */
  emptyLabel?: React.ReactNode
  /** With `searchable`, show at most this many options per group until searching or "Show all". */
  maxPerGroup?: number
  /**
   * Inside a narrow `AgentComposer` (toolbar under 28rem: phones, tablets, split panes) show only the
   * glyph and chevron; the label stays the accessible name. Ignored when there is no glyph.
   * `ModePicker` and `EffortPicker` default to `true`, `ModelPicker` and `ComposerPicker` to `false`.
   */
  compact?: boolean
  /**
   * Show each option's `description` under its name. `ComposerPicker` and `ModePicker` default to `true`;
   * `ModelPicker` and `EffortPicker` default to `false`, so model and effort rows are the name alone.
   */
  showDescriptions?: boolean
  /** Extra content after the label on the trigger (a short readout of a linked setting). */
  triggerSuffix?: React.ReactNode
  /** Runs before the popup's own key handling; call `preventDefault` to claim a key. */
  onContentKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void
}

/**
 * Small ghost trigger + menu used in agent composers: shows the selected
 * option's icon and label, opens a list (with descriptions when `showDescriptions`) and a check
 * on the current choice. `ModelPicker`, `EffortPicker` and `ModePicker` are presets.
 */
function ComposerPicker(props: ComposerPickerProps) {
  if (props.searchable) return <ComposerPickerSearch {...props} />
  return <ComposerPickerMenu {...props} />
}

function groupOptions(options: PickerOption[]) {
  const map = new Map<string, PickerOption[]>()
  for (const o of options) {
    const key = o.group ?? ""
    map.set(key, [...(map.get(key) ?? []), o])
  }
  return [...map.entries()]
}

const triggerClass =
  // Shrinks (label truncates) instead of pushing the composer toolbar wider; the chevron side
  // keeps the 2px optical trim under the tighter padding.
  "min-w-0 shrink px-2 has-data-[icon=inline-end]:pe-1.5 font-normal text-muted-foreground hover:text-foreground data-[tone=destructive]:text-destructive-text data-[tone=warning]:text-warning-text"

/** Trigger props and content shared by the menu and the searchable list. */
function usePickerTrigger({ options, value, label, icon, placeholder, compact = false, className, triggerSuffix }: ComposerPickerProps) {
  const { labels } = useLocale()
  const selected = options.find((o) => o.value === value)
  const glyph = selected?.icon ?? icon
  const shown = selected?.label ?? placeholder ?? labels.select
  const button = (
    <Button
      variant="ghost"
      size="sm"
      aria-label={`${label}: ${shown}`}
      data-slot="composer-picker"
      data-tone={selected?.tone ?? "default"}
      data-compact={(compact && !!glyph) || undefined}
      className={cn(triggerClass, className)}
    />
  )
  const content = (
    <>
      {glyph && <span className="flex shrink-0 items-center [&_svg]:size-3.5">{glyph}</span>}
      <span className={cn("min-w-0 truncate", compact && glyph && "@max-md/composer-toolbar:hidden")}>{shown}</span>
      {triggerSuffix != null && (
        <span data-slot="composer-picker-suffix" className={cn("shrink-0 opacity-64", compact && glyph && "@max-md/composer-toolbar:hidden")}>
          {triggerSuffix}
        </span>
      )}
      <ChevronDownIcon data-icon="inline-end" className="size-3 opacity-64" />
    </>
  )
  return { selected, button, content }
}

function OptionBody({ option, showDescription }: { option: PickerOption; showDescription: boolean }) {
  return (
    <>
      {option.icon && <span className="flex h-4.5 shrink-0 items-center">{option.icon}</span>}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{option.label}</span>
        {showDescription && option.description && <span className="text-ui-xs text-pretty text-muted-foreground">{option.description}</span>}
      </span>
    </>
  )
}

// Two-line rows (with descriptions) align to the top line; single-line rows keep the menu's row height.

/** Capture-phase key hook: a key the caller claims (preventDefault) never reaches the popup's own handling. */
function contentKeyDown(handler?: (event: React.KeyboardEvent<HTMLDivElement>) => void) {
  if (!handler) return undefined
  return (event: React.KeyboardEvent<HTMLDivElement>) => {
    handler(event)
    if (event.defaultPrevented) event.stopPropagation()
  }
}

function ComposerPickerMenu(props: ComposerPickerProps) {
  const { options, value, onValueChange, heading, side = "top", align = "start", disabled, footer, showDescriptions = true, onContentKeyDown } = props
  const { button, content } = usePickerTrigger(props)
  const groups = React.useMemo(() => groupOptions(options), [options])

  return (
    <Menu>
      <MenuTrigger disabled={disabled} render={button}>
        {content}
      </MenuTrigger>
      <MenuContent side={side} align={align} className="max-h-80 w-64" onKeyDownCapture={contentKeyDown(onContentKeyDown)}>
        {/* design-check-ignore menu-label-group -- a title above the groups renders as a plain heading */}
        {heading && <MenuLabel>{heading}</MenuLabel>}
        {groups.map(([group, items], gi) => (
          <React.Fragment key={group || gi}>
            {gi > 0 && <MenuSeparator />}
            <MenuGroup>
              {group && <MenuLabel>{group}</MenuLabel>}
              {items.map((o) => (
                <MenuItem
                  key={o.value}
                  data-value={o.value}
                  disabled={o.disabled}
                  onClick={() => onValueChange?.(o.value)}
                  className={cn(showDescriptions && o.description && "items-start py-1", o.tone === "warning" && "[&_svg]:text-warning-text", o.tone === "destructive" && "[&_svg]:text-destructive-text")}
                >
                  <OptionBody option={o} showDescription={showDescriptions} />
                  <span className="flex h-4.5 w-4 shrink-0 items-center justify-center">
                    {o.value === value && <CheckIcon className="!text-foreground" />}
                  </span>
                </MenuItem>
              ))}
            </MenuGroup>
          </React.Fragment>
        ))}
        {footer && (
          <>
            <MenuSeparator />
            {footer}
          </>
        )}
      </MenuContent>
    </Menu>
  )
}

type PickerGroup = { value: string; items: PickerOption[] }

function matches(o: PickerOption, words: string[]) {
  const hay = `${o.label} ${o.value} ${o.group ?? ""}`.toLowerCase()
  return words.every((w) => hay.includes(w))
}

/** The searchable list: a field at the top keeps focus, arrows move the highlight, Enter picks. */
function ComposerPickerSearch(props: ComposerPickerProps) {
  const { options, value, onValueChange, heading, side = "top", align = "start", disabled, footer, searchPlaceholder, emptyLabel, maxPerGroup, showDescriptions = true, onContentKeyDown } = props
  const { labels } = useLocale()
  const { selected, button, content } = usePickerTrigger(props)
  const [query, setQuery] = React.useState("")
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set())

  const groups = React.useMemo<PickerGroup[]>(() => groupOptions(options).map(([g, items]) => ({ value: g, items })), [options])
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const searching = words.length > 0
  const hidden = new Map<string, number>()
  const filtered = groups
    .map((g) => {
      if (searching) return { ...g, items: g.items.filter((o) => matches(o, words)) }
      if (!maxPerGroup || expanded.has(g.value) || g.items.length <= maxPerGroup) return g
      const head = g.items.slice(0, maxPerGroup)
      // Keep the current choice visible even when it sits past the cap.
      const chosen = g.items.find((o) => o.value === value)
      const items = chosen && !head.includes(chosen) ? [...head, chosen] : head
      hidden.set(g.value, g.items.length - items.length)
      return { ...g, items }
    })
    .filter((g) => g.items.length > 0)
  const placeholderText = searchPlaceholder ?? labels.searchPlaceholder

  return (
    <ComboboxPrimitive.Root<PickerOption>
      items={groups}
      filteredItems={filtered}
      value={selected ?? null}
      onValueChange={(o) => {
        if (o) onValueChange?.(o.value)
      }}
      inputValue={query}
      onInputValueChange={setQuery}
      onOpenChange={(open) => {
        if (open) return
        setQuery("")
        setExpanded(new Set())
      }}
      itemToStringLabel={(o) => o.label}
      itemToStringValue={(o) => o.value}
      isItemEqualToValue={(a, b) => a.value === b.value}
      autoHighlight
      disabled={disabled}
    >
      <ComboboxPrimitive.Trigger render={button}>{content}</ComboboxPrimitive.Trigger>
      <ComboboxContent side={side} align={align} aria-label={props.label} className="w-72 max-w-(--available-width)" onKeyDownCapture={contentKeyDown(onContentKeyDown)}>
        {heading && <div className="px-2.5 pt-2 text-ui-sm font-medium text-muted-foreground">{heading}</div>}
        <ComboboxSearch placeholder={placeholderText} aria-label={placeholderText} />
        <ComboboxEmpty className="py-4">{emptyLabel ?? labels.noResults}</ComboboxEmpty>
        <ComboboxList className="max-h-80">
          {(group: PickerGroup, gi: number) => (
            <React.Fragment key={group.value || gi}>
              {gi > 0 && <ComboboxSeparator />}
              <ComboboxGroup items={group.items}>
                {group.value && <ComboboxLabel>{group.value}</ComboboxLabel>}
                <ComboboxPrimitive.Collection>
                  {(o: PickerOption) => (
                    <ComboboxItem key={o.value} value={o} data-value={o.value} disabled={o.disabled} className={cn(showDescriptions && o.description && "items-start py-1", o.tone === "warning" && "[&_svg]:text-warning-text", o.tone === "destructive" && "[&_svg]:text-destructive-text")}>
                      <OptionBody option={o} showDescription={showDescriptions} />
                    </ComboboxItem>
                  )}
                </ComboboxPrimitive.Collection>
                {(hidden.get(group.value) ?? 0) > 0 && (
                  <button
                    type="button"
                    tabIndex={-1}
                    data-slot="composer-picker-show-all"
                    // Keep focus in the search field.
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => setExpanded((prev) => new Set(prev).add(group.value))}
                    className="flex min-h-6.5 w-full cursor-pointer items-center rounded-lg px-2 text-ui text-muted-foreground outline-none hover:bg-secondary hover:text-foreground"
                  >
                    {labels.showAll(group.items.length + (hidden.get(group.value) ?? 0))}
                  </button>
                )}
              </ComboboxGroup>
            </React.Fragment>
          )}
        </ComboboxList>
        {footer && <div className="border-t border-border p-1">{footer}</div>}
      </ComboboxContent>
    </ComboboxPrimitive.Root>
  )
}

type ModelOption = {
  id: string
  name: string
  /** Kept for callers that pass one; shown only with `showDescriptions`. */
  description?: string
  provider?: string
  icon?: React.ReactNode
  disabled?: boolean
  /** `false` for a model that can't reason: `ThinkingModelPicker` hides the effort control for it. */
  reasoning?: boolean
}

type ModelPickerProps = Omit<ComposerPickerProps, "options" | "label"> & {
  models: ModelOption[]
  label?: string
}

/** Model menu, grouped by `provider` when given. */
function ModelPicker({ models, label, heading, showDescriptions = false, ...props }: ModelPickerProps) {
  const { labels } = useLocale()
  const options = models.map<PickerOption>((m) => ({
    value: m.id,
    label: m.name,
    description: m.description,
    group: m.provider,
    icon: m.icon,
    disabled: m.disabled,
  }))
  return <ComposerPicker options={options} label={label ?? labels.model} heading={heading} showDescriptions={showDescriptions} {...props} />
}

type EffortLevel = { value: string; label: string; description?: string }


type EffortPickerProps = Omit<ComposerPickerProps, "options" | "label"> & {
  levels?: EffortLevel[]
  label?: string
}

/** Reasoning effort (thought level), with a bolt glyph. */
function EffortPicker({ levels, label, icon, heading, compact = true, showDescriptions = false, ...props }: EffortPickerProps) {
  const { labels } = useLocale()
  const defaults: EffortLevel[] = [
    { value: "low", label: labels.effortLow, description: labels.effortLowDescription },
    { value: "medium", label: labels.effortMedium, description: labels.effortMediumDescription },
    { value: "high", label: labels.effortHigh, description: labels.effortHighDescription },
  ]
  return (
    <ComposerPicker
      compact={compact}
      showDescriptions={showDescriptions}
      options={(levels ?? defaults).map((l) => ({ ...l }))}
      label={label ?? labels.reasoningEffort}
      heading={heading ?? labels.reasoningEffort}
      icon={icon ?? <BoltIcon />}
      {...props}
    />
  )
}

type ThinkingModelPickerProps = Omit<ModelPickerProps, "footer" | "triggerSuffix" | "onContentKeyDown"> & {
  /** Effort levels, lowest first. Defaults to low / medium / high. */
  levels?: EffortLevel[]
  effort?: string
  onEffortChange?: (effort: string) => void
}

/**
 * Model and reasoning effort in one trigger: the model list with a stepped effort track pinned under
 * it, and the effort echoed after the model name. Tab cycles the effort while the list is open. The
 * track and the echo hide for a model with `reasoning: false`.
 */
function ThinkingModelPicker({ models, levels, effort, onEffortChange, value, ...props }: ThinkingModelPickerProps) {
  const { labels } = useLocale()
  const steps = levels ?? [
    { value: "low", label: labels.effortLow },
    { value: "medium", label: labels.effortMedium },
    { value: "high", label: labels.effortHigh },
  ]
  const selected = models.find((m) => m.id === value)
  const thinks = selected?.reasoning !== false
  const index = Math.max(0, steps.findIndex((l) => l.value === effort))
  const current = steps[index]

  const footer = thinks ? (
    <div
      data-slot="thinking-model-picker-effort"
      role="presentation"
      // Arrow keys belong to the slider, not the list around it.
      onKeyDown={(e) => e.key !== "Tab" && e.key !== "Escape" && e.stopPropagation()}
      className="flex items-center gap-2.5 px-1.5 py-1"
    >
      <ReasoningEffort
        size="sm"
        levels={steps}
        value={current?.value}
        onValueChange={(next) => onEffortChange?.(next)}
        // The tab rises over the list's last row while dragging; the track sits on the popover.
        className="-mt-4 w-auto min-w-0 flex-1 [--reasoning-effort-surface:var(--popover)]"
      />
      <span className="w-12 shrink-0 truncate text-ui-sm text-muted-foreground">{current?.label}</span>
      <Kbd size="sm" className="shrink-0">Tab</Kbd>
    </div>
  ) : undefined

  return (
    <ModelPicker
      models={models}
      value={value}
      footer={footer}
      triggerSuffix={thinks ? current?.label : undefined}
      onContentKeyDown={(e) => {
        if (e.key !== "Tab" || !thinks || e.altKey || e.metaKey || e.ctrlKey) return
        e.preventDefault()
        const step = e.shiftKey ? steps.length - 1 : 1
        onEffortChange?.(steps[(index + step) % steps.length].value)
      }}
      {...props}
    />
  )
}

type ModeOption = { id: string; name: string; description?: string; icon?: React.ReactNode; tone?: PickerTone }

type ModePickerProps = Omit<ComposerPickerProps, "options" | "label"> & {
  modes: ModeOption[]
  label?: string
}

/** Agent mode / access level ("Ask", "Auto", "Full access"); a mode can colour the trigger with `tone`. */
function ModePicker({ modes, label, icon, compact = true, ...props }: ModePickerProps) {
  const { labels } = useLocale()
  const options = modes.map<PickerOption>((m) => ({
    value: m.id,
    label: m.name,
    description: m.description,
    icon: m.icon,
    tone: m.tone,
  }))
  return <ComposerPicker options={options} label={label ?? labels.mode} icon={icon ?? <ShieldIcon />} compact={compact} {...props} />
}

export {
  ComposerPicker,
  ModelPicker,
  ThinkingModelPicker,
  EffortPicker,
  ModePicker,
  type ComposerPickerProps,
  type PickerOption,
  type PickerTone,
  type ModelOption,
  type ModelPickerProps,
  type ThinkingModelPickerProps,
  type EffortLevel,
  type EffortPickerProps,
  type ModeOption,
  type ModePickerProps,
}
