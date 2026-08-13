import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSystemStatus } from "../hooks/useSystemStatus";
import { useScenarioFromLink } from "../hooks/useScenarioFromLink";
import { StatusBadge } from "../components/StatusBadge";
import { SignalBar } from "../components/SignalBar";
import { StateScreen } from "../components/StateScreen";
import { WifiOffIcon, AlertIcon, InboxIcon } from "../components/StateIcons";
import { LANES, type Lane, type SystemService } from "../types/systemStatus";
import { colors, fonts } from "../theme";

const LANE_LABELS: Record<Lane, string> = {
  compute: "Compute service status",
  mining: "Mining service status",
  shared: "Shared service status",
};

function groupByLane(data: SystemService[]): Record<Lane, SystemService[]> {
  const groups: Record<Lane, SystemService[]> = { compute: [], mining: [], shared: [] };
  for (const service of data) {
    groups[service.lane].push(service);
  }
  return groups;
}

function formatTimestamp(date: Date): string {
  return (
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
      date
    ) +
    " · " +
    new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date)
  );
}

/**
 * The Monitoring screen — the single screen in scope for this trial.
 *
 * The scenario isn't chosen via any on-screen control (that would look like
 * extra tabs/screens on top of a single-screen design) — it's read from a
 * deep link's query string instead. See README "How to force each state".
 */
export function MonitoringScreen() {
  const scenario = useScenarioFromLink();
  const { state, retry, lastFetchedAt } = useSystemStatus(scenario);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monitoring</Text>
      </View>

      {state.kind === "loading" && (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.blue500} />
          <Text style={styles.loadingText}>Loading service status…</Text>
        </View>
      )}

      {state.kind === "offline" && (
        <StateScreen
          icon={WifiOffIcon}
          tone="grey"
          heading="You're offline"
          body="Check your internet connection and try again. Previously loaded information may still be available."
          infoBox={
            lastFetchedAt
              ? `Last updated ${formatTimestamp(lastFetchedAt)}. Live data is unavailable while offline.`
              : undefined
          }
          primaryAction={{ label: "Try Again", onPress: retry }}
        />
      )}

      {state.kind === "error" && (
        <StateScreen
          icon={AlertIcon}
          tone="red"
          heading="Something went wrong"
          body="We couldn't load this information. Please try again."
          infoBox={
            state.message +
            (state.retryAfterSeconds !== null ? ` Retry after ${state.retryAfterSeconds}s.` : "")
          }
          primaryAction={{ label: "Try again", onPress: retry }}
        />
      )}

      {state.kind === "empty" && (
        <StateScreen
          icon={InboxIcon}
          tone="grey"
          heading="No services reported"
          body="There's no service status data to show right now."
          primaryAction={{ label: "Refresh", onPress: retry }}
        />
      )}

      {state.kind === "success" && (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {LANES.map((lane) => {
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

          <Text style={styles.disclaimer}>
            Status reflects the most recently reported data. Data may be delayed and does not
            guarantee uptime.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grey200,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 14,
    lineHeight: 18.4,
    color: colors.grey900,
    textAlign: "center",
  },
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.cream,
  },
  loadingText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.meta,
  },
  scrollView: {
    backgroundColor: colors.cream,
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16.8,
    color: colors.grey500,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.grey200,
    backgroundColor: colors.white,
    borderRadius: 16,
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
    fontFamily: fonts.displaySemiBold,
    fontSize: 14,
    lineHeight: 16.8,
    color: colors.blue900,
  },
  disclaimer: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    lineHeight: 14.4,
    color: colors.meta,
    marginTop: 4,
  },
});
