// 0.9 reads as a glitch, not a press.
export function HoldToConfirm({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="rounded-lg bg-destructive px-3 text-destructive-foreground transition-[scale,background-color] duration-150 active:scale-90">
      {children}
    </button>
  )
}
