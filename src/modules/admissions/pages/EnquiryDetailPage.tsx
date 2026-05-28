/**
 * Enquiry Detail Page - Full detail view for a registration/enquiry record.
 * Shows student info, current status, timeline, and action buttons to transition status.
 * Accessible at /admissions/:id
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContent } from '@/components/layout/page-content';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, User, Mail, Phone, GraduationCap, Building2,
  FileText, Calendar, CheckCircle, XCircle, ArrowRight,
  ClipboardCheck, UserCheck, MessageSquare, Gift, UserPlus,
} from 'lucide-react';

// --- Types ---

type EnquiryStatus = 'Inquiry' | 'Applied' | 'Verified' | 'Interview' | 'Offered' | 'Enrolled' | 'Rejected';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  previousInstitution: string;
  notes: string;
  status: EnquiryStatus;
  date: string;
}

// --- Constants ---

const STATUS_FLOW: EnquiryStatus[] = ['Inquiry', 'Applied', 'Verified', 'Interview', 'Offered', 'Enrolled'];

const STATUS_COLORS: Record<EnquiryStatus, string> = {
  Inquiry: 'bg-blue-100 text-blue-800',
  Applied: 'bg-purple-100 text-purple-800',
  Verified: 'bg-indigo-100 text-indigo-800',
  Interview: 'bg-yellow-100 text-yellow-800',
  Offered: 'bg-green-100 text-green-800',
  Enrolled: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-800',
};

const STATUS_ICONS: Record<EnquiryStatus, React.ReactNode> = {
  Inquiry: <MessageSquare className="h-4 w-4" />,
  Applied: <ClipboardCheck className="h-4 w-4" />,
  Verified: <UserCheck className="h-4 w-4" />,
  Interview: <MessageSquare className="h-4 w-4" />,
  Offered: <Gift className="h-4 w-4" />,
  Enrolled: <UserPlus className="h-4 w-4" />,
  Rejected: <XCircle className="h-4 w-4" />,
};

const NEXT_ACTION_LABELS: Record<EnquiryStatus, string> = {
  Inquiry: 'Mark as Applied',
  Applied: 'Mark as Verified',
  Verified: 'Schedule Interview',
  Interview: 'Send Offer',
  Offered: 'Enroll Student',
  Enrolled: '',
  Rejected: '',
};

const INITIAL_ENQUIRIES: Enquiry[] = [
  { id: '1', name: 'Amit Patel', email: 'amit.patel@email.com', phone: '+91 9876543210', course: 'Computer Science', previousInstitution: 'Delhi Public School', notes: 'Interested in AI track', status: 'Inquiry', date: '2024-12-01' },
  { id: '2', name: 'Sneha Reddy', email: 'sneha.r@email.com', phone: '+91 9876543211', course: 'MBA', previousInstitution: 'St. Josephs College', notes: 'Has 3 years work experience', status: 'Applied', date: '2024-12-02' },
  { id: '3', name: 'Ravi Kumar', email: 'ravi.k@email.com', phone: '+91 9876543212', course: 'Mechanical Engineering', previousInstitution: 'Kendriya Vidyalaya', notes: '', status: 'Verified', date: '2024-12-03' },
  { id: '4', name: 'Priya Sharma', email: 'priya.s@email.com', phone: '+91 9876543213', course: 'Data Science', previousInstitution: 'Modern School', notes: 'Strong in mathematics', status: 'Interview', date: '2024-12-04' },
  { id: '5', name: 'Arjun Nair', email: 'arjun.n@email.com', phone: '+91 9876543214', course: 'Electrical Engineering', previousInstitution: 'Army Public School', notes: '', status: 'Offered', date: '2024-12-05' },
  { id: '6', name: 'Kavitha Menon', email: 'kavitha.m@email.com', phone: '+91 9876543215', course: 'Computer Science', previousInstitution: 'Chinmaya Vidyalaya', notes: 'Gold medal in state olympiad', status: 'Enrolled', date: '2024-12-06' },
  { id: '7', name: 'Deepak Joshi', email: 'deepak.j@email.com', phone: '+91 9876543216', course: 'Civil Engineering', previousInstitution: 'DAV School', notes: 'Looking for scholarship', status: 'Rejected', date: '2024-12-07' },
  { id: '8', name: 'Ananya Gupta', email: 'ananya.g@email.com', phone: '+91 9876543217', course: 'MBA', previousInstitution: 'Christ University', notes: 'GMAT score 720', status: 'Applied', date: '2024-12-08' },
  { id: '9', name: 'Vikram Singh', email: 'vikram.s@email.com', phone: '+91 9876543218', course: 'Computer Science', previousInstitution: 'Ryan International', notes: 'Open source contributor', status: 'Inquiry', date: '2024-12-09' },
  { id: '10', name: 'Meera Das', email: 'meera.d@email.com', phone: '+91 9876543219', course: 'Data Science', previousInstitution: 'La Martiniere', notes: 'Published research paper', status: 'Verified', date: '2024-12-10' },
  { id: '11', name: 'Rahul Verma', email: 'rahul.v@email.com', phone: '+91 9876543220', course: 'Mechanical Engineering', previousInstitution: 'Bishop Cotton', notes: '', status: 'Interview', date: '2024-12-11' },
  { id: '12', name: 'Swati Pandey', email: 'swati.p@email.com', phone: '+91 9876543221', course: 'Electrical Engineering', previousInstitution: 'Springdales', notes: 'State rank holder', status: 'Offered', date: '2024-12-12' },
  { id: '13', name: 'Manish Tiwari', email: 'manish.t@email.com', phone: '+91 9876543222', course: 'Civil Engineering', previousInstitution: 'DPS RK Puram', notes: '', status: 'Enrolled', date: '2024-12-13' },
  { id: '14', name: 'Pooja Iyer', email: 'pooja.i@email.com', phone: '+91 9876543223', course: 'Computer Science', previousInstitution: 'National Public School', notes: 'Wants to specialize in ML', status: 'Inquiry', date: '2024-12-14' },
  { id: '15', name: 'Sanjay Rao', email: 'sanjay.r@email.com', phone: '+91 9876543224', course: 'MBA', previousInstitution: 'Loyola College', notes: '5 years in consulting', status: 'Applied', date: '2024-12-15' },
  { id: '16', name: 'Nisha Agarwal', email: 'nisha.a@email.com', phone: '+91 9876543225', course: 'Data Science', previousInstitution: 'Amity School', notes: 'Python certified', status: 'Verified', date: '2024-12-16' },
];

// --- Component ---

export function EnquiryDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const enquiryData = INITIAL_ENQUIRIES.find((e) => e.id === id);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(enquiryData ?? null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  if (!enquiry) {
    return (
      <PageContent>
        <div className="p-6">
          <button
            type="button"
            onClick={() => navigate('/admissions')}
            className="inline-flex items-center gap-2 text-sm text-[#363473] hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Registration
          </button>
          <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-12 text-center">
            <p className="text-[#A0A3BD]">Enquiry not found.</p>
          </div>
        </div>
      </PageContent>
    );
  }

  const currentStepIndex = STATUS_FLOW.indexOf(enquiry.status);
  const isRejected = enquiry.status === 'Rejected';
  const isEnrolled = enquiry.status === 'Enrolled';
  const canAdvance = !isRejected && !isEnrolled;
  const nextStatus = canAdvance ? STATUS_FLOW[currentStepIndex + 1] : null;

  function handleAdvance(): void {
    if (nextStatus) {
      setEnquiry((prev) => prev ? { ...prev, status: nextStatus } : prev);
    }
  }

  function handleReject(): void {
    setEnquiry((prev) => prev ? { ...prev, status: 'Rejected' } : prev);
    setShowRejectConfirm(false);
  }

  return (
    <PageContent>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Back + Breadcrumbs */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/admissions')}
            className="inline-flex items-center gap-2 text-sm text-[#363473] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Registration
          </button>
          <div className="mt-2 flex items-center gap-2 text-xs text-[#A0A3BD]">
            <span>Home</span>
            <span>/</span>
            <span>Registration</span>
            <span>/</span>
            <span className="text-[#1B1D3A]">{enquiry.name}</span>
          </div>
        </div>

        {/* Student Info Card */}
        <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#363473]/10">
                <User className="h-7 w-7 text-[#363473]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1B1D3A]">{enquiry.name}</h1>
                <p className="mt-0.5 text-sm text-[#6E7191]">Enquiry #{enquiry.id} • {enquiry.date}</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[enquiry.status]}`}>
              {STATUS_ICONS[enquiry.status]}
              {enquiry.status}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-[#A0A3BD]" />
              <div>
                <p className="text-xs text-[#A0A3BD]">Email</p>
                <p className="text-[#1B1D3A] font-medium">{enquiry.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-[#A0A3BD]" />
              <div>
                <p className="text-xs text-[#A0A3BD]">Phone</p>
                <p className="text-[#1B1D3A] font-medium">{enquiry.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <GraduationCap className="h-4 w-4 text-[#A0A3BD]" />
              <div>
                <p className="text-xs text-[#A0A3BD]">Course Applied</p>
                <p className="text-[#1B1D3A] font-medium">{enquiry.course}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="h-4 w-4 text-[#A0A3BD]" />
              <div>
                <p className="text-xs text-[#A0A3BD]">Previous Institution</p>
                <p className="text-[#1B1D3A] font-medium">{enquiry.previousInstitution || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-[#A0A3BD]" />
              <div>
                <p className="text-xs text-[#A0A3BD]">Enquiry Date</p>
                <p className="text-[#1B1D3A] font-medium">{enquiry.date}</p>
              </div>
            </div>
            {enquiry.notes && (
              <div className="flex items-start gap-3 text-sm">
                <FileText className="h-4 w-4 text-[#A0A3BD] mt-0.5" />
                <div>
                  <p className="text-xs text-[#A0A3BD]">Notes</p>
                  <p className="text-[#1B1D3A] font-medium">{enquiry.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Pipeline / Progress */}
        <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6 mb-6">
          <h3 className="text-sm font-semibold text-[#1B1D3A] mb-4">Admission Pipeline</h3>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {STATUS_FLOW.map((step, index) => {
              const isCompleted = !isRejected && currentStepIndex > index;
              const isCurrent = !isRejected && currentStepIndex === index;
              const isLast = index === STATUS_FLOW.length - 1;

              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                        isCompleted
                          ? 'border-green-500 bg-green-500 text-white'
                          : isCurrent
                          ? 'border-[#363473] bg-[#363473] text-white'
                          : 'border-[#ECEDF3] bg-white text-[#A0A3BD]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    <p className={`mt-1.5 text-xs text-center font-medium ${
                      isCurrent ? 'text-[#363473]' : isCompleted ? 'text-green-700' : 'text-[#A0A3BD]'
                    }`}>
                      {step}
                    </p>
                  </div>
                  {!isLast && (
                    <div className={`h-0.5 flex-1 min-w-[20px] mt-[-16px] ${
                      isCompleted ? 'bg-green-500' : 'bg-[#ECEDF3]'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {isRejected && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5">
              <XCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700 font-medium">This application has been rejected.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6">
          <h3 className="text-sm font-semibold text-[#1B1D3A] mb-4">Actions</h3>

          {isEnrolled && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <p className="text-sm text-emerald-700 font-medium">Student has been successfully enrolled. No further actions needed.</p>
            </div>
          )}

          {isRejected && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-700 font-medium">Application rejected. No further actions available.</p>
            </div>
          )}

          {canAdvance && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary action: advance to next status */}
              <button
                type="button"
                onClick={handleAdvance}
                className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1B1D3A] transition-colors"
              >
                {NEXT_ACTION_LABELS[enquiry.status]}
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Reject action */}
              <button
                type="button"
                onClick={() => setShowRejectConfirm(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
            </div>
          )}
        </div>

        {/* Reject Confirmation Modal */}
        <AnimatePresence>
          {showRejectConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowRejectConfirm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1B1D3A]">Reject Application?</h3>
                  <p className="mt-2 text-sm text-[#6E7191]">
                    Are you sure you want to reject {enquiry.name}'s application? This action cannot be undone.
                  </p>
                  <div className="mt-6 flex gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => setShowRejectConfirm(false)}
                      className="flex-1 rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageContent>
  );
}
