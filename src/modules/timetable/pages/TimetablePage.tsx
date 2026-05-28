/**
 * Timetable Module - Weekly schedule grid with add/edit/delete periods,
 * course filter, and time slot management.
 */

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, Edit2, Trash2, Clock } from 'lucide-react';

interface Period {
  id: string; day: string; timeSlot: string; subject: string; faculty: string; room: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = ['8:30-9:20', '9:20-10:10', '10:10-10:30', '10:30-11:20', '11:20-12:10', '12:10-1:00', '1:00-1:40', '1:40-2:30', '2:30-3:20', '3:20-4:00'];
const COURSES = ['MPC', 'BiPC', 'CEC', 'MEC', 'HEC'];
const SUBJECTS: Record<string, string[]> = {
  MPC: ['Maths IA', 'Maths IB', 'Physics', 'Chemistry', 'English', 'Telugu'],
  BiPC: ['Botany', 'Zoology', 'Physics', 'Chemistry', 'English', 'Telugu'],
  CEC: ['Civics', 'Economics', 'Commerce', 'English', 'Telugu'],
  MEC: ['Maths IA', 'Economics', 'Commerce', 'English', 'Telugu'],
  HEC: ['History', 'Economics', 'Commerce', 'English', 'Telugu'],
};
const FACULTY = ['Sri Venkat Rao', 'Smt. Lakshmi Devi', 'Sri Ramana Murthy', 'Smt. Padmavathi', 'Sri Krishna Rao', 'Smt. Saraswathi', 'Sri Narasimha', 'Sri Subramaniam'];
const ROOMS = ['Room 101', 'Room 102', 'Room 201', 'Room 202', 'Lab 1', 'Lab 2', 'Hall A'];

const INITIAL_PERIODS: Period[] = [
  { id: 'p1', day: 'Monday', timeSlot: '8:30-9:20', subject: 'Maths IA', faculty: 'Smt. Lakshmi Devi', room: 'Room 101' },
  { id: 'p2', day: 'Monday', timeSlot: '9:20-10:10', subject: 'Physics', faculty: 'Sri Venkat Rao', room: 'Room 101' },
  { id: 'p3', day: 'Monday', timeSlot: '10:30-11:20', subject: 'Chemistry', faculty: 'Sri Ramana Murthy', room: 'Lab 1' },
  { id: 'p4', day: 'Monday', timeSlot: '11:20-12:10', subject: 'English', faculty: 'Sri Krishna Rao', room: 'Room 101' },
  { id: 'p5', day: 'Monday', timeSlot: '1:40-2:30', subject: 'Telugu', faculty: 'Smt. Padmavathi', room: 'Room 101' },
  { id: 'p6', day: 'Monday', timeSlot: '2:30-3:20', subject: 'Maths IB', faculty: 'Smt. Lakshmi Devi', room: 'Room 101' },
  { id: 'p7', day: 'Tuesday', timeSlot: '8:30-9:20', subject: 'Physics', faculty: 'Sri Venkat Rao', room: 'Lab 1' },
  { id: 'p8', day: 'Tuesday', timeSlot: '9:20-10:10', subject: 'Maths IA', faculty: 'Smt. Lakshmi Devi', room: 'Room 101' },
  { id: 'p9', day: 'Tuesday', timeSlot: '10:30-11:20', subject: 'English', faculty: 'Sri Krishna Rao', room: 'Room 101' },
  { id: 'p10', day: 'Tuesday', timeSlot: '11:20-12:10', subject: 'Chemistry', faculty: 'Sri Ramana Murthy', room: 'Lab 1' },
  { id: 'p11', day: 'Tuesday', timeSlot: '1:40-2:30', subject: 'Maths IB', faculty: 'Smt. Lakshmi Devi', room: 'Room 101' },
  { id: 'p12', day: 'Wednesday', timeSlot: '8:30-9:20', subject: 'Chemistry', faculty: 'Sri Ramana Murthy', room: 'Lab 2' },
  { id: 'p13', day: 'Wednesday', timeSlot: '9:20-10:10', subject: 'Physics', faculty: 'Sri Venkat Rao', room: 'Room 101' },
  { id: 'p14', day: 'Wednesday', timeSlot: '10:30-11:20', subject: 'Maths IA', faculty: 'Smt. Lakshmi Devi', room: 'Room 101' },
  { id: 'p15', day: 'Thursday', timeSlot: '8:30-9:20', subject: 'English', faculty: 'Sri Krishna Rao', room: 'Room 102' },
  { id: 'p16', day: 'Thursday', timeSlot: '9:20-10:10', subject: 'Telugu', faculty: 'Smt. Padmavathi', room: 'Room 102' },
  { id: 'p17', day: 'Thursday', timeSlot: '10:30-11:20', subject: 'Physics', faculty: 'Sri Venkat Rao', room: 'Lab 1' },
  { id: 'p18', day: 'Friday', timeSlot: '8:30-9:20', subject: 'Maths IB', faculty: 'Smt. Lakshmi Devi', room: 'Room 101' },
  { id: 'p19', day: 'Friday', timeSlot: '9:20-10:10', subject: 'Chemistry', faculty: 'Sri Ramana Murthy', room: 'Room 101' },
  { id: 'p20', day: 'Saturday', timeSlot: '8:30-9:20', subject: 'Physics', faculty: 'Sri Venkat Rao', room: 'Lab 1' },
  { id: 'p21', day: 'Saturday', timeSlot: '9:20-10:10', subject: 'Maths IA', faculty: 'Smt. Lakshmi Devi', room: 'Room 101' },
];

export function TimetablePage(): React.JSX.Element {
  const [periods, setPeriods] = useState<Period[]>(INITIAL_PERIODS);
  const [selectedCourse, setSelectedCourse] = useState('MPC');
  const [showModal, setShowModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [form, setForm] = useState({ day: 'Monday', timeSlot: '8:30-9:20', subject: '', faculty: '', room: '' });

  const subjects = SUBJECTS[selectedCourse] ?? [];

  function handleSave(): void {
    if (!form.subject || !form.faculty || !form.room) return;
    if (editingPeriod) {
      setPeriods((prev) => prev.map((p) => p.id === editingPeriod.id ? { ...p, ...form } : p));
    } else {
      setPeriods((prev) => [...prev, { id: `p${Date.now()}`, ...form }]);
    }
    setShowModal(false); setEditingPeriod(null); setForm({ day: 'Monday', timeSlot: '8:30-9:20', subject: '', faculty: '', room: '' });
  }

  function handleEdit(period: Period): void {
    setEditingPeriod(period); setForm({ day: period.day, timeSlot: period.timeSlot, subject: period.subject, faculty: period.faculty, room: period.room }); setShowModal(true);
  }

  function handleDelete(id: string): void { setPeriods((prev) => prev.filter((p) => p.id !== id)); }

  function getPeriod(day: string, slot: string): Period | undefined { return periods.find((p) => p.day === day && p.timeSlot === slot); }
  const isBreak = (slot: string) => slot === '10:10-10:30' || slot === '1:00-1:40';

  return (
    <PageContent>
      <PageHeader title="Timetable" subtitle="Weekly class schedule management." breadcrumbs={[{ label: 'Home' }, { label: 'Timetable' }]} />

      {/* Toolbar */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="rounded-lg border border-[#ECEDF3] bg-white px-3 py-2 text-sm font-medium text-[#1B1D3A] focus:outline-none focus:ring-2 focus:ring-[#363473]">
            {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-xs text-[#6E7191]">{periods.length} periods scheduled</span>
        </div>
        <button type="button" onClick={() => { setEditingPeriod(null); setForm({ day: 'Monday', timeSlot: '8:30-9:20', subject: '', faculty: '', room: '' }); setShowModal(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#363473] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors"><Plus className="h-4 w-4" /> Add Period</button>
      </div>

      {/* Timetable Grid */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-[#ECEDF3] bg-white shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#ECEDF3] bg-[#F5F6FA]">
              <th className="px-3 py-2.5 text-left font-semibold text-[#1B1D3A] w-[100px]">Time</th>
              {DAYS.map((d) => <th key={d} className="px-2 py-2.5 text-center font-semibold text-[#1B1D3A] min-w-[120px]">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot} className={`border-b border-[#ECEDF3] last:border-b-0 ${isBreak(slot) ? 'bg-amber-50/50' : ''}`}>
                <td className="px-3 py-2 font-medium text-[#6E7191] whitespace-nowrap">
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{slot}</div>
                  {isBreak(slot) && <span className="text-[9px] text-amber-600 font-medium">BREAK</span>}
                </td>
                {DAYS.map((day) => {
                  if (isBreak(slot)) return <td key={day} className="px-2 py-2 text-center text-[9px] text-amber-600 font-medium">—</td>;
                  const period = getPeriod(day, slot);
                  return (
                    <td key={day} className="px-1.5 py-1.5">
                      {period ? (
                        <div className="group relative rounded-lg bg-[#363473]/5 border border-[#363473]/10 p-2 hover:bg-[#363473]/10 transition-colors">
                          <p className="font-semibold text-[#1B1D3A] text-[11px]">{period.subject}</p>
                          <p className="text-[9px] text-[#6E7191] mt-0.5">{period.faculty}</p>
                          <p className="text-[9px] text-[#A0A3BD]">{period.room}</p>
                          <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                            <button type="button" onClick={() => handleEdit(period)} className="rounded p-0.5 bg-white shadow text-[#363473] hover:bg-[#363473] hover:text-white"><Edit2 className="h-2.5 w-2.5" /></button>
                            <button type="button" onClick={() => handleDelete(period.id)} className="rounded p-0.5 bg-white shadow text-red-500 hover:bg-red-500 hover:text-white"><Trash2 className="h-2.5 w-2.5" /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-[50px] rounded-lg border border-dashed border-[#ECEDF3] flex items-center justify-center">
                          <button type="button" onClick={() => { setEditingPeriod(null); setForm({ day, timeSlot: slot, subject: '', faculty: '', room: '' }); setShowModal(true); }}
                            className="text-[#A0A3BD] hover:text-[#363473] transition-colors"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[#1B1D3A]">{editingPeriod ? 'Edit Period' : 'Add Period'}</h2>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-[#F5F6FA]"><X className="h-5 w-5 text-[#6E7191]" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-[#1B1D3A]">Day</label><select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="mt-1 w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">{DAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
                  <div><label className="text-xs font-medium text-[#1B1D3A]">Time Slot</label><select value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })} className="mt-1 w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]">{TIME_SLOTS.filter((s) => !isBreak(s)).map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                </div>
                <div><label className="text-xs font-medium text-[#1B1D3A]">Subject *</label><select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]"><option value="">Select Subject</option>{subjects.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="text-xs font-medium text-[#1B1D3A]">Faculty *</label><select value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} className="mt-1 w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]"><option value="">Select Faculty</option>{FACULTY.map((f) => <option key={f} value={f}>{f}</option>)}</select></div>
                <div><label className="text-xs font-medium text-[#1B1D3A]">Room *</label><select value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="mt-1 w-full rounded-lg border border-[#ECEDF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#363473]"><option value="">Select Room</option>{ROOMS.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-[#ECEDF3] px-4 py-2 text-sm font-medium text-[#6E7191] hover:bg-[#F5F6FA]">Cancel</button>
                <button type="button" onClick={handleSave} className="rounded-lg bg-[#363473] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B1D3A] transition-colors">{editingPeriod ? 'Update' : 'Add'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContent>
  );
}
