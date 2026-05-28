/**
 * Communication module data - messages, announcements, contacts.
 */

// --- Types ---

export type MessageStatus = 'read' | 'unread';
export type MessagePriority = 'normal' | 'high' | 'urgent';
export type RecipientType = 'individual' | 'group' | 'all';
export type AnnouncementCategory = 'General' | 'Academic' | 'Event' | 'Holiday' | 'Exam' | 'Fee';

export interface Message {
  id: string;
  from: string;
  fromRole: string;
  to: string;
  toRole: string;
  subject: string;
  body: string;
  date: string;
  time: string;
  status: MessageStatus;
  priority: MessagePriority;
  starred: boolean;
  hasAttachment: boolean;
  folder: 'inbox' | 'sent';
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  postedBy: string;
  postedDate: string;
  expiryDate: string | null;
  targetAudience: string;
  pinned: boolean;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
}

// --- Contacts ---

export const CONTACTS: Contact[] = [
  { id: 'c1', name: 'Sri Venkat Rao', role: 'Faculty', email: 'venkat.rao@sunrise.edu', department: 'Physics' },
  { id: 'c2', name: 'Smt. Lakshmi Devi', role: 'Faculty', email: 'lakshmi.devi@sunrise.edu', department: 'Mathematics' },
  { id: 'c3', name: 'Sri Ramana Murthy', role: 'Faculty', email: 'ramana.m@sunrise.edu', department: 'Chemistry' },
  { id: 'c4', name: 'Principal - Dr. Sharma', role: 'Admin', email: 'principal@sunrise.edu', department: 'Administration' },
  { id: 'c5', name: 'Accounts Office', role: 'Staff', email: 'accounts@sunrise.edu', department: 'Finance' },
  { id: 'c6', name: 'Library - Sri Narayana', role: 'Staff', email: 'library@sunrise.edu', department: 'Library' },
  { id: 'c7', name: 'Smt. Padmavathi', role: 'Faculty', email: 'padmavathi@sunrise.edu', department: 'Telugu' },
  { id: 'c8', name: 'Sri Krishna Rao', role: 'Faculty', email: 'krishna.rao@sunrise.edu', department: 'English' },
  { id: 'c9', name: 'Transport Office', role: 'Staff', email: 'transport@sunrise.edu', department: 'Transport' },
  { id: 'c10', name: 'HR Department', role: 'Admin', email: 'hr@sunrise.edu', department: 'Human Resources' },
  { id: 'c11', name: 'All Students', role: 'Group', email: 'students@sunrise.edu', department: 'All' },
  { id: 'c12', name: 'All Faculty', role: 'Group', email: 'faculty@sunrise.edu', department: 'All' },
  { id: 'c13', name: 'All Parents', role: 'Group', email: 'parents@sunrise.edu', department: 'All' },
];

// --- Messages ---

