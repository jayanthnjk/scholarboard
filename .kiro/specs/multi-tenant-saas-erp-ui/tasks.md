# Implementation Plan: Multi-Tenant SaaS ERP UI Platform

## Overview

This implementation plan covers a production-grade, multi-tenant SaaS ERP UI platform for educational institutions built with React + TypeScript (strict mode), Vite, TailwindCSS + shadcn/ui, Zustand, TanStack Query, React Hook Form + Zod, Axios, Recharts, Framer Motion, and MSW. The plan follows a dependency-ordered approach: foundational infrastructure first, then core services, then fully-implemented modules, then scaffolded modules and advanced features.

## Tasks

- [x] 1. Project Setup and Core Infrastructure
  - [x] 1.1 Initialize Vite + React + TypeScript project with strict mode
    - Configure `tsconfig.json` with strict mode, path aliases (`@/`)
    - Install and configure TailwindCSS, shadcn/ui, ESLint, Prettier, Husky, lint-staged
    - Set up directory structure: `src/{providers,types,hooks,services,components,modules,store,mock,workers,utils}`
    - Configure Vite with code splitting, path aliases, and environment variables
    - _Requirements: 9.1, 9.9_

  - [x] 1.2 Define core TypeScript types and interfaces
    - Create `src/types/tenant.ts` with `TenantConfig`, `TenantBranding`, `LocaleConfig`
    - Create `src/types/rbac.ts` with `Role`, `Permission`, `DataScope`, `BuiltInRole`
    - Create `src/types/config.ts` with `NavigationConfig`, `NavigationItem`, `FormSchema`, `FormField`, `WorkflowConfig`
    - Create `src/types/plugin.ts` with `PluginDefinition`, `PluginLifecycle`, `PluginRegistry`
    - Create `src/types/session.ts` with `SessionManager`, `SessionConfig`
    - _Requirements: 1.1, 2.1, 3.1, 13.1, 14.2_

  - [x] 1.3 Set up Zustand store with slices
    - Create `src/store/index.ts` with combined store
    - Implement `auth` slice (user, token, isAuthenticated, impersonation, sessions)
    - Implement `tenant` slice (current, isLoading, error)
    - Implement `ui` slice (sidebar, theme, locale, notifications, commandPalette, globalSearch)
    - Implement `bulkOps` slice (activeOperations, history)
    - _Requirements: 14.2, 1.1, 12.2_

  - [x] 1.4 Set up TanStack Query client with query key factory
    - Configure `QueryClient` with default stale times and retry logic
    - Create `src/services/query-keys.ts` with hierarchical key factory (students, fees, config)
    - Configure stale-while-revalidate caching strategy per resource type
    - _Requirements: 9.6, 9.7_

  - [x] 1.5 Set up Storybook for component documentation
    - Install and configure Storybook with TypeScript, TailwindCSS, and Framer Motion addons
    - Create initial story structure mirroring component directories
    - _Requirements: 5.5_

- [x] 2. Core Services Layer
  - [x] 2.1 Implement API client with request queue and circuit breaker
    - Create `src/services/api-client.ts` with Axios instance
    - Implement request queue manager with max 6 concurrent, 4 priority levels (critical, user, background, prefetch)
    - Implement request deduplication with 2-second sliding window
    - Implement circuit breaker (5 failures in 30s → open, 60s cooldown)
    - Implement retry logic with exponential backoff (1s, 2s, 4s, max 3 retries)
    - Auto-inject `X-Tenant-ID` header from tenant context
    - _Requirements: 27.1, 27.2, 27.3, 27.7, 27.10, 27.12, 10.3, 1.9_

  - [ ]* 2.2 Write property tests for request queue priority ordering
    - **Property 18: Request Queue Priority Ordering**
    - **Validates: Requirements 27.1, 27.2, 27.3**

  - [ ]* 2.3 Write property tests for circuit breaker state machine
    - **Property 19: Circuit Breaker State Machine**
    - **Validates: Requirements 27.10**

  - [ ]* 2.4 Write property tests for request deduplication
    - **Property 20: Request Deduplication**
    - **Validates: Requirements 27.12**

  - [ ]* 2.5 Write property tests for retry delay calculation
    - **Property 28: Retry Delay Calculation**
    - **Validates: Requirements 10.3**

  - [x] 2.6 Implement MSW mock server
    - Create `src/mock/server.ts` with MSW setup
    - Implement configurable latency (300-1500ms), error probability, network speed simulation
    - Create mock data generators for students (500-2000 per tenant), fees, users
    - Implement pagination (default 20, max 100), filtering, sorting, full-text search
    - Implement conflict simulation (409), rate limiting (429 with Retry-After), file upload progress
    - Create developer panel component for runtime toggle of mock behaviors
    - Persist data changes in memory during session
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12_

  - [ ]* 2.7 Write property tests for pagination correctness
    - **Property 27: Pagination Correctness**
    - **Validates: Requirements 4.3**

  - [x] 2.8 Implement Web Worker pool for heavy computation
    - Create `src/services/web-worker-pool.ts` with task execution interface
    - Implement workers for CSV parsing, data transformation, large list filtering
    - Create shared worker for tab coordination (BroadcastChannel)
    - _Requirements: 27.4, 27.6_

  - [x] 2.9 Implement session manager
    - Create `src/services/session-manager.ts` with login, logout, token refresh
    - Implement idle detection (15min timeout, 2min warning)
    - Implement token rotation and session regeneration
    - Implement tab synchronization via BroadcastChannel (logout sync)
    - Implement request throttling (100 requests per 10-second window)
    - Implement graceful degradation during token service outages (5min extension)
    - _Requirements: 14.1, 14.2, 14.3, 14.7, 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7, 28.9, 28.10_

  - [ ]* 2.10 Write property tests for session request throttling
    - **Property 21: Session Request Throttling**
    - **Validates: Requirements 28.10**

