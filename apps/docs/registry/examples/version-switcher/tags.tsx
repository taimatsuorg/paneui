import { VersionSwitcher } from "@paneui/ui/components/version-switcher"

const versions = [
  { value: "next", label: "4.0", href: "#next", tag: "beta" },
  { value: "3.2", label: "3.2", href: "#3.2", tag: "latest" },
  { value: "2.8", label: "2.8", href: "#2.8", tag: "LTS" },
  { value: "1.x", label: "1.x", href: "#1.x", tag: "archived" },
]

export default function VersionSwitcherTags() {
  return (
    <div className="w-60">
      <VersionSwitcher versions={versions} value="2.8" />
    </div>
  )
}
