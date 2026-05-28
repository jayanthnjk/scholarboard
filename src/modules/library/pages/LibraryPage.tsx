/**
 * Library Module - Full implementation with book catalog, borrowing records,
 * new issue entry, return books, fine tracking, and search/filter.
 */

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen, Plus, X, Search, ChevronLeft, ChevronRight,
  RotateCcw, AlertTriangle, CheckCircle, Clock, IndianRupee,
} from 'lucide-react';
import {
  BOOKS, INITIAL_BORROW_RECORDS, BOOK_CATEGORIES, FINE_PER_DAY,
} from '../data';
import type { Book, BorrowRecord, BorrowStatus, NewBorrowForm } from '../data';

// --- Types ---
type TabKey = 'catalog' | 'borrowed' | 'overdue';
const PAGE_SIZE = 8;

// --- Helpers ---
function getStatusBadge(status: BorrowStatus): { bg: string; text: string } {
  switch (status) {
    case 'Active': return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'Returned': return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'Overdue': return { bg: 'bg-red-100', text: 'text-red-700' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

// --- Component ---
export function LibraryPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>('catalog');
  const [books] = useState<Book[]>(BOOKS);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>(INITIAL_BORROW_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState<BorrowStatus | 'All'>('All');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState<string | null>(null);
  const [catalogPage, setCatalogPage] = useState(1);
  const [borrowPage, setBorrowPage] = useState(1);
  const [formData, setFormData] = useState<NewBorrowForm>({ studentName: '', idCardNumber: '', course: '', bookId: '', issueDate: new Date().toISOString().split('T')[0] ?? '', dueDate: '' });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewBorrowForm, string>>>({});

  // Filtered books
  const filteredBooks = useMemo(() => {
    let result = books;
    if (filterCategory !== 'All') result = result.filter((b) => b.category === filterCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q));
    }
    return result;
  }, [books, filterCategory, searchQuery]);

  // Filtered borrow records
  const filteredBorrows = useMemo(() => {
    let result = borrowRecords;
    if (activeTab === 'overdue') result = result.filter((r) => r.status === 'Overdue');
    else if (filterStatus !== 'All') result = result.filter((r) => r.status === filterStatus);
    if (searchQuery.trim() && activeTab !== 'catalog') {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.studentName.toLowerCase().includes(q) || r.bookTitle.toLowerCase().includes(q) || r.idCardNumber.toLowerCase().includes(q));
    }
    return result;
  }, [borrowRecords, activeTab, filterStatus, searchQuery]);

  // Pagination
  const catalogTotalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const paginatedBooks = filteredBooks.slice((catalogPage - 1) * PAGE_SIZE, catalogPage * PAGE_SIZE);
  const borrowTotalPages = Math.max(1, Math.ceil(filteredBorrows.length / PAGE_SIZE));
  const paginatedBorrows = filteredBorrows.slice((borrowPage - 1) * PAGE_SIZE, borrowPage * PAGE_SIZE);

  // Stats
  const stats = useMemo(() => {
    const totalBooks = books.reduce((s, b) => s + b.totalCopies, 0);
    const available = books.reduce((s, b) => s + b.availableCopies, 0);
    const activeIssues = borrowRecords.filter((r) => r.status === 'Active').length;
    const overdueCount = borrowRecords.filter((r) => r.status === 'Overdue').length;
    const totalFines = borrowRecords.filter((r) => !r.finePaid && r.fineAmount > 0).reduce((s, r) => s + r.fineAmount, 0);
    return { totalBooks, available, activeIssues, overdueCount, totalFines };
  }, [books, borrowRecords]);

  // Issue book
  function handleIssueBook(): void {
    const errors: Partial<Record<keyof NewBorrowForm, string>> = {};
    if (!formData.studentName.trim()) errors.studentName = 'Required';
    if (!formData.idCardNumber.trim()) errors.idCardNumber = 'Required';
    if (!formData.course.trim()) errors.course = 'Required';
    if (!formData.bookId) errors.bookId = 'Required';
    if (!formData.issueDate) errors.issueDate = 'Required';
    if (!formData.dueDate) errors.dueDate = 'Required';
    if (formData.dueDate && formData.issueDate && formData.dueDate <= formData.issueDate) errors.dueDate = 'Must be after issue date';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const book = books.find((b) => b.id === formData.bookId);
    if (!book || book.availableCopies <= 0) { setFormErrors({ bookId: 'Book not available' }); return; }

    const newRecord: BorrowRecord = {
      id: `br${Date.now()}`,
      bookId: formData.bookId,
      bookTitle: book.title,
      studentId: `s${Date.now()}`,
      studentName: formData.studentName.trim(),
      idCardNumber: formData.idCardNumber.trim(),
      course: formData.course.trim(),
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      returnDate: null,
      status: 'Active',
      fineAmount: 0,
      finePaid: true,
    };
    setBorrowRecords((prev) => [newRecord, ...prev]);
    setShowIssueModal(false);
    setFormData({ studentName: '', idCardNumber: '', course: '', bookId: '', issueDate: new Date().toISOString().split('T')[0] ?? '', dueDate: '' });
    setFormErrors({});
  }

  // Return book
  function handleReturnBook(recordId: string): void {
    const today = new Date().toISOString().split('T')[0] ?? '';
    setBorrowRecords((prev) => prev.map((r) => {
      if (r.id !== recordId) return r;
      const dueDate = new Date(r.dueDate);
      const returnDate = new Date(today);
      const daysOverdue = Math.max(0, Math.floor((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
      const fine = daysOverdue * FINE_PER_DAY;
      return { ...r, returnDate: today, status: 'Returned' as BorrowStatus, fineAmount: fine, finePaid: fine === 0 };
    }));
    setShowReturnModal(null);
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'catalog', label: 'Book Catalog' },
    { key: 'borrowed', label: 'Borrowing Records' },
    { key: 'overdue', label: `Overdue (${stats.overdueCount})` },
  ];

  return (
    <PageContent>
      <PageHeader title="Library" subtitle="Manage books, issues, returns, and fines." breadcrumbs={[{ label: 'Home' }, { label: 'Library' }]} />

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-[#363473]/10 p-2"><BookOpen className="h-5 w-5 text-[#363473]" /></div><div><p className="text-xs text-[#A0A3BD]">Total Books</p><p className="text-xl font-bold text-[#1B1D3A]">{stats.totalBooks}</p></div></div>
        </div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-green-100 p-2"><CheckCircle className="h-5 w-5 text-green-700" /></div><div><p className="text-xs text-[#A0A3BD]">Available</p><p className="text-xl font-bold text-green-700">{stats.available}</p></div></div>
        </div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2"><Clock className="h-5 w-5 text-blue-700" /></div><div><p className="text-xs text-[#A0A3BD]">Active Issues</p><p className="text-xl font-bold text-blue-700">{stats.activeIssues}</p></div></div>
        </div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-red-100 p-2"><AlertTriangle className="h-5 w-5 text-red-600" /></div><div><p className="text-xs text-[#A0A3BD]">Overdue</p><p className="text-xl font-bold text-red-600">{stats.overdueCount}</p></div></div>
        </div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-amber-100 p-2"><IndianRupee className="h-5 w-5 text-amber-700" /></div><div><p className="text-xs text-[#A0A3BD]">Pending Fines</p><p className="text-xl font-bold text-amber-700">₹{stats.totalFines}</p></div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1 rounded-xl bg-[#F5F6FA] p-1">
        {tabs.map((tab) => (
          <button key={tab.key} type="button" onClick={() => { setActiveTab(tab.key); setSearchQuery(''); setBorrowPage(1); setCatalogPage(1); }}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-[#363473] text-white shadow-sm' : 'text-[#6E7191] hover:text-[#1B1D3A] hover:bg-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A3BD]" />
          <input type="text" placeholder={activeTab === 'catalog' ? 'Search books...' : 'Search by student/book/ID...'} value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCatalogPage(1); setBorrowPage(1); }}
            className="rounded-lg border border-[#ECEDF3] bg-white pl-9 pr-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473] w-[240px]" />
        </div>
        {activeTab === 'catalog' && (
          <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCatalogPage(1); }}
            className="rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473]">
            <option value="All">All Categories</option>
            {BOOK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        {activeTab === 'borrowed' && (
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as BorrowStatus | 'All'); setBorrowPage(1); }}
            className="rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473]">
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Returned">Returned</option>
            <option value="Overdue">Overdue</option>
          </select>
        )}
        <div className="ml-auto">
          <button type="button" onClick={() => setShowIssueModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1B1D3A] transition-colors">
            <Plus className="h-4 w-4" /> Issue Book
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'catalog' && (
          <motion.div key="catalog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Author</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">ISBN</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Copies</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Available</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Shelf</th>
                </tr></thead>
                <tbody>
                  {paginatedBooks.map((book) => (
                    <tr key={book.id} className="border-b border-[#ECEDF3] last:border-b-0 hover:bg-[#F5F6FA] transition-colors">
                      <td className="px-4 py-3 font-medium text-[#1B1D3A]">{book.title}</td>
                      <td className="px-4 py-3 text-[#6E7191]">{book.author}</td>
                      <td className="px-4 py-3 text-[#6E7191] font-mono text-xs">{book.isbn}</td>
                      <td className="px-4 py-3"><span className="inline-flex rounded-md bg-[#ECEDF3] px-2 py-0.5 text-xs font-medium text-[#1B1D3A]">{book.category}</span></td>
                      <td className="px-4 py-3 text-[#6E7191]">{book.totalCopies}</td>
                      <td className="px-4 py-3"><span className={`font-medium ${book.availableCopies > 0 ? 'text-green-700' : 'text-red-600'}`}>{book.availableCopies}</span></td>
                      <td className="px-4 py-3 text-[#6E7191]">{book.shelfLocation}</td>
                    </tr>
                  ))}
                  {paginatedBooks.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-[#A0A3BD]">No books found.</td></tr>}
                </tbody>
              </table>
            </div>
            {catalogTotalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-[#6E7191]">Showing {(catalogPage - 1) * PAGE_SIZE + 1}–{Math.min(catalogPage * PAGE_SIZE, filteredBooks.length)} of {filteredBooks.length}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setCatalogPage((p) => Math.max(1, p - 1))} disabled={catalogPage === 1} className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Prev</button>
                  <span className="text-sm font-medium text-[#1B1D3A]">{catalogPage} / {catalogTotalPages}</span>
                  <button type="button" onClick={() => setCatalogPage((p) => Math.min(catalogTotalPages, p + 1))} disabled={catalogPage === catalogTotalPages} className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {(activeTab === 'borrowed' || activeTab === 'overdue') && (
          <motion.div key="borrowed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Student</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">ID Card</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Book</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Course</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Issue Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Due Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Return Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Fine</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Action</th>
                </tr></thead>
                <tbody>
                  {paginatedBorrows.map((record) => {
                    const badge = getStatusBadge(record.status);
                    return (
                      <tr key={record.id} className="border-b border-[#ECEDF3] last:border-b-0 hover:bg-[#F5F6FA] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1B1D3A]">{record.studentName}</td>
                        <td className="px-4 py-3 text-[#6E7191] font-mono text-xs">{record.idCardNumber}</td>
                        <td className="px-4 py-3 text-[#6E7191]">{record.bookTitle}</td>
                        <td className="px-4 py-3"><span className="inline-flex rounded-md bg-[#ECEDF3] px-2 py-0.5 text-xs font-medium text-[#1B1D3A]">{record.course}</span></td>
                        <td className="px-4 py-3 text-[#6E7191]">{record.issueDate}</td>
                        <td className="px-4 py-3 text-[#6E7191]">{record.dueDate}</td>
                        <td className="px-4 py-3 text-[#6E7191]">{record.returnDate ?? '—'}</td>
                        <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>{record.status}</span></td>
                        <td className="px-4 py-3">{record.fineAmount > 0 ? <span className="font-medium text-red-600">₹{record.fineAmount}</span> : <span className="text-[#A0A3BD]">—</span>}</td>
                        <td className="px-4 py-3">
                          {record.status !== 'Returned' && (
                            <button type="button" onClick={() => setShowReturnModal(record.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-2.5 py-1 text-xs font-medium text-[#363473] hover:bg-[#F5F6FA] transition-colors">
                              <RotateCcw className="h-3 w-3" /> Return
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedBorrows.length === 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-[#A0A3BD]">No records found.</td></tr>}
                </tbody>
              </table>
            </div>
            {borrowTotalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-[#6E7191]">Showing {(borrowPage - 1) * PAGE_SIZE + 1}–{Math.min(borrowPage * PAGE_SIZE, filteredBorrows.length)} of {filteredBorrows.length}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setBorrowPage((p) => Math.max(1, p - 1))} disabled={borrowPage === 1} className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Prev</button>
                  <span className="text-sm font-medium text-[#1B1D3A]">{borrowPage} / {borrowTotalPages}</span>
                  <button type="button" onClick={() => setBorrowPage((p) => Math.min(borrowTotalPages, p + 1))} disabled={borrowPage === borrowTotalPages} className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issue Book Modal */}
      <AnimatePresence>
        {showIssueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowIssueModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[#1B1D3A]">Issue Book to Student</h2>
                <button type="button" onClick={() => setShowIssueModal(false)} className="rounded-lg p-1 hover:bg-[#F5F6FA]"><X className="h-5 w-5 text-[#6E7191]" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Student Name *</label>
                    <input type="text" value={formData.studentName} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                    {formErrors.studentName && <p className="mt-1 text-xs text-red-600">{formErrors.studentName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">ID Card Number *</label>
                    <input type="text" placeholder="SA2024-MPC-001" value={formData.idCardNumber} onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                    {formErrors.idCardNumber && <p className="mt-1 text-xs text-red-600">{formErrors.idCardNumber}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Course *</label>
                    <select value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                      <option value="">Select</option>
                      <option value="MPC">MPC</option><option value="BiPC">BiPC</option><option value="CEC">CEC</option><option value="MEC">MEC</option><option value="HEC">HEC</option>
                    </select>
                    {formErrors.course && <p className="mt-1 text-xs text-red-600">{formErrors.course}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Book *</label>
                    <select value={formData.bookId} onChange={(e) => setFormData({ ...formData, bookId: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                      <option value="">Select Book</option>
                      {books.filter((b) => b.availableCopies > 0).map((b) => <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} avail.)</option>)}
                    </select>
                    {formErrors.bookId && <p className="mt-1 text-xs text-red-600">{formErrors.bookId}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Issue Date *</label>
                    <input type="date" value={formData.issueDate} onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                    {formErrors.issueDate && <p className="mt-1 text-xs text-red-600">{formErrors.issueDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Due Date *</label>
                    <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                    {formErrors.dueDate && <p className="mt-1 text-xs text-red-600">{formErrors.dueDate}</p>}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowIssueModal(false)} className="rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]">Cancel</button>
                <button type="button" onClick={handleIssueBook} className="rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors">Issue Book</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Return Confirmation Modal */}
      <AnimatePresence>
        {showReturnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowReturnModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                  <RotateCcw className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#1B1D3A]">Return Book?</h3>
                <p className="mt-2 text-sm text-[#6E7191]">
                  Mark this book as returned. Any overdue fine will be calculated automatically.
                </p>
                <div className="mt-6 flex gap-3 w-full">
                  <button type="button" onClick={() => setShowReturnModal(null)} className="flex-1 rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]">Cancel</button>
                  <button type="button" onClick={() => handleReturnBook(showReturnModal)} className="flex-1 rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors">Confirm Return</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContent>
  );
}