- [~] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Provider Hierarchy and Multi-Tenancy
  - [x] 4.1 Implement Auth Provider
    - Create `src/providers/AuthProvider.tsx` with login/logout context
    - Implement protected route wrapper with session validation
    - Implement role-based default dashboard redirect on login
    - Handle 401 with session-expired modal preserving current URL
    - Implement remember me and failed login CAPTCHA (3 attempts)
    - _Requirements: 14.1, 14.3, 14.6, 14.7, 14.8, 14.9, 10.6_

  - [x] 4.2 Implement Tenant Provider with resolution logic
    - Create `src/providers/TenantProvider.tsx` with tenant context
    - Implement subdomain/custom domain resolution to tenant config
    - Load tenant configuration (modules, feature flags, branding, locale, academic year)
    - Reject cross-tenant API requests without revealing target tenant existence
    - _Requirements: 1.1, 1.2, 1.8, 1.9, 1.12_

  - [ ]* 4.3 Write property tests for tenant subdomain resolution
    - **Property 25: Tenant Subdomain Resolution**
    - **Validates: Requirements 1.8**

  - [ ]* 4.4 Write property tests for tenant data isolation
    - **Property 2: Tenant Data Isolation**
    - **Validates: Requirements 1.2, 1.9, 1.12**

  - [x] 4.5 Implement Theme Provider and Theme Engine
    - Create `src/providers/ThemeProvider.tsx` with dark/light/system mode
    - Implement CSS custom properties generation from tenant branding
    - Implement school/college/university theme presets
    - Implement fallback to platform defaults for missing/invalid branding values
    - Persist theme preference in localStorage with FOUC prevention
    - Support RTL layout and high-contrast mode
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 6.7, 6.8, 6.9, 1.1, 1.11_

  - [ ]* 4.6 Write property tests for tenant branding resolution
    - **Property 1: Tenant Branding Resolution**
    - **Validates: Requirements 1.1, 1.11**

  - [~] 4.7 Implement Config Provider and Config Engine
    - Create `src/providers/ConfigProvider.tsx` with navigation and feature flag context
    - Implement dynamic sidebar generation from tenant config + role + permissions
    - Implement feature flag evaluation with UI element removal (no empty spaces)
    - Implement workflow engine supporting up to 30 steps with skip logic for disabled modules
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 1.3_

  - [ ]* 4.8 Write property tests for config-driven navigation generation
    - **Property 3: Config-Driven Navigation Generation**
    - **Validates: Requirements 1.3, 3.1, 3.5**

  - [ ]* 4.9 Write property tests for workflow step execution with skip logic
    - **Property 7: Workflow Step Execution with Skip Logic**
    - **Validates: Requirements 3.4**

  - [~] 4.10 Implement AppProviders composition
    - Create `src/providers/AppProviders.tsx` combining all providers in correct order:
      QueryClientProvider → AuthProvider → TenantProvider → ThemeProvider → ConfigProvider → NotificationProvider
    - _Requirements: 1.1, 2.1, 6.1_

