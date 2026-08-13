import { StyleSheet, Text, View } from "react-native";
import type { StatusValue } from "../types/systemStatus";

// Neutral placeholder styling — swap for the real design tokens once the
// Monitoring frames' status colors are confirmed.
const COLORS: Record<StatusValue, { bg: string; border: string; text: string }> = {
  Operational: { bg: "#ecfdf5", border: "#a7f3d0", text: "#047857" },
  Degraded: { bg: "#fffbeb", border: "#fde68a", text: "#b45309" },
  "Major Outage": { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
  Unknown: { bg: "#f4f4f5", border: "#e4e4e7", text: "#52525b" },
};

export function StatusBadge({ status }: { status: StatusValue }) {
  const c = COLORS[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.text, { color: c.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
});
