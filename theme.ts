// Brand tokens confirmed from the client's Figma color/type styles —
// mirrors the same values used in the web project.
export const colors = {
  blue50: "#eaf0fd",
  blue100: "#becff7",
  blue200: "#9fb8f4",
  blue300: "#7397ee",
  blue400: "#5883eb",
  blue500: "#2e64e6",
  blue600: "#2a5bd1",
  blue700: "#2147a3",
  blue800: "#19377f",
  blue900: "#132a61",

  grey50: "#f1f1f2",
  grey100: "#d3d5d8",
  grey200: "#bec0c5",
  grey300: "#a0a3aa",
  grey400: "#8d9199",
  grey500: "#717680",
  grey600: "#676b74",
  grey700: "#50545b",
  grey800: "#3e4146",
  grey900: "#2f3236",

  // Approximated from the rendered Global States / Monitoring frames — the
  // exact hex wasn't obtainable since export/copy is disabled on the file.
  cream: "#f6f5f0",

  // Status colors aren't in the client's confirmed token set (the
  // Monitoring frame only shows Active/Provisioning, not the 4-value
  // contract) — original mapping using semantic green/amber/red.
  emerald50: "#ecfdf5",
  emerald700: "#047857",
  amber50: "#fffbeb",
  amber500: "#f59e0b",
  amber700: "#b45309",
  red50: "#fef2f2",
  red500: "#ef4444",
  red700: "#b91c1c",
  green500: "#10b981",
  white: "#ffffff",

  // Confirmed from Figma dev-mode inspection: meta/secondary text color,
  // and the Active/Operational badge's exact bg + border pair.
  meta: "#7a8299",
  badgeSuccessBg: "#edf7f2",
  badgeSuccessBorder: "#c2e5d1",
} as const;

export const fonts = {
  displaySemiBold: "Urbanist_600SemiBold",
  displayBold: "Urbanist_700Bold",
  bodyRegular: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
} as const;
