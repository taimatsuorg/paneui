import * as React from "react";

import { cn } from "@paneui/ui/lib/utils";
import { ActionSwapBlurButton, type ActionSwapItem } from "@paneui/ui/components/action-swap-blur";
import { Button } from "@paneui/ui/components/button";
import { Kbd } from "@paneui/ui/components/kbd";
import { LocaleProvider } from "@paneui/ui/components/locale-provider";
import { SegmentedControl, SegmentedControlItem } from "@paneui/ui/components/segmented-control";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paneui/ui/components/select";
import { ThemeSwitch } from "@paneui/ui/components/theme-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@paneui/ui/components/tooltip";
import {
  ArrowRightIcon,
  CheckIcon,
  GithubIcon,
  GlobeIcon,
  HistoryIcon,
  PaneuiLogoIcon,
  PlugIcon,
  RefreshIcon,
  SearchIcon,
  SparklesIcon,
  XIcon,
} from "@paneui/ui/icons";

import { ActivityDrawer } from "./activity-drawer";
import { ACTIVE_AGENT_WINDOW_MS, AgentWorkingCard } from "./agent-working-card";
import { AgentDialog } from "./agent-dialog";
import { InspectorSheet } from "./inspector-sheet";
import {
  COLOR_SWATCHES,
  DEFAULT_CUSTOMIZE,
  GITHUB_URL,
  GlyphSvg,
  SITE_URL,
  T,
  THEME_KEY,
  buildAgentPrompt,
  effectiveStrokeWidth,
  formatCustomSvg,
  setSiteLocale,
  useClipboard,
  useSiteLocale,
  useT,
  writeClipboardText,
  type ApiCatalogResponse,
  type CatalogStats,
  type CustomizeState,
  type IconCatalogItem,
  type IconEvent,
  type VariantFilter,
} from "./types";

const SAMPLE_SEARCH_TERMS = ["sparkles", "arrow", "bell", "terminal"] as const;