- [ ] 5. RBAC System
  - [~] 5.1 Implement RBAC permission engine
    - Create `src/services/rbac.ts` with permission resolution logic
    - Implement 7 built-in roles with hierarchy (Super_Admin → Student)
    - Implement role inheritance (higher roles inherit lower permissions)
    - Implement data-scoped permissions (class, section, department, grade)
    - Implement custom role creation (max 20 per tenant) with privilege escalation prevention
    - _Requirements: 2.1, 2.6, 2.7, 2.8, 2.11, 2.13_

  - [ ]* 5.2 Write property tests for RBAC permission resolution
    - **Property 4: RBAC Permission Resolution**
    - **Validates: Requirements 2.1, 2.3, 2.5, 2.8, 2.11**

  - [ ]* 5.3 Write property tests for privilege escalation prevention
    - **Property 5: Privilege Escalation Prevention**
    - **Validates: Requirements 2.13**

  - [~] 5.4 Implement RBAC hooks and components
    - Create `src/hooks/usePermission.ts` hook returning hasPermission, hasModuleAccess, hasPageAccess
    - Create `src/components/withPermission.tsx` HOC with fallback/disable modes
    - Create `src/components/RouteGuard.tsx` redirecting to permission-denied page
    - Implement role impersonation (Super_Admin) with banner and exit button
    - Implement permission propagation to active sessions within 60 seconds
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.9, 2.12_

  - [~] 5.5 Implement permission matrix UI
    - Create permission configuration page for School_Admins
    - Visual grid showing roles vs. permissions with toggle controls
    - Enforce hierarchy constraints (cannot grant permissions above own level)
    - _Requirements: 2.10, 2.13_

- [~] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Design System Components
  - [ ] 7.1 Implement base UI components with shadcn/ui
    - Create Button, IconButton, Input, Textarea, Select, MultiSelect, Combobox
    - Create Datepicker, DateRangePicker, TimePicker, Checkbox, Radio, Switch, Slider
    - Create Modal, Drawer, Sheet, AlertDialog, Tooltip, Popover, Dropdown, Command
    - Create Badge, Tag, Avatar, AvatarGroup, Stepper, Skeleton, Breadcrumb, Pagination
    - Create FileUpload, DragAndDrop, RichTextEditor, ColorPicker, Timeline, EmptyState
    - Ensure ARIA attributes, roles, labels for WCAG 2.1 AA compliance
    - Implement keyboard navigation (focus trapping, arrow keys, tab order)
    - _Requirements: 5.1, 5.3, 5.4_

  - [~] 7.2 Implement layout components
    - Create PageHeader, PageContent, SplitPane, Grid, Stack, Sidebar, ResponsiveContainer, AspectRatio
    - Implement responsive breakpoints (desktop 1200+, tablet 768-1199, mobile <768)
    - _Requirements: 5.7, 6.5_

  - [~] 7.3 Implement DataTable component with virtual scrolling
    - Create DataTable composite component (table + filters + pagination + export)
    - Implement pagination, column sorting, multi-column filtering, row selection, bulk actions
    - Implement virtual scrolling for datasets >500 rows (60fps at 10,000+ rows)
    - Implement column resizing, reordering, pinning, row expansion, inline editing
    - Implement CSV/PDF/Excel export
    - Implement card layout transformation for mobile viewports
    - _Requirements: 5.2, 9.5, 29.8, 30.6_

  - [~] 7.4 Implement animation system and composite components
    - Create Framer Motion animation system for transitions, micro-interactions, page animations
    - Create FormField composite (label + input + error + help text)
    - Create StatCard composite (icon + value + label + trend)
    - _Requirements: 5.6, 5.8_

  - [~] 7.5 Implement JSON Form Engine
    - Create `src/services/form-engine.tsx` rendering forms from JSON schema
    - Support all field types, conditional visibility, dependent fields, responsive layouts
    - Enforce 200 field max, 500KB schema limit
    - Integrate React Hook Form + Zod for validation
    - Implement autosave (30s interval + field blur) with status indicator
    - _Requirements: 3.2, 3.7, 7.7, 12.4_

  - [ ]* 7.6 Write property tests for JSON schema form rendering
    - **Property 6: JSON Schema Form Rendering**
    - **Validates: Requirements 3.2, 3.7**

- [ ] 8. Error Handling and Resilience Layer
  - [~] 8.1 Implement 4-level error boundary strategy
    - Create App-level error boundary with crash recovery page
    - Create Module-level error boundary with fallback + retry
    - Create Page-level error boundary with recovery actions
    - Create Component-level error boundary with placeholder
    - _Requirements: 10.1, 20.8_

  - [~] 8.2 Implement error handling utilities
    - Create toast notification system (success 5s auto-dismiss, errors persistent)
    - Implement batch error notifications (aggregate simultaneous errors)
    - Implement offline detection banner with action queuing
    - Implement global error reporter (stack traces, user context, browser info)
    - Handle missing/null fields gracefully with partial data rendering
    - _Requirements: 10.2, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 12.2, 20.1_

  - [~] 8.3 Implement optimistic UI update pattern
    - Create reusable optimistic update hook for mutations
    - Implement state rollback on API failure with undo notification
    - Implement duplicate submission prevention (disable button on click)
    - Implement undo for destructive actions (5-second grace period)
    - _Requirements: 12.3, 12.5, 12.6, 20.4_

  - [ ]* 8.4 Write property tests for optimistic UI state consistency
    - **Property 17: Optimistic UI State Consistency**
    - **Validates: Requirements 8.5**

  - [~] 8.5 Implement breadcrumb generator
    - Create breadcrumb generation from navigation path (max 6 segments, ellipsis truncation)
    - _Requirements: 3.6_

  - [ ]* 8.6 Write property tests for breadcrumb generation
    - **Property 8: Breadcrumb Generation**
    - **Validates: Requirements 3.6**

