/**
 * Central type exports for the multi-tenant SaaS ERP UI platform.
 */

export type {
  TenantId,
  InstitutionType,
  TextDirection,
  TenantBranding,
  LocaleConfig,
  ModuleConfig,
  AcademicTerm,
  AcademicYearConfig,
  FeeStructureConfig,
  NotificationTemplate,
  WorkflowConfigRef,
  TenantConfig,
  PlatformDefaults,
  TenantResolutionResult,
} from './tenant';

export type {
  BuiltInRole,
  PermissionLevel,
  ActionPermission,
  DataScope,
  Permission,
  RoleType,
  Role,
  UsePermissionReturn,
  WithPermissionProps,
  PermissionCheckResult,
  CustomRoleRequest,
  PrivilegeEscalationCheck,
} from './rbac';
export { ROLE_HIERARCHY, MAX_CUSTOM_ROLES_PER_TENANT } from './rbac';

export type {
  NavigationItem,
  NavigationConfig,
  FieldType,
  ValidationRule,
  FieldOption,
  ConditionalVisibility,
  FormField,
  FormLayout,
  FormSection,
  FormSchema,
  WorkflowStepStatus,
  WorkflowStep,
  WorkflowConfig,
  BreadcrumbSegment,
  BreadcrumbTrail,
  FeatureFlagContext,
} from './config';
export {
  MAX_NAVIGATION_DEPTH,
  MAX_FORM_FIELDS,
  MAX_FORM_SCHEMA_SIZE_KB,
  MAX_WORKFLOW_STEPS,
  MAX_BREADCRUMB_SEGMENTS,
} from './config';

export type {
  RouteDefinition,
  SettingsPanel,
  DashboardWidget,
  PluginLifecycle,
  PluginStatus,
  PluginDefinition,
  EventHandler,
  Unsubscribe,
  PluginRegistry,
  PluginLoadResult,
} from './plugin';

export type {
  LoginCredentials,
  AuthResult,
  AuthenticatedUser,
  SessionInfo,
  SessionConfig,
  SessionExpiredHandler,
  ForceLogoutHandler,
  SessionManager,
  SessionState,
  TokenRefreshResult,
} from './session';
