import type { Viewport } from "next"

import { IosZoomLock } from "@/components/ui/ios-zoom-lock"

// Zoom stays on; the lock only holds while a field has focus.
export const viewport: Viewport = { width: "device-width", initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <IosZoomLock />
        {children}
      </body>
    </html>
  )
}
