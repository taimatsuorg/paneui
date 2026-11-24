# PaneUI — start here
<!-- repo-governance: v3 -->

React component registry (`@paneui/*`), Astro documentation site, Native showcase, and `@taimatsu/paneui` CLI in a pnpm workspace. Agents write, review, and verify here; design rules live in [`.agents/skills/paneui-design/SKILL.md`](.agents/skills/paneui-design/SKILL.md) (read before any UI change), and the owner guards the decisions below.

## Align before you work

Open with three lines: what the user gets, the smallest change that delivers it, and what will show it worked.

- Anything a run can answer, answer by running it; only product and preference calls go to the user.
- Name choices that belong to the user with your default beside each.
- Reversible, inside one module: restate, then go.
- Irreversible, public, cross-module, releasing, or new surface: restate and wait.

## The smallest complete change

Take the first option that works: does it need to exist → is it already here → does the platform give it → is it an installed dependency → one line → the minimum. Never cut validation at trust boundaries, accessibility, contrast gates, or error handling that prevents data loss. Non-trivial fixes leave one targeted test or checker rule. A known limit gets `shortcut: <limit>, <when to upgrade>`. End reports with anything skipped and the risk.

## Modules

Each module owns its docs and index; this table only points to them (two hops to source).

| Module | What it owns | Docs |
| --- | --- | --- |
| `apps/docs` | Astro docs site, studio component pages, examples, templates, `/docs/*.md` | [`apps/docs/README.md`](apps/docs/README.md) |
| `apps/native` | Independent React Native showcase (`/native/`) | [`apps/native/README.md`](apps/native/README.md) |
| `apps/desktop` | Electron shell wrapping the `vscode` template (separate install) | [`apps/desktop/README.md`](apps/desktop/README.md) |
| `packages/ui` | Web components, blocks, rounded/emoji icons, utilities | [`packages/ui/README.md`](packages/ui/README.md) |
| `packages/ui-native` | React Native UI components | [`packages/ui-native/README.md`](packages/ui-native/README.md) |
| `packages/tokens` | Generated CSS themes (`globals.css`, Paper, Studio) and Native colour roles | [`packages/tokens/README.md`](packages/tokens/README.md) |
| `packages/core` | Platform-independent types and state (zero DOM/Native imports) | [`packages/core/README.md`](packages/core/README.md) |
| `packages/registry` | `registry.json` manifest, import rewriting, `@paneui/upgrade-check` | [`packages/registry/README.md`](packages/registry/README.md) |
| `packages/cli` | `@taimatsu/paneui` npm CLI (`init`, `add`, `update`, `theme`) | [`packages/cli/README.md`](packages/cli/README.md) |
| `tooling` | Theme/docs/registry generators, contrast & radius probes, OG renderer | [`tooling/README.md`](tooling/README.md) |
| `.agents/skills` | Default skills (`paneui-design`, `paneui-icons`, `copy-density`) + shadcn skills | [`.agents/skills/paneui-design/SKILL.md`](.agents/skills/paneui-design/SKILL.md) |

## Commands

| What | Command |
| --- | --- |
| Install | `pnpm install` (desktop shell separately: `pnpm --dir apps/desktop install`) |
| Design check & self-test | `pnpm design:check && pnpm design:test` |
| Tests & contrast | `pnpm registry:test && pnpm cli:test && pnpm test:locales && pnpm test:labels && pnpm test:pages && pnpm test:highlight && pnpm tokens:contrast` |
| Typecheck | `pnpm typecheck` (`@paneui/docs` has 19 pre-existing `next`/`next/og` template errors; see [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md)) |
| Lint | `pnpm exec eslint <changed-files>` (repo-wide `pnpm lint` fails on pre-existing `.astro/*` and `icons/*`) |
| Generate | `pnpm tokens:gen`, `pnpm docs:gen`, `pnpm registry:build` |
| Build & Markdown audit | `pnpm build && pnpm docs:md:audit` (`pnpm build:cloudflare` merges `/native/`) |

## Documents

| When | Read |
| --- | --- |
| Starting a change | [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) — branches (`dev`), commits, verification |
| Before merging | [`docs/REVIEW.md`](docs/REVIEW.md) — checkable review criteria |
| Settled choices | [`docs/DECISIONS.md`](docs/DECISIONS.md) — append-only, never reverse without owner |
| Past failures | [`docs/POSTMORTEMS.md`](docs/POSTMORTEMS.md) — search by module or symptom |
| Third-party attribution | [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) — sole place third-party provenance appears |

## Needs the owner

- `.github/workflows/*`, `packages/cli/package.json` releases (`cli-v*` tags), direct `main` changes, and `THIRD_PARTY_NOTICES.md` licence removals.
- Anything under "Stop and ask" in [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).
