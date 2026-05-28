/**
 * Tenant system types for multi-tenant isolation and branding.
 * @see Requirements 1.1, 1.2, 1.6, 1.8, 1.11
 */

/** Branded type for tenant identifiers to prevent mixing with other string IDs */
export type TenantId = string & { readonly __brand: 'TenantId' };

/** Supported institution types affecting theme presets */
export type InstitutionType = 'school' | 'college' | 'university';

/** Text direction for RTL/LTR support */
export type TextDirection = 'ltr' | 'rtl';

/**
 * Tenant branding configuration.
 * Applied to all UI elements within 3 seconds of tenant resolution.
 * Falls back to platform defaults for missing/invalid fields.
 */
export interface TenantBranding {
  readonly logo: string;
  readonly favicon: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly accentColor: string;
  readonly fontFamily: string;
  readonly schoolTheme: InstitutionType;
}

/**
 * Locale configuration for internationalization.
 * Requires a minimum of 2 supported locales per tenant.
 */
export interface LocaleConfig {
  readonly defaultLocale: string;
  readonly supportedLocales: readonly [string, string, ...string[]]; // minimum 2
  readonly dateFormat: string;
  readonly currencyCode: string;
  readonly numberFormat: string;
  readonly direction: TextDirection;
}

/** Module-level configuration for enabling/disabling features */
export interface ModuleConfig {
  readonly id: string;
  readonly name: string;
  readonly enabled: boolean;
  readonly order: number;
}

/** Academic year term structure */
export interface AcademicTerm {
  readonly id: string;
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
}

/** Academic year configuration */
export interface AcademicYearConfig {
  readonly id: string;
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly terms: readonly AcademicTerm[];
  readonly isCurrent: boolean;
}

/** Fee structure tied to a tenant */
export interface FeeStructureConfig {
  readonly id: string;
  readonly name: string;
  readonly academicYear: string;
  readonly categories: readonly string[];
}

/** Notification template for email/SMS */
export interface NotificationTemplate {
  readonly id: string;
  readonly type: string;
  readonly subject: string;
  readonly body: string;
  readonly variables: readonly string[];
}

/** Workflow configuration reference (detailed in config.ts) */
export interface WorkflowConfigRef {
  readonly id: string;
  readonly name: string;
  readonly stepsCount: number;
}

/**
 * Complete tenant configuration.
 * Loaded on tenant resolution and propagated through TenantProvider context.
 * Each tenant has fully independent configuration, data, and branding.
 */
export interface TenantConfig {
  readonly id: TenantId;
  readonly name: string;
  readonly subdomain: string;
  readonly customDomain?: string;
  readonly branding: TenantBranding;
  readonly modules: readonly ModuleConfig[];
  readonly featureFlags: Readonly<Record<string, boolean>>;
  readonly locale: LocaleConfig;
  readonly academicYear: AcademicYearConfig;
  readonly feeStructure: FeeStructureConfig;
  readonly admissionWorkflow: WorkflowConfigRef;
  readonly emailTemplates: readonly NotificationTemplate[];
  readonly smsTemplates: readonly NotificationTemplate[];
}

/**
 * Default platform branding used as fallback when tenant config
 * is incomplete or contains invalid values.
 */
export interface PlatformDefaults {
  readonly branding: TenantBranding;
  readonly locale: LocaleConfig;
}

/** Tenant resolution result from subdomain/custom domain lookup */
export type TenantResolutionResult =
  | { readonly status: 'resolved'; readonly config: TenantConfig }
  | { readonly status: 'not_found' }
  | { readonly status: 'suspended'; readonly message: string }
  | { readonly status: 'error'; readonly error: string };
