// A slow, keyframed hover replays on every pass of the pointer.
export function Row({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg px-2 transition-colors duration-500 hover:animate-pulse hover:bg-secondary">{children}</div>
}
