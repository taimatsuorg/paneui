# Third-party notices

## Synara (visual style reference)

The library's native desktop structure (the 13px UI type scale, translucent fills, the Codex
rail shell layout, control densities) is adapted from the design tokens and UI components of
Synara, https://github.com/Emanuele-web04/synara (`apps/web/src/index.css`,
`apps/web/src/components/ui/*`, `apps/web/src/lib/appTypography.ts`). Values were re-expressed
as this project's own tokens and Tailwind classes; no source files were copied verbatim. Since
2026-10-16 the radius scale and font-weight ramp use the foundation parameters below, while colour
tokens, surfaces and shadows follow the coss.com/ui reference.

MIT License

Copyright (c) 2026 T3 Tools Inc.
Copyright (c) 2026 Emanuele Di Pietro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Foundation reference (radius and type-weight parameters, since 2026-10-16)

The default foundation in `app/globals.css` (and the `theme-radius-*` registry items) keeps
two parameter scales derived from https://design.interfere.com (Radius and Fonts pages, read
2026-10-16): the `2–24px` radius scale and the `400/450/500/600/700` font-weight ramp. Colour
roles, surface tokens and shadows previously derived from that reference and Radix Colors have been
replaced by the `coss.com/ui` parameters below. The reference's commercial typefaces are not used:
this project substitutes the open-licence fonts listed below. No licence is published for the
reference site; this notice records provenance only.

## Fonts (Noto Sans, Noto Sans SC, JetBrains Mono, Newsreader, Noto Serif SC, Source Serif 4)

