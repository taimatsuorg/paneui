---
name: paneui-design
description: Build and review PaneUI Web and Native interfaces using shared design values and platform-specific interaction rules.
---

# PaneUI design

PaneUI shares semantic colours, spacing, radius, typography hierarchy and wording across renderers.
Web uses desktop density and browser primitives. Native uses touch dimensions and native views. The numbered rules describe the shared intent with Web examples. Use the platform
references to translate that intent before editing a different renderer.

## Choose the platform

| Work | Read | Apply |
| --- | --- | --- |
| Shared design values or state | `references/platforms.md` | Semantic roles, package boundaries and platform-independent logic |
| Web components, docs or desktop renderer | `references/web.md`, then the relevant topic reference | CSS tokens, DOM semantics, keyboard and pointer behaviour |
| Native components or showcase | `references/native.md`, then `references/platforms.md` | Native style tokens, touch, safe areas, font scaling and native accessibility |

Keep one source of design values. Component implementations, navigation and platform APIs can
vary. A showcase rendered in a browser remains a browser check; validate device behaviour on the
target platforms. The Web density and CSS recipes below do not override Native guidance.

## Install

```bash
npx skills add taimatsuorg/paneui --skill paneui-design
```

The library itself installs with the shadcn CLI (`npx shadcn@latest add @paneui/theme`, then any
item). See `references/registry.md`.

## Check

```bash
node .agents/skills/paneui-design/scripts/check.mjs            # wherever the skill was installed
node .agents/skills/paneui-design/scripts/check.mjs app src    # only these paths
node .agents/skills/paneui-design/scripts/check.mjs --self-test
```

Static checks for most of the rules below (tokens, radius, type, motion, icons, hit areas, copy,
registry names, stale theme; `--list` names each one). No dependencies; with TypeScript in the project it reads JSX exactly (the native
TypeScript 7 compiler has no parser API, so there it falls back to line checks). Exit code 1
on errors (`--strict`: warnings too), `--json` for tools, `--list` for the rule ids. Configure it in
`paneui-design.config.json` (allow-list a file with a reason, add names that must not appear in copy);
silence one line with a comment `design-check-ignore <rule> -- <reason>` above it.

The checker detects Native source from its imports or configured `platforms.native` globs.
Configure `platforms.shared` globs for shared core modules. Native checks report literal style
colours, fixed touch targets below 44px, disabled font scaling, missing primitive roles or names,
and literal radii above the cap. Shared-boundary checks reject platform dependencies in core.
These AST checks need the TypeScript parser. A passing result does not prove that indirect styles,
prop spreads, contrast, actual target bounds or device accessibility are correct.

Web rendering checks use the browser probes below. Native rendering checks follow the device
checklist in `references/native.md`; DOM probes do not inspect a native view tree.

Some Web rules need the rendered page: open the screen in a browser (menus open, a row hovered) and paste
`scripts/radius-probe.js` into the console for corners more than 2px off concentric, and
`scripts/polish-probe.js` for small or overlapping hit areas, button padding, image outlines, heading
wrap, live numbers, smoothing and compositing hints. Run the check before you commit and fix what it
reports; a finding you keep gets an allow-list entry with its reason.

`examples/<rule>/good.tsx` and `bad.tsx` show each motion, icon and polish check on the library's own
components; `--self-test` checks them against their rule.

## Rules

### 1. Colour with theme tokens

Tokens follow the theme, the accent preset and dark mode; palette classes and hex values don't.

Use `bg-card`, `text-muted-foreground`, `bg-success-subtle`, `inset-ring-success-border`, `var(--chart-3)`.
Never `bg-zinc-100`, `text-green-600`, `[#0090ff]` or a hex in a component. `white`/`black` only for scrims.

### 2. Put text on a solid in its foreground token

The neutral accent's solid is near-white in dark mode, so `text-white` disappears on it.

`bg-primary text-primary-foreground`, `bg-destructive text-destructive-foreground`. Hover a filled
control to `bg-primary-hover`, press to `bg-primary-active`, never `/90`.
Coloured text and icons off a solid use the `-text` role: `text-primary-text`, `text-destructive-text`.

### 3. Fill for state, surface for panels

`secondary`, `muted` and `accent` are translucent fills; anything that floats or holds content needs an opaque surface.

Hover, selected and track fills use `bg-secondary` / `bg-accent` / `bg-foreground/6`. Cards, popovers,
menus and dialogs use `bg-card`, `bg-popover` or `bg-background`.

### 4. Elevate with shadow tokens, not borders plus shadows

Each shadow level already carries its own hairline, so a CSS border on top doubles the edge.

