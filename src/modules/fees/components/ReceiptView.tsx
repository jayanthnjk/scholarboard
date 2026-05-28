/**
 * Printable receipt component for fee payments.
 */

import { useRef } from 'react';
import type { PaymentRecord } from '../types';

interface ReceiptViewProps {
  payment: PaymentRecord;
  onClose: () => void;
}

function ReceiptView({ payment, onClose }: ReceiptViewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${payment.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 16px; margin-bottom: 24px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 4px 0; color: #666; }
            .receipt-info { display: flex; justify-content: space-between; margin-bottom: 24px; }
            .receipt-info div { font-size: 14px; }
            .student-info { background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f9f9f9; font-weight: 600; }
            .total-row { font-weight: bold; border-top: 2px solid #333; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
            .status-completed { background: #dcfce7; color: #166534; }
            .status-partial { background: #fef3c7; color: #92400e; }
            .status-pending { background: #dbeafe; color: #1e40af; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const statusClass = payment.status === 'completed'
    ? 'status-completed'
    : payment.status === 'partial'
      ? 'status-partial'
      : 'status-pending';

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        {/* Actions */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Payment Receipt</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Close
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div ref={printRef}>
          <div className="header">
            <h1>Education Institution</h1>
            <p>Fee Payment Receipt</p>
            <p>Academic Year: {payment.academicYear}</p>
          </div>

          <div className="receipt-info">
            <div>
              <p><strong>Receipt No:</strong> {payment.receiptNumber}</p>
              <p><strong>Date:</strong> {formatDate(payment.paidDate)}</p>
            </div>
            <div>
              <p><strong>Transaction ID:</strong> {payment.transactionId}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status ${statusClass}`}>
                  {payment.status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          <div className="student-info">
            <p><strong>Student Name:</strong> {payment.studentName}</p>
            <p><strong>Class:</strong> {payment.className}</p>
            <p><strong>Payment Method:</strong> {payment.method.replace('_', ' ').toUpperCase()}</p>
            {payment.collectedBy && (
              <p><strong>Collected By:</strong> {payment.collectedBy}</p>
            )}
          </div>

          <table>
            <thead>
              <tr>
                <th>Fee Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {payment.categories.map((category) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td style={{ textAlign: 'right' }}>—</td>
                </tr>
              ))}
              <tr>
                <td><strong>Total Fee Amount</strong></td>
                <td style={{ textAlign: 'right' }}><strong>{formatCurrency(payment.amount)}</strong></td>
              </tr>
              <tr>
                <td><strong>Paid Amount</strong></td>
                <td style={{ textAlign: 'right' }}><strong>{formatCurrency(payment.paidAmount)}</strong></td>
              </tr>
              {payment.dueAmount > 0 && (
                <tr className="total-row">
                  <td>Balance Due</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(payment.dueAmount)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {payment.remarks && (
            <p><strong>Remarks:</strong> {payment.remarks}</p>
          )}

          <div className="footer">
            <p>This is a computer-generated receipt.</p>
            <p>For queries, contact the Finance Office.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ReceiptView };
