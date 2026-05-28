/**
 * Fee Analytics page - Charts and stats for fee collection insights.
 */

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeeAnalytics } from '../api';
import { DollarSign, TrendingUp, AlertCircle, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function AnalyticsPage() {
  const { data: analytics, isLoading } = useFeeAnalytics();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(amount);

  const formatFullCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton height={32} width="40%" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton height={120} />
          <Skeleton height={120} />
          <Skeleton height={120} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton height={350} />
          <Skeleton height={350} />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No analytics data available.</p>
      </div>
    );
  }

  // Prepare data for payment method pie chart
  const methodData = analytics.paymentMethodBreakdown.map((item) => ({
    name: item.method.replace('_', ' ').toUpperCase(),
    value: item.amount,
    count: item.count,
  }));

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Fee Analytics"
        subtitle={`Collection insights for ${analytics.academicYear}`}
        breadcrumbs={[
          { label: 'Fees' },
          { label: 'Analytics' },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<DollarSign />}
          label="Total Collected"
          value={formatCurrency(analytics.totalCollected)}
          trend="up"
          trendValue={`${analytics.collectionRate}%`}
          description="collection rate"
        />
        <StatCard
          icon={<AlertCircle />}
          label="Total Pending"
          value={formatCurrency(analytics.totalPending)}
          trend="down"
          trendValue={`${analytics.defaulterCount} defaulters`}
        />
        <StatCard
          icon={<TrendingUp />}
          label="Collection Rate"
          value={`${analytics.collectionRate}%`}
          trend={analytics.collectionRate >= 80 ? 'up' : 'down'}
          trendValue={formatCurrency(analytics.totalExpected)}
          description="expected"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Collection Trends - Line Chart */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Monthly Collection Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[...analytics.monthlyCollection]}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis
                tickFormatter={(v: number) => formatCurrency(v)}
                className="text-xs"
              />
              <Tooltip
                formatter={(value) => formatFullCurrency(Number(value))}
                labelStyle={{ fontWeight: 600 }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="collected"
                stroke="#10b981"
                strokeWidth={2}
                name="Collected"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="expected"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Expected"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Outstanding by Category - Bar Chart */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Outstanding by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[...analytics.categoryBreakdown]}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="category"
                className="text-xs"
                tick={{ fontSize: 11 }}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickFormatter={(v: number) => formatCurrency(v)}
                className="text-xs"
              />
              <Tooltip formatter={(value) => formatFullCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="collected" fill="#10b981" name="Collected" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="#ef4444" name="Pending" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Method Distribution - Pie Chart */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <PieChartIcon className="h-4 w-4" />
            Payment Method Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={methodData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {methodData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatFullCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Month-over-Month Comparison */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Month-over-Month Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[...analytics.monthlyCollection]}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis
                tickFormatter={(v: number) => formatCurrency(v)}
                className="text-xs"
              />
              <Tooltip formatter={(value) => formatFullCurrency(Number(value))} />
              <Bar
                dataKey="collected"
                fill="#8b5cf6"
                name="Collected"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Penalty Collected</p>
          <p className="mt-1 text-xl font-bold">{formatFullCurrency(analytics.totalPenaltyCollected)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Discounts Given</p>
          <p className="mt-1 text-xl font-bold">{formatFullCurrency(analytics.totalDiscountsGiven)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Defaulter Count</p>
          <p className="mt-1 text-xl font-bold">{analytics.defaulterCount}</p>
        </div>
      </div>
    </div>
  );
}

export { AnalyticsPage };
