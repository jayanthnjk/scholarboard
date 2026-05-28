/**
 * Login Page - Modern SaaS-style with animated background carousel,
 * glassmorphism login card, top navbar, and footer.
 */

import { useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import {
  Eye, EyeOff, Loader2, GraduationCap,
  Users, BarChart3, CreditCard, ClipboardCheck, MessageSquare,
  BookOpen, Shield, Phone, Mail, MapPin, ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormErrors { email?: string; password?: string; general?: string; }

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
  return undefined;
}
function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return undefined;
}

const CAROUSEL_SLIDES = [
  { title: 'Student Lifecycle', subtitle: 'Admission to Alumni', icon: Users, gradient: 'from-blue-600 to-indigo-700' },
  { title: 'Smart Finance', subtitle: 'Fees & Payments', icon: CreditCard, gradient: 'from-emerald-600 to-teal-700' },
  { title: 'Live Analytics', subtitle: 'Real-time Insights', icon: BarChart3, gradient: 'from-purple-600 to-violet-700' },
  { title: 'Exam Engine', subtitle: 'Schedule & Results', icon: ClipboardCheck, gradient: 'from-rose-600 to-pink-700' },
  { title: 'Communication', subtitle: 'SMS, Email, WhatsApp', icon: MessageSquare, gradient: 'from-amber-600 to-orange-700' },
  { title: 'Digital Library', subtitle: 'Books & Resources', icon: BookOpen, gradient: 'from-cyan-600 to-sky-700' },
];

const DEMO_ACCOUNTS = [
  { role: 'Super Admin', email: 'admin@sunriseacademy.edu', password: 'Admin@123', color: 'bg-rose-500' },
  { role: 'Principal', email: 'principal@sunriseacademy.edu', password: 'Principal@123', color: 'bg-blue-500' },
  { role: 'Accountant', email: 'accounts@sunriseacademy.edu', password: 'Accounts@123', color: 'bg-emerald-500' },
  { role: 'Teacher', email: 'teacher.math@sunriseacademy.edu', password: 'Teacher@123', color: 'bg-violet-500' },
  { role: 'Student', email: 'student.arjun@sunriseacademy.edu', password: 'Student@123', color: 'bg-cyan-500' },
  { role: 'Parent', email: 'parent.sharma@gmail.com', password: 'Parent@123', color: 'bg-amber-500' },
] as const;

