import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { plugin as shadcn } from "@shadcn/lint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// ───────────────────────────────────────────────────────────────────────────
// PaneUI design-system rules
//
// One consistent style across every coding agent working in this repo.
// Rule reference: https://github.com/shadcn-ui/lint/blob/main/docs/rules.md
// Contracts + messages: https://github.com/shadcn-ui/lint/blob/main/docs/design-systems.md
//
// Two audiences:
//   LIBRARY   – component authors (registry ui + blocks, icon set). Components
//               own their appearance, so no-restyle is off; motion/geometry may
//               need arbitrary values (warn only).
//   CONSUMERS – anything that *uses* the library (examples, templates, docs
//               site). Strict: tokens only, no restyling beyond layout and the
//               per-family contracts below.
// ───────────────────────────────────────────────────────────────────────────

const LIBRARY_FILES = [
  "packages/ui/src/components/**/*.{ts,tsx}",
  "packages/ui/src/blocks/**/*.{ts,tsx}",
  "packages/ui/src/icons/index.tsx",
  "packages/ui/src/icons/**/*.tsx",
];

const CONSUMER_FILES = [
  "apps/docs/registry/examples/**/*.{ts,tsx}",
  "apps/docs/registry/templates/**/*.{ts,tsx}",
  "apps/docs/app/**/*.{ts,tsx}",
  "apps/docs/components/docs/**/*.{ts,tsx}",
];

const THEME = "packages/tokens/styles/globals.css";
const TOKENS =
  "background, foreground, card, popover, primary, secondary, muted, muted-foreground, accent, destructive, success, warning, border, input, ring";

const messages = {
  rawColors:
    '"{{className}}" is not a theme color. Use a token from ' + THEME + " (" + TOKENS + "), " +
    "with an opacity modifier for washes (bg-success/12). {{suggestions}}",
  arbitrary:
    'Use {{suggestions|a theme token or scale value}} instead of "{{className}}". ' +
    "Colors, radii, text sizes, and shadows (shadow-raised, -raised-hover, -pressed, -primary, -well, -surface, -chip) live in " +
    THEME + ".",
  unknown:
    '"{{className}}" is not a class this project\'s Tailwind generates. {{suggestions}} ' +
    "Custom utilities and tokens are declared in " + THEME + ".",
};

const restyleMessage = {
  spacing:
    '"{{className}}": <{{component}}> owns its padding and gap. Use a size ({{sizes|none defined}}), or {{around|margin here or gap on the parent}}.',
  default:
    '"{{className}}": <{{component}}> owns its {{category}}. Use a variant ({{variants|none defined}}) from {{file}}, ' +
    "or style a plain wrapper element. Add a variant only if the design calls for it.",
};

// Every utility that only places an element (margins, flex/grid placement,
// position). Used where a contract narrows "layout" (e.g. Button).
const PLACEMENT = [
  "m", "mx", "my", "mt", "mr", "mb", "ml", "ms", "me",
  "self-*", "justify-self-*", "place-self-*", "order-*", "col-span-*", "col-start-*", "row-span-*",
  "shrink", "shrink-0", "grow", "flex-1", "flex-none",
  "hidden", "flex", "inline-flex",
  "absolute", "relative", "sticky", "top-*", "right-*", "bottom-*", "left-*", "inset-*", "z-*",
];

// Unstyled primitives with no surface of their own (scroll containers,
// motion wrappers, triggers): the caller supplies the frame with tokens.
const HEADLESS = [
  "SmoothScroll", "ScrollArea", "MessageScroller", "PullToRefresh", "ShaderBackground",
  "Collapsible", "ContextMenuTrigger", "SharedLayoutBg", "SharedLayoutBgItem",
  "TiltCard", "TiltCardLayer", "SidebarProvider", "SidebarInset", "SidebarHideCollapsed",
  "Magnetic", "ScrollReveal", "Parallax", "ParallaxLayer",
];

