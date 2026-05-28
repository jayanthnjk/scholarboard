/**
 * Courses Module - Split-panel layout with course list and detail view.
 * Navy-purple theme, modal forms, subjects table.
 */

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, Trash2, BookOpen, Users, GraduationCap, Search } from 'lucide-react';

// --- Types ---

interface Subject {
  id: string;
  name: string;
  creditHours: number;
  semester: number;
  faculty: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  duration: string;
  subjects: Subject[];
  facultyCount: number;
  studentCount: number;
}

interface CourseFormData {
  name: string;
  description: string;
  duration: string;
}

interface SubjectFormData {
  name: string;
  creditHours: string;
  semester: string;
}

// --- Mock Data ---

const INITIAL_COURSES: Course[] = [
  {
    id: '1', name: 'MPC', description: 'Mathematics, Physics, Chemistry Group', duration: '2 Years',
    facultyCount: 5, studentCount: 240,
    subjects: [
      { id: 's1', name: 'Mathematics IA', creditHours: 6, semester: 1, faculty: 'Smt. Lakshmi Devi' },
      { id: 's2', name: 'Mathematics IB', creditHours: 6, semester: 1, faculty: 'Smt. Lakshmi Devi' },
      { id: 's3', name: 'Mathematics IIA', creditHours: 6, semester: 2, faculty: 'Smt. Lakshmi Devi' },
      { id: 's4', name: 'Mathematics IIB', creditHours: 6, semester: 2, faculty: 'Smt. Lakshmi Devi' },
      { id: 's5', name: 'Physics', creditHours: 6, semester: 1, faculty: 'Sri Venkat Rao' },
      { id: 's6', name: 'Chemistry', creditHours: 6, semester: 1, faculty: 'Sri Ramana Murthy' },
      { id: 's7', name: 'English', creditHours: 4, semester: 1, faculty: 'Sri Krishna Rao' },
      { id: 's8', name: 'Telugu', creditHours: 4, semester: 1, faculty: 'Smt. Padmavathi' },
      { id: 's9', name: 'Sanskrit', creditHours: 4, semester: 1, faculty: 'Sri Narayana' },
    ],
  },
  {
    id: '2', name: 'BiPC', description: 'Biology, Physics, Chemistry Group', duration: '2 Years',
    facultyCount: 5, studentCount: 200,
    subjects: [
      { id: 's10', name: 'Botany', creditHours: 6, semester: 1, faculty: 'Smt. Saraswathi' },
      { id: 's11', name: 'Zoology', creditHours: 6, semester: 1, faculty: 'Sri Narasimha' },
      { id: 's12', name: 'Physics', creditHours: 6, semester: 1, faculty: 'Sri Venkat Rao' },
      { id: 's13', name: 'Chemistry', creditHours: 6, semester: 1, faculty: 'Sri Ramana Murthy' },
      { id: 's14', name: 'English', creditHours: 4, semester: 1, faculty: 'Sri Krishna Rao' },
      { id: 's15', name: 'Telugu', creditHours: 4, semester: 1, faculty: 'Smt. Padmavathi' },
      { id: 's16', name: 'Sanskrit', creditHours: 4, semester: 1, faculty: 'Sri Narayana' },
    ],
  },
  {
    id: '3', name: 'CEC', description: 'Civics, Economics, Commerce Group', duration: '2 Years',
    facultyCount: 5, studentCount: 180,
    subjects: [
      { id: 's17', name: 'Civics', creditHours: 6, semester: 1, faculty: 'Sri Shankar' },
      { id: 's18', name: 'Economics', creditHours: 6, semester: 1, faculty: 'Sri Subramaniam' },
      { id: 's19', name: 'Commerce', creditHours: 6, semester: 1, faculty: 'Smt. Revathi' },
      { id: 's20', name: 'English', creditHours: 4, semester: 1, faculty: 'Sri Krishna Rao' },
      { id: 's21', name: 'Telugu', creditHours: 4, semester: 1, faculty: 'Smt. Padmavathi' },
      { id: 's22', name: 'Sanskrit', creditHours: 4, semester: 1, faculty: 'Sri Narayana' },
    ],
  },
  {
    id: '4', name: 'MEC', description: 'Mathematics, Economics, Commerce Group', duration: '2 Years',
    facultyCount: 5, studentCount: 160,
    subjects: [
      { id: 's23', name: 'Mathematics IA', creditHours: 6, semester: 1, faculty: 'Smt. Lakshmi Devi' },
      { id: 's24', name: 'Mathematics IB', creditHours: 6, semester: 1, faculty: 'Smt. Lakshmi Devi' },
      { id: 's25', name: 'Economics', creditHours: 6, semester: 1, faculty: 'Sri Subramaniam' },
      { id: 's26', name: 'Commerce', creditHours: 6, semester: 1, faculty: 'Smt. Revathi' },
      { id: 's27', name: 'English', creditHours: 4, semester: 1, faculty: 'Sri Krishna Rao' },
      { id: 's28', name: 'Telugu', creditHours: 4, semester: 1, faculty: 'Smt. Padmavathi' },
      { id: 's29', name: 'Sanskrit', creditHours: 4, semester: 1, faculty: 'Sri Narayana' },
    ],
  },
  {
    id: '5', name: 'HEC', description: 'History, Economics, Commerce Group', duration: '2 Years',
    facultyCount: 5, studentCount: 150,
    subjects: [
      { id: 's30', name: 'History', creditHours: 6, semester: 1, faculty: 'Smt. Durga' },
      { id: 's31', name: 'Economics', creditHours: 6, semester: 1, faculty: 'Sri Subramaniam' },
      { id: 's32', name: 'Commerce', creditHours: 6, semester: 1, faculty: 'Smt. Revathi' },
      { id: 's33', name: 'English', creditHours: 4, semester: 1, faculty: 'Sri Krishna Rao' },
      { id: 's34', name: 'Telugu', creditHours: 4, semester: 1, faculty: 'Smt. Padmavathi' },
      { id: 's35', name: 'Sanskrit', creditHours: 4, semester: 1, faculty: 'Sri Narayana' },
    ],
  },
];

