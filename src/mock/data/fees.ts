/**
 * Fee data generator for mock server.
 * Fee structures, payment records, and defaulter data.
 * @see Task 2.6 - MSW mock server system
 */

import { TENANT_SUNRISE_ID, TENANT_METRO_ID } from './tenants';
import { getStudentsForTenant } from './students';

/** Fee category */
export interface FeeCategory {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly subCategories: readonly FeeSubCategory[];
}

/** Fee sub-category */
export interface FeeSubCategory {
  readonly id: string;
  readonly name: string;
  readonly amount: number;
  readonly frequency: 'monthly' | 'quarterly' | 'annual' | 'one_time';
  readonly optional: boolean;
}

/** Fee structure definition */
export interface FeeStructure {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly academicYear: string;
  readonly className: string;
  readonly categories: readonly FeeCategory[];
  readonly totalAmount: number;
  readonly dueDate: string;
  readonly latePenalty: LatePenalty;
  readonly discounts: readonly FeeDiscount[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Late penalty configuration */
export interface LatePenalty {
  readonly type: 'fixed' | 'percentage';
  readonly amount: number;
  readonly gracePeriodDays: number;
  readonly maxPenalty: number;
}

/** Fee discount */
export interface FeeDiscount {
  readonly id: string;
  readonly name: string;
  readonly type: 'percentage' | 'fixed';
  readonly value: number;
  readonly eligibility: string;
  readonly applicableCategories: readonly string[];
}

/** Payment method */
export type PaymentMethod = 'cash' | 'cheque' | 'upi' | 'net_banking' | 'card' | 'dd';

/** Payment status */
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded' | 'partial';

/** Payment record */
export interface PaymentRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly studentId: string;
  readonly studentName: string;
  readonly className: string;
  readonly receiptNumber: string;
  readonly amount: number;
  readonly paidAmount: number;
  readonly dueAmount: number;
  readonly method: PaymentMethod;
  readonly status: PaymentStatus;
  readonly transactionId: string;
  readonly feeStructureId: string;
  readonly categories: readonly string[];
  readonly paidDate: string;
  readonly academicYear: string;
  readonly collectedBy: string;
  readonly remarks: string;
  readonly createdAt: string;
}

/** Fee defaulter record */
export interface FeeDefaulter {
  readonly id: string;
  readonly tenantId: string;
  readonly studentId: string;
  readonly studentName: string;
  readonly className: string;
  readonly section: string;
  readonly totalDue: number;
  readonly paidAmount: number;
  readonly pendingAmount: number;
  readonly lastPaymentDate: string | null;
  readonly daysOverdue: number;
  readonly penaltyAccrued: number;
  readonly contactPhone: string;
  readonly parentName: string;
  readonly remindersSent: number;
  readonly lastReminderDate: string | null;
}

/** Fee analytics summary */
export interface FeeAnalytics {
  readonly tenantId: string;
  readonly academicYear: string;
  readonly totalExpected: number;
  readonly totalCollected: number;
  readonly totalPending: number;
  readonly collectionRate: number;
  readonly monthlyCollection: readonly MonthlyCollection[];
  readonly categoryBreakdown: readonly CategoryBreakdown[];
  readonly paymentMethodBreakdown: readonly PaymentMethodBreakdown[];
  readonly defaulterCount: number;
  readonly totalPenaltyCollected: number;
  readonly totalDiscountsGiven: number;
}

export interface MonthlyCollection {
  readonly month: string;
  readonly collected: number;
  readonly expected: number;
}

export interface CategoryBreakdown {
  readonly category: string;
  readonly collected: number;
  readonly pending: number;
}

export interface PaymentMethodBreakdown {
  readonly method: PaymentMethod;
  readonly count: number;
  readonly amount: number;
}

// --- Seeded random for deterministic fee data ---

class FeeRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xffffffff;
    return (this.seed >>> 0) / 0xffffffff;
  }
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[this.nextInt(0, arr.length - 1)] as T;
  }
}

// --- Fee structure generation ---

