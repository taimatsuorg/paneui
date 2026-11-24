// The shadow level carries its own hairline; a divider inside stays a border.
export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card shadow-raised">
      <div className="border-b px-4 py-3 text-ui font-semibold">Usage</div>
      <div className="p-4">{children}</div>
    </div>
  )
}
