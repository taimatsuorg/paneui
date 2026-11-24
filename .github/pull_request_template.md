## Summary

<!-- What changed and why. Link the issue if there is one. -->

## Screenshots

<!-- For UI changes: light and dark mode, desktop and mobile. -->

## Checklist

- [ ] Workspace `typecheck` passes (`@paneui/docs` has 19 pre-existing `next`/`next/og` template errors; see `docs/CONTRIBUTING.md`)
- [ ] `pnpm exec eslint <changed-files>` passes without errors or new warnings
- [ ] `pnpm design:check` passes
- [ ] `pnpm registry:build` run when registry items or icons changed
- [ ] Docs content and examples added for new components, and `pnpm docs:gen && pnpm build && pnpm docs:md:audit` run
- [ ] Commit messages follow Conventional Commits (see `docs/CONTRIBUTING.md`)
