# Foundations

Every value lives in the theme stylesheet (`app/globals.css` in a project that installed `@paneui/theme`).
Use the tokens below; add a new one only in its own reviewed change, with a light and a `.dark` value and
an `@theme inline` mapping.

## Colour roles

Neutrals use an achromatic grey scale (`oklch(26.9% 0 0)` ink on `#fff` in light mode; `oklch(97% 0 0)` ink on `oklch(20.15% 0 0)` in dark mode) paired with translucent black/white borders and fills for crisp separation and visual depth; surfaces are opaque. Accent, status, tag and chart roles are OKLCH, verified in every pair by `node tooling/scripts/theme-contrast.mjs` across all styles (`default`, `studio`, `paper`), both modes and every accent.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `oklch(100% 0 0)` | `oklch(20.15% 0 0)` | page |
| `card` | `oklch(100% 0 0)` | `oklch(22.19% 0 0)` | cards, tables, raised controls |
| `popover` | `oklch(100% 0 0)` | `oklch(22.19% 0 0)` | menus, popovers, dialogs |
| `shell` | `oklch(98.5% 0 0)` | `oklch(17.94% 0 0)` | sidebar chrome, app shell and tile wells |
| `surface-sunken` / `surface-standout` | black 4% / `oklch(26.9% 0 0)` | black 28% / `oklch(97% 0 0)` | wells, inverted callouts |
| `foreground` | `oklch(26.9% 0 0)` (~15.1:1) | `oklch(97% 0 0)` (~16.6:1) | text |
| `muted-foreground` | `oklch(51.6% 0 0)` (~5.6:1) | `oklch(64.87% 0 0)` (~5.6:1) | secondary text, nav icons; ≥ 4.5:1 across all surfaces and active fills |
| `fg-tertiary` / `fg-disabled` | ≥ 3.1:1 / exempt | ≥ 3.1:1 / exempt | meta and placeholders (≥ 3:1), disabled text |
| `fill-hover` / `fill-active` / `fill-strong` | black 4% / 7% / 12% | white 4% / 7% / 12% | **translucent** fills: hover and filled controls, pressed / open / selected, pressed on hover |
| `secondary`, `muted` / `accent` | = `fill-hover` / = `fill-active` | same | the shadcn names of the fills |
| `border` / `border-subtle` / `border-strong` / `input` | black 8% / 6% / 16% / 10% | white 6% / 4% / 14% / 8% | translucent hairlines for dividers, cards, outline buttons and fields |
| `border-control` | ≥ 3.1:1 | ≥ 3.1:1 | an edge that must be found (high-contrast fields, checkbox edges) |
| `destructive` / `success` / `warning` / `info` | solids | luminous solids | each has `-hover`, `-foreground` (≥ 4.6:1 on the solid), `-subtle`, `-border` and dedicated `-text` roles (≥ 4.5:1 on surfaces and subtle washes) |
| `tag-<colour>-text` / `-bg` / `-fill` | | | default, gray, brown, orange, yellow, green, blue, purple, pink, red: label text, highlight and pill; text ≥ 4.5:1 on all three |
| `code` | `oklch(100% 0 0)` | `oklch(22.19% 0 0)` | code block surface |
| `chart-1` … `chart-8` | see `charts.md` | | data series, ≥ 3:1 on the page |

- Washes: `bg-success-subtle inset-ring inset-ring-success-border` (badges, chips, alerts). Opacity
  modifiers (`ring-primary/20`) are fine for one-offs.
- Solids are fills. Coloured text and icons use the `-text` role (`text-primary-text`, `text-destructive-text`);
  a solid as text fails 4.5:1 in at least one mode.
- `fill-*` (and `secondary`, `muted`, `accent`) are fills, not surfaces. Anything opaque uses `bg-card`,
  `bg-popover` or `bg-background`.
- No gradient sheens, inset highlights, text shadows or glows.

## Accent

Ten roles carry the accent: `primary` (solid), `primary-hover`, `primary-active`, `primary-foreground`
(≥ 4.5:1 on all three), `primary-subtle`, `primary-subtle-hover`, `primary-border`, `primary-text` (links,
active items, accent icons; ≥ 4.5:1 on the page and the subtle fill), `ring` (≥ 3:1, used at `/50`) and
`selection` (`::selection`). The default is **neutral** on `:root` and `.dark` (`oklch(26.9% 0 0)` with
`oklch(98.5% 0 0)` label in light mode; `oklch(97% 0 0)` with `oklch(26.9% 0 0)` label in dark mode; focus
ring `oklch(65% 0 0)` / `oklch(55.6% 0 0)`).

Presets (blue, green, orange, rose, violet) are `html[data-accent="…"]` blocks that swap the ten;
coloured solids take white text in light mode and dark neutral ink in dark mode. Each ships as a
`theme-<name>` registry item. Filled controls hover to `bg-primary-hover`; text on any solid is its
`*-foreground`. Charts and tags never follow the accent.

## Elevation

| Level | Tailwind | Named tokens | Use |
| --- | --- | --- | --- |
| border | `shadow-xs` | `shadow-chip`, `shadow-pressed` | keys, small chips |
| default | `shadow-sm` | `shadow-raised` → `hover:shadow-raised-hover` | resting controls, cards, tables, code |
| lg | `shadow-md`, `shadow-lg` | `shadow-surface` | popovers, menus, floating panels |
| xl | `shadow-xl` | | dialogs, alert dialogs, drawers, sheets, command palette |
| inset | | `shadow-well` | fields and tracks |
| media | `media-outline` | | images and video: 1px inset black/10, white/10 in dark |
| primary | | `shadow-primary` | filled primary |

