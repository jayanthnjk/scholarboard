/**
 * Student API mock handlers.
 * Supports pagination, filtering, sorting, and full-text search.
 * @see Task 2.6 - MSW mock server system
 */

import { http, HttpResponse, delay } from 'msw';
import {
  getStudentsForTenant,
  addStudent,
  updateStudent,
  deleteStudent,
  type StudentRecord,
} from '../data/students';
import { getRandomLatency, shouldSimulateError, checkRateLimit } from '../config';
import { validateAuth } from './auth';

/** Paginated response shape */
interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly pagination: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrevious: boolean;
  };
}

/** Apply full-text search across student fields */
function searchStudents(students: StudentRecord[], query: string): StudentRecord[] {
  const q = query.toLowerCase().trim();
  if (!q) return students;

  return students.filter((s) =>
    s.fullName.toLowerCase().includes(q) ||
    s.studentId.toLowerCase().includes(q) ||
    s.email.toLowerCase().includes(q) ||
    s.phone.includes(q) ||
    s.admissionNumber.toLowerCase().includes(q) ||
    s.className.toLowerCase().includes(q) ||
    s.address.city.toLowerCase().includes(q),
  );
}

/** Apply filters to student list */
function filterStudents(
  students: StudentRecord[],
  filters: Record<string, string>,
): StudentRecord[] {
  let result = students;

  if (filters['status']) {
    result = result.filter((s) => s.status === filters['status']);
  }
  if (filters['className']) {
    result = result.filter((s) => s.className === filters['className']);
  }
  if (filters['section']) {
    result = result.filter((s) => s.section === filters['section']);
  }
  if (filters['gender']) {
    result = result.filter((s) => s.gender === filters['gender']);
  }
  if (filters['feeStatus']) {
    result = result.filter((s) => s.feeStatus === filters['feeStatus']);
  }
  if (filters['bloodGroup']) {
    result = result.filter((s) => s.medical.bloodGroup === filters['bloodGroup']);
  }
  if (filters['category']) {
    result = result.filter((s) => s.category === filters['category']);
  }

  return result;
}

/** Sort students by a field */
function sortStudents(
  students: StudentRecord[],
  sortBy: string,
  sortOrder: 'asc' | 'desc',
): StudentRecord[] {
  const sorted = [...students];
  const multiplier = sortOrder === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    switch (sortBy) {
      case 'name':
      case 'fullName':
        aVal = a.fullName;
        bVal = b.fullName;
        break;
      case 'studentId':
        aVal = a.studentId;
        bVal = b.studentId;
        break;
      case 'className':
        aVal = a.className;
        bVal = b.className;
        break;
      case 'rollNumber':
        aVal = a.rollNumber;
        bVal = b.rollNumber;
        break;
      case 'admissionDate':
        aVal = a.admissionDate;
        bVal = b.admissionDate;
        break;
      case 'createdAt':
        aVal = a.createdAt;
        bVal = b.createdAt;
        break;
      default:
        aVal = a.fullName;
        bVal = b.fullName;
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * multiplier;
    }
    return String(aVal).localeCompare(String(bVal)) * multiplier;
  });

  return sorted;
}

