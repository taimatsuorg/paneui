"use client"

import { setSiteLocale, useSiteLocale } from "@/lib/site-locale"
import { ChevronDownIcon, GlobeIcon } from "@paneui/ui/icons"
import { Button } from "@paneui/ui/components/button"
import { Menu, MenuContent, MenuGroup, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@paneui/ui/components/menu"

export function LanguageToggle() {
  const locale = useSiteLocale()
  return (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" size="sm" aria-label={locale === "en" ? "Language: English" : "语言：简体中文"} />}>
        <GlobeIcon data-icon="inline-start" />
        <span className="hidden lg:inline" lang={locale === "en" ? "en" : "zh-CN"}>{locale === "en" ? "English" : "简体中文"}</span>
        <ChevronDownIcon data-icon="inline-end" />
      </MenuTrigger>
      <MenuContent align="end">
        <MenuGroup>
          <MenuLabel>{locale === "en" ? "Select language" : "选择语言"}</MenuLabel>
          <MenuRadioGroup value={locale} onValueChange={(value) => { if (value === "en" || value === "zh") setSiteLocale(value) }}>
            <MenuRadioItem value="en" closeOnClick><span lang="en">English</span><span className="ms-auto text-ui-xs text-muted-foreground">EN</span></MenuRadioItem>
            <MenuRadioItem value="zh" closeOnClick><span lang="zh-CN">简体中文</span><span className="ms-auto text-ui-xs text-muted-foreground">ZH</span></MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>
      </MenuContent>
    </Menu>
  )
}
