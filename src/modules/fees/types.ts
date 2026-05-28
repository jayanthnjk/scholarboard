/**
 * Fee module types.
 * Re-exports core types from mock data and defines module-specific interfaces.
 */

export type {
  FeeStructure,
  FeeCategory,
  FeeSubCategory,
  LatePenalty,
  FeeDiscount,
  PaymentRecord,
  PaymentMethod,
  PaymentStatus,
  FeeDefaulter,
  FeeAnalytics,
  MonthlyCollection,
  CategoryBreakdown,
  PaymentMethodBreakdown,
} from '@/mock/data/fees';

/** Fee list query parameters */
export interface FeeListParams {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string;
  readonly sortField?: string;
  readonly sortDirection?: 'asc' | 'desc';
  readonly filters?: FeePaymentFilters;
}

/** Payment history filters */
export interface FeePaymentFilters {
  readonly status?: string;
  readonly method?: string;
  readonly className?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

/** Payment form data */
export interface PaymentFormData {
  readonly studentId: string;
  readonly studentName: string;
  readonly className: string;
  readonly feeStructureId: string;
  readonly amount: number;
  readonly method: string;
  readonly transactionId: string;
  readonly categories: readonly string[];
  readonly remarks: string;
  readonly isPartial: boolean;
}

/** Fee structure form data */
export interface FeeStructureFormData {
  readonly name: string;
  readonly className: string;
  readonly academicYear: string;
  readonly dueDate: string;
  readonly categories: {
    readonly name: string;
    readonly description: string;
    readonly amount: number;
    readonly frequency: 'monthly' | 'quarterly' | 'annual' | 'one_time';
    readonly optional: boolean;
  }[];
  readonly latePenalty: {
    readonly type: 'fixed' | 'percentage';
    readonly amount: number;
    readonly gracePeriodDays: number;
    readonly maxPenalty: number;
  };
  readonly discounts: {
    readonly name: string;
    readonly type: 'percentage' | 'fixed';
    readonly value: number;
    readonly eligibility: string;
  }[];
}

/** Paginated API response */
export interface PaginatedResponse<T> {
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
