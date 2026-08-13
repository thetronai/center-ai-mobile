import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSystemStatus, type Scenario } from "../hooks/useSystemStatus";
import { StatusBadge } from "../components/StatusBadge";
import { SignalBar } from "../components/SignalBar";
import { LANES, type Lane, type SystemService } from "../types/systemStatus";

const LANE_LABELS: Record<Lane, string> = {
  compute: "Compute",
  mining: "Mining",
  shared: "Shared",
};

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "loading", label: "Loading" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
  { value: "rate-limit", label: "Rate limited" },
  { value: "offline", label: "Offline" },
];

function groupByLane(data: SystemService[]): Record<Lane, SystemService[]> {
  const groups: Record<Lane, SystemService[]> = { compute: [], mining: [], shared: [] };
  for (const service of data) {
    groups[service.lane].push(service);
  }
  return groups;
}

export function MonitoringScreen() {
  const [scenario, setScenario] = useState<Scenario>("live");
  const { state, retry } = useSystemStatus(scenario);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Monitoring</Text>
        <Text style={styles.subtitle}>
          Status reflects the most recently reported data. Data may be delayed and does not
          guarantee uptime.
        </Text>

        {/* Demo controls — not part of the design, lets every required state be reached on demand. */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.switcher}>
          {SCENARIOS.map((s) => {
            const active = scenario === s.value;
            return (
              <Pressable
                key={s.value}
                onPress={() => setScenario(s.value)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {state.kind === "loading" && (
          <View style={styles.panel}>
            <ActivityIndicator />
            <Text style={styles.panelText}>Loading service status…</Text>
          </View>
        )}

        {state.kind === "offline" && (
          <View style={[styles.panel, styles.panelWarn]}>
            <Text style={styles.panelTitleWarn}>You&apos;re offline</Text>
            <Text style={styles.panelBodyWarn}>
              Check your internet connection. We&apos;ll keep showing this until you&apos;re back
              online.
            </Text>
            <Pressable onPress={retry} style={styles.retryButtonWarn}>
              <Text style={styles.retryTextWarn}>Try again</Text>
            </Pressable>
          </View>
        )}

        {state.kind === "error" && (
          <View style={[styles.panel, styles.panelError]}>
            <Text style={styles.panelTitleError}>Couldn&apos;t load status</Text>
            <Text style={styles.panelBodyError}>{state.message}</Text>
            {state.retryAfterSeconds !== null && (
              <Text style={styles.panelHintError}>Retry after {state.retryAfterSeconds}s.</Text>
            )}
            <Pressable onPress={retry} style={styles.retryButtonError}>
              <Text style={styles.retryTextError}>Retry</Text>
            </Pressable>
          </View>
        )}

        {state.kind === "empty" && (
          <View style={styles.panel}>
            <Text style={styles.panelText}>No services reported right now.</Text>
          </View>
        )}

        {state.kind === "success" &&
          LANES.map((lane) => {
            const services = groupByLane(state.data)[lane];
            if (services.length === 0) return null;
            return (
              <View key={lane} style={styles.section}>
                <Text style={styles.sectionTitle}>{LANE_LABELS[lane]}</Text>
                {services.map((service) => (
                  <View key={service.name} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{service.name}</Text>
                      <StatusBadge status={service.status} />
                    </View>
                    <SignalBar signals={service.signals} />
                  </View>
                ))}
              </View>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 16,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#18181b",
  },
  subtitle: {
    fontSize: 13,
    color: "#71717a",
    marginBottom: 12,
  },
  switcher: {
    marginBottom: 16,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: "#ffffff",
  },
  chipActive: {
    backgroundColor: "#18181b",
    borderColor: "#18181b",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#52525b",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  panel: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 12,
    padding: 16,
    alignItems: "flex-start",
    gap: 8,
  },
  panelText: {
    fontSize: 13,
    color: "#71717a",
  },
  panelWarn: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  panelTitleWarn: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
  },
  panelBodyWarn: {
    fontSize: 13,
    color: "#b45309",
  },
  retryButtonWarn: {
    borderWidth: 1,
    borderColor: "#fde68a",
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryTextWarn: {
    fontSize: 12,
    fontWeight: "500",
    color: "#92400e",
  },
  panelError: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  panelTitleError: {
    fontSize: 14,
    fontWeight: "600",
    color: "#991b1b",
  },
  panelBodyError: {
    fontSize: 13,
    color: "#b91c1c",
  },
  panelHintError: {
    fontSize: 12,
    color: "#b91c1c",
  },
  retryButtonError: {
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryTextError: {
    fontSize: 12,
    fontWeight: "500",
    color: "#991b1b",
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#18181b",
  },
});
