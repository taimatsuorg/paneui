import type { ComponentDoc } from "@/lib/doc-types"

const positioning = [
  {
    name: "side",
    type: `"top" | "right" | "bottom" | "left" | "inline-start" | "inline-end"`,
    default: `"bottom"`,
    description: { en: "Side of the trigger to open on.", zh: "弹出层从触发器的哪一侧打开。" },
  },
  { name: "sideOffset", type: "number", default: "6", description: { en: "Gap from the trigger in px.", zh: "与触发器的间距，单位为 px。" } },
  { name: "align", type: `"start" | "center" | "end"`, default: `"start"`, description: { en: "Alignment against the trigger.", zh: "相对触发器的对齐方式。" } },
  { name: "alignOffset", type: "number", default: "0", description: { en: "Shift along the alignment axis in px.", zh: "沿对齐轴偏移（px）。" } },
]

export default {
  summary: {"en": "Dropdown of actions or options opened from a trigger.", "zh": "打开操作或选项菜单。"},
  baseUi: {
    name: "Menu",
    href: "https://base-ui.com/react/components/menu",
  },
  usage: {
    imports: `import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu"`,
    code: `<Menu>
  <MenuTrigger render={<Button variant="secondary" />}>Options</MenuTrigger>
  <MenuContent>
    <MenuItem>Rename</MenuItem>
    <MenuItem>Duplicate</MenuItem>
    <MenuSeparator />
    <MenuItem variant="destructive">Delete</MenuItem>
  </MenuContent>
</Menu>`,
  },
  composition: `Menu
├── MenuTrigger
└── MenuContent
    ├── MenuGroup
    │   ├── MenuLabel
    │   └── MenuItem
    │       └── MenuShortcut
    ├── MenuCheckboxItem
    ├── MenuRadioGroup
    │   └── MenuRadioItem
    ├── MenuSeparator
    └── MenuSub
        ├── MenuSubTrigger
        └── MenuSubContent`,
  examples: [
    {
      id: "checkbox-items",
      title: { en: "Checkbox Items", zh: "复选菜单项" },
    },
    {
      id: "radio-items",
      title: { en: "Radio Items", zh: "单选菜单项" },
    },
    {
      id: "disabled-and-destructive",
      title: { en: "Disabled and Destructive", zh: "禁用与危险操作" },
    },
    {
      id: "inset",
      title: { en: "Inset", zh: "内嵌" },
    },
    {
      id: "rtl",
      title: { en: "RTL", zh: "从右到左" },
    },
  ],
  notes: [
    {
      title: "Keyboard",
      body: { en: "Arrow keys move the highlight, `Enter` or `Space` selects, `ArrowRight` opens a submenu and `ArrowLeft` or `Esc` closes it. Typing a letter jumps to the matching item.", zh: "方向键移动高亮项，`Enter` 或 `Space` 选中，`ArrowRight` 打开子菜单，`ArrowLeft` 或 `Esc` 关闭它。输入字母会跳转到匹配的项。" },
    },
    {
      title: "Motion",
      body: { en: "Popups scale from 95% at the trigger's edge over 200ms. Checkbox and radio indicators pop in with a short scale.", zh: "弹出层在 200ms 内从触发器边缘以 95% 缩放出现。复选框和单选按钮指示器以短促的缩放弹入。" },
    },
  ],
  api: [
    {
      name: "Menu",
      description: { en: "Re-export of the primitive root.", zh: "重新导出 primitive 根。" },
      extends: "Menu.Root",
      extendsHref: "https://base-ui.com/react/components/menu#root",
      props: [
        { name: "open", type: "boolean", description: { en: "Controlled open state.", zh: "受控的打开状态。" } },
        {
          name: "onOpenChange",
          type: "(open: boolean, eventDetails) => void",
          description: { en: "Called when the menu opens or closes.", zh: "菜单打开或关闭时调用。" },
        },
      ],
    },
    {
      name: "MenuTrigger",
      description: { en: "Re-export. Use `render` to make a Button the trigger.", zh: "重新导出。使用 `render` 让 Button 成为触发器。" },
      extends: "Menu.Trigger",
      extendsHref: "https://base-ui.com/react/components/menu#trigger",
      props: [],
    },
    {
      name: "MenuContent",
      description: { en: "Portal, positioner and popup in one.", zh: "合并了 portal、positioner 和 popup。" },
      extends: "Menu.Popup",
      extendsHref: "https://base-ui.com/react/components/menu#popup",
      props: positioning,
    },
    {
      name: "MenuItem",
      extends: "Menu.Item",
      extendsHref: "https://base-ui.com/react/components/menu#item",
      props: [
        {
          name: "variant",
          type: `"default" | "destructive"`,
          default: `"default"`,
          description: { en: "`destructive` tints the text, icon and highlight red.", zh: "`destructive` 将文字、图标和高亮项染为红色。" },
        },
        { name: "inset", type: "boolean", default: "false", description: { en: "Left padding that matches items with an icon.", zh: "与带图标的项匹配的左侧内边距。" } },
        { name: "disabled", type: "boolean", default: "false", description: { en: "Dim the item and skip it.", zh: "置灰该项并跳过它。" } },
        { name: "closeOnClick", type: "boolean", default: "true", description: { en: "Close the menu when the item is chosen.", zh: "选中该项时关闭菜单。" } },
      ],
      dataAttributes: [
        { name: "data-highlighted", description: { en: "Present on the item under the pointer or keyboard focus.", zh: "在指针或键盘焦点下的项上存在。" } },
        { name: "data-variant", description: { en: "`default` or `destructive`.", zh: "`default` 或 `destructive`。" } },
      ],
    },
    {
      name: "MenuLinkItem",
      description: { en: "Item that is a link. The browser navigates, so it works with any router.", zh: "作为链接的项。由浏览器导航，可配合任意路由使用。" },
      extends: "Menu.LinkItem",
      extendsHref: "https://base-ui.com/react/components/menu#link-item",
      props: [
        { name: "href", type: "string", description: { en: "Where the link goes.", zh: "链接地址。" } },
        { name: "inset", type: "boolean", default: "false", description: { en: "Left padding that matches items with an icon.", zh: "与带图标的项匹配的左侧内边距。" } },
        { name: "closeOnClick", type: "boolean", default: "false", description: { en: "Close the menu when the link is followed.", zh: "打开链接时关闭菜单。" } },
      ],
    },
    {
      name: "MenuCheckboxItem",
      description: { en: "Item with a check indicator in the left gutter.", zh: "左侧槽位带勾选指示器的项。" },
      extends: "Menu.CheckboxItem",
      extendsHref: "https://base-ui.com/react/components/menu#checkbox-item",
      props: [
        { name: "checked", type: "boolean", description: { en: "Controlled checked state.", zh: "受控的选中状态。" } },
        { name: "defaultChecked", type: "boolean", default: "false", description: { en: "Initial state when uncontrolled.", zh: "非受控时的初始状态。" } },
        {
          name: "onCheckedChange",
          type: "(checked: boolean, eventDetails) => void",
          description: { en: "Called when toggled.", zh: "切换时调用。" },
        },
        { name: "closeOnClick", type: "boolean", default: "false", description: { en: "Close the menu when toggled.", zh: "切换时关闭菜单。" } },
      ],
    },
    {
      name: "MenuRadioGroup",
      description: { en: "Re-export. Holds the selected value for its `MenuRadioItem`s.", zh: "再导出。为其 `MenuRadioItem` 保存选中的值。" },
      extends: "Menu.RadioGroup",
      extendsHref: "https://base-ui.com/react/components/menu#radio-group",
      props: [
        { name: "value", type: "any", description: { en: "Controlled selected value.", zh: "受控的选中值。" } },
        { name: "defaultValue", type: "any", description: { en: "Initial value when uncontrolled.", zh: "非受控时的初始值。" } },
        { name: "onValueChange", type: "(value: any, eventDetails) => void", description: { en: "Called when the selection changes.", zh: "选中值变化时调用。" } },
      ],
    },
    {
      name: "MenuRadioItem",
      description: { en: "Item with a primary dot indicator in the left gutter.", zh: "左侧槽位带主色圆点指示器的项。" },
      extends: "Menu.RadioItem",
      extendsHref: "https://base-ui.com/react/components/menu#radio-item",
      props: [{ name: "value", type: "any", description: { en: "Value selected by this item.", zh: "该项选中的值。" }, required: true }],
    },
    {
      name: "MenuGroup",
      description: { en: "Re-export. Groups items under a `MenuLabel`.", zh: "再导出。在 `MenuLabel` 下将各项分组。" },
      extends: "Menu.Group",
      extendsHref: "https://base-ui.com/react/components/menu#group",
      props: [],
    },
    {
      name: "MenuLabel",
      description: { en: "Small muted heading for a group. Must sit inside a `MenuGroup`.", zh: "分组的小号弱化标题。必须位于 `MenuGroup` 内。" },
      extends: "Menu.GroupLabel",
      extendsHref: "https://base-ui.com/react/components/menu#group-label",
      props: [{ name: "inset", type: "boolean", default: "false", description: { en: "Indent to match inset items.", zh: "缩进以对齐 inset 项。" } }],
    },
    {
      name: "MenuSeparator",
      extends: "Menu.Separator",
      extendsHref: "https://base-ui.com/react/components/menu#separator",
      props: [],
    },
    {
      name: "MenuShortcut",
      description: { en: "Right-aligned monospace key hint inside an item.", zh: "项内右对齐的等宽按键提示。" },
      extends: "span",
      props: [],
    },
    {
      name: "MenuSub",
      description: { en: "Re-export. Root of a nested menu.", zh: "再导出。嵌套菜单的根。" },
      extends: "Menu.SubmenuRoot",
      extendsHref: "https://base-ui.com/react/components/menu#submenu-root",
      props: [],
    },
    {
      name: "MenuSubTrigger",
      description: { en: "Item that opens the submenu, with a trailing chevron.", zh: "带尾部尖括号的项，用于打开子菜单。" },
      extends: "Menu.SubmenuTrigger",
      extendsHref: "https://base-ui.com/react/components/menu#submenu-trigger",
      props: [],
      dataAttributes: [{ name: "data-popup-open", description: { en: "Present while its submenu is open.", zh: "子菜单打开时存在。" } }],
    },
    {
      name: "MenuSubContent",
      description: { en: "`MenuContent` preset to open on the right, aligned to the trigger item.", zh: "预设为在右侧打开、与触发器项对齐的 `MenuContent`。" },
      extends: "MenuContent",
      extendsHref: "#api-menucontent",
      props: [
        { name: "side", type: "same as MenuContent", default: `"right"`, description: "" },
        { name: "sideOffset", type: "number", default: "4", description: "" },
        { name: "alignOffset", type: "number", default: "-6", description: { en: "Lines the first item up with the trigger.", zh: "使第一项与触发器对齐。" } },
      ],
    },
  ],
} satisfies ComponentDoc
