import { SchemaTree, type SchemaNode } from "@paneui/ui/components/schema-tree"

const order: SchemaNode = {
  type: "object",
  required: ["status"],
  properties: {
    status: {
      type: "string",
      enum: ["pending", "paid", "shipped"],
      description: "Moves forward only. See [order states](#order-states).",
    },
    state: { type: "string", deprecated: true, description: "Old name for `status`. **Removed** in v3." },
    note: { type: "string", description: "Shown to the customer as *plain text*; `<b>` tags are not rendered." },
  },
}

export default function SchemaTreeMarkdown() {
  return <SchemaTree schema={order} descriptionFormat="markdown" className="max-w-3xl" />
}
