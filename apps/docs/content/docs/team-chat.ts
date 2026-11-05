import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "Team chat with channels, direct messages and threads.", zh: "带频道、私信和话题串的团队聊天。" },
  usage: {
    imports: `// One command, into a new app:
// pnpm dlx shadcn@latest init -d -n my-chat https://paneui.dev/r/team-chat.json
// or into an existing one (replaces app/page.tsx):
// pnpm dlx shadcn@latest add https://paneui.dev/r/team-chat.json
import { TeamChatApp } from "@/components/team-chat/team-chat"`,
    code: `// app/page.tsx (installed for you)
export default function TeamChatPage() {
  return <TeamChatApp />
}`,
  },
  composition: `TeamChatApp
├── Sidebar (rail)              workspace sections, settings, your avatar
│   ├── Channels                SidebarItem per channel, unread badges
│   └── Direct messages         presence dot on each avatar
├── shell-inset panel
│   ├── header                  name, topic, members, search
│   ├── MessageScroller
│   │   └── MessageList flat    rows fold under one name within 5 minutes
│   ├── Composer                Enter sends, Shift + Enter breaks the line
│   └── ThreadPane              replies to one message, its own composer
└── parts/data.ts               people, channels and seed messages`,
  examples: [],
  api: [],
  notes: [
    {
      title: "Data",
      body: { en: "Everything comes from `parts/data.ts`. Pass your own list to `TeamChatApp initial={…}`, or swap the `useState` in `team-chat.tsx` for your store. Times are minutes since midnight so the seed needs no dates.", zh: "所有数据来自 `parts/data.ts`。把你自己的列表传给 `TeamChatApp initial={…}`，或把 `team-chat.tsx` 里的 `useState` 换成你的数据层。时间以当天分钟数表示，种子数据无需日期。" },
    },
    {
      title: "Message text",
      body: { en: "`@Name` renders as a mention, backticks as inline code and `**text**` as bold. The composer's Bold and Code buttons wrap the selection.", zh: "`@Name` 渲染为提及，反引号为行内代码，`**text**` 为粗体。输入框的粗体和代码按钮会包裹选中文本。" },
    },
    {
      title: "Phones",
      body: { en: "Below `md` the channel list folds into the rail and closes after you pick a conversation, and a thread covers the conversation instead of sitting beside it.", zh: "低于 `md` 时频道列表收进侧轨，选择会话后自动收起；话题串覆盖在会话上方而不是并排显示。" },
    },
  ],
} satisfies ComponentDoc
