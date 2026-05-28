/**
 * Student module barrel export.
 */

// Types
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
  StudentListParams,
  StudentFilters as StudentFilterValues,
  PaginatedResponse,
  AdmissionFormData,
  BulkImportResult,
  BulkExportOptions,
  ProfileTab,
} from './types';

// API hooks
export {
  studentKeys,
  useStudentList,
  useStudentProfile,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useBulkImport,
  useBulkExport,
} from './api';

// Components
export { StudentFilters } from './components/StudentFilters';

// Pages
export { StudentListPage } from './pages/StudentListPage';
export { StudentProfilePage } from './pages/StudentProfilePage';
export { AdmissionFormPage } from './pages/AdmissionFormPage';

// Routes
export { studentRoutes } from './routes';
