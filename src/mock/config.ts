/**
 * Mock server configuration for latency, errors, rate limiting, and network simulation.
 * @see Task 2.6 - MSW mock server system
 */

/** Latency simulation configuration */
export interface LatencyConfig {
  /** Minimum latency in milliseconds */
  readonly min: number;
  /** Maximum latency in milliseconds */
  readonly max: number;
  /** Whether latency simulation is enabled */
  readonly enabled: boolean;
}

/** Error simulation configuration per status code */
export interface ErrorProbabilityConfig {
  /** Probability of a 401 Unauthorized error (0-1) */
  readonly unauthorized: number;
  /** Probability of a 403 Forbidden error (0-1) */
  readonly forbidden: number;
  /** Probability of a 404 Not Found error (0-1) */
  readonly notFound: number;
  /** Probability of a 409 Conflict error (0-1) */
  readonly conflict: number;
  /** Probability of a 422 Validation error (0-1) */
  readonly validation: number;
  /** Probability of a 429 Rate Limited error (0-1) */
  readonly rateLimited: number;
  /** Probability of a 500 Internal Server Error (0-1) */
  readonly serverError: number;
  /** Whether error simulation is enabled */
  readonly enabled: boolean;
}

/** Network speed simulation configuration */
export interface NetworkSpeedConfig {
  /** Simulated download speed in bytes per second */
  readonly downloadBytesPerSecond: number;
  /** Simulated upload speed in bytes per second */
  readonly uploadBytesPerSecond: number;
  /** Whether network speed simulation is enabled */
  readonly enabled: boolean;
}

/** Rate limiting configuration */
export interface RateLimitConfig {
  /** Maximum requests per window */
  readonly maxRequests: number;
  /** Window duration in milliseconds */
  readonly windowMs: number;
  /** Whether rate limiting is enabled */
  readonly enabled: boolean;
}

/** Complete mock server configuration */
export interface MockServerConfig {
  readonly latency: LatencyConfig;
  readonly errors: ErrorProbabilityConfig;
  readonly networkSpeed: NetworkSpeedConfig;
  readonly rateLimit: RateLimitConfig;
}

/** Default mock server configuration */
export const defaultMockConfig: MockServerConfig = {
  latency: {
    min: 300,
    max: 1500,
    enabled: true,
  },
  errors: {
    unauthorized: 0.0,
    forbidden: 0.0,
    notFound: 0.0,
    conflict: 0.0,
    validation: 0.0,
    rateLimited: 0.0,
    serverError: 0.02,
    enabled: false,
  },
  networkSpeed: {
    downloadBytesPerSecond: 1_000_000, // 1 MB/s
    uploadBytesPerSecond: 500_000, // 500 KB/s
    enabled: false,
  },
  rateLimit: {
    maxRequests: 100,
    windowMs: 60_000, // 1 minute
    enabled: true,
  },
};

/** Mutable runtime config that can be updated */
let currentConfig: MockServerConfig = { ...defaultMockConfig };

/** Get current mock config */
export function getMockConfig(): MockServerConfig {
  return currentConfig;
}

/** Update mock config at runtime */
export function updateMockConfig(partial: Partial<MockServerConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...partial,
    latency: { ...currentConfig.latency, ...(partial.latency ?? {}) },
    errors: { ...currentConfig.errors, ...(partial.errors ?? {}) },
    networkSpeed: { ...currentConfig.networkSpeed, ...(partial.networkSpeed ?? {}) },
    rateLimit: { ...currentConfig.rateLimit, ...(partial.rateLimit ?? {}) },
  };
}

/** Reset config to defaults */
export function resetMockConfig(): void {
  currentConfig = { ...defaultMockConfig };
}

/** Generate a random latency value based on current config */
export function getRandomLatency(): number {
  const { min, max, enabled } = currentConfig.latency;
  if (!enabled) return 0;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Check if a simulated error should occur for a given type */
export function shouldSimulateError(
  type: keyof Omit<ErrorProbabilityConfig, 'enabled'>,
): boolean {
  if (!currentConfig.errors.enabled) return false;
  return Math.random() < currentConfig.errors[type];
}

/** Rate limit tracker */
interface RateLimitTracker {
  requests: number[];
}

const rateLimitTrackers: Map<string, RateLimitTracker> = new Map();

/** Check if a request should be rate limited */
export function checkRateLimit(clientId: string): {
  limited: boolean;
  retryAfterMs: number;
  remaining: number;
} {
  if (!currentConfig.rateLimit.enabled) {
    return { limited: false, retryAfterMs: 0, remaining: currentConfig.rateLimit.maxRequests };
  }

  const now = Date.now();
  let tracker = rateLimitTrackers.get(clientId);

  if (!tracker) {
    tracker = { requests: [] };
    rateLimitTrackers.set(clientId, tracker);
  }

  // Remove expired timestamps
  tracker.requests = tracker.requests.filter(
    (ts) => now - ts < currentConfig.rateLimit.windowMs,
  );

  const remaining = currentConfig.rateLimit.maxRequests - tracker.requests.length;

  if (remaining <= 0) {
    const oldestInWindow = tracker.requests[0] ?? now;
    const retryAfterMs = currentConfig.rateLimit.windowMs - (now - oldestInWindow);
    return { limited: true, retryAfterMs, remaining: 0 };
  }

  tracker.requests.push(now);
  return { limited: false, retryAfterMs: 0, remaining: remaining - 1 };
}

/** Reset rate limit trackers */
export function resetRateLimits(): void {
  rateLimitTrackers.clear();
}
