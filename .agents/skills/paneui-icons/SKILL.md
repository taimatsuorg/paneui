---
name: paneui-icons
description: Draw and update icons for PaneUI in the rounded or emoji style.
---

# PaneUI icons

The PaneUI icon set (`@paneui/icons`, installed as `components/icons.tsx`) is a single file of
React components. This skill lets you draw new icons that sit in the same family, add them to that
file, and use them the way the library does.

Install the set first if the project doesn't have it:

```bash
npx shadcn@latest add https://paneui.dev/r/icons.json
```

Which icons to use where (sizes, chips, brand marks) is part of the `paneui-design` skill
(`references/icons.md`); this skill is for drawing them.

## Which style is installed

The set ships in two styles with identical export names, both installed as `components/icons.tsx`:

```bash
npx shadcn@latest add https://paneui.dev/r/icons.json --overwrite        # rounded (default)
npx shadcn@latest add https://paneui.dev/r/icons-emoji.json --overwrite  # emoji
```

Check the top of the file before drawing:

- **Rounded**: one-colour outlines, primitives `line`, `fillShape`, `dot`, `solid`. Follow "Drawing in the rounded style".
- **Emoji**: a `PALETTE` of gradient tones, an `Icon` wrapper that takes `tones`, and a `Glyph` wrapper. Follow "Drawing in the emoji style".

Always draw in the style the project has installed, so a new icon matches its neighbours.

## Drawing in the rounded style

```tsx
// Icon wrapper: viewBox="0 0 24 24", fill="none", stroke width 1.75 on the <svg> (scaled by the weight tier).
const line = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const; // 1.75 from the <svg>
const fillShape = { fill: "currentColor", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", fillRule: "evenodd" } as const; // filled pairs
const dot = { fill: "currentColor", stroke: "none" } as const;   // small dots only
const solid = { fill: "currentColor", stroke: "none" } as const; // brand marks only
```

- 24x24 grid, centre 12,12. Glyphs are large: artwork spans about 2 to 22 (a full circle is r=10,
  a card is 19x17 or 20x16). Thin glyphs (chevrons, check, plus) span about 12 to 16.
- Every shape is `line`. `dot` only for tiny filled dots (r 1.1 to 1.4: info dot, ellipsis, bullets).
- Very rounded: rect `rx` 4 to 5 on cards and windows (3 on small parts), corners on paths eased with
  arcs of radius 2 or more. Only arrowheads and chevrons keep a point, softened by the round join.
- Keep parallel strokes at least 2.25 apart and at most about three details inside a shape, so the
  icon reads at 16px. Circles sit a little smaller than squares (r=10 next to a 19 to 20 square).
