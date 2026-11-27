import * as React from "react";

import { ActionSwapBlurButton, type ActionSwapItem } from "@paneui/ui/components/action-swap-blur";
import { Badge } from "@paneui/ui/components/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@paneui/ui/components/dialog";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@paneui/ui/components/tabs";
import { CheckIcon, CopyIcon } from "@paneui/ui/icons";

import { T, buildAgentPrompt, useClipboard, useSiteLocale, useT } from "./types";

const MCP_TOOLS = ["search_icons", "get_icon", "list_categories", "add_icon", "update_icon", "delete_icon"] as const;

export function AgentDialog({
  open,
  onOpenChange,
  totalCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
}) {
  const t = useT();
  const locale = useSiteLocale();
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
      prompt: buildAgentPrompt(mcpUrl, totalCount, locale),
    }),
    [mcpUrl, totalCount, locale],
  );

  const [tab, setTab] = React.useState<keyof typeof snippets>("claude");
  const activeSnippet = snippets[tab];

  const copyItems = React.useMemo<ActionSwapItem[]>(
    () => [
      {
        value: "copy",
        label: t({ en: "Copy", zh: "复制" }),
        icon: <CopyIcon />,
        ariaLabel: t({ en: "Copy configuration", zh: "复制配置" }),
      },
      {
        value: "copied",
        label: t({ en: "Copied", zh: "已复制" }),
        icon: <CheckIcon className="text-success-text" />,
        ariaLabel: t({ en: "Copied configuration", zh: "已复制配置" }),
      },
    ],
    [t],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <T en="Use PaneUI Icons in your agent" zh="在编程 Agent 中连接云端图标库" />
          </DialogTitle>
          <DialogDescription>
            <T
              en="Connect the HTTP MCP server to search icons or write new glyphs directly to D1."
              zh="连接 HTTP MCP 服务按语义检索图标，或携带写入令牌向 D1 在线发布新图标。"
            />
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as keyof typeof snippets)} className="gap-2.5">
          <TabsList size="sm" variant="default" className="w-full overflow-x-auto">
            <TabsTab value="claude">Claude Code</TabsTab>
            <TabsTab value="cursor">Cursor</TabsTab>
            <TabsTab value="codex">Codex</TabsTab>
            <TabsTab value="vscode">VS Code</TabsTab>
            <TabsTab value="write">
              <T en="Write Token" zh="写入令牌" />
            </TabsTab>
            <TabsTab value="prompt">
              <T en="AI Prompt" zh="提示词" />
            </TabsTab>
          </TabsList>

          <TabsPanel value={tab}>
            <div className="flex items-start gap-2 rounded-xl bg-shell p-3 font-mono text-ui-sm text-foreground">
              <pre className="min-w-0 flex-1 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
                <code>{activeSnippet}</code>
              </pre>
              <ActionSwapBlurButton
                items={copyItems}
                value={copiedKey === `agent-${tab}` ? "copied" : "copy"}
                cycle={false}
                iconOnly
                variant="ghost"
                size="icon-xs"
                onClick={() => copy(`agent-${tab}`, activeSnippet)}
              />
            </div>
          </TabsPanel>
        </Tabs>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-ui-xs text-muted-foreground">
            <T en="MCP tools" zh="MCP 工具" />
          </span>
          {MCP_TOOLS.map((toolName) => (
            <Badge key={toolName} variant="chip" size="sm" className="font-mono">
              {toolName}
            </Badge>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
