/**
 * Reports module data - mock data and types for all report categories.
 */

// --- Types ---

export type ReportCategory = 'academic' | 'attendance' | 'fees' | 'admissions' | 'staff' | 'students';

export type ReportStatus = 'ready' | 'generating' | 'scheduled';

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  lastGenerated: string;
  frequency: 'On Demand' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
}

export interface GeneratedReport {
  id: string;
  reportId: string;
  reportName: string;
  category: ReportCategory;
  generatedAt: string;
  generatedBy: string;
  format: 'PDF' | 'Excel' | 'CSV';
  size: string;
  status: ReportStatus;
}

// --- Report Definitions ---

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  // Academic Reports
  { id: 'r1', name: 'Exam Results Summary', description: 'Overall pass/fail rates, averages, and toppers across all exams', category: 'academic', lastGenerated: '2024-12-10', frequency: 'Monthly' },
  { id: 'r2', name: 'Subject-wise Performance', description: 'Performance breakdown by subject with trends', category: 'academic', lastGenerated: '2024-12-08', frequency: 'Quarterly' },
  { id: 'r3', name: 'Course-wise Analysis', description: 'Comparative analysis across MPC, BiPC, CEC, MEC, HEC courses', category: 'academic', lastGenerated: '2024-12-05', frequency: 'Monthly' },
  { id: 'r4', name: 'Student Progress Report', description: 'Individual student academic progress over time', category: 'academic', lastGenerated: '2024-12-09', frequency: 'On Demand' },
  { id: 'r5', name: 'Faculty Performance Report', description: 'Faculty-wise student results and pass rates', category: 'academic', lastGenerated: '2024-11-30', frequency: 'Quarterly' },
  { id: 'r6', name: 'Competitive Exam Readiness', description: 'Student preparedness for JEE, NEET, EAMCET based on internal scores', category: 'academic', lastGenerated: '2024-12-01', frequency: 'Monthly' },

  // Attendance Reports
  { id: 'r7', name: 'Daily Attendance Report', description: 'Day-wise attendance summary for all classes', category: 'attendance', lastGenerated: '2024-12-12', frequency: 'Daily' },
  { id: 'r8', name: 'Monthly Attendance Summary', description: 'Monthly attendance percentages by class and student', category: 'attendance', lastGenerated: '2024-12-01', frequency: 'Monthly' },
  { id: 'r9', name: 'Absentee Report', description: 'Students with attendance below threshold', category: 'attendance', lastGenerated: '2024-12-10', frequency: 'Weekly' },
  { id: 'r10', name: 'Late Arrivals Report', description: 'Students frequently arriving late', category: 'attendance', lastGenerated: '2024-12-09', frequency: 'Weekly' },
  { id: 'r11', name: 'Leave Analysis Report', description: 'Leave patterns and types across students', category: 'attendance', lastGenerated: '2024-11-28', frequency: 'Monthly' },

  // Fee Reports
  { id: 'r12', name: 'Fee Collection Summary', description: 'Total fees collected vs pending by course and term', category: 'fees', lastGenerated: '2024-12-11', frequency: 'Monthly' },
  { id: 'r13', name: 'Outstanding Dues Report', description: 'Students with pending fee payments', category: 'fees', lastGenerated: '2024-12-10', frequency: 'Weekly' },
  { id: 'r14', name: 'Scholarship Report', description: 'Scholarship disbursements and beneficiaries', category: 'fees', lastGenerated: '2024-11-30', frequency: 'Quarterly' },
  { id: 'r15', name: 'Fee Defaulters Report', description: 'Students who have not paid fees beyond due date', category: 'fees', lastGenerated: '2024-12-08', frequency: 'Weekly' },
  { id: 'r16', name: 'Revenue Analysis', description: 'Revenue trends, projections, and category-wise breakdown', category: 'fees', lastGenerated: '2024-12-01', frequency: 'Monthly' },

  // Admission Reports
  { id: 'r17', name: 'Admission Pipeline Report', description: 'Enquiry to enrollment conversion funnel', category: 'admissions', lastGenerated: '2024-12-10', frequency: 'Weekly' },
  { id: 'r18', name: 'Course-wise Enrollment', description: 'Enrollment numbers by course with capacity utilization', category: 'admissions', lastGenerated: '2024-12-05', frequency: 'Monthly' },
  { id: 'r19', name: 'Rejection Analysis', description: 'Reasons for rejection and stage-wise dropout', category: 'admissions', lastGenerated: '2024-11-25', frequency: 'Quarterly' },
  { id: 'r20', name: 'Source of Enquiry Report', description: 'Where enquiries are coming from (referral, website, walk-in)', category: 'admissions', lastGenerated: '2024-12-03', frequency: 'Monthly' },

  // Staff Reports
  { id: 'r21', name: 'Staff Attendance Report', description: 'Faculty and staff attendance summary', category: 'staff', lastGenerated: '2024-12-11', frequency: 'Monthly' },
  { id: 'r22', name: 'Workload Distribution', description: 'Teaching hours and subject allocation per faculty', category: 'staff', lastGenerated: '2024-12-01', frequency: 'Quarterly' },
  { id: 'r23', name: 'Leave Balance Report', description: 'Staff leave balances and utilization', category: 'staff', lastGenerated: '2024-12-05', frequency: 'Monthly' },
  { id: 'r24', name: 'Payroll Summary', description: 'Monthly salary disbursement summary', category: 'staff', lastGenerated: '2024-12-01', frequency: 'Monthly' },

  // Student Reports
  { id: 'r25', name: 'Student Strength Report', description: 'Total students by course, section, and year', category: 'students', lastGenerated: '2024-12-10', frequency: 'Monthly' },
  { id: 'r26', name: 'Transfer Certificate Report', description: 'TC issued and pending requests', category: 'students', lastGenerated: '2024-11-20', frequency: 'On Demand' },
  { id: 'r27', name: 'Student Demographics', description: 'Gender, category, and region-wise student distribution', category: 'students', lastGenerated: '2024-12-01', frequency: 'Quarterly' },
  { id: 'r28', name: 'Disciplinary Report', description: 'Disciplinary actions and behavioral incidents', category: 'students', lastGenerated: '2024-11-28', frequency: 'Monthly' },
  { id: 'r29', name: 'Library Usage Report', description: 'Books issued, returned, and overdue by student', category: 'students', lastGenerated: '2024-12-08', frequency: 'Weekly' },
];

