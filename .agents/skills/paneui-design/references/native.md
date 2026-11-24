# Native implementation

Read this for Native component source and its device or browser showcase.
Numbered rules 1–12, 14, 16, 23–30 and 33–43 describe shared intent; their CSS
examples are Web mechanisms. Use the Native mechanisms below. Web-specific menu,
DOM, pseudo-element and registry instructions apply only where those features exist.

## Tokens and surfaces

Read semantic colours from the shared token package, through the Native theme provider.
Use portable sRGB values with alpha preserved. No literal palette colours in component
styles; `transparent` is allowed. Recheck contrast when compositing translucent colours.
Use the shared spacing and radius scales. Radius stays at or below 16px; round avatars
and circular controls use the circle treatment supplied by their component.
Use platform-supported elevation recipes rather than copying CSS shadow strings.

ThemeProvider accepts `style="paper"` as an opt-in. Read `radius`, `controlRadius`,
`headingFont` and `shadows` from `useTheme` for style-aware surfaces. Paper values are
generated from the shared stylesheet. Controls use the capped control radius; inner
segments subtract the well padding. Titles use the heading face, while body text stays
on the UI face. Devices fall back to a system serif; pass a registered `headingFont`
after loading a bundled font. The default style retains the existing values.

## Density and text

Native controls have a 44px minimum touch target, with 48px as the default. Use 52px for
a large control. The xs and sm sizes both keep the 44px minimum. A smaller visible glyph can sit inside that target. Hit slop is an
explicit exception: verify the effective bounds and ensure adjacent targets do not overlap.
Use 16px field and label text, 14px supporting text and 12px captions. Headings use the
shared Native type scale. Medium controls, semibold titles, normal body text.
Allow system font scaling. Do not set `allowFontScaling={false}` to keep a layout compact.
Test the largest supported text setting; labels can wrap and controls can grow.

## Interaction and accessibility

Answer presses with a fill change, without routine scale animations. Expose roles and
accessible names on interactive primitives. Icon-only controls require a spoken label.
Label every field, retain visible errors and descriptions, and expose disabled or selected
state. Wrappers must forward accessibility props rather than erase caller state.
Maintain a visible keyboard focus indicator where hardware keyboards are supported.
Check platform screen-reader announcements and focus order on devices.

Use platform safe-area insets. Scroll fields above the keyboard and keep actions reachable
with the keyboard open. Use logical start/end spacing and test right-to-left text.
Read reduced-motion settings for movement and keep an opacity or state cue available.
Keep gestures and native navigation outside shared core. Browser-only adapters use `.web`
files so device bundles cannot import DOM globals or browser packages.

## Automated coverage and limits

The checker reports `native-colors` (rule 1), `native-touch-target` (13 and 33),
`native-font-scaling` (9 and 12), `native-accessibility` (26 and 40),
`native-radius` (7 and 8), and `platform-boundary` (the shared ownership contract).
It checks statically visible values and primitive props, including local style objects.
It does not resolve arbitrary imported styles, prove names forwarded through spreads,
measure effective touch bounds, or certify device screen-reader behaviour.

The Native good/bad fixtures under `examples/native-*/` are executable checker examples.
Run `scripts/check.mjs --self-test` to verify them with the TypeScript parser.

## Device review

After browser preview and platform bundle export, check at least the target device sizes,
light and dark themes, enlarged system text, keyboard-open forms, safe areas, touch and
hardware-keyboard focus. Test screen-reader naming, order and disabled state. State which
platforms were actually exercised; a browser preview or a successful bundle is not a device run.
