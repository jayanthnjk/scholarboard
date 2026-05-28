/**
 * Workflow List Page - Configured automation workflows.
 */

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { Plus, GitBranch, Play, Pause } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  triggerCount: number;
  lastTriggered: string;
}

const MOCK_WORKFLOWS: Workflow[] = [
  { id: '1', name: 'Leave Approval', description: 'Routes leave requests to HOD then Principal', status: 'active', triggerCount: 156, lastTriggered: '2 hours ago' },
  { id: '2', name: 'Fee Concession', description: 'Multi-level approval for fee waivers above ₹5,000', status: 'active', triggerCount: 43, lastTriggered: '1 day ago' },
  { id: '3', name: 'Transfer Certificate', description: 'Generates TC after clearance from all departments', status: 'active', triggerCount: 12, lastTriggered: '3 days ago' },
  { id: '4', name: 'Staff Onboarding', description: 'Welcome email, ID creation, resource allocation', status: 'inactive', triggerCount: 8, lastTriggered: '2 weeks ago' },
  { id: '5', name: 'Exam Result Publishing', description: 'Verify, approve, and publish exam results', status: 'inactive', triggerCount: 4, lastTriggered: '1 month ago' },
];

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', icon: Play },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: Pause },
};

export function WorkflowListPage(): React.JSX.Element {
  return (
    <PageContent>
      <PageHeader
        title="Workflows"
        subtitle="Configure and manage automated workflows."
        breadcrumbs={[{ label: 'Workflows' }, { label: 'List' }]}
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Workflow
          </button>
        }
      />

      <div className="mt-6 space-y-3">
        {MOCK_WORKFLOWS.map((workflow) => {
          const config = STATUS_CONFIG[workflow.status];
          const StatusIcon = config.icon;

          return (
            <div
              key={workflow.id}
              className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <GitBranch className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{workflow.name}</h4>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{workflow.description}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{workflow.triggerCount} triggers</p>
                <p className="text-xs text-muted-foreground">Last: {workflow.lastTriggered}</p>
              </div>
            </div>
          );
        })}
      </div>
    </PageContent>
  );
}
