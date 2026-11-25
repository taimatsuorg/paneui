export { colors } from "./colors.generated"
export type { ColorRole, ColorScheme, ThemeColors } from "./colors.generated"

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32, "3xl": 40 } as const
export const radius = { sm: 7, md: 10, lg: 14, xl: 16, "2xl": 16, "3xl": 16 } as const
export const typography = {
  caption: { fontSize: 12, lineHeight: 16 },
  body: { fontSize: 16, lineHeight: 24 },
  supporting: { fontSize: 14, lineHeight: 20 },
  title: { fontSize: 24, lineHeight: 32 },
  heading: { fontSize: 32, lineHeight: 40 },
} as const
export const nativeControl = { xs: 44, sm: 44, default: 48, lg: 52 } as const
