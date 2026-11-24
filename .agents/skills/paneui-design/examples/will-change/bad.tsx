// Width can't be composited; the hint only reserves memory.
export function DragHandle() {
  return <div className="size-6 rounded-md bg-card shadow-raised will-change-[width,background-color]" />
}
