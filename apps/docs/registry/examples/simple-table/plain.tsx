import {
  SimpleTable,
  SimpleTableBody,
  SimpleTableCell,
  SimpleTableHead,
  SimpleTableHeader,
  SimpleTableRow,
} from "@paneui/ui/components/simple-table"

const sizes = [
  { cls: "text-ui-xs", px: "11px", use: "Meta text and counts" },
  { cls: "text-ui-sm", px: "12px", use: "Captions and badges" },
  { cls: "text-ui", px: "13px", use: "Controls and menus" },
  { cls: "text-ui-lg", px: "14px", use: "Card titles" },
]

export default function SimpleTablePlain() {
  return (
    <SimpleTable variant="plain">
      <SimpleTableHeader>
        <SimpleTableRow>
          <SimpleTableHead>Class</SimpleTableHead>
          <SimpleTableHead>Size</SimpleTableHead>
          <SimpleTableHead>Use for</SimpleTableHead>
        </SimpleTableRow>
      </SimpleTableHeader>
      <SimpleTableBody>
        {sizes.map((s) => (
          <SimpleTableRow key={s.cls}>
            <SimpleTableCell variant="code">{s.cls}</SimpleTableCell>
            <SimpleTableCell variant="numeric">{s.px}</SimpleTableCell>
            <SimpleTableCell>{s.use}</SimpleTableCell>
          </SimpleTableRow>
        ))}
      </SimpleTableBody>
    </SimpleTable>
  )
}
