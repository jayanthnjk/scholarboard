# Bugfix Requirements Document

## Introduction

Multiple critical defects in the multi-tenant SaaS ERP UI platform prevent the application from functioning as a production-grade SaaS system comparable to PowerSchool, Zoho, or MyClassboard. Only the School Admin login produces a partially usable experience; all other role-based logins fail to provide appropriate dashboards, navigation, and permission enforcement. The sidebar is hardcoded with a static navigation structure instead of using the dynamic ConfigProvider-driven navigation, meaning RBAC policies are not enforced at the UI layer. The Super Admin console (tenant management, platform analytics, subscriptions) has implemented pages but is completely inaccessible via navigation. Student and Parent portals exist as routes but users are never routed to them. No route-level permission guards exist on protected modules. The application lacks essential SaaS features: tenant registration, subscription controls, and role-context awareness.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a Super Admin (admin@sunriseacademy.edu) logs in THEN the system routes to /admin but the sidebar shows the same hardcoded navigation as all other roles — it does NOT show the Super Admin navigation (Tenants, Platform Analytics, Subscriptions) that is already defined in ConfigProvider's SUPER_ADMIN_NAVIGATION_ITEMS

1.2 WHEN an Accountant (accounts@sunriseacademy.edu) logs in THEN the system routes to /fees but the sidebar displays ALL modules (Students with full CRUD paths, Staff, Library, Courses, Exams, Admissions, etc.) instead of restricting to only the modules the Accountant role has permission for (finance, fees, payments, reports, students view-only)

1.3 WHEN a Teacher (teacher.math@sunriseacademy.edu) logs in THEN the system routes to /dashboard but the sidebar displays ALL modules instead of restricting to only modules the Teacher has permission for (students view-only, attendance, exams, timetable, communication)

1.4 WHEN a Student (student.arjun@sunriseacademy.edu) logs in THEN the system routes to /dashboard instead of /student-portal, and the sidebar shows the full institutional management navigation instead of a student portal navigation — the student-portal route exists but is never the landing page for students

1.5 WHEN a Parent (parent.sharma@gmail.com) logs in THEN the system routes to /dashboard instead of /parent-portal, and the sidebar shows the full institutional management navigation instead of a parent portal navigation — the parent-portal route exists but is never the landing page for parents

1.6 WHEN any user logs in THEN the sidebar component (src/components/layout/sidebar.tsx) renders a static hardcoded SECTIONS constant with fixed items (Dashboard, Analytics, Calendar, Messages, Registration, Students, Library, Courses, Faculty, Exam Board, Financial Record, Help & Center, Settings) without ever consuming the ConfigProvider's generated navigation output

1.7 WHEN a Super Admin needs to register a new tenant THEN there is no "Add Tenant" / "Register Institution" button or onboarding wizard accessible from any navigation path — the TenantManagementPage exists at /admin/tenants but lacks a tenant creation/registration workflow

1.8 WHEN a Super Admin needs to manage tenant subscriptions (enable/disable modules per tenant, change plans, view usage) THEN the SubscriptionPage exists at /admin/subscriptions but is not accessible via sidebar navigation, and lacks controls to enable/disable individual features per tenant

1.9 WHEN any role logs in THEN the sidebar does NOT display the user's name with their role badge, the tenant name, or any indicator of which role/context is active — there is no role awareness in the UI

1.10 WHEN a restricted user (Parent, Student, Staff, Teacher, Accountant) types a URL directly to a module they don't have access to (e.g., a Parent navigating to /staff, /settings, /admissions, or /admin) THEN the system renders the page because the RouteGuard in App.tsx only checks isAuthenticated and does NOT pass resource, module, page, or roles props to enforce RBAC on any module route

1.11 WHEN a Super Admin needs to suspend/enable a tenant or view platform-wide health metrics THEN the PlatformAnalyticsPage at /admin/analytics is not accessible via sidebar navigation

1.12 WHEN a Super Admin needs to see which features are enabled per subscription tier for each tenant THEN there is no feature matrix or per-tenant feature toggle interface accessible

1.13 WHEN the sidebar is rendered THEN it shows a hardcoded "Sunrise Academy" institution name and "Academic Year 2024-25" instead of dynamically showing the current tenant's actual name from the tenant configuration

1.14 WHEN a user with the Accountant role navigates to /fees sub-pages (/fees/structure, /fees/payments, /fees/defaulters, /fees/analytics, /fees/make-payment) THEN all pages render without route-level permission verification — the Accountant has fees.create and fees.collect actions but there is no route guard to prevent a Teacher (who only has students.view and attendance.mark) from accessing /fees/structure if they type the URL

