"use client"

import * as React from "react"

import { cn } from "@paneui/ui/lib/utils"

/*
 * Semantic HTML table for reference content, summaries and wide scrollable grids.
 *
 * `variant="surface"` (default) frames the table in a rounded 1px surface with a subtle header band
 * and horizontal row hairlines (`variant="default"` drops the frame and header fill; `variant="grid"`
 * keeps horizontal and vertical cell hairlines). Supports compact `sm` sizing, wrapping toggle,
 * edge scroll fade, sticky headers, pinned start/end columns, footer totals and captions.
 *
 *   <SimpleTable>
 *     <SimpleTableHeader><SimpleTableRow><SimpleTableHead>Prop</SimpleTableHead>…</SimpleTableRow></SimpleTableHeader>
 *     <SimpleTableBody><SimpleTableRow><SimpleTableCell variant="code">size</SimpleTableCell>…</SimpleTableRow></SimpleTableBody>
 *   </SimpleTable>
 *
 * Cells honour the `align` attribute Markdown tables emit, and bare `<code>` in body text gets the
 * inline-code pill, so `components={{ table: SimpleTable, td: SimpleTableCell, … }}` renders MDX as is.
 */

function mergeRefs<T>(...refs: (React.Ref<T> | ((node: T | null) => void) | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    }
  }
}

function useScrollEdges(container: HTMLDivElement | null) {
  React.useLayoutEffect(() => {
    if (!container) return
    const update = () => {
      const offset = Math.abs(container.scrollLeft)
      const max = Math.max(0, container.scrollWidth - container.clientWidth)
      const overflowing = max > 0.5 || container.scrollHeight - container.clientHeight > 0.5
      container.toggleAttribute("data-scrolled-start", offset > 0.5)
      container.toggleAttribute("data-scrolled-end", offset < max - 0.5)
      container.toggleAttribute("data-scrolled-top", container.scrollTop > 0.5)
      container.toggleAttribute("data-overflowing", overflowing)
      if (overflowing) container.tabIndex = 0
      else container.removeAttribute("tabindex")
    }
    update()
    container.addEventListener("scroll", update, { passive: true })
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null
    observer?.observe(container)
    const table = container.firstElementChild
    if (table) observer?.observe(table)
    return () => {
      container.removeEventListener("scroll", update)
      observer?.disconnect()
    }
  }, [container])
}

/*
 * The floor for body-text cells, set on the surface as --simple-table-cell-min so cells need no
 * client code to read it. `auto` floors them only below 40rem of viewport: short tables fit a
 * reading column on desktop, and a phone scrolls a table sideways instead of squeezing its prose.
 */
const cellMinWidths = {
  auto: "[--simple-table-cell-min:0px] max-sm:[--simple-table-cell-min:8rem]",
  always: "[--simple-table-cell-min:8rem]",
  none: "[--simple-table-cell-min:0px]",
} as const

type SimpleTableVariant = "surface" | "default" | "grid" | "plain" | "sheet"
type CanonicalVariant = "surface" | "default" | "grid"
type SimpleTableSize = "default" | "sm"

function normalizeVariant(variant: SimpleTableVariant): CanonicalVariant {
  if (variant === "plain") return "default"
  if (variant === "sheet") return "surface"
  return variant
}

const frameVariants: Record<CanonicalVariant, string> = {
  surface:
    "frame-xl frame-border overflow-hidden p-px shadow-border [--table-bg:var(--card)] [--table-head-bg:color-mix(in_oklab,var(--foreground)_3.5%,var(--table-bg))] bg-(--table-bg)",
  default: "bg-transparent",
  grid:
    "frame-xl frame-border overflow-hidden p-px shadow-border [--table-bg:var(--card)] [--table-head-bg:color-mix(in_oklab,var(--foreground)_3.5%,var(--table-bg))] bg-(--table-bg)",
}

const sizeClasses: Record<SimpleTableSize, string> = {
  sm: "[--table-cell-px:calc(var(--spacing)*2.5)] [--table-cell-py:calc(var(--spacing)*1.5)] [--table-head-h:calc(var(--spacing)*8)]",
  default: "[--table-cell-px:calc(var(--spacing)*3.5)] [--table-cell-py:calc(var(--spacing)*2.5)] [--table-head-h:calc(var(--spacing)*10)]",
}

