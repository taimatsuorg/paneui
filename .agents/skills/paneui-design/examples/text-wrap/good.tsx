// Headings balance their lines; code keeps its own breaks.
export function Section({ title, snippet }: { title: string; snippet: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-balance">{title}</h2>
      <pre className="font-mono text-ui-sm">{snippet}</pre>
    </section>
  )
}
