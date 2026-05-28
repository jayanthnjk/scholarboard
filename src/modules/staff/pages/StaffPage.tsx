/**
 * Faculty Management Page - Table with multi-course/subject assignments.
 * Navy-purple theme, modal forms, search, navigate to profile.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, Eye, Search } from 'lucide-react';
import { INITIAL_FACULTY, COURSES_LIST, SUBJECTS_BY_COURSE, STATUS_COLORS } from '../data';
import type { FacultyMember, FacultyFormData } from '../data';

// --- Component ---

export function StaffPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<FacultyMember[]>(INITIAL_FACULTY);
  const [filterCourse, setFilterCourse] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FacultyFormData>({
    name: '', email: '', phone: '', qualification: '', designation: '', courses: [], subjects: [],
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({});

  const filteredFaculty = useMemo(() => {
    let result = faculty;
    if (filterCourse !== 'All') {
      result = result.filter((f) => f.courses.includes(filterCourse));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((f) =>
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.designation.toLowerCase().includes(q)
      );
    }
    return result;
  }, [faculty, filterCourse, searchQuery]);

  const availableSubjects = useMemo(() => {
    const subjects: string[] = [];
    formData.courses.forEach((course) => {
      const courseSubjects = SUBJECTS_BY_COURSE[course];
      if (courseSubjects) subjects.push(...courseSubjects);
    });
    return subjects;
  }, [formData.courses]);

  function handleCourseToggle(course: string): void {
    setFormData((prev) => {
      const newCourses = prev.courses.includes(course)
        ? prev.courses.filter((c) => c !== course)
        : [...prev.courses, course];
      const validSubjects = prev.subjects.filter((s) =>
        newCourses.some((c) => SUBJECTS_BY_COURSE[c]?.includes(s))
      );
      return { ...prev, courses: newCourses, subjects: validSubjects };
    });
  }

  function handleSubjectToggle(subject: string): void {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  }

  function handleSave(): void {
    const errors: Partial<Record<string, string>> = {};
    if (!formData.name.trim()) errors.name = 'Required';
    if (!formData.email.trim()) errors.email = 'Required';
    if (!formData.phone.trim()) errors.phone = 'Required';
    if (!formData.qualification.trim()) errors.qualification = 'Required';
    if (!formData.designation.trim()) errors.designation = 'Required';
    if (formData.courses.length === 0) errors.courses = 'Select at least one course';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newFaculty: FacultyMember = {
      id: String(Date.now()),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      qualification: formData.qualification.trim(),
      designation: formData.designation.trim(),
      courses: formData.courses,
      subjects: formData.subjects,
      status: 'Active',
    };
    setFaculty((prev) => [newFaculty, ...prev]);
    setShowModal(false);
    setFormData({ name: '', email: '', phone: '', qualification: '', designation: '', courses: [], subjects: [] });
    setFormErrors({});
  }

  return (
    <PageContent>
      <PageHeader
        title="Faculty"
        subtitle="Manage faculty members and their course/subject assignments."
        breadcrumbs={[{ label: 'Home' }, { label: 'Faculty' }]}
      />

      {/* Search + Filter + Add button in one row */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A3BD]" />
          <input
            type="text"
            placeholder="Search by name, email, or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 rounded-lg border border-[#ECEDF3] bg-white pl-9 pr-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473]"
          />
        </div>
        <select
          id="course-filter"
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473]"
        >
          <option value="All">All Courses</option>
          {COURSES_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1B1D3A] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Faculty
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
              <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Department</th>
              <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Courses</th>
              <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Subjects</th>
              <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-[#1B1D3A]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFaculty.map((member) => (
              <tr key={member.id} className="border-b border-[#ECEDF3] last:border-b-0 hover:bg-[#F5F6FA] transition-colors">
                <td className="px-4 py-3 font-medium text-[#1B1D3A]">{member.name}</td>
                <td className="px-4 py-3 text-[#6E7191]">{member.email}</td>
                <td className="px-4 py-3 text-[#6E7191]">{member.courses[0] ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {member.courses.map((c) => (
                      <span key={c} className="inline-flex rounded-md bg-[#ECEDF3] px-2 py-0.5 text-xs text-[#1B1D3A]">{c}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {member.subjects.slice(0, 2).map((s) => (
                      <span key={s} className="inline-flex rounded-md bg-purple-50 px-2 py-0.5 text-xs text-[#363473]">{s}</span>
                    ))}
                    {member.subjects.length > 2 && <span className="text-xs text-[#A0A3BD]">+{member.subjects.length - 2}</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[member.status]}`}>{member.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/staff/${member.id}`)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#363473] hover:bg-[#F5F6FA]"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                </td>
              </tr>
            ))}
            {filteredFaculty.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-[#A0A3BD]">No faculty found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Faculty Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }} className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[#1B1D3A]">Add Faculty</h2>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-[#F5F6FA]"><X className="h-5 w-5 text-[#6E7191]" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                  {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Email *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                    {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Phone *</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                    {formErrors.phone && <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Qualification *</label>
                    <input type="text" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                    {formErrors.qualification && <p className="mt-1 text-xs text-red-600">{formErrors.qualification}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Designation *</label>
                    <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                    {formErrors.designation && <p className="mt-1 text-xs text-red-600">{formErrors.designation}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Assign to Courses *</label>
                  <div className="flex flex-wrap gap-2">
                    {COURSES_LIST.map((course) => (
                      <button
                        key={course}
                        type="button"
                        onClick={() => handleCourseToggle(course)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                          formData.courses.includes(course)
                            ? 'bg-[#363473] text-white border-[#363473]'
                            : 'bg-white text-[#6E7191] border-[#ECEDF3] hover:border-[#363473]'
                        }`}
                      >
                        {course}
                      </button>
                    ))}
                  </div>
                  {formErrors.courses && <p className="mt-1 text-xs text-red-600">{formErrors.courses}</p>}
                </div>
                {availableSubjects.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Assign to Subjects</label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {availableSubjects.map((subject) => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => handleSubjectToggle(subject)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                            formData.subjects.includes(subject)
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-[#6E7191] border-[#ECEDF3] hover:border-purple-400'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]">Cancel</button>
                <button type="button" onClick={handleSave} className="rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors">Save</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContent>
  );
}
