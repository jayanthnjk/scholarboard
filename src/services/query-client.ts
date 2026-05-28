import { QueryClient } from '@tanstack/react-query';

/**
 * Stale time configuration per resource type (stale-while-revalidate strategy).
 *
 * - Config data (tenant config, feature flags, navigation): 5 minutes
 *   Rarely changes during a session; safe to cache longer.
 *
 * - User/detail data (student profiles, fee details): 30 seconds
 *   May change due to concurrent edits; keep relatively fresh.
 *
 * - List data (student lists, payment lists): 1 minute
 *   Moderate refresh cadence balances freshness with request volume.
 */
export const STALE_TIMES = {
  config: 5 * 60 * 1000, // 5 minutes
  user: 30 * 1000, // 30 seconds
  list: 60 * 1000, // 1 minute
} as const;

/**
 * Calculates exponential backoff delay for retry attempts.
 * Follows the pattern: 2^(attempt-1) * 1000ms → 1s, 2s, 4s
 */
function getRetryDelay(attemptIndex: number): number {
  return Math.pow(2, attemptIndex) * 1000;
}

/**
 * Determines whether a failed query should be retried.
 * Does not retry on 4xx client errors (except 408 and 429).
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 3) return false;

  // Don't retry client errors (4xx) except timeout (408) and rate limit (429)
  if (error instanceof Error && 'status' in error) {
    const status = (error as Error & { status: number }).status;
    if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
      return false;
    }
  }

  return true;
}

/**
 * Creates a configured QueryClient with production-grade defaults:
 * - Stale-while-revalidate caching (default stale time: 1 minute for lists)
 * - Exponential backoff retry (max 3 retries: 1s, 2s, 4s)
 * - Request deduplication via structural sharing
 * - Background refetch on window focus
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIMES.list,
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
        retry: shouldRetry,
        retryDelay: getRetryDelay,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        structuralSharing: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Singleton query client instance for the application.
 * Use this in the QueryClientProvider at the app root.
 */
export const queryClient = createQueryClient();
