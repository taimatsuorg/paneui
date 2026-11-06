import { SchemaTree, type SchemaNode } from "@paneui/ui/components/schema-tree"

const order: SchemaNode = {
  type: "object",
  required: ["petId", "quantity"],
  properties: {
    petId: { type: "string", description: "The pet to order." },
    quantity: { type: "integer", default: 1 },
    status: { type: "string", enum: ["placed", "approved", "delivered"], readOnly: true },
    shipping: {
      type: "object",
      properties: {
        address: { type: "string" },
        notes: { type: "string", description: "Shown to the courier." },
      },
    },
  },
}

export default function SchemaTreeStacked() {
  return (
    <div className="w-full max-w-sm">
      <SchemaTree schema={order} />
    </div>
  )
}