export function LoginPage(): React.JSX.Element {
  const { login, requiresCaptcha } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeView, setActiveView] = useState<'signin' | 'contact'>('signin');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % CAROUSEL_SLIDES.length), 3500);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) { setErrors({ email: emailError, password: passwordError }); return; }
    setErrors({});
    setIsSubmitting(true);
    const result = await login({ email, password, rememberMe });
    if (result.status === 'failed') { setErrors({ general: result.error ?? 'Invalid credentials' }); setIsSubmitting(false); }
  }, [email, password, rememberMe, login]);

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail); setPassword(demoPassword); setErrors({});
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0E2A]">
      {/* ═══ Top Navbar ═══ */}
      <header className="relative z-20 flex h-14 items-center justify-between px-6 lg:px-10 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#363473] to-[#6366F1]">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold text-white">ScholarBoard</span>
            <p className="text-[10px] text-white/50">Education ERP Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { setActiveView('signin'); }} className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${activeView === 'signin' ? 'bg-white text-[#363473]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
            Sign In
          </button>
          <button type="button" onClick={() => { setActiveView('contact'); }} className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${activeView === 'contact' ? 'bg-white text-[#363473]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
            Contact Us
          </button>
        </div>
      </header>

      {/* ═══ Main Content ═══ */}
      <main className="relative flex-1 flex overflow-hidden">
        {/* Left Side - Branding & Carousel */}
        <div className="hidden lg:flex lg:w-[55%] relative flex-col px-14 xl:px-20 pt-16 pb-10">
          {/* Background gradient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-[#363473]/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] bg-[#6366F1]/15 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 max-w-[520px]">
            {/* Tagline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-[11px] font-medium text-white/60 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6366F1] mr-2" />
                AI-Powered Education Platform
              </span>
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] mb-5">
                Manage your institution
                <br />
                <span className="bg-gradient-to-r from-[#818CF8] to-[#C084FC] bg-clip-text text-transparent">smarter & faster</span>
              </h1>
              <p className="text-base text-white/50 leading-relaxed max-w-[420px] mb-10">
                Streamline admissions, academics, finance, and communication — everything your institution needs in one unified platform.
              </p>
            </motion.div>

            {/* Animated Feature Carousel */}
            <div className="relative h-[180px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <div className="flex items-start gap-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6">
                    <div className={`shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${CAROUSEL_SLIDES[currentSlide]?.gradient ?? ''} shadow-lg`}>
                      {(() => { const Icon = CAROUSEL_SLIDES[currentSlide]?.icon ?? Users; return <Icon className="h-6 w-6 text-white" />; })()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{CAROUSEL_SLIDES[currentSlide]?.title}</h3>
                      <p className="text-sm text-white/50 mb-3">{CAROUSEL_SLIDES[currentSlide]?.subtitle}</p>
                      <div className="flex items-center gap-3">
                        {CAROUSEL_SLIDES.map((_, idx) => (
                          <button key={idx} type="button" onClick={() => setCurrentSlide(idx)} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-[#818CF8]' : 'w-1.5 bg-white/20 hover:bg-white/40'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 mt-8">
              {[{ value: '500+', label: 'Institutions' }, { value: '2L+', label: 'Students' }, { value: '99.9%', label: 'Uptime' }].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-[11px] text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Sign In / Contact */}
        <div className="flex flex-1 items-center justify-center px-6 py-8 lg:px-12 overflow-y-auto">
          <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] left-[10%] w-[250px] h-[250px] bg-[#363473]/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-[20%] right-[10%] w-[200px] h-[200px] bg-[#6366F1]/15 rounded-full blur-[60px]" />
          </div>

          <AnimatePresence mode="wait">
            {activeView === 'signin' && (
              <motion.div key="signin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                className="relative z-10 w-full max-w-[370px] rounded-2xl bg-white shadow-2xl shadow-black/20 p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2.5 mb-3 lg:hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#363473] to-[#6366F1]"><GraduationCap className="h-4 w-4 text-white" /></div>
                    <span className="text-sm font-bold text-[#1B1D3A]">ScholarBoard</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#1B1D3A]">Sign in</h2>
                  <p className="text-xs text-[#6E7191] mt-0.5">Access your institution dashboard</p>
                </div>
                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  {errors.general && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700"><div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />{errors.general}</motion.div>
                  )}
                  <div><label htmlFor="login-email" className="text-xs font-medium text-[#1B1D3A]">Email</label><input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@institution.edu" disabled={isSubmitting} className="mt-1 flex h-10 w-full rounded-lg border border-[#ECEDF3] bg-[#F9FAFB] px-3.5 text-sm text-[#1B1D3A] placeholder:text-[#A0A3BD] focus:outline-none focus:ring-2 focus:ring-[#363473] focus:bg-white disabled:opacity-50 transition-all" />{errors.email && <p className="text-[10px] text-red-600 mt-0.5">{errors.email}</p>}</div>
                  <div><div className="flex items-center justify-between"><label htmlFor="login-password" className="text-xs font-medium text-[#1B1D3A]">Password</label><Link to="/forgot-password" className="text-[10px] text-[#363473] hover:text-[#6366F1]">Forgot?</Link></div><div className="relative mt-1"><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={isSubmitting} className="flex h-10 w-full rounded-lg border border-[#ECEDF3] bg-[#F9FAFB] px-3.5 pr-10 text-sm text-[#1B1D3A] placeholder:text-[#A0A3BD] focus:outline-none focus:ring-2 focus:ring-[#363473] focus:bg-white disabled:opacity-50 transition-all" /><button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A3BD] hover:text-[#1B1D3A]" tabIndex={-1}>{showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button></div>{errors.password && <p className="text-[10px] text-red-600 mt-0.5">{errors.password}</p>}</div>
                  <div className="flex items-center gap-2"><input type="checkbox" id="remember-me" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={isSubmitting} className="h-3.5 w-3.5 rounded border-[#ECEDF3] text-[#363473] focus:ring-[#363473]" /><label htmlFor="remember-me" className="text-xs text-[#6E7191] cursor-pointer">Remember me</label></div>
                  {requiresCaptcha && <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[10px] text-amber-700">Too many attempts.</div>}
                  <button type="submit" disabled={isSubmitting} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#363473] text-sm font-semibold text-white hover:bg-[#2D2B55] focus:ring-2 focus:ring-[#363473] focus:ring-offset-2 disabled:opacity-50 active:scale-[0.99] transition-all">{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : <>Sign In <ArrowRight className="h-4 w-4" /></>}</button>
                </form>
                <div className="mt-4"><div className="flex items-center gap-3 mb-2"><div className="h-px flex-1 bg-[#ECEDF3]" /><span className="text-[9px] uppercase tracking-wider text-[#A0A3BD]">Demo</span><div className="h-px flex-1 bg-[#ECEDF3]" /></div><div className="grid grid-cols-3 gap-1.5">{DEMO_ACCOUNTS.map((a) => (<button key={a.email} type="button" onClick={() => fillDemo(a.email, a.password)} className="group rounded-md border border-[#ECEDF3] bg-[#F9FAFB] py-1.5 text-center hover:border-[#363473]/30 hover:bg-[#363473]/5 transition-all"><div className={`mx-auto h-1.5 w-1.5 rounded-full ${a.color} mb-0.5`} /><span className="text-[9px] font-medium text-[#6E7191] group-hover:text-[#1B1D3A]">{a.role}</span></button>))}</div></div>
              </motion.div>
            )}
            {activeView === 'contact' && (
              <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                className="relative z-10 w-full max-w-[370px] rounded-2xl bg-white shadow-2xl shadow-black/20 p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-[#1B1D3A]">Contact Us</h2>
                  <p className="text-xs text-[#6E7191] mt-0.5">We'd love to hear from you</p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-3 rounded-lg bg-[#F9FAFB] border border-[#ECEDF3] px-3 py-2"><Phone className="h-4 w-4 text-[#363473]" /><div><p className="text-[10px] text-[#A0A3BD]">Phone</p><p className="text-xs font-medium text-[#1B1D3A]">+91 80 2345 6789</p></div></div>
                  <div className="flex items-center gap-3 rounded-lg bg-[#F9FAFB] border border-[#ECEDF3] px-3 py-2"><Mail className="h-4 w-4 text-[#363473]" /><div><p className="text-[10px] text-[#A0A3BD]">Email</p><p className="text-xs font-medium text-[#1B1D3A]">support@scholarboard.in</p></div></div>
                  <div className="flex items-center gap-3 rounded-lg bg-[#F9FAFB] border border-[#ECEDF3] px-3 py-2"><MapPin className="h-4 w-4 text-[#363473]" /><div><p className="text-[10px] text-[#A0A3BD]">Location</p><p className="text-xs font-medium text-[#1B1D3A]">123 Education Lane, Bangalore 560001</p></div></div>
                </div>
                {contactSent ? (
                  <div className="text-center py-4"><div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100 mb-2"><Shield className="h-5 w-5 text-green-600" /></div><p className="text-sm font-semibold text-[#1B1D3A]">Sent!</p><p className="text-xs text-[#6E7191] mt-0.5">We'll respond within 24 hours.</p><button type="button" onClick={() => { setContactSent(false); setContactForm({ name: '', email: '', message: '' }); }} className="mt-2 text-xs text-[#363473] hover:underline">Send another</button></div>
                ) : (
                  <div className="space-y-2.5">
                    <div><label className="text-xs font-medium text-[#1B1D3A]">Name</label><input type="text" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} placeholder="Your name" className="mt-1 flex h-9 w-full rounded-lg border border-[#ECEDF3] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#A0A3BD] focus:outline-none focus:ring-2 focus:ring-[#363473] focus:bg-white transition-all" /></div>
                    <div><label className="text-xs font-medium text-[#1B1D3A]">Email</label><input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} placeholder="you@email.com" className="mt-1 flex h-9 w-full rounded-lg border border-[#ECEDF3] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#A0A3BD] focus:outline-none focus:ring-2 focus:ring-[#363473] focus:bg-white transition-all" /></div>
                    <div><label className="text-xs font-medium text-[#1B1D3A]">Message</label><textarea value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} placeholder="How can we help?" rows={3} className="mt-1 w-full rounded-lg border border-[#ECEDF3] bg-[#F9FAFB] px-3 py-2 text-sm placeholder:text-[#A0A3BD] focus:outline-none focus:ring-2 focus:ring-[#363473] focus:bg-white resize-none transition-all" /></div>
                    <button type="button" onClick={() => { if (contactForm.name && contactForm.email && contactForm.message) setContactSent(true); }} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#363473] text-sm font-semibold text-white hover:bg-[#2D2B55] active:scale-[0.99] transition-all">Send Message <ArrowRight className="h-4 w-4" /></button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#0A0920]/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#363473] to-[#6366F1]"><GraduationCap className="h-3.5 w-3.5 text-white" /></div>
                <span className="text-xs font-bold text-white">ScholarBoard</span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed max-w-[200px]">Next-gen institution management for modern educators.</p>
              <div className="space-y-1">
                <p className="text-[10px] text-white/30 flex items-center gap-1.5"><Mail className="h-3 w-3" /> support@scholarboard.in</p>
                <p className="text-[10px] text-white/30 flex items-center gap-1.5"><Phone className="h-3 w-3" /> (+91) 80 2345 6789</p>
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-2.5">Platform</h4>
              <ul className="space-y-1.5">
                {['ScholarBoard', 'Fee Collections', 'Admissions', 'Library', 'HR & Payroll', 'Timetable'].map((p) => <li key={p} className="text-[11px] text-white/35 hover:text-white/70 cursor-pointer transition-colors">{p}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-2.5">Connect</h4>
              <ul className="space-y-1.5">
                {['WhatsApp', 'SMS Gateway', 'Payment Gateway', 'Documentation', 'API Reference'].map((i) => <li key={i} className="text-[11px] text-white/35 hover:text-white/70 cursor-pointer transition-colors">{i}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-2.5">Company</h4>
              <ul className="space-y-1.5">
                {['About', 'Careers', 'Blog', 'Partners', 'Contact'].map((c) => <li key={c} className="text-[11px] text-white/35 hover:text-white/70 cursor-pointer transition-colors">{c}</li>)}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-7xl px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[10px] text-white/25">© 2026 ScholarBoard Technologies. All rights reserved.</p>
            <div className="flex items-center gap-4 text-[10px] text-white/25">
              <span className="hover:text-white/50 cursor-pointer">Privacy</span>
              <span className="hover:text-white/50 cursor-pointer">Terms</span>
              <span className="hover:text-white/50 cursor-pointer">Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
