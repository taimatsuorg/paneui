import { Endpoint, MethodBadge } from "@paneui/ui/components/endpoint"

const kinds = ["send", "receive", "publish", "subscribe", "query", "mutation", "subscription"]

export default function EndpointOperations() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        {kinds.map((k) => (
          <MethodBadge key={k} method={k} />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {kinds.map((k) => (
          <MethodBadge key={k} method={k} size="sm" />
        ))}
      </div>
      <Endpoint method="subscribe" server="wss://events.example.com" path="pets.{petId}.updated" className="w-full" />
      <Endpoint
        method="query"
        path="pets(first: Int): PetConnection!"
        copyValue="query { pets(first: 10) { edges { node { id name } } } }"
        className="w-full"
      />
    </div>
  )
}
