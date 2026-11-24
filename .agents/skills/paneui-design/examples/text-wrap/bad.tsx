// An unbalanced heading leaves one word on its last line; pretty-wrapping code reflows it.
export function Section({ title, snippet }: { title: string; snippet: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <pre className="font-mono text-ui-sm text-pretty">{snippet}</pre>
    </section>
  )
}
