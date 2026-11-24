import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@paneui/ui/lib/utils"

type BrandSvgComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>

type BrandIconPair = {
  light: BrandSvgComponent
  dark: BrandSvgComponent
}

type BrandIconSource = BrandSvgComponent | BrandIconPair

const brandIconVariants = cva("shrink-0", {
  variants: {
    color: {
      brand: "",
      current:
        "fill-current [&_[fill]:not([fill='none'])]:fill-current [&_[stroke]:not([stroke='none'])]:stroke-current",
    },
  },
  defaultVariants: {
    color: "brand",
  },
})

type BrandIconProps = Omit<React.SVGProps<SVGSVGElement>, "children" | "color"> &
  VariantProps<typeof brandIconVariants> & {
    icon: BrandIconSource
    size?: number
    title?: string
    name?: string
    "data-brand"?: string
  }

function isBrandIconPair(source: BrandIconSource): source is BrandIconPair {
  return typeof source === "object" && source !== null && "light" in source && "dark" in source
}

function BrandIcon({
  icon,
  size = 18,
  color = "brand",
  title,
  name,
  className,
  role,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
  "data-brand": dataBrand,
  ...props
}: BrandIconProps) {
  const accessibleLabel = ariaLabel ?? title
  const sharedProps: React.SVGProps<SVGSVGElement> & Record<string, unknown> = {
    ...props,
    width: size,
    height: size,
    "data-slot": "brand-icon",
    "data-brand": dataBrand ?? name,
    ...(accessibleLabel
      ? {
          role: role ?? "img",
          "aria-label": accessibleLabel,
        }
      : {
          "aria-hidden": ariaHidden ?? true,
        }),
  }

  const variantClass = brandIconVariants({ color })

  if (isBrandIconPair(icon)) {
    const Light = icon.light
    const Dark = icon.dark
    return (
      <>
        <Light {...sharedProps} className={cn(variantClass, "dark:hidden", className)} />
        <Dark {...sharedProps} className={cn(variantClass, "hidden dark:block", className)} />
      </>
    )
  }

  const Icon = icon
  return <Icon {...sharedProps} className={cn(variantClass, className)} />
}

export {
  BrandIcon,
  brandIconVariants,
  type BrandIconPair,
  type BrandIconProps,
  type BrandIconSource,
  type BrandSvgComponent,
}