export const INITIAL_MESSAGES: Message[] = [
  { id: 'm1', from: 'Principal - Dr. Sharma', fromRole: 'Admin', to: 'You', toRole: 'Admin', subject: 'Staff Meeting - Monday 9 AM', body: 'Dear Team,\n\nPlease be informed that there will be a mandatory staff meeting on Monday at 9:00 AM in the conference hall. Agenda includes academic calendar review and upcoming exam preparations.\n\nPlease confirm your attendance.\n\nRegards,\nDr. Sharma\nPrincipal', date: '2024-12-12', time: '08:30', status: 'unread', priority: 'high', starred: true, hasAttachment: false, folder: 'inbox' },
  { id: 'm2', from: 'Sri Venkat Rao', fromRole: 'Faculty', to: 'You', toRole: 'Admin', subject: 'Physics Lab Equipment Request', body: 'Dear Admin,\n\nI would like to request the following lab equipment for the upcoming practical sessions:\n\n1. Vernier Calipers (5 sets)\n2. Spectrometer (2 units)\n3. Galvanometer (3 units)\n\nThe current equipment is outdated and needs replacement before the quarterly exams.\n\nPlease process this at the earliest.\n\nThank you,\nSri Venkat Rao\nPhysics Department', date: '2024-12-11', time: '14:20', status: 'unread', priority: 'normal', starred: false, hasAttachment: true, folder: 'inbox' },
  { id: 'm3', from: 'Accounts Office', fromRole: 'Staff', to: 'You', toRole: 'Admin', subject: 'Fee Collection Report - November 2024', body: 'Dear Admin,\n\nPlease find attached the fee collection report for November 2024.\n\nSummary:\n- Total Expected: ₹45,00,000\n- Total Collected: ₹38,50,000\n- Pending: ₹6,50,000\n- Collection Rate: 85.5%\n\n12 students have fees overdue by more than 30 days. Reminder notices have been sent.\n\nRegards,\nAccounts Office', date: '2024-12-10', time: '10:00', status: 'read', priority: 'normal', starred: false, hasAttachment: true, folder: 'inbox' },
  { id: 'm4', from: 'Smt. Lakshmi Devi', fromRole: 'Faculty', to: 'You', toRole: 'Admin', subject: 'Mathematics Olympiad - Student Nominations', body: 'Dear Admin,\n\nI would like to nominate the following students for the State Mathematics Olympiad 2025:\n\n1. Ravi Kumar (MPC) - Rank 1 in internal tests\n2. Arjun Reddy (MPC) - Consistent performer\n3. Meera Das (MEC) - Published research paper\n\nRegistration deadline is January 15, 2025. Please process the registrations.\n\nRegards,\nSmt. Lakshmi Devi', date: '2024-12-09', time: '16:45', status: 'read', priority: 'normal', starred: true, hasAttachment: false, folder: 'inbox' },
  { id: 'm5', from: 'Transport Office', fromRole: 'Staff', to: 'You', toRole: 'Admin', subject: 'Bus Route Change - Route 7', body: 'Dear Admin,\n\nDue to road construction on MG Road, Bus Route 7 will be diverted via Jubilee Hills from December 15, 2024. This affects approximately 25 students.\n\nNew pickup timings have been updated. Please inform the affected parents.\n\nRegards,\nTransport Office', date: '2024-12-08', time: '09:15', status: 'read', priority: 'high', starred: false, hasAttachment: false, folder: 'inbox' },
  { id: 'm6', from: 'HR Department', fromRole: 'Admin', to: 'You', toRole: 'Admin', subject: 'Leave Applications Pending Approval', body: 'Dear Admin,\n\nThe following leave applications are pending your approval:\n\n1. Sri Ramana Murthy - 3 days (Dec 18-20) - Personal\n2. Smt. Revathi - 1 day (Dec 16) - Medical\n3. Sri Shankar - 2 days (Dec 19-20) - Family function\n\nPlease review and approve/reject at the earliest.\n\nRegards,\nHR Department', date: '2024-12-07', time: '11:30', status: 'read', priority: 'normal', starred: false, hasAttachment: false, folder: 'inbox' },
  { id: 'm7', from: 'Library - Sri Narayana', fromRole: 'Staff', to: 'You', toRole: 'Admin', subject: 'New Books Procurement - Budget Approval', body: 'Dear Admin,\n\nAs per the annual library budget, I request approval for procuring the following:\n\n- JEE/NEET preparation books: ₹45,000\n- Reference encyclopedias: ₹25,000\n- Fiction section update: ₹15,000\n- Digital subscriptions: ₹30,000\n\nTotal: ₹1,15,000\n\nPlease approve the budget allocation.\n\nRegards,\nSri Narayana\nLibrarian', date: '2024-12-06', time: '13:00', status: 'read', priority: 'normal', starred: false, hasAttachment: true, folder: 'inbox' },

  // Sent messages
  { id: 'm8', from: 'You', fromRole: 'Admin', to: 'All Faculty', toRole: 'Group', subject: 'Quarterly Exam Schedule - December 2024', body: 'Dear Faculty,\n\nPlease find the quarterly exam schedule for December 2024. Exams will commence from December 16 and conclude on December 24.\n\nPlease submit question papers by December 12.\n\nRegards,\nAdmin', date: '2024-12-05', time: '09:00', status: 'read', priority: 'high', starred: false, hasAttachment: true, folder: 'sent' },
  { id: 'm9', from: 'You', fromRole: 'Admin', to: 'All Parents', toRole: 'Group', subject: 'Parent-Teacher Meeting - December 28', body: 'Dear Parents,\n\nYou are cordially invited to the Parent-Teacher Meeting scheduled for December 28, 2024 (Saturday) from 10:00 AM to 1:00 PM.\n\nAgenda:\n- Academic progress discussion\n- Quarterly exam results\n- Upcoming events\n\nPlease confirm your attendance.\n\nRegards,\nSunrise Academy', date: '2024-12-04', time: '10:30', status: 'read', priority: 'normal', starred: false, hasAttachment: false, folder: 'sent' },
  { id: 'm10', from: 'You', fromRole: 'Admin', to: 'Accounts Office', toRole: 'Staff', subject: 'Re: Fee Defaulters - Action Required', body: 'Dear Accounts,\n\nPlease send final reminder notices to all students with fees overdue by more than 60 days. If no response within 7 days, escalate to the principal.\n\nAlso, prepare a consolidated report for the board meeting.\n\nRegards,\nAdmin', date: '2024-12-03', time: '15:00', status: 'read', priority: 'normal', starred: false, hasAttachment: false, folder: 'sent' },
  { id: 'm11', from: 'You', fromRole: 'Admin', to: 'Sri Venkat Rao', toRole: 'Faculty', subject: 'Re: Physics Lab Equipment Request', body: 'Dear Sri Venkat Rao,\n\nYour request for lab equipment has been approved. The procurement team will process the order this week. Expected delivery: 10-12 working days.\n\nRegards,\nAdmin', date: '2024-12-02', time: '11:00', status: 'read', priority: 'normal', starred: false, hasAttachment: false, folder: 'sent' },
  { id: 'm12', from: 'You', fromRole: 'Admin', to: 'All Students', toRole: 'Group', subject: 'Holiday Notice - Sankranti Festival', body: 'Dear Students,\n\nThe college will remain closed from January 13 to January 16, 2025 on account of Sankranti festival.\n\nClasses will resume on January 17, 2025 (Friday).\n\nWishing you all a happy Sankranti!\n\nRegards,\nSunrise Academy', date: '2024-12-01', time: '08:00', status: 'read', priority: 'normal', starred: false, hasAttachment: false, folder: 'sent' },
];