Each level includes its hairline (a 0.5–1px ring), so don't add a CSS border to a shadowed surface. Dark
elevation is an inset white hairline plus deeper drops. Hover on rows, menu items, ghost and outline
buttons and nav is a fill (`bg-secondary`), not a ring. App chrome: `bg-shell` with the `shell-inset`
utility (0.5px hairline, `rounded-shell`, 3px gap).

## Radius

`--radius` is 0.5rem. Tokens are multiples of it, clamped at `--radius-max` (1rem):

| Token | × | Default | Use |
| --- | --- | --- | --- |
| `rounded-xs` (`2xs`) | 0.25 | 2px | carets, tiny marks |
| `rounded-sm` | 0.5 | 4px | xs buttons, checkboxes |
| `rounded-md` | 0.75 | 6px | tab indicators in a `p-0.5` list |
| `rounded-lg` | 1 | 8px | buttons, inputs, triggers, tab lists, menu and select rows |
| `rounded-xl` | 1.25 | 10px | cards, tables, code blocks |
| `rounded-2xl` | 1.5 | 12px | menus and popups (`p-1`, rows 12 − 4 = 8px), two-layer inset cards |
| `rounded-3xl` | 2 | 16px | containers holding controls 8px in (prompt bars, composers, rails), dialogs |
| `rounded-shell` | 1.5 | 12px | the rail's inset panel |
| `rounded-4xl`, `rounded-5xl` | | 16px | old names at the cap; don't use |

Presets: none 0, sm 0.25rem, default 0.5rem, lg 0.6875rem, xl 0.875rem (controls 0, 4, 8, 11, 14px: even steps, and
XL stays short of a pill on a 32px button); a custom value goes up to 1rem.
`html[data-radius="…"]` or an inline `--radius` on `<html>` switches them.

Buttons, toggles, tab lists and segmented wells read `rounded-control` (`rounded-control-sm` at xs, and
`frame-control` / `frame-control-sm` on wells). It equals `rounded-lg` / `rounded-sm` unless a style sets
`--control-radius`; Paper sets it past the cap, so controls become pills and their children stay
concentric through `rounded-inner`. New controls use these tokens, never a literal radius.

### Concentric nesting

Declare the container with `frame-*` and the child follows it:

```tsx
<div className="frame-2xl frame-p-1 bg-popover shadow-surface">   {/* 12px, 4px in */}
  <div className="rounded-inner px-2 hover:bg-secondary">…</div>  {/* 12 − 4 = 8px */}
</div>
```

| Utility | On | Does |
| --- | --- | --- |
| `frame-{sm…3xl,shell}` | container | its radius; publishes radius − inset to descendants |
| `frame-p-{n}` | container | padding on all sides and the inset used in the maths |
| `frame-inset-{n}` | container | only the inset (gap from a wrapper, asymmetric padding) |
| `frame-border` | container | counts a 1px border into the inset |
| `rounded-inner`, `rounded-{t,b,s,e}-inner` | child | frame radius − inset (min 2px); `rounded-lg` outside any frame |
| `frame-inner` | padded child | takes the inner radius and publishes its own (level 2). Never with `rounded-inner` on the same element |
| `rounded-inner-{token}` | child | concentric in a frame, `{token}` outside one |
| `rounded-inner-or-{token}` | child | inner radius when usable, else `{token}` capped at `rounded-sm` |

When it applies: insets of 8px or less are always concentric. If radius − inset would be under 4px the
container is too loose: the child keeps its own token (or tighten the padding). For 9–15px insets,
surfaces (rows, panels, wells, media) stay concentric; self-contained controls keep their token. A child
is never rounder than its container. Two levels are supported; a third computes its value.

## Type

Inter Variable (`ss03`) → Noto Sans SC → system for UI; JetBrains Mono → system mono for code, keys and
terminals; Newsreader → Noto Serif SC only in the reading preset. Letter spacing normal. Self-hosted
through the `fonts` item; the theme falls back to system fonts without it.

Titles (card, dialog, sheet, empty state, page header, settings section) also take `font-heading`. It
is the UI face by default; the Paper style points it at Source Serif 4 → Noto Serif SC. Body text never
uses it.

| Size | px | Use |
| --- | --- | --- |
| `text-ui-2xs` | 10 | tiny meta |
| `text-ui-xs` | 11 | meta, shortcuts, counts |
| `text-ui-sm` | 12 | captions, badges, small controls, tooltips |
| `text-ui` | 13 | default UI: buttons, inputs, menus, nav, body inside components |
| `text-ui-lg` | 14 | lg controls, card titles |

Tailwind's `text-sm`–`text-2xl` are for reading copy and page or section headings; `text-3xl`+ only for
heroes. Weights: 400, 450 (`font-semimedium`), 500, 600, 700. Titles semibold (`tracking-tight` only from
`text-xl`), labels and buttons medium, secondary text `text-muted-foreground`. `text-balance` on headings,
`text-pretty` on paragraphs, `tabular-nums` on numbers that change or align, `antialiased` once on `<body>`. Inline code in prose sits a
little smaller than the text around it (`0.85em`–`0.9em`).