function generateFeeStructures(tenantId: string): FeeStructure[] {
  const isSchool = tenantId === TENANT_SUNRISE_ID;
  const classes = isSchool
    ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    : ['B.Tech Year 1', 'B.Tech Year 2', 'B.Tech Year 3', 'B.Tech Year 4', 'MBA Year 1', 'MBA Year 2'];

  const structures: FeeStructure[] = [];
  const rng = new FeeRandom(tenantId === TENANT_SUNRISE_ID ? 100 : 200);

  for (const cls of classes) {
    const baseAmount = isSchool ? rng.nextInt(30000, 80000) : rng.nextInt(100000, 300000);
    const categories: FeeCategory[] = [
      {
        id: `cat_tuition_${cls}`,
        name: 'Tuition Fee',
        description: 'Regular tuition charges',
        subCategories: [
          { id: `sub_tuition_${cls}`, name: 'Tuition', amount: Math.round(baseAmount * 0.5), frequency: isSchool ? 'quarterly' : 'annual', optional: false },
        ],
      },
      {
        id: `cat_lab_${cls}`,
        name: 'Lab Fee',
        description: 'Laboratory usage charges',
        subCategories: [
          { id: `sub_lab_${cls}`, name: 'Lab Charges', amount: Math.round(baseAmount * 0.1), frequency: 'annual', optional: false },
        ],
      },
      {
        id: `cat_library_${cls}`,
        name: 'Library Fee',
        description: 'Library access and materials',
        subCategories: [
          { id: `sub_library_${cls}`, name: 'Library', amount: Math.round(baseAmount * 0.05), frequency: 'annual', optional: false },
        ],
      },
      {
        id: `cat_sports_${cls}`,
        name: 'Sports Fee',
        description: 'Sports facility usage',
        subCategories: [
          { id: `sub_sports_${cls}`, name: 'Sports', amount: Math.round(baseAmount * 0.08), frequency: 'annual', optional: false },
        ],
      },
      {
        id: `cat_transport_${cls}`,
        name: 'Transport Fee',
        description: 'School bus service',
        subCategories: [
          { id: `sub_transport_${cls}`, name: 'Bus Service', amount: Math.round(baseAmount * 0.15), frequency: 'monthly', optional: true },
        ],
      },
      {
        id: `cat_exam_${cls}`,
        name: 'Examination Fee',
        description: 'Examination charges',
        subCategories: [
          { id: `sub_exam_${cls}`, name: 'Exam Fee', amount: Math.round(baseAmount * 0.07), frequency: 'quarterly', optional: false },
        ],
      },
    ];

    const totalAmount = categories.reduce(
      (sum, cat) => sum + cat.subCategories.reduce((s, sub) => s + sub.amount, 0),
      0,
    );

    structures.push({
      id: `fs_${tenantId}_${cls.replace(/\s+/g, '_').toLowerCase()}`,
      tenantId,
      name: `Fee Structure - ${cls}`,
      academicYear: '2024-2025',
      className: cls,
      categories,
      totalAmount,
      dueDate: isSchool ? '2024-06-15' : '2024-08-30',
      latePenalty: {
        type: 'percentage',
        amount: isSchool ? 2 : 1.5,
        gracePeriodDays: 15,
        maxPenalty: isSchool ? 5000 : 15000,
      },
      discounts: [
        {
          id: `disc_sibling_${cls}`,
          name: 'Sibling Discount',
          type: 'percentage',
          value: 10,
          eligibility: 'Second child onwards',
          applicableCategories: ['Tuition Fee'],
        },
        {
          id: `disc_merit_${cls}`,
          name: 'Merit Scholarship',
          type: 'percentage',
          value: 25,
          eligibility: 'Top 5% in previous examination',
          applicableCategories: ['Tuition Fee', 'Lab Fee'],
        },
        {
          id: `disc_ews_${cls}`,
          name: 'EWS Concession',
          type: 'percentage',
          value: 50,
          eligibility: 'Economically Weaker Section students',
          applicableCategories: ['Tuition Fee', 'Lab Fee', 'Sports Fee'],
        },
      ],
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-04-01T00:00:00Z',
    });
  }

  return structures;
}

// --- Payment generation ---

