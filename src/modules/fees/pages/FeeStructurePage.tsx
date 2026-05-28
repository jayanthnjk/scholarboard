/**
 * Fee Structure page - List and create fee structures by class.
 */

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/toast/use-toast';
import { usePermission } from '@/hooks/usePermission';
import { useFeeStructures, useCreateFeeStructure } from '../api';
import type { FeeStructure, FeeStructureFormData } from '../types';
import {
  DollarSign,
  GraduationCap,
  Plus,
  X,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

function FeeStructurePage() {
  const { toast } = useToast();
  const { hasPermission } = usePermission();
  const { data: structures, isLoading } = useFeeStructures();
  const createMutation = useCreateFeeStructure();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FeeStructureFormData>({
    name: '',
    className: '',
    academicYear: '2024-2025',
    dueDate: '',
    categories: [{ name: '', description: '', amount: 0, frequency: 'annual', optional: false }],
    latePenalty: { type: 'percentage', amount: 2, gracePeriodDays: 15, maxPenalty: 5000 },
    discounts: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      toast({ type: 'success', title: 'Fee structure created successfully' });
      setShowForm(false);
      setFormData({
        name: '',
        className: '',
        academicYear: '2024-2025',
        dueDate: '',
        categories: [{ name: '', description: '', amount: 0, frequency: 'annual', optional: false }],
        latePenalty: { type: 'percentage', amount: 2, gracePeriodDays: 15, maxPenalty: 5000 },
        discounts: [],
      });
    } catch {
      toast({ type: 'error', title: 'Failed to create fee structure' });
    }
  };

  const addCategory = () => {
    setFormData((prev) => ({
      ...prev,
      categories: [...prev.categories, { name: '', description: '', amount: 0, frequency: 'annual', optional: false }],
    }));
  };

  const removeCategory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  };

  const updateCategory = (index: number, field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, [field]: value } : cat,
      ),
    }));
  };

  const addDiscount = () => {
    setFormData((prev) => ({
      ...prev,
      discounts: [...prev.discounts, { name: '', type: 'percentage' as const, value: 0, eligibility: '' }],
    }));
  };

  const removeDiscount = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      discounts: prev.discounts.filter((_, i) => i !== index),
    }));
  };

  const updateDiscount = (index: number, field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      discounts: prev.discounts.map((disc, i) =>
        i === index ? { ...disc, [field]: value } : disc,
      ),
    }));
  };

  const formatCurrency = (amount: number) =>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={200} />
          ))}
        </div>
      </div>
    );
  }

  const totalStructures = structures?.length ?? 0;
  const totalAmount = structures?.reduce((sum, s) => sum + s.totalAmount, 0) ?? 0;
  const avgAmount = totalStructures > 0 ? Math.round(totalAmount / totalStructures) : 0;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Fee Structures"
        subtitle="Manage fee structures for each class"
        breadcrumbs={[
          { label: 'Fees' },
          { label: 'Structures' },
        ]}
        actions={
          hasPermission('fees', 'create') ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Structure
            </button>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<GraduationCap />}
          label="Total Structures"
          value={totalStructures}
        />
        <StatCard
          icon={<DollarSign />}
          label="Avg. Fee Amount"
          value={formatCurrency(avgAmount)}
        />
        <StatCard
          icon={<Calendar />}
          label="Academic Year"
          value="2024-2025"
        />
      </div>

      {/* Structure Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {structures?.map((structure) => (
          <StructureCard key={structure.id} structure={structure} />
        ))}
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Fee Structure</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md p-1 hover:bg-accent"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Structure Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., Fee Structure - Class 10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Class</label>
                  <input
                    type="text"
                    required
                    value={formData.className}
                    onChange={(e) => setFormData((prev) => ({ ...prev, className: e.target.value }))}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., 10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Academic Year</label>
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData((prev) => ({ ...prev, academicYear: e.target.value }))}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">Fee Categories</label>
                  <button
                    type="button"
                    onClick={addCategory}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add Category
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.categories.map((cat, index) => (
                    <div key={index} className="flex items-start gap-2 rounded-md border p-3">
                      <div className="grid flex-1 gap-2 md:grid-cols-4">
                        <input
                          type="text"
                          required
                          placeholder="Category name"
                          value={cat.name}
                          onChange={(e) => updateCategory(index, 'name', e.target.value)}
                          className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <input
                          type="number"
                          required
                          placeholder="Amount"
                          value={cat.amount || ''}
                          onChange={(e) => updateCategory(index, 'amount', Number(e.target.value))}
                          className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <select
                          value={cat.frequency}
                          onChange={(e) => updateCategory(index, 'frequency', e.target.value)}
                          className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="annual">Annual</option>
                          <option value="one_time">One Time</option>
                        </select>
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={cat.optional}
                            onChange={(e) => updateCategory(index, 'optional', e.target.checked)}
                            className="h-4 w-4 rounded border"
                          />
                          Optional
                        </label>
                      </div>
                      {formData.categories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCategory(index)}
                          className="mt-1 rounded p-1 text-destructive hover:bg-destructive/10"
                          aria-label="Remove category"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Late Penalty */}
              <div>
                <label className="mb-2 block text-sm font-medium">Late Penalty</label>
                <div className="grid gap-2 md:grid-cols-4">
                  <select
                    value={formData.latePenalty.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        latePenalty: { ...prev.latePenalty, type: e.target.value as 'fixed' | 'percentage' },
                      }))
                    }
                    className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Amount/Rate"
                    value={formData.latePenalty.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        latePenalty: { ...prev.latePenalty, amount: Number(e.target.value) },
                      }))
                    }
                    className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="number"
                    placeholder="Grace days"
                    value={formData.latePenalty.gracePeriodDays}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        latePenalty: { ...prev.latePenalty, gracePeriodDays: Number(e.target.value) },
                      }))
                    }
                    className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="number"
                    placeholder="Max penalty"
                    value={formData.latePenalty.maxPenalty}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        latePenalty: { ...prev.latePenalty, maxPenalty: Number(e.target.value) },
                      }))
                    }
                    className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Discounts */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">Discounts</label>
                  <button
                    type="button"
                    onClick={addDiscount}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add Discount
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.discounts.map((disc, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-md border p-2">
                      <input
                        type="text"
                        placeholder="Discount name"
                        value={disc.name}
                        onChange={(e) => updateDiscount(index, 'name', e.target.value)}
                        className="h-8 flex-1 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <select
                        value={disc.type}
                        onChange={(e) => updateDiscount(index, 'type', e.target.value)}
                        className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">Fixed</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Value"
                        value={disc.value || ''}
                        onChange={(e) => updateDiscount(index, 'value', Number(e.target.value))}
                        className="h-8 w-20 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="text"
                        placeholder="Eligibility"
                        value={disc.eligibility}
                        onChange={(e) => updateDiscount(index, 'eligibility', e.target.value)}
                        className="h-8 flex-1 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => removeDiscount(index)}
                        className="rounded p-1 text-destructive hover:bg-destructive/10"
                        aria-label="Remove discount"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Structure Card ─────────────────────────────────────────────────────────

function StructureCard({ structure }: { structure: FeeStructure }) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{structure.name}</h3>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {structure.academicYear}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-2xl font-bold text-foreground">{formatCurrency(structure.totalAmount)}</p>
        <p className="text-xs text-muted-foreground">Total annual fee</p>
      </div>

      <div className="mb-3 space-y-1">
        {structure.categories.slice(0, 4).map((cat) => (
          <div key={cat.id} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{cat.name}</span>
            <span className="font-medium">
              {formatCurrency(cat.subCategories.reduce((sum, sub) => sum + sub.amount, 0))}
            </span>
          </div>
        ))}
        {structure.categories.length > 4 && (
          <p className="text-xs text-muted-foreground">
            +{structure.categories.length - 4} more categories
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 border-t pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Due: {new Date(structure.dueDate).toLocaleDateString('en-IN')}
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {structure.latePenalty.amount}% penalty
        </div>
      </div>

      {structure.discounts.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {structure.discounts.map((disc) => (
            <span
              key={disc.id}
              className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            >
              {disc.name}: {disc.value}{disc.type === 'percentage' ? '%' : '₹'}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export { FeeStructurePage };
