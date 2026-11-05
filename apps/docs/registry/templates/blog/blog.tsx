"use client"

import * as React from "react"
import Link from "next/link"

import { CodeIcon, MailIcon } from "@paneui/ui/icons"

import { BlogTopBar, Container, TextLink } from "./parts/chrome"
import { author, formatPostDate, groupPostsByYear, site, socials, type Social } from "./parts/data"

export type BlogHrefs = { home: string; post: string }

const SOCIAL_ICONS = { code: CodeIcon, mail: MailIcon }

function SocialLink({ social }: { social: Social }) {
  const Icon = SOCIAL_ICONS[social.icon]
  return (
    <a
      href={social.href}
      rel="noreferrer"
      className="inline-flex items-baseline gap-1 rounded-xs text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 outline-none hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon size={14} className="translate-y-0.5" />
      {social.label}
    </a>
  )
}

/**
 * Personal blog home: the name with what the author does, a short intro, the social row, then every
 * post grouped by year. From `sm` the year sits in a left gutter beside its posts. Intro links are
 * underlined; each post is one row-sized link that fills on hover.
 */
export function BlogHome({ hrefs = { home: "/blog", post: "/blog/post" } }: { hrefs?: BlogHrefs }) {
  const years = groupPostsByYear()
  return (
    <div className="bg-background">
      <Container>
        <BlogTopBar homeHref={hrefs.home} />

        <main>
          <header className="mb-4 flex flex-col gap-0.5">
            <h1 className="text-base font-medium text-balance">{site.name}</h1>
            <p className="text-muted-foreground first-letter:uppercase">
              {author.role} in {author.location}
            </p>
          </header>

          <div className="mb-10 flex flex-col gap-3 text-muted-foreground">
            <p className="text-pretty">I write code, and I keep a record of it.</p>
            <p className="text-pretty">Most of what lands here started as a note to myself. Some of it is still useful.</p>
            <p className="text-pretty">
              Start with <TextLink href="#">about this site</TextLink>, or browse{" "}
              <TextLink href="#projects">the projects I&apos;m working on</TextLink>. The posts below are sample content you can
              replace.
            </p>
            <p className="flex flex-wrap items-baseline gap-x-1.5">
              <span>Elsewhere,</span>
              {socials.map((social, i) => (
                <React.Fragment key={social.label}>
                  {i > 0 && <span aria-hidden>{i === socials.length - 1 ? "and" : ","}</span>}
                  <SocialLink social={social} />
                </React.Fragment>
              ))}
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {years.map((group) => (
              <section
                key={group.year}
                aria-labelledby={`year-${group.year}`}
                className="grid grid-cols-1 gap-2 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-4"
              >
                <h2 id={`year-${group.year}`} className="font-mono text-base font-normal text-balance text-muted-foreground sm:py-1.5">
                  {group.year}
                </h2>
                <ul className="-mx-2 flex flex-col">
                  {group.posts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={hrefs.post}
                        className="flex items-baseline gap-4 rounded-md px-2 py-1.5 leading-6 transition-colors duration-150 outline-none hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="min-w-0 wrap-anywhere">{post.title}</span>
                        <time dateTime={post.date} className="ms-auto shrink-0 font-mono text-muted-foreground tabular-nums">
                          {formatPostDate(post.date)}
                        </time>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </main>
      </Container>
    </div>
  )
}
