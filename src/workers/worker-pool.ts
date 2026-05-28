/**
 * Worker Pool Manager with task execution interface.
 * Manages a pool of Web Workers for CPU-intensive tasks.
 * Falls back to main-thread execution when Web Workers are not supported.
 * @see Requirements 12.2 - Performance optimization
 */

import type {
  WorkerTaskType,
  WorkerRequest,
  WorkerResponse,
  CsvParsePayload,
  DataTransformPayload,
  FilterPayload,
} from './computation.worker';

/** Task payload type mapping */
interface TaskPayloadMap {
  'csv-parse': CsvParsePayload;
  'data-transform': DataTransformPayload;
  'filter-large-list': FilterPayload;
}

/** Worker pool configuration */
interface WorkerPoolConfig {
  /** Maximum number of workers in the pool */
  readonly maxWorkers: number;
  /** Task timeout in milliseconds */
  readonly taskTimeout: number;
}

/** Task execution result */
interface TaskResult<T = unknown> {
  readonly result: T;
  readonly duration: number;
  readonly executedIn: 'worker' | 'main-thread';
}

/** Internal pending task tracking */
interface PendingTask {
  readonly resolve: (value: TaskResult) => void;
  readonly reject: (reason: Error) => void;
  readonly timeoutId: ReturnType<typeof setTimeout>;
  readonly type: WorkerTaskType;
}

/** Pool statistics */
interface PoolStats {
  readonly totalWorkers: number;
  readonly idleWorkers: number;
  readonly pendingTasks: number;
  readonly completedTasks: number;
  readonly failedTasks: number;
  readonly fallbackMode: boolean;
}

const DEFAULT_CONFIG: WorkerPoolConfig = {
  maxWorkers: Math.min(navigator.hardwareConcurrency ?? 4, 4),
  taskTimeout: 30_000,
};

/**
 * Worker pool manager providing task execution across multiple Web Workers.
 * Automatically falls back to synchronous main-thread execution if
 * Web Workers are not available in the environment.
 */
class WorkerPool {
  private workers: Worker[] = [];
  private idleWorkers: Worker[] = [];
  private pendingTasks: Map<string, PendingTask> = new Map();
  private taskQueue: Array<{ request: WorkerRequest; task: PendingTask }> = [];
  private config: WorkerPoolConfig;
  private isSupported: boolean;
  private completedCount = 0;
  private failedCount = 0;
  private taskIdCounter = 0;
  private initialized = false;

  constructor(config: Partial<WorkerPoolConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isSupported = typeof Worker !== 'undefined';
  }

  /** Initialize the worker pool */
  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    if (!this.isSupported) {
      console.warn('[WorkerPool] Web Workers not supported, using main-thread fallback');
      return;
    }

