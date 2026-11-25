import * as React from "react"
import { useColorScheme, type ViewStyle } from "react-native"
import { colors, radius, type ColorScheme, type ThemeColors } from "@paneui/tokens"

type Theme = {
  scheme: ColorScheme
  colors: ThemeColors
  radius: Readonly<Record<keyof typeof radius, number>>
  controlRadius: number
  headingFont?: string
  shadows: { raised?: ViewStyle; surface?: ViewStyle; overlay?: ViewStyle }
}
const ThemeContext = React.createContext<Theme | null>(null)
function resolveTheme(scheme: ColorScheme, headingFont?: string): Theme {
  return {
    scheme,
    colors: colors[scheme],
    radius,
    controlRadius: radius.lg,
    headingFont,
    shadows: {},
  }
}

export type ThemeProviderProps = {
  mode?: ColorScheme
  headingFont?: string
  children: React.ReactNode
}
export function ThemeProvider({ mode, headingFont, children }: ThemeProviderProps) {
  const systemScheme = useColorScheme()
  const scheme = mode ?? (systemScheme === "dark" ? "dark" : "light")
  const theme = React.useMemo(() => resolveTheme(scheme, headingFont), [scheme, headingFont])
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTheme(): Theme {
  const systemScheme = useColorScheme()
  const theme = React.useContext(ThemeContext)
  return theme ?? resolveTheme(systemScheme === "dark" ? "dark" : "light")
}
