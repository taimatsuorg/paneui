// One SVG painted with currentColor; hover and selected states are text colours.
export function Dot() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 text-muted-foreground hover:text-foreground aria-selected:text-primary">
      <circle cx="8" cy="8" r="4" fill="currentColor" />
    </svg>
  )
}
