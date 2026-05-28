/**
 * Request Deduplication with sliding window.
 * Prevents duplicate GET requests within a configurable time window.
 * @see Requirements 14.2 - API client infrastructure
 */

/** Configuration for request deduplication */
export interface DeduplicationConfig {
  /** Sliding window duration in milliseconds */
  readonly windowMs: number;
}

/** Cached entry for a deduplicated request */
interface CacheEntry<T = unknown> {
  readonly promise: Promise<T>;
  readonly expiresAt: number;
  readonly timer: ReturnType<typeof setTimeout>;
}

const DEFAULT_CONFIG: DeduplicationConfig = {
  windowMs: 2_000, // 2 seconds
};

/**
 * Generates a deduplication key from URL and params.
 * Ensures consistent key generation regardless of param ordering.
 */
export function generateDeduplicationKey(
  url: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  const baseKey = url;

  if (!params) return baseKey;

  // Sort params for consistent key generation
  const sortedParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('&');

  return sortedParams ? `${baseKey}?${sortedParams}` : baseKey;
}

/**
 * Request deduplication manager.
 * Caches promises for identical GET requests within a 2-second sliding window.
 * If a duplicate request arrives while a previous identical request is in-flight
 * or within the window, the cached promise is returned instead of making a new request.
 */
export class RequestDeduplicator {
  private readonly config: DeduplicationConfig;
  private readonly cache: Map<string, CacheEntry> = new Map();

  constructor(config: Partial<DeduplicationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute a request with deduplication.
   * If an identical request is already cached within the window, returns the cached promise.
   * Otherwise, executes the request and caches the result.
   */
  deduplicate<T>(key: string, execute: () => Promise<T>): Promise<T> {
    const existing = this.cache.get(key);

    if (existing && Date.now() < existing.expiresAt) {
      return existing.promise as Promise<T>;
    }

    // Clear any stale entry
    if (existing) {
      clearTimeout(existing.timer);
      this.cache.delete(key);
    }

    const promise = execute().finally(() => {
      // The entry stays in cache until the window expires (for subsequent dedup)
      // It's already scheduled for cleanup via the timer below
    });

    const expiresAt = Date.now() + this.config.windowMs;
    const timer = setTimeout(() => {
      this.cache.delete(key);
    }, this.config.windowMs);

    const entry: CacheEntry<T> = { promise, expiresAt, timer };
    this.cache.set(key, entry as CacheEntry);

    return promise;
  }

  /** Check if a request with the given key is currently cached */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() >= entry.expiresAt) {
      clearTimeout(entry.timer);
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /** Invalidate a specific cached request */
  invalidate(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      clearTimeout(entry.timer);
      this.cache.delete(key);
    }
  }

  /** Clear all cached entries */
  clear(): void {
    for (const [, entry] of this.cache.entries()) {
      clearTimeout(entry.timer);
    }
    this.cache.clear();
  }

  /** Get the number of currently cached entries */
  get size(): number {
    return this.cache.size;
  }
}

/** Singleton deduplicator instance */
export const requestDeduplicator = new RequestDeduplicator();