- [~] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Authentication and Session UI
  - [~] 10.1 Implement login and authentication pages
    - Create login page with email/password, validation, loading state, error messaging
    - Implement forgot-password flow (email → verification code → reset with strength indicator)
    - Implement MFA UI (OTP input, backup codes, authenticator QR setup)
    - Implement password change interface with current password verification
    - _Requirements: 14.1, 14.4, 14.5, 14.10_

  - [~] 10.2 Implement session management UI
    - Create session timeout warning modal with countdown and extend button
    - Create active sessions list with device info and revoke action
    - Create user profile page (personal info, avatar upload, notification preferences, language/timezone)
    - Create session-terminated modal for force-logout scenarios
    - _Requirements: 14.7, 14.11, 14.12, 28.5_

- [ ] 11. Global Search and Navigation
  - [~] 11.1 Implement global search (command palette)
    - Create command palette activated by Ctrl+K / Cmd+K
    - Search across students, staff, fees, announcements, documents, navigation items
    - Implement debounced search (300ms), text highlighting, categorized results
    - Display recent searches and frequently accessed items when empty
    - Support prefix/toggle filter by category
    - Implement keyboard navigation (arrow keys, Enter, Escape)
    - Support quick actions from results without full page navigation
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_

  - [~] 11.2 Implement navigation shell and sidebar
    - Create responsive sidebar with collapsible groups (4 levels deep)
    - Implement badge counts for pending items (updated every 60s)
    - Implement role-based visibility hiding
    - Implement mobile bottom navigation bar
    - Preserve filter state, scroll position, pagination on browser back/forward
    - Cancel in-flight requests on navigation abandonment
    - _Requirements: 3.5, 30.3, 20.6, 29.9_

- [ ] 12. Internationalization System
  - [~] 12.1 Implement i18n infrastructure
    - Set up locale loading with dynamic bundle imports (English, Hindi, Arabic, Spanish, French, Mandarin, Portuguese)
    - Implement language switching at user level without page reload
    - Implement date, time, number, currency formatting per locale
    - Implement pluralization and gender-specific translations
    - Support RTL/LTR mixed content and text direction handling
    - Implement translation key export/import for tenant overrides
    - Display language completion percentage with fallback to default
    - _Requirements: 34.1, 34.2, 34.3, 34.4, 34.5, 34.6, 34.7, 34.8, 1.6_

  - [ ]* 12.2 Write property tests for internationalization formatting
    - **Property 23: Internationalization Formatting**
    - **Validates: Requirements 34.3, 34.4**

- [ ] 13. Student Management Module (Full Implementation)
  - [~] 13.1 Implement student list with virtual scrolling and filters
    - Create paginated student list (default 25, virtual scroll at 500+)
    - Implement search by name/ID, filter by class, section, status, admission year
    - Implement advanced search (multiple field criteria, guardian name, phone)
    - Implement skeleton loading, empty state with filter reset
    - Implement infinite scroll for mobile viewports
    - _Requirements: 7.1, 7.5, 7.6, 7.16, 12.7_

  - [ ]* 13.2 Write property tests for list filtering correctness
    - **Property 9: List Filtering Correctness**
    - **Validates: Requirements 7.1, 7.16, 8.2**

  - [~] 13.3 Implement student profile with tabbed layout
    - Create tabbed profile view: personal, academic, contact, medical, guardian, fee info
    - Implement timeline tab showing chronological history (academic, fees, attendance, documents)
    - Implement conflict detection for concurrent edits with diff view
    - _Requirements: 7.2, 7.13, 7.15_

  - [ ]* 13.4 Write property tests for concurrent edit conflict detection
    - **Property 13: Concurrent Edit Conflict Detection**
    - **Validates: Requirements 7.15, 20.2**

  - [~] 13.5 Implement multi-step admission form
    - Create wizard with Zod schema validation, conditional fields
    - Implement autosave (30s + field blur) with saved timestamp and error handling
    - Store drafts in localStorage on autosave failure
    - _Requirements: 7.3, 7.7, 7.8_

  - [ ]* 13.6 Write property tests for admission form validation round-trip
    - **Property 11: Admission Form Validation Round-Trip**
    - **Validates: Requirements 7.3**

  - [~] 13.7 Implement document upload and student photo
    - Create document upload with drag-and-drop, type validation (PDF/JPG/PNG/DOCX), size limit (5MB), max 20 docs
    - Implement upload progress indication and resume on interruption
    - Implement photo upload with cropping, resize (400x400), webcam capture
    - _Requirements: 7.4, 7.14, 20.5_

  - [ ]* 13.8 Write property tests for document upload validation
    - **Property 10: Document Upload Validation**
    - **Validates: Requirements 7.4**

  - [~] 13.9 Implement bulk operations for students
    - Create bulk import from CSV/Excel (10MB max, 5000 records) with column mapping, preview, validation
    - Create bulk export to CSV/Excel/PDF with column selection and filter preservation
    - Implement student promotion/transfer batch processing (200 per batch) with partial failure handling
    - Implement student ID card generation with templates and batch printing (100 cards)
    - _Requirements: 7.9, 7.10, 7.11, 7.12, 7.17_

  - [ ]* 13.10 Write property tests for batch operation partial failure handling
    - **Property 12: Batch Operation Partial Failure Handling**
    - **Validates: Requirements 7.9, 7.11, 7.12**

