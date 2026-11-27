import { GlyphSvg, T, relativeTime, useSiteLocale, useT, type IconCatalogItem, type IconEvent } from "./types";

export const ACTIVE_AGENT_WINDOW_MS = 5 * 60 * 1000;

export function AgentWorkingCard({
  event,
  icon,
  onSelectIcon,
}: {
  event: IconEvent;
  icon: IconCatalogItem;
  onSelectIcon: (name: string) => void;
}) {
  const t = useT();
  const locale = useSiteLocale();
  const actionLabel =
    event.action === "update" ? (locale === "zh" ? "已更新" : "updated") : locale === "zh" ? "已新增" : "added";

  return (
    <button
      type="button"
      data-slot="agent-working-card"
      onClick={() => onSelectIcon(icon.name)}
      aria-label={t({
        en: `Inspect ${icon.name}, active agent work`,
        zh: `查看 Agent 正在处理的图标 ${icon.name}`,
      })}
      className="group flex max-w-full cursor-pointer items-center gap-3 rounded-2xl bg-card px-4 py-3 text-start shadow-raised transition-[box-shadow,background-color] duration-150 outline-none hover:bg-fill-hover/40 hover:shadow-raised-hover focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-shell text-foreground">
        <GlyphSvg body={icon.body} size={28} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-ui-xs">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-success" />
          <span className="font-medium text-muted-foreground">
            <T en="Agent working" zh="Agent 正在绘制" />
          </span>
          <span className="font-mono text-fg-tertiary tabular-nums">{relativeTime(event.createdAt, locale)}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="truncate font-mono text-ui-lg font-semibold text-foreground">{icon.name}</span>
          <span className="shrink-0 text-ui-xs text-muted-foreground">{actionLabel}</span>
        </div>
      </div>
    </button>
  );
}
