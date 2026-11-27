"use client"

import { Label } from "@paneui/ui/components/label"
import { Switch } from "@paneui/ui/components/switch"

function save(succeed: boolean) {
  return new Promise<void>((resolve, reject) =>
    setTimeout(() => (succeed ? resolve() : reject(new Error("Offline"))), 1000)
  )
}

export default function SwitchAsync() {
  return (
    <div className="flex flex-col gap-4">
      <Label className="gap-3">
        <Switch onCheckedChange={() => save(true)} />
        Sync to cloud (saves)
      </Label>
      <Label className="gap-3">
        <Switch defaultChecked onCheckedChange={() => save(false)} />
        Public profile (fails and flips back)
      </Label>
    </div>
  )
}
