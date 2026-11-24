// Smoothing switched per element: this label renders heavier than the text around it.
export function Price({ value }: { value: string }) {
  return <span className="text-ui font-medium subpixel-antialiased">{value}</span>
}
