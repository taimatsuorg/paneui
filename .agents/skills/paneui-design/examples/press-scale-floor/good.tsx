// Where the press motion is the point (hold-to-confirm), it is a light 0.96.
export function HoldToConfirm({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="rounded-lg bg-destructive px-3 text-destructive-foreground transition-[scale,background-color] duration-150 active:scale-[0.96] disabled:active:scale-100">
      {children}
    </button>
  )
}
