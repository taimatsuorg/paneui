# Postmortems

Recorded incidents, root mechanisms, and the tests or review checks that prevent recurrence. Search by module or symptom.

## P-001 — Keep `@supports` blocks at top level in theme stylesheets

- **What happened**: Commit `cbd05ae` (`fix(theme): keep scroll-fade @supports at top level so theme merges are idempotent`, 2026-11-06) fixed non-idempotent stylesheet merges when consumers reinstalled `@paneui/theme`.
- **Cause**: Nested `@supports` rules inside another block prevented the registry stylesheet merge helper from deduplicating them cleanly across repeated installs.
- **Layer**: `code` (`packages/tokens/styles/globals.css`, `packages/registry/registry.json`).
- **Fix**: Moved scroll-fade `@supports` rules to top level in `globals.css` and rebuilt the `theme` registry item (`cbd05ae`).
- **Review**: [The opt-in style and theme stylesheet row](REVIEW.md#every-change) (`Opt-in style blocks and theme CSS follow generator rules`).
- **Tags**: `tokens, registry, css, theme-merge`

## P-002 — Derive upgrade-check font warnings dynamically from `--font-*` stacks

- **What happened**: Commit `7c57410` (`fix(upgrade-check): name the fonts the detected stack lists`, 2026-11-06) fixed stale hardcoded font checks in `@paneui/upgrade-check`.
- **Cause**: `upgrade-check.mjs` checked against a hardcoded font list (`Inter`), so theme migrations to `@fontsource-variable/noto-sans` / `jetbrains-mono` / `newsreader` produced inaccurate warnings.
- **Layer**: `code` (`packages/registry/files/scripts/upgrade-check.mjs`).
- **Fix**: Updated `upgrade-check.mjs` to parse active `--font-*` stacks dynamically, flag retired faces separately, and locked the behaviour with `packages/registry/test/upgrade-check.test.mjs` (`7c57410`).
- **Review**: [The registry portability and upgrade-check row](REVIEW.md#every-change) (`Registry build and portability tests match workspace source`).
- **Tags**: `registry, fonts, upgrade-check`

## P-003 — Never override default `--radius` in opt-in styles when `[data-radius]` is unset

- **What happened**: Commit `d8965ff` (`fix(studio): radius presets stay in order (M was larger than L)`, 2026-11-03) fixed inverted radius presets under Studio style.
- **Cause**: `theme-studio.css` overrode `--radius: 0.75rem` whenever `data-radius` was absent (which represents default preset `M`), making `M` (`12px` pill) larger than `L` (`10px`).
- **Layer**: `code` (`tooling/scripts/gen-studio.py`, `packages/tokens/styles/theme-studio.css`).
- **Fix**: Removed the un-scoped `--radius` override in `gen-studio.py` so opt-in styles inherit the active preset cleanly (`d8965ff`).
- **Review**: [The opt-in style and theme stylesheet row](REVIEW.md#every-change) (`Opt-in style blocks and theme CSS follow generator rules`).
- **Tags**: `tokens, studio, radius`

## P-004 — Never combine `frame-inner` and `rounded-inner` on the same element

- **What happened**: Multi-select chips rendered 2px too square at every radius preset during the 16px cap rollout (2026-10-16 radius audit, round 20).
- **Cause**: Placing both `frame-inner` and `rounded-inner` on the same element caused it to read its own newly published `--frame-inner-2` instead of its parent frame's inner radius.
- **Layer**: `code` (`packages/ui/src/components/multi-select.tsx`, documented in `.agents/skills/paneui-design/SKILL.md`).
- **Fix**: Removed `rounded-inner` from the chip (leaving `frame-inner` alone to consume the parent radius and publish for its own inner button).
- **Review**: [The concentric nesting row](REVIEW.md#every-change) (`Concentric nesting omits double-application`).
- **Tags**: `ui, radius, frame-inner`

## P-005 — Size track fills from active dragged thumb bounds and ignore overlay margins

- **What happened**: Commit `ebab2be` (`fix(reasoning-effort,slider): wrap dragged thumb fill and remove slider effort demo`, 2026-11-23) fixed clipped active fills/shadows and blocked pointer hits on `ReasoningEffort`.
- **Cause**: Track fill width used resting thumb width instead of the widened dragged thumb's right edge (`thumbLeftAt + thumbWidth + INSET`), and negative-margined tab labels intercepted track pointer events.
- **Layer**: `code` (`packages/ui/src/components/reasoning-effort.tsx`).
- **Fix**: Computed active fill width and tick states from widened drag thumb geometry and set `pointer-events-none` on root with `pointer-events-auto touch-none` on the track (`ebab2be`).
- **Review**: [The interactive geometry and pointer bounds row](REVIEW.md#every-change) (`Interactive controls account for active/dragged geometry and non-blocking overlays`).
- **Tags**: `ui, reasoning-effort, pointer-events, slider`

## Why the layer matters

The layer picks the fix: `process` → a review row or branch gate; `code` → the fix plus a test at the lowest failing layer; `permissions` → path or branch ownership rules; `docs` → explicit link to the failure mode.

## Keeping it short

- A failure mode already enforced by an automated test keeps one short entry pointing to that test file.
- Entries not seen for 90 days and covered by automated checks move to Archived below.

## Archived

None yet.
