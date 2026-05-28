/**
 * Request Queue Manager with priority-based scheduling and concurrency control.
 * Limits concurrent requests per domain and enforces priority ordering.
 * @see Requirements 14.2 - API client infrastructure
 */

/** Priority levels for request scheduling (lower number = higher priority) */
export enum RequestPriority {
  Critical = 0,
  User = 1,
  Background = 2,
  Prefetch = 3,
}

/** Configuration for the request queue */
export interface RequestQueueConfig {
  /** Maximum concurrent requests per domain */
  readonly maxConcurrentPerDomain: number;
  /** Threshold for pending requests before shedding low-priority work */
  readonly shedThreshold: number;
}

/** Represents a queued request with its resolution handlers */
interface QueuedRequest<T = unknown> {
  readonly id: string;
  readonly domain: string;
  readonly priority: RequestPriority;
  readonly execute: () => Promise<T>;
  readonly resolve: (value: T) => void;
  readonly reject: (reason: unknown) => void;
  readonly abortController: AbortController;
  readonly enqueuedAt: number;
}

const DEFAULT_CONFIG: RequestQueueConfig = {
  maxConcurrentPerDomain: 6,
  shedThreshold: 50,
};

/**
 * Manages request scheduling with priority queuing and concurrency limits.
 * - Max 6 concurrent requests per domain
 * - 4 priority levels: critical > user > background > prefetch
 * - Load shedding when pending count exceeds threshold
 */
export class RequestQueueManager {
  private readonly config: RequestQueueConfig;
  private readonly queues: Map<string, QueuedRequest[]> = new Map();
  private readonly activeCount: Map<string, number> = new Map();
  private idCounter = 0;

  constructor(config: Partial<RequestQueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Enqueue a request for execution respecting concurrency and priority rules.
   * Returns a promise that resolves when the request completes.
   */
  enqueue<T>(
    domain: string,
    priority: RequestPriority,
    execute: () => Promise<T>,
    abortController?: AbortController,
  ): Promise<T> {
    const controller = abortController ?? new AbortController();

    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: `req_${++this.idCounter}`,
        domain,
        priority,
        execute,
        resolve: resolve as (value: unknown) => void,
        reject,
        abortController: controller,
        enqueuedAt: Date.now(),
      } as unknown as QueuedRequest<T>;

      // Check if already aborted
      if (controller.signal.aborted) {
        reject(new DOMException('Request aborted', 'AbortError'));
        return;
      }

      // Listen for abort
      controller.signal.addEventListener('abort', () => {
        this.removeFromQueue(domain, (request as unknown as QueuedRequest).id);
        reject(new DOMException('Request aborted', 'AbortError'));
      });

      const queue = this.getOrCreateQueue(domain);
      queue.push(request as unknown as QueuedRequest);

      // Sort queue by priority, then by enqueue time (FIFO within same priority)
      queue.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.enqueuedAt - b.enqueuedAt;
      });

      // Load shedding: cancel prefetch and background requests when overloaded
      this.performLoadShedding();

      // Try to process the queue
      this.processQueue(domain);
    });
  }

  /** Get total pending (queued but not yet executing) request count across all domains */
  getPendingCount(): number {
    let count = 0;
    for (const queue of this.queues.values()) {
      count += queue.length;
    }
    return count;
  }

  /** Get active (currently executing) request count for a domain */
  getActiveCount(domain: string): number {
    return this.activeCount.get(domain) ?? 0;
  }

  /** Cancel all requests with the given priority across all domains */
  cancelByPriority(priority: RequestPriority): void {
    for (const [domain, queue] of this.queues.entries()) {
      const toCancel = queue.filter((r) => r.priority === priority);
      for (const request of toCancel) {
        request.abortController.abort();
        request.reject(new DOMException('Request cancelled due to load shedding', 'AbortError'));
      }
      this.queues.set(
        domain,
        queue.filter((r) => r.priority !== priority),
      );
    }
  }

  /** Clear all queues and cancel pending requests */
  clear(): void {
    for (const [, queue] of this.queues.entries()) {
      for (const request of queue) {
        request.abortController.abort();
        request.reject(new DOMException('Queue cleared', 'AbortError'));
      }
    }
    this.queues.clear();
    this.activeCount.clear();
  }

  private getOrCreateQueue(domain: string): QueuedRequest[] {
    let queue = this.queues.get(domain);
    if (!queue) {
      queue = [];
      this.queues.set(domain, queue);
    }
    return queue;
  }

  private removeFromQueue(domain: string, requestId: string): void {
    const queue = this.queues.get(domain);
    if (!queue) return;
    const index = queue.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      queue.splice(index, 1);
    }
  }

  private performLoadShedding(): void {
    const totalPending = this.getPendingCount();
    if (totalPending > this.config.shedThreshold) {
      // Cancel prefetch first, then background if still over threshold
      this.cancelByPriority(RequestPriority.Prefetch);
      if (this.getPendingCount() > this.config.shedThreshold) {
        this.cancelByPriority(RequestPriority.Background);
      }
    }
  }

  private processQueue(domain: string): void {
    const queue = this.queues.get(domain);
    if (!queue || queue.length === 0) return;

    const active = this.activeCount.get(domain) ?? 0;
    if (active >= this.config.maxConcurrentPerDomain) return;

    const slotsAvailable = this.config.maxConcurrentPerDomain - active;
    const toProcess = queue.splice(0, slotsAvailable);

    this.activeCount.set(domain, active + toProcess.length);

    for (const request of toProcess) {
      if (request.abortController.signal.aborted) {
        this.decrementActive(domain);
        continue;
      }

      request
        .execute()
        .then((result) => {
          request.resolve(result);
        })
        .catch((error: unknown) => {
          request.reject(error);
        })
        .finally(() => {
          this.decrementActive(domain);
          this.processQueue(domain);
        });
    }
  }

  private decrementActive(domain: string): void {
    const current = this.activeCount.get(domain) ?? 0;
    this.activeCount.set(domain, Math.max(0, current - 1));
  }
}

/** Singleton instance of the request queue manager */
export const requestQueue = new RequestQueueManager();
