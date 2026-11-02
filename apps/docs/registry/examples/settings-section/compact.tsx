import { Kbd, KbdGroup } from "@paneui/ui/components/kbd"
import { SettingsGroup, SettingsRow, SettingsRowText, SettingsRowTitle } from "@paneui/ui/components/settings-section"

const shortcuts = [
  { label: "New chat", keys: ["⌘", "N"] },
  { label: "Toggle sidebar", keys: ["⌘", "B"] },
  { label: "Search", keys: ["⌘", "K"] },
]

export default function SettingsSectionCompact() {
  return (
    <SettingsGroup className="w-full max-w-md">
      {shortcuts.map((s) => (
        <SettingsRow key={s.label} size="sm">
          <SettingsRowText>
            <SettingsRowTitle>{s.label}</SettingsRowTitle>
          </SettingsRowText>
          <KbdGroup>
            {s.keys.map((k) => (
              <Kbd key={k}>{k}</Kbd>
            ))}
          </KbdGroup>
        </SettingsRow>
      ))}
    </SettingsGroup>
  )
}
