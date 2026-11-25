import * as React from "react"
import { AccessibilityInfo, Animated, Pressable, Text, View, type PressableProps, type ViewProps } from "react-native"
import { nativeControl, spacing, typography } from "@paneui/tokens"

import { useTheme } from "./theme"

type TabsContextValue = {
  value: string
  setValue: (value: string) => void
  measurements: Record<string, { x: number; width: number }>
  register: (value: string, layout: { x: number; width: number }) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("Tabs parts must be used within Tabs.")
  return context
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    let mounted = true
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value)
    })
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced)
    return () => {
      mounted = false
      subscription.remove()
    }
  }, [])
  return reduced
}

export type TabsProps = ViewProps & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function Tabs({ value, defaultValue = "", onValueChange, children, ...props }: TabsProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [measurements, setMeasurements] = React.useState<Record<string, { x: number; width: number }>>({})
  const current = value ?? uncontrolled
  const setValue = React.useCallback(
    (next: string) => {
      if (value === undefined) setUncontrolled(next)
      onValueChange?.(next)
    },
    [value, onValueChange]
  )
  const register = React.useCallback((tab: string, layout: { x: number; width: number }) => {
    setMeasurements((previous) => (previous[tab] && previous[tab].x === layout.x && previous[tab].width === layout.width ? previous : { ...previous, [tab]: layout }))
  }, [])
  const context = React.useMemo(() => ({ value: current, setValue, measurements, register }), [current, setValue, measurements, register])
  return (
    <TabsContext.Provider value={context}>
      <View {...props}>{children}</View>
    </TabsContext.Provider>
  )
}

export type TabsListProps = ViewProps & {
  children: React.ReactNode
}

export function TabsList({ children, style, ...props }: TabsListProps) {
  const { colors, scheme, shadows, radius, controlRadius } = useTheme()
  const { value, measurements } = useTabsContext()
  const reduced = useReducedMotion()
  const translateX = React.useRef(new Animated.Value(0)).current
  const width = React.useRef(new Animated.Value(0)).current
  const positioned = React.useRef(false)
  React.useEffect(() => {
    const measurement = measurements[value]
    if (!measurement) return
    if (positioned.current && !reduced) {
      Animated.parallel([
        Animated.timing(translateX, { toValue: measurement.x, duration: 200, useNativeDriver: false }),
        Animated.timing(width, { toValue: measurement.width, duration: 200, useNativeDriver: false }),
      ]).start()
    } else {
      positioned.current = true
      translateX.setValue(measurement.x)
      width.setValue(measurement.width)
    }
  }, [measurements, value, reduced, translateX, width])
  return (
    <View {...props} accessibilityRole="tablist" style={[{ flexDirection: "row", backgroundColor: colors.muted, borderRadius: controlRadius, padding: spacing.xs }, style]}>
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: spacing.xs,
          bottom: spacing.xs,
          left: 0,
          width,
          borderRadius: radius.md,
          backgroundColor: colors.card,
          shadowColor: scheme === "dark" ? colors.background : colors.foreground,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.12,
          shadowRadius: spacing.sm,
          elevation: 2,
          ...shadows.raised,
          transform: [{ translateX }],
        }}
      />
      {children}
    </View>
  )
}

export type TabsTriggerProps = Omit<PressableProps, "children"> & {
  value: string
  children: string
}

export function TabsTrigger({ value, children, disabled = false, style, onPress, onFocus, onBlur, onLayout, accessibilityState, ...props }: TabsTriggerProps) {
  const { colors, radius } = useTheme()
  const { value: active, setValue, register } = useTabsContext()
  const [focused, setFocused] = React.useState(false)
  const selected = active === value
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      aria-selected={selected}
      accessibilityState={{ ...accessibilityState, selected, disabled }}
      disabled={disabled}
      onPress={(event) => {
        setValue(value)
        onPress?.(event)
      }}
      onFocus={(event) => {
        setFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      onLayout={(event) => {
        register(value, event.nativeEvent.layout)
        onLayout?.(event)
      }}
      style={(state) => [
        {
          flex: 1,
          minHeight: nativeControl.sm,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius.md,
          borderWidth: 2,
          borderColor: focused ? colors.ring : "transparent",
          opacity: disabled ? 0.64 : 1,
          backgroundColor: state.pressed ? colors.secondary : "transparent",
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <Text style={[typography.supporting, { color: selected ? colors.foreground : colors.mutedForeground, fontWeight: "500", textAlign: "center" }]}>{children}</Text>
    </Pressable>
  )
}

export type TabsContentProps = ViewProps & {
  value: string
  children: React.ReactNode
}

export function TabsContent({ value, children, ...props }: TabsContentProps) {
  const { value: active } = useTabsContext()
  if (active !== value) return null
  return <View {...props}>{children}</View>
}