- [~] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Fee Management Module (Full Implementation)
  - [~] 15.1 Implement fee structure builder
    - Create fee category/sub-category creation with amounts, due dates
    - Implement late fee penalties, early payment discounts, applicable groups
    - Implement recurring fee schedules with automatic installment generation
    - _Requirements: 8.1, 8.11_

  - [ ]* 15.2 Write property tests for recurring fee installment generation
    - **Property 16: Recurring Fee Installment Generation**
    - **Validates: Requirements 8.11**

  - [~] 15.3 Implement payment processing and history
    - Create payment form (amount, method, reference, partial/advance support)
    - Implement payment history with filtering (date, student, class, status, method, amount, receipt)
    - Implement optimistic updates with rollback on failure
    - Generate printable/downloadable receipts with branding
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6_

  - [~] 15.4 Implement fee concessions and discounts
    - Create concession/scholarship/sibling discount management with approval workflows
    - Ensure calculated payable never goes negative
    - Support multiple currency display with configurable exchange rates
    - _Requirements: 8.9, 8.13_

  - [ ]* 15.5 Write property tests for fee discount and concession calculation
    - **Property 15: Fee Discount and Concession Calculation**
    - **Validates: Requirements 8.9**

  - [~] 15.6 Implement fee defaulter report and analytics
    - Create defaulter report with ageing analysis (30/60/90+ days), parent contacts
    - Create analytics dashboard (collection trends, outstanding, method distribution, MoM)
    - _Requirements: 8.7, 8.10_

  - [ ]* 15.7 Write property tests for fee ageing calculation
    - **Property 14: Fee Ageing Calculation**
    - **Validates: Requirements 8.7**

  - [~] 15.8 Implement bulk fee collection and reminders
    - Create bulk fee collection for class/section with individual adjustments
    - Create fee reminder interface with customizable templates
    - Implement fee refund workflow with approval and receipt
    - _Requirements: 8.8, 8.12, 8.14_

- [ ] 16. Plugin Architecture and Module Registration
  - [~] 16.1 Implement plugin registry and lifecycle management
    - Create `src/services/plugin-registry.ts` with register, unregister, getPlugin, emit, on
    - Implement lifecycle hooks (onInit, onDestroy, onActivate, onDeactivate)
    - Implement dynamic module loading at runtime
    - Implement shared event bus for inter-plugin communication
    - _Requirements: 13.1, 13.2, 13.6, 13.7_

  - [~] 16.2 Implement plugin marketplace and activity logs
    - Create plugin marketplace UI (available, installed, updateable, versions)
    - Create Activity Logs UI (timestamped actions, filtering by user/action/module/date/IP)
    - Create Audit Trail UI (before/after values, field-level diff, changed-by, timestamp)
    - _Requirements: 13.3, 13.4, 13.8_

