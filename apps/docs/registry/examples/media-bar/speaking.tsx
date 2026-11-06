"use client"

export default function MediaBarSpeaking() {
  return (
    <div className="flex max-w-md flex-col gap-3 text-sm">
      <p>Blocks before and after stay as they are.</p>
      <p data-speaking="">The block being read takes the accent fill and a soft ring.</p>
      <p>Set the attribute yourself or call markSpeaking with the element.</p>
    </div>
  )
}
