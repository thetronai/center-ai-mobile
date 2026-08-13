import { StyleSheet, View } from "react-native";
import type { SignalLevel } from "../types/systemStatus";
import { colors } from "../theme";

const COLORS: Record<SignalLevel, string> = {
  good: colors.green500,
  warn: colors.amber500,
  major: colors.red500,
};

/** Renders the 10-entry signal history, oldest (left) to newest (right). */
export function SignalBar({ signals }: { signals: SignalLevel[] }) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Signal history: ${signals.join(", ")}`}
    >
      {signals.map((level, i) => (
        <View key={i} style={[styles.segment, { backgroundColor: COLORS[level] }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 4,
  },
  segment: {
    width: 10,
    height: 16,
    borderRadius: 2,
  },
});