- [~] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Scaffolded Modules
  - [~] 18.1 Implement Dashboard module scaffold
    - Create role-specific widgets: student count, fee summary, attendance %, events, activity feed, quick actions
    - Implement windowed rendering for 20+ widgets (render only visible)
    - _Requirements: 11.4, 29.4_

  - [~] 18.2 Implement Attendance module scaffold
    - Create daily attendance marking (class-wise), attendance reports with percentages
    - Create leave management with approval workflows, biometric/manual toggle
    - _Requirements: 11.5_

  - [~] 18.3 Implement Exams/Gradebook module scaffold
    - Create exam scheduling, grade entry (marks/GPA), report card templates
    - Create grade analytics and result publication workflow
    - _Requirements: 11.6_

  - [~] 18.4 Implement Communication module scaffold
    - Create announcements (rich text, scheduling, audience targeting)
    - Create messaging inbox with threads, read receipts, typing indicators
    - Create SMS/email campaign builder, notification preferences, delivery tracking
    - Create circular/notice board, parent-teacher meeting scheduler, emergency broadcast
    - _Requirements: 11.7, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9_

  - [~] 18.5 Implement Timetable module scaffold
    - Create class schedule with drag-and-drop, teacher allocation with conflict detection
    - Create substitution management and period configuration
    - _Requirements: 11.9_

  - [~] 18.6 Implement Staff/HR module scaffold
    - Create staff directory, payroll summary, leave management, attendance tracking
    - Create document management and performance review interfaces
    - _Requirements: 11.11_

  - [~] 18.7 Implement remaining scaffolded modules
    - Create Library module (catalog, issue/return, fines, reservations)
    - Create Transport module (routes with map, vehicle tracking, student-route assignment)
    - Create Hostel module (room allocation, management)
    - Create Reports module (report builder with drag-and-drop, chart types, filters, scheduling)
    - Create Settings module (institution profile, academic year, user/role mgmt, integrations)
    - _Requirements: 11.12, 11.13, 11.10, 11.8_

- [ ] 19. Admission Pipeline (CRM)
  - [~] 19.1 Implement admission pipeline kanban and workflows
    - Create kanban board (Inquiry → Application → Document Verification → Interview/Test → Offer → Accepted → Enrolled → Rejected)
    - Implement automated state transitions based on configurable rules
    - Implement public inquiry form (no login required)
    - Create communication log per applicant with timeline
    - Implement bulk actions (move stage, send communication, schedule, assign)
    - Create funnel analytics (conversion rates, drop-off, avg time per stage)
    - Integrate with Student_Module for auto-creation on enrollment
    - Create admission cycle comparison analytics (YoY)
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.8_

  - [ ]* 19.2 Write property tests for admission pipeline state transitions
    - **Property 26: Admission Pipeline State Transitions**
    - **Validates: Requirements 25.1, 25.4**

- [ ] 20. Super Admin Console
  - [~] 20.1 Implement super admin tenant management
    - Create tenant dashboard (all tenants, status, plan, user count, storage)
    - Create tenant creation interface (details, plan, admin user, modules)
    - Create platform-wide analytics (users, tenants, module adoption, errors, health)
    - Implement tenant suspension with maintenance message
    - Create feature flag management (per-tenant and platform-wide)
    - Create system announcements interface
    - Create admin audit log with filtering and export
    - Implement tenant configuration cloning
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8_

  - [~] 20.2 Implement subscription and billing management
    - Create plan management (Free/Basic/Pro/Enterprise, features, limits, quotas)
    - Create billing history per tenant with invoice generation and download
    - Implement subscription expiry handling (renewal prompt, premium restriction)
    - Create usage tracking (users, storage, API calls, features)
    - Implement trial management (duration, conversion tracking, expiry notifications)
    - Create plan comparison table with upgrade CTA
    - Support add-on module purchases
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7_

- [ ] 21. Parent and Student Portals
  - [~] 21.1 Implement Parent Portal
    - Create child-centric dashboard (attendance, grades, exams, fees, announcements)
    - Implement multi-child view with switching
    - Create fee payment history and online payment interface
    - Create academic report cards and grade trends with charts
    - Create leave application interface
    - Create communication interface for messaging teachers
    - Implement mobile-optimized responsive layout
    - Display timetable, homework, events in consolidated view
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 23.7, 23.8_

  - [~] 21.2 Implement Student Portal
    - Create personalized dashboard (attendance %, exams, assignments, fees, timetable)
    - Create academic history (report cards, transcripts, certificates)
    - Create leave application and attendance tracking
    - Create fee payment interface with receipts
    - Create library catalog with search, availability, reservation
    - Create assignment submission interface with file upload and deadlines
    - Create notification center
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7_

- [~] 22. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Academic Year, Calendar, and Bulk Operations
  - [~] 23.1 Implement academic year and calendar management
    - Create academic year configuration (start/end, terms, working days)
    - Create calendar view (month/week/day/agenda) with color-coded events
    - Implement event creation with recurrence, audience targeting, reminders
    - Support multiple concurrent academic years
    - Implement conflict detection for overlapping events
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8_

  - [~] 23.2 Implement bulk operations infrastructure
    - Create bulk selection (checkboxes, select-all, range Shift+click)
    - Create contextual action bar with bulk operations and count
    - Implement CSV/Excel import with column mapping, type detection, preview, validation
    - Implement confirmation dialog for >50 records (summary, count, irreversibility)
    - Implement progress bar with cancel/rollback
    - Create bulk operation history with error logs
    - Implement data archival workflows for graduating students
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

