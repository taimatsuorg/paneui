"use client"

import * as React from "react"
import Editor, { loader, type Monaco, type OnMount } from "@monaco-editor/react"

import { Button } from "@paneui/ui/components/button"
import { Skeleton } from "@paneui/ui/components/skeleton"

import type { Docs } from "./buffers"
import { applyEditorTheme, EDITOR_THEME, monoFont, TYPE_SHIMS } from "./editor-theme"
import { languageOf } from "./languages"
import { basename, inWorkspace, type Workspace } from "./workspace"

type CodeEditorInstance = Parameters<OnMount>[0]

export type Problem = {
  path: string
  line: number
  column: number
  endLine: number
  endColumn: number
  message: string
  severity: "error" | "warning" | "info"
  source?: string
}

export type CodeEditorHandle = {
  /** Show a file at a position and select the range. */
  reveal: (line: number, column: number, endLine?: number, endColumn?: number) => void
  focus: () => void
  /** Run a built-in editor action (`editor.action.formatDocument`, `editor.action.gotoLine`…). */
  run: (actionId: string) => void
}

const uriOf = (monaco: Monaco, path: string) => monaco.Uri.file(path)

let configured = false

/** Compiler settings and module shims for the TypeScript worker, once per page. */
function configure(monaco: Monaco) {
  if (configured) return
  configured = true
  const ts = monaco.typescript ?? monaco.languages.typescript
  if (!ts) return
  const options = {
    target: ts.ScriptTarget.ES2022 ?? ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    allowNonTsExtensions: true,
    skipLibCheck: true,
    isolatedModules: true,
  }
  ts.typescriptDefaults.setCompilerOptions(options)
  ts.javascriptDefaults.setCompilerOptions({ ...options, allowJs: true, checkJs: false })
  ts.typescriptDefaults.setEagerModelSync(true)
  ts.typescriptDefaults.addExtraLib(TYPE_SHIMS, "file:///node_modules/@types/workspace-shims/index.d.ts")
}

/**
 * The code editor: one editor instance whose model switches with the active
 * tab. Every workspace file has a model, so imports resolve across files and
 * the Problems list covers the whole workspace. Typing writes to the buffer
 * store; buffer changes from elsewhere (revert, a terminal write) flow back in.
 * While the editor loads it shows the shape of the code (gutter and lines at
 * the editor's own pitch, so nothing moves when it arrives); if it cannot load it falls back
 * to a plain text area on the same buffers.
 */
