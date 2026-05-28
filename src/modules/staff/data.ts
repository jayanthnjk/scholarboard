/**
 * Shared faculty data for the Staff module.
 * Telangana/AP Intermediate level faculty data.
 */

// --- Types ---

export interface FacultyMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  designation: string;
  courses: string[];
  subjects: string[];
  status: 'Active' | 'On Leave' | 'Inactive';
}

export interface FacultyFormData {
  name: string;
  email: string;
  phone: string;
  qualification: string;
  designation: string;
  courses: string[];
  subjects: string[];
}

// --- Constants ---

export const COURSES_LIST: string[] = ['MPC', 'BiPC', 'CEC', 'MEC', 'HEC'];

export const SUBJECTS_BY_COURSE: Record<string, string[]> = {
  'MPC': ['Mathematics IA', 'Mathematics IB', 'Mathematics IIA', 'Mathematics IIB', 'Physics', 'Chemistry', 'English', 'Telugu', 'Sanskrit'],
  'BiPC': ['Botany', 'Zoology', 'Physics', 'Chemistry', 'English', 'Telugu', 'Sanskrit'],
  'CEC': ['Civics', 'Economics', 'Commerce', 'English', 'Telugu', 'Sanskrit'],
  'MEC': ['Mathematics IA', 'Mathematics IB', 'Economics', 'Commerce', 'English', 'Telugu', 'Sanskrit'],
  'HEC': ['History', 'Economics', 'Commerce', 'English', 'Telugu', 'Sanskrit'],
};

export const INITIAL_FACULTY: FacultyMember[] = [
  { id: '1', name: 'Sri Venkat Rao', email: 'venkat.rao@college.edu', phone: '+91 9800000001', qualification: 'M.Sc. Physics', designation: 'Senior Lecturer', courses: ['MPC', 'BiPC'], subjects: ['Physics'], status: 'Active' },
  { id: '2', name: 'Smt. Lakshmi Devi', email: 'lakshmi.devi@college.edu', phone: '+91 9800000002', qualification: 'M.Sc. Mathematics', designation: 'Senior Lecturer', courses: ['MPC', 'MEC'], subjects: ['Mathematics IA', 'Mathematics IB', 'Mathematics IIA', 'Mathematics IIB'], status: 'Active' },
  { id: '3', name: 'Sri Ramana Murthy', email: 'ramana.murthy@college.edu', phone: '+91 9800000003', qualification: 'M.Sc. Chemistry', designation: 'Senior Lecturer', courses: ['MPC', 'BiPC'], subjects: ['Chemistry'], status: 'Active' },
  { id: '4', name: 'Smt. Padmavathi', email: 'padmavathi@college.edu', phone: '+91 9800000004', qualification: 'M.A. Telugu', designation: 'Lecturer', courses: ['MPC', 'BiPC', 'CEC', 'MEC', 'HEC'], subjects: ['Telugu'], status: 'Active' },
  { id: '5', name: 'Sri Krishna Rao', email: 'krishna.rao@college.edu', phone: '+91 9800000005', qualification: 'M.A. English', designation: 'Lecturer', courses: ['MPC', 'BiPC', 'CEC', 'MEC', 'HEC'], subjects: ['English'], status: 'Active' },
  { id: '6', name: 'Smt. Saraswathi', email: 'saraswathi@college.edu', phone: '+91 9800000006', qualification: 'M.Sc. Botany', designation: 'Lecturer', courses: ['BiPC'], subjects: ['Botany'], status: 'Active' },
  { id: '7', name: 'Sri Narasimha', email: 'narasimha@college.edu', phone: '+91 9800000007', qualification: 'M.Sc. Zoology', designation: 'Lecturer', courses: ['BiPC'], subjects: ['Zoology'], status: 'Active' },
  { id: '8', name: 'Sri Subramaniam', email: 'subramaniam@college.edu', phone: '+91 9800000008', qualification: 'M.A. Economics', designation: 'Senior Lecturer', courses: ['CEC', 'MEC', 'HEC'], subjects: ['Economics'], status: 'Active' },
  { id: '9', name: 'Smt. Revathi', email: 'revathi@college.edu', phone: '+91 9800000009', qualification: 'M.Com.', designation: 'Lecturer', courses: ['CEC', 'MEC', 'HEC'], subjects: ['Commerce'], status: 'Active' },
  { id: '10', name: 'Sri Shankar', email: 'shankar@college.edu', phone: '+91 9800000010', qualification: 'M.A. Political Science', designation: 'Lecturer', courses: ['CEC'], subjects: ['Civics'], status: 'On Leave' },
  { id: '11', name: 'Smt. Durga', email: 'durga@college.edu', phone: '+91 9800000011', qualification: 'M.A. History', designation: 'Lecturer', courses: ['HEC'], subjects: ['History'], status: 'Active' },
  { id: '12', name: 'Sri Narayana', email: 'narayana@college.edu', phone: '+91 9800000012', qualification: 'M.A. Sanskrit', designation: 'Lecturer', courses: ['MPC', 'BiPC', 'CEC', 'MEC', 'HEC'], subjects: ['Sanskrit'], status: 'Active' },
];

export const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  'On Leave': 'bg-yellow-100 text-yellow-800',
  Inactive: 'bg-red-100 text-red-800',
};
