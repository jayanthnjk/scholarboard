/**
 * Fee API mock handlers.
 * Fee structure, payments, defaulters, and analytics.
 * @see Task 2.6 - MSW mock server system
 */

import { http, HttpResponse, delay } from 'msw';
import {
  getFeeStructures,
  addFeeStructure,
  getPayments,
  addPayment,
  getDefaulters,
  getFeeAnalytics,
  type FeeStructure,
  type PaymentRecord,
  type PaymentMethod,
  type PaymentStatus,
} from '../data/fees';
import { getRandomLatency, shouldSimulateError, checkRateLimit } from '../config';
import { validateAuth } from './auth';

export const feeHandlers = [
  // GET /api/fees/structure
  http.get('/api/fees/structure', async ({ request }) => {
    await delay(getRandomLatency());

    const authHeader = request.headers.get('Authorization');
    const userId = validateAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    if (shouldSimulateError('serverError')) {
      return HttpResponse.json(
        { message: 'Internal server error', code: 'INTERNAL_ERROR' },
        { status: 500 },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const url = new URL(request.url);
    const className = url.searchParams.get('className');
    const academicYear = url.searchParams.get('academicYear');

    let structures = getFeeStructures(tenantId);

    if (className) {
      structures = structures.filter((s) => s.className === className);
    }
    if (academicYear) {
      structures = structures.filter((s) => s.academicYear === academicYear);
    }

    return HttpResponse.json({ data: structures, total: structures.length });
  }),

  // POST /api/fees/structure
  http.post('/api/fees/structure', async ({ request }) => {
    await delay(getRandomLatency());

    const authHeader = request.headers.get('Authorization');
    const userId = validateAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    if (shouldSimulateError('validation')) {
      return HttpResponse.json(
        {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: { name: ['Fee structure name is required'], className: ['Class is required'] },
        },
        { status: 422 },
      );
    }

    if (shouldSimulateError('conflict')) {
      return HttpResponse.json(
        { message: 'Fee structure already exists for this class and academic year', code: 'CONFLICT' },
        { status: 409 },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const body = (await request.json()) as Partial<FeeStructure>;

    if (!body.name || !body.className) {
      return HttpResponse.json(
        {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: {
            name: !body.name ? ['Name is required'] : [],
            className: !body.className ? ['Class is required'] : [],
          },
        },
        { status: 422 },
      );
    }

    const now = new Date().toISOString();
    const newStructure: FeeStructure = {
      id: `fs_${tenantId}_${Date.now()}`,
      tenantId,
      name: body.name,
      academicYear: body.academicYear ?? '2024-2025',
      className: body.className,
      categories: body.categories ?? [],
      totalAmount: body.totalAmount ?? 0,
      dueDate: body.dueDate ?? now.split('T')[0] ?? now,
      latePenalty: body.latePenalty ?? { type: 'percentage', amount: 2, gracePeriodDays: 15, maxPenalty: 5000 },
      discounts: body.discounts ?? [],
      createdAt: now,
      updatedAt: now,
    };

    addFeeStructure(newStructure);

    return HttpResponse.json(
      { data: newStructure, message: 'Fee structure created successfully' },
      { status: 201 },
    );
  }),

  // GET /api/fees/payments - paginated, filtered
  http.get('/api/fees/payments', async ({ request }) => {
    await delay(getRandomLatency());

    const authHeader = request.headers.get('Authorization');
    const userId = validateAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    if (shouldSimulateError('serverError')) {
      return HttpResponse.json(
        { message: 'Internal server error', code: 'INTERNAL_ERROR' },
        { status: 500 },
      );
    }

    const rateLimitResult = checkRateLimit(userId);
    if (rateLimitResult.limited) {
      return HttpResponse.json(
        { message: 'Rate limit exceeded', code: 'RATE_LIMITED' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs / 1000)) },
        },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '20', 10)));
    const search = url.searchParams.get('search') ?? '';
    const status = url.searchParams.get('status') as PaymentStatus | null;
    const method = url.searchParams.get('method') as PaymentMethod | null;
    const className = url.searchParams.get('className');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const sortBy = url.searchParams.get('sortBy') ?? 'paidDate';
    const sortOrder = (url.searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';

    let payments = getPayments(tenantId);

    // Apply search
    if (search) {
      const q = search.toLowerCase();
      payments = payments.filter(
        (p) =>
          p.studentName.toLowerCase().includes(q) ||
          p.receiptNumber.toLowerCase().includes(q) ||
          p.transactionId.toLowerCase().includes(q),
      );
    }

    // Apply filters
    if (status) payments = payments.filter((p) => p.status === status);
    if (method) payments = payments.filter((p) => p.method === method);
    if (className) payments = payments.filter((p) => p.className === className);
    if (startDate) payments = payments.filter((p) => p.paidDate >= startDate);
    if (endDate) payments = payments.filter((p) => p.paidDate <= endDate);

    // Sort
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    payments = [...payments].sort((a, b) => {
      const aVal = sortBy === 'amount' ? a.amount : (sortBy === 'paidDate' ? a.paidDate : a.studentName);
      const bVal = sortBy === 'amount' ? b.amount : (sortBy === 'paidDate' ? b.paidDate : b.studentName);
      if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * multiplier;
      return String(aVal).localeCompare(String(bVal)) * multiplier;
    });

    const total = payments.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIdx = (page - 1) * pageSize;
    const paginatedData = payments.slice(startIdx, startIdx + pageSize);

    return HttpResponse.json({
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    });
  }),

  // POST /api/fees/payments - process payment
  http.post('/api/fees/payments', async ({ request }) => {
    await delay(getRandomLatency());

    const authHeader = request.headers.get('Authorization');
    const userId = validateAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    if (shouldSimulateError('validation')) {
      return HttpResponse.json(
        {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: { amount: ['Amount must be greater than 0'] },
        },
        { status: 422 },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const body = (await request.json()) as {
      studentId?: string;
      amount?: number;
      method?: PaymentMethod;
      categories?: string[];
      remarks?: string;
    };

    if (!body.studentId || !body.amount || body.amount <= 0) {
      return HttpResponse.json(
        {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: {
            studentId: !body.studentId ? ['Student ID is required'] : [],
            amount: !body.amount || body.amount <= 0 ? ['Valid amount is required'] : [],
          },
        },
        { status: 422 },
      );
    }

    const now = new Date().toISOString();
    const payments = getPayments(tenantId);
    const receiptNum = `RCP/${tenantId.includes('sunrise') ? 'SA' : 'MU'}/2024/${String(payments.length + 1).padStart(5, '0')}`;

    const newPayment: PaymentRecord = {
      id: `pay_${tenantId}_${String(payments.length + 1).padStart(6, '0')}`,
      tenantId,
      studentId: body.studentId,
      studentName: 'Student Name', // In real app, lookup from student data
      className: '',
      receiptNumber: receiptNum,
      amount: body.amount,
      paidAmount: body.amount,
      dueAmount: 0,
      method: body.method ?? 'cash',
      status: 'completed',
      transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`,
      feeStructureId: '',
      categories: body.categories ?? ['Tuition Fee'],
      paidDate: now,
      academicYear: '2024-2025',
      collectedBy: 'Current User',
      remarks: body.remarks ?? '',
      createdAt: now,
    };

    addPayment(newPayment);

    return HttpResponse.json(
      { data: newPayment, message: 'Payment processed successfully' },
      { status: 201 },
    );
  }),

  // GET /api/fees/defaulters
  http.get('/api/fees/defaulters', async ({ request }) => {
    await delay(getRandomLatency());

    const authHeader = request.headers.get('Authorization');
    const userId = validateAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '20', 10)));
    const className = url.searchParams.get('className');
    const minAmount = url.searchParams.get('minAmount');
    const sortBy = url.searchParams.get('sortBy') ?? 'pendingAmount';
    const sortOrder = (url.searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';

    let defaulters = getDefaulters(tenantId);

    if (className) defaulters = defaulters.filter((d) => d.className === className);
    if (minAmount) defaulters = defaulters.filter((d) => d.pendingAmount >= parseInt(minAmount, 10));

    // Sort
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    defaulters = [...defaulters].sort((a, b) => {
      if (sortBy === 'pendingAmount') return (a.pendingAmount - b.pendingAmount) * multiplier;
      if (sortBy === 'daysOverdue') return (a.daysOverdue - b.daysOverdue) * multiplier;
      return a.studentName.localeCompare(b.studentName) * multiplier;
    });

    const total = defaulters.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIdx = (page - 1) * pageSize;
    const paginatedData = defaulters.slice(startIdx, startIdx + pageSize);

    return HttpResponse.json({
      data: paginatedData,
      pagination: { page, pageSize, total, totalPages, hasNext: page < totalPages, hasPrevious: page > 1 },
      summary: {
        totalDefaulters: total,
        totalPendingAmount: defaulters.reduce((sum, d) => sum + d.pendingAmount, 0),
        totalPenaltyAccrued: defaulters.reduce((sum, d) => sum + d.penaltyAccrued, 0),
      },
    });
  }),

  // GET /api/fees/analytics
  http.get('/api/fees/analytics', async ({ request }) => {
    await delay(getRandomLatency());

    const authHeader = request.headers.get('Authorization');
    const userId = validateAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    if (shouldSimulateError('forbidden')) {
      return HttpResponse.json(
        { message: 'Insufficient permissions for analytics', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const analytics = getFeeAnalytics(tenantId);

    return HttpResponse.json({ data: analytics });
  }),
];
