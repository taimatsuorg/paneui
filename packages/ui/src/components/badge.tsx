import type * as React from "react"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@paneui/ui/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-control-sm font-medium whitespace-nowrap icon-bold transition-[box-shadow,background-color] focus-visible:ring-2 focus-visible:ring-ring [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        chip: "bg-muted text-foreground [a]:hover:bg-accent",
        primary: "bg-primary text-primary-foreground [a]:hover:bg-primary-hover",
        success: "bg-success text-success-foreground [a]:hover:bg-success-hover",
        warning: "bg-warning text-warning-foreground [a]:hover:bg-warning-hover",
        destructive: "bg-destructive text-destructive-foreground [a]:hover:bg-destructive-hover",
        outline: "text-muted-foreground shadow-[inset_0_0_0_1px_var(--input)] [a]:hover:bg-muted",
      },
      size: {
        default: "h-6 px-2 text-ui-sm has-data-[slot=badge-avatar]:pl-1",
        sm: "h-5 px-1.5 text-ui-xs [&>svg]:size-3",
      },
    },
    defaultVariants: {
      variant: "chip",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "chip",
  size = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">({ className: cn(badgeVariants({ variant, size }), className) }, props),
    render,
    state: { slot: "badge", variant, size },
  })
}

/** Small round mark at the start of a chip, e.g. a vendor initial. */
function BadgeAvatar({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="badge-avatar"
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-full bg-foreground text-ui-2xs font-semibold text-background",
        className
      )}
      {...props}
    />
  )
}

export { Badge, BadgeAvatar, badgeVariants }
