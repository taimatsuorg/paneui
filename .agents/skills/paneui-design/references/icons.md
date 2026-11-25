# Icons and brand marks

All glyphs come from the house set (`@paneui/icons`, installed as `components/icons.tsx`), never another
icon package or an ad-hoc SVG. Drawing new glyphs is the `paneui-icons` skill
(`npx skills add taimatsuorg/paneui --skill paneui-icons`); it covers the 24×24 grid, primitives, and
preview script.

## Style

One rounded outline style (24×24 grid, 1.75px round strokes, soft corners), checked at 14px and 16px.

## Families

- Navigation uses the nav glyphs: `InboxIcon` not `MailIcon`, `CalendarDaysIcon` not `CalendarIcon`,
  `TerminalSquareIcon` not `TerminalIcon`.
- **Filled pairs**: `HomeFilledIcon`, `InboxFilledIcon`, `ChatFilledIcon`, `CalendarDaysFilledIcon`,
  `BellFilledIcon`, `UserFilledIcon`, `SettingsFilledIcon`, `FolderFilledIcon`, for the active item of a
  nav without a row fill (`TabBarItem activeIcon`). A row fill already marks the active item in sidebars
  and rails, so they keep the outline glyph. Add a pair when a new glyph goes in a tab bar.

## Stroke tiers

Line strokes have a regular and a bold tier (1.2x). The `<svg>` sets the width as
`calc(<style stroke> * var(--icon-stroke-scale, 1))`, so `icon-bold` on an ancestor or `weight="bold"` on
the icon switches every line in the glyph at once. Use bold beside semibold or bold text (titles, Badge,
section labels), regular beside regular and medium text. Never set `strokeWidth` on an instance.

## Sizes and colour

| Context | Size | Colour | Frame |
| --- | --- | --- | --- |
| Nav item, rail, command palette | 16px | `text-muted-foreground`, active `text-foreground` | bare |
| Inline in a button, badge or meta row | the control sets it | inherits | bare |
| Card, header, notification or alert icon | the chip sets it | chip tone | `IconChip` |
| Brand mark in a header | 22px | `text-foreground` | bare |

`IconChip` sizes `sm` 24 / `default` 32 / `lg` 40 / `xl` 48; tones neutral, primary, success, warning,
destructive, solid. One size per list. Chips are squircles, never circles (circles are avatars and status
dots). On an icon, `className` takes size, layout, a token colour, opacity and motion only, never a
stroke width or an off-grid pixel size. Inline icons align with the first line of text. Icons beside a
Button label take `data-icon="inline-start"` / `"inline-end"`; glyphs that point along the reading
direction take `rtl:-scale-x-100` (`polish.md` › Icons).

## Brand marks

Other products' logos (sign-in providers, integrations, agents, languages) use
`<BrandIcon icon={Figma} />` or `<BrandIcon icon={{ light: GitHubLight, dark: GitHubDark }} />`
from `@paneui/brand-icon`, with named imports from `@ridemountainpig/svgl-react` (never
`import *` or a lookup by slug). The default `color="brand"` shows native brand colours where the
logo is the content (a list of apps); pass `color="current"` in toolbars, buttons and nav. Use
`{ light, dark }` pairs when SVGL provides light and dark components, or pass a local React SVG
component for a product's own mark. Any other brand the set leaves out gets a neutral icon from
`@paneui/icons`, never a hand-drawn third-party logo. Models in a picker show their vendor's mark.

## Not icons

Progress rings, chart geometry and sparklines, illustration artwork and animated checkmarks stay
hand-drawn SVG inside their components.
