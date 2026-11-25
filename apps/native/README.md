# Native showcase

Documentation in the browser and a component catalogue on iOS and Android. Both render
`@paneui/ui-native` directly and shares design values with `@paneui/tokens`.

From the repository root (Node.js 22.23.2 and the pinned pnpm version):

```bash
pnpm install
pnpm native
pnpm native:web
pnpm native:build
```

Use a device client compatible with the app's SDK, or a development build.
Native iOS and Android builds require their platform toolchains; the Web export
can be built on Linux. The browser preview verifies shared rendering but does
not replace device testing of touch, safe areas, keyboard and accessibility.

The default deployment uses one Cloudflare Pages project for both catalogues.
Run `pnpm build:cloudflare` at the repository root and publish `apps/docs/out`.
The build sets `NATIVE_BASE_PATH=/native` only for the Native export and copies
its output into `apps/docs/out/native/`. Visit `/native/` on the same domain;
Web docs and the registry keep their existing root paths.

`pnpm native:build` without that environment variable still exports a standalone
site at the domain root. `pnpm native:web` is the independent development server.
The default device configuration does not use the browser deployment prefix.
Use the combined build for verifying navigation between both browser applications.

Add Native components in `packages/ui-native/src` and examples in `docs/examples`.
Register pages and examples in `docs/registry.ts` and include each page slug in
`docs/routes.json`. The browser export writes an HTML document for every route,
so direct links work without a fallback. See `docs/README.md` for the authoring flow.

The browser shell has English and Chinese documentation and saves language and
theme preferences locally. Preview and Code share the same example modules.
The device catalogue uses those modules without importing the browser shell.
