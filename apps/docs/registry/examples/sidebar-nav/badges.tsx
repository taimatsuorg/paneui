"use client"

import { useT } from "@/lib/site-locale"
import { CloudIcon, HomeIcon, PaletteIcon, PlugIcon, SettingsIcon } from "@paneui/ui/icons"
import { Badge } from "@paneui/ui/components/badge"
import { SidebarNav, SidebarNavContent, SidebarNavLink, SidebarNavList, SidebarNavSection } from "@paneui/ui/components/sidebar-nav"

export default function SidebarNavBadges() {
  const t = useT()
  const fresh = (
    <Badge variant="primary" size="sm">
      {t({ en: "New", zh: "新" })}
    </Badge>
  )
  return (
    <div className="flex h-96 w-60 flex-col overflow-hidden rounded-xl bg-background shadow-raised">
      <SidebarNav>
        <SidebarNavContent aria-label={t({ en: "Guide", zh: "指南" })} className="pt-3">
          <SidebarNavList>
            <SidebarNavLink href="#" icon={<HomeIcon />}>
              {t({ en: "Introduction", zh: "介绍" })}
            </SidebarNavLink>
          </SidebarNavList>
          <SidebarNavSection label={t({ en: "Guide", zh: "指南" })} badge={fresh}>
            <SidebarNavSection level="label" label={t({ en: "Write", zh: "写作" })}>
              <SidebarNavList>
                <SidebarNavLink href="#" icon={<PaletteIcon />} active>
                  {t({ en: "Theming", zh: "主题" })}
                </SidebarNavLink>
                <SidebarNavLink href="#" icon={<PlugIcon />} badge={fresh}>
                  {t({ en: "Plugins", zh: "插件" })}
                </SidebarNavLink>
              </SidebarNavList>
            </SidebarNavSection>
            <SidebarNavSection level="label" label={t({ en: "Ship", zh: "发布" })} badge={fresh}>
              <SidebarNavList>
                <SidebarNavLink href="#" icon={<SettingsIcon />}>
                  {t({ en: "Configuration", zh: "配置" })}
                </SidebarNavLink>
                <SidebarNavLink href="#" icon={<CloudIcon />}>
                  {t({ en: "Deploying", zh: "部署" })}
                </SidebarNavLink>
              </SidebarNavList>
            </SidebarNavSection>
            <SidebarNavSection level="group" label={t({ en: "Recipes", zh: "示例" })} badge={fresh}>
              <SidebarNavList>
                <SidebarNavLink href="#">{t({ en: "Search", zh: "搜索" })}</SidebarNavLink>
                <SidebarNavLink href="#">{t({ en: "Math", zh: "公式" })}</SidebarNavLink>
              </SidebarNavList>
            </SidebarNavSection>
          </SidebarNavSection>
        </SidebarNavContent>
      </SidebarNav>
    </div>
  )
}
