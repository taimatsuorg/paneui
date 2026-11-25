---
name: paneui-icons
description: Draw and update icons for PaneUI in the rounded style.
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
  (Home: the bottom edge runs up and around the door).

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
2. **Sketch on the 24x24 grid** around the centre (12, 12), starting from the closest existing icon.
3. **Add the export** after the existing icons. Use the conventional icon name (the one people search
   icon sets by). Don't change the primitives or other icons.
4. **Render and look at it** next to three or four existing icons at 48px, 18px and 14px. This skill
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
5. **Check the sheet** and fix what fails, then render again:
   - Padding and optical size match the neighbours (nothing visibly bigger or smaller, nothing clipped).
   - Weight matches the neighbours; holes and gaps stay open at 14px.
   - Optically centred (a heavy top or a pointed side may need a 0.2–0.4px shift).
6. **Typecheck** (`npx tsc --noEmit`) and use the icon.

If you ever re-install the set with shadcn (`--overwrite`), it overwrites `components/icons.tsx`. Keep your
own glyphs in a separate section at the end of the file (for example `/* My icons */`) so they're
easy to copy back.
