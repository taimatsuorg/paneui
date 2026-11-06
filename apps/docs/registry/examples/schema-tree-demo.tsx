import { SchemaTree, type SchemaNode } from "@paneui/ui/components/schema-tree"

const petPage: SchemaNode = {
  type: "object",
  required: ["data"],
  properties: {
    data: {
      type: "array",
      items: {
        type: "object",
        title: "Pet",
        required: ["id", "name", "kind", "createdAt"],
        properties: {
          id: { type: "string", readOnly: true, description: "Assigned when the pet is created." },
          name: { type: "string", description: "The pet's name." },
          kind: { type: "string", enum: ["cat", "dog", "bird"] },
          tags: { type: "array", items: { type: "string" }, default: [] },
          owner: {
            type: "object",
            title: "Owner",
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
          createdAt: { type: "string", format: "date-time", readOnly: true },
          legacyId: {
            type: "integer",
            deprecated: true,
            description: (
              <>
                Use <code>id</code> instead.
              </>
            ),
          },
        },
      },
    },
    next: { type: ["string", "null"], description: "Cursor for the next page, when there is one." },
  },
}

export default function SchemaTreeDemo() {
  return <SchemaTree schema={petPage} defaultExpandDepth={1} className="max-w-3xl" />
}