`shadow-raised` for resting cards, tables, code and controls, `shadow-surface` for popovers and menus,
`shadow-xl` for dialogs, drawers and the command palette, `shadow-well` for fields and tracks, `shadow-chip`
for keys and small chips. Dividers inside a surface are `border-border` (an alpha hairline).

### 5. Keep series on the chart palette

Eight fixed hues read the same under every accent, in both modes, and keep neighbours apart.

Series are `var(--chart-1)` … `var(--chart-8)` in order; status colours only where the colour means a
status. Never `primary` in a chart. Legend and tooltip swatches are round dots.

### 6. Keep nested radii concentric

A child corner that doesn't follow its container's curve reads as a mistake at every radius preset.

Inner radius = outer radius − padding. Put `frame-{token} frame-p-{n}` on the container and
`rounded-inner` on the child; a padded child that holds more rows takes `frame-inner`, never
`frame-inner` and `rounded-inner` together. Insets of 8px or less are always concentric.

### 7. Stay at or under 16px

Past 16px containers turn into blobs and nested parts can't stay concentric.

Use `rounded-sm` … `rounded-3xl`; every token clamps at `--radius-max`. Never `rounded-4xl`/`5xl` in new
code or an arbitrary radius above 1rem. `rounded-full` only for round things: avatars, dots, switches,
slider thumbs, badges and tags, icon-only circular buttons, progress bars.

### 8. Derive every radius from the base radius

Presets and the radius slider rescale `--radius` and the tokens built on it, never literal pixel radii.

Use a token, or `rounded-[calc(var(--radius)*k)]` (clamped with `min(…, var(--radius-max))` above 2×).
Only 1–2px caret radii, `rounded-full` and `rounded-[inherit]` stay literal.

### 9. Use the UI type scale

One compact scale keeps dense screens even; arbitrary sizes drift.

Components use `text-ui-2xs` 10 · `text-ui-xs` 11 · `text-ui-sm` 12 · `text-ui` 13 · `text-ui-lg` 14.
Reading copy and page headings use `text-sm` and up; `text-3xl`+ only for heroes. Never `text-[11px]`.

### 10. Semibold titles, medium labels

Two weights carry the hierarchy; heavier text shouts in a dense layout.

Titles `font-semibold`, labels and buttons `font-medium`, body `font-normal`. `font-bold` only in
reading copy that needs it.

### 11. Keep the font's tracking

The type is spaced for its size; tightening small text makes it harder to read.

`tracking-tight` only from `text-xl` up. Wide tracking only on uppercase labels and shortcut glyphs.

### 12. Use tabular numbers for numbers that change or align

Proportional digits make columns and counters jump.

`tabular-nums` on prices, timers, tickers, table columns and counts, not on phone numbers, versions or a
count fixed in a sentence. `text-balance` on headings (never on code), `text-pretty` on paragraphs,
`antialiased` once on `<body>` (the theme sets it), never per element.

### 13. Size controls for desktop density

Desktop screens hold more per view; touch-sized controls waste it.

Buttons and inputs `h-8` (sm `h-7`, xs `h-6`, lg `h-9`), menu rows 26px, sidebar rows `h-8` (sub rows
`h-7`), checkbox 16px, switch 32×20, disabled `opacity-64`. Use component sizes, not heights. Field text stays
at the control size on phones too; where iOS focus zoom gets in the way, mount the opt-in `IosZoomLock` once
(recommended) or give that field `max-md:text-base`; never turn zoom off for the whole page (check:
`viewport-zoom`).

Native components use the same semantic colours and type hierarchy with touch dimensions from
`references/native.md`. Web control heights above apply to the Web implementation.

### 14. Space related things closer

Spacing groups content before any border does.

4px grid. Icon + label `gap-1.5`–`gap-2`, control groups `gap-2`–`gap-3`, card padding `p-4`–`p-6`,
sections `gap-6`–`gap-10`. Put space with `gap` on the parent, never padding on a component.

### 15. Start navigation text on one left edge

Indents and guide lines widen the sidebar and break the column the eye follows.

Section labels, group labels and rows share one text edge; hierarchy comes from type and spacing.
The active row is a fill (`bg-secondary` or `bg-foreground/6`) with an optional 2px bar in the gutter.

### 16. Compose the library, don't restyle it

A component's variants and sizes are its design; overriding them per screen forks the style.

Pick a `variant`/`size`; `className` on a component is for layout (margins, `w-full`, grid placement).
If nothing fits, style a plain wrapper, or add a variant to the component in its own change.

### 17. Keep a menu label inside its group

The label names the group for assistive tech, and the primitive label throws outside one.

`<MenuGroup><MenuLabel>Agent</MenuLabel>…items…</MenuGroup>`; the same for select and combobox labels.

### 18. Chevron and folder icon for folders, file icons for files

