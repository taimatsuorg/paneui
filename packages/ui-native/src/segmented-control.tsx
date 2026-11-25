import * as React from "react"
import { AccessibilityInfo, Animated, Pressable, Text, View, type ViewProps } from "react-native"
import { nativeControl, spacing, typography } from "@paneui/tokens"
import { useLayoutDirection } from "./layout-direction"
import { useTheme } from "./theme"
import { useField, useFormValue } from "./field"

export type SegmentedControlOption = { value: string; label: string; disabled?: boolean }
export type SegmentedControlProps = ViewProps & { options: readonly SegmentedControlOption[]; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; disabled?: boolean; label?: string }
export function SegmentedControl({ options, value, defaultValue, onValueChange, disabled, label, style, onLayout, ...props }: SegmentedControlProps) {
  const { colors, radius } = useTheme()
  const field = useField()
  const rtl = useLayoutDirection()
  const [current, change] = useFormValue(value, defaultValue ?? options.find((option) => !option.disabled)?.value ?? "", onValueChange)
  const [width, setWidth] = React.useState(0)
  const [focused, setFocused] = React.useState<string | null>(null)
  const [reduceMotion, setReduceMotion] = React.useState(true)
  const position = React.useRef(new Animated.Value(0)).current
  const index = options.findIndex((option) => option.value === current)
  const segmentWidth = Math.max(0, width - spacing.sm) / Math.max(1, options.length)
  React.useEffect(() => {
    let active = true
    AccessibilityInfo.isReduceMotionEnabled().then((next) => { if (active) setReduceMotion(next) }).catch(() => {})
    const listener = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion)
    return () => { active = false; listener.remove() }
  }, [])
  React.useEffect(() => {
    const target = (rtl ? options.length - 1 - Math.max(0, index) : Math.max(0, index)) * segmentWidth
    const animation = Animated.timing(position, { toValue: target, duration: reduceMotion ? 0 : 200, useNativeDriver: true })
    animation.start()
    return () => animation.stop()
  }, [index, options.length, position, reduceMotion, segmentWidth, rtl])
  if (options.length < 2 || options.length > 5) throw new Error("SegmentedControl requires two to five options")
  const innerRadius = Math.max(0, radius["2xl"] - spacing.xs)
  return <View nativeID={field?.id} {...props} accessibilityRole="radiogroup" accessibilityLabel={props.accessibilityLabel ?? label ?? field?.label} accessibilityHint={field?.error ?? field?.description} onLayout={(event) => { setWidth(event.nativeEvent.layout.width); onLayout?.(event) }} style={[{ flexDirection: "row", padding: spacing.xs, borderRadius: radius["2xl"], backgroundColor: colors.secondary, position: "relative" }, style]}>{index >= 0 ? <Animated.View pointerEvents="none" style={{ position: "absolute", left: spacing.xs, top: spacing.xs, bottom: spacing.xs, width: segmentWidth, borderRadius: innerRadius, backgroundColor: colors.card, transform: [{ translateX: position }] }} /> : null}{options.map((option) => {
    const inactive = (disabled ?? field?.disabled ?? false) || option.disabled
    return <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label} aria-checked={current === option.value} accessibilityState={{ checked: current === option.value, disabled: inactive }} disabled={inactive} onPress={() => change(option.value)} onFocus={() => setFocused(option.value)} onBlur={() => setFocused(null)} style={({ pressed }) => ({ flex: 1, minWidth: nativeControl.sm, minHeight: nativeControl.default, alignItems: "center", justifyContent: "center", padding: spacing.sm, borderWidth: 2, borderColor: focused === option.value ? colors.ring : "transparent", borderRadius: innerRadius, backgroundColor: pressed ? colors.secondary : "transparent", opacity: inactive ? 0.64 : 1 })}><Text style={[typography.body, { color: colors.foreground, fontWeight: "500", textAlign: "center" }]}>{option.label}</Text></Pressable>
  })}</View>
}
