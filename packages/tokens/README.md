# Design values

Owns generated Web theme stylesheets (`styles/`) and portable TypeScript colour values (`src/`).

## Generators

Run `pnpm tokens:gen` from the repository root after editing generator sources:

- `tooling/scripts/gen-theme.py`: writes the default colour token blocks and accent presets in `styles/globals.css`, `styles/theme-accents.css`, docs accent metadata, and theme registry entries.
- `tooling/scripts/gen-paper.py`: writes the opt-in Paper stylesheet `styles/theme-paper.css`.
- `tooling/scripts/gen-studio.py`: writes `styles/theme-studio.css`.
- `tooling/scripts/gen-native-tokens.mjs`: writes `src/colors.generated.ts` (portable light/dark sRGB roles with alpha for `@paneui/ui-native`).

Do not edit generated CSS token blocks or `src/colors.generated.ts` by hand. Verify every style, accent preset, and mode passes contrast targets with `pnpm tokens:contrast`. Self-hosted fonts live in `styles/fonts.css`.

## Paper style

Switches the theme with `data-style="paper"` on `<html>` (or a subtree) without altering default tokens when absent. Paper sets `--font-heading` (`Source Serif 4` / `Noto Serif SC` on titles) and `--radius-control: 2rem` (clamped at `--radius-max: 1rem`), and Native `ThemeProvider` accepts `style="paper"` via `src/colors.generated.ts`.

| Colour | Pinyin | Anchor | Token |
| --- | --- | --- | --- |
| 霜色 | shuāng sè | #E9F1F6 | `background`, `card` |
| 玄青 | xuán qīng | #3D3B4F | `foreground`, `neutral` |
| 靛青 | diàn qīng | #177CB0 | `primary`, `blue` |
| 松花绿 | sōng huā lǜ | #057748 | `green`, `success` |
| 琥珀 | hǔ pò | #CA6924 | `orange`, `warning` |
| 胭脂 | yān zhī | #9D2933 | `rose`, `destructive` |
| 黛紫 | dài zǐ | #574266 | `violet` |

Colour anchors live in [`tooling/fixtures/paper-anchors.json`](../../tooling/fixtures/paper-anchors.json). Contrast roles are derived by `tooling/scripts/theme_roles.py` and checked by `node tooling/scripts/paper-contrast.mjs` and `pnpm tokens:contrast`.
