import type { Viewport } from "next"

// Stops the focus zoom by stopping all zoom: nobody can pinch to read small text again.
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1 }
