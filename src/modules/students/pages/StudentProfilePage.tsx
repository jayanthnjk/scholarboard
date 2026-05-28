/**
 * Student Profile Page - Standalone with local data.
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContent } from '@/components/layout/page-content';
import {
  ArrowLeft, User, Mail, Phone, GraduationCap, Calendar,
  MapPin, Users, BookOpen, TrendingUp, Edit2, Trash2, X,
} from 'lucide-react';

interface Student {
  id: string; name: string; studentId: string; course: string; section: string;
  year: string; phone: string; email: string; status: string; admissionDate: string;
  fatherName: string; motherName: string; address: string; dob: string;
  bloodGroup: string; attendance: number; feeStatus: string;
}

const STUDENTS: Student[] = [
  { id: '1', name: 'Ravi Kumar', studentId: 'SA2024-MPC-001', course: 'MPC', section: 'A', year: '1st Year', phone: '+91 9876543201', email: 'ravi.k@student.sa.edu', status: 'Active', admissionDate: '2024-06-15', fatherName: 'Suresh Kumar', motherName: 'Lakshmi Devi', address: '12, Gandhi Nagar, Hyderabad', dob: '2007-03-15', bloodGroup: 'B+', attendance: 92, feeStatus: 'Paid' },
  { id: '2', name: 'Priya Sharma', studentId: 'SA2024-BiPC-002', course: 'BiPC', section: 'A', year: '1st Year', phone: '+91 9876543202', email: 'priya.s@student.sa.edu', status: 'Active', admissionDate: '2024-06-15', fatherName: 'Ramesh Sharma', motherName: 'Sunitha Sharma', address: '45, MG Road, Secunderabad', dob: '2007-07-22', bloodGroup: 'O+', attendance: 88, feeStatus: 'Paid' },
  { id: '3', name: 'Arjun Reddy', studentId: 'SA2024-MPC-003', course: 'MPC', section: 'B', year: '1st Year', phone: '+91 9876543203', email: 'arjun.r@student.sa.edu', status: 'Active', admissionDate: '2024-06-16', fatherName: 'Venkat Reddy', motherName: 'Padma Reddy', address: '78, Jubilee Hills, Hyderabad', dob: '2007-01-10', bloodGroup: 'A+', attendance: 75, feeStatus: 'Partial' },
  { id: '4', name: 'Kavitha Rao', studentId: 'SA2024-CEC-004', course: 'CEC', section: 'A', year: '1st Year', phone: '+91 9876543204', email: 'kavitha.r@student.sa.edu', status: 'Active', admissionDate: '2024-06-16', fatherName: 'Srinivas Rao', motherName: 'Vijaya Lakshmi', address: '23, Banjara Hills, Hyderabad', dob: '2007-11-05', bloodGroup: 'AB+', attendance: 95, feeStatus: 'Paid' },
  { id: '5', name: 'Deepak Yadav', studentId: 'SA2024-MEC-005', course: 'MEC', section: 'A', year: '1st Year', phone: '+91 9876543205', email: 'deepak.y@student.sa.edu', status: 'Active', admissionDate: '2024-06-17', fatherName: 'Mahesh Yadav', motherName: 'Sarita Yadav', address: '56, Ameerpet, Hyderabad', dob: '2007-09-18', bloodGroup: 'B-', attendance: 68, feeStatus: 'Overdue' },
  { id: '6', name: 'Ananya Gupta', studentId: 'SA2024-HEC-006', course: 'HEC', section: 'A', year: '1st Year', phone: '+91 9876543206', email: 'ananya.g@student.sa.edu', status: 'Active', admissionDate: '2024-06-17', fatherName: 'Rajesh Gupta', motherName: 'Meena Gupta', address: '90, Kukatpally, Hyderabad', dob: '2007-05-28', bloodGroup: 'O-', attendance: 90, feeStatus: 'Paid' },
  { id: '7', name: 'Vikram Naidu', studentId: 'SA2024-MPC-007', course: 'MPC', section: 'A', year: '2nd Year', phone: '+91 9876543207', email: 'vikram.n@student.sa.edu', status: 'Active', admissionDate: '2023-06-15', fatherName: 'Sai Naidu', motherName: 'Rani Naidu', address: '34, Madhapur, Hyderabad', dob: '2006-08-12', bloodGroup: 'A-', attendance: 85, feeStatus: 'Paid' },
  { id: '8', name: 'Meera Devi', studentId: 'SA2024-BiPC-008', course: 'BiPC', section: 'B', year: '2nd Year', phone: '+91 9876543208', email: 'meera.d@student.sa.edu', status: 'Active', admissionDate: '2023-06-15', fatherName: 'Krishna Devi', motherName: 'Sarojini', address: '67, Dilsukhnagar, Hyderabad', dob: '2006-12-03', bloodGroup: 'B+', attendance: 91, feeStatus: 'Paid' },
  { id: '9', name: 'Rahul Verma', studentId: 'SA2024-MPC-009', course: 'MPC', section: 'B', year: '2nd Year', phone: '+91 9876543209', email: 'rahul.v@student.sa.edu', status: 'Graduated', admissionDate: '2022-06-15', fatherName: 'Anil Verma', motherName: 'Sunita Verma', address: '11, Begumpet, Hyderabad', dob: '2005-04-20', bloodGroup: 'O+', attendance: 82, feeStatus: 'Paid' },
  { id: '10', name: 'Swathi Reddy', studentId: 'SA2024-CEC-010', course: 'CEC', section: 'A', year: '2nd Year', phone: '+91 9876543210', email: 'swathi.r@student.sa.edu', status: 'Active', admissionDate: '2023-06-16', fatherName: 'Ramana Reddy', motherName: 'Anuradha', address: '44, Bowenpally, Hyderabad', dob: '2006-06-14', bloodGroup: 'A+', attendance: 78, feeStatus: 'Partial' },
  { id: '11', name: 'Manish Kumar', studentId: 'SA2024-MEC-011', course: 'MEC', section: 'A', year: '1st Year', phone: '+91 9876543211', email: 'manish.k@student.sa.edu', status: 'Active', admissionDate: '2024-06-18', fatherName: 'Dinesh Kumar', motherName: 'Rekha', address: '55, Mehdipatnam, Hyderabad', dob: '2007-02-08', bloodGroup: 'AB-', attendance: 88, feeStatus: 'Paid' },
  { id: '12', name: 'Pooja Lakshmi', studentId: 'SA2024-BiPC-012', course: 'BiPC', section: 'A', year: '1st Year', phone: '+91 9876543212', email: 'pooja.l@student.sa.edu', status: 'Active', admissionDate: '2024-06-18', fatherName: 'Rajan L', motherName: 'Sarala', address: '88, Tarnaka, Hyderabad', dob: '2007-10-30', bloodGroup: 'B+', attendance: 94, feeStatus: 'Paid' },
  { id: '13', name: 'Sanjay Rao', studentId: 'SA2023-MPC-013', course: 'MPC', section: 'A', year: '2nd Year', phone: '+91 9876543213', email: 'sanjay.r@student.sa.edu', status: 'Transferred', admissionDate: '2023-06-15', fatherName: 'Mohan Rao', motherName: 'Kavitha', address: '22, Malkajgiri, Hyderabad', dob: '2006-07-19', bloodGroup: 'O+', attendance: 72, feeStatus: 'Paid' },
  { id: '14', name: 'Nisha Kumari', studentId: 'SA2024-MPC-014', course: 'MPC', section: 'B', year: '1st Year', phone: '+91 9876543214', email: 'nisha.k@student.sa.edu', status: 'Active', admissionDate: '2024-06-19', fatherName: 'Kiran Kumar', motherName: 'Radha', address: '33, LB Nagar, Hyderabad', dob: '2007-08-25', bloodGroup: 'A+', attendance: 87, feeStatus: 'Paid' },
  { id: '15', name: 'Kiran Reddy', studentId: 'SA2024-BiPC-015', course: 'BiPC', section: 'B', year: '1st Year', phone: '+91 9876543215', email: 'kiran.r@student.sa.edu', status: 'Active', admissionDate: '2024-06-19', fatherName: 'Srinivas Reddy', motherName: 'Jyothi', address: '77, Uppal, Hyderabad', dob: '2007-04-12', bloodGroup: 'B-', attendance: 93, feeStatus: 'Paid' },
  { id: '16', name: 'Harish Babu', studentId: 'SA2024-MPC-016', course: 'MPC', section: 'A', year: '1st Year', phone: '+91 9876543216', email: 'harish.b@student.sa.edu', status: 'Inactive', admissionDate: '2024-06-20', fatherName: 'Babu Rao', motherName: 'Sujatha', address: '99, Kompally, Hyderabad', dob: '2007-06-01', bloodGroup: 'O-', attendance: 45, feeStatus: 'Overdue' },
];

function StudentProfilePage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | undefined>(STUDENTS.find((s) => s.id === id));
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: '', email: '', address: '' });

  if (!student) {
    return (
      <PageContent>
        <div className="p-6">
          <button type="button" onClick={() => navigate('/students')} className="inline-flex items-center gap-2 text-sm text-[#363473] hover:underline mb-4"><ArrowLeft className="h-4 w-4" /> Back to Students</button>
          <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-12 text-center"><p className="text-[#A0A3BD]">Student not found.</p></div>
        </div>
      </PageContent>
    );
  }

  function handleEdit(): void {
    if (!student) return;
    setEditForm({ phone: student.phone, email: student.email, address: student.address });
    setIsEditing(true);
  }

  function handleSaveEdit(): void {
    if (!student) return;
    setStudent({ ...student, phone: editForm.phone, email: editForm.email, address: editForm.address });
    setIsEditing(false);
  }

  function handleDelete(): void {
    if (confirm(`Are you sure you want to delete ${student?.name}? This cannot be undone.`)) {
      navigate('/students');
    }
  }

  const statusColor = student.status === 'Active' ? 'bg-green-100 text-green-700' : student.status === 'Graduated' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600';
  const feeColor = student.feeStatus === 'Paid' ? 'text-green-700' : student.feeStatus === 'Partial' ? 'text-amber-700' : 'text-red-600';

  return (
    <PageContent>
      <div className="p-6 max-w-5xl mx-auto">
        <button type="button" onClick={() => navigate('/students')} className="inline-flex items-center gap-2 text-sm text-[#363473] hover:underline mb-4"><ArrowLeft className="h-4 w-4" /> Back to Students</button>

        {/* Header Card */}
        <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#363473]/10"><User className="h-8 w-8 text-[#363473]" /></div>
              <div>
                <h1 className="text-2xl font-bold text-[#1B1D3A]">{student.name}</h1>
                <p className="text-sm text-[#6E7191] mt-0.5">{student.studentId} • {student.course} - Section {student.section}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>{student.status}</span>
                  <span className="text-xs text-[#A0A3BD]">{student.year}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleEdit} className="inline-flex items-center gap-1.5 rounded-lg border border-[#ECEDF3] px-3 py-2 text-xs font-medium text-[#363473] hover:bg-[#F5F6FA] transition-colors"><Edit2 className="h-3.5 w-3.5" /> Edit</button>
              <button type="button" onClick={handleDelete} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-5">
            <h3 className="text-sm font-semibold text-[#1B1D3A] mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-[#A0A3BD]" /><div><p className="text-[10px] text-[#A0A3BD]">Date of Birth</p><p className="text-sm font-medium text-[#1B1D3A]">{student.dob}</p></div></div>
              <div className="flex items-center gap-3"><TrendingUp className="h-4 w-4 text-[#A0A3BD]" /><div><p className="text-[10px] text-[#A0A3BD]">Blood Group</p><p className="text-sm font-medium text-[#1B1D3A]">{student.bloodGroup}</p></div></div>
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-[#A0A3BD]" /><div><p className="text-[10px] text-[#A0A3BD]">Phone</p><p className="text-sm font-medium text-[#1B1D3A]">{student.phone}</p></div></div>
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-[#A0A3BD]" /><div><p className="text-[10px] text-[#A0A3BD]">Email</p><p className="text-sm font-medium text-[#1B1D3A]">{student.email}</p></div></div>
              <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[#A0A3BD]" /><div><p className="text-[10px] text-[#A0A3BD]">Address</p><p className="text-sm font-medium text-[#1B1D3A]">{student.address}</p></div></div>
            </div>
          </div>

          {/* Guardian & Academic Info */}
          <div className="space-y-6">
            <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#1B1D3A] mb-4">Guardian Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><Users className="h-4 w-4 text-[#A0A3BD]" /><div><p className="text-[10px] text-[#A0A3BD]">Father</p><p className="text-sm font-medium text-[#1B1D3A]">{student.fatherName}</p></div></div>
                <div className="flex items-center gap-3"><Users className="h-4 w-4 text-[#A0A3BD]" /><div><p className="text-[10px] text-[#A0A3BD]">Mother</p><p className="text-sm font-medium text-[#1B1D3A]">{student.motherName}</p></div></div>
              </div>
            </div>
            <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#1B1D3A] mb-4">Academic Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><GraduationCap className="h-4 w-4 text-[#A0A3BD]" /><div><p className="text-[10px] text-[#A0A3BD]">Course & Section</p><p className="text-sm font-medium text-[#1B1D3A]">{student.course} - {student.section} ({student.year})</p></div></div>
                <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-[#A0A3BD]" /><div><p className="text-[10px] text-[#A0A3BD]">Admission Date</p><p className="text-sm font-medium text-[#1B1D3A]">{student.admissionDate}</p></div></div>
                <div className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-[#A0A3BD]" /><div><p className="text-[10px] text-[#A0A3BD]">Attendance</p><p className={`text-sm font-medium ${student.attendance >= 75 ? 'text-green-700' : 'text-red-600'}`}>{student.attendance}%</p></div></div>
                <div className="flex items-center gap-3"><TrendingUp className="h-4 w-4 text-[#A0A3BD]" /><div><p className="text-[10px] text-[#A0A3BD]">Fee Status</p><p className={`text-sm font-medium ${feeColor}`}>{student.feeStatus}</p></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsEditing(false)} />
            <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[#1B1D3A]">Edit Student</h2>
                <button type="button" onClick={() => setIsEditing(false)} className="rounded-lg p-1 hover:bg-[#F5F6FA]"><X className="h-5 w-5 text-[#6E7191]" /></button>
              </div>
              <div className="space-y-3">
                <div><label className="text-xs font-medium text-[#1B1D3A]">Phone</label><input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="mt-1 w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                <div><label className="text-xs font-medium text-[#1B1D3A]">Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="mt-1 w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
                <div><label className="text-xs font-medium text-[#1B1D3A]">Address</label><input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="mt-1 w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" /></div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className="rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]">Cancel</button>
                <button type="button" onClick={handleSaveEdit} className="rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A]">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContent>
  );
}

export { StudentProfilePage };
