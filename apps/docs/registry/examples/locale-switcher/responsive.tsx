import { LocaleSwitcher } from "@paneui/ui/components/locale-switcher"

const locales = [
  { code: "en", label: "English", href: "#locale-en" },
  { code: "de", label: "Deutsch", href: "#locale-de" },
  { code: "ja", label: "日本語", href: "#locale-ja" },
]

export default function LocaleSwitcherResponsive() {
  return (
    <div className="flex h-12 w-full max-w-md items-center gap-2 rounded-xl bg-background ps-4 pe-2 shadow-raised">
      <span className="text-ui font-semibold">Acme Docs</span>
      <span className="ms-auto">
        <LocaleSwitcher locales={locales} value="de" size="responsive" />
      </span>
    </div>
  )
}
