import { SchemaTree, type SchemaNode } from "@paneui/ui/components/schema-tree"

const payment: SchemaNode = {
  type: "object",
  required: ["amount", "method"],
  properties: {
    amount: { type: "integer", description: "In the smallest currency unit." },
    currency: { type: "string", default: "usd" },
    method: {
      description: "How the customer pays.",
      oneOf: [
        {
          type: "object",
          title: "Card",
          required: ["number"],
          properties: {
            number: { type: "string", description: "Card number without spaces." },
            expiry: { type: "string", format: "MM/YY" },
          },
        },
        {
          type: "object",
          title: "BankAccount",
          required: ["iban"],
          properties: {
            iban: { type: "string" },
            holder: { type: "string" },
          },
        },
        { type: "string", title: "Token", description: "A saved payment method." },
      ],
    },
  },
}

export default function SchemaTreeOptions() {
  return <SchemaTree schema={payment} defaultExpandDepth={1} className="max-w-3xl" />
}
