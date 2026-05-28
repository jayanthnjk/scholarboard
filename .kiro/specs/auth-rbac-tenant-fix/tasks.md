# Implementation Plan

## Overview

This plan fixes multiple RBAC and multi-tenant defects in the education ERP platform. The sidebar renders hardcoded navigation instead of ConfigProvider-generated RBAC-filtered navigation, post-login routing sends Students/Parents to wrong pages, RouteGuard lacks permission props, fee module pages lack action-level permission gating, Super Admin console pages are unreachable via navigation, and no role/tenant context is displayed. The fix wires existing RBAC infrastructure into the UI layer.

## Tasks

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - RBAC Navigation and Access Control Defects
  - **IMPORTANT**: Write this property-based test BEFORE implementing the fix
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the multiple RBAC bugs exist
  - **Scoped PBT Approach**: Scope the property to concrete failing cases for each sub-condition:
    - Sub-condition 1 (Navigation): Render Sidebar for any role → assert rendered items match ConfigProvider output (not hardcoded SECTIONS)
    - Sub-condition 2 (Routing): Simulate Student login → assert redirect to `/student-portal`; simulate Parent login → assert redirect to `/parent-portal`
    - Sub-condition 3 (Route Access): Render `/fees/structure` as Teacher role → assert redirect to `/permission-denied`
    - Sub-condition 4 (Action Gating): Render FeeStructurePage as Teacher → assert "Create Fee Structure" button not visible
    - Sub-condition 5 (Super Admin Nav): Render Sidebar for super_admin → assert contains `/admin/tenants`, `/admin/analytics`, `/admin/subscriptions`
    - Sub-condition 6 (Context Display): Render Sidebar → assert tenant name is dynamic (not hardcoded "Sunrise Academy"), role badge displayed
  - Test assertions match Expected Behavior Properties from design (Properties 1-6)
  - isBugCondition(X) returns true for ALL authenticated sessions because sidebar never consumes ConfigProvider navigation
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bugs exist)
  - Document counterexamples found:
    - Sidebar renders same 13 hardcoded items regardless of role
    - Student/Parent users land on `/dashboard` instead of portal pages
    - Teacher can access `/fees/structure` URL without being blocked
    - Fee pages render all action buttons without permission checks
    - Super Admin sidebar shows school navigation instead of platform management
    - Hardcoded "Sunrise Academy" text present instead of dynamic tenant name
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.9, 1.10, 1.14, 1.22, 1.23_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing School Admin and Permission Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - **Observe on UNFIXED code**:
    - School Admin login routes to `/dashboard` (correct behavior to preserve)
    - Sidebar collapse/expand toggle works with CSS transitions and icon-only mode
    - Logout button calls sessionManager.logout(), clears session, redirects to `/login`
    - Demo accounts quick-fill on login page populates credentials for all 6 roles
    - StudentListPage hides "Add Student" button when user lacks `students.create` permission
    - StudentProfilePage hides "Edit" button when user lacks `students.edit` permission
    - Command palette (Ctrl+K / Cmd+K) activates CommandPalette
    - Route-level code splitting with React.lazy() shows Skeleton fallbacks
    - Session expiry redirects to `/login` preserving URL in location state
    - MSW mock server returns correct user objects for valid credentials
  - Write property-based tests capturing observed behavior patterns:
    - For all School Admin sessions: login routes to `/dashboard` AND all institution module pages remain accessible
    - For all roles with `students.create` permission: "Add Student" button visible on StudentListPage
    - For all roles without `students.create` permission: "Add Student" button hidden on StudentListPage
    - For all roles with `students.edit` permission: "Edit" button visible on StudentProfilePage
    - For all roles without `students.edit` permission: "Edit" button hidden on StudentProfilePage
    - Sidebar collapse state toggles correctly regardless of role
    - Logout flow clears session and redirects for all roles
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14_