const tableLayoutVariants: Record<CanonicalVariant, string> = {
  surface: "border-separate border-spacing-0",
  default: "border-separate border-spacing-0",
  grid: cn(
    "border-separate border-spacing-0",
    "[&>thead>tr>th]:border-e [&>thead>tr>th]:border-border [&>thead>tr>th:last-child]:border-e-0",
    "[&>tbody>tr>td]:border-e [&>tbody>tr>td]:border-border [&>tbody>tr>td:last-child]:border-e-0",
    "[&>tfoot>tr>*]:border-e [&>tfoot>tr>*]:border-border [&>tfoot>tr>*:last-child]:border-e-0"
  ),
}

type SimpleTableProps = React.ComponentProps<"table"> & {
  /** Class for the scrolling surface around the table. */
  containerClassName?: string
  /** Ref forwarded to the scrollable inner viewport element. */
  containerRef?: React.Ref<HTMLDivElement>
  /** Minimum width of body-text cells: `auto` 8rem on small screens only, `always` 8rem, `none` no floor. */
  cellMinWidth?: keyof typeof cellMinWidths
  /** `surface` (default): rounded hairline frame with horizontal row lines and subtle header band. `default`: unframed horizontal row lines. `grid`: framed with horizontal and vertical dividers. */
  variant?: SimpleTableVariant
  /** Cell padding and header height density. */
  size?: SimpleTableSize
  /** Wrap cell contents onto multiple lines (default `true`). Pass `false` for single-line horizontal scroll tables. */
  wrap?: boolean
  /** Softly fade horizontal overflow edges when not using pinned columns. */
  scrollFade?: boolean
  /** Keep header cells pinned to the top edge when vertically scrolling. */
  stickyHeader?: boolean
}

function SimpleTable({
  className,
  containerClassName,
  containerRef,
  cellMinWidth = "auto",
  variant: variantProp = "surface",
  size = "default",
  wrap = true,
  scrollFade = true,
  stickyHeader = false,
  ...props
}: SimpleTableProps) {
  const variant = normalizeVariant(variantProp)
  const framed = variant === "surface" || variant === "grid"
  const [scrollNode, setScrollNode] = React.useState<HTMLDivElement | null>(null)
  useScrollEdges(scrollNode)

  const setRef = React.useMemo(() => mergeRefs(setScrollNode, containerRef), [containerRef])

  return (
    <div
      data-slot="simple-table-container"
      data-variant={variant}
      data-size={size}
      data-cell-min-width={cellMinWidth}
      data-nowrap={wrap ? undefined : ""}
      className={cn(
        "group/table relative flex w-full min-w-0 flex-col",
        "[--table-bg:var(--background)] [--table-hover:color-mix(in_oklab,var(--foreground)_3%,var(--table-bg))] [--table-selected:color-mix(in_oklab,var(--primary)_7%,var(--table-bg))] in-data-[slot=card]:[--table-bg:var(--card)] in-data-[slot=popover-content]:[--table-bg:var(--popover)]",
        frameVariants[variant],
        sizeClasses[size],
        cellMinWidths[cellMinWidth],
        containerClassName
      )}
    >
      <div
        ref={setRef}
        data-slot="simple-table-scroll"
        data-sticky-header={stickyHeader ? "" : undefined}
        className={cn(
          "relative min-h-0 w-full shrink scroll-p-1 overflow-x-auto overscroll-x-none outline-none [--fade-end:0px] [--fade-start:0px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-sticky-header:overflow-y-auto",
          framed ? "rounded-inner" : "rounded-lg",
          scrollFade &&
            "not-has-[[data-pinned]]:mask-[linear-gradient(to_right,transparent,#000_var(--fade-start),#000_calc(100%-var(--fade-end)),transparent)] data-scrolled-end:[--fade-end:calc(var(--spacing)*8)] data-scrolled-start:[--fade-start:calc(var(--spacing)*8)] rtl:not-has-[[data-pinned]]:mask-[linear-gradient(to_left,transparent,#000_var(--fade-start),#000_calc(100%-var(--fade-end)),transparent)]"
        )}
      >
        <table
          data-slot="simple-table"
          data-variant={variant}
          data-size={size}
          className={cn("w-full caption-bottom text-start text-sm", tableLayoutVariants[variant], className)}
          {...props}
        />
      </div>
    </div>
  )
}

function SimpleTableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="simple-table-header"
      className={cn("text-muted-foreground [&_tr]:bg-transparent [&_tr]:hover:bg-transparent", className)}
      {...props}
    />
  )
}

function SimpleTableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="simple-table-body" className={cn("[&>tr:last-child>*]:border-b-0", className)} {...props} />
}

function SimpleTableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="simple-table-footer"
      className={cn(
        "font-medium [&>tr>*]:border-t [&>tr>*]:border-b-0 [&>tr>*]:border-border [&>tr>*]:bg-(--table-head-bg,var(--table-bg))",
        className
      )}
      {...props}
    />
  )
}

function SimpleTableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="simple-table-row"
      className={cn(
        "group/table-row align-middle bg-(--table-bg) transition-colors duration-150 hover:bg-(--table-hover) data-[state=selected]:bg-(--table-selected)",
        className
      )}
      {...props}
    />
  )
}

type SimpleTableAlign = "start" | "end" | "left" | "center" | "right" | "justify" | "char"

/**
 * `align` is logical: `start` and `end` follow the writing direction. The Markdown / HTML values
 * work too: `left` (`:--`), `center` (`:-:`) and `right` (`--:`) map to start, center and end, so
 * they flip under RTL as well. `justify` justifies; `char` is accepted and falls back to start.
 * A flex child (a row of buttons) is justified to the same edge.
 */
const alignClass = (align: string | undefined) =>
  align === "center"
    ? "text-center [&>.flex]:justify-center"
    : align === "right" || align === "end"
      ? "text-end tabular-nums [&>.flex]:justify-end"
      : align === "justify"
        ? "text-justify"
        : "text-start [&>.flex]:justify-start"

/*
 * Bare `<code>` (what Markdown writes) gets the library's inline-code chip. `:where()` keeps it at
 * element weight, and `:not([class])` leaves code you style yourself alone. The chip never breaks
 * inside a word, so a column of identifiers keeps its min-content width.
 */
const inlineCode =
  "[:where(&)_code:not([class])]:rounded-full [:where(&)_code:not([class])]:bg-accent [:where(&)_code:not([class])]:px-2 [:where(&)_code:not([class])]:py-0.5 [:where(&)_code:not([class])]:font-mono [:where(&)_code:not([class])]:text-ui-sm [:where(&)_code:not([class])]:text-foreground [:where(&)_code:not([class])]:whitespace-nowrap [:where(&)_code:not([class])]:break-normal"

const cellBase =
  "border-b border-border group-data-nowrap/table:whitespace-nowrap group-data-[variant=surface]/table:first:ps-4 group-data-[variant=surface]/table:last:pe-4 group-data-[variant=grid]/table:first:ps-4 group-data-[variant=grid]/table:last:pe-4"

const cellPinned =
  "data-pinned:sticky data-pinned:z-10 data-pinned:has-[:focus-visible]:z-30 data-pinned:bg-(--table-bg) group-hover/table-row:data-pinned:bg-(--table-hover) group-data-[state=selected]/table-row:data-pinned:bg-(--table-selected) data-[pinned=start]:start-(--pin-offset,0px) data-[pinned=end]:end-(--pin-offset,0px)"

const cellPinnedEdge =
  "data-pinned-edge:after:pointer-events-none data-pinned-edge:after:absolute data-pinned-edge:after:inset-y-0 data-pinned-edge:after:hidden data-pinned-edge:after:w-4 data-[pinned=start]:data-pinned-edge:after:-end-4 data-[pinned=start]:data-pinned-edge:after:bg-linear-to-r data-[pinned=start]:data-pinned-edge:after:from-foreground/6 data-[pinned=start]:data-pinned-edge:after:to-transparent rtl:data-[pinned=start]:data-pinned-edge:after:bg-linear-to-l data-[pinned=end]:data-pinned-edge:after:-start-4 data-[pinned=end]:data-pinned-edge:after:bg-linear-to-l data-[pinned=end]:data-pinned-edge:after:from-foreground/6 data-[pinned=end]:data-pinned-edge:after:to-transparent rtl:data-[pinned=end]:data-pinned-edge:after:bg-linear-to-r in-data-scrolled-start:data-[pinned=start]:data-pinned-edge:after:block in-data-scrolled-end:data-[pinned=end]:data-pinned-edge:after:block"

