/**
 * Config for scripts/audit-radius.mjs.
 *
 * actions: interactions run after the resting audit on a page, each followed by a re-measure.
 *   { page: "<docs name>", selector, type: "hover" | "click" | "contextmenu", nth?, wait?,
 *     thenHover?, thenHoverNth? }
 *   `selector` is a Playwright selector; only visible matches count (`nth` picks among them).
 *   Clicks are closed with Escape afterwards. `thenHover` hovers a row inside what the click
 *   opened (a menu item) and measures again. Keep the list small: one per surface that only
 *   shows a rounded child on interaction.
 *
 * allow: intentional findings to drop from the report. Every field is optional and all given
 *   fields must match: { page, scope (example id | "main-demo" | "site" | "portal" | "gallery"),
 *   slot, ancestorSlot, selector (substring of the reported selector), control (true for buttons,
 *   inputs, tabs, icon chips, badges, kbd), minInset (every flagged corner is inset ≥ this many px),
 *   level ("must" | "should"), reason }.
 *   Always give a reason; see notes/radius-audit.md for the triage behind each entry.
 */
const MAIN = "main [role='tabpanel']"

export default {
  actions: [
    { page: "menu", selector: `${MAIN} [aria-haspopup='menu']`, type: "click", thenHover: "[role='menuitem']" },
    { page: "context-menu", selector: `${MAIN} [data-slot='context-menu-trigger']`, type: "contextmenu", thenHover: "[role='menuitem']" },
    { page: "select", selector: `${MAIN} [data-slot='select-trigger']`, type: "click", thenHover: "[role='option']", thenHoverNth: 1 },
    { page: "select-morph", selector: `${MAIN} [data-slot='morph-select-trigger']`, type: "click", wait: 700, thenHover: "[role='option']", thenHoverNth: 1 },
    { page: "combobox", selector: `${MAIN} [data-slot='combobox-input']`, type: "click", thenHover: "[role='option']", thenHoverNth: 1 },
    { page: "multi-select", selector: `${MAIN} [data-slot='multi-select-input']`, type: "click", thenHover: "[role='option']", thenHoverNth: 1 },
    { page: "popover", selector: `${MAIN} [aria-haspopup='dialog']`, type: "click" },
    { page: "popover-morph", selector: `${MAIN} [data-slot='morph-popover-trigger']`, type: "click", wait: 700 },
    { page: "color-picker", selector: `${MAIN} [data-slot='color-picker-trigger']`, type: "click", wait: 600 },
    { page: "date-range-picker", selector: `${MAIN} [data-slot='date-range-picker-trigger']`, type: "click", wait: 600 },
  ],
  allow: [
    {
      ancestorSlot: "skill-avoid",
      reason: "The Avoid example for the concentric rule on /docs/skill is off concentric on purpose.",
    },
    {
      page: "calendar",
      selector: "div[role=\"gridcell\"]",
      level: "should",
      reason:
        "Range endpoints: the day button stays fully round over the range strip, whose cell is square on the side that continues the range.",
    },
    {
      slot: "terminal-viewport",
      reason:
        "The emulator's own scroll layers are square; the demo card (and the gallery tile) clips them with overflow-hidden, so no corner paints outside the frame.",
    },
    {
      control: true,
      minInset: 9,
      level: "should",
      reason:
        "Self-contained controls (buttons, icon chips, inputs) placed 9–15px in keep their own token radius; " +
        "concentric is enforced for surfaces (rows, panels, media) and for any inset ≤ 8px.",
    },
    {
      page: "email-editor",
      selector: "span.react-renderer.node-variable",
      reason:
        "A variable chip is an inline token in running text: its distance from the block corner comes from the line box " +
        "and wrapping (13px across, 2px down), not from a padded inset, so it keeps its own token.",
    },
    {
      slot: "citation-favicon",
      selector: "img",
      reason: "A square favicon (3px corners) shown inside a round badge: the round frame is the shape, the glyph keeps its own.",
    },
    {
      slot: "project-folder",
      reason: "Decorative folder illustration: tab/flap shapes and paper sheets are drawn shapes, not nested surfaces.",
    },
    {
      page: "components",
      selector: "a.flex.min-w-0 > span.flex.size-7",
      level: "should",
      reason:
        "Gallery card open button: a control chip on the control radius inside the card's footer link, which paints no fill " +
        "(only a focus ring), so the link's square top corners never show next to it.",
    },
    {
      slot: "segmented-control",
      minInset: 9,
      level: "should",
      reason: "A segmented control is a self-contained control: 9–15px in, it keeps its own token like buttons do.",
    },
    {
      slot: "swatch-picker-item",
      selector: "span.absolute.h-px",
      reason: "The diagonal strike of the \"none\" swatch is a 1px line drawn across a round dot, not a nested surface.",
    },
    {
      page: "file-diff",
      scope: "accept-reject",
      selector: "diffs-container",
      reason:
        "Accept / reject buttons belong to an inline annotation row inside the scrolling diff body: they only meet the " +
        "card's bottom corner at the end of the scroll, and the row scrolls past it, so there is no fixed inset to match.",
    },
    {
      page: "todo-list",
      scope: "max-height",
      slot: "todo-item",
      reason:
        "Rows of a capped, scrolling list: at rest the last visible row sits a few px above the frame's bottom edge " +
        "because of the scroll position, not a padding; the rows are concentric with the frame's 8px inset.",
    },
    {
      page: "email-editor",
      selector: "node-section > div.frame-xl.frame-p-1",
      reason:
        "An email section dropped inside a Show-if block is a third frame level (show-if → content → section); " +
        "editor chrome only, latent (dashed outline on hover), and the exported HTML has no radius there.",
    },
  ],
}
