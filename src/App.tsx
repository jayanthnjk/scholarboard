/**
 * Main Application Component.
 * Sets up providers, routing, layout shell, and MSW mock server.
 */

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProviders } from '@/providers/AppProviders';
import { RouteGuard } from '@/components/RouteGuard';
import { CommandPalette } from '@/components/command-palette/CommandPalette';

// Auth pages (not lazy - needed immediately)
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { PermissionDeniedPage } from '@/modules/auth/pages/PermissionDeniedPage';

// Route definitions
import { dashboardRoutes } from '@/modules/dashboard/routes';
// Student routes rendered inline with per-page RouteGuard wrappers (see AppRoutes)
// Fee routes rendered inline with per-page RouteGuard wrappers (see AppRoutes)
import { attendanceRoutes } from '@/modules/attendance/routes';
import { examRoutes } from '@/modules/exams/routes';
import { timetableRoutes } from '@/modules/timetable/routes';
import { staffRoutes } from '@/modules/staff/routes';
import { communicationRoutes } from '@/modules/communication/routes';
import { libraryRoutes } from '@/modules/library/routes';
import { transportRoutes } from '@/modules/transport/routes';
import { reportRoutes } from '@/modules/reports/routes';
import { settingsRoutes } from '@/modules/settings/routes';
import { admissionRoutes } from '@/modules/admissions/routes';
import { coursesRoutes } from '@/modules/courses/routes';
import { adminRoutes } from '@/modules/admin/routes';
import { parentPortalRoutes } from '@/modules/parent-portal/routes';
import { studentPortalRoutes } from '@/modules/student-portal/routes';
import { calendarRoutes } from '@/modules/calendar/routes';
import { workflowRoutes } from '@/modules/workflows/routes';
import { documentRoutes } from '@/modules/documents/routes';
import { helpRoutes } from '@/modules/help/routes';

// Layout
import { Sidebar } from '@/components/layout/sidebar';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useConfig } from '@/providers/ConfigProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useAppStore } from '@/store';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { GraduationCap } from 'lucide-react'; // Used in banner conditionally
void GraduationCap;

// --- MSW Initialization ---

async function initMockServer(): Promise<void> {
  if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === 'true') {
    const { startMockServer } = await import('@/mock');
    await startMockServer({ quiet: false });
  }
}

// --- Layout Shell ---

