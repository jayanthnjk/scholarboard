/**
 * Report Detail Page - Shows a specific report with sample data preview,
 * filter options, and export functionality.
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContent } from '@/components/layout/page-content';
import {
  ArrowLeft, Download,
  Calendar, RefreshCw, Printer,
} from 'lucide-react';
import { REPORT_DEFINITIONS, CATEGORY_META } from '../data';
import type { ReportCategory } from '../data';

// --- Mock report data generators ---

interface ReportRow {
  [key: string]: string | number;
}

function generateAcademicData(): { columns: string[]; rows: ReportRow[] } {
  return {
    columns: ['Exam Name', 'Course', 'Subject', 'Students', 'Pass %', 'Avg Marks', 'Topper'],
    rows: [
      { 'Exam Name': 'Mathematics IA Weekly Test', Course: 'MPC', Subject: 'Mathematics IA', Students: 15, 'Pass %': 80, 'Avg Marks': 38, Topper: 'Ravi Kumar' },
      { 'Exam Name': 'Physics Quarterly', Course: 'MPC', Subject: 'Physics', Students: 18, 'Pass %': 72, 'Avg Marks': 65, Topper: 'Priya Sharma' },
      { 'Exam Name': 'Chemistry Half-Yearly', Course: 'MPC', Subject: 'Chemistry', Students: 20, 'Pass %': 85, 'Avg Marks': 71, Topper: 'Arjun Reddy' },
      { 'Exam Name': 'Botany Annual', Course: 'BiPC', Subject: 'Botany', Students: 20, 'Pass %': 90, 'Avg Marks': 76, Topper: 'Kavitha Rao' },
      { 'Exam Name': 'Economics Quarterly', Course: 'CEC', Subject: 'Economics', Students: 14, 'Pass %': 64, 'Avg Marks': 58, Topper: 'Deepak Yadav' },
      { 'Exam Name': 'Commerce Pre-Final', Course: 'MEC', Subject: 'Commerce', Students: 20, 'Pass %': 75, 'Avg Marks': 62, Topper: 'Ananya Gupta' },
    ],
  };
}

function generateAttendanceData(): { columns: string[]; rows: ReportRow[] } {
  return {
    columns: ['Student Name', 'Course', 'Total Days', 'Present', 'Absent', 'Attendance %', 'Status'],
    rows: [
      { 'Student Name': 'Ravi Kumar', Course: 'MPC', 'Total Days': 25, Present: 23, Absent: 2, 'Attendance %': 92, Status: 'Regular' },
      { 'Student Name': 'Priya Sharma', Course: 'BiPC', 'Total Days': 25, Present: 21, Absent: 4, 'Attendance %': 84, Status: 'Regular' },
      { 'Student Name': 'Arjun Reddy', Course: 'MPC', 'Total Days': 25, Present: 18, Absent: 7, 'Attendance %': 72, Status: 'Warning' },
      { 'Student Name': 'Kavitha Rao', Course: 'CEC', 'Total Days': 25, Present: 25, Absent: 0, 'Attendance %': 100, Status: 'Excellent' },
      { 'Student Name': 'Deepak Yadav', Course: 'MEC', 'Total Days': 25, Present: 15, Absent: 10, 'Attendance %': 60, Status: 'Critical' },
      { 'Student Name': 'Ananya Gupta', Course: 'HEC', 'Total Days': 25, Present: 22, Absent: 3, 'Attendance %': 88, Status: 'Regular' },
    ],
  };
}

function generateFeesData(): { columns: string[]; rows: ReportRow[] } {
  return {
    columns: ['Student Name', 'Course', 'Total Fee', 'Paid', 'Pending', 'Due Date', 'Status'],
    rows: [
      { 'Student Name': 'Ravi Kumar', Course: 'MPC', 'Total Fee': 85000, Paid: 85000, Pending: 0, 'Due Date': '2024-11-30', Status: 'Paid' },
      { 'Student Name': 'Priya Sharma', Course: 'BiPC', 'Total Fee': 85000, Paid: 50000, Pending: 35000, 'Due Date': '2024-12-15', Status: 'Partial' },
      { 'Student Name': 'Arjun Reddy', Course: 'MPC', 'Total Fee': 85000, Paid: 0, Pending: 85000, 'Due Date': '2024-12-01', Status: 'Overdue' },
      { 'Student Name': 'Kavitha Rao', Course: 'CEC', 'Total Fee': 75000, Paid: 75000, Pending: 0, 'Due Date': '2024-11-30', Status: 'Paid' },
      { 'Student Name': 'Deepak Yadav', Course: 'MEC', 'Total Fee': 80000, Paid: 40000, Pending: 40000, 'Due Date': '2024-12-20', Status: 'Partial' },
      { 'Student Name': 'Ananya Gupta', Course: 'HEC', 'Total Fee': 70000, Paid: 70000, Pending: 0, 'Due Date': '2024-11-30', Status: 'Paid' },
    ],
  };
}

function generateAdmissionsData(): { columns: string[]; rows: ReportRow[] } {
  return {
    columns: ['Name', 'Course', 'Status', 'Enquiry Date', 'Days in Pipeline', 'Source'],
    rows: [
      { Name: 'Amit Patel', Course: 'Computer Science', Status: 'Inquiry', 'Enquiry Date': '2024-12-01', 'Days in Pipeline': 12, Source: 'Website' },
      { Name: 'Sneha Reddy', Course: 'MBA', Status: 'Applied', 'Enquiry Date': '2024-12-02', 'Days in Pipeline': 11, Source: 'Referral' },
      { Name: 'Ravi Kumar', Course: 'Mechanical Eng.', Status: 'Verified', 'Enquiry Date': '2024-12-03', 'Days in Pipeline': 10, Source: 'Walk-in' },
      { Name: 'Priya Sharma', Course: 'Data Science', Status: 'Interview', 'Enquiry Date': '2024-12-04', 'Days in Pipeline': 9, Source: 'Website' },
      { Name: 'Arjun Nair', Course: 'Electrical Eng.', Status: 'Offered', 'Enquiry Date': '2024-12-05', 'Days in Pipeline': 8, Source: 'Referral' },
      { Name: 'Kavitha Menon', Course: 'Computer Science', Status: 'Enrolled', 'Enquiry Date': '2024-12-06', 'Days in Pipeline': 7, Source: 'Walk-in' },
    ],
  };
}

function generateStaffData(): { columns: string[]; rows: ReportRow[] } {
  return {
    columns: ['Faculty Name', 'Department', 'Classes/Week', 'Attendance %', 'Leave Taken', 'Leave Balance'],
    rows: [
      { 'Faculty Name': 'Sri Venkat Rao', Department: 'Physics', 'Classes/Week': 18, 'Attendance %': 96, 'Leave Taken': 3, 'Leave Balance': 9 },
      { 'Faculty Name': 'Smt. Lakshmi Devi', Department: 'Mathematics', 'Classes/Week': 20, 'Attendance %': 100, 'Leave Taken': 0, 'Leave Balance': 12 },
      { 'Faculty Name': 'Sri Ramana Murthy', Department: 'Chemistry', 'Classes/Week': 16, 'Attendance %': 92, 'Leave Taken': 5, 'Leave Balance': 7 },
      { 'Faculty Name': 'Smt. Padmavathi', Department: 'Telugu', 'Classes/Week': 14, 'Attendance %': 88, 'Leave Taken': 7, 'Leave Balance': 5 },
      { 'Faculty Name': 'Sri Krishna Rao', Department: 'English', 'Classes/Week': 18, 'Attendance %': 94, 'Leave Taken': 4, 'Leave Balance': 8 },
      { 'Faculty Name': 'Smt. Saraswathi', Department: 'Botany', 'Classes/Week': 15, 'Attendance %': 98, 'Leave Taken': 1, 'Leave Balance': 11 },
    ],
  };
}

function generateStudentsData(): { columns: string[]; rows: ReportRow[] } {
  return {
    columns: ['Course', 'Year 1', 'Year 2', 'Total', 'Male', 'Female', 'Capacity', 'Utilization %'],
    rows: [
      { Course: 'MPC', 'Year 1': 120, 'Year 2': 115, Total: 235, Male: 140, Female: 95, Capacity: 250, 'Utilization %': 94 },
      { Course: 'BiPC', 'Year 1': 100, 'Year 2': 95, Total: 195, Male: 80, Female: 115, Capacity: 200, 'Utilization %': 98 },
      { Course: 'CEC', 'Year 1': 60, 'Year 2': 55, Total: 115, Male: 65, Female: 50, Capacity: 150, 'Utilization %': 77 },
      { Course: 'MEC', 'Year 1': 45, 'Year 2': 40, Total: 85, Male: 50, Female: 35, Capacity: 100, 'Utilization %': 85 },
      { Course: 'HEC', 'Year 1': 35, 'Year 2': 30, Total: 65, Male: 25, Female: 40, Capacity: 100, 'Utilization %': 65 },
    ],
  };
}

function getReportData(category: ReportCategory): { columns: string[]; rows: ReportRow[] } {
  switch (category) {
    case 'academic': return generateAcademicData();
    case 'attendance': return generateAttendanceData();
    case 'fees': return generateFeesData();
    case 'admissions': return generateAdmissionsData();
    case 'staff': return generateStaffData();
    case 'students': return generateStudentsData();
    default: return { columns: [], rows: [] };
  }
}

// --- Component ---

export function ReportDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState('2024-12-01');
  const [dateTo, setDateTo] = useState('2024-12-12');
  const [exportFormat, setExportFormat] = useState<'PDF' | 'Excel' | 'CSV'>('PDF');
  const [isGenerating, setIsGenerating] = useState(false);

  const report = REPORT_DEFINITIONS.find((r) => r.id === id);

  if (!report) {
    return (
      <PageContent>
        <div className="p-6">
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="inline-flex items-center gap-2 text-sm text-[#363473] hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Reports
          </button>
          <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-12 text-center">
            <p className="text-[#A0A3BD]">Report not found.</p>
          </div>
        </div>
      </PageContent>
    );
  }

  const { columns, rows } = getReportData(report.category);

  function handleExport(): void {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1500);
  }

  return (
    <PageContent>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Back + Breadcrumbs */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="inline-flex items-center gap-2 text-sm text-[#363473] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Reports
          </button>
          <div className="mt-2 flex items-center gap-2 text-xs text-[#A0A3BD]">
            <span>Home</span>
            <span>/</span>
            <span>Reports</span>
            <span>/</span>
            <span className="text-[#1B1D3A]">{report.name}</span>
          </div>
        </div>

        {/* Report Header */}
        <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1B1D3A]">{report.name}</h1>
              <p className="mt-1 text-sm text-[#6E7191]">{report.description}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="inline-flex rounded-full bg-[#363473]/10 px-2.5 py-0.5 text-xs font-medium text-[#363473]">
                  {CATEGORY_META[report.category].label}
                </span>
                <span className="text-xs text-[#A0A3BD]">Frequency: {report.frequency}</span>
                <span className="text-xs text-[#A0A3BD]">Last generated: {report.lastGenerated}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Export */}
        <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#A0A3BD]" />
              <label className="text-sm text-[#6E7191]">From:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#6E7191]">To:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#6E7191]">Format:</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'PDF' | 'Excel' | 'CSV')}
                className="rounded-lg border border-[#ECEDF3] px-3 py-1.5 text-sm text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473]"
              >
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="CSV">CSV</option>
              </select>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Download className="h-4 w-4" /> Export {exportFormat}</>
                )}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA] transition-colors"
              >
                <Printer className="h-4 w-4" /> Print
              </button>
            </div>
          </div>
        </div>

        {/* Report Data Preview */}
        <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm mb-6">
          <div className="flex items-center justify-between p-4 border-b border-[#ECEDF3]">
            <h3 className="text-sm font-semibold text-[#1B1D3A]">Report Preview</h3>
            <span className="text-xs text-[#A0A3BD]">{rows.length} records • Date range: {dateFrom} to {dateTo}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-2.5 text-left font-semibold text-[#1B1D3A] whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-[#ECEDF3] last:border-b-0 hover:bg-[#F5F6FA]">
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-2.5 text-[#6E7191] whitespace-nowrap">
                        {typeof row[col] === 'number' && col.includes('%') ? (
                          <span className={`font-medium ${
                            (row[col] as number) >= 90 ? 'text-green-700' :
                            (row[col] as number) >= 75 ? 'text-[#1B1D3A]' :
                            (row[col] as number) >= 60 ? 'text-yellow-700' : 'text-red-600'
                          }`}>
                            {row[col]}%
                          </span>
                        ) : col === 'Status' ? (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            row[col] === 'Paid' || row[col] === 'Excellent' || row[col] === 'Enrolled' ? 'bg-green-100 text-green-700' :
                            row[col] === 'Partial' || row[col] === 'Regular' || row[col] === 'Offered' ? 'bg-blue-100 text-blue-700' :
                            row[col] === 'Warning' || row[col] === 'Interview' ? 'bg-yellow-100 text-yellow-700' :
                            row[col] === 'Overdue' || row[col] === 'Critical' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {row[col]}
                          </span>
                        ) : typeof row[col] === 'number' && (col.includes('Fee') || col === 'Paid' || col === 'Pending') ? (
                          `₹${(row[col] as number).toLocaleString('en-IN')}`
                        ) : (
                          row[col]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Note */}
        <div className="rounded-xl border border-[#ECEDF3] bg-[#F5F6FA] p-4">
          <p className="text-xs text-[#6E7191]">
            This is a preview of the report data. Click "Export" to download the full report in your preferred format.
            Reports are generated based on the selected date range and current data.
          </p>
        </div>
      </div>
    </PageContent>
  );
}
