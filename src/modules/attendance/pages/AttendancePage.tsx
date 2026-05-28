/**
 * Attendance Module - Full implementation with daily marking, history view,
 * summary stats, add/edit/delete, course/date filtering.
 */

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle, XCircle, Clock, Users, Search,
  ChevronLeft, ChevronRight, Calendar, Trash2, Edit2, Save,
} from 'lucide-react';

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave';
type TabKey = 'mark' | 'history' | 'summary';

interface AttendanceRecord {
  id: string; studentName: string; idCard: string; course: string;
  date: string; status: AttendanceStatus; time: string; remarks: string;
}

const COURSES = ['MPC', 'BiPC', 'CEC', 'MEC', 'HEC'];
const STUDENTS = [
  { id: 's1', name: 'Ravi Kumar', idCard: 'SA2024-MPC-001', course: 'MPC' },
  { id: 's2', name: 'Priya Sharma', idCard: 'SA2024-BiPC-002', course: 'BiPC' },
  { id: 's3', name: 'Arjun Reddy', idCard: 'SA2024-MPC-003', course: 'MPC' },
  { id: 's4', name: 'Kavitha Rao', idCard: 'SA2024-CEC-004', course: 'CEC' },
  { id: 's5', name: 'Deepak Yadav', idCard: 'SA2024-MEC-005', course: 'MEC' },
  { id: 's6', name: 'Ananya Gupta', idCard: 'SA2024-HEC-006', course: 'HEC' },
  { id: 's7', name: 'Vikram Naidu', idCard: 'SA2024-MPC-007', course: 'MPC' },
  { id: 's8', name: 'Meera Devi', idCard: 'SA2024-BiPC-008', course: 'BiPC' },
  { id: 's9', name: 'Rahul Verma', idCard: 'SA2024-MPC-009', course: 'MPC' },
  { id: 's10', name: 'Swathi Reddy', idCard: 'SA2024-CEC-010', course: 'CEC' },
  { id: 's11', name: 'Manish Kumar', idCard: 'SA2024-MEC-011', course: 'MEC' },
  { id: 's12', name: 'Pooja Lakshmi', idCard: 'SA2024-BiPC-012', course: 'BiPC' },
];

const INITIAL_RECORDS: AttendanceRecord[] = [
  { id: 'a1', studentName: 'Ravi Kumar', idCard: 'SA2024-MPC-001', course: 'MPC', date: '2024-12-12', status: 'Present', time: '08:25', remarks: '' },
  { id: 'a2', studentName: 'Priya Sharma', idCard: 'SA2024-BiPC-002', course: 'BiPC', date: '2024-12-12', status: 'Present', time: '08:30', remarks: '' },
  { id: 'a3', studentName: 'Arjun Reddy', idCard: 'SA2024-MPC-003', course: 'MPC', date: '2024-12-12', status: 'Late', time: '08:45', remarks: 'Traffic' },
  { id: 'a4', studentName: 'Kavitha Rao', idCard: 'SA2024-CEC-004', course: 'CEC', date: '2024-12-12', status: 'Present', time: '08:28', remarks: '' },
  { id: 'a5', studentName: 'Deepak Yadav', idCard: 'SA2024-MEC-005', course: 'MEC', date: '2024-12-12', status: 'Absent', time: '', remarks: 'No info' },
  { id: 'a6', studentName: 'Ananya Gupta', idCard: 'SA2024-HEC-006', course: 'HEC', date: '2024-12-12', status: 'Present', time: '08:20', remarks: '' },
  { id: 'a7', studentName: 'Vikram Naidu', idCard: 'SA2024-MPC-007', course: 'MPC', date: '2024-12-12', status: 'Leave', time: '', remarks: 'Medical leave' },
  { id: 'a8', studentName: 'Meera Devi', idCard: 'SA2024-BiPC-008', course: 'BiPC', date: '2024-12-12', status: 'Present', time: '08:32', remarks: '' },
  { id: 'a9', studentName: 'Rahul Verma', idCard: 'SA2024-MPC-009', course: 'MPC', date: '2024-12-11', status: 'Present', time: '08:27', remarks: '' },
  { id: 'a10', studentName: 'Swathi Reddy', idCard: 'SA2024-CEC-010', course: 'CEC', date: '2024-12-11', status: 'Absent', time: '', remarks: '' },
  { id: 'a11', studentName: 'Manish Kumar', idCard: 'SA2024-MEC-011', course: 'MEC', date: '2024-12-11', status: 'Present', time: '08:30', remarks: '' },
  { id: 'a12', studentName: 'Pooja Lakshmi', idCard: 'SA2024-BiPC-012', course: 'BiPC', date: '2024-12-11', status: 'Late', time: '08:50', remarks: 'Bus late' },
];

const PAGE_SIZE = 8;

function getStatusBadge(s: AttendanceStatus): { bg: string; text: string } {
  switch (s) {
    case 'Present': return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'Absent': return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'Late': return { bg: 'bg-amber-100', text: 'text-amber-700' };
    case 'Leave': return { bg: 'bg-blue-100', text: 'text-blue-700' };
  }
}

