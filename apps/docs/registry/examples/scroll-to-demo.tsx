import { ArrowUpIcon } from "@paneui/ui/icons"
import { ScrollTo } from "@paneui/ui/components/scroll-to"
import { SmoothScroll } from "@paneui/ui/components/smooth-scroll"

const SECTIONS = [
  { id: "scroll-to-demo-plan", title: "Plan", body: "Tell Hark what the week looks like. It sorts the fixed points from the flexible ones." },
  { id: "scroll-to-demo-book", title: "Book", body: "Tables, flights, appointments — held or booked, with your rules applied every time." },
  { id: "scroll-to-demo-relax", title: "Relax", body: "Reminders arrive when they are useful and not before. The rest stays off your screen." },
]

export default function ScrollToDemo() {
  return (
    <SmoothScroll className="h-80 w-full max-w-md rounded-2xl bg-muted shadow-well">
      <nav className="sticky top-0 z-10 flex gap-2 bg-linear-to-b from-muted via-muted/90 to-transparent px-4 pt-3 pb-5">
        {SECTIONS.map((s) => (
          <ScrollTo key={s.id} to={`#${s.id}`} offset={-60} size="sm" focusTarget>
            {s.title}
          </ScrollTo>
        ))}
      </nav>
      <div className="flex flex-col gap-4 px-4 pb-4">
        {SECTIONS.map((s) => (
          <section
            key={s.id}
            id={s.id}
            className="flex min-h-56 flex-col justify-end rounded-2xl bg-card p-5 shadow-raised outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <h3 className="text-balance text-base font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </section>
        ))}
        <ScrollTo to={0} variant="ghost" size="sm" className="self-center">
          <ArrowUpIcon /> Back to top
        </ScrollTo>
      </div>
    </SmoothScroll>
  )
}