// --- Generated Reports History ---

export const GENERATED_REPORTS: GeneratedReport[] = [
  { id: 'g1', reportId: 'r1', reportName: 'Exam Results Summary', category: 'academic', generatedAt: '2024-12-10 09:30', generatedBy: 'Admin', format: 'PDF', size: '2.4 MB', status: 'ready' },
  { id: 'g2', reportId: 'r7', reportName: 'Daily Attendance Report', category: 'attendance', generatedAt: '2024-12-12 08:00', generatedBy: 'System', format: 'Excel', size: '1.1 MB', status: 'ready' },
  { id: 'g3', reportId: 'r12', reportName: 'Fee Collection Summary', category: 'fees', generatedAt: '2024-12-11 14:15', generatedBy: 'Admin', format: 'PDF', size: '3.2 MB', status: 'ready' },
  { id: 'g4', reportId: 'r17', reportName: 'Admission Pipeline Report', category: 'admissions', generatedAt: '2024-12-10 11:00', generatedBy: 'Admin', format: 'Excel', size: '890 KB', status: 'ready' },
  { id: 'g5', reportId: 'r25', reportName: 'Student Strength Report', category: 'students', generatedAt: '2024-12-10 10:45', generatedBy: 'Admin', format: 'PDF', size: '1.8 MB', status: 'ready' },
  { id: 'g6', reportId: 'r3', reportName: 'Course-wise Analysis', category: 'academic', generatedAt: '2024-12-05 16:30', generatedBy: 'Principal', format: 'PDF', size: '4.1 MB', status: 'ready' },
  { id: 'g7', reportId: 'r8', reportName: 'Monthly Attendance Summary', category: 'attendance', generatedAt: '2024-12-01 09:00', generatedBy: 'System', format: 'Excel', size: '2.7 MB', status: 'ready' },
  { id: 'g8', reportId: 'r13', reportName: 'Outstanding Dues Report', category: 'fees', generatedAt: '2024-12-10 13:00', generatedBy: 'Accounts', format: 'CSV', size: '450 KB', status: 'ready' },
  { id: 'g9', reportId: 'r21', reportName: 'Staff Attendance Report', category: 'staff', generatedAt: '2024-12-11 08:30', generatedBy: 'HR', format: 'Excel', size: '1.5 MB', status: 'ready' },
  { id: 'g10', reportId: 'r2', reportName: 'Subject-wise Performance', category: 'academic', generatedAt: '2024-12-08 15:00', generatedBy: 'Admin', format: 'PDF', size: '5.3 MB', status: 'ready' },
];

// --- Category Metadata ---

export const CATEGORY_META: Record<ReportCategory, { label: string; description: string }> = {
  academic: { label: 'Academic', description: 'Exam results, performance analysis, and progress reports' },
  attendance: { label: 'Attendance', description: 'Daily, monthly, and absentee attendance reports' },
  fees: { label: 'Fees', description: 'Fee collection, dues, scholarships, and revenue' },
  admissions: { label: 'Admissions', description: 'Pipeline, enrollment, and conversion reports' },
  staff: { label: 'Staff', description: 'Staff attendance, workload, and payroll reports' },
  students: { label: 'Students', description: 'Strength, demographics, and student activity reports' },
};
