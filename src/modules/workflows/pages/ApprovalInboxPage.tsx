/**
 * Approval Inbox Page - Pending approvals with quick actions.
 */

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { Check, X, Filter, Clock } from 'lucide-react';

type ApprovalType = 'leave' | 'fee-concession' | 'transfer' | 'expense';

interface ApprovalItem {
  id: string;
  type: ApprovalType;
  title: string;
  requester: string;
  submittedAt: string;
  details: string;
  priority: 'normal' | 'urgent';
}

const TYPE_LABELS: Record<ApprovalType, string> = {
  leave: 'Leave Request',
  'fee-concession': 'Fee Concession',
  transfer: 'Transfer',
  expense: 'Expense',
};

const TYPE_COLORS: Record<ApprovalType, string> = {
  leave: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'fee-concession': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  transfer: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  expense: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const MOCK_APPROVALS: ApprovalItem[] = [
  { id: '1', type: 'leave', title: 'Sick Leave - 2 days', requester: 'Ravi Kumar (Teacher)', submittedAt: '2 hours ago', details: 'March 10-11, medical appointment', priority: 'normal' },
  { id: '2', type: 'fee-concession', title: 'Fee Waiver Request - ₹8,000', requester: 'Parent of Aarav Singh (Gr 7)', submittedAt: '5 hours ago', details: 'Financial hardship documentation attached', priority: 'urgent' },
  { id: '3', type: 'transfer', title: 'Transfer Certificate Request', requester: 'Parent of Meera Patel (Gr 10)', submittedAt: '1 day ago', details: 'Family relocating to Mumbai', priority: 'normal' },
  { id: '4', type: 'leave', title: 'Casual Leave - 1 day', requester: 'Priya Sharma (Admin)', submittedAt: '1 day ago', details: 'Personal work on March 12', priority: 'normal' },
  { id: '5', type: 'expense', title: 'Lab Equipment Purchase - ₹15,000', requester: 'Dr. Patel (HOD Science)', submittedAt: '2 days ago', details: 'New microscopes for biology lab', priority: 'normal' },
];

export function ApprovalInboxPage(): React.JSX.Element {
  const [filterType, setFilterType] = useState<ApprovalType | 'all'>('all');

  const filteredApprovals = filterType === 'all'
    ? MOCK_APPROVALS
    : MOCK_APPROVALS.filter((a) => a.type === filterType);

  return (
    <PageContent>
      <PageHeader
        title="Approval Inbox"
        subtitle={`${MOCK_APPROVALS.length} pending approvals require your attention.`}
        breadcrumbs={[{ label: 'Workflows' }, { label: 'Approvals' }]}
      />

      {/* Filter */}
      <div className="mt-6 flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex gap-1 rounded-md border p-0.5" role="group" aria-label="Filter by type">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`rounded px-3 py-1 text-xs font-medium ${filterType === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
          >
            All
          </button>
          {(Object.entries(TYPE_LABELS) as [ApprovalType, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilterType(key)}
              className={`rounded px-3 py-1 text-xs font-medium ${filterType === key ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Approval List */}
      <div className="mt-4 space-y-3">
        {filteredApprovals.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">No pending approvals in this category.</p>
          </div>
        ) : (
          filteredApprovals.map((item) => (
            <div key={item.id} className="flex items-start gap-4 rounded-lg border bg-card p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[item.type]}`}>
                    {TYPE_LABELS[item.type]}
                  </span>
                  {item.priority === 'urgent' && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.requester}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.details}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {item.submittedAt}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                  aria-label={`Approve: ${item.title}`}
                >
                  <Check className="h-3.5 w-3.5" />
                  Approve
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  aria-label={`Reject: ${item.title}`}
                >
                  <X className="h-3.5 w-3.5" />
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </PageContent>
  );
}
