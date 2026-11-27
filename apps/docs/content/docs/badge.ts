import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: {"en": "Labels an item with a short status or category.", "zh": "标记状态或分类。"},
  usage: {
    imports: `import { Badge } from "@/components/ui/badge"`,
    code: `<Badge variant="success">Paid</Badge>`,
  },
  examples: [
    {
      id: "sizes",
      title: { en: "Sizes", zh: "尺寸" },
    },
    {
      id: "with-icon",
      title: { en: "With Icon", zh: "带图标" },
      description: { en: "Put an icon first when the badge marks a status or category.", zh: "适用于需要快速识别状态或分类的标记。" },
    },
    {
      id: "with-avatar",
      title: { en: "With Avatar", zh: "带头像" },
    },
    {
      id: "as-link",
      title: { en: "As Link", zh: "用作链接" },
    },
  ],
  api: [
    {
      name: "Badge",
      extends: "span",
      props: [
        {
          name: "variant",
          type: `"chip" | "primary" | "success" | "warning" | "destructive" | "outline"`,
          default: `"chip"`,
          description: { en: "Visual style. `chip` uses a soft neutral fill, `primary` and status variants use solid fills matching their edges, and `outline` draws a hairline border.", zh: "视觉样式。`chip` 为柔和中性填充，`primary` 与状态变体为填充与外框同色的实心块，`outline` 保留细线边框。" },
        },
        {
          name: "size",
          type: `"default" | "sm"`,
          default: `"default"`,
          description: { en: "Height, padding and text size. `default` is 28px tall and `sm` 20px; icons are 14px, or 12px at `sm`.", zh: "高度、内边距和文本尺寸。`default` 高 28px，`sm` 高 20px；图标为 14px，`sm` 下为 12px。" },
        },
        {
          name: "render",
          type: "ReactElement | (props, state) => ReactElement",
          description: { en: "Replace the rendered `<span>`, e.g. with `<a />` or a router `Link`.", zh: "替换渲染的 `<span>`，例如用 `<a />` 或路由 `Link`。" },
        },
      ],
    },
    {
      name: "BadgeAvatar",
      description: { en: "Small round mark at the start of a badge, e.g. a vendor initial.", zh: "徽章开头的小圆点标记，例如供应商首字母。" },
      extends: "span",
      props: [],
    },
    {
      name: "badgeVariants",
      description: { en: "The `cva` function behind `Badge`, for styling other elements like a badge.", zh: "`Badge` 背后的 `cva` 函数，用于像徽章一样为其他元素设置样式。" },
      props: [
        { name: "variant", type: "same as Badge", description: "" },
        { name: "size", type: "same as Badge", description: "" },
      ],
    },
  ],
} satisfies ComponentDoc
