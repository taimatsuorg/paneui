# Web UI

Single source of Web components, blocks, icons, and browser utilities (`src/`).
Applications import explicit subpaths such as `@paneui/ui/components/button` or `@paneui/ui/blocks/<name>/<file>`.
Components never import application code.

## Authoring

- **Components (`src/components/*.tsx`, `src/blocks/<name>/`)**: export named parts with `data-slot`, define variants with `cva`, and forward `className` through `cn`. Add every new entry to `packages/ui/package.json` `exports`.
- **Lint boundary**: library files own their styling; consumer demos and templates use theme tokens and `variant`/`size` props only (`className` on library components is restricted to layout contracts). Keep `src/lib/utils.ts` (`@paneui/utils`) updated with any new `text-ui*` typography utilities for `tailwind-merge`.
- **Lint exceptions**: fix code first; when unavoidable, add one single-line `// eslint-disable-next-line shadcn/<rule> -- <reason>` (with reason).
- **Icons (`src/icons/index.tsx`, `src/icons/emoji/icons.tsx`)**: both rounded and emoji styles expose identical icon exports and `IconProps`. Add every new icon to both files and compare at 14px with `tooling/scripts/icon-sheet.tsx --compare`.
- **Brand logos (`src/components/brand-icon.tsx`)**: wrap named exports (or `{ light, dark }` pairs) imported directly from `@ridemountainpig/svgl-react`; never use namespace imports (`import *`).

Theme styles belong to `@paneui/tokens`; platform-independent state belongs to `@paneui/core`; Native components live in `@paneui/ui-native`; registry manifests live in `packages/registry/registry.json` ([Registry docs](../registry/README.md)).
