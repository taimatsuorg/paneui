import { Loader, type LoaderVariant } from "@paneui/ui/components/loader"

const variants: LoaderVariant[] = ["spinner", "ring", "dots", "bars", "pulse", "ripple", "orbit", "typing"]

export default function LoaderDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-x-6 gap-y-5">
        {variants.map((variant) => (
          <div key={variant} className="flex flex-col items-center gap-2">
            <div className="flex h-10 items-center">
              <Loader variant={variant} label={`Loading (${variant})`} />
            </div>
            <span className="text-xs text-muted-foreground">{variant}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-5 text-primary-text">
        <Loader variant="ring" size="sm" />
        <Loader variant="ring" size="md" />
        <Loader variant="ring" size="lg" />
      </div>
    </div>
  )
}
