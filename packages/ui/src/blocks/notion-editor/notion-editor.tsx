"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"
import { Extension, type AnyExtension, type Editor, type JSONContent } from "@tiptap/core"
import { EditorContent, useEditor, useEditorState } from "@tiptap/react"

import { DownloadIcon, UndoIcon, UploadIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { EditorBlockHandle, moveBlock, moveSelectedBlock } from "@paneui/ui/blocks/notion-editor/block-handle"
import { EditorBubbleMenu } from "@paneui/ui/blocks/notion-editor/bubble-menu"
import { notionExtensions, type ImageUploader } from "@paneui/ui/blocks/notion-editor/extensions"
import { fromMDX, toMDX } from "@paneui/ui/blocks/notion-editor/mdx"
import { CalloutWithView, MdxBlockWithView } from "@paneui/ui/blocks/notion-editor/node-views"
import { getDefaultSlashItems, pickFile, SlashCommand, type SlashItem } from "@paneui/ui/blocks/notion-editor/slash-command"
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@paneui/ui/components/toolbar"
import { Tooltip, TooltipContent, TooltipKbd, TooltipTrigger } from "@paneui/ui/components/tooltip"

/**
 * Typography of the document, scoped to the ProseMirror root. Shared with the
 * email editor. Reading copy uses the text-base scale, the chrome uses text-ui.
 */
export const editorContentClass = cn(
  "[&_.ProseMirror]:min-h-full [&_.ProseMirror]:outline-none [&_.ProseMirror]:break-words [&_.ProseMirror]:whitespace-pre-wrap",
  "text-base leading-7 text-foreground",
  // blocks
  "[&_.ProseMirror>*:first-child]:mt-0 [&_p]:my-1",
  "[&_h1]:mt-8 [&_h1]:mb-1 [&_h1]:text-3xl [&_h1]:leading-tight [&_h1]:font-semibold [&_h1]:tracking-tight",
  "[&_h2]:mt-6 [&_h2]:mb-1 [&_h2]:text-2xl [&_h2]:leading-snug [&_h2]:font-semibold [&_h2]:tracking-tight",
  "[&_h3]:mt-5 [&_h3]:mb-0.5 [&_h3]:text-xl [&_h3]:leading-snug [&_h3]:font-semibold [&_h3]:tracking-tight",
  "[&_h4]:mt-4 [&_h4]:text-lg [&_h4]:font-semibold [&_h5]:mt-3 [&_h5]:font-semibold [&_h6]:mt-3 [&_h6]:font-semibold [&_h6]:text-muted-foreground",
  "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:pl-0.5 [&_li>p]:my-0.5 [&_li::marker]:text-muted-foreground",
  // to-do list
  "[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0.5",
  "[&_ul[data-type=taskList]_li]:flex [&_ul[data-type=taskList]_li]:items-start [&_ul[data-type=taskList]_li]:gap-2 [&_ul[data-type=taskList]_li]:pl-0",
  "[&_ul[data-type=taskList]_li>label]:mt-1.5 [&_ul[data-type=taskList]_li>label]:flex [&_ul[data-type=taskList]_li>label]:shrink-0 [&_ul[data-type=taskList]_li>label]:select-none",
  "[&_ul[data-type=taskList]_input]:size-4 [&_ul[data-type=taskList]_input]:cursor-pointer [&_ul[data-type=taskList]_input]:accent-primary",
  "[&_ul[data-type=taskList]_li>div]:min-w-0 [&_ul[data-type=taskList]_li>div]:flex-1",
  "[&_li[data-checked=true]>div]:text-muted-foreground [&_li[data-checked=true]>div]:line-through [&_li[data-checked=true]>div]:decoration-muted-foreground/60",
  // quote, divider, image
  "[&_blockquote]:my-2 [&_blockquote]:border-l-3 [&_blockquote]:border-foreground/80 [&_blockquote]:pl-4",
  "[&_hr]:my-4 [&_hr]:border-border [&_hr.ProseMirror-selectednode]:border-primary",
  "[&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:shadow-raised [&_img.ProseMirror-selectednode]:ring-2 [&_img.ProseMirror-selectednode]:ring-ring",
  // code
  "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-code [&_pre]:px-4 [&_pre]:py-3 [&_pre]:font-mono [&_pre]:text-ui-sm [&_pre]:leading-relaxed [&_pre]:whitespace-pre [&_pre]:shadow-raised",
  "[&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.85em] [&_:not(pre)>code]:text-destructive-text",
  "[&_.hljs-comment]:text-muted-foreground [&_.hljs-comment]:italic [&_.hljs-quote]:text-muted-foreground",
  "[&_.hljs-keyword]:text-destructive-text [&_.hljs-selector-tag]:text-destructive-text [&_.hljs-meta]:text-destructive-text",
  "[&_.hljs-string]:text-success-text [&_.hljs-regexp]:text-success-text [&_.hljs-addition]:text-success-text",
  "[&_.hljs-title]:text-chart-3 [&_.hljs-section]:text-chart-3 [&_.hljs-name]:text-success-text",
  "[&_.hljs-number]:text-primary-text [&_.hljs-literal]:text-primary-text [&_.hljs-attr]:text-primary-text [&_.hljs-attribute]:text-primary-text [&_.hljs-variable]:text-primary-text [&_.hljs-property]:text-primary-text",
  "[&_.hljs-built_in]:text-warning-text [&_.hljs-type]:text-warning-text [&_.hljs-symbol]:text-warning-text [&_.hljs-deletion]:text-destructive-text",
  // table
  "[&_.tableWrapper]:my-3 [&_.tableWrapper]:overflow-x-auto",
  "[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:leading-6",
  "[&_td]:border [&_td]:border-border [&_td]:px-2.5 [&_td]:py-1 [&_td]:align-top [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-2.5 [&_th]:py-1 [&_th]:text-start [&_th]:font-medium",
  "[&_td>p]:my-0 [&_th>p]:my-0 [&_.selectedCell]:bg-primary/8",
  // toggle (details)
  "[&_[data-type=details]]:my-1 [&_[data-type=details]]:flex [&_[data-type=details]]:items-start [&_[data-type=details]]:gap-1",
  "[&_[data-type=details]>button]:mt-1 [&_[data-type=details]>button]:flex [&_[data-type=details]>button]:size-5 [&_[data-type=details]>button]:shrink-0 [&_[data-type=details]>button]:cursor-pointer [&_[data-type=details]>button]:items-center [&_[data-type=details]>button]:justify-center [&_[data-type=details]>button]:rounded-md [&_[data-type=details]>button]:text-muted-foreground [&_[data-type=details]>button]:transition-[background-color,rotate] [&_[data-type=details]>button]:duration-200 [&_[data-type=details]>button:hover]:bg-secondary",
  "[&_[data-type=details].is-open>button]:rotate-90 [&_[data-type=details]>div]:min-w-0 [&_[data-type=details]>div]:flex-1",
  "[&_summary]:list-none [&_summary]:font-medium [&_summary::-webkit-details-marker]:hidden [&_[data-type=detailsContent]>*:first-child]:mt-0",
  // inline
  "[&_a]:text-primary-text [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-4 [&_a:hover]:decoration-primary",
  "[&_mark]:rounded-sm [&_mark]:bg-chart-6/30 [&_mark]:box-decoration-clone [&_mark]:px-0.5 [&_mark]:text-inherit",
  "[&_code[data-type=mdx-inline]]:text-chart-3",
  // states
  "[&_.ProseMirror-selectednode]:outline-none [&_[data-type=callout].ProseMirror-selectednode]:ring-2 [&_[data-type=callout].ProseMirror-selectednode]:ring-ring",
  "[&_.is-empty]:before:pointer-events-none [&_.is-empty]:before:float-left [&_.is-empty]:before:h-0 [&_.is-empty]:before:text-muted-foreground/60 [&_.is-empty]:before:content-[attr(data-placeholder)]",
  "[&_.ProseMirror-gapcursor]:after:border-foreground",
  // the block being dragged from the gutter grip
  "[&_[data-block-dragging]]:opacity-40 [&_[data-block-dragging]]:transition-opacity [&_[data-block-dragging]]:duration-150"
)

/** ⌘K (link), ⌘⇧↑ / ⌘⇧↓ (move block) and other editor-level shortcuts. The bubble menu registers `openLink`. */
export const NotionShortcuts = Extension.create({
  name: "notionShortcuts",
  addStorage() {
    return { openLink: undefined as undefined | (() => void) }
  },
  addKeyboardShortcuts() {
    return {
      "Mod-k": () => {
        if (this.editor.state.selection.empty) return false
        this.storage.openLink?.()
        return true
      },
      "Mod-Shift-ArrowUp": () => moveSelectedBlock(this.editor, "up"),
      "Mod-Shift-ArrowDown": () => moveSelectedBlock(this.editor, "down"),
    }
  },
})

type Content = string | JSONContent

function toJSON(value: Content | undefined) {
  if (value == null) return undefined
  return typeof value === "string" ? fromMDX(value) : value
}

export type UseNotionEditorOptions = {
  /** MDX string or editor JSON. */
  defaultValue?: Content
  /** Controlled value (MDX string or editor JSON). Pair with `onChange`. */
  value?: Content
  /** Called with the document as MDX on every change. */
  onChange?: (mdx: string, editor: Editor) => void
  /** Called on every change with the editor (read `editor.getJSON()` for JSON). */
  onUpdate?: (editor: Editor) => void
  readOnly?: boolean
  placeholder?: string
  placeholders?: Partial<Record<string, string>>
  slashItems?: SlashItem[]
  uploadImage?: ImageUploader
  /** Extra editor extensions. */
  extensions?: AnyExtension[]
  autofocus?: boolean | "start" | "end"
  "aria-label"?: string
}

/** The editor instance behind <NotionEditor>, for custom layouts. */
export function useNotionEditor({
  defaultValue,
  value,
  onChange,
  onUpdate,
  readOnly = false,
  placeholder,
  placeholders,
  slashItems,
  uploadImage,
  extensions = [],
  autofocus = false,
  "aria-label": ariaLabel,
}: UseNotionEditorOptions = {}) {
  const l10n = useLocale().labels
  const localeRef = React.useRef(l10n)
  localeRef.current = l10n
  const slashRef = React.useRef(slashItems)
  slashRef.current = slashItems
  if (ariaLabel === undefined) ariaLabel = l10n.document
  const last = React.useRef<string | undefined>(undefined)
  const callbacks = React.useRef({ onChange, onUpdate })
  callbacks.current = { onChange, onUpdate }

  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    autofocus,
    content: toJSON(value ?? defaultValue) ?? "",
    extensions: [
      ...notionExtensions({ placeholder, placeholders, uploadImage, labels: () => localeRef.current }).map((ext) =>
        ext.name === "callout" ? CalloutWithView : ext.name === "mdxBlock" ? MdxBlockWithView : ext
      ),
      SlashCommand.configure({ items: () => slashRef.current ?? getDefaultSlashItems(localeRef.current), labels: () => localeRef.current }),
      NotionShortcuts,
      ...extensions,
    ],
    editorProps: {
      attributes: { "aria-label": ariaLabel, "aria-multiline": "true", role: "textbox", spellcheck: "true" },
    },
    onUpdate: ({ editor }) => {
      callbacks.current.onUpdate?.(editor)
      if (callbacks.current.onChange) {
        const mdx = toMDX(editor)
        last.current = mdx
        callbacks.current.onChange(mdx, editor)
      }
    },
  })

  // controlled value
  React.useEffect(() => {
    if (!editor || value == null) return
    if (typeof value === "string") {
      if (value === last.current) return
      last.current = value
      if (toMDX(editor) === value) return
    } else if (JSON.stringify(editor.getJSON()) === JSON.stringify(value)) return
    editor.commands.setContent(toJSON(value) ?? "", { emitUpdate: false })
  }, [editor, value])

  React.useEffect(() => {
    editor?.setEditable(!readOnly)
  }, [editor, readOnly])

  return editor
}

