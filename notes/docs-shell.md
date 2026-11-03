# Docs shell (2026-10-16)

Decision: the docs chrome is one white surface split by hairlines, not an app shell with a grey
rail and an inset panel. The library's `shell` / `shell-inset` tokens stay for templates and apps;
the docs site no longer uses them.

- **Header**: `h-12`, `border-b`, sticky. The brand column is `lg:w-64`, the sidebar's width, and
  starts on the sidebar's content edge, so the mark, the sidebar search and the rows share one left line.
- **Tabs** (Docs, Components, Templates) mirror the sidebar's three sections. Active tab = foreground
  text plus a 2px bottom indicator, the same treatment as the sidebar's left indicator line.
- **Right side**: search field with the shortcut (icon-only under `sm`), GitHub, theme and accent controls.
- **Sidebar** (`apps/docs/components/docs/docs-nav.tsx`): search field at the top (opens the palette),
  collapsible sections with counts, category groups inside Components, `h-7` text-only rows
  (`text-ui`, no per-item icons), "New" badges and a sticky "What's new" footer from
  `apps/docs/components/docs/whats-new.ts`. Collapsed state persists in `localStorage["docs-nav-collapsed"]`.
  Below `lg` it opens in the left drawer.
  - **One left edge (round 15)**: no indent and no guide line. Section labels, group labels and rows
    all put their text on the same line (`px-2` inside the nav's `px-3`). Hierarchy comes from type
    and spacing instead: section labels `text-ui` semibold foreground, group labels `text-ui-sm`
    medium muted with a `mt-2` gap above, chevrons on the right for both. Active row = `bg-secondary`
    + a 2px bar in the gutter left of the row (`-start-2`), outside the fill.
- **Right TOC** (`doc-toc.tsx`) on docs and component pages from `xl`. **Round 22**: capped at the viewport
  (`100svh` minus the 5rem sticky offset and 1.5rem air); the list scrolls in its own `ScrollArea` with `fade`,
  scrolls the current entry into view, and one 2px indicator slides along the rail (`translate`, 300ms, off under
  reduced motion). Titles are single-line and truncate with an `OverflowHint` (opens to the left). Depth-2 entries
  are `ps-6 text-ui-sm`. The current section is the last heading above 112px, or the last entry at the page end.
  Back to top sits under the list, outside the scroll area, and fades in after 320px of page scroll.
- **Docs page chrome (round 23)**, in `apps/docs/components/docs/doc-layout.tsx` (`DocLayout`, `DocHeader`, `DocFooter`), shared by
  the component pages (`app/docs/[name]`) and the guide pages (`GuidePage`):
  - **Eyebrow, not breadcrumb**: the section name (component category, "Templates" or "Getting started") sits above the
    title as a muted `text-ui` link to that section. The breadcrumb repeated the sidebar and the header tab, so it went.
  - **Page actions** (`page-actions.tsx`): a `ButtonGroup` of "Copy page" plus a `Menu` (Copy as Markdown, View as
    Markdown, Open in ChatGPT, Open in Claude, Copy page link), top-right of the title row; it wraps under the title on
    phones. All actions read the static `/docs/<slug>.md` (`/docs/index.md` for the introduction) written after
    `next build` by `tooling/scripts/gen-docs-md.mjs` (`pnpm docs:md`, part of `pnpm build` and the Cloudflare Pages build): component
    and template pages from registry.json, `content/docs/<name>.ts` and the example files (install commands, usage,
    composition, examples' code, notes, API tables); guide pages from their built HTML (elements with `data-md-skip`
    are left out), the design skill page from `SKILL.md`. `public/llms.txt` links to the `.md` files. The ChatGPT mark is
    not in the brand icon package, so that item uses the neutral chat glyph.
  - **Footer**: previous / next cards in sidebar order (`getDocsSequence()` in `lib/docs.ts`: Getting started, the
    overview, categories A–Z inside each, templates), then "Last updated" from `git log -1 --format=%ct` over the
    page's sources (`docSources(name)`: content file, examples folder, demo, item files; guide pages: their
    `page.tsx`, plus the skill folder for /docs/skill). No date when git or history is missing; the workflow checks out
    with `fetch-depth: 0`.
  - **Heading anchors** (`doc-heading.tsx`, `DocHeading`): every h2/h3 shows a link button on hover or focus (always on
    coarse pointers); pressing it copies the URL with the hash, replaces the hash and says "Copied" inline for 1.6s.
    Headings use `scroll-mt-24` below `xl` (sticky outline bar) and `scroll-mt-20` above.
