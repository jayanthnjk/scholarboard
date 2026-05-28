/**
 * Payment Form page - Record a fee payment with partial payment support.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { usePermission } from '@/hooks/usePermission';
import { useToast } from '@/components/toast/use-toast';
import { useProcessPayment, useFeeStructures } from '../api';
import { ReceiptView } from '../components/ReceiptView';
import type { PaymentFormData, PaymentRecord } from '../types';
import { CreditCard, CheckCircle } from 'lucide-react';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'upi', label: 'UPI' },
  { value: 'net_banking', label: 'Net Banking' },
  { value: 'card', label: 'Card' },
  { value: 'dd', label: 'Demand Draft' },
] as const;

const FEE_CATEGORIES = [
  'Tuition Fee',
  'Lab Fee',
  'Library Fee',
  'Sports Fee',
  'Transport Fee',
  'Examination Fee',
] as const;

function PaymentFormPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = usePermission();
  const processPayment = useProcessPayment();
  const { data: structures } = useFeeStructures();
  const [receiptPayment, setReceiptPayment] = useState<PaymentRecord | null>(null);

  const [formData, setFormData] = useState<PaymentFormData>({
    studentId: '',
    studentName: '',
    className: '',
    feeStructureId: '',
    amount: 0,
    method: 'cash',
    transactionId: '',
    categories: [],
    remarks: '',
    isPartial: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PaymentFormData, string>> = {};

    if (!formData.studentName.trim()) newErrors.studentName = 'Student name is required';
    if (!formData.className.trim()) newErrors.className = 'Class is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.method) newErrors.method = 'Payment method is required';
    if (formData.method !== 'cash' && !formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction/Reference ID is required for non-cash payments';
    }
    if (formData.categories.length === 0) newErrors.categories = 'Select at least one fee category';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await processPayment.mutateAsync(formData);
      toast({ type: 'success', title: 'Payment recorded successfully' });
      setReceiptPayment(result);
    } catch {
      toast({ type: 'error', title: 'Failed to process payment' });
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const updateField = <K extends keyof PaymentFormData>(field: K, value: PaymentFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (receiptPayment) {
    return (
      <ReceiptView
        payment={receiptPayment}
        onClose={() => navigate('/fees/payments')}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Record Payment"
        subtitle="Process a new fee payment"
        breadcrumbs={[
          { label: 'Fees' },
          { label: 'Payments', onClick: () => navigate('/fees/payments') },
          { label: 'New Payment' },
        ]}
      />

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 rounded-lg border bg-card p-6">
        {/* Student Information */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Student Information
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Student Name *</label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => updateField('studentName', e.target.value)}
                placeholder="Enter student name"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.studentName && (
                <p className="mt-1 text-xs text-destructive">{errors.studentName}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Class *</label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => updateField('className', e.target.value)}
                placeholder="e.g. 10-A"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.className && (
                <p className="mt-1 text-xs text-destructive">{errors.className}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Student ID</label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => updateField('studentId', e.target.value)}
                placeholder="Student ID (optional)"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Fee Structure</label>
              <select
                value={formData.feeStructureId}
                onChange={(e) => updateField('feeStructureId', e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select structure</option>
                {structures?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.className})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fee Categories */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Fee Categories *
          </h3>
          <div className="grid gap-2 md:grid-cols-3">
            {FEE_CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent"
              >
                <input
                  type="checkbox"
                  checked={formData.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="h-4 w-4 rounded border"
                />
                <span className="text-sm">{category}</span>
              </label>
            ))}
          </div>
          {errors.categories && (
            <p className="text-xs text-destructive">{errors.categories}</p>
          )}
        </div>

        {/* Payment Details */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            Payment Details
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Amount (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => updateField('amount', Number(e.target.value))}
                placeholder="Enter amount"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-destructive">{errors.amount}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Payment Method *</label>
              <select
                value={formData.method}
                onChange={(e) => updateField('method', e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Transaction/Reference ID {formData.method !== 'cash' ? '*' : ''}
              </label>
              <input
                type="text"
                value={formData.transactionId}
                onChange={(e) => updateField('transactionId', e.target.value)}
                placeholder="Transaction reference"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.transactionId && (
                <p className="mt-1 text-xs text-destructive">{errors.transactionId}</p>
              )}
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border p-2.5">
                <input
                  type="checkbox"
                  checked={formData.isPartial}
                  onChange={(e) => updateField('isPartial', e.target.checked)}
                  className="h-4 w-4 rounded border"
                />
                <span className="text-sm font-medium">Partial Payment</span>
              </label>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => updateField('remarks', e.target.value)}
              placeholder="Additional notes (optional)"
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={() => navigate('/fees/payments')}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          {hasPermission('fees', 'collect') && (
            <button
              type="submit"
              disabled={processPayment.isPending}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              {processPayment.isPending ? 'Processing...' : 'Record Payment'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export { PaymentFormPage };
