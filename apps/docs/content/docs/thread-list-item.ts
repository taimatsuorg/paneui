import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Lists agent or chat threads in a sidebar.", "zh": "在侧栏中显示对话。"},
  usage: {
    imports: `import { ThreadList, ThreadListGroup, ThreadListItem } from "@/components/ui/thread-list-item"`,
    code: `<ThreadList>
  <ThreadListGroup label="Recent">
    <ThreadListItem
      title="Fix broken chat dragging"
      icon={<ApertureIcon />}
      repo="workspace"
      pr={{ number: 1526, status: "open" }}
      branch="feat/fix-chat-dragging"
      active
    />
  </ThreadListGroup>
</ThreadList>`,
  },
  composition: `ThreadList
└── ThreadListGroup
    └── ThreadListItem`,
  examples: [
    { id: "pr-states", title: { en: "Pull Request States", zh: "合并请求状态" }, description: { en: "Use in coding-agent sidebars where threads map to pull requests.", zh: "适用于关联代码合并请求的对话列表。" } },
    { id: "actions", title: { en: "Description and Actions", zh: "说明与操作" }, description: { en: "Use for chat lists with a subtitle, a time and a row menu.", zh: "适用于需要副标题和操作菜单的对话列表。" } },
    { id: "minimal", title: { en: "Minimal", zh: "简洁" },  },
    { id: "compact", title: { en: "Compact", zh: "紧凑" }, description: { en: "Use `size=\"sm\"` for nested lists such as project folders.", zh: "项目文件夹等嵌套列表使用 `size=\"sm\"`。" } },
  ],
  notes: [
    { title: "Truncation", body: { en: "Title, repo and branch truncate independently; the branch gives way first so the PR number stays readable in a narrow sidebar.", zh: "标题、仓库和分支独立截断；分支先让位，以便在狭窄侧边栏中 PR 编号保持可读。" } },
    { title: "Actions", body: { en: "With `actions` the item is a list item holding the row button and the actions side by side, so a menu button never nests inside the row and its clicks don't reach the row. The actions show on hover, keyboard focus, while the row is active and while a menu they opened is open; on touch screens they always show and `meta` moves left of them. Then `className`, `id`, `style` and `data-*` go to the list item, and everything else (`onClick`, `aria-*`, `disabled`) to the row button; `buttonProps` reaches the button directly. Without `actions` the button is the item and takes everything.", zh: "使用 `actions` 时，该项是一个列表项，包含行按钮和操作并排，因此菜单按钮永远不会嵌套在行内，其点击不会到达行。操作在悬停、键盘聚焦、行激活以及它们打开的菜单打开时显示；在触摸屏上它们始终显示，`meta` 移到它们左侧。然后 `className`、`id`、`style` 和 `data-*` 传递给列表项，其他所有内容（`onClick`、`aria-*`、`disabled`）传递给行按钮；`buttonProps` 直接到达按钮。没有 `actions` 时，按钮就是该项并接收所有内容。" } },
  ],
  api: [
    { name: "ThreadList", extends: "div", props: [] },
    { name: "ThreadListGroup", extends: "div", props: [{ name: "label", type: "ReactNode", required: true, description: { en: "Section heading.", zh: "区域标题。" } }, { name: "action", type: "ReactNode", description: { en: "Control on the heading row.", zh: "标题行上的控件。" } }] },
    {
      name: "ThreadListItem",
      extends: "button",
      props: [
        { name: "title", type: "ReactNode", required: true, description: { en: "Thread title.", zh: "线程标题。" } },
        { name: "icon", type: "ReactNode", description: { en: "Provider or agent glyph.", zh: "提供方或代理图标。" } },
        { name: "repo", type: "string", description: { en: "Repository or project.", zh: "仓库或项目。" } },
        { name: "pr", type: `{ number: number; status: "open" | "draft" | "merged" | "closed" }`, description: { en: "Linked pull request. The number takes the status colour (open success, draft muted, merged purple, closed destructive).", zh: "链接的拉取请求。编号采用状态颜色（打开成功、草稿静音、已合并紫色、已关闭破坏性）。" } },
        { name: "branch", type: "string", description: { en: "Git branch.", zh: "Git 分支。" } },
        { name: "active", type: "boolean", default: "false", description: { en: "Selected row.", zh: "选中的行。" } },
        { name: "running", type: "boolean", default: "false", description: { en: "Replace the icon with a spinner.", zh: "将图标替换为加载指示器。" } },
        { name: "unread", type: "boolean", default: "false", description: { en: "Primary dot after the title.", zh: "标题后的主圆点。" } },
        { name: "description", type: "ReactNode", description: { en: "Free second line; truncates. Shown above `repo` / `pr` / `branch`.", zh: "自由第二行；会截断。显示在 `repo` / `pr` / `branch` 上方。" } },
        { name: "meta", type: "ReactNode", description: { en: "Quiet text at the end of the title line, such as a relative time. `actions` replace it on hover.", zh: "标题行末尾的低调文本，例如相对时间。悬停时由 `actions` 替换。" } },
        { name: "actions", type: "ReactNode", description: { en: "Row controls, placed over the end of the row outside its button.", zh: "行控件，放在行末尾、行按钮之外。" } },
        { name: "buttonProps", type: `React.ComponentProps<"button">`, description: { en: "Props for the row button, including its `className`. Merged last, so they win over the rest.", zh: "行按钮的 props，包括其 `className`。最后合并，因此优先于其他设置。" } },
        { name: "size", type: `"default" | "sm"`, default: `"default"`, description: { en: "`sm` is a single 28px line: icon, title, pull request number and `meta`. `description`, `repo` and `branch` are left out.", zh: "`sm` 为单行 28px：图标、标题、合并请求编号和 `meta`。不显示 `description`、`repo` 和 `branch`。" } },
        { name: "trailing", type: "ReactNode", description: { en: "Non-interactive content at the end of the title line, inside the row button.", zh: "标题行末尾的非交互内容，位于行按钮内。" } },
      ],
      dataAttributes: [
        { name: "data-size", description: { en: "The `size` in use.", zh: "当前使用的 `size`。" } },
        { name: "data-active", description: { en: "Present when active.", zh: "激活时存在。" } },
        { name: "data-running", description: { en: "Present while running.", zh: "运行时存在。" } },
      ],
    },
  ],
} satisfies ComponentDoc
