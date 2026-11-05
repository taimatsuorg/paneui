"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"

import { CheckCircleIcon, RefreshIcon } from "@paneui/ui/icons"
import { Button } from "@paneui/ui/components/button"
import { Table, TableLoadingFooter, type TableHandle, type TableProps } from "@paneui/ui/components/table"

interface AsyncPage<T> {
  rows: readonly T[]
  /** False once the last page has arrived. */
  hasMore: boolean
}

type AsyncStatus = "loading" | "idle" | "error" | "done"

interface UseAsyncPagesResult<T> {
  rows: T[]
  status: AsyncStatus
  error: unknown
  /** Number of pages received. */
  pages: number
  loadMore: () => void
  retry: () => void
  reload: () => void
}

/**
 * Page-by-page loader: fetches page 0 on mount (and whenever `resetKey`
 * changes), then one page per `loadMore`. Stale responses after a reload are
 * dropped and in-flight requests are aborted.
 */
function useAsyncPages<T>(
  loadPage: (page: number, signal: AbortSignal) => Promise<AsyncPage<T>>,
  resetKey?: unknown
): UseAsyncPagesResult<T> {
  const [state, setState] = React.useState<{ rows: T[]; pages: number; status: AsyncStatus; error: unknown }>({
    rows: [],
    pages: 0,
    status: "loading",
    error: null,
  })
  const loadRef = React.useRef(loadPage)
  loadRef.current = loadPage
  const generation = React.useRef(0)
  const controller = React.useRef<AbortController | null>(null)
  const busy = React.useRef(false)

  const fetchPage = React.useCallback((page: number, replace: boolean) => {
    const gen = replace ? ++generation.current : generation.current
    controller.current?.abort()
    const ac = new AbortController()
    controller.current = ac
    busy.current = true
    setState((s) => ({ ...s, ...(replace ? { rows: [], pages: 0 } : null), status: "loading", error: null }))
    loadRef.current(page, ac.signal).then(
      (result) => {
        if (gen !== generation.current || ac.signal.aborted) return
        busy.current = false
        setState((s) => ({
          rows: replace ? result.rows.slice() : s.rows.concat(result.rows),
          pages: page + 1,
          status: result.hasMore ? "idle" : "done",
          error: null,
        }))
      },
      (error) => {
        if (gen !== generation.current || ac.signal.aborted) return
        busy.current = false
        setState((s) => ({ ...s, status: "error", error }))
      }
    )
  }, [])

  React.useEffect(() => {
    fetchPage(0, true)
    return () => controller.current?.abort()
  }, [fetchPage, resetKey])

  const pagesRef = React.useRef(state.pages)
  pagesRef.current = state.pages
  const statusRef = React.useRef(state.status)
  statusRef.current = state.status

  const loadMore = React.useCallback(() => {
    if (busy.current || statusRef.current !== "idle") return
    fetchPage(pagesRef.current, false)
  }, [fetchPage])
  const retry = React.useCallback(() => {
    if (busy.current) return
    fetchPage(pagesRef.current, pagesRef.current === 0)
  }, [fetchPage])
  const reload = React.useCallback(() => fetchPage(0, true), [fetchPage])

  return { ...state, loadMore, retry, reload }
}

interface AsyncTableProps<T> extends Omit<TableProps<T>, "data" | "loading" | "onEndReached" | "footer"> {
  /** Fetch one page; reject to show the retry footer. Honour `signal` to cancel. */
  loadPage: (page: number, signal: AbortSignal) => Promise<AsyncPage<T>>
  /** Change to throw away loaded pages and start again (e.g. a new filter). */
  resetKey?: unknown
  /** Shown under the last row once every page is in. Pass null to hide. */
  endMessage?: React.ReactNode | ((count: number) => React.ReactNode)
  onStatusChange?: (status: AsyncStatus, rowCount: number) => void
}

/**
 * Table that loads on demand: skeleton rows while the first page arrives, then
 * the next page each time the virtualized list nears its end, with a loading
 * band under the last row, a retry band on failure and a quiet end-of-list
 * note. Built on the virtualized Table core, so sorting, selection, resize and
 * reorder all still work over whatever has loaded.
 */
function AsyncTable<T>({ loadPage, resetKey, endMessage, onStatusChange, ref, ...tableProps }: AsyncTableProps<T>) {
  const l10n = useLocale().labels

  const { rows, status, loadMore, retry, reload } = useAsyncPages(loadPage, resetKey)
  const tableRef = React.useRef<TableHandle | null>(null)
  React.useImperativeHandle(ref, () => ({
    scrollToIndex: (...args) => tableRef.current?.scrollToIndex(...args),
    scrollToTop: (...args) => tableRef.current?.scrollToTop(...args),
    element: () => tableRef.current?.element() ?? null,
  }))

  const onStatusRef = React.useRef(onStatusChange)
  onStatusRef.current = onStatusChange
  React.useEffect(() => {
    onStatusRef.current?.(status, rows.length)
  }, [status, rows.length])

  // Jump back to the top when a reload starts from scratch.
  const prevReset = React.useRef(resetKey)
  React.useEffect(() => {
    if (prevReset.current !== resetKey) tableRef.current?.scrollToTop("auto")
    prevReset.current = resetKey
  }, [resetKey])

  let footer: React.ReactNode = null
  if (status === "loading" && rows.length > 0) footer = <TableLoadingFooter />
  else if (status === "error") {
    footer = (
      <div role="alert" className="flex h-full items-center justify-center gap-3 text-ui text-muted-foreground">
        {l10n.couldNotLoadMoreRows}
        <Button size="xs" variant="secondary" onClick={rows.length ? retry : reload}>
          <RefreshIcon data-icon="inline-start" />
          {l10n.retry}
        </Button>
      </div>
    )
  } else if (status === "done" && endMessage !== null) {
    footer =
      typeof endMessage === "function" ? (
        endMessage(rows.length)
      ) : endMessage !== undefined ? (
        endMessage
      ) : (
        <div className="flex h-full items-center justify-center gap-1.5 text-ui-sm text-muted-foreground">
          <CheckCircleIcon className="size-3.5 text-success-text" />
          {l10n.allRowsLoaded(rows.length.toLocaleString("en-US"))}
        </div>
      )
  }

  return (
    <Table<T>
      {...tableProps}
      ref={tableRef}
      data={rows}
      loading={status === "loading"}
      onEndReached={loadMore}
      footer={footer ?? undefined}
      emptyState={
        status === "error" ? (
          <div role="alert" className="flex flex-col items-center gap-3">
            {l10n.couldNotLoadThisTable}
            <Button size="sm" variant="secondary" onClick={reload}>
              <RefreshIcon data-icon="inline-start" />
              {l10n.tryAgain}
            </Button>
          </div>
        ) : (
          tableProps.emptyState
        )
      }
    />
  )
}

export { AsyncTable, useAsyncPages, type AsyncTableProps, type AsyncPage, type AsyncStatus, type UseAsyncPagesResult }
