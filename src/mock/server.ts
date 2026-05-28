/**
 * Main MSW server setup for browser-based mocking.
 * Configures all handlers with latency, error simulation, and in-memory persistence.
 * @see Task 2.6 - MSW mock server system
 */

import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth';
import { studentHandlers } from './handlers/students';
import { feeHandlers } from './handlers/fees';
import { configHandlers } from './handlers/config';
import {
  updateMockConfig,
  resetMockConfig,
  resetRateLimits,
  type MockServerConfig,
} from './config';
import { resetStudentData } from './data/students';
import { resetFeeData } from './data/fees';

/** All request handlers combined */
const handlers = [
  ...authHandlers,
  ...studentHandlers,
  ...feeHandlers,
  ...configHandlers,
];

/** MSW browser worker instance */
const worker = setupWorker(...handlers);

/** Options for starting the mock server */
export interface MockServerOptions {
  /** Whether to log requests to console */
  quiet?: boolean;
  /** Custom config overrides */
  config?: Partial<MockServerConfig>;
  /** Service worker URL */
  serviceWorkerUrl?: string;
}

/**
 * Start the mock server.
 * Call this before your app renders to intercept API requests.
 */
export async function startMockServer(options: MockServerOptions = {}): Promise<void> {
  const { quiet = false, config, serviceWorkerUrl = '/mockServiceWorker.js' } = options;

  if (config) {
    updateMockConfig(config);
  }

  await worker.start({
    serviceWorker: {
      url: serviceWorkerUrl,
    },
    onUnhandledRequest: 'bypass',
    quiet,
  });

  if (!quiet) {
    console.log('[MSW] Mock server started');
    console.log('[MSW] Intercepting API requests at /api/*');
  }
}

/**
 * Stop the mock server.
 * Stops intercepting requests and unregisters the service worker.
 */
export function stopMockServer(): void {
  worker.stop();
  console.log('[MSW] Mock server stopped');
}

/**
 * Reset all in-memory data to initial state.
 * Useful for testing or when you want a fresh dataset.
 */
export function resetMockData(): void {
  resetStudentData();
  resetFeeData();
  resetRateLimits();
  console.log('[MSW] All mock data reset');
}

/**
 * Reset mock server configuration to defaults.
 */
export function resetMockServerConfig(): void {
  resetMockConfig();
  resetRateLimits();
  console.log('[MSW] Mock server config reset to defaults');
}

/**
 * Update mock server configuration at runtime.
 * Useful for toggling error simulation, latency, etc. during development.
 */
export function configureMockServer(config: Partial<MockServerConfig>): void {
  updateMockConfig(config);
  console.log('[MSW] Mock server config updated', config);
}

/** Export the worker for advanced usage */
export { worker };

/** Export handlers for testing or custom setups */
export { handlers };