// Text-effect components: callers set the type size, weight, and token color.
const TEXT_COMPONENTS = [
  "TextReveal", "TextShimmer", "TextScramble", "TextCascade", "ChromaticTextReveal",
  "DigitSwap", "NumberTicker", "AnimatedNumber", "ReasoningText",
  // Action-swap label slots: the label's type (e.g. tabular-nums for a count).
  "ActionSwapText", "ActionSwapBlurText", "ActionSwapRollText", "ActionSwapCascadeText",
];

const re = (names) => "^(" + names.join("|") + ")$";

// ───────────────────────────────────────────────────────────────────────────
// Component-owned class props.
//
// @shadcn/lint reads every `*ClassName` attribute as the component's className,
// so documented slot hooks (accentClassName, labelClassName, backdropClassName,
// rowClassName = (ctx) => …) were reported as restyling the component, and
// function-valued ones as dynamic. A prop the component itself defines for a
// slot is the API working as intended, so no-restyle and require-static-classes
// skip classes written inside a `<lowercase>…ClassName` attribute. Plain
// `className` keeps its contracts, and no-raw-colors / no-arbitrary-values /
// no-unknown-classes still check slot props: tokens only.
// ───────────────────────────────────────────────────────────────────────────
const COMPONENT_CLASS_PROP = /^[a-z][A-Za-z0-9]*ClassName$/;

function inComponentClassProp(node) {
  for (let n = node; n; n = n.parent) {
    if (n.type === "JSXAttribute") {
      return n.name?.type === "JSXIdentifier" && COMPONENT_CLASS_PROP.test(n.name.name);
    }
    if (n.type === "JSXOpeningElement" || n.type === "JSXElement" || n.type === "Program") return false;
  }
  return false;
}

function allowComponentClassProps(rule) {
  return {
    ...rule,
    create(context) {
      const report = (descriptor) => {
        if (descriptor?.node && inComponentClassProp(descriptor.node)) return;
        context.report(descriptor);
      };
      return rule.create(Object.create(context, { report: { value: report } }));
    },
  };
}

// Same rule names (shadcn/*), so existing eslint-disable comments keep working.
const shadcnPlugin = {
  ...shadcn,
  rules: {
    ...shadcn.rules,
    "no-restyle": allowComponentClassProps(shadcn.rules["no-restyle"]),
    "require-static-classes": allowComponentClassProps(shadcn.rules["require-static-classes"]),
  },
};

