import { StyleSheet, Text, View } from "react-native";
import type { StatusValue } from "../types/systemStatus";
import { colors, fonts } from "../theme";

// Operational's bg/border/text are all confirmed exact from Figma dev-mode
// inspection. The other three aren't in the confirmed token set (the
// Monitoring frame only shows Active/Provisioning, not this 4-value
// contract) — extended the same bg+border+text pattern to them for visual
// consistency, using semantic amber/red/grey.
const STYLES: Record<StatusValue, { bg: string; border: string; text: string }> = {
  Operational: {
    bg: colors.badgeSuccessBg,
    border: colors.badgeSuccessBorder,
    text: colors.badgeSuccessText,
  },
  Degraded: { bg: colors.amber50, border: colors.amber500, text: colors.amber700 },
  "Major Outage": { bg: colors.red50, border: colors.red500, text: colors.red700 },
  Unknown: { bg: colors.grey100, border: colors.grey200, text: colors.grey600 },
};

export function StatusBadge({ status }: { status: StatusValue }) {
  const c = STYLES[status];
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
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16.8,
  },
});
