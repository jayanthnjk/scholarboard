/**
 * Web Worker for CPU-intensive computation tasks.
 * Handles CSV parsing, data transformation, and large list filtering.
 * Runs off the main thread to keep UI responsive.
 * @see Requirements 12.2 - Performance optimization
 */

/** Task types supported by this worker */
type WorkerTaskType = 'csv-parse' | 'data-transform' | 'filter-large-list';

/** Incoming message structure */
interface WorkerRequest {
  readonly id: string;
  readonly type: WorkerTaskType;
  readonly payload: unknown;
}

/** Outgoing message structure */
interface WorkerResponse {
  readonly id: string;
  readonly type: WorkerTaskType;
  readonly status: 'success' | 'error';
  readonly result?: unknown;
  readonly error?: string;
  readonly duration: number;
}

/** CSV parse options */
interface CsvParsePayload {
  readonly content: string;
  readonly delimiter?: string;
  readonly hasHeaders?: boolean;
  readonly trimFields?: boolean;
}

/** Data transform options */
interface DataTransformPayload {
  readonly data: readonly Record<string, unknown>[];
  readonly operations: readonly TransformOperation[];
}

interface TransformOperation {
  readonly type: 'rename' | 'map' | 'pick' | 'omit' | 'compute';
  readonly field?: string;
  readonly newField?: string;
  readonly fields?: readonly string[];
  readonly expression?: string;
}

/** Filter options */
interface FilterPayload {
  readonly data: readonly Record<string, unknown>[];
  readonly filters: readonly FilterCondition[];
  readonly logic?: 'and' | 'or';
}

interface FilterCondition {
  readonly field: string;
  readonly operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'regex';
  readonly value: unknown;
}

// === Task Handlers ===

/**
 * Parse CSV content into structured data.
 * Handles quoted fields, newlines within quotes, and various delimiters.
 */
function parseCsv(payload: CsvParsePayload): Record<string, string>[] | string[][] {
  const { content, delimiter = ',', hasHeaders = true, trimFields = true } = payload;

  if (!content || content.trim().length === 0) {
    return [];
  }

  const rows = parseCsvRows(content, delimiter);

  if (rows.length === 0) return [];

  const processField = (field: string): string =>
    trimFields ? field.trim() : field;

  if (hasHeaders) {
    const headers = rows[0]?.map(processField) ?? [];
    const dataRows: Record<string, string>[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every((cell) => cell.trim() === '')) continue;

      const record: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        if (header) {
          record[header] = processField(row[j] ?? '');
        }
      }
      dataRows.push(record);
    }
    return dataRows;
  }

  return rows.map((row) => row.map(processField));
}

/** Parse CSV content respecting quoted fields */
function parseCsvRows(content: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i++; // skip \n
      } else if (char === '\n') {
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }

  // Push the last field and row
  currentRow.push(currentField);
  if (currentRow.length > 0 && !currentRow.every((c) => c === '')) {
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Transform data records using a pipeline of operations.
 */
function transformData(payload: DataTransformPayload): Record<string, unknown>[] {
  const { data, operations } = payload;
  let result = [...data] as Record<string, unknown>[];

  for (const op of operations) {
    result = applyTransformOperation(result, op);
  }

  return result;
}

function applyTransformOperation(
  data: Record<string, unknown>[],
  op: TransformOperation,
): Record<string, unknown>[] {
  switch (op.type) {
    case 'rename': {
      if (!op.field || !op.newField) return data;
      return data.map((row) => {
        const { [op.field!]: value, ...rest } = row;
        return { ...rest, [op.newField!]: value };
      });
    }
    case 'pick': {
      if (!op.fields || op.fields.length === 0) return data;
      const fields = op.fields;
      return data.map((row) => {
        const picked: Record<string, unknown> = {};
        for (const f of fields) {
          if (f in row) {
            picked[f] = row[f];
          }
        }
        return picked;
      });
    }
    case 'omit': {
      if (!op.fields || op.fields.length === 0) return data;
      const omitFields = new Set(op.fields);
      return data.map((row) => {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(row)) {
          if (!omitFields.has(key)) {
            result[key] = value;
          }
        }
        return result;
      });
    }
    case 'map': {
      if (!op.field || !op.expression) return data;
      return data.map((row) => ({
        ...row,
        [op.field!]: evaluateSimpleExpression(op.expression!, row),
      }));
    }
    case 'compute': {
      if (!op.newField || !op.expression) return data;
      return data.map((row) => ({
        ...row,
        [op.newField!]: evaluateSimpleExpression(op.expression!, row),
      }));
    }
    default:
      return data;
  }
}

