/**
 * Settings Module - Full implementation with sections for institution config,
 * academic year, roles, notifications, appearance, backup, and integrations.
 */

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2, GraduationCap, Shield, Bell, Palette, Database,
  Plug, Save, RotateCcw, Check, Plus, Trash2,
} from 'lucide-react';

// --- Types ---

type SectionKey = 'general' | 'academic' | 'roles' | 'notifications' | 'appearance' | 'backup' | 'integrations';

interface Role {
  id: string; name: string; description: string; permissions: string[]; userCount: number;
}

interface Integration {
  id: string; name: string; description: string; enabled: boolean; status: 'connected' | 'disconnected' | 'error';
}

// --- Initial Data ---

const INITIAL_GENERAL = {
  institutionName: 'Sunrise Academy',
  shortName: 'SA',
  email: 'info@sunriseacademy.edu',
  phone: '+91 80 2345 6789',
  address: '123 Education Lane, Bangalore 560001',
  website: 'www.sunriseacademy.edu',
  principalName: 'Dr. Sharma',
  establishedYear: '1995',
  affiliationBoard: 'Telangana State Board of Intermediate Education',
  affiliationNumber: 'TSBIE/2024/SA-001',
};

const INITIAL_ACADEMIC = {
  currentYear: '2024-2025',
  startDate: '2024-06-10',
  endDate: '2025-04-30',
  terms: [
    { id: 't1', name: 'Term 1', start: '2024-06-10', end: '2024-09-30' },
    { id: 't2', name: 'Term 2', start: '2024-10-01', end: '2024-12-31' },
    { id: 't3', name: 'Term 3', start: '2025-01-02', end: '2025-04-30' },
  ],
  workingDaysPerWeek: '6',
  classTimings: '8:30 AM - 4:00 PM',
  examPattern: 'Quarterly + Half-Yearly + Annual',
};

const INITIAL_ROLES: Role[] = [
  { id: 'r1', name: 'Super Admin', description: 'Full system access', permissions: ['all'], userCount: 1 },
  { id: 'r2', name: 'Admin', description: 'Manage students, staff, fees, exams', permissions: ['students', 'staff', 'fees', 'exams', 'reports', 'communication'], userCount: 3 },
  { id: 'r3', name: 'Faculty', description: 'View students, manage attendance & marks', permissions: ['students.view', 'attendance', 'exams.marks', 'communication'], userCount: 12 },
  { id: 'r4', name: 'Accountant', description: 'Manage fees and financial records', permissions: ['fees', 'reports.financial'], userCount: 2 },
  { id: 'r5', name: 'Librarian', description: 'Manage library books and issues', permissions: ['library'], userCount: 1 },
  { id: 'r6', name: 'Parent', description: 'View child progress, fees, attendance', permissions: ['students.view.own', 'fees.view.own', 'attendance.view.own', 'communication.view'], userCount: 450 },
  { id: 'r7', name: 'Student', description: 'View own records', permissions: ['profile.view', 'attendance.view.own', 'exams.view.own', 'library.view'], userCount: 695 },
];

const INITIAL_NOTIFICATIONS = {
  emailEnabled: true,
  smsEnabled: true,
  pushEnabled: false,
  feeReminders: true,
  attendanceAlerts: true,
  examNotifications: true,
  announcementAlerts: true,
  parentUpdates: true,
  staffLeaveAlerts: true,
  lowAttendanceThreshold: '75',
  feeReminderDaysBefore: '7',
  smsProvider: 'MSG91',
  emailProvider: 'SendGrid',
};

const INITIAL_APPEARANCE = {
  primaryColor: '#363473',
  accentColor: '#6366F1',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  sidebarStyle: 'compact' as 'compact' | 'expanded',
  theme: 'light' as 'light' | 'dark' | 'system',
  dateFormat: 'DD-MM-YYYY',
  currency: 'INR',
  language: 'English',
  timezone: 'Asia/Kolkata',
};

const INITIAL_INTEGRATIONS: Integration[] = [
  { id: 'i1', name: 'SMS Gateway (MSG91)', description: 'Send SMS notifications to parents and staff', enabled: true, status: 'connected' },
  { id: 'i2', name: 'Email Service (SendGrid)', description: 'Transactional and bulk email delivery', enabled: true, status: 'connected' },
  { id: 'i3', name: 'Payment Gateway (Razorpay)', description: 'Online fee payment processing', enabled: true, status: 'connected' },
  { id: 'i4', name: 'Google Workspace', description: 'Google Classroom and Drive integration', enabled: false, status: 'disconnected' },
  { id: 'i5', name: 'Biometric Attendance', description: 'Hardware integration for attendance tracking', enabled: true, status: 'connected' },
  { id: 'i6', name: 'WhatsApp Business API', description: 'Send notifications via WhatsApp', enabled: false, status: 'disconnected' },
  { id: 'i7', name: 'Tally ERP', description: 'Accounting software sync', enabled: false, status: 'error' },
];