- **Outline track (round 23)**: the TOC's `border-s` rail and sliding bar became an SVG track built from the links'
  offsets: depth-1 entries at x=1, depth-2 at x=13, a short diagonal (8px) at the top of the entry where the depth
  changes. The same path drawn 2px in `foreground` is clipped (`clip-path: inset`) to the current entry and transitions
  300ms ease-out; under reduced motion it jumps. Below `xl`, and always on template pages (`DocLayout wide`, the content
  takes the rail's width), the outline is a sticky "On this page · <current section>" button under the header that
  opens the same list in a popover (the anchor's width, max 24rem / 60svh, Back to top once scrolled).
- **Previews**: Fit renders inline; Desktop (1024), Tablet (768) and Mobile (390) render `/preview?demo=…`
  or `?example=…` in an iframe so media and container queries react. The viewport switch is a second `Tabs`
  list (default size, icon-only `TabsTab`s with `aria-label` + tooltip: Maximize, Monitor, Tablet, Smartphone),
  the same component and size as Preview / Code. **Round 22** removed the control-size switch (`size=`) and the
  RTL toggle (`dir=`): direction is shown by an "RTL" example at the end of each component's examples instead
  (`examples/<name>/rtl.tsx`, `DirectionProvider` + `dir="rtl"`, Arabic copy). `/preview` renders bare like `/templates/*`.
  **Theme sync (2026-10-16)**: the framed preview follows the docs page live through
  `useFrameThemeSync` (`theme-sync.tsx`, shared with the template previews): it copies `dark`, `data-accent`,
  the custom accent `<style>` and `data-radius` / inline `--radius` from the page's `<html>` on every attribute
  change, `<head>` change, same-tab accent/radius/theme event, storage event and frame load. The shell mounts
  `ThemeSync` too, so a theme, accent or radius picked in another tab reaches the page itself (the header only
  listened for theme and accent, so a radius picked on Customize in another tab moved the iframe but not the
  toolbar). The toolbar's segmented controls and the Preview / Code tab list are frames (`frame-* frame-p-0.5` +
  `rounded-inner`), so their thumbs stay concentric at every radius preset.

Why: the old rail and inset panel read as a second app inside the page, the header and rail used
different heights and paddings, and icon+label rows were too large for ~150 items.

## Built from the library (round 24)

The docs chrome is composed from registry items, so the site is the first consumer of each one:

- Header section tabs: `NavigationMenu` + `NavigationMenuLink variant="tab"` (`active` = the 2px bar).
- Sidebar: `SidebarNav` (`SidebarNavSearch`, `SidebarNavContent`, collapsible `SidebarNavSection` with `level="group"`,
  `SidebarNavLink` with `render={<Link />}`, `SidebarNavFooter`). Collapsed state still persists through `open` /
  `onOpenChange` in `docs-nav.tsx`.
- Outline: `Outline` (rail) and `OutlinePopover` (narrow and wide pages) from `ui/outline.tsx`; `doc-toc.tsx` only maps the
  site's depth 1/2 entries to depth 2/3. The same component drives the docs and blog templates.
- Page header: `PageHeader size="lg"` (eyebrow and lede on their own rows, actions beside the title).
- Prev / next and the Introduction tiles: `Card interactive render={<Link />}`.
- API, token, theming and CLI tables: `SimpleTable` (`variant` on cells); the phone-only stacked lists are `Card` and carry
  `data-md-skip`.

Left custom on purpose: `DocHeading` anchors (copy-link behaviour specific to the docs), `InstallCommand` (package-manager
pill tied to the docs' install store), `PreviewTabs` / `TemplatePreview` / `DeviceFrame` (preview iframes and theme sync),
the theming widgets' swatches inside `theming-accent.tsx` / `theming-radius.tsx` (they are the demo itself), and the
sidebar's "What's new" row (a status dot plus count; one row, no list).

## Component pages and the gallery (2026-11-03)

- **Component pages are two panels and nothing else.** The stage shows the selected example (Preview) or the
  docs as white rows (Code: Install with Command / Manual, Usage, the selected example's source, Composition,
  API with the full prop tables, Notes). The side panel holds the title, the summary, the example list, the
  selected example's "when to use" line, Viewport, Share and Copy install. Merged variants are groups in the
  example list; picking one switches the install command and every Code row to that variant's item.
- From `lg` both panels fill the viewport (`--studio-h`); the side panel is sticky and only its example list scrolls.
- No outline: nothing long-form is left to outline. The sidebar stays for navigation; a one-line prev / next sits
  under the panels for phones, where the sidebar is a drawer.
- Old anchors still land: `#variant-<name>` selects the variant, `#example-<id>` the example, `#installation`,
  `#usage`, `#composition`, `#api-*` and `#note-*` open the Code view on that row.
- The icons page uses the icon grid as its stage; icon styles and making icons are Code rows.
- The Markdown twins (`pnpm docs:md`) are written from the docs data, not the page HTML, so they keep the full text.
- Template pages keep the long-form layout.
- The gallery has no sidebar: a full-width grid (up to five columns) under a sticky row of category chips.
