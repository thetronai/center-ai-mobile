import type { ComponentType, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";

const ICON_TONES = {
  grey: { bg: colors.grey100, fg: colors.grey500 },
  red: { bg: colors.red50, fg: colors.red500 },
  amber: { bg: colors.amber50, fg: colors.amber500 },
} as const;

interface Action {
  label: string;
  onPress: () => void;
}

interface StateScreenProps {
  icon: ComponentType<{ color: string; size?: number }>;
  tone: keyof typeof ICON_TONES;
  heading: string;
  body: string;
  infoBox?: ReactNode;
  primaryAction: Action;
  secondaryAction?: Action;
}

/**
 * Matches the confirmed "Global States" frames (You're offline / Something
 * went wrong): icon in a soft circle, bold centered heading, grey body
 * copy, optional bordered info box, then a stacked primary/secondary
 * button — full-bleed, matching the mobile frames directly.
 */
export function StateScreen({
  icon: Icon,
  tone,
  heading,
  body,
  infoBox,
  primaryAction,
  secondaryAction,
}: StateScreenProps) {
  const iconTone = ICON_TONES[tone];
  return (
    <View style={styles.container}>
      {/* Nudged up from dead-center: a solid button at the bottom of the
          block reads as visually heavier than the icon/text above it, so
          exact mathematical centering looks like it's sitting too low. */}
      <View style={styles.opticalCenter}>
        <View style={[styles.iconCircle, { backgroundColor: iconTone.bg }]}>
          <Icon color={iconTone.fg} />
        </View>
        <Text style={styles.heading}>{heading}</Text>
        <Text style={styles.body}>{body}</Text>

        {infoBox && (
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxText}>{infoBox}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable onPress={primaryAction.onPress} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{primaryAction.label}</Text>
          </Pressable>
          {secondaryAction && (
            <Pressable onPress={secondaryAction.onPress} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{secondaryAction.label}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: colors.cream,
  },
  opticalCenter: {
    width: "100%",
    alignItems: "center",
    transform: [{ translateY: -24 }],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heading: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.grey900,
    textAlign: "center",
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 16.8,
    color: colors.meta,
    textAlign: "center",
    marginTop: 8,
  },
  infoBox: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.grey200,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  infoBoxText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 15.6,
    color: colors.meta,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    width: "100%",
    borderRadius: 999,
    backgroundColor: colors.blue500,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.white,
  },
  secondaryButton: {
    width: "100%",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.grey200,
    backgroundColor: colors.white,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.grey800,
  },
});
