/**
 * Shared exam data and helper functions for the Exams module.
 * Telangana/AP Intermediate level exam data.
 */

// --- Types ---

export type ExamType = 'Weekly Test' | 'Quarterly' | 'Half-Yearly' | 'Pre-Final' | 'Annual';

export type ExamCategory = 'Internal' | 'Board' | 'Competitive';

export interface StudentResult {
  id: string;
  studentName: string;
  marksObtained: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

export interface Exam {
  id: string;
  name: string;
  category: ExamCategory;
  course: string;
  subject: string;
  type: ExamType;
  date: string;
  maxMarks: number;
  faculty: string;
  totalStudents: number;
  passCount: number;
  failCount: number;
  avgMarks: number;
  results: StudentResult[];
}

export interface CompetitiveExam {
  id: string;
  name: string;
  category: 'Competitive';
  course: string;
  date: string;
  registrationDeadline: string;
  maxMarks: number;
  description: string;
}

export interface ExamFormData {
  name: string;
  course: string;
  subject: string;
  type: string;
  date: string;
  maxMarks: string;
  faculty: string;
}

// --- Constants ---

export const COURSES: string[] = ['MPC', 'BiPC', 'CEC', 'MEC', 'HEC'];

export const SUBJECTS_BY_COURSE: Record<string, string[]> = {
  'MPC': ['Mathematics IA', 'Mathematics IB', 'Mathematics IIA', 'Mathematics IIB', 'Physics', 'Chemistry', 'English', 'Telugu', 'Sanskrit'],
  'BiPC': ['Botany', 'Zoology', 'Physics', 'Chemistry', 'English', 'Telugu', 'Sanskrit'],
  'CEC': ['Civics', 'Economics', 'Commerce', 'English', 'Telugu', 'Sanskrit'],
  'MEC': ['Mathematics IA', 'Mathematics IB', 'Economics', 'Commerce', 'English', 'Telugu', 'Sanskrit'],
  'HEC': ['History', 'Economics', 'Commerce', 'English', 'Telugu', 'Sanskrit'],
};

export const FACULTY_LIST: string[] = [
  'Sri Venkat Rao', 'Smt. Lakshmi Devi', 'Sri Ramana Murthy', 'Smt. Padmavathi',
  'Sri Krishna Rao', 'Smt. Saraswathi', 'Sri Narasimha', 'Sri Subramaniam',
  'Smt. Revathi', 'Sri Shankar', 'Smt. Durga', 'Sri Narayana',
];

export const EXAM_TYPES: ExamType[] = ['Weekly Test', 'Quarterly', 'Half-Yearly', 'Pre-Final', 'Annual'];

// --- Helper Functions ---

export function generateResults(count: number, maxMarks: number): StudentResult[] {
  const names = ['Ravi Kumar', 'Priya Sharma', 'Arjun Reddy', 'Kavitha Rao', 'Deepak Yadav', 'Ananya Gupta', 'Vikram Naidu', 'Meera Devi', 'Rahul Verma', 'Swathi Reddy', 'Manish Kumar', 'Pooja Lakshmi', 'Sanjay Rao', 'Nisha Kumari', 'Kiran Reddy', 'Rohit Sharma', 'Divya Sree', 'Arun Kumar', 'Sneha Reddy', 'Harish Babu'];
  const passThreshold = maxMarks * 0.4;
  return names.slice(0, count).map((name, i) => {
    const marks = Math.floor(Math.random() * (maxMarks - 10)) + 10;
    const status: 'Pass' | 'Fail' = marks >= passThreshold ? 'Pass' : 'Fail';
    const pct = marks / maxMarks;
    const grade = pct >= 0.9 ? 'A+' : pct >= 0.8 ? 'A' : pct >= 0.7 ? 'B+' : pct >= 0.6 ? 'B' : pct >= 0.5 ? 'C' : pct >= 0.4 ? 'D' : 'F';
    return { id: `r${i}`, studentName: name, marksObtained: marks, grade, status };
  });
}

export function createExam(id: string, name: string, course: string, subject: string, type: ExamType, date: string, maxMarks: number, faculty: string, studentCount: number): Exam {
  const results = generateResults(studentCount, maxMarks);
  const passCount = results.filter((r) => r.status === 'Pass').length;
  const avgMarks = Math.round(results.reduce((sum, r) => sum + r.marksObtained, 0) / results.length);
  return { id, name, category: 'Internal', course, subject, type, date, maxMarks, faculty, totalStudents: studentCount, passCount, failCount: studentCount - passCount, avgMarks, results };
}

// --- Competitive Exams Data ---

export const COMPETITIVE_EXAMS: CompetitiveExam[] = [
  { id: 'c1', name: 'NEET UG 2025', category: 'Competitive', course: 'BiPC', date: '2025-05-04', registrationDeadline: '2025-03-15', maxMarks: 720, description: 'National Eligibility cum Entrance Test for Medical courses' },
  { id: 'c2', name: 'JEE Mains 2025 (Jan)', category: 'Competitive', course: 'MPC', date: '2025-01-22', registrationDeadline: '2024-12-20', maxMarks: 300, description: 'Joint Entrance Examination for Engineering courses' },
  { id: 'c3', name: 'JEE Advanced 2025', category: 'Competitive', course: 'MPC', date: '2025-05-18', registrationDeadline: '2025-04-30', maxMarks: 360, description: 'For admission to IITs' },
  { id: 'c4', name: 'TS EAMCET 2025', category: 'Competitive', course: 'MPC', date: '2025-05-07', registrationDeadline: '2025-04-01', maxMarks: 160, description: 'Telangana State Engineering, Agriculture & Medical Common Entrance Test' },
  { id: 'c5', name: 'AP EAMCET 2025', category: 'Competitive', course: 'MPC', date: '2025-05-14', registrationDeadline: '2025-03-25', maxMarks: 160, description: 'Andhra Pradesh Engineering, Agriculture & Medical Common Entrance Test' },
  { id: 'c6', name: 'TS EAMCET (BiPC) 2025', category: 'Competitive', course: 'BiPC', date: '2025-05-09', registrationDeadline: '2025-04-01', maxMarks: 160, description: 'TS EAMCET for Agriculture & Medical streams' },
  { id: 'c7', name: 'AP EAMCET (BiPC) 2025', category: 'Competitive', course: 'BiPC', date: '2025-05-16', registrationDeadline: '2025-03-25', maxMarks: 160, description: 'AP EAMCET for Agriculture & Medical streams' },
  { id: 'c8', name: 'TS ICET 2025', category: 'Competitive', course: 'CEC', date: '2025-06-05', registrationDeadline: '2025-04-15', maxMarks: 200, description: 'Telangana Integrated Common Entrance Test for MBA/MCA' },
];

// --- Internal Exams Data ---

export const INITIAL_EXAMS: Exam[] = [
  createExam('1', 'Mathematics IA Weekly Test 1', 'MPC', 'Mathematics IA', 'Weekly Test', '2024-12-01', 50, 'Smt. Lakshmi Devi', 15),
  createExam('2', 'Physics Quarterly', 'MPC', 'Physics', 'Quarterly', '2024-11-15', 100, 'Sri Venkat Rao', 18),
  createExam('3', 'Chemistry Half-Yearly', 'MPC', 'Chemistry', 'Half-Yearly', '2024-10-20', 100, 'Sri Ramana Murthy', 20),
  createExam('4', 'Mathematics IB Pre-Final', 'MPC', 'Mathematics IB', 'Pre-Final', '2024-12-05', 100, 'Smt. Lakshmi Devi', 18),
  createExam('5', 'English Quarterly', 'MPC', 'English', 'Quarterly', '2024-11-10', 100, 'Sri Krishna Rao', 16),
  createExam('6', 'Telugu Weekly Test 1', 'MPC', 'Telugu', 'Weekly Test', '2024-12-02', 50, 'Smt. Padmavathi', 14),
  createExam('7', 'Botany Annual', 'BiPC', 'Botany', 'Annual', '2024-10-25', 100, 'Smt. Saraswathi', 20),
  createExam('8', 'Zoology Quarterly', 'BiPC', 'Zoology', 'Quarterly', '2024-11-18', 100, 'Sri Narasimha', 18),
  createExam('9', 'Physics Half-Yearly', 'BiPC', 'Physics', 'Half-Yearly', '2024-12-03', 100, 'Sri Venkat Rao', 15),
  createExam('10', 'Chemistry Pre-Final', 'BiPC', 'Chemistry', 'Pre-Final', '2024-10-30', 100, 'Sri Ramana Murthy', 17),
  createExam('11', 'Economics Quarterly', 'CEC', 'Economics', 'Quarterly', '2024-11-12', 100, 'Sri Subramaniam', 14),
  createExam('12', 'Commerce Weekly Test 1', 'CEC', 'Commerce', 'Weekly Test', '2024-12-04', 50, 'Smt. Revathi', 12),
  createExam('13', 'Civics Half-Yearly', 'CEC', 'Civics', 'Half-Yearly', '2024-12-06', 100, 'Sri Shankar', 16),
  createExam('14', 'Economics Annual', 'MEC', 'Economics', 'Annual', '2024-11-20', 100, 'Sri Subramaniam', 16),
  createExam('15', 'Mathematics IA Quarterly', 'MEC', 'Mathematics IA', 'Quarterly', '2024-10-22', 100, 'Smt. Lakshmi Devi', 15),
  createExam('16', 'Commerce Pre-Final', 'MEC', 'Commerce', 'Pre-Final', '2024-11-22', 100, 'Smt. Revathi', 20),
  createExam('17', 'History Weekly Test 1', 'HEC', 'History', 'Weekly Test', '2024-12-07', 50, 'Smt. Durga', 13),
  createExam('18', 'Economics Half-Yearly', 'HEC', 'Economics', 'Half-Yearly', '2024-10-28', 100, 'Sri Subramaniam', 14),
  createExam('19', 'Commerce Quarterly', 'HEC', 'Commerce', 'Quarterly', '2024-12-08', 100, 'Smt. Revathi', 15),
  createExam('20', 'Sanskrit Annual', 'MPC', 'Sanskrit', 'Annual', '2024-11-25', 100, 'Sri Narayana', 18),
  createExam('21', 'English Pre-Final', 'BiPC', 'English', 'Pre-Final', '2024-12-09', 100, 'Sri Krishna Rao', 17),
];
