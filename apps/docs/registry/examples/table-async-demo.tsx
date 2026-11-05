"use client"

import * as React from "react"

import { RefreshIcon } from "@paneui/ui/icons"
import { Badge } from "@paneui/ui/components/badge"
import { Button } from "@paneui/ui/components/button"
import type { TableColumn } from "@paneui/ui/components/table"
import { AsyncTable, type AsyncPage, type AsyncStatus } from "@paneui/ui/components/table-async"

type LogEvent = { id: string; time: string; service: string; level: "info" | "warn" | "error"; message: string; latency: number }

const PAGE_SIZE = 40
const PAGES = 8
const SERVICES = ["api-gateway", "billing", "auth", "search", "notifier", "media"]
const MESSAGES = [
  "Request completed",
  "Cache miss, fetched from origin",
  "Retrying upstream call",
  "Token refreshed",
  "Slow query detected",
  "Webhook delivered",
  "Rate limit approaching",
  "Upstream returned 502",
]

/** Seeded per page, so every reload returns the same rows. */
function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function makePage(page: number): LogEvent[] {
  const rand = seeded(page * 7919 + 17)
  return Array.from({ length: PAGE_SIZE }, (_, i) => {
    const n = page * PAGE_SIZE + i
    const minutes = n * 3 + Math.floor(rand() * 3)
    const hh = String(23 - (Math.floor(minutes / 60) % 24)).padStart(2, "0")
    const mm = String(59 - (minutes % 60)).padStart(2, "0")
    const roll = rand()
    return {
      id: `evt_${(n + 1).toString(36).padStart(4, "0")}`,
      time: `${hh}:${mm}`,
      service: SERVICES[Math.floor(rand() * SERVICES.length)],
      level: roll > 0.9 ? "error" : roll > 0.72 ? "warn" : "info",
      message: MESSAGES[Math.floor(rand() * MESSAGES.length)],
      latency: Math.round(20 + rand() ** 3 * 1800),
    }
  })
}

/** Pretend API: ~0.9s per page, 8 pages. */
function fetchEvents(page: number, signal: AbortSignal): Promise<AsyncPage<LogEvent>> {
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    }
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort)
      resolve({ rows: makePage(page), hasMore: page < PAGES - 1 })
    }, page === 0 ? 1400 : 900)
    signal.addEventListener("abort", onAbort, { once: true })
  })
}

const levelVariant = { info: "outline", warn: "warning", error: "destructive" } as const

const columns: TableColumn<LogEvent>[] = [
  { key: "time", header: "Time", width: 80, cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.time}</span> },
  { key: "level", header: "Level", width: 90, cell: (r) => <Badge size="sm" variant={levelVariant[r.level]}>{r.level}</Badge> },
  { key: "service", header: "Service", width: 130, cell: (r) => <span className="font-medium">{r.service}</span> },
  { key: "message", header: "Message", width: 240, grow: true, cell: (r) => <span className="text-muted-foreground">{r.message}</span> },
  {
    key: "latency",
    header: "Latency",
    width: 100,
    align: "right",
    sortable: true,
    cell: (r) => <span className={r.latency > 800 ? "text-warning-text" : undefined}>{r.latency} ms</span>,
  },
]

export default function TableAsyncDemo() {
  const [reloads, setReloads] = React.useState(0)
  const [status, setStatus] = React.useState<{ status: AsyncStatus; count: number }>({ status: "loading", count: 0 })

  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <div className="flex h-8 items-center justify-between px-1 text-sm text-muted-foreground">
        <span aria-live="polite">
          <span className="font-medium text-foreground">Event log</span> ·{" "}
          {status.count === 0 ? "connecting…" : `${status.count} of ${PAGE_SIZE * PAGES} loaded`}
        </span>
        <Button size="xs" variant="secondary" onClick={() => setReloads((n) => n + 1)} disabled={status.status === "loading"}>
          <RefreshIcon data-icon="inline-start" />
          Reload
        </Button>
      </div>
      <AsyncTable
        aria-label="Event log"
        columns={columns}
        loadPage={fetchEvents}
        resetKey={reloads}
        getRowId={(row) => row.id}
        onStatusChange={(s, count) => setStatus({ status: s, count })}
        rowHeight={40}
        height={380}
        reorderable
      />
    </div>
  )
}
