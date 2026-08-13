import { useCallback, useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { fetchSystemStatus, RateLimitedError, UpstreamError } from "../lib/fetchSystemStatus";
import type { SystemStatusResponse } from "../types/systemStatus";

export type MonitoringState =
  | { kind: "loading" }
  | { kind: "success"; data: SystemStatusResponse }
  | { kind: "empty" }
  | { kind: "error"; message: string; retryAfterSeconds: number | null }
  | { kind: "offline" };

/**
 * `live` hits the real endpoint. The rest force each required non-happy-path
 * state on demand, for demoing/testing without waiting on the upstream API
 * to actually change. See README "How to force each state".
 */
export type Scenario = "live" | "loading" | "empty" | "error" | "rate-limit" | "offline";

type FetchOutcome =
  | { kind: "success"; data: SystemStatusResponse }
  | { kind: "empty" }
  | { kind: "error"; message: string; retryAfterSeconds: number | null };

interface FetchResult {
  requestKey: string;
  outcome: FetchOutcome;
}

type SimulatedScenario = Extract<Scenario, "empty" | "error" | "rate-limit">;

// Demo-only: simulates each non-happy-path outcome without touching the
// network, so every required state can be reached on demand from the device.
function simulateOutcome(scenario: SimulatedScenario): Promise<FetchOutcome> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (scenario === "empty") {
        resolve({ kind: "empty" });
        return;
      }
      if (scenario === "error") {
        resolve({
          kind: "error",
          message: "Simulated upstream failure",
          retryAfterSeconds: null,
        });
        return;
      }
      resolve({
        kind: "error",
        message: "Rate limited. Please wait before retrying.",
        retryAfterSeconds: 30,
      });
    }, 400);
  });
}

interface UseSystemStatusResult {
  state: MonitoringState;
  retry: () => void;
  /** Set the moment we last got a real (non-forced-loading) response. */
  lastFetchedAt: Date | null;
}

export function useSystemStatus(scenario: Scenario): UseSystemStatusResult {
  const [deviceOnline, setDeviceOnline] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<FetchResult | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setDeviceOnline(state.isConnected !== false);
    });
    return () => unsubscribe();
  }, []);

  // Derived, not stored — offline is a pure function of scenario + device
  // connectivity, so it doesn't need an effect/setState of its own.
  const isOffline = scenario === "offline" || !deviceOnline;
  const requestKey = `${scenario}:${reloadKey}`;

  useEffect(() => {
    // Nothing to fetch while showing the (derived) offline state, or while
    // intentionally parked on "loading" for the demo scenario.
    if (isOffline || scenario === "loading") {
      return;
    }

    let ignore = false;

    async function run() {
      try {
        const outcome: FetchOutcome =
          scenario === "empty" || scenario === "error" || scenario === "rate-limit"
            ? await simulateOutcome(scenario)
            : await fetchSystemStatus().then((data) =>
                data.length === 0
                  ? ({ kind: "empty" } as const)
                  : ({ kind: "success", data } as const)
              );

        if (!ignore) {
          setResult({ requestKey, outcome });
          if (outcome.kind !== "error") setLastFetchedAt(new Date());
        }
      } catch (err) {
        if (ignore) return;

        if (err instanceof RateLimitedError) {
          setResult({
            requestKey,
            outcome: {
              kind: "error",
              message: "Rate limited. Please wait before retrying.",
              retryAfterSeconds: err.retryAfterSeconds,
            },
          });
          return;
        }

        if (err instanceof UpstreamError) {
          setResult({
            requestKey,
            outcome: { kind: "error", message: err.message, retryAfterSeconds: null },
          });
          return;
        }

        setResult({
          requestKey,
          outcome: { kind: "error", message: "Unknown error", retryAfterSeconds: null },
        });
      }
    }

    run();

    return () => {
      ignore = true;
    };
  }, [scenario, isOffline, requestKey]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  const state: MonitoringState = isOffline
    ? { kind: "offline" }
    : result && result.requestKey === requestKey
      ? result.outcome
      : { kind: "loading" };

  return { state, retry, lastFetchedAt };
}
