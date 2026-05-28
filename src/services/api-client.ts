/**
 * Main API Client with Axios, integrating request queue, circuit breaker,
 * deduplication, and retry logic with exponential backoff.
 * @see Requirements 14.2 - API client infrastructure
 */

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAppStore } from '../store';
import { requestQueue, RequestPriority } from './request-queue';
import { circuitBreaker } from './circuit-breaker';
import {
  requestDeduplicator,
  generateDeduplicationKey,
} from './request-deduplication';

// Re-export for convenience
export { RequestPriority } from './request-queue';
export { CircuitOpenError, CircuitState } from './circuit-breaker';

/** API client configuration */
export interface ApiClientConfig {
  readonly baseURL: string;
  readonly timeout: number;
  readonly maxRetries: number;
  readonly retryBaseDelay: number;
}

/** Extended request config with priority and deduplication options */
export interface ApiRequestConfig extends AxiosRequestConfig {
  /** Request priority for queue scheduling */
  priority?: RequestPriority;
  /** Whether to skip deduplication for this request */
  skipDeduplication?: boolean;
  /** Whether to skip the circuit breaker check */
  skipCircuitBreaker?: boolean;
  /** Custom retry count override */
  maxRetries?: number;
  /** Metadata for internal tracking */
  _retryCount?: number;
  _priority?: RequestPriority;
}

/** Error response shape from the API */
export interface ApiErrorResponse {
  readonly message: string;
  readonly code?: string;
  readonly details?: Record<string, string[]>;
}

/** Custom API error with structured information */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly details: Record<string, string[]> | undefined;
  readonly isRetryable: boolean;
  readonly retryAfter: number | null;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: Record<string, string[]>,
    retryAfter?: number | null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.isRetryable = isRetryableStatus(status);
    this.retryAfter = retryAfter ?? null;
  }
}

/** Session expired event for cross-module communication */
export type SessionExpiredListener = () => void;
/** Permission denied event */
export type PermissionDeniedListener = (resource: string) => void;

const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 30_000,
  maxRetries: 3,
  retryBaseDelay: 1_000,
};

/** Check if an HTTP status code is retryable */
function isRetryableStatus(status: number): boolean {
  // Retry 5xx, 408 (Request Timeout), 429 (Too Many Requests)
  if (status >= 500) return true;
  if (status === 408 || status === 429) return true;
  return false;
}

/** Extract domain from a URL string */
function extractDomain(url: string): string {
  try {
    // Handle relative URLs
    if (url.startsWith('/')) return 'self';
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return 'self';
  }
}

/** Calculate exponential backoff delay: 1s, 2s, 4s */
function calculateRetryDelay(attempt: number, baseDelay: number): number {
  return Math.pow(2, attempt) * baseDelay;
}

/** Parse Retry-After header value (seconds or HTTP date) */
function parseRetryAfter(value: string | undefined): number | null {
  if (!value) return null;

  // Try as number of seconds
  const seconds = parseInt(value, 10);
  if (!isNaN(seconds)) return seconds * 1000;

  // Try as HTTP date
  const date = new Date(value).getTime();
  if (!isNaN(date)) {
    const delay = date - Date.now();
    return delay > 0 ? delay : null;
  }

  return null;
}

/**
 * Creates and configures the main API client.
 * Integrates:
 * - Auto-injection of X-Tenant-ID header from store
 * - Request queue with priority scheduling
 * - Circuit breaker for failing endpoints
 * - Request deduplication for identical GET requests
 * - Retry logic with exponential backoff (1s, 2s, 4s)
 */
