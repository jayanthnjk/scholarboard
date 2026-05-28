/**
 * Student Dashboard Page - Personal dashboard for students.
 */

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { StatCard } from '@/components/ui/stat-card';
import {
  Clock,
  BookOpen,
  CheckSquare,
  CreditCard,
  Bell,
  Calendar,
  FileText,
  Award,
} from 'lucide-react';

interface TimetableEntry {
  id: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

interface Notification {
  id: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
}

const TODAY_TIMETABLE: TimetableEntry[] = [
  { id: '1', time: '8:00 - 8:45', subject: 'Mathematics', teacher: 'Mr. Singh', room: 'Room 201' },
  { id: '2', time: '8:45 - 9:30', subject: 'Physics', teacher: 'Dr. Patel', room: 'Lab 3' },
  { id: '3', time: '9:45 - 10:30', subject: 'English', teacher: 'Ms. Kumar', room: 'Room 201' },
  { id: '4', time: '10:30 - 11:15', subject: 'Computer Science', teacher: 'Mr. Rao', room: 'Lab 1' },
  { id: '5', time: '11:30 - 12:15', subject: 'History', teacher: 'Ms. Gupta', room: 'Room 105' },
];

const NOTIFICATIONS: Notification[] = [
  { id: '1', message: 'Math assignment due tomorrow', time: '2 hours ago', type: 'warning' },
  { id: '2', message: 'Term 2 exam schedule published', time: '5 hours ago', type: 'info' },
  { id: '3', message: 'Science project grade: A+', time: '1 day ago', type: 'success' },
  { id: '4', message: 'Library book return due March 10', time: '1 day ago', type: 'info' },
];

const NOTIFICATION_STYLES: Record<Notification['type'], string> = {
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  success: 'bg-emerald-500',
};

const QUICK_LINKS = [
  { label: 'Assignments', icon: <FileText className="h-4 w-4" />, href: '/assignments' },
  { label: 'Exam Results', icon: <Award className="h-4 w-4" />, href: '/exams/results' },
  { label: 'Library', icon: <BookOpen className="h-4 w-4" />, href: '/library' },
  { label: 'Calendar', icon: <Calendar className="h-4 w-4" />, href: '/calendar' },
];

export function StudentDashboardPage(): React.JSX.Element {
  return (
    <PageContent>
      <PageHeader
        title="My Dashboard"
        subtitle="Welcome back! Here's your day at a glance."
        breadcrumbs={[{ label: 'Student Portal' }, { label: 'Dashboard' }]}
      />

      {/* Stat Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Clock />}
          label="Today's Classes"
          value={String(TODAY_TIMETABLE.length)}
          description="remaining: 3"
        />
        <StatCard
          icon={<BookOpen />}
          label="Upcoming Exams"
          value="2"
          trend="neutral"
          trendValue="Next: March 12"
        />
        <StatCard
          icon={<CheckSquare />}
          label="Attendance"
          value="92%"
          trend="up"
          trendValue="+1.2%"
          description="this month"
        />
        <StatCard
          icon={<CreditCard />}
          label="Fee Status"
          value="₹5,000"
          trend="down"
          trendValue="Due Mar 15"
        />
      </div>

      {/* Main Content */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Today's Timetable */}
        <div className="lg:col-span-2 rounded-lg border bg-card p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4" />
            Today&apos;s Timetable
          </h3>
          <div className="mt-4 space-y-2">
            {TODAY_TIMETABLE.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 rounded-md border p-3 transition-colors hover:bg-accent/50"
              >
                <span className="w-28 shrink-0 text-xs font-medium text-muted-foreground">
                  {entry.time}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{entry.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.teacher} · {entry.room}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="rounded-lg border bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Bell className="h-4 w-4" />
              Notifications
            </h3>
            <div className="mt-3 space-y-3">
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="flex items-start gap-2">
                  <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${NOTIFICATION_STYLES[n.type]}`} />
                  <div>
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-muted-foreground">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-lg border bg-card p-5">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {QUICK_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex flex-col items-center gap-1.5 rounded-md border p-3 text-center transition-colors hover:bg-accent"
                >
                  <div className="rounded-md bg-primary/10 p-2 text-primary">{link.icon}</div>
                  <span className="text-xs font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContent>
  );
}
