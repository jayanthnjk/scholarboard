/**
 * Library module data - books, borrowing records, and helper functions.
 */

// --- Types ---

export type BookStatus = 'Available' | 'Issued' | 'Reserved' | 'Lost';
export type BorrowStatus = 'Active' | 'Returned' | 'Overdue';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  status: BookStatus;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  idCardNumber: string;
  course: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: BorrowStatus;
  fineAmount: number;
  finePaid: boolean;
}

export interface NewBorrowForm {
  studentName: string;
  idCardNumber: string;
  course: string;
  bookId: string;
  issueDate: string;
  dueDate: string;
}

// --- Constants ---

export const BOOK_CATEGORIES: string[] = [
  'Physics', 'Chemistry', 'Mathematics', 'Biology', 'English Literature',
  'Telugu', 'Sanskrit', 'Economics', 'Commerce', 'History',
  'Computer Science', 'General Knowledge', 'Reference', 'Fiction',
];

export const FINE_PER_DAY = 2; // ₹2 per day overdue

// --- Books Data ---

export const BOOKS: Book[] = [
  { id: 'b1', title: 'Concepts of Physics Vol 1', author: 'H.C. Verma', isbn: '978-8177091878', category: 'Physics', totalCopies: 10, availableCopies: 6, shelfLocation: 'A1-01', status: 'Available' },
  { id: 'b2', title: 'Concepts of Physics Vol 2', author: 'H.C. Verma', isbn: '978-8177092325', category: 'Physics', totalCopies: 10, availableCopies: 4, shelfLocation: 'A1-02', status: 'Available' },
  { id: 'b3', title: 'Organic Chemistry', author: 'Morrison & Boyd', isbn: '978-0136436690', category: 'Chemistry', totalCopies: 8, availableCopies: 3, shelfLocation: 'A2-01', status: 'Available' },
  { id: 'b4', title: 'Physical Chemistry', author: 'P. Bahadur', isbn: '978-8183552455', category: 'Chemistry', totalCopies: 6, availableCopies: 2, shelfLocation: 'A2-02', status: 'Available' },
  { id: 'b5', title: 'Mathematics for Class 11', author: 'R.D. Sharma', isbn: '978-9383182015', category: 'Mathematics', totalCopies: 15, availableCopies: 8, shelfLocation: 'A3-01', status: 'Available' },
  { id: 'b6', title: 'Mathematics for Class 12', author: 'R.D. Sharma', isbn: '978-9383182022', category: 'Mathematics', totalCopies: 15, availableCopies: 7, shelfLocation: 'A3-02', status: 'Available' },
  { id: 'b7', title: 'Biology NCERT Class 11', author: 'NCERT', isbn: '978-8174506726', category: 'Biology', totalCopies: 12, availableCopies: 5, shelfLocation: 'B1-01', status: 'Available' },
  { id: 'b8', title: 'Biology NCERT Class 12', author: 'NCERT', isbn: '978-8174506733', category: 'Biology', totalCopies: 12, availableCopies: 4, shelfLocation: 'B1-02', status: 'Available' },
  { id: 'b9', title: 'Wren & Martin English Grammar', author: 'Wren & Martin', isbn: '978-9352530144', category: 'English Literature', totalCopies: 20, availableCopies: 12, shelfLocation: 'C1-01', status: 'Available' },
  { id: 'b10', title: 'Indian Economics', author: 'Ramesh Singh', isbn: '978-9339222437', category: 'Economics', totalCopies: 8, availableCopies: 5, shelfLocation: 'D1-01', status: 'Available' },
  { id: 'b11', title: 'Accountancy NCERT', author: 'NCERT', isbn: '978-8174507112', category: 'Commerce', totalCopies: 10, availableCopies: 6, shelfLocation: 'D2-01', status: 'Available' },
  { id: 'b12', title: 'Telugu Sahityam', author: 'Various', isbn: '978-8190000001', category: 'Telugu', totalCopies: 8, availableCopies: 7, shelfLocation: 'E1-01', status: 'Available' },
  { id: 'b13', title: 'Sanskrit Vyakaranam', author: 'Various', isbn: '978-8190000002', category: 'Sanskrit', totalCopies: 6, availableCopies: 5, shelfLocation: 'E2-01', status: 'Available' },
  { id: 'b14', title: 'Computer Science with Python', author: 'Sumita Arora', isbn: '978-9388402545', category: 'Computer Science', totalCopies: 10, availableCopies: 3, shelfLocation: 'F1-01', status: 'Available' },
  { id: 'b15', title: 'History of Modern India', author: 'Bipan Chandra', isbn: '978-8125036845', category: 'History', totalCopies: 6, availableCopies: 4, shelfLocation: 'G1-01', status: 'Available' },
  { id: 'b16', title: 'General Knowledge 2025', author: 'Manohar Pandey', isbn: '978-9389718904', category: 'General Knowledge', totalCopies: 5, availableCopies: 2, shelfLocation: 'H1-01', status: 'Available' },
  { id: 'b17', title: 'Oxford English Dictionary', author: 'Oxford', isbn: '978-0199571123', category: 'Reference', totalCopies: 3, availableCopies: 3, shelfLocation: 'R1-01', status: 'Available' },
  { id: 'b18', title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', isbn: '978-8173711466', category: 'Fiction', totalCopies: 5, availableCopies: 1, shelfLocation: 'F2-01', status: 'Available' },
];

// --- Borrow Records ---

export const INITIAL_BORROW_RECORDS: BorrowRecord[] = [
  { id: 'br1', bookId: 'b1', bookTitle: 'Concepts of Physics Vol 1', studentId: 's1', studentName: 'Ravi Kumar', idCardNumber: 'SA2024-MPC-001', course: 'MPC', issueDate: '2024-11-15', dueDate: '2024-12-01', returnDate: '2024-11-28', status: 'Returned', fineAmount: 0, finePaid: true },
  { id: 'br2', bookId: 'b3', bookTitle: 'Organic Chemistry', studentId: 's2', studentName: 'Priya Sharma', idCardNumber: 'SA2024-BiPC-002', course: 'BiPC', issueDate: '2024-11-20', dueDate: '2024-12-05', returnDate: null, status: 'Overdue', fineAmount: 14, finePaid: false },
  { id: 'br3', bookId: 'b5', bookTitle: 'Mathematics for Class 11', studentId: 's3', studentName: 'Arjun Reddy', idCardNumber: 'SA2024-MPC-003', course: 'MPC', issueDate: '2024-12-01', dueDate: '2024-12-15', returnDate: null, status: 'Active', fineAmount: 0, finePaid: true },
  { id: 'br4', bookId: 'b9', bookTitle: 'Wren & Martin English Grammar', studentId: 's4', studentName: 'Kavitha Rao', idCardNumber: 'SA2024-CEC-004', course: 'CEC', issueDate: '2024-11-10', dueDate: '2024-11-25', returnDate: '2024-11-24', status: 'Returned', fineAmount: 0, finePaid: true },
  { id: 'br5', bookId: 'b14', bookTitle: 'Computer Science with Python', studentId: 's5', studentName: 'Deepak Yadav', idCardNumber: 'SA2024-MPC-005', course: 'MPC', issueDate: '2024-12-02', dueDate: '2024-12-16', returnDate: null, status: 'Active', fineAmount: 0, finePaid: true },
  { id: 'br6', bookId: 'b7', bookTitle: 'Biology NCERT Class 11', studentId: 's6', studentName: 'Ananya Gupta', idCardNumber: 'SA2024-BiPC-006', course: 'BiPC', issueDate: '2024-11-25', dueDate: '2024-12-10', returnDate: null, status: 'Active', fineAmount: 0, finePaid: true },
  { id: 'br7', bookId: 'b10', bookTitle: 'Indian Economics', studentId: 's7', studentName: 'Vikram Naidu', idCardNumber: 'SA2024-CEC-007', course: 'CEC', issueDate: '2024-11-05', dueDate: '2024-11-20', returnDate: null, status: 'Overdue', fineAmount: 44, finePaid: false },
  { id: 'br8', bookId: 'b18', bookTitle: 'Wings of Fire', studentId: 's8', studentName: 'Meera Devi', idCardNumber: 'SA2024-MEC-008', course: 'MEC', issueDate: '2024-12-05', dueDate: '2024-12-19', returnDate: null, status: 'Active', fineAmount: 0, finePaid: true },
  { id: 'br9', bookId: 'b6', bookTitle: 'Mathematics for Class 12', studentId: 's9', studentName: 'Rahul Verma', idCardNumber: 'SA2024-MPC-009', course: 'MPC', issueDate: '2024-11-18', dueDate: '2024-12-02', returnDate: '2024-12-01', status: 'Returned', fineAmount: 0, finePaid: true },
  { id: 'br10', bookId: 'b2', bookTitle: 'Concepts of Physics Vol 2', studentId: 's10', studentName: 'Swathi Reddy', idCardNumber: 'SA2024-MPC-010', course: 'MPC', issueDate: '2024-11-08', dueDate: '2024-11-22', returnDate: null, status: 'Overdue', fineAmount: 40, finePaid: false },
  { id: 'br11', bookId: 'b11', bookTitle: 'Accountancy NCERT', studentId: 's11', studentName: 'Manish Kumar', idCardNumber: 'SA2024-CEC-011', course: 'CEC', issueDate: '2024-12-03', dueDate: '2024-12-17', returnDate: null, status: 'Active', fineAmount: 0, finePaid: true },
  { id: 'br12', bookId: 'b4', bookTitle: 'Physical Chemistry', studentId: 's12', studentName: 'Pooja Lakshmi', idCardNumber: 'SA2024-BiPC-012', course: 'BiPC', issueDate: '2024-12-06', dueDate: '2024-12-20', returnDate: null, status: 'Active', fineAmount: 0, finePaid: true },
  { id: 'br13', bookId: 'b15', bookTitle: 'History of Modern India', studentId: 's13', studentName: 'Sanjay Rao', idCardNumber: 'SA2024-HEC-013', course: 'HEC', issueDate: '2024-11-28', dueDate: '2024-12-12', returnDate: null, status: 'Active', fineAmount: 0, finePaid: true },
  { id: 'br14', bookId: 'b16', bookTitle: 'General Knowledge 2025', studentId: 's14', studentName: 'Nisha Kumari', idCardNumber: 'SA2024-MPC-014', course: 'MPC', issueDate: '2024-11-01', dueDate: '2024-11-15', returnDate: '2024-11-20', status: 'Returned', fineAmount: 10, finePaid: true },
  { id: 'br15', bookId: 'b8', bookTitle: 'Biology NCERT Class 12', studentId: 's15', studentName: 'Kiran Reddy', idCardNumber: 'SA2024-BiPC-015', course: 'BiPC', issueDate: '2024-12-07', dueDate: '2024-12-21', returnDate: null, status: 'Active', fineAmount: 0, finePaid: true },
];