const designSystemRules = [
  // Shared recognition + note for every shadcn rule.
  {
    files: ["**/*.{ts,tsx}"],
    settings: {
      next: { rootDir: fileURLToPath(new URL("./apps/docs/", import.meta.url)) },
      shadcn: {
        ui: ["@paneui/ui/components", "@paneui/ui/blocks"],
        componentImports: ["^@paneui/ui/icons$"],
        note: "See AGENTS.md for PaneUI design rules.",
      },
    },
  },

  // LIBRARY: component authors.
  {
    files: LIBRARY_FILES,
    rules: {
      "shadcn/no-raw-colors": ["error", { message: messages.rawColors }],
      "shadcn/no-unknown-classes": ["error", { message: messages.unknown }],
      "shadcn/require-static-classes": "error",
      // Motion, geometry, and skeuomorphic shadows often need exact values:
      // warn, so off-scale sizes/radii stay visible as token candidates.
      // Named transition lists and easing curves are the motion vocabulary.
      "shadcn/no-arbitrary-values": [
        "warn",
        {
          allow: ["transition", "ease", "will-change", "grid-cols", "grid-rows"],
          message: messages.arbitrary,
        },
      ],
      "shadcn/no-restyle": "off",
      // motion/react drives style props (x, scale, opacity, CSS vars).
      "shadcn/no-inline-styles": "off",
    },
  },

  // CONSUMERS: examples, templates, docs site.
  {
    files: CONSUMER_FILES,
    rules: {
      "shadcn/no-raw-colors": ["error", { message: messages.rawColors }],
      "shadcn/no-arbitrary-values": [
        "error",
        {
          // Structural values with no scale equivalent: named transition
          // property lists (never `transition-all`), grid templates, and the
          // sidebar width variable.
          allow: ["transition", "grid-cols", "grid-rows", "[--sidebar-width:*]"],
          message: messages.arbitrary,
        },
      ],
      "shadcn/no-unknown-classes": ["error", { message: messages.unknown }],
      "shadcn/require-static-classes": "error",
      "shadcn/no-inline-styles": "warn",
      "shadcn/no-restyle": [
        "error",
        {
          allow: ["layout"],
          message: restyleMessage,
          // Only the LAST matching contract applies: order general -> specific.
          contracts: [
            // Containers whose padding and gap belong to the page.
            {
              pattern: "^(Card|Tabs)$|(Header|Footer|Group|Section|List)$",
              allow: ["layout", "spacing"],
            },
            // Content regions: spacing plus the type and token color of their
            // content, and the scrollbar utilities from globals.css.
            {
              pattern: "(Content|Panel|Body)$",
              allow: [
                "layout", "spacing", "typography", "text-color",
                "scrollbar-thin", "scrollbar-hover", "scrollbar-none",
              ],
            },
            // Labels: gap to their control, and font-normal for option labels.
            { pattern: "Label$", allow: ["layout", "spacing", "font-normal"] },
            // Text parts: type scale and weight (not family), gap for an inline icon.
            {
              pattern: "(Title|Description)$",
              allow: ["layout", "typography", "gap-*"],
              deny: ["font-family"],
            },
            // Buttons: margins and full width only; size/shape/color come from props.
            {
              pattern: "Button$",
              allow: [
                ...PLACEMENT, "w-full", "w-auto", "min-w-0", "justify-*",
                // quiet ghost/secondary triggers (search fields, toolbar icons)
                "text-muted-foreground", "text-foreground",
              ],
              message: {
                ...restyleMessage,
                layout:
                  '"{{className}}": <{{component}}> takes margins and w-full/w-auto only. Height and padding come from its size prop; set other widths on the parent.',
              },
            },
            // Loader draws in currentColor: a token text colour is its tint.
            { pattern: "^Loader$", allow: ["layout", "text-color"] },
            // Icons from components/icons.tsx (IconChip is a component, not an icon).
            {
              pattern: "^(?!IconChip$).+Icon$",
              allow: ["layout", "size-*", "text-color", "opacity", "motion"],
              message:
                '"{{className}}": icons take size, layout, and a token text color only (16px text-muted-foreground in nav, text-foreground when active). ' +
                "Title/card icons go inside <IconChip>. See notes/icon-usage.md.",
            },
            { pattern: re(TEXT_COMPONENTS), allow: ["layout", "typography", "text-color"] },
            {
              pattern: re(HEADLESS),
              allow: ["layout", "spacing", "shape", "color", "effects", "typography", "motion"],
            },
          ],
        },
      ],
    },
  },
];


// ───────────────────────────────────────────────────────────────────────────
// paneui/concentric-radius
//
// Static half of the nested-radius rule (the runtime half is `pnpm audit:radius`).
// For a JSX element whose className literally sets a radius token and a padding
// (rounded-2xl p-2, or frame-2xl frame-p-2), every DIRECT JSX child that sets
// its own radius token must equal outer − padding (±2px), or use rounded-inner.
// Only unprefixed literal classes are read (cn("…") / template strings included,
// conditional branches too); anything computed is left to the runtime audit.
// ───────────────────────────────────────────────────────────────────────────
// Default-theme px (--radius 0.5rem); keep in step with skills/paneui-design/scripts/check.mjs.
const RADIUS_PX = { none: 0, xs: 2, "2xs": 2, sm: 4, md: 6, lg: 8, xl: 10, "2xl": 12, "3xl": 16, "4xl": 16, "5xl": 16, shell: 12 };
const SPACING_PX = (n) => (/^\d+(\.\d+)?$/.test(n) ? parseFloat(n) * 4 : null);

function classTokens(attr) {
  if (!attr || !attr.value) return [];
  const out = [];
  const visit = (n) => {
    if (!n || typeof n !== "object") return;
    if (n.type === "Literal" && typeof n.value === "string") out.push(...n.value.split(/\s+/));
    else if (n.type === "TemplateElement") out.push(...n.value.cooked.split(/\s+/));
    for (const k of Object.keys(n)) {
      if (k === "parent" || k === "loc" || k === "range") continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v.type === "string") visit(v);
    }
  };
  visit(attr.value);
  return out.filter(Boolean);
}