export function createApiClient(config: Partial<ApiClientConfig> = {}): AxiosInstance {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const instance = axios.create({
    baseURL: mergedConfig.baseURL,
    timeout: mergedConfig.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // === Request Interceptor ===
  instance.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      // Inject X-Tenant-ID from store
      const tenantId = useAppStore.getState().tenant.current?.id;
      if (tenantId) {
        requestConfig.headers.set('X-Tenant-ID', tenantId);
      }

      // Inject Authorization token
      const token = useAppStore.getState().auth.token;
      if (token) {
        requestConfig.headers.set('Authorization', `Bearer ${token}`);
      }

      return requestConfig;
    },
    (error: unknown) => Promise.reject(error),
  );

  // === Response Interceptor ===
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error);
      }

      const axiosError = error as AxiosError<ApiErrorResponse>;
      const status = axiosError.response?.status;
      const responseData = axiosError.response?.data;

      // Handle 401 - Session Expired
      if (status === 401) {
        notifySessionExpired();
        return Promise.reject(
          new ApiError(
            responseData?.message ?? 'Session expired',
            401,
            responseData?.code,
            responseData?.details,
          ),
        );
      }

      // Handle 403 - Permission Denied
      if (status === 403) {
        const resource = axiosError.config?.url ?? 'unknown';
        notifyPermissionDenied(resource);
        return Promise.reject(
          new ApiError(
            responseData?.message ?? 'Permission denied',
            403,
            responseData?.code,
            responseData?.details,
          ),
        );
      }

      // Handle 429 - Rate Limited
      if (status === 429) {
        const retryAfterHeader = axiosError.response?.headers?.['retry-after'] as
          | string
          | undefined;
        const retryAfter = parseRetryAfter(retryAfterHeader);
        return Promise.reject(
          new ApiError(
            responseData?.message ?? 'Rate limit exceeded',
            429,
            responseData?.code,
            responseData?.details,
            retryAfter,
          ),
        );
      }

      // Generic error
      if (status) {
        return Promise.reject(
          new ApiError(
            responseData?.message ?? axiosError.message,
            status,
            responseData?.code,
            responseData?.details,
          ),
        );
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

// === Event Listeners ===
const sessionExpiredListeners: Set<SessionExpiredListener> = new Set();
const permissionDeniedListeners: Set<PermissionDeniedListener> = new Set();

function notifySessionExpired(): void {
  for (const listener of sessionExpiredListeners) {
    listener();
  }
}

function notifyPermissionDenied(resource: string): void {
  for (const listener of permissionDeniedListeners) {
    listener(resource);
  }
}

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

export function onPermissionDenied(listener: PermissionDeniedListener): () => void {
  permissionDeniedListeners.add(listener);
  return () => {
    permissionDeniedListeners.delete(listener);
  };
}

// === Main API Client Instance ===
const axiosInstance = createApiClient();

/**
 * Execute an API request with full middleware pipeline:
 * 1. Circuit breaker check
 * 2. Request deduplication (GET only)
 * 3. Request queue with priority
 * 4. Retry with exponential backoff
 */
export async function apiRequest<T>(config: ApiRequestConfig): Promise<T> {
  const priority = config.priority ?? config._priority ?? RequestPriority.User;
  const maxRetries = config.maxRetries ?? DEFAULT_CONFIG.maxRetries;
  const url = config.url ?? '';
  const method = (config.method ?? 'GET').toUpperCase();
  const domain = extractDomain(
    url.startsWith('http') ? url : `${DEFAULT_CONFIG.baseURL}${url}`,
  );

  // Circuit breaker check
  if (!config.skipCircuitBreaker) {
    const endpoint = `${method}:${url}`;
    circuitBreaker.canExecute(endpoint); // throws CircuitOpenError if open
  }

  // Deduplication for GET requests
  const isGet = method === 'GET';
  if (isGet && !config.skipDeduplication) {
    const dedupeKey = generateDeduplicationKey(
      url,
      config.params as Record<string, string | number | boolean | undefined | null> | undefined,
    );
    return requestDeduplicator.deduplicate(dedupeKey, () =>
      executeWithRetry<T>(config, domain, priority, maxRetries),
    );
  }

  return executeWithRetry<T>(config, domain, priority, maxRetries);
}

/** Execute request through the queue with retry logic */
async function executeWithRetry<T>(
  config: ApiRequestConfig,
  domain: string,
  priority: RequestPriority,
  maxRetries: number,
): Promise<T> {
  return requestQueue.enqueue(domain, priority, async () => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await axiosInstance.request<T>(config);

        // Record success with circuit breaker
        const endpoint = `${(config.method ?? 'GET').toUpperCase()}:${config.url ?? ''}`;
        circuitBreaker.recordSuccess(endpoint);

        return response.data;
      } catch (error: unknown) {
        lastError = error;
        const endpoint = `${(config.method ?? 'GET').toUpperCase()}:${config.url ?? ''}`;

        // Record failure with circuit breaker
        if (error instanceof ApiError && error.status >= 500) {
          circuitBreaker.recordFailure(endpoint);
        } else if (error instanceof ApiError && (error.status === 408 || error.status === 429)) {
          circuitBreaker.recordFailure(endpoint);
        }

        // Don't retry non-retryable errors
        if (error instanceof ApiError && !error.isRetryable) {
          throw error;
        }

        // Don't retry if we've exhausted attempts
        if (attempt >= maxRetries) {
          throw error;
        }

        // Don't retry aborted requests
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw error;
        }

        // Calculate delay
        let delay: number;
        if (error instanceof ApiError && error.retryAfter !== null) {
          delay = error.retryAfter;
        } else {
          delay = calculateRetryDelay(attempt, DEFAULT_CONFIG.retryBaseDelay);
        }

        await sleep(delay);
      }
    }

    throw lastError;
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// === Convenience Methods ===

/** GET request */
export function get<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  return apiRequest<T>({ ...config, url, method: 'GET' });
}

/** POST request */
export function post<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
  return apiRequest<T>({ ...config, url, method: 'POST', data });
}

/** PUT request */
export function put<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
  return apiRequest<T>({ ...config, url, method: 'PUT', data });
}

/** PATCH request */
export function patch<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
  return apiRequest<T>({ ...config, url, method: 'PATCH', data });
}

/** DELETE request */
export function del<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  return apiRequest<T>({ ...config, url, method: 'DELETE' });
}

/** Export the underlying axios instance for advanced usage */
export { axiosInstance };
