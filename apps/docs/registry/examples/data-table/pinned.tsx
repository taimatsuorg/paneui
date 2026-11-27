"use client"

import { Badge } from "@paneui/ui/components/badge"
import { DataTable, type DataTableColumn } from "@paneui/ui/components/data-table"

type PaymentRecord = {
  id: string
  email: string
  status: "Paid" | "Pending" | "Failed"
  method: string
  country: string
  amount: number
  date: string
}

const records: PaymentRecord[] = [
  { id: "pm-1", email: "olivia.1@example.com", status: "Paid", method: "Card", country: "United States", amount: 240, date: "2026-10-01" },
  { id: "pm-2", email: "jackson.1@example.com", status: "Pending", method: "Bank", country: "Japan", amount: 860, date: "2026-10-02" },
  { id: "pm-3", email: "isabella.1@example.com", status: "Failed", method: "Wallet", country: "Germany", amount: 145, date: "2026-10-03" },
  { id: "pm-4", email: "william.1@example.com", status: "Paid", method: "Card", country: "Brazil", amount: 520, date: "2026-10-04" },
  { id: "pm-5", email: "sofia.1@example.com", status: "Pending", method: "Bank", country: "India", amount: 390, date: "2026-10-05" },
  { id: "pm-6", email: "liam.1@example.com", status: "Paid", method: "Card", country: "Canada", amount: 710, date: "2026-10-06" },
]

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const tone = { Paid: "success", Pending: "warning", Failed: "destructive" } as const

const columns: DataTableColumn<PaymentRecord>[] = [
  { key: "email", header: "Email", width: 200, sortable: true, hideable: false },
  {
    key: "status",
    header: "Status",
    width: 120,
    sortable: true,
    cell: (r) => (
      <Badge size="sm" variant={tone[r.status]}>
        {r.status}
      </Badge>
    ),
  },
  { key: "method", header: "Method", width: 120, sortable: true },
  { key: "country", header: "Country", width: 150, sortable: true },
  { key: "amount", header: "Amount", width: 120, align: "right", sortable: true, cell: (r) => <span className="tabular-nums">{money.format(r.amount)}</span> },
  { key: "date", header: "Date", width: 130, align: "right", sortable: true },
]

export default function DataTablePinned() {
  return (
    <div className="w-full max-w-xl">
      <DataTable
        aria-label="Payments"
        data={records}
        columns={columns}
        getRowId={(r) => r.id}
        selectable
        pinStart
        searchPlaceholder="Search payments…"
        defaultPageSize={5}
        pageSizeOptions={[5, 10]}
        noun="payments"
      />
    </div>
  )
}