- [ ] 24. Data Export, Reporting, and Workflow Automation
  - [~] 24.1 Implement data export and reporting
    - Implement CSV/Excel/PDF export from any data table with column/filter selection
    - Create pre-built report templates (enrollment, fee collection, attendance, exams, staff, admissions)
    - Create custom report builder (data source, filters, grouping, aggregation, visualization)
    - Implement async export for >1000 records with progress and download notification
    - Create chart visualizations (bar, line, pie, area, stacked, radar, funnel) with Recharts
    - Implement scheduled report generation simulation
    - Support report sharing, dashboard pinning, print-optimized layouts
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9, 16.10_

  - [~] 24.2 Implement workflow automation and approval engine
    - Create visual workflow builder (multi-step, conditions, approvers, escalation, deadlines)
    - Create approval inbox (pending approvals, one-click approve/reject, bulk processing)
    - Implement parallel and sequential approvals with configurable completion rules
    - Implement auto-escalation on missed deadlines
    - Create workflow analytics (avg time, bottlenecks, approval/rejection ratios)
    - Implement pre-built templates (leave, fee concession, transfer, document verification, expense)
    - Create complete audit trail (state transitions, actions, comments, timestamps)
    - _Requirements: 35.1, 35.2, 35.3, 35.4, 35.5, 35.6, 35.7, 35.8_

  - [ ]* 24.3 Write property tests for workflow approval state machine
    - **Property 24: Workflow Approval State Machine**
    - **Validates: Requirements 35.4**

- [ ] 25. Data Privacy, Integrations, and Document Vault
  - [~] 25.1 Implement data privacy and compliance
    - Create consent management interface (grant/revoke/view per category)
    - Create privacy dashboard (stored data, access logs, retention timelines)
    - Implement right to erasure workflow (request → admin review → approval)
    - Implement data portability export (JSON/CSV)
    - Implement retention policy warnings and archival/deletion workflows
    - Implement sensitive field masking by role and data classification level
    - Create DPA acceptance flow for onboarding
    - Create data access log and age-appropriate consent forms (COPPA)
    - Implement data classification levels (Public/Internal/Confidential/Restricted) with visual indicators
    - _Requirements: 31.1, 31.2, 31.3, 31.4, 31.5, 31.6, 31.7, 31.8, 31.9, 31.10_

  - [ ]* 25.2 Write property tests for sensitive data masking by role
    - **Property 22: Sensitive Data Masking by Role**
    - **Validates: Requirements 31.6**

  - [~] 25.3 Implement integrations and webhook management
    - Create integrations marketplace (Google Workspace, M365, payment gateways, SMS, accounting)
    - Create webhook management (configure outgoing webhooks, URL, secret, retry)
    - Create webhook delivery logs (request/response, status, retries, failure alerts)
    - Create API key management (generation, rotation, expiration, usage tracking)
    - Create data sync status dashboard
    - Create import/export mapping interface for bidirectional sync
    - Implement SSO configuration UI (SAML/OAuth, metadata upload, test connection)
    - Create Zapier/Make-style automation triggers (if-this-then-that rules)
    - _Requirements: 32.1, 32.2, 32.3, 32.4, 32.5, 32.6, 32.7, 32.8_

  - [~] 25.4 Implement Document Vault
    - Create folder-based organization with drag-and-drop upload and nested folders
    - Implement versioning (history, revert), sharing (role-based, links with expiration)
    - Create document preview (PDF, images, DOCX)
    - Implement tagging, categorization, filtered search
    - Create storage quota management with usage visualization
    - Create document templates with merge fields and batch generation
    - Implement digital signature workflow
    - Implement bulk upload with auto-categorization
    - _Requirements: 33.1, 33.2, 33.3, 33.4, 33.5, 33.6, 33.7, 33.8, 33.9_

- [ ] 26. PWA, Help Center, and Onboarding
  - [~] 26.1 Implement PWA shell and mobile experience
    - Configure service worker for offline access and static asset caching
    - Implement install prompt for home screen
    - Implement touch gestures (swipe dismiss, pull to refresh, pinch to zoom)
    - Implement push notifications for critical alerts
    - Optimize asset loading for mobile networks
    - _Requirements: 30.1, 30.2, 30.4, 30.5, 30.7_

  - [~] 26.2 Implement Help Center
    - Create searchable knowledge base with categories, articles, video tutorials, FAQ
    - Create support ticket submission (category, priority, description, screenshot, status tracking)
    - Implement contextual help links per page
    - Create "What's New" changelog
    - Implement interactive guided tours for new users
    - Create feedback widget (page rating, feature requests, bug reports)
    - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6_

  - [~] 26.3 Implement Onboarding Wizard
    - Create multi-step wizard for new tenant setup (branding, modules, roles, academic year, fee structure)
    - Support saving partial progress at each step
    - Validate completion before tenant activation
    - _Requirements: 1.7_

