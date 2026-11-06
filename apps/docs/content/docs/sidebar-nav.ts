import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Compact text navigation for docs and settings sidebars.", "zh": "为文档和设置页提供侧栏导航。"},
  usage: {
    imports: `import {
  SidebarNav,
  SidebarNavContent,
  SidebarNavLink,
  SidebarNavList,
  SidebarNavSearch,
  SidebarNavSection,
} from "@/components/ui/sidebar-nav"`,
    code: `<SidebarNav>
  <SidebarNavSearch shortcut="⌘K" onClick={openSearch} />
  <SidebarNavContent aria-label="Docs">
    <SidebarNavSection label="Getting started">
      <SidebarNavList>
        <SidebarNavLink href="/docs" active>Introduction</SidebarNavLink>
        <SidebarNavLink href="/docs/installation">Installation</SidebarNavLink>
      </SidebarNavList>
    </SidebarNavSection>
  </SidebarNavContent>
</SidebarNav>`,
  },
  composition: `SidebarNav
├── SidebarNavSearch
├── SidebarNavContent
│   └── SidebarNavSection            label, count, badge, href, active, icon
│       ├── SidebarNavList
│       │   └── SidebarNavLink       active, icon, badge
│       └── SidebarNavSection level="group"
└── SidebarNavFooter`,
  examples: [
    { id: "fill", title: { en: "Filled surface", zh: "填充背景" } },
    { id: "captions", title: { en: "Captions", zh: "分组标题" }, description: { en: "Use for long flat docs lists.", zh: "适合较长的扁平文档列表。" } },
    { id: "icons", title: { en: "Icons", zh: "图标" },  },
    { id: "badges", title: { en: "Badges", zh: "徽标" }, description: { en: "Use to flag a new section or group, not only a page.", zh: "用于标记新的分区或分组，而不只是页面。" } },
    { id: "icon-groups", title: { en: "Icons and Groups", zh: "图标与分组" },  },
    { id: "linked-groups", title: { en: "Linked Groups", zh: "分组链接" },  },
    { id: "persisted", title: { en: "Remembered Sections", zh: "记住展开状态" },  },
    { id: "rtl", title: { en: "RTL", zh: "从右到左" },  },
  ],
  notes: [
    {
      title: "When to use",
      body: { en: "For long page trees in docs, settings and admin sidebars. For an app rail with icons that folds to a strip, use [Animated Sidebar](/docs/animated-sidebar).", zh: "适用于文档、设置和管理界面的页面导航。需要折叠为图标栏时，使用[动态侧栏](/docs/animated-sidebar)。" },
    },
    {
      title: "Icon alignment",
      body: { en: "Rows align automatically when their section uses icons.", zh: "分区使用图标时，各行文字自动对齐。" },
    },
    {
      title: "Keyboard",
      body: { en: "Section buttons expose their expanded state. The current page scrolls into view on mount.", zh: "分区按钮提供展开状态；挂载时自动滚动到当前页面。" },
    },
  ],
  api: [
    { name: "SidebarNav", extends: "div", description: { en: "Column that fills its container.", zh: "填满容器的纵向导航。" }, props: [{ name: "variant", type: '"default" | "fill"', default: '"default"', description: { en: "Use fill for an opaque shell surface.", zh: "使用 fill 显示不透明的侧栏背景。" } }, { name: "indicator", type: '"bar" | "fill"', default: '"bar"', description: { en: "`fill` marks the current row with a stronger fill only and uses 32px rows.", zh: "`fill` 仅用更深的填充标记当前行，并使用 32px 行高。" } }] },
    {
      name: "SidebarNavSearch",
      extends: "button",
      description: { en: "A field-shaped button that opens your search.", zh: "打开搜索的输入框形按钮。" },
      props: [
        { name: "shortcut", type: "React.ReactNode", description: { en: "Key cap at the end, such as `⌘K`.", zh: "末尾的按键提示，例如 `⌘K`。" } },
        { name: "children", type: "React.ReactNode", default: "`labels.searchPlaceholder`", description: { en: "The field text. The default comes from the locale.", zh: "按钮文字，默认使用当前语言。" } },
      ],
    },
    { name: "SidebarNavContent", extends: "nav", description: { en: "The scrolling list. Give it an `aria-label`.", zh: "可滚动的导航列表，请设置 `aria-label`。" }, props: [] },
    {
      name: "SidebarNavSection",
      extends: "Collapsible.Root",
      extendsHref: "https://base-ui.com/react/components/collapsible#root",
      props: [
        { name: "label", type: "React.ReactNode", required: true, description: { en: "Heading text.", zh: "标题文字。" } },
        { name: "count", type: "number", description: { en: "Muted count after the label.", zh: "标签后的数量。" } },
        { name: "badge", type: "React.ReactNode", description: { en: "Trailing content on the label row, such as a New badge. Same place and radius as on `SidebarNavLink`.", zh: "标签行末尾的内容，例如新功能徽标。位置和圆角与 `SidebarNavLink` 一致。" } },
        { name: "level", type: `"section" | "group" | "label"`, default: `"section"`, description: { en: "`group` is a smaller muted heading inside a section; `label` is a small medium-weight muted caption over flat rows that never folds; between rows it takes 8px more space above it.", zh: "`group` 为分区内较小的次级标题；`label` 为扁平行上方不折叠的中等字重弱化小标题；位于行之间时上方多留 8px。" } },
        { name: "collapsible", type: "boolean", default: "true", description: { en: "`false` drops the toggle and keeps it open.", zh: "设为 `false` 后始终展开。" } },
        { name: "href", type: "string", description: { en: "Makes the label a link to the section's own page; the chevron beside it still folds the rows.", zh: "将标签设为分区页面的链接，旁边的箭头仍可折叠列表。" } },
        { name: "labelRender", type: "React.ReactElement | (props) => React.ReactElement", description: { en: "Renders the label link with your router's link, such as `<Link href=\"…\" />`.", zh: "使用路由链接渲染标签，例如 `<Link href=\"…\" />`。" } },
        { name: "active", type: "boolean", default: "false", description: { en: "Marks the label's page as current with the fill, the bar and `aria-current=\"page\"`.", zh: "用填充、标记条和 `aria-current=\"page\"` 标示当前页面。" } },
        { name: "icon", type: "React.ReactNode", description: { en: "Leading icon in the same 16px slot as `SidebarNavLink`, muted until the label is hovered or current.", zh: "与导航链接对齐的 16px 前置图标，悬停或选中时强调。" } },
        { name: "toggleLabel", type: "string", description: { en: "Name of the chevron button beside a linked label. Defaults to the locale's `toggleNamed(label)`.", zh: "链接旁折叠按钮的名称，默认使用当前语言的 `toggleNamed(label)`。" } },
      ],
    },
    { name: "SidebarNavList", extends: "ul", props: [] },
    {
      name: "SidebarNavLink",
      extends: "a",
      description: { en: "A row inside its own `li`. Use `render` for your router's link.", zh: "包含在 `li` 中的一行。使用 `render` 接入路由链接。" },
      props: [
        { name: "active", type: "boolean", default: "false", description: { en: "Marks the current page with a fill, a bar in the gutter and `aria-current=\"page\"`.", zh: "用填充、标记条和当前页属性标示当前页面。" } },
        { name: "icon", type: "React.ReactNode", description: { en: "Leading icon in a 16px slot, muted until the row is hovered or current.", zh: "16px 前置图标，悬停或选中时强调。" } },
        { name: "badge", type: "React.ReactNode", description: { en: "Trailing content, such as a New badge.", zh: "末尾内容，例如新功能徽标。" } },
      ],
    },
    { name: "SidebarNavFooter", extends: "div", description: { en: "Pinned under the list, above a hairline.", zh: "固定在列表下方，以分隔线区分。" }, props: [] },
  ],
} satisfies ComponentDoc
