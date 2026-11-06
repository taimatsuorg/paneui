import { Diagram } from "@paneui/ui/components/diagram"

export default function DiagramDrawn() {
  return (
    <Diagram label="Request flow" caption="Requests pass the cache before the server." className="w-full max-w-lg">
      <svg viewBox="0 0 320 44" width="320" height="44" className="text-ui">
        <rect x="0.5" y="0.5" width="79" height="43" rx="10" className="fill-card stroke-border" />
        <text x="40" y="22" dy="0.35em" textAnchor="middle" className="fill-foreground">Client</text>
        <rect x="120.5" y="0.5" width="79" height="43" rx="10" className="fill-card stroke-border" />
        <text x="160" y="22" dy="0.35em" textAnchor="middle" className="fill-foreground">Cache</text>
        <rect x="240.5" y="0.5" width="79" height="43" rx="10" className="fill-primary stroke-primary" />
        <text x="280" y="22" dy="0.35em" textAnchor="middle" className="fill-primary-foreground">Server</text>
        <path d="M86 22H112M107 18L112 22L107 26M206 22H232M227 18L232 22L227 26" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-muted-foreground" />
      </svg>
    </Diagram>
  )
}