export const studentHandlers = [
  // GET /api/students - paginated, filtered, sorted, searchable
  http.get('/api/students', async ({ request }) => {
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
          headers: {
            'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    const url = new URL(request.url);
    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '20', 10)));
    const search = url.searchParams.get('search') ?? '';
    const sortBy = url.searchParams.get('sortBy') ?? 'fullName';
    const sortOrder = (url.searchParams.get('sortOrder') ?? 'asc') as 'asc' | 'desc';

    // Collect filters from query params
    const filters: Record<string, string> = {};
    for (const key of ['status', 'className', 'section', 'gender', 'feeStatus', 'bloodGroup', 'category']) {
      const val = url.searchParams.get(key);
      if (val) filters[key] = val;
    }

    let students = getStudentsForTenant(tenantId);
    students = searchStudents(students, search);
    students = filterStudents(students, filters);
    students = sortStudents(students, sortBy, sortOrder);

    const total = students.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIdx = (page - 1) * pageSize;
    const paginatedData = students.slice(startIdx, startIdx + pageSize);

    const response: PaginatedResponse<StudentRecord> = {
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };

    return HttpResponse.json(response, {
      headers: {
        'X-Total-Count': String(total),
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      },
    });
  }),

  // GET /api/students/:id - single student profile
  http.get('/api/students/:id', async ({ params, request }) => {
    await delay(getRandomLatency());

    const authHeader = request.headers.get('Authorization');
    const userId = validateAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    if (shouldSimulateError('notFound')) {
      return HttpResponse.json(
        { message: 'Student not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const studentId = params['id'] as string;
    const students = getStudentsForTenant(tenantId);
    const student = students.find((s) => s.id === studentId);

    if (!student) {
      return HttpResponse.json(
        { message: 'Student not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    return HttpResponse.json({ data: student });
  }),

  // POST /api/students - create/admission
  http.post('/api/students', async ({ request }) => {
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
          details: { firstName: ['First name is required'], lastName: ['Last name is required'] },
        },
        { status: 422 },
      );
    }

    if (shouldSimulateError('conflict')) {
      return HttpResponse.json(
        { message: 'Student with this admission number already exists', code: 'CONFLICT' },
        { status: 409 },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const body = (await request.json()) as Partial<StudentRecord>;

    if (!body.firstName || !body.lastName) {
      return HttpResponse.json(
        {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: {
            firstName: !body.firstName ? ['First name is required'] : [],
            lastName: !body.lastName ? ['Last name is required'] : [],
          },
        },
        { status: 422 },
      );
    }

    const students = getStudentsForTenant(tenantId);
    const newId = `student_${tenantId}_${String(students.length + 1).padStart(5, '0')}`;
    const now = new Date().toISOString();

    const newStudent: StudentRecord = {
      id: newId,
      studentId: body.studentId ?? `NEW${Date.now()}`,
      firstName: body.firstName,
      lastName: body.lastName,
      fullName: `${body.firstName} ${body.lastName}`,
      dateOfBirth: body.dateOfBirth ?? '2010-01-01',
      gender: body.gender ?? 'male',
      className: body.className ?? '1',
      section: body.section ?? 'A',
      rollNumber: body.rollNumber ?? students.length + 1,
      admissionDate: body.admissionDate ?? now.split('T')[0] ?? now,
      admissionNumber: body.admissionNumber ?? `ADM/NEW/${Date.now()}`,
      phone: body.phone ?? '',
      email: body.email ?? '',
      address: body.address ?? { line1: '', line2: '', city: '', state: '', pincode: '', country: '' },
      medical: body.medical ?? { bloodGroup: 'O+', allergies: [], conditions: [], emergencyContact: '', emergencyPhone: '', lastCheckupDate: '' },
      guardians: body.guardians ?? [],
      documents: body.documents ?? [],
      feeStatus: body.feeStatus ?? 'pending' as 'paid' | 'partial' | 'overdue' | 'waived',
      status: body.status ?? 'active',
      tenantId,
      createdAt: now,
      updatedAt: now,
      avatar: body.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.firstName?.toLowerCase()}`,
      nationality: body.nationality ?? '',
      religion: body.religion ?? '',
      category: body.category ?? '',
      previousSchool: body.previousSchool ?? '',
      transportRoute: body.transportRoute ?? null,
      hostelRoom: body.hostelRoom ?? null,
    };

    addStudent(newStudent);

    return HttpResponse.json(
      { data: newStudent, message: 'Student created successfully' },
      { status: 201 },
    );
  }),

  // PUT /api/students/:id - update
  http.put('/api/students/:id', async ({ params, request }) => {
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
        { message: 'Validation failed', code: 'VALIDATION_ERROR', details: {} },
        { status: 422 },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const studentId = params['id'] as string;
    const body = (await request.json()) as Partial<StudentRecord>;

    const updated = updateStudent(studentId, tenantId, body);

    if (!updated) {
      return HttpResponse.json(
        { message: 'Student not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    return HttpResponse.json({ data: updated, message: 'Student updated successfully' });
  }),

  // DELETE /api/students/:id
  http.delete('/api/students/:id', async ({ params, request }) => {
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
        { message: 'Insufficient permissions to delete student', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const studentId = params['id'] as string;
    const deleted = deleteStudent(studentId, tenantId);

    if (!deleted) {
      return HttpResponse.json(
        { message: 'Student not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    return HttpResponse.json({ message: 'Student deleted successfully' });
  }),

  // POST /api/students/bulk-import
  http.post('/api/students/bulk-import', async ({ request }) => {
    await delay(getRandomLatency() + 2000); // Simulate longer processing

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
        { message: 'Import processing failed', code: 'INTERNAL_ERROR' },
        { status: 500 },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';

    // Simulate file upload progress and processing
    const totalRecords = Math.floor(Math.random() * 50) + 10;
    const successCount = Math.floor(totalRecords * 0.9);
    const failedCount = totalRecords - successCount;

    return HttpResponse.json({
      message: 'Bulk import completed',
      data: {
        totalRecords,
        successCount,
        failedCount,
        errors: Array.from({ length: failedCount }, (_, i) => ({
          row: Math.floor(Math.random() * totalRecords) + 1,
          field: ['email', 'phone', 'dateOfBirth'][i % 3],
          message: ['Invalid email format', 'Phone number already exists', 'Invalid date format'][i % 3],
        })),
        importId: `import_${tenantId}_${Date.now()}`,
        status: 'completed',
      },
    });
  }),

  // POST /api/students/bulk-export
  http.post('/api/students/bulk-export', async ({ request }) => {
    await delay(getRandomLatency() + 1000);

    const authHeader = request.headers.get('Authorization');
    const userId = validateAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const body = (await request.json()) as { format?: string; filters?: Record<string, string> };

    const students = getStudentsForTenant(tenantId);
    const format = body.format ?? 'csv';

    return HttpResponse.json({
      message: 'Export initiated',
      data: {
        exportId: `export_${tenantId}_${Date.now()}`,
        format,
        totalRecords: students.length,
        status: 'completed',
        downloadUrl: `/api/students/exports/export_${tenantId}_${Date.now()}.${format}`,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
    });
  }),
];
