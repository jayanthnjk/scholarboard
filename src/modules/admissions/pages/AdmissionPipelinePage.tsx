/**
 * Admission Pipeline Page - Table view for registration/admissions management.
 * Navy-purple theme with status badges, modal form, filters, and pagination.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { AnimatePresence, motion } from 'framer-motion';
import { UserPlus, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';

// --- Types ---

type EnquiryStatus = 'Inquiry' | 'Applied' | 'Verified' | 'Interview' | 'Offered' | 'Enrolled' | 'Rejected';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  previousInstitution: string;
  notes: string;
  status: EnquiryStatus;
  date: string;
}

interface NewEnquiryForm {
  name: string;
  email: string;
  phone: string;
  course: string;
  previousInstitution: string;
  notes: string;
}

// --- Constants ---

const STATUS_OPTIONS: EnquiryStatus[] = ['Inquiry', 'Applied', 'Verified', 'Interview', 'Offered', 'Enrolled', 'Rejected'];

const COURSE_OPTIONS: string[] = [
  'Computer Science', 'Mechanical Engineering', 'MBA', 'Electrical Engineering',
  'Civil Engineering', 'Data Science',
];

const STATUS_COLORS: Record<EnquiryStatus, string> = {
  Inquiry: 'bg-blue-100 text-blue-800',
  Applied: 'bg-purple-100 text-purple-800',
  Verified: 'bg-indigo-100 text-indigo-800',
  Interview: 'bg-yellow-100 text-yellow-800',
  Offered: 'bg-green-100 text-green-800',
  Enrolled: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-800',
};

const INITIAL_ENQUIRIES: Enquiry[] = [
  { id: '1', name: 'Amit Patel', email: 'amit.patel@email.com', phone: '+91 9876543210', course: 'Computer Science', previousInstitution: 'Delhi Public School', notes: 'Interested in AI track', status: 'Inquiry', date: '2024-12-01' },
  { id: '2', name: 'Sneha Reddy', email: 'sneha.r@email.com', phone: '+91 9876543211', course: 'MBA', previousInstitution: 'St. Josephs College', notes: 'Has 3 years work experience', status: 'Applied', date: '2024-12-02' },
  { id: '3', name: 'Ravi Kumar', email: 'ravi.k@email.com', phone: '+91 9876543212', course: 'Mechanical Engineering', previousInstitution: 'Kendriya Vidyalaya', notes: '', status: 'Verified', date: '2024-12-03' },
  { id: '4', name: 'Priya Sharma', email: 'priya.s@email.com', phone: '+91 9876543213', course: 'Data Science', previousInstitution: 'Modern School', notes: 'Strong in mathematics', status: 'Interview', date: '2024-12-04' },
  { id: '5', name: 'Arjun Nair', email: 'arjun.n@email.com', phone: '+91 9876543214', course: 'Electrical Engineering', previousInstitution: 'Army Public School', notes: '', status: 'Offered', date: '2024-12-05' },
  { id: '6', name: 'Kavitha Menon', email: 'kavitha.m@email.com', phone: '+91 9876543215', course: 'Computer Science', previousInstitution: 'Chinmaya Vidyalaya', notes: 'Gold medal in state olympiad', status: 'Enrolled', date: '2024-12-06' },
  { id: '7', name: 'Deepak Joshi', email: 'deepak.j@email.com', phone: '+91 9876543216', course: 'Civil Engineering', previousInstitution: 'DAV School', notes: 'Looking for scholarship', status: 'Rejected', date: '2024-12-07' },
  { id: '8', name: 'Ananya Gupta', email: 'ananya.g@email.com', phone: '+91 9876543217', course: 'MBA', previousInstitution: 'Christ University', notes: 'GMAT score 720', status: 'Applied', date: '2024-12-08' },
  { id: '9', name: 'Vikram Singh', email: 'vikram.s@email.com', phone: '+91 9876543218', course: 'Computer Science', previousInstitution: 'Ryan International', notes: 'Open source contributor', status: 'Inquiry', date: '2024-12-09' },
  { id: '10', name: 'Meera Das', email: 'meera.d@email.com', phone: '+91 9876543219', course: 'Data Science', previousInstitution: 'La Martiniere', notes: 'Published research paper', status: 'Verified', date: '2024-12-10' },
  { id: '11', name: 'Rahul Verma', email: 'rahul.v@email.com', phone: '+91 9876543220', course: 'Mechanical Engineering', previousInstitution: 'Bishop Cotton', notes: '', status: 'Interview', date: '2024-12-11' },
  { id: '12', name: 'Swati Pandey', email: 'swati.p@email.com', phone: '+91 9876543221', course: 'Electrical Engineering', previousInstitution: 'Springdales', notes: 'State rank holder', status: 'Offered', date: '2024-12-12' },
  { id: '13', name: 'Manish Tiwari', email: 'manish.t@email.com', phone: '+91 9876543222', course: 'Civil Engineering', previousInstitution: 'DPS RK Puram', notes: '', status: 'Enrolled', date: '2024-12-13' },
  { id: '14', name: 'Pooja Iyer', email: 'pooja.i@email.com', phone: '+91 9876543223', course: 'Computer Science', previousInstitution: 'National Public School', notes: 'Wants to specialize in ML', status: 'Inquiry', date: '2024-12-14' },
  { id: '15', name: 'Sanjay Rao', email: 'sanjay.r@email.com', phone: '+91 9876543224', course: 'MBA', previousInstitution: 'Loyola College', notes: '5 years in consulting', status: 'Applied', date: '2024-12-15' },
  { id: '16', name: 'Nisha Agarwal', email: 'nisha.a@email.com', phone: '+91 9876543225', course: 'Data Science', previousInstitution: 'Amity School', notes: 'Python certified', status: 'Verified', date: '2024-12-16' },
];

const PAGE_SIZE = 8;

// --- Component ---

export function AdmissionPipelinePage(): React.JSX.Element {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<Enquiry[]>(INITIAL_ENQUIRIES);
  const [filterStatus, setFilterStatus] = useState<EnquiryStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<NewEnquiryForm>({
    name: '', email: '', phone: '', course: '', previousInstitution: '', notes: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewEnquiryForm, string>>>({});

  const filteredEnquiries = useMemo(() => {
    let result = enquiries;
    if (filterStatus !== 'All') result = result.filter((e) => e.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.phone.includes(q) ||
        e.course.toLowerCase().includes(q)
      );
    }
    return result;
  }, [enquiries, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filteredEnquiries.length / PAGE_SIZE);
  const paginatedEnquiries = filteredEnquiries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function validateForm(): boolean {
    const errors: Partial<Record<keyof NewEnquiryForm, string>> = {};
    if (!formData.name.trim()) errors.name = 'Required';
    if (!formData.email.trim()) errors.email = 'Required';
    if (!formData.phone.trim()) errors.phone = 'Required';
    if (!formData.course) errors.course = 'Required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSave(): void {
    if (!validateForm()) return;
    const newEnquiry: Enquiry = {
      id: String(Date.now()),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      course: formData.course,
      previousInstitution: formData.previousInstitution.trim(),
      notes: formData.notes.trim(),
      status: 'Inquiry',
      date: new Date().toISOString().split('T')[0] ?? '',
    };
    setEnquiries((prev) => [newEnquiry, ...prev]);
    setShowModal(false);
    setFormData({ name: '', email: '', phone: '', course: '', previousInstitution: '', notes: '' });
    setFormErrors({});
    setCurrentPage(1);
  }

  return (
    <PageContent>
      <PageHeader
        title="Registration"
        subtitle="Manage student enquiries and admissions pipeline."
        breadcrumbs={[{ label: 'Home' }, { label: 'Registration' }]}
      />

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A3BD]" />
            <input
              type="text"
              placeholder="Search by name, email, phone, course..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="rounded-lg border border-[#ECEDF3] bg-white pl-9 pr-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473] w-[260px]"
            />
          </div>
          <label htmlFor="status-filter" className="text-sm font-medium text-[#1B1D3A]">Filter:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as EnquiryStatus | 'All'); setCurrentPage(1); }}
            className="rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473]"
          >
            <option value="All">All Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1B1D3A] transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          New Enquiry
        </button>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
              <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Contact</th>
              <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Course Applied</th>
              <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEnquiries.map((enquiry) => (
              <tr key={enquiry.id} onClick={() => navigate(`/admissions/${enquiry.id}`)} className="border-b border-[#ECEDF3] last:border-b-0 cursor-pointer hover:bg-[#F5F6FA] transition-colors">
                <td className="px-4 py-3 font-medium text-[#1B1D3A]">{enquiry.name}</td>
                <td className="px-4 py-3 text-[#6E7191]">
                  <div>{enquiry.email}</div>
                  <div className="text-xs">{enquiry.phone}</div>
                </td>
                <td className="px-4 py-3 text-[#6E7191]">{enquiry.course}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[enquiry.status]}`}>
                    {enquiry.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#6E7191]">{enquiry.date}</td>
              </tr>
            ))}
            {paginatedEnquiries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#A0A3BD]">No enquiries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-[#6E7191]">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredEnquiries.length)} of {filteredEnquiries.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="inline-flex items-center rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-[#1B1D3A]">{currentPage} / {totalPages}</span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="inline-flex items-center rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* New Enquiry Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[#1B1D3A]">New Enquiry</h2>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-[#F5F6FA]">
                  <X className="h-5 w-5 text-[#6E7191]" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Student Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]"
                  />
                  {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]"
                    />
                    {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]"
                    />
                    {formErrors.phone && <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Course *</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]"
                  >
                    <option value="">Select Course</option>
                    {COURSE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {formErrors.course && <p className="mt-1 text-xs text-red-600">{formErrors.course}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Previous Institution</label>
                  <input
                    type="text"
                    value={formData.previousInstitution}
                    onChange={(e) => setFormData({ ...formData, previousInstitution: e.target.value })}
                    className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473] resize-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContent>
  );
}
