// Open and closed are two states of one transition, so a quick toggle reverses smoothly.
export function Reveal({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div data-open={open || undefined} className="opacity-0 transition-[opacity,translate] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-open:translate-y-0 data-open:opacity-100 motion-safe:translate-y-1">
      {children}
    </div>
  )
}
