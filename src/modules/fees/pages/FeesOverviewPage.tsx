/**
 * Fees Overview Page - Standalone page with local mock data.
 * Tabs: Paid | Overdue/Pending | Defaulters | Fee Structure (with edit)
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { usePermission } from '@/hooks/usePermission';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IndianRupee, Users, AlertTriangle, TrendingUp,
  ChevronLeft, ChevronRight, Search, XCircle, Pencil, X, Plus,
} from 'lucide-react';

// --- Types ---
type TabKey = 'paid' | 'overdue' | 'defaulters' | 'structure';
type PaymentStatus = 'Completed' | 'Pending' | 'Partial' | 'Overdue';
type PaymentMethod = 'Cash' | 'UPI' | 'Net Banking' | 'Cheque' | 'Card';

interface PaymentRecord {
  id: string; studentName: string; course: string; receiptNo: string;
  amount: number; paidAmount: number; method: PaymentMethod;
  status: PaymentStatus; date: string; category: string;
}

interface Defaulter {
  id: string; studentName: string; course: string; idCard: string;
  totalDue: number; paid: number; pending: number; daysOverdue: number;
  parentPhone: string; lastReminder: string | null;
}

interface FeeStructureItem {
  id: string; course: string; category: string; amount: number;
  frequency: string; dueDate: string;
}

const PAGE_SIZE = 8;

// --- Mock Data ---
const PAYMENTS: PaymentRecord[] = [
  { id: 'p1', studentName: 'Ravi Kumar', course: 'MPC', receiptNo: 'RCP/SA/2024/00001', amount: 42500, paidAmount: 42500, method: 'UPI', status: 'Completed', date: '2024-12-10', category: 'Tuition Fee' },
  { id: 'p2', studentName: 'Priya Sharma', course: 'BiPC', receiptNo: 'RCP/SA/2024/00002', amount: 42500, paidAmount: 25000, method: 'Net Banking', status: 'Partial', date: '2024-12-09', category: 'Tuition Fee' },
  { id: 'p3', studentName: 'Arjun Reddy', course: 'MPC', receiptNo: 'RCP/SA/2024/00003', amount: 8500, paidAmount: 8500, method: 'Cash', status: 'Completed', date: '2024-12-08', category: 'Lab Fee' },
  { id: 'p4', studentName: 'Kavitha Rao', course: 'CEC', receiptNo: 'RCP/SA/2024/00004', amount: 37500, paidAmount: 37500, method: 'Card', status: 'Completed', date: '2024-12-07', category: 'Tuition Fee' },
  { id: 'p5', studentName: 'Deepak Yadav', course: 'MEC', receiptNo: 'RCP/SA/2024/00005', amount: 40000, paidAmount: 0, method: 'UPI', status: 'Pending', date: '2024-12-06', category: 'Tuition Fee' },
  { id: 'p6', studentName: 'Ananya Gupta', course: 'HEC', receiptNo: 'RCP/SA/2024/00006', amount: 35000, paidAmount: 35000, method: 'Cheque', status: 'Completed', date: '2024-12-05', category: 'Tuition Fee' },
  { id: 'p7', studentName: 'Vikram Naidu', course: 'MPC', receiptNo: 'RCP/SA/2024/00007', amount: 6800, paidAmount: 6800, method: 'Cash', status: 'Completed', date: '2024-12-04', category: 'Transport Fee' },
  { id: 'p8', studentName: 'Meera Devi', course: 'BiPC', receiptNo: 'RCP/SA/2024/00008', amount: 42500, paidAmount: 20000, method: 'UPI', status: 'Partial', date: '2024-12-03', category: 'Tuition Fee' },
  { id: 'p9', studentName: 'Rahul Verma', course: 'MPC', receiptNo: 'RCP/SA/2024/00009', amount: 4250, paidAmount: 4250, method: 'Cash', status: 'Completed', date: '2024-12-02', category: 'Sports Fee' },
  { id: 'p10', studentName: 'Swathi Reddy', course: 'CEC', receiptNo: 'RCP/SA/2024/00010', amount: 37500, paidAmount: 0, method: 'Net Banking', status: 'Overdue', date: '2024-11-15', category: 'Tuition Fee' },
  { id: 'p11', studentName: 'Manish Kumar', course: 'MEC', receiptNo: 'RCP/SA/2024/00011', amount: 3200, paidAmount: 3200, method: 'UPI', status: 'Completed', date: '2024-12-01', category: 'Library Fee' },
  { id: 'p12', studentName: 'Pooja Lakshmi', course: 'BiPC', receiptNo: 'RCP/SA/2024/00012', amount: 42500, paidAmount: 42500, method: 'Card', status: 'Completed', date: '2024-11-30', category: 'Tuition Fee' },
];

const DEFAULTERS: Defaulter[] = [
  { id: 'd1', studentName: 'Deepak Yadav', course: 'MEC', idCard: 'SA2024-MEC-005', totalDue: 80000, paid: 40000, pending: 40000, daysOverdue: 45, parentPhone: '+91 9876543215', lastReminder: '2024-12-01' },
  { id: 'd2', studentName: 'Swathi Reddy', course: 'CEC', idCard: 'SA2024-CEC-010', totalDue: 75000, paid: 0, pending: 75000, daysOverdue: 90, parentPhone: '+91 9876543220', lastReminder: '2024-11-20' },
  { id: 'd3', studentName: 'Harish Babu', course: 'MPC', idCard: 'SA2024-MPC-016', totalDue: 85000, paid: 30000, pending: 55000, daysOverdue: 60, parentPhone: '+91 9876543226', lastReminder: '2024-12-05' },
  { id: 'd4', studentName: 'Divya Sree', course: 'BiPC', idCard: 'SA2024-BiPC-017', totalDue: 85000, paid: 50000, pending: 35000, daysOverdue: 30, parentPhone: '+91 9876543227', lastReminder: null },
  { id: 'd5', studentName: 'Arun Kumar', course: 'HEC', idCard: 'SA2024-HEC-018', totalDue: 70000, paid: 0, pending: 70000, daysOverdue: 120, parentPhone: '+91 9876543228', lastReminder: '2024-11-10' },
  { id: 'd6', studentName: 'Sneha Reddy', course: 'MPC', idCard: 'SA2024-MPC-019', totalDue: 85000, paid: 42500, pending: 42500, daysOverdue: 25, parentPhone: '+91 9876543229', lastReminder: '2024-12-08' },
];

const INITIAL_FEE_STRUCTURES: FeeStructureItem[] = [
  { id: 'fs1', course: 'MPC', category: 'Tuition Fee', amount: 42500, frequency: 'Quarterly', dueDate: '2024-12-15' },
  { id: 'fs2', course: 'MPC', category: 'Lab Fee', amount: 8500, frequency: 'Annual', dueDate: '2024-06-30' },
  { id: 'fs3', course: 'MPC', category: 'Library Fee', amount: 4250, frequency: 'Annual', dueDate: '2024-06-30' },
  { id: 'fs4', course: 'MPC', category: 'Sports Fee', amount: 6800, frequency: 'Annual', dueDate: '2024-06-30' },
  { id: 'fs5', course: 'MPC', category: 'Transport Fee', amount: 12750, frequency: 'Monthly', dueDate: 'Monthly 5th' },
  { id: 'fs6', course: 'BiPC', category: 'Tuition Fee', amount: 42500, frequency: 'Quarterly', dueDate: '2024-12-15' },
  { id: 'fs7', course: 'BiPC', category: 'Lab Fee', amount: 10000, frequency: 'Annual', dueDate: '2024-06-30' },
  { id: 'fs8', course: 'CEC', category: 'Tuition Fee', amount: 37500, frequency: 'Quarterly', dueDate: '2024-12-15' },
  { id: 'fs9', course: 'MEC', category: 'Tuition Fee', amount: 40000, frequency: 'Quarterly', dueDate: '2024-12-15' },
  { id: 'fs10', course: 'HEC', category: 'Tuition Fee', amount: 35000, frequency: 'Quarterly', dueDate: '2024-12-15' },
  { id: 'fs11', course: 'All', category: 'Exam Fee', amount: 5950, frequency: 'Quarterly', dueDate: 'Before exams' },
  { id: 'fs12', course: 'All', category: 'Library Fee', amount: 3200, frequency: 'Annual', dueDate: '2024-06-30' },
];

// --- Component ---
export function FeesOverviewPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const [activeTab, setActiveTab] = useState<TabKey>('paid');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [feeStructures, setFeeStructures] = useState<FeeStructureItem[]>(INITIAL_FEE_STRUCTURES);
  const [editingItem, setEditingItem] = useState<FeeStructureItem | null>(null);
  const [editForm, setEditForm] = useState({ amount: '', frequency: '', dueDate: '' });

  // Separate paid and overdue/pending lists
  const paidPayments = useMemo(() => {
    let result = PAYMENTS.filter((p) => p.status === 'Completed');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.studentName.toLowerCase().includes(q) || p.receiptNo.toLowerCase().includes(q));
    }
    return result;
  }, [searchQuery]);

  const overduePayments = useMemo(() => {
    let result = PAYMENTS.filter((p) => p.status === 'Overdue' || p.status === 'Pending' || p.status === 'Partial');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.studentName.toLowerCase().includes(q) || p.receiptNo.toLowerCase().includes(q));
    }
    return result;
  }, [searchQuery]);

  const filteredDefaulters = useMemo(() => {
    if (!searchQuery.trim()) return DEFAULTERS;
    const q = searchQuery.toLowerCase();
    return DEFAULTERS.filter((d) => d.studentName.toLowerCase().includes(q) || d.idCard.toLowerCase().includes(q));
  }, [searchQuery]);

  // Current data for pagination
  const currentData = activeTab === 'paid' ? paidPayments : activeTab === 'overdue' ? overduePayments : activeTab === 'defaulters' ? filteredDefaulters : feeStructures;
  const totalPages = Math.max(1, Math.ceil(currentData.length / PAGE_SIZE));
  const paginated = currentData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const stats = useMemo(() => {
    const totalCollected = PAYMENTS.filter((p) => p.status === 'Completed').reduce((s, p) => s + p.paidAmount, 0);
    const totalPending = DEFAULTERS.reduce((s, d) => s + d.pending, 0);
    const totalStudents = new Set(PAYMENTS.filter((p) => p.status === 'Completed').map((p) => p.studentName)).size;
    const collectionRate = Math.round((totalCollected / (totalCollected + totalPending)) * 100);
    const overdueCount = PAYMENTS.filter((p) => p.status === 'Overdue' || p.status === 'Pending' || p.status === 'Partial').length;
    return { totalCollected, totalPending, totalStudents, collectionRate, defaulters: DEFAULTERS.length, overdueCount };
  }, []);

  function getStatusBadge(status: PaymentStatus): { bg: string; text: string } {
    switch (status) {
      case 'Completed': return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'Pending': return { bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'Partial': return { bg: 'bg-amber-100', text: 'text-amber-700' };
      case 'Overdue': return { bg: 'bg-red-100', text: 'text-red-700' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  }

  function handleEditClick(item: FeeStructureItem): void {
    setEditingItem(item);
    setEditForm({ amount: String(item.amount), frequency: item.frequency, dueDate: item.dueDate });
  }

  function handleEditSave(): void {
    if (!editingItem) return;
    const amount = Number(editForm.amount);
    if (!amount || amount <= 0) return;
    setFeeStructures((prev) => prev.map((fs) =>
      fs.id === editingItem.id ? { ...fs, amount, frequency: editForm.frequency, dueDate: editForm.dueDate } : fs
    ));
    setEditingItem(null);
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'paid', label: `Paid (${paidPayments.length})` },
    { key: 'overdue', label: `Overdue/Pending (${stats.overdueCount})` },
    { key: 'defaulters', label: `Defaulters (${DEFAULTERS.length})` },
    { key: 'structure', label: 'Fee Structure' },
  ];

  return (
    <PageContent>
      <PageHeader title="Fee Management" subtitle="Track payments, defaulters, and fee structures." breadcrumbs={[{ label: 'Home' }, { label: 'Fees' }]} />

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-green-100 p-2"><IndianRupee className="h-5 w-5 text-green-700" /></div><div><p className="text-xs text-[#A0A3BD]">Total Collected</p><p className="text-lg font-bold text-green-700">₹{(stats.totalCollected / 1000).toFixed(0)}K</p></div></div>
        </div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-red-100 p-2"><XCircle className="h-5 w-5 text-red-600" /></div><div><p className="text-xs text-[#A0A3BD]">Total Pending</p><p className="text-lg font-bold text-red-600">₹{(stats.totalPending / 1000).toFixed(0)}K</p></div></div>
        </div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-[#363473]/10 p-2"><Users className="h-5 w-5 text-[#363473]" /></div><div><p className="text-xs text-[#A0A3BD]">Students Paid</p><p className="text-xl font-bold text-[#1B1D3A]">{stats.totalStudents}</p></div></div>
        </div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2"><TrendingUp className="h-5 w-5 text-blue-700" /></div><div><p className="text-xs text-[#A0A3BD]">Collection Rate</p><p className="text-xl font-bold text-[#1B1D3A]">{stats.collectionRate}%</p></div></div>
        </div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-amber-100 p-2"><AlertTriangle className="h-5 w-5 text-amber-700" /></div><div><p className="text-xs text-[#A0A3BD]">Defaulters</p><p className="text-xl font-bold text-amber-700">{stats.defaulters}</p></div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1 rounded-xl bg-[#F5F6FA] p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} type="button" onClick={() => { setActiveTab(tab.key); setPage(1); setSearchQuery(''); }}
            className={`whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-[#363473] text-white shadow-sm' : 'text-[#6E7191] hover:text-[#1B1D3A] hover:bg-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      {activeTab !== 'structure' && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A3BD]" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="rounded-lg border border-[#ECEDF3] bg-white pl-9 pr-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473] w-[220px]" />
          </div>
          <div className="ml-auto">
            {hasPermission('fees', 'collect') && (
              <button type="button" onClick={() => navigate('/fees/make-payment')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1B1D3A] transition-colors">
                <Plus className="h-4 w-4" /> Make Payment
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {(activeTab === 'paid' || activeTab === 'overdue') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Receipt #</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Student</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Course</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Paid</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Method</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Date</th>
                </tr></thead>
                <tbody>
                  {(paginated as PaymentRecord[]).map((p) => { const badge = getStatusBadge(p.status); return (
                    <tr key={p.id} className="border-b border-[#ECEDF3] last:border-b-0 hover:bg-[#F5F6FA] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#6E7191]">{p.receiptNo}</td>
                      <td className="px-4 py-3 font-medium text-[#1B1D3A]">{p.studentName}</td>
                      <td className="px-4 py-3"><span className="inline-flex rounded-md bg-[#ECEDF3] px-2 py-0.5 text-xs font-medium text-[#1B1D3A]">{p.course}</span></td>
                      <td className="px-4 py-3 text-[#6E7191]">{p.category}</td>
                      <td className="px-4 py-3 text-[#6E7191]">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 font-medium text-[#1B1D3A]">₹{p.paidAmount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-[#6E7191]">{p.method}</td>
                      <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>{p.status}</span></td>
                      <td className="px-4 py-3 text-[#6E7191]">{p.date}</td>
                    </tr>); })}
                  {paginated.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-[#A0A3BD]">No records found.</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'defaulters' && (
          <motion.div key="defaulters" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Student</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">ID Card</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Course</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Total Due</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Paid</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Pending</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Days Overdue</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Parent Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Last Reminder</th>
                </tr></thead>
                <tbody>
                  {(paginated as Defaulter[]).map((d) => (
                    <tr key={d.id} className="border-b border-[#ECEDF3] last:border-b-0 hover:bg-[#F5F6FA] transition-colors">
                      <td className="px-4 py-3 font-medium text-[#1B1D3A]">{d.studentName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#6E7191]">{d.idCard}</td>
                      <td className="px-4 py-3"><span className="inline-flex rounded-md bg-[#ECEDF3] px-2 py-0.5 text-xs font-medium text-[#1B1D3A]">{d.course}</span></td>
                      <td className="px-4 py-3 text-[#6E7191]">₹{d.totalDue.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-green-700 font-medium">₹{d.paid.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-red-600 font-medium">₹{d.pending.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3"><span className={`font-medium ${d.daysOverdue > 60 ? 'text-red-600' : d.daysOverdue > 30 ? 'text-amber-600' : 'text-[#1B1D3A]'}`}>{d.daysOverdue} days</span></td>
                      <td className="px-4 py-3 text-[#6E7191]">{d.parentPhone}</td>
                      <td className="px-4 py-3 text-[#6E7191]">{d.lastReminder ?? '—'}</td>
                    </tr>
                  ))}
                  {paginated.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-[#A0A3BD]">No defaulters found.</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'structure' && (
          <motion.div key="structure" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Course</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Frequency</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Due Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Actions</th>
                </tr></thead>
                <tbody>
                  {(paginated as FeeStructureItem[]).map((fs) => (
                    <tr key={fs.id} className="border-b border-[#ECEDF3] last:border-b-0 hover:bg-[#F5F6FA] transition-colors">
                      <td className="px-4 py-3"><span className="inline-flex rounded-md bg-[#ECEDF3] px-2 py-0.5 text-xs font-medium text-[#1B1D3A]">{fs.course}</span></td>
                      <td className="px-4 py-3 font-medium text-[#1B1D3A]">{fs.category}</td>
                      <td className="px-4 py-3 font-medium text-[#1B1D3A]">₹{fs.amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-[#6E7191]">{fs.frequency}</td>
                      <td className="px-4 py-3 text-[#6E7191]">{fs.dueDate}</td>
                      <td className="px-4 py-3">
                        {hasPermission('fees', 'edit') && (
                          <button type="button" onClick={() => handleEditClick(fs)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-2.5 py-1 text-xs font-medium text-[#363473] hover:bg-[#F5F6FA] transition-colors">
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-[#6E7191]">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, currentData.length)} of {currentData.length}</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Prev</button>
            <span className="text-sm font-medium text-[#1B1D3A]">{page} / {totalPages}</span>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Edit Fee Structure Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setEditingItem(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[#1B1D3A]">Edit Fee Structure</h2>
                <button type="button" onClick={() => setEditingItem(null)} className="rounded-lg p-1 hover:bg-[#F5F6FA]"><X className="h-5 w-5 text-[#6E7191]" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Course</label>
                    <input type="text" value={editingItem.course} disabled className="w-full rounded-lg border border-[#ECEDF3] bg-[#F5F6FA] px-3 py-2 text-sm text-[#6E7191]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Category</label>
                    <input type="text" value={editingItem.category} disabled className="w-full rounded-lg border border-[#ECEDF3] bg-[#F5F6FA] px-3 py-2 text-sm text-[#6E7191]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Amount (₹) *</label>
                  <input type="number" min="0" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Frequency</label>
                  <select value={editForm.frequency} onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                    <option value="One Time">One Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Due Date</label>
                  <input type="text" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" placeholder="e.g. 2024-12-15 or Monthly 5th" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingItem(null)} className="rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]">Cancel</button>
                <button type="button" onClick={handleEditSave} className="rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors">Save Changes</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContent>
  );
}