export function App() {
  const t = useT();
  const locale = useSiteLocale();
  const { copiedKey, copy } = useClipboard();
  const todayIso = React.useMemo(() => new Date().toISOString().slice(0, 10), []);

  React.useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const [icons, setIcons] = React.useState<IconCatalogItem[]>([]);
  const [stats, setStats] = React.useState<CatalogStats>({ total: 0, mcpAdded: 0, outline: 0, filled: 0, eventCount: 0 });
  const [recentEvents, setRecentEvents] = React.useState<IconEvent[]>([]);
  const [activity, setActivity] = React.useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState("");
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [placeholderIdx, setPlaceholderIdx] = React.useState(-1);
  const [category, setCategory] = React.useState("All");
  const [variant, setVariant] = React.useState<VariantFilter>("outline");
  const [selectedName, setSelectedName] = React.useState<string | null>(null);
  const [agentOpen, setAgentOpen] = React.useState(false);
  const [activityOpen, setActivityOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);
  const [custom, setCustom] = React.useState<CustomizeState>(DEFAULT_CUSTOMIZE);
  const [nowMs, setNowMs] = React.useState(() => Date.now());

  const searchRef = React.useRef<HTMLInputElement>(null);
  const toastTimerRef = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  const showToast = React.useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 1800);
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const cat = params.get("category");
    const v = params.get("variant");
    const iconParam = params.get("icon");
    if (q) setQuery(q);
    if (cat) setCategory(cat);
    if (v === "outline" || v === "filled") setVariant(v);
    if (iconParam) setSelectedName(iconParam);
  }, []);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const setOrDelete = (k: string, val: string | null) => {
      if (val) url.searchParams.set(k, val);
      else url.searchParams.delete(k);
    };
    setOrDelete("q", query.trim() || null);
    setOrDelete("category", category !== "All" ? category : null);
    setOrDelete("variant", variant !== "outline" ? variant : null);
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
      setNowMs(Date.now());
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load cloud icons.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCloudCatalog();
    const onFocus = () => fetchCloudCatalog(true);
    window.addEventListener("focus", onFocus);
    const pollId = window.setInterval(() => {
      if (!document.hidden) fetchCloudCatalog(true);
      else setNowMs(Date.now());
    }, 8000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(pollId);
    };
  }, [fetchCloudCatalog]);

  // Gently cycle search suggestion hints when idle
  React.useEffect(() => {
    if (searchFocused || query.trim() !== "") return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % (SAMPLE_SEARCH_TERMS.length + 1) - 1);
    }, 3200);
    return () => window.clearInterval(id);
  }, [searchFocused, query]);

  const variantIcons = React.useMemo(
    () => icons.filter((item) => item.variant === variant),
    [icons, variant],
  );

  const categories = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of variantIcons) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [variantIcons]);

  const categoryItems = React.useMemo(() => {
    const map: Record<string, string> = {
      All: `${t({ en: "All", zh: "全部" })} (${variantIcons.length})`,
    };
    for (const cat of categories) {
      map[cat.name] = `${cat.name} (${cat.count})`;
    }
    return map;
  }, [categories, variantIcons.length, t]);

  const filtered = React.useMemo(() => {
    const terms = query.trim().toLowerCase().split(/[\s,]+/).filter(Boolean);
    return variantIcons.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (terms.length === 0) return true;
      const hay = `${item.name} ${item.component} ${item.category} ${item.tags.join(" ")}`.toLowerCase();
      return terms.every((term) => hay.includes(term));
    });
  }, [variantIcons, query, category]);

  const handleVariantChange = React.useCallback(
    (next: VariantFilter) => {
      setVariant(next);
      if (category !== "All" && !icons.some((i) => i.variant === next && i.category === category)) {
        setCategory("All");
      }
    },
    [category, icons],
  );

  const selectIconByName = React.useCallback(
    (name: string) => {
      const match = icons.find((i) => i.name === name);
      if (match && match.variant !== variant) {
        setVariant(match.variant);
      }
      setSelectedName(name);
    },
    [icons, variant],
  );

  const activeAgentWork = React.useMemo(() => {
    if (icons.length === 0 || recentEvents.length === 0) return null;
    const byName = new Map(icons.map((item) => [item.name, item]));
    for (const ev of recentEvents) {
      if (ev.action === "delete") continue;
      const ts = Date.parse(ev.createdAt);
      if (!Number.isFinite(ts) || nowMs - ts > ACTIVE_AGENT_WINDOW_MS) continue;
      const matched = byName.get(ev.iconName);
      if (matched) return { event: ev, icon: matched };
    }
    return null;
  }, [icons, recentEvents, nowMs]);

  const selectedIcon = React.useMemo(
    () => (selectedName ? icons.find((i) => i.name === selectedName) ?? null : null),
    [icons, selectedName],
  );

  const selectedIndex = React.useMemo(() => {
    if (!selectedName) return -1;
    return filtered.findIndex((i) => i.name === selectedName);
  }, [filtered, selectedName]);

  const stepSelection = React.useCallback(
    (delta: number) => {
      if (filtered.length === 0) return;
      const base = selectedIndex >= 0 ? selectedIndex : 0;
      const next = (base + delta + filtered.length) % filtered.length;
      setSelectedName(filtered[next].name);
    },
    [filtered, selectedIndex],
  );

  // Global keyboard shortcuts: / and Cmd/Ctrl+K focus search, Escape closes inspector, Left/Right steps icons
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inEditable =
        !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !inEditable) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "Escape") {
        if (selectedName && !agentOpen && !activityOpen) {
          setSelectedName(null);
        }
        return;
      }
      if (selectedName && !agentOpen && !activityOpen && !inEditable) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          stepSelection(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          stepSelection(1);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedName, agentOpen, activityOpen, stepSelection]);

  const focusSearchBar = React.useCallback(() => {
    searchRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    searchRef.current?.focus();
  }, []);

  const handleGlyphClick = React.useCallback(
    async (e: React.MouseEvent, icon: IconCatalogItem) => {
      if (e.shiftKey) {
        const svg = formatCustomSvg(icon, custom);
        const ok = await writeClipboardText(svg);
        if (ok) {
          showToast(t({ en: `Copied ${icon.name}.svg`, zh: `已复制 ${icon.name}.svg` }));
        }
        return;
      }
      setSelectedName((prev) => (prev === icon.name ? null : icon.name));
    },
    [custom, showToast, t],
  );

  const origin = typeof window !== "undefined" ? window.location.origin : "https://icons.paneui.dev";
  const mcpUrl = `${origin}/mcp`;
  const totalCount = stats.total || icons.length;
  const activeSwatch = COLOR_SWATCHES[custom.colorIndex] ?? COLOR_SWATCHES[0];
  const colorCss = activeSwatch.css === "currentColor" ? undefined : activeSwatch.css;
  const hasFilters = query.trim() !== "" || category !== "All";
  const gridGlyphSize = Math.min(custom.size, 36);
  const gridStrokeWidth = effectiveStrokeWidth(custom.stroke, custom.size, custom.strokeScaling);

  const activeVariantTotal = variantIcons.length || totalCount;
  const searchPlaceholder =
    placeholderIdx >= 0
      ? t({
          en: `Try "${SAMPLE_SEARCH_TERMS[placeholderIdx]}"`,
          zh: `试试搜索 "${SAMPLE_SEARCH_TERMS[placeholderIdx]}"`,
        })
      : t({
          en: `Search ${activeVariantTotal || ""} icons`.trim(),
          zh: activeVariantTotal ? `搜索 ${activeVariantTotal} 个图标` : "搜索图标",
        });

  const promptBtnItems = React.useMemo<ActionSwapItem[]>(
    () => [
      {
        value: "copy",
        ariaLabel: t({ en: "Copy prompt for AI agents", zh: "复制 AI Agent 提示词" }),
        icon: <SparklesIcon data-icon="inline-start" />,
        label: (
          <span className="inline-flex items-center gap-1.5">
            <span>
              <T en="Copy prompt for AI agents" zh="复制 AI Agent 提示词" />
            </span>
            <ArrowRightIcon size={14} className="rtl:-scale-x-100" />
          </span>
        ),
      },
      {
        value: "copied",
        ariaLabel: t({ en: "Prompt copied for AI agents", zh: "已复制 AI Agent 提示词" }),
        icon: <CheckIcon data-icon="inline-start" className="text-success-text" />,
        label: t({ en: "Copied agent prompt", zh: "已复制 Agent 提示词" }),
      },
    ],
    [t],
  );

  return (
    <LocaleProvider locale={locale === "zh" ? "zh-CN" : "en"}>
      <TooltipProvider delay={250}>
        <div className="flex min-h-svh flex-col bg-background text-foreground">
          {/* Top navbar */}
          <header className="sticky top-0 z-30 h-14 bg-background/90 backdrop-blur-md">
            <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between gap-4 px-4 md:px-6">
              <div className="flex min-w-0 items-center gap-2.5">
                <a
                  href={SITE_URL}
                  className="inline-flex shrink-0 items-center gap-2 rounded-control text-ui-lg font-semibold icon-bold text-foreground outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <PaneuiLogoIcon size={18} />
                  <span>PaneUI</span>
                </a>
                <span aria-hidden className="text-muted-foreground">
                  /
                </span>
                <a
                  href="/"
                  className="rounded-control text-ui-lg font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <T en="Icons" zh="图标库" />
                </a>
              </div>

              <nav aria-label={t({ en: "Primary navigation", zh: "主导航" })} className="flex shrink-0 items-center gap-1">
                <a
                  href={`${SITE_URL}/docs`}
                  className="hidden h-8 items-center rounded-control px-2.5 text-ui font-medium text-muted-foreground transition-colors duration-150 outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
                >
                  <T en="Docs" zh="文档" />
                </a>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={() => setAgentOpen(true)}>
                  <PlugIcon data-icon="inline-start" />
                  <span>MCP</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  aria-label={t({ en: "Cloud activity", zh: "云端动态" })}
                  onClick={() => setActivityOpen(true)}
                >
                  <HistoryIcon />
                </Button>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => setActivityOpen(true)}>
                  <HistoryIcon data-icon="inline-start" />
                  <span>
                    <T en="Activity" zh="动态" />
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:inline-flex"
                  aria-label={t({ en: "Focus icon search", zh: "聚焦图标搜索" })}
                  onClick={focusSearchBar}
                >
                  <SearchIcon />
                </Button>
                <button
                  type="button"
                  onClick={() => setSiteLocale(locale === "en" ? "zh" : "en")}
                  aria-label={t({ en: "Switch language", zh: "切换语言" })}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control px-2 text-ui font-medium text-muted-foreground transition-colors duration-150 outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <GlobeIcon size={16} />
                  <span>{locale === "en" ? "中文" : "EN"}</span>
                </button>
                <ThemeSwitch storageKey={THEME_KEY} />
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="hidden size-8 items-center justify-center rounded-control text-muted-foreground transition-colors duration-150 outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
                >
                  <GithubIcon size={16} />
                </a>
              </nav>
            </div>
          </header>

          {/* Editorial Hero */}
          <section className="mx-auto w-full max-w-[1440px] px-4 pt-5 pb-5 md:px-6 md:pt-7 md:pb-6">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-10">
              <div className="min-w-0">
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
                  <T en="Icons shaped for interfaces." zh="为界面而生的图标。" />
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <ActionSwapBlurButton
                    items={promptBtnItems}
                    value={copiedKey === "hero-prompt" ? "copied" : "copy"}
                    cycle={false}
                    variant="inverse"
                    size="lg"
                    onClick={async () => {
                      const ok = await copy("hero-prompt", buildAgentPrompt(mcpUrl, totalCount, locale));
                      if (ok) {
                        showToast(t({ en: "Copied AI agent prompt", zh: "已复制 AI Agent 提示词" }));
                      }
                    }}
                  />
                  <Button variant="outline" size="lg" onClick={() => setAgentOpen(true)}>
                    <PlugIcon data-icon="inline-start" />
                    <T en="Connect MCP" zh="连接 MCP" />
                  </Button>
                </div>
              </div>

              {activeAgentWork && (
                <div className="justify-self-start md:justify-self-end">
                  <AgentWorkingCard
                    event={activeAgentWork.event}
                    icon={activeAgentWork.icon}
                    onSelectIcon={selectIconByName}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Sticky Search & Filter Toolbar */}
          <div className="sticky top-14 z-20 border-b border-border/70 bg-background/95 py-3 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-2 px-4 sm:flex-nowrap md:px-6">
              <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg bg-card px-3 shadow-raised transition-shadow duration-150 focus-within:ring-2 focus-within:ring-ring">
                <SearchIcon size={16} className="shrink-0 text-muted-foreground" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={t({ en: "Search icons", zh: "搜索图标" })}
                  className="min-w-0 flex-1 bg-transparent text-ui-lg text-foreground outline-none placeholder:text-fg-tertiary"
                />
                {query ? (
                  <button
                    type="button"
                    aria-label={t({ en: "Clear search", zh: "清空搜索" })}
                    onClick={() => {
                      setQuery("");
                      searchRef.current?.focus();
                    }}
                    className="relative inline-flex size-6 cursor-pointer items-center justify-center rounded-control-sm text-muted-foreground transition-colors duration-150 outline-none after:absolute after:-inset-1 hover:bg-fill-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <XIcon size={14} />
                  </button>
                ) : (
                  <Kbd size="sm" className="hidden sm:inline-flex">
                    /
                  </Kbd>
                )}
              </div>

              <SegmentedControl
                size="lg"
                value={variant}
                onValueChange={(v) => handleVariantChange(v as VariantFilter)}
                aria-label={t({ en: "Icon style", zh: "图标风格" })}
                className="shrink-0"
              >
                <SegmentedControlItem value="outline">
                  <span aria-hidden className="size-2.5 rounded-xs border-[1.5px] border-current" />
                  <T en="Outline" zh="线性" />
                </SegmentedControlItem>
                <SegmentedControlItem value="filled">
                  <span aria-hidden className="size-2.5 rounded-xs bg-current" />
                  <T en="Filled" zh="填充" />
                </SegmentedControlItem>
              </SegmentedControl>

              <Select
                size="lg"
                items={categoryItems}
                value={category}
                onValueChange={(val) => {
                  if (val) setCategory(val);
                }}
              >
                <SelectTrigger className="w-full shrink-0 sm:w-48" aria-label={t({ en: "Category filter", zh: "分类筛选" })}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="All">
                    <T en={`All (${variantIcons.length})`} zh={`全部 (${variantIcons.length})`} />
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filter Status Strip */}
          {hasFilters && (
            <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-2 px-4 pt-3 text-ui-sm text-muted-foreground md:px-6">
              <span className="font-mono tabular-nums">
                <T en={`${filtered.length} matching icons`} zh={`匹配 ${filtered.length} 个图标`} />
              </span>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
              >
                <XIcon data-icon="inline-start" />
                <T en="Clear filters" zh="重置筛选" />
              </Button>
            </div>
          )}

          {/* Main Full-Width Icon Wall */}
          <main
            className={cn(
              "mx-auto w-full max-w-[1440px] flex-1 px-4 pt-4 md:px-6",
              selectedIcon ? "pb-80" : "pb-16",
            )}
          >
            {loading && icons.length === 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-1 sm:grid-cols-[repeat(auto-fill,minmax(60px,1fr))]">
                {Array.from({ length: 60 }, (_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-xl bg-fill-hover" />
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
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-card px-6 py-16 text-center shadow-raised">
                <SearchIcon size={24} className="text-muted-foreground" />
                <p className="text-ui-lg font-medium text-foreground">
                  <T en="No icons match your filters." zh="没有找到匹配的图标。" />
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setCategory("All");
                  }}
                >
                  <T en="Clear filters" zh="清空筛选" />
                </Button>
              </div>
            ) : (
              <div
                data-icon-grid
                className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-1 sm:grid-cols-[repeat(auto-fill,minmax(60px,1fr))]"
              >
                {filtered.map((icon) => {
                  const isSelected = selectedName === icon.name;
                  return (
                    <Tooltip key={icon.name}>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            data-icon-cell={icon.name}
                            aria-label={icon.name}
                            aria-pressed={isSelected}
                            onClick={(e) => handleGlyphClick(e, icon)}
                            className={cn(
                              "group relative flex aspect-square cursor-pointer items-center justify-center rounded-xl transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              isSelected
                                ? "bg-primary-subtle text-primary-text ring-1 ring-primary-border"
                                : "text-foreground hover:bg-fill-hover active:bg-fill-active",
                            )}
                          />
                        }
                      >
                        <GlyphSvg
                          body={icon.body}
                          size={gridGlyphSize}
                          strokeWidth={gridStrokeWidth}
                          color={colorCss}
                        />
                        {icon.source === "mcp" && (
                          <span aria-hidden className="absolute top-1.5 end-1.5 size-1.5 rounded-full bg-primary" />
                        )}
                      </TooltipTrigger>
                      <TooltipContent side="bottom">{icon.name}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </main>

          {/* Minimal footer */}
          <footer className="border-t border-border/60 py-5 text-ui-xs text-muted-foreground">
            <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 md:px-6">
              <span className="tabular-nums">
                <T
                  en={`Shift+Click any icon to copy SVG · ${totalCount} cloud icons`}
                  zh={`按住 Shift 点击图标可直接复制 SVG · 共 ${totalCount} 枚云端图标`}
                />
              </span>
              <div className="flex items-center gap-4">
                <a href={`${SITE_URL}/docs`} className="transition-colors duration-150 hover:text-foreground">
                  <T en="PaneUI Docs" zh="PaneUI 文档" />
                </a>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="transition-colors duration-150 hover:text-foreground">
                  GitHub
                </a>
              </div>
            </div>
          </footer>

          {/* Toast feedback */}
          {toastMsg && (
            <div
              role="status"
              aria-live="polite"
              className={cn(
                "pointer-events-none fixed left-1/2 z-50 -translate-x-1/2 rounded-full bg-surface-standout px-3.5 py-1.5 text-ui-xs font-medium text-standout-foreground shadow-xl transition-[bottom] duration-200",
                selectedIcon ? "bottom-72 md:bottom-76" : "bottom-6",
              )}
            >
              {toastMsg}
            </div>
          )}

          {/* Fixed Bottom Inspector Sheet */}
          <InspectorSheet
            icon={selectedIcon}
            open={!!selectedIcon}
            currentIndex={selectedIndex}
            totalCount={filtered.length}
            custom={custom}
            onChangeCustom={setCustom}
            onResetCustom={() => setCustom(DEFAULT_CUSTOMIZE)}
            onPrev={() => stepSelection(-1)}
            onNext={() => stepSelection(1)}
            onClose={() => setSelectedName(null)}
            onFilterCategory={(cat) => setCategory(cat)}
            onFilterTag={(tag) => setQuery(tag)}
            onToast={showToast}
          />

          <AgentDialog open={agentOpen} onOpenChange={setAgentOpen} totalCount={totalCount} />

          <ActivityDrawer
            open={activityOpen}
            onOpenChange={setActivityOpen}
            icons={icons}
            stats={stats}
            activity={activity}
            events={recentEvents}
            todayIso={todayIso}
            onSelectIcon={selectIconByName}
            onOpenAgent={() => setAgentOpen(true)}
            onSync={() => fetchCloudCatalog(false)}
          />
        </div>
      </TooltipProvider>
    </LocaleProvider>
  );
}
