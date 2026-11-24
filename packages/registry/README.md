# Registry package

Publishes `@paneui/*` source items from the single workspace implementation without duplicating files.

## Contents

| Path | Purpose |
| --- | --- |
| `registry.json` | Canonical manifest of items, dependencies, files, and metadata |
| `src/source.mjs` | Rewrites workspace imports (`@paneui/ui/*`, `@paneui/core/*`) and source paths (`packages/ui/src/*`, `.agents/skills/*`) into install targets |
| `files/scripts/upgrade-check.mjs` | Consumer script installed as `@paneui/upgrade-check` |
| `test/` | Portability and upgrade-check `node:test` suites |

## Adding a registry item

1. Implement the item in `packages/ui/src/components/<name>.tsx` (or `blocks/<name>/`) with explicit subpath export in `packages/ui/package.json`.
2. Add `<name>-demo.tsx` under `apps/docs/registry/examples/` and register it in `apps/docs/components/docs/demos.tsx`.
3. Add the item entry to `registry.json` (`name`, `type`, `title`, one-sentence description ≤ 12 words, `dependencies`, `registryDependencies`, `files`, and `meta.category`).
4. Add docs metadata at `apps/docs/content/docs/<name>.ts` and examples in `apps/docs/registry/examples/<name>/`.
5. Run `pnpm docs:gen && pnpm registry:build && pnpm registry:test` (writes `apps/docs/public/r/` and `apps/docs/public/llms.txt`).