1.15 WHEN a Student or Parent role navigates to /fees THEN they can see the full fee management interface (structure builder with create/edit, defaulter reports with student data, analytics dashboard, collect payment form) instead of only their own fee payment history and pending fees — the fee module pages don't differentiate between admin-level fee management and student/parent self-service

1.16 WHEN the School Admin login works THEN it is only coincidentally correct because the hardcoded sidebar items happen to roughly match what a School Admin would see — but the sidebar still shows items like "Courses" and "Calendar" that aren't in the ConfigProvider's filtered list, and MISSES items like "Transport" (/transport), "Documents" (/documents), "Workflows" (/workflows), and "Admissions Pipeline" (/admissions) that ARE registered as routes in App.tsx

1.17 WHEN any authenticated user is in the system THEN there is no way to visually distinguish between the Super Admin console interface (/admin/*) and the school-level institutional interface — both share the same layout shell with no contextual branding or mode indicator

1.18 WHEN the AuthProvider ROLE_DASHBOARD_MAP routes a Student to /dashboard and Parent to /dashboard THEN those roles land on the institutional DashboardPage which is designed to show admin-level widgets (student count, fee collection summary, attendance %) instead of their respective portal pages (StudentDashboardPage, ParentDashboardPage)

1.19 WHEN pages that DO use usePermission() to conditionally show edit/delete/create buttons (e.g., StudentListPage hides "Add Student" button when !hasPermission('students', 'create'), and StudentProfilePage hides "Edit" button when !hasPermission('students', 'edit')) are accessed by restricted roles THEN the action buttons are correctly hidden BUT the user can still navigate to the page via the hardcoded sidebar — meaning a Teacher can see the Students list page (correct: view-only) but ALSO sees and can click sidebar links to Fees, Staff, Library, Admissions, Settings (incorrect: these modules are not in their permission set)

1.20 WHEN a Teacher navigates to /students THEN the page correctly shows view-only mode (no "Add Student" button, no delete actions in context menu) because StudentListPage uses hasPermission('students', 'create') and hasPermission('students', 'delete') checks — BUT the hardcoded sidebar still shows links to /fees/structure (requires fees.create), /staff (requires hr module access), /admissions (requires admissions module access), and /settings (requires settings.update) that the Teacher has NO permission for

1.21 WHEN a Parent or Student role accesses /students THEN they can see the full student list showing ALL students in the institution instead of only their own profile (Student) or their child's profile (Parent) — the DataScope restriction (classes, sections) defined in the RBAC types is never enforced at the page or API query level

1.22 WHEN module routes are defined in App.tsx within the protected RouteGuard wrapper THEN the RouteGuard is used WITHOUT any permission props — it wraps all routes with only authentication checking (isAuthenticated), meaning ANY authenticated user can access ANY module route including /admin/*, /fees/structure, /staff, /settings regardless of their role or permissions

1.23 WHEN the fee module renders action buttons (Create Fee Structure, Collect Payment, Process Refund, Generate Receipt) THEN these buttons are shown to ALL authenticated users because the fee pages do NOT use usePermission() checks for action-level gating — unlike the student module which properly uses hasPermission('students', 'create') and hasPermission('students', 'delete')

### Expected Behavior (Correct)

2.1 WHEN a Super Admin logs in THEN the system SHALL route to /admin and the sidebar SHALL dynamically render from ConfigProvider's SUPER_ADMIN_NAVIGATION_ITEMS: Platform Management section (Tenants at /admin/tenants, Platform Analytics at /admin/analytics, Subscriptions at /admin/subscriptions) and a School Access section (School Dashboard at /dashboard, Students at /students, Fees at /fees, Reports at /reports, Settings at /settings)

2.2 WHEN an Accountant logs in THEN the system SHALL route to /fees and the sidebar SHALL display ONLY modules matching the Accountant's RBAC permissions from DEFAULT_ROLE_PERMISSIONS: Dashboard (financial overview), Students (view-only — link to /students but no /students/admission sub-link), Fees (full access with sub-navigation: Overview /fees, Structure /fees/structure, Payments /fees/payments, Defaulters /fees/defaulters, Analytics /fees/analytics, Collect /fees/make-payment), and Reports (/reports, view + export only). The sidebar SHALL NOT show: Staff, Library, Courses, Attendance mark, Exams, Timetable, Admissions, Transport, Settings (beyond personal), Admin, Documents, Workflows, or Calendar

2.3 WHEN a Teacher logs in THEN the system SHALL route to /dashboard and the sidebar SHALL display ONLY modules matching the Teacher's RBAC permissions: Dashboard, Students (/students — view-only, no admission sub-link, no bulk import/export), Attendance (/attendance — view + mark for assigned classes), Exams (/exams — view + edit + create for assigned subjects), Timetable (/timetable — view only), and Communication (/communication — view + create). The sidebar SHALL NOT show: Fees (any), Staff management, Library admin, Courses admin, Admissions, Transport, Reports export, Settings admin, Admin console, Documents, or Workflows

2.4 WHEN a Student logs in THEN the system SHALL route to /student-portal and the sidebar SHALL display a Student Portal navigation with view-only access: My Dashboard (/student-portal), My Academics (/exams — view only, own results), My Fees (/fees — view only, own payment history and pending), My Attendance (/attendance — view only, own record), Timetable (/timetable — view only), Library (/library — search/reserve), and Help (/help). ALL pages SHALL show only the student's own data. The sidebar SHALL NOT show any admin modules

2.5 WHEN a Parent logs in THEN the system SHALL route to /parent-portal and the sidebar SHALL display a Parent Portal navigation with view-only access: Children Dashboard (/parent-portal — with child switcher if multiple children), Fee Payments (/fees — view child's fees + make-payment), Academic Reports (/exams — view child's grades), Attendance Summary (/attendance — view child's attendance), Communication (/communication — view + create messages to teachers), and Calendar (/calendar — view events). ALL pages SHALL show only the parent's children's data. The sidebar SHALL NOT show any admin modules

2.6 WHEN a School Admin logs in THEN the system SHALL route to /dashboard and the sidebar SHALL dynamically render ALL tenant-level modules filtered by the tenant's enabled modules and feature flags, with full edit/create/delete access: Dashboard, Students (list + admission + profiles with full CRUD), Fees (all sub-pages with full CRUD), Attendance (mark + view + reports), Exams (schedule + grade + analytics), Timetable (create + edit), Staff (manage + payroll), Communication (all), Library (admin), Transport (/transport), Admissions Pipeline (/admissions), Courses (/courses), Documents (/documents), Workflows (/workflows), Calendar (/calendar), Reports (all + export), Settings (full), and Help

2.7 WHEN any user logs in THEN the sidebar component SHALL consume the navigation configuration generated by ConfigProvider (which already implements filtering by tenant modules, user role, user permissions, and feature flags) and SHALL NOT render any hardcoded static navigation structure — the existing ConfigProvider logic and RBAC engine SHALL drive all sidebar content

2.8 WHEN a Super Admin accesses the admin console THEN the system SHALL provide: (a) a Tenant Dashboard at /admin/tenants showing all tenants with status (active/suspended/trial/expired), plan tier, user count, last activity; (b) a "Register New Tenant" button launching an onboarding wizard (institution details → admin user → module selection → subscription plan → branding → confirmation); (c) per-tenant actions: manage configuration, suspend/activate, view usage, configure feature flags

2.9 WHEN any role logs in THEN the sidebar header SHALL display: the current tenant/institution name (from tenant config, NOT hardcoded), the current user's display name, and a color-coded role badge (Super Admin = red/critical, School Admin = blue/primary, Accountant = green/finance, Teacher = purple/academic, Staff = gray, Student = teal, Parent = orange)

2.10 WHEN a restricted user attempts to access a module they don't have permission for via direct URL THEN the system SHALL enforce RBAC at the route level by passing appropriate module/resource/roles props to RouteGuard for each module route in App.tsx — e.g., /admin/* SHALL require roles=['super_admin'], /fees/structure SHALL require resource='fees' action='create', /staff SHALL require module='hr', /settings SHALL require resource='settings' action='view'

2.11 WHEN a Super Admin views the Tenant Dashboard at /admin/tenants THEN the system SHALL display a table of all tenants with columns: Institution Name, Plan (Free/Basic/Pro/Enterprise), Status (active/suspended/trial/expired), Users, Storage, Last Active, and Actions (Manage, Suspend/Activate, Configure)

2.12 WHEN a Super Admin opens subscription management at /admin/subscriptions THEN the system SHALL display: plan definitions with feature matrices, per-tenant feature toggle controls (enable/disable individual modules per subscription tier), usage tracking against plan quotas, and upgrade/downgrade controls

2.13 WHEN the sidebar renders for any role THEN it SHALL show the actual tenant name and academic year from the loaded tenant configuration state (useAppStore tenant.current.name) rather than hardcoded "Sunrise Academy" and "Academic Year 2024-25"

2.14 WHEN individual route paths within a module are accessed THEN the system SHALL verify action-level permissions: /fees/structure SHALL require fees.create permission, /fees/make-payment SHALL require fees.collect permission, /fees/defaulters SHALL require fees.view permission, /students/admission SHALL require students.create permission, /fees/analytics SHALL require fees.analytics permission

2.15 WHEN a Student accesses fee-related pages THEN the system SHALL show ONLY: their own pending fees, their own payment history, and a view of their fee breakdown — the fee structure builder (/fees/structure), defaulter reports (/fees/defaulters), analytics (/fees/analytics), and make-payment-for-others (/fees/make-payment) SHALL NOT be accessible

2.16 WHEN a Parent accesses fee-related pages THEN the system SHALL show ONLY: their child's pending fees, payment history, and a "Make Payment" interface for their own child — NOT the fee structure builder, defaulter reports of all students, or analytics

2.17 WHEN the sidebar navigation is generated for School Admin THEN it SHALL include ALL registered module routes: Transport at /transport, Documents at /documents, Workflows at /workflows (with sub-path /workflows/approvals), Calendar at /calendar, Help at /help, and Admissions at /admissions (with sub-path /admissions/pipeline) — all of which are currently MISSING from the hardcoded sidebar

2.18 WHEN the user is operating in the Super Admin console (/admin/*) THEN the layout SHALL provide a visual distinction (e.g., different header accent color, "Platform Admin" mode badge in header, or distinct sidebar accent) to clearly differentiate it from the school-level interface

2.19 WHEN a Staff role logs in THEN the system SHALL route to /dashboard and the sidebar SHALL display ONLY: Dashboard, Students (/students — view only), Attendance (/attendance — view only), Fees (/fees — view only, own payment status), and Communication (/communication — view only). The Staff role SHALL NOT see: edit/create/delete actions on any page, sidebar links to Settings admin, Exams grade entry, Admissions, or Reports export

2.20 WHEN pages that already use usePermission() for action-level gating (StudentListPage, StudentProfilePage) are loaded by a role with view-only access THEN edit buttons SHALL remain disabled/hidden (preserving current behavior) AND additionally the sidebar SHALL NOT show links to sub-pages that require higher permissions (e.g., a Teacher seeing /students should NOT also see a sidebar sub-link to /students/admission which requires students.create)

2.21 WHEN fee module pages render action buttons (Create Fee Structure, Collect Payment, Process Refund, Generate Receipt, Edit Fee Category, Delete Fee Record) THEN each button SHALL be gated with usePermission() checks matching the RBAC engine's permission definitions — fees.create for structure creation, fees.collect for payment collection, fees.refund for refund processing, fees.delete for deletion, fees.view for read-only display

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a School Admin (principal@sunriseacademy.edu) logs in THEN the system SHALL CONTINUE TO route to /dashboard and provide access to all institution-level management features currently implemented (Student Management with CRUD, Fee Management with all sub-pages, all scaffolded modules)

3.2 WHEN any user clicks the Logout button in the sidebar THEN the system SHALL CONTINUE TO log out the user via sessionManager.logout(), clear the session from storage, and redirect to /login

3.3 WHEN the sidebar collapse/expand toggle is clicked THEN the system SHALL CONTINUE TO collapse or expand the sidebar with smooth CSS transitions, showing icon-only mode when collapsed with tooltip labels on hover

3.4 WHEN the login page is loaded THEN the system SHALL CONTINUE TO display the demo accounts quick-fill feature (DEMO_ACCOUNTS array with all 6 roles) allowing users to click any role and auto-fill email/password credentials

3.5 WHEN a user's session expires (token past expiresAt) THEN the system SHALL CONTINUE TO redirect to /login via the session-expired flow, preserving the current URL in location state for redirect after re-login

3.6 WHEN the MSW mock server processes a login request with valid credentials THEN the system SHALL CONTINUE TO authenticate against the mockUsers array (authenticateUser function matching email + password + isActive) and return the correct user object with id, email, name, role, tenantId, avatar, and permissions array for all 12 defined mock users across both tenants (Sunrise Academy and Metro University)

3.7 WHEN existing implemented module pages are accessed by an authorized user THEN the system SHALL CONTINUE TO render those pages with their current functionality intact — specifically: StudentListPage (with virtual scrolling, filters, permission-gated actions), StudentProfilePage (with tabbed layout, permission-gated edit), AdmissionFormPage, FeesOverviewPage, FeeStructurePage, PaymentHistoryPage, PaymentFormPage, DefaultersPage, AnalyticsPage, MakePaymentPage, DashboardPage, TenantManagementPage, PlatformAnalyticsPage, SubscriptionPage, and all scaffolded module pages

3.8 WHEN the command palette (Ctrl+K / Cmd+K) is activated THEN the system SHALL CONTINUE TO provide the CommandPalette global search functionality

3.9 WHEN the offline banner detects network disconnection THEN the system SHALL CONTINUE TO display the OfflineBanner notification

3.10 WHEN theme preferences are set THEN the system SHALL CONTINUE TO persist and apply theming correctly via ThemeProvider

3.11 WHEN the page header banner shows institution contact info (address, phone, email) THEN the system SHALL CONTINUE TO display this banner in the AppLayout main content area

3.12 WHEN route-level code splitting and lazy loading is used for module pages via React.lazy() THEN the system SHALL CONTINUE TO show Skeleton loading fallbacks during chunk loading

3.13 WHEN the StudentListPage is accessed by a user with students.create permission THEN the "Add Student" button SHALL CONTINUE TO appear, and WHEN accessed by a user without students.create permission THEN the button SHALL CONTINUE TO be hidden (existing usePermission behavior preserved)

3.14 WHEN the StudentProfilePage is accessed by a user with students.edit permission THEN the "Edit" button SHALL CONTINUE TO appear, and WHEN accessed without students.edit permission THEN the button SHALL CONTINUE TO be hidden

---

## Bug Condition (Formal Specification)

### Bug Condition Function

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type AuthenticatedSession { role: UserRole, permissions: Permission[], tenantId: string }
  OUTPUT: boolean

  // The bug manifests for ALL authenticated sessions because:
  // 1. The sidebar NEVER consumes ConfigProvider navigation (affects ALL roles)
  // 2. Post-login routing is incorrect for student and parent roles
  // 3. Super Admin pages exist but are inaccessible via navigation
  // 4. No route-level RBAC enforcement on any module paths in App.tsx
  // 5. No role/tenant context displayed in UI
  // 6. Fee module pages lack action-level permission gating
  // 7. Data scoping not enforced (students see all students, parents see all data)
  RETURN true
END FUNCTION
```

More specific sub-conditions:

```pascal
FUNCTION isRoutingBugCondition(X)
  INPUT: X of type AuthenticatedSession { role: UserRole }
  OUTPUT: boolean
  // ROLE_DASHBOARD_MAP sends students and parents to wrong page
  RETURN X.role ∈ { 'student', 'parent' }
END FUNCTION

FUNCTION isNavigationBugCondition(X)
  INPUT: X of type AuthenticatedSession { role: UserRole }
  OUTPUT: boolean
  // Sidebar is hardcoded for ALL roles — even school_admin has missing/extra items
  RETURN true
END FUNCTION

FUNCTION isAccessControlBugCondition(X, route)
  INPUT: X of type AuthenticatedSession, route of type string
  OUTPUT: boolean
  // URL-direct access isn't permission-gated because RouteGuard has no permission props
  RETURN NOT rbacEngine.hasModuleAccess(X.role, routeToModule(route))
END FUNCTION

FUNCTION isActionLevelBugCondition(X, page, action)
  INPUT: X of type AuthenticatedSession, page of type string, action of type ActionPermission
  OUTPUT: boolean
  // Fee module action buttons not gated (unlike Student module which IS gated)
  RETURN page.startsWith('/fees') AND NOT rbacEngine.hasPermission(X.role, 'fees', action).granted
END FUNCTION

FUNCTION isDataScopeBugCondition(X)
  INPUT: X of type AuthenticatedSession { role: UserRole, dataScope: DataScope }
  OUTPUT: boolean
  // Students/Parents see ALL students instead of scoped data
  RETURN X.role ∈ { 'student', 'parent' } AND X.accessingModule = 'students'
END FUNCTION
```

### Property Specification - Fix Checking

```pascal
// Property 1: Sidebar Navigation Matches RBAC Permissions
FOR ALL X WHERE isBugCondition(X) DO
  configNavItems ← ConfigProvider.generateNavigation(X.role, X.permissions, X.tenantModules, X.featureFlags)
  sidebarRenderedItems ← Sidebar.render(configNavItems)
  
  // Sidebar MUST render exactly what ConfigProvider generates (not hardcoded)
  ASSERT sidebarRenderedItems = configNavItems.items
  
  // Every rendered item MUST be permitted for this role
  FOR EACH item IN sidebarRenderedItems DO
    ASSERT rbacEngine.hasModuleAccess(X.role, item.moduleId) = true
  END FOR
  
  // No unpermitted modules appear in sidebar
  FOR EACH module IN ALL_MODULES WHERE NOT rbacEngine.hasModuleAccess(X.role, module) DO
    ASSERT module NOT IN sidebarRenderedItems
  END FOR
END FOR

// Property 2: Post-Login Route Matches Role
FOR ALL X DO
  route ← ROLE_DASHBOARD_MAP[X.role]
  ASSERT (X.role = 'super_admin') → (route = '/admin')
  ASSERT (X.role = 'school_admin') → (route = '/dashboard')
  ASSERT (X.role = 'accountant') → (route = '/fees')
  ASSERT (X.role = 'teacher') → (route = '/dashboard')
  ASSERT (X.role = 'staff') → (route = '/dashboard')
  ASSERT (X.role = 'student') → (route = '/student-portal')
  ASSERT (X.role = 'parent') → (route = '/parent-portal')
END FOR

// Property 3: URL-Direct Access Enforces Module RBAC
FOR ALL X, route WHERE NOT rbacEngine.hasModuleAccess(X.role, routeToModule(route)) DO
  result ← RouteGuard.evaluate(X, route)
  ASSERT result = REDIRECT_TO('/permission-denied')
END FOR

// Property 4: Action-Level Permission Gating on UI Elements
FOR ALL X, page, button WHERE button.requiredAction NOT IN rbacEngine.resolvePermissions(X.role) DO
  ASSERT button.isRendered = false OR button.isDisabled = true
END FOR

// Property 5: Super Admin Console Fully Accessible
FOR ALL X WHERE X.role = 'super_admin' DO
  nav ← Sidebar.getRenderedItems()
  ASSERT '/admin/tenants' reachable via nav
  ASSERT '/admin/analytics' reachable via nav
  ASSERT '/admin/subscriptions' reachable via nav
  ASSERT tenantRegistrationAction available in TenantManagementPage
END FOR

// Property 6: Role Context Displayed
FOR ALL X WHERE isAuthenticated(X) DO
  sidebar ← Sidebar.render()
  ASSERT sidebar.displaysTenantName(X.tenantConfig.name) AND NOT 'Sunrise Academy' hardcoded
  ASSERT sidebar.displaysUserName(X.user.name)
  ASSERT sidebar.displaysRoleBadge(X.role)
END FOR

// Property 7: Data Scoping for Self-Service Roles
FOR ALL X WHERE X.role ∈ { 'student', 'parent' } DO
  FOR EACH dataQuery IN X.session.queries DO
    ASSERT dataQuery.scope ⊆ X.allowedScope  // Only own data or child's data
  END FOR
END FOR
```

### Preservation Goal

```pascal
// Property: Preservation Checking - Existing Functionality Unchanged
FOR ALL X WHERE X.role = 'school_admin' DO
  ASSERT F'(X).dashboardRoute = '/dashboard'
  ASSERT F(X).modulePages ⊆ F'(X).modulePages  // All existing pages still accessible
  ASSERT F(X).logoutBehavior = F'(X).logoutBehavior
  ASSERT F(X).sidebarCollapse = F'(X).sidebarCollapse
  ASSERT F(X).commandPalette = F'(X).commandPalette
  ASSERT F(X).demoAccountsFill = F'(X).demoAccountsFill
END FOR

// Existing usePermission() behavior in StudentListPage and StudentProfilePage preserved
FOR ALL X, page IN { StudentListPage, StudentProfilePage } DO
  ASSERT F(page).actionButtonVisibility(X.role) = F'(page).actionButtonVisibility(X.role)
END FOR

// All module page implementations render identically
FOR ALL module IN implementedModules DO
  FOR ALL page IN module.pages DO
    ASSERT F(page).render() = F'(page).render()  // Page content unchanged
    ASSERT F(page).lazyLoading = F'(page).lazyLoading  // Code splitting preserved
  END FOR
END FOR

// Mock server behavior unchanged
FOR ALL credentials IN validMockCredentials DO
  ASSERT F(login(credentials)).user = F'(login(credentials)).user
  ASSERT F(login(credentials)).permissions = F'(login(credentials)).permissions
  ASSERT F(login(credentials)).tenantId = F'(login(credentials)).tenantId
END FOR
```