// --- Component ---

export function SettingsPage(): React.JSX.Element {
  const [activeSection, setActiveSection] = useState<SectionKey>('general');
  const [general, setGeneral] = useState(INITIAL_GENERAL);
  const [academic, setAcademic] = useState(INITIAL_ACADEMIC);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [appearance, setAppearance] = useState(INITIAL_APPEARANCE);
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [saved, setSaved] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  function handleSave(): void {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleAddRole(): void {
    if (!newRole.name.trim()) return;
    const role: Role = { id: `r${Date.now()}`, name: newRole.name.trim(), description: newRole.description.trim(), permissions: [], userCount: 0 };
    setRoles((prev) => [...prev, role]);
    setNewRole({ name: '', description: '' });
    setShowAddRole(false);
  }

  function handleDeleteRole(id: string): void {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  }

  function handleToggleIntegration(id: string): void {
    setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, enabled: !i.enabled, status: !i.enabled ? 'connected' : 'disconnected' } : i));
  }

  const sections: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
    { key: 'general', label: 'Institution', icon: <Building2 className="h-4 w-4" /> },
    { key: 'academic', label: 'Academic Year', icon: <GraduationCap className="h-4 w-4" /> },
    { key: 'roles', label: 'Roles & Permissions', icon: <Shield className="h-4 w-4" /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { key: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
    { key: 'backup', label: 'Backup & Data', icon: <Database className="h-4 w-4" /> },
    { key: 'integrations', label: 'Integrations', icon: <Plug className="h-4 w-4" /> },
  ];

  return (
    <PageContent>
      <PageHeader title="Settings" subtitle="Configure your institution and application preferences." breadcrumbs={[{ label: 'Home' }, { label: 'Settings' }]} />

      <div className="mt-6 flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-[200px] shrink-0">
          <nav className="space-y-1">
            {sections.map((s) => (
              <button key={s.key} type="button" onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${activeSection === s.key ? 'bg-[#363473] text-white' : 'text-[#6E7191] hover:bg-[#F5F6FA] hover:text-[#1B1D3A]'}`}>
                {s.icon} {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>

              {/* General / Institution */}
              {activeSection === 'general' && (
                <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6">
                  <h3 className="text-base font-semibold text-[#1B1D3A] mb-5">Institution Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Institution Name</label><input type="text" value={general.institutionName} onChange={(e) => setGeneral({ ...general, institutionName: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Short Name</label><input type="text" value={general.shortName} onChange={(e) => setGeneral({ ...general, shortName: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Email</label><input type="email" value={general.email} onChange={(e) => setGeneral({ ...general, email: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Phone</label><input type="tel" value={general.phone} onChange={(e) => setGeneral({ ...general, phone: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Address</label><input type="text" value={general.address} onChange={(e) => setGeneral({ ...general, address: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Website</label><input type="url" value={general.website} onChange={(e) => setGeneral({ ...general, website: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Principal Name</label><input type="text" value={general.principalName} onChange={(e) => setGeneral({ ...general, principalName: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Established Year</label><input type="text" value={general.establishedYear} onChange={(e) => setGeneral({ ...general, establishedYear: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Affiliation Board</label><input type="text" value={general.affiliationBoard} onChange={(e) => setGeneral({ ...general, affiliationBoard: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Affiliation Number</label><input type="text" value={general.affiliationNumber} onChange={(e) => setGeneral({ ...general, affiliationNumber: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                  </div>
                </div>
              )}

              {/* Academic Year */}
              {activeSection === 'academic' && (
                <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6">
                  <h3 className="text-base font-semibold text-[#1B1D3A] mb-5">Academic Year Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Current Academic Year</label><input type="text" value={academic.currentYear} onChange={(e) => setAcademic({ ...academic, currentYear: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Working Days/Week</label><input type="text" value={academic.workingDaysPerWeek} onChange={(e) => setAcademic({ ...academic, workingDaysPerWeek: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Start Date</label><input type="date" value={academic.startDate} onChange={(e) => setAcademic({ ...academic, startDate: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">End Date</label><input type="date" value={academic.endDate} onChange={(e) => setAcademic({ ...academic, endDate: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Class Timings</label><input type="text" value={academic.classTimings} onChange={(e) => setAcademic({ ...academic, classTimings: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Exam Pattern</label><input type="text" value={academic.examPattern} onChange={(e) => setAcademic({ ...academic, examPattern: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                  </div>
                  <h4 className="text-sm font-semibold text-[#1B1D3A] mb-3">Terms</h4>
                  <div className="space-y-2">
                    {academic.terms.map((term) => (
                      <div key={term.id} className="flex items-center gap-3 rounded-lg border border-[#ECEDF3] p-3">
                        <span className="text-sm font-medium text-[#1B1D3A] w-[80px]">{term.name}</span>
                        <span className="text-sm text-[#6E7191]">{term.start} → {term.end}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Roles & Permissions */}
              {activeSection === 'roles' && (
                <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-semibold text-[#1B1D3A]">Roles & Permissions</h3>
                    <button type="button" onClick={() => setShowAddRole(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-3 py-2 text-xs font-medium text-white hover:bg-[#1B1D3A] transition-colors"><Plus className="h-3.5 w-3.5" /> Add Role</button>
                  </div>
                  <div className="space-y-3">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center justify-between rounded-lg border border-[#ECEDF3] p-4 hover:bg-[#F5F6FA] transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-[#1B1D3A]">{role.name}</h4>
                            <span className="inline-flex rounded-full bg-[#ECEDF3] px-2 py-0.5 text-[10px] font-medium text-[#6E7191]">{role.userCount} users</span>
                          </div>
                          <p className="text-xs text-[#6E7191] mt-0.5">{role.description}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {role.permissions.slice(0, 4).map((p) => (
                              <span key={p} className="inline-flex rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">{p}</span>
                            ))}
                            {role.permissions.length > 4 && <span className="text-[10px] text-[#A0A3BD]">+{role.permissions.length - 4} more</span>}
                          </div>
                        </div>
                        {role.name !== 'Super Admin' && (
                          <button type="button" onClick={() => handleDeleteRole(role.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Add Role Modal */}
                  {showAddRole && (
                    <div className="mt-4 rounded-lg border border-[#363473]/30 bg-[#363473]/5 p-4">
                      <h4 className="text-sm font-semibold text-[#1B1D3A] mb-3">New Role</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div><input type="text" placeholder="Role name" value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                        <div><input type="text" placeholder="Description" value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={handleAddRole} className="rounded-lg bg-[#363473] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1B1D3A]">Add</button>
                        <button type="button" onClick={() => setShowAddRole(false)} className="rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-xs font-medium text-[#6E7191] hover:bg-[#F5F6FA]">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notifications */}
              {activeSection === 'notifications' && (
                <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6">
                  <h3 className="text-base font-semibold text-[#1B1D3A] mb-5">Notification Preferences</h3>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-[#6E7191]">Channels</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'emailEnabled', label: 'Email Notifications', desc: `Provider: ${notifications.emailProvider}` },
                        { key: 'smsEnabled', label: 'SMS Notifications', desc: `Provider: ${notifications.smsProvider}` },
                        { key: 'pushEnabled', label: 'Push Notifications', desc: 'Browser and mobile push' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between rounded-lg border border-[#ECEDF3] p-3">
                          <div><p className="text-sm font-medium text-[#1B1D3A]">{item.label}</p><p className="text-xs text-[#A0A3BD]">{item.desc}</p></div>
                          <button type="button" onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                            className={`relative h-6 w-11 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-[#363473]' : 'bg-[#ECEDF3]'}`}>
                            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <h4 className="text-sm font-medium text-[#6E7191] mt-5">Alert Types</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'feeReminders', label: 'Fee Payment Reminders' },
                        { key: 'attendanceAlerts', label: 'Low Attendance Alerts' },
                        { key: 'examNotifications', label: 'Exam Schedule Notifications' },
                        { key: 'announcementAlerts', label: 'New Announcements' },
                        { key: 'parentUpdates', label: 'Parent Progress Updates' },
                        { key: 'staffLeaveAlerts', label: 'Staff Leave Requests' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between rounded-lg border border-[#ECEDF3] p-3">
                          <p className="text-sm font-medium text-[#1B1D3A]">{item.label}</p>
                          <button type="button" onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                            className={`relative h-6 w-11 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-[#363473]' : 'bg-[#ECEDF3]'}`}>
                            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Low Attendance Threshold (%)</label><input type="number" value={notifications.lowAttendanceThreshold} onChange={(e) => setNotifications({ ...notifications, lowAttendanceThreshold: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                      <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Fee Reminder (days before)</label><input type="number" value={notifications.feeReminderDaysBefore} onChange={(e) => setNotifications({ ...notifications, feeReminderDaysBefore: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance */}
              {activeSection === 'appearance' && (
                <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6">
                  <h3 className="text-base font-semibold text-[#1B1D3A] mb-5">Appearance & Localization</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Theme</label>
                      <select value={appearance.theme} onChange={(e) => setAppearance({ ...appearance, theme: e.target.value as 'light' | 'dark' | 'system' })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                        <option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Sidebar Style</label>
                      <select value={appearance.sidebarStyle} onChange={(e) => setAppearance({ ...appearance, sidebarStyle: e.target.value as 'compact' | 'expanded' })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                        <option value="compact">Compact</option><option value="expanded">Expanded</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Primary Color</label><div className="flex items-center gap-2"><input type="color" value={appearance.primaryColor} onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })} className="h-9 w-12 rounded border border-[#ECEDF3] cursor-pointer" /><input type="text" value={appearance.primaryColor} onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })} className="flex-1 rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Accent Color</label><div className="flex items-center gap-2"><input type="color" value={appearance.accentColor} onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })} className="h-9 w-12 rounded border border-[#ECEDF3] cursor-pointer" /><input type="text" value={appearance.accentColor} onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })} className="flex-1 rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div></div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Date Format</label>
                      <select value={appearance.dateFormat} onChange={(e) => setAppearance({ ...appearance, dateFormat: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                        <option value="DD-MM-YYYY">DD-MM-YYYY</option><option value="MM-DD-YYYY">MM-DD-YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Currency</label>
                      <select value={appearance.currency} onChange={(e) => setAppearance({ ...appearance, currency: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                        <option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Language</label>
                      <select value={appearance.language} onChange={(e) => setAppearance({ ...appearance, language: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                        <option value="English">English</option><option value="Telugu">Telugu</option><option value="Hindi">Hindi</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-[#1B1D3A] mb-1">Timezone</label>
                      <select value={appearance.timezone} onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option><option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Backup & Data */}
              {activeSection === 'backup' && (
                <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6">
                  <h3 className="text-base font-semibold text-[#1B1D3A] mb-5">Backup & Data Management</h3>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-[#ECEDF3] p-4">
                      <div className="flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#1B1D3A]">Automatic Backup</p><p className="text-xs text-[#A0A3BD]">Daily backup at 2:00 AM IST</p></div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"><Check className="h-3 w-3" /> Active</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#ECEDF3] p-4">
                      <div className="flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#1B1D3A]">Last Backup</p><p className="text-xs text-[#A0A3BD]">December 12, 2024 at 2:00 AM</p></div>
                        <span className="text-xs text-[#6E7191]">Size: 2.4 GB</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#ECEDF3] p-4">
                      <div className="flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#1B1D3A]">Backup Retention</p><p className="text-xs text-[#A0A3BD]">Keep last 30 days of backups</p></div>
                        <span className="text-xs text-[#6E7191]">28 backups stored</span>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors"><Database className="h-4 w-4" /> Backup Now</button>
                      <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA] transition-colors"><RotateCcw className="h-4 w-4" /> Restore from Backup</button>
                    </div>
                    <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                      <h4 className="text-sm font-semibold text-red-700">Danger Zone</h4>
                      <p className="text-xs text-red-600 mt-1">These actions are irreversible. Please proceed with caution.</p>
                      <div className="mt-3 flex gap-3">
                        <button type="button" className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">Clear Cache</button>
                        <button type="button" className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">Reset Demo Data</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations */}
              {activeSection === 'integrations' && (
                <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6">
                  <h3 className="text-base font-semibold text-[#1B1D3A] mb-5">Third-Party Integrations</h3>
                  <div className="space-y-3">
                    {integrations.map((intg) => (
                      <div key={intg.id} className="flex items-center justify-between rounded-lg border border-[#ECEDF3] p-4 hover:bg-[#F5F6FA] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`h-2.5 w-2.5 rounded-full ${intg.status === 'connected' ? 'bg-green-500' : intg.status === 'error' ? 'bg-red-500' : 'bg-gray-300'}`} />
                          <div>
                            <p className="text-sm font-medium text-[#1B1D3A]">{intg.name}</p>
                            <p className="text-xs text-[#A0A3BD]">{intg.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium ${intg.status === 'connected' ? 'text-green-700' : intg.status === 'error' ? 'text-red-600' : 'text-[#A0A3BD]'}`}>
                            {intg.status === 'connected' ? 'Connected' : intg.status === 'error' ? 'Error' : 'Disconnected'}
                          </span>
                          <button type="button" onClick={() => handleToggleIntegration(intg.id)}
                            className={`relative h-6 w-11 rounded-full transition-colors ${intg.enabled ? 'bg-[#363473]' : 'bg-[#ECEDF3]'}`}>
                            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${intg.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Save Button */}
          <div className="mt-6 flex items-center gap-3">
            <button type="button" onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1B1D3A] transition-colors">
              {saved ? <><Check className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Changes</>}
            </button>
            <button type="button" onClick={() => { setGeneral(INITIAL_GENERAL); setAcademic(INITIAL_ACADEMIC); setNotifications(INITIAL_NOTIFICATIONS); setAppearance(INITIAL_APPEARANCE); }}
              className="inline-flex items-center gap-2 rounded-lg border border-[#ECEDF3] px-5 py-2.5 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA] transition-colors">
              <RotateCcw className="h-4 w-4" /> Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </PageContent>
  );
}
