/**
 * Circuit Breaker implementation for API resilience.
 * Prevents cascading failures by stopping requests to failing endpoints.
 * @see Requirements 14.2 - API client infrastructure
 */

/** Circuit breaker states */
export enum CircuitState {
  Closed = 'closed',
  Open = 'open',
  HalfOpen = 'half-open',
}

/** Configuration for a circuit breaker instance */
export interface CircuitBreakerConfig {
  /** Number of consecutive failures before opening the circuit */
  readonly failureThreshold: number;
  /** Time window in ms within which failures are counted */
  readonly failureWindow: number;
  /** Cooldown period in ms before transitioning from open to half-open */
  readonly cooldownPeriod: number;
}

/** Internal state tracking for a single endpoint circuit */
interface CircuitEntry {
  state: CircuitState;
  failures: number[];
  lastFailureTime: number;
  openedAt: number | null;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  failureWindow: 30_000, // 30 seconds
  cooldownPeriod: 60_000, // 60 seconds
};

/** Error thrown when a circuit is open and requests are rejected */
export class CircuitOpenError extends Error {
  readonly endpoint: string;
  readonly retryAfter: number;

  constructor(endpoint: string, retryAfter: number) {
    super(`Circuit breaker is open for endpoint: ${endpoint}. Retry after ${retryAfter}ms`);
    this.name = 'CircuitOpenError';
    this.endpoint = endpoint;
    this.retryAfter = retryAfter;
  }
}

/**
 * Circuit Breaker that tracks failures per endpoint and prevents
 * requests to failing services.
 *
 * States:
 * - Closed: Normal operation, requests pass through
 * - Open: Requests are rejected immediately (after 5 consecutive failures in 30s)
 * - Half-Open: Single test request allowed; success closes, failure re-opens
 */
export class CircuitBreaker {
  private readonly config: CircuitBreakerConfig;
  private readonly circuits: Map<string, CircuitEntry> = new Map();

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if a request to the given endpoint is allowed.
   * Throws CircuitOpenError if the circuit is open.
   * Returns true if the request can proceed (closed or half-open test request).
   */
  canExecute(endpoint: string): boolean {
    const circuit = this.getOrCreateCircuit(endpoint);
    const now = Date.now();

    switch (circuit.state) {
      case CircuitState.Closed:
        return true;

      case CircuitState.Open: {
        const elapsed = now - (circuit.openedAt ?? now);
        if (elapsed >= this.config.cooldownPeriod) {
          // Transition to half-open
          circuit.state = CircuitState.HalfOpen;
          return true;
        }
        const retryAfter = this.config.cooldownPeriod - elapsed;
        throw new CircuitOpenError(endpoint, retryAfter);
      }

      case CircuitState.HalfOpen:
        // Only allow one test request in half-open state
        // If we're already in half-open, allow the request
        return true;
    }
  }

  /**
   * Record a successful request to the endpoint.
   * Resets the failure count and closes the circuit if half-open.
   */
  recordSuccess(endpoint: string): void {
    const circuit = this.getOrCreateCircuit(endpoint);
    circuit.failures = [];
    circuit.lastFailureTime = 0;

    if (circuit.state === CircuitState.HalfOpen) {
      circuit.state = CircuitState.Closed;
      circuit.openedAt = null;
    }
  }

  /**
   * Record a failed request to the endpoint.
   * Opens the circuit if the failure threshold is exceeded within the failure window.
   */
  recordFailure(endpoint: string): void {
    const circuit = this.getOrCreateCircuit(endpoint);
    const now = Date.now();

    // If half-open and failure occurs, re-open immediately
    if (circuit.state === CircuitState.HalfOpen) {
      circuit.state = CircuitState.Open;
      circuit.openedAt = now;
      circuit.failures = [now];
      return;
    }

    // Add failure timestamp and prune old failures outside the window
    circuit.failures.push(now);
    circuit.lastFailureTime = now;
    circuit.failures = circuit.failures.filter(
      (timestamp) => now - timestamp <= this.config.failureWindow,
    );

    // Check if threshold exceeded
    if (circuit.failures.length >= this.config.failureThreshold) {
      circuit.state = CircuitState.Open;
      circuit.openedAt = now;
    }
  }

  /** Get the current state of the circuit for an endpoint */
  getState(endpoint: string): CircuitState {
    const circuit = this.circuits.get(endpoint);
    if (!circuit) return CircuitState.Closed;

    // Check if open circuit has cooled down
    if (circuit.state === CircuitState.Open && circuit.openedAt !== null) {
      const elapsed = Date.now() - circuit.openedAt;
      if (elapsed >= this.config.cooldownPeriod) {
        circuit.state = CircuitState.HalfOpen;
      }
    }

    return circuit.state;
  }

  /** Reset the circuit for an endpoint back to closed state */
  reset(endpoint: string): void {
    this.circuits.delete(endpoint);
  }

  /** Reset all circuits */
  resetAll(): void {
    this.circuits.clear();
  }

  private getOrCreateCircuit(endpoint: string): CircuitEntry {
    let circuit = this.circuits.get(endpoint);
    if (!circuit) {
      circuit = {
        state: CircuitState.Closed,
        failures: [],
        lastFailureTime: 0,
        openedAt: null,
      };
      this.circuits.set(endpoint, circuit);
    }
    return circuit;
  }
}

/** Singleton circuit breaker instance */
export const circuitBreaker = new CircuitBreaker();
