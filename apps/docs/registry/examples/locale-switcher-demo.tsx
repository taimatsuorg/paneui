import { LocaleSwitcher } from "@paneui/ui/components/locale-switcher"

const locales = [
  { code: "en", label: "English", href: "#locale-en" },
  { code: "zh-CN", label: "简体中文", href: "#locale-zh-CN" },
  { code: "ja", label: "日本語", href: "#locale-ja" },
  { code: "ar", label: "العربية", href: "#locale-ar", dir: "rtl" as const },
]

export default function LocaleSwitcherDemo() {
  return (
    <div className="flex h-12 w-full max-w-xl items-center gap-4 rounded-xl bg-background px-4 shadow-raised">
      <span className="text-ui font-semibold">Acme Docs</span>
      <span className="ms-auto flex items-center gap-1">
        <LocaleSwitcher locales={locales} value="en" />
      </span>
    </div>
  )
}
