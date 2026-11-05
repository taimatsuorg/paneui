"use client"

import * as React from "react"
import { useLocale, type LocaleLabels } from "@paneui/ui/components/locale-provider"
import type { Editor } from "@tiptap/core"
import type { Node as PMNode } from "@tiptap/pm/model"
import { NodeSelection, Plugin, PluginKey, Selection, TextSelection } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

import { ArrowDownIcon, ArrowUpIcon, CopyIcon, GripVerticalIcon, PlusIcon, TrashIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { getBlockTypes, type BlockType } from "@paneui/ui/blocks/notion-editor/block-types"
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@paneui/ui/components/menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@paneui/ui/components/tooltip"

type Hovered = { pos: number; top: number; left: number }
type Drop = { pos: number; top: number; left: number; width: number }

/** Pointer travel (px) before a press on the grip becomes a drag. */
const DRAG_THRESHOLD = 4
/** Distance (px) from the scroll edge where a drag starts scrolling. */
const SCROLL_EDGE = 48

/** The top-level block under a viewport y coordinate. */
function blockAt(editor: Editor, y: number) {
  let found: { pos: number; node: PMNode; dom: HTMLElement } | null = null
  editor.state.doc.forEach((node, offset) => {
    if (found) return
    const dom = editor.view.nodeDOM(offset)
    if (!(dom instanceof HTMLElement)) return
    const r = dom.getBoundingClientRect()
    const style = getComputedStyle(dom)
    const mt = parseFloat(style.marginTop) || 0
    const mb = parseFloat(style.marginBottom) || 0
    if (y >= r.top - mt && y <= r.bottom + mb) found = { pos: offset, node, dom }
  })
  return found as { pos: number; node: PMNode; dom: HTMLElement } | null
}

/** The top-level block that holds the selection. */
function blockOfSelection(editor: Editor) {
  const { selection } = editor.state
  if (selection instanceof NodeSelection && selection.$from.depth === 0) return selection.from
  const { $from } = selection
  return $from.depth >= 1 ? $from.before(1) : null
}

/**
 * Moves the top-level block at `from` to the gap at `to` (a position between
 * top-level blocks of the current document) as one undoable step.
 */
export function moveBlock(editor: Editor, from: number, to: number) {
  const { state, view } = editor
  const node = state.doc.nodeAt(from)
  if (!node) return false
  const end = from + node.nodeSize
  if (to >= from && to <= end) return false
  const tr = state.tr.delete(from, end)
  const at = tr.mapping.map(to)
  tr.insert(at, node)
  tr.setSelection(node.isAtom ? NodeSelection.create(tr.doc, at) : Selection.near(tr.doc.resolve(at + 1)))
  view.dispatch(tr.scrollIntoView())
  view.focus()
  return true
}

/** Neighbour gaps of the top-level block at `pos`: where "move up" and "move down" put it. */
function siblingTargets(doc: PMNode, pos: number) {
  const starts: number[] = []
  doc.forEach((_node, offset) => starts.push(offset))
  const i = starts.indexOf(pos)
  if (i < 0) return { up: null, down: null }
  const up = i > 0 ? starts[i - 1]! : null
  const afterNext = i + 2 < starts.length ? starts[i + 2]! : i + 1 < starts.length ? doc.content.size : null
  return { up, down: afterNext }
}

/** Moves the block that holds the selection one step up or down (⌘⇧↑ / ⌘⇧↓). */
export function moveSelectedBlock(editor: Editor, dir: "up" | "down") {
  const pos = blockOfSelection(editor)
  if (pos == null) return false
  const target = siblingTargets(editor.state.doc, pos)[dir]
  if (target == null) return false
  // keep the caret where it was inside the block
  const { selection } = editor.state
  const offset = selection.from - pos
  const node = editor.state.doc.nodeAt(pos)!
  if (!moveBlock(editor, pos, target)) return false
  if (!(selection instanceof NodeSelection) && !node.isAtom) {
    const start = blockOfSelection(editor)
    if (start != null) {
      const at = Math.min(start + offset, editor.state.doc.content.size)
      editor.view.dispatch(editor.state.tr.setSelection(TextSelection.near(editor.state.doc.resolve(at))).scrollIntoView())
    }
  }
  return true
}

const draggingKey = new PluginKey<number | null>("blockDragging")

/** Dims the block being dragged (a node decoration, so the document DOM stays ProseMirror's). */
const draggingPlugin = () =>
  new Plugin<number | null>({
    key: draggingKey,
    state: {
      init: () => null,
      apply: (tr, value) => {
        const meta = tr.getMeta(draggingKey) as number | null | undefined
        if (meta !== undefined) return meta
        return value == null ? null : tr.mapping.map(value)
      },
    },
    props: {
      decorations(state) {
        const pos = draggingKey.getState(state)
        if (pos == null) return null
        const node = state.doc.nodeAt(pos)
        if (!node) return null
        return DecorationSet.create(state.doc, [Decoration.node(pos, pos + node.nodeSize, { "data-block-dragging": "" })])
      },
    },
  })

/** The gap nearest to a viewport y: before the first block whose middle is below it, or the end. */
function dropAt(editor: Editor, y: number) {
  const blocks: { pos: number; rect: DOMRect }[] = []
  editor.state.doc.forEach((_node, offset) => {
    const dom = editor.view.nodeDOM(offset)
    if (dom instanceof HTMLElement) blocks.push({ pos: offset, rect: dom.getBoundingClientRect() })
  })
  if (!blocks.length) return null
  const i = blocks.findIndex((b) => y < b.rect.top + b.rect.height / 2)
  if (i === -1) {
    const last = blocks[blocks.length - 1]!
    return { pos: editor.state.doc.content.size, y: last.rect.bottom + 2 }
  }
  const b = blocks[i]!
  const prev = blocks[i - 1]
  return { pos: b.pos, y: prev ? (prev.rect.bottom + b.rect.top) / 2 : b.rect.top - 2 }
}

type BlockHandleProps = {
  editor: Editor
  /** "Turn into" targets in the handle menu; `false` hides the submenu. */
  blockTypes?: BlockType[] | false
  className?: string
}

/**
 * Gutter controls: "+" (insert below and open the slash menu) and a grip
 * (drag to reorder, click for move / duplicate / delete / turn into). With a
 * mouse it follows the hovered block; on touch it follows the block holding the
 * caret. Render it inside the same `relative` container as `EditorContent`.
 * Content needs ~3.5rem of left padding.
 */
export function EditorBlockHandle({ editor, blockTypes, className }: BlockHandleProps) {
  const l10n = useLocale().labels

  if (blockTypes === undefined) blockTypes = getBlockTypes(l10n)

  const ref = React.useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = React.useState<Hovered | null>(null)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [drop, setDrop] = React.useState<Drop | null>(null)
  const [dragging, setDragging] = React.useState(false)
  // read in DOM listeners without re-subscribing (a menu opening fires mouseleave synchronously)
  const busy = React.useRef(false)
  busy.current = menuOpen || dragging
  const pointer = React.useRef<string>("mouse")
  const drag = React.useRef<{
    id: number
    pos: number
    x: number
    y: number
    lastY: number
    active: boolean
    frame: number
    target: number | null
  } | null>(null)
  const suppressClick = React.useRef(false)

  const place = React.useCallback(
    (pos: number) => {
      const container = ref.current?.parentElement
      const dom = editor.view.nodeDOM(pos)
      if (!container || !(dom instanceof HTMLElement)) return
      const c = container.getBoundingClientRect()
      const r = dom.getBoundingClientRect()
      const style = getComputedStyle(dom)
      const lineHeight = parseFloat(style.lineHeight)
      const padTop = parseFloat(style.paddingTop) || 0
      const line = Number.isFinite(lineHeight) ? lineHeight : 24
      setHovered({
        pos,
        top: r.top - c.top + container.scrollTop + padTop + (line - 24) / 2,
        left: r.left - c.left + container.scrollLeft,
      })
    },
    [editor]
  )

  React.useEffect(() => {
    const plugin = draggingPlugin()
    editor.registerPlugin(plugin)
    return () => {
      if (!editor.isDestroyed) editor.unregisterPlugin(draggingKey)
    }
  }, [editor])

  React.useEffect(() => {
    const container = ref.current?.parentElement
    if (!container) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !editor.isEditable || busy.current) return
      pointer.current = "mouse"
      if (ref.current?.contains(e.target as globalThis.Node)) return
      const found = blockAt(editor, e.clientY)
      if (found) place(found.pos)
    }
    const onDown = (e: PointerEvent) => {
      pointer.current = e.pointerType
    }
    // touch and pen have no hover: the handle sits on the block that holds the caret
    const follow = () => {
      if (pointer.current === "mouse" || busy.current || !editor.isEditable) return
      const pos = blockOfSelection(editor)
      if (pos == null) return
      requestAnimationFrame(() => place(pos))
    }
    const hide = () => {
      if (pointer.current === "mouse" && !busy.current) setHovered(null)
    }
    const onUpdate = () => {
      if (pointer.current === "mouse") hide()
      else follow()
    }
    container.addEventListener("pointermove", onMove)
    container.addEventListener("pointerdown", onDown, true)
    container.addEventListener("mouseleave", hide)
    editor.view.dom.addEventListener("keydown", hide)
    editor.on("update", onUpdate)
    editor.on("selectionUpdate", follow)
    editor.on("focus", follow)
    return () => {
      container.removeEventListener("pointermove", onMove)
      container.removeEventListener("pointerdown", onDown, true)
      container.removeEventListener("mouseleave", hide)
      editor.view.dom.removeEventListener("keydown", hide)
      editor.off("update", onUpdate)
      editor.off("selectionUpdate", follow)
      editor.off("focus", follow)
    }
  }, [editor, place])

  const node = hovered ? editor.state.doc.nodeAt(hovered.pos) : null
  const targets = hovered && node ? siblingTargets(editor.state.doc, hovered.pos) : { up: null, down: null }

  const insertBelow = () => {
    if (!hovered || !node) return
    if (node.type.name === "paragraph" && node.content.size === 0) {
      editor.chain().focus().setTextSelection(hovered.pos + 1).insertContent("/").run()
    } else {
      const end = hovered.pos + node.nodeSize
      editor
        .chain()
        .insertContentAt(end, { type: "paragraph", content: [{ type: "text", text: "/" }] })
        .setTextSelection(end + 2)
        .focus()
        .run()
    }
    setHovered(null)
  }

  const selectBlock = () => {
    if (!hovered) return
    const { view } = editor
    view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, hovered.pos)))
  }

  // ---- drag to reorder (pointer events: one path for mouse, pen and touch) ----

  const updateDrop = (y: number) => {
    const d = drag.current
    const container = ref.current?.parentElement
    if (!d || !container) return
    const target = dropAt(editor, y)
    const moving = editor.state.doc.nodeAt(d.pos)
    if (!target || !moving || (target.pos >= d.pos && target.pos <= d.pos + moving.nodeSize)) {
      d.target = null
      setDrop(null)
      return
    }
    d.target = target.pos
    const c = container.getBoundingClientRect()
    const content = editor.view.dom.getBoundingClientRect()
    setDrop({
      pos: target.pos,
      top: target.y - c.top + container.scrollTop - 1,
      left: content.left - c.left + container.scrollLeft,
      width: content.width,
    })
  }

  const autoScroll = () => {
    const d = drag.current
    const container = ref.current?.parentElement
    if (!d?.active || !container) return
    const c = container.getBoundingClientRect()
    const speed =
      d.lastY < c.top + SCROLL_EDGE
        ? -Math.ceil((c.top + SCROLL_EDGE - d.lastY) / 4)
        : d.lastY > c.bottom - SCROLL_EDGE
          ? Math.ceil((d.lastY - (c.bottom - SCROLL_EDGE)) / 4)
          : 0
    if (speed) {
      const before = container.scrollTop
      container.scrollTop += speed
      if (container.scrollTop !== before) updateDrop(d.lastY)
    }
    d.frame = requestAnimationFrame(autoScroll)
  }

  const endDrag = (commit: boolean) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    cancelAnimationFrame(d.frame)
    window.removeEventListener("keydown", onDragKey, true)
    if (d.active) {
      suppressClick.current = true
      setTimeout(() => (suppressClick.current = false), 0)
      editor.view.dispatch(editor.state.tr.setMeta(draggingKey, null).setMeta("addToHistory", false))
      const target = d.target
      setDrop(null)
      setDragging(false)
      busy.current = false
      if (commit && target != null) {
        moveBlock(editor, d.pos, target)
        setHovered(null)
      }
    }
  }

  // Escape cancels a drag in progress
  function onDragKey(e: KeyboardEvent) {
    if (e.key !== "Escape") return
    e.preventDefault()
    e.stopPropagation()
    endDrag(false)
  }

  const onGripPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!hovered || !node || (e.pointerType === "mouse" && e.button !== 0)) return
    // no text selection or focus move from the press; the menu still opens on click
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: e.pointerId, pos: hovered.pos, x: e.clientX, y: e.clientY, lastY: e.clientY, active: false, frame: 0, target: null }
  }

  const onGripPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    d.lastY = e.clientY
    if (!d.active) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < DRAG_THRESHOLD) return
      d.active = true
      busy.current = true
      setDragging(true)
      setMenuOpen(false)
      editor.view.dispatch(editor.state.tr.setMeta(draggingKey, d.pos).setMeta("addToHistory", false))
      window.addEventListener("keydown", onDragKey, true)
      d.frame = requestAnimationFrame(autoScroll)
    }
    updateDrop(e.clientY)
  }

  const onGripPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (drag.current?.id === e.pointerId) endDrag(true)
  }

  const onGripPointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (drag.current?.id === e.pointerId) endDrag(false)
  }

  // ---- menu actions ----

  const turnInto = (b: BlockType) => {
    if (!hovered || !node) return
    const inside = node.isTextblock ? hovered.pos + 1 : hovered.pos + 2
    const { view } = editor
    const pos = Math.min(inside, view.state.doc.content.size)
    view.dispatch(view.state.tr.setSelection(TextSelection.near(view.state.doc.resolve(pos))))
    b.apply(editor)
  }

  const move = (dir: "up" | "down") => {
    if (!hovered) return
    const target = targets[dir]
    if (target == null) return
    const from = hovered.pos
    moveBlock(editor, from, target)
    // keep the handle on the moved block so it can be moved again
    const pos = blockOfSelection(editor)
    if (pos != null) requestAnimationFrame(() => place(pos))
  }

  const duplicate = () => {
    if (!hovered || !node) return
    editor.chain().insertContentAt(hovered.pos + node.nodeSize, node.toJSON()).focus().run()
  }

  const remove = () => {
    if (!hovered || !node) return
    editor.chain().deleteRange({ from: hovered.pos, to: hovered.pos + node.nodeSize }).focus().run()
    setHovered(null)
  }

  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
  const mod = isMac ? "⌘⇧" : "Ctrl+Shift+"
  const visible = !!hovered && editor.isEditable
  return (
    <>
      <div
        ref={ref}
        data-slot="editor-block-handle"
        data-dragging={dragging || undefined}
        aria-hidden={!visible}
        className={cn(
          "absolute z-10 flex items-center gap-0.5 transition-opacity duration-150",
          visible ? "opacity-100" : "pointer-events-none opacity-0",
          className
        )}
        style={hovered ? { top: hovered.top, left: hovered.left - 52 } : undefined}
      >
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={l10n.insertBlockBelow}
                onClick={insertBelow}
                className="inline-flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground/72 transition-colors outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PlusIcon className="size-4" />
              </button>
            }
          />
          <TooltipContent side="bottom">{l10n.clickToAddBelow}</TooltipContent>
        </Tooltip>
        <Menu
          open={menuOpen}
          onOpenChange={(open) => {
            if (open && drag.current?.active) return
            busy.current = open
            setMenuOpen(open)
            if (open) selectBlock()
          }}
        >
          <MenuTrigger
            render={
              <button
                type="button"
                aria-label={l10n.dragToMoveClickForBlockActions}
                // Menus open on press, which would fight the drag: open on click instead.
                onMouseDown={(e: React.MouseEvent & { preventBaseUIHandler?: () => void }) => e.preventBaseUIHandler?.()}
                onPointerDown={(e: React.PointerEvent<HTMLButtonElement> & { preventBaseUIHandler?: () => void }) => {
                  e.preventBaseUIHandler?.()
                  onGripPointerDown(e)
                }}
                onPointerMove={onGripPointerMove}
                onPointerUp={onGripPointerUp}
                onPointerCancel={onGripPointerCancel}
                onLostPointerCapture={onGripPointerCancel}
                onContextMenu={(e) => e.preventDefault()}
                onClick={(e: React.MouseEvent & { preventBaseUIHandler?: () => void }) => {
                  e.preventBaseUIHandler?.()
                  if (suppressClick.current) return
                  busy.current = !menuOpen
                  if (!menuOpen) selectBlock()
                  setMenuOpen(!menuOpen)
                }}
                className={cn(
                  "relative inline-flex h-6 w-5 cursor-grab touch-none after:absolute after:inset-x-0 after:-inset-y-2 pointer-coarse:after:-inset-y-3 items-center justify-center rounded-md text-muted-foreground/72 transition-colors outline-none select-none [-webkit-touch-callout:none] hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing data-popup-open:bg-secondary",
                  dragging && "cursor-grabbing bg-secondary text-foreground"
                )}
              >
                <GripVerticalIcon className="size-4" />
              </button>
            }
          />
          <MenuContent side="left" align="start" sideOffset={4} className="w-56">
            <MenuGroup>
              <MenuLabel>{node ? labelOf(node, l10n) : l10n.block}</MenuLabel>
              {blockTypes && node?.isTextblock !== false && node?.type.name !== "codeBlock" && (
                <MenuSub>
                  <MenuSubTrigger>{l10n.turnInto}</MenuSubTrigger>
                  <MenuSubContent className="w-44">
                    {blockTypes.map((b) => (
                      <MenuItem key={b.id} onClick={() => turnInto(b)}>
                        <b.icon />
                        {b.label}
                      </MenuItem>
                    ))}
                  </MenuSubContent>
                </MenuSub>
              )}
              <MenuItem disabled={targets.up == null} onClick={() => move("up")}>
                <ArrowUpIcon />
                {l10n.moveUp}
                <MenuShortcut className="pointer-coarse:hidden">{mod}↑</MenuShortcut>
              </MenuItem>
              <MenuItem disabled={targets.down == null} onClick={() => move("down")}>
                <ArrowDownIcon />
                {l10n.moveDown}
                <MenuShortcut className="pointer-coarse:hidden">{mod}↓</MenuShortcut>
              </MenuItem>
              <MenuItem onClick={duplicate}>
                <CopyIcon />
                {l10n.duplicate}
              </MenuItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuItem variant="destructive" onClick={remove}>
              <TrashIcon />
              Delete
              <MenuShortcut>Del</MenuShortcut>
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
      {drop && (
        <div
          aria-hidden
          data-slot="editor-drop-indicator"
          className="pointer-events-none absolute z-10 h-0.5 rounded-full bg-primary"
          style={{ top: drop.top, left: drop.left, width: drop.width }}
        />
      )}
    </>
  )
}

function labelOf(node: PMNode, l10n: LocaleLabels) {
  const names: Record<string, string> = {
    paragraph: l10n.text,
    heading: l10n.headingLevel(node.attrs.level),
    bulletList: l10n.bulletedList,
    orderedList: l10n.numberedList,
    taskList: l10n.todoList,
    blockquote: l10n.quote,
    codeBlock: l10n.codeBlock,
    horizontalRule: l10n.divider,
    image: l10n.image,
    table: l10n.table,
    details: l10n.toggle,
    callout: l10n.callout,
    mdxBlock: "MDX",
  }
  return names[node.type.name] ?? node.type.name.replace(/^\w/, (c) => c.toUpperCase())
}
