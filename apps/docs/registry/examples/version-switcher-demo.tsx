import { SidebarNav, SidebarNavContent, SidebarNavLink, SidebarNavList } from "@paneui/ui/components/sidebar-nav"
import { VersionSwitcher } from "@paneui/ui/components/version-switcher"

const versions = [
  { value: "v3", label: "v3", href: "#v3", tag: "latest" },
  { value: "v2", label: "v2", href: "#v2" },
  { value: "v1", label: "v1", href: "#v1", tag: "archived" },
]

export default function VersionSwitcherDemo() {
  return (
    <div className="flex w-64 flex-col gap-2 overflow-hidden rounded-xl bg-background p-2 shadow-raised">
      <VersionSwitcher versions={versions} value="v3" />
      <SidebarNav>
        <SidebarNavContent aria-label="Docs">
          <SidebarNavList>
            <SidebarNavLink href="#" active>
              Introduction
            </SidebarNavLink>
            <SidebarNavLink href="#">Installation</SidebarNavLink>
            <SidebarNavLink href="#">Configuration</SidebarNavLink>
          </SidebarNavList>
        </SidebarNavContent>
      </SidebarNav>
    </div>
  )
}
