"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { Extension, mergeAttributes, Node, type Editor } from "@tiptap/core"
import { Mention } from "@tiptap/extension-mention"
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react"

import { BracesIcon, GitBranchIcon, ImageIcon, MoveVerticalIcon, RefreshIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import {
  filterSuggestionItems,
  suggestionRenderer,
  SuggestionMenu,
  type SuggestionMenuProps,
  type SuggestionMenuItem,
} from "@paneui/ui/blocks/notion-editor/suggestion-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paneui/ui/components/select"

/**
 * Email blocks. Every attribute is plain data (strings / numbers), so the
 * document JSON is what `renderEmailHtml` turns into email-safe HTML.
 */

export type Align = "left" | "center" | "right"
export type ButtonVariant = "filled" | "outline" | "link"
export type ButtonRadius = "square" | "rounded" | "pill"
export type SectionBackground = "none" | "muted" | "brand"

export type EmailVariable = {
  /** Key used in the template: `{{first_name}}`. */
  name: string
  label?: string
  /** Used when the value is missing at render time. */
  fallback?: string
  /** Shown in the preview. */
  sample?: string
  /** A list (for Repeat blocks). */
  list?: boolean
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    emailBlocks: {
      insertEmailButton: (attrs?: Partial<{ text: string; href: string; variant: ButtonVariant; align: Align }>) => ReturnType
      insertEmailImage: (attrs?: Partial<{ src: string; alt: string; width: number; align: Align }>) => ReturnType
      insertEmailLogo: (attrs?: Partial<{ src: string; size: number; align: Align }>) => ReturnType
      insertSpacer: (height?: number) => ReturnType
      insertColumns: (count?: 2 | 3) => ReturnType
      insertSection: () => ReturnType
      insertFooter: () => ReturnType
      insertShowIf: (when?: string) => ReturnType
      insertRepeat: (each?: string) => ReturnType
    }
  }
}

/* ───────────────────────── helpers ───────────────────────── */

/** Holds the editor's variable list (for the `{{` picker and the logic blocks). */
export const EmailVariables = Extension.create<{ variables: EmailVariable[] }>({
  name: "emailVariables",
  addOptions() {
    return { variables: [] }
  },
  addStorage() {
    return { variables: this.options.variables }
  },
})

export function variablesOf(editor: Editor): EmailVariable[] {
  const storage = (editor.storage as unknown as Record<string, { variables?: EmailVariable[] } | undefined>).emailVariables
  return storage?.variables ?? []
}

const alignClass: Record<Align, string> = { left: "justify-start", center: "justify-center", right: "justify-end" }

function attrsSpec<T extends Record<string, unknown>>(defaults: T) {
  return Object.fromEntries(Object.entries(defaults).map(([k, v]) => [k, { default: v }]))
}

/* ───────────────────────── button ───────────────────────── */

function ButtonView({ node, selected }: ReactNodeViewProps) {
  const l10n = useLocale().labels

  const { text, variant, align, color, radius } = node.attrs as {
    text: string
    variant: ButtonVariant
    align: Align
    color: string
    radius: ButtonRadius
  }
  return (
    <NodeViewWrapper data-type="email-button" className={cn("my-3 flex", alignClass[align])}>
      <span
        data-drag-handle
        className={cn(
          "inline-flex h-10 cursor-pointer items-center px-5 text-ui-lg font-medium transition-[box-shadow] duration-150 select-none",
          radius === "pill" ? "rounded-full" : radius === "square" ? "rounded-[calc(var(--radius)*0.2)]" : "rounded-lg",
          variant === "filled" && "text-white",
          variant === "outline" && "border-2 bg-transparent",
          variant === "link" && "h-auto px-0 underline underline-offset-4",
          selected && "ring-2 ring-ring ring-offset-2 ring-offset-card"
        )}
        style={
          variant === "filled"
            ? { backgroundColor: color }
            : variant === "outline"
              ? { borderColor: color, color }
              : { color }
        }
      >
        {text || l10n.button}
      </span>
    </NodeViewWrapper>
  )
}

export const EmailButton = Node.create({
  name: "emailButton",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return attrsSpec({ text: "Get started", href: "https://", variant: "filled", align: "left", color: "#2563eb", radius: "rounded" })
  },
  parseHTML() {
    return [{ tag: 'a[data-type="email-button"]' }]
  },
  renderHTML({ HTMLAttributes, node }) {
    return ["a", mergeAttributes(HTMLAttributes, { "data-type": "email-button", href: node.attrs.href }), node.attrs.text as string]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ButtonView)
  },
  addCommands() {
    return {
      insertEmailButton:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },
})

