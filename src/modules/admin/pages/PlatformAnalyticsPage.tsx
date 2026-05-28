/**
 * Platform Analytics Page - Usage stats and growth charts for super admin.
 */

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { StatCard } from '@/components/ui/stat-card';
import { Users, Building2, LayoutGrid, Activity } from 'lucide-react';

const USER_GROWTH_DATA = [
  { month: 'Jan', users: 420 },
  { month: 'Feb', users: 510 },
  { month: 'Mar', users: 620 },
  { month: 'Apr', users: 780 },
  { month: 'May', users: 890 },
  { month: 'Jun', users: 1050 },
  { month: 'Jul', users: 1180 },
  { month: 'Aug', users: 1340 },
];

const MODULE_ADOPTION_DATA = [
  { module: 'Students', tenants: 42 },
  { module: 'Fees', tenants: 38 },
  { module: 'Attendance', tenants: 35 },
  { module: 'Exams', tenants: 30 },
  { module: 'Timetable', tenants: 28 },
  { module: 'Library', tenants: 22 },
  { module: 'Transport', tenants: 18 },
  { module: 'Communication', tenants: 25 },
];

export function PlatformAnalyticsPage(): React.JSX.Element {
  return (
    <PageContent>
      <PageHeader
        title="Platform Analytics"
        subtitle="Overview of platform usage and growth metrics."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Analytics' }]}
      />

      {/* Stat Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users />}
          label="Total Users"
          value="1,340"
          trend="up"
          trendValue="+12%"
          description="this month"
        />
        <StatCard
          icon={<Building2 />}
          label="Active Tenants"
          value="42"
          trend="up"
          trendValue="+3"
          description="this quarter"
        />
        <StatCard
          icon={<LayoutGrid />}
          label="Modules in Use"
          value="12"
          trend="neutral"
          trendValue="avg 6.4/tenant"
        />
        <StatCard
          icon={<Activity />}
          label="Avg Daily Active"
          value="876"
          trend="up"
          trendValue="+8%"
          description="vs last month"
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* User Growth */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">User Growth Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={USER_GROWTH_DATA}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Total Users"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Module Adoption */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Module Adoption Rates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={MODULE_ADOPTION_DATA}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="module" className="text-xs" angle={-20} textAnchor="end" height={60} />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="tenants" fill="#8b5cf6" name="Tenants Using" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageContent>
  );
}
