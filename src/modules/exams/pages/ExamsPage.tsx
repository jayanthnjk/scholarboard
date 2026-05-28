/**
 * Exam Board - Complete exam management system with tabbed interface.
 * Tabs: Internal Exams | Competitive Exams
 * Navy-purple theme, dynamic stats, filters, paginated list views.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, X, ClipboardCheck, TrendingUp, Award, Calendar,
  Users, CheckCircle, XCircle, BarChart3,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  INITIAL_EXAMS, COURSES, SUBJECTS_BY_COURSE, FACULTY_LIST, EXAM_TYPES,
  COMPETITIVE_EXAMS, createExam,
} from '../data';
import type { Exam, ExamType, ExamFormData, CompetitiveExam } from '../data';

// --- Types ---

type TabKey = 'internal' | 'competitive';

const PAGE_SIZE = 10;

// --- Helpers ---

function getCompetitiveExamStatus(exam: CompetitiveExam): 'Registration Open' | 'Upcoming' | 'Completed' {
  const now = new Date();
  const examDate = new Date(exam.date);
  const regDeadline = new Date(exam.registrationDeadline);
  if (examDate < now) return 'Completed';
  if (regDeadline >= now) return 'Registration Open';
  return 'Upcoming';
}

function getStatusBadge(status: string): { bg: string; text: string } {
  switch (status) {
    case 'Registration Open': return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'Upcoming': return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'Completed': return { bg: 'bg-gray-100', text: 'text-gray-600' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-600' };
  }
}

// --- Component ---

export function ExamsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [activeTab, setActiveTab] = useState<TabKey>('internal');
  const [filterCourse, setFilterCourse] = useState<string>('All');
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterFaculty, setFilterFaculty] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ExamFormData>({ name: '', course: '', subject: '', type: '', date: '', maxMarks: '', faculty: '' });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ExamFormData, string>>>({});

  // Pagination state
  const [internalPage, setInternalPage] = useState(1);
  const [competitivePage, setCompetitivePage] = useState(1);

  const isFilterActive = filterCourse !== 'All' || filterSubject !== 'All' || filterType !== 'All' || filterFaculty !== 'All';

  function resetFilters(): void {
    setFilterCourse('All');
    setFilterSubject('All');
    setFilterType('All');
    setFilterFaculty('All');
    setInternalPage(1);
  }

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      if (filterCourse !== 'All' && exam.course !== filterCourse) return false;
      if (filterSubject !== 'All' && exam.subject !== filterSubject) return false;
      if (filterType !== 'All' && exam.type !== filterType) return false;
      if (filterFaculty !== 'All' && exam.faculty !== filterFaculty) return false;
      return true;
    });
  }, [exams, filterCourse, filterSubject, filterType, filterFaculty]);

  const availableSubjectsFilter = useMemo(() => {
    if (filterCourse === 'All') return [];
    return SUBJECTS_BY_COURSE[filterCourse] ?? [];
  }, [filterCourse]);

  const formSubjects = useMemo(() => {
    if (!formData.course) return [];
    return SUBJECTS_BY_COURSE[formData.course] ?? [];
  }, [formData.course]);

  // Pagination for internal exams
  const internalTotalPages = Math.max(1, Math.ceil(filteredExams.length / PAGE_SIZE));
  const paginatedInternalExams = useMemo(() => {
    const start = (internalPage - 1) * PAGE_SIZE;
    return filteredExams.slice(start, start + PAGE_SIZE);
  }, [filteredExams, internalPage]);

  // Pagination for competitive exams
  const competitiveTotalPages = Math.max(1, Math.ceil(COMPETITIVE_EXAMS.length / PAGE_SIZE));
  const paginatedCompetitiveExams = useMemo(() => {
    const start = (competitivePage - 1) * PAGE_SIZE;
    return COMPETITIVE_EXAMS.slice(start, start + PAGE_SIZE);
  }, [competitivePage]);

  // --- Combined Stats (merged internal + results analytics) ---

  const stats = useMemo(() => {
    const data = filteredExams;
    if (data.length === 0) return { total: 0, totalStudents: 0, avgPassRate: 0, passCount: 0, failCount: 0, avgScore: 0, topper: { name: '-', marks: 0 }, thisMonth: 0 };
    const totalStudents = data.reduce((s, e) => s + e.totalStudents, 0);
    const passCount = data.reduce((s, e) => s + e.passCount, 0);
    const failCount = data.reduce((s, e) => s + e.failCount, 0);
    const avgPassRate = totalStudents > 0 ? Math.round((passCount / totalStudents) * 100) : 0;
    const avgScore = Math.round(data.reduce((s, e) => s + e.avgMarks, 0) / data.length);
    let best = { name: '-', marks: 0 };
    data.forEach((exam) => {
      exam.results.forEach((r) => {
        if (r.marksObtained > best.marks) best = { name: r.studentName, marks: r.marksObtained };
      });
    });
    const thisMonth = data.filter((e) => e.date.startsWith('2024-12')).length;
    return { total: data.length, totalStudents, avgPassRate, passCount, failCount, avgScore, topper: best, thisMonth };
  }, [filteredExams]);

  // --- Create Exam ---

  function handleCreateExam(): void {
    const errors: Partial<Record<keyof ExamFormData, string>> = {};
    if (!formData.name.trim()) errors.name = 'Required';
    if (!formData.course) errors.course = 'Required';
    if (!formData.subject) errors.subject = 'Required';
    if (!formData.type) errors.type = 'Required';
    if (!formData.date) errors.date = 'Required';
    if (!formData.maxMarks) errors.maxMarks = 'Required';
    if (!formData.faculty) errors.faculty = 'Required';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newExam = createExam(
      String(Date.now()), formData.name.trim(), formData.course, formData.subject,
      formData.type as ExamType, formData.date, Number(formData.maxMarks), formData.faculty, 15
    );
    setExams((prev) => [newExam, ...prev]);
    setShowModal(false);
    setFormData({ name: '', course: '', subject: '', type: '', date: '', maxMarks: '', faculty: '' });
    setFormErrors({});
  }

  // --- Tabs ---

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'internal', label: 'Internal Exams' },
    { key: 'competitive', label: 'Competitive Exams' },
  ];

  return (
    <PageContent>
      <PageHeader
        title="Exam Board"
        subtitle="Manage examinations, results, and performance analytics."
        breadcrumbs={[{ label: 'Home' }, { label: 'Exam Board' }]}
      />

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1 rounded-xl bg-[#F5F6FA] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#363473] text-white shadow-sm'
                : 'text-[#6E7191] hover:text-[#1B1D3A] hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters (for Internal tab) */}
      {activeTab === 'internal' && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <select value={filterCourse} onChange={(e) => { setFilterCourse(e.target.value); setFilterSubject('All'); setInternalPage(1); }} className="rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473]">
            <option value="All">All Courses</option>
            {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {availableSubjectsFilter.length > 0 && (
            <select value={filterSubject} onChange={(e) => { setFilterSubject(e.target.value); setInternalPage(1); }} className="rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473]">
              <option value="All">All Subjects</option>
              {availableSubjectsFilter.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setInternalPage(1); }} className="rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473]">
            <option value="All">All Types</option>
            {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterFaculty} onChange={(e) => { setFilterFaculty(e.target.value); setInternalPage(1); }} className="rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473]">
            <option value="All">All Faculty</option>
            {FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          {isFilterActive && (
            <button type="button" onClick={resetFilters} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
              Reset
            </button>
          )}
          <div className="ml-auto">
            <button type="button" onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1B1D3A] transition-colors">
              <Plus className="h-4 w-4" /> Create Exam
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'internal' && (
          <motion.div key="internal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {/* Combined Stats Cards */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
              <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#363473]/10 p-2"><ClipboardCheck className="h-5 w-5 text-[#363473]" /></div>
                  <div>
                    <p className="text-xs text-[#A0A3BD]">Total Exams</p>
                    <p className="text-xl font-bold text-[#1B1D3A]">{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2"><Users className="h-5 w-5 text-indigo-700" /></div>
                  <div>
                    <p className="text-xs text-[#A0A3BD]">Total Students</p>
                    <p className="text-xl font-bold text-[#1B1D3A]">{stats.totalStudents}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2"><CheckCircle className="h-5 w-5 text-green-700" /></div>
                  <div>
                    <p className="text-xs text-[#A0A3BD]">Pass Count</p>
                    <p className="text-xl font-bold text-green-700">{stats.passCount}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-100 p-2"><XCircle className="h-5 w-5 text-red-600" /></div>
                  <div>
                    <p className="text-xs text-[#A0A3BD]">Fail Count</p>
                    <p className="text-xl font-bold text-red-600">{stats.failCount}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2"><TrendingUp className="h-5 w-5 text-blue-700" /></div>
                  <div>
                    <p className="text-xs text-[#A0A3BD]">Pass Rate</p>
                    <p className="text-xl font-bold text-[#1B1D3A]">{stats.avgPassRate}%</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2"><BarChart3 className="h-5 w-5 text-purple-700" /></div>
                  <div>
                    <p className="text-xs text-[#A0A3BD]">Avg Score</p>
                    <p className="text-xl font-bold text-[#1B1D3A]">{stats.avgScore}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-yellow-100 p-2"><Award className="h-5 w-5 text-yellow-700" /></div>
                  <div>
                    <p className="text-xs text-[#A0A3BD]">Topper</p>
                    <p className="text-sm font-bold text-[#1B1D3A]">{stats.topper.name}</p>
                    <p className="text-xs text-[#6E7191]">{stats.topper.marks} marks</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2"><Calendar className="h-5 w-5 text-blue-700" /></div>
                  <div>
                    <p className="text-xs text-[#A0A3BD]">This Month</p>
                    <p className="text-xl font-bold text-[#1B1D3A]">{stats.thisMonth}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Internal Exam Table */}
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Exam Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Course</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Subject</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Students</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Pass/Fail</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Avg</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Faculty</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInternalExams.map((exam) => (
                    <tr
                      key={exam.id}
                      onClick={() => navigate(`/exams/${exam.id}`)}
                      className="border-b border-[#ECEDF3] last:border-b-0 cursor-pointer hover:bg-[#F5F6FA] transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-[#1B1D3A]">{exam.name}</td>
                      <td className="px-4 py-3 text-[#6E7191]">{exam.course}</td>
                      <td className="px-4 py-3 text-[#6E7191]">{exam.subject}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-md bg-[#ECEDF3] px-2 py-0.5 text-xs font-medium text-[#1B1D3A]">{exam.type}</span>
                      </td>
                      <td className="px-4 py-3 text-[#6E7191]">{exam.date}</td>
                      <td className="px-4 py-3 text-[#6E7191]">{exam.totalStudents}</td>
                      <td className="px-4 py-3">
                        <span className="text-green-700 font-medium">{exam.passCount}</span>
                        <span className="text-[#A0A3BD]"> / </span>
                        <span className="text-red-600 font-medium">{exam.failCount}</span>
                      </td>
                      <td className="px-4 py-3 text-[#6E7191]">{exam.avgMarks}/{exam.maxMarks}</td>
                      <td className="px-4 py-3 text-[#6E7191]">{exam.faculty}</td>
                    </tr>
                  ))}
                  {paginatedInternalExams.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-[#A0A3BD]">No exams found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Internal Pagination */}
            {internalTotalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-[#6E7191]">
                  Showing {(internalPage - 1) * PAGE_SIZE + 1}–{Math.min(internalPage * PAGE_SIZE, filteredExams.length)} of {filteredExams.length} exams
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInternalPage((p) => Math.max(1, p - 1))}
                    disabled={internalPage === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <span className="text-sm font-medium text-[#1B1D3A]">
                    {internalPage} / {internalTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setInternalPage((p) => Math.min(internalTotalPages, p + 1))}
                    disabled={internalPage === internalTotalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'competitive' && (
          <motion.div key="competitive" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {/* Competitive Exams List View */}
            <div className="mt-5 overflow-x-auto rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Exam Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Course</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Exam Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Registration Deadline</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Max Marks</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCompetitiveExams.map((exam) => {
                    const status = getCompetitiveExamStatus(exam);
                    const badge = getStatusBadge(status);
                    return (
                      <tr
                        key={exam.id}
                        onClick={() => navigate(`/exams/competitive/${exam.id}`)}
                        className="border-b border-[#ECEDF3] last:border-b-0 cursor-pointer hover:bg-[#F5F6FA] transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-[#1B1D3A]">{exam.name}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-md bg-[#ECEDF3] px-2 py-0.5 text-xs font-medium text-[#1B1D3A]">{exam.course}</span>
                        </td>
                        <td className="px-4 py-3 text-[#6E7191]">{exam.date}</td>
                        <td className="px-4 py-3 text-[#6E7191]">{exam.registrationDeadline}</td>
                        <td className="px-4 py-3 text-[#6E7191]">{exam.maxMarks}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#6E7191] max-w-[200px] truncate">{exam.description}</td>
                      </tr>
                    );
                  })}
                  {paginatedCompetitiveExams.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-[#A0A3BD]">No competitive exams found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Competitive Pagination */}
            {competitiveTotalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-[#6E7191]">
                  Showing {(competitivePage - 1) * PAGE_SIZE + 1}–{Math.min(competitivePage * PAGE_SIZE, COMPETITIVE_EXAMS.length)} of {COMPETITIVE_EXAMS.length} exams
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCompetitivePage((p) => Math.max(1, p - 1))}
                    disabled={competitivePage === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <span className="text-sm font-medium text-[#1B1D3A]">
                    {competitivePage} / {competitiveTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCompetitivePage((p) => Math.min(competitiveTotalPages, p + 1))}
                    disabled={competitivePage === competitiveTotalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#6E7191] hover:bg-[#F5F6FA] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Exam Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }} className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[#1B1D3A]">Create Exam</h2>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-[#F5F6FA]"><X className="h-5 w-5 text-[#6E7191]" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Exam Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                  {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Course *</label>
                    <select value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value, subject: '' })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                      <option value="">Select</option>
                      {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {formErrors.course && <p className="mt-1 text-xs text-red-600">{formErrors.course}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Subject *</label>
                    <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" disabled={!formData.course}>
                      <option value="">Select</option>
                      {formSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {formErrors.subject && <p className="mt-1 text-xs text-red-600">{formErrors.subject}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Type *</label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                      <option value="">Select</option>
                      {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {formErrors.type && <p className="mt-1 text-xs text-red-600">{formErrors.type}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Date *</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                    {formErrors.date && <p className="mt-1 text-xs text-red-600">{formErrors.date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Max Marks *</label>
                    <input type="number" min="1" value={formData.maxMarks} onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                    {formErrors.maxMarks && <p className="mt-1 text-xs text-red-600">{formErrors.maxMarks}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Faculty *</label>
                  <select value={formData.faculty} onChange={(e) => setFormData({ ...formData, faculty: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                    <option value="">Select</option>
                    {FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  {formErrors.faculty && <p className="mt-1 text-xs text-red-600">{formErrors.faculty}</p>}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]">Cancel</button>
                <button type="button" onClick={handleCreateExam} className="rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors">Save</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContent>
  );
}