/* ───────────────────────── image + logo ───────────────────────── */

function ImageView({ node, selected }: ReactNodeViewProps) {
  const l10n = useLocale().labels

  const { src, alt, width, align } = node.attrs as { src: string; alt: string; width: number; align: Align }
  return (
    <NodeViewWrapper data-type="email-image" className={cn("my-3 flex", alignClass[align])}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- user content inside the editor
        <img
          data-drag-handle
          src={src}
          alt={alt}
          style={{ width: `${width}%` }}
          className={cn("block max-w-full rounded-lg media-outline", selected && "ring-2 ring-ring")}
        />
      ) : (
        <div
          data-drag-handle
          className={cn(
            "flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-lg bg-muted text-ui text-muted-foreground shadow-well",
            selected && "ring-2 ring-ring"
          )}
        >
          <ImageIcon className="size-5" />
          {l10n.selectToAddAnImageURL}
        </div>
      )}
    </NodeViewWrapper>
  )
}

export const EmailImage = Node.create({
  name: "emailImage",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return attrsSpec({ src: "", alt: "", width: 100, align: "center", href: "" })
  },
  parseHTML() {
    return [{ tag: 'img[data-type="email-image"]', getAttrs: (el) => ({ src: (el as HTMLImageElement).getAttribute("src") }) }]
  },
  renderHTML({ HTMLAttributes, node }) {
    return ["img", mergeAttributes(HTMLAttributes, { "data-type": "email-image", src: node.attrs.src, alt: node.attrs.alt })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView)
  },
  addCommands() {
    return {
      insertEmailImage:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },
})

function LogoView({ node, selected }: ReactNodeViewProps) {
  const l10n = useLocale().labels

  const { src, size, align } = node.attrs as { src: string; size: number; align: Align }
  return (
    <NodeViewWrapper data-type="email-logo" className={cn("my-2 flex", alignClass[align])}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- user content inside the editor
        <img
          data-drag-handle
          src={src}
          alt={l10n.logo}
          style={{ height: size }}
          className={cn("block w-auto rounded-md media-outline", selected && "ring-2 ring-ring")}
        />
      ) : (
        <div
          data-drag-handle
          style={{ width: size, height: size }}
          className={cn("flex items-center justify-center rounded-lg bg-muted text-muted-foreground shadow-well", selected && "ring-2 ring-ring")}
        >
          <ImageIcon className="size-4" />
        </div>
      )}
    </NodeViewWrapper>
  )
}

export const EmailLogo = Node.create({
  name: "emailLogo",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return attrsSpec({ src: "", size: 40, align: "left" })
  },
  renderHTML({ HTMLAttributes, node }) {
    return ["img", mergeAttributes(HTMLAttributes, { "data-type": "email-logo", src: node.attrs.src })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(LogoView)
  },
  addCommands() {
    return {
      insertEmailLogo:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },
})

/* ───────────────────────── spacer ───────────────────────── */

function SpacerView({ node, selected }: ReactNodeViewProps) {
  const height = node.attrs.height as number
  return (
    <NodeViewWrapper data-type="email-spacer" className="group/spacer relative">
      <div
        data-drag-handle
        style={{ height }}
        className={cn(
          "flex items-center justify-center rounded-md text-ui-xs text-muted-foreground opacity-0 transition-opacity duration-150 group-hover/spacer:opacity-100 group-hover/spacer:bg-secondary",
          selected && "bg-primary/8 opacity-100"
        )}
      >
        {height >= 16 && (
          <span className="flex items-center gap-1">
            <MoveVerticalIcon className="size-3" />
            {height}px
          </span>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export const Spacer = Node.create({
  name: "spacer",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return attrsSpec({ height: 32 })
  },
  renderHTML({ HTMLAttributes, node }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "email-spacer", style: `height:${node.attrs.height}px` })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(SpacerView)
  },
  addCommands() {
    return {
      insertSpacer:
        (height = 32) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { height } }),
    }
  },
})

/* ───────────────────────── columns ───────────────────────── */

export const Column = Node.create({
  name: "column",
  content: "block+",
  isolating: true,
  defining: true,
  addAttributes() {
    return attrsSpec({ verticalAlign: "top" })
  },
  parseHTML() {
    return [{ tag: 'div[data-type="email-column"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "email-column" }), 0]
  },
})

export const Columns = Node.create({
  name: "columns",
  group: "block",
  content: "column{2,3}",
  isolating: true,
  draggable: true,
  addAttributes() {
    return attrsSpec({ gap: 16 })
  },
  parseHTML() {
    return [{ tag: 'div[data-type="email-columns"]' }]
  },
  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "email-columns",
        style: `grid-template-columns:repeat(${node.childCount},minmax(0,1fr));gap:${node.attrs.gap}px`,
      }),
      0,
    ]
  },
  addCommands() {
    return {
      insertColumns:
        (count = 2) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: Array.from({ length: count }, () => ({ type: "column", content: [{ type: "paragraph" }] })),
          }),
    }
  },
})

