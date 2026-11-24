// A keyframe restarts from frame one when the state flips mid-way, so a quick toggle snaps.
export function Reveal({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div data-open={open || undefined} className="opacity-0 data-open:animate-[fade-up_200ms_ease-out_forwards]">
      {children}
    </div>
  )
}
