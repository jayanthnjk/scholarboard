/**
 * Student module types.
 * Re-exports core types from mock data and defines module-specific interfaces.
 */

export type {
  StudentRecord,
  StudentStatus,
  Gender,
  BloodGroup,
  GuardianRelation,
  DocumentType,
  Guardian,
  StudentDocument,
  MedicalInfo,
  Address,
} from '@/mock/data/students';

import type {
  StudentStatus,
  Gender,
  BloodGroup,
  Guardian,
  Address,
} from '@/mock/data/students';

/** Pagination parameters */
export interface PaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

/** Sort parameters */
export interface SortParams {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
}

/** Student list filters */
export interface StudentFilters {
  readonly className?: string;
  readonly section?: string;
  readonly status?: StudentStatus;
  readonly admissionYear?: string;
  readonly feeStatus?: string;
  readonly gender?: Gender;
}

/** Combined student list query parameters */
export interface StudentListParams {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string;
  readonly sortField?: string;
  readonly sortDirection?: 'asc' | 'desc';
  readonly filters?: StudentFilters;
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

/** Admission form - Personal info step */
export interface PersonalInfoData {
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth: string;
  readonly gender: Gender;
  readonly bloodGroup: BloodGroup;
  readonly nationality: string;
  readonly religion: string;
  readonly category: string;
  readonly avatar?: string;
}

/** Admission form - Academic details step */
export interface AcademicDetailsData {
  readonly className: string;
  readonly section: string;
  readonly rollNumber?: number;
  readonly admissionDate: string;
  readonly previousSchool?: string;
  readonly transportRoute?: string;
  readonly hostelRoom?: string;
}

/** Admission form - Contact step */
export interface ContactData {
  readonly phone: string;
  readonly email: string;
  readonly address: Omit<Address, 'readonly'>;
}

/** Admission form - Guardian step */
export interface GuardianData {
  readonly guardians: Array<Omit<Guardian, 'id'>>;
}

/** Admission form - Documents step */
export interface DocumentsData {
  readonly documents: Array<{
    readonly type: string;
    readonly file?: File;
    readonly name: string;
  }>;
}

/** Combined admission form data */
export interface AdmissionFormData {
  readonly personal: PersonalInfoData;
  readonly academic: AcademicDetailsData;
  readonly contact: ContactData;
  readonly guardian: GuardianData;
  readonly documents: DocumentsData;
}

/** Bulk import result */
export interface BulkImportResult {
  readonly total: number;
  readonly successful: number;
  readonly failed: number;
  readonly errors: readonly { row: number; message: string }[];
}

/** Bulk export options */
export interface BulkExportOptions {
  readonly format: 'csv' | 'xlsx' | 'pdf';
  readonly filters?: StudentFilters;
  readonly selectedIds?: string[];
}

/** Student profile tab */
export type ProfileTab =
  | 'personal'
  | 'academic'
  | 'contact'
  | 'medical'
  | 'guardian'
  | 'fee'
  | 'documents'
  | 'timeline';
