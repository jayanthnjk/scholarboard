/**
 * Competitive Exam Detail Page - Shows exam info and registered student results.
 * Accessible at /exams/competitive/:id
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContent } from '@/components/layout/page-content';
import {
  ArrowLeft, Calendar, Award, TrendingUp, TrendingDown,
  Users, Clock, ChevronUp, ChevronDown,
} from 'lucide-react';
import { COMPETITIVE_EXAMS, generateResults } from '../data';

export function CompetitiveExamDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const exam = COMPETITIVE_EXAMS.find((e) => e.id === id);

  if (!exam) {
    return (
      <PageContent>
        <div className="p-6">
          <button
            type="button"
            onClick={() => navigate('/exams')}
            className="inline-flex items-center gap-2 text-sm text-[#363473] hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Exams
          </button>
          <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-12 text-center">
            <p className="text-[#A0A3BD]">Exam not found.</p>
          </div>
        </div>
      </PageContent>
    );
  }

  // Generate mock student results for this competitive exam
  const results = useMemo(() => generateResults(20, exam.maxMarks), [exam.maxMarks]);

  const passThreshold = exam.maxMarks * 0.4;
  const passCount = results.filter((r) => r.marksObtained >= passThreshold).length;
  const failCount = results.length - passCount;
  const passRate = Math.round((passCount / results.length) * 100);
  const avgMarks = Math.round(results.reduce((s, r) => s + r.marksObtained, 0) / results.length);
  const highestMark = Math.max(...results.map((r) => r.marksObtained));
  const lowestMark = Math.min(...results.map((r) => r.marksObtained));

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) =>
      sortDirection === 'desc'
        ? b.marksObtained - a.marksObtained
        : a.marksObtained - b.marksObtained
    );
  }, [results, sortDirection]);

  function toggleSort(): void {
    setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  }

  return (
    <PageContent>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Back + Breadcrumbs */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/exams')}
            className="inline-flex items-center gap-2 text-sm text-[#363473] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Exams
          </button>
          <div className="mt-2 flex items-center gap-2 text-xs text-[#A0A3BD]">
            <span>Home</span>
            <span>/</span>
            <span>Exam Board</span>
            <span>/</span>
            <span>Competitive Exams</span>
            <span>/</span>
            <span className="text-[#1B1D3A]">{exam.name}</span>
          </div>
        </div>

        {/* Exam Info Header Card */}
        <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1B1D3A]">{exam.name}</h1>
              <p className="mt-1 text-sm text-[#6E7191]">{exam.description}</p>
            </div>
            <span className="inline-flex rounded-md bg-[#ECEDF3] px-3 py-1 text-xs font-medium text-[#1B1D3A]">
              {exam.course}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-[#6E7191]">
              <Calendar className="h-4 w-4 text-[#363473]" />
              <span>Exam: {exam.date}</span>
            </div>
            <div className="flex items-center gap-2 text-[#6E7191]">
              <Clock className="h-4 w-4 text-[#363473]" />
              <span>Reg. Deadline: {exam.registrationDeadline}</span>
            </div>
            <div className="flex items-center gap-2 text-[#6E7191]">
              <Award className="h-4 w-4 text-[#363473]" />
              <span>Max Marks: {exam.maxMarks}</span>
            </div>
            <div className="flex items-center gap-2 text-[#6E7191]">
              <Users className="h-4 w-4 text-[#363473]" />
              <span>{results.length} Students</span>
            </div>
          </div>
        </div>

        {/* Analytics Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 mb-6">
          <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#A0A3BD]">Pass Count</p>
            <p className="text-xl font-bold text-green-700">{passCount}</p>
          </div>
          <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#A0A3BD]">Fail Count</p>
            <p className="text-xl font-bold text-red-600">{failCount}</p>
          </div>
          <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#A0A3BD]">Pass Rate</p>
            <p className="text-xl font-bold text-[#363473]">{passRate}%</p>
          </div>
          <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#A0A3BD]">Average Marks</p>
            <p className="text-xl font-bold text-[#1B1D3A]">{avgMarks}</p>
          </div>
          <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              <p className="text-xs text-[#A0A3BD]">Highest</p>
            </div>
            <p className="text-xl font-bold text-green-700">{highestMark}</p>
          </div>
          <div className="rounded-xl border border-[#ECEDF3] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              <p className="text-xs text-[#A0A3BD]">Lowest</p>
            </div>
            <p className="text-xl font-bold text-red-600">{lowestMark}</p>
          </div>
        </div>

        {/* Student Results Table */}
        <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm mb-6">
          <div className="flex items-center justify-between p-4 border-b border-[#ECEDF3]">
            <h3 className="text-sm font-semibold text-[#1B1D3A]">Student Results</h3>
            <span className="text-xs text-[#A0A3BD]">{results.length} students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
                  <th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Student Name</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">
                    <button type="button" onClick={toggleSort} className="inline-flex items-center gap-1 hover:text-[#363473]">
                      Marks
                      {sortDirection === 'desc' ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Percentage</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Grade</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A]">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result) => {
                  const percentage = Math.round((result.marksObtained / exam.maxMarks) * 100);
                  return (
                    <tr key={result.id} className="border-b border-[#ECEDF3] last:border-b-0 hover:bg-[#F5F6FA]">
                      <td className="px-4 py-2.5 font-medium text-[#1B1D3A]">{result.studentName}</td>
                      <td className="px-4 py-2.5 text-[#6E7191]">{result.marksObtained} / {exam.maxMarks}</td>
                      <td className="px-4 py-2.5 text-[#6E7191]">{percentage}%</td>
                      <td className="px-4 py-2.5 font-medium text-[#363473]">{result.grade}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          result.status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContent>
  );
}
