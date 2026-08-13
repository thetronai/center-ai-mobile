import { parseSystemStatusResponse, type SystemStatusResponse } from "../types/systemStatus";

export const SYSTEM_STATUS_API_URL =
  "https://cav-backend-staging.onrender.com/api/v1/config/system-status";

// The staging API is hosted on Render's free tier, which spins the service
// down after inactivity — the first request after idle time has to cold-start
// the container, commonly taking 20-30s+. A shorter timeout here falsely
// reports "Request timed out" while the backend is still waking up, so this
// needs enough headroom to cover a cold start rather than just a slow reply.
const REQUEST_TIMEOUT_MS = 30000;

export class RateLimitedError extends Error {
  retryAfterSeconds: number | null;

  constructor(retryAfterSeconds: number | null) {
    super("Rate limited by upstream system-status API");
    this.name = "RateLimitedError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class UpstreamError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "UpstreamError";
    this.status = status;
  }
}

/**
 * Calls the live system-status endpoint directly from React Native — unlike
 * the web app, there's no server layer to proxy through here, and the client
 * confirmed a direct native call is expected (no CORS restriction on-device).
 *
 * Times out and surfaces as an UpstreamError if the request hangs — observed
 * in testing (Expo Go on iOS Simulator) that fetch() can stall indefinitely
 * on this endpoint's chunked/keep-alive response without ever resolving or
 * rejecting on its own. Without this, a stalled request left the screen
 * stuck on the loading state forever with no way to recover.
 */
export async function fetchSystemStatus(
  signal?: AbortSignal
): Promise<SystemStatusResponse> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);

  // Combine the caller's signal (if any) with our own timeout, so either one aborts the request.
  const onCallerAbort = () => timeoutController.abort();
  signal?.addEventListener("abort", onCallerAbort);

  let response: Response;
  try {
    response = await fetch(SYSTEM_STATUS_API_URL, { signal: timeoutController.signal });
  } catch (err) {
    if (timeoutController.signal.aborted) {
      throw new UpstreamError("Request timed out.");
    }
    throw new UpstreamError(err instanceof Error ? err.message : "Network request failed");
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onCallerAbort);
  }

  if (response.status === 429) {
    const retryAfterHeader = response.headers.get("Retry-After");
    throw new RateLimitedError(retryAfterHeader ? Number(retryAfterHeader) : null);
  }

  if (!response.ok) {
    throw new UpstreamError(`Upstream responded with ${response.status}`, response.status);
  }

  const data: unknown = await response.json();
  return parseSystemStatusResponse(data);
}
