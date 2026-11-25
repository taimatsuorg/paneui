# Repository tooling

Generators, contrast verification, browser audits, and tests under `tooling/scripts/` plus share-card rendering under `tooling/og/` (see `tooling/og/README.md`).

## Scripts

| Script | Invoked via | Purpose |
| --- | --- | --- |
| `gen-theme.mjs`, `gen-native-tokens.mjs`, `theme-roles.mjs`, `theme-color.mjs` | `pnpm tokens:gen` | Generate CSS themes (`globals.css`, `theme-accents.css`), `accent-presets.generated.ts`, and `packages/tokens/src/colors.generated.ts` |
| `theme-contrast.mjs` | `pnpm tokens:contrast` | Verify 4.5:1 text and 3:1 control contrast across all accents and modes |
| `gen-og-tokens.mjs`, `registry-postbuild.mjs` | `pnpm registry:build` | Rewrite built registry JSON dependency URLs, strip repo lint suppressions, write `llms.txt` |
| `gen-docs.mjs` | `pnpm docs:gen` | Generate `apps/docs/content/docs/index.generated.ts` and `examples.generated.tsx` |
| `gen-docs-md.mjs`, `audit-docs-md.mjs` | `pnpm build`, `pnpm docs:md:audit` | Emit `apps/docs/out/docs/*.md` and check formatting, glued words, empty links, and table columns |
| `gen-template-code.mjs` | `pnpm templates:code` | Pre-highlight code snippets in `apps/docs/registry/templates/*/parts/code.ts` |
| `audit-radius.mjs`, `audit-radius.config.mjs` | `pnpm audit:radius` | Headless browser audit of nested radii on `apps/docs/out/` |
| `build-pages.mjs`, `pages-output.mjs`, `pages-output.test.mjs` | `pnpm build:cloudflare`, `pnpm test:pages` | Merge Native `/native/` export into `apps/docs/out/` |
| `test-locales.tsx`, `test-default-labels.tsx`, `highlight.test.mjs` | `pnpm test:locales`, `pnpm test:labels`, `pnpm test:highlight` | Regression tests for i18n controls, default ARIA labels, and syntax highlighting |
| `native-*.mjs`, `icon-sheet.tsx`, `template-shots.mjs` | Direct `node` / `tsx` | Native API extraction/smoke QA, icon comparison sheet (`--compare`), and template captures |

## Nested-radius audit

`pnpm audit:radius` loads the served static export (`apps/docs/out/`, default `BASE_URL=http://localhost:3123`), measures every rounded element against its enclosing rounded container, and repeats after opening menus, selects, comboboxes, popovers, and pickers.

- Flags: `--dark`, `--radius <none|sm|lg|xl|custom:1>`, `--pages a,b`, `--all`, `--url <u1,u2>`, `--strict`, `--out <dir>` (default `node_modules/.cache/radius-audit`).
- Concentric-radius rules (`frame-*`, `rounded-inner*`, `1rem` cap) live in [`.agents/skills/paneui-design/references/foundations.md`](../.agents/skills/paneui-design/references/foundations.md), and static same-file lint (`paneui/concentric-radius`) lives in [`eslint.config.mjs`](../eslint.config.mjs). Allow-listed exceptions and their reasons live inline in [`scripts/audit-radius.config.mjs`](scripts/audit-radius.config.mjs).
