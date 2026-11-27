"use client"

import * as React from "react"

import { Badge } from "@paneui/ui/components/badge"
import { Button } from "@paneui/ui/components/button"
import { DataTable, type DataTableColumn } from "@paneui/ui/components/data-table"

type Transfer = { id: string; recipient: string; status: "Cleared" | "Processing"; amount: number }

const transfers: Transfer[] = [
  { id: "TR-101", recipient: "Northwind Studio", status: "Cleared", amount: 4200 },
  { id: "TR-102", recipient: "Lumen Health", status: "Processing", amount: 1850 },
  { id: "TR-103", recipient: "Harbor & Pine", status: "Cleared", amount: 920 },
  { id: "TR-104", recipient: "Atlas Robotics", status: "Cleared", amount: 7400 },
  { id: "TR-105", recipient: "Quill Systems", status: "Processing", amount: 1320 },
]

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

const columns: DataTableColumn<Transfer>[] = [
  { key: "recipient", header: "Recipient", width: 200, grow: true, sortable: true, hideable: false },
  {
    key: "status",
    header: "Status",
    width: 120,
    sortable: true,
    cell: (r) => (
      <Badge size="sm" variant={r.status === "Cleared" ? "success" : "warning"}>
        {r.status}
      </Badge>
    ),
  },
  { key: "amount", header: "Amount", width: 120, align: "right", sortable: true, cell: (r) => <span className="tabular-nums">{usd.format(r.amount)}</span> },
]

export default function DataTableLoading() {
  const [loading, setLoading] = React.useState(true)

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="flex gap-2">
        <Button size="xs" variant={loading ? "secondary" : "ghost"} onClick={() => setLoading(true)}>
          Skeleton
        </Button>
        <Button size="xs" variant={!loading ? "secondary" : "ghost"} onClick={() => setLoading(false)}>
          Loaded
        </Button>
      </div>
      <DataTable
        aria-label="Transfers"
        data={loading ? [] : transfers}
        columns={columns}
        getRowId={(r) => r.id}
        loading={loading}
        loadingRows={5}
        selectable
        noun="transfers"
      />
    </div>
  )
}