export function CodeEditor({
  ws,
  docs,
  path,
  onCursor,
  onProblems,
  onSave,
  compact = false,
  empty,
  handleRef,
}: {
  ws: Workspace
  docs: Docs
  path: string | null
  onCursor: (pos: { line: number; column: number; selected: number }) => void
  onProblems: (problems: Problem[]) => void
  onSave: () => void
  /** Phone layout: no minimap, narrower gutter. */
  compact?: boolean
  /** What shows when no file is open; defaults to a short list of shortcuts. */
  empty?: React.ReactNode
  handleRef?: React.Ref<CodeEditorHandle>
}) {
  const [monaco, setMonaco] = React.useState<Monaco | null>(null)
  const [editor, setEditor] = React.useState<CodeEditorInstance | null>(null)
  const [failed, setFailed] = React.useState(false)
  const viewStates = React.useRef(new Map<string, unknown>())
  const current = React.useRef<string | null>(null)
  const syncing = React.useRef(false)
  const wsVersion = React.useSyncExternalStore((cb) => ws.subscribe(cb), ws.getVersion, ws.getVersion)
  const docsVersion = React.useSyncExternalStore((cb) => docs.subscribe(cb), docs.getVersion, docs.getVersion)

  const latest = React.useRef({ onCursor, onProblems, onSave })
  latest.current = { onCursor, onProblems, onSave }

  // Give up on the editor (blocked network, offline) after a while and use the text area.
  React.useEffect(() => {
    let live = true
    const timer = setTimeout(() => live && !monaco && setFailed(true), 20000)
    loader.init().then(
      () => clearTimeout(timer),
      () => live && setFailed(true)
    )
    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [monaco])

  /* -------------------------- models follow files -------------------------- */

  React.useEffect(() => {
    if (!monaco) return
    syncing.current = true
    const wanted = new Set([...ws.listFiles(), ...docs.paths()])
    for (const p of wanted) {
      const text = docs.get(p) ?? (ws.exists(p) && !ws.isDir(p) ? ws.readFile(p) : "")
      const uri = uriOf(monaco, p)
      const model = monaco.editor.getModel(uri)
      if (!model) {
        const created = monaco.editor.createModel(text, languageOf(basename(p)).id, uri)
        created.onDidChangeContent(() => {
          if (!syncing.current) docs.set(p, created.getValue())
        })
      } else if (model.getValue() !== text) {
        // Keep it undoable: one edit that replaces the whole text.
        model.pushEditOperations([], [{ range: model.getFullModelRange(), text }], () => null)
      }
    }
    for (const model of monaco.editor.getModels()) {
      const p = model.uri.path
      if (model.uri.scheme === "file" && inWorkspace(p) && !wanted.has(p) && model !== editor?.getModel()) model.dispose()
    }
    syncing.current = false
  }, [monaco, editor, ws, docs, wsVersion, docsVersion])

  /* ------------------------------ active model ----------------------------- */

  React.useEffect(() => {
    if (!monaco || !editor) return
    const prev = current.current
    if (prev === path) return
    if (prev) viewStates.current.set(prev, editor.saveViewState())
    current.current = path
    const model = path ? monaco.editor.getModel(uriOf(monaco, path)) : null
    editor.setModel(model)
    if (path && model) {
      const state = viewStates.current.get(path)
      if (state) editor.restoreViewState(state as Parameters<CodeEditorInstance["restoreViewState"]>[0])
      const pos = editor.getPosition()
      if (pos) latest.current.onCursor({ line: pos.lineNumber, column: pos.column, selected: 0 })
    }
  }, [monaco, editor, path, wsVersion])

  /* ---------------------------- theme and markers --------------------------- */

  React.useEffect(() => {
    if (!monaco) return
    const html = document.documentElement
    const obs = new MutationObserver(() => applyEditorTheme(monaco))
    obs.observe(html, { attributes: true, attributeFilter: ["class", "data-accent", "style"] })
    const collect = () => {
      const problems: Problem[] = []
      for (const m of monaco.editor.getModelMarkers({})) {
        if (m.resource.scheme !== "file" || !inWorkspace(m.resource.path)) continue
        problems.push({
          path: m.resource.path,
          line: m.startLineNumber,
          column: m.startColumn,
          endLine: m.endLineNumber,
          endColumn: m.endColumn,
          message: typeof m.message === "string" ? m.message : String(m.message),
          severity: m.severity >= 8 ? "error" : m.severity >= 4 ? "warning" : "info",
          source: m.source,
        })
      }
      problems.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line)
      latest.current.onProblems(problems)
    }
    const sub = monaco.editor.onDidChangeMarkers(collect)
    collect()
    return () => {
      obs.disconnect()
      sub.dispose()
    }
  }, [monaco])

  React.useEffect(() => {
    editor?.updateOptions({ minimap: { enabled: !compact }, lineNumbersMinChars: compact ? 3 : 4, folding: !compact })
  }, [editor, compact])

  React.useImperativeHandle(
    handleRef,
    () => ({
      reveal: (line, column, endLine = line, endColumn = column) => {
        if (!editor) return
        editor.setSelection({ startLineNumber: line, startColumn: column, endLineNumber: endLine, endColumn })
        editor.revealRangeInCenterIfOutsideViewport({ startLineNumber: line, startColumn: column, endLineNumber: endLine, endColumn })
        editor.focus()
      },
      focus: () => editor?.focus(),
      run: (id) => {
        editor?.focus()
        void editor?.getAction(id)?.run()
      },
    }),
    [editor]
  )

  if (failed && !monaco) return <FallbackEditor docs={docs} path={path} onSave={onSave} empty={empty} />

  return (
    <div className="relative h-full min-h-0">
      {!path && (empty ?? <EmptyEditor />)}
      <div className={path ? "h-full" : "invisible h-full"}>
        <Editor
          theme={EDITOR_THEME}
          keepCurrentModel
          loading={<EditorLoading compact={compact} />}
          beforeMount={(m) => {
            configure(m)
            applyEditorTheme(m)
          }}
          onMount={(ed, m) => {
            ed.onDidChangeCursorSelection((e) => {
              const model = ed.getModel()
              const sel = e.selection
              latest.current.onCursor({
                line: sel.positionLineNumber,
                column: sel.positionColumn,
                selected: model ? model.getValueInRange(sel).length : 0,
              })
            })
            // Inside the editor its own key handling runs first, so bind save here too.
            ed.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.KeyS, () => latest.current.onSave())
            setEditor(ed)
            setMonaco(m)
          }}
          options={{
            fontFamily: typeof window === "undefined" ? undefined : monoFont(),
            fontSize: 12.5,
            lineHeight: 20,
            fontLigatures: true,
            automaticLayout: true,
            minimap: { enabled: !compact, renderCharacters: false, scale: 1, maxColumn: 80 },
            scrollBeyondLastLine: false,
            padding: { top: 8, bottom: 8 },
            renderLineHighlight: "line",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            bracketPairColorization: { enabled: true },
            guides: { indentation: true, bracketPairs: false },
            tabSize: 2,
            stickyScroll: { enabled: true },
            overviewRulerBorder: false,
            scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10, useShadows: false },
            fixedOverflowWidgets: true,
          }}
        />
      </div>
    </div>
  )
}

