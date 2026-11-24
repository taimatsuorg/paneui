# Web implementation

Read this for Web components, documentation pages and the desktop browser renderer.
The existing numbered rules use Web examples and the topic references contain exact values.

## Apply Web mechanisms to Web code

Use semantic CSS variables, the Web type scale, component variants and desktop density.
Use the existing focus, elevation, icon and motion recipes. Native touch heights and
Native accessibility prop names do not replace DOM semantics or browser focus management.

Library components own their visuals. Consumers compose variants and layout. In a
workspace, import source through package exports; distributed registry source must
use installable aliases rather than private workspace imports.

## Verify browser behaviour

Check light and dark themes, keyboard focus, pointer and touch input, reduced motion,
zoom and narrow layouts. Use the radius and polish probes on rendered Web elements.
Verify menu focus return, dialog naming and keyboard navigation with overlays open.
Automated class checks do not replace screen-reader or rendered contrast checks.

For a page that links to a separately exported application, use a normal document
link so its own runtime loads. Scope any fallback routing to that application's
mount path; preserve real asset failures and the main site's 404 behaviour.
