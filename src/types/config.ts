/**
 * Config-driven navigation, forms, and workflow types.
 * Supports dynamic sidebar generation, JSON schema forms, and configurable workflows.
 * @see Requirements 3.1, 3.2, 3.4, 3.5, 3.6, 3.7
 */

/** Maximum navigation nesting depth */
export const MAX_NAVIGATION_DEPTH = 4;

/** Maximum fields per form schema */
export const MAX_FORM_FIELDS = 200;

/** Maximum form schema size in KB */
export const MAX_FORM_SCHEMA_SIZE_KB = 500;

/** Maximum steps per workflow */
export const MAX_WORKFLOW_STEPS = 30;

/** Maximum breadcrumb segments displayed */
export const MAX_BREADCRUMB_SEGMENTS = 6;

/**
 * Navigation item within the sidebar.
 * Supports nested groups up to 4 levels deep with role-based visibility.
 */
export interface NavigationItem {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly path?: string;
  readonly children?: readonly NavigationItem[];
  readonly permissions: readonly string[];
  readonly badgeCount?: () => number;
  readonly featureFlag?: string;
  readonly group?: string;
}

/**
 * Complete navigation configuration for a tenant.
 * Generated dynamically from tenant config + role + permissions.
 */
export interface NavigationConfig {
  readonly items: readonly NavigationItem[];
  readonly maxDepth: typeof MAX_NAVIGATION_DEPTH;
}

/** Available form field types */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'select'
  | 'multiselect'
  | 'combobox'
  | 'date'
  | 'daterange'
  | 'time'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'file'
  | 'image'
  | 'richtext'
  | 'section'
  | 'repeater'
  | 'group';

/** Validation rule for form fields */
export interface ValidationRule {
  readonly type:
    | 'required'
    | 'min'
    | 'max'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    | 'email'
    | 'phone'
    | 'custom';
  readonly value?: string | number | boolean;
  readonly message: string;
}

/** Option for select/radio/checkbox field types */
export interface FieldOption {
  readonly label: string;
  readonly value: string;
  readonly disabled?: boolean;
}

/** Conditional visibility configuration for dependent fields */
export interface ConditionalVisibility {
  readonly field: string;
  readonly operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in' | 'gt' | 'lt';
  readonly value: string | number | boolean | readonly string[];
}

/**
 * Form field definition for JSON schema-driven forms.
 * Supports conditional visibility and field dependencies.
 */
export interface FormField {
  readonly name: string;
  readonly type: FieldType;
  readonly label: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly validation?: readonly ValidationRule[];
  readonly conditional?: ConditionalVisibility;
  readonly dependsOn?: readonly string[];
  readonly options?: readonly FieldOption[];
  readonly defaultValue?: string | number | boolean | readonly string[];
  readonly helpText?: string;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly colSpan?: 1 | 2 | 3 | 4;
}

/** Form layout configuration for responsive rendering */
export interface FormLayout {
  readonly columns: 1 | 2 | 3 | 4;
  readonly gap: 'sm' | 'md' | 'lg';
  readonly sections?: readonly FormSection[];
}

/** Named section within a form for grouping fields */
export interface FormSection {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly fields: readonly string[];
  readonly collapsible?: boolean;
  readonly defaultCollapsed?: boolean;
}

/**
 * Complete form schema definition.
 * Rendered by the JSON Form Engine with React Hook Form + Zod validation.
 */
export interface FormSchema {
  readonly id: string;
  readonly version: string;
  readonly fields: readonly FormField[];
  readonly layout: FormLayout;
  readonly maxFields: typeof MAX_FORM_FIELDS;
  readonly maxSizeKB: typeof MAX_FORM_SCHEMA_SIZE_KB;
}

/** Workflow step status */
export type WorkflowStepStatus = 'pending' | 'active' | 'completed' | 'skipped' | 'failed';

/** Individual step within a workflow */
export interface WorkflowStep {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly moduleRef?: string;
  readonly status: WorkflowStepStatus;
  readonly requiredFields?: readonly string[];
  readonly validationRules?: readonly ValidationRule[];
  readonly canSkip?: boolean;
}

/**
 * Workflow configuration supporting up to 30 steps.
 * Steps referencing disabled modules are automatically skipped.
 */
export interface WorkflowConfig {
  readonly id: string;
  readonly name: string;
  readonly steps: readonly WorkflowStep[];
  readonly currentStep: number;
  readonly completedSteps: readonly string[];
  readonly skippedSteps: readonly string[];
}

/** Breadcrumb segment for navigation path display */
export interface BreadcrumbSegment {
  readonly label: string;
  readonly path?: string;
  readonly isCurrentPage: boolean;
}

/**
 * Breadcrumb trail result.
 * Maximum 6 visible segments; intermediate segments truncated with ellipsis.
 */
export interface BreadcrumbTrail {
  readonly segments: readonly BreadcrumbSegment[];
  readonly isTruncated: boolean;
  readonly totalDepth: number;
}

/** Feature flag evaluation context */
export interface FeatureFlagContext {
  readonly tenantId: string;
  readonly role: string;
  readonly environment: 'development' | 'staging' | 'production';
}
