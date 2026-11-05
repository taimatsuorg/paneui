"use client"

import Link from "next/link"

import { ArrowLeftIcon, ArrowRightIcon } from "@paneui/ui/icons"
import { CodeBlock } from "@paneui/ui/components/code-block"

import { BlogTopBar, Container, TextLink } from "./parts/chrome"
import { nestedSurface } from "./parts/code"
import { formatLongDate, posts } from "./parts/data"
import type { BlogHrefs } from "./blog"

const post = posts[0]
const next = posts[1]

const pagerLink =
  "flex min-w-0 flex-col gap-1 rounded-md px-2 py-2 transition-colors duration-150 outline-none hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-ring"

/**
 * Blog post: breadcrumbs, title, date, the article in `typeset typeset-reading`, then a pager back
 * to every post and on to the next one, so the end of a post is never a dead end.
 */
export function BlogPost({ hrefs = { home: "/blog", post: "/blog/post" } }: { hrefs?: BlogHrefs }) {
  return (
    <div className="bg-background">
      <Container>
        <BlogTopBar homeHref={hrefs.home} trail={[{ label: "Blog", href: hrefs.home }, { label: post.title }]} />

        <main>
          <article>
            <header className="mb-8 flex flex-col gap-3">
              <h1 className="text-base font-medium text-balance wrap-anywhere">{post.title}</h1>
              <time dateTime={post.date} className="font-mono text-sm text-muted-foreground tabular-nums">
                {formatLongDate(post.date)}
              </time>
            </header>

            <div className="typeset typeset-reading">
              <p>
                A good default lets someone finish the task without studying the settings. The page opens, the text reads, the link can be
                shared. That is most of the work.
              </p>
              <p>
                Everything else is a choice you are handing over. Offer it only when a need shows up, and leave the rest to the people who
                already know they need it.
              </p>

              <h2 id="one-rule-instead-of-a-setting">One rule instead of a setting</h2>
              <p>
                Nested corners are the small version of this. Put a rounded panel inside another one with a little padding between them and
                give both the same radius, and something feels off: the inner corners look too sharp, and the gap bulges at each corner.
              </p>
              <p>
                A corner radius describes a circle. Two arcs with the same radius but different centres drift apart by roughly{" "}
                <code>0.41 × radius</code> at the corner. One line fixes it: the outer radius is the inner one plus the padding. A{" "}
                <code>12px</code> panel in a <code>4px</code> frame takes <code>16px</code>.
              </p>

              <div className="not-typeset">
                <CodeBlock title="nested-surface.tsx" language="tsx" html={nestedSurface} />
              </div>

              <h2 id="when-to-offer-a-choice">When to offer a choice</h2>
              <p>
                The rule holds for shapes your eye compares directly. Past about 24px of padding the layers stop reading as one object, and
                each keeps the radius it would have on its own.
              </p>
              <blockquote>
                <p>A default is a decision you make once, so someone else doesn&apos;t have to.</p>
              </blockquote>
              <hr />
              <p>
                If you have a counterexample, <TextLink href="#">write to me</TextLink>.
              </p>
            </div>
          </article>

          <nav aria-label="More posts" className="-mx-2 mt-16 grid grid-cols-2 gap-4">
            <Link href={hrefs.home} className={pagerLink}>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <ArrowLeftIcon size={14} className="rtl:-scale-x-100" />
                All posts
              </span>
              <span className="truncate tabular-nums">{posts.length} posts</span>
            </Link>
            {next && (
              <Link href={hrefs.post} className={`${pagerLink} items-end text-end`}>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  Next
                  <ArrowRightIcon size={14} className="rtl:-scale-x-100" />
                </span>
                <span className="max-w-full truncate">{next.title}</span>
              </Link>
            )}
          </nav>
        </main>
      </Container>
    </div>
  )
}
