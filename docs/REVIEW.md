# Review

Every row below traces to a settled decision (`D-###` in [`DECISIONS.md`](DECISIONS.md)) or a recorded incident (`P-###` in [`POSTMORTEMS.md`](POSTMORTEMS.md)). Answer each applicable row with what you ran or inspected (or note why not applicable).

## Every change

| Check | Source |
| --- | --- |
| Default design, icon, and copy rules apply without external conflicting skills (`pnpm design:check` reports 0 errors). | `← D-001, D-003` |
| No raw palette/hex colours, restyled consumer components, `rounded-4xl`/`5xl`, or radii above `1rem`. | `← D-003` |
| Third-party names or provenance phrases (`inspired by`, `port of`, etc.) appear only in `THIRD_PARTY_NOTICES.md`. | `← D-004` |
| Theme CSS (`globals.css`, `theme-accents.css`) and `colors.generated.ts` are regenerated via `pnpm tokens:gen` (Node `.mjs` generators, zero `.py`) and pass `pnpm tokens:contrast`. | `← D-002, D-012` |
| Default `--radius` stays fixed at `0.875rem` (`xl`) with `--radius-max: 1rem` and no `data-radius`, `data-style="paper"`, or `@property` rules that break idempotent CLI merges. | `← P-001, P-003, D-012` |
| Nested surfaces use `frame-*` + `rounded-inner` (re-check with `pnpm audit:radius` if padding/radii changed) and never combine `frame-inner` + `rounded-inner` on the same element. | `← D-003, P-004` |
| Registry items point at workspace sources, rewrite imports/targets cleanly (`pnpm registry:build`), and pass `pnpm registry:test` (including dynamic `--font-*` upgrade-check tests). | `← D-005, P-002` |
| `packages/core` stays free of DOM/Native imports (`pnpm design:test`), and `/native/` stays isolated from the Web SPA build (`pnpm test:pages`). | `← D-006` |
| Docs changes use library chrome components, run `pnpm docs:gen` / `pnpm build`, and exit 0 on `pnpm docs:md:audit`. | `← D-007` |
| Brand marks use named `@ridemountainpig/svgl-react` imports via `BrandIcon`; house icons use the single rounded 24×24 set (or sanitized SVG via `apps/icons-worker`); title/card icons sit inside `IconChip`. | `← D-008, D-009, D-011` |
| Interactive controls account for active/dragged bounds (fills, shadows, focus rings) and leave overlay/margin wrappers non-blocking (`pointer-events-none`). | `← P-005` |
| Change targets `dev` (or `hotfix/*` on `main`), uses scoped Conventional Commits, and updated touched module docs alongside code. | `← D-010` |

## By kind

- **Fix** — Reproduce on the affected surface, fix sibling components/examples sharing the pattern, and add a regression check or test.
- **Feature** — Exercise empty, loading, error, light/dark, and RTL states; add docs content, examples, and registry entry; verify both Web and Native boundaries where shared.
- **Refactor** — Keep public `/r/<name>.json` names, exports, and runtime behaviour unchanged; verify with build + tests.
- **Docs** — Run `pnpm docs:gen`, `pnpm build`, and `pnpm docs:md:audit`; verify all touched links resolve on disk.
- **Dependency** — Document why existing packages cannot serve it, check licence, pin semver range, and record attribution in `THIRD_PARTY_NOTICES.md`.
- **Release** — Bump `packages/cli/package.json`, pass `pnpm cli:test`, tag `cli-vX.Y.Z` so `.github/workflows/release-cli.yml` publishes via OIDC.

## Refuse, or stop the merge, when

- A decision in [`DECISIONS.md`](DECISIONS.md) is reversed without owner approval.
- A generated file (`index.generated.ts`, `examples.generated.tsx`, `public/r/`, `colors.generated.ts`, token CSS blocks) is left stale or out of sync.
- `pnpm design:check`, `pnpm design:test`, `pnpm registry:test`, `pnpm cli:test`, or `pnpm docs:md:audit` fails on touched scope.
- A claim cites a test or command that was not executed after the final edit.

## UI and visual changes

Inspect rendered output in both light and dark modes (`pnpm dev` or `pnpm build` preview), check the default `xl` radius (`0.875rem`, capped at `1rem`) and accent presets, and run `pnpm audit:radius` against a fresh static export whenever nested padding or radii change.
