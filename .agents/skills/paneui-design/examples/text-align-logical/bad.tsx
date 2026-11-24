// text-right stays on the right in Arabic or Hebrew, where the number should sit at the start.
export function Total({ value }: { value: string }) {
  return <span className="w-24 text-right tabular-nums">{value}</span>
}
