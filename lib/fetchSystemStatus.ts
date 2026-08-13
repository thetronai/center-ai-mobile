import { parseSystemStatusResponse, type SystemStatusResponse } from "../types/systemStatus";

export const SYSTEM_STATUS_API_URL =
  "https://cav-backend-staging.onrender.com/api/v1/config/system-status";

// The staging API is hosted on Render's free tier, which spins the service
// down after inactivity — the first request after idle time has to cold-start
// the container, commonly taking 20-30s+. A shorter timeout here falsely
// reports "Request timed out" while the backend is still waking up, so this
// needs enough headroom to cover a cold start rather than just a slow reply.
const REQUEST_TIMEOUT_MS = 30000;

// Observed on iOS Simulator specifically (not Android, not curl from the
// Mac): fetch() intermittently throws "The network connection was lost"
// (NSURLErrorNetworkConnectionLost). The upstream is behind Cloudflare with
// HTTP/3 advertised (`alt-svc: h3`), and iOS's QUIC negotiation over the
// Simulator's virtualized network adapter is a known-flaky combination —
// this doesn't reproduce on a physical device. One silent retry papers over
// the one-off connection drop without masking a genuinely dead backend.
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 500;

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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function attemptFetch(signal?: AbortSignal): Promise<Response> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);

  // Combine the caller's signal (if any) with our own timeout, so either one aborts the request.
  const onCallerAbort = () => timeoutController.abort();
  signal?.addEventListener("abort", onCallerAbort);

  try {
    return await fetch(SYSTEM_STATUS_API_URL, { signal: timeoutController.signal });
  } catch (err) {
    if (timeoutController.signal.aborted) {
      throw new UpstreamError("Request timed out.");
    }
    throw new UpstreamError(err instanceof Error ? err.message : "Network request failed");
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onCallerAbort);
  }
}

/**
 * Calls the live system-status endpoint directly from React Native — unlike
 * the web app, there's no server layer to proxy through here, and the client
 * confirmed a direct native call is expected (no CORS restriction on-device).
 */
export async function fetchSystemStatus(
  signal?: AbortSignal
): Promise<SystemStatusResponse> {
  let response: Response | undefined;
  let lastError: UpstreamError | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      response = await attemptFetch(signal);
      break;
    } catch (err) {
      lastError = err as UpstreamError;
      if (attempt < MAX_ATTEMPTS) await delay(RETRY_DELAY_MS);
    }
  }

  if (!response) {
    throw lastError ?? new UpstreamError("Network request failed");
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
