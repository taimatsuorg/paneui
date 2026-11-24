import { HomeFilledIcon, HomeIcon, InboxFilledIcon, InboxIcon } from "@/components/icons"
import { TabBar, TabBarItem } from "@/components/ui/tab-bar"

// Outline at rest, the filled glyph when active: the shape changes as well as the colour.
export function AppTabs({ tab }: { tab: string }) {
  return (
    <TabBar aria-label="App">
      <TabBarItem icon={<HomeIcon />} activeIcon={<HomeFilledIcon />} label="Home" active={tab === "home"} />
      <TabBarItem icon={<InboxIcon />} activeIcon={<InboxFilledIcon />} label="Inbox" active={tab === "inbox"} />
    </TabBar>
  )
}
