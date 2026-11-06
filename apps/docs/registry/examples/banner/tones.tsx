import { Banner } from "@paneui/ui/components/banner"

export default function BannerTones() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Banner tone="primary">New templates for docs and blogs are ready.</Banner>
      <Banner tone="neutral">
        These docs are for version 1. <a href="#banner">See the latest</a>.
      </Banner>
      <Banner tone="warning">Scheduled maintenance on Sunday from 02:00 to 03:00 UTC.</Banner>
    </div>
  )
}
