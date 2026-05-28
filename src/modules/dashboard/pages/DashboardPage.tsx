/**
 * Dashboard Page - ScholarBoard redesign with performance cards, charts, and agenda.
 */

import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  IndianRupee,
  Clock,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

// ---------- Types ----------

interface StatCardData {
  readonly title: string;
  readonly value: string;
  readonly change: string;
  readonly changeType: 'up' | 'down';
  readonly changePercent: string;
  readonly icon: React.ReactNode;
  readonly sparklineData: number[];
  readonly color: string;
}

interface AgendaEvent {
  readonly id: string;
  readonly title: string;
  readonly time: string;
  readonly duration: string;
  readonly color: string;
  readonly bgColor: string;
}

// ---------- Stat Card ----------

function StatCard({ card }: { card: StatCardData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="stat-card flex flex-col rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#6E7191]">{card.title}</p>
          <p className="text-lg font-bold text-[#1B1D3A]">{card.value}</p>
        </div>
        <div className={cn('rounded-md p-1.5', card.color)}>
          {card.icon}
        </div>
      </div>
      <div className="mt-1 flex items-center">
        <div className="flex items-center gap-1">
          {card.changeType === 'up' ? (
            <TrendingUp className="h-3.5 w-3.5 text-[#10B981]" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-[#EF4444]" />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              card.changeType === 'up' ? 'text-[#10B981]' : 'text-[#EF4444]'
            )}
          >
            {card.changePercent}
          </span>
          <span className="text-xs text-[#A0A3BD]">{card.change}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Performance Card ----------

function PerformanceCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2D2B55] via-[#363473] to-[#4A48A0] p-5 text-white shadow-lg"
    >
      {/* Decorative circles */}
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />

      <div className="relative z-10">
        <p className="text-xs font-medium text-[#C4C4E4]">Course Completion</p>
        <p className="mt-1 text-3xl font-bold">91.2%</p>
        <p className="mt-1 text-xs text-[#9694D8]">Overall completion rate this semester</p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] text-[#9694D8]">Active Courses</p>
            <p className="text-base font-semibold">12</p>
          </div>
          <div>
            <p className="text-[10px] text-[#9694D8]">Avg. Grade</p>
            <p className="text-base font-semibold">A-</p>
          </div>
          <div>
            <p className="text-[10px] text-[#9694D8]">Pass Rate</p>
            <p className="text-base font-semibold">94%</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Course-wise Data ----------

interface CourseData {
  readonly course: string;
  readonly students: number;
  readonly faculty: number;
}

const COURSE_DATA: CourseData[] = [
  { course: 'Computer Science', students: 2450, faculty: 32 },
  { course: 'Mechanical Engineering', students: 1820, faculty: 28 },
  { course: 'Electrical Engineering', students: 1560, faculty: 24 },
  { course: 'Civil Engineering', students: 1340, faculty: 22 },
  { course: 'Business Administration', students: 1980, faculty: 26 },
  { course: 'Mathematics', students: 890, faculty: 18 },
  { course: 'Physics', students: 760, faculty: 14 },
  { course: 'Chemistry', students: 680, faculty: 12 },
  { course: 'Biology', students: 540, faculty: 10 },
];

function CourseWiseTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-xl border border-[#ECEDF3] bg-white p-5 shadow-card"
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#1B1D3A]">Course-wise Overview</h3>
        <p className="text-xs text-[#6E7191]">Students and faculty count per course</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#ECEDF3]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F5F6FA]">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6E7191] uppercase tracking-wider">Course</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-[#6E7191] uppercase tracking-wider">Students</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-[#6E7191] uppercase tracking-wider">Faculty</th>
            </tr>
          </thead>
          <tbody>
            {COURSE_DATA.map((row) => (
              <tr key={row.course} className="border-t border-[#ECEDF3] hover:bg-[#F5F6FA]/50 transition-colors">
                <td className="px-4 py-2.5 text-[#1B1D3A] font-medium">{row.course}</td>
                <td className="px-4 py-2.5 text-right text-[#6E7191]">{row.students.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right text-[#6E7191]">{row.faculty}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#ECEDF3] bg-[#F5F6FA]">
              <td className="px-4 py-2.5 font-semibold text-[#1B1D3A]">Total</td>
              <td className="px-4 py-2.5 text-right font-semibold text-[#1B1D3A]">{COURSE_DATA.reduce((s, r) => s + r.students, 0).toLocaleString()}</td>
              <td className="px-4 py-2.5 text-right font-semibold text-[#1B1D3A]">{COURSE_DATA.reduce((s, r) => s + r.faculty, 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </motion.div>
  );
}

// ---------- My Agenda ----------

const AGENDA_EVENTS: AgendaEvent[] = [
  {
    id: '1',
    title: 'Faculty Meeting',
    time: '09:00 AM',
    duration: '1h',
    color: 'text-[#363473]',
    bgColor: 'bg-[#F0F0F8] border-l-[#363473]',
  },
  {
    id: '2',
    title: 'Parent-Teacher Conference',
    time: '11:00 AM',
    duration: '2h',
    color: 'text-[#F59E0B]',
    bgColor: 'bg-orange-50 border-l-[#F59E0B]',
  },
  {
    id: '3',
    title: 'Curriculum Review',
    time: '02:00 PM',
    duration: '1.5h',
    color: 'text-[#10B981]',
    bgColor: 'bg-emerald-50 border-l-[#10B981]',
  },
  {
    id: '4',
    title: 'Staff Training Session',
    time: '04:00 PM',
    duration: '1h',
    color: 'text-[#363473]',
    bgColor: 'bg-[#F0F0F8] border-l-[#363473]',
  },
];

function MyAgenda() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-xl border border-[#ECEDF3] bg-white p-6 shadow-card"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#1B1D3A]">My Agenda</h3>
          <p className="text-xs text-[#6E7191]">{dateStr}</p>
        </div>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#363473] hover:bg-[#F0F0F8]"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {AGENDA_EVENTS.map((event) => (
          <div
            key={event.id}
            className={cn(
              'rounded-lg border-l-[3px] p-3 transition-all hover:shadow-sm',
              event.bgColor
            )}
          >
            <div className="flex items-center justify-between">
              <p className={cn('text-sm font-medium', event.color)}>{event.title}</p>
              <span className="text-[10px] font-medium text-[#A0A3BD]">{event.duration}</span>
            </div>
            <p className="mt-0.5 text-xs text-[#6E7191]">{event.time}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ---------- Utility ----------

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// ---------- Stats Data ----------

const STAT_CARDS: StatCardData[] = [
  {
    title: 'Total Students',
    value: '12,543',
    change: 'vs last month',
    changeType: 'up',
    changePercent: '+8.2%',
    icon: <Users className="h-4 w-4 text-[#363473]" />,
    sparklineData: [],
    color: 'bg-[#F0F0F8]',
  },
  {
    title: 'Total Faculty',
    value: '186',
    change: 'vs last month',
    changeType: 'up',
    changePercent: '+3.1%',
    icon: <UserPlus className="h-4 w-4 text-[#10B981]" />,
    sparklineData: [],
    color: 'bg-emerald-50',
  },
  {
    title: 'Total Income',
    value: '₹10,12,300',
    change: 'vs last month',
    changeType: 'up',
    changePercent: '+15.3%',
    icon: <IndianRupee className="h-4 w-4 text-[#F59E0B]" />,
    sparklineData: [],
    color: 'bg-amber-50',
  },
  {
    title: 'New Admissions',
    value: '2,543',
    change: 'vs last month',
    changeType: 'up',
    changePercent: '+12.5%',
    icon: <Clock className="h-4 w-4 text-[#EF4444]" />,
    sparklineData: [],
    color: 'bg-rose-50',
  },
];

// ---------- Main Dashboard Page ----------

export function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  const userName = user?.name ?? 'Admin';

  return (
    <div className="min-h-screen bg-[#F5F6FA] p-6 lg:p-8">
      {/* Top Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1D3A]">
            Welcome Back, {userName} 👋
          </h1>
          <p className="mt-1 text-sm text-[#6E7191]">
            Here&apos;s what&apos;s happening with your institution today.
          </p>
        </div>
        <div className="flex items-center gap-3">
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Performance Card */}
        <div className="lg:col-span-1">
          <PerformanceCard />
        </div>

        {/* Right Columns - Stat Cards 2x2 */}
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
          {STAT_CARDS.map((card) => (
            <StatCard key={card.title} card={card} />
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Course-wise Table */}
        <div className="lg:col-span-2">
          <CourseWiseTable />
        </div>

        {/* My Agenda */}
        <div className="lg:col-span-1">
          <MyAgenda />
        </div>
      </div>
    </div>
  );
}
