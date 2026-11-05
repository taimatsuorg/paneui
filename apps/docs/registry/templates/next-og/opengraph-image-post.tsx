import { ImageResponse } from "next/og"

import { OgImage, ogImageContentType, ogImageSize } from "@paneui/ui/components/og-image"

/*
 * One share image per post: app/blog/[slug]/opengraph-image.tsx. Swap `getPost` for your content
 * source. With `generateStaticParams` on the page, every image is rendered at build time.
 */

type Post = { title: string; description: string; author: string; date: string; tags: string[] }

const SITE = { name: "Pane Studio Blog", host: "pane.studio" }

/** Sample content so every slot of the card is filled; read the real post here. */
async function getPost(slug: string): Promise<Post> {
  const title = slug.replace(/-/g, " ")
  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    description: "Notes from building the product, one change at a time.",
    author: "Mira Okafor",
    date: "19 August 2026",
    tags: ["Design", "Engineering"],
  }
}

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

export const alt = "Blog post"
export const size = ogImageSize
export const contentType = ogImageContentType

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  // The header has one line beside the name; a long slug would wrap, so the card shows the blog's address.
  const url = `${SITE.host}/blog`
  // the characters the card draws, plus the separators it adds
  const text = [post.title, post.description, SITE.name, url, post.author, post.date, ...post.tags].join("") + "·…"
  // Without the font service (an offline build) the renderer's built-in font is used.
  const fonts = await Promise.all([
    loadFont("Inter", 400, text).then((data) => ({ name: "Inter", data, weight: 400 as const, style: "normal" as const })),
    loadFont("Inter", 700, text).then((data) => ({ name: "Inter", data, weight: 700 as const, style: "normal" as const })),
  ]).catch(() => undefined)

  return new ImageResponse(
    // the slug picks the palette, matching <CoverArt seed={slug} /> on the page
    <OgImage
      title={post.title}
      description={post.description || undefined}
      siteName={SITE.name}
      url={url}
      author={post.author}
      date={post.date || undefined}
      tags={post.tags}
      palette="random"
      seed={slug}
      // always name a family: the renderer can't read an empty one
      fontFamily={fonts ? "Inter" : "sans-serif"}
    />,
    { ...size, ...(fonts && { fonts }) }
  )
}
