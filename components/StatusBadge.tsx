import { StyleSheet, Text, View } from "react-native";
import type { StatusValue } from "../types/systemStatus";
import { colors, fonts } from "../theme";

// Status colors aren't in the client's confirmed token set (the Monitoring
// frame only shows Active/Provisioning, not this 4-value contract) — this
// is an original mapping using semantic green/amber/red, styled as a pill
// to match the "Active"/"Provisioning" badges seen elsewhere in the file.
const STYLES: Record<StatusValue, { bg: string; text: string }> = {
  Operational: { bg: colors.emerald50, text: colors.emerald700 },
  Degraded: { bg: colors.amber50, text: colors.amber700 },
  "Major Outage": { bg: colors.red50, text: colors.red700 },
  Unknown: { bg: colors.grey100, text: colors.grey600 },
};

export function StatusBadge({ status }: { status: StatusValue }) {
  const c = STYLES[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
});