// --- Component ---

export function CoursesPage(): React.JSX.Element {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(INITIAL_COURSES[0]?.id ?? '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<CourseFormData>({ name: '', description: '', duration: '' });
  const [subjectForm, setSubjectForm] = useState<SubjectFormData>({ name: '', creditHours: '', semester: '' });
  const [courseErrors, setCourseErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({});
  const [subjectErrors, setSubjectErrors] = useState<Partial<Record<keyof SubjectFormData, string>>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'course' | 'subject'; courseId: string; subjectId?: string } | null>(null);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter((c) => c.name.toLowerCase().includes(q));
  }, [courses, searchQuery]);

  const selectedCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId) ?? null;
  }, [courses, selectedCourseId]);

  function handleAddCourse(): void {
    const errors: Partial<Record<keyof CourseFormData, string>> = {};
    if (!courseForm.name.trim()) errors.name = 'Required';
    if (!courseForm.description.trim()) errors.description = 'Required';
    if (!courseForm.duration.trim()) errors.duration = 'Required';
    setCourseErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newCourse: Course = {
      id: String(Date.now()),
      name: courseForm.name.trim(),
      description: courseForm.description.trim(),
      duration: courseForm.duration.trim(),
      subjects: [],
      facultyCount: 0,
      studentCount: 0,
    };
    setCourses((prev) => [...prev, newCourse]);
    setSelectedCourseId(newCourse.id);
    setShowCourseModal(false);
    setCourseForm({ name: '', description: '', duration: '' });
    setCourseErrors({});
  }

  function handleAddSubject(courseId: string): void {
    const errors: Partial<Record<keyof SubjectFormData, string>> = {};
    if (!subjectForm.name.trim()) errors.name = 'Required';
    if (!subjectForm.creditHours.trim()) errors.creditHours = 'Required';
    if (!subjectForm.semester.trim()) errors.semester = 'Required';
    setSubjectErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newSubject: Subject = {
      id: String(Date.now()),
      name: subjectForm.name.trim(),
      creditHours: Number(subjectForm.creditHours),
      semester: Number(subjectForm.semester),
      faculty: 'Unassigned',
    };
    setCourses((prev) =>
      prev.map((c) => c.id === courseId ? { ...c, subjects: [...c.subjects, newSubject] } : c)
    );
    setShowSubjectModal(null);
    setSubjectForm({ name: '', creditHours: '', semester: '' });
    setSubjectErrors({});
  }

  function handleDelete(): void {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'course') {
      setCourses((prev) => {
        const updated = prev.filter((c) => c.id !== deleteConfirm.courseId);
        if (selectedCourseId === deleteConfirm.courseId && updated.length > 0) {
          setSelectedCourseId(updated[0]?.id ?? '');
        }
        return updated;
      });
    } else if (deleteConfirm.subjectId) {
      setCourses((prev) =>
        prev.map((c) => c.id === deleteConfirm.courseId
          ? { ...c, subjects: c.subjects.filter((s) => s.id !== deleteConfirm.subjectId) }
          : c
        )
      );
    }
    setDeleteConfirm(null);
  }

  return (
    <PageContent>
      <PageHeader
        title="Courses"
        subtitle="Manage courses, subjects, and departmental structure."
        breadcrumbs={[{ label: 'Home' }, { label: 'Courses' }]}
      />

      {/* Split Panel Layout */}
      <div className="mt-6 flex gap-6" style={{ minHeight: '600px' }}>
        {/* Left Panel - Course List */}
        <div className="w-[280px] flex-shrink-0 rounded-xl border border-[#ECEDF3] bg-white shadow-sm flex flex-col">
          {/* Left Panel Header */}
          <div className="p-4 border-b border-[#ECEDF3]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1B1D3A]">Courses</h3>
              <button
                type="button"
                onClick={() => setShowCourseModal(true)}
                className="inline-flex items-center gap-1 rounded-md bg-[#363473] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#1B1D3A] transition-colors"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A0A3BD]" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[#ECEDF3] pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#363473]"
              />
            </div>
          </div>

          {/* Course List */}
          <div className="flex-1 overflow-y-auto">
            {filteredCourses.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => setSelectedCourseId(course.id)}
                className={`w-full text-left px-4 py-3 border-b border-[#ECEDF3] last:border-b-0 transition-colors ${
                  selectedCourseId === course.id
                    ? 'bg-[#363473]/5 border-l-2 border-l-[#363473]'
                    : 'hover:bg-[#F5F6FA] border-l-2 border-l-transparent'
                }`}
              >
                <p className="text-sm font-medium text-[#1B1D3A]">{course.name}</p>
                <p className="text-xs text-[#A0A3BD] mt-0.5">{course.subjects.length} subjects</p>
              </button>
            ))}
            {filteredCourses.length === 0 && (
              <p className="px-4 py-6 text-xs text-center text-[#A0A3BD]">No courses found.</p>
            )}
          </div>
        </div>

        {/* Right Panel - Course Details */}
        <div className="flex-1 min-w-0">
          {selectedCourse ? (
            <div className="space-y-4">
              {/* Course Header */}
              <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#1B1D3A]">{selectedCourse.name}</h2>
                    <p className="mt-1 text-sm text-[#6E7191]">{selectedCourse.description}</p>
                    <p className="mt-1 text-xs text-[#A0A3BD]">Duration: {selectedCourse.duration}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ type: 'course', courseId: selectedCourse.id })}
                    className="rounded-lg p-1.5 text-[#A0A3BD] hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-6 text-sm text-[#6E7191]">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-[#363473]" />
                    {selectedCourse.subjects.length} Subjects
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-[#363473]" />
                    {selectedCourse.facultyCount} Faculty
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-[#363473]" />
                    {selectedCourse.studentCount} Students
                  </span>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
                <div className="flex items-center justify-between p-4 border-b border-[#ECEDF3]">
                  <h3 className="text-sm font-semibold text-[#1B1D3A]">Subjects</h3>
                  <button
                    type="button"
                    onClick={() => setShowSubjectModal(selectedCourse.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#363473] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1B1D3A] transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Subject
                  </button>
                </div>
                {selectedCourse.subjects.length === 0 ? (
                  <p className="px-4 py-8 text-sm text-center text-[#A0A3BD]">No subjects added yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
                          <th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Subject Name</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Faculty</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Credits</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Semester</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCourse.subjects.map((subject) => (
                          <tr key={subject.id} className="border-b border-[#ECEDF3] last:border-b-0 hover:bg-[#F5F6FA]">
                            <td className="px-4 py-2.5 font-medium text-[#1B1D3A]">{subject.name}</td>
                            <td className="px-4 py-2.5 text-[#6E7191]">{subject.faculty}</td>
                            <td className="px-4 py-2.5 text-[#6E7191]">{subject.creditHours}</td>
                            <td className="px-4 py-2.5 text-[#6E7191]">Sem {subject.semester}</td>
                            <td className="px-4 py-2.5">
                              <button
                                type="button"
                                onClick={() => setDeleteConfirm({ type: 'subject', courseId: selectedCourse.id, subjectId: subject.id })}
                                className="rounded p-1 text-[#A0A3BD] hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-12 text-center">
              <p className="text-sm text-[#A0A3BD]">Select a course to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      <AnimatePresence>
        {showCourseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowCourseModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }} className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[#1B1D3A]">Add Course</h2>
                <button type="button" onClick={() => setShowCourseModal(false)} className="rounded-lg p-1 hover:bg-[#F5F6FA]"><X className="h-5 w-5 text-[#6E7191]" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Course Name *</label>
                  <input type="text" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                  {courseErrors.name && <p className="mt-1 text-xs text-red-600">{courseErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Description *</label>
                  <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} rows={2} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473] resize-none" />
                  {courseErrors.description && <p className="mt-1 text-xs text-red-600">{courseErrors.description}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Duration *</label>
                  <input type="text" placeholder="e.g., 4 Years" value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                  {courseErrors.duration && <p className="mt-1 text-xs text-red-600">{courseErrors.duration}</p>}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCourseModal(false)} className="rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]">Cancel</button>
                <button type="button" onClick={handleAddCourse} className="rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors">Save</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showSubjectModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowSubjectModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }} className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[#1B1D3A]">Add Subject</h2>
                <button type="button" onClick={() => setShowSubjectModal(null)} className="rounded-lg p-1 hover:bg-[#F5F6FA]"><X className="h-5 w-5 text-[#6E7191]" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Subject Name *</label>
                  <input type="text" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                  {subjectErrors.name && <p className="mt-1 text-xs text-red-600">{subjectErrors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Credit Hours *</label>
                    <input type="number" min="1" value={subjectForm.creditHours} onChange={(e) => setSubjectForm({ ...subjectForm, creditHours: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                    {subjectErrors.creditHours && <p className="mt-1 text-xs text-red-600">{subjectErrors.creditHours}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Semester *</label>
                    <input type="number" min="1" value={subjectForm.semester} onChange={(e) => setSubjectForm({ ...subjectForm, semester: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                    {subjectErrors.semester && <p className="mt-1 text-xs text-red-600">{subjectErrors.semester}</p>}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowSubjectModal(null)} className="rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]">Cancel</button>
                <button type="button" onClick={() => handleAddSubject(showSubjectModal)} className="rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors">Save</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }} className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
            >
              <h2 className="text-lg font-semibold text-[#1B1D3A]">Confirm Delete</h2>
              <p className="mt-2 text-sm text-[#6E7191]">
                Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={() => setDeleteConfirm(null)} className="rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]">Cancel</button>
                <button type="button" onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContent>
  );
}
