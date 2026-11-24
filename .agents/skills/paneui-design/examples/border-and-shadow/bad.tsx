// A border on top of a shadow draws the edge twice and turns grey on tinted backgrounds.
export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card shadow-raised">
      <div className="p-4">{children}</div>
    </div>
  )
}
