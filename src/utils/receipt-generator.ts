/**
 * Receipt Generator - Creates professional PDF receipts for fees, admissions, library.
 * Uses jsPDF for PDF generation with school branding, borders, and signatures.
 */

import { jsPDF } from 'jspdf';

const SCHOOL_NAME = 'Sunrise Academy';
const SCHOOL_ADDRESS = '123 Education Lane, Bangalore 560001';
const SCHOOL_PHONE = '+91 80 2345 6789';
const SCHOOL_EMAIL = 'info@sunriseacademy.edu';

interface FeeReceiptData {
  receiptNo: string;
  studentName: string;
  studentId: string;
  course: string;
  category: string;
  amount: number;
  paidAmount: number;
  method: string;
  date: string;
  status: string;
}

interface AdmissionReceiptData {
  enquiryId: string;
  studentName: string;
  course: string;
  email: string;
  phone: string;
  status: string;
  date: string;
}

interface LibraryReceiptData {
  studentName: string;
  idCard: string;
  bookTitle: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount?: number;
}

function drawHeader(doc: jsPDF): void {
  // Border
  doc.setDrawColor(54, 52, 115); // #363473
  doc.setLineWidth(1.5);
  doc.rect(10, 10, 190, 277);

  // Inner border
  doc.setLineWidth(0.3);
  doc.rect(12, 12, 186, 273);

  // School logo placeholder (circle with graduation cap text)
  doc.setFillColor(54, 52, 115);
  doc.circle(105, 30, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('SB', 105, 33, { align: 'center' });

  // School name
  doc.setTextColor(54, 52, 115);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(SCHOOL_NAME, 105, 48, { align: 'center' });

  // Address
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(SCHOOL_ADDRESS, 105, 54, { align: 'center' });
  doc.text(`Phone: ${SCHOOL_PHONE} | Email: ${SCHOOL_EMAIL}`, 105, 59, { align: 'center' });

  // Divider line
  doc.setDrawColor(54, 52, 115);
  doc.setLineWidth(0.5);
  doc.line(20, 63, 190, 63);
}

function drawFooter(doc: jsPDF): void {
  const y = 250;

  // Signature lines
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.line(25, y, 75, y);
  doc.line(135, y, 185, y);

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Student/Parent Signature', 50, y + 5, { align: 'center' });
  doc.text('Authorized Signatory', 160, y + 5, { align: 'center' });

  // Footer text
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer-generated receipt. No signature required for online payments.', 105, 270, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 105, 275, { align: 'center' });
}

function drawLabelValue(doc: jsPDF, label: string, value: string, x: number, y: number): void {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(label, x, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(value, x + 45, y);
}

export function generateFeeReceipt(data: FeeReceiptData): void {
  const doc = new jsPDF();
  drawHeader(doc);

  // Receipt title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(54, 52, 115);
  doc.text('FEE PAYMENT RECEIPT', 105, 72, { align: 'center' });

  // Receipt number and date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Receipt No: ${data.receiptNo}`, 20, 80);
  doc.text(`Date: ${data.date}`, 160, 80);

  // Student details box
  doc.setFillColor(245, 246, 250);
  doc.roundedRect(20, 85, 170, 40, 2, 2, 'F');
  const sy = 94;
  drawLabelValue(doc, 'Student Name:', data.studentName, 25, sy);
  drawLabelValue(doc, 'Student ID:', data.studentId, 25, sy + 8);
  drawLabelValue(doc, 'Course:', data.course, 25, sy + 16);
  drawLabelValue(doc, 'Academic Year:', '2024-2025', 25, sy + 24);
  drawLabelValue(doc, 'Status:', data.status, 110, sy + 16);

  // Payment details table
  const ty = 135;
  doc.setDrawColor(54, 52, 115);
  doc.setLineWidth(0.3);
  // Table header
  doc.setFillColor(54, 52, 115);
  doc.rect(20, ty, 170, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Fee Category', 25, ty + 7);
  doc.text('Amount (Rs.)', 90, ty + 7);
  doc.text('Paid (Rs.)', 130, ty + 7);
  doc.text('Method', 165, ty + 7);

  // Table row
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  doc.rect(20, ty + 10, 170, 10);
  doc.text(data.category, 25, ty + 17);
  doc.text(`Rs. ${data.amount.toLocaleString('en-IN')}`, 90, ty + 17);
  doc.text(`Rs. ${data.paidAmount.toLocaleString('en-IN')}`, 130, ty + 17);
  doc.text(data.method, 165, ty + 17);

  // Total box
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(110, ty + 25, 80, 15, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text(`Total Paid: Rs. ${data.paidAmount.toLocaleString('en-IN')}`, 150, ty + 34, { align: 'center' });

  // Balance
  const balance = data.amount - data.paidAmount;
  if (balance > 0) {
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(20, ty + 25, 80, 15, 2, 2, 'F');
    doc.setTextColor(185, 28, 28);
    doc.text(`Balance Due: Rs. ${balance.toLocaleString('en-IN')}`, 60, ty + 34, { align: 'center' });
  }

  drawFooter(doc);
  doc.save(`Fee_Receipt_${data.receiptNo.replace(/\//g, '_')}.pdf`);
}

export function generateAdmissionReceipt(data: AdmissionReceiptData): void {
  const doc = new jsPDF();
  drawHeader(doc);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(54, 52, 115);
  doc.text('ADMISSION ACKNOWLEDGEMENT', 105, 72, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Enquiry ID: ${data.enquiryId}`, 20, 80);
  doc.text(`Date: ${data.date}`, 160, 80);

  // Details box
  doc.setFillColor(245, 246, 250);
  doc.roundedRect(20, 85, 170, 45, 2, 2, 'F');
  const sy = 95;
  drawLabelValue(doc, 'Student Name:', data.studentName, 25, sy);
  drawLabelValue(doc, 'Course Applied:', data.course, 25, sy + 10);
  drawLabelValue(doc, 'Email:', data.email, 25, sy + 20);
  drawLabelValue(doc, 'Phone:', data.phone, 25, sy + 30);

  // Status badge
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const statusColor: [number, number, number] = data.status === 'Enrolled' ? [21, 128, 61] : data.status === 'Offered' ? [37, 99, 235] : [100, 100, 100];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Current Status: ${data.status}`, 105, 145, { align: 'center' });

  // Note
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('This acknowledges that your application has been received and is being processed.', 105, 160, { align: 'center' });
  doc.text('Please retain this for your records.', 105, 167, { align: 'center' });

  drawFooter(doc);
  doc.save(`Admission_${data.enquiryId}_${data.studentName.replace(/\s/g, '_')}.pdf`);
}

export function generateLibraryReceipt(data: LibraryReceiptData): void {
  const doc = new jsPDF();
  drawHeader(doc);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(54, 52, 115);
  doc.text(data.returnDate ? 'BOOK RETURN RECEIPT' : 'BOOK ISSUE SLIP', 105, 72, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 160, 80);

  // Details box
  doc.setFillColor(245, 246, 250);
  doc.roundedRect(20, 85, 170, 50, 2, 2, 'F');
  const sy = 95;
  drawLabelValue(doc, 'Student Name:', data.studentName, 25, sy);
  drawLabelValue(doc, 'ID Card:', data.idCard, 25, sy + 10);
  drawLabelValue(doc, 'Book Title:', data.bookTitle, 25, sy + 20);
  drawLabelValue(doc, 'Issue Date:', data.issueDate, 25, sy + 30);
  drawLabelValue(doc, 'Due Date:', data.dueDate, 110, sy + 30);

  if (data.returnDate) {
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(20, 145, 170, 15, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text(`Returned on: ${data.returnDate}`, 105, 154, { align: 'center' });
  }

  if (data.fineAmount && data.fineAmount > 0) {
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(20, 165, 170, 15, 2, 2, 'F');
    doc.setTextColor(185, 28, 28);
    doc.text(`Fine Amount: Rs. ${data.fineAmount}`, 105, 174, { align: 'center' });
  }

  drawFooter(doc);
  doc.save(`Library_${data.returnDate ? 'Return' : 'Issue'}_${data.studentName.replace(/\s/g, '_')}.pdf`);
}

export function generateReportPDF(title: string, columns: string[], rows: Record<string, string | number>[]): void {
  const doc = new jsPDF('l'); // landscape for reports
  drawHeader(doc);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(54, 52, 115);
  doc.text(title, 148, 72, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 148, 78, { align: 'center' });

  // Simple table
  const startY = 85;
  const colWidth = 250 / columns.length;
  // Header
  doc.setFillColor(54, 52, 115);
  doc.rect(20, startY, 257, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  columns.forEach((col, i) => doc.text(col, 22 + i * colWidth, startY + 5.5));

  // Rows
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  rows.slice(0, 20).forEach((row, rowIdx) => {
    const ry = startY + 8 + rowIdx * 7;
    if (rowIdx % 2 === 0) { doc.setFillColor(250, 250, 252); doc.rect(20, ry, 257, 7, 'F'); }
    columns.forEach((col, i) => doc.text(String(row[col] ?? ''), 22 + i * colWidth, ry + 5));
  });

  doc.save(`${title.replace(/\s/g, '_')}_Report.pdf`);
}


export function generateExamResultPDF(examName: string, course: string, subject: string, date: string, maxMarks: number, faculty: string, results: { studentName: string; marksObtained: number; grade: string; status: string }[]): void {
  const doc = new jsPDF();
  drawHeader(doc);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(54, 52, 115);
  doc.text('EXAMINATION RESULT SHEET', 105, 72, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Academic Year: 2024-2025`, 20, 80);
  doc.text(`Date: ${date}`, 160, 80);

  doc.setFillColor(245, 246, 250);
  doc.roundedRect(20, 84, 170, 22, 2, 2, 'F');
  drawLabelValue(doc, 'Exam:', examName, 25, 92);
  drawLabelValue(doc, 'Course:', course, 110, 92);
  drawLabelValue(doc, 'Subject:', subject, 25, 100);
  drawLabelValue(doc, 'Faculty:', faculty, 110, 100);

  // Table
  const ty = 112;
  doc.setFillColor(54, 52, 115);
  doc.rect(20, ty, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('S.No', 23, ty + 5.5);
  doc.text('Student Name', 35, ty + 5.5);
  doc.text(`Marks (/${maxMarks})`, 100, ty + 5.5);
  doc.text('Percentage', 130, ty + 5.5);
  doc.text('Grade', 158, ty + 5.5);
  doc.text('Status', 175, ty + 5.5);

  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const maxRows = Math.min(results.length, 18);
  for (let i = 0; i < maxRows; i++) {
    const ry = ty + 8 + i * 7;
    if (i % 2 === 0) { doc.setFillColor(250, 250, 252); doc.rect(20, ry, 170, 7, 'F'); }
    doc.setDrawColor(230, 230, 230);
    doc.line(20, ry + 7, 190, ry + 7);
    const r = results[i]!;
    const pct = Math.round((r.marksObtained / maxMarks) * 100);
    doc.text(String(i + 1), 25, ry + 5);
    doc.text(r.studentName, 35, ry + 5);
    doc.text(`${r.marksObtained}`, 105, ry + 5);
    doc.text(`${pct}%`, 133, ry + 5);
    doc.text(r.grade, 160, ry + 5);
    doc.setTextColor(r.status === 'Pass' ? 21 : 185, r.status === 'Pass' ? 128 : 28, r.status === 'Pass' ? 61 : 28);
    doc.text(r.status, 177, ry + 5);
    doc.setTextColor(30, 30, 30);
  }

  // Summary
  const passCount = results.filter((r) => r.status === 'Pass').length;
  const summaryY = ty + 8 + maxRows * 7 + 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(54, 52, 115);
  doc.text(`Total Students: ${results.length}  |  Pass: ${passCount}  |  Fail: ${results.length - passCount}  |  Pass Rate: ${Math.round((passCount / results.length) * 100)}%`, 105, summaryY, { align: 'center' });

  drawFooter(doc);
  doc.save(`Exam_Result_${examName.replace(/\s/g, '_')}.pdf`);
}

export function generateTimetablePDF(course: string, periods: { day: string; timeSlot: string; subject: string; faculty: string; room: string }[]): void {
  const doc = new jsPDF('l'); // landscape
  // Simple header for landscape
  doc.setDrawColor(54, 52, 115);
  doc.setLineWidth(1);
  doc.rect(10, 10, 277, 190);

  doc.setFillColor(54, 52, 115);
  doc.circle(148, 22, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('SB', 148, 24, { align: 'center' });

  doc.setTextColor(54, 52, 115);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(SCHOOL_NAME, 148, 35, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(SCHOOL_ADDRESS, 148, 40, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(54, 52, 115);
  doc.text(`WEEKLY TIMETABLE - ${course}`, 148, 50, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Academic Year: 2024-2025', 148, 55, { align: 'center' });

  // Build grid
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const slots = ['8:30-9:20', '9:20-10:10', '10:30-11:20', '11:20-12:10', '1:40-2:30', '2:30-3:20', '3:20-4:00'];
  const startX = 15;
  const startY = 62;
  const dayW = 42;
  const slotH = 16;
  const headerH = 10;

  // Header row (time slots)
  doc.setFillColor(54, 52, 115);
  doc.rect(startX, startY, 30, headerH, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Day/Time', startX + 2, startY + 7);
  slots.forEach((slot, i) => {
    const x = startX + 30 + i * dayW;
    doc.setFillColor(54, 52, 115);
    doc.rect(x, startY, dayW, headerH, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(slot, x + 2, startY + 7);
  });

  // Rows (days)
  doc.setFont('helvetica', 'normal');
  days.forEach((day, di) => {
    const y = startY + headerH + di * slotH;
    doc.setFillColor(di % 2 === 0 ? 250 : 245, di % 2 === 0 ? 250 : 246, di % 2 === 0 ? 252 : 250);
    doc.rect(startX, y, 30, slotH, 'F');
    doc.setTextColor(54, 52, 115);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(day, startX + 2, y + 6);

    slots.forEach((slot, si) => {
      const x = startX + 30 + si * dayW;
      doc.setDrawColor(220, 220, 230);
      doc.rect(x, y, dayW, slotH);
      const period = periods.find((p) => p.day === day && p.timeSlot === slot);
      if (period) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(7);
        doc.text(period.subject, x + 2, y + 5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(6);
        doc.text(period.faculty, x + 2, y + 10);
        doc.text(period.room, x + 2, y + 14);
      }
    });
  });

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 148, 195, { align: 'center' });

  doc.save(`Timetable_${course}.pdf`);
}

export function generateStudentListPDF(students: { name: string; studentId: string; course: string; section: string; year: string; phone: string; status: string; attendance: number }[], filterLabel: string): void {
  const doc = new jsPDF();
  drawHeader(doc);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(54, 52, 115);
  doc.text('STUDENT LIST', 105, 72, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Academic Year: 2024-2025`, 20, 79);
  doc.text(filterLabel, 160, 79);

  // Table
  const ty = 84;
  doc.setFillColor(54, 52, 115);
  doc.rect(15, ty, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('S.No', 17, ty + 5.5);
  doc.text('Name', 27, ty + 5.5);
  doc.text('Student ID', 62, ty + 5.5);
  doc.text('Course', 98, ty + 5.5);
  doc.text('Sec', 115, ty + 5.5);
  doc.text('Year', 125, ty + 5.5);
  doc.text('Phone', 145, ty + 5.5);
  doc.text('Att%', 172, ty + 5.5);
  doc.text('Status', 183, ty + 5.5);

  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const maxRows = Math.min(students.length, 22);
  for (let i = 0; i < maxRows; i++) {
    const ry = ty + 8 + i * 7;
    if (i % 2 === 0) { doc.setFillColor(250, 250, 252); doc.rect(15, ry, 180, 7, 'F'); }
    const s = students[i]!;
    doc.text(String(i + 1), 18, ry + 5);
    doc.text(s.name, 27, ry + 5);
    doc.text(s.studentId, 62, ry + 5);
    doc.text(s.course, 98, ry + 5);
    doc.text(s.section, 117, ry + 5);
    doc.text(s.year, 125, ry + 5);
    doc.text(s.phone, 145, ry + 5);
    doc.text(`${s.attendance}%`, 172, ry + 5);
    doc.text(s.status, 183, ry + 5);
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(54, 52, 115);
  const summaryY = ty + 8 + maxRows * 7 + 5;
  doc.text(`Total: ${students.length} students`, 105, summaryY, { align: 'center' });

  drawFooter(doc);
  doc.save(`Student_List_${filterLabel.replace(/\s/g, '_')}.pdf`);
}
