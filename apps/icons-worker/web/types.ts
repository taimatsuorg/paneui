import * as React from "react";

export type IconVariant = "outline" | "filled";
export type IconSource = "builtin" | "mcp";

export type IconCatalogItem = {
  name: string;
  component: string;
  category: string;
  tags: string[];
  variant: IconVariant;
  body: string;
  svg: string;
  jsx: string;
  source: IconSource;
  createdAt?: string;
  updatedAt?: string;
};

export type IconEvent = {
  id: number;
  action: "add" | "update" | "delete";
  iconName: string;
  component: string;
  category: string;
  createdAt: string;
};

export type CatalogStats = {
  total: number;
  mcpAdded: number;
  outline: number;
  filled: number;
  eventCount: number;
};

export type ApiCatalogResponse = {
  icons: IconCatalogItem[];
  total: number;
  categories: { name: string; count: number }[];
  stats: CatalogStats;
  recentEvents: IconEvent[];
  activity?: { date: string; count: number }[];
  live: boolean;
  updatedAt: string | null;
};

export type SiteLocale = "en" | "zh";
export type Localized = string | { en: string; zh: string };
export type StrokeScaling = "constant" | "scale";
export type VariantFilter = IconVariant;

export type CustomizeState = {
  size: number;
  colorIndex: number;
  stroke: number;
  strokeScaling: StrokeScaling;
};

export const SITE_URL = "https://paneui.dev";
export const GITHUB_URL = "https://github.com/taimatsuorg/paneui";
export const LOCALE_KEY = "site-locale";
export const LOCALE_EVENT = "site-locale-change";
export const THEME_KEY = "theme";

export const SIZE_STRIP = [16, 20, 24, 32, 48] as const;

export const COLOR_SWATCHES = [
  {
    id: "current",
    tokenLabel: "currentColor",
    label: { en: "Current color", zh: "当前前景色" },
    css: "currentColor",
    previewCss: "var(--foreground)",
  },
  {
    id: "chart-1",
    tokenLabel: "var(--chart-1)",
    label: { en: "Blue", zh: "蓝色" },
    css: "var(--chart-1)",
    previewCss: "var(--chart-1)",
  },
  {
    id: "chart-4",
    tokenLabel: "var(--chart-4)",
    label: { en: "Violet", zh: "紫色" },
    css: "var(--chart-4)",
    previewCss: "var(--chart-4)",
  },
  {
    id: "chart-2",
    tokenLabel: "var(--chart-2)",
    label: { en: "Emerald", zh: "绿色" },
    css: "var(--chart-2)",
    previewCss: "var(--chart-2)",
  },
  {
    id: "chart-5",
    tokenLabel: "var(--chart-5)",
    label: { en: "Crimson", zh: "红色" },
    css: "var(--chart-5)",
    previewCss: "var(--chart-5)",
  },
  {
    id: "chart-3",
    tokenLabel: "var(--chart-3)",
    label: { en: "Amber", zh: "琥珀" },
    css: "var(--chart-3)",
    previewCss: "var(--chart-3)",
  },
  {
    id: "muted",
    tokenLabel: "var(--muted-foreground)",
    label: { en: "Muted", zh: "柔灰" },
    css: "var(--muted-foreground)",
    previewCss: "var(--muted-foreground)",
  },
] as const;

export const DEFAULT_CUSTOMIZE: CustomizeState = {
  size: 24,
  colorIndex: 0,
  stroke: 1.75,
  strokeScaling: "scale",
};

export function readLocale(): SiteLocale {
  try {
    const v = localStorage.getItem(LOCALE_KEY);
    if (v === "en" || v === "zh") return v;
    if (!v && /^zh\b/i.test(navigator.language || "")) return "zh";
  } catch {
    // storage unavailable
  }
  return "en";
}

export function setSiteLocale(next: SiteLocale) {
  try {
    localStorage.setItem(LOCALE_KEY, next);
  } catch {
    // storage unavailable
  }
  document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  window.dispatchEvent(new Event(LOCALE_EVENT));
}

