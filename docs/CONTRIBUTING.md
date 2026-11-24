# Contributing to PaneUI

Follow [`AGENTS.md`](../AGENTS.md) and [`.agents/skills/paneui-design/SKILL.md`](../.agents/skills/paneui-design/SKILL.md) before starting any UI change. See [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) for community guidelines and [`SECURITY.md`](SECURITY.md) for reporting vulnerabilities.

## Setup

```bash
pnpm install      # installs docs, registry tooling, and packages/*
pnpm dev          # local docs server (keep a single instance running)
```

`apps/desktop` is a separate workspace with its own lockfile (`pnpm --dir apps/desktop install`).

## Before the first edit

1. Find the module's docs from the table in [`../AGENTS.md`](../AGENTS.md).
2. Reproduce the reported issue or locate the failing rule before changing code.
3. State what will change and how you will verify it.

## Which branch

| Change | Branch | Base |
| --- | --- | --- |
| Fix | `fix/<slug>` | `dev` |
| Feature | `feat/<slug>` | `dev` |
| Refactor | `refactor/<slug>` | `dev` |
| Docs, chore, tests | `<type>/<slug>` | `dev` |
| Hotfix | `hotfix/<slug>` | `main` (merge into `main` and `dev`) |
| Release | `dev` → `main` PR; CLI tag `cli-vX.Y.Z` | `main` |

One branch, one kind. Do not commit or push directly to `main`; merge only from `dev` or `hotfix/*` through a pull request. Delete merged work branches; keep `main` and `dev`.

## Develop

1. Reproduce the failure or add a targeted test (`packages/*/test/*.test.mjs`, `tooling/scripts/*.test.*`).
2. Make the smallest complete change and check sibling callers/platforms (Web, Native, registry, docs).
3. Regenerate derived files whenever you change their inputs:
   - `pnpm tokens:gen && pnpm tokens:contrast` after theme generator changes.
   - `pnpm docs:gen` after adding, renaming, or editing docs pages or examples.
   - `pnpm templates:code` after editing template code samples.
   - `pnpm registry:build && pnpm registry:test` after changing registry items, components, or icons.
4. Run verification from the repository root:
   - Passing suite: `pnpm design:check`, `pnpm design:test`, `pnpm registry:test`, `pnpm cli:test`, `pnpm test:locales`, `pnpm test:labels`, `pnpm test:pages`, `pnpm test:highlight`, `pnpm tokens:contrast`.
   - Workspace packages typecheck: `pnpm --filter @paneui/core typecheck`, `pnpm --filter @paneui/tokens typecheck`, `pnpm --filter @paneui/ui typecheck`, `pnpm --filter @paneui/ui-native typecheck`, `pnpm --filter @paneui/native-showcase typecheck`, `pnpm cli:build`.
   - Full site build & audit: `pnpm build && pnpm docs:md:audit` (and `pnpm audit:radius` when changing nested radii or padding).
   - Known baseline reds (pre-existing on `dev`):
     - `pnpm lint` fails on untouched `apps/docs/.astro/*` and `packages/ui/src/icons/*`; run `pnpm exec eslint <changed-files>` and expect 0 errors on touched files.
     - `pnpm typecheck` exits 2 on `@paneui/docs` due to 19 pre-existing `TS2307` errors (`next`/`next/og` template files under `apps/docs/registry/templates/{next-og,saas}`); expect 0 errors in non-template files. `pnpm exec tsc --noEmit -p .` at the root fails with pre-existing `error TS2688: Cannot find type definition file for 'astro/client'`.

## Commit

Enforced on pull requests by `.github/workflows/commitlint.yml` (`commitlint.config.mjs`):

```
<type>(<scope>): <subject>
```

- Required non-empty `(<scope>)`: component/item name (e.g. `brand-icon`, `reasoning-effort`) or `site|cli|registry|docs|ci|theme`.
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Subject in imperative mood without a trailing period.

Body: what changed and why; exact commands run (and their head/scope); anything not run.

## Pull request

- Title matches Conventional Commits (`<type>(<scope>): <subject>`); one change kind per PR into `dev`.
- Commit regenerated artifacts (`apps/docs/content/docs/index.generated.ts`, `apps/docs/components/docs/examples.generated.tsx`, `apps/docs/public/r/`, `packages/tokens/src/colors.generated.ts`) in the same PR.
- Include light/dark before/after captures or probe output for visual changes.

## Release

`@taimatsu/paneui` is the only published npm package. Bump `version` in [`packages/cli/package.json`](../packages/cli/package.json), pass `pnpm cli:test`, and push a matching tag:

```bash
git tag cli-vX.Y.Z
git push origin cli-vX.Y.Z
```

`.github/workflows/release-cli.yml` verifies the tag, runs the CLI tests, and publishes via npm trusted publishing (OIDC). The docs site deploys from `main` via Cloudflare Pages Git integration.

## Stop and ask

Before: reversing a decision in [`DECISIONS.md`](DECISIONS.md); changing `.github/workflows/*`, release scripts (`packages/cli/package.json` version/publish config), or `THIRD_PARTY_NOTICES.md` licence removals; changing the branch/release model above; deleting or moving an existing top-level/governance document; publishing `@taimatsu/paneui` (`cli-v*` tags) or making a public claim.
