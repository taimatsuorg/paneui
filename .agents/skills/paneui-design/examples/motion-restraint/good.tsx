// A row hover is a quick fill change.
export function Row({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg px-2 transition-colors duration-150 hover:bg-secondary">{children}</div>
}
