/*
 * Rule → example data for /docs/skill, with no React in it: the page frontmatter
 * (src/pages/docs/skill.astro) imports this to highlight each rule's code at build time.
 * The live Recommended / Avoid previews stay in skill-examples.tsx, which re-exports this data.
 */

/** A rule's Recommended / Avoid pair held as source text, highlighted later. */
export type SkillCodeExample = { lang: string; good: string; bad: string }

/**
 * Rules whose Recommended / Avoid pair is the one the skill ships in
 * .agents/skills/paneui-design/examples/<dir>/{good,bad}.tsx (shown as code; the design check's
 * --self-test keeps them honest).
 */
export const SKILL_EXAMPLE_FILES: Record<string, string> = {
  "native-colors": "native-colors",
  "native-touch-target": "native-touch-target",
  "native-font-scaling": "native-font-scaling",
  "native-accessibility": "native-accessibility",
  "native-radius": "native-radius",
  "platform-boundary": "platform-boundary",

  "give-every-target-24px-to-land-on": "hit-area",
  "trim-the-icon-side-of-a-button": "optical-icon-padding",
  "outline-images-with-a-neutral-hairline": "media-outline",
  "cross-fade-icon-swaps": "icon-swap",
  "transition-states-keyframe-one-offs": "keyframes-on-state",
  "leave-quieter-than-you-arrive": "exit-subtle",
  "recolour-icons-with-css-keep-their-stroke-and-grid": "icon-color",
  "name-every-icon-only-button": "icon-button-label",
  "match-the-icon-stroke-to-the-text-weight": "icon-weight",
  "fill-the-active-glyph-where-there-s-no-row-fill": "nav-active-icon",
  "align-text-to-the-reading-direction": "text-align-logical",
}

/**
 * Rules shown as short code. These deliberately break the rules in `bad`, so the design
 * check allow-lists this file (see paneui-design.config.json).
 */
export const SKILL_CODE: Record<string, SkillCodeExample> = {
  "derive-every-radius-from-the-base-radius": {
    lang: "tsx",
    good: `<div className="rounded-xl" />
<div className="rounded-[calc(var(--radius)*0.75)]" />
<div className="rounded-[min(calc(var(--radius)*2.8),var(--radius-max))]" />`,
    bad: `<div className="rounded-[10px]" />
<div style={{ borderRadius: 6 }} />
<div className="rounded-[calc(var(--radius)*2.8)]" />  // passes the cap`,
  },
  "compose-the-library-don-t-restyle-it": {
    lang: "tsx",
    good: `<Button variant="outline" size="sm">Export</Button>
<Button className="w-full">Continue</Button>   // layout only`,
    bad: `<Button className="h-10 rounded-full px-6 font-bold shadow-lg">
  Export
</Button>`,
  },
  "keep-a-menu-label-inside-its-group": {
    lang: "tsx",
    good: `<MenuContent>
  <MenuGroup>
    <MenuLabel>Agent</MenuLabel>
    <MenuItem>Code reviewer</MenuItem>
    <MenuItem>Release notes</MenuItem>
  </MenuGroup>
</MenuContent>`,
    bad: `<MenuContent>
  <MenuLabel>Agent</MenuLabel>
  <MenuItem>Code reviewer</MenuItem>
  <MenuItem>Release notes</MenuItem>
</MenuContent>`,
  },
  "transition-named-properties-briefly": {
    lang: "tsx",
    good: `<div className="transition-[box-shadow,background-color] duration-150 ease-out hover:bg-secondary" />
<Panel className="transition-[opacity,translate] duration-300" />`,
    bad: `<div className="transition-all duration-500 hover:bg-secondary" />`,
  },
  "gate-movement-on-reduced-motion": {
    lang: "tsx",
    good: `const reduce = useReducedMotion()
<motion.div
  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(4px)" }}
  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
/>`,
    bad: `<motion.div initial={{ opacity: 0, y: 40, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} />`,
  },
  "name-template-parts-apart-from-registry-items": {
    lang: "text",
    good: `components/blog/parts/author-avatar.tsx
components/vscode/parts/buffers.ts`,
    bad: `components/blog/parts/avatar.tsx     # same name as @paneui/avatar
components/vscode/parts/docs.ts       # same name as @paneui/docs`,
  },
  "run-the-upgrade-check-after-a-theme-update": {
    lang: "bash",
    good: `npx shadcn@latest add @paneui/theme --overwrite
npx shadcn@latest add @paneui/upgrade-check
node scripts/paneui-upgrade-check.mjs --fix`,
    bad: `npx shadcn@latest add @paneui/theme --overwrite
# removed tokens stay in globals.css`,
  },
}

/** Slug of a rule title, the key into SKILL_CODE and SKILL_EXAMPLE_FILES. */
export function ruleSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