Folders show the expand chevron, then an open or closed folder icon; files skip the chevron's column,
so file icons line up under the folder icons at the same level.

### 19. Draw icons from one family per group

Two glyph families in one group look like two different products.

Navigation, rails, docks, tab bars and palettes use the nav glyphs (`InboxIcon`, `CalendarDaysIcon`,
`TerminalSquareIcon`), outline at rest like the controls beside them. A nav with a row fill (sidebar,
rail) keeps the outline glyph when active; one without (a tab bar) swaps to the filled pair,
`activeIcon={<InboxFilledIcon />}`. Icons come from `@/components/icons` only, 16px and muted in
navigation.

### 20. Frame title icons, keep nav icons bare

A frame marks an icon as the subject of a card; in a list it is clutter.

Card, alert and header icons sit in `<IconChip>` (one size per list, tone for status). Nav, toolbar
and inline icons are bare and take their size from the control.

### 21. Use real brand marks for other products

Redrawn or approximated logos look wrong to anyone who knows the brand.

`<BrandIcon icon={siGithub} />` with one named import per logo; `color="brand"` where the logo is the
content, the default `current` in toolbars and nav. Brands the set leaves out get a neutral icon.

### 22. Show people and workspaces as avatars

An avatar says "who"; a generic icon in that spot says nothing.

`<Avatar>` with an image, a generated face or initials, round for people, `shape="rounded"` for workspaces
and teams.

### 23. Answer a press with a fill

Native controls don't shrink when pressed; scaling every button makes the screen feel springy.

Buttons, triggers, toggles, nav rows, checkboxes and radios change fill on `:active`. Press scale only
where the motion is the component's point (hold or slide actions, expanding controls, card stacks).

### 24. Transition named properties, briefly

`transition-all` animates layout you didn't mean to, and slow hovers feel laggy.

`transition-colors` or `transition-[box-shadow,background-color]`; `duration-150` for hover and press,
`200` for state changes, `300` for reveals; ease `cubic-bezier(0.22,1,0.36,1)`. Springs stay bounce-free:
`bounce: 0`, or stiffness 380–520, damping 26–42, mass 0.5–0.7 (never under 0.6 of critical damping).

### 25. Gate movement on reduced motion

Movement, scale and blur can make some readers ill; an opacity fade carries the same change.

`useReducedMotion()`, `motion-safe:` / `motion-reduce:`; under reduce, cross-fade instead of cutting.
Popups enter from `scale-98` plus opacity; exits are shorter than entrances.

### 26. Show a ring on keyboard focus

Keyboard users need to see where they are; a hover style doesn't help them.

`focus-visible:ring-2 focus-visible:ring-ring` on everything interactive. `outline-none` only with
that ring. Check every change in light and dark.

### 27. Let the preview explain

A live preview already shows the look, layout and states; text that repeats it is noise.

Overview cards show the name and the preview only. Example blocks are title, preview and code, with at
most one lead-in sentence that says when to use it.

### 28. Keep descriptions to one plain sentence

A registry description is the page lede, the search text and the meta tag at once.

One sentence of 12 words or fewer, no values, lists or paths. Exact values go in the API table or a note.

### 29. Never write colon lists or stacked adjectives

"X: a, b, c and d" and "powerful, seamless" read as filler.

Say what the thing does. Drop complete, comprehensive, powerful, seamless, robust, modern, flexible.

### 30. Describe what it does, not where it came from

Copy names the job, not the projects behind it.

"Block editor", "the syntax highlighter", "desktop density". No `inspired by`, `port of` or `X-style` in
comments, copy or docs; licence notices live in one notices file. Package names stay where they are
needed: imports, dependencies, install commands.

### 31. Name template parts apart from registry items

A part file named like an item (`parts/avatar.tsx` next to the `avatar` item) collides on install and in imports.

Name parts for their job: `parts/author-avatar.tsx`, `parts/buffers.ts`.

### 32. Run the upgrade check after a theme update

The CLI adds and updates theme variables but never deletes one, so removed tokens linger.

`npx shadcn@latest add @paneui/upgrade-check`, then `node scripts/paneui-upgrade-check.mjs` (`--fix`
cleans the stylesheet). The design check runs it for you when it is installed.

### 33. Give every target 24px to land on

A 16px checkbox or close button is hard to hit with a trackpad and harder with a finger.

Keep the visible size and extend the target with a pseudo-element: `relative after:absolute after:-inset-1`
takes 16px to 24px, `pointer-coarse:after:-inset-3.5` to 44px on touch. Shrink the extension where it
would reach a neighbour; two targets never share pixels. Checkbox and radio already do this.

### 34. Trim the icon side of a button

An icon's side bearing adds space, so equal padding pushes the content off centre.

