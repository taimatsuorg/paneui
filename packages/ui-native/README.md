# Native UI

React Native component implementations in `src/*.tsx` sharing semantic colour roles and numeric scales from `@paneui/tokens`.

## Rules and checks

- Follow platform rules in `.agents/skills/paneui-design/references/native.md` and `.agents/skills/paneui-design/references/platforms.md` (touch targets ≥ 44px, system font scaling, semantic token colours, `16px` radius cap, accessible roles and labels).
- Regenerate shared colour roles with `pnpm tokens:gen` (`packages/tokens/src/colors.generated.ts`) rather than editing generated colour values directly.
- Verify with `pnpm design:check`, `pnpm design:test`, `pnpm --filter @paneui/ui-native typecheck`, and `pnpm --filter @paneui/native-showcase typecheck`. See [Native showcase](../../apps/native/README.md) for catalogue authoring.
