import type { Localized } from "./site-locale"

/**
 * Variants documented on their base component's page. Each stays its own registry item (its own
 * install command and files), but has no page, sidebar entry or gallery card of its own: its section
 * sits on the host page after the host's examples, and its old URL redirects there.
 */
export const MERGES: Record<string, { host: string; label: Localized }> = {
  "button-stateful": { host: "button", label: { en: "Stateful", zh: "状态按钮" } },
  "action-swap-roll": { host: "action-swap-blur", label: { en: "Roll", zh: "滚动切换" } },
  "native-select": { host: "select", label: { en: "Native", zh: "原生" } },
  "select-morph": { host: "select", label: { en: "Morph", zh: "形变" } },
  "popover-morph": { host: "popover", label: { en: "Morph", zh: "形变" } },
  "range-slider-inline": { host: "slider", label: { en: "Inline label", zh: "轨道内标签" } },
  "password-input": { host: "input", label: { en: "Password", zh: "密码" } },
  "date-range-picker": { host: "date-picker", label: { en: "Range", zh: "日期范围" } },
  "table-editable": { host: "table", label: { en: "Editable", zh: "可编辑" } },
  "table-async": { host: "table", label: { en: "Async loading", zh: "异步加载" } },
  "digit-swap": { host: "number-ticker", label: { en: "Digit swap", zh: "逐位切换" } },
}

/** Page titles for hosts whose registry title names only one of their variants. */
export const HOST_TITLES: Record<string, string> = {
  "action-swap-blur": "Action Swap",
}

/** The variants shown on a host page, in MERGES order. */
export function variantsOf(host: string) {
  return Object.entries(MERGES)
    .filter(([, m]) => m.host === host)
    .map(([name, m]) => ({ name, label: m.label }))
}

/** Section anchor for a variant on its host page. */
export const variantAnchor = (name: string) => `variant-${name}`