/** The loading skeleton's lines as [indent, width] in characters: the rough shape of a component file. */
const SKELETON_LINES: [number, number][] = [
  [0, 28], [0, 34], [0, 0], [0, 22], [0, 0], [0, 40], [2, 18], [2, 46], [4, 38], [4, 30], [2, 24], [0, 0],
  [2, 30], [4, 44], [6, 36], [6, 28], [4, 12], [2, 8], [0, 0], [0, 26], [2, 20],
]

/**
 * The editor before it loads: a gutter of line numbers and grey bars on the editor's 20px line
 * pitch with its 8px top padding, so the code lands where the bars were.
 */
function EditorLoading({ compact }: { compact?: boolean }) {
  return (
    <div role="status" aria-label="Loading editor" className="flex h-full w-full overflow-hidden pt-2">
      <div aria-hidden className={compact ? "w-8 shrink-0" : "w-12 shrink-0"}>
        {SKELETON_LINES.map((_, i) => (
          <div key={i} className="flex h-5 items-center justify-end pe-3 font-mono text-ui-xs text-muted-foreground tabular-nums opacity-48">
            {i + 1}
          </div>
        ))}
      </div>
      <div aria-hidden className="min-w-0 flex-1 ps-3 font-mono text-ui-sm">
        {SKELETON_LINES.map(([indent, width], i) => (
          <div key={i} className="flex h-5 items-center" style={{ paddingInlineStart: `${indent}ch` }}>
            {width > 0 && <Skeleton className="h-2.5" style={{ width: `${width}ch`, maxWidth: "100%" }} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyEditor() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background p-6 text-center">
      <p className="text-ui text-muted-foreground">No file open.</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-ui-sm text-muted-foreground">
        <dt className="text-end">Show all commands</dt>
        <dd className="text-start font-mono">⇧⌘P</dd>
        <dt className="text-end">Go to file</dt>
        <dd className="text-start font-mono">⌘P</dd>
        <dt className="text-end">Toggle panel</dt>
        <dd className="text-start font-mono">⌃`</dd>
      </dl>
    </div>
  )
}

/** Plain text area on the same buffers, for when the editor cannot load. */
function FallbackEditor({ docs, path, onSave, empty }: { docs: Docs; path: string | null; onSave: () => void; empty?: React.ReactNode }) {
  React.useSyncExternalStore((cb) => docs.subscribe(cb), docs.getVersion, docs.getVersion)
  if (!path) return <>{empty ?? <EmptyEditor />}</>
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-warning-border bg-warning-subtle px-3 text-ui-sm text-muted-foreground">
        <span className="min-w-0 flex-1 truncate">The editor could not load. Editing as plain text.</span>
        <Button variant="ghost" size="xs" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
      <textarea
        aria-label={`Contents of ${basename(path)}`}
        spellCheck={false}
        value={docs.get(path) ?? ""}
        onChange={(e) => docs.set(path, e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
            e.preventDefault()
            onSave()
          }
        }}
        className="min-h-0 flex-1 resize-none bg-background p-3 font-mono text-ui-sm leading-5 text-foreground outline-none"
      />
    </div>
  )
}
