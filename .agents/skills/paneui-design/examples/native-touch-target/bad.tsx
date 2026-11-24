import { Pressable, StyleSheet } from "react-native"
const styles = StyleSheet.create({ control: { height: 28 } })
export const Example = () => <Pressable accessibilityRole="button" accessibilityLabel="Open" style={styles.control} />
