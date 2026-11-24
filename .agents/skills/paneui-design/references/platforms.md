# Shared design and platform boundaries

Read this for shared tokens, core modules and changes spanning both renderers.

## Share design intent

Semantic colour roles, the 4px spacing grid, the 8px base radius capped at 16px,
font weight hierarchy and wording apply to both platforms. Each renderer consumes
its token representation: CSS for Web, portable numeric and sRGB data for Native.
Regenerate platform outputs from the same design source; do not maintain a second palette.
Shared values do not require identical control heights, text sizes or shadows.

## Keep dependencies pointed toward shared source

- `core` holds platform-independent types, state and algorithms. It may depend on
  React, but not browser, device, server or application modules.
- Web UI can depend on core and tokens. Native UI can depend on core and tokens.
  Neither UI implementation imports the other implementation or an application.
- Application shells own routing, safe areas, host services and persistence adapters.
  Browser adapters belong in explicit `.web` modules; device adapters stay outside core.

The checker takes `platforms.shared` globs to identify core source and
`platforms.native` globs to identify Native files without direct primitive imports.
Native primitive imports are also detected automatically. Platform files can be reviewed
individually without treating unrelated Web code as Native.

## Keep contracts useful

Share semantic variants, value models and controlled-state conventions where they
mean the same thing. Preserve platform event and accessibility types. A desktop
menu may become a sheet on a phone; this does not require a shared view implementation.
DOM focus, CSS shadows, pointer coordinates, native gestures and device storage
stay in the renderer or adapter that owns them.

## Separate source ownership from deployment

Web and Native have independent examples and runtime bundles. They may be published
under one origin at `/` and `/native/` as long as both exports use the correct asset
prefix and navigation crosses applications through normal document links.
Do not mount a second React runtime into the first application's component tree.
