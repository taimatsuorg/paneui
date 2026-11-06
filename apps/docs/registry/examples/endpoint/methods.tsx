import { MethodBadge } from "@paneui/ui/components/endpoint"

const methods = ["get", "post", "put", "patch", "delete", "head", "options"]

export default function EndpointMethods() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        {methods.map((m) => (
          <MethodBadge key={m} method={m} />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {methods.map((m) => (
          <MethodBadge key={m} method={m} size="sm" />
        ))}
      </div>
    </div>
  )
}
