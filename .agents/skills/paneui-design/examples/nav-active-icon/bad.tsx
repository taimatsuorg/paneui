import { HomeIcon, InboxIcon } from "@/components/icons"
import { TabBar, TabBarItem } from "@/components/ui/tab-bar"

// With no row fill, colour alone has to carry the active state.
export function AppTabs({ tab }: { tab: string }) {
  return (
    <TabBar aria-label="App">
      <TabBarItem icon={<HomeIcon />} label="Home" active={tab === "home"} />
      <TabBarItem icon={<InboxIcon />} label="Inbox" active={tab === "inbox"} />
    </TabBar>
  )
}
