import { Endpoint } from "@paneui/ui/components/endpoint"

export default function EndpointDeprecated() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Endpoint method="delete" path="/teams/:teamId" deprecated />
      <Endpoint method="post" path="/teams/{teamId}/archive" />
    </div>
  )
}