function pinnedClasses(pinned: "start" | "end" | undefined, pinnedEdge: boolean | undefined) {
  return cn(pinned && cellPinned, pinned && pinnedEdge && cellPinnedEdge)
}

type SimpleTableHeadProps = Omit<React.ComponentProps<"th">, "align"> & {
  align?: SimpleTableAlign
  pinned?: "start" | "end"
  pinnedEdge?: boolean
}

function SimpleTableHead({ className, align, pinned, pinnedEdge, ...props }: SimpleTableHeadProps) {
  return (
    <th
      data-slot="simple-table-head"
      data-align={align}
      data-pinned={pinned}
      data-pinned-edge={pinnedEdge ? "" : undefined}
      className={cn(
        cellBase,
        "h-(--table-head-h) bg-(--table-head-bg,var(--table-bg)) px-(--table-cell-px) py-(--table-cell-py) font-medium text-muted-foreground",
        "in-data-scrolled-top:shadow-[inset_0_-1px_0_var(--border)] in-data-sticky-header:sticky in-data-sticky-header:top-0 in-data-sticky-header:z-20",
        pinned && "data-pinned:bg-(--table-head-bg,var(--table-bg)) in-data-sticky-header:data-pinned:z-40!",
        pinnedClasses(pinned, pinnedEdge),
        alignClass(align),
        inlineCode,
        className
      )}
      {...props}
    />
  )
}

const cellVariants = {
  /** Body text. Wraps between words; the table's `cellMinWidth` sets its floor, and empty cells have none. */
  default: cn("min-w-(--simple-table-cell-min,0px) text-foreground empty:min-w-0", inlineCode),
  /** Names: props, classes, tokens. */
  code: "font-mono text-xs whitespace-nowrap text-foreground",
  /** Secondary names: defaults, token names beside a class. */
  "code-muted": "font-mono text-xs whitespace-nowrap text-muted-foreground",
  /** Types and values that can be long. */
  type: "max-w-64 font-mono text-xs break-words text-foreground",
  /** Values that line up: sizes, counts. */
  numeric: cn("whitespace-nowrap text-foreground tabular-nums", inlineCode),
} as const

type SimpleTableCellProps = Omit<React.ComponentProps<"td">, "align"> & {
  variant?: keyof typeof cellVariants
  align?: SimpleTableAlign
  pinned?: "start" | "end"
  pinnedEdge?: boolean
}

function SimpleTableCell({ className, variant = "default", align, pinned, pinnedEdge, ...props }: SimpleTableCellProps) {
  return (
    <td
      data-slot="simple-table-cell"
      data-variant={variant}
      data-align={align}
      data-pinned={pinned}
      data-pinned-edge={pinnedEdge ? "" : undefined}
      className={cn(
        cellBase,
        "px-(--table-cell-px) py-(--table-cell-py)",
        pinnedClasses(pinned, pinnedEdge),
        align && alignClass(align),
        cellVariants[variant],
        className
      )}
      {...props}
    />
  )
}

function SimpleTableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="simple-table-caption"
      className={cn(
        "mt-3 text-ui text-muted-foreground",
        "group-data-[variant=surface]/table:mt-0 group-data-[variant=surface]/table:border-t group-data-[variant=surface]/table:border-border group-data-[variant=surface]/table:bg-(--table-bg) group-data-[variant=surface]/table:px-4 group-data-[variant=surface]/table:py-2.5 group-data-[variant=surface]/table:text-start",
        "group-data-[variant=grid]/table:mt-0 group-data-[variant=grid]/table:border-t group-data-[variant=grid]/table:border-border group-data-[variant=grid]/table:bg-(--table-bg) group-data-[variant=grid]/table:px-4 group-data-[variant=grid]/table:py-2.5 group-data-[variant=grid]/table:text-start",
        className
      )}
      {...props}
    />
  )
}

export {
  SimpleTable,
  SimpleTableHeader,
  SimpleTableBody,
  SimpleTableFooter,
  SimpleTableRow,
  SimpleTableHead,
  SimpleTableCell,
  SimpleTableCaption,
}
export type { SimpleTableProps, SimpleTableHeadProps, SimpleTableCellProps, SimpleTableAlign, SimpleTableVariant, SimpleTableSize }
