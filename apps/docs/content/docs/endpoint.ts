import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Shows an API endpoint's method and path, ready to copy.", zh: "显示 API 端点的方法和路径，可一键复制。" },
  usage: {
    imports: `import { Endpoint, MethodBadge } from "@/components/ui/endpoint"`,
    code: `<Endpoint method="get" path="/projects/{projectId}" server="https://api.example.com/v1" />`,
  },
  examples: [
    {
      id: "methods",
      title: { en: "Method Badges", zh: "方法徽章" },
    },
    {
      id: "sidebar",
      title: { en: "Sidebar Rows", zh: "侧边栏行" },
      description: { en: "Use the small size in navigation, where every badge takes one width.", zh: "在导航中使用小尺寸，每个徽章宽度相同。" },
    },
    {
      id: "deprecated",
      title: { en: "Deprecated", zh: "已弃用" },
    },
  ],
  notes: [
    {
      title: "Paths",
      body: {
        en: "`{param}` and `:param` segments take the primary text colour. The path always reads left to right, also on right-to-left pages. It truncates on one line, with the full URL in its tooltip; the server hides first when the bar is narrow.",
        zh: "`{param}` 和 `:param` 段使用主色文字。路径总是从左到右显示，在从右到左的页面中也一样。路径在一行内截断，完整 URL 显示在提示中；栏宽不足时先隐藏服务器地址。",
      },
    },
    {
      title: "Colours",
      body: {
        en: "Each method takes a theme role, so badges follow the accent and dark mode. At the small size `delete` and `options` shorten to `DEL` and `OPT`; screen readers still hear the full name.",
        zh: "每种方法使用一个主题角色，徽章随强调色和深色模式变化。小尺寸下 `delete` 和 `options` 缩写为 `DEL` 和 `OPT`；读屏软件仍读出完整名称。",
      },
    },
  ],
  api: [
    {
      name: "Endpoint",
      extends: "div",
      props: [
        { name: "method", type: `"get" | "post" | "put" | "patch" | "delete" | "head" | "options" | string`, required: true, description: { en: "HTTP method, case-insensitive.", zh: "HTTP 方法，不区分大小写。" } },
        { name: "path", type: "string", required: true, description: { en: "Path with `{param}` or `:param` segments.", zh: "包含 `{param}` 或 `:param` 段的路径。" } },
        { name: "server", type: "string", description: { en: "Base URL shown before the path and included in the copy.", zh: "显示在路径前的基础 URL，复制时一并包含。" } },
        { name: "deprecated", type: "boolean", default: "false", description: { en: "Strikes the path through and adds a badge.", zh: "给路径加删除线并添加徽章。" } },
        { name: "copyable", type: "boolean", default: "true", description: { en: "Shows the copy button.", zh: "显示复制按钮。" } },
      ],
      dataAttributes: [{ name: "data-deprecated", description: { en: "Present when deprecated.", zh: "已弃用时存在。" } }],
    },
    {
      name: "MethodBadge",
      extends: "span",
      props: [
        { name: "method", type: "string", required: true, description: { en: "HTTP method. Unknown methods are neutral.", zh: "HTTP 方法。未知方法使用中性色。" } },
        { name: "size", type: `"default" | "sm"`, default: `"default"`, description: { en: "`sm` is one fixed width for navigation rows.", zh: "`sm` 为导航行使用的固定宽度。" } },
      ],
      dataAttributes: [{ name: "data-method", description: { en: "The method in lower case.", zh: "小写的方法名。" } }],
    },
    {
      name: "EndpointPath",
      description: { en: "The path with its parameters set apart, for headings and lists.", zh: "突出参数的路径，可用于标题和列表。" },
      extends: "span",
      props: [{ name: "path", type: "string", required: true, description: { en: "Path to render.", zh: "要显示的路径。" } }],
    },
  ],
} satisfies ComponentDoc
