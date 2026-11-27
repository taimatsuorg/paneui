import * as React from "react";

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
import { PlugIcon, RefreshIcon, ShapesIcon } from "@paneui/ui/icons";

import {
  GlyphSvg,
  T,
  relativeTime,
  useSiteLocale,
  useT,
  type CatalogStats,
  type IconCatalogItem,
  type IconEvent,
} from "./types";

export function ActivityDrawer({
  open,
  onOpenChange,
  icons,
  stats,
  activity,
  events,
  todayIso,
  onSelectIcon,
  onOpenAgent,
  onSync,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icons: IconCatalogItem[];
  stats: CatalogStats;
  activity: HeatCalendarDatum[];
  events: IconEvent[];
  todayIso: string;
  onSelectIcon: (name: string) => void;
  onOpenAgent: () => void;
  onSync: () => void;
}) {
  const t = useT();
  const locale = useSiteLocale();
  const [rangeSelection, setRangeSelection] = React.useState<HeatCalendarSelection | null>(null);
  const iconMap = React.useMemo(() => new Map(icons.map((i) => [i.name, i])), [icons]);

  return (
    <Drawer side="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-80 sm:w-96">
        <DrawerHeader>
          <DrawerTitle>
            <T en="Cloud activity" zh="云端动态" />
          </DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-5">
          {/* Summary metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-shell p-3">
              <div className="text-ui-xs text-muted-foreground">
                <T en="Total icons" zh="图标总数" />
              </div>
              <div className="mt-1 font-mono text-lg font-semibold text-foreground tabular-nums">
                {stats.total || icons.length}
              </div>
            </div>
            <div className="rounded-xl bg-shell p-3">
              <div className="text-ui-xs text-muted-foreground">
                <T en="Added via MCP" zh="MCP 云端新增" />
              </div>
              <div className="mt-1 font-mono text-lg font-semibold text-foreground tabular-nums">
                {stats.mcpAdded}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={onSync}>
              <RefreshIcon data-icon="inline-start" />
              <T en="Sync D1" zh="同步云端" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                onOpenAgent();
              }}
            >
              <PlugIcon data-icon="inline-start" />
              <T en="MCP setup" zh="接入 MCP" />
            </Button>
          </div>

          {/* 12-week activity heatmap */}
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

          {/* Recent feed */}
          <div className="flex flex-col gap-2">
            <div className="text-ui-sm font-medium text-fg-tertiary">
              <T en="Recent updates" zh="最近记录" />
            </div>
            {events.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {events.slice(0, 8).map((ev) => {
                  const matched = iconMap.get(ev.iconName);
                  return (
                    <li key={ev.id}>
                      <button
                        type="button"
                        disabled={!matched}
                        onClick={() => {
                          if (!matched) return;
                          onOpenChange(false);
                          onSelectIcon(matched.name);
                        }}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-control px-2 py-1.5 text-start text-ui transition-colors duration-150 outline-none hover:bg-fill-hover disabled:cursor-default disabled:opacity-64 focus-visible:ring-2 focus-visible:ring-ring"
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
              <ul className="flex flex-col gap-1">
                {icons.slice(0, 8).map((item) => (
                  <li key={item.name}>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        onSelectIcon(item.name);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-control px-2 py-1.5 text-start text-ui transition-colors duration-150 outline-none hover:bg-fill-hover focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <GlyphSvg body={item.body} size={16} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate font-medium text-foreground">{item.name}</span>
                      <span className="shrink-0 text-ui-xs text-fg-tertiary">{item.category}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
