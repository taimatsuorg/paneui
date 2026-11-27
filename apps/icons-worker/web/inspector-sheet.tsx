import * as React from "react";

import { cn } from "@paneui/ui/lib/utils";
import { ActionSwapBlurButton, type ActionSwapItem } from "@paneui/ui/components/action-swap-blur";
import { Badge } from "@paneui/ui/components/badge";
import { Button } from "@paneui/ui/components/button";
import { Checkbox } from "@paneui/ui/components/checkbox";
import { Menu, MenuContent, MenuGroup, MenuItem, MenuLabel, MenuTrigger } from "@paneui/ui/components/menu";
import { Slider } from "@paneui/ui/components/slider";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CodeIcon,
  CopyIcon,
  DownloadIcon,
  XIcon,
} from "@paneui/ui/icons";

import {
  COLOR_SWATCHES,
  DEFAULT_CUSTOMIZE,
  GlyphSvg,
  SIZE_STRIP,
  T,
  copyPngBlob,
  downloadBlob,
  effectiveStrokeWidth,
  formatBase64,
  formatCssMask,
  formatCustomSvg,
  formatDataUri,
  formatJsxUsage,
  formatReactSnippet,
  rasterizeSvgToPngBlob,
  useClipboard,
  useT,
  type CustomizeState,
  type IconCatalogItem,
} from "./types";

type SnippetTab = "react" | "jsx" | "svg" | "cli" | "mcp";

