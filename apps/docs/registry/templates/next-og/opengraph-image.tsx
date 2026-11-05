import { ImageResponse } from "next/og"

import { OgImage, ogImageContentType, ogImageSize } from "@paneui/ui/components/og-image"

/*
 * The site's share image, rendered at build time and linked from every page's <head>.
 * Put a copy in a route folder (app/blog/[slug]/opengraph-image.tsx) to give that route its own,
 * reading `params` for the title.
 */

const SITE = {
  name: "Pane Studio",
  url: "pane.studio",
  title: "Build the product, not the plumbing",
  // one line at the card's 30px description size, so no word is left alone on a second line
  description: "Components, templates and a theme that ship this week.",
}

export const alt = `${SITE.name}: ${SITE.title}`
export const size = ogImageSize
export const contentType = ogImageContentType

/**
 * A subset of a web font holding only `text`. The font service returns TrueType to a client that
 * isn't a browser, which is what the renderer reads (it can't read WOFF2).
 */
async function loadFont(family: string, weight: number, text: string) {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`)
  ).text()
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1]
  if (!src) throw new Error(`No ${family} ${weight} font for the share image`)
  return (await fetch(src)).arrayBuffer()
}

export default async function Image() {
  // the characters the card draws, plus the separators it adds
  const text = `${Object.values(SITE).join("")}·…`
  // Without the font service (an offline build) the renderer's built-in font is used.
  const fonts = await Promise.all([
    loadFont("Inter", 400, text).then((data) => ({ name: "Inter", data, weight: 400 as const, style: "normal" as const })),
    loadFont("Inter", 700, text).then((data) => ({ name: "Inter", data, weight: 700 as const, style: "normal" as const })),
  ]).catch(() => undefined)

  return new ImageResponse(
    <OgImage
      title={SITE.title}
      description={SITE.description}
      siteName={SITE.name}
      url={SITE.url}
      // always name a family: the renderer can't read an empty one
      fontFamily={fonts ? "Inter" : "sans-serif"}
    />,
    { ...size, ...(fonts && { fonts }) }
  )
}
