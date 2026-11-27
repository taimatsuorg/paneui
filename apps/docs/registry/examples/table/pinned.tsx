"use client"

import * as React from "react"

import { Badge } from "@paneui/ui/components/badge"
import { Button } from "@paneui/ui/components/button"
import { Table, type TableColumn } from "@paneui/ui/components/table"

type Settlement = {
  id: string
  merchant: string
  method: string
  country: string
  currency: string
  amount: number
  status: "Settled" | "Pending" | "Failed"
  settledAt: string
}

const settlements: Settlement[] = [
  { id: "STL-901", merchant: "Northwind Studio", method: "Card", country: "United States", currency: "USD", amount: 2450, status: "Settled", settledAt: "2026-10-12" },
  { id: "STL-902", merchant: "Paperplane Labs", method: "Bank", country: "Japan", currency: "JPY", amount: 1840, status: "Pending", settledAt: "2026-10-12" },
  { id: "STL-903", merchant: "Harbor & Pine", method: "Card", country: "Germany", currency: "EUR", amount: 980, status: "Settled", settledAt: "2026-10-11" },
  { id: "STL-904", merchant: "Quill Systems", method: "Wallet", country: "Brazil", currency: "BRL", amount: 3120, status: "Failed", settledAt: "2026-10-10" },
  { id: "STL-905", merchant: "Fathom Audio", method: "Bank", country: "India", currency: "INR", amount: 1590, status: "Settled", settledAt: "2026-10-09" },
]

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const statusTone = { Settled: "success", Pending: "warning", Failed: "destructive" } as const

const columns: TableColumn<Settlement>[] = [
  { key: "merchant", header: "Merchant", width: 170, pinned: "start", sortable: true, cell: (r) => <span className="font-medium">{r.merchant}</span> },
  { key: "id", header: "Batch", width: 110, cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
  {
    key: "status",
    header: "Status",
    width: 120,
    sortable: true,
    cell: (r) => (
      <Badge size="sm" variant={statusTone[r.status]}>
        {r.status}
      </Badge>
    ),
  },
  { key: "method", header: "Method", width: 110 },
  { key: "country", header: "Country", width: 150 },
  { key: "currency", header: "Currency", width: 100 },
  { key: "amount", header: "Amount", width: 120, align: "right", sortable: true, cell: (r) => money.format(r.amount) },
  { key: "settledAt", header: "Date", width: 130, align: "right", sortable: true },
]

export default function TablePinned() {
  const [compact, setCompact] = React.useState(false)

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-xs text-muted-foreground">Scroll sideways to test pinned selection and merchant columns.</span>
        <Button size="xs" variant="outline" onClick={() => setCompact((v) => !v)}>
          {compact ? "Default density" : "Compact"}
        </Button>
      </div>
      <Table
        aria-label="Settlements"
        data={settlements}
        columns={columns}
        getRowId={(r) => r.id}
        size={compact ? "sm" : "default"}
        selectable
        height={280}
      />
    </div>
  )
}
