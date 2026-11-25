import * as React from "react";

import { cn } from "@paneui/ui/lib/utils";
import { ActionSwapBlurButton, type ActionSwapItem } from "@paneui/ui/components/action-swap-blur";
import { Badge } from "@paneui/ui/components/badge";
import { Button } from "@paneui/ui/components/button";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle } from "@paneui/ui/components/drawer";
import {
  HeatCalendar,
  HeatCalendarGrid,
  HeatCalendarLegend,
  HeatCalendarSummary,
  type HeatCalendarDatum,
  type HeatCalendarSelection,
} from "@paneui/ui/components/heat-calendar";
import { Kbd } from "@paneui/ui/components/kbd";
import { LocaleProvider } from "@paneui/ui/components/locale-provider";
import { SegmentedControl, SegmentedControlItem } from "@paneui/ui/components/segmented-control";
import { Slider } from "@paneui/ui/components/slider";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@paneui/ui/components/tabs";
import { ThemeSwitch, useTheme, type ThemeMode } from "@paneui/ui/components/theme-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@paneui/ui/components/tooltip";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  GithubIcon,
  GlobeIcon,
  PaneuiLogoIcon,
  PlugIcon,
  RefreshIcon,
  SearchIcon,
  ShapesIcon,
  SlidersIcon,
  SparklesIcon,
  XIcon,
} from "@paneui/ui/icons";

type IconVariant = "outline" | "filled";
type IconSource = "builtin" | "mcp";