function AppLayout(): React.JSX.Element {
  const { navigation } = useConfig();
  const { user, logout } = useAuth();
  const tenantName = useAppStore((s) => s.tenant.current?.name) ?? '';
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Determine active nav item from current URL path
  const activeItemId = React.useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/calendar')) return 'calendar';
    if (path.startsWith('/communication')) return 'communication';
    if (path.startsWith('/admissions')) return 'admissions';
    if (path.startsWith('/students')) return 'students';
    if (path.startsWith('/library')) return 'library';
    if (path.startsWith('/courses')) return 'courses';
    if (path.startsWith('/staff')) return 'staff';
    if (path.startsWith('/exams')) return 'exams';
    if (path.startsWith('/fees')) return 'fees';
    if (path.startsWith('/attendance')) return 'attendance';
    if (path.startsWith('/timetable')) return 'timetable';
    if (path.startsWith('/help')) return 'help';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/admin')) return 'admin-tenants';
    return 'dashboard';
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Full-width Top Bar */}
      <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-[#1B1D3A] to-[#2D2B55] px-6 py-2.5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white hidden sm:block">ScholarBoard</span>
          </div>
        </div>
        <div className="flex items-center gap-5 text-[10px] text-white/60">
          <span className="hidden md:inline">📍 123 Education Lane, Bangalore 560001</span>
          <span className="hidden sm:inline">📞 +91 80 2345 6789</span>
          <span className="hidden lg:inline">✉️ info@sunriseacademy.edu</span>
          <span className="text-white/30">|</span>
          {/* Profile Dropdown */}
          <div className="relative">
            <button type="button" onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/10 transition-colors">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white text-[11px] font-bold">{(user?.name ?? 'U').charAt(0)}</div>
              <span className="text-white/90 text-[11px] font-medium hidden sm:block">{user?.name ?? 'User'}</span>
              <span className="text-white/50 text-[9px]">▼</span>
            </button>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg bg-white shadow-lg border border-[#ECEDF3] py-1">
                  <button type="button" onClick={() => { setShowProfileMenu(false); navigate('/settings'); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#1B1D3A] hover:bg-[#F5F6FA] transition-colors">
                    👤 My Profile
                  </button>
                  <button type="button" onClick={() => { setShowProfileMenu(false); navigate('/help'); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#1B1D3A] hover:bg-[#F5F6FA] transition-colors">
                    💬 Help & Support
                  </button>
                  <div className="border-t border-[#ECEDF3] my-1" />
                  <button type="button" onClick={() => { setShowProfileMenu(false); logout(); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    🚪 Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          navigationItems={navigation.items}
          tenantName={tenantName}
          userRole={user?.role ?? ''}
          userName={user?.name}
          activeItemId={activeItemId}
          onNavigate={(path) => navigate(path)}
          onLogout={logout}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-[#F5F6FA]">
            <React.Suspense fallback={<div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#363473]" /></div>}>
              <Outlet />
            </React.Suspense>
          </main>
        </div>
      </div>

      {/* Full-width Footer (spans sidebar + content) */}
      <footer className="shrink-0 border-t border-[#ECEDF3] bg-gradient-to-r from-[#1B1D3A] to-[#2D2B55] px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-white/10"><GraduationCap className="h-3 w-3 text-white/70" /></div>
            <span className="text-[10px] text-white/50">© 2026 ScholarBoard Technologies</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-white/40">
            <span className="hover:text-white/70 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white/70 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white/70 cursor-pointer transition-colors">Support</span>
            <span className="text-white/20">|</span>
            <span className="text-white/30">v1.0.0</span>
          </div>
        </div>
      </footer>
      <CommandPalette />
      <OfflineBanner />
    </div>
  );
}

// --- Helper to render route objects ---

function renderRouteObjects(routes: RouteObject[]): React.ReactNode {
  return routes.map((route, index) => {
    const key = route.path ?? `index-${index}`;
    if (route.children) {
      return (
        <Route key={key} path={route.path} element={route.element}>
          {route.children.map((child, childIndex) => {
            if (child.index) {
              return <Route key={`index-${childIndex}`} index element={child.element} />;
            }
            return <Route key={child.path ?? childIndex} path={child.path} element={child.element} />;
          })}
        </Route>
      );
    }
    if (route.index) {
      return <Route key={key} index element={route.element} />;
    }
    return <Route key={key} path={route.path} element={route.element} />;
  });
}

// --- App Root ---

function AppRoutes(): React.JSX.Element {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/permission-denied" element={<PermissionDeniedPage />} />

      {/* Protected routes with layout */}
      <Route
        element={
          <RouteGuard>
            <AppLayout />
          </RouteGuard>
        }
      >
        {/* Default redirect */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Module routes with per-module RouteGuard wrappers */}
        {renderRouteObjects(dashboardRoutes)}

        {/* Student routes - admission page needs create permission */}
        <Route path="students">
          <Route index element={React.createElement(React.lazy(() => import('@/modules/students/pages/StudentListPage').then((m) => ({ default: m.StudentListPage }))))} />
          <Route path=":id" element={React.createElement(React.lazy(() => import('@/modules/students/pages/StudentProfilePage').then((m) => ({ default: m.StudentProfilePage }))))} />
        </Route>
        <Route element={<RouteGuard resource="students" action="create"><Outlet /></RouteGuard>}>
          <Route path="students/admission" element={React.createElement(React.lazy(() => import('@/modules/students/pages/AdmissionFormPage').then((m) => ({ default: m.AdmissionFormPage }))))} />
        </Route>

        {/* Fee module routes - module-level guard plus action-level guards for specific pages */}
        <Route element={<RouteGuard module="fees"><Outlet /></RouteGuard>}>
          <Route path="fees">
            <Route index element={React.createElement(React.lazy(() => import('@/modules/fees/pages/FeesOverviewPage').then((m) => ({ default: m.FeesOverviewPage }))))} />
            <Route path="payments" element={React.createElement(React.lazy(() => import('@/modules/fees/pages/PaymentHistoryPage').then((m) => ({ default: m.PaymentHistoryPage }))))} />
            <Route path="payments/new" element={React.createElement(React.lazy(() => import('@/modules/fees/pages/PaymentFormPage').then((m) => ({ default: m.PaymentFormPage }))))} />
            <Route path="defaulters" element={React.createElement(React.lazy(() => import('@/modules/fees/pages/DefaultersPage').then((m) => ({ default: m.DefaultersPage }))))} />
            <Route path="analytics" element={React.createElement(React.lazy(() => import('@/modules/fees/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))))} />
          </Route>
        </Route>
        <Route element={<RouteGuard resource="fees" action="create"><Outlet /></RouteGuard>}>
          <Route path="fees/structure" element={React.createElement(React.lazy(() => import('@/modules/fees/pages/FeeStructurePage').then((m) => ({ default: m.FeeStructurePage }))))} />
        </Route>
        <Route element={<RouteGuard resource="fees" action="collect"><Outlet /></RouteGuard>}>
          <Route path="fees/make-payment" element={React.createElement(React.lazy(() => import('@/modules/fees/pages/MakePaymentPage').then((m) => ({ default: m.MakePaymentPage }))))} />
        </Route>

        {/* Attendance module */}
        <Route element={<RouteGuard module="attendance"><Outlet /></RouteGuard>}>
          {renderRouteObjects(attendanceRoutes)}
        </Route>

        {/* Exams module */}
        <Route element={<RouteGuard module="exams"><Outlet /></RouteGuard>}>
          {renderRouteObjects(examRoutes)}
        </Route>

        {/* Timetable module */}
        <Route element={<RouteGuard module="timetable"><Outlet /></RouteGuard>}>
          {renderRouteObjects(timetableRoutes)}
        </Route>

        {/* Staff/HR module */}
        <Route element={<RouteGuard module="hr"><Outlet /></RouteGuard>}>
          {renderRouteObjects(staffRoutes)}
        </Route>

        {/* Communication module */}
        <Route element={<RouteGuard module="communication"><Outlet /></RouteGuard>}>
          {renderRouteObjects(communicationRoutes)}
        </Route>

        {/* Library module */}
        <Route element={<RouteGuard module="library"><Outlet /></RouteGuard>}>
          {renderRouteObjects(libraryRoutes)}
        </Route>

        {/* Transport module */}
        <Route element={<RouteGuard module="transport"><Outlet /></RouteGuard>}>
          {renderRouteObjects(transportRoutes)}
        </Route>

        {/* Reports module */}
        <Route element={<RouteGuard module="reports"><Outlet /></RouteGuard>}>
          {renderRouteObjects(reportRoutes)}
        </Route>

        {/* Settings - resource/action level */}
        <Route element={<RouteGuard resource="settings" action="view"><Outlet /></RouteGuard>}>
          {renderRouteObjects(settingsRoutes)}
        </Route>

        {/* Admissions module */}
        <Route element={<RouteGuard module="admissions"><Outlet /></RouteGuard>}>
          {renderRouteObjects(admissionRoutes)}
        </Route>

        {renderRouteObjects(coursesRoutes)}

        {/* Admin routes - super_admin only */}
        <Route element={<RouteGuard roles={['super_admin']}><Outlet /></RouteGuard>}>
          {renderRouteObjects(adminRoutes)}
        </Route>

        {renderRouteObjects(parentPortalRoutes)}
        {renderRouteObjects(studentPortalRoutes)}
        {renderRouteObjects(calendarRoutes)}

        {/* Workflows module */}
        <Route element={<RouteGuard module="workflows"><Outlet /></RouteGuard>}>
          {renderRouteObjects(workflowRoutes)}
        </Route>

        {/* Documents module */}
        <Route element={<RouteGuard module="documents"><Outlet /></RouteGuard>}>
          {renderRouteObjects(documentRoutes)}
        </Route>

        {renderRouteObjects(helpRoutes)}
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App(): React.JSX.Element {
  const [mswReady, setMswReady] = useState(
    !(import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === 'true')
  );

  useEffect(() => {
    if (!mswReady) {
      initMockServer().then(() => setMswReady(true)).catch(() => setMswReady(true));
    }
  }, [mswReady]);

  if (!mswReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
