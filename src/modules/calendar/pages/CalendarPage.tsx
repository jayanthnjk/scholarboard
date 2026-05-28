/**
 * Calendar Page - Advanced academic calendar with Month, Week, and Day views,
 * event management modal, and upcoming events sidebar.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewMode = 'month' | 'week' | 'day';
type EventCategory = 'academic' | 'holiday' | 'exam' | 'fee' | 'sports';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  category: EventCategory;
  description: string;
}

interface NewEventForm {
  title: string;
  date: string;
  time: string;
  category: EventCategory;
  description: string;
  applicableClass: string;
  academicYear: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<
  EventCategory,
  { pill: string; border: string; label: string; block: string }
> = {
  academic: {
    pill: 'bg-[#363473]/10 text-[#363473]',
    border: 'border-l-[#363473]',
    block: 'bg-[#363473]/10 border-l-[#363473] text-[#363473]',
    label: 'Academic',
  },
  holiday: {
    pill: 'bg-emerald-50 text-emerald-700',
    border: 'border-l-emerald-500',
    block: 'bg-emerald-50 border-l-emerald-500 text-emerald-700',
    label: 'Holiday',
  },
  exam: {
    pill: 'bg-red-50 text-red-700',
    border: 'border-l-red-500',
    block: 'bg-red-50 border-l-red-500 text-red-700',
    label: 'Exam',
  },
  fee: {
    pill: 'bg-amber-50 text-amber-700',
    border: 'border-l-amber-500',
    block: 'bg-amber-50 border-l-amber-500 text-amber-700',
    label: 'Fee Deadline',
  },
  sports: {
    pill: 'bg-purple-50 text-purple-700',
    border: 'border-l-purple-500',
    block: 'bg-purple-50 border-l-purple-500 text-purple-700',
    label: 'Sports',
  },
};

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HOUR_START = 6;
const HOUR_END = 21; // 9 PM

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Term 2 Orientation', date: '2024-03-01', time: '09:00', category: 'academic', description: 'Welcome session for all students starting Term 2.' },
  { id: '2', title: 'Faculty Meeting', date: '2024-03-04', time: '10:00', category: 'academic', description: 'Monthly faculty coordination meeting.' },
  { id: '3', title: 'Math Unit Test', date: '2024-03-06', time: '08:30', category: 'exam', description: 'Unit test covering algebra and geometry.' },
  { id: '4', title: 'Science Lab Practical', date: '2024-03-08', time: '11:00', category: 'exam', description: 'Physics practical examination.' },
  { id: '5', title: 'Fee Payment Deadline', date: '2024-03-10', time: '17:00', category: 'fee', description: 'Last date for Term 2 fee submission.' },
  { id: '6', title: 'Inter-House Basketball', date: '2024-03-11', time: '14:00', category: 'sports', description: 'Semi-final matches for inter-house basketball.' },
  { id: '7', title: 'Career Counselling Day', date: '2024-03-13', time: '09:30', category: 'academic', description: 'Career guidance sessions for senior students.' },
  { id: '8', title: 'English Literature Exam', date: '2024-03-14', time: '08:00', category: 'exam', description: 'Mid-term examination for English Literature.' },
  { id: '9', title: 'Annual Sports Day', date: '2024-03-16', time: '07:30', category: 'sports', description: 'Annual athletic meet and prize distribution.' },
  { id: '10', title: 'Science Exhibition', date: '2024-03-18', time: '10:00', category: 'academic', description: 'Student project showcase and judging.' },
  { id: '11', title: 'Parent-Teacher Meeting', date: '2024-03-20', time: '09:00', category: 'academic', description: 'Mid-term progress discussion with parents.' },
  { id: '12', title: 'Swimming Championship', date: '2024-03-21', time: '06:30', category: 'sports', description: 'Inter-school swimming competition.' },
  { id: '13', title: 'Late Fee Surcharge', date: '2024-03-22', time: '17:00', category: 'fee', description: 'Surcharge applies after this date.' },
  { id: '14', title: 'Holi Holiday', date: '2024-03-25', time: '00:00', category: 'holiday', description: 'School closed for Holi celebrations.' },
  { id: '15', title: 'Good Friday', date: '2024-03-29', time: '00:00', category: 'holiday', description: 'School closed for Good Friday.' },
  { id: '16', title: 'History Quiz Competition', date: '2024-03-27', time: '11:00', category: 'academic', description: 'Inter-class history quiz finals.' },
  { id: '17', title: 'Cricket Tournament Final', date: '2024-03-30', time: '09:00', category: 'sports', description: 'Final match of the annual cricket tournament.' },
  { id: '18', title: 'Art Workshop', date: '2024-03-05', time: '13:00', category: 'academic', description: 'Creative arts workshop for middle school.' },
  { id: '19', title: 'Library Week Begins', date: '2024-03-12', time: '08:00', category: 'academic', description: 'Week-long reading and literature activities.' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(time: string): string {
  if (!time || time === '00:00') return 'All day';
  const parts = time.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

function formatHourLabel(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h} ${ampm}`;
}

function getWeekDays(referenceDate: Date): Date[] {
  const d = new Date(referenceDate);
  const dayOfWeek = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push(day);
  }
  return days;
}

function getTimeTopOffset(time: string, rowHeight: number): number {
  if (!time || time === '00:00') return 0;
  const parts = time.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const totalMinutes = (hours - HOUR_START) * 60 + minutes;
  return (totalMinutes / 60) * rowHeight;
}

function formatFullDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CalendarPage(): React.JSX.Element {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 14)); // March 14, 2024
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [selectedDay, setSelectedDay] = useState<number | null>(14);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<NewEventForm>({
    title: '',
    date: '',
    time: '',
    category: 'academic',
    description: '',
    applicableClass: 'all',
    academicYear: '2024-2025',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  const monthName = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  // The active day used for week/day views
  const activeDay = useMemo(() => {
    const day = selectedDay ?? (isCurrentMonth ? today.getDate() : 1);
    return new Date(year, month, day);
  }, [selectedDay, year, month, isCurrentMonth, today]);

  const getEventsForDate = useCallback(
    (dateStr: string): CalendarEvent[] => {
      return events.filter((e) => e.date === dateStr);
    },
    [events]
  );

  const getEventsForDay = useCallback(
    (day: number): CalendarEvent[] => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return events.filter((e) => e.date === dateStr);
    },
    [events, year, month]
  );

  // Week days for the week view
  const weekDays = useMemo(() => getWeekDays(activeDay), [activeDay]);

  const upcomingEvents = useMemo(() => {
    const refDay = selectedDay ?? (isCurrentMonth ? today.getDate() : 1);
    const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(refDay).padStart(2, '0')}`;
    return [...events]
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 5);
  }, [events, year, month, selectedDay, isCurrentMonth, today]);

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
    setSelectedDay(null);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const openModal = () => {
    setFormData({
      title: '',
      date: selectedDay
        ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
        : '',
      time: '',
      category: 'academic',
      description: '',
      applicableClass: 'all',
      academicYear: '2024-2025',
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.date) return;
    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: formData.title.trim(),
      date: formData.date,
      time: formData.time || '00:00',
      category: formData.category,
      description: formData.description.trim(),
    };
    setEvents((prev) => [...prev, newEvent]);
    setIsModalOpen(false);
  };

  // ─── Month View ──────────────────────────────────────────────────────────

  const renderMonthView = () => (
    <div className="overflow-hidden rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-[#ECEDF3] bg-[#F9FAFB]">
        {WEEKDAYS_SHORT.map((day) => (
          <div
            key={day}
            className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#A0A3BD]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="min-h-[90px] border-b border-r border-[#ECEDF3] bg-[#FAFBFC] p-2"
          />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayEvents = getEventsForDay(day);
          const isToday = day === todayDate;
          const isSelected = day === selectedDay;

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleDayClick(day);
              }}
              role="button"
              tabIndex={0}
              aria-label={`${day} ${monthName}`}
              className={`min-h-[90px] cursor-pointer border-b border-r border-[#ECEDF3] p-2 transition-colors hover:bg-[#F5F6FA] ${
                isSelected ? 'ring-2 ring-inset ring-[#363473]/30 bg-[#363473]/[0.03]' : ''
              }`}
            >
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                  isToday
                    ? 'bg-[#363473] text-white font-bold'
                    : 'text-[#1B1D3A]'
                }`}
              >
                {day}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={`truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-tight ${CATEGORY_STYLES[event.category].pill}`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[11px] font-medium text-[#6E7191]">
                    +{dayEvents.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── Week View ───────────────────────────────────────────────────────────

  const renderWeekView = () => {
    const ROW_HEIGHT = 40;
    const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

    return (
      <div className="overflow-hidden rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
        {/* Column headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#ECEDF3] bg-[#F9FAFB]">
          <div className="px-2 py-3" />
          {weekDays.map((d) => {
            const dayNum = d.getDate();
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const isToday = formatDateStr(d) === formatDateStr(today);
            return (
              <div
                key={formatDateStr(d)}
                className="px-2 py-3 text-center"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A0A3BD]">
                  {dayName}
                </span>
                <span
                  className={`ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isToday ? 'bg-[#363473] text-white' : 'text-[#1B1D3A]'
                  }`}
                >
                  {dayNum}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="relative grid grid-cols-[60px_repeat(7,1fr)] overflow-y-auto max-h-[640px]">
          {/* Hour labels + grid lines */}
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex items-start justify-end pr-2 text-[11px] text-[#A0A3BD] font-medium"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                {formatHourLabel(hour)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((d) => {
            const dateStr = formatDateStr(d);
            const dayEvents = getEventsForDate(dateStr);

            return (
              <div key={dateStr} className="relative border-l border-[#ECEDF3]">
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-[#ECEDF3]"
                    style={{ height: `${ROW_HEIGHT}px` }}
                  />
                ))}

                {/* Events */}
                {dayEvents
                  .filter((e) => e.time !== '00:00')
                  .map((event) => {
                    const top = getTimeTopOffset(event.time, ROW_HEIGHT);
                    return (
                      <div
                        key={event.id}
                        className={`absolute left-1 right-1 rounded-md border-l-3 px-1.5 py-1 text-[11px] font-medium leading-tight shadow-sm ${CATEGORY_STYLES[event.category].block}`}
                        style={{ top: `${top}px`, minHeight: `${ROW_HEIGHT - 4}px` }}
                        title={`${event.title} - ${formatTime(event.time)}`}
                      >
                        <div className="truncate font-semibold">{event.title}</div>
                        <div className="truncate opacity-75">{formatTime(event.time)}</div>
                      </div>
                    );
                  })}

                {/* All-day events at top */}
                {dayEvents
                  .filter((e) => e.time === '00:00')
                  .map((event) => (
                    <div
                      key={event.id}
                      className={`absolute left-1 right-1 top-0 rounded-md border-l-3 px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_STYLES[event.category].block}`}
                      title={event.title}
                    >
                      <div className="truncate">{event.title}</div>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Day View ────────────────────────────────────────────────────────────

  const renderDayView = () => {
    const ROW_HEIGHT = 60;
    const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
    const dateStr = formatDateStr(activeDay);
    const dayEvents = getEventsForDate(dateStr);

    return (
      <div className="overflow-hidden rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
        {/* Day Header */}
        <div className="border-b border-[#ECEDF3] bg-[#F9FAFB] px-4 py-3">
          <h3 className="text-base font-semibold text-[#1B1D3A]">
            {formatFullDate(activeDay)}
          </h3>
          <p className="mt-0.5 text-xs text-[#6E7191]">
            {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>

        {/* Time grid */}
        <div className="relative grid grid-cols-[70px_1fr] overflow-y-auto max-h-[640px]">
          {/* Hour labels */}
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex items-start justify-end pr-3 pt-0.5 text-xs text-[#A0A3BD] font-medium"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                {formatHourLabel(hour)}
              </div>
            ))}
          </div>

          {/* Event column */}
          <div className="relative border-l border-[#ECEDF3]">
            {/* Hour grid lines */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-[#ECEDF3]"
                style={{ height: `${ROW_HEIGHT}px` }}
              />
            ))}

            {/* Events positioned at their time */}
            {dayEvents
              .filter((e) => e.time !== '00:00')
              .map((event) => {
                const top = getTimeTopOffset(event.time, ROW_HEIGHT);
                return (
                  <div
                    key={event.id}
                    className={`absolute left-2 right-2 rounded-lg border-l-4 px-3 py-2 shadow-sm ${CATEGORY_STYLES[event.category].block}`}
                    style={{ top: `${top}px`, minHeight: `${ROW_HEIGHT - 8}px` }}
                  >
                    <div className="text-sm font-semibold">{event.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs opacity-75">
                      <Clock className="h-3 w-3" />
                      {formatTime(event.time)}
                    </div>
                    {event.description && (
                      <p className="mt-1 text-xs opacity-60 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                );
              })}

            {/* All-day events */}
            {dayEvents
              .filter((e) => e.time === '00:00')
              .map((event, idx) => (
                <div
                  key={event.id}
                  className={`absolute left-2 right-2 rounded-lg border-l-4 px-3 py-2 shadow-sm ${CATEGORY_STYLES[event.category].block}`}
                  style={{ top: `${idx * 4}px` }}
                >
                  <div className="text-sm font-semibold">{event.title}</div>
                  <div className="mt-0.5 text-xs opacity-75">All day</div>
                  {event.description && (
                    <p className="mt-1 text-xs opacity-60 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F5F6FA] p-4 md:p-6 lg:p-8">
      {/* Header Row: Title + Add Event */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#1B1D3A]">Academic Calendar</h1>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#2a2860] hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </button>
      </div>

      {/* Controls Row: View Toggle (left) + Month Nav (right) */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm w-fit border border-[#ECEDF3]">
          {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition-all ${
                viewMode === mode
                  ? 'bg-[#363473] text-white shadow-sm'
                  : 'text-[#6E7191] hover:text-[#1B1D3A]'
              }`}
              aria-pressed={viewMode === mode}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateMonth(-1)}
            className="rounded-lg border border-[#ECEDF3] bg-white p-2 shadow-sm transition-all hover:shadow-md"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-[#6E7191]" />
          </button>
          <h2 className="min-w-[160px] text-center text-lg font-semibold text-[#1B1D3A]">
            {monthName}
          </h2>
          <button
            type="button"
            onClick={() => navigateMonth(1)}
            className="rounded-lg border border-[#ECEDF3] bg-white p-2 shadow-sm transition-all hover:shadow-md"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-[#6E7191]" />
          </button>
        </div>
      </div>

      {/* Main Content: Calendar + Upcoming Events — same top alignment */}
      <div className="flex flex-col items-start gap-6 lg:flex-row">
        {/* Calendar View */}
        <div className="flex-1 min-w-0">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </div>

        {/* Upcoming Events Sidebar */}
        <aside className="w-full shrink-0 lg:w-[280px]">
          <div className="rounded-xl border border-[#ECEDF3] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#363473]" />
              <h3 className="text-base font-semibold text-[#1B1D3A]">
                Upcoming Events
              </h3>
            </div>
            <div className="space-y-3">
              {upcomingEvents.length === 0 && (
                <p className="text-sm text-[#A0A3BD]">No upcoming events.</p>
              )}
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className={`rounded-lg border-l-4 ${CATEGORY_STYLES[event.category].border} bg-[#F9FAFB] p-3`}
                >
                  <p className="text-sm font-medium text-[#1B1D3A]">
                    {event.title}
                  </p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-xs text-[#6E7191]">
                      {formatDateDisplay(event.date)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#A0A3BD]">
                      <Clock className="h-3 w-3" />
                      {formatTime(event.time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
              aria-hidden="true"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1B1D3A]">
                  Add New Event
                </h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-[#A0A3BD] transition-colors hover:bg-[#F5F6FA] hover:text-[#6E7191]"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                className="space-y-4"
              >
                {/* Title */}
                <div>
                  <label
                    htmlFor="event-title"
                    className="mb-1 block text-sm font-medium text-[#1B1D3A]"
                  >
                    Title
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="Enter event title"
                    required
                    className="w-full rounded-lg border border-[#ECEDF3] bg-[#F9FAFB] px-3 py-2.5 text-sm text-[#1B1D3A] placeholder:text-[#A0A3BD] focus:border-[#363473] focus:outline-none focus:ring-2 focus:ring-[#363473]/20"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="event-date"
                      className="mb-1 block text-sm font-medium text-[#1B1D3A]"
                    >
                      Date
                    </label>
                    <input
                      id="event-date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, date: e.target.value }))
                      }
                      required
                      className="w-full rounded-lg border border-[#ECEDF3] bg-[#F9FAFB] px-3 py-2.5 text-sm text-[#1B1D3A] focus:border-[#363473] focus:outline-none focus:ring-2 focus:ring-[#363473]/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="event-time"
                      className="mb-1 block text-sm font-medium text-[#1B1D3A]"
                    >
                      Time
                    </label>
                    <input
                      id="event-time"
                      type="time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, time: e.target.value }))
                      }
                      className="w-full rounded-lg border border-[#ECEDF3] bg-[#F9FAFB] px-3 py-2.5 text-sm text-[#1B1D3A] focus:border-[#363473] focus:outline-none focus:ring-2 focus:ring-[#363473]/20"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="event-category"
                    className="mb-1 block text-sm font-medium text-[#1B1D3A]"
                  >
                    Category
                  </label>
                  <select
                    id="event-category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        category: e.target.value as EventCategory,
                      }))
                    }
                    className="w-full rounded-lg border border-[#ECEDF3] bg-[#F9FAFB] px-3 py-2.5 text-sm text-[#1B1D3A] focus:border-[#363473] focus:outline-none focus:ring-2 focus:ring-[#363473]/20"
                  >
                    {Object.entries(CATEGORY_STYLES).map(([key, style]) => (
                      <option key={key} value={key}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Applicable Class & Academic Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="event-class"
                      className="mb-1 block text-sm font-medium text-[#1B1D3A]"
                    >
                      Applicable Class
                    </label>
                    <select
                      id="event-class"
                      value={formData.applicableClass}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, applicableClass: e.target.value }))
                      }
                      className="w-full rounded-lg border border-[#ECEDF3] bg-[#F9FAFB] px-3 py-2.5 text-sm text-[#1B1D3A] focus:border-[#363473] focus:outline-none focus:ring-2 focus:ring-[#363473]/20"
                    >
                      <option value="all">All Classes</option>
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((c) => (
                        <option key={c} value={c}>Class {c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="event-academic-year"
                      className="mb-1 block text-sm font-medium text-[#1B1D3A]"
                    >
                      Academic Year
                    </label>
                    <select
                      id="event-academic-year"
                      value={formData.academicYear}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, academicYear: e.target.value }))
                      }
                      className="w-full rounded-lg border border-[#ECEDF3] bg-[#F9FAFB] px-3 py-2.5 text-sm text-[#1B1D3A] focus:border-[#363473] focus:outline-none focus:ring-2 focus:ring-[#363473]/20"
                    >
                      <option value="2024-2025">2024-2025</option>
                      <option value="2023-2024">2023-2024</option>
                      <option value="2025-2026">2025-2026</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="event-description"
                    className="mb-1 block text-sm font-medium text-[#1B1D3A]"
                  >
                    Description
                  </label>
                  <textarea
                    id="event-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Optional event description"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-[#ECEDF3] bg-[#F9FAFB] px-3 py-2.5 text-sm text-[#1B1D3A] placeholder:text-[#A0A3BD] focus:border-[#363473] focus:outline-none focus:ring-2 focus:ring-[#363473]/20"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-[#ECEDF3] px-4 py-2.5 text-sm font-medium text-[#6E7191] transition-colors hover:bg-[#F5F6FA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#363473] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#2a2860] hover:shadow-md"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
