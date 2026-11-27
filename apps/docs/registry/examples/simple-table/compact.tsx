import { Badge } from "@paneui/ui/components/badge"
import {
  SimpleTable,
  SimpleTableBody,
  SimpleTableCaption,
  SimpleTableCell,
  SimpleTableFooter,
  SimpleTableHead,
  SimpleTableHeader,
  SimpleTableRow,
} from "@paneui/ui/components/simple-table"

const invoices = [
  { id: "INV-0418", client: "Northwind", status: "Paid", tone: "success", amount: "$2,400.00" },
  { id: "INV-0419", client: "Globex", status: "Pending", tone: "primary", amount: "$860.00" },
  { id: "INV-0420", client: "Initech", status: "Paid", tone: "success", amount: "$1,320.50" },
  { id: "INV-0421", client: "Umbrella", status: "Overdue", tone: "destructive", amount: "$415.00" },
] as const

export default function SimpleTableCompact() {
  return (
    <SimpleTable size="sm" containerClassName="w-full max-w-xl">
      <SimpleTableCaption>Recent client invoices issued this billing cycle.</SimpleTableCaption>
      <SimpleTableHeader>
        <SimpleTableRow>
          <SimpleTableHead>Invoice</SimpleTableHead>
          <SimpleTableHead>Client</SimpleTableHead>
          <SimpleTableHead>Status</SimpleTableHead>
          <SimpleTableHead align="right">Amount</SimpleTableHead>
        </SimpleTableRow>
      </SimpleTableHeader>
      <SimpleTableBody>
        {invoices.map((item) => (
          <SimpleTableRow key={item.id}>
            <SimpleTableCell>
              <span className="font-medium">{item.id}</span>
            </SimpleTableCell>
            <SimpleTableCell>{item.client}</SimpleTableCell>
            <SimpleTableCell>
              <Badge size="sm" variant={item.tone}>
                {item.status}
              </Badge>
            </SimpleTableCell>
            <SimpleTableCell variant="numeric" align="right">
              {item.amount}
            </SimpleTableCell>
          </SimpleTableRow>
        ))}
      </SimpleTableBody>
      <SimpleTableFooter>
        <SimpleTableRow>
          <SimpleTableCell colSpan={3}>Total</SimpleTableCell>
          <SimpleTableCell variant="numeric" align="right">
            $4,995.50
          </SimpleTableCell>
        </SimpleTableRow>
      </SimpleTableFooter>
    </SimpleTable>
  )
}
