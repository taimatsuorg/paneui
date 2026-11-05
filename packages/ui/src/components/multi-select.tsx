"use client"

import * as React from "react"
import { useDirection } from "@base-ui/react/direction-provider"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { CheckIcon, ChevronsUpDownIcon, XIcon } from "@paneui/ui/icons"
import { useControlSize } from "@paneui/core/control-size"
import { cn } from "@paneui/ui/lib/utils"
import { useLocale } from "@paneui/ui/components/locale-provider"
import {
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from "@paneui/ui/components/combobox"

const MultiSelectAnchorContext = React.createContext<React.RefObject<HTMLDivElement | null> | null>(null)

type MultiSelectSize = "sm" | "default" | "lg"
const MultiSelectSizeContext = React.createContext<MultiSelectSize | undefined>(undefined)

// Well heights match Button (sm 28, default 32, lg 36) while it holds one row of chips.
// An inherited `xs` (from a Field) maps to `sm`: chips need at least 20px.
const sizeClass: Record<MultiSelectSize, { well: string; chip: string; remove: string; input: string; trigger: string; item: string }> = {
  sm: {
    well: "frame-inset-0.5 min-h-7 py-0.5 pe-7 ps-0.5",
    chip: "h-6 ps-2 text-ui-sm",
    remove: "size-5",
    input: "h-6 text-ui",
    trigger: "top-0.5 end-0.5 size-6 rounded-inner",
    item: "h-7 text-ui-sm",
  },
  default: {
    well: "frame-inset-1 min-h-8 py-1 pe-8 ps-1",
    chip: "h-6 ps-2 text-ui-sm",
    remove: "size-5",
    input: "h-6 text-ui",
    trigger: "top-1 end-1 size-6 rounded-inner",
    item: "h-8 text-ui",
  },
  lg: {
    well: "frame-inset-1 min-h-9 py-1 pe-9 ps-1",
    chip: "h-7 ps-2.5 text-ui",
    remove: "size-6",
    input: "h-7 text-ui-lg",
    trigger: "top-1 end-1 size-7 rounded-inner",
    item: "h-9 text-ui-lg",
  },
}

function useMultiSelectSize(own?: MultiSelectSize | "xs") {
  const fromRoot = React.useContext(MultiSelectSizeContext)
  const size = useControlSize<MultiSelectSize | "xs">(own ?? fromRoot)
  return size === "xs" ? "sm" : size
}

const CHIP_SPRING = { type: "spring", stiffness: 520, damping: 34, mass: 0.6 } as const

type MultiSelectProps<Value> = Omit<ComboboxPrimitive.Root.Props<Value, true>, "multiple"> & {
  /** Sizes the well, its chips and the option rows together. */
  size?: MultiSelectSize
}

/** Combobox in multiple mode: picks stay open-ended and show as chips. */
function MultiSelect<Value>({ size, ...props }: MultiSelectProps<Value>) {
  const anchorRef = React.useRef<HTMLDivElement | null>(null)
  return (
    <MultiSelectAnchorContext.Provider value={anchorRef}>
      <MultiSelectSizeContext.Provider value={size}>
        <ComboboxPrimitive.Root<Value, true> multiple {...props} />
      </MultiSelectSizeContext.Provider>
    </MultiSelectAnchorContext.Provider>
  )
}

function defaultChipLabel(value: unknown): React.ReactNode {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>
    if ("label" in record) return String(record.label)
    if ("value" in record) return String(record.value)
  }
  return String(value)
}

function chipKey(value: unknown, index: number): React.Key {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>
    if ("value" in record) return String(record.value)
    if ("id" in record) return String(record.id)
    return index
  }
  return String(value)
}

