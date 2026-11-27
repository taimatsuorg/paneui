"use client"

import { Badge } from "@paneui/ui/components/badge"
import {
  SidebarNav,
  SidebarNavContent,
  SidebarNavFooter,
  SidebarNavLink,
  SidebarNavList,
  SidebarNavSearch,
  SidebarNavSection,
} from "@paneui/ui/components/sidebar-nav"

export default function SidebarNavDemo() {
  return (
    <div className="flex w-64 flex-col overflow-hidden frame-xl frame-inset-2 bg-background shadow-raised [&_[data-slot=sidebar-nav-footer]_[data-slot=sidebar-nav-link]]:rounded-inner">
      <SidebarNav>
        <SidebarNavSearch shortcut="⌘K" />
        <SidebarNavContent aria-label="Docs">
          <SidebarNavSection label="Getting started">
            <SidebarNavList>
              <SidebarNavLink href="#">Introduction</SidebarNavLink>
              <SidebarNavLink href="#" active>
                Installation
              </SidebarNavLink>
              <SidebarNavLink href="#">Theming</SidebarNavLink>
            </SidebarNavList>
          </SidebarNavSection>
          <SidebarNavSection label="Components" count={6}>
            <SidebarNavSection level="group" label="Forms" count={3}>
              <SidebarNavList>
                <SidebarNavLink href="#">Button</SidebarNavLink>
                <SidebarNavLink href="#">Input</SidebarNavLink>
                <SidebarNavLink
                  href="#"
                  badge={
                    <Badge variant="primary" size="sm">
                      New
                    </Badge>
                  }
                >
                  Select
                </SidebarNavLink>
              </SidebarNavList>
            </SidebarNavSection>
            <SidebarNavSection level="group" label="Overlays" count={3} defaultOpen={false}>
              <SidebarNavList>
                <SidebarNavLink href="#">Dialog</SidebarNavLink>
                <SidebarNavLink href="#">Menu</SidebarNavLink>
                <SidebarNavLink href="#">Popover</SidebarNavLink>
              </SidebarNavList>
            </SidebarNavSection>
          </SidebarNavSection>
        </SidebarNavContent>
        <SidebarNavFooter>
          <SidebarNavList>
            <SidebarNavLink href="#">Changelog</SidebarNavLink>
          </SidebarNavList>
        </SidebarNavFooter>
      </SidebarNav>
    </div>
  )
}
