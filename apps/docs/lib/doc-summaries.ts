import type { Localized } from "./site-locale"

/** Page ledes; registry and Markdown descriptions stay English. */
export const DOC_SUMMARIES: Record<string, Localized> = {
  "theme": {
    "en": "Shared design tokens for every component.",
    "zh": "为组件提供统一的主题变量。"
  },
  "utils": {
    "en": "Class-merging helper that understands the theme's font sizes.",
    "zh": "合并类名并识别主题字号。"
  },
  "control-size": {
    "en": "Keeps field controls the same size.",
    "zh": "统一输入框与内部控件的尺寸。"
  },
  "typeset": {
    "en": "Styles long-form text in docs, articles and chat messages.",
    "zh": "为长篇正文设置排版。"
  },
  "theme-neutral": {
    "en": "Accent preset that makes the primary colour black or white.",
    "zh": "将主题色设为黑色或白色。"
  },
  "theme-blue": {
    "en": "Accent preset that sets the primary colour to blue, the default.",
    "zh": "将主题色设为蓝色。"
  },
  "theme-green": {
    "en": "Accent preset that sets the primary colour to green.",
    "zh": "将主题色设为绿色。"
  },
  "theme-orange": {
    "en": "Accent preset that sets the primary colour to orange.",
    "zh": "将主题色设为橙色。"
  },
  "theme-rose": {
    "en": "Accent preset that sets the primary colour to rose.",
    "zh": "将主题色设为玫瑰色。"
  },
  "theme-violet": {
    "en": "Accent preset that sets the primary colour to violet.",
    "zh": "将主题色设为紫色。"
  },
  "theme-radius-none": {
    "en": "Radius preset with square corners everywhere.",
    "zh": "使用直角。"
  },
  "theme-radius-sm": {
    "en": "Radius preset with tighter corners everywhere.",
    "zh": "使用较小圆角。"
  },
  "theme-radius-default": {
    "en": "Radius preset that restores the default corner rounding.",
    "zh": "恢复默认圆角。"
  },
  "theme-radius-lg": {
    "en": "Radius preset with rounder corners everywhere.",
    "zh": "使用较大圆角。"
  },
  "theme-radius-xl": {
    "en": "Radius preset with the roundest corners everywhere.",
    "zh": "使用最大圆角。"
  },
  "fonts": {
    "en": "Fonts for interfaces, code and reading.",
    "zh": "为界面、代码和正文提供字体。"
  },
  "upgrade-check": {
    "en": "Finds what an earlier theme install left behind.",
    "zh": "查找旧版主题遗留的样式。"
  },
  "design-skill": {
    "en": "Design rules and checks for coding agents.",
    "zh": "为编码助手提供设计规则与检查。"
  },
  "theme-accents": {
    "en": "Switches the accent colour at runtime with one attribute.",
    "zh": "在运行时切换主题色。"
  },
  "theme-paper": {
    "en": "Opt-in style with warm paper, serif titles and pill controls.",
    "zh": "可选的纸张风格：暖色纸面、衬线标题与胶囊控件。"
  },
  "theme-radii": {
    "en": "Switches corner rounding at runtime with one attribute.",
    "zh": "在运行时切换圆角。"
  },
  "icons": {
    "en": "Rounded outline icon set used across the library.",
    "zh": "为界面提供统一的圆角图标。"
  },  "icons-emoji": {
    "en": "Full-colour glossy icons with the same names.",
    "zh": "同名的彩色拟物图标。"
  },



  "icon-chip": {
    "en": "Frames an icon so card and section headers match.",
    "zh": "为标题图标提供统一的底框。"
  },
  "brand-icon": {
    "en": "Shows brand logos.",
    "zh": "显示品牌标志。"
  },
  "outline": {
    "en": "Follows your reading position in the page outline.",
    "zh": "跟随阅读位置显示页面目录。"
  },
  "cover-art": {
    "en": "Generated cover images for posts and cards, drawn in theme colours.",
    "zh": "为文章和卡片生成封面。"
  },
  "og-image": {
    "en": "Creates page share images.",
    "zh": "生成页面分享图片。"
  },
  "og-image-route": {
    "en": "Adds a site share image route.",
    "zh": "为站点添加分享图片路由。"
  },
  "og-image-post-route": {
    "en": "Creates a share image for each post.",
    "zh": "为每篇文章生成分享图片。"
  },
  "sidebar-nav": {
    "en": "Compact text navigation for docs and settings sidebars.",
    "zh": "为文档和设置页提供侧栏导航。"
  },
  "simple-table": {
    "en": "A plain table for reference content like props and tokens.",
    "zh": "展示属性和主题变量等参考内容。"
  },
  "saas": {
    "en": "Pages for a product website and dashboard.",
    "zh": "提供产品网站与工作台页面。"
  },
  "vscode": {
    "en": "Edit projects and run commands in the browser.",
    "zh": "在浏览器中编辑项目并运行命令。"
  },
  "agent-workspace": {
    "en": "Chat with coding agents and review their work.",
    "zh": "与编码助手对话并查看工作进度。"
  },
  "docs": {
    "en": "Documentation site layout with search, navigation and a page outline.",
    "zh": "为文档站点提供导航和搜索。"
  },
  "team-chat": {
    "en": "Team chat with channels, direct messages and threads.",
    "zh": "带频道、私信和话题串的团队聊天。"
  },
  "blog": {
    "en": "Personal blog with a post list and an article page.",
    "zh": "展示文章列表与正文。"
  },
  "button": {
    "en": "Triggers an action or submits a form.",
    "zh": "触发操作或提交表单。"
  },
  "badge": {
    "en": "Labels an item with a short status or category.",
    "zh": "标记状态或分类。"
  },
  "card": {
    "en": "Groups related content and actions on one surface.",
    "zh": "将相关内容与操作放在一起。"
  },
  "input": {
    "en": "Single-line text field.",
    "zh": "输入单行文本。"
  },
  "textarea": {
    "en": "A text field that grows with your writing.",
    "zh": "输入多行文本并随内容增高。"
  },
  "ios-zoom-lock": {
    "en": "Stops iOS from zooming into small text fields on focus.",
    "zh": "防止聚焦小字号输入框时自动放大。"
  },
  "label": {
    "en": "Names a form control.",
    "zh": "为表单控件命名。"
  },
  "checkbox": {
    "en": "Toggles a single option on or off.",
    "zh": "开启或关闭单个选项。"
  },
  "radio": {
    "en": "Picks exactly one option from a short list.",
    "zh": "从一组选项中选择一项。"
  },
  "stepper": {
    "en": "Adjusts a number up or down in fixed steps.",
    "zh": "按固定步长调整数值。"
  },
  "slider": {
    "en": "Picks a value or range by dragging.",
    "zh": "拖动选择数值或范围。"
  },
  "popover": {
    "en": "Floating panel for extra content or actions near a trigger.",
    "zh": "在触发控件附近显示补充内容。"
  },
  "context-menu": {
    "en": "Opens actions for an item on right-click or long-press.",
    "zh": "通过右键或长按打开操作菜单。"
  },
  "drawer": {
    "en": "Side panel for navigation or secondary tasks over the page.",
    "zh": "在侧边处理导航或次要任务。"
  },
  "bottom-sheet": {
    "en": "Opens a panel from the bottom of the page.",
    "zh": "从底部打开面板。"
  },
  "alert": {
    "en": "Shows a message that needs attention.",
    "zh": "显示需要用户留意的消息。"
  },
  "collapsible": {
    "en": "Shows and hides a section of content.",
    "zh": "展开或收起一段内容。"
  },
  "accordion": {
    "en": "Opens sections of content on demand.",
    "zh": "按需展开内容分节。"
  },
  "breadcrumb": {
    "en": "Shows where the current page sits in the site hierarchy.",
    "zh": "显示当前页面的位置。"
  },
  "text-reveal": {
    "en": "Reveals a headline in sequence.",
    "zh": "逐步显示标题。"
  },
  "text-shimmer": {
    "en": "Highlights text while work is in progress.",
    "zh": "通过文字高亮提示正在处理。"
  },
  "text-scramble": {
    "en": "Scrambles text into its new value when it changes.",
    "zh": "以字符变化呈现新文本。"
  },
  "number-ticker": {
    "en": "Number whose digits roll to each new value.",
    "zh": "滚动显示数值变化。"
  },
  "animated-number": {
    "en": "Counts up to a number when it scrolls into view.",
    "zh": "在进入视野时开始计数。"
  },
  "marquee": {
    "en": "Scrolls content past in an endless loop.",
    "zh": "循环滚动内容。"
  },
  "combobox": {
    "en": "Picks one option from a long list by typing to filter.",
    "zh": "通过搜索从长列表中选择一项。"
  },
  "loader": {
    "en": "Shows that something is loading.",
    "zh": "提示内容正在加载。"
  },
  "multi-select": {
    "en": "Searchable picker for choosing several options at once.",
    "zh": "搜索并选择多个选项。"
  },
  "button-stateful": {
    "en": "Shows an action’s progress and result.",
    "zh": "显示操作的进度与结果。"
  },
  "magnetic": {
    "en": "Makes any element lean toward a nearby cursor.",
    "zh": "让元素响应附近的指针。"
  },
  "expandable-control": {
    "en": "Button or chip that expands on click to reveal a label.",
    "zh": "点击展开控件的标签。"
  },
  "text-cascade": {
    "en": "Rolls text letter by letter whenever its value changes.",
    "zh": "逐字切换文本。"
  },
  "action-swap-blur": {
    "en": "Blurs between button states.",
    "zh": "通过模糊过渡切换按钮状态。"
  },
  "action-swap-roll": {
    "en": "Rolls between button states.",
    "zh": "通过滚动过渡切换按钮状态。"
  },
  "digit-swap": {
    "en": "Rolls only the digits that change.",
    "zh": "仅滚动发生变化的数字。"
  },
  "select-morph": {
    "en": "Select whose trigger unfolds into its option list.",
    "zh": "将选择控件展开为选项列表。"
  },
  "popover-morph": {
    "en": "Popover that grows out of its trigger and folds back.",
    "zh": "从触发控件展开浮层。"
  },
  "morphing-modal": {
    "en": "Dialog that moves between several views inside one panel.",
    "zh": "在同一对话框中切换视图。"
  },
  "shared-layout-bg": {
    "en": "Hover highlight that follows the pointer across a group.",
    "zh": "让高亮跟随指针移动。"
  },
  "aspect-ratio": {
    "en": "Keeps content at a set ratio and animates ratio changes.",
    "zh": "保持内容的宽高比。"
  },
  "wheel-picker": {
    "en": "Picks values with a scrolling wheel.",
    "zh": "通过滚轮选择数值。"
  },
  "color-picker": {
    "en": "Picks a colour by dragging, entering hex or choosing a preset.",
    "zh": "选择或输入颜色。"
  },
  "date-range-picker": {
    "en": "Picks a start and end date from a calendar.",
    "zh": "在日历中选择起止日期。"
  },
  "sortable-stack": {
    "en": "List the user can reorder by dragging or keyboard.",
    "zh": "通过拖动或键盘调整列表顺序。"
  },
  "range-slider-inline": {
    "en": "Slider that shows its label and value on the track.",
    "zh": "在滑轨上显示标签与数值。"
  },
  "pull-to-refresh": {
    "en": "Refreshes a scrolling list when the user pulls it down.",
    "zh": "下拉刷新列表。"
  },
  "smooth-scroll": {
    "en": "Eases scrolling for a page or a scroll container.",
    "zh": "让页面或容器平滑滚动。"
  },
  "scroll-area": {
    "en": "Scroll container with thin scrollbars that stay inside its frame.",
    "zh": "为容器提供滚动区域。"
  },
  "scroll-progress": {
    "en": "Shows how far the reader has scrolled.",
    "zh": "显示阅读进度。"
  },
  "scroll-to": {
    "en": "Button that scrolls to a section or position.",
    "zh": "滚动到指定位置。"
  },
  "scroll-reveal": {
    "en": "Brings content into view as it scrolls onscreen.",
    "zh": "在内容进入视野时显示。"
  },
  "shader-background": {
    "en": "Animated backdrop for hero sections and empty states.",
    "zh": "为页面提供动态背景。"
  },
  "chart-utils": {
    "en": "Shared helpers for building and styling your own charts.",
    "zh": "为图表提供通用工具。"
  },
  "animated-sidebar": {
    "en": "App navigation sidebar that folds into an icon rail.",
    "zh": "可收起为图标栏的侧边导航。"
  },
  "file-tree": {
    "en": "Browses files and folders in a keyboard-navigable tree.",
    "zh": "浏览文件与文件夹。"
  },
  "preview-rail": {
    "en": "Compact section navigation that previews each destination.",
    "zh": "在导航中预览目标内容。"
  },
  "table": {
    "en": "Shows large data sets that people sort, select and resize.",
    "zh": "浏览和整理大量数据。"
  },
  "table-editable": {
    "en": "Lets people edit cells and add or remove rows and columns.",
    "zh": "编辑表格内容与结构。"
  },
  "table-async": {
    "en": "Loads table rows page by page as the reader scrolls.",
    "zh": "随滚动逐页加载数据。"
  },
  "message-bubble": {
    "en": "Holds one chat message in a speech bubble.",
    "zh": "显示一条聊天消息。"
  },
  "message": {
    "en": "Lays out chat conversation rows by sender.",
    "zh": "按发送者排列对话消息。"
  },
  "message-scroller": {
    "en": "Follows new messages until the reader scrolls up.",
    "zh": "在阅读历史消息前跟随新消息。"
  },
  "code-block": {
    "en": "Shows code highlighted at build time, alone or in tabs.",
    "zh": "显示高亮代码。"
  },
  "agent-code-block": {
    "en": "Displays code from an agent, including code still streaming in.",
    "zh": "显示编码助手输出的代码。"
  },
  "file-diff": {
    "en": "Shows one file's changes as a diff, even while streaming.",
    "zh": "显示文件修改差异。"
  },
  "tool-result": {
    "en": "Shows what an agent tool call ran and what it returned.",
    "zh": "展示工具调用与返回结果。"
  },
  "citations": {
    "en": "Links an answer's claims to the sources behind them.",
    "zh": "将回答与参考来源关联。"
  },
  "streaming-response": {
    "en": "Shows a reply as it arrives.",
    "zh": "逐步显示助手回复。"
  },
  "image-generation": {
    "en": "Shows image generation progress and results.",
    "zh": "展示图片生成进度与结果。"
  },
  "tool-approval": {
    "en": "Asks the user to allow or deny an agent tool call.",
    "zh": "请求用户批准工具调用。"
  },
  "agent-activity": {
    "en": "Summarises an agent’s work.",
    "zh": "汇总助手的工作过程。"
  },
  "reasoning-text": {
    "en": "Status line that shows an agent is still working.",
    "zh": "提示助手仍在处理。"
  },
  "agent-progress": {
    "en": "Shows how long an agent has been working.",
    "zh": "显示助手的运行时间。"
  },
  "todo-list": {
    "en": "Shows an agent's step-by-step plan and its progress.",
    "zh": "展示助手的计划与进度。"
  },
  "ai-sidebar": {
    "en": "Navigates folders, projects and files in an AI workspace.",
    "zh": "浏览工作区的项目与文件。"
  },
  "treemap": {
    "en": "Compares parts of a total as sized tiles.",
    "zh": "用面积比较各部分的占比。"
  },
  "candlestick-chart": {
    "en": "Charts price movement over time with volume.",
    "zh": "展示价格走势与成交量。"
  },
  "donut-chart": {
    "en": "Shows how parts make up a whole as a ring.",
    "zh": "展示各部分的占比。"
  },
  "status-bar": {
    "en": "Shows a service's status history and uptime.",
    "zh": "展示服务状态历史。"
  },
  "composition-chart": {
    "en": "Charts how each part's share of a whole changes over time.",
    "zh": "展示各部分占比随时间的变化。"
  },
  "funnel-chart": {
    "en": "Shows how much drops off at each step of a process.",
    "zh": "展示流程各阶段的流失。"
  },
  "heat-calendar": {
    "en": "Shows daily activity on a calendar.",
    "zh": "在日历中展示每日活动量。"
  },
  "theme-toggle": {
    "en": "Switches the page between light and dark themes.",
    "zh": "切换明暗主题。"
  },
  "recommendation-card": {
    "en": "Shows an agent's suggestion for the user to accept or swap.",
    "zh": "展示可接受或更换的助手建议。"
  },
  "switch": {
    "en": "Turns a single setting on or off.",
    "zh": "开启或关闭一项设置。"
  },
  "tabs": {
    "en": "Switches between related panels of content in one place.",
    "zh": "在相关内容面板间切换。"
  },
  "dialog": {
    "en": "Asks for a decision or input in a modal window.",
    "zh": "请求用户决定或输入。"
  },
  "menu": {
    "en": "Dropdown of actions or options opened from a trigger.",
    "zh": "打开操作或选项菜单。"
  },
  "tooltip": {
    "en": "Labels a control with a short hint on hover or focus.",
    "zh": "在悬停或聚焦时显示提示。"
  },
  "select": {
    "en": "Picks one option from a list.",
    "zh": "从列表中选择一项。"
  },
  "toast": {
    "en": "Shows brief notifications that dismiss themselves.",
    "zh": "显示短暂通知。"
  },
  "prompt-bar": {
    "en": "Writes and sends prompts to an agent.",
    "zh": "编写并发送给助手的提示。"
  },
  "chat": {
    "en": "Message thread between a user and an agent.",
    "zh": "展示用户与助手的对话。"
  },
  "approval-card": {
    "en": "Asks the user to approve or decline an agent's action.",
    "zh": "请求用户批准助手的操作。"
  },
  "task-row": {
    "en": "Shows the progress of one background task.",
    "zh": "显示后台任务的进度。"
  },
  "otp-input": {
    "en": "Enters a one-time sign-in or verification code.",
    "zh": "输入一次性验证码。"
  },
  "command-palette": {
    "en": "Keyboard-first launcher for searching and running commands.",
    "zh": "搜索并执行命令。"
  },
  "chat-app": {
    "en": "Agent workspace with a sidebar, conversation and prompt bar.",
    "zh": "提供助手对话工作区。"
  },
  "notification-stack": {
    "en": "Groups notifications for review.",
    "zh": "集中查看多条通知。"
  },
  "feedback-widget": {
    "en": "Collects a short message and mood from users without leaving the page.",
    "zh": "在当前页面收集用户反馈。"
  },
  "expandable-action-bar": {
    "en": "Icon toolbar that reveals labels when the user reaches for it.",
    "zh": "在需要时展开操作标签。"
  },
  "overflow-actions": {
    "en": "Keeps secondary actions in a menu.",
    "zh": "将次要操作收进菜单。"
  },
  "morphing-search": {
    "en": "Search field that opens into a list of results.",
    "zh": "将搜索框展开为结果列表。"
  },
  "expandable-tabs": {
    "en": "Icon tab bar for switching panels in tight spaces.",
    "zh": "在紧凑空间内切换面板。"
  },
  "morphing-tabs": {
    "en": "Reorders tabs and switches their content.",
    "zh": "调整标签顺序并切换内容。"
  },
  "swipeable-list": {
    "en": "List rows with actions revealed by swiping, for touch screens.",
    "zh": "滑动列表项以显示操作。"
  },
  "project-folder": {
    "en": "Folder that previews its files and opens into a file view.",
    "zh": "预览并打开文件夹。"
  },
  "card-folder": {
    "en": "Shows a saved payment card and reveals its details on request.",
    "zh": "查看已保存的支付卡信息。"
  },
  "attachment-upload": {
    "en": "Adds attachments to a message or form.",
    "zh": "为消息或表单添加附件。"
  },
  "file-upload": {
    "en": "Upload queue for dropping files and tracking each one.",
    "zh": "上传文件并查看进度。"
  },
  "availability-scheduler": {
    "en": "Edits weekly hours when someone is available.",
    "zh": "设置每周的可用时间。"
  },
  "signup-form": {
    "en": "Account sign-up form with inline validation and password strength.",
    "zh": "注册账户并验证输入。"
  },
  "avatar": {
    "en": "Shows a photo or initials.",
    "zh": "显示用户照片或姓名缩写。"
  },
  "avatar-generator": {
    "en": "Creates and edits avatars.",
    "zh": "生成或编辑用户头像。"
  },
  "search-button": { en: "Opens search from a responsive toolbar button.", zh: "通过自适应工具栏按钮打开搜索。" },
  "sparkline": {
    "en": "Small inline chart that shows a trend.",
    "zh": "在行内显示趋势。"
  },
  "trend-chart": {
    "en": "Plots how values change over time.",
    "zh": "展示数值随时间的变化。"
  },
  "bar-list": {
    "en": "Ranks items by a single measure.",
    "zh": "按数值排列并比较项目。"
  },
  "stat-card": {
    "en": "Card for a key metric and how it changed.",
    "zh": "展示关键指标与变化。"
  },
  "empty-state": {
    "en": "Explains an empty view and what to do next.",
    "zh": "说明空白状态及下一步操作。"
  },
  "page-header": {
    "en": "Title, context and actions at the top of an app page.",
    "zh": "显示页面标题与操作。"
  },
  "usage-meter": {
    "en": "Shows how much of a quota has been used.",
    "zh": "显示配额使用量。"
  },
  "settings-section": {
    "en": "Layout for grouped settings pages.",
    "zh": "将相关设置分组。"
  },
  "timeline": {
    "en": "Lists entries in time order along a line.",
    "zh": "按时间顺序展示记录。"
  },
  "field": {
    "en": "Connects form labels, controls and feedback.",
    "zh": "关联表单标签、输入与提示。"
  },
  "password-input": {
    "en": "Password field with a button to show or hide it.",
    "zh": "输入密码并按需显示。"
  },
  "segmented-control": {
    "en": "Switches a setting between a few options.",
    "zh": "在少量选项间切换。"
  },
  "accent-picker": {
    "en": "Chooses and remembers an accent colour.",
    "zh": "选择并记住主题色。"
  },
  "pagination": {
    "en": "Moves through pages of results in a list or table.",
    "zh": "切换列表或表格的页码。"
  },
  "workspace-switcher": {
    "en": "Switches between workspaces or teams from the sidebar header.",
    "zh": "切换工作区或团队。"
  },
  "user-menu": {
    "en": "Opens account actions for the signed-in user.",
    "zh": "打开账户操作菜单。"
  },
  "data-table": {
    "en": "Browses, filters and acts on a set of rows.",
    "zh": "浏览、筛选并处理数据行。"
  },
  "toggle-group": {
    "en": "Turns formatting or view options on and off.",
    "zh": "切换格式或视图选项。"
  },
  "toolbar": {
    "en": "Groups related actions into one keyboard-navigable bar.",
    "zh": "集中相关操作并支持键盘导航。"
  },
  "menu-list": {
    "en": "Keyboard-driven option list that leaves focus in the text field.",
    "zh": "选择选项并保持输入框焦点。"
  },
  "swatch-picker": {
    "en": "Picks one colour from a fixed palette.",
    "zh": "从固定色板中选择颜色。"
  },
  "notion-editor": {
    "en": "Writes and saves documents.",
    "zh": "编写并保存文档。"
  },
  "email-editor": {
    "en": "Edits and exports email templates.",
    "zh": "编辑邮件模板并导出。"
  },
  "resizable": {
    "en": "Split panes the user can resize or collapse.",
    "zh": "调整或收起分栏。"
  },
  "overflow-hint": {
    "en": "Shows the full text of a truncated label on hover.",
    "zh": "显示被截断的完整文本。"
  },
  "app-shell": {
    "en": "App frame with a collapsible sidebar and an inset content panel.",
    "zh": "组织应用导航与主内容。"
  },
  "tab-strip": {
    "en": "Switches, closes and reorders document tabs.",
    "zh": "切换、关闭或重排文档标签。"
  },

  "tab-bar": {
    "en": "Bottom navigation for phones, with a label under each icon.",
    "zh": "为手机提供底部导航。"
  },
  "locale-provider": {
    "en": "Sets the language of every built-in label.",
    "zh": "设置组件内置标签的语言。"
  },
  "terminal": {
    "en": "Runs a shell in the page or on your machine.",
    "zh": "在页面中运行命令。"
  },
  "terminal-view": {
    "en": "Shows command output and takes commands in a terminal panel.",
    "zh": "展示命令输出并接收输入。"
  },
  "thread-list-item": {
    "en": "Lists agent or chat threads in a sidebar.",
    "zh": "在侧栏中显示对话。"
  },
  "work-summary": {
    "en": "Summarises the steps an agent took during one turn.",
    "zh": "汇总助手本轮的工作步骤。"
  },
  "edited-files-card": {
    "en": "Reviews and undoes an agent’s file changes.",
    "zh": "查看并撤销助手的文件修改。"
  },
  "model-picker": {
    "en": "Chooses an agent model.",
    "zh": "选择助手使用的模型。"
  },
  "agent-composer": {
    "en": "Prompt input for coding agents with file mentions and commands.",
    "zh": "输入提示并引用文件或命令。"
  },
  "alert-dialog": {
    "en": "Interrupts to confirm a destructive or important action.",
    "zh": "在重要操作前请求确认。"
  },
  "command": {
    "en": "Searchable list of actions, inline or in a dialog.",
    "zh": "搜索并选择操作。"
  },
  "calendar": {
    "en": "Month grid for picking a date or a range.",
    "zh": "在月历中选择日期。"
  },
  "date-picker": {
    "en": "Field that opens a calendar to pick one date.",
    "zh": "打开日历选择日期。"
  },
  "progress": {
    "en": "Shows how far a task has come.",
    "zh": "显示任务完成进度。"
  },
  "skeleton": {
    "en": "Placeholder shape while content loads.",
    "zh": "在加载时预留内容位置。"
  },
  "separator": {
    "en": "Divides groups of content with a hairline.",
    "zh": "分隔相关内容组。"
  },
  "kbd": {
    "en": "Shows a keyboard key or shortcut.",
    "zh": "显示按键或快捷键。"
  },
  "input-otp": {
    "en": "Enters a one-time code, one character per slot.",
    "zh": "逐位输入一次性验证码。"
  },
  "input-group": {
    "en": "Groups related controls inside an input.",
    "zh": "在输入框内组合相关控件。"
  },
  "button-group": {
    "en": "Joins related buttons into one control.",
    "zh": "组合相关按钮。"
  },
  "native-select": {
    "en": "The browser's own select, styled as a field.",
    "zh": "使用浏览器原生选择控件。"
  },
  "menubar": {
    "en": "Row of menus for a desktop app window.",
    "zh": "为桌面应用提供菜单栏。"
  },
  "navigation-menu": {
    "en": "Site navigation with panels of links.",
    "zh": "为站点提供导航菜单。"
  },
  "carousel": {
    "en": "Scrolls through slides one at a time.",
    "zh": "逐张浏览内容。"
  },
  "hover-card": {
    "en": "Previews a linked item while it is hovered.",
    "zh": "悬停时预览链接内容。"
  }
}
