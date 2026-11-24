import { Pressable, StyleSheet } from "react-native"
const styles = StyleSheet.create({ control: { minHeight: 44 } })
export const Example = () => <Pressable accessibilityRole="button" accessibilityLabel="Open" style={styles.control} />
