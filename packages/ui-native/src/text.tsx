import { Text as NativeText, type TextProps as NativeTextProps } from "react-native"
import { typography } from "@paneui/tokens"

import { useTheme } from "./theme"

export type TextProps = NativeTextProps & {
  variant?: keyof typeof typography
  tone?: "default" | "muted" | "destructive"
}

export function Text({ variant = "body", tone = "default", style, ...props }: TextProps) {
  const { colors, headingFont, scheme } = useTheme()
  const errorColor = scheme === "light" ? colors.foreground : colors.destructive
  const color = tone === "muted" ? colors.mutedForeground : tone === "destructive" ? errorColor : colors.foreground
  return <NativeText {...props} style={[typography[variant], { color, fontFamily: variant === "heading" || variant === "title" ? headingFont : undefined, fontWeight: variant === "heading" || variant === "title" ? "600" : "400" }, style]} />
}
