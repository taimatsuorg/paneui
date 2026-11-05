# Foundation v2 (2026-10-16)

The default fonts, colours, radius and shadows, replacing the 2026-10-14 values. The 13px UI scale,
control densities and shell layout from `notes/native-style.md` are unchanged. Licence notices are in
`THIRD_PARTY_NOTICES.md`.

## Source of the values

- Colour values are steps of 12-step scales (gray, blue, green, orange, tomato, crimson, violet, black and
  white alpha), sRGB hex plus display-p3. The raw scales extracted for this round live outside the repo
  (`/workspace/work/round16/gen/radix.json`); `/workspace/work/round16/gen/build_globals.py` writes the token
  section of `app/globals.css` from them, and `/workspace/work/regen-theme.py` regenerates `theme-accents.css`,
  `components/docs/accent-presets.generated.ts`, the accent picker's preset CSS and the registry items.
- Alpha values stay alpha, as authored: text, fills and borders read on any surface.

## Token mapping

| Token | Light | Dark | Scale step |
| --- | --- | --- | --- |
| `background` | `#fff` | `oklch(15% 0 0)` | page |
| `card` | `#fff` | `#111` | container (gray 1 in dark) |
| `popover` | `#fff` | `oklch(25.2% 0 0)` (#222) | modal |
| `surface-sunken` | `#0000000d` | `#00000066` | black a1 / a6 |
| `surface-standout` / `standout-foreground` | `#202020` / `#fff` | `#222` / `#ffffffed` | gray 12 / gray 3 |
| `shell` | `oklch(97.3% 0 0)` (#f6f6f6) | `#000` | shell |
| `foreground` (+ card/popover/secondary/accent fg) | `#000000df` | `#ffffffed` | gray a12 |
| `muted-foreground` | `#0000009b` | `#ffffffaf` | gray a11 |
| `fg-tertiary` | `#00000072` | `#ffffff64` | gray a9 |
| `fg-disabled` | `#00000044` | `#ffffff55` | gray a8 |
| `secondary`, `muted` | `#0000000f` | `#ffffff12` | gray a3 (component default) |
| `accent` | `#00000017` | `#ffffff1b` | gray a4 (component hover) |
| `border`, `input` | `#00000017` | `#ffffff1b` | gray a4: one edge role (round 35, was a3 / input a6) |
| `border-subtle` | `#00000006` | `#ffffff09` | gray a2 |
| `border-strong` | `#00000026` | `#ffffff2c` | gray a6 |
| `primary` / `-hover` / `-active` | `#0090ff` / `#0588f0` / `#0d74ce` | `#0090ff` / `#3b9eff` / `#70b8ff` | blue 9 / 10 / 11 |
| `primary-foreground` | `#fff` | `#fff` | on solid |
| `primary-subtle` / `-subtle-hover` | `#008ff519` / `#009eff2a` | `#0077ff3a` / `#0075ff57` | blue a3 / a4 |
| `primary-border` | `#0088f653` | `#0f89fd7f` | blue a6 |
| `ring` | `#0084e6a1` | `#0090ff` | blue a8 / a9 (used at /50) |
| `destructive` / `-hover` | `#e54d2e` / `#dd4425` | `#e54d2e` / `#ec6142` | tomato 9 / 10 |
| `destructive-foreground` | `#fffcfc` | `#fff` | tomato 1 / white |
| `destructive-subtle` / `-border` | `#f52b0018` / `#f92d0050` | `#ff35232b` / `#ff4f3864` | tomato a3 / a6 |
| `success` / `-hover` | `#30a46c` / `#2b9a66` | `#30a46c` / `#33b074` | green 9 / 10 |
| `success-subtle` / `-border` | `#00a43319` / `#00963c52` | `#22ff991e` / `#44ffaa4b` | green a3 / a6 |
| `warning` / `-hover` | `#f76b15` / `#ef5f00` | `#f76b15` / `#ff801f` | orange 9 / 10 |
| `warning-subtle` / `-border` | `#ff9c0029` / `#ff81007d` | `#fb6a0025` / `#fd75045c` | orange a3 / a6 |
| `code` | `#f9f9f9` | `#191919` | gray 2 |
| `scrollbar` / `-hover` | gray a6 / a8 | gray a6 / a8 | |
| `chart-1` / `-2` / `-3` / `-4` | `#0090ff` / `#ef5f00` / `#6e56cf` / `#30a46c` | `#0090ff` / `#f76b15` / `#6e56cf` / `#30a46c` | blue 9, orange 10 (9 dark), violet 9, green 9 |
| `chart-5` / `-6` / `-7` / `-8` | `#d6409f` / `#ab6400` / `#00a2c7` / `#8d8d8d` | `#d6409f` / `#ffc53d` / `#00a2c7` / `#6e6e6e` | pink 9, amber 11 (9 dark), cyan 9, gray 9 |
| `shell-border`, `image-outline` | unchanged | unchanged | |

Accent presets swap the eight `primary*` + `ring` roles on the same steps: green, orange, rose (crimson
scale) and violet; neutral uses the inverted solid (black a12 / a10 / a9 with white text, white a12 / a10 / a9
with black text in dark) and gray a3 / a4 / a6 / a8 for subtle, border and ring. White text on a step-9 solid
is below 4.5:1 for blue (3.3:1), green (3.2:1) and orange (2.9:1); that is the reference behaviour and was kept
on purpose (bold 13px labels on filled buttons).

## Radius

`--radius: 0.5rem`; `xs` 0.25x (2px), `sm` 0.5x (4), `md` 0.75x (6), `lg` 1x (8), `xl` 1.25x (10),
`2xl` 1.5x (12), `3xl` 2x (16), `shell` 1.5x (12). `2xs` is now an alias of
`xs`. Presets: none 0, sm 0.25rem, default 0.5rem, lg 0.6875rem, xl 0.875rem (2026-11-03; they were 0.375 / 0.625 / 0.875,
where S, M and L read alike and XL jumped: controls step 4, 4, 3, 3px and XL stops at 14px so a 32px control is not a pill).

**16px cap (theme 2.2, round 20).** Every token is `min(k × --radius, --radius-max)` with `--radius-max: 1rem`
(shipped in the theme's light vars, together with `radius-lg`, which the theme now overrides as well). The custom
slider on Customize stops at 1rem (it went to 1.5rem); stored values above it are read back as 1rem, both in
`radius-store.ts` and in the pre-paint script. Why: at a 20–24px base, controls are pills, containers reach 40–72px
and every literal inner token (rows `rounded-lg` in `rounded-2xl p-1` menus, composer parts in `rounded-3xl p-2`)
sits far off concentric. With the cap, from base 16px every container is 16px and `rounded-inner` children get
16 − inset; children with literal tokens are at worst pills (fine) or within the audit tolerance. `4xl`/`5xl`
were unused apart from the blog cover art and the theming table, so they stay as names at the cap rather than
being removed (installed code keeps compiling). Arbitrary radii that went past 3xl (card folder and bottom sheet
2.8x) use `min(…, var(--radius-max))`; 2x arbitrary values (message bubbles, chat, feedback widget, expanding
arrow button) became `rounded-3xl` / `frame-3xl`.

## Shadows

| Level | Tailwind | Light | Dark |
| --- | --- | --- | --- |
| `--shadow-border` | `shadow-xs` | 1px ring black 7% | 1px ring white 7% |
| `--shadow-default` | `shadow-sm` | 1px ring `border` (a4) + two tiny drops | 1px inset ring `border` (a4) |
| `--shadow-lg` | `shadow-md`, `shadow-lg` | 0.5px ring (color-mix toward gray 3) + three soft drops | 1px ring (mix toward gray 6) + three deep drops |
| `--shadow-xl` | `shadow-xl` | 0.5px ring 6% + 40px / 32px drops | inset hairline + the same drops |

Named elevation: `raised` = default, `surface` = lg, `chip` and `pressed` = border, `well` = inset 1px `input`.

## Fonts

Inter Variable (ss03) → Noto Sans SC Variable → system; JetBrains Mono Variable → system mono;
Newsreader Variable → Noto Serif SC Variable → system serif (reading preset only). Self-hosted from
`@fontsource-variable/*` via `app/fonts.css` (registry item `fonts`, hidden). Weights 400 / 450
(`font-semimedium`) / 500 / 600 / 700. Sizes unchanged: Inter at 13px is a little wider than the system UI
fonts; no control needed a size change.

## Component changes in this round

- Button: default hovers to `primary-hover`, presses to `primary-active`; destructive uses
  `destructive-foreground` and `destructive-hover`.
- Badge, IconChip: tinted tones use `*-subtle` + `inset-ring-*-border`. Alert: washes use `*-subtle`.
- Dialog, alert dialog, drawer, bottom sheet, morphing modal, command palette: `shadow-xl`.
- Menu, context menu, select and combobox popups: `rounded-xl` → `rounded-2xl` (12 − 4 = 8px rows).
- Containers that hold controls 8px in moved `rounded-2xl` → `rounded-3xl` (12 − 8 would be 4px): prompt bar,
  agent composer, animated sidebar panel, app shell frame, donut chart legend, tool result, tool approval,
  todo list, and the icon rail / tab strip / thread list / user menu / workspace switcher / model picker /
  icon chip demos. File diff card `rounded-xl` → `rounded-2xl`.
- Checkbox: sm 3px, default `rounded-sm` (4px), lg 5px (they would have dropped to 2px). Chart swatches
  `rounded-xs` → `rounded-sm`.
- The custom accent format in localStorage is now `{ v: 2, hex, light, dark }` with the eight roles; older
  saved custom accents are ignored (the page falls back to blue).

## Chart palette (round 18, 2026-10-16)

`chart-1…8` moved onto the same 12-step scales as the rest of the foundation (generator:
`CHARTS` in `/workspace/work/round16/gen/build_globals.py`, P3 values from the same scales).
Order: blue, orange, violet, green, pink, amber, cyan, gray. Step 9 everywhere, except in light
where step 9 is under 3:1 on white: orange uses 10 (3.3:1) and amber 11 (4.6:1). The order keeps
neighbouring series far apart (OKLab distance ≥ 12 between neighbours in both modes) and keeps the
first pair blue/orange, which survives red-green colour blindness; green and pink are not neighbours.
`chart-1` stays blue and does not follow the accent preset: charts read the same under every accent,
and a neutral or green accent would otherwise collide with gray or green series.
`chartColor()` cycles all eight (it used five) before blending. Legend and tooltip swatches are round dots
so they read the same at every radius preset; the heat-calendar "Less … More" scale keeps the
cell shape on purpose because it is a key to the cells.
