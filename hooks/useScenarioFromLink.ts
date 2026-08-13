import * as Linking from "expo-linking";
import type { Scenario } from "./useSystemStatus";

const SCENARIOS: readonly Scenario[] = [
  "live",
  "loading",
  "empty",
  "error",
  "rate-limit",
  "offline",
];

function isScenario(value: string | undefined): value is Scenario {
  return (SCENARIOS as readonly string[]).includes(value ?? "");
}

/**
 * Mobile equivalent of the web app's ?scenario= query param — there's no
 * address bar on a phone, so the same idea is driven by a deep link's query
 * string instead, e.g.:
 *   npx uri-scheme open "exp://127.0.0.1:8081/--/?scenario=error" --ios
 * See README "How to force each state" for the full instructions.
 */
export function useScenarioFromLink(): Scenario {
  const url = Linking.useURL();
  if (!url) return "live";

  const { queryParams } = Linking.parse(url);
  const raw = queryParams?.scenario;
  const value = Array.isArray(raw) ? raw[0] : raw;

  return isScenario(value) ? value : "live";
}
