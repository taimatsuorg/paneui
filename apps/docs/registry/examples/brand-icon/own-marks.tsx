import type * as React from "react"
import { AnthropicDark, AnthropicLight } from "@ridemountainpig/svgl-react"

import { BrandIcon } from "@paneui/ui/components/brand-icon"

function AcmeMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <path d="M8.5 15.5 12 8.5l3.5 7M9.7 13h4.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function BrandIconOwnMarksExample() {
  return (
    <div className="flex items-center gap-5">
      <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5">
        <BrandIcon icon={AcmeMark} color="current" size={18} />
        <span className="text-ui font-medium">Acme</span>
      </div>
      <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5">
        <BrandIcon icon={{ light: AnthropicLight, dark: AnthropicDark }} size={18} />
        <span className="text-ui font-medium">Anthropic</span>
      </div>
    </div>
  )
}