function generatePayments(tenantId: string, count: number): PaymentRecord[] {
  const students = getStudentsForTenant(tenantId);
  const rng = new FeeRandom(tenantId === TENANT_SUNRISE_ID ? 300 : 400);
  const payments: PaymentRecord[] = [];
  const methods: PaymentMethod[] = ['cash', 'cheque', 'upi', 'net_banking', 'card', 'dd'];
  const statuses: PaymentStatus[] = ['completed', 'completed', 'completed', 'completed', 'pending', 'failed', 'partial'];
  const collectors = ['Suresh Patel', 'Online Portal', 'Bank Transfer', 'Michael Chen', 'Finance Office'];

  for (let i = 0; i < count; i++) {
    const student = rng.pick(students.slice(0, Math.min(students.length, 500)));
    const amount = rng.nextInt(5000, 100000);
    const status = rng.pick(statuses);
    const paidAmount = status === 'completed' ? amount : (status === 'partial' ? Math.round(amount * rng.next() * 0.8) : 0);

    const month = rng.nextInt(1, 12);
    const day = rng.nextInt(1, 28);
    const paidDate = `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    payments.push({
      id: `pay_${tenantId}_${String(i + 1).padStart(6, '0')}`,
      tenantId,
      studentId: student.id,
      studentName: student.fullName,
      className: student.className,
      receiptNumber: `RCP/${tenantId === TENANT_SUNRISE_ID ? 'SA' : 'MU'}/2024/${String(i + 1).padStart(5, '0')}`,
      amount,
      paidAmount,
      dueAmount: amount - paidAmount,
      method: rng.pick(methods),
      status,
      transactionId: `TXN${rng.nextInt(100000000, 999999999)}`,
      feeStructureId: `fs_${tenantId}_${student.className.replace(/\s+/g, '_').toLowerCase()}`,
      categories: rng.pick([['Tuition Fee'], ['Tuition Fee', 'Lab Fee'], ['Transport Fee'], ['Tuition Fee', 'Sports Fee', 'Library Fee']]),
      paidDate: paidDate + 'T10:00:00Z',
      academicYear: '2024-2025',
      collectedBy: rng.pick(collectors),
      remarks: status === 'partial' ? 'Partial payment - balance to follow' : '',
      createdAt: paidDate + 'T10:00:00Z',
    });
  }

  return payments;
}

// --- Defaulter generation ---

function generateDefaulters(tenantId: string): FeeDefaulter[] {
  const students = getStudentsForTenant(tenantId)
    .filter((s) => s.status === 'active' && (s.feeStatus === 'overdue' || s.feeStatus === 'partial'));
  const rng = new FeeRandom(tenantId === TENANT_SUNRISE_ID ? 500 : 600);
  const defaulters: FeeDefaulter[] = [];

  for (const student of students.slice(0, 100)) {
    const totalDue = rng.nextInt(10000, 150000);
    const paidAmount = Math.round(totalDue * rng.next() * 0.5);
    const daysOverdue = rng.nextInt(15, 180);
    const penaltyRate = 0.02;
    const penaltyAccrued = Math.round((totalDue - paidAmount) * penaltyRate * (daysOverdue / 30));
    const guardian = student.guardians[0];

    defaulters.push({
      id: `def_${student.id}`,
      tenantId,
      studentId: student.id,
      studentName: student.fullName,
      className: student.className,
      section: student.section,
      totalDue,
      paidAmount,
      pendingAmount: totalDue - paidAmount,
      lastPaymentDate: paidAmount > 0 ? `2024-${String(rng.nextInt(1, 8)).padStart(2, '0')}-${String(rng.nextInt(1, 28)).padStart(2, '0')}` : null,
      daysOverdue,
      penaltyAccrued,
      contactPhone: guardian?.phone ?? student.phone,
      parentName: guardian?.name ?? 'N/A',
      remindersSent: rng.nextInt(0, 5),
      lastReminderDate: rng.next() > 0.3 ? `2024-${String(rng.nextInt(9, 11)).padStart(2, '0')}-${String(rng.nextInt(1, 28)).padStart(2, '0')}` : null,
    });
  }

  return defaulters;
}

// --- Analytics generation ---

function generateAnalytics(tenantId: string): FeeAnalytics {
  const rng = new FeeRandom(tenantId === TENANT_SUNRISE_ID ? 700 : 800);
  const studentCount = tenantId === TENANT_SUNRISE_ID ? 800 : 1200;
  const avgFee = tenantId === TENANT_SUNRISE_ID ? 55000 : 180000;
  const totalExpected = studentCount * avgFee;
  const collectionRate = 0.72 + rng.next() * 0.15;
  const totalCollected = Math.round(totalExpected * collectionRate);

  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const monthlyCollection: MonthlyCollection[] = months.map((month) => {
    const expected = Math.round(totalExpected / 12);
    const collected = Math.round(expected * (0.5 + rng.next() * 0.5));
    return { month, collected, expected };
  });

  const categories = ['Tuition Fee', 'Lab Fee', 'Library Fee', 'Sports Fee', 'Transport Fee', 'Exam Fee'];
  const categoryBreakdown: CategoryBreakdown[] = categories.map((category) => {
    const share = category === 'Tuition Fee' ? 0.5 : rng.next() * 0.15;
    const catExpected = Math.round(totalExpected * share);
    return {
      category,
      collected: Math.round(catExpected * (0.6 + rng.next() * 0.3)),
      pending: Math.round(catExpected * rng.next() * 0.3),
    };
  });

  const paymentMethods: PaymentMethod[] = ['upi', 'net_banking', 'cash', 'card', 'cheque', 'dd'];
  const paymentMethodBreakdown: PaymentMethodBreakdown[] = paymentMethods.map((method, idx) => {
    const weight = idx === 0 ? 0.35 : idx === 1 ? 0.25 : idx === 2 ? 0.2 : 0.1;
    return {
      method,
      count: Math.round(studentCount * weight * (0.8 + rng.next() * 0.4)),
      amount: Math.round(totalCollected * weight),
    };
  });

  return {
    tenantId,
    academicYear: '2024-2025',
    totalExpected,
    totalCollected,
    totalPending: totalExpected - totalCollected,
    collectionRate: Math.round(collectionRate * 10000) / 100,
    monthlyCollection,
    categoryBreakdown,
    paymentMethodBreakdown,
    defaulterCount: rng.nextInt(50, 150),
    totalPenaltyCollected: rng.nextInt(50000, 500000),
    totalDiscountsGiven: rng.nextInt(200000, 2000000),
  };
}

// --- In-memory data stores ---

let feeStructuresCache: Map<string, FeeStructure[]> | null = null;
let paymentsCache: Map<string, PaymentRecord[]> | null = null;
let defaultersCache: Map<string, FeeDefaulter[]> | null = null;

/** Get fee structures for a tenant */
export function getFeeStructures(tenantId: string): FeeStructure[] {
  if (!feeStructuresCache) {
    feeStructuresCache = new Map();
    feeStructuresCache.set(TENANT_SUNRISE_ID, generateFeeStructures(TENANT_SUNRISE_ID));
    feeStructuresCache.set(TENANT_METRO_ID, generateFeeStructures(TENANT_METRO_ID));
  }
  return feeStructuresCache.get(tenantId) ?? feeStructuresCache.get(TENANT_SUNRISE_ID) ?? [];
}

/** Add a fee structure */
export function addFeeStructure(structure: FeeStructure): void {
  const structures = getFeeStructures(structure.tenantId);
  structures.push(structure);
}

/** Get payments for a tenant */
export function getPayments(tenantId: string): PaymentRecord[] {
  if (!paymentsCache) {
    paymentsCache = new Map();
    paymentsCache.set(TENANT_SUNRISE_ID, generatePayments(TENANT_SUNRISE_ID, 500));
    paymentsCache.set(TENANT_METRO_ID, generatePayments(TENANT_METRO_ID, 800));
  }
  return paymentsCache.get(tenantId) ?? paymentsCache.get(TENANT_SUNRISE_ID) ?? [];
}

/** Add a payment record */
export function addPayment(payment: PaymentRecord): void {
  const payments = getPayments(payment.tenantId);
  payments.push(payment);
}

/** Get defaulters for a tenant */
export function getDefaulters(tenantId: string): FeeDefaulter[] {
  if (!defaultersCache) {
    defaultersCache = new Map();
    defaultersCache.set(TENANT_SUNRISE_ID, generateDefaulters(TENANT_SUNRISE_ID));
    defaultersCache.set(TENANT_METRO_ID, generateDefaulters(TENANT_METRO_ID));
  }
  return defaultersCache.get(tenantId) ?? defaultersCache.get(TENANT_SUNRISE_ID) ?? [];
}

/** Get fee analytics for a tenant */
export function getFeeAnalytics(tenantId: string): FeeAnalytics {
  return generateAnalytics(tenantId || TENANT_SUNRISE_ID);
}

/** Reset all fee data */
export function resetFeeData(): void {
  feeStructuresCache = null;
  paymentsCache = null;
  defaultersCache = null;
}
