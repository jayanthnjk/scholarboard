/**
 * Student List Page - Standalone with local mock data.
 * Paginated table with search, course/status filter, and student profile navigation.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import {
  Search, ChevronLeft, ChevronRight, Plus, Users,
  GraduationCap, CheckCircle, UserX, Trash2,
} from 'lucide-react';

type StudentStatus = 'Active' | 'Inactive' | 'Graduated' | 'Transferred';

interface Student {
  id: string; name: string; studentId: string; course: string; section: string;
  year: string; phone: string; email: string; status: StudentStatus; admissionDate: string;
  fatherName: string; attendance: number;
}

const STUDENTS: Student[] = [
  { id: '1', name: 'Ravi Kumar', studentId: 'SA2024-MPC-001', course: 'MPC', section: 'A', year: '1st Year', phone: '+91 9876543201', email: 'ravi.k@student.sa.edu', status: 'Active', admissionDate: '2024-06-15', fatherName: 'Suresh Kumar', attendance: 92 },
  { id: '2', name: 'Priya Sharma', studentId: 'SA2024-BiPC-002', course: 'BiPC', section: 'A', year: '1st Year', phone: '+91 9876543202', email: 'priya.s@student.sa.edu', status: 'Active', admissionDate: '2024-06-15', fatherName: 'Ramesh Sharma', attendance: 88 },
  { id: '3', name: 'Arjun Reddy', studentId: 'SA2024-MPC-003', course: 'MPC', section: 'B', year: '1st Year', phone: '+91 9876543203', email: 'arjun.r@student.sa.edu', status: 'Active', admissionDate: '2024-06-16', fatherName: 'Venkat Reddy', attendance: 75 },
  { id: '4', name: 'Kavitha Rao', studentId: 'SA2024-CEC-004', course: 'CEC', section: 'A', year: '1st Year', phone: '+91 9876543204', email: 'kavitha.r@student.sa.edu', status: 'Active', admissionDate: '2024-06-16', fatherName: 'Srinivas Rao', attendance: 95 },
  { id: '5', name: 'Deepak Yadav', studentId: 'SA2024-MEC-005', course: 'MEC', section: 'A', year: '1st Year', phone: '+91 9876543205', email: 'deepak.y@student.sa.edu', status: 'Active', admissionDate: '2024-06-17', fatherName: 'Mahesh Yadav', attendance: 68 },
  { id: '6', name: 'Ananya Gupta', studentId: 'SA2024-HEC-006', course: 'HEC', section: 'A', year: '1st Year', phone: '+91 9876543206', email: 'ananya.g@student.sa.edu', status: 'Active', admissionDate: '2024-06-17', fatherName: 'Rajesh Gupta', attendance: 90 },
  { id: '7', name: 'Vikram Naidu', studentId: 'SA2024-MPC-007', course: 'MPC', section: 'A', year: '2nd Year', phone: '+91 9876543207', email: 'vikram.n@student.sa.edu', status: 'Active', admissionDate: '2023-06-15', fatherName: 'Sai Naidu', attendance: 85 },
  { id: '8', name: 'Meera Devi', studentId: 'SA2024-BiPC-008', course: 'BiPC', section: 'B', year: '2nd Year', phone: '+91 9876543208', email: 'meera.d@student.sa.edu', status: 'Active', admissionDate: '2023-06-15', fatherName: 'Krishna Devi', attendance: 91 },
  { id: '9', name: 'Rahul Verma', studentId: 'SA2024-MPC-009', course: 'MPC', section: 'B', year: '2nd Year', phone: '+91 9876543209', email: 'rahul.v@student.sa.edu', status: 'Graduated', admissionDate: '2022-06-15', fatherName: 'Anil Verma', attendance: 82 },
  { id: '10', name: 'Swathi Reddy', studentId: 'SA2024-CEC-010', course: 'CEC', section: 'A', year: '2nd Year', phone: '+91 9876543210', email: 'swathi.r@student.sa.edu', status: 'Active', admissionDate: '2023-06-16', fatherName: 'Ramana Reddy', attendance: 78 },
  { id: '11', name: 'Manish Kumar', studentId: 'SA2024-MEC-011', course: 'MEC', section: 'A', year: '1st Year', phone: '+91 9876543211', email: 'manish.k@student.sa.edu', status: 'Active', admissionDate: '2024-06-18', fatherName: 'Dinesh Kumar', attendance: 88 },
  { id: '12', name: 'Pooja Lakshmi', studentId: 'SA2024-BiPC-012', course: 'BiPC', section: 'A', year: '1st Year', phone: '+91 9876543212', email: 'pooja.l@student.sa.edu', status: 'Active', admissionDate: '2024-06-18', fatherName: 'Rajan L', attendance: 94 },
  { id: '13', name: 'Sanjay Rao', studentId: 'SA2023-MPC-013', course: 'MPC', section: 'A', year: '2nd Year', phone: '+91 9876543213', email: 'sanjay.r@student.sa.edu', status: 'Transferred', admissionDate: '2023-06-15', fatherName: 'Mohan Rao', attendance: 72 },
  { id: '14', name: 'Nisha Kumari', studentId: 'SA2024-MPC-014', course: 'MPC', section: 'B', year: '1st Year', phone: '+91 9876543214', email: 'nisha.k@student.sa.edu', status: 'Active', admissionDate: '2024-06-19', fatherName: 'Kiran Kumar', attendance: 87 },
  { id: '15', name: 'Kiran Reddy', studentId: 'SA2024-BiPC-015', course: 'BiPC', section: 'B', year: '1st Year', phone: '+91 9876543215', email: 'kiran.r@student.sa.edu', status: 'Active', admissionDate: '2024-06-19', fatherName: 'Srinivas Reddy', attendance: 93 },
  { id: '16', name: 'Harish Babu', studentId: 'SA2024-MPC-016', course: 'MPC', section: 'A', year: '1st Year', phone: '+91 9876543216', email: 'harish.b@student.sa.edu', status: 'Inactive', admissionDate: '2024-06-20', fatherName: 'Babu Rao', attendance: 45 },
];

const COURSES = ['MPC', 'BiPC', 'CEC', 'MEC', 'HEC'];
const PAGE_SIZE = 10;

function getStatusBadge(status: StudentStatus): { bg: string; text: string } {
  switch (status) {
    case 'Active': return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'Inactive': return { bg: 'bg-gray-100', text: 'text-gray-600' };
    case 'Graduated': return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'Transferred': return { bg: 'bg-amber-100', text: 'text-amber-700' };
  }
}

function StudentListPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterStatus, setFilterStatus] = useState<StudentStatus | 'All'>('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = STUDENTS;
    if (filterCourse !== 'All') result = result.filter((s) => s.course === filterCourse);
    if (filterStatus !== 'All') result = result.filter((s) => s.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q));
    }
    return result;
  }, [filterCourse, filterStatus, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = { total: STUDENTS.length, active: STUDENTS.filter((s) => s.status === 'Active').length, graduated: STUDENTS.filter((s) => s.status === 'Graduated').length, inactive: STUDENTS.filter((s) => s.status === 'Inactive' || s.status === 'Transferred').length };

  return (
    <PageContent>
      <PageHeader title="Students" subtitle={`${STUDENTS.length} students enrolled`} breadcrumbs={[{ label: 'Home' }, { label: 'Students' }]} />

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-lg bg-[#363473]/10 p-2"><Users className="h-5 w-5 text-[#363473]" /></div><div><p className="text-xs text-[#A0A3BD]">Total Students</p><p className="text-xl font-bold text-[#1B1D3A]">{stats.total}</p></div></div></div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-lg bg-green-100 p-2"><CheckCircle className="h-5 w-5 text-green-700" /></div><div><p className="text-xs text-[#A0A3BD]">Active</p><p className="text-xl font-bold text-green-700">{stats.active}</p></div></div></div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2"><GraduationCap className="h-5 w-5 text-blue-700" /></div><div><p className="text-xs text-[#A0A3BD]">Graduated</p><p className="text-xl font-bold text-blue-700">{stats.graduated}</p></div></div></div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-lg bg-amber-100 p-2"><UserX className="h-5 w-5 text-amber-700" /></div><div><p className="text-xs text-[#A0A3BD]">Inactive/Transferred</p><p className="text-xl font-bold text-amber-700">{stats.inactive}</p></div></div></div>
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A3BD]" /><input type="text" placeholder="Search name, ID, email..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="rounded-lg border border-[#ECEDF3] bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473] w-[240px]" /></div>
        <select value={filterCourse} onChange={(e) => { setFilterCourse(e.target.value); setPage(1); }} className="rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]"><option value="All">All Courses</option>{COURSES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as StudentStatus | 'All'); setPage(1); }} className="rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]"><option value="All">All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Graduated">Graduated</option><option value="Transferred">Transferred</option></select>
        <div className="ml-auto"><button type="button" onClick={() => navigate('/admissions')} className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors"><Plus className="h-4 w-4" /> New Admission</button></div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
            <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Student ID</th>
            <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Course</th>
            <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Section</th>
            <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Year</th>
            <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Phone</th>
            <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Attendance</th>
            <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Actions</th>
          </tr></thead>
          <tbody>
            {paginated.map((s) => { const badge = getStatusBadge(s.status); return (
              <tr key={s.id} onClick={() => navigate(`/students/${s.id}`)} className="border-b border-[#ECEDF3] last:border-b-0 cursor-pointer hover:bg-[#F5F6FA] transition-colors">
                <td className="px-4 py-3 font-medium text-[#1B1D3A]">{s.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-[#6E7191]">{s.studentId}</td>
                <td className="px-4 py-3"><span className="inline-flex rounded-md bg-[#ECEDF3] px-2 py-0.5 text-xs font-medium text-[#1B1D3A]">{s.course}</span></td>
                <td className="px-4 py-3 text-[#6E7191]">{s.section}</td>
                <td className="px-4 py-3 text-[#6E7191]">{s.year}</td>
                <td className="px-4 py-3 text-[#6E7191]">{s.phone}</td>
                <td className="px-4 py-3"><span className={`font-medium ${s.attendance >= 75 ? 'text-green-700' : 'text-red-600'}`}>{s.attendance}%</span></td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>{s.status}</span></td>
                <td className="px-4 py-3"><button type="button" onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${s.name}?`)) { /* handled by state in real app */ } }} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button></td>
              </tr>); })}
            {paginated.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-[#A0A3BD]">No students found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-[#6E7191]">Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((p) => Math.max(1,p-1))} disabled={page===1} className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Prev</button>
            <span className="text-sm font-medium text-[#1B1D3A]">{page}/{totalPages}</span>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages,p+1))} disabled={page===totalPages} className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </PageContent>
  );
}

export { StudentListPage };
