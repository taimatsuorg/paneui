import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Lists entries in time order along a line.", "zh": "按时间顺序展示记录。"},
  usage: {
    imports: `import { Timeline, TimelineDescription, TimelineItem, TimelineTitle } from "@/components/ui/timeline"`,
    code: `<Timeline>
  <TimelineItem time="08:00" action={<Button variant="ghost" size="icon-xs" aria-label="Delete"><TrashIcon /></Button>}>
    <TimelineTitle>Morning brief</TimelineTitle>
    <TimelineDescription>Weather, calendar and headlines</TimelineDescription>
  </TimelineItem>
</Timeline>`,
  },
  composition: `Timeline (actions)
└── TimelineItem
    ├── TimelineTitle
    └── TimelineDescription`,
  examples: [
    { id: "cards", title: { en: "Cards", zh: "卡片" }, description: { en: "Use cards when each entry carries more than two lines.", zh: "适用于每条记录内容较长的时间线。" } },
    { id: "changelog", title: { en: "Changelog", zh: "更新日志" }, description: { en: "Use for release notes readers link to and subscribe to.", zh: "适用于读者会链接和订阅的版本说明。" } },
  ],
  notes: [
    { title: "Time column", body: { en: "The column is 3.5rem wide; set `--timeline-time` on the `Timeline` for longer labels. Leave `time` out on every item to drop the column.", zh: "时间列宽 3.5rem；更长的标签可在 `Timeline` 上设置 `--timeline-time`。若每个条目都省略 `time`，则去掉该列。" } },
    { title: "Anchors", body: { en: "`anchor` on `TimelineTitle` sets an `id` (a slug of the title's text, or the string you pass) and adds a link to it that appears on hover or keyboard focus and stays faintly visible on touch screens. The link is named from `linkTo(title)` in `LocaleProvider`. Render the title as a heading with `render={<h2 />}` so it joins the page outline, and add `scroll-mt-*` under a sticky header.", zh: "`TimelineTitle` 上的 `anchor` 会设置 `id`（取标题文字的 slug，或使用传入的字符串），并添加指向它的链接：悬停或键盘聚焦时出现，在触屏上保持淡显。链接名称来自 `LocaleProvider` 的 `linkTo(title)`。用 `render={<h2 />}` 把标题渲染为标题元素以加入页面目录；有吸顶页头时加上 `scroll-mt-*`。" } },
    { title: "Header", body: { en: "`actions` puts controls above the entries, aligned to the end, such as a Subscribe or feed link. `className` then goes on the wrapper and the other props on the list.", zh: "`actions` 在条目上方放置靠末端对齐的控件，例如订阅或 feed 链接。此时 `className` 作用于外层容器，其余 props 作用于列表。" } },
    { title: "Hairline", body: { en: "The line starts at the first dot and ends at the last, so a single entry shows a dot alone.", zh: "线条从第一个圆点开始、到最后一个圆点结束，因此只有一个条目时仅显示一个圆点。" } },
  ],
  api: [
    {
      name: "Timeline",
      extends: "ol",
      props: [{ name: "actions", type: "ReactNode", description: { en: "Header controls above the entries.", zh: "条目上方的页头控件。" } }],
      dataAttributes: [],
    },
    {
      name: "TimelineItem",
      extends: "li",
      props: [
        { name: "time", type: "ReactNode", description: { en: "Text in the time column.", zh: "时间列中的文本。" } },
        { name: "timeDetail", type: "ReactNode", description: { en: "Quieter second line under the time, such as a date.", zh: "时间下方更低调的第二行，例如日期。" } },
        { name: "tone", type: `"default" | "primary" | "success" | "warning" | "destructive"`, default: `"default"`, description: { en: "Dot colour; `primary` marks the current or next entry.", zh: "圆点颜色；`primary` 标记当前或下一个条目。" } },
        { name: "action", type: "ReactNode", description: { en: "Trailing control aligned with the first line.", zh: "与第一行对齐的尾部控件。" } },
      ],
      dataAttributes: [{ name: "data-tone", description: { en: "The item's tone.", zh: "条目的色调。" } }],
    },
    {
      name: "TimelineTitle",
      extends: "div",
      props: [
        { name: "anchor", type: "boolean | string", description: { en: "Adds an id and a link to it; a string is the id.", zh: "添加 id 及指向它的链接；字符串即为 id。" } },
        { name: "render", type: "ReactElement", description: { en: "Element to render instead of a div, such as `<h2 />`.", zh: "替代 div 渲染的元素，例如 `<h2 />`。" } },
      ],
      dataAttributes: [{ name: "data-anchor", description: { en: "Present when the title has an anchor link.", zh: "标题带锚点链接时存在。" } }],
    },
    { name: "TimelineDescription", extends: "div", props: [] },
  ],
} satisfies ComponentDoc