- **Filled pairs** (`<Name>FilledIcon`, the active state of a tab bar): the same outer edge as the
  outline glyph, drawn with `fillShape` (filled and stroked, so the silhouette matches). Inner details
  become `fillRule="evenodd"` holes in the same path, drawn 0.875 larger per side because the stroke
  runs along the hole too (a dot r 1.0 is a hole of r 1.875). Parts that stay open (calendar rings, a
  bell's clapper) keep `line`. A door or slot that meets the edge is cut into the outline path itself
  (Home: the bottom edge runs up and around the door). In the emoji file the pair is an alias of the
  plain drawing (`export const HomeFilledIcon = HomeIcon`).

```tsx
export const MailIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect {...line} x="2" y="4" width="20" height="16" rx="4.5" />
    <path {...line} d="M6 8.5l4.3 3.1a3 3 0 0 0 3.4 0L18 8.5" />
  </Icon>
);

export const InfoIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle {...line} cx="12" cy="12" r="10" />
    <path {...line} d="M12 16.5v-5" />
    <circle {...dot} cx="12" cy="8" r="1.1" />
  </Icon>
);
```

## Drawing in the emoji style

Full-colour glossy objects in the spirit of system emoji. The top of the file defines:

```tsx
const PALETTE = { red: ["#ff8a80", "#e5322d"], gold: ["#ffe27a", "#f5a913"], /* … */ } as const; // [top, bottom]
function Icon({ tones, children, ...p }) // children: (c) => …; c.f(tone) = gradient fill, c.s(tone) = gradient for strokes
function Glyph({ children, ...p })       // plain 24x24 svg for UI glyphs
const shine = { fill: "#fff", opacity: 0.55 } as const;               // highlight on the main body
const rim = (color: string, w = 0.6) => ({ stroke: color, strokeWidth: w, … })  // edge for white objects only
const glyph = (paint: string, w = 3.2) => ({ fill: "none", stroke: paint, … })  // thick round stroke
const line = { …, stroke: "currentColor", strokeWidth: 2.25 } as const; // Glyph strokes
const dot = { fill: "currentColor", stroke: "none" } as const;
```

- **Objects** (folder, bell, user, calendar…): 24x24, artwork about 2–22. One gradient tone per part,
  a darker tone or plain hex for back and inside parts, one `shine` ellipse or thin white highlight
  stroke on the main body. At most three or four details, so it reads at 16px.
- List every tone the icon calls in `tones`. Use `c.f()` for filled shapes and `c.s()` for strokes
  (a straight line has a zero-height box, so a bounding-box gradient would vanish).
- Readable on light and dark backgrounds: white objects get a `rim`, dark objects get a lighter face.
- Colour carries meaning: success green, danger red, warning gold or orange, info blue.
- **UI glyphs** (arrows, chevrons, plus, x, text tools, layout icons) use `Glyph` with the rounded
  geometry and `line`, so they follow the text colour inside buttons. Check is the one green glyph.
- No filters, masks, clip paths or text.

```tsx
export const HeartIcon = (p: IconProps) => (
  <Icon {...p} tones={["red"]}>
    {(c) => (
      <>
        <path d="M12 20.6 C6 16.6 2.4 13.2 2.4 8.9 A4.9 4.9 0 0 1 12 6.6 A4.9 4.9 0 0 1 21.6 8.9 C21.6 13.2 18 16.6 12 20.6 Z" fill={c.f("red")} />
        <ellipse cx="7.3" cy="8.6" rx="2.1" ry="1.3" {...shine} />
      </>
    )}
  </Icon>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M6 9l6 6 6-6" />
  </Glyph>
);
```

## Using icons

- Navigation prefers the app-section names: `InboxIcon` rather than `MailIcon`, `CalendarDaysIcon`
  rather than `CalendarIcon`, `TerminalSquareIcon` rather than `TerminalIcon`.
- **Nav, sidebar, palette**: 16px, `text-muted-foreground`, active or selected `text-foreground`, no
  frame.
- **Inline** (buttons, badges, meta rows): no size of its own; the button or text sets it.
- **Title, header, card, alert icons** sit in an `IconChip` (`npx shadcn@latest add
  https://paneui.dev/r/icon-chip.json`): sizes `sm` 24, `default` 32, `lg` 40, `xl` 48;
  tones `neutral`, `primary`, `success`, `warning`, `destructive`, `solid`. One size per list.
- On an icon, `className` sets size, layout, a token text colour, opacity and motion only.
- Import every icon from `@/components/icons`. Don't mix in another icon library or ad-hoc SVG next
  to these; draw the missing glyph instead.

## Workflow

1. **Check it doesn't exist.** List the exports and look for the name and its synonyms:
   `grep -o "export const [A-Za-z]*Icon" components/icons.tsx`.
2. **Check the installed style** (see Which style is installed) and draw in it.
3. **Sketch on the 24x24 grid** around the centre (12, 12), starting from the closest existing icon.
4. **Add the export** after the existing icons. Use the conventional icon name (the one people search
   icon sets by). Don't change the primitives or other icons.
5. **Render and look at it** next to three or four existing icons at 48px, 18px and 14px. This skill
   ships `scripts/preview.tsx`, which renders a contact sheet of any exports you filter for:

   ```bash
   npx esbuild <this skill>/scripts/preview.tsx --bundle --platform=node --jsx=automatic \
     --alias:icons=./components/icons.tsx --external:@resvg/resvg-js --outfile=.icon-preview.cjs
   node .icon-preview.cjs icon-preview.png heart,bell,settings,yournew        # dark background
   node .icon-preview.cjs icon-preview-light.png heart,bell,yournew --light   # light background
   rm .icon-preview.cjs
   ```

   If you only downloaded `SKILL.md`, save the script next to it as `scripts/preview.tsx` from
   https://paneui.dev/skills/paneui-icons/scripts/preview.tsx.

   Run it from the project root (it needs the project's `react` and `react-dom`). PNG output needs
   `@resvg/resvg-js` (`npm i -D @resvg/resvg-js`); without it the sheet is written as SVG.
6. **Check the sheet** and fix what fails, then render again:
   - Padding and optical size match the neighbours (nothing visibly bigger or smaller, nothing clipped).
   - Weight matches the neighbours; holes and gaps stay open at 14px.
   - Optically centred (a heavy top or a pointed side may need a 0.2–0.4px shift).
   - Emoji style: check both backgrounds.
7. **Typecheck** (`npx tsc --noEmit`) and use the icon.

If you ever re-install or switch the set with shadcn (`--overwrite`), it overwrites `components/icons.tsx`. Keep your
own glyphs in a separate section at the end of the file (for example `/* My icons */`) so they're
easy to copy back.
