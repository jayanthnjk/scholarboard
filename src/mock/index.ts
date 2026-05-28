/**
 * Mock server public API.
 * @see Task 2.6 - MSW mock server system
 */

export {
  startMockServer,
  stopMockServer,
  resetMockData,
  resetMockServerConfig,
  configureMockServer,
  worker,
  handlers,
  type MockServerOptions,
} from './server';

export {
  getMockConfig,
  updateMockConfig,
  resetMockConfig,
  type MockServerConfig,
  type LatencyConfig,
  type ErrorProbabilityConfig,
  type NetworkSpeedConfig,
  type RateLimitConfig,
} from './config';
