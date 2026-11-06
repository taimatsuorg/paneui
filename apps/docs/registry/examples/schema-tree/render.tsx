import { SchemaTree, type SchemaNode } from "@paneui/ui/components/schema-tree"

const webhook: SchemaNode = {
  type: "object",
  required: ["url", "events"],
  properties: {
    url: { type: "string", format: "uri", description: "Receives a `POST` for each event." },
    events: { type: "array", items: { type: "string", enum: ["pet.created", "pet.deleted"] } },
    secret: { type: "string", description: "Signs each delivery with `HMAC-SHA256`." },
  },
}

/* Turns `code` spans in plain-text descriptions into code elements. */
function inlineCode(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, i) => (part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : part))
}

export default function SchemaTreeRender() {
  return (
    <SchemaTree
      schema={webhook}
      className="max-w-3xl"
      renderDescription={({ schema }) => (typeof schema.description === "string" ? inlineCode(schema.description) : schema.description)}
    />
  )
}