/* ───────────────────────── containers with a header ───────────────────────── */

function ContainerHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      contentEditable={false}
      className={cn(
        "flex h-7 items-center gap-1.5 px-1 text-ui-xs text-muted-foreground select-none [&_svg]:size-3.5",
        className
      )}
    >
      {children}
    </div>
  )
}

function VariableSelect({
  editor,
  value,
  onChange,
  lists,
  label,
}: {
  editor: Editor
  value: string
  onChange: (v: string) => void
  lists?: boolean
  label: string
}) {
  const l10n = useLocale().labels
  const vars = variablesOf(editor).filter((v) => (lists ? v.list : !v.list))
  const items = vars.map((v) => ({ value: v.name, label: v.label ?? v.name }))
  if (value && !items.some((i) => i.value === value)) items.unshift({ value, label: value })
  return (
    <Select items={items} value={value} onValueChange={(v) => onChange(String(v ?? ""))} disabled={!editor.isEditable}>
      <SelectTrigger size="sm" aria-label={label} className="h-6 w-auto min-w-28 font-mono text-ui-xs">
        <SelectValue placeholder={l10n.variablePlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((i) => (
          <SelectItem key={i.value} value={i.value}>
            <span className="font-mono">{i.value}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const sectionTone: Record<SectionBackground, string> = {
  none: "shadow-[inset_0_0_0_1px_var(--border)]",
  muted: "bg-muted",
  brand: "bg-primary/8",
}

function SectionView({ node, updateAttributes, editor }: ReactNodeViewProps) {
  const l10n = useLocale().labels

  const { background, align } = node.attrs as { background: SectionBackground; align: Align }
  return (
    <NodeViewWrapper data-type="email-section" className={cn("group/section frame-xl frame-p-1 my-3", sectionTone[background])}>
      <ContainerHeader className="opacity-0 transition-opacity duration-150 group-focus-within/section:opacity-100 group-hover/section:opacity-100">
        <span className="font-medium">{l10n.section}</span>
        {editor.isEditable && (
          <span className="ml-auto flex gap-0.5">
            {(["none", "muted", "brand"] as SectionBackground[]).map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={background === b}
                onClick={() => updateAttributes({ background: b })}
                className="h-5 cursor-pointer rounded-md px-1.5 capitalize outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-foreground/8 aria-pressed:text-foreground"
              >
                {b === "none" ? l10n.plain : b === "muted" ? l10n.sectionMuted : l10n.sectionBrand}
              </button>
            ))}
          </span>
        )}
      </ContainerHeader>
      <NodeViewContent
        className={cn(
          "rounded-inner px-4 pb-3 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          align === "center" && "text-center",
          // design-check-ignore text-align-logical -- the email block stores a physical alignment
          align === "right" && "text-right"
        )}
      />
    </NodeViewWrapper>
  )
}

export const EmailSection = Node.create({
  name: "section",
  group: "block",
  content: "block+",
  isolating: true,
  defining: true,
  draggable: true,
  addAttributes() {
    return attrsSpec({ background: "muted", align: "left", padding: 24 })
  },
  parseHTML() {
    return [{ tag: 'div[data-type="email-section"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "email-section" }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(SectionView)
  },
  addCommands() {
    return {
      insertSection:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, content: [{ type: "paragraph" }] }),
    }
  },
})

function LogicView({ node, updateAttributes, editor }: ReactNodeViewProps) {
  const l10n = useLocale().labels

  const repeat = node.type.name === "repeat"
  const key = repeat ? "each" : "when"
  const value = (node.attrs[key] as string) ?? ""
  return (
    <NodeViewWrapper
      data-type={repeat ? "email-repeat" : "email-show-if"}
      title={repeat ? l10n.rendersItsBlocksOncePerItemOfTheList : l10n.rendersItsBlocksOnlyWhenTheVariableIsSetAndNotEmpty}
      className="frame-xl frame-p-1 my-3 border border-dashed border-primary/40 frame-border"
    >
      <ContainerHeader>
        {repeat ? <RefreshIcon className="text-primary-text" /> : <GitBranchIcon className="text-primary-text" />}
        <span className="font-medium text-foreground">{repeat ? l10n.repeatForEach : l10n.showIf}</span>
        <VariableSelect
          editor={editor}
          label={repeat ? l10n.listVariable : l10n.conditionVariable}
          lists={repeat}
          value={value}
          onChange={(v) => updateAttributes({ [key]: v })}
        />
      </ContainerHeader>
      <NodeViewContent className="rounded-inner px-3 pb-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0" />
    </NodeViewWrapper>
  )
}

export const ShowIf = Node.create({
  name: "showIf",
  group: "block",
  content: "block+",
  isolating: true,
  defining: true,
  draggable: true,
  addAttributes() {
    return attrsSpec({ when: "" })
  },
  parseHTML() {
    return [{ tag: 'div[data-type="email-show-if"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "email-show-if" }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(LogicView)
  },
  addCommands() {
    return {
      insertShowIf:
        (when = "") =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { when }, content: [{ type: "paragraph" }] }),
    }
  },
})

export const Repeat = Node.create({
  name: "repeat",
  group: "block",
  content: "block+",
  isolating: true,
  defining: true,
  draggable: true,
  addAttributes() {
    return attrsSpec({ each: "" })
  },
  parseHTML() {
    return [{ tag: 'div[data-type="email-repeat"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "email-repeat" }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(LogicView)
  },
  addCommands() {
    return {
      insertRepeat:
        (each = "") =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { each }, content: [{ type: "paragraph" }] }),
    }
  },
})

/* ───────────────────────── footer ───────────────────────── */

export const Footer = Node.create({
  name: "footer",
  group: "block",
  content: "inline*",
  defining: true,
  addAttributes() {
    return attrsSpec({ align: "center" })
  },
  parseHTML() {
    return [{ tag: 'p[data-type="email-footer"]' }]
  },
  renderHTML({ HTMLAttributes, node }) {
    return ["p", mergeAttributes(HTMLAttributes, { "data-type": "email-footer", style: `text-align:${node.attrs.align}` }), 0]
  },
  addCommands() {
    return {
      insertFooter:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name }),
    }
  },
})

/* ───────────────────────── variables ───────────────────────── */

type VariableItem = SuggestionMenuItem & { keywords?: string[]; variable: EmailVariable }

function VariableView({ node }: ReactNodeViewProps) {
  const id = node.attrs.id as string
  return (
    <NodeViewWrapper
      as="span"
      data-type="email-variable"
      className="mx-px inline-flex items-center gap-0.5 rounded-md bg-primary-subtle px-1 align-baseline font-mono text-[0.85em] leading-normal text-foreground [&_svg]:text-primary-text"
    >
      <BracesIcon className="size-3" />
      {id}
    </NodeViewWrapper>
  )
}

/**
 * `{{first_name}}`: an inline variable chip. Typing `{{` opens a picker of the
 * editor's variables (`variables` option); the value is filled in at render time.
 */
export const Variable = Mention.extend({
  name: "variable",
  addAttributes() {
    return {
      id: { default: null },
      fallback: { default: null },
    }
  },
  renderText({ node }) {
    return `{{${node.attrs.id}}}`
  },
  renderHTML({ node, HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-type": "email-variable" }), `{{${node.attrs.id}}}`]
  },
  addNodeView() {
    return ReactNodeViewRenderer(VariableView)
  },
}).configure({
  suggestion: {
    char: "{{",
    allowedPrefixes: null,
    items: ({ editor, query }) =>
      filterSuggestionItems<VariableItem>(
        variablesOf(editor)
          .filter((v) => !v.list)
          .map((v) => ({
            id: v.name,
            title: v.name,
            description: v.label ?? (v.sample ? `e.g. ${v.sample}` : undefined),
            icon: <BracesIcon className="size-4 text-muted-foreground" />,
            keywords: [v.label ?? ""],
            variable: v,
          })),
        query
      ),
    command: ({ editor, range, props }) => {
      const item = props as unknown as VariableItem
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          { type: "variable", attrs: { id: item.variable.name, fallback: item.variable.fallback ?? null } },
          { type: "text", text: " " },
        ])
        .run()
    },
    render: suggestionRenderer<VariableItem>({ Component: VariableSuggestionMenu, className: "w-64" }) as never,
  },
})

function VariableSuggestionMenu(props: SuggestionMenuProps<VariableItem> & { ref?: React.Ref<import("@paneui/ui/components/menu-list").MenuListHandle> }) {
  const { labels } = useLocale()
  return <SuggestionMenu {...props} emptyLabel={labels.noVariables} />
}
