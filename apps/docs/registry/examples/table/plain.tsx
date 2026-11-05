"use client"

import { Table, type TableColumn } from "@paneui/ui/components/table"

type Run = { id: string; branch: string; duration: string; status: string }

const runs: Run[] = [
  { id: "1042", branch: "main", duration: "2m 14s", status: "Passed" },
  { id: "1041", branch: "fix/radius", duration: "1m 58s", status: "Passed" },
  { id: "1040", branch: "feat/tabs", duration: "3m 02s", status: "Failed" },
  { id: "1039", branch: "main", duration: "2m 09s", status: "Passed" },
]

const columns: TableColumn<Run>[] = [
  { key: "id", header: "Run", width: 90, sortable: true },
  { key: "branch", header: "Branch", width: 180, grow: true, sortable: true },
  { key: "duration", header: "Duration", width: 110, align: "right" },
  { key: "status", header: "Status", width: 100 },
]

export default function TablePlain() {
  return (
    <div className="w-full max-w-2xl">
      <Table variant="plain" aria-label="Runs" data={runs} columns={columns} getRowId={(r) => r.id} height={40 + runs.length * 44} />
    </div>
  )
}
