# Paper style (opt-in)

Added 2026-10-21. A second look for the whole library, switched with `data-style="paper"` on `<html>`
(or any element for one section). The default style is untouched: with no attribute every new token
resolves to the old value.

## How it is wired

- `packages/tokens/styles/theme-paper.css`: all Paper values, light and `.dark`, plus Paper versions of
  every accent preset (`html[data-style="paper"][data-accent="…"]`). Written by
  `tooling/scripts/gen-paper.py`; edit the generator and run `pnpm tokens:gen`.
  Imported by `globals.css` after `theme-accents.css`; shipped as the `theme-paper` registry item.
- New theme tokens (in `@theme inline` and the `theme` item, version 2.4):
  - `--font-heading` = `var(--heading-font, <sans stack>)`, feature settings `var(--heading-font-features, "ss03")`.
  - `--radius-control` = `min(var(--control-radius, var(--radius)), var(--radius-max))`, `-sm` = half of it.
    Paper sets `--control-radius: 2rem`, so the cap (16px) applies and short controls render as pills.
- Components moved to the tokens: Button, Toggle / ToggleGroup, ButtonGroup text, Tabs and
  SegmentedControl wells (`frame-control*`). Titles with `font-heading`: Card, Dialog, AlertDialog,
  Drawer, BottomSheet, MorphingModal, EmptyState, PageHeader, SettingsSection; docs `DocHeading` and the
  components index headings. `cn()` knows `rounded-control*` so a `rounded-full` override still wins.
- Paper also raises `--radius` to 0.75rem when no radius preset is set, swaps greys to near-neutral alpha inks,
  softens the four shadow levels and the state colours, and uses dusty accent solids (pastel solids with
  ink text in dark).
- Docs: `localStorage["style"]`, applied by the pre-paint script; `style-store.ts`; ThemeSync and
  `useFrameThemeSync` copy `data-style` into template and preview frames. Switches: the accent menu in
  the header (Style group) and the Style section on Customize.

## Open

- Native now accepts `style="paper"` on ThemeProvider. `pnpm tokens:gen` derives its palette,
  radii, heading stack and shadow layers from the shared Paper stylesheet. Native shadows
  use the broadest drop layer and retain each surface hairline. The browser docs persist
  the style in `native-docs-style`; devices use a system serif or a registered `headingFont`.
- The Customize accent strip and its copied CSS show default-style accent values; Paper's own accent
  values live in theme-paper.css.

## Paper palette

The pale surface anchor is lifted to 99% lightness with chroma 0.002. Cards use
99.8% lightness with chroma 0.001. Ink uses chroma 0.004, including dark surfaces.
Accent hues come from the anchors below; light solids use 54% lightness and
white text. Dark solids use 80% lightness with ink text. `-text` roles, `info`, `selection`, `border-control`
and the `tag-*` colours are derived from contrast targets in `tooling/scripts/theme_roles.py`.

| Colour | Pinyin | Anchor | Token |
| --- | --- | --- | --- |
| 霜色 | shuāng sè | #E9F1F6 | background, card |
| 玄青 | xuán qīng | #3D3B4F | foreground, neutral |
| 靛青 | diàn qīng | #177CB0 | primary, blue |
| 松花绿 | sōng huā lǜ | #057748 | green, success |
| 琥珀 | hǔ pò | #CA6924 | orange, warning |
| 胭脂 | yān zhī | #9D2933 | rose, destructive |
| 黛紫 | dài zǐ | #574266 | violet |

`tooling/fixtures/paper-anchors.json` records the selected anchors. The generator
derives their hue and chroma, then normalizes lightness for readable controls.
Run `node tooling/scripts/paper-contrast.mjs` to check every solid state, and `node tooling/scripts/theme-contrast.mjs`
for every text and control pair (both styles, all accents). Warning is a vivid amber with ink text in both modes.
