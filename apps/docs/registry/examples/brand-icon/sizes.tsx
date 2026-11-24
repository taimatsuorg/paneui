import { VercelDark, VercelLight } from "@ridemountainpig/svgl-react"

import { BrandIcon } from "@paneui/ui/components/brand-icon"

const SIZES = [14, 18, 24, 32] as const

export default function BrandIconSizesExample() {
  return (
    <div className="flex items-end gap-5">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col items-center gap-1.5">
          <BrandIcon icon={{ light: VercelLight, dark: VercelDark }} size={size} title="Vercel" />
          <span className="font-mono text-ui-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  )
}
