import { parseSystemStatusResponse, type SystemStatusResponse } from "../types/systemStatus";

export const SYSTEM_STATUS_API_URL =
  "https://cav-backend-staging.onrender.com/api/v1/config/system-status";

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
 */
export async function fetchSystemStatus(
  signal?: AbortSignal
): Promise<SystemStatusResponse> {
  let response: Response;
  try {
    response = await fetch(SYSTEM_STATUS_API_URL, { signal });
  } catch (err) {
    throw new UpstreamError(
      err instanceof Error ? err.message : "Network request failed"
    );
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
