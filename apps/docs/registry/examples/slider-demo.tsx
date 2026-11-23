"use client"

import { Slider } from "@paneui/ui/components/slider"

export default function SliderDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Creativity</span>
        <Slider defaultValue={40} showValue aria-label="Creativity" />
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Price range</span>
        <Slider
          defaultValue={[120, 480]}
          min={0}
          max={600}
          step={10}
          showValue="always"
          getThumbLabel={(i) => (i === 0 ? "Minimum price" : "Maximum price")}
          format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
          className="mt-6"
        />
      </div>
    </div>
  )
}
