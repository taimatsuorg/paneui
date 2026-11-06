import { VersionSwitcher } from "@paneui/ui/components/version-switcher"

const versions = [
  { value: "v3", label: "v3", href: "#v3", tag: "latest" },
  { value: "v2", label: "v2", href: "#v2" },
  { value: "v1", label: "v1", href: "#v1", tag: "archived" },
]

export default function VersionSwitcherCompact() {
  return (
    <div className="flex h-12 w-full max-w-md items-center gap-2 rounded-xl bg-background ps-4 pe-2 shadow-raised">
      <span className="text-ui font-semibold">Acme Changelog</span>
      <span className="ms-auto">
        <VersionSwitcher versions={versions} value="v3" size="compact" />
      </span>
    </div>
  )
}