- [ ] 3. Fix RBAC navigation, routing, and access control defects

  - [ ] 3.1 Fix ROLE_DASHBOARD_MAP in AuthProvider
    - In `src/providers/AuthProvider.tsx`, change `student: '/dashboard'` to `student: '/student-portal'`
    - Change `parent: '/dashboard'` to `parent: '/parent-portal'`
    - _Bug_Condition: isRoutingBugCondition(X) where X.role ∈ { 'student', 'parent' }_
    - _Expected_Behavior: ROLE_DASHBOARD_MAP['student'] = '/student-portal', ROLE_DASHBOARD_MAP['parent'] = '/parent-portal'_
    - _Preservation: School Admin, Accountant, Teacher, Staff, Super Admin routes unchanged_
    - _Requirements: 2.4, 2.5, 1.4, 1.5, 1.18_

  - [ ] 3.2 Add role-based navigation filtering to ConfigProvider
    - In `src/providers/ConfigProvider.tsx`, enhance `filterItems` to filter based on role-specific module access
    - Define `STUDENT_NAVIGATION_ITEMS` with student portal paths (My Dashboard, My Academics, My Fees, My Attendance, Timetable, Library, Help)
    - Define `PARENT_NAVIGATION_ITEMS` with parent portal paths (Children Dashboard, Fee Payments, Academic Reports, Attendance Summary, Communication, Calendar)
    - Add role→module mapping to restrict Teacher to (students view, attendance, exams, timetable, communication)
    - Add role→module mapping to restrict Accountant to (dashboard, students view, fees full, reports)
    - Add role→module mapping to restrict Staff to (dashboard, students view, attendance view, fees view, communication view)
    - Add sub-navigation children to fee items filtered by action permissions
    - _Bug_Condition: isNavigationBugCondition(X) — ConfigProvider generates correct items but lacks role-specific filtering_
    - _Expected_Behavior: ConfigProvider.generateNavigation(role, permissions, tenantModules) returns only permitted items per role_
    - _Preservation: School Admin navigation includes all tenant-level modules; Super Admin navigation unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.17, 2.19, 2.20_

  - [ ] 3.3 Refactor Sidebar to accept dynamic navigation props
    - In `src/components/layout/sidebar.tsx`, remove the hardcoded `SECTIONS` constant
    - Add `navigationItems: NavigationItem[]` prop to Sidebar component
    - Render navigation by mapping over `navigationItems` with icon resolution from lookup map
    - Replace hardcoded "Sunrise Academy" with `tenantName` prop (read from tenant config)
    - Add `userRole` prop for color-coded role badge display (super_admin=red, school_admin=blue, accountant=green, teacher=purple, staff=gray, student=teal, parent=orange)
    - Display `userName` prominently in sidebar header
    - Add "Platform Admin" mode indicator when path starts with `/admin/`
    - _Bug_Condition: isNavigationBugCondition(X) — sidebar renders static SECTIONS instead of dynamic navigation_
    - _Expected_Behavior: Sidebar.render(configNavItems) displays exactly configNavItems (no hardcoded items)_
    - _Preservation: Sidebar collapse/expand toggle, logout button, CSS transitions, icon-only mode all preserved_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.9, 2.13, 2.17, 2.18, 3.2, 3.3_

  - [ ] 3.4 Wire ConfigProvider navigation to Sidebar in App.tsx
    - In `src/App.tsx` AppLayout function, replace unused `_nav` with active `navigation` from `useConfig()`
    - Pass `navigation.items` as `navigationItems` prop to Sidebar
    - Pass tenant name from `useAppStore` as `tenantName` prop
    - Pass `user.role` as `userRole` prop
    - Pass `user.name` as `userName` prop
    - _Bug_Condition: AppLayout destructures navigation as _nav (unused) — sidebar never receives dynamic items_
    - _Expected_Behavior: Sidebar receives ConfigProvider-generated navigation and renders it_
    - _Preservation: AppLayout structure, ErrorBoundary wrapping, Suspense fallbacks unchanged_
    - _Requirements: 2.7, 2.9, 2.13_

  - [ ] 3.5 Add per-module RouteGuard wrappers in App.tsx
    - Wrap `/admin/*` routes with `<RouteGuard roles={['super_admin']}>`
    - Wrap `/fees` with `<RouteGuard module="fees">`
    - Wrap `/fees/structure` with `<RouteGuard resource="fees" action="create">`
    - Wrap `/fees/make-payment` with `<RouteGuard resource="fees" action="collect">`
    - Wrap `/staff` with `<RouteGuard module="hr">`
    - Wrap `/settings` with `<RouteGuard resource="settings" action="view">`
    - Wrap `/students/admission` with `<RouteGuard resource="students" action="create">`
    - Wrap `/admissions` with `<RouteGuard module="admissions">`
    - Wrap `/transport` with `<RouteGuard module="transport">`
    - Wrap `/library` with `<RouteGuard module="library">`
    - Wrap `/exams` with `<RouteGuard module="exams">`
    - Wrap `/attendance` with `<RouteGuard module="attendance">`
    - Wrap `/timetable` with `<RouteGuard module="timetable">`
    - Wrap `/communication` with `<RouteGuard module="communication">`
    - Wrap `/reports` with `<RouteGuard module="reports">`
    - Wrap `/documents` with `<RouteGuard module="documents">`
    - Wrap `/workflows` with `<RouteGuard module="workflows">`
    - _Bug_Condition: isAccessControlBugCondition(X, route) — RouteGuard used without permission props_
    - _Expected_Behavior: RouteGuard redirects to /permission-denied when role lacks module/action access_
    - _Preservation: School Admin has all module access so existing behavior unchanged; authentication-only check still applies first_
    - _Requirements: 2.10, 2.14, 2.22, 1.10, 1.14_

  - [ ] 3.6 Add usePermission checks to fee module action buttons
    - In fee module pages (`src/modules/fees/pages/*.tsx`):
      - Gate "Create Fee Structure" button with `hasPermission('fees', 'create')`
      - Gate "Collect Payment" button with `hasPermission('fees', 'collect')`
      - Gate "Process Refund" button with `hasPermission('fees', 'refund')`
      - Gate "Generate Receipt" / "Delete" buttons with `hasPermission('fees', 'delete')`
      - Gate "Edit Fee Category" with `hasPermission('fees', 'edit')`
    - _Bug_Condition: isActionLevelBugCondition(X, '/fees/*', action) — fee pages render all buttons without permission checks_
    - _Expected_Behavior: button.isRendered = hasPermission(X.role, button.requiredPermission)_
    - _Preservation: Page rendering, fee data display, read-only views unchanged; pattern matches existing StudentListPage approach_
    - _Requirements: 2.21, 2.23, 1.23_

  - [ ] 3.7 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - RBAC Navigation and Access Control Fixed
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied:
      - Sidebar renders ConfigProvider-generated navigation per role
      - Student routes to `/student-portal`, Parent routes to `/parent-portal`
      - Unauthorized route access redirects to `/permission-denied`
      - Fee action buttons hidden without permission
      - Super Admin sidebar shows platform management navigation
      - Dynamic tenant name and role badge displayed
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.9, 2.10, 2.13, 2.14, 2.21_

  - [ ] 3.8 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing School Admin and Permission Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix:
      - School Admin routes to `/dashboard` with full module access
      - Sidebar collapse/expand works
      - Logout flow unchanged
      - Demo accounts work
      - StudentListPage/StudentProfilePage permission gating unchanged
      - Command palette functional
      - Code splitting with Skeleton fallbacks intact
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Run full test suite to confirm all property-based tests, unit tests, and integration tests pass
  - Verify no TypeScript compilation errors
  - Verify no ESLint violations introduced
  - Ensure all tests pass, ask the user if questions arise.

## Task Dependency Graph

```json
{
  "waves": [
    ["1", "2"],
    ["3.1", "3.2"],
    ["3.3"],
    ["3.4", "3.5", "3.6"],
    ["3.7"],
    ["3.8"],
    ["4"]
  ]
}
```

## Notes

- The exploration test (task 1) and preservation test (task 2) MUST be written and run BEFORE any implementation changes
- Task 1 is expected to FAIL on unfixed code — this confirms the bugs exist
- Task 2 is expected to PASS on unfixed code — this captures baseline behavior to preserve
- Implementation tasks (3.1-3.6) can be partially parallelized but have logical dependencies (ConfigProvider filtering before Sidebar refactor, Sidebar refactor before wiring in App.tsx)
- Tasks 3.7 and 3.8 re-run the SAME tests from tasks 1 and 2 — no new tests are written
- The fix follows an observation-first methodology: understand before fixing, preserve before changing