The theme's font stacks name these typefaces. The docs site and the `fonts` registry item
install them from npm as the Fontsource packages (`@fontsource-variable/noto-sans`,
`@fontsource-variable/noto-sans-sc`, `@fontsource-variable/jetbrains-mono`,
`@fontsource-variable/newsreader`, `@fontsource-variable/noto-serif-sc`,
`@fontsource-variable/source-serif-4`); the font files are not
vendored or modified. These fonts are licensed under the SIL Open Font License, Version 1.1
(https://openfontlicense.org); each package ships the full licence text in its `LICENSE` file.

- Noto Sans: Copyright 2022 The Noto Project Authors (https://github.com/notofonts/latin-greek-cyrillic)
- Noto Sans SC and Noto Serif SC: Copyright Google Inc. (https://github.com/notofonts/noto-cjk)
- JetBrains Mono: Copyright 2020 The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono)
- Newsreader: Copyright 2020 The Newsreader Project Authors (https://github.com/productiontype/Newsreader)

- Source Serif 4: the installed package ships its SIL Open Font License in `LICENSE`.

## @pierre/diffs (runtime dependency of `file-diff`)

`registry/base-nova/ui/file-diff.tsx` renders its rows with `@pierre/diffs`
(https://diffs.com), Copyright 2025 Pierre Computer Company,
licensed under the Apache License, Version 2.0 (https://www.apache.org/licenses/LICENSE-2.0).
It is installed from npm as a dependency and not vendored or modified; the package ships no
NOTICE file. Its full license text is in `node_modules/@pierre/diffs/LICENSE.md`.

## @paper-design/shaders and @paper-design/shaders-react (runtime dependencies of `shader-background`)

The `shader-background` item draws its animated backgrounds with `@paper-design/shaders-react`,
which builds on `@paper-design/shaders` (https://shaders.paper.design). `cover-art` loads
`shader-background` on demand for `renderer="shader"`; `og-image` does not use either package.
Both are installed from npm as dependencies and not vendored or modified. They are licensed
under the Apache License, Version 2.0 (https://www.apache.org/licenses/LICENSE-2.0); the full
license text is in each package's `LICENSE` file. Both packages ship this NOTICE file:

```
Paper Shaders
Copyright 2026 Paper

Powered by Paper Shaders:
https://shaders.paper.design
```

## Blobatar (generated avatars)

`registry/base-nova/ui/generated-avatar.tsx` (and the `avatar-generator` registry item) draws its
deterministic geometric avatars with `blobatar` (https://blobatar.dev,
https://github.com/Alain00/blobatar), installed from npm as a zero-dependency runtime package and
not vendored or modified. It is credited here and on the Avatar Generator docs page.

MIT License

Copyright (c) 2026 Alain

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## maily.to (feature reference for `email-editor`) and Tiptap (runtime dependency)

The block set of `email-editor` (logo, button variants, variables, image, alignment, divider,
spacer, footer, section, columns, repeat, show-if) follows the feature list of maily.to,
https://github.com/arikchakma/maily.to, MIT License, Copyright (c) Arik Chakma. No maily source
code was copied; the editor is written from scratch on this project's notion-editor base.

`notion-editor` and `email-editor` depend at runtime on Tiptap's open-source packages
(https://github.com/ueberdosis/tiptap, MIT License; no Tiptap Pro extensions), lowlight and
highlight.js (BSD-3-Clause), the unified / remark packages (MIT) and React Email
(`@react-email/components`, `@react-email/render`, MIT). They are npm dependencies, not vendored.

## shadcn/typeset (`app/typeset.css`, registry item `typeset`)

`app/typeset.css` is the typeset stylesheet from shadcn/ui, https://ui.shadcn.com/docs/typeset
(https://ui.shadcn.com/typeset.css), with the heading font defaulting to `inherit` and this
library's presets (`typeset-docs`, `typeset-reading`, `typeset-chat`) appended.

MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## xterm.js (runtime dependency of `terminal`)

`registry/base-nova/ui/terminal.tsx` draws the terminal with `@xterm/xterm`, `@xterm/addon-fit`
and `@xterm/addon-web-links` (https://github.com/xtermjs/xterm.js), installed from npm as
dependencies. The component inlines the package's base stylesheet (`css/xterm.css`, minified,
with the scrollbar shadow rules removed, the IME composition colours switched to theme tokens and
a thinner scrollbar slider) so it works without a CSS import. MIT License:

Copyright (c) 2017-2019, The xterm.js authors (https://github.com/xtermjs/xterm.js)
Copyright (c) 2014-2016, SourceLair Private Company (https://www.sourcelair.com)
Copyright (c) 2012-2013, Christopher Jeffrey (https://github.com/chjj/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## node-pty and ws (used by `terminal-server/pty-bridge.mjs`)

The PTY bridge shipped with `terminal` imports `ws` (https://github.com/websockets/ws, MIT;
Copyright (c) 2011 Einar Otto Stangvik, (c) 2013 Arnout Kazemier and contributors, (c) 2016 Luigi
Pinca and contributors) and a PTY binding that users install themselves: `node-pty`
(https://github.com/microsoft/node-pty, MIT; Copyright (c) 2012-2015 Christopher Jeffrey,
(c) 2016 Daniel Imms, (c) 2018-present Microsoft Corporation) or its prebuilt fork
`@homebridge/node-pty-prebuilt-multiarch` (MIT, same notices). Neither binding is a dependency of
this repository and no code from them is vendored.


## @monaco-editor/react and the editor it loads (used by the `vscode` template)

The `vscode` template depends on `@monaco-editor/react` (https://github.com/suren-atoyan/monaco-react,
MIT; Copyright (c) 2018 Suren Atoyan), which loads `monaco-editor` (https://github.com/microsoft/monaco-editor,
MIT; Copyright (c) 2016 - present Microsoft Corporation) from the jsDelivr CDN at runtime. No code from
either is vendored in this repository.

## SVGL and @ridemountainpig/svgl-react (brand logos)

`brand-icon`, its docs examples and the templates import brand logo React components from
`@ridemountainpig/svgl-react` (https://github.com/ridemountainpig/svgl-react), which packages SVGs
from the SVGL directory (https://svgl.app, https://github.com/pheralb/svgl). Only named imports are
used; SVG sources are not copied into this repository. Both projects are licensed under the MIT
License.

SVGL — MIT License

Copyright (c) 2022 Pablo Hdez

@ridemountainpig/svgl-react — MIT License

Copyright (c) 2025 Yen Cheng Lin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

**Trademarks.** The brand names and logos shown by `brand-icon`, its examples and the templates
(OpenAI, Anthropic, Claude, Google, Gemini, GitHub, GitLab, Vercel, Apple, Microsoft, AWS, Linear,
Atlassian, Notion, Figma, Slack, Discord, Sentry, Stripe and others) are trademarks of their
respective owners. The MIT licences cover the open-source libraries and SVG React bindings, not the
underlying trademarks: they grant no trademark rights and imply no endorsement or affiliation.
Follow each brand owner's guidelines when using a logo.

## make-interfaces-feel-better (interface-polish guidance for the design skill, since 2026-10-17)

Parts of `.agents/skills/paneui-design` (rules 33–40, `references/polish.md`, the polish checks in
`scripts/check.mjs`, `scripts/polish-probe.js` and `examples/`) restate interface-polish guidance from
the agent skill at https://github.com/jakubkrehel/make-interfaces-feel-better (commit 35545ea): icon-swap
values, image outlines, optical button padding, hit-area extension, exit and motion restraint, compositing
hints and the review report shape. The text, checks and examples were written for this library; where the
guidance conflicts with the library's rules (press scale, desktop target size, icon stroke and fill), the
library's rules apply. No files were copied verbatim.

MIT License

Copyright (c) 2026 Jakub Krehel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Traditional Chinese colour anchors

Paper uses seven named colour values from the GUSCSS / Traditional-Chinese-Colors
dataset by imoyao (https://github.com/imoyao/GUSCSS and
https://github.com/imoyao/Traditional-Chinese-Colors). Only colour names, pinyin
and hexadecimal values are retained in `tooling/fixtures/paper-anchors.json`;
no descriptions, artwork or implementation code are copied.

## Syntax highlighting

The default syntax highlighter uses `@pierre/highlights` 0.2.0 by Pierre, licensed
under Apache-2.0. Source and documentation: https://diffs.com/docs#highlights.
The package includes its licence and notices. No bundled theme artwork or palettes
are used; syntax scopes map to this project's theme tokens.

Shiki remains a fallback for unsupported languages, under the MIT licence:
https://github.com/shikijs/shiki/blob/main/LICENSE.

## coss.com/ui (`@coss/style`, default theme colour & elevation parameters)

The default theme in `packages/tokens/styles/globals.css` (and its `theme` and `theme-*` registry
items) adopts design parameters from the styling system of coss.com/ui (`@coss/style`,
https://coss.com/ui/docs/styling, repository https://github.com/cosscom/coss, component library
package https://github.com/cosscom/ui): the white / neutral-800 light palette and neutral-950/white
mixed dark surfaces, translucent black/white fills and borders, neutral-800/neutral-100 primary
polarity, Tailwind v4 red/emerald/amber/blue status and chart colour anchors, and crisp translucent
border + bottom-shadow layering. Values are re-expressed as concrete OKLCH tokens inside this
project's semantic schema with contrast adjustments for WCAG AA compliance across all styles and
accents; no stylesheet files were copied verbatim.

MIT License

Copyright (c) 2025 coss.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## beautiful-mermaid (Mermaid diagrams)

`registry/base-nova/ui/mermaid.tsx` (and the `mermaid` registry item) renders Mermaid diagrams
with `beautiful-mermaid` (https://github.com/lukilabs/beautiful-mermaid), installed from npm as a
runtime dependency alongside its transitive dependencies (`elkjs`, `entities`) and not vendored or
modified. The component loads the package on demand, strips external font `@import` directives,
scopes SVG `<style>` rules and `<defs>` marker ids per instance, and wraps the output in `Diagram`.
Its ASCII rendering engine is derived from `mermaid-ascii`
(https://github.com/AlexanderGrooff/mermaid-ascii) by Alexander Grooff. It is credited here and on
the Mermaid docs page.

MIT License

Copyright (c) 2026 Craft Docs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