export function AttendancePage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>('mark');
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0] ?? '2024-12-12');
  const [filterCourse, setFilterCourse] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [markingState, setMarkingState] = useState<Record<string, AttendanceStatus>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('Present');

  // Filtered history records
  const filteredRecords = useMemo(() => {
    let result = records;
    if (filterCourse !== 'All') result = result.filter((r) => r.course === filterCourse);
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); result = result.filter((r) => r.studentName.toLowerCase().includes(q) || r.idCard.toLowerCase().includes(q)); }
    return result;
  }, [records, filterCourse, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const paginated = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Students for marking (filtered by course)
  const markStudents = useMemo(() => {
    let s = STUDENTS;
    if (filterCourse !== 'All') s = s.filter((st) => st.course === filterCourse);
    return s;
  }, [filterCourse]);

  // Stats
  const todayRecords = records.filter((r) => r.date === selectedDate);
  const stats = { total: todayRecords.length, present: todayRecords.filter((r) => r.status === 'Present').length, absent: todayRecords.filter((r) => r.status === 'Absent').length, late: todayRecords.filter((r) => r.status === 'Late').length, leave: todayRecords.filter((r) => r.status === 'Leave').length };

  function handleMarkAll(): void {
    const now = new Date().toTimeString().slice(0, 5);
    const newRecords = markStudents.map((s) => ({
      id: `a${Date.now()}-${s.id}`, studentName: s.name, idCard: s.idCard, course: s.course,
      date: selectedDate, status: (markingState[s.id] ?? 'Present') as AttendanceStatus, time: markingState[s.id] === 'Absent' || markingState[s.id] === 'Leave' ? '' : now, remarks: '',
    }));
    setRecords((prev) => [...newRecords, ...prev]);
    setMarkingState({});
    setActiveTab('history');
  }

  function handleDelete(id: string): void { setRecords((prev) => prev.filter((r) => r.id !== id)); }

  function handleEditSave(id: string): void {
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, status: editStatus } : r));
    setEditingId(null);
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'mark', label: 'Mark Attendance' },
    { key: 'history', label: 'History' },
    { key: 'summary', label: 'Summary' },
  ];

  return (
    <PageContent>
      <PageHeader title="Attendance" subtitle="Track and manage student attendance." breadcrumbs={[{ label: 'Home' }, { label: 'Attendance' }]} />

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-lg bg-[#363473]/10 p-2"><Users className="h-5 w-5 text-[#363473]" /></div><div><p className="text-xs text-[#A0A3BD]">Total</p><p className="text-xl font-bold text-[#1B1D3A]">{stats.total}</p></div></div></div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-lg bg-green-100 p-2"><CheckCircle className="h-5 w-5 text-green-700" /></div><div><p className="text-xs text-[#A0A3BD]">Present</p><p className="text-xl font-bold text-green-700">{stats.present}</p></div></div></div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-lg bg-red-100 p-2"><XCircle className="h-5 w-5 text-red-600" /></div><div><p className="text-xs text-[#A0A3BD]">Absent</p><p className="text-xl font-bold text-red-600">{stats.absent}</p></div></div></div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-lg bg-amber-100 p-2"><Clock className="h-5 w-5 text-amber-700" /></div><div><p className="text-xs text-[#A0A3BD]">Late</p><p className="text-xl font-bold text-amber-700">{stats.late}</p></div></div></div>
        <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2"><Calendar className="h-5 w-5 text-blue-700" /></div><div><p className="text-xs text-[#A0A3BD]">Leave</p><p className="text-xl font-bold text-blue-700">{stats.leave}</p></div></div></div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1 rounded-xl bg-[#F5F6FA] p-1">
        {tabs.map((t) => (<button key={t.key} type="button" onClick={() => { setActiveTab(t.key); setPage(1); }} className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-[#363473] text-white shadow-sm' : 'text-[#6E7191] hover:text-[#1B1D3A] hover:bg-white'}`}>{t.label}</button>))}
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
        <select value={filterCourse} onChange={(e) => { setFilterCourse(e.target.value); setPage(1); }} className="rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
          <option value="All">All Courses</option>
          {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {activeTab !== 'mark' && (
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A3BD]" /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="rounded-lg border border-[#ECEDF3] bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473] w-[200px]" /></div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Mark Attendance */}
        {activeTab === 'mark' && (
          <motion.div key="mark" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="mt-4 rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
              <div className="p-4 border-b border-[#ECEDF3] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1B1D3A]">Mark for {selectedDate}</h3>
                <button type="button" onClick={handleMarkAll} className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-4 py-2 text-xs font-medium text-white hover:bg-[#1B1D3A] transition-colors"><Save className="h-3.5 w-3.5" /> Save Attendance</button>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]"><th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Student</th><th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">ID</th><th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Course</th><th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Status</th></tr></thead>
                <tbody>
                  {markStudents.map((s) => (
                    <tr key={s.id} className="border-b border-[#ECEDF3] last:border-b-0 hover:bg-[#F5F6FA]">
                      <td className="px-4 py-2.5 font-medium text-[#1B1D3A]">{s.name}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-[#6E7191]">{s.idCard}</td>
                      <td className="px-4 py-2.5"><span className="inline-flex rounded-md bg-[#ECEDF3] px-2 py-0.5 text-xs font-medium text-[#1B1D3A]">{s.course}</span></td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1.5">
                          {(['Present', 'Absent', 'Late', 'Leave'] as AttendanceStatus[]).map((st) => (
                            <button key={st} type="button" onClick={() => setMarkingState((p) => ({ ...p, [s.id]: st }))}
                              className={`rounded-md px-2.5 py-1 text-[10px] font-medium border transition-all ${(markingState[s.id] ?? 'Present') === st ? `${getStatusBadge(st).bg} ${getStatusBadge(st).text} border-current` : 'border-[#ECEDF3] text-[#A0A3BD] hover:border-[#6E7191]'}`}>
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]"><th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Student</th><th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">ID Card</th><th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Course</th><th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Date</th><th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Time</th><th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Status</th><th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Actions</th></tr></thead>
                <tbody>
                  {paginated.map((r) => { const badge = getStatusBadge(r.status); return (
                    <tr key={r.id} className="border-b border-[#ECEDF3] last:border-b-0 hover:bg-[#F5F6FA]">
                      <td className="px-4 py-2.5 font-medium text-[#1B1D3A]">{r.studentName}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-[#6E7191]">{r.idCard}</td>
                      <td className="px-4 py-2.5"><span className="inline-flex rounded-md bg-[#ECEDF3] px-2 py-0.5 text-xs font-medium text-[#1B1D3A]">{r.course}</span></td>
                      <td className="px-4 py-2.5 text-[#6E7191]">{r.date}</td>
                      <td className="px-4 py-2.5 text-[#6E7191]">{r.time || '—'}</td>
                      <td className="px-4 py-2.5">{editingId === r.id ? (<select value={editStatus} onChange={(e) => setEditStatus(e.target.value as AttendanceStatus)} className="rounded border border-[#ECEDF3] px-2 py-1 text-xs">{(['Present','Absent','Late','Leave'] as const).map((o) => <option key={o} value={o}>{o}</option>)}</select>) : (<span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>{r.status}</span>)}</td>
                      <td className="px-4 py-2.5"><div className="flex gap-1.5">{editingId === r.id ? (<button type="button" onClick={() => handleEditSave(r.id)} className="rounded p-1 text-green-600 hover:bg-green-50"><Save className="h-3.5 w-3.5" /></button>) : (<button type="button" onClick={() => { setEditingId(r.id); setEditStatus(r.status); }} className="rounded p-1 text-[#363473] hover:bg-[#F5F6FA]"><Edit2 className="h-3.5 w-3.5" /></button>)}<button type="button" onClick={() => handleDelete(r.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button></div></td>
                    </tr>); })}
                  {paginated.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-[#A0A3BD]">No records found.</td></tr>}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (<div className="mt-4 flex items-center justify-between"><p className="text-sm text-[#6E7191]">Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length}</p><div className="flex items-center gap-2"><button type="button" onClick={() => setPage((p) => Math.max(1,p-1))} disabled={page===1} className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Prev</button><span className="text-sm font-medium text-[#1B1D3A]">{page}/{totalPages}</span><button type="button" onClick={() => setPage((p) => Math.min(totalPages,p+1))} disabled={page===totalPages} className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40">Next<ChevronRight className="h-4 w-4" /></button></div></div>)}
          </motion.div>
        )}

        {/* Summary */}
        {activeTab === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="mt-4 rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6">
              <h3 className="text-sm font-semibold text-[#1B1D3A] mb-4">Course-wise Summary for {selectedDate}</h3>
              <table className="w-full text-sm"><thead><tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]"><th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Course</th><th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Present</th><th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Absent</th><th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Late</th><th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Leave</th><th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Attendance %</th></tr></thead>
                <tbody>{COURSES.map((c) => { const cr = todayRecords.filter((r) => r.course === c); const p = cr.filter((r) => r.status === 'Present').length; const total = cr.length || 1; return (<tr key={c} className="border-b border-[#ECEDF3] last:border-b-0"><td className="px-4 py-2.5 font-medium text-[#1B1D3A]">{c}</td><td className="px-4 py-2.5 text-green-700 font-medium">{cr.filter((r) => r.status === 'Present').length}</td><td className="px-4 py-2.5 text-red-600 font-medium">{cr.filter((r) => r.status === 'Absent').length}</td><td className="px-4 py-2.5 text-amber-700 font-medium">{cr.filter((r) => r.status === 'Late').length}</td><td className="px-4 py-2.5 text-blue-700 font-medium">{cr.filter((r) => r.status === 'Leave').length}</td><td className="px-4 py-2.5"><span className={`font-medium ${Math.round((p/total)*100)>=75?'text-green-700':'text-red-600'}`}>{Math.round((p/total)*100)}%</span></td></tr>); })}</tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContent>
  );
}
