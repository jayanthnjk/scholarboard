/**
 * Parent Dashboard Page - Child-centric view for parents.
 */

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { StatCard } from '@/components/ui/stat-card';
import {
  Users,
  Calendar,
  CreditCard,
  Bell,
  CheckSquare,
  BookOpen,
  DollarSign,
  FileText,
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  grade: string;
  section: string;
  attendancePercent: number;
  pendingFees: number;
  recentGrades: { subject: string; grade: string; date: string }[];
}

const CHILDREN: Child[] = [
  {
    id: '1',
    name: 'Aanya Sharma',
    grade: 'Grade 8',
    section: 'A',
    attendancePercent: 94,
    pendingFees: 12500,
    recentGrades: [
      { subject: 'Mathematics', grade: 'A+', date: '2024-02-28' },
      { subject: 'Science', grade: 'A', date: '2024-02-25' },
      { subject: 'English', grade: 'B+', date: '2024-02-22' },
    ],
  },
  {
    id: '2',
    name: 'Arjun Sharma',
    grade: 'Grade 5',
    section: 'B',
    attendancePercent: 88,
    pendingFees: 8000,
    recentGrades: [
      { subject: 'Mathematics', grade: 'B+', date: '2024-02-28' },
      { subject: 'EVS', grade: 'A', date: '2024-02-26' },
    ],
  },
];

const ANNOUNCEMENTS = [
  { id: '1', title: 'Parent-Teacher Meeting on March 15', date: '2024-03-05' },
  { id: '2', title: 'Annual Sports Day - Register by March 10', date: '2024-03-03' },
  { id: '3', title: 'Term 2 Exam Schedule Released', date: '2024-03-01' },
];

export function ParentDashboardPage(): React.JSX.Element {
  const [activeChildId, setActiveChildId] = useState(CHILDREN[0]?.id ?? '');
  const activeChild = CHILDREN.find((c) => c.id === activeChildId) ?? CHILDREN[0];

  if (!activeChild) {
    return (
      <PageContent>
        <p className="text-muted-foreground">No children linked to this account.</p>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PageHeader
        title="Parent Dashboard"
        subtitle="Stay updated on your children's progress."
        breadcrumbs={[{ label: 'Parent Portal' }, { label: 'Dashboard' }]}
      />

      {/* Child Selector Tabs */}
      <div className="mt-6 flex gap-2 border-b" role="tablist" aria-label="Select child">
        {CHILDREN.map((child) => (
          <button
            key={child.id}
            type="button"
            role="tab"
            aria-selected={child.id === activeChildId}
            onClick={() => setActiveChildId(child.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              child.id === activeChildId
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-4 w-4" />
            {child.name}
            <span className="text-xs text-muted-foreground">({child.grade})</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CheckSquare />}
          label="Attendance"
          value={`${activeChild.attendancePercent}%`}
          trend={activeChild.attendancePercent >= 90 ? 'up' : 'down'}
          trendValue={activeChild.attendancePercent >= 90 ? 'Good' : 'Needs attention'}
        />
        <StatCard
          icon={<BookOpen />}
          label="Recent Grade"
          value={activeChild.recentGrades[0]?.grade ?? 'N/A'}
          description={activeChild.recentGrades[0]?.subject}
        />
        <StatCard
          icon={<CreditCard />}
          label="Pending Fees"
          value={`₹${activeChild.pendingFees.toLocaleString('en-IN')}`}
          trend={activeChild.pendingFees > 0 ? 'down' : 'up'}
          trendValue={activeChild.pendingFees > 0 ? 'Due' : 'Clear'}
        />
        <StatCard
          icon={<Bell />}
          label="Announcements"
          value={String(ANNOUNCEMENTS.length)}
          description="unread"
        />
      </div>

      {/* Content Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent Grades */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold">Recent Grades</h3>
          <div className="mt-3 space-y-3">
            {activeChild.recentGrades.map((g) => (
              <div key={`${g.subject}-${g.date}`} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{g.subject}</p>
                  <p className="text-xs text-muted-foreground">{g.date}</p>
                </div>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-sm font-bold text-primary">
                  {g.grade}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold">Announcements</h3>
          <div className="mt-3 space-y-3">
            {ANNOUNCEMENTS.map((a) => (
              <div key={a.id} className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold">Quick Actions</h3>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors hover:bg-accent"
            >
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Pay Fee</p>
                <p className="text-xs text-muted-foreground">Clear pending dues</p>
              </div>
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors hover:bg-accent"
            >
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Apply Leave</p>
                <p className="text-xs text-muted-foreground">Submit leave request</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </PageContent>
  );
}