/** Evaluate simple expressions like "field1 + field2" or "toUpperCase(field)" */
function evaluateSimpleExpression(expression: string, row: Record<string, unknown>): unknown {
  // Simple field reference
  if (expression in row) {
    return row[expression];
  }

  // String operations
  const upperMatch = expression.match(/^toUpperCase\((\w+)\)$/);
  if (upperMatch?.[1] && upperMatch[1] in row) {
    return String(row[upperMatch[1]] ?? '').toUpperCase();
  }

  const lowerMatch = expression.match(/^toLowerCase\((\w+)\)$/);
  if (lowerMatch?.[1] && lowerMatch[1] in row) {
    return String(row[lowerMatch[1]] ?? '').toLowerCase();
  }

  // Arithmetic: field1 + field2, field1 * field2
  const arithMatch = expression.match(/^(\w+)\s*([+\-*/])\s*(\w+)$/);
  if (arithMatch) {
    const [, left, operator, right] = arithMatch;
    const leftVal = Number(row[left!] ?? 0);
    const rightVal = Number(row[right!] ?? 0);
    switch (operator) {
      case '+': return leftVal + rightVal;
      case '-': return leftVal - rightVal;
      case '*': return leftVal * rightVal;
      case '/': return rightVal !== 0 ? leftVal / rightVal : 0;
    }
  }

  // Concatenation: concat(field1, " ", field2)
  const concatMatch = expression.match(/^concat\((.+)\)$/);
  if (concatMatch?.[1]) {
    const parts = concatMatch[1].split(',').map((p) => p.trim());
    return parts
      .map((part) => {
        if (part.startsWith('"') && part.endsWith('"')) {
          return part.slice(1, -1);
        }
        return String(row[part] ?? '');
      })
      .join('');
  }

  return expression;
}

/**
 * Filter large lists using multiple conditions.
 */
function filterLargeList(payload: FilterPayload): Record<string, unknown>[] {
  const { data, filters, logic = 'and' } = payload;

  if (filters.length === 0) return [...data] as Record<string, unknown>[];

  return (data as Record<string, unknown>[]).filter((row) => {
    const results = filters.map((filter) => evaluateFilter(row, filter));
    return logic === 'and' ? results.every(Boolean) : results.some(Boolean);
  });
}

function evaluateFilter(row: Record<string, unknown>, filter: FilterCondition): boolean {
  const fieldValue = row[filter.field];
  const filterValue = filter.value;

  switch (filter.operator) {
    case 'eq':
      return fieldValue === filterValue;
    case 'neq':
      return fieldValue !== filterValue;
    case 'gt':
      return Number(fieldValue) > Number(filterValue);
    case 'gte':
      return Number(fieldValue) >= Number(filterValue);
    case 'lt':
      return Number(fieldValue) < Number(filterValue);
    case 'lte':
      return Number(fieldValue) <= Number(filterValue);
    case 'contains':
      return String(fieldValue ?? '').toLowerCase().includes(String(filterValue).toLowerCase());
    case 'startsWith':
      return String(fieldValue ?? '').toLowerCase().startsWith(String(filterValue).toLowerCase());
    case 'endsWith':
      return String(fieldValue ?? '').toLowerCase().endsWith(String(filterValue).toLowerCase());
    case 'in':
      return Array.isArray(filterValue) && filterValue.includes(fieldValue);
    case 'regex': {
      try {
        const regex = new RegExp(String(filterValue), 'i');
        return regex.test(String(fieldValue ?? ''));
      } catch {
        return false;
      }
    }
    default:
      return false;
  }
}

// === Message Handler ===

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, type, payload } = event.data;
  const startTime = performance.now();

  try {
    let result: unknown;

    switch (type) {
      case 'csv-parse':
        result = parseCsv(payload as CsvParsePayload);
        break;
      case 'data-transform':
        result = transformData(payload as DataTransformPayload);
        break;
      case 'filter-large-list':
        result = filterLargeList(payload as FilterPayload);
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    const response: WorkerResponse = {
      id,
      type,
      status: 'success',
      result,
      duration: performance.now() - startTime,
    };
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      id,
      type,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown worker error',
      duration: performance.now() - startTime,
    };
    self.postMessage(response);
  }
};

export type { WorkerRequest, WorkerResponse, WorkerTaskType, CsvParsePayload, DataTransformPayload, FilterPayload, TransformOperation, FilterCondition };