    for (let i = 0; i < this.config.maxWorkers; i++) {
      try {
        const worker = new Worker(
          new URL('./computation.worker.ts', import.meta.url),
          { type: 'module' },
        );
        worker.onmessage = this.handleWorkerMessage.bind(this, worker);
        worker.onerror = this.handleWorkerError.bind(this, worker);
        this.workers.push(worker);
        this.idleWorkers.push(worker);
      } catch (error) {
        console.error('[WorkerPool] Failed to create worker:', error);
        // If we can't create any workers, fall back to main thread
        if (this.workers.length === 0) {
          this.isSupported = false;
        }
        break;
      }
    }
  }

  /**
   * Execute a task in the worker pool.
   * @param type - The task type to execute
   * @param payload - Task-specific payload
   * @returns Promise resolving with the task result
   */
  async execute<T extends WorkerTaskType>(
    type: T,
    payload: TaskPayloadMap[T],
  ): Promise<TaskResult> {
    if (!this.initialized) {
      this.initialize();
    }

    // Fallback to main thread if workers not supported
    if (!this.isSupported) {
      return this.executeOnMainThread(type, payload);
    }

    const id = this.generateTaskId();
    const request: WorkerRequest = { id, type, payload };

    return new Promise<TaskResult>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const pending = this.pendingTasks.get(id);
        if (pending) {
          this.pendingTasks.delete(id);
          this.failedCount++;
          reject(new Error(`Task ${type} timed out after ${this.config.taskTimeout}ms`));
        }
      }, this.config.taskTimeout);

      const task: PendingTask = { resolve, reject, timeoutId, type };

      // If there's an idle worker, dispatch immediately
      const worker = this.idleWorkers.pop();
      if (worker) {
        this.pendingTasks.set(id, task);
        worker.postMessage(request);
      } else {
        // Queue the task
        this.taskQueue.push({ request, task });
      }
    });
  }

  /** Get pool statistics */
  getStats(): PoolStats {
    return {
      totalWorkers: this.workers.length,
      idleWorkers: this.idleWorkers.length,
      pendingTasks: this.pendingTasks.size + this.taskQueue.length,
      completedTasks: this.completedCount,
      failedTasks: this.failedCount,
      fallbackMode: !this.isSupported,
    };
  }

  /** Terminate all workers and clean up */
  destroy(): void {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    this.idleWorkers = [];

    // Reject all pending tasks
    for (const [id, task] of this.pendingTasks) {
      clearTimeout(task.timeoutId);
      task.reject(new Error('Worker pool destroyed'));
      this.pendingTasks.delete(id);
    }

    // Reject queued tasks
    for (const { task } of this.taskQueue) {
      clearTimeout(task.timeoutId);
      task.reject(new Error('Worker pool destroyed'));
    }
    this.taskQueue = [];
    this.initialized = false;
  }

  // === Private Methods ===

  private handleWorkerMessage(worker: Worker, event: MessageEvent<WorkerResponse>): void {
    const { id, status, result, error, duration } = event.data;
    const pending = this.pendingTasks.get(id);

    if (pending) {
      clearTimeout(pending.timeoutId);
      this.pendingTasks.delete(id);

      if (status === 'success') {
        this.completedCount++;
        pending.resolve({ result, duration, executedIn: 'worker' });
      } else {
        this.failedCount++;
        pending.reject(new Error(error ?? 'Worker task failed'));
      }
    }

    // Process next queued task or return worker to idle pool
    const next = this.taskQueue.shift();
    if (next) {
      this.pendingTasks.set(next.request.id, next.task);
      worker.postMessage(next.request);
    } else {
      this.idleWorkers.push(worker);
    }
  }

  private handleWorkerError(worker: Worker, event: ErrorEvent): void {
    console.error('[WorkerPool] Worker error:', event.message);

    // Find and reject any pending task for this worker
    // Since we can't map worker to specific task, reject the oldest pending
    const firstPending = this.pendingTasks.entries().next();
    if (!firstPending.done) {
      const [id, task] = firstPending.value;
      clearTimeout(task.timeoutId);
      this.pendingTasks.delete(id);
      this.failedCount++;
      task.reject(new Error(`Worker error: ${event.message}`));
    }

    // Try to replace the failed worker
    const index = this.workers.indexOf(worker);
    if (index !== -1) {
      worker.terminate();
      try {
        const newWorker = new Worker(
          new URL('./computation.worker.ts', import.meta.url),
          { type: 'module' },
        );
        newWorker.onmessage = this.handleWorkerMessage.bind(this, newWorker);
        newWorker.onerror = this.handleWorkerError.bind(this, newWorker);
        this.workers[index] = newWorker;

        // Process next queued task or add to idle
        const next = this.taskQueue.shift();
        if (next) {
          this.pendingTasks.set(next.request.id, next.task);
          newWorker.postMessage(next.request);
        } else {
          this.idleWorkers.push(newWorker);
        }
      } catch {
        this.workers.splice(index, 1);
        if (this.workers.length === 0) {
          this.isSupported = false;
        }
      }
    }
  }

  /**
   * Main-thread fallback execution.
   * Dynamically imports the worker module logic to run synchronously.
   */
  private async executeOnMainThread(
    type: WorkerTaskType,
    payload: unknown,
  ): Promise<TaskResult> {
    const startTime = performance.now();

    try {
      // Dynamically import and execute the computation logic
      // Import not needed - fallback logic is duplicated inline
      const result = await this.runFallbackTask(type, payload);
      const duration = performance.now() - startTime;
      this.completedCount++;
      return { result, duration, executedIn: 'main-thread' };
    } catch (error) {
      this.failedCount++;
      throw error instanceof Error ? error : new Error('Main-thread execution failed');
    }
  }

  private async runFallbackTask(type: WorkerTaskType, payload: unknown): Promise<unknown> {
    // Inline fallback implementations matching worker logic
    switch (type) {
      case 'csv-parse':
        return this.fallbackCsvParse(payload as CsvParsePayload);
      case 'data-transform':
        return this.fallbackDataTransform(payload as DataTransformPayload);
      case 'filter-large-list':
        return this.fallbackFilterList(payload as FilterPayload);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  private fallbackCsvParse(payload: CsvParsePayload): Record<string, string>[] | string[][] {
    const { content, delimiter = ',', hasHeaders = true, trimFields = true } = payload;
    if (!content || content.trim().length === 0) return [];

    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    const parseRow = (line: string): string[] => {
      const fields: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (inQuotes) {
          if (char === '"' && line[i + 1] === '"') {
            current += '"';
            i++;
          } else if (char === '"') {
            inQuotes = false;
          } else {
            current += char;
          }
        } else if (char === '"') {
          inQuotes = true;
        } else if (char === delimiter) {
          fields.push(trimFields ? current.trim() : current);
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(trimFields ? current.trim() : current);
      return fields;
    };

    const rows = lines.map(parseRow);
    if (!hasHeaders) return rows;

    const headers = rows[0] ?? [];
    return rows.slice(1).map((row) => {
      const record: Record<string, string> = {};
      headers.forEach((header, i) => {
        record[header] = row[i] ?? '';
      });
      return record;
    });
  }

  private fallbackDataTransform(payload: DataTransformPayload): Record<string, unknown>[] {
    const { data, operations } = payload;
    let result = [...data] as Record<string, unknown>[];

    for (const op of operations) {
      switch (op.type) {
        case 'pick':
          if (op.fields) {
            const fields = op.fields;
            result = result.map((row) => {
              const picked: Record<string, unknown> = {};
              for (const f of fields) {
                if (f in row) picked[f] = row[f];
              }
              return picked;
            });
          }
          break;
        case 'omit':
          if (op.fields) {
            const omitSet = new Set(op.fields);
            result = result.map((row) => {
              const out: Record<string, unknown> = {};
              for (const [k, v] of Object.entries(row)) {
                if (!omitSet.has(k)) out[k] = v;
              }
              return out;
            });
          }
          break;
        case 'rename':
          if (op.field && op.newField) {
            const f = op.field;
            const nf = op.newField;
            result = result.map((row) => {
              const { [f]: val, ...rest } = row;
              return { ...rest, [nf]: val };
            });
          }
          break;
        default:
          break;
      }
    }
    return result;
  }

  private fallbackFilterList(payload: FilterPayload): Record<string, unknown>[] {
    const { data, filters, logic = 'and' } = payload;
    if (filters.length === 0) return [...data] as Record<string, unknown>[];

    return (data as Record<string, unknown>[]).filter((row) => {
      const results = filters.map((filter) => {
        const val = row[filter.field];
        switch (filter.operator) {
          case 'eq': return val === filter.value;
          case 'neq': return val !== filter.value;
          case 'gt': return Number(val) > Number(filter.value);
          case 'gte': return Number(val) >= Number(filter.value);
          case 'lt': return Number(val) < Number(filter.value);
          case 'lte': return Number(val) <= Number(filter.value);
          case 'contains': return String(val ?? '').toLowerCase().includes(String(filter.value).toLowerCase());
          case 'startsWith': return String(val ?? '').toLowerCase().startsWith(String(filter.value).toLowerCase());
          case 'endsWith': return String(val ?? '').toLowerCase().endsWith(String(filter.value).toLowerCase());
          case 'in': return Array.isArray(filter.value) && filter.value.includes(val);
          case 'regex': {
            try { return new RegExp(String(filter.value), 'i').test(String(val ?? '')); }
            catch { return false; }
          }
          default: return false;
        }
      });
      return logic === 'and' ? results.every(Boolean) : results.some(Boolean);
    });
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${++this.taskIdCounter}`;
  }
}

/** Singleton worker pool instance */
export const workerPool = new WorkerPool();

export { WorkerPool };
export type { WorkerPoolConfig, TaskResult, PoolStats, TaskPayloadMap };