// --- Announcements ---

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'Quarterly Exams - December 2024', body: 'Quarterly examinations will be held from December 16 to December 24, 2024. Detailed timetable has been shared with class teachers. Students are advised to prepare well.', category: 'Exam', postedBy: 'Admin', postedDate: '2024-12-05', expiryDate: '2024-12-25', targetAudience: 'All Students', pinned: true },
  { id: 'a2', title: 'Fee Payment Reminder - Last Date Dec 15', body: 'This is to remind all students that the last date for quarterly fee payment is December 15, 2024. Late fee of 2% per month will be applicable after the due date. Please clear your dues to avoid penalty.', category: 'Fee', postedBy: 'Accounts', postedDate: '2024-12-03', expiryDate: '2024-12-16', targetAudience: 'All Students & Parents', pinned: true },
  { id: 'a3', title: 'Annual Sports Day - January 25, 2025', body: 'The Annual Sports Day will be celebrated on January 25, 2025 (Republic Day Eve). Events include athletics, team sports, and cultural programs. Students interested in participating should register with their PE teacher by January 10.', category: 'Event', postedBy: 'Sports Dept', postedDate: '2024-12-01', expiryDate: '2025-01-26', targetAudience: 'All', pinned: false },
  { id: 'a4', title: 'Sankranti Holidays - Jan 13 to 16', body: 'The college will remain closed from January 13 to January 16, 2025 on account of Sankranti/Pongal festival. Classes resume on January 17, 2025.', category: 'Holiday', postedBy: 'Admin', postedDate: '2024-12-10', expiryDate: '2025-01-17', targetAudience: 'All', pinned: false },
  { id: 'a5', title: 'Library Timings Extended During Exams', body: 'During the exam period (Dec 16-24), the library will remain open from 7:00 AM to 8:00 PM (extended by 2 hours). Students are encouraged to utilize this facility for exam preparation.', category: 'Academic', postedBy: 'Library', postedDate: '2024-12-08', expiryDate: '2024-12-25', targetAudience: 'All Students', pinned: false },
  { id: 'a6', title: 'Parent-Teacher Meeting - Dec 28', body: 'Parent-Teacher Meeting is scheduled for December 28, 2024 (Saturday) from 10:00 AM to 1:00 PM. All parents are requested to attend to discuss their ward\'s academic progress and quarterly results.', category: 'Event', postedBy: 'Admin', postedDate: '2024-12-04', expiryDate: '2024-12-29', targetAudience: 'All Parents', pinned: false },
  { id: 'a7', title: 'New Computer Lab Inaugurated', body: 'We are pleased to announce that the new Computer Lab with 40 workstations has been inaugurated. The lab is equipped with latest hardware and software for programming and digital learning.', category: 'General', postedBy: 'Principal', postedDate: '2024-11-28', expiryDate: null, targetAudience: 'All', pinned: false },
  { id: 'a8', title: 'EAMCET Coaching - Extra Classes', body: 'Extra coaching classes for TS EAMCET and AP EAMCET preparation will begin from January 6, 2025. Timings: 6:30 AM - 7:30 AM (before regular classes). Interested MPC and BiPC students should register with their class teacher.', category: 'Academic', postedBy: 'Academic Coordinator', postedDate: '2024-12-09', expiryDate: '2025-01-07', targetAudience: 'MPC & BiPC Students', pinned: false },
];
