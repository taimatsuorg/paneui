import { MethodBadge } from "@paneui/ui/components/endpoint"
import { SidebarNav, SidebarNavContent, SidebarNavLink, SidebarNavList, SidebarNavSection } from "@paneui/ui/components/sidebar-nav"

const operations = [
  { method: "get", label: "List members" },
  { method: "post", label: "Invite a member", active: true },
  { method: "get", label: "Get a member" },
  { method: "patch", label: "Update a role" },
  { method: "delete", label: "Remove a member" },
]

export default function EndpointSidebar() {
  return (
    <div className="w-64 rounded-xl bg-background p-2 shadow-raised">
      <SidebarNav>
        <SidebarNavContent aria-label="API">
          <SidebarNavSection label="Members">
            <SidebarNavList>
              {operations.map((op) => (
                <SidebarNavLink key={op.label} href="#" active={op.active}>
                  <span className="flex min-w-0 items-center gap-2">
                    <MethodBadge method={op.method} size="sm" />
                    <span className="truncate">{op.label}</span>
                  </span>
                </SidebarNavLink>
              ))}
            </SidebarNavList>
          </SidebarNavSection>
        </SidebarNavContent>
      </SidebarNav>
    </div>
  )
}
