/**
 * Faculty Profile Page - Detailed profile view for a faculty member.
 * Accessible at /staff/:id
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContent } from '@/components/layout/page-content';
import { ArrowLeft, Mail, Phone, Award, BookOpen, GraduationCap, Edit } from 'lucide-react';
import { INITIAL_FACULTY, SUBJECTS_BY_COURSE, STATUS_COLORS } from '../data';

export function FacultyProfilePage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const faculty = INITIAL_FACULTY.find((f) => f.id === id);

  if (!faculty) {
    return (
      <PageContent>
        <div className="p-6">
          <button
            type="button"
            onClick={() => navigate('/staff')}
            className="inline-flex items-center gap-2 text-sm text-[#363473] hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Faculty
          </button>
          <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-12 text-center">
            <p className="text-[#A0A3BD]">Faculty member not found.</p>
          </div>
        </div>
      </PageContent>
    );
  }

  // Build course-subject mapping for this faculty
  const courseSubjectMap: Record<string, string[]> = {};
  faculty.courses.forEach((course) => {
    const allSubjectsForCourse = SUBJECTS_BY_COURSE[course] ?? [];
    const facultySubjectsInCourse = faculty.subjects.filter((s) => allSubjectsForCourse.includes(s));
    courseSubjectMap[course] = facultySubjectsInCourse;
  });

  return (
    <PageContent>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Back + Breadcrumbs */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/staff')}
            className="inline-flex items-center gap-2 text-sm text-[#363473] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Faculty
          </button>
          <div className="mt-2 flex items-center gap-2 text-xs text-[#A0A3BD]">
            <span>Home</span>
            <span>/</span>
            <span>Faculty</span>
            <span>/</span>
            <span className="text-[#1B1D3A]">{faculty.name}</span>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1B1D3A]">{faculty.name}</h1>
              <p className="mt-1 text-sm text-[#6E7191]">{faculty.designation}</p>
              <p className="mt-0.5 text-sm text-[#A0A3BD]">{faculty.qualification}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => alert('Edit functionality will be available soon.')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a2860] transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[faculty.status]}`}>
                {faculty.status}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-[#6E7191]">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-[#363473]" />
              {faculty.email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-[#363473]" />
              {faculty.phone}
            </span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#1B1D3A] mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#A0A3BD]">Full Name</span>
                  <span className="text-sm text-[#1B1D3A]">{faculty.name}</span>
                </div>
                <div className="border-t border-[#ECEDF3]" />
                <div className="flex justify-between">
                  <span className="text-sm text-[#A0A3BD]">Email</span>
                  <span className="text-sm text-[#1B1D3A]">{faculty.email}</span>
                </div>
                <div className="border-t border-[#ECEDF3]" />
                <div className="flex justify-between">
                  <span className="text-sm text-[#A0A3BD]">Phone</span>
                  <span className="text-sm text-[#1B1D3A]">{faculty.phone}</span>
                </div>
                <div className="border-t border-[#ECEDF3]" />
                <div className="flex justify-between">
                  <span className="text-sm text-[#A0A3BD]">Status</span>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[faculty.status]}`}>
                    {faculty.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Qualifications */}
            <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#1B1D3A] mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-[#363473]" /> Qualifications
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#A0A3BD]">Qualification</span>
                  <span className="text-sm text-[#1B1D3A]">{faculty.qualification}</span>
                </div>
                <div className="border-t border-[#ECEDF3]" />
                <div className="flex justify-between">
                  <span className="text-sm text-[#A0A3BD]">Designation</span>
                  <span className="text-sm text-[#1B1D3A]">{faculty.designation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Course Assignments */}
            <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#1B1D3A] mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#363473]" /> Course Assignments
              </h3>
              <div className="space-y-4">
                {faculty.courses.map((course) => (
                  <div key={course}>
                    <p className="text-sm font-medium text-[#1B1D3A]">{course}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(courseSubjectMap[course] ?? []).length > 0 ? (
                        (courseSubjectMap[course] ?? []).map((subject) => (
                          <span key={subject} className="inline-flex rounded-md bg-purple-50 px-2 py-0.5 text-xs text-[#363473]">
                            {subject}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#A0A3BD]">No specific subjects assigned</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subjects */}
            <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#1B1D3A] mb-4 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#363473]" /> Subjects
              </h3>
              <div className="flex flex-wrap gap-2">
                {faculty.subjects.length > 0 ? (
                  faculty.subjects.map((subject) => (
                    <span key={subject} className="inline-flex rounded-lg bg-[#363473]/10 px-3 py-1.5 text-xs font-medium text-[#363473]">
                      {subject}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[#A0A3BD]">No subjects assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContent>
  );
}