/**
 * Inset well holding the chosen values as removable raised chips, with the
 * search input trailing them. Chips sit 4px inside the rounded-lg well, so they
 * take frame-inner (radius − inset; never also rounded-inner, which would read the chip's own
 * inner radius and come out 2px too square) and the same 1px hairline as the well. Backspace in an empty input removes the last chip.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- chip values are the Combobox item type; callers annotate their own callbacks
type ChipValue = any

function MultiSelectTrigger({
  className,
  placeholder: placeholderProp,
  renderChip = defaultChipLabel,
  getKey = chipKey,
  size: sizeProp,
  ...props
}: Omit<ComboboxPrimitive.Chips.Props, "children"> & {
  placeholder?: string
  renderChip?: (value: ChipValue) => React.ReactNode
  getKey?: (value: ChipValue, index: number) => React.Key
  size?: MultiSelectSize
}) {
  const { labels } = useLocale()
  const placeholder = placeholderProp ?? labels.selectPlaceholder
  const anchorRef = React.useContext(MultiSelectAnchorContext)
  const reduce = useReducedMotion()
  const size = useMultiSelectSize(sizeProp)
  const c = sizeClass[size]

  return (
    <ComboboxPrimitive.Chips
      ref={anchorRef}
      data-slot="multi-select-trigger"
      data-size={size}
      className={cn(
        "relative flex w-full min-w-56 flex-wrap items-center gap-1 frame-lg rounded-lg bg-background dark:bg-input/32 shadow-well transition-[box-shadow,background-color] focus-within:ring-2 focus-within:ring-ring",
        c.well,
        className
      )}
      {...props}
    >
      <ComboboxPrimitive.Value>
        {(selected: unknown[]) => (
          <>
            <AnimatePresence initial={false} mode="popLayout">
              {selected.map((value, index) => (
                <motion.div
                  key={getKey(value, index)}
                  layout={!reduce}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
                  transition={reduce ? { duration: 0.12 } : CHIP_SPRING}
                  className="flex"
                >
                  <ComboboxPrimitive.Chip
                    data-slot="multi-select-chip"
                    className={cn(
                      "frame-inner frame-inset-0.5 flex max-w-48 items-center gap-1 bg-card pe-0.5 font-medium shadow-raised outline-none focus-visible:ring-2 focus-visible:ring-ring data-disabled:opacity-50",
                      c.chip
                    )}
                  >
                    <span className="truncate">{renderChip(value)}</span>
                    <ComboboxPrimitive.ChipRemove
                      aria-label={labels.remove}
                      className={cn(
                        "flex shrink-0 cursor-pointer items-center justify-center rounded-inner text-muted-foreground hover:bg-muted hover:text-foreground",
                        c.remove
                      )}
                    >
                      <XIcon size={12} />
                    </ComboboxPrimitive.ChipRemove>
                  </ComboboxPrimitive.Chip>
                </motion.div>
              ))}
            </AnimatePresence>
            <ComboboxPrimitive.Input
              data-slot="multi-select-input"
              placeholder={selected.length ? undefined : placeholder}
              className={cn("min-w-16 flex-1 bg-transparent px-2 outline-none placeholder:text-muted-foreground", c.input)}
            />
          </>
        )}
      </ComboboxPrimitive.Value>
      <ComboboxPrimitive.Trigger
        aria-label={labels.showOptions}
        className={cn(
          "absolute flex cursor-pointer items-center justify-center text-muted-foreground outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
          c.trigger
        )}
      >
        <ChevronsUpDownIcon size={16} />
      </ComboboxPrimitive.Trigger>
    </ComboboxPrimitive.Chips>
  )
}

function MultiSelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  ...props
}: ComboboxPrimitive.Popup.Props & Pick<ComboboxPrimitive.Positioner.Props, "side" | "sideOffset" | "align">) {
  const anchorRef = React.useContext(MultiSelectAnchorContext)
  // Portaled popups leave the DOM subtree that sets `dir`; carry the provider direction over.
  const dir = useDirection() === "rtl" ? "rtl" : undefined
  return (
    <ComboboxPrimitive.Portal dir={dir}>
      <ComboboxPrimitive.Positioner
        className="z-50 outline-none"
        side={side}
        sideOffset={sideOffset}
        align={align}
        anchor={anchorRef ?? undefined}
      >
        <ComboboxPrimitive.Popup
          data-slot="multi-select-content"
          className={cn(
            "relative flex max-h-[min(var(--available-height),22rem)] w-(--anchor-width) min-w-48 origin-(--transform-origin) flex-col overflow-hidden frame-xl frame-inset-1 rounded-xl bg-popover text-popover-foreground shadow-surface transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

/** Option row with a checkbox-style tick that fills when the value is chosen. */
function MultiSelectItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
  const size = useMultiSelectSize()
  return (
    <ComboboxPrimitive.Item
      data-slot="multi-select-item"
      data-size={size}
      className={cn(
        "group/item relative flex cursor-default items-center gap-2.5 rounded-inner px-2.5 outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent",
        sizeClass[size].item,
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-muted shadow-well transition-[background-color,box-shadow] duration-150 group-data-selected/item:bg-primary group-data-selected/item:shadow-primary"
      >
        <CheckIcon
          size={12}
          className="scale-50 text-primary-foreground opacity-0 transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-data-selected/item:scale-100 group-data-selected/item:opacity-100"
        />
      </span>
      <span className="flex flex-1 items-center gap-2 truncate [&_svg]:size-4 [&_svg]:shrink-0">{children}</span>
    </ComboboxPrimitive.Item>
  )
}

const MultiSelectList = ComboboxList
const MultiSelectGroup = ComboboxGroup
const MultiSelectLabel = ComboboxLabel
const MultiSelectSeparator = ComboboxSeparator
const MultiSelectEmpty = ComboboxEmpty
const MultiSelectCollection = ComboboxCollection

export type { MultiSelectProps, MultiSelectSize }
export {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectContent,
  MultiSelectList,
  MultiSelectItem,
  MultiSelectGroup,
  MultiSelectLabel,
  MultiSelectSeparator,
  MultiSelectEmpty,
  MultiSelectCollection,
}