type IconCatalogItem = {
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

type IconEvent = {
  id: number;
  action: "add" | "update" | "delete";
  iconName: string;
  component: string;
  category: string;
  createdAt: string;
};

type CatalogStats = {
  total: number;
  mcpAdded: number;
  outline: number;
  filled: number;
  eventCount: number;
};

type ApiCatalogResponse = {
  icons: IconCatalogItem[];
  total: number;
  categories: { name: string; count: number }[];
  stats: CatalogStats;
  recentEvents: IconEvent[];
  activity?: HeatCalendarDatum[];
  live: boolean;
  updatedAt: string | null;
};

type SiteLocale = "en" | "zh";
type Localized = string | { en: string; zh: string };
type StrokeScaling = "constant" | "scale";
type DockPanel = "category" | "customize" | "agent" | "icon" | null;
type VariantFilter = "all" | IconVariant;

type CustomizeState = {
  size: number;
  colorIndex: number;
  stroke: number;
  strokeScaling: StrokeScaling;
};

const SIZE_OPTIONS = [16, 20, 24, 32, 40, 48] as const;

const COLOR_SWATCHES = [
  { id: "foreground", label: { en: "Ink", zh: "墨色" }, css: "var(--foreground)" },
  { id: "chart-1", label: { en: "Blue", zh: "蓝色" }, css: "var(--chart-1)" },
  { id: "chart-4", label: { en: "Violet", zh: "紫色" }, css: "var(--chart-4)" },
  { id: "chart-2", label: { en: "Emerald", zh: "绿色" }, css: "var(--chart-2)" },
  { id: "chart-5", label: { en: "Crimson", zh: "红色" }, css: "var(--chart-5)" },
  { id: "chart-3", label: { en: "Amber", zh: "琥珀" }, css: "var(--chart-3)" },
  { id: "muted", label: { en: "Muted", zh: "柔灰" }, css: "var(--muted-foreground)" },
] as const;

const DEFAULT_CUSTOMIZE: CustomizeState = {
  size: 24,
  colorIndex: 0,
  stroke: 1.75,
  strokeScaling: "scale",
};

const LOCALE_KEY = "site-locale";
const LOCALE_EVENT = "site-locale-change";
const THEME_KEY = "theme";
const SITE_URL = "https://paneui.dev";
const GITHUB_URL = "https://github.com/taimatsuorg/paneui";

function readLocale(): SiteLocale {
  try {
    const v = localStorage.getItem(LOCALE_KEY);
    if (v === "en" || v === "zh") return v;
    if (!v && /^zh\b/i.test(navigator.language || "")) return "zh";
  } catch {
    // storage unavailable
  }
  return "en";
}

function setSiteLocale(next: SiteLocale) {
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

function useSiteLocale(): SiteLocale {
  return React.useSyncExternalStore(subscribeLocale, readLocale, () => "en");
}

function useT() {
  const locale = useSiteLocale();
  return React.useCallback((text: Localized) => (typeof text === "string" ? text : text[locale]), [locale]);
}

function T({ en, zh }: { en: React.ReactNode; zh: React.ReactNode }) {
  return useSiteLocale() === "zh" ? zh : en;
}

function effectiveStrokeWidth(stroke: number, size: number, scaling: StrokeScaling): number {
  const raw = scaling === "constant" ? stroke * (24 / size) : stroke;
  return Math.round(raw * 100) / 100;
}

function formatCustomSvg(icon: IconCatalogItem, custom: CustomizeState): string {
  const sw = effectiveStrokeWidth(custom.stroke, custom.size, custom.strokeScaling);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${custom.size}" height="${custom.size}" viewBox="0 0 24 24" fill="none" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${icon.body}</svg>`;
}

function relativeTime(iso: string | undefined, locale: SiteLocale): string {
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

function GlyphSvg({
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
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={{ color, strokeWidth }}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

function useClipboard() {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const timerRef = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const copy = React.useCallback(async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopiedKey(null), 1600);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { copiedKey, copy };
}

function AgentPanel({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { copiedKey, copy } = useClipboard();
  const origin = typeof window !== "undefined" ? window.location.origin : "https://icons.paneui.dev";
  const mcpUrl = `${origin}/mcp`;

  const snippets = React.useMemo(
    () => ({
      claude: `claude mcp add --transport http paneui-icons ${mcpUrl}`,
      cursor: JSON.stringify(
        {
          mcpServers: {
            "paneui-icons": {
              url: mcpUrl,
            },
          },
        },
        null,
        2,
      ),
      codex: `codex mcp add paneui-icons --url ${mcpUrl}`,
      vscode: JSON.stringify(
        {
          servers: {
            "paneui-icons": {
              type: "http",
              url: mcpUrl,
            },
          },
        },
        null,
        2,
      ),
      write: JSON.stringify(
        {
          mcpServers: {
            "paneui-icons": {
              url: mcpUrl,
              headers: {
                Authorization: "Bearer YOUR_ICON_MCP_WRITE_TOKEN",
              },
            },
          },
        },
        null,
        2,
      ),
    }),
    [mcpUrl],
  );

  const [tab, setTab] = React.useState<keyof typeof snippets>("claude");
  const activeSnippet = snippets[tab];
  const copyCmdItems = React.useMemo<ActionSwapItem[]>(
    () => [
      { value: "copy", label: t({ en: "Copy", zh: "复制" }), icon: <CopyIcon />, ariaLabel: t({ en: "Copy command", zh: "复制配置" }) },
      {
        value: "copied",
        label: t({ en: "Copied", zh: "已复制" }),
        icon: <CheckIcon className="text-success-text" />,
        ariaLabel: t({ en: "Copied", zh: "已复制" }),
      },
    ],
    [t],
  );

  return (
    <div className="w-[min(32rem,calc(100vw-2rem))] rounded-2xl bg-popover p-5 text-popover-foreground shadow-xl">
      <div className="flex items-start justify-between gap-3 pb-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-balance text-foreground">
            <T en="Use it in your agent" zh="在你的编程 Agent 中使用" />
          </h2>
          <p className="text-ui text-pretty text-muted-foreground">
            <T
              en="Connect the cloud MCP server to search icons or publish new ones to D1."
              zh="连接云端 MCP 服务，直接按语义检索图标或带令牌在线新增图标到 D1。"
            />
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={t({ en: "Close panel", zh: "关闭面板" })}
          onClick={onClose}
        >
          <XIcon />
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as keyof typeof snippets)} className="gap-2.5">
        <TabsList size="sm" variant="default">
          <TabsTab value="claude">Claude Code</TabsTab>
          <TabsTab value="cursor">Cursor</TabsTab>
          <TabsTab value="codex">Codex</TabsTab>
          <TabsTab value="vscode">VS Code</TabsTab>
          <TabsTab value="write">
            <T en="Write Token" zh="写入令牌" />
          </TabsTab>
        </TabsList>

        <TabsPanel value={tab}>
          <div className="flex items-start gap-2 rounded-xl bg-shell p-3 font-mono text-ui-sm text-foreground">
            <pre className="min-w-0 flex-1 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
              <code>{activeSnippet}</code>
            </pre>
            <ActionSwapBlurButton
              items={copyCmdItems}
              value={copiedKey === `agent-${tab}` ? "copied" : "copy"}
              cycle={false}
              iconOnly
              variant="ghost"
              size="icon-xs"
              aria-label={t({ en: "Copy command", zh: "复制配置" })}
              onClick={() => copy(`agent-${tab}`, activeSnippet)}
            />
          </div>
        </TabsPanel>
      </Tabs>

      <div className="mt-3 flex flex-col gap-1.5 text-ui-sm text-muted-foreground">
        <p className="text-pretty">
          <T
            en={
              <>
                Then ask: <span className="font-medium text-foreground">&ldquo;find a settings icon&rdquo;</span> or use{" "}
                <code className="font-mono text-foreground">add_icon</code> with your write token.
              </>
            }
            zh={
              <>
                试着询问：<span className="font-medium text-foreground">“找一个设置图标”</span>，或携带写入令牌调用{" "}
                <code className="font-mono text-foreground">add_icon</code> 直接入库。
              </>
            }
          />
        </p>
        <div className="flex items-center justify-between pt-1 text-ui-sm text-fg-tertiary">
          <span>
            <T en="Cloud D1 · No key for read tools" zh="云端 D1 实时驱动 · 只读免密钥" />
          </span>
          <a href={`${SITE_URL}/docs/cli`} className="underline underline-offset-4 hover:text-foreground">
            CLI &amp; docs
          </a>
        </div>
      </div>
    </div>
  );
}

function CustomizePanel({
  custom,
  onChange,
  onReset,
}: {
  custom: CustomizeState;
  onChange: (next: CustomizeState) => void;
  onReset: () => void;
}) {
  const t = useT();
  const { theme: themeMode, setTheme } = useTheme({ storageKey: THEME_KEY });
  return (
    <div className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl bg-popover p-5 text-popover-foreground shadow-xl">
      <div className="flex items-center justify-between gap-2 pb-4">
        <h2 className="text-base font-semibold text-balance text-foreground">
          <T en="Customize" zh="自定义预览" />
        </h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RefreshIcon data-icon="inline-start" />
          <T en="Reset" zh="重置" />
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-ui-sm font-medium text-muted-foreground">
            <T en="Size" zh="尺寸" />
          </span>
          <SegmentedControl
            size="sm"
            value={String(custom.size)}
            onValueChange={(v) => onChange({ ...custom, size: Number(v) })}
            aria-label={t({ en: "Preview size", zh: "预览尺寸" })}
          >
            {SIZE_OPTIONS.map((sz) => (
              <SegmentedControlItem key={sz} value={String(sz)}>
                <span className="tabular-nums">{sz}</span>
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-ui-sm font-medium text-muted-foreground">
            <T en="Colour" zh="颜色" />
          </span>
          <div className="flex items-center justify-between gap-2">
            {COLOR_SWATCHES.map((swatch, idx) => {
              const active = custom.colorIndex === idx;
              return (
                <button
                  key={swatch.id}
                  type="button"
                  aria-label={t(swatch.label)}
                  aria-pressed={active}
                  onClick={() => onChange({ ...custom, colorIndex: idx })}
                  className={cn(
                    "relative flex size-7 cursor-pointer items-center justify-center rounded-full transition-transform outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "ring-2 ring-foreground ring-offset-2 ring-offset-popover" : "hover:scale-105",
                  )}
                >
                  <span
                    aria-hidden
                    className="size-5.5 rounded-full border border-border"
                    style={{ backgroundColor: swatch.css }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-ui-sm">
            <span className="font-medium text-muted-foreground">
              <T en="Stroke" zh="描边粗细" />
            </span>
            <span className="font-mono text-foreground tabular-nums">{custom.stroke.toFixed(2)} px</span>
          </div>
          <Slider
            size="sm"
            min={1}
            max={2.5}
            step={0.05}
            value={custom.stroke}
            onValueChange={(v) => onChange({ ...custom, stroke: Number(typeof v === "number" ? v : v[0]) })}
            aria-label={t({ en: "Stroke width", zh: "描边宽度" })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <span className="text-ui-sm font-medium text-muted-foreground">
              <T en="Stroke scaling" zh="描边缩放" />
            </span>
            <SegmentedControl
              size="xs"
              value={custom.strokeScaling}
              onValueChange={(v) => onChange({ ...custom, strokeScaling: v as StrokeScaling })}
              aria-label={t({ en: "Stroke scaling", zh: "描边缩放" })}
            >
              <SegmentedControlItem value="constant">
                <T en="Constant" zh="恒定" />
              </SegmentedControlItem>
              <SegmentedControlItem value="scale">
                <T en="Scale" zh="等比" />
              </SegmentedControlItem>
            </SegmentedControl>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-ui-sm font-medium text-muted-foreground">
              <T en="Appearance" zh="外观" />
            </span>
            <SegmentedControl
              size="xs"
              value={themeMode ?? "system"}
              onValueChange={(v) => setTheme(v as ThemeMode)}
              aria-label={t({ en: "Appearance", zh: "外观模式" })}
            >
              <SegmentedControlItem value="system">
                <T en="Auto" zh="自动" />
              </SegmentedControlItem>
              <SegmentedControlItem value="light">
                <T en="Light" zh="浅色" />
              </SegmentedControlItem>
              <SegmentedControlItem value="dark">
                <T en="Dark" zh="深色" />
              </SegmentedControlItem>
            </SegmentedControl>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconDetailPanel({
  icon,
  custom,
  onClose,
  onDownload,
}: {
  icon: IconCatalogItem;
  custom: CustomizeState;
  onClose: () => void;
  onDownload: (icon: IconCatalogItem) => void;
}) {
  const t = useT();
  const { copiedKey, copy } = useClipboard();
  const [codeTab, setCodeTab] = React.useState<"jsx" | "svg">("jsx");
  const colorCss = COLOR_SWATCHES[custom.colorIndex]?.css ?? "var(--foreground)";
  const sw = effectiveStrokeWidth(custom.stroke, custom.size, custom.strokeScaling);
  const customSvg = formatCustomSvg(icon, custom);

  const svgItems = React.useMemo<ActionSwapItem[]>(
    () => [
      { value: "copy", label: t({ en: "Copy SVG", zh: "复制 SVG" }), icon: <CopyIcon data-icon="inline-start" /> },
      {
        value: "copied",
        label: t({ en: "Copied", zh: "已复制" }),
        icon: <CheckIcon data-icon="inline-start" className="text-success-text" />,
      },
    ],
    [t],
  );
  const jsxItems = React.useMemo<ActionSwapItem[]>(
    () => [
      { value: "copy", label: t({ en: "Copy JSX", zh: "复制 JSX" }), icon: <CopyIcon data-icon="inline-start" /> },
      {
        value: "copied",
        label: t({ en: "Copied", zh: "已复制" }),
        icon: <CheckIcon data-icon="inline-start" className="text-success-text" />,
      },
    ],
    [t],
  );
  const importItems = React.useMemo<ActionSwapItem[]>(
    () => [
      {
        value: "copy",
        label: icon.source === "builtin" ? t({ en: "Copy import", zh: "复制导入" }) : t({ en: "Copy markup", zh: "复制源码" }),
        icon: <CopyIcon data-icon="inline-start" />,
      },
      {
        value: "copied",
        label: t({ en: "Copied", zh: "已复制" }),
        icon: <CheckIcon data-icon="inline-start" className="text-success-text" />,
      },
    ],
    [icon.source, t],
  );

  const importSnippet =
    icon.source === "builtin"
      ? `import { ${icon.component} } from "@/components/icons"\n\n${icon.jsx}`
      : customSvg;

  return (
    <div className="w-[min(30rem,calc(100vw-2rem))] rounded-2xl bg-popover p-5 text-popover-foreground shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-shell text-foreground">
            <GlyphSvg body={icon.body} size={24} strokeWidth={custom.stroke} color={colorCss} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate font-mono text-base font-semibold text-balance text-foreground">{icon.name}</h2>
              {icon.source === "mcp" && (
                <Badge variant="primary" size="sm">
                  MCP
                </Badge>
              )}
            </div>
            <p className="truncate font-mono text-ui-sm text-pretty text-muted-foreground">
              {icon.component} · {icon.category}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={t({ en: "Close icon details", zh: "关闭图标详情" })}
          onClick={onClose}
        >
          <XIcon />
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ActionSwapBlurButton
          items={svgItems}
          value={copiedKey === "detail-svg" ? "copied" : "copy"}
          cycle={false}
          variant="default"
          size="sm"
          className="w-full"
          onClick={() => copy("detail-svg", customSvg)}
        />
        <ActionSwapBlurButton
          items={jsxItems}
          value={copiedKey === "detail-jsx" ? "copied" : "copy"}
          cycle={false}
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => copy("detail-jsx", icon.jsx)}
        />
        <Button variant="outline" size="sm" className="w-full" onClick={() => onDownload(icon)}>
          <DownloadIcon data-icon="inline-start" />
          <T en="Download SVG" zh="下载 SVG" />
        </Button>
        <ActionSwapBlurButton
          items={importItems}
          value={copiedKey === "detail-import" ? "copied" : "copy"}
          cycle={false}
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => copy("detail-import", importSnippet)}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <SegmentedControl
          size="sm"
          value={codeTab}
          onValueChange={(v) => setCodeTab(v as "jsx" | "svg")}
          aria-label={t({ en: "Snippet format", zh: "代码格式" })}
        >
          <SegmentedControlItem value="jsx">JSX</SegmentedControlItem>
          <SegmentedControlItem value="svg">SVG</SegmentedControlItem>
        </SegmentedControl>
        <span className="font-mono text-ui-sm text-muted-foreground tabular-nums">
          {custom.size}×{custom.size} · {sw}px
        </span>
      </div>

      <pre className="mt-2 max-h-28 overflow-auto rounded-xl bg-shell p-3 font-mono text-ui-sm leading-relaxed text-foreground">
        <code>{codeTab === "jsx" ? importSnippet : customSvg}</code>
      </pre>
    </div>
  );
}

function CategoryPanel({
  categories,
  totalCount,
  selectedCategory,
  variant,
  onSelectCategory,
  onSelectVariant,
}: {
  categories: { name: string; count: number }[];
  totalCount: number;
  selectedCategory: string;
  variant: VariantFilter;
  onSelectCategory: (cat: string) => void;
  onSelectVariant: (v: VariantFilter) => void;
}) {
  const t = useT();
  return (
    <div className="w-[min(26rem,calc(100vw-2rem))] rounded-2xl bg-popover p-4 text-popover-foreground shadow-xl">
      <div className="flex items-center justify-between gap-2 pb-3">
        <span className="text-ui-lg font-medium text-foreground">
          <T en="Categories & style" zh="分类与风格" />
        </span>
        <SegmentedControl
          size="sm"
          value={variant}
          onValueChange={(v) => onSelectVariant(v as VariantFilter)}
          aria-label={t({ en: "Icon variant", zh: "图标风格" })}
        >
          <SegmentedControlItem value="all">
            <T en="All" zh="全部" />
          </SegmentedControlItem>
          <SegmentedControlItem value="outline">
            <T en="Outline" zh="线性" />
          </SegmentedControlItem>
          <SegmentedControlItem value="filled">
            <T en="Filled" zh="填充" />
          </SegmentedControlItem>
        </SegmentedControl>
      </div>

      <div className="flex max-h-64 flex-wrap gap-1.5 overflow-y-auto">
        <button
          type="button"
          onClick={() => onSelectCategory("All")}
          aria-pressed={selectedCategory === "All"}
          className={cn(
            "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control px-3 text-ui-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
            selectedCategory === "All"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground",
          )}
        >
          <span>
            <T en="All" zh="全部" />
          </span>
          <span className="opacity-72 tabular-nums">{totalCount}</span>
        </button>
        {categories.map((cat) => {
          const active = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => onSelectCategory(cat.name)}
              aria-pressed={active}
              className={cn(
                "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control px-3 text-ui-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              <span>{cat.name}</span>
              <span className="opacity-72 tabular-nums">{cat.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FeedSidebarContent({
  icons,
  activity,
  todayIso,
  events,
  onSelectIcon,
  onOpenAgent,
}: {
  icons: IconCatalogItem[];
  activity: HeatCalendarDatum[];
  todayIso: string;
  events: IconEvent[];
  onSelectIcon: (name: string) => void;
  onOpenAgent: () => void;
}) {
  const t = useT();
  const locale = useSiteLocale();
  const [rangeSelection, setRangeSelection] = React.useState<HeatCalendarSelection | null>(null);
  const iconMap = React.useMemo(() => new Map(icons.map((i) => [i.name, i])), [icons]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2 text-ui-lg text-muted-foreground">
        <button
          type="button"
          onClick={onOpenAgent}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-control py-1.5 font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PlugIcon size={16} />
          <T en="Use in your agent" zh="接入 Agent" />
        </button>
      </div>

      {/* Cloud D1 icon activity heatmap */}
      <div className="rounded-2xl bg-card p-4 shadow-raised">
        <HeatCalendar
          data={activity}
          endDate={todayIso}
          weeks={12}
          gap={5}
          fit
          showWeekdays={false}
          monthPosition="bottom"
          highlightToday
          completeWeek
          color="var(--success)"
          selection={rangeSelection}
          onSelectionChange={setRangeSelection}
          unit={t({ en: "updates", zh: "次动态" })}
          label={t({ en: "Cloud icon activity", zh: "云端图标热力图" })}
        >
          <HeatCalendarGrid />
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {rangeSelection ? (
              <HeatCalendarSummary />
            ) : (
              <span className="text-ui-xs text-muted-foreground tabular-nums">
                <T en="Last 12 weeks" zh="近 12 周动态" />
              </span>
            )}
            <HeatCalendarLegend />
          </div>
        </HeatCalendar>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-ui-sm font-medium text-fg-tertiary">
          <T en="Recent cloud activity" zh="云端最近动态" />
        </div>
        {events.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {events.slice(0, 6).map((ev) => {
              const matched = iconMap.get(ev.iconName);
              return (
                <li key={ev.id}>
                  <button
                    type="button"
                    disabled={!matched}
                    onClick={() => matched && onSelectIcon(matched.name)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-control px-2 py-1.5 text-start text-ui transition-colors outline-none hover:bg-fill-hover disabled:cursor-default disabled:opacity-64 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
                      {matched ? (
                        <GlyphSvg body={matched.body} size={16} strokeWidth={1.75} />
                      ) : (
                        <ShapesIcon size={16} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-foreground">
                      <span className="font-medium">{ev.iconName}</span>{" "}
                      <span className="text-muted-foreground">
                        {ev.action === "add"
                          ? locale === "zh"
                            ? "已新增"
                            : "added"
                          : ev.action === "update"
                            ? locale === "zh"
                              ? "已更新"
                              : "updated"
                            : locale === "zh"
                              ? "已删除"
                              : "deleted"}
                      </span>
                    </span>
                    <span className="shrink-0 text-ui-xs text-fg-tertiary tabular-nums">
                      {relativeTime(ev.createdAt, locale)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {icons.slice(0, 6).map((icon) => (
              <li key={icon.name}>
                <button
                  type="button"
                  onClick={() => onSelectIcon(icon.name)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-control px-2 py-1.5 text-start text-ui transition-colors outline-none hover:bg-fill-hover focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <GlyphSvg body={icon.body} size={16} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">{icon.name}</span>
                  <span className="shrink-0 text-ui-xs text-fg-tertiary">{icon.category}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3 text-ui-sm text-fg-tertiary">
        <a href={`${SITE_URL}/docs`} className="hover:text-foreground">
          Docs
        </a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-foreground">
          <GithubIcon size={16} />
        </a>
      </div>
    </div>
  );
}

export function App() {
  const t = useT();
  const locale = useSiteLocale();
  const { setTheme } = useTheme({ storageKey: THEME_KEY });
  const isMac = React.useMemo(() => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent), []);
  const todayIso = React.useMemo(() => new Date().toISOString().slice(0, 10), []);

  React.useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const [icons, setIcons] = React.useState<IconCatalogItem[]>([]);
  const [stats, setStats] = React.useState<CatalogStats>({ total: 0, mcpAdded: 0, outline: 0, filled: 0, eventCount: 0 });
  const [recentEvents, setRecentEvents] = React.useState<IconEvent[]>([]);
  const [activity, setActivity] = React.useState<HeatCalendarDatum[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("All");
  const [variant, setVariant] = React.useState<VariantFilter>("all");
  const [selectedName, setSelectedName] = React.useState<string | null>(null);
  const [openPanel, setOpenPanel] = React.useState<DockPanel>(null);
  const [feedDrawerOpen, setFeedDrawerOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  const [custom, setCustom] = React.useState<CustomizeState>(DEFAULT_CUSTOMIZE);

  const searchRef = React.useRef<HTMLInputElement>(null);
  const dockRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const cat = params.get("category");
    const v = params.get("variant");
    const iconParam = params.get("icon");
    if (q) setQuery(q);
    if (cat) setCategory(cat);
    if (v === "outline" || v === "filled" || v === "all") setVariant(v);
    if (iconParam) {
      setSelectedName(iconParam);
      setOpenPanel("icon");
    }
  }, []);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const setOrDelete = (k: string, val: string | null) => {
      if (val) url.searchParams.set(k, val);
      else url.searchParams.delete(k);
    };
    setOrDelete("q", query.trim() || null);
    setOrDelete("category", category !== "All" ? category : null);
    setOrDelete("variant", variant !== "all" ? variant : null);
    setOrDelete("icon", selectedName);
    window.history.replaceState(null, "", url);
  }, [query, category, variant, selectedName]);

  const fetchCloudCatalog = React.useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/icons", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = (await res.json()) as ApiCatalogResponse;
      if (!Array.isArray(payload.icons)) throw new Error("Invalid cloud catalog response");
      setIcons(payload.icons);
      setStats(
        payload.stats ?? {
          total: payload.icons.length,
          mcpAdded: payload.icons.filter((i) => i.source === "mcp").length,
          outline: payload.icons.filter((i) => i.variant === "outline").length,
          filled: payload.icons.filter((i) => i.variant === "filled").length,
          eventCount: payload.recentEvents?.length ?? 0,
        },
      );
      setRecentEvents(payload.recentEvents ?? []);
      setActivity(payload.activity ?? []);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load cloud icons.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCloudCatalog();
    const onFocus = () => {
      fetchCloudCatalog(true);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchCloudCatalog]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "Escape") {
        setOpenPanel(null);
      }
    };
    const onPointerDown = (e: MouseEvent) => {
      if (!openPanel) return;
      if (dockRef.current && dockRef.current.contains(e.target as Node)) return;
      if ((e.target as HTMLElement | null)?.closest("[data-icon-cell]")) return;
      setOpenPanel(null);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [openPanel]);

  const categories = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of icons) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [icons]);

  const filtered = React.useMemo(() => {
    const terms = query.trim().toLowerCase().split(/[\s,]+/).filter(Boolean);
    return icons.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (variant !== "all" && item.variant !== variant) return false;
      if (terms.length === 0) return true;
      const hay = `${item.name} ${item.component} ${item.category} ${item.tags.join(" ")}`.toLowerCase();
      return terms.every((term) => hay.includes(term));
    });
  }, [icons, query, category, variant]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, IconCatalogItem[]>();
    for (const item of filtered) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  }, [filtered]);

  const selectedIcon = React.useMemo(
    () => (selectedName ? icons.find((i) => i.name === selectedName) ?? null : null),
    [icons, selectedName],
  );

  const colorCss = COLOR_SWATCHES[custom.colorIndex]?.css ?? "var(--foreground)";
  const sw = effectiveStrokeWidth(custom.stroke, custom.size, custom.strokeScaling);

  const showToast = React.useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg((prev) => (prev === msg ? null : prev)), 1800);
  }, []);

  const handleGlyphClick = React.useCallback(
    async (e: React.MouseEvent, icon: IconCatalogItem) => {
      if (e.shiftKey) {
        const svg = formatCustomSvg(icon, custom);
        try {
          await navigator.clipboard.writeText(svg);
          showToast(t({ en: `Copied ${icon.name}.svg`, zh: `已复制 ${icon.name}.svg` }));
        } catch {
          // ignore
        }
        return;
      }
      setSelectedName(icon.name);
      setOpenPanel("icon");
    },
    [custom, showToast, t],
  );

  const handleDownloadSvg = React.useCallback(
    (icon: IconCatalogItem) => {
      const svg = formatCustomSvg(icon, custom);
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${icon.name}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [custom],
  );

  return (
    <LocaleProvider locale={locale === "zh" ? "zh-CN" : "en"}>
      <TooltipProvider delay={200}>
        <div className="min-h-svh bg-background text-foreground">
          {/* Top bar: brand mark, live cloud counts, language, and theme switch */}
          <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-4 border-b border-border/60 bg-background/90 px-4 text-ui backdrop-blur-md lg:px-8">
            <div className="flex min-w-0 items-center gap-3 overflow-hidden">
              <a
                href={SITE_URL}
                className="inline-flex shrink-0 items-center gap-2 rounded-control text-ui-lg font-semibold icon-bold text-foreground outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PaneuiLogoIcon size={18} />
                <span>PaneUI</span>
              </a>
              <span className="h-3.5 w-px shrink-0 bg-border" aria-hidden />
              <div className="flex min-w-0 items-center gap-4 text-ui text-muted-foreground tabular-nums">
                <span className="inline-flex shrink-0 items-center gap-1.5">
                  <SparklesIcon size={16} />
                  <span>
                    <T en={`${stats.total} cloud icons`} zh={`${stats.total} 云端图标`} />
                  </span>
                </span>
                <span className="hidden shrink-0 items-center gap-1.5 sm:inline-flex">
                  <PlugIcon size={16} />
                  <span>
                    <T en={`+${stats.mcpAdded} via MCP`} zh={`+${stats.mcpAdded} MCP 新增`} />
                  </span>
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setSiteLocale(locale === "en" ? "zh" : "en")}
                aria-label={t({ en: "Switch language", zh: "切换语言" })}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control px-2.5 text-ui text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <GlobeIcon size={16} />
                <span>{locale === "en" ? "中文" : "EN"}</span>
              </button>
              <ThemeSwitch storageKey={THEME_KEY} />
              <button
                type="button"
                onClick={() => setFeedDrawerOpen(true)}
                className="inline-flex h-8 cursor-pointer items-center gap-0.5 rounded-control px-2.5 text-ui text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
              >
                <span>
                  <T en="Feed" zh="动态" />
                </span>
                <ChevronRightIcon size={14} className="rtl:-scale-x-100" />
              </button>
            </div>
          </header>

          {/* Main open gallery + right cloud rail */}
          <main className="mx-auto flex w-full max-w-[1440px] items-start gap-12 px-4 pt-6 pb-32 sm:px-8">
            <div className="min-w-0 flex-1">
              <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-2.5">
                  <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance text-foreground">
                    {category === "All" ? <T en="Icons" zh="图标库" /> : category}
                  </h1>
                  <span className="font-mono text-ui-lg text-muted-foreground tabular-nums">
                    {filtered.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 xl:hidden">
                  <Button variant="ghost" size="xs" onClick={() => setOpenPanel(openPanel === "agent" ? null : "agent")}>
                    <PlugIcon data-icon="inline-start" />
                    <T en="Agent MCP" zh="Agent MCP" />
                  </Button>
                  <Button variant="ghost" size="xs" onClick={() => fetchCloudCatalog(false)}>
                    <RefreshIcon data-icon="inline-start" />
                    <T en="Sync" zh="同步" />
                  </Button>
                </div>
              </div>

              {loading && icons.length === 0 ? (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9">
                  {Array.from({ length: 36 }, (_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-fill-hover" />
                  ))}
                </div>
              ) : errorMsg ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-card px-6 py-16 text-center shadow-raised">
                  <p className="text-ui-lg font-medium text-foreground">
                    <T en="Failed to load icons from D1." zh="加载云端 D1 图标库失败。" />
                  </p>
                  <p className="text-ui text-pretty text-muted-foreground">{errorMsg}</p>
                  <Button variant="default" size="sm" onClick={() => fetchCloudCatalog(false)}>
                    <RefreshIcon data-icon="inline-start" />
                    <T en="Retry" zh="重试" />
                  </Button>
                </div>
              ) : grouped.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-card px-6 py-16 text-center shadow-raised">
                  <SearchIcon size={24} className="text-muted-foreground" />
                  <p className="text-ui-lg font-medium text-foreground">
                    <T en="No icons match your search." zh="没有找到匹配的图标。" />
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      setCategory("All");
                      setVariant("all");
                    }}
                  >
                    <T en="Clear filters" zh="清空筛选" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-10">
                  {grouped.map(([catName, catIcons]) => (
                    <section key={catName} className="flex flex-col gap-3">
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-sm font-medium text-balance text-muted-foreground">{catName}</h2>
                        <span className="font-mono text-ui text-fg-tertiary tabular-nums">{catIcons.length}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9">
                        {catIcons.map((icon) => {
                          const isSelected = selectedName === icon.name && openPanel === "icon";
                          return (
                            <Tooltip key={icon.name}>
                              <TooltipTrigger
                                render={
                                  <button
                                    type="button"
                                    data-icon-cell
                                    aria-label={icon.name}
                                    aria-pressed={isSelected}
                                    onClick={(e) => handleGlyphClick(e, icon)}
                                    className={cn(
                                      "group relative flex h-14 cursor-pointer items-center justify-center rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                      isSelected
                                        ? "bg-fill-active ring-1 ring-border-strong"
                                        : "hover:bg-fill-hover active:bg-fill-active",
                                    )}
                                  />
                                }
                              >
                                <GlyphSvg
                                  body={icon.body}
                                  size={custom.size}
                                  strokeWidth={sw}
                                  color={colorCss}
                                />
                                {icon.source === "mcp" && (
                                  <span
                                    aria-hidden
                                    className="absolute top-2 end-2 size-1.5 rounded-full bg-primary"
                                  />
                                )}
                              </TooltipTrigger>
                              <TooltipContent side="bottom">{icon.name}</TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>

            <aside className="sticky top-16 hidden w-72 shrink-0 pt-1 xl:block">
              <FeedSidebarContent
                icons={icons}
                activity={activity}
                todayIso={todayIso}
                events={recentEvents}
                onSelectIcon={(name) => {
                  setSelectedName(name);
                  setOpenPanel("icon");
                }}
                onOpenAgent={() => setOpenPanel(openPanel === "agent" ? null : "agent")}
              />
            </aside>
          </main>

          {/* Copy toast */}
          {toastMsg && (
            <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-surface-standout px-3.5 py-1.5 text-ui-xs font-medium text-standout-foreground shadow-xl">
              {toastMsg}
            </div>
          )}

          {/* Bottom floating dock & contextual popovers */}
          <div
            ref={dockRef}
            className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex flex-col items-center gap-3 px-4"
          >
            {openPanel && (
              <div className="pointer-events-auto">
                {openPanel === "customize" && (
                  <CustomizePanel
                    custom={custom}
                    onChange={setCustom}
                    onReset={() => {
                      setTheme("system");
                      setCustom(DEFAULT_CUSTOMIZE);
                    }}
                  />
                )}
                {openPanel === "agent" && <AgentPanel onClose={() => setOpenPanel(null)} />}
                {openPanel === "category" && (
                  <CategoryPanel
                    categories={categories}
                    totalCount={icons.length}
                    selectedCategory={category}
                    variant={variant}
                    onSelectCategory={(cat) => {
                      setCategory(cat);
                      setOpenPanel(null);
                    }}
                    onSelectVariant={setVariant}
                  />
                )}
                {openPanel === "icon" && selectedIcon && (
                  <IconDetailPanel
                    icon={selectedIcon}
                    custom={custom}
                    onClose={() => setOpenPanel(null)}
                    onDownload={handleDownloadSvg}
                  />
                )}
              </div>
            )}

            <div className="pointer-events-auto flex w-full max-w-xl items-center gap-1.5 frame-2xl frame-p-1.5 bg-popover/95 shadow-xl backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setOpenPanel(openPanel === "category" ? null : "category")}
                aria-expanded={openPanel === "category"}
                className={cn(
                  "flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-inner px-3 text-ui-lg font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  openPanel === "category"
                    ? "bg-fill-active text-foreground"
                    : "text-foreground hover:bg-fill-hover",
                )}
              >
                <ShapesIcon size={16} className="text-muted-foreground" />
                <span className="max-w-24 truncate">
                  {category === "All" ? <T en="All" zh="全部" /> : category}
                </span>
                <ChevronDownIcon size={14} className="text-muted-foreground" />
              </button>

              <span aria-hidden className="h-4 w-px shrink-0 bg-border" />

              <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
                <SearchIcon size={16} className="shrink-0 text-muted-foreground" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t({
                    en: `Search ${stats.total || icons.length} icons`,
                    zh: `搜索 ${stats.total || icons.length} 个图标`,
                  })}
                  aria-label={t({ en: "Search icons", zh: "搜索图标" })}
                  className="min-w-0 flex-1 bg-transparent text-ui-lg text-foreground outline-none placeholder:text-fg-tertiary"
                />
                {query ? (
                  <button
                    type="button"
                    aria-label={t({ en: "Clear search", zh: "清空搜索" })}
                    onClick={() => setQuery("")}
                    className="inline-flex size-7 cursor-pointer items-center justify-center rounded-control text-muted-foreground hover:bg-fill-hover hover:text-foreground"
                  >
                    <XIcon size={14} />
                  </button>
                ) : (
                  <Kbd size="sm" className="hidden sm:inline-flex">
                    {isMac ? "⌘K" : "Ctrl K"}
                  </Kbd>
                )}
              </div>

              <Button
                variant={openPanel === "customize" ? "secondary" : "ghost"}
                size="icon"
                aria-label={t({ en: "Customize icons", zh: "自定义预览" })}
                aria-pressed={openPanel === "customize"}
                onClick={() => setOpenPanel(openPanel === "customize" ? null : "customize")}
              >
                <SlidersIcon />
              </Button>

              <Button
                variant={openPanel === "agent" ? "secondary" : "ghost"}
                size="icon"
                aria-label={t({ en: "Use in your agent", zh: "连接 MCP" })}
                aria-pressed={openPanel === "agent"}
                onClick={() => setOpenPanel(openPanel === "agent" ? null : "agent")}
              >
                <PlugIcon />
              </Button>
            </div>
          </div>

          <Drawer side="right" open={feedDrawerOpen} onOpenChange={setFeedDrawerOpen}>
            <DrawerContent className="w-80">
              <DrawerHeader>
                <DrawerTitle>
                  <T en="Cloud feed" zh="云端动态" />
                </DrawerTitle>
              </DrawerHeader>
              <DrawerBody>
                <FeedSidebarContent
                  icons={icons}
                  activity={activity}
                  todayIso={todayIso}
                  events={recentEvents}
                  onSelectIcon={(name) => {
                    setFeedDrawerOpen(false);
                    setSelectedName(name);
                    setOpenPanel("icon");
                  }}
                  onOpenAgent={() => {
                    setFeedDrawerOpen(false);
                    setOpenPanel("agent");
                  }}
                />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </div>
      </TooltipProvider>
    </LocaleProvider>
  );
}
