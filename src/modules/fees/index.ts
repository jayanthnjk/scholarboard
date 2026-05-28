/**
 * Fee module barrel export.
 */

// Types
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
  FeeListParams,
  FeePaymentFilters,
  PaymentFormData,
  FeeStructureFormData,
  PaginatedResponse,
} from './types';

// API hooks
export {
  feeKeys,
  useFeeStructures,
  usePaymentHistory,
  useProcessPayment,
  useFeeDefaulters,
  useFeeAnalytics,
  useCreateFeeStructure,
  useSendReminder,
} from './api';

// Components
export { ReceiptView } from './components/ReceiptView';

// Pages
export { FeeStructurePage } from './pages/FeeStructurePage';
export { PaymentHistoryPage } from './pages/PaymentHistoryPage';
export { PaymentFormPage } from './pages/PaymentFormPage';
export { DefaultersPage } from './pages/DefaultersPage';
export { AnalyticsPage } from './pages/AnalyticsPage';

// Routes
export { feeRoutes } from './routes';
