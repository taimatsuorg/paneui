import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Browses files and folders in a keyboard-navigable tree.", "zh": "浏览文件与文件夹。"},
  usage: {
    imports: `import { FileTree, FileTreeFile, FileTreeFolder } from "@/components/ui/file-tree"`,
    code: `<FileTree defaultExpanded={["app"]}>
  <FileTreeFolder name="app">
    <FileTreeFile name="page.tsx" />
  </FileTreeFolder>
  <FileTreeFile name="package.json" />
</FileTree>`,
  },
  composition: `FileTree
├── FileTreeFolder
│   ├── FileTreeFolder
│   └── FileTreeFile
└── FileTreeFile`,
  examples: [
    {
      id: "explicit-values",
      title: { en: "Explicit Values", zh: "明确数值" },
    },
    {
      id: "items",
      title: { en: "From Data", zh: "根据数据" },
    },
    {
      id: "controlled-expanded",
      title: { en: "Controlled Expanded", zh: "受控展开" },
    },
    {
      id: "open-file",
      title: { en: "Open File and Icons", zh: "打开文件与图标" },
    },
  ],
  notes: [
    {
      title: "Keyboard",
      body: { en: "Follows the WAI-ARIA tree pattern. ↑ / ↓ move, → opens a folder or enters it, ← closes it or goes to the parent, Home / End jump, Enter or Space activates, `*` expands every sibling folder, and typing jumps to the next matching name.", zh: "遵循 WAI-ARIA tree 模式。↑ / ↓ 移动，→ 展开文件夹或进入其中，← 折叠或返回父级，Home / End 跳转，Enter 或 Space 激活，`*` 展开同级所有文件夹，输入字符会跳到下一个匹配的名称。" },
    },
    {
      title: "Values",
      body: { en: "A node without `value` uses its path from the root: `app` for a top-level folder, `app/page.tsx` for a file in it. `defaultExpanded`, `value` and `onValueChange` all use these paths. Two nodes with the same value log a warning in development.", zh: "没有 `value` 的节点使用其从根开始的路径：顶层文件夹为 `app`，其中的文件为 `app/page.tsx`。`defaultExpanded`、`value` 和 `onValueChange` 都使用这些路径。两个节点具有相同 value 时会在开发环境输出警告。" },
    },
    {
      title: "Icons",
      body: { en: "Folders show an open or closed folder after the chevron. A file gets its icon and tint from its extension, and an unknown extension gets a plain file. `getFileKind(name)` returns the same icon and tint for use elsewhere.", zh: "文件夹在箭头后显示打开或关闭的文件夹图标。文件根据扩展名获得图标和色调，未知扩展名使用普通文件图标。`getFileKind(name)` 返回相同的图标和色调，可在其他地方使用。" },
    },
    {
      title: "Surface",
      body: { en: "The tree takes the background it sits on and nothing animates. Use `variant=\"card\"` for a raised card, or `size=\"sm\"` inside an editor.", zh: "树沿用所在容器的背景，不做动画。需要独立卡片时用 `variant=\"card\"`，放在编辑器里用 `size=\"sm\"`。" },
    },
  ],
  api: [
    {
      name: "FileTree",
      description: { en: "The tree. Reads its `FileTreeFolder` / `FileTreeFile` children (or `items`) into one keyboard-navigable list.", zh: "树。将其 `FileTreeFolder` / `FileTreeFile` 子节点（或 `items`）读取为一个可用键盘导航的列表。" },
      extends: "div",
      props: [
        { name: "items", type: "FileTreeItem[]", description: { en: "Data alternative to declarative children; `value` is optional as on the parts.", zh: "声明式子节点的数据替代方案；`value` 与各部分一样为可选。" } },
        { name: "value", type: "string | null", description: { en: "Controlled selected node.", zh: "受控的选中节点。" } },
        { name: "defaultValue", type: "string | null", default: "null", description: { en: "Initial selection when uncontrolled.", zh: "非受控时的初始选择。" } },
        { name: "onValueChange", type: "(value: string, node: FileTreeNode) => void", description: { en: "Called when a node is selected.", zh: "选中节点时调用。" } },
        { name: "expanded", type: "string[]", description: { en: "Controlled open folder values.", zh: "受控的展开文件夹 value。" } },
        { name: "defaultExpanded", type: "string[]", default: "[]", description: { en: "Folders open on first render.", zh: "首次渲染时展开的文件夹。" } },
        { name: "onExpandedChange", type: "(expanded: string[]) => void", description: { en: "Called when folders open or close.", zh: "文件夹展开或折叠时调用。" } },
        { name: "onOpenFile", type: "(node: FileTreeNode) => void", description: { en: "Called when a file (not a folder) is activated with Enter or a click.", zh: "文件（非文件夹）通过 Enter 或点击激活时调用。" } },
        { name: "indent", type: "number", default: "20", description: { en: "Indent per level, px; 12 at `size=\"sm\"`.", zh: "每级缩进，单位 px；`size=\"sm\"` 时为 12。" } },
        { name: "size", type: '"default" | "sm"', default: '"default"', description: { en: "32px rounded rows, or 24px editor-density rows.", zh: "32px 圆角行，或 24px 编辑器密度行。" } },
        { name: "variant", type: '"default" | "ghost" | "card"', default: '"default"', description: { en: "Parent's background, or a raised card.", zh: "沿用父级背景，或独立卡片。" } },
        { name: "label", type: "string", default: `"Files"`, description: { en: "Accessible name of the tree.", zh: "树的无障碍名称。" } },
      ],
      dataAttributes: [
        { name: "data-type", description: { en: "`file` or `folder`, on each row.", zh: "每一行上的 `file` 或 `folder`。" } },
        { name: "data-selected", description: { en: "On the selected row.", zh: "在选中的行上。" } },
      ],
    },
    {
      name: "FileTreeFolder",
      description: { en: "Declarative folder; renders nothing on its own. Nest folders and files inside it.", zh: "声明式文件夹；自身不渲染任何内容。在其中嵌套文件夹和文件。" },
      props: [
        { name: "value", type: "string", default: "path (`parent/name`)", description: { en: "Unique id. Defaults to the path from the root.", zh: "唯一 id。默认使用从根开始的路径。" } },
        { name: "name", type: "string", required: true, description: { en: "Label; also used for typeahead.", zh: "标签；也用于 typeahead。" } },
        { name: "icon", type: "ReactNode", description: { en: "Replaces the chevron. Folders have no folder icon; the chevron is their only leading mark.", zh: "替换折叠箭头。文件夹没有文件夹图标；折叠箭头是它们唯一的前导标记。" } },
        { name: "meta", type: "ReactNode", description: { en: "Trailing content (status dot, size, badge).", zh: "尾部内容（状态点、大小、徽标）。" } },
        { name: "disabled", type: "boolean", description: { en: "Dim it and ignore activation.", zh: "使其变暗并忽略激活。" } },
        { name: "className", type: "string", description: { en: "Class for the row.", zh: "行的 class。" } },
      ],
    },
    {
      name: "FileTreeFile",
      description: { en: "Declarative file; renders nothing on its own. Same props as `FileTreeFolder`, without children.", zh: "声明式文件；自身不渲染任何内容。与 `FileTreeFolder` 相同的 props，但没有 children。" },
      props: [],
    },
    {
      name: "FileTreeNode",
      description: { en: "A resolved entry, as passed to `onValueChange` and `onOpenFile`: the folder props with a required `value`, plus `type: \"file\" | \"folder\"` and `children?: FileTreeNode[]`. `FileTreeItem` is the input form for `items`, with `value` optional.", zh: "解析后的条目，传给 `onValueChange` 和 `onOpenFile`：文件夹 props 加上必需的 `value`，再加 `type: \"file\" | \"folder\"` 和 `children?: FileTreeNode[]`。`FileTreeItem` 是 `items` 的输入形式，`value` 可选。" },
      props: [],
    },
  ],
} satisfies ComponentDoc