function subscribeLocale(cb: () => void) {
  window.addEventListener(LOCALE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(LOCALE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useSiteLocale(): SiteLocale {
  return React.useSyncExternalStore(subscribeLocale, readLocale, () => "en");
}

export function useT() {
  const locale = useSiteLocale();
  return React.useCallback((text: Localized) => (typeof text === "string" ? text : text[locale]), [locale]);
}

export function T({ en, zh }: { en: React.ReactNode; zh: React.ReactNode }) {
  return useSiteLocale() === "zh" ? zh : en;
}

export function effectiveStrokeWidth(stroke: number, size: number, scaling: StrokeScaling): number {
  const raw = scaling === "constant" ? stroke * (24 / size) : stroke;
  return Math.round(raw * 100) / 100;
}

export function formatCustomSvg(icon: IconCatalogItem, custom: CustomizeState, sizeOverride?: number): string {
  const size = sizeOverride ?? custom.size;
  const sw = effectiveStrokeWidth(custom.stroke, size, custom.strokeScaling);
  const swatch = COLOR_SWATCHES[custom.colorIndex];
  const colorAttr = swatch && swatch.css !== "currentColor" ? ` color="${swatch.css}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"${colorAttr} stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${icon.body}</svg>`;
}

export function formatJsxUsage(icon: IconCatalogItem, custom: CustomizeState): string {
  return custom.size === 24 ? `<${icon.component} />` : `<${icon.component} size={${custom.size}} />`;
}

export function formatReactSnippet(icon: IconCatalogItem, custom: CustomizeState): string {
  if (icon.source === "builtin") {
    return `import { ${icon.component} } from "@/components/icons"\n\n${formatJsxUsage(icon, custom)}`;
  }
  const sw = effectiveStrokeWidth(custom.stroke, custom.size, custom.strokeScaling);
  return `export function ${icon.component}({ size = ${custom.size}, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {\n  return (\n    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={${sw}} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>\n      ${icon.body}\n    </svg>\n  )\n}`;
}

export function formatDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function formatBase64(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let bin = "";
  for (const byte of bytes) {
    bin += String.fromCharCode(byte);
  }
  return `data:image/svg+xml;base64,${btoa(bin)}`;
}

export function formatCssMask(svg: string): string {
  return `mask-image: url("${formatDataUri(svg)}");\nmask-repeat: no-repeat;\nmask-size: contain;\nbackground-color: currentColor;`;
}

export function buildAgentPrompt(mcpUrl: string, totalCount: number, locale: SiteLocale): string {
  const countLabel = totalCount > 0 ? String(totalCount) : "160+";
  if (locale === "zh") {
    return [
      `使用 PaneUI 图标库（${countLabel} 个 24×24 圆润线条与填充图标，默认 1.75px 描边）。`,
      "",
      `- HTTP MCP 服务：${mcpUrl}`,
      "- MCP 工具：search_icons、get_icon、list_categories、add_icon、update_icon、delete_icon",
      "- React 导入：import { SearchIcon } from \"@/components/icons\"",
      "- Registry CLI：npx shadcn@latest add @paneui/icons",
      "- 规范：导航与工具栏使用 16px outline 图标并用 CSS currentColor 着色；禁止额外手写重复 SVG。",
    ].join("\n");
  }
  return [
    `Use PaneUI Icons (${countLabel} rounded 24x24 outline & filled icons, 1.75px default stroke).`,
    "",
    `- HTTP MCP server: ${mcpUrl}`,
    "- MCP tools: search_icons, get_icon, list_categories, add_icon, update_icon, delete_icon",
    "- React import: import { SearchIcon } from \"@/components/icons\"",
    "- Registry CLI: npx shadcn@latest add @paneui/icons",
    "- Rules: Use currentColor for styling, stick to 12/14/16/18/20/24px sizes, and call MCP before drawing new glyphs.",
  ].join("\n");
}

export function resolveColorForExport(cssValue: string): string {
  if (typeof window === "undefined") return "currentColor";
  const varMatch = /^var\((--[^)]+)\)$/.exec(cssValue);
  const propName = cssValue === "currentColor" ? "--foreground" : varMatch?.[1];
  if (!propName) return cssValue;
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(propName).trim();
  return resolved || (document.documentElement.classList.contains("dark") ? "oklch(98.5% 0 0)" : "oklch(14.5% 0 0)");
}

export async function rasterizeSvgToPngBlob(icon: IconCatalogItem, custom: CustomizeState, pixelSize: number): Promise<Blob> {
  const sw = effectiveStrokeWidth(custom.stroke, custom.size, custom.strokeScaling);
  const swatch = COLOR_SWATCHES[custom.colorIndex];
  const color = resolveColorForExport(swatch?.css ?? "currentColor");
  const coloredBody = icon.body.replaceAll("currentColor", color);
  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelSize}" height="${pixelSize}" viewBox="0 0 24 24" fill="none" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${coloredBody}</svg>`;
  const blobUrl = URL.createObjectURL(new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" }));

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Failed to rasterize SVG"));
      image.src = blobUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = pixelSize;
    canvas.height = pixelSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    ctx.drawImage(img, 0, 0, pixelSize, pixelSize);
    const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!pngBlob) throw new Error("PNG export failed");
    return pngBlob;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function writeClipboardText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export async function copyPngBlob(blob: Blob): Promise<boolean> {
  try {
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

export function useClipboard() {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const timerRef = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const copy = React.useCallback(async (key: string, text: string) => {
    const ok = await writeClipboardText(text);
    if (!ok) return false;
    setCopiedKey(key);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopiedKey(null), 1600);
    return true;
  }, []);

  return { copiedKey, copy };
}

export function relativeTime(iso: string | undefined, locale: SiteLocale): string {
  if (!iso) return locale === "zh" ? "刚刚" : "just now";
  const deltaSec = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (!Number.isFinite(deltaSec) || deltaSec < 60) return locale === "zh" ? "刚刚" : "just now";
  const mins = Math.round(deltaSec / 60);
  if (mins < 60) return locale === "zh" ? `${mins} 分钟前` : `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return locale === "zh" ? `${hours} 小时前` : `${hours}h ago`;
  const days = Math.round(hours / 24);
  return locale === "zh" ? `${days} 天前` : `${days}d ago`;
}

export function GlyphSvg({
  body,
  size,
  strokeWidth,
  color,
  className,
}: {
  body: string;
  size: number;
  strokeWidth: number;
  color?: string;
  className?: string;
}) {
  return React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    className,
    style: { ...(color ? { color } : {}), strokeWidth },
    dangerouslySetInnerHTML: { __html: body },
  });
}