Mark the glyph `data-icon="inline-start"` or `"inline-end"`; Button takes 2px off that side at every
size. House icons are drawn optically centred (the play triangle sits right of centre), so don't
nudge them with margins.

### 35. Outline images with a neutral hairline

Without an edge a pale photo melts into a white card; a grey border picks up the surface tint.

`media-outline` on `img` and `video`: a 1px inset line, black at 10%, white at 10% in dark. Leave it
off transparent marks such as favicons and logos.

### 36. Cross-fade icon swaps

A glyph that cuts from copy to check is easy to miss; one that changes in place reads as a new state.

Both glyphs move between `opacity 0, scale 0.25, blur 4px` and `opacity 1, scale 1, blur 0` on
`{ type: "spring", duration: 0.3, bounce: 0 }`, inside `<AnimatePresence initial={false} mode="popLayout">`;
`<ActionSwapBlurIcon value>` is that recipe as a component. A library file without motion keeps both
glyphs in one grid cell and toggles `opacity-0 motion-safe:scale-25 motion-safe:blur-xs`.

### 37. Transition states, keyframe one-offs

A transition retargets when a state flips mid-way; a keyframe restarts and snaps.

Hover, open, checked and pressed use transitions; keyframes only for loops and one-time sequences.
Hover answers within 150ms with a fill or opacity change. Motion never carries a change alone: a colour,
icon or label changes with it. `will-change` names only `transform`, `opacity` or `filter`, and only
after a stutter you saw.

### 38. Leave quieter than you arrive

The eye has moved on to what comes next; a big exit pulls it back.

Exits fade with a short fixed offset (`y: -8` to `-12`, blur 4px) in about 150ms, never a half-scale
shrink or a full-height flight. A drawer or sheet sliding back to its edge is the exception.

### 39. Recolour icons with CSS, keep their stroke and grid

A thicker stroke, an off-grid size or a baked-in fill makes one glyph look like another set.

Icons paint with `currentColor`; hover, selected and disabled are text colours and opacity. No
`strokeWidth` on an instance: stroke comes in two tiers (rule 41). Sizes stay on the grid (12, 14, 16, 18,
20, 24px). Arrows, chevrons, send and reply glyphs take `rtl:-scale-x-100`; checkmarks, clocks and media
controls never flip.

### 40. Name every icon-only button

A screen reader announces an unnamed icon button as "button" and nothing else.

`aria-label` on the button, with the same text as its tooltip. Icons beside a label stay hidden from
assistive tech (house icons already are).

### 41. Match the icon stroke to the text weight

A regular stroke beside semibold type looks faint, as if the icon were disabled.

Line icons have two stroke tiers: regular, and bold at 1.2x (rounded 1.75 → 2.1, outline 1.6 → 1.92).
Put `icon-bold` on semibold or bold text that holds icons (titles, Badge and section labels already
carry it), or `weight="bold"` on a lone icon; `icon-regular` resets it inside. Medium text (buttons,
menu rows) stays regular.

### 42. Fill the active glyph where there's no row fill

Colour alone is a weak signal for where you are, especially on a phone in sunlight.

Nav glyphs are outline at rest. In a tab bar, which has no row fill, the active item shows the filled
pair (`HomeFilledIcon` for `HomeIcon`) through `activeIcon`. Sidebars and rails mark the active row with
a fill, so their glyph stays outline.

### 43. Align text to the reading direction

`text-left` stays left in Arabic and Hebrew, where the text starts on the right.

`text-start` / `text-end`, like `ps-*` / `pe-*` for padding. Physical alignment only where the content
itself is left to right (code gutters) or a stored setting is physical (an email block's alignment).

## References

| File | Covers |
| --- | --- |
| `references/foundations.md` | Colour roles and values, accent presets, elevation, radius scale and cap, fonts and type |
| `references/components.md` | Composition, lint contracts, menus, cards, file trees, avatars, removed components |
| `references/layout.md` | Density, spacing, shells, sidebars, docs chrome |
| `references/copy.md` | Copy density, descriptions, long-form prose, naming |
| `references/icons.md` | Icon families, sizes, chips, brand marks, drawing new icons |
| `references/charts.md` | Chart palette, order, swatches, labels |
| `references/motion-a11y.md` | Springs, durations, press, reduced motion, focus, dark mode |
| `references/polish.md` | Hit areas, optical alignment, image outlines, icon swaps, exits, compositing, reviewing a screen, where this skill differs from common polish advice |
| `references/platforms.md` | Shared values, dependency boundaries and cross-platform contracts |
| `references/web.md` | Web rule scope, browser interaction and validation |
| `references/native.md` | Native tokens, touch, accessibility, motion and device validation |
| `references/registry.md` | Installing, upgrading, adding items, the checks |