export function InspectorSheet({
  icon,
  open,
  currentIndex,
  totalCount,
  custom,
  onChangeCustom,
  onResetCustom,
  onPrev,
  onNext,
  onClose,
  onFilterCategory,
  onFilterTag,
  onToast,
}: {
  icon: IconCatalogItem | null;
  open: boolean;
  currentIndex: number;
  totalCount: number;
  custom: CustomizeState;
  onChangeCustom: React.Dispatch<React.SetStateAction<CustomizeState>>;
  onResetCustom: () => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onFilterCategory: (category: string) => void;
  onFilterTag: (tag: string) => void;
  onToast: (msg: string) => void;
}) {
  const t = useT();
  const { copiedKey, copy } = useClipboard();
  const [snippetTab, setSnippetTab] = React.useState<SnippetTab>("react");
  const [customizeOpen, setCustomizeOpen] = React.useState(true);

  const activeSwatch = COLOR_SWATCHES[custom.colorIndex] ?? COLOR_SWATCHES[0];
  const colorCss = activeSwatch.css;
  const displaySwatchColor = activeSwatch.previewCss;
  const customSvg = icon ? formatCustomSvg(icon, custom) : "";
  const isDefault =
    custom.size === DEFAULT_CUSTOMIZE.size &&
    custom.colorIndex === DEFAULT_CUSTOMIZE.colorIndex &&
    custom.stroke === DEFAULT_CUSTOMIZE.stroke &&
    custom.strokeScaling === DEFAULT_CUSTOMIZE.strokeScaling;

  const snippetText = React.useMemo(() => {
    if (!icon) return "";
    switch (snippetTab) {
      case "react":
        return formatReactSnippet(icon, custom);
      case "jsx":
        return formatJsxUsage(icon, custom);
      case "svg":
        return customSvg;
      case "cli":
        return "npx shadcn@latest add @paneui/icons";
      case "mcp":
        return `get_icon({ name: "${icon.name}" })`;
    }
  }, [icon, custom, customSvg, snippetTab]);

  const copyNameItems = React.useMemo<ActionSwapItem[]>(
    () => [
      {
        value: "copy",
        label: t({ en: "Copy icon name", zh: "复制图标名" }),
        icon: <CopyIcon />,
        ariaLabel: t({ en: "Copy icon name", zh: "复制图标名" }),
      },
      {
        value: "copied",
        label: t({ en: "Copied icon name", zh: "已复制图标名" }),
        icon: <CheckIcon className="text-success-text" />,
        ariaLabel: t({ en: "Copied icon name", zh: "已复制图标名" }),
      },
    ],
    [t],
  );

  const copyComponentItems = React.useMemo<ActionSwapItem[]>(
    () => [
      {
        value: "copy",
        label: t({ en: "Copy component name", zh: "复制组件名" }),
        icon: <CopyIcon />,
        ariaLabel: t({ en: "Copy component name", zh: "复制组件名" }),
      },
      {
        value: "copied",
        label: t({ en: "Copied component name", zh: "已复制组件名" }),
        icon: <CheckIcon className="text-success-text" />,
        ariaLabel: t({ en: "Copied component name", zh: "已复制组件名" }),
      },
    ],
    [t],
  );

  const copySnippetItems = React.useMemo<ActionSwapItem[]>(
    () => [
      {
        value: "copy",
        label: t({ en: "Copy", zh: "复制" }),
        icon: <CopyIcon data-icon="inline-start" />,
        ariaLabel: t({ en: "Copy snippet", zh: "复制代码片段" }),
      },
      {
        value: "copied",
        label: t({ en: "Copied", zh: "已复制" }),
        icon: <CheckIcon data-icon="inline-start" className="text-success-text" />,
        ariaLabel: t({ en: "Copied snippet", zh: "已复制代码片段" }),
      },
    ],
    [t],
  );

  const copySvgItems = React.useMemo<ActionSwapItem[]>(
    () => [
      {
        value: "copy",
        label: t({ en: "Copy SVG", zh: "复制 SVG" }),
        icon: <CodeIcon data-icon="inline-start" />,
        ariaLabel: t({ en: "Copy SVG", zh: "复制 SVG" }),
      },
      {
        value: "copied",
        label: t({ en: "Copied", zh: "已复制" }),
        icon: <CheckIcon data-icon="inline-start" />,
        ariaLabel: t({ en: "Copied SVG", zh: "已复制 SVG" }),
      },
    ],
    [t],
  );

  const handleCopyText = React.useCallback(
    async (key: string, value: string, label: string) => {
      const ok = await copy(key, value);
      if (ok) {
        onToast(label);
      }
    },
    [copy, onToast],
  );

  const handleCopyPng = React.useCallback(async () => {
    if (!icon) return;
    try {
      const blob = await rasterizeSvgToPngBlob(icon, custom, custom.size * 2);
      const copied = await copyPngBlob(blob);
      if (copied) {
        onToast(t({ en: "Copied PNG image", zh: "已复制 PNG 图片" }));
      } else {
        downloadBlob(blob, `${icon.name}@2x.png`);
        onToast(t({ en: "Downloaded PNG image", zh: "已下载 PNG 图片" }));
      }
    } catch {
      onToast(t({ en: "PNG export failed", zh: "PNG 导出失败" }));
    }
  }, [icon, custom, onToast, t]);

  const handleDownloadSvg = React.useCallback(() => {
    if (!icon) return;
    downloadBlob(new Blob([customSvg], { type: "image/svg+xml;charset=utf-8" }), `${icon.name}.svg`);
  }, [icon, customSvg]);

  const handleDownloadPng = React.useCallback(
    async (scale: 1 | 2 | 3 | 4) => {
      if (!icon) return;
      try {
        const px = custom.size * scale;
        const blob = await rasterizeSvgToPngBlob(icon, custom, px);
        downloadBlob(blob, `${icon.name}-${scale}x.png`);
      } catch {
        onToast(t({ en: "PNG download failed", zh: "PNG 下载失败" }));
      }
    },
    [icon, custom, onToast, t],
  );

  return (
    <aside
      data-slot="icon-inspector"
      data-open={open && icon ? "" : undefined}
      inert={!open || !icon ? true : undefined}
      aria-label={t({ en: "Icon inspector", zh: "图标检查器" })}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 translate-y-full bg-popover text-popover-foreground shadow-xl transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        open && icon && "translate-y-0",
      )}
    >
      {icon ? (
        <div className="flex max-h-[min(84dvh,29rem)] w-full flex-col">
          {/* Mobile grab handle */}
          <div className="grid place-items-center pt-2 md:hidden" aria-hidden>
            <span className="h-1 w-9 rounded-full bg-border-strong" />
          </div>

          {/* Header bar */}
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary-text">
                <GlyphSvg body={icon.body} size={20} strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-mono text-ui-lg font-semibold text-foreground">{icon.name}</span>
                  <ActionSwapBlurButton
                    items={copyNameItems}
                    value={copiedKey === "name" ? "copied" : "copy"}
                    cycle={false}
                    iconOnly
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      handleCopyText("name", icon.name, t({ en: `Copied "${icon.name}"`, zh: `已复制 ${icon.name}` }))
                    }
                  />
                  {icon.source === "mcp" && (
                    <Badge variant="primary" size="sm">
                      MCP
                    </Badge>
                  )}
                  {icon.variant === "filled" && (
                    <Badge variant="chip" size="sm">
                      <T en="Filled" zh="填充" />
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-mono text-ui-sm text-muted-foreground">{icon.component}</span>
                  <ActionSwapBlurButton
                    items={copyComponentItems}
                    value={copiedKey === "component" ? "copied" : "copy"}
                    cycle={false}
                    iconOnly
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      handleCopyText(
                        "component",
                        icon.component,
                        t({ en: `Copied "${icon.component}"`, zh: `已复制 ${icon.component}` }),
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {totalCount > 0 && currentIndex >= 0 && (
                <span className="me-1.5 hidden font-mono text-ui-xs text-muted-foreground tabular-nums sm:inline">
                  {currentIndex + 1} / {totalCount}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                disabled={totalCount <= 1}
                aria-label={t({ en: "Previous icon", zh: "上一个图标" })}
                onClick={onPrev}
              >
                <ChevronLeftIcon className="rtl:-scale-x-100" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                disabled={totalCount <= 1}
                aria-label={t({ en: "Next icon", zh: "下一个图标" })}
                onClick={onNext}
              >
                <ChevronRightIcon className="rtl:-scale-x-100" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={t({ en: "Close inspector", zh: "关闭检查器" })}
                onClick={onClose}
              >
                <XIcon />
              </Button>
            </div>
          </div>

          {/* 3-Column body */}
          <div className="grid min-h-0 flex-1 overflow-y-auto border-t border-border md:grid-cols-[minmax(0,1fr)_19.5rem] md:overflow-hidden lg:grid-cols-[minmax(0,1fr)_19.5rem_19rem]">
            {/* Col 1: Snippet format tabs, code block, category & tags */}
            <div className="flex min-w-0 flex-col gap-3 p-4 md:overflow-y-auto md:px-6">
              <div role="tablist" aria-label={t({ en: "Code target", zh: "代码目标" })} className="flex flex-wrap items-center gap-1">
                {(
                  [
                    { id: "react", en: "React", zh: "React" },
                    { id: "jsx", en: "JSX", zh: "JSX" },
                    { id: "svg", en: "SVG", zh: "SVG" },
                    { id: "cli", en: "CLI", zh: "CLI" },
                    { id: "mcp", en: "MCP", zh: "MCP" },
                  ] as const
                ).map((item) => {
                  const selected = snippetTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setSnippetTab(item.id)}
                      className={cn(
                        "inline-flex h-7 cursor-pointer items-center rounded-control px-2.5 text-ui-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <T en={item.en} zh={item.zh} />
                    </button>
                  );
                })}
              </div>

              <div className="relative rounded-xl bg-shell p-3 pe-22 font-mono text-ui-sm leading-relaxed text-foreground">
                <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-all">
                  <code>{snippetText}</code>
                </pre>
                <ActionSwapBlurButton
                  items={copySnippetItems}
                  value={copiedKey === `snippet-${snippetTab}` ? "copied" : "copy"}
                  cycle={false}
                  variant="outline"
                  size="xs"
                  className="absolute top-2.5 end-2.5 bg-popover"
                  onClick={() =>
                    handleCopyText(
                      `snippet-${snippetTab}`,
                      snippetText,
                      t({ en: "Copied snippet", zh: "已复制代码片段" }),
                    )
                  }
                />
              </div>

              <div className="flex flex-col gap-2 text-ui-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground">
                    <T en="Category" zh="分类" />
                  </span>
                  <button
                    type="button"
                    onClick={() => onFilterCategory(icon.category)}
                    className="inline-flex h-6 cursor-pointer items-center rounded-full bg-secondary px-2.5 text-ui-xs font-medium text-foreground transition-colors duration-150 outline-none hover:bg-fill-active focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {icon.category}
                  </button>
                </div>

                {icon.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-muted-foreground">
                      <T en="Tags" zh="标签" />
                    </span>
                    {icon.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => onFilterTag(tag)}
                        className="inline-flex h-6 cursor-pointer items-center rounded-full bg-secondary px-2.5 text-ui-xs text-muted-foreground transition-colors duration-150 outline-none hover:bg-fill-active hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Col 2: Quick Copy / Export + Multi-size Strip */}
            <div className="flex flex-col justify-between gap-3 border-t border-border p-4 md:border-t-0 md:border-s">
              <div className="flex flex-wrap items-center gap-1.5">
                <ActionSwapBlurButton
                  items={copySvgItems}
                  value={copiedKey === "svg-main" ? "copied" : "copy"}
                  cycle={false}
                  variant="default"
                  size="sm"
                  onClick={() =>
                    handleCopyText("svg-main", customSvg, t({ en: `Copied ${icon.name}.svg`, zh: `已复制 ${icon.name}.svg` }))
                  }
                />

                <Menu>
                  <MenuTrigger
                    render={
                      <Button variant="outline" size="sm">
                        <CopyIcon data-icon="inline-start" />
                        <T en="Copy as" zh="复制为" />
                        <ChevronDownIcon data-icon="inline-end" />
                      </Button>
                    }
                  />
                  <MenuContent side="top" align="start">
                    <MenuGroup>
                      <MenuLabel>
                        <T en="Copy format" zh="复制格式" />
                      </MenuLabel>
                      <MenuItem onClick={() => handleCopyText("menu-svg", customSvg, "Copied SVG")}>SVG</MenuItem>
                      <MenuItem onClick={() => handleCopyText("menu-jsx", formatJsxUsage(icon, custom), "Copied JSX")}>
                        JSX
                      </MenuItem>
                      <MenuItem
                        onClick={() =>
                          handleCopyText("menu-react", formatReactSnippet(icon, custom), t({ en: "Copied React snippet", zh: "已复制 React 导入" }))
                        }
                      >
                        <T en="React import" zh="React 导入" />
                      </MenuItem>
                      <MenuItem onClick={() => handleCopyText("menu-uri", formatDataUri(customSvg), "Copied Data URI")}>
                        Data URI
                      </MenuItem>
                      <MenuItem onClick={() => handleCopyText("menu-b64", formatBase64(customSvg), "Copied Base64")}>
                        Base64
                      </MenuItem>
                      <MenuItem onClick={() => handleCopyText("menu-css", formatCssMask(customSvg), "Copied CSS mask")}>
                        CSS mask
                      </MenuItem>
                      <MenuItem onClick={() => handleCopyText("menu-name", icon.name, "Copied icon name")}>
                        <T en="Icon name" zh="图标名称" />
                      </MenuItem>
                      <MenuItem onClick={() => handleCopyText("menu-comp", icon.component, "Copied component name")}>
                        <T en="Component name" zh="组件名称" />
                      </MenuItem>
                      <MenuItem onClick={handleCopyPng}>
                        <T en="PNG image" zh="PNG 图片" />
                      </MenuItem>
                    </MenuGroup>
                  </MenuContent>
                </Menu>

                <Menu>
                  <MenuTrigger
                    render={
                      <Button variant="outline" size="sm">
                        <DownloadIcon data-icon="inline-start" />
                        <T en="Download" zh="下载" />
                        <ChevronDownIcon data-icon="inline-end" />
                      </Button>
                    }
                  />
                  <MenuContent side="top" align="start">
                    <MenuGroup>
                      <MenuLabel>
                        <T en="Export file" zh="导出文件" />
                      </MenuLabel>
                      <MenuItem onClick={handleDownloadSvg}>SVG</MenuItem>
                      <MenuItem onClick={() => handleDownloadPng(1)}>PNG 1×</MenuItem>
                      <MenuItem onClick={() => handleDownloadPng(2)}>PNG 2×</MenuItem>
                      <MenuItem onClick={() => handleDownloadPng(3)}>PNG 3×</MenuItem>
                      <MenuItem onClick={() => handleDownloadPng(4)}>PNG 4×</MenuItem>
                    </MenuGroup>
                  </MenuContent>
                </Menu>
              </div>

              <div className="flex flex-1 items-end justify-between gap-1 rounded-xl bg-shell px-2 py-3">
                {SIZE_STRIP.map((px) => {
                  const active = custom.size === px;
                  const sw = effectiveStrokeWidth(custom.stroke, px, custom.strokeScaling);
                  return (
                    <button
                      key={px}
                      type="button"
                      aria-label={t({ en: `Preview at ${px}px`, zh: `以 ${px}px 预览` })}
                      aria-pressed={active}
                      onClick={() => onChangeCustom((prev) => ({ ...prev, size: px }))}
                      className={cn(
                        "flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-end gap-1.5 rounded-lg px-1 py-1.5 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "bg-fill-active text-foreground"
                          : "text-foreground/85 hover:bg-fill-hover hover:text-foreground",
                      )}
                    >
                      <div className="flex h-12 items-center justify-center">
                        <GlyphSvg body={icon.body} size={px} strokeWidth={sw} color={displaySwatchColor} />
                      </div>
                      <span className="font-mono text-ui-2xs text-muted-foreground tabular-nums">{px}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Col 3: Customize Controls */}
            <div className="flex flex-col gap-3 border-t border-border p-4 md:col-span-2 lg:col-span-1 lg:border-t-0 lg:border-s">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setCustomizeOpen((prev) => !prev)}
                  aria-expanded={customizeOpen}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-control text-ui-lg font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring lg:pointer-events-none"
                >
                  <T en="Customize" zh="自定义" />
                  <ChevronDownIcon
                    size={14}
                    className={cn("text-muted-foreground transition-transform duration-150 lg:hidden", !customizeOpen && "-rotate-90")}
                  />
                </button>
                <Button variant="outline" size="xs" disabled={isDefault} onClick={onResetCustom}>
                  <T en="Reset" zh="重置" />
                </Button>
              </div>

              {customizeOpen && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-ui-sm">
                      <span className="text-muted-foreground">
                        <T en="Size" zh="尺寸" />
                      </span>
                      <span className="font-mono text-foreground tabular-nums">{custom.size}px</span>
                    </div>
                    <Slider
                      size="sm"
                      min={16}
                      max={48}
                      step={2}
                      value={custom.size}
                      aria-label={t({ en: "Size in pixels", zh: "像素尺寸" })}
                      onValueChange={(v) => {
                        const next = Array.isArray(v) ? v[0] : v;
                        if (typeof next === "number") onChangeCustom((prev) => ({ ...prev, size: next }));
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-ui-sm">
                      <span className="text-muted-foreground">
                        <T en="Stroke width" zh="描边粗细" />
                      </span>
                      <span className="font-mono text-foreground tabular-nums">{custom.stroke}</span>
                    </div>
                    <Slider
                      size="sm"
                      min={1}
                      max={2.5}
                      step={0.25}
                      value={custom.stroke}
                      aria-label={t({ en: "Stroke width", zh: "描边粗细" })}
                      onValueChange={(v) => {
                        const next = Array.isArray(v) ? v[0] : v;
                        if (typeof next === "number") onChangeCustom((prev) => ({ ...prev, stroke: next }));
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2 text-ui-sm">
                      <span className="text-muted-foreground">
                        <T en="Color" zh="颜色" />
                      </span>
                      <span className="font-mono text-ui-xs text-foreground">{colorCss}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {COLOR_SWATCHES.map((swatch, idx) => {
                        const active = custom.colorIndex === idx;
                        return (
                          <button
                            key={swatch.id}
                            type="button"
                            aria-label={t(swatch.label)}
                            aria-pressed={active}
                            onClick={() => onChangeCustom((prev) => ({ ...prev, colorIndex: idx }))}
                            className={cn(
                              "relative size-5 cursor-pointer rounded-full transition-shadow duration-150 outline-none after:absolute after:-inset-1 focus-visible:ring-2 focus-visible:ring-ring",
                              active && "ring-2 ring-ring ring-offset-2 ring-offset-popover",
                            )}
                            style={{ backgroundColor: swatch.previewCss }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 text-ui-sm text-muted-foreground select-none">
                    <Checkbox
                      size="sm"
                      checked={custom.strokeScaling === "constant"}
                      onCheckedChange={(checked) =>
                        onChangeCustom((prev) => ({
                          ...prev,
                          strokeScaling: checked ? "constant" : "scale",
                        }))
                      }
                    />
                    <T en="Absolute stroke width" zh="固定视觉线宽" />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
