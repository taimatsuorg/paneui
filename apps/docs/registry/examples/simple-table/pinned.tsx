import {
  SimpleTable,
  SimpleTableBody,
  SimpleTableCell,
  SimpleTableHead,
  SimpleTableHeader,
  SimpleTableRow,
} from "@paneui/ui/components/simple-table"

const regions = [
  { code: "us-east-1", location: "Virginia", latency: "14 ms", uptime: "99.99%", capacity: "82%", owner: "Platform", tier: "Primary" },
  { code: "eu-central-1", location: "Frankfurt", latency: "29 ms", uptime: "99.98%", capacity: "74%", owner: "Edge", tier: "Primary" },
  { code: "ap-northeast-1", location: "Tokyo", latency: "41 ms", uptime: "99.99%", capacity: "68%", owner: "Storage", tier: "Replica" },
  { code: "sa-east-1", location: "São Paulo", latency: "95 ms", uptime: "99.95%", capacity: "51%", owner: "Edge", tier: "Replica" },
  { code: "ap-southeast-2", location: "Sydney", latency: "88 ms", uptime: "99.97%", capacity: "63%", owner: "Platform", tier: "Replica" },
  { code: "eu-west-2", location: "London", latency: "24 ms", uptime: "99.99%", capacity: "79%", owner: "Compute", tier: "Primary" },
]

export default function SimpleTablePinned() {
  return (
    <SimpleTable wrap={false} stickyHeader containerClassName="max-h-56 w-full max-w-lg">
      <SimpleTableHeader>
        <SimpleTableRow>
          <SimpleTableHead pinned="start" pinnedEdge>
            Region
          </SimpleTableHead>
          <SimpleTableHead>Location</SimpleTableHead>
          <SimpleTableHead align="right">Latency</SimpleTableHead>
          <SimpleTableHead align="right">Uptime</SimpleTableHead>
          <SimpleTableHead align="right">Capacity</SimpleTableHead>
          <SimpleTableHead>Team</SimpleTableHead>
          <SimpleTableHead>Tier</SimpleTableHead>
        </SimpleTableRow>
      </SimpleTableHeader>
      <SimpleTableBody>
        {regions.map((r) => (
          <SimpleTableRow key={r.code}>
            <SimpleTableCell variant="code" pinned="start" pinnedEdge>
              {r.code}
            </SimpleTableCell>
            <SimpleTableCell>{r.location}</SimpleTableCell>
            <SimpleTableCell variant="numeric" align="right">
              {r.latency}
            </SimpleTableCell>
            <SimpleTableCell variant="numeric" align="right">
              {r.uptime}
            </SimpleTableCell>
            <SimpleTableCell variant="numeric" align="right">
              {r.capacity}
            </SimpleTableCell>
            <SimpleTableCell>{r.owner}</SimpleTableCell>
            <SimpleTableCell>{r.tier}</SimpleTableCell>
          </SimpleTableRow>
        ))}
      </SimpleTableBody>
    </SimpleTable>
  )
}
