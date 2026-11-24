# Core utilities

Platform-independent types, sizing helpers, and shared UI logic in `src/`.

## Rules

- Keep every module free of DOM globals (`window`, `document`), React DOM packages, React Native APIs, and application imports.
- Check boundary compliance with `pnpm design:check` (`platform-boundary`) and `pnpm --filter @paneui/core typecheck`.
- Current exports live in `src/control-size.ts`.
