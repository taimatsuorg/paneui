// text-end follows the reading direction: right in English, left in right-to-left.
export function Total({ value }: { value: string }) {
  return <span className="w-24 text-end tabular-nums">{value}</span>
}