function readBox(opening) {
  const attr = opening.attributes.find(
    (a) => a.type === "JSXAttribute" && a.name && a.name.name === "className"
  );
  const tokens = classTokens(attr);
  let radius = null, pad = null, inner = false;
  for (const t of tokens) {
    if (t.includes(":")) continue; // variants (hover:, sm:, data-…) are state, not the resting shape
    let m;
    if ((m = t.match(/^(?:rounded|frame)-(none|xs|2xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|shell)$/))) radius = RADIUS_PX[m[1]];
    else if (t === "rounded-inner" || t.startsWith("rounded-inner-") || t === "frame-inner") inner = true;
    else if ((m = t.match(/^(?:p|frame-p)-([\d.]+)$/))) pad = SPACING_PX(m[1]); // not frame-inset: that inset is only for rounded-inner children
  }
  return { attr, radius, pad, inner };
}

const concentricRadius = {
  meta: {
    type: "suggestion",
    docs: { description: "Nested radii must be concentric: inner = outer − padding (AGENTS.md)." },
    schema: [],
  },
  create(context) {
    return {
      JSXElement(node) {
        const outer = readBox(node.openingElement);
        if (outer.radius == null || outer.pad == null || outer.pad === 0) return;
        const want = Math.max(outer.radius - outer.pad, 0);
        if (want < 4) return; // inset too large for concentric: children keep their own token
        for (const child of node.children) {
          if (child.type !== "JSXElement") continue;
          const box = readBox(child.openingElement);
          if (box.inner || box.radius == null) continue;
          if (Math.abs(box.radius - want) <= 2) continue;
          context.report({
            node: box.attr,
            message:
              `Radius ${box.radius}px inside a ${outer.radius}px container with ${outer.pad}px padding: ` +
              `concentric is ${want}px. Use rounded-inner with frame-* on the container ` +
              `(e.g. "frame-2xl frame-p-2" → "rounded-inner"). See AGENTS.md › Radius.`,
          });
        }
      },
    };
  },
};

const paneuiPlugin = { rules: { "concentric-radius": concentricRadius } };

const eslintConfig = [
  {
    // `next lint` ignored these implicitly; `eslint .` needs them spelled out.
    ignores: [
      "**/.next/**",
      "**/out/**",
      "**/public/**",
      "**/node_modules/**",
      "**/next-env.d.ts",
      // The desktop example: its own install and toolchain.
      "apps/desktop/**",
      "apps/native/dist/**",
      "apps/native/.expo/**",
      // Build output of the workspace packages.
      "packages/*/dist/**",
      // Vendored agent skills (installed via skills-lock.json), not our code.
      ".agents/**",
      ".claude/**",
      "agent/**",
      // The design skill's good/bad snippets, written against a consumer project's paths.
      "skills/*/examples/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // @shadcn/lint: register the plugin. eslint-config-next already sets up
    // the TypeScript/JSX parser for these files, so no parser override here.
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    settings: { next: { rootDir: fileURLToPath(new URL("./apps/docs/", import.meta.url)) } },
    plugins: { shadcn: shadcnPlugin, paneui: paneuiPlugin },
  },
  ...designSystemRules,
  {
    files: ["apps/native/**/*.{ts,tsx}", "packages/ui-native/**/*.{ts,tsx}"],
    // Native browser links load a separate application, outside the docs router.
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
  {
    files: [...LIBRARY_FILES, ...CONSUMER_FILES],
    rules: { "paneui/concentric-radius": "warn" },
  },
  {
    // The docs site's own utilities live in apps/docs/styles/globals.css, outside the theme the rule reads.
    files: ["apps/docs/components/**/*.{ts,tsx}"],
    rules: { "shadcn/no-unknown-classes": ["error", { message: messages.unknown, allow: ["tile", "tile-label", "signal-lamp"] }] },
  },
  {
    // The share card is rendered to SVG at build time, never served as a page image.
    files: ["packages/ui/src/components/og-image.tsx"],
    rules: { "@next/next/no-img-element": "off" },
  },
];

export default eslintConfig;