function TipButton({
  label,
  kbd,
  ...props
}: React.ComponentProps<typeof ToolbarButton> & { label: string; kbd?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<ToolbarButton {...props} aria-label={props["aria-label"] ?? label} />} />
      <TooltipContent side="bottom">
        {label}
        {kbd && <TooltipKbd>{kbd}</TooltipKbd>}
      </TooltipContent>
    </Tooltip>
  )
}

function downloadText(text: string, fileName: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Import (.mdx/.md) and export (.mdx) a document. */
export async function importMDXFile(editor: Editor) {
  const file = await pickFile(".mdx,.md,.markdown,text/markdown")
  if (!file) return null
  const text = await file.text()
  editor.chain().setContent(fromMDX(text)).focus("start").run()
  return file.name
}

export function exportMDXFile(editor: Editor, fileName = "document.mdx") {
  downloadText(toMDX(editor), fileName.endsWith(".mdx") ? fileName : `${fileName}.mdx`, "text/markdown")
}

type ToolbarProps = {
  editor: Editor | null
  /** Download name for Export. Default `document.mdx`. */
  fileName?: string
  /** Extra items on the left, after undo/redo. */
  children?: React.ReactNode
  className?: string
}

/** Undo / redo, a word count, and MDX import / export. */
export function NotionEditorToolbar({ editor, fileName = "document.mdx", children, className }: ToolbarProps) {
  const l10n = useLocale().labels

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
            words: e.state.doc.textContent.split(/\s+/).filter(Boolean).length,
            editable: e.isEditable,
          }
        : { canUndo: false, canRedo: false, words: 0, editable: false },
  })
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
  const mod = isMac ? "⌘" : "Ctrl+"
  return (
    <Toolbar
      aria-label={l10n.document}
      className={cn("min-h-11 shrink-0 flex-wrap gap-y-1 border-b border-border px-2 py-2", className)}
      data-slot="notion-editor-toolbar"
    >
      <ToolbarGroup>
        <TipButton label={l10n.undo} kbd={`${mod}Z`} disabled={!state?.canUndo} onClick={() => editor?.chain().focus().undo().run()}>
          <UndoIcon className="rtl:-scale-x-100" />
        </TipButton>
        <TipButton label={l10n.redo} kbd={`${mod}⇧Z`} disabled={!state?.canRedo} onClick={() => editor?.chain().focus().redo().run()}>
          <UndoIcon className="-scale-x-100 rtl:scale-x-100" />
        </TipButton>
      </ToolbarGroup>
      {children}
      <span className="ml-auto px-2 text-ui-xs text-muted-foreground tabular-nums">
        {l10n.wordCount(state?.words ?? 0)}
      </span>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ToolbarButton disabled={!editor || !state?.editable} onClick={() => editor && void importMDXFile(editor)} size="label">
          <UploadIcon />
          {l10n.import}
        </ToolbarButton>
        <ToolbarButton disabled={!editor} onClick={() => editor && exportMDXFile(editor, fileName)} size="label">
          <DownloadIcon />
          {l10n.exportMDX}
        </ToolbarButton>
      </ToolbarGroup>
    </Toolbar>
  )
}

