import * as React from "react"
import assert from "node:assert/strict"
import { renderToString } from "react-dom/server"
import { LocaleProvider, LocaleText, localeLabels } from "@paneui/ui/components/locale-provider"
import { DataTable } from "@paneui/ui/components/data-table"
import { AgentActivity } from "@paneui/ui/components/agent-activity"
import { FileDiff } from "@paneui/ui/components/file-diff"
import { TabStrip, TabStripItem } from "@paneui/ui/components/tab-strip"
import { getAvatarBackdrops } from "@paneui/ui/components/generated-avatar"
import { getDefaultSlashItems } from "@paneui/ui/blocks/notion-editor/slash-command"
import { getBlockTypes, getTextColors } from "@paneui/ui/blocks/notion-editor/block-types"

const render = (locale: string, node: React.ReactNode) => renderToString(<LocaleProvider locale={locale}>{node}</LocaleProvider>)
for (const [locale, expected] of [
  ["en", { search: "Search…", view: "View", empty: "No rows yet", tool: "Used 1 tool", close: "Close tab", split: "Split", block: "Text", gray: "Gray", none: "None" }],
  ["zh-CN", { search: "搜索…", view: "视图", empty: "暂无行", tool: "使用了 1 个工具", close: "关闭标签页", split: "并排", block: "文本", gray: "灰色", none: "无" }],
] as const) {
  const labels = localeLabels[locale]
  const table = render(locale, <DataTable data={[]} columns={[{ key: "name", header: "Name" }]} getRowId={() => "1"} />)
  for (const text of [expected.search, expected.view, expected.empty]) assert.ok(table.includes(text), `${locale} table: ${text}`)
  const activity = render(locale, <AgentActivity status="complete" defaultOpen duration={12} items={[{ id: "read", type: "tool", action: "read", target: "sample.ts", status: "complete" }]} />)
  assert.ok(activity.includes(expected.tool), `${locale} activity summary`)
  const tabs = render(locale, <TabStrip defaultValue="one" onClose={() => {}}><TabStripItem value="one">One</TabStripItem></TabStrip>)
  assert.ok(tabs.includes(`aria-label="${expected.close}"`), `${locale} close tab`)
  const diff = render(locale, <FileDiff filename="sample.ts" diff="@@ -1 +1 @@\n-old\n+new" diffStyleToggle />)
  assert.ok(diff.includes(expected.split), `${locale} diff layout`)
  assert.equal(getDefaultSlashItems(labels)[0].title, expected.block)
  assert.equal(getBlockTypes(labels)[0].label, expected.block)
  assert.equal(getTextColors(labels)[1].label, expected.gray)
  assert.equal(getAvatarBackdrops(labels)[0].label, expected.none)
}
assert.equal(renderToString(<LocaleText label="close" />), "Close")
assert.equal(renderToString(<LocaleProvider locale="zh-CN" labels={{ close: "自定义" }}><LocaleProvider labels={{ back: "上一步" }}><LocaleText label="close" /></LocaleProvider></LocaleProvider>), "自定义")
assert.equal(renderToString(<LocaleProvider locale="zh-Hans"><LocaleText label="close" /></LocaleProvider>), "关闭")
assert.equal(renderToString(<LocaleProvider locale="zh-CN"><LocaleProvider locale="unknown"><LocaleText label="close" /></LocaleProvider></LocaleProvider>), "关闭")
assert.ok(render("zh-CN", <DataTable data={[]} columns={[]} getRowId={() => "1"} searchPlaceholder="Custom search" noun="自定义项目" />).includes('placeholder="Custom search"'))
assert.deepEqual(Object.keys(localeLabels.en).sort(), Object.keys(localeLabels["zh-CN"]).sort())
console.log("locale controls, helpers, overrides and fallbacks passed")