- [ ] 27. Performance Optimization and Edge Cases
  - [~] 27.1 Implement performance optimizations
    - Configure code splitting with lazy loading for all module routes
    - Implement image lazy loading with blur-up placeholders
    - Implement debouncing (300ms) on search/filter inputs
    - Apply React.memo/useMemo on expensive list/table components
    - Implement prefetch for likely next navigation targets (hover prefetch)
    - Implement time-slicing for expensive renders (forms, charts) - max 50ms main thread blocking
    - Implement memory monitoring (80% heap → cache eviction, virtualization)
    - Implement automatic render batching for high-frequency state updates
    - Clean up event listeners, intervals, subscriptions on component unmount
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.8, 29.1, 29.2, 29.3, 29.5, 29.6, 29.7, 27.5, 27.8, 27.11_

  - [~] 27.2 Implement edge case handling
    - Handle localStorage full with graceful degradation and warning
    - Handle browser back/forward preserving state (filters, scroll, pagination, forms)
    - Handle timezone differences (user local + original on hover)
    - Handle long-running operations with persistent status bar during navigation
    - Handle browser compatibility warnings (IndexedDB, Web Workers)
    - Handle permissions change mid-session (reflect on next navigation)
    - Handle stale data across multiple tabs (detect on save, prompt conflict resolution)
    - _Requirements: 20.2, 20.3, 20.6, 20.7, 20.9, 20.10, 20.11, 20.12_

- [~] 28. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- The tech stack is React + TypeScript (strict), Vite, TailwindCSS + shadcn/ui, Zustand, TanStack Query, React Hook Form + Zod, Axios, Recharts, Framer Motion, MSW, Storybook, ESLint + Prettier + Husky + lint-staged
- All property-based tests use the fast-check library as specified in the design

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.5"] },
    { "id": 2, "tasks": ["1.3", "1.4"] },
    { "id": 3, "tasks": ["2.1", "2.6", "2.8", "2.9"] },
    { "id": 4, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.7", "2.10"] },
    { "id": 5, "tasks": ["4.1", "4.5"] },
    { "id": 6, "tasks": ["4.2", "4.6"] },
    { "id": 7, "tasks": ["4.3", "4.4", "4.7"] },
    { "id": 8, "tasks": ["4.8", "4.9", "4.10"] },
    { "id": 9, "tasks": ["5.1"] },
    { "id": 10, "tasks": ["5.2", "5.3", "5.4"] },
    { "id": 11, "tasks": ["5.5"] },
    { "id": 12, "tasks": ["7.1", "7.2"] },
    { "id": 13, "tasks": ["7.3", "7.4", "7.5"] },
    { "id": 14, "tasks": ["7.6"] },
    { "id": 15, "tasks": ["8.1", "8.2", "8.5"] },
    { "id": 16, "tasks": ["8.3", "8.4", "8.6"] },
    { "id": 17, "tasks": ["10.1", "10.2", "11.1", "11.2"] },
    { "id": 18, "tasks": ["12.1"] },
    { "id": 19, "tasks": ["12.2"] },
    { "id": 20, "tasks": ["13.1", "13.3", "13.5", "13.7"] },
    { "id": 21, "tasks": ["13.2", "13.4", "13.6", "13.8", "13.9"] },
    { "id": 22, "tasks": ["13.10"] },
    { "id": 23, "tasks": ["15.1", "15.3", "15.4", "15.6"] },
    { "id": 24, "tasks": ["15.2", "15.5", "15.7", "15.8"] },
    { "id": 25, "tasks": ["16.1"] },
    { "id": 26, "tasks": ["16.2"] },
    { "id": 27, "tasks": ["18.1", "18.2", "18.3", "18.4", "18.5", "18.6", "18.7"] },
    { "id": 28, "tasks": ["19.1"] },
    { "id": 29, "tasks": ["19.2", "20.1", "20.2"] },
    { "id": 30, "tasks": ["21.1", "21.2"] },
    { "id": 31, "tasks": ["23.1", "23.2"] },
    { "id": 32, "tasks": ["24.1", "24.2"] },
    { "id": 33, "tasks": ["24.3"] },
    { "id": 34, "tasks": ["25.1", "25.3", "25.4"] },
    { "id": 35, "tasks": ["25.2"] },
    { "id": 36, "tasks": ["26.1", "26.2", "26.3"] },
    { "id": 37, "tasks": ["27.1", "27.2"] }
  ]
}
```
