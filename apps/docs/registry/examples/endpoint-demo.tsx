import { Endpoint } from "@paneui/ui/components/endpoint"

export default function EndpointDemo() {
  return (
    <div className="w-full max-w-xl">
      <Endpoint method="get" path="/projects/{projectId}/members/{memberId}" server="https://api.example.com/v1" />
    </div>
  )
}
