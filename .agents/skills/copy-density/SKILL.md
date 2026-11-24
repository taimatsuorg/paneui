---
name: copy-density
description: Keep PaneUI interface copy short and useful.
---

# Copy density

The preview explains the component. Text only covers what the preview can't show.

These rules are also part of the `paneui-design` skill (rules 27–30, `references/copy.md`), which covers
the rest of the design system and ships a check for them (`scripts/check.mjs`).

## Rules

1. **Component cards: name and preview only.** A card on the gallery or any overview grid has no description. Never write the colon-list pattern ("X: a, b, c and d") anywhere.
2. **The preview is the explanation.** Where a live preview is shown, the text must not describe what the preview already shows (its layout, look, motion or states).
3. **Implementation details stay on the detail page.** Install paths, pixel values, variant lists and file locations never appear in overview cards, nav, search or ledes. Put them in the detail page body (an example, a note, the API table).
4. **Example blocks are title, preview and code.** Each block gets at most one lead-in sentence. That sentence must answer *when to use it*, never *what it is*. When the title already says it, drop the sentence.
5. **No stacked adjectives.** Ban filler like complete, comprehensive, powerful, seamless, robust, beautiful, modern, flexible, fully-featured, and blazing.
6. **Self-check before you finish.** Any card or lede longer than two lines gets cut to one line. Read every sentence and delete it if the preview, the title or the API table already says it.

## Where each kind of text goes

| Surface | Allowed text |
| --- | --- |
| Gallery and overview card | Name only |
| Registry `description` (cards in the CLI, nav search, page lede, `<meta>`) | One plain sentence, about 12 words or fewer, saying what the item is for. No values, no lists, no file paths |
| Detail page example | Title, plus an optional single "when to use" sentence |
| Notes, API table | Behaviour the preview can't show (keyboard, accessibility, motion under reduced motion, edge cases) and exact values |
| Guide pages and changelog | Short paragraphs that say what changed or what to do. No marketing |

## Rewrites

- ❌ "Buttons in six variants: default, secondary, outline, ghost, destructive and link."
  ✅ "Triggers an action or submits a form."
- ❌ "A powerful, fully accessible date picker with seamless keyboard support."
  ✅ "Picks a single date or a range."
- ❌ Example "Sizes": "`xs` (24px), `sm` (28px), `default` (32px) and `lg` (36px)…"
  ✅ "Use `sm` in toolbars and dense rows." (the pixel values live in the API table)
- ❌ Example "Disabled": "A disabled button that can't be clicked."
  ✅ *(no sentence; the title and preview say it)*

## Long-form text

Rendered prose (guides, changelog, notes, blog and docs templates) sits in a `typeset typeset-docs` container (see `app/typeset.css`). Don't hand-style headings, paragraphs and lists inside it. Use `not-typeset` on components dropped into prose.
