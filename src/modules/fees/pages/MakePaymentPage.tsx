/**
 * Make Payment Page - Enter student details, select fee category,
 * choose payment gateway (Paytm, Razorpay, PhonePe, CRED Pay, Card, Net Banking, UPI),
 * and process payment.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { usePermission } from '@/hooks/usePermission';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, CreditCard, CheckCircle,
  IndianRupee, Shield, AlertCircle,
} from 'lucide-react';

// --- Types ---

type PaymentGateway = 'razorpay' | 'paytm' | 'phonepe' | 'credpay' | 'card' | 'netbanking' | 'upi';
type PaymentStep = 'details' | 'gateway' | 'processing' | 'success' | 'failed';

interface PaymentFormData {
  studentName: string;
  studentId: string;
  course: string;
  feeCategory: string;
  amount: string;
  remarks: string;
}

// --- Constants ---

const COURSES = ['MPC', 'BiPC', 'CEC', 'MEC', 'HEC'];
const FEE_CATEGORIES = ['Tuition Fee', 'Lab Fee', 'Library Fee', 'Sports Fee', 'Transport Fee', 'Exam Fee'];

const GATEWAYS: { id: PaymentGateway; name: string; icon: string; description: string; color: string }[] = [
  { id: 'razorpay', name: 'Razorpay', icon: '⚡', description: 'Cards, UPI, Wallets, Net Banking', color: 'border-blue-200 bg-blue-50' },
  { id: 'paytm', name: 'Paytm', icon: '💳', description: 'Paytm Wallet, UPI, Cards', color: 'border-sky-200 bg-sky-50' },
  { id: 'phonepe', name: 'PhonePe', icon: '📱', description: 'UPI, Cards, Wallet', color: 'border-purple-200 bg-purple-50' },
  { id: 'credpay', name: 'CRED Pay', icon: '🏆', description: 'Credit Card rewards & payments', color: 'border-gray-300 bg-gray-50' },
  { id: 'upi', name: 'UPI Direct', icon: '🔗', description: 'Google Pay, PhonePe, BHIM UPI', color: 'border-green-200 bg-green-50' },
  { id: 'card', name: 'Credit/Debit Card', icon: '💳', description: 'Visa, Mastercard, RuPay', color: 'border-indigo-200 bg-indigo-50' },
  { id: 'netbanking', name: 'Net Banking', icon: '🏦', description: 'All major banks supported', color: 'border-amber-200 bg-amber-50' },
];

// Categorized payment methods for compact button display
const PAYMENT_CATEGORIES = [
  { label: 'UPI', methods: ['upi', 'phonepe', 'paytm'] as PaymentGateway[] },
  { label: 'Cards', methods: ['card', 'credpay'] as PaymentGateway[] },
  { label: 'Banking', methods: ['netbanking'] as PaymentGateway[] },
  { label: 'Payment Gateways', methods: ['razorpay'] as PaymentGateway[] },
];

export function MakePaymentPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const [step, setStep] = useState<PaymentStep>('details');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    studentName: '', studentId: '', course: '', feeCategory: '', amount: '', remarks: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  function validateDetails(): boolean {
    const errors: Partial<Record<keyof PaymentFormData, string>> = {};
    if (!formData.studentName.trim()) errors.studentName = 'Required';
    if (!formData.studentId.trim()) errors.studentId = 'Required';
    if (!formData.course) errors.course = 'Required';
    if (!formData.feeCategory) errors.feeCategory = 'Required';
    if (!formData.amount || Number(formData.amount) <= 0) errors.amount = 'Enter valid amount';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleProceedToGateway(): void {
    if (!validateDetails()) return;
    setStep('gateway');
  }

  function handleProcessPayment(): void {
    if (!selectedGateway) return;
    // Validate gateway-specific fields
    if (selectedGateway === 'upi' && !upiId.trim()) return;
    if (selectedGateway === 'card' && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim() || !cardName.trim())) return;
    if (selectedGateway === 'netbanking' && !selectedBank) return;

    setStep('processing');
    // Simulate payment processing
    setTimeout(() => {
      // 90% success rate simulation
      if (Math.random() > 0.1) {
        setStep('success');
      } else {
        setStep('failed');
      }
    }, 3000);
  }

  // --- Processing / Success / Failed States ---
  if (step === 'processing') {
    return (
      <PageContent>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="h-16 w-16 rounded-full border-4 border-[#ECEDF3] border-t-[#363473]" />
          <p className="mt-6 text-lg font-semibold text-[#1B1D3A]">Processing Payment...</p>
          <p className="mt-2 text-sm text-[#6E7191]">Please do not close this page. Connecting to {GATEWAYS.find((g) => g.id === selectedGateway)?.name}...</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-[#A0A3BD]"><Shield className="h-3.5 w-3.5" /> Secured with 256-bit SSL encryption</div>
        </div>
      </PageContent>
    );
  }

  if (step === 'success') {
    return (
      <PageContent>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100"><CheckCircle className="h-10 w-10 text-green-600" /></div>
          </motion.div>
          <h2 className="mt-6 text-xl font-bold text-[#1B1D3A]">Payment Successful!</h2>
          <p className="mt-2 text-sm text-[#6E7191]">₹{Number(formData.amount).toLocaleString('en-IN')} paid for {formData.studentName}</p>
          <div className="mt-6 rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-5 w-full max-w-sm">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#6E7191]">Student</span><span className="font-medium text-[#1B1D3A]">{formData.studentName}</span></div>
              <div className="flex justify-between"><span className="text-[#6E7191]">ID</span><span className="font-medium text-[#1B1D3A]">{formData.studentId}</span></div>
              <div className="flex justify-between"><span className="text-[#6E7191]">Category</span><span className="font-medium text-[#1B1D3A]">{formData.feeCategory}</span></div>
              <div className="flex justify-between"><span className="text-[#6E7191]">Amount</span><span className="font-bold text-green-700">₹{Number(formData.amount).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-[#6E7191]">Gateway</span><span className="font-medium text-[#1B1D3A]">{GATEWAYS.find((g) => g.id === selectedGateway)?.name}</span></div>
              <div className="flex justify-between"><span className="text-[#6E7191]">Transaction ID</span><span className="font-mono text-xs text-[#6E7191]">TXN{Date.now()}</span></div>
              <div className="flex justify-between"><span className="text-[#6E7191]">Date</span><span className="font-medium text-[#1B1D3A]">{new Date().toLocaleDateString('en-IN')}</span></div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => navigate('/fees')} className="rounded-lg bg-[#363473] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors">Back to Fees</button>
            <button type="button" onClick={() => { setStep('details'); setFormData({ studentName: '', studentId: '', course: '', feeCategory: '', amount: '', remarks: '' }); setSelectedGateway(null); }} className="rounded-lg border border-[#ECEDF3] px-5 py-2.5 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]">New Payment</button>
          </div>
        </div>
      </PageContent>
    );
  }

  if (step === 'failed') {
    return (
      <PageContent>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100"><AlertCircle className="h-10 w-10 text-red-600" /></div>
          </motion.div>
          <h2 className="mt-6 text-xl font-bold text-[#1B1D3A]">Payment Failed</h2>
          <p className="mt-2 text-sm text-[#6E7191]">The transaction could not be completed. No amount has been deducted.</p>
          <p className="mt-1 text-xs text-[#A0A3BD]">If any amount was debited, it will be refunded within 5-7 business days.</p>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setStep('gateway')} className="rounded-lg bg-[#363473] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors">Try Again</button>
            <button type="button" onClick={() => navigate('/fees')} className="rounded-lg border border-[#ECEDF3] px-5 py-2.5 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]">Back to Fees</button>
          </div>
        </div>
      </PageContent>
    );
  }

  // --- Main Form ---
  return (
    <PageContent>
      <PageHeader title="Make Payment" subtitle="Process fee payment for a student." breadcrumbs={[{ label: 'Home' }, { label: 'Fees' }, { label: 'Make Payment' }]} />

      <div className="mt-6 max-w-3xl">
        <button type="button" onClick={() => step === 'gateway' ? setStep('details') : navigate('/fees')} className="inline-flex items-center gap-2 text-sm text-[#363473] hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> {step === 'gateway' ? 'Back to Details' : 'Back to Fees'}
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-6">
          {['Student Details', 'Payment Method', 'Confirmation'].map((label, idx) => {
            const stepIdx = step === 'details' ? 0 : 1;
            const isCompleted = idx < stepIdx;
            const isCurrent = idx === stepIdx;
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${isCompleted ? 'border-green-500 bg-green-500 text-white' : isCurrent ? 'border-[#363473] bg-[#363473] text-white' : 'border-[#ECEDF3] text-[#A0A3BD]'}`}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                  </div>
                  <p className={`mt-1 text-xs ${isCurrent ? 'text-[#363473] font-medium' : 'text-[#A0A3BD]'}`}>{label}</p>
                </div>
                {idx < 2 && <div className={`h-0.5 flex-1 mx-2 mt-[-12px] ${isCompleted ? 'bg-green-500' : 'bg-[#ECEDF3]'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Student Details */}
          {step === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6">
                <h3 className="text-base font-semibold text-[#1B1D3A] mb-5">Student & Fee Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Student Name *</label>
                    <input type="text" value={formData.studentName} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" placeholder="Enter student name" />
                    {formErrors.studentName && <p className="mt-1 text-xs text-red-600">{formErrors.studentName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Student ID / Roll No *</label>
                    <input type="text" value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" placeholder="e.g. SA2024-MPC-001" />
                    {formErrors.studentId && <p className="mt-1 text-xs text-red-600">{formErrors.studentId}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Course *</label>
                    <select value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                      <option value="">Select Course</option>
                      {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {formErrors.course && <p className="mt-1 text-xs text-red-600">{formErrors.course}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Fee Category *</label>
                    <select value={formData.feeCategory} onChange={(e) => setFormData({ ...formData, feeCategory: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                      <option value="">Select Category</option>
                      {FEE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {formErrors.feeCategory && <p className="mt-1 text-xs text-red-600">{formErrors.feeCategory}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Amount (₹) *</label>
                    <input type="number" min="1" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" placeholder="Enter amount" />
                    {formErrors.amount && <p className="mt-1 text-xs text-red-600">{formErrors.amount}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Remarks</label>
                    <input type="text" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" placeholder="Optional notes" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  {hasPermission('fees', 'collect') && (
                    <button type="button" onClick={handleProceedToGateway} className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors">
                      Proceed to Payment <CreditCard className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment Gateway Selection */}
          {step === 'gateway' && (
            <motion.div key="gateway" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {/* Payment Summary */}
              <div className="rounded-xl border border-[#ECEDF3] bg-[#F5F6FA] p-4 mb-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm"><span className="text-[#6E7191]">Paying for:</span> <span className="font-medium text-[#1B1D3A]">{formData.studentName}</span> <span className="text-[#A0A3BD]">({formData.studentId})</span></div>
                  <div className="text-lg font-bold text-[#363473]">₹{Number(formData.amount).toLocaleString('en-IN')}</div>
                </div>
                <p className="text-xs text-[#A0A3BD] mt-1">{formData.feeCategory} • {formData.course}</p>
              </div>

              {/* Gateway Options */}
              <div className="rounded-xl border border-[#ECEDF3] bg-white shadow-sm p-6">
                <h3 className="text-base font-semibold text-[#1B1D3A] mb-4">Choose Payment Method</h3>
                <div className="space-y-4">
                  {PAYMENT_CATEGORIES.map((cat) => (
                    <div key={cat.label}>
                      <p className="text-xs font-medium text-[#A0A3BD] uppercase tracking-wide mb-2">{cat.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {cat.methods.map((gwId) => {
                          const gw = GATEWAYS.find((g) => g.id === gwId);
                          if (!gw) return null;
                          return (
                            <button key={gw.id} type="button" onClick={() => setSelectedGateway(gw.id)}
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${selectedGateway === gw.id ? 'border-[#363473] bg-[#363473] text-white shadow-sm' : 'border-[#ECEDF3] bg-white text-[#1B1D3A] hover:border-[#363473] hover:bg-[#363473]/5'}`}>
                              <span className="text-base">{gw.icon}</span> {gw.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gateway-specific fields */}
                {selectedGateway && (
                  <div className="mt-5 rounded-lg border border-[#ECEDF3] p-4">
                    {(selectedGateway === 'upi' || selectedGateway === 'phonepe' || selectedGateway === 'paytm') && (
                      <div>
                        <label className="block text-sm font-medium text-[#1B1D3A] mb-1">UPI ID *</label>
                        <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                        <p className="mt-1 text-xs text-[#A0A3BD]">Enter your UPI ID linked to {GATEWAYS.find((g) => g.id === selectedGateway)?.name}</p>
                      </div>
                    )}
                    {(selectedGateway === 'card' || selectedGateway === 'credpay') && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Card Number *</label>
                          <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" maxLength={19} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Expiry *</label>
                            <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#1B1D3A] mb-1">CVV *</label>
                            <input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="•••" maxLength={4} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Name on Card *</label>
                            <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]" />
                          </div>
                        </div>
                        {selectedGateway === 'credpay' && <p className="text-xs text-[#A0A3BD]">Earn CRED coins on this payment</p>}
                      </div>
                    )}
                    {selectedGateway === 'netbanking' && (
                      <div>
                        <label className="block text-sm font-medium text-[#1B1D3A] mb-1">Select Bank *</label>
                        <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">
                          <option value="">Choose your bank</option>
                          <option value="sbi">State Bank of India</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                          <option value="kotak">Kotak Mahindra Bank</option>
                          <option value="bob">Bank of Baroda</option>
                          <option value="pnb">Punjab National Bank</option>
                          <option value="canara">Canara Bank</option>
                          <option value="union">Union Bank of India</option>
                          <option value="indian">Indian Bank</option>
                        </select>
                        <p className="mt-1 text-xs text-[#A0A3BD]">You will be redirected to your bank's secure page</p>
                      </div>
                    )}
                    {selectedGateway === 'razorpay' && (
                      <div className="text-center py-3">
                        <p className="text-sm text-[#6E7191]">You will be redirected to Razorpay's secure payment page</p>
                        <p className="text-xs text-[#A0A3BD] mt-1">Supports Cards, UPI, Wallets (Paytm, PhonePe, Amazon Pay), and Net Banking</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pay Button */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#A0A3BD]"><Shield className="h-3.5 w-3.5" /> 100% Secure Payment</div>
                  {hasPermission('fees', 'collect') && (
                    <button type="button" onClick={handleProcessPayment} disabled={!selectedGateway}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      <IndianRupee className="h-4 w-4" /> Pay ₹{Number(formData.amount).toLocaleString('en-IN')}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContent>
  );
}