export type NotionEditorProps = UseNotionEditorOptions & {
  /** Show the top toolbar (undo/redo, import/export MDX). */
  toolbar?: boolean
  /** Download name used by the toolbar's Export. */
  fileName?: string
  /** Receive the editor once it exists (imperative access: `toMDX(editor)`). */
  onReady?: (editor: Editor) => void
  className?: string
  /** Classes for the scrolling document area. */
  contentClassName?: string
}

/**
 * A block editor: "/" menu, selection bubble, drag handles,
 * markdown shortcuts, MDX in and out.
 */
export function NotionEditor({
  toolbar = false,
  fileName,
  onReady,
  className,
  contentClassName,
  ...options
}: NotionEditorProps) {
  const editor = useNotionEditor(options)
  const readOnly = options.readOnly ?? false

  React.useEffect(() => {
    if (editor) onReady?.(editor)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per editor instance
  }, [editor])

  return (
    <div
      data-slot="notion-editor"
      data-readonly={readOnly || undefined}
      className={cn("frame-xl frame-inset-2 flex min-h-0 flex-col overflow-hidden bg-card text-card-foreground shadow-raised", className)}
    >
      {toolbar && <NotionEditorToolbar editor={editor} fileName={fileName} />}
      <div className={cn("relative min-h-0 flex-1 overflow-y-auto py-8 pr-8 pl-16", readOnly && "pl-8", contentClassName)}>
        <EditorContent editor={editor} className={cn(editorContentClass, "min-h-40")} />
        {editor && !readOnly && <EditorBlockHandle editor={editor} />}
      </div>
      {editor && !readOnly && <EditorBubbleMenu editor={editor} />}
    </div>
  )
}

export { fromMDX, moveBlock, moveSelectedBlock, toMDX }
