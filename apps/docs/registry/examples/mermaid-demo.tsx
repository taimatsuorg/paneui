import { Mermaid } from "@paneui/ui/components/mermaid"

const chart = `graph LR
  A[Request] --> B{Cached?}
  B -->|Hit| C[Edge]
  B -->|Miss| D[Origin API]
  D --> E[(Database)]
  E --> D`

export default function MermaidDemo() {
  return <Mermaid chart={chart} caption="Click to open full-screen pan and zoom." className="w-full max-w-xl" />
}
