# Design values

Owns generated Web theme stylesheets (`styles/`) and portable TypeScript colour values (`src/`).

## Generators

Run `pnpm tokens:gen` from the repository root after editing generator sources:

- `tooling/scripts/gen-theme.mjs` (using `theme-roles.mjs` and `theme-color.mjs`): writes the default colour token blocks and accent presets in `styles/globals.css`, `styles/theme-accents.css`, docs accent metadata, `accent-picker.tsx`, and theme registry entries.
- `tooling/scripts/gen-native-tokens.mjs`: writes `src/colors.generated.ts` (portable light/dark sRGB roles with alpha for `@paneui/ui-native`).

Do not edit generated CSS token blocks or `src/colors.generated.ts` by hand. Verify every accent preset and mode passes contrast targets with `pnpm tokens:contrast`. Self-hosted fonts live in `styles/fonts.css`.

## Radius scale

The base `--radius` is fixed at `0.875rem` (`xl`), with derived tokens clamped at `--radius-max: 1rem` (`16px`) on Web and `16px` (`radius["2xl"]`/`"3xl"`) on Native.
